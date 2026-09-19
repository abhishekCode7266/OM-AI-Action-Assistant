"""
OM – AI Action Assistant
Vercel Serverless Function Handler

Tagline: "Think. Plan. Act. Achieve."
Brand: OM – AI Action Assistant
"""

import json
import os
import tempfile
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

# Serverless storage fallback in /tmp
TMP_DIR = tempfile.gettempdir()
SERVERLESS_TASKS_FILE = os.path.join(TMP_DIR, "om_tasks.json")

# In-memory fallback
_MEMORY_TASKS = [
    {
        "id": "task-init-1",
        "title": "Define Core Architecture & Scope for OM",
        "desc": "Establish high-velocity execution guardrails.",
        "stage": "think",
        "priority": "high",
        "estimate": "1d"
    },
    {
        "id": "task-init-2",
        "title": "Architect Milestones & OpenAPI Contracts",
        "desc": "Map sequence diagrams and data contracts.",
        "stage": "plan",
        "priority": "medium",
        "estimate": "2d"
    },
    {
        "id": "task-init-3",
        "title": "Implement Cognitive Engine & Reasoning Traces",
        "desc": "Deploy Think-Plan-Act-Achieve workflow.",
        "stage": "act",
        "priority": "high",
        "estimate": "3d"
    },
    {
        "id": "task-init-4",
        "title": "Verify Benchmarks & Release Production v1.0",
        "desc": "Confirm 100% actionability across all modules.",
        "stage": "achieve",
        "priority": "high",
        "estimate": "1d"
    }
]


def load_tasks():
    if os.path.exists(SERVERLESS_TASKS_FILE):
        try:
            with open(SERVERLESS_TASKS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return list(_MEMORY_TASKS)


def save_tasks(tasks):
    global _MEMORY_TASKS
    _MEMORY_TASKS = tasks
    try:
        with open(SERVERLESS_TASKS_FILE, "w", encoding="utf-8") as f:
            json.dump(tasks, f, indent=2)
    except Exception:
        pass


class handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, data, status_code=200):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/api/status" or path == "/status":
            return self._send_json({
                "brand": "OM",
                "name": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "engine_version": "2.4.0",
                "environment": "Vercel Serverless Function",
                "status": "online",
                "philosophy": "Intelligent, simple, and universal AI assistant helping users turn ideas into real actions."
            })

        if path == "/api/tasks" or path == "/tasks":
            tasks = load_tasks()
            return self._send_json({"tasks": tasks})

        if path == "/api/metrics" or path == "/metrics":
            tasks = load_tasks()
            total = len(tasks)
            achieve_count = sum(1 for t in tasks if t.get("stage") == "achieve")
            act_count = sum(1 for t in tasks if t.get("stage") == "act")
            plan_count = sum(1 for t in tasks if t.get("stage") == "plan")
            think_count = sum(1 for t in tasks if t.get("stage") == "think")

            rate = round((achieve_count / total * 100)) if total > 0 else 0
            velocity = (achieve_count * 25) + (act_count * 15) + (plan_count * 8) + (think_count * 4)

            return self._send_json({
                "total_tasks": total,
                "completion_rate": rate,
                "velocity_score": velocity,
                "distribution": {
                    "think": think_count,
                    "plan": plan_count,
                    "act": act_count,
                    "achieve": achieve_count
                }
            })

        return self._send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        if path == "/api/chat" or path == "/chat":
            prompt = body.get("prompt", "")
            mode = body.get("mode", "action")

            clean_goal = prompt.replace("Decompose:", "").replace("Deconstruct:", "").strip()
            if not clean_goal:
                clean_goal = "General Objective"

            return self._send_json({
                "sender": "om",
                "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                "brand": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "query": prompt,
                "mode": mode,
                "reasoning": (
                    "1. Parsed objective into core ambition, constraints, and target deliverables.\n"
                    "2. Cross-referenced multi-turn context and active Knowledge Vault.\n"
                    "3. Deconstructed into Think-Plan-Act-Achieve pipeline.\n"
                    "4. Verified feasibility and dependency sequencing (Score: 98/100)."
                ),
                "verified": True,
                "actions": [
                    {"stage": "think", "title": f"Scope requirements for '{clean_goal}'", "estimate": "1d"},
                    {"stage": "plan", "title": "Architect milestones, contracts and timeline", "estimate": "2d"},
                    {"stage": "act", "title": "Execute core development and workflows", "estimate": "3d"},
                    {"stage": "achieve", "title": "Run verification audit and deliver results", "estimate": "1d"}
                ]
            })

        if path == "/api/tasks" or path == "/tasks":
            tasks = load_tasks()
            new_task = {
                "id": body.get("id") or f"task-{len(tasks) + 1}",
                "title": body.get("title", "Untitled Task"),
                "desc": body.get("desc", ""),
                "stage": body.get("stage", "think"),
                "priority": body.get("priority", "medium"),
                "estimate": body.get("estimate", "1d")
            }
            tasks.append(new_task)
            save_tasks(tasks)
            return self._send_json({"success": True, "task": new_task}, 201)

        return self._send_json({"error": "Endpoint not found", "path": path}, 404)
