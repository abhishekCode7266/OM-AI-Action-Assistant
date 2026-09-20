let memoryTasks = [
  {
    id: 'task-1',
    title: 'Formulate Q4 Strategic Vision & Constraints',
    desc: 'Define key deliverables, target KPIs, and boundary parameters.',
    stage: 'think',
    priority: 'medium',
    estimate: '1d'
  },
  {
    id: 'task-2',
    title: 'Architect Microservices & API Contracts',
    desc: 'Document schema definitions and sequence diagrams.',
    stage: 'plan',
    priority: 'high',
    estimate: '2d'
  },
  {
    id: 'task-3',
    title: 'Implement Core Neural Assistant Logic',
    desc: 'Build conversation context manager, reasoning engine, and actions pipeline.',
    stage: 'act',
    priority: 'high',
    estimate: '3d'
  },
  {
    id: 'task-4',
    title: 'Run End-to-End System Verification & Release v1.0',
    desc: 'Validate all metrics, performance tests, and automated action flows.',
    stage: 'achieve',
    priority: 'high',
    estimate: '1d'
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const task = req.body || {};
    const newTask = {
      id: task.id || `task-${Date.now()}`,
      title: task.title || 'Untitled Action',
      desc: task.desc || 'Created via OM API',
      stage: task.stage || 'think',
      priority: task.priority || 'medium',
      estimate: task.estimate || '1d'
    };
    memoryTasks.push(newTask);
    return res.status(201).json({ success: true, task: newTask });
  }

  return res.status(200).json({ tasks: memoryTasks });
}
