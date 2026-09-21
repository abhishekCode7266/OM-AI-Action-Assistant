/**
 * OM AI Assistant - File & Image Processing Engine
 * Ingests documents (PDF, DOCX, TXT, CSV, JSON) and images for multimodal reasoning.
 */

class OMFileManager {
  constructor() {
    this.pendingFiles = [];
  }

  async processFile(file) {
    if (!file) return null;

    const fileMeta = {
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      extension: file.name.split('.').pop().toLowerCase(),
      uploadedAt: Date.now(),
      previewUrl: null,
      textContent: null,
      base64Data: null,
      isImage: file.type.startsWith('image/')
    };

    // Process based on type
    if (fileMeta.isImage) {
      const dataUrl = await this.readFileAsDataURL(file);
      fileMeta.previewUrl = dataUrl;
      fileMeta.base64Data = dataUrl.split(',')[1];
    } else if (['csv', 'txt', 'md', 'json', 'js', 'py', 'html', 'css', 'ts', 'java', 'cpp'].includes(fileMeta.extension)) {
      const text = await this.readFileAsText(file);
      fileMeta.textContent = text;
      // Auto-parse if CSV
      if (fileMeta.extension === 'csv' && window.omAnalytics) {
        try {
          fileMeta.parsedDataset = window.omAnalytics.parseCSV(text, file.name);
        } catch (e) {
          console.warn("CSV parsing error", e);
        }
      }
    } else {
      // PDF or binary documents: extract basic metadata & text if possible
      const text = await this.readFileAsText(file).catch(() => null);
      fileMeta.textContent = text || `[Attached Document: ${file.name} (${this.formatSize(file.size)})]`;
    }

    this.pendingFiles.push(fileMeta);
    return fileMeta;
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  clearPendingFiles() {
    this.pendingFiles = [];
  }

  removePendingFile(id) {
    this.pendingFiles = this.pendingFiles.filter(f => f.id !== id);
  }

  getPendingContextText() {
    if (this.pendingFiles.length === 0) return "";
    let ctx = "\n\n--- ATTACHED FILES CONTEXT ---\n";
    this.pendingFiles.forEach(f => {
      ctx += `\n[File: ${f.name} (${this.formatSize(f.size)})]\n`;
      if (f.textContent) {
        ctx += f.textContent.substring(0, 8000) + (f.textContent.length > 8000 ? "\n...[truncated]" : "") + "\n";
      } else if (f.isImage) {
        ctx += `[Image uploaded: ${f.name}]\n`;
      }
    });
    ctx += "--- END ATTACHMENTS ---\n";
    return ctx;
  }
}

window.omFileManager = new OMFileManager();
