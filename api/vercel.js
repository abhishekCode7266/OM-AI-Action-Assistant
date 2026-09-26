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

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    return res.status(200).json({
      configured: false,
      error: "VERCEL_TOKEN is not configured on the server.",
      project: "om-ai",
      production_domain: "om-ai-eight.vercel.app",
      status: "unverified"
    });
  }

  try {
    const vResp = await fetch('https://api.vercel.com/v9/projects/om-ai', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (vResp.ok) {
      const data = await vResp.json();
      return res.status(200).json({
        configured: true,
        project: data.name,
        production_domain: "om-ai-eight.vercel.app",
        status: "active",
        framework: data.framework || "other"
      });
    }

    return res.status(200).json({
      configured: true,
      error: `Vercel API returned status ${vResp.status}`,
      status: "error"
    });
  } catch (err) {
    return res.status(200).json({
      configured: true,
      error: err.message,
      status: "error"
    });
  }
}
