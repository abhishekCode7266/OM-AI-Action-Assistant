/**
 * OM AI Assistant - Cyber Terminal CLI Simulator
 * Interactive CRT Phosphor Terminal for advanced developers and power users.
 * Supports system telemetry diagnostics, persona control, 3D disassembly triggers,
 * multilingual switching, matrix effects, and sub-agent task orchestration.
 */

class OMCyberTerminal {
  constructor(containerId = 'cyber-terminal-container', inputId = 'cyber-terminal-input', outputId = 'cyber-terminal-output') {
    this.containerId = containerId;
    this.inputId = inputId;
    this.outputId = outputId;
    this.history = [];
    this.historyIndex = -1;
    this.isMatrixActive = false;
    this.matrixInterval = null;
    this.developerName = 'User';
    this.userAddress = 'User';
  }

  init() {
    this.input = document.getElementById(this.inputId);
    this.output = document.getElementById(this.outputId);
    if (!this.input || !this.output) return;

    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Focus input when clicking anywhere in terminal
    const container = document.getElementById(this.containerId);
    if (container) {
      container.addEventListener('click', () => {
        if (this.input) this.input.focus();
      });
    }

    if (this.output.children.length === 0) {
      this.printBanner();
      this.printLine('Type <span class="text-cyan-400 font-bold">help</span> to view available terminal directives, or <span class="text-emerald-400 font-bold">status</span> for diagnostics.\n', 'info');
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      const cmd = this.input.value.trim();
      if (cmd) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
        this.executeCommand(cmd);
        this.input.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    }
  }

  executeCommand(rawCmd) {
    this.printLine(`<span class="text-slate-400 font-mono">om-ai@quantum:~$</span> <span class="text-white font-semibold">${this.escapeHTML(rawCmd)}</span>`);
    const parts = rawCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.printHelp();
        break;

      case 'status':
        this.printStatus();
        break;

      case 'whoami':
        this.printLine(`USER: <span class="text-emerald-400 font-bold">${this.developerName}</span> [STANDARD OPERATOR]\nACCESS LEVEL: <span class="text-cyan-300 font-mono">STANDARD ACCOUNT</span>\nPERMISSIONS: <span class="text-purple-400 font-mono">OPERATOR / SYSTEM INTERFACE</span>`, 'success');
        break;

      case 'voice':
        this.handleVoiceCommand(args);
        break;

      case 'lang':
      case 'language':
        this.handleLangCommand(args);
        break;

      case 'dismantle':
        this.handleDismantleCommand(args);
        break;

      case 'thought':
      case 'canvas':
        this.handleThoughtCommand(args);
        break;

      case 'agent':
      case 'swarm':
        this.handleAgentCommand(args);
        break;

      case 'matrix':
        this.toggleMatrix();
        break;

      case 'banner':
        this.printBanner();
        break;

      case 'clear':
      case 'cls':
        this.clear();
        break;

      case 'exit':
      case 'close':
        this.closeModal();
        break;

      default:
        this.printLine(`Command not recognized: '<span class="text-rose-400">${this.escapeHTML(cmd)}</span>'. Type <span class="text-cyan-400 font-bold">help</span> for directives list.`, 'error');
        break;
    }

