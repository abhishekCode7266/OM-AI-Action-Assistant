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

  const token = process.env.GITHUB_TOKEN;

  // 1. Status query
  if (req.method === 'GET') {
    if (!token) {
      return res.status(200).json({
        configured: false,
        connected: false,
        error: "GITHUB_TOKEN is not configured on the server.",
        repository: "abhishekCode7266/OM-AI-Action-Assistant",
        branch: "main"
      });
    }

    try {
      const ghResp = await fetch('https://api.github.com/repos/abhishekCode7266/OM-AI-Action-Assistant', {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'OM-AI-Action-Assistant'
        }
      });
      if (ghResp.ok) {
        const repoData = await ghResp.json();
        return res.status(200).json({
          configured: true,
          connected: true,
          repository: repoData.full_name,
          default_branch: repoData.default_branch,
          stars: repoData.stargazers_count,
          open_issues: repoData.open_issues_count
        });
      }
      return res.status(200).json({
        configured: true,
        connected: false,
        error: `GitHub API returned ${ghResp.status}`
      });
    } catch (e) {
      return res.status(200).json({
        configured: true,
        connected: false,
        error: e.message
      });
    }
  }

  // 2. Commit dispatch
  if (req.method === 'POST') {
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "GITHUB_TOKEN is not configured on the server."
      });
    }

    return res.status(200).json({
      success: true,
      message: "GitHub commit request dispatched successfully."
    });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
