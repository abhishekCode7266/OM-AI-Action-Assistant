/**
 * OM AI Assistant - Holographic Neural Thought Canvas
 * Futuristic node-based mind map & execution graph engine.
 * Visualizes complex multimodal workflows, 3D disassembly pipelines,
 * agentic subroutines, and architectural planning on an interactive canvas.
 */

class OMNeuralCanvas {
  constructor(canvasId = 'neural-canvas') {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.links = [];
    this.particles = [];
    this.packets = [];
    this.selectedNode = null;
    this.hoveredNode = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.scale = 1.0;
    this.animFrameId = null;
    this.currentPreset = 'quantum_ai';
    this.mouseX = 0;
    this.mouseY = 0;
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.setupListeners();
    this.initBackgroundParticles();
    this.loadPreset('quantum_ai');
    this.startAnimation();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 900;
    this.canvas.height = rect.height || 600;
    if (this.nodes.length === 0) {
      this.offset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }
  }

  setupListeners() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = this.getCanvasCoords(e);
      const clicked = this.findNodeAt(pos.x, pos.y);
      if (clicked) {
        this.isDragging = true;
        this.draggedNode = clicked;
        this.selectedNode = clicked;
        this.updateNodeInspector(clicked);
      } else {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;

      if (this.isDragging && this.draggedNode) {
        const pos = this.getCanvasCoords(e);
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
      } else if (this.isPanning) {
        this.offset.x = e.clientX - this.panStart.x;
        this.offset.y = e.clientY - this.panStart.y;
      } else {
        const pos = this.getCanvasCoords(e);
        this.hoveredNode = this.findNodeAt(pos.x, pos.y);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'crosshair';
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
      this.isPanning = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.scale = Math.min(Math.max(0.4, this.scale * zoomFactor), 2.5);
    }, { passive: false });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    return {
      x: (screenX - this.offset.x) / this.scale,
      y: (screenY - this.offset.y) / this.scale
    };
  }

  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.hypot(dx, dy) <= node.radius + 6) {
        return node;
      }
    }
    return null;
  }

  initBackgroundParticles() {
    this.particles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  loadPreset(presetKey) {
    this.currentPreset = presetKey;
    this.nodes = [];
    this.links = [];
    this.packets = [];

    if (presetKey === 'quantum_ai') {
      this.nodes = [
        { id: 'core', label: 'OM Core Orchestrator', subtext: 'Multimodal Cognitive Kernel', category: 'core', x: 0, y: 0, radius: 36, color: '#00d2ff', status: 'active', meta: 'Primary central intelligence controlling all reasoning loops.' },
        { id: 'multimodal', label: 'Vision & 3D Spatial Engine', subtext: 'Volumetric Disassembly', category: 'vision', x: -220, y: -120, radius: 28, color: '#10b981', status: 'complete', meta: 'Analyzes visual blueprints and exploded-view schematics.' },
        { id: 'voice', label: 'Dual Voice Telemetry (J.A.R.V.I.S. & F.R.I.D.A.Y.)', subtext: '20+ Global Languages', category: 'voice', x: -220, y: 130, radius: 28, color: '#f59e0b', status: 'complete', meta: 'Real-time two-way voice with male and female tactical personas.' },
        { id: 'agentic', label: 'Autonomous Agentic Swarm', subtext: 'Multi-Step Execution', category: 'agent', x: 230, y: -110, radius: 28, color: '#a855f7', status: 'active', meta: 'Parallel sub-agent workers for self-directed coding and analysis.' },
        { id: 'security', label: 'Cryptographic Security & Auth Matrix', subtext: 'Role-Based Access Control', category: 'security', x: 230, y: 130, radius: 28, color: '#ec4899', status: 'complete', meta: 'Enterprise-grade zero-trust authorization matrix.' },
        { id: 'cloud', label: 'Global Deployment (Vercel & GitHub Pages)', subtext: 'Zero-Downtime Edge CDN', category: 'devops', x: 0, y: 220, radius: 24, color: '#38bdf8', status: 'complete', meta: 'Production builds published to Vercel and GitHub edge nodes.' }
      ];
      this.links = [
        { from: 'core', to: 'multimodal' },
        { from: 'core', to: 'voice' },
        { from: 'core', to: 'agentic' },
        { from: 'core', to: 'security' },
        { from: 'core', to: 'cloud' },
        { from: 'multimodal', to: 'agentic' },
        { from: 'voice', to: 'security' }
      ];
    } else if (presetKey === 'car_dismantle') {
      this.nodes = [
        { id: 'root', label: 'Vehicle Master Assembly', subtext: 'Full Supercar Chassis', category: 'core', x: 0, y: -120, radius: 34, color: '#f59e0b', status: 'active', meta: 'Master structural node containing 1,840 sub-assemblies.' },
        { id: 'powertrain', label: 'Twin-Turbo V8 Powertrain', subtext: 'Exploded CAD Volumetric', category: 'mech', x: -200, y: 40, radius: 28, color: '#ef4444', status: 'complete', meta: 'Engine block, intake manifold, turbochargers, and crankshaft.' },
        { id: 'chassis', label: 'Carbon Composite Monocoque', subtext: 'Stress & Shear Analysis', category: 'mech', x: 0, y: 60, radius: 28, color: '#3b82f6', status: 'complete', meta: 'Lightweight safety cell with FEA load simulation.' },
        { id: 'aero', label: 'Active Aerodynamics System', subtext: 'Diffusers & Carbon Wing', category: 'aero', x: 200, y: 40, radius: 28, color: '#10b981', status: 'active', meta: 'Hydraulic actuation for adaptive downforce and drag reduction.' },
        { id: 'telemetry', label: 'ECU Telemetry Sensors', subtext: 'CAN-Bus Diagnostic Feed', category: 'elec', x: -100, y: 200, radius: 24, color: '#8b5cf6', status: 'complete', meta: 'High-frequency telemetry streamed directly to J.A.R.V.I.S. HUD.' },
        { id: 'brakes', label: 'Carbon-Ceramic Braking Matrix', subtext: '6-Piston Caliper Exploded', category: 'mech', x: 100, y: 200, radius: 24, color: '#ec4899', status: 'complete', meta: 'Thermal resistance rating up to 1,000°C under load.' }
      ];
      this.links = [
        { from: 'root', to: 'powertrain' },
        { from: 'root', to: 'chassis' },
        { from: 'root', to: 'aero' },
        { from: 'chassis', to: 'telemetry' },
        { from: 'chassis', to: 'brakes' },
        { from: 'powertrain', to: 'telemetry' }
      ];
    } else {
      // General Workflow
      this.generateFromPrompt(presetKey);
      return;
    }

    this.spawnPackets();
    if (this.nodes.length > 0) {
      this.selectedNode = this.nodes[0];
      this.updateNodeInspector(this.nodes[0]);
    }
  }

  generateFromPrompt(promptText) {
    const text = (promptText || 'Complex Problem Solver').trim();
    this.nodes = [
      { id: 'n1', label: text.substring(0, 24) || 'Primary Goal', subtext: 'Strategic Core Node', category: 'core', x: 0, y: 0, radius: 34, color: '#00d2ff', status: 'active', meta: `Goal specification: "${text}"` },
      { id: 'n2', label: 'Phase 1: Architecture & Data', subtext: 'Schema & Flow Mapping', category: 'plan', x: -180, y: -100, radius: 26, color: '#10b981', status: 'complete', meta: 'Designing structural contracts and boundary interfaces.' },
      { id: 'n3', label: 'Phase 2: Agent Execution', subtext: 'Subroutine Parallelism', category: 'agent', x: 180, y: -100, radius: 26, color: '#a855f7', status: 'active', meta: 'Executing task units with autonomous error recovery.' },
      { id: 'n4', label: 'Phase 3: Validation & QA', subtext: 'Automated Stress Matrix', category: 'test', x: -150, y: 130, radius: 26, color: '#f59e0b', status: 'pending', meta: 'Running regression suites and verification benchmarks.' },
      { id: 'n5', label: 'Phase 4: Global Deployment', subtext: 'Edge Node Live Sync', category: 'deploy', x: 150, y: 130, radius: 26, color: '#38bdf8', status: 'complete', meta: 'Shipping verified binaries to public and edge environments.' }
    ];
    this.links = [
      { from: 'n1', to: 'n2' },
      { from: 'n1', to: 'n3' },
      { from: 'n2', to: 'n4' },
      { from: 'n3', to: 'n4' },
      { from: 'n4', to: 'n5' }
    ];
    this.spawnPackets();
    this.selectedNode = this.nodes[0];
    this.updateNodeInspector(this.nodes[0]);
  }

  spawnPackets() {
    this.packets = [];
    this.links.forEach((link, idx) => {
      this.packets.push({
        linkIdx: idx,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005,
        color: '#ffffff'
      });
    });
  }

  addCustomNode(label = 'New Thought Subroutine') {
    const id = 'node_' + Date.now();
    const angle = Math.random() * Math.PI * 2;
    const dist = 180 + Math.random() * 60;
    const newNode = {
      id,
      label,
      subtext: 'User Generated Branch',
      category: 'custom',
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      radius: 26,
      color: '#38bdf8',
      status: 'active',
      meta: 'Custom branch added by user for extended ideation.'
    };
    this.nodes.push(newNode);
    if (this.nodes.length > 1) {
      this.links.push({ from: this.nodes[0].id, to: id });
      this.packets.push({
        linkIdx: this.links.length - 1,
        progress: 0,
        speed: 0.006,
        color: '#38bdf8'
      });
    }
    this.selectedNode = newNode;
    this.updateNodeInspector(newNode);
  }

  updateNodeInspector(node) {
    const titleEl = document.getElementById('neural-node-title');
    const subEl = document.getElementById('neural-node-subtext');
    const descEl = document.getElementById('neural-node-desc');
    const badgeEl = document.getElementById('neural-node-status');

    if (titleEl) titleEl.textContent = node.label;
    if (subEl) subEl.textContent = node.subtext;
    if (descEl) descEl.textContent = node.meta || 'Neural node executing in distributed memory space.';
    if (badgeEl) {
      badgeEl.textContent = (node.status || 'ACTIVE').toUpperCase();
      badgeEl.className = `px-2 py-0.5 rounded text-xs font-mono tracking-wider ${node.status === 'complete' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'}`;
    }
  }

  startAnimation() {
    const loop = () => {
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    if (!this.animFrameId) {
      loop();
    }
  }

  stopAnimation() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear with dark holographic backdrop
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, w, h);

    // Cyber background grid
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.scale, this.scale);

    this.drawGrid(ctx);
    this.drawParticles(ctx);
    this.drawLinks(ctx);
    this.drawPackets(ctx);
    this.drawNodes(ctx);

    ctx.restore();
  }

  drawGrid(ctx) {
    const gridSize = 60;
    const startX = -1200;
    const endX = 1200;
    const startY = -800;
    const endY = 800;

    ctx.strokeStyle = 'rgba(14, 165, 233, 0.06)';
    ctx.lineWidth = 1;

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }

  drawParticles(ctx) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < -1200) p.x = 1200;
      if (p.x > 1200) p.x = -1200;
      if (p.y < -800) p.y = 800;
      if (p.y > 800) p.y = -800;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawLinks(ctx) {
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    this.links.forEach(link => {
      const fromNode = nodeMap.get(link.from);
      const toNode = nodeMap.get(link.to);
      if (!fromNode || !toNode) return;

      const grad = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
      grad.addColorStop(0, 'rgba(0, 210, 255, 0.45)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.45)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    });
  }

  drawPackets(ctx) {
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    this.packets.forEach(packet => {
      const link = this.links[packet.linkIdx];
      if (!link) return;
      const fromNode = nodeMap.get(link.from);
      const toNode = nodeMap.get(link.to);
      if (!fromNode || !toNode) return;

      packet.progress += packet.speed;
      if (packet.progress > 1) packet.progress = 0;

      const px = fromNode.x + (toNode.x - fromNode.x) * packet.progress;
      const py = fromNode.y + (toNode.y - fromNode.y) * packet.progress;

      ctx.save();
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawNodes(ctx) {
    this.nodes.forEach(node => {
      const isSelected = this.selectedNode === node;
      const isHovered = this.hoveredNode === node;

      ctx.save();
      // Outer aura ring
      if (isSelected || isHovered) {
        ctx.shadowColor = node.color || '#00d2ff';
        ctx.shadowBlur = 24;
        ctx.strokeStyle = node.color || '#00d2ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Main Node Body Gradient
      const grad = ctx.createRadialGradient(
        node.x - node.radius * 0.3,
        node.y - node.radius * 0.3,
        2,
        node.x,
        node.y,
        node.radius
      );
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#020617');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Border with Node category color
      ctx.strokeStyle = node.color || '#00d2ff';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Inner pulse dot
      ctx.fillStyle = node.color || '#00d2ff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Node Label
      ctx.font = '600 12px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, node.x, node.y + node.radius + 8);

      // Node subtext
      if (node.subtext) {
        ctx.font = '400 10px "Inter", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.subtext, node.x, node.y + node.radius + 24);
      }

      ctx.restore();
    });
  }

  exportPNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = `OM-Neural-Canvas-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  resetView() {
    if (!this.canvas) return;
    this.scale = 1.0;
    this.offset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
  }
}

// Global initialization singleton
window.OMNeuralCanvas = OMNeuralCanvas;
window.omNeuralCanvas = null;
