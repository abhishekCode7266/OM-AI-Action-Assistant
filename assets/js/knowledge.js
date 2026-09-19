/**
 * OM – AI Action Assistant
 * Knowledge Vault & Document Learning Engine
 */

class OMKnowledge {
  constructor() {
    this.documents = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem('om_knowledge_docs');
    if (saved) {
      try {
        this.documents = JSON.parse(saved);
      } catch (e) {
        this.documents = [];
      }
    }

    if (this.documents.length === 0) {
      this.seedDefaultDoc();
    }

    this.render();
    this.setupEventListeners();
  }

  seedDefaultDoc() {
    this.documents = [
      {
        id: 'doc-1',
        title: 'Project Phoenix: AI Action Engine PRD.md',
        type: 'markdown',
        size: '4.2 KB',
        date: new Date().toLocaleDateString(),
        content: `# Project Phoenix: AI Action Assistant Specification\n\nObjective: Build OM, the intelligent and simple universal action assistant.\nCore Framework: Think ➔ Plan ➔ Act ➔ Achieve.\nKey Requirements:\n- Instant decomposition of abstract goals into verified tasks.\n- Multi-turn cognitive dialogue with reasoning traces.\n- Interactive 4-stage Kanban planner with automated syncing.\n- High-velocity telemetry and progress dashboard.\nTarget Metric: 100% actionability and zero hallucinated tasks.`
      }
    ];
    this.save();
  }

  setupEventListeners() {
    const pasteBtn = document.getElementById('paste-doc-btn');
    const fileInput = document.getElementById('doc-file-input');
    const uploadZone = document.getElementById('doc-upload-zone');

    if (pasteBtn) {
      pasteBtn.addEventListener('click', () => this.promptPasteDoc());
    }

    if (uploadZone && fileInput) {
      uploadZone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      this.addDocument(file.name, content, file.name.split('.').pop());
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  promptPasteDoc() {
    const title = prompt("Enter Document Title (e.g., 'API_Spec.md' or 'User_Research.txt'):");
    if (!title || !title.trim()) return;

    const content = prompt("Paste your Document / Notes / Data text:");
    if (!content || !content.trim()) return;

    this.addDocument(title.trim(), content.trim(), 'text');
  }

  addDocument(title, content, type = 'text') {
    const newDoc = {
      id: 'doc-' + Date.now(),
      title: title,
      type: type,
      size: `${(content.length / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString(),
      content: content
    };

    this.documents.push(newDoc);
    this.save();
    this.render();

    if (window.omApp) {
      window.omApp.showToast(`Document "${title}" ingested into Knowledge Vault!`, 'success');
      window.omApp.recordActivity(`Ingested document: ${title}`);
    }
  }

  deleteDoc(docId) {
    this.documents = this.documents.filter(d => d.id !== docId);
    this.save();
    this.render();
    if (window.omApp) {
      window.omApp.showToast("Document removed from Vault", "info");
    }
  }

  askOMAboutDoc(docId) {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    if (window.omApp) {
      window.omApp.switchView('assistant');
    }
    const input = document.getElementById('chat-user-input');
    if (input) {
      input.value = `Analyze document "${doc.title}" and synthesize a 4-Stage Action Plan from its requirements.`;
      if (window.omAssistant) {
        window.omAssistant.handleUserSubmit();
      }
    }
  }

  save() {
    localStorage.setItem('om_knowledge_docs', JSON.stringify(this.documents));
  }

  getDocumentsText() {
    return this.documents.map(d => `--- ${d.title} ---\n${d.content}`).join('\n\n');
  }

  getSemanticSummary() {
    if (this.documents.length === 0) return "No documents currently loaded.";
    return this.documents.map(d => `• **${d.title}** (${d.size}): Extracted core specifications and actionable requirements.`).join('\n');
  }

  render() {
    const listEl = document.getElementById('knowledge-docs-list');
    const countEl = document.getElementById('vault-doc-count');
    if (!listEl) return;

    if (countEl) countEl.innerText = `${this.documents.length} Assets`;

    listEl.innerHTML = '';
    if (this.documents.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--om-text-muted); font-size: 0.85rem;">
          No documents in Vault. Upload or paste project notes to give OM deep context.
        </div>
      `;
      return;
    }

    this.documents.forEach(doc => {
      const item = document.createElement('div');
      item.className = 'doc-card';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(99,102,241,0.15); display: flex; align-items: center; justify-content: center; color: var(--om-cyan); font-size: 1.1rem;">
            📄
          </div>
          <div>
            <div style="font-size: 0.9rem; font-weight: 600; color: #fff;">${this.escapeHTML(doc.title)}</div>
            <div style="font-size: 0.75rem; color: var(--om-text-muted); font-family: var(--om-font-mono);">
              ${doc.size} • Ingested: ${doc.date}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="om-btn om-btn-secondary om-btn-sm" onclick="omKnowledge.askOMAboutDoc('${doc.id}')">
            ⚡ Deconstruct with OM
          </button>
          <button class="om-btn om-btn-ghost om-btn-sm" style="color: var(--om-rose);" onclick="omKnowledge.deleteDoc('${doc.id}')">
            ✕
          </button>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

window.omKnowledge = null;
document.addEventListener('DOMContentLoaded', () => {
  window.omKnowledge = new OMKnowledge();
});
