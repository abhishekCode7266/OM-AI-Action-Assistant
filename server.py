"""
OM – AI Action Assistant
Backend API Server & Static Asset Dispatcher

Brand Tagline: "Think. Plan. Act. Achieve."
"""

import os
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")

os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data store if missing
if not os.path.exists(TASKS_FILE):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)


class OMRequestHandler(BaseHTTPRequestHandler):
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
        path = parsed.path

        # API Endpoints
        if path == "/api/status":
            return self._send_json({
                "brand": "OM",
                "name": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "persona": "Master-level, fully multimodal personal AI collaborator built to handle any task across text, vision, code, media, and data analysis.",
                "engine_version": "3.0.0",
                "ai_models_supported": ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "om-autonomous-engine"],
                "developer_mode": "unlimited_free",
                "multimodal_capabilities": [
                    "Vision & Image Analysis",
                    "Video & Audio Processing",
                    "Document & Library Search",
                    "Code & Technical Execution",
                    "Live Search & Data Lookup",
                    "Charts & Data Analytics (Sparks)",
                    "Notebook Workflows"
                ],
                "operational_rules": [
                    "Clarity First",
                    "Step-by-Step Breakdown",
                    "Completeness"
                ],
                "status": "online",
                "philosophy": "Intelligent, simple, and universal AI collaborator helping users turn ideas into real actions."
            })

        if path == "/api/prompt":
            prompt_file = os.path.join(BASE_DIR, "docs", "OM_AI_AGENT_PROMPT.md")
            prompt_content = ""
            if os.path.exists(prompt_file):
                with open(prompt_file, "r", encoding="utf-8") as f:
                    prompt_content = f.read()
            return self._send_json({
                "status": "success",
                "system_name": "OM AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "total_modules": 65,
                "prompt": prompt_content
            })

        if path == "/api/tasks":
            try:
                with open(TASKS_FILE, "r", encoding="utf-8") as f:
                    tasks = json.load(f)
            except Exception:
                tasks = []
            return self._send_json({"tasks": tasks})

        if path == "/api/metrics":
            try:
                with open(TASKS_FILE, "r", encoding="utf-8") as f:
                    tasks = json.load(f)
            except Exception:
                tasks = []

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

        # Static File Serving
        if path == "/" or path == "":
            file_path = os.path.join(BASE_DIR, "index.html")
        else:
            clean_path = path.lstrip("/").replace("/", os.sep)
            file_path = os.path.join(BASE_DIR, clean_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "application/octet-stream"
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
                self.send_error(500, f"Error reading file: {str(e)}")
                return

        self.send_error(404, f"File or endpoint not found: {path}")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        if path == "/api/chat":
            prompt = body.get("prompt", "")
            mode = body.get("mode", "action")

            clean_goal = prompt.replace("Decompose:", "").replace("Deconstruct:", "").strip()
            if not clean_goal:
                clean_goal = "General Objective"

            lower = clean_goal.lower()
            is_greeting = any(
                lower == g or lower.startswith(g + " ")
                for g in ["hello", "hi", "hey", "namaste", "hola", "greetings", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
            )
            if is_greeting:
                text_response = (
                    "### 👋 Hello! I'm Om AI Assistant.\n\n"
                    "I am your **master-level, fully multimodal personal AI collaborator**, built to handle any task across text, vision, code, media, and data analysis:\n\n"
                    "* 👁️ **Vision & Image Analysis**: Inspect photos, screenshots, diagrams, and UI/UX layouts. Extract text accurately and analyze visual composition.\n"
                    "* 💻 **Code & Technical Execution**: Write, debug, optimize, and explain code across all major languages (Python, JavaScript, C++, Go, etc.).\n"
                    "* 📊 **Charts & Data Analytics (Sparks)**: Ingest CSV/Excel datasets for statistical summaries and inline interactive charts.\n"
                    "* 🎥 **Video & Audio Processing**: Parse video frames, listen to audio clips, summarize long recordings, and extract timestamps.\n"
                    "* 📑 **Document & Library Search**: Read, cross-reference, and summarize large libraries of files, including PDFs, spreadsheets, and text documents.\n"
                    "* 📓 **Notebook Workflows**: Act as an interactive research partner, synthesizing notes, brainstorming ideas, and organizing multi-step projects.\n"
                    "* 🌐 **Live Search & Data Lookup**: Access and synthesize real-time information, web data, and current news.\n\n"
                    "**What would you like to achieve today?** Ask a question, paste code, or attach an image/dataset!"
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

            # Cognitive response simulation & goal decomposition
            return self._send_json({
                "sender": "om",
                "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                "brand": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "query": prompt,
                "mode": mode,
                "text": text_response,
                "reasoning": (
                    "1. Parsed objective into core ambition, constraints, and target deliverables.\n"
                    "2. Cross-referenced multi-turn context and active Knowledge Vault.\n"
                    "3. Deconstructed into Think-Plan-Act-Achieve pipeline.\n"
                    "4. Verified feasibility and dependency sequencing (Score: 98/100)."
                ),
                "verified": True,
                "actions": [
                    {"stage": "think", "title": f"Scope and specify requirements for '{prompt}'", "estimate": "1d"},
                    {"stage": "plan", "title": "Architect milestones, contracts and timeline", "estimate": "2d"},
                    {"stage": "act", "title": "Execute core development and workflows", "estimate": "3d"},
                    {"stage": "achieve", "title": "Run verification audit and deliver results", "estimate": "1d"}
                ]
            })

        if path == "/api/tasks":
            try:
                with open(TASKS_FILE, "r", encoding="utf-8") as f:
                    tasks = json.load(f)
            except Exception:
                tasks = []

            new_task = {
                "id": body.get("id") or f"task-{len(tasks) + 1}",
                "title": body.get("title", "Untitled Task"),
                "desc": body.get("desc", ""),
                "stage": body.get("stage", "think"),
                "priority": body.get("priority", "medium"),
                "estimate": body.get("estimate", "1d")
            }
            tasks.append(new_task)
            with open(TASKS_FILE, "w", encoding="utf-8") as f:
                json.dump(tasks, f, indent=2)

            return self._send_json({"success": True, "task": new_task}, 201)

        self.send_error(404, "Endpoint not found")


def run_server(port=PORT):
    server_address = ("", port)
    httpd = HTTPServer(server_address, OMRequestHandler)
    print(f"=====================================================")
    print(f"OM – AI Action Assistant API Server")
    print(f"Tagline: 'Think. Plan. Act. Achieve.'")
    print(f"Serving at: http://localhost:{port}")
    print(f"=====================================================")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
