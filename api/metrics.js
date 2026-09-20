export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    total_tasks: 4,
    completion_rate: 75,
    velocity_score: 98,
    distribution: {
      think: 1,
      plan: 1,
      act: 1,
      achieve: 1
    }
  });
}
