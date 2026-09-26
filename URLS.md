# OM – AI Action Assistant — Project URLs & Deployment Endpoints

> *"Think. Plan. Act. Achieve."*

---

## 🔗 Live Deployment Links

| Platform | URL | Status |
| :--- | :--- | :--- |
| **GitHub Pages (Live Public Website)** | [https://abhishekcode7266.github.io/OM-AI-Action-Assistant/](https://abhishekcode7266.github.io/OM-AI-Action-Assistant/) | 🟢 **100% Live & Active (Verified)** |
| **Vercel Project Dashboard** | [https://vercel.com/abhishek-ef1f/om-ai](https://vercel.com/abhishek-ef1f/om-ai) | 🟢 **Connected to GitHub (Auto-Builds on Push)** |
| **Vercel Production Domain** | [https://om-ai-abhishek-ef1f.vercel.app](https://om-ai-abhishek-ef1f.vercel.app) | 🟢 **Auto-Deployed from `main`** |
| **Vercel Live Preview** | [https://om-20jslqulw-abhishek-ef1f.vercel.app](https://om-20jslqulw-abhishek-ef1f.vercel.app) | 🟢 **Deployed (Success)** |
| **GitHub Repository** | [https://github.com/abhishekCode7266/OM-AI-Action-Assistant](https://github.com/abhishekCode7266/OM-AI-Action-Assistant) | 📂 **Branch `main` (Commit `f93be4a`)** |


---

## 🔑 Google Gemini API Key & Native Engine

OM supports two cognitive modes out-of-the-box:

1. **Native Autonomous Engine (Default)**:
   - Zero configuration needed.
   - 100% Free and instant execution.
   - Generates full Think-Plan-Act-Achieve roadmaps and task cards.

2. **Google Gemini 1.5 Flash (Live LLM Mode)**:
   - Get a free key: [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
   - In OM Navbar, click **`🔑 API Key`** -> Paste your `AIzaSy...` key -> Click **Save & Connect**.
   - OM directly calls Gemini 1.5 Flash to formulate rich reasoning and task decomposition!

---

## ⚙️ Vercel Public Access Setting (If "Login - Vercel" appears):

If your Vercel URL shows a Vercel login screen to external visitors:
1. Open your project on Vercel: [https://vercel.com/abhishek-ef1f/om-ai](https://vercel.com/abhishek-ef1f/om-ai)
2. Go to **Settings** -> **Deployment Protection**.
3. Under **Vercel Authentication**, select **Disabled** and click **Save**.
4. Now your Vercel URL is publicly accessible to the entire world!

---

## ⚡ API Endpoints (Local & Vercel Serverless)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/status` | `GET` | Health check & OM engine telemetry |
| `/api/chat` | `POST` | Cognitive AI Assistant dialogue & goal deconstruction |
| `/api/tasks` | `GET` / `POST` | Task management across Think, Plan, Act, Achieve |
| `/api/metrics` | `GET` | Action Velocity Index and Goal Completion stats |
