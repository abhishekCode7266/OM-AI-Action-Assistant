import fs from 'fs';

const CHATS_FILE = '/tmp/om_serverless_chats.json';

function loadChats() {
  try {
    if (fs.existsSync(CHATS_FILE)) {
      const data = fs.readFileSync(CHATS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Could not load /tmp chats file:", e);
  }
  return [];
}

function saveChats(chats) {
  try {
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Could not save /tmp chats file:", e);
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: retrieve all chats or specific chat
  if (req.method === 'GET') {
    const { id } = req.query || {};
    const chats = loadChats();
    if (id) {
      const matched = chats.find(c => c.id === id);
      if (matched) {
        return res.status(200).json({ success: true, chat: matched });
      }
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    return res.status(200).json({ success: true, chats });
  }

  // POST: save or update chat
  if (req.method === 'POST') {
    const body = req.body || {};
    const chatData = body.chat || body;
    const chatId = chatData.id;

    if (!chatId) {
      return res.status(400).json({ success: false, error: 'Missing chat id' });
    }

    const chats = loadChats();
    const existingIdx = chats.findIndex(c => c.id === chatId);
    if (existingIdx >= 0) {
      chats[existingIdx] = chatData;
    } else {
      chats.unshift(chatData);
    }
    saveChats(chats);
    return res.status(200).json({ success: true, chat: chatData });
  }

  // DELETE: delete chat by id
  if (req.method === 'DELETE') {
    const { id, clear } = req.query || {};
    if (clear === 'all') {
      saveChats([]);
      return res.status(200).json({ success: true, message: 'All conversations deleted.' });
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing conversation id parameter (?id=...)' });
    }

    const chats = loadChats();
    const updatedChats = chats.filter(c => c.id !== id);
    saveChats(updatedChats);
    return res.status(200).json({
      success: true,
      deleted: id,
      message: `Conversation ${id} deleted successfully from backend.`
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
