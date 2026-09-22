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
        cls.test_port = 8013
        cls.base_url = f"http://localhost:{cls.test_port}"
        cls.httpd = HTTPServer(("", cls.test_port), vercel_handler.handler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(1.0)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()

    def test_vercel_homepage_serving(self):
        req = urllib.request.urlopen(f"{self.base_url}/")
        self.assertEqual(req.status, 200)
        content_type = req.headers.get("Content-Type")
        self.assertIn("text/html", content_type)
        html = req.read().decode("utf-8")
        self.assertIn("OM AI Assistant", html)
        self.assertIn("<span class=\"text-gradient\">OM</span>", html)
        self.assertIn("Think. Plan. Act. Achieve.", html)

    def test_vercel_static_assets_serving(self):
        req = urllib.request.urlopen(f"{self.base_url}/assets/css/style.css")
        self.assertEqual(req.status, 200)
        self.assertIn("text/css", req.headers.get("Content-Type"))

    def test_vercel_status(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/status")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode("utf-8"))
        self.assertEqual(data["brand"], "OM")
        self.assertEqual(data["tagline"], "Think. Plan. Act. Achieve.")

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


    def test_vercel_seo_crawlers_serving(self):
        req_robots = urllib.request.urlopen(f"{self.base_url}/robots.txt")
        self.assertEqual(req_robots.status, 200)
        self.assertIn("User-agent: *", req_robots.read().decode("utf-8"))

        req_sitemap = urllib.request.urlopen(f"{self.base_url}/sitemap.xml")
        self.assertEqual(req_sitemap.status, 200)
        self.assertIn("<urlset", req_sitemap.read().decode("utf-8"))


if __name__ == "__main__":
    unittest.main()
