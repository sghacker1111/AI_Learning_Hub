import os
import unittest
from unittest.mock import patch
import httpx
from app import app, sessions


class WorkerHealthTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.secret = "isolated-worker-test-secret-long-enough"
        self.env = patch.dict(os.environ, {"VOICE_AGENT_SECRET": self.secret}, clear=True)
        self.env.start()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://fixture.test")

    async def asyncTearDown(self):
        await self.client.aclose()
        self.env.stop()

    async def test_health_requires_auth_and_never_echoes_secrets(self):
        self.assertEqual((await self.client.get("/health")).status_code, 401)
        response = await self.client.get("/health", headers={"Authorization": "Bearer " + self.secret})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "reachable")
        self.assertFalse(response.json()["callback_configured"])
        self.assertNotIn(self.secret, response.text)

    async def test_unconfigured_session_never_starts_a_pipeline(self):
        lesson = "00000000-0000-4000-8000-000000000001"
        payload = {"lesson_id": lesson, "room": "guru-" + lesson, "room_token": "fixture-only", "callback_token": "fixture-only", "participant": "fixture-student", "duration_seconds": 60, "voice": "alloy", "speed": 0.92, "silence_seconds": 0.8}
        response = await self.client.post("/sessions", headers={"Authorization": "Bearer " + self.secret}, json=payload)
        self.assertEqual(response.status_code, 503)
        self.assertEqual(len(sessions), 0)


if __name__ == "__main__":
    unittest.main()
