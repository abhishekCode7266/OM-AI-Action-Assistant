/**
 * OM AI Assistant - Project Builder & Workspaces
 * Manages full lifecycle projects: Goals -> Requirements -> Tech Stack -> File Architecture -> Tasks.
 */

class OMProjectManager {
  constructor() {
    this.STORAGE_KEY = 'om_projects_v2';
    this.projects = this.loadProjects();
    this.activeProjectId = null;
  }

  loadProjects() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Default starter project
    return [
      {
        id: 'proj_default_1',
        title: 'CareerSphere AI Platform',
        description: 'AI-driven career portal with mock interviews, resume review, and jobs pipeline.',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'Google Gemini API'],
        createdAt: Date.now() - 3 * 86400000,
        tasks: [
          { id: 'pt_1', title: 'Define core user stories & target personas', done: true, stage: 'think' },
          { id: 'pt_2', title: 'Architect database schema & API contracts', done: true, stage: 'plan' },
          { id: 'pt_3', title: 'Build interactive mock interview engine', done: false, stage: 'act' },
          { id: 'pt_4', title: 'Integrate automated resume score parser', done: false, stage: 'act' },
          { id: 'pt_5', title: 'Deploy on Vercel with automated test coverage', done: false, stage: 'achieve' }
        ],
        files: [
          { name: 'README.md', size: '2.4 KB' },
          { name: 'schema.sql', size: '4.1 KB' },
          { name: 'InterviewEngine.jsx', size: '8.2 KB' }
        ],
        notes: "Target MVP release in 14 days. Verification threshold: <200ms latency on interview prompts."
      }
    ];
  }

  saveProjects() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects));
    } catch (e) {}
  }

  createProject(title, description, techStack = []) {
    const proj = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title || 'Untitled Project',
      description: description || '',
      techStack: Array.isArray(techStack) ? techStack : techStack.split(',').map(s => s.trim()),
      createdAt: Date.now(),
      tasks: [],
      files: [],
      notes: ''
    };
    this.projects.unshift(proj);
    this.saveProjects();
    return proj;
  }

  getProject(id) {
    return this.projects.find(p => p.id === id) || null;
  }

  addTask(projId, taskTitle, stage = 'act') {
    const proj = this.getProject(projId);
    if (!proj) return null;
    const task = {
      id: 'pt_' + Date.now(),
      title: taskTitle,
      done: false,
      stage: stage
    };
    proj.tasks.push(task);
    this.saveProjects();
    return task;
  }

  toggleTask(projId, taskId) {
    const proj = this.getProject(projId);
    if (!proj) return false;
    const task = proj.tasks.find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      this.saveProjects();
      return task.done;
    }
    return false;
  }

  deleteProject(projId) {
    this.projects = this.projects.filter(p => p.id !== projId);
    this.saveProjects();
  }
}

window.omProjects = new OMProjectManager();
