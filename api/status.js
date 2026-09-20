export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    brand: "OM",
    name: "OM – AI Action Assistant",
    tagline: "Think. Plan. Act. Achieve.",
    engine_version: "2.4.0",
    environment: "Vercel Serverless Function",
    status: "online",
    philosophy: "Intelligent, simple, and universal AI assistant helping users turn ideas into real actions."
  });
}
