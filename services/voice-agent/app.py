import asyncio
import hmac
import logging
import os
from contextlib import asynccontextmanager
from uuid import UUID
from fastapi import FastAPI, Header, HTTPException, Depends
from loguru import logger
from contracts import VoiceSession
from readiness import voice_readiness
from worker import run_voice_session

# Do not emit SDK debug logs containing transcripts, model prompts or tokens.
logger.remove()
logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("guru.voice")
sessions: dict[str, asyncio.Task] = {}
lock = asyncio.Lock()


async def authorize(authorization: str | None = Header(default=None)):
    secret = os.environ.get("VOICE_AGENT_SECRET", "")
    if len(secret) < 32 or not authorization or not hmac.compare_digest(authorization, "Bearer " + secret):
        raise HTTPException(401, "Unauthorized")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    for task in sessions.values():
        task.cancel()
    await asyncio.gather(*sessions.values(), return_exceptions=True)


app = FastAPI(title="Guru voice service", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)


@app.get("/health", dependencies=[Depends(authorize)])
async def health():
    return {"status": "reachable", "active_sessions": len(sessions), **voice_readiness(os.environ)}


async def run(config: VoiceSession):
    key = str(config.lesson_id)
    try:
        await run_voice_session(config)
    except asyncio.CancelledError:
        raise
    except Exception as error:
        log.error('voice_session_failed session_id=%s type=%s', key, type(error).__name__)
    finally:
        if sessions.get(key) is asyncio.current_task():
            sessions.pop(key, None)


@app.post("/sessions", dependencies=[Depends(authorize)])
async def start(config: VoiceSession):
    if config.room != "guru-" + str(config.lesson_id):
        raise HTTPException(400, "Room does not match lesson")
    readiness = voice_readiness(os.environ)
    if not readiness["livekit_configured"] or not readiness["callback_configured"]:
        raise HTTPException(503, "Voice transport is not configured")
    if config.stt_provider == "groq" and not readiness["stt_configured"]:
        raise HTTPException(503, "Hosted speech recognition key is missing")
    if config.tts_provider == "openai" and not readiness["tts_configured"]:
        raise HTTPException(503, "Speech output provider is not configured")
    if config.stt_provider == "whisper":
        import importlib.util
        if importlib.util.find_spec("faster_whisper") is None:
            raise HTTPException(503, "Install the optional Whisper extra first")
    async with lock:
        key = str(config.lesson_id)
        old = sessions.get(key)
        if old:
            old.cancel()
            await asyncio.gather(old, return_exceptions=True)
        if len(sessions) >= int(os.environ.get("MAX_VOICE_SESSIONS", "8")):
            raise HTTPException(503, "Voice capacity reached")
        sessions[key] = asyncio.create_task(run(config))
    return {"status": "starting", "lesson_id": key}


@app.delete("/sessions/{lesson_id}", dependencies=[Depends(authorize)])
async def stop(lesson_id: UUID):
    task = sessions.get(str(lesson_id))
    if task:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
    return {"status": "stopped"}
