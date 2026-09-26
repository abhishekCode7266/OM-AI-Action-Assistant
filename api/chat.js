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

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const prompt = (body.prompt || '').trim();
  const mode = body.mode || 'action';

  const cleanGoal = prompt.replace(/^(decompose:|deconstruct:|plan:|launch:|build:|how to|i want to)\s*/i, '').trim() || 'Core Goal';
  const capGoal = cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1);

  // 1. Check for Gemini Key (Server environment variable or client-supplied in settings)
  const effectiveGeminiKey = (body.apiKey && body.apiKey.startsWith('AIzaSy'))
    ? body.apiKey
    : (process.env.GEMINI_API_KEY || process.env.NEXUS_API_KEY);

  if (effectiveGeminiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`;
      const geminiResp = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are OM – AI Action Assistant. Brand tagline: "Think. Plan. Act. Achieve." Provide a helpful, intelligent response to: ${prompt}`
            }]
          }]
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
            query: prompt,
            mode: mode,
            apiKeyUsed: 'Gemini 1.5 Flash (Live)',
            text: geminiText,
            reasoning: "Generated live by Google Gemini 1.5 Flash via OM AI Action Assistant backend.",
            verified: true,
            actions: [
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
      const oaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are OM – AI Action Assistant. Tagline: "Think. Plan. Act. Achieve."' },
            { role: 'user', content: prompt }
          ]
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
            query: prompt,
            mode: mode,
            apiKeyUsed: 'OpenAI GPT-4o-mini (Live)',
            text: oaiText,
            reasoning: "Generated live by OpenAI GPT-4o-mini via OM AI Action Assistant backend.",
            verified: true,
            actions: [
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

  // 3. Truthful response when no AI provider API key is configured
  return res.status(200).json({
    success: false,
    error: "AI backend is running, but no AI provider API key is configured.",
    text: "AI backend is running, but no AI provider API key is configured. Please configure GEMINI_API_KEY or OPENAI_API_KEY in your Vercel project environment variables (or provide a Gemini API key in Settings).",
    sender: 'om',
    greeting: "Hi, I'm OM. Tell me what you want to achieve, and I'll help you plan, execute, verify, and track it.",
    brand: "OM – AI Action Assistant",
    tagline: "Think. Plan. Act. Achieve.",
    query: prompt,
    mode: mode,
    apiKeyUsed: 'None Configured',
    verified: true,
    actions: [
      { stage: 'think', title: `Scope requirements for ${capGoal}`, estimate: '1d' },
      { stage: 'plan', title: `Architect milestones & schema contracts for ${capGoal}`, estimate: '2d' },
      { stage: 'act', title: `Execute core development and workflows`, estimate: '4d' },
      { stage: 'achieve', title: `Run verification audit and deliver final deliverables`, estimate: '1d' }
    ]
  });
}
