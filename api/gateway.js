export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.url || '';
  const pathname = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';
  const body = req.body || {};

  // 1. Health check
  if (pathname === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      service: 'OM AI Action Assistant',
      brand: 'OM',
      tagline: 'Think. Plan. Act. Achieve.',
      version: '3.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  // 2. System Prompt info
  if (pathname === '/api/prompt') {
    return res.status(200).json({
      status: 'active',
      system_prompt_synced: true,
      brand: 'OM – AI Action Assistant',
      tagline: 'Think. Plan. Act. Achieve.',
      modules_active: 65,
      doc_path: 'docs/OM_AI_AGENT_PROMPT.md'
    });
  }

  // 3. Payment config
  if (pathname === '/api/payment') {
    return res.status(200).json({
      status: 'active',
      currency: 'INR',
      gateways: ['UPI', 'Razorpay', 'Stripe', 'Cashfree'],
      sandbox_mode: false,
      brand: 'OM'
    });
  }

  // 4. Image Generation endpoint
  if (pathname === '/api/image') {
    const prompt = body.prompt || 'Generated Concept Art';
    return res.status(200).json({
      success: true,
      prompt: prompt,
      image_url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&auto=format&fit=crop&q=80`,
      aspect_ratio: body.aspect_ratio || '1:1',
      provider: 'OM Multimodal Engine'
    });
  }

  // 5. Video Generation endpoint
  if (pathname === '/api/video') {
    const prompt = body.prompt || 'Generated Motion Graphic';
    return res.status(200).json({
      success: true,
      prompt: prompt,
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-41485-large.mp4',
      duration_seconds: 5,
      provider: 'OM Multimodal Engine'
    });
  }

  // 6. Auth Users
  if (pathname.startsWith('/api/auth/users')) {
    return res.status(200).json({
      success: true,
      users: [
        { id: 'usr-1', name: 'Abhishek', role: 'admin', tier: 'developer_pro' },
        { id: 'usr-2', name: 'OM Collaborator', role: 'member', tier: 'free' }
      ]
    });
  }

  // 7. Auth Grant
  if (pathname.startsWith('/api/auth/grant')) {
    return res.status(200).json({
      success: true,
      granted: true,
      role: body.role || 'developer',
      token: 'om_token_' + Math.random().toString(36).substring(2, 12)
    });
  }

  // 8. Vercel Status
  if (pathname.startsWith('/api/vercel/status')) {
    return res.status(200).json({
      status: 'ready',
      deployment: 'active',
      provider: 'Vercel',
      environment: 'production',
      domain: 'om-ai-eight.vercel.app'
    });
  }

  // 9. GitHub Status
  if (pathname.startsWith('/api/github/status')) {
    return res.status(200).json({
      status: 'connected',
      repo: 'abhishekCode7266/OM-AI-Action-Assistant',
      branch: 'main',
      verified: true
    });
  }

  // 10. GitHub Commit
  if (pathname.startsWith('/api/github/commit')) {
    return res.status(200).json({
      success: true,
      message: 'Commit dispatch acknowledged.',
      repo: 'abhishekCode7266/OM-AI-Action-Assistant'
    });
  }

  // Catch-all
  return res.status(200).json({
    status: 'ok',
    message: 'OM API Gateway Active',
    endpoint: pathname
  });
}
