let defaultUsers = [
  {
    id: "usr-owner-001",
    username: "Udayast",
    name: "Abhishek Singh Yadav",
    role: "owner",
    access: "unlimited",
    tools: ["*"],
    gems: "unlimited",
    expires_at: "never",
    is_developer: true
  },
  {
    id: "usr-guest-002",
    username: "Guest",
    name: "Public Authorized User",
    role: "authorized_user",
    access: "full_free",
    tools: ["*"],
    gems: "unlimited",
    expires_at: "2030-12-31",
    is_developer: false
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ status: "success", users: defaultUsers });
}
