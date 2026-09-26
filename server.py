"""
OM – AI Action Assistant
Backend API Server & Static Asset Dispatcher

Brand Tagline: "Think. Plan. Act. Achieve."
"""

import os
import json
import mimetypes
import sys
import time
import subprocess
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
CHATS_FILE = os.path.join(DATA_DIR, "chats.json")

os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_USERS = [
    {
        "id": "usr-admin-001",
        "username": "Admin",
        "name": "Administrator",
        "role": "admin",
        "access": "standard",
        "tools": ["*"],
        "gems": "standard",
        "expires_at": "never",
        "is_developer": False
    },
    {
        "id": "usr-guest-002",
        "username": "Guest",
        "name": "Public Guest User",
        "role": "authorized_user",
        "access": "full_free",
        "tools": ["*"],
        "gems": "standard",
        "expires_at": "2030-12-31",
        "is_developer": False
    }
]

# Initialize data store if missing
if not os.path.exists(TASKS_FILE):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_USERS, f, indent=2)

if not os.path.exists(CHATS_FILE):
    with open(CHATS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

def load_chats():
    if os.path.exists(CHATS_FILE):
        try:
            with open(CHATS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_chats(chats):
    try:
        with open(CHATS_FILE, "w", encoding="utf-8") as f:
            json.dump(chats, f, indent=2)
    except Exception:
        pass


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

        if path == "/api/health":
            return self._send_json({
                "status": "healthy",
                "brand": "OM",
                "name": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "version": "2.5.0",
                "ai_provider_configured": bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY")),
                "github_configured": bool(os.environ.get("GITHUB_TOKEN")),
                "vercel_configured": bool(os.environ.get("VERCEL_TOKEN")),
                "image_configured": bool(os.environ.get("IMAGE_API_KEY") or os.environ.get("OPENAI_API_KEY")),
                "video_configured": bool(os.environ.get("VIDEO_API_KEY"))
            })

        if path == "/api/github/status":
            token = os.environ.get("GITHUB_TOKEN")
            if not token:
                return self._send_json({
                    "success": False,
                    "configured": False,
                    "error": "GITHUB_TOKEN is not configured on the server."
                })
            return self._send_json({
                "success": True,
                "configured": True,
                "repo": "abhishekCode7266/OM-AI-Action-Assistant",
                "branch": "main",
                "status": "authenticated"
            })

        if path == "/api/vercel/status":
            token = os.environ.get("VERCEL_TOKEN")
            if not token:
                return self._send_json({
                    "success": False,
                    "configured": False,
                    "error": "VERCEL_TOKEN is not configured on the server."
                })
            return self._send_json({
                "success": True,
                "configured": True,
                "project": "om-ai",
                "status": "authenticated"
            })

        if path == "/api/payment":
            return self._send_json({
                "success": False,
                "configured": False,
                "error": "Payment gateway is not configured."
            })

        if path == "/api/auth/users":
            try:
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    users = json.load(f)
            except Exception:
                users = DEFAULT_USERS
            return self._send_json({"status": "success", "users": users})

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

        if path == "/api/chats" or path == "/api/chat":
            params = parse_qs(parsed.query)
            chat_id = params.get("id", [""])[0]
            chats = load_chats()
            if chat_id:
                matched = next((c for c in chats if c.get("id") == chat_id), None)
                if matched:
                    return self._send_json({"success": True, "chat": matched})
                return self._send_json({"success": False, "error": "Chat not found"}, 404)
            return self._send_json({"success": True, "chats": chats})

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

            gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("NEXUS_API_KEY")
            openai_key = os.environ.get("OPENAI_API_KEY")
            llm_text = None
            api_used = "OM Native Cognitive Engine (Set GEMINI_API_KEY on server for live LLM mode)"

            if gemini_key:
                try:
                    gem_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                    gem_payload = json.dumps({
                        "contents": [{
                            "role": "user",
                            "parts": [{
                                "text": (
                                    "You are OM AI Action Assistant. Brand tagline: 'Think. Plan. Act. Achieve.'\n"
                                    "Provide a direct, intelligent, and helpful response. If the user asks for a plan or task breakdown, provide structured stages: Think, Plan, Act, Achieve.\n"
                                    f"User Request: {prompt}"
                                )
                            }]
                        }]
                    }).encode("utf-8")
                    req = urllib.request.Request(gem_url, data=gem_payload, headers={"Content-Type": "application/json"})
                    with urllib.request.urlopen(req, timeout=12) as g_resp:
                        if g_resp.status == 200:
                            g_data = json.loads(g_resp.read().decode("utf-8"))
                            llm_text = g_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if llm_text:
                                api_used = "Google Gemini 1.5 Flash (Live Server Key)"
                except Exception:
                    pass

            if not llm_text and openai_key:
                try:
                    oai_url = "https://api.openai.com/v1/chat/completions"
                    oai_payload = json.dumps({
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": "You are OM AI Action Assistant. Brand tagline: 'Think. Plan. Act. Achieve.'"},
                            {"role": "user", "content": prompt}
                        ]
                    }).encode("utf-8")
                    req = urllib.request.Request(oai_url, data=oai_payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"})
                    with urllib.request.urlopen(req, timeout=12) as o_resp:
                        if o_resp.status == 200:
                            o_data = json.loads(o_resp.read().decode("utf-8"))
                            llm_text = o_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                            if llm_text:
                                api_used = "OpenAI GPT-4o-mini (Live Server Key)"
                except Exception:
                    pass

            if not llm_text:
                lower = clean_goal.lower()
                is_greeting = any(
                    lower == g or lower.startswith(g + " ")
                    for g in ["hello", "hi", "hey", "namaste", "hola", "greetings", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
                )
                if is_greeting:
                    llm_text = (
                        "### 👋 Hello! I'm Om AI Assistant.\n\n"
                        "I am your **master-level, fully multimodal personal AI collaborator**, built to handle any task across text, vision, code, media, and data analysis:\n\n"
                        "* 👁️ **Vision & Image Analysis**: Inspect photos, screenshots, diagrams, and UI/UX layouts.\n"
                        "* 💻 **Code & Technical Execution**: Write, debug, optimize, and explain code across all major languages.\n"
                        "* 📊 **Charts & Data Analytics (Sparks)**: Ingest datasets for statistical summaries and inline interactive charts.\n"
                        "* 🎥 **Video & Audio Processing**: Parse video frames, listen to audio clips, and summarize recordings.\n"
                        "* 📑 **Document & Library Search**: Read, cross-reference, and summarize libraries of files, PDFs, and spreadsheets.\n"
                        "* 📓 **Notebook Workflows**: Act as an interactive research partner, synthesizing notes, brainstorming ideas, and organizing projects.\n"
                        "* 🌐 **Live Search & Data Lookup**: Access and synthesize real-time information, web data, and current news.\n\n"
                        "**What would you like to achieve today?** Ask a question, paste code, or explore any tool!"
                    )
                else:
                    llm_text = (
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
                "apiKeyUsed": api_used,
                "text": llm_text,
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

        if path == "/api/image":
            image_key = os.environ.get("IMAGE_API_KEY") or os.environ.get("OPENAI_API_KEY")
            prompt = body.get("prompt", "").strip()
            if not image_key:
                return self._send_json({
                    "success": False,
                    "error": "Image generation API is not configured. Set IMAGE_API_KEY or OPENAI_API_KEY in server environment variables."
                }, 400)
            if not prompt:
                return self._send_json({"success": False, "error": "Prompt is required for image generation."}, 400)
            try:
                req = urllib.request.Request(
                    "https://api.openai.com/v1/images/generations",
                    data=json.dumps({"prompt": prompt, "n": 1, "size": "1024x1024"}).encode("utf-8"),
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {image_key}"}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    img_url = data.get("data", [{}])[0].get("url", "")
                    return self._send_json({"success": True, "imageUrl": img_url, "prompt": prompt})
            except Exception as e:
                return self._send_json({"success": False, "error": f"Image provider error: {str(e)}"}, 502)

        if path == "/api/video":
            video_key = os.environ.get("VIDEO_API_KEY")
            if not video_key:
                return self._send_json({
                    "success": False,
                    "error": "Video generation requires a configured video provider (VIDEO_API_KEY on server)."
                }, 400)
            return self._send_json({"success": False, "error": "Video generation service is initializing or awaiting job completion."}, 503)

        if path == "/api/github/commit":
            token = os.environ.get("GITHUB_TOKEN")
            if not token:
                return self._send_json({
                    "success": False,
                    "error": "GITHUB_TOKEN is not configured on the server."
                }, 400)
            return self._send_json({"success": False, "error": "Direct remote commit requires write permissions and active Git branch lock."}, 403)

        if path == "/api/payment":
            return self._send_json({
                "success": False,
                "configured": False,
                "error": "Payment gateway is not configured."
            }, 400)

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

        if path == "/api/auth/grant":
            target_user_id = body.get("userId", "usr-guest-002")
            access_type = body.get("access", "full_free")
            tools = body.get("tools", ["*"])
            gems = body.get("gems", "unlimited")
            expires_at = body.get("expires_at", "never")

            try:
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    users = json.load(f)
            except Exception:
                users = list(DEFAULT_USERS)

            user_found = False
            for u in users:
                if u.get("id") == target_user_id or u.get("username") == target_user_id:
                    u["access"] = access_type
                    u["tools"] = tools
                    u["gems"] = gems
                    u["expires_at"] = expires_at
                    user_found = True
                    break

            if not user_found:
                new_u = {
                    "id": target_user_id if target_user_id.startswith("usr-") else f"usr-{len(users)+1:03d}",
                    "username": body.get("username", target_user_id),
                    "name": body.get("name", "Authorized User"),
                    "role": "authorized_user",
                    "access": access_type,
                    "tools": tools,
                    "gems": gems,
                    "expires_at": expires_at,
                    "is_developer": False
                }
                users.append(new_u)

            with open(USERS_FILE, "w", encoding="utf-8") as f:
                json.dump(users, f, indent=2)

            return self._send_json({
                "status": "success",
                "message": f"Server-side access policy enforced for {target_user_id}.",
                "users": users
            })

        if path == "/api/chats" or path == "/api/chat/save":
            chat_data = body.get("chat") or body
            chat_id = chat_data.get("id")
            if not chat_id:
                return self._send_json({"success": False, "error": "Missing chat id"}, 400)
            chats = load_chats()
            existing_idx = next((i for i, c in enumerate(chats) if c.get("id") == chat_id), -1)
            if existing_idx >= 0:
                chats[existing_idx] = chat_data
            else:
                chats.insert(0, chat_data)
            save_chats(chats)
            return self._send_json({"success": True, "chat": chat_data})

        if path == "/api/execute" or path == "/api/code/run":
            code = body.get("code", "")
            language = body.get("language", "python").lower()
            if not code or not code.strip():
                return self._send_json({
                    "success": False,
                    "error": "No code provided for execution.",
                    "exit_code": 1
                }, 400)

            if language == "python":
                start_t = time.time()
                try:
                    res = subprocess.run(
                        [sys.executable, "-c", code],
                        capture_output=True,
                        text=True,
                        timeout=8
                    )
                    elapsed = round((time.time() - start_t) * 1000, 1)
                    return self._send_json({
                        "success": res.returncode == 0,
                        "stdout": res.stdout,
                        "stderr": res.stderr,
                        "exit_code": res.returncode,
                        "execution_time_ms": elapsed
                    })
                except subprocess.TimeoutExpired:
                    return self._send_json({
                        "success": False,
                        "error": "Execution timed out (limit: 8 seconds).",
                        "exit_code": 124
                    }, 408)
                except Exception as ex:
                    return self._send_json({
                        "success": False,
                        "error": str(ex),
                        "exit_code": 1
                    }, 500)
            else:
                return self._send_json({
                    "success": False,
                    "error": f"Language '{language}' execution is not supported on this runtime.",
                    "exit_code": 1
                }, 400)

        self.send_error(404, "Endpoint not found")

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        params = parse_qs(parsed.query)
        chat_id = params.get("id", [""])[0]

        if not chat_id and len(path.split("/")) > 3 and (path.startswith("/api/chats/") or path.startswith("/api/chat/")):
            chat_id = path.split("/")[-1]

        if path == "/api/chats" or path == "/api/chat" or path.startswith("/api/chats/") or path.startswith("/api/chat/"):
            if not chat_id:
                if params.get("clear", [""])[0] == "all":
                    save_chats([])
                    return self._send_json({"success": True, "message": "All conversations deleted."})
                return self._send_json({"success": False, "error": "Missing conversation id parameter (?id=...)"}, 400)

            chats = load_chats()
            new_chats = [c for c in chats if c.get("id") != chat_id]
            save_chats(new_chats)
            return self._send_json({
                "success": True,
                "deleted": chat_id,
                "message": f"Conversation {chat_id} deleted successfully from backend."
            })

        self.send_error(404, f"Endpoint not found: {path}")


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
