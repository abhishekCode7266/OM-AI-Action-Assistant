"""
Automated Unit Tests for OM Vercel Serverless Function Handler (api/index.py)
"""

import os
import sys
import json
import threading
import time
import urllib.request
import unittest
from http.server import HTTPServer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "api"))

import index as vercel_handler


class TestVercelHandler(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = 8012
        cls.base_url = f"http://localhost:{cls.test_port}"
        cls.httpd = HTTPServer(("", cls.test_port), vercel_handler.handler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(1.0)

    def test_vercel_status(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/status")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode("utf-8"))
        self.assertEqual(data["brand"], "OM")
        self.assertEqual(data["tagline"], "Think. Plan. Act. Achieve.")
        self.assertEqual(data["environment"], "Vercel Serverless Function")

    def test_vercel_chat_decomposition(self):
        payload = json.dumps({"prompt": "Launch an AI App", "mode": "action"}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode("utf-8"))
        self.assertIn("Hi, I'm OM.", data["greeting"])
        self.assertTrue(len(data["actions"]) >= 4)

    def test_vercel_tasks_and_metrics(self):
        # GET tasks
        req = urllib.request.urlopen(f"{self.base_url}/api/tasks")
        self.assertEqual(req.status, 200)
        tasks = json.loads(req.read().decode("utf-8"))["tasks"]
        self.assertTrue(len(tasks) > 0)

        # GET metrics
        req_m = urllib.request.urlopen(f"{self.base_url}/api/metrics")
        self.assertEqual(req_m.status, 200)
        metrics = json.loads(req_m.read().decode("utf-8"))
        self.assertIn("completion_rate", metrics)
        self.assertIn("velocity_score", metrics)


if __name__ == "__main__":
    unittest.main()