    this.scrollToBottom();
  }

  printBanner() {
    const banner = `
<pre class="text-cyan-400 font-mono text-xs leading-none select-none">
  ██████╗ ███╗   ███╗     █████╗ ██╗
 ██╔═══██╗████╗ ████║    ██╔══██╗██║
 ██║   ██║██╔████╔██║    ███████║██║
 ██║   ██║██║╚██╔╝██║    ██╔══██║██║
 ╚██████╔╝██║ ╚═╝ ██║    ██║  ██║██║
  ╚═════╝ ╚═╝     ╚═╝    ╚═╝  ╚═╝╚═╝
  -- MULTIMODAL QUANTUM OS v4.2.0 --
</pre>`;
    this.printLine(banner, 'raw');
  }

  printHelp() {
    const helpText = `
<div class="space-y-1 text-xs font-mono">
  <div class="text-cyan-300 font-bold mb-2">AVAILABLE DIRECTIVES:</div>
  <div><span class="text-amber-400 font-bold">status</span>        - Display full telemetry, memory heap & VIP state</div>
  <div><span class="text-amber-400 font-bold">whoami</span>        - Inspect authenticated developer credentials</div>
  <div><span class="text-amber-400 font-bold">voice [m|f]</span>   - Switch voice personality: 'voice male' (JARVIS) or 'voice female' (FRIDAY)</div>
  <div><span class="text-amber-400 font-bold">lang [code]</span>   - Switch global locale (e.g. 'lang hi', 'lang en', 'lang es', 'lang ja')</div>
  <div><span class="text-amber-400 font-bold">dismantle [obj]</span>- Trigger 3D volumetric mechanical breakdown (e.g. 'dismantle car')</div>
  <div><span class="text-amber-400 font-bold">thought [q]</span>   - Open Neural Thought Canvas (e.g. 'thought quantum blockchain')</div>
  <div><span class="text-amber-400 font-bold">agent [task]</span>  - Dispatch parallel Agentic Swarm worker</div>
  <div><span class="text-amber-400 font-bold">matrix</span>        - Toggle CRT Matrix digital telemetry stream</div>
  <div><span class="text-amber-400 font-bold">clear</span>         - Purge terminal buffer</div>
  <div><span class="text-amber-400 font-bold">exit</span>          - Close cyber terminal window</div>
</div>`;
    this.printLine(helpText, 'raw');
  }

  printStatus() {
    const lang = localStorage.getItem('om_voice_language') || 'en-US';
    const gender = localStorage.getItem('om_voice_gender') || 'male';
    const persona = localStorage.getItem('om_live_persona') || 'jarvis';

    const statusHtml = `
<div class="p-3 bg-slate-900/80 border border-cyan-500/30 rounded text-xs font-mono space-y-1 text-slate-300">
  <div class="text-cyan-400 font-bold border-b border-cyan-500/20 pb-1 flex justify-between">
    <span>SYSTEM TELEMETRY DIAGNOSTIC</span>
    <span class="text-emerald-400">ONLINE [200 OK]</span>
  </div>
  <div>• OPERATOR: <span class="text-white font-bold">${this.developerName}</span> (STANDARD ACCOUNT)</div>
  <div>• ACTIVE PERSONA: <span class="text-amber-400 font-bold">${persona.toUpperCase()}</span> (${gender.toUpperCase()})</div>
  <div>• SPEECH LOCALIZATION: <span class="text-cyan-300 font-mono">${lang}</span> (20+ World Languages Supported)</div>
  <div>• 3D CAD ENGINE: <span class="text-emerald-400 font-semibold">WebAssembly / WebGL Spatial Ready</span></div>
  <div>• SWARM WORKERS: <span class="text-purple-400 font-semibold">8 Active Threads (Self-Healing)</span></div>
  <div>• CLOUD TOPOLOGY: <span class="text-sky-400">Vercel Edge & GitHub Pages Mirror Synchronized</span></div>
</div>`;
    this.printLine(statusHtml, 'raw');
  }

  handleVoiceCommand(args) {
    const val = (args[0] || '').toLowerCase();
    if (val === 'female' || val === 'f' || val === 'friday') {
      if (window.omVoice) window.omVoice.setVoiceGender('female');
      if (window.omJarvisLive) window.omJarvisLive.setVoiceGender('female');
      this.printLine('Voice set to <span class="text-pink-400 font-bold">FEMALE (F.R.I.D.A.Y. Tactical Persona)</span>. Ready for instructions!', 'success');
    } else if (val === 'male' || val === 'm' || val === 'jarvis') {
      if (window.omVoice) window.omVoice.setVoiceGender('male');
      if (window.omJarvisLive) window.omJarvisLive.setVoiceGender('male');
      this.printLine('Voice set to <span class="text-cyan-400 font-bold">MALE (J.A.R.V.I.S. British Butler)</span>. At your service, Sir.', 'success');
    } else {
      this.printLine("Usage: <span class='text-amber-400'>voice [male|female|jarvis|friday]</span>", 'warn');
    }
  }

  handleLangCommand(args) {
    const code = (args[0] || '').toLowerCase();
    const map = {
      'hi': 'hi-IN',
      'hindi': 'hi-IN',
      'en': 'en-US',
      'english': 'en-US',
      'uk': 'en-GB',
      'in': 'en-IN',
      'es': 'es-ES',
      'spanish': 'es-ES',
      'fr': 'fr-FR',
      'french': 'fr-FR',
      'de': 'de-DE',
      'german': 'de-DE',
      'ja': 'ja-JP',
      'japanese': 'ja-JP',
      'zh': 'zh-CN',
      'chinese': 'zh-CN',
      'ar': 'ar-SA',
      'arabic': 'ar-SA',
      'ru': 'ru-RU',
      'russian': 'ru-RU',
      'pt': 'pt-BR',
      'portuguese': 'pt-BR',
      'bn': 'bn-IN',
      'bengali': 'bn-IN',
      'ta': 'ta-IN',
      'tamil': 'ta-IN',
      'te': 'te-IN',
      'telugu': 'te-IN',
      'mr': 'mr-IN',
      'marathi': 'mr-IN'
    };

    const targetCode = map[code] || args[0];
    if (window.omVoice && window.omVoice.supportedLanguages[targetCode]) {
      window.omVoice.setLanguage(targetCode);
      const name = window.omVoice.supportedLanguages[targetCode].name;
      this.printLine(`System speech and localization updated to: <span class="text-emerald-400 font-bold">${name}</span> (${targetCode})`, 'success');
    } else {
      this.printLine(`Unknown language code '${args[0]}'. Supported codes: hi, en, es, fr, de, ja, zh, ar, ru, pt, bn, ta, te, mr, etc.`, 'warn');
    }
  }

  handleDismantleCommand(args) {
    const target = args.join(' ') || 'supercar chassis';
    this.printLine(`Initiating 3D Volumetric Disassembly for: <span class="text-amber-400 font-bold">${this.escapeHTML(target)}</span>...`, 'info');
    this.printLine('Calculating 1,840 exploded component vectors... Done.\nOpening 3D Spatial Disassembly Studio.', 'success');

    if (window.app && typeof window.app.openDismantleModal === 'function') {
      window.app.openDismantleModal();
    } else {
      const btn = document.querySelector('[data-action="open-dismantle"]');
      if (btn) btn.click();
    }
  }

  handleThoughtCommand(args) {
    const query = args.join(' ') || 'Quantum Architecture & Agentic Swarm';
    this.printLine(`Synthesizing Holographic Neural Canvas for: <span class="text-cyan-400 font-semibold">${this.escapeHTML(query)}</span>...`, 'info');

    if (window.app && typeof window.app.openNeuralCanvas === 'function') {
      window.app.openNeuralCanvas(query);
    }
  }

  handleAgentCommand(args) {
    const task = args.join(' ') || 'Autonomous Code & Security Audit';
    this.printLine(`Spawning Swarm Sub-Agent for task: <span class="text-purple-400 font-semibold">${this.escapeHTML(task)}</span>`, 'info');
    setTimeout(() => {
      this.printLine(`Sub-Agent Worker [Worker-07] completed step 1/3: Dependency resolution [OK]`, 'info');
      this.scrollToBottom();
    }, 600);
    setTimeout(() => {
      this.printLine(`Sub-Agent Worker [Worker-07] completed step 2/3: Structural validation [OK]`, 'info');
      this.scrollToBottom();
    }, 1200);
    setTimeout(() => {
      this.printLine(`Sub-Agent Worker [Worker-07] finished task execution: 100% SUCCESS.`, 'success');
      this.scrollToBottom();
    }, 1800);
  }

  toggleMatrix() {
    this.isMatrixActive = !this.isMatrixActive;
    if (this.isMatrixActive) {
      this.printLine('<span class="text-emerald-400 font-bold">STREAMING QUANTUM TELEMETRY BUFFER (Type matrix to abort)...</span>', 'raw');
      const chars = '01ABCDEFΩΨ∑π∆∇01010101010101';
      this.matrixInterval = setInterval(() => {
        let stream = '';
        for (let i = 0; i < 40; i++) {
          stream += chars[Math.floor(Math.random() * chars.length)];
        }
        this.printLine(`<span class="text-emerald-500 font-mono text-xs opacity-75">${stream}</span>`, 'raw');
        this.scrollToBottom();
      }, 100);
    } else {
      if (this.matrixInterval) {
        clearInterval(this.matrixInterval);
        this.matrixInterval = null;
      }
      this.printLine('<span class="text-cyan-400 font-mono">Stream terminated. Terminal ready.</span>', 'info');
    }
  }

  printLine(html, type = 'normal') {
    if (!this.output) return;
    const div = document.createElement('div');
    div.className = 'font-mono text-xs leading-relaxed';

    if (type === 'error') {
      div.className += ' text-rose-400';
    } else if (type === 'warn') {
      div.className += ' text-amber-400';
    } else if (type === 'success') {
      div.className += ' text-emerald-400';
    } else if (type === 'info') {
      div.className += ' text-cyan-400';
    } else {
      div.className += ' text-slate-300';
    }

    div.innerHTML = html;
    this.output.appendChild(div);
  }

  clear() {
    if (this.output) {
      this.output.innerHTML = '';
    }
  }

  closeModal() {
    const modal = document.getElementById('cyber-terminal-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  scrollToBottom() {
    if (this.output) {
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

// Global initialization singleton
window.OMCyberTerminal = OMCyberTerminal;
window.omCyberTerminal = null;
