import re
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field, SecretStr


class VoiceSession(BaseModel):
    lesson_id: UUID
    room: str = Field(pattern=r"^guru-[0-9a-f-]{36}$")
    room_token: SecretStr
    callback_token: SecretStr
    participant: str = Field(min_length=2, max_length=200)
    language: Literal["en", "ne", "bilingual"] = "en"
    duration_seconds: int = Field(ge=1, le=7200)
    stt_provider: Literal["groq", "whisper"] = "groq"
    tts_provider: Literal["openai", "browser"] = "browser"
    voice: str = Field(min_length=1, max_length=100)
    speed: float = Field(ge=0.6, le=1.2)
    silence_seconds: float = Field(ge=0.3, le=3)


def speech_text(text: str, language: str) -> str:
    ne = language == "ne"
    text = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", lambda m: f"{m[1]} {'भाग' if ne else 'over'} {m[2]}", text)
    text = re.sub(r"\^\{?2\}?|²", " वर्ग " if ne else " squared ", text)
    text = re.sub(r"\^\{?3\}?|³", " घन " if ne else " cubed ", text)
    text = re.sub(r"(\d+)\s*:\s*(\d+)", lambda m: f"{m[1]} {'अनुपात' if ne else 'to'} {m[2]}", text)
    text = re.sub(r"\\(?:times|cdot)", " गुणा " if ne else " times ", text)
    text = re.sub(r"\\(?:text|mathrm)\{([^}]+)\}", r"\1", text)
    for symbol, en, nepali in [("=", "equals", "बराबर"), ("+", "plus", "जोड"), ("%", "percent", "प्रतिशत"), ("₹", "rupees", "रुपैयाँ"), ("×", "times", "गुणा"), ("÷", "divided by", "भाग")]:
        text = text.replace(symbol, f" {nepali if ne else en} ")
    text = re.sub(r"\\[\[\]()]|\$|\*\*|#{1,6}", "", text)
    text = re.sub(r"\\[A-Za-z]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def split_sentences(text: str, consumed: int, final: bool = False) -> tuple[list[str], int]:
    """Speak only complete sentences; never split inside LaTeX or a decimal."""
    remaining = text[consumed:]
    if final:
        return ([remaining] if remaining.strip() else []), len(text)
    segments = list(re.finditer(r"[.!?।](?:\s+|$)", remaining))
    end = 0
    for match in segments:
        candidate = remaining[:match.end()]
        if candidate.count(r"\(") == candidate.count(r"\)") and candidate.count(r"\[") == candidate.count(r"\]"):
            end = match.end()
    return ([remaining[:end]] if end else []), consumed + end
