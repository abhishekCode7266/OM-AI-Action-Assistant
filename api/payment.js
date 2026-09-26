export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: false,
      configured: false,
      error: "Payment gateway is not configured."
    });
  }

  return res.status(400).json({
    success: false,
    configured: false,
    error: "Payment gateway is not configured."
  });
}
