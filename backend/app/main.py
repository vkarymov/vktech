import hashlib, os, secrets, time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from threading import Lock
from fastapi import FastAPI, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import String, DateTime, Boolean, ForeignKey, Text, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.pool import NullPool

DATABASE_URL=os.environ['DATABASE_URL']
engine=create_async_engine(DATABASE_URL, pool_pre_ping=True, **({'poolclass':NullPool} if os.getenv('VKTECH_TESTING') else {}))
Session=async_sessionmaker(engine, expire_on_commit=False)
class Base(DeclarativeBase): pass
class VisitorSession(Base):
 __tablename__='visitor_sessions'; id:Mapped[str]=mapped_column(String(64),primary_key=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc))
class Conversation(Base):
 __tablename__='conversations'; id:Mapped[str]=mapped_column(String(64),primary_key=True); session_id:Mapped[str]=mapped_column(ForeignKey('visitor_sessions.id'),index=True); source:Mapped[str]=mapped_column(String(255)); reward_unlocked:Mapped[bool]=mapped_column(Boolean,default=False); reward_verified:Mapped[bool]=mapped_column(Boolean,default=False); discount_applied:Mapped[bool]=mapped_column(Boolean,default=False); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc))
class Lead(Base):
 __tablename__='leads'; id:Mapped[str]=mapped_column(String(64),primary_key=True); session_id:Mapped[str]=mapped_column(ForeignKey('visitor_sessions.id'),unique=True); contact:Mapped[str|None]=mapped_column(String(255)); name:Mapped[str|None]=mapped_column(String(120)); status:Mapped[str]=mapped_column(String(32),default='open'); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc))
class Message(Base):
 __tablename__='messages'; id:Mapped[str]=mapped_column(String(64),primary_key=True); conversation_id:Mapped[str]=mapped_column(ForeignKey('conversations.id'),index=True); body:Mapped[str]=mapped_column(Text); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc))
class HandoffToken(Base):
 __tablename__='handoff_tokens'; id:Mapped[str]=mapped_column(String(64),primary_key=True); lead_id:Mapped[str]=mapped_column(ForeignKey('leads.id')); digest:Mapped[str]=mapped_column(String(64),unique=True); expires_at:Mapped[datetime]=mapped_column(DateTime(timezone=True)); consumed_at:Mapped[datetime|None]=mapped_column(DateTime(timezone=True)); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda:datetime.now(timezone.utc))
app=FastAPI(title='VKTech API')
_limits=defaultdict(deque)
_limits_lock=Lock()

# This process-local limiter deliberately keys on the network peer address, not a
# browser-provided session/conversation id.  It is intended for this one API
# instance and should be replaced by a shared limiter before horizontal scaling.
def rate_limit(bucket:str, request:Request, limit:int, window:float=60) -> None:
 key=f'{bucket}:{request.client.host if request.client else "unknown"}'
 now=time.monotonic()
 with _limits_lock:
  q=_limits[key]
  while q and q[0] <= now-window: q.popleft()
  if len(q)>=limit:
   retry_after=max(1, int(window-(now-q[0]))+1)
   raise HTTPException(429,'rate limit exceeded',headers={'Retry-After':str(retry_after)})
  q.append(now)
async def db():
 async with Session() as s: yield s
def token(): return secrets.token_urlsafe(32)
class SourceIn(BaseModel): source:str=Field(min_length=1,max_length=255)
class MessageIn(BaseModel): body:str=Field(min_length=1,max_length=4000)
class LeadIn(BaseModel): name:str|None=Field(default=None,max_length=120); contact:str|None=Field(default=None,max_length=255)
@app.get('/health')
async def health(): return {'status':'ok'}
@app.post('/sessions')
async def create_session(request:Request,s:AsyncSession=Depends(db)):
 rate_limit('session',request,20)
 x=VisitorSession(id=token());s.add(x);await s.commit();return {'session_id':x.id}
@app.get('/sessions/{session_id}')
async def get_session(session_id:str,s:AsyncSession=Depends(db)):
 x=await s.get(VisitorSession,session_id)
 if not x: raise HTTPException(404,'session not found')
 return {'session_id':x.id,'created_at':x.created_at}
