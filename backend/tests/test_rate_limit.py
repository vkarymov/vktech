from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request

import app.main as api
from app.main import _limits, rate_limit


def request_from(ip: str) -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "scheme": "http",
            "path": "/",
            "query_string": b"",
            "headers": [],
            "client": (ip, 12345),
            "server": ("testserver", 80),
        }
    )


def setup_function() -> None:
    _limits.clear()
    api.app.dependency_overrides.clear()


def test_session_creation_is_limited_by_network_peer() -> None:
    request = request_from("198.51.100.10")
    rate_limit("session", request, limit=2, window=60)
    rate_limit("session", request, limit=2, window=60)

    try:
        rate_limit("session", request, limit=2, window=60)
    except HTTPException as error:
        assert error.status_code == 429
        assert int(error.headers["Retry-After"]) >= 1
    else:
        raise AssertionError("expected rate limiter to reject the third request")


def test_message_spam_is_limited_independently_from_session_creation() -> None:
    request = request_from("198.51.100.11")
    rate_limit("session", request, limit=1, window=60)
    rate_limit("message", request, limit=2, window=60)
    rate_limit("message", request, limit=2, window=60)

    try:
        rate_limit("message", request, limit=2, window=60)
    except HTTPException as error:
        assert error.status_code == 429
    else:
        raise AssertionError("expected message limiter to reject spam")


def test_limits_are_not_shared_between_network_peers() -> None:
    rate_limit("message", request_from("198.51.100.12"), limit=1, window=60)
    rate_limit("message", request_from("198.51.100.13"), limit=1, window=60)


class StubSession:
    def add(self, value) -> None:
        pass

    async def commit(self) -> None:
        pass

    async def get(self, model, identifier):
        return object()


async def stub_db():
    yield StubSession()


def test_session_endpoint_returns_429_after_limit() -> None:
    api.app.dependency_overrides[api.db] = stub_db
    with TestClient(api.app) as client:
        for _ in range(20):
            assert client.post("/sessions").status_code == 200
        response = client.post("/sessions")

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) >= 1


def test_message_endpoint_returns_429_after_limit() -> None:
    api.app.dependency_overrides[api.db] = stub_db
    with TestClient(api.app) as client:
        for _ in range(30):
            assert client.post("/conversations/conversation/messages", json={"body": "test"}).status_code == 200
        response = client.post("/conversations/conversation/messages", json={"body": "test"})

    assert response.status_code == 429
