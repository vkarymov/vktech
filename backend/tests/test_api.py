import asyncio

from fastapi.testclient import TestClient
from sqlalchemy import text

import app.main as api


async def reset_database() -> None:
    async with api.engine.begin() as connection:
        await connection.execute(
            text(
                "TRUNCATE handoff_tokens, messages, conversations, leads, "
                "visitor_sessions RESTART IDENTITY CASCADE"
            )
        )


async def scalar(sql: str, **params):
    async with api.engine.connect() as connection:
        return await connection.scalar(text(sql), params)


async def execute(sql: str, **params) -> None:
    async with api.engine.begin() as connection:
        await connection.execute(text(sql), params)


def setup_function() -> None:
    api._limits.clear()
    api.app.dependency_overrides.clear()
    asyncio.run(reset_database())


def session(client: TestClient) -> str:
    response = client.post("/sessions")
    assert response.status_code == 200
    return response.json()["session_id"]


def conversation(client: TestClient, session_id: str, source: str = "landing") -> str:
    response = client.post(f"/sessions/{session_id}/conversations", json={"source": source})
    assert response.status_code == 200
    return response.json()["conversation_id"]


def lead(client: TestClient, session_id: str) -> str:
    response = client.put(
        f"/sessions/{session_id}/lead", json={"name": "Test", "contact": "test@example.com"}
    )
    assert response.status_code == 200
    return response.json()["lead_id"]


def test_health() -> None:
    with TestClient(api.app) as client:
        assert client.get("/health").json() == {"status": "ok"}


def test_session_create_retrieve_and_invalid_identifier() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        retrieved = client.get(f"/sessions/{session_id}")
        assert retrieved.status_code == 200
        assert retrieved.json()["session_id"] == session_id
        assert client.get("/sessions/not-a-real-session").status_code == 404
        assert client.post("/sessions/not-a-real-session/conversations", json={"source": "x"}).status_code == 404


def test_lead_create_update_and_session_uniqueness() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        first_id = lead(client, session_id)
        updated = client.put(
            f"/sessions/{session_id}/lead", json={"name": "Updated", "contact": "updated@example.com"}
        )
        assert updated.status_code == 200
        assert updated.json()["lead_id"] == first_id
        assert asyncio.run(scalar("SELECT count(*) FROM leads WHERE session_id = :session_id", session_id=session_id)) == 1
        assert client.put("/sessions/missing/lead", json={}).status_code == 404


def test_lead_database_unique_and_foreign_key_constraints() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        lead(client, session_id)
        try:
            asyncio.run(
                execute(
                    "INSERT INTO leads (id, session_id, status, created_at) VALUES ('duplicate', :session_id, 'open', now())",
                    session_id=session_id,
                )
            )
        except Exception as error:
            assert "unique" in str(error).lower()
        else:
            raise AssertionError("leads.session_id must remain unique")
        try:
            asyncio.run(
                execute(
                    "INSERT INTO leads (id, session_id, status, created_at) VALUES ('orphan', 'missing', 'open', now())"
                )
            )
        except Exception as error:
            assert "foreign key" in str(error).lower()
        else:
            raise AssertionError("leads.session_id must reference a visitor session")


def test_conversation_persists_source_and_rejects_invalid_access() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        conversation_id = conversation(client, session_id, "matrix-campaign")
        retrieved = client.get(f"/conversations/{conversation_id}")
        assert retrieved.status_code == 200
        assert retrieved.json()["source"] == "matrix-campaign"
        assert retrieved.json()["session_id"] == session_id
        assert client.get("/conversations/missing").status_code == 404
        assert client.get("/conversations/missing/messages").status_code == 404


def test_messages_validate_and_return_ordered_history() -> None:
    with TestClient(api.app) as client:
        conversation_id = conversation(client, session(client))
        first = client.post(f"/conversations/{conversation_id}/messages", json={"body": "first"})
        second = client.post(f"/conversations/{conversation_id}/messages", json={"body": "second"})
        assert first.status_code == second.status_code == 200
        history = client.get(f"/conversations/{conversation_id}/messages")
        assert [message["body"] for message in history.json()] == ["first", "second"]
        assert client.post(f"/conversations/{conversation_id}/messages", json={"body": "x" * 4001}).status_code == 422
        assert client.post(f"/conversations/{conversation_id}/messages", json={}).status_code == 422
        assert client.post("/conversations/missing/messages", json={"body": "x"}).status_code == 404


def test_reward_unlock_cannot_verify_or_apply_discount_from_client_payload() -> None:
    with TestClient(api.app) as client:
        conversation_id = conversation(client, session(client))
        before = client.get(f"/conversations/{conversation_id}").json()
        assert before["reward_unlocked"] is False
        unlocked = client.post(
            f"/conversations/{conversation_id}/reward/unlock",
            json={"reward_verified": True, "discount_applied": True},
        )
        assert unlocked.status_code == 200
        state = unlocked.json()
        assert state == {
            "reward_unlocked": True,
            "reward_verified": False,
            "discount_applied": False,
            "verification": "pending",
        }
        persisted = client.get(f"/conversations/{conversation_id}").json()
        assert persisted["reward_verified"] is False
        assert persisted["discount_applied"] is False
        assert client.post("/conversations/missing/reward/unlock").status_code == 404


def test_handoff_token_is_opaque_digest_backed_and_single_use() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        lead_id = lead(client, session_id)
        issued = client.post(f"/sessions/{session_id}/handoff")
        assert issued.status_code == 200
        raw_token = issued.json()["handoff_token"]
        assert len(raw_token) >= 40
        stored_digest = asyncio.run(scalar("SELECT digest FROM handoff_tokens WHERE lead_id = :lead_id", lead_id=lead_id))
        assert stored_digest != raw_token
        assert len(stored_digest) == 64
        consumed = client.post(f"/handoff/{raw_token}/consume")
        assert consumed.status_code == 200
        assert consumed.json() == {"lead_id": lead_id, "session_id": session_id}
        assert client.post(f"/handoff/{raw_token}/consume").status_code == 404
        assert client.post("/handoff/not-a-real-token/consume").status_code == 404


def test_handoff_requires_lead_and_rejects_expired_token() -> None:
    with TestClient(api.app) as client:
        session_id = session(client)
        assert client.post(f"/sessions/{session_id}/handoff").status_code == 404
        lead(client, session_id)
        raw_token = client.post(f"/sessions/{session_id}/handoff").json()["handoff_token"]
        asyncio.run(execute("UPDATE handoff_tokens SET expires_at = now() - interval '1 minute'"))
        assert client.post(f"/handoff/{raw_token}/consume").status_code == 404
