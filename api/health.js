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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.NEXUS_API_KEY);
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const githubConfigured = Boolean(process.env.GITHUB_TOKEN);
  const vercelConfigured = Boolean(process.env.VERCEL_TOKEN);
  const imageConfigured = Boolean(process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY);
  const videoConfigured = Boolean(process.env.VIDEO_API_KEY);

  return res.status(200).json({
    status: "healthy",
    connected: true,
    service: "OM AI Action Assistant",
    brand: "OM",
    tagline: "Think. Plan. Act. Achieve.",
    version: "3.0.0",
    environment: "production",
    ai_provider_configured: geminiConfigured || openaiConfigured,
    providers: {
      gemini: geminiConfigured,
      openai: openaiConfigured,
      ai_configured: geminiConfigured || openaiConfigured,
      github: githubConfigured,
      vercel: vercelConfigured,
      image: imageConfigured,
      video: videoConfigured
    },
    timestamp: new Date().toISOString()
  });
}