@app.post('/sessions/{session_id}/conversations')
async def conversation(session_id:str,p:SourceIn,s:AsyncSession=Depends(db)):
 if not await s.get(VisitorSession,session_id): raise HTTPException(404,'session not found')
 x=Conversation(id=token(),session_id=session_id,source=p.source);s.add(x);await s.commit();return {'conversation_id':x.id,'source':x.source}
@app.get('/conversations/{conversation_id}')
async def get_conversation(conversation_id:str,s:AsyncSession=Depends(db)):
 x=await s.get(Conversation,conversation_id)
 if not x: raise HTTPException(404,'conversation not found')
 return {'conversation_id':x.id,'session_id':x.session_id,'source':x.source,'reward_unlocked':x.reward_unlocked,'reward_verified':x.reward_verified,'discount_applied':x.discount_applied}
@app.put('/sessions/{session_id}/lead')
async def lead(session_id:str,p:LeadIn,s:AsyncSession=Depends(db)):
 if not await s.get(VisitorSession,session_id): raise HTTPException(404,'session not found')
 x=await s.scalar(select(Lead).where(Lead.session_id==session_id))
 if not x: x=Lead(id=token(),session_id=session_id,name=p.name,contact=p.contact);s.add(x)
 else: x.name=p.name or x.name;x.contact=p.contact or x.contact
 await s.commit();return {'lead_id':x.id,'status':x.status}
@app.post('/conversations/{conversation_id}/messages')
async def message(conversation_id:str,p:MessageIn,request:Request,s:AsyncSession=Depends(db)):
 rate_limit('message',request,30)
 if not await s.get(Conversation,conversation_id): raise HTTPException(404,'conversation not found')
 x=Message(id=token(),conversation_id=conversation_id,body=p.body);s.add(x);await s.commit();return {'id':x.id,'body':x.body,'created_at':x.created_at}
@app.get('/conversations/{conversation_id}/messages')
async def history(conversation_id:str,s:AsyncSession=Depends(db)):
 if not await s.get(Conversation,conversation_id): raise HTTPException(404,'conversation not found')
 q=await s.scalars(select(Message).where(Message.conversation_id==conversation_id).order_by(Message.created_at));return [{'id':x.id,'body':x.body,'created_at':x.created_at} for x in q]
@app.post('/conversations/{conversation_id}/reward/unlock')
async def unlock(conversation_id:str,s:AsyncSession=Depends(db)):
 x=await s.get(Conversation,conversation_id)
 if not x: raise HTTPException(404,'conversation not found')
 x.reward_unlocked=True
 await s.commit()
 return {'reward_unlocked':x.reward_unlocked,'reward_verified':x.reward_verified,'discount_applied':x.discount_applied,'verification':'pending'}
@app.post('/sessions/{session_id}/handoff')
async def create_handoff(session_id:str,s:AsyncSession=Depends(db)):
 if not await s.get(VisitorSession,session_id): raise HTTPException(404,'session not found')
 lead=await s.scalar(select(Lead).where(Lead.session_id==session_id))
 if not lead: raise HTTPException(404,'lead not found')
 raw_token=secrets.token_urlsafe(32)
 x=HandoffToken(id=token(),lead_id=lead.id,digest=hashlib.sha256(raw_token.encode()).hexdigest(),expires_at=datetime.now(timezone.utc)+timedelta(minutes=15))
 s.add(x);await s.commit()
 return {'handoff_token':raw_token,'expires_at':x.expires_at}
@app.post('/handoff/{handoff_token}/consume')
async def consume_handoff(handoff_token:str,s:AsyncSession=Depends(db)):
 digest=hashlib.sha256(handoff_token.encode()).hexdigest()
 x=await s.scalar(select(HandoffToken).where(HandoffToken.digest==digest))
 if not x or x.consumed_at or x.expires_at <= datetime.now(timezone.utc): raise HTTPException(404,'handoff token not available')
 x.consumed_at=datetime.now(timezone.utc)
 lead=await s.get(Lead,x.lead_id)
 await s.commit()
 return {'lead_id':lead.id,'session_id':lead.session_id}
