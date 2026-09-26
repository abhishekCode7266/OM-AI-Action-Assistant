export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(400).json({
      success: false,
      error: "GITHUB_TOKEN is not configured on the server."
    });
  }

  return res.status(403).json({
    success: false,
    error: "Direct remote commit requires write permissions and active Git branch lock."
  });
}
