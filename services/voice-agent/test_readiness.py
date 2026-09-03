import unittest
from readiness import voice_readiness


class ReadinessTests(unittest.TestCase):
    def test_missing_configuration_is_not_ready(self):
        result = voice_readiness({})
        self.assertFalse(result["stt_configured"])
        self.assertFalse(result["tts_configured"])
        self.assertFalse(result["livekit_configured"])
        self.assertFalse(result["callback_configured"])

    def test_speech_requires_all_three_provider_fields(self):
        env = {"TTS_API_KEY": "fixture-only", "TTS_BASE_URL": "https://speech.fixture.test/v1"}
        self.assertFalse(voice_readiness(env)["tts_configured"])
        env["TTS_MODEL"] = "fixture-model"
        self.assertTrue(voice_readiness(env)["tts_configured"])

    def test_invalid_urls_and_no_credentials_in_health(self):
        env = {"LIVEKIT_URL": "wss://project.fixture.test", "GURU_WEB_URL": "https://web.fixture.test", "GROQ_API_KEY": "secret-fixture"}
        result = voice_readiness(env)
        self.assertTrue(result["livekit_configured"])
        self.assertTrue(result["callback_configured"])
        self.assertTrue(result["stt_configured"])
        self.assertNotIn("fixture", str(result))
        for invalid in ["invalid", "file:///tmp/a", "https://user:secret@host.test", "https://[bad"]:
            env["GURU_WEB_URL"] = invalid
            self.assertFalse(voice_readiness(env)["callback_configured"])


if __name__ == "__main__":
    unittest.main()
