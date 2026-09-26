export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "healthy",
    brand: "OM",
    name: "OM – AI Action Assistant",
    tagline: "Think. Plan. Act. Achieve.",
    version: "2.5.0",
    ai_provider_configured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    github_configured: Boolean(process.env.GITHUB_TOKEN),
    vercel_configured: Boolean(process.env.VERCEL_TOKEN),
    image_configured: Boolean(process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY),
    video_configured: Boolean(process.env.VIDEO_API_KEY)
  });
}
