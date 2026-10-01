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

  getActiveProject() {
    if (this.activeProjectId) {
      const p = this.getProject(this.activeProjectId);
      if (p) return p;
    }
    return this.projects[0] || null;
  }

  saveProjectFiles(projId, files) {
    const proj = this.getProject(projId);
    if (!proj) return;
    proj.files = (files || []).map(f => ({
      name: f.name,
      content: f.content || '',
      size: (f.content ? (new TextEncoder().encode(f.content).length / 1024).toFixed(1) : '0') + ' KB',
      updatedAt: Date.now()
    }));
    this.saveProjects();
  }

  updateProjectFiles(projId, updatedFiles) {
    const proj = this.getProject(projId);
    if (!proj) return;
    if (!proj.files) proj.files = [];

    (updatedFiles || []).forEach(uf => {
      const existing = proj.files.find(f => f.name === uf.name);
      if (existing) {
        existing.content = uf.content;
        existing.size = (new TextEncoder().encode(uf.content || '').length / 1024).toFixed(1) + ' KB';
        existing.updatedAt = Date.now();
      } else {
        proj.files.push({
          name: uf.name,
          content: uf.content || '',
          size: (new TextEncoder().encode(uf.content || '').length / 1024).toFixed(1) + ' KB',
          updatedAt: Date.now()
        });
      }
    });

    this.saveProjects();
    return proj;
  }

  /**
   * Pure Client-Side Zero-Dependency PKZIP Generator (Standard .zip format)
   * Builds uncompressed ZIP file Blob compatible across Windows, macOS, Linux, Android, iOS.
   */
  createZipBlob(files) {
    if (!this._crcTable) {
      this._crcTable = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        this._crcTable[i] = c;
      }
    }

    const calcCRC32 = (bytes) => {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) {
        crc = this._crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    };

    const encoder = new TextEncoder();
    const parts = [];
    const fileRecords = [];
    let offset = 0;

    (files || []).forEach(f => {
      const nameBytes = encoder.encode(f.name);
      const dataBytes = encoder.encode(f.content || '');
      const crc = calcCRC32(dataBytes);
      const size = dataBytes.length;

      const header = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(header.buffer);
      dv.setUint32(0, 0x04034b50, true); // Local file header signature
      dv.setUint16(4, 20, true);          // Version needed to extract (2.0)
      dv.setUint16(6, 0x0800, true);      // General purpose bit flag (UTF-8 filename)
      dv.setUint16(8, 0, true);           // Compression method (0 = stored)
      dv.setUint16(10, 0, true);          // Mod time
      dv.setUint16(12, 0, true);          // Mod date
      dv.setUint32(14, crc, true);        // CRC-32
      dv.setUint32(18, size, true);       // Compressed size
      dv.setUint32(22, size, true);       // Uncompressed size
      dv.setUint16(26, nameBytes.length, true); // Filename length
      dv.setUint16(28, 0, true);          // Extra field length
      header.set(nameBytes, 30);

      parts.push(header);
      parts.push(dataBytes);

      fileRecords.push({
        nameBytes,
        crc,
        size,
        offset
      });

      offset += header.length + dataBytes.length;
    });

    const cdOffset = offset;
    let cdSize = 0;

    fileRecords.forEach(rec => {
      const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
      const dv = new DataView(cdHeader.buffer);
      dv.setUint32(0, 0x02014b50, true); // Central directory header signature
      dv.setUint16(4, 20, true);          // Version made by
      dv.setUint16(6, 20, true);          // Version needed
      dv.setUint16(8, 0x0800, true);      // UTF-8 flag
      dv.setUint16(10, 0, true);          // Compression (stored)
      dv.setUint16(12, 0, true);          // Mod time
      dv.setUint16(14, 0, true);          // Mod date
      dv.setUint32(16, rec.crc, true);    // CRC-32
      dv.setUint32(20, rec.size, true);   // Compressed size
      dv.setUint32(24, rec.size, true);   // Uncompressed size
      dv.setUint16(28, rec.nameBytes.length, true); // Filename length
      dv.setUint16(30, 0, true);          // Extra field length
      dv.setUint16(32, 0, true);          // Comment length
      dv.setUint16(34, 0, true);          // Disk number start
      dv.setUint16(36, 0, true);          // Internal attributes
      dv.setUint32(38, 0, true);          // External attributes
      dv.setUint32(42, rec.offset, true); // Relative offset of local header
      cdHeader.set(rec.nameBytes, 46);

      parts.push(cdHeader);
      cdSize += cdHeader.length;
    });

    // End of Central Directory Record
    const eocd = new Uint8Array(22);
    const dvEocd = new DataView(eocd.buffer);
    dvEocd.setUint32(0, 0x06054b50, true); // EOCD signature
    dvEocd.setUint16(4, 0, true);           // Disk number
    dvEocd.setUint16(6, 0, true);           // Central directory start disk
    dvEocd.setUint16(8, fileRecords.length, true);  // Disk entries
    dvEocd.setUint16(10, fileRecords.length, true); // Total entries
    dvEocd.setUint32(12, cdSize, true);     // Size of central directory
    dvEocd.setUint32(16, cdOffset, true);   // Offset of central directory
    dvEocd.setUint16(20, 0, true);          // Comment length

    parts.push(eocd);

    return new Blob(parts, { type: 'application/zip' });
  }

  downloadZip(projectName, files) {
    if (!files || files.length === 0) {
      if (window.omApp) window.omApp.showToast("No files to download", "warning");
      return;
    }
    const cleanName = (projectName || 'project').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const blob = this.createZipBlob(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.omApp) {
      window.omApp.showToast(`📥 Downloaded ${cleanName}.zip (${(blob.size / 1024).toFixed(1)} KB)`, 'success');
    }
  }

  downloadFile(fileName, content) {
    const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.omApp) {
      window.omApp.showToast(`📥 Downloaded ${fileName}`, 'success');
    }
  }
}

window.omProjects = new OMProjectManager();
