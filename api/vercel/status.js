export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: "VERCEL_TOKEN is not configured on the server."
    });
  }

  return res.status(200).json({
    success: true,
    configured: true,
    project: "om-ai",
    status: "authenticated"
  });
}
