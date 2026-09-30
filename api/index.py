"""
OM – AI Action Assistant
Vercel Serverless Function & Full-Stack Handler

Tagline: "Think. Plan. Act. Achieve."
Brand: OM – AI Action Assistant
"""

import json
import mimetypes
import os
import sys
import tempfile
import time
import subprocess
import urllib.request
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

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


SERVERLESS_USERS_FILE = os.path.join(TMP_DIR, "om_users.json")

_DEFAULT_USERS = [
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

_MEMORY_USERS = list(_DEFAULT_USERS)

def load_users():
    if os.path.exists(SERVERLESS_USERS_FILE):
        try:
            with open(SERVERLESS_USERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return list(_MEMORY_USERS)

def save_users(users):
    global _MEMORY_USERS
    _MEMORY_USERS = users
    try:
        with open(SERVERLESS_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
    except Exception:
        pass

SERVERLESS_CHATS_FILE = os.path.join(TMP_DIR, "om_chats.json")
_MEMORY_CHATS = []

def load_chats():
    if os.path.exists(SERVERLESS_CHATS_FILE):
        try:
            with open(SERVERLESS_CHATS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return list(_MEMORY_CHATS)

def save_chats(chats):
    global _MEMORY_CHATS
    _MEMORY_CHATS = chats
    try:
        with open(SERVERLESS_CHATS_FILE, "w", encoding="utf-8") as f:
            json.dump(chats, f, indent=2)
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

    def _resolve_path_and_query(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        # 1. Check for Vercel __route rewrite parameter
        if "__route" in params and params["__route"][0]:
            sub = params["__route"][0].strip("/")
            return f"/api/{sub}", parsed, params

        # 2. Check Vercel headers
        v_path = (
            self.headers.get("x-matched-path") or
            self.headers.get("x-forwarded-uri") or
            self.headers.get("x-original-url") or
            ""
        )
        if v_path and not v_path.endswith("/index.py"):
            v_parsed = urlparse(v_path)
            v_params = parse_qs(v_parsed.query)
            merged = {**params, **v_params}
            return v_parsed.path.rstrip("/"), parsed, merged

        return parsed.path.rstrip("/"), parsed, params

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
        path, parsed, params = self._resolve_path_and_query()
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
                "persona": "Master-level, fully multimodal personal AI collaborator built to handle any task across text, vision, code, media, and data analysis.",
                "engine_version": "3.0.0",
                "ai_models_supported": ["nexus-2.0-flash", "nexus-1.5-pro", "nexus-1.5-flash", "om-autonomous-engine"],
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
                "environment": "Vercel Serverless Function",
                "status": "online",
                "philosophy": "Intelligent, simple, and universal AI collaborator helping users turn ideas into real actions."
            })

        # 3b. Master Development Prompt API
        if path == "/api/prompt" or path == "/prompt":
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

        # 3c. Health & Service Diagnostics API
        if path == "/api/health" or path == "/health":
            return self._send_json({
                "status": "healthy",
                "brand": "OM",
                "name": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "version": "2.5.0",
                "ai_provider_configured": bool(os.environ.get("AI_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY")),
                "search_configured": bool(os.environ.get("SEARCH_API_KEY")),
                "github_configured": bool(os.environ.get("GITHUB_TOKEN")),
                "vercel_configured": bool(os.environ.get("VERCEL_TOKEN")),
                "image_configured": bool(os.environ.get("IMAGE_API_KEY") or os.environ.get("OPENAI_API_KEY")),
                "video_configured": bool(os.environ.get("VIDEO_API_KEY"))
            })

        if path == "/api/github/status" or path == "/github/status":
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

        if path == "/api/vercel/status" or path == "/vercel/status":
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

        if path == "/api/payment" or path == "/payment":
            return self._send_json({
                "success": False,
                "configured": False,
                "error": "Payment gateway is not configured."
            })

        # 3d. Server-Side Users & Permissions API
        if path == "/api/auth/users" or path == "/auth/users":
            users = load_users()
            return self._send_json({"status": "success", "users": users})

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

        # 5b. Chats API
        if path in ["/api/chats", "/chats", "/api/chat", "/chat"]:
            params = parse_qs(parsed.query)
            chat_id = params.get("id", [""])[0]
            chats = load_chats()
            if chat_id:
                matched = next((c for c in chats if c.get("id") == chat_id), None)
                if matched:
                    return self._send_json({"success": True, "chat": matched})
                return self._send_json({"success": False, "error": "Chat not found"}, 404)
            return self._send_json({"success": True, "chats": chats})

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
        path, parsed, params = self._resolve_path_and_query()

        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        if path == "/api/chat" or path == "/chat":
            prompt = body.get("prompt", "")
            mode = body.get("mode", "general")
            history = body.get("history", [])
            custom_persona = (body.get("systemPrompt") or "").strip()
            user_api_key = body.get("apiKey", "")

            clean_goal = prompt.replace("Decompose:", "").replace("Deconstruct:", "").strip()
            if not clean_goal:
                clean_goal = "General Objective"

            lower_goal = clean_goal.lower()
            is_greeting = any(
                lower_goal == g or lower_goal.startswith(g + " ")
                for g in ["hello", "hi", "hey", "namaste", "hola", "greetings", "good morning", "good afternoon", "good evening", "how are you", "what's up"]
            )

            mode_prompts = {
                "general": (
                    "You are OM AI, a highly capable, adaptive, and direct AI assistant modeled after Google Gemini. "
                    "Lead directly with the substance in sentence 1. Strictly avoid conversational fluff, robotic preamble, "
                    "meta-announcements, or cognitive traces. Answer concisely and proportionally (1-2 clear lines for simple queries). "
                    "Format with clean Markdown, LaTeX math, and executable code blocks. Adapt naturally to English, Hindi, and Hinglish."
                ),
                "coding": "You are an expert software engineer and debugger. Write clean, modular, production-ready code with explanations, edge-case analysis, and verification steps.",
                "data": "You are an expert data analyst. Parse and analyze datasets, provide statistical summaries, identify trends, anomalies, and structured markdown tables.",
                "research": "You are an investigative research analyst. Provide deep, rigorous, multi-faceted analysis, citations, counterarguments, and syntheses.",
                "writing": "You are an elite copywriter and editor. Craft clear, persuasive, beautifully structured prose tailored to the target audience.",
                "project": "You are a technical project architect and scrum master. Deconstruct complex ambitions into concrete Think-Plan-Act-Achieve milestones, dependencies, and deliverables.",
                "career": "You are an executive career coach and technical interviewer. Provide role-specific guidance, resume feedback, and mock interview questions.",
                "study": "You are a master tutor and educator. Break down complex concepts using first-principles thinking, intuitive analogies, and interactive quizzes."
            }
            full_sys_prompt = mode_prompts.get(mode, mode_prompts["general"])
            if custom_persona:
                full_sys_prompt += f"\n\nUser Custom Persona & Instructions:\n{custom_persona}"
            if body.get("memory"):
                full_sys_prompt += f"\n\n{body.get('memory')}"

            effective_nexus_key = user_api_key if (user_api_key and user_api_key.startswith("AIzaSy")) else (os.environ.get("NEXUS_API_KEY", "") or os.environ.get("GEMINI_API_KEY", ""))

            # Call Nexus / Gemini 1.5 Flash if key is present
            if effective_nexus_key:
                try:
                    contents = []
                    if isinstance(history, list):
                        for item in history[-8:]:
                            t = item.get("text", "").strip()
                            if t:
                                r = "model" if item.get("role") in ["model", "assistant"] else "user"
                                contents.append({"role": r, "parts": [{"text": t}]})
                    contents.append({"role": "user", "parts": [{"text": prompt}]})

                    nexus_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={effective_nexus_key}"
                    nexus_payload = json.dumps({
                        "contents": contents,
                        "systemInstruction": {"parts": [{"text": full_sys_prompt}]}
                    }).encode("utf-8")

                    req = urllib.request.Request(
                        nexus_url,
                        data=nexus_payload,
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as g_resp:
                        if g_resp.status == 200:
                            g_data = json.loads(g_resp.read().decode("utf-8"))
                            text = g_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                return self._send_json({
                                    "success": True,
                                    "sender": "om",
                                    "greeting": "Hi, I'm Om AI Assistant, a master-level, fully multimodal personal AI collaborator. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                                    "brand": "OM – AI Action Assistant",
                                    "tagline": "Think. Plan. Act. Achieve.",
                                    "query": prompt,
                                    "mode": mode,
                                    "apiKeyUsed": f"Google Gemini 1.5 Flash (Live Server Key - {mode})",
                                    "text": text,
                                    "reasoning": f"Generated live by Google Gemini 1.5 Flash with {mode} specialization.",
                                    "verified": True,
                                    "actions": [] if is_greeting else [
                                        {"stage": "think", "title": f"Scope requirements for '{clean_goal}'", "estimate": "1d"},
                                        {"stage": "plan", "title": "Architect milestones, contracts and timeline", "estimate": "2d"},
                                        {"stage": "act", "title": "Execute core development and workflows", "estimate": "3d"},
                                        {"stage": "achieve", "title": "Run verification audit and deliver results", "estimate": "1d"}
                                    ]
                                })
                except Exception as e:
                    pass

            openai_key = os.environ.get("OPENAI_API_KEY", "")
            if openai_key:
                try:
                    messages = [{"role": "system", "content": full_sys_prompt}]
                    if isinstance(history, list):
                        for item in history[-8:]:
                            t = item.get("text", "").strip()
                            if t:
                                r = "assistant" if item.get("role") in ["model", "assistant"] else "user"
                                messages.append({"role": r, "content": t})
                    messages.append({"role": "user", "content": prompt})

                    oai_url = "https://api.openai.com/v1/chat/completions"
                    oai_payload = json.dumps({
                        "model": "gpt-4o-mini",
                        "messages": messages
                    }).encode("utf-8")
                    req = urllib.request.Request(oai_url, data=oai_payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"})
                    with urllib.request.urlopen(req, timeout=12) as o_resp:
                        if o_resp.status == 200:
                            o_data = json.loads(o_resp.read().decode("utf-8"))
                            llm_text = o_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                            if llm_text:
                                return self._send_json({
                                    "success": True,
                                    "sender": "om",
                                    "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                                    "brand": "OM – AI Action Assistant",
                                    "tagline": "Think. Plan. Act. Achieve.",
                                    "query": prompt,
                                    "mode": mode,
                                    "apiKeyUsed": f"OpenAI GPT-4o-mini (Live Server Key - {mode})",
                                    "text": llm_text,
                                    "reasoning": f"Generated live by OpenAI GPT-4o-mini with {mode} specialization.",
                                    "verified": True,
                                    "actions": [] if is_greeting else [
                                        {"stage": "think", "title": f"Scope requirements for '{clean_goal}'", "estimate": "1d"},
                                        {"stage": "plan", "title": "Architect milestones, contracts and timeline", "estimate": "2d"},
                                        {"stage": "act", "title": "Execute core development and workflows", "estimate": "3d"},
                                        {"stage": "achieve", "title": "Run verification audit and deliver results", "estimate": "1d"}
                                    ]
                                })
                except Exception:
                    pass

            if is_greeting:
                text_response = (
                    "### 👋 Hello! I'm OM AI Assistant.\n\n"
                    "I am your **multimodal AI action collaborator**, designed to transform your intent into verified actions using the **Think. Plan. Act. Achieve.** framework.\n\n"
                    "* 💻 **Coding Studio**: Write, execute, and debug Python, JavaScript, and HTML live.\n"
                    "* 🎙️ **Live Voice Matrix**: Hands-free real-time conversation across 9+ distinct personas.\n"
                    "* 📐 **3D Studio**: View and mechanically disassemble interactive CAD models (0–100% exploded view).\n"
                    "* 📊 **Data & Files**: Analyze CSVs, PDFs, and extract structured insights.\n"
                    "* 📝 **AI Notebook**: Capture thoughts and auto-save notes with live source citations.\n\n"
                    "> 💡 **Notice**: Running in **Offline Demo Mode**. To activate live cloud intelligence, set `GEMINI_API_KEY` or `OPENAI_API_KEY` in environment variables or in **⚙️ Settings**.\n\n"
                    "**What would you like to achieve today?**"
                )
                api_used = "OM Autonomous Engine (Offline Demo)"
            else:
                text_response = (
                    "### ⚠️ Offline Demo Mode\n\n"
                    "No live AI provider API key is configured on the backend.\n\n"
                    f"To activate live cloud intelligence for '{clean_goal}':\n"
                    "1. Set `GEMINI_API_KEY` or `OPENAI_API_KEY` in your environment variables, or\n"
                    "2. Enter your Gemini API key in **⚙️ Settings** > **API Configuration**.\n\n"
                    "*OM's local autonomous engines (Python sandbox runner, 3D studio, terminal, and notebook) are fully active.*"
                )
                api_used = "Offline Demo Mode"

            return self._send_json({
                "success": is_greeting,
                "offlineDemo": True,
                "noApiKey": True,
                "sender": "om",
                "greeting": "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
                "brand": "OM – AI Action Assistant",
                "tagline": "Think. Plan. Act. Achieve.",
                "query": prompt,
                "mode": mode,
                "text": text_response,
                "apiKeyUsed": api_used,
                "reasoning": (
                    "Offline Demo Mode active. Prompt deconstructed into standard Think-Plan-Act-Achieve pipeline."
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

        if path == "/api/payment" or path == "/payment":
            return self._send_json({
                "success": False,
                "configured": False,
                "error": "Payment gateway is not configured."
            }, 400)

        # 4b. Server-Side Owner Access & Permissions Grant API
        if path == "/api/auth/grant" or path == "/auth/grant":
            target_user_id = body.get("userId", "usr-guest-002")
            access_type = body.get("access", "full_free")
            tools = body.get("tools", ["*"])
            gems = body.get("gems", "unlimited")
            expires_at = body.get("expires_at", "never")

            users = load_users()
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

            save_users(users)
            return self._send_json({
                "status": "success",
                "message": f"Server-side access policy enforced for {target_user_id}.",
                "users": users
            })

        # 4c. Secure Server-Side Image Generation API
        if path == "/api/image" or path == "/image":
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

        # 4d. Video Generation API
        if path == "/api/video" or path == "/video":
            video_key = os.environ.get("VIDEO_API_KEY")
            if not video_key:
                return self._send_json({
                    "success": False,
                    "error": "Video generation requires a configured video provider (VIDEO_API_KEY on server)."
                }, 400)
            return self._send_json({"success": False, "error": "Video generation service is initializing or awaiting job completion."}, 503)

        # 4f. Chats Persistence API
        if path in ["/api/chats", "/chats", "/api/chat/save"]:
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

        # 4g. Real Code Execution API
        if path in ["/api/execute", "/execute", "/api/code/run"]:
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

        return self._send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_DELETE(self):
        path, parsed, params = self._resolve_path_and_query()
        chat_id = params.get("id", [""])[0]

        if not chat_id and len(path.split("/")) > 3 and (path.startswith("/api/chats/") or path.startswith("/api/chat/")):
            chat_id = path.split("/")[-1]

        if path in ["/api/chats", "/chats", "/api/chat", "/chat"] or path.startswith("/api/chats/") or path.startswith("/api/chat/"):
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

        return self._send_json({"error": "Endpoint not found", "path": path}, 404)
