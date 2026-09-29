# OM AI Assistant 🌐⚡

<div align="center">

```
   ██████╗ ███╗   ███╗
  ██╔═══██╗████╗ ████║
  ██║   ██║██╔████╔██║
  ██║   ██║██║╚██╔╝██║
  ╚██████╔╝██║ ╚═╝ ██║
   ╚═════╝ ╚═╝     ╚═╝
```

### **Think. Talk. See. Act. Achieve.**

*A next-generation, production-ready multimodal personal AI assistant web application.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-emerald)]()
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)]()

<br/>

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FabhishekCode7266%2FOM-AI-Action-Assistant)

</div>

---

## 🌟 Overview

**OM AI Assistant** is a real personal AI assistant built from the ground up with a modern component-based web architecture. Unlike standard chat interfaces, OM connects **conversational speech, real-time camera vision, desktop screen sharing, data analytics, sandboxed code execution, and persistent notebook workflows** into a single cohesive experience.

Designed to operate seamlessly across **Desktop (Windows, macOS, Linux), Tablets, and Mobile (Android, iOS)**.

---

## ✨ Core Highlights & Capabilities

### 1. 🎙️ Dedicated Conversational Voice Mode
- **Low-Latency Dialogue**: Built with Web Speech API and the Web Audio API.
- **Real-Time Spectrum Visualizer**: Animated canvas audio spectrum reflecting frequency waveforms.
- **Natural Barge-In Interruption**: Speak or click interrupt to immediately cancel assistant speech synthesis and resume listening.
- **Finite State Machine**: Strict lifecycle management: `IDLE` → `LISTENING` → `PROCESSING` → `SPEAKING` → `INTERRUPTED` → `ERROR`.
- **Speech Synthesis Controls**: Select system voices, speech rate (0.7x – 1.5x), pitch, and volume.

### 2. 📷 Real-Time Camera Vision
- Stream live camera input using `navigator.mediaDevices.getUserMedia`.
- One-click front and rear camera toggling on mobile devices.
- **"Snap & Ask OM"**: Instantly captures video frames and streams them to multimodal vision models (Google Gemini, OpenAI GPT-4o, Claude 3.5 Sonnet).
- **Privacy-First**: No background camera streaming; obvious active badges and stop controls.

### 3. 🖥️ Screen Sharing & Guided Workflow
- Capture full desktop displays, application windows, or browser tabs using the browser Screen Capture API.
- Pulsating active share indicator with snapshot analysis ("Help me debug this error", "Analyze this chart", "What button should I click?").

### 4. 🧠 Action System: THINK → PLAN → ACT → ACHIEVE
- Formulates multi-step reasoning steps displayed via a clean collapsible progress tracker.
- Hides raw internal chain-of-thought while presenting clear, user-facing milestones.

### 5. 🎭 8 Specialized AI Modes
| Mode | Focus | Key Functionality |
| :--- | :--- | :--- |
| **General** | Everyday reasoning | Brainstorming, drafting, answering, open-ended tasks |
| **Coding** | Software engineering | Full-stack generation, refactoring, tests, explanations |
| **Data Analyst**| Tabular data | Statistical profiles, cleaning, trends, business insights |
| **Research** | Evidence-based work | Synthesizing papers, live web search, source citations |
| **Writing** | Master copy | Executive summaries, resumes, articles, emails |
| **Study** | Interactive tutor | Socratic method, step-by-step tutoring, quizzes |
| **Career** | Career strategy | Resume tailoring, behavioral & technical mock interviews |
| **Project Builder**| System architecture | Requirements, tech stacks, folder trees, milestones |

