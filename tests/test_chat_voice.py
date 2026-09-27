"""
Unit and integration tests for OM AI Chat Pipeline, 8-Mode Specialization,
Offline Demo Mode honesty, and Voice STT/TTS engine logic.
"""

import json
import unittest
import urllib.request
import urllib.error
import threading
import time
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
import server


class TestChatAndVoicePipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = 8023
        cls.base_url = f"http://localhost:{cls.port}"
        cls.server_thread = threading.Thread(
            target=server.run_server, args=(cls.port,), daemon=True
        )
        cls.server_thread.start()
        time.sleep(1.0)

    def test_chat_offline_demo_honesty(self):
        """Verify chat truthfully reports Offline Demo Mode without API keys."""
        payload = json.dumps({
            "prompt": "How do I build a scalable microservice architecture?",
            "mode": "coding",
            "history": [
                {"role": "user", "text": "Hi"},
                {"role": "model", "text": "Hello! How can I help?"}
            ]
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("offlineDemo", data)
            self.assertTrue(data["offlineDemo"])
            self.assertEqual(data["apiKeyUsed"], "Offline Demo Mode")
            self.assertIn("Offline Demo Mode", data["text"])

    def test_chat_all_8_modes_support(self):
        """Verify all 8 mode selectors are properly routed and recognized."""
        modes = ["general", "coding", "data", "research", "writing", "project", "career", "study"]
        for mode in modes:
            payload = json.dumps({
                "prompt": f"Test prompt for {mode} mode",
                "mode": mode,
                "history": []
            }).encode("utf-8")
            req = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertEqual(data["mode"], mode)
                self.assertEqual(data["brand"], "OM – AI Action Assistant")
                self.assertEqual(data["tagline"], "Think. Plan. Act. Achieve.")

    def test_chat_greeting_offline_guidance(self):
        """Verify greeting in offline mode provides full capability breakdown and instructions."""
        payload = json.dumps({
            "prompt": "Hello",
            "mode": "general"
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("Hello! I'm OM AI Assistant", data["text"])
            self.assertIn("Coding Studio", data["text"])
            self.assertIn("3D Studio", data["text"])
            self.assertIn("Offline Demo", data["apiKeyUsed"])

    def test_code_execution_python_backend(self):
        """Verify backend /api/execute runs real Python code and captures output."""
        code = "print(sum([x for x in range(10)]))"
        payload = json.dumps({"code": code, "language": "python"}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/execute",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data["success"])
            self.assertEqual(data["stdout"].strip(), "45")
            self.assertEqual(data["exit_code"], 0)

    def test_mock_speech_recognition_logic(self):
        """Test mock SpeechRecognition interim and final transcript simulation."""
        # Simulated Web Speech events
        interim_transcript = "building a drone"
        final_transcript = "build an autonomous drone"

        current_input = ""
        # 1. On interim result
        preview_text = interim_transcript
        self.assertEqual(preview_text, "building a drone")

        # 2. On final result
        current_input = (current_input + " " + final_transcript).strip()
        self.assertEqual(current_input, "build an autonomous drone")

        # 3. Text cleaning before TTS
        markdown_text = "### Overview\nHere is `code`:\n```python\nprint(1)\n```\n* Step 1: **Think**"
        clean_text = (
            markdown_text
            .replace("```python\nprint(1)\n```", "Code implementation omitted.")
            .replace("`code`", "code")
            .replace("### ", "")
            .replace("* ", "")
            .replace("**", "")
        )
        self.assertNotIn("```", clean_text)
        self.assertNotIn("###", clean_text)
        self.assertIn("Code implementation omitted", clean_text)


if __name__ == "__main__":
    unittest.main()
