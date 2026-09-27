function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://abhishekcode7266.github.io',
    'https://om-ai-eight.vercel.app',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000'
  ];
  if (allowed.includes(origin) || origin.endsWith('.github.io') || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://abhishekcode7266.github.io');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://abhishekcode7266.github.io');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const MODE_SYSTEM_PROMPTS = {
  general: "You are OM AI Assistant, a direct, concise, and helpful multimodal personal AI collaborator. Brand tagline: 'Think. Plan. Act. Achieve.'",
  coding: "You are an expert software engineer and debugger. Write clean, modular, production-ready code with explanations, edge-case analysis, and verification steps.",
  data: "You are an expert data analyst. Parse and analyze datasets, provide statistical summaries, identify trends, anomalies, and structured markdown tables.",
  research: "You are an investigative research analyst. Provide deep, rigorous, multi-faceted analysis, citations, counterarguments, and syntheses.",
  writing: "You are an elite copywriter and editor. Craft clear, persuasive, beautifully structured prose tailored to the target audience.",
  project: "You are a technical project architect and scrum master. Deconstruct complex ambitions into concrete Think-Plan-Act-Achieve milestones, dependencies, and deliverables.",
  career: "You are an executive career coach and technical interviewer. Provide role-specific guidance, resume feedback, and mock interview questions.",
  study: "You are a master tutor and educator. Break down complex concepts using first-principles thinking, intuitive analogies, and interactive quizzes."
};

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const rawPrompt = (body.prompt || '').trim();
  const mode = body.mode || 'general';
  const history = Array.isArray(body.history) ? body.history : [];
  const customPersona = (body.systemPrompt || '').trim();

  // Extract clean user query
  const userQuery = rawPrompt
    .split('\nUser Profile Preferences')[0]
    .split('\n--- USER ATTACHED')[0]
    .trim() || 'Hello';

  const lowerQuery = userQuery.toLowerCase().trim();
  const isGreeting = /^(hello|hi|hey|greetings|namaste|नमस्ते|hola|good\s*(morning|afternoon|evening)|kaise\s*ho|who\s*are\s*you|om)\b/i.test(lowerQuery);

  const cleanGoal = userQuery.replace(/^(decompose:|deconstruct:|plan:|launch:|build:|how to|i want to)\s*/i, '').trim() || 'Core Goal';
  const capGoal = cleanGoal.length > 50 ? cleanGoal.substring(0, 50) + '...' : (cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1));

  // Compose complete system prompt with mode specialization + user persona + memory
  let fullSystemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.general;
  if (customPersona) {
    fullSystemPrompt += `\n\nUser Custom Persona & Instructions:\n${customPersona}`;
  }
  if (body.memory) {
    fullSystemPrompt += `\n\n${body.memory}`;
  }

  const fullUserText = body.attachmentsContext ? `${userQuery}\n\n${body.attachmentsContext}` : userQuery;

  // 1. Check for Gemini Key (Server environment variable or client-supplied in settings)
  const effectiveGeminiKey = (body.apiKey && body.apiKey.startsWith('AIzaSy'))
    ? body.apiKey
    : (process.env.GEMINI_API_KEY || process.env.NEXUS_API_KEY);

  if (effectiveGeminiKey) {
    try {
      const contents = [];
      history.slice(-8).forEach(item => {
        if (item.text && item.text.trim()) {
          contents.push({
            role: (item.role === 'model' || item.role === 'assistant') ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      });
      contents.push({
        role: 'user',
        parts: [{ text: fullUserText }]
      });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`;
      const geminiResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: fullSystemPrompt }]
          }
        })
      });

      if (geminiResp.ok) {
        const geminiData = await geminiResp.json();
        const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          return res.status(200).json({
            success: true,
            sender: 'om',
            greeting: "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
            brand: "OM – AI Action Assistant",
            tagline: "Think. Plan. Act. Achieve.",
            query: userQuery,
            mode: mode,
            apiKeyUsed: 'Gemini 1.5 Flash (Live)',
            text: geminiText,
            reasoning: `Generated live by Google Gemini 1.5 Flash with ${mode} specialization.`,
            verified: true,
            actions: isGreeting ? [] : [
              { stage: 'think', title: `Analyze specifications for ${capGoal}`, estimate: '1d' },
              { stage: 'plan', title: `Structure architecture & milestones for ${capGoal}`, estimate: '2d' },
              { stage: 'act', title: `Execute core implementation sprint`, estimate: '3d' },
              { stage: 'achieve', title: `Run verification tests and verify delivery`, estimate: '1d' }
            ]
          });
        }
      }
    } catch (err) {
      console.warn("Gemini call failed:", err);
    }
  }

  // 2. Check for OpenAI Key (Server environment variable)
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const messages = [{ role: 'system', content: fullSystemPrompt }];
      history.slice(-8).forEach(item => {
        if (item.text && item.text.trim()) {
          messages.push({
            role: (item.role === 'model' || item.role === 'assistant') ? 'assistant' : 'user',
            content: item.text
          });
        }
      });
      messages.push({ role: 'user', content: fullUserText });

      const oaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages
        })
      });

      if (oaiResp.ok) {
        const oaiData = await oaiResp.json();
        const oaiText = oaiData.choices?.[0]?.message?.content;
        if (oaiText) {
          return res.status(200).json({
            success: true,
            sender: 'om',
            greeting: "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
            brand: "OM – AI Action Assistant",
            tagline: "Think. Plan. Act. Achieve.",
            query: userQuery,
            mode: mode,
            apiKeyUsed: 'OpenAI GPT-4o-mini (Live)',
            text: oaiText,
            reasoning: `Generated live by OpenAI GPT-4o-mini with ${mode} specialization.`,
            verified: true,
            actions: isGreeting ? [] : [
              { stage: 'think', title: `Scope requirements for ${capGoal}`, estimate: '1d' },
              { stage: 'plan', title: `Architect milestones for ${capGoal}`, estimate: '2d' },
              { stage: 'act', title: `Execute implementation`, estimate: '3d' },
              { stage: 'achieve', title: `Audit & deliver`, estimate: '1d' }
            ]
          });
        }
      }
    } catch (err) {
      console.warn("OpenAI call failed:", err);
    }
  }

  // 3. Autonomous Greeting Response when user says hello/greetings
  if (isGreeting) {
    return res.status(200).json({
      success: true,
      sender: 'om',
      greeting: "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
      brand: "OM – AI Action Assistant",
      tagline: "Think. Plan. Act. Achieve.",
      query: userQuery,
      mode: mode,
      apiKeyUsed: 'OM Autonomous Engine (Offline Demo)',
      text: `### 👋 Hello! I'm OM AI Assistant.

I am your **multimodal AI action collaborator**, designed to transform your intent into verified actions using the **Think. Plan. Act. Achieve.** framework.

Here is what we can do together:
* 💻 **Coding Studio**: Write, execute, and debug Python, JavaScript, and HTML live.
* 🎙️ **Live Voice Matrix**: Hands-free real-time conversation across 9+ distinct personas.
* 📐 **3D Studio**: View and mechanically disassemble interactive CAD models (0–100% exploded view).
* 📊 **Data & Files**: Analyze CSVs, PDFs, and extract structured insights.
* 📝 **AI Notebook**: Capture thoughts and auto-save notes with live source citations.

> 💡 **Notice**: To connect live cloud intelligence (Gemini 1.5/2.0 Flash or GPT-4o), configure \`GEMINI_API_KEY\` in your Vercel project environment variables, or enter your key in **⚙️ Settings** > **API Configuration**.

**What would you like to achieve today?** Ask a question, paste code, or give an action directive!`,
      reasoning: "Recognized greeting intent. Delivered capability overview and live setup instructions.",
      verified: true,
      actions: []
    });
  }

  // 4. Truthful response when no AI provider API key is configured for a specific query
  return res.status(200).json({
    success: false,
    offlineDemo: true,
    noApiKey: true,
    error: "AI backend is running in Offline Demo Mode (no API key configured).",
    text: `### ⚠️ Offline Demo Mode\n\nNo live AI provider API key is currently configured on the backend.\n\nTo activate Google Gemini 1.5 Flash live inference for "${userQuery}":\n1. Add \`GEMINI_API_KEY\` to your Vercel project environment variables, or\n2. Open **⚙️ Settings** in the left sidebar and enter your Gemini API key under **API Configuration**.\n\nIn the meantime, OM's local autonomous engines (Python code sandbox, 3D CAD studio, thought map, and notebook) are fully active.`,
    sender: 'om',
    brand: "OM – AI Action Assistant",
    tagline: "Think. Plan. Act. Achieve.",
    query: userQuery,
    mode: mode,
    apiKeyUsed: 'Offline Demo Mode',
    verified: true,
    actions: [
      { stage: 'think', title: `Scope requirements for ${capGoal}`, estimate: '1d' },
      { stage: 'plan', title: `Architect milestones & schema contracts for ${capGoal}`, estimate: '2d' },
      { stage: 'act', title: `Execute core development and workflows`, estimate: '4d' },
      { stage: 'achieve', title: `Run verification audit and deliver final deliverables`, estimate: '1d' }
    ]
  });
}
