"""
Automated Unit Tests for OM – AI Action Assistant
Verifies server endpoints, brand compliance, reasoning engine, and metrics.
"""

import os
import sys
import json
import threading
import time
import urllib.request
import unittest

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from server import run_server, PORT


class TestOMServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_port = 8011
        cls.base_url = f"http://localhost:{cls.test_port}"
        cls.server_thread = threading.Thread(
            target=run_server, args=(cls.test_port,), daemon=True
        )
        cls.server_thread.start()
        time.sleep(1.0)  # Wait for server to bind

    def test_status_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/status")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode("utf-8"))
        self.assertEqual(data["brand"], "OM")
        self.assertEqual(data["name"], "OM – AI Action Assistant")
        self.assertEqual(data["tagline"], "Think. Plan. Act. Achieve.")
        self.assertEqual(data["status"], "online")

    def test_chat_cognitive_engine(self):
        payload = json.dumps({
            "prompt": "Launch an AI SaaS in 14 days",
            "mode": "action"
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode("utf-8"))
        self.assertIn("Hi, I'm OM.", data["greeting"])
        self.assertTrue(data["verified"])
        self.assertTrue(len(data["actions"]) >= 4)
        stages = [a["stage"] for a in data["actions"]]
        self.assertIn("think", stages)
        self.assertIn("plan", stages)
        self.assertIn("act", stages)
        self.assertIn("achieve", stages)

    def test_tasks_and_metrics_lifecycle(self):
        # Create a task in 'act' stage
        task_payload = json.dumps({
            "title": "Automated Test Task Execution",
            "stage": "act",
            "priority": "high",
            "estimate": "1d"
        }).encode("utf-8")
        post_req = urllib.request.Request(
            f"{self.base_url}/api/tasks",
            data=task_payload,
            headers={"Content-Type": "application/json"}
        )
        post_resp = urllib.request.urlopen(post_req)
        self.assertEqual(post_resp.status, 201)

        # Retrieve tasks
        get_resp = urllib.request.urlopen(f"{self.base_url}/api/tasks")
        tasks_data = json.loads(get_resp.read().decode("utf-8"))
        self.assertTrue(len(tasks_data["tasks"]) > 0)

        # Verify metrics
        metric_resp = urllib.request.urlopen(f"{self.base_url}/api/metrics")
        metrics = json.loads(metric_resp.read().decode("utf-8"))
        self.assertIn("completion_rate", metrics)
        self.assertIn("velocity_score", metrics)
        self.assertIn("distribution", metrics)

    def test_homepage_branding_copy(self):
        resp = urllib.request.urlopen(f"{self.base_url}/")
        self.assertEqual(resp.status, 200)
        html = resp.read().decode("utf-8")
        self.assertIn("Meet <span class=\"text-gradient\">OM</span>", html)
        self.assertIn("Your AI Action Assistant", html)
        self.assertIn("Turn your goals into actionable plans.", html)
        self.assertIn("Start with OM", html)
        self.assertIn("Create a Goal", html)
        self.assertIn("Explore Demo", html)
        self.assertIn("Think. Plan. Act. Achieve.", html)


if __name__ == "__main__":
    unittest.main()
