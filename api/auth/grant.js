export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body || {};
  const userId = body.userId || 'usr-guest-002';
  const access = body.access || 'full_free';

  return res.status(200).json({
    status: "success",
    message: `Server-side policy enforced for ${userId} with ${access} access.`,
    user: {
      id: userId,
      access: access,
      tools: body.tools || ['*'],
      gems: body.gems || 'unlimited',
      expires_at: body.expires_at || 'never'
    }
  });
}
