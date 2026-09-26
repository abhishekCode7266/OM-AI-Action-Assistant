export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const imageKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  if (!imageKey) {
    return res.status(400).json({
      success: false,
      error: "Image generation API is not configured. Set IMAGE_API_KEY or OPENAI_API_KEY in server environment variables."
    });
  }

  const body = req.body || {};
  const prompt = (body.prompt || '').trim();
  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required." });
  }

  try {
    const oaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${imageKey}`
      },
      body: JSON.stringify({ prompt, n: 1, size: "1024x1024" })
    });
    if (oaiResp.ok) {
      const data = await oaiResp.json();
      const imageUrl = data.data?.[0]?.url;
      return res.status(200).json({ success: true, imageUrl, prompt });
    }
    const errData = await oaiResp.json();
    return res.status(502).json({ success: false, error: errData.error?.message || "Image provider error" });
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || "Failed to reach image provider" });
  }
}
