import asyncio
import json
import logging
import os
import time
from uuid import uuid4
import httpx
from pipecat.frames.frames import (Frame, LLMContextFrame, LLMTextFrame, LLMFullResponseStartFrame,
    LLMFullResponseEndFrame, InterruptionFrame, InterimTranscriptionFrame, CancelFrame, EndFrame)
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection
from contracts import VoiceSession, speech_text, split_sentences

log = logging.getLogger("guru.voice")


class TeacherBridge(FrameProcessor):
    """Pipecat controls audio; the web service owns curriculum, grading and persistence."""
    def __init__(self, config: VoiceSession, transport):
        super().__init__()
        self.config = config
        self.transport = transport
        self.response_task: asyncio.Task | None = None
        self.interrupt_task: asyncio.Task | None = None
        self.http = httpx.AsyncClient(timeout=httpx.Timeout(180, connect=10))
        self.url = os.environ["GURU_WEB_URL"].rstrip("/") + "/api/voice/agent"
        self.headers = {"Authorization": "Bearer " + config.callback_token.get_secret_value()}

    async def send_event(self, event: dict):
        message = json.dumps(event, ensure_ascii=False)
        if len(message.encode()) <= 12000:
            await self.transport.send_message(message, self.config.participant)
        else:
            parts = [message[i:i + 2500] for i in range(0, len(message), 2500)]
            packet_id = str(uuid4())
            for index, part in enumerate(parts):
                await self.transport.send_message(json.dumps({"type": "fragment", "id": packet_id, "index": index, "total": len(parts), "data": part}), self.config.participant)

    async def interrupt(self):
        if self.response_task and not self.response_task.done():
            self.response_task.cancel()
            await asyncio.gather(self.response_task, return_exceptions=True)
        await self.send_event({"type": "interrupted"})
        try:
            await self.http.post(self.url, headers=self.headers, json={"action": "interrupt"}, timeout=5)
        except httpx.HTTPError:
            log.warning("voice_interrupt_callback_failed", extra={"session_id": str(self.config.lesson_id)})

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if isinstance(frame, InterruptionFrame):
            # Forward first so queued TTS and transport audio stop without waiting on HTTP.
            await self.push_frame(frame, direction)
            self.interrupt_task = self.create_task(self.interrupt())
        elif isinstance(frame, LLMContextFrame):
            if self.interrupt_task:
                await self.interrupt_task
            messages = frame.context.get_messages()
            user = next((m for m in reversed(messages) if isinstance(m, dict) and m.get("role") == "user"), {})
            content = user.get("content", "")
            if isinstance(content, list):
                content = " ".join(item.get("text", "") for item in content if isinstance(item, dict))
            if isinstance(content, str) and content.strip():
                if self.response_task and not self.response_task.done():
                    await self.interrupt()
                self.response_task = self.create_task(self.respond(content[:4000]))
        elif isinstance(frame, InterimTranscriptionFrame):
            await self.send_event({"type": "interim", "text": frame.text[:4000]})
            await self.push_frame(frame, direction)
        elif isinstance(frame, (CancelFrame, EndFrame)):
            if self.response_task:
                self.response_task.cancel()
                await asyncio.gather(self.response_task, return_exceptions=True)
            await self.http.aclose()
            await self.push_frame(frame, direction)
        else:
            await self.push_frame(frame, direction)

    async def respond(self, text: str, kind: str = "MESSAGE"):
        request_id = str(uuid4())
        started = time.monotonic()
        consumed = 0
        await self.send_event({"type": "transcript", "text": text, "requestId": request_id})
        await self.send_event({"type": "state", "state": "thinking"})
        await self.push_frame(LLMFullResponseStartFrame())
        try:
            async with self.http.stream("POST", self.url, headers=self.headers, json={"requestId": request_id, "message": text, "kind": kind, "language": self.config.language}) as response:
                if response.status_code != 200:
                    raise RuntimeError("Teacher callback unavailable")
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    event = json.loads(line)
                    event["requestId"] = request_id
                    if event.get("type") == "error":
                        raise RuntimeError("Teacher response incomplete")
                    if event.get("type") == "text":
                        await self.send_event(event)
                        parts, consumed = split_sentences(event["text"], consumed)
                        for part in parts:
                            await self.speak(part)
                    elif event.get("type") == "done":
                        answer = event["turn"]["answer"]
                        parts, consumed = split_sentences(answer, consumed, final=True)
                        for part in parts:
                            await self.speak(part)
                        await self.send_event(event)
            log.info(json.dumps({"event": "voice_turn", "session_id": str(self.config.lesson_id), "request_id": request_id, "latency_ms": round((time.monotonic() - started) * 1000)}))
        except asyncio.CancelledError:
            raise
        except Exception:
            await self.send_event({"type": "error", "error": "The voice teacher could not finish. Reconnect or continue with text."})
        finally:
            await self.push_frame(LLMFullResponseEndFrame())

    async def speak(self, text: str):
        normalized = speech_text(text, self.config.language)
        if not normalized:
            return
        if self.config.tts_provider == "browser":
            await self.send_event({"type": "speak", "text": normalized, "language": self.config.language, "speed": self.config.speed})
        else:
            await self.push_frame(LLMTextFrame(normalized + " "))
