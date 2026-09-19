/**
 * OM – AI Action Assistant
 * Task Planner (Think - Plan - Act - Achieve)
 */

class OMPlanner {
  constructor() {
    this.stages = ['think', 'plan', 'act', 'achieve'];
    this.tasks = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem('om_tasks_data');
    if (saved) {
      try {
        this.tasks = JSON.parse(saved);
      } catch (e) {
        this.tasks = [];
      }
    }

    if (this.tasks.length === 0) {
      this.seedDefaultTasks();
    }

    this.render();
    this.setupEventListeners();
  }

  seedDefaultTasks() {
    this.tasks = [
      {
        id: 'task-1',
        title: 'Formulate Q4 Strategic Vision & Constraints',
        desc: 'Define key deliverables, target KPIs, and boundary parameters.',
        stage: 'think',
        priority: 'medium',
        estimate: '1d',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Architect Microservices & API Contracts',
        desc: 'Document schema definitions and sequence diagrams.',
        stage: 'plan',
        priority: 'high',
        estimate: '2d',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-3',
        title: 'Implement Core Neural Assistant Logic',
        desc: 'Build conversation context manager, reasoning engine, and actions pipeline.',
        stage: 'act',
        priority: 'high',
        estimate: '3d',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-4',
        title: 'Run End-to-End System Verification & Release v1.0',
        desc: 'Validate all metrics, performance tests, and automated action flows.',
        stage: 'achieve',
        priority: 'high',
        estimate: '1d',
        createdAt: new Date().toISOString()
      }
    ];
    this.save();
  }

  setupEventListeners() {
    const addTaskBtn = document.getElementById('planner-add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.promptAddTask());
    }

    // Set up drag and drop zones
    this.stages.forEach(stage => {
      const colEl = document.getElementById(`column-${stage}`);
      if (!colEl) return;

      colEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        colEl.classList.add('drag-over');
      });

      colEl.addEventListener('dragleave', () => {
        colEl.classList.remove('drag-over');
      });

      colEl.addEventListener('drop', (e) => {
        e.preventDefault();
        colEl.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
          this.moveTaskStage(taskId, stage);
        }
      });
    });
  }

  save() {
    localStorage.setItem('om_tasks_data', JSON.stringify(this.tasks));
    if (window.omDashboard) {
      window.omDashboard.updateMetrics();
    }
  }

  addTask(taskData) {
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: taskData.title || 'Untitled Action',
      desc: taskData.desc || '',
      stage: taskData.stage || 'think',
      priority: taskData.priority || 'medium',
      estimate: taskData.estimate || '1d',
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.save();
    this.render();

    if (window.omApp) {
      window.omApp.recordActivity(`Created task in [${newTask.stage.toUpperCase()}]: "${newTask.title}"`);
    }
  }

  moveTaskStage(taskId, newStage) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.stage === newStage) return;

    const oldStage = task.stage;
    task.stage = newStage;
    this.save();
    this.render();

    if (window.omApp) {
      window.omApp.recordActivity(`Moved "${task.title}" from [${oldStage.toUpperCase()}] ➔ [${newStage.toUpperCase()}]`);
      window.omApp.showToast(`Moved to ${newStage.toUpperCase()}`, 'info');
    }
  }

  deleteTask(taskId) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      const title = this.tasks[idx].title;
      this.tasks.splice(idx, 1);
      this.save();
      this.render();
      if (window.omApp) {
        window.omApp.showToast(`Deleted action "${title}"`, 'info');
      }
    }
  }

  promptAddTask() {
    const title = prompt("Enter Action Title (e.g., 'Deploy API to production'):");
    if (!title || !title.trim()) return;

    const stage = prompt("Select Stage: 'think', 'plan', 'act', or 'achieve':", "think");
    const validStage = this.stages.includes((stage || '').toLowerCase()) ? stage.toLowerCase() : 'think';

    this.addTask({
      title: title.trim(),
      desc: 'Created directly via OM Task Planner',
      stage: validStage,
      priority: 'medium',
      estimate: '1d'
    });
  }

  render() {
    this.stages.forEach(stage => {
      const listEl = document.getElementById(`task-list-${stage}`);
      const countEl = document.getElementById(`count-${stage}`);
      if (!listEl) return;

      const stageTasks = this.tasks.filter(t => t.stage === stage);
      if (countEl) countEl.innerText = stageTasks.length;

      listEl.innerHTML = '';

      if (stageTasks.length === 0) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; color: var(--om-text-muted); font-size: 0.8rem; border: 1px dashed rgba(255,255,255,0.06); border-radius: 8px;">
            No actions in ${stage.toUpperCase()} yet.<br>Drag items here or use OM Assistant.
          </div>
        `;
        return;
      }

      stageTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.setAttribute('data-id', task.id);

        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', task.id);
        });

        // Stage progression buttons
        const stageIndex = this.stages.indexOf(stage);
        const prevStage = stageIndex > 0 ? this.stages[stageIndex - 1] : null;
        const nextStage = stageIndex < this.stages.length - 1 ? this.stages[stageIndex + 1] : null;

        let navButtons = '';
        if (prevStage) {
          navButtons += `<button class="om-btn om-btn-ghost om-btn-sm" style="padding: 2px 6px; font-size: 0.7rem;" title="Move back to ${prevStage}" onclick="omPlanner.moveTaskStage('${task.id}', '${prevStage}')">◀ ${prevStage}</button>`;
        }
        if (nextStage) {
          navButtons += `<button class="om-btn om-btn-ghost om-btn-sm" style="padding: 2px 6px; font-size: 0.7rem; color: var(--om-cyan);" title="Advance to ${nextStage}" onclick="omPlanner.moveTaskStage('${task.id}', '${nextStage}')">${nextStage} ▶</button>`;
        }

        card.innerHTML = `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
            <div class="task-card-title">${this.escapeHTML(task.title)}</div>
            <button class="om-btn om-btn-ghost om-btn-sm" style="padding: 2px 4px; color: var(--om-text-muted);" title="Delete" onclick="omPlanner.deleteTask('${task.id}')">✕</button>
          </div>
          ${task.desc ? `<div class="task-card-desc">${this.escapeHTML(task.desc)}</div>` : ''}
          <div class="task-card-footer">
            <span class="task-priority-tag priority-${task.priority || 'medium'}">${task.priority || 'MED'}</span>
            <span style="font-family: var(--om-font-mono);">Est: ${task.estimate || '1d'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
            ${navButtons}
          </div>
        `;

        listEl.appendChild(card);
      });
    });
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

window.omPlanner = null;
document.addEventListener('DOMContentLoaded', () => {
  window.omPlanner = new OMPlanner();
});
