import importlib.util
from urllib.parse import urlparse


def valid_url(value, protocols):
    try:
        url = urlparse(value or "")
        return bool(url.hostname and url.scheme in protocols and not url.username and not url.password and not url.query and not url.fragment)
    except ValueError:
        return False


def voice_readiness(env):
    # Configuration metadata only: never return URL/key/token values.
    return {
        "health_version": 1,
        "livekit_configured": valid_url(env.get("LIVEKIT_URL"), ["wss", "ws"]),
        "callback_configured": valid_url(env.get("GURU_WEB_URL"), ["https", "http"]),
        "stt_configured": bool(env.get("GROQ_API_KEY", "").strip()),
        "whisper_configured": importlib.util.find_spec("faster_whisper") is not None,
        "tts_configured": bool(env.get("TTS_API_KEY", "").strip() and env.get("TTS_MODEL", "").strip()
                               and valid_url(env.get("TTS_BASE_URL"), ["https", "http"])),
    }
