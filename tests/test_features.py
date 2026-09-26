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

    def test_python_execute_success(self):
        payload = json.dumps({
            "code": "print('OM Real Execution Active: 42 * 2 =', 42 * 2)",
            "language": "python"
        }).encode('utf-8')
        req = urllib.request.Request(
            f"{self.base_url}/api/execute",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode('utf-8'))
        self.assertEqual(data["exit_code"], 0)
        self.assertIn("OM Real Execution Active: 42 * 2 = 84", data["stdout"])

    def test_python_execute_error(self):
        payload = json.dumps({
            "code": "print('Before error')\nraise ValueError('Intentional Test Exception')",
            "language": "python"
        }).encode('utf-8')
        req = urllib.request.Request(
            f"{self.base_url}/api/execute",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        self.assertEqual(resp.status, 200)
        data = json.loads(resp.read().decode('utf-8'))
        self.assertNotEqual(data["exit_code"], 0)
        self.assertIn("Intentional Test Exception", data["stderr"])

    def test_chats_crud_and_delete(self):
        # 1. Save chat
        chat_id = f"test-chat-{int(time.time())}"
        save_payload = json.dumps({
            "id": chat_id,
            "title": "Automated Unit Test Chat",
            "messages": [{"sender": "user", "text": "Hello test"}]
        }).encode('utf-8')
        req_save = urllib.request.Request(
            f"{self.base_url}/api/chats",
            data=save_payload,
            headers={"Content-Type": "application/json"}
        )
        resp_save = urllib.request.urlopen(req_save)
        self.assertEqual(resp_save.status, 200)

        # 2. Get chats and verify chat is present
        req_get = urllib.request.urlopen(f"{self.base_url}/api/chats")
        self.assertEqual(req_get.status, 200)
        chats_data = json.loads(req_get.read().decode('utf-8'))
        ids = [c.get("id") for c in chats_data.get("chats", [])]
        self.assertIn(chat_id, ids)

        # 3. Delete chat
        del_req = urllib.request.Request(
            f"{self.base_url}/api/chats?id={chat_id}",
            method="DELETE"
        )
        del_resp = urllib.request.urlopen(del_req)
        self.assertEqual(del_resp.status, 200)
        del_data = json.loads(del_resp.read().decode('utf-8'))
        self.assertTrue(del_data.get("success"))

        # 4. Verify chat is removed
        req_get2 = urllib.request.urlopen(f"{self.base_url}/api/chats")
        chats_data2 = json.loads(req_get2.read().decode('utf-8'))
        ids2 = [c.get("id") for c in chats_data2.get("chats", [])]
        self.assertNotIn(chat_id, ids2)

if __name__ == '__main__':
    unittest.main()
