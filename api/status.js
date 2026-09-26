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
    persona: "Master-level, fully multimodal personal AI collaborator built to handle any task across text, vision, code, media, and data analysis.",
    engine_version: "3.0.0",
    ai_models_supported: ["nexus-2.0-flash", "nexus-1.5-pro", "nexus-1.5-flash", "om-autonomous-engine"],
    developer_mode: "unlimited_free",
    multimodal_capabilities: [
      "Vision & Image Analysis",
      "Video & Audio Processing",
      "Document & Library Search",
      "Code & Technical Execution",
      "Live Search & Data Lookup",
      "Charts & Data Analytics (Sparks)",
      "Notebook Workflows"
    ],
    operational_rules: [
      "Clarity First",
      "Step-by-Step Breakdown",
      "Completeness"
    ],
    environment: "Vercel Serverless Function",
    status: "online",
    philosophy: "Intelligent, simple, and universal AI collaborator helping users turn ideas into real actions."
  });
}
