export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const videoKey = process.env.VIDEO_API_KEY;
  if (!videoKey) {
    return res.status(400).json({
      success: false,
      error: "Video generation requires a configured video provider (VIDEO_API_KEY on server)."
    });
  }

  return res.status(503).json({
    success: false,
    error: "Video generation service is initializing or awaiting job completion."
  });
}
