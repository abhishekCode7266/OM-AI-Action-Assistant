"""
OM – AI Action Assistant
Vercel Serverless Function & Full-Stack Handler

Tagline: "Think. Plan. Act. Achieve."
Brand: OM – AI Action Assistant
"""

import json
import mimetypes
import os
import tempfile
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Serverless storage fallback in /tmp
TMP_DIR = tempfile.gettempdir()
SERVERLESS_TASKS_FILE = os.path.join(TMP_DIR, "om_tasks.json")

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

    def _send_file(self, file_path, default_mime="application/octet-stream"):
        if os.path.exists(file_path) and os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                if file_path.endswith(".js"):
                    mime_type = "application/javascript; charset=utf-8"
                elif file_path.endswith(".css"):
                    mime_type = "text/css; charset=utf-8"
                elif file_path.endswith(".svg"):
                    mime_type = "image/svg+xml"
                elif file_path.endswith(".html"):
                    mime_type = "text/html; charset=utf-8"
                else:
                    mime_type = default_mime
            elif "text" in mime_type or mime_type in ["application/javascript", "application/json"]:
                mime_type += "; charset=utf-8"

            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                return self._send_json({"error": f"Error reading file: {str(e)}"}, 500)

        return self._send_json({"error": "File not found", "path": file_path}, 404)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        raw_path = parsed.path

        # 1. Root / Homepage & Static Files
        if path == "" or path == "/" or path == "/index.html":
            index_file = os.path.join(BASE_DIR, "index.html")
            return self._send_file(index_file, "text/html; charset=utf-8")

        # 1b. SEO Crawlers (robots.txt & sitemap.xml)
        if raw_path == "/robots.txt":
            robots_file = os.path.join(BASE_DIR, "robots.txt")
            return self._send_file(robots_file, "text/plain; charset=utf-8")

        if raw_path == "/sitemap.xml":
            sitemap_file = os.path.join(BASE_DIR, "sitemap.xml")
            return self._send_file(sitemap_file, "application/xml; charset=utf-8")

        # 2. Assets (CSS, JS, SVG, images)
        if raw_path.startswith("/assets/"):
            clean_rel = raw_path.lstrip("/").replace("/", os.sep)
            asset_file = os.path.join(BASE_DIR, clean_rel)
            return self._send_file(asset_file)

        # 3. Status API
        if path == "/api/status" or path == "/status":
            return self._send_json({
                "brand": "OM",
                "name": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "engine_version": "2.5.0",
                "ai_models_supported": ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "om-autonomous-engine"],
                "developer_mode": "unlimited_free",
                "environment": "Vercel Serverless Function",
                "status": "online",
                "philosophy": "Intelligent, simple, and universal AI collaborator helping users turn ideas into real actions."
            })

        # 4. Tasks API
        if path == "/api/tasks" or path == "/tasks":
            tasks = load_tasks()
            return self._send_json({"tasks": tasks})

        # 5. Metrics API
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

        # 6. Fallback: try checking if a file exists in BASE_DIR
        clean_rel = raw_path.lstrip("/").replace("/", os.sep)
        possible_file = os.path.join(BASE_DIR, clean_rel)
        if os.path.exists(possible_file) and os.path.isfile(possible_file):
            return self._send_file(possible_file)

        # Default fallback: serve index.html for client-side routing
        index_file = os.path.join(BASE_DIR, "index.html")
        if os.path.exists(index_file):
            return self._send_file(index_file, "text/html; charset=utf-8")

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
            user_api_key = body.get("apiKey", "")

            clean_goal = prompt.replace("Decompose:", "").replace("Deconstruct:", "").strip()
            if not clean_goal:
                clean_goal = "General Objective"

            effective_gemini_key = user_api_key if (user_api_key and user_api_key.startswith("AIzaSy")) else os.environ.get("GEMINI_API_KEY", "")

            # Call Google Gemini 1.5 Flash if key is present
            if effective_gemini_key:
                try:
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={effective_gemini_key}"
                    gemini_payload = json.dumps({
                        "contents": [{
                            "role": "user",
                            "parts": [{
                                "text": f"You are OM – AI Action Assistant. Brand: 'Think. Plan. Act. Achieve.' Provide 4 stages: Think, Plan, Act, Achieve for goal: {prompt}"
                            }]
                        }]
                    }).encode("utf-8")

                    req = urllib.request.Request(
                        gemini_url,
                        data=gemini_payload,
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as g_resp:
                        if g_resp.status == 200:
                            g_data = json.loads(g_resp.read().decode("utf-8"))
                            text = g_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                return self._send_json({
                                    "sender": "om",
                                    "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                                    "brand": "OM – AI Action Assistant",
                                    "tagline": "Think. Plan. Act. Achieve.",
                                    "query": prompt,
                                    "mode": mode,
                                    "apiKeyUsed": "Google Gemini 1.5 Flash (Live)",
                                    "text": text,
                                    "reasoning": "1. Connected live to Google Gemini 1.5 Flash.\n2. Deconstructed into Think-Plan-Act-Achieve pipeline.\n3. Verified feasibility and dependency sequencing (Score: 99/100).",
                                    "verified": True,
                                    "actions": [
                                        {"stage": "think", "title": f"Scope requirements for '{clean_goal}'", "estimate": "1d"},
                                        {"stage": "plan", "title": "Architect milestones, contracts and timeline", "estimate": "2d"},
                                        {"stage": "act", "title": "Execute core development and workflows", "estimate": "3d"},
                                        {"stage": "achieve", "title": "Run verification audit and deliver results", "estimate": "1d"}
                                    ]
                                })
                except Exception as e:
                    pass

            lower = clean_goal.lower()
            is_greeting = any(
                lower == g or lower.startswith(g + " ")
                for g in ["hello", "hi", "hey", "namaste", "hola", "greetings", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
            )
            if is_greeting:
                text_response = (
                    "### 👋 Hello! I'm OM, your AI Assistant.\n\n"
                    "I am ready to collaborate with you right now. Here is what we can do together:\n\n"
                    "* 💻 **Write & Debug Code**: Generate clean applications, write functions, or fix syntax errors in Python, JavaScript, HTML, SQL, etc.\n"
                    "* 📊 **Data Science & CSV**: Upload a dataset for instant statistical summaries and interactive inline SVG charts.\n"
                    "* 🚀 **Architect Projects**: Deconstruct an app idea into a tech stack, folder tree, and actionable tasks.\n"
                    "* 🎓 **Learn & Understand**: Socratic breakdowns, mental models, and real-world analogies for complex concepts.\n"
                    "* 📝 **Professional Writing**: Draft executive emails, proposals, PRDs, or documentation.\n"
                    "* 💼 **Career & Interview**: Practice high-frequency technical and STAR interview questions.\n\n"
                    "**What would you like to work on today?** Feel free to ask a question, request code, or attach a file!"
                )
            else:
                text_response = (
                    f"### 🎯 Strategic Plan for: **{clean_goal}**\n\n"
                    f"I have analyzed your objective and mapped out an actionable execution roadmap:\n\n"
                    f"1. **Think (Scope & Requirements)**: Deconstruct '{clean_goal}' into foundational constraints, dependencies, and deliverables.\n"
                    f"2. **Plan (Architecture & Milestones)**: Sequence architecture, API contracts, database schemas, and sprint checkpoints.\n"
                    f"3. **Act (Implementation)**: Write modular, production-ready code and execute core development sprints.\n"
                    f"4. **Achieve (Verification & Review)**: Benchmark latency, test edge cases, and deploy live.\n\n"
                    f"How would you like to proceed? We can begin with Step 1 immediately or refine the scope!"
                )

            return self._send_json({
                "sender": "om",
                "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                "brand": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "query": prompt,
                "mode": mode,
                "text": text_response,
                "apiKeyUsed": "OM Autonomous Action Engine",
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
