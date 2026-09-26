import unittest
import urllib.request
import json
import threading
import time
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
sys.path.insert(0, PROJECT_DIR)

from server import run_server

class TestNewEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = 8019
        cls.base_url = f"http://localhost:{cls.port}"
        cls.server_thread = threading.Thread(target=run_server, args=(cls.port,), daemon=True)
        cls.server_thread.start()
        time.sleep(1.0)

    def test_health_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/health")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode('utf-8'))
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["brand"], "OM")

    def test_image_unconfigured_error(self):
        req = urllib.request.Request(
            f"{self.base_url}/api/image",
            data=json.dumps({"prompt": "A cyber car"}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Should have raised HTTPError 400")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            data = json.loads(e.read().decode('utf-8'))
            self.assertIn("Image generation API is not configured", data["error"])

    def test_video_unconfigured_error(self):
        req = urllib.request.Request(
            f"{self.base_url}/api/video",
            data=json.dumps({"prompt": "A flying drone"}).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        try:
            urllib.request.urlopen(req)
            self.fail("Should have raised HTTPError 400")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            data = json.loads(e.read().decode('utf-8'))
            self.assertIn("Video generation requires a configured video provider", data["error"])

    def test_github_status_unconfigured(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/github/status")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode('utf-8'))
        self.assertFalse(data["configured"])

    def test_vercel_status_unconfigured(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/vercel/status")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode('utf-8'))
        self.assertFalse(data["configured"])

    def test_payment_unconfigured(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/payment")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode('utf-8'))
        self.assertFalse(data["success"])
        self.assertIn("Payment gateway is not configured", data["error"])

if __name__ == '__main__':
    unittest.main()
