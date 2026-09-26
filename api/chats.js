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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

let inMemoryChats = [];

export default function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: retrieve chats
  if (req.method === 'GET') {
    const { id } = req.query || {};
    if (id) {
      const matched = inMemoryChats.find(c => c.id === id);
      if (matched) {
        return res.status(200).json({ success: true, chat: matched });
      }
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    return res.status(200).json({ success: true, chats: inMemoryChats });
  }

  // POST: save/update chat
  if (req.method === 'POST') {
    const body = req.body || {};
    const chatData = body.chat || body;
    const chatId = chatData.id || `chat-${Date.now()}`;
    chatData.id = chatId;

    const existingIdx = inMemoryChats.findIndex(c => c.id === chatId);
    if (existingIdx >= 0) {
      inMemoryChats[existingIdx] = chatData;
    } else {
      inMemoryChats.unshift(chatData);
    }
    return res.status(200).json({ success: true, chat: chatData });
  }

  // DELETE: delete chat
  if (req.method === 'DELETE') {
    const { id, clear } = req.query || {};
    if (clear === 'all') {
      inMemoryChats = [];
      return res.status(200).json({ success: true, message: 'All conversations deleted.' });
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing conversation id parameter (?id=...)' });
    }

    inMemoryChats = inMemoryChats.filter(c => c.id !== id);
    return res.status(200).json({
      success: true,
      deleted: id,
      message: `Conversation ${id} deleted successfully from backend.`
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
