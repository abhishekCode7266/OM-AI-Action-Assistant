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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const prompt = (body.prompt || '').trim();
  const imageKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY;

  if (!imageKey) {
    return res.status(400).json({
      success: false,
      error: "Image generation API is not configured. Set IMAGE_API_KEY or OPENAI_API_KEY in server environment."
    });
  }

  try {
    const oaiResp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${imageKey}`
      },
      body: JSON.stringify({
        prompt: prompt || 'Abstract futuristic architecture',
        n: 1,
        size: '1024x1024'
      })
    });

    if (oaiResp.ok) {
      const data = await oaiResp.json();
      const imgUrl = data.data?.[0]?.url;
      if (imgUrl) {
        return res.status(200).json({ success: true, imageUrl: imgUrl, prompt: prompt });
      }
    }

    const errData = await oaiResp.json();
    return res.status(500).json({ success: false, error: errData.error?.message || 'Image generation failed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Image provider network error' });
  }
}