### 6. 🛠️ Dedicated Productive Workspaces
- **Chat Assistant**: Conversational hub with Markdown formatting, code copy, and regeneration.
- **Isolated Code Sandbox**: Code editor with split preview and a sandboxed `<iframe>` for live HTML/CSS/JavaScript and Tailwind.
- **Data Analyst Workspace**: Upload CSV/TSV/JSON files to calculate row counts, missing values, min/max/mean metrics, and render interactive SVG charts (Bar & Line).
- **Notebook & Scratchpad**: Rich Markdown notes with tagging, search, and "Turn Note into Tasks" action.
- **Image Generation Studio**: DALL-E 3 & Replicate Flux synthesis with aspect ratio selectors.
- **Video Generation Studio**: Provider abstraction with configuration checking.
- **Permissions & Privacy Center**: Real-time permission status check for Microphone, Camera, Screen Sharing, and Notifications.

---

## 🏛️ System Architecture

```
om-ai-assistant/
├── public/                 # Static assets, PWA manifest.json, vector icon.svg
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── api/            # Server endpoints (chat, search, image, video, providers)
│   │   ├── layout.tsx      # Root layout, PWA viewport, global modals
│   │   └── page.tsx        # Responsive workspace layout
│   ├── components/         # Reusable UI components
│   │   ├── chat/           # ChatArea, InputBar, MessageItem, CodeBlock, ActionTracker
│   │   ├── layout/         # Header, Sidebar
│   │   └── common/         # ToastContainer
│   ├── config/             # AI Mode definitions and system prompts
│   ├── features/           # Specialized feature modules
│   │   ├── voice/          # Dedicated Voice Mode overlay & audio visualizer
│   │   ├── camera/         # Live camera stream and snapshot capture
│   │   ├── screen-share/   # Screen capture banner and analyzer
│   │   ├── coding/         # Live Code Workspace and sandboxed preview
│   │   ├── data/           # Data Analyst CSV engine & SVG charts
│   │   ├── notebook/       # Rich Markdown notebook
│   │   ├── image-generation/
│   │   ├── video-generation/
│   │   ├── permissions/    # Permissions Center
│   │   ├── settings/       # Settings & provider key management
│   │   └── help/           # Quickstart manual & shortcuts
│   ├── services/           # Decoupled service layer
│   │   ├── ai/             # Provider manager and stream adapters
│   │   ├── files/          # File parsing (CSV, JSON, Code, Text)
│   │   ├── image/          # Image generation abstraction
│   │   ├── search/         # Web search provider abstraction
│   │   ├── video/          # Video generation abstraction
│   │   ├── vision/         # Canvas frame capture
│   │   └── voice/          # Web Speech API and AudioAnalyser
│   ├── stores/             # Zustand state management with persistence
│   ├── styles/             # Tailwind CSS & design tokens
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Helper utilities
└── tests/                  # Automated test suites
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **NPM** or **PNPM** or **Yarn**

### 1. Clone or Open the Repository
```bash
cd om-ai-assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and add your preferred provider API keys:
```env
# Recommended for Fast Multimodal Intelligence
GEMINI_API_KEY="your-gemini-key"

# Or OpenAI
OPENAI_API_KEY="your-openai-key"

# Optional Web Search
TAVILY_API_KEY="your-tavily-key"
```
*(Note: You can also enter API keys directly inside the in-app **Settings** panel, where they will be saved securely to your browser's local storage).*

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing

Execute the automated test suite:
```bash
npm test
```

Build for production:
```bash
npm run build
```

---

## 🔒 Security & Privacy Guarantees

1. **No Silent Surveillance**: Microphones, cameras, and display capture can only be started via explicit user clicks.
2. **Zero Plaintext Key Leakage**: Server API routes protect backend tokens from being inspected in the client bundle.
3. **No Fake Responses**: When a provider is unconfigured, OM displays an informative configuration notice rather than generating artificial data.
4. **Local Data Persistence**: Chat histories, notes, and local settings are stored client-side and can be wiped or exported via **Settings → Data Management** at any time.

---

## 🚢 Deployment (Vercel & Node)

The application is fully compatible with **Vercel**, **Docker**, or any standard Node server:
```bash
# Production Build
npm run build

# Start Production Server
npm start
```

---

## 📄 License

MIT License. Built for **OM AI Assistant**.
*Think. Talk. See. Act. Achieve.*
