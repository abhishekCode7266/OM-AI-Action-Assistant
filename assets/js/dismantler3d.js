/**
 * OM AI Assistant - 3D Dismantler & Exploded View Inspector Engine
 * Pure HTML5 3D Perspective Canvas Engine (Zero External Dependencies)
 * Supports full 3D CAD deconstruction, smooth 0-100% Explosion Slider,
 * 360° orbital rotation, interactive component telemetry,
 * 3D Process Image Blueprint generation, and 3D Process Video generation.
 */

class OMDismantler3D {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.currentModelType = 'car'; // 'car', 'turbine', 'robot'
    this.explosionFactor = 0.55; // 0.0 (assembled) to 1.0 (fully dismantled)
    this.rotX = 0.35;
    this.rotY = -0.65;
    this.zoom = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.selectedPartId = null;
    this.hoveredPartId = null;
    this.animFrameId = null;
    this.isRecordingVideo = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];

    this.models = {
      car: this.buildSupercarModel(),
      turbine: this.buildTurbineModel(),
      robot: this.buildRoboticsModel()
    };
  }

  buildSupercarModel() {
    return {
      name: "Apex Cyber-EV Hypercar (Autonomous Twin-Motor Powertrain)",
      parts: [
        {
          id: 'body_shell',
          name: 'Aerodynamic Outer Shell & Doors',
          category: 'Aero Structure',
          color: 'rgba(56, 189, 248, 0.85)',
          edgeColor: '#38bdf8',
          basePos: [0, -35, 0],
          explodeVec: [0, -110, 0],
          size: [140, 24, 75],
          material: "Pre-preg Toray T1000 Dry Carbon Fiber",
          weight: "84.5 kg",
          tolerance: "±0.002 mm",
          specs: "Downforce coefficient: -1.45 at 250 km/h with active drag reduction flaps",
          instructions: "Step 1: Release 16 titanium quick-release aero fasteners along roof rail."
        },
        {
          id: 'chassis',
          name: 'Carbon-Titanium Monocoque Chassis',
          category: 'Core Structural Frame',
          color: 'rgba(71, 85, 105, 0.9)',
          edgeColor: '#94a3b8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [130, 22, 60],
          material: "Carbo-Titanium HP62 Monocoque & 7075-T6 Subframes",
          weight: "118.0 kg",
          tolerance: "±0.001 mm",
          specs: "Torsional rigidity: 58,000 Nm/degree • Integrated FIA crash-box",
          instructions: "Step 2: Center reference datum for all mounting points."
        },
        {
          id: 'powertrain_rear',
          name: 'Twin-Turbo V8 / Dual High-Output Electric Motors',
          category: 'Propulsion Array',
          color: 'rgba(239, 68, 68, 0.88)',
          edgeColor: '#f87171',
          basePos: [-45, 2, 0],
          explodeVec: [-95, 0, 0],
          size: [48, 30, 42],
          material: "Billet 6061-T6 Aluminum with Ceramic Plasma Coated Liners",
          weight: "92.4 kg",
          tolerance: "±0.0005 mm",
          specs: "Peak output: 1,150 HP @ 10,200 RPM • 1,280 Nm Torque • 800V Architecture",
          instructions: "Step 3: Disconnect high-voltage bus bar and dual coolant manifold couplings."
        },
        {
          id: 'battery_pack',
          name: '100kWh Liquid-Cooled Structural Battery Pack',
          category: 'Energy Storage System',
          color: 'rgba(16, 185, 129, 0.85)',
          edgeColor: '#34d399',
          basePos: [5, 18, 0],
          explodeVec: [0, 95, 0],
          size: [85, 14, 52],
          material: "Silicon-Graphene Cylindrical Cells in Die-Cast Aluminum Enclosure",
          weight: "380.0 kg",
          tolerance: "±0.005 mm",
          specs: "800V DC Fast Charging (10-80% in 12 mins) • Sub-zero thermal jacket",
          instructions: "Step 4: Engage safety isolation interlock before dropping underbody shield."
        },
        {
          id: 'suspension_front',
          name: 'Double-Wishbone Pushrod Suspension & Steering',
          category: 'Running Gear (Front)',
          color: 'rgba(245, 158, 11, 0.88)',
          edgeColor: '#fbbf24',
          basePos: [55, 6, 0],
          explodeVec: [100, 0, 0],
          size: [36, 26, 68],
          material: "Additively Manufactured Ti-6Al-4V Titanium Uprights",
          weight: "32.6 kg",
          tolerance: "±0.003 mm",
          specs: "Active magnetorheological dampers • Dynamic 4-wheel steer angle ±4.5°",
          instructions: "Step 5: Relieve hydraulic damper preload before unbolting wishbone pivots."
        },
        {
          id: 'cockpit_hud',
          name: 'Holographic Avionics & Cockpit Electronics',
          category: 'Control & Telemetry',
          color: 'rgba(168, 85, 247, 0.85)',
          edgeColor: '#c084fc',
          basePos: [15, -16, 0],
          explodeVec: [0, -65, -45],
          size: [42, 18, 44],
          material: "Micro-OLED Curved Instrument Cluster with Neural Gesture Sensor",
          weight: "14.2 kg",
          tolerance: "±0.01 mm",
          specs: "Twin redundant Nvidia Drive Orin compute cores • AR Windshield Projection",
          instructions: "Step 6: Unclip optical CAN-FD harness from behind dash firewall."
        },
        {
          id: 'wheels_left',
          name: 'Carbon-Ceramic Rotors & Forged Mag Wheels (Port)',
          category: 'Wheel Assembly',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [0, 10, -42],
          explodeVec: [0, 0, -90],
          size: [110, 32, 14],
          material: "Monoblock Forged Magnesium Alloy & Carbon Silicon-Carbide (CSiC)",
          weight: "26.4 kg (Set)",
          tolerance: "±0.002 mm",
          specs: "420mm front rotors • 10-piston monobloc titanium calipers",
          instructions: "Step 7: Torque center-lock wheel nuts to 650 Nm with precision socket."
        },
        {
          id: 'wheels_right',
          name: 'Carbon-Ceramic Rotors & Forged Mag Wheels (Starboard)',
          category: 'Wheel Assembly',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [0, 10, 42],
          explodeVec: [0, 0, 90],
          size: [110, 32, 14],
          material: "Monoblock Forged Magnesium Alloy & Carbon Silicon-Carbide (CSiC)",
          weight: "26.4 kg (Set)",
          tolerance: "±0.002 mm",
          specs: "420mm front rotors • 10-piston monobloc titanium calipers",
          instructions: "Step 8: Mirror of Port side assembly with reverse-threaded center lock."
        },
        {
          id: 'rear_wing',
          name: 'Active Aerodynamic Rear Wing & Venturi Diffuser',
          category: 'Aero Dynamics',
          color: 'rgba(236, 72, 153, 0.88)',
          edgeColor: '#f472b6',
          basePos: [-72, -22, 0],
          explodeVec: [-110, -45, 0],
          size: [28, 12, 70],
          material: "High-Modulus Carbon Fiber with Electro-Hydraulic Actuation",
          weight: "9.8 kg",
          tolerance: "±0.005 mm",
          specs: "Variable angle of attack: -2° to +38° (Airbrake configuration)",
          instructions: "Step 9: Disconnect hydraulic actuator lines and slide wing pylons rearward."
        }
      ]
    };
  }

  buildTurbineModel() {
    return {
      name: "Mach-4 Variable-Cycle Jet Turbine Engine",
      parts: [
        {
          id: 'turb_compressor',
          name: 'Multi-Stage Blisk Fan & Low-Pressure Compressor',
          category: 'Inlet & Compression',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [65, 0, 0],
          explodeVec: [120, 0, 0],
          size: [32, 60, 60],
          material: "Single-Crystal Inconel 718 & Titanium Blisks",
          weight: "145.0 kg",
          tolerance: "±0.0002 mm",
          specs: "Pressure ratio 38:1 • 14,500 RPM max continuous",
          instructions: "Step 1: Mount on rotary overhaul balance cradle."
        },
        {
          id: 'turb_combustion',
          name: 'Annular Combustor with Ceramic Matrix Liners',
          category: 'Thermal Reactor',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [15, 0, 0],
          explodeVec: [20, 75, 0],
          size: [36, 52, 52],
          material: "Ceramic Matrix Composite (CMC) Oxide/Oxide",
          weight: "68.2 kg",
          tolerance: "±0.001 mm",
          specs: "Turbine entry temperature: 1,750°C (3,182°F)",
          instructions: "Step 2: Inspect 18 atomizing fuel injector nozzles."
        },
        {
          id: 'turb_high_turbine',
          name: 'High-Pressure Turbine Rotor & Air-Cooled Vanes',
          category: 'Power Extraction',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [-25, 0, 0],
          explodeVec: [-60, 0, 0],
          size: [30, 56, 56],
          material: "CMSX-4 Fourth-Generation Single Crystal Superalloy",
          weight: "82.5 kg",
          tolerance: "±0.0001 mm",
          specs: "Internal serpentine cooling passages with film discharge",
          instructions: "Step 3: Measure tip clearance tolerances across 48 rotor stages."
        },
        {
          id: 'turb_afterburner',
          name: 'Vectoring Afterburner Nozzle & Flame Holders',
          category: 'Exhaust Acceleration',
          color: 'rgba(168, 85, 247, 0.9)',
          edgeColor: '#c084fc',
          basePos: [-75, 0, 0],
          explodeVec: [-130, 0, 0],
          size: [44, 62, 62],
          material: "Titanium Aluminide (TiAl) with Thermal Barrier Coating (TBC)",
          weight: "110.0 kg",
          tolerance: "±0.005 mm",
          specs: "Thrust with afterburner: 35,000 lbf • 3D Pitch/Yaw vectoring ±20°",
          instructions: "Step 4: Decouple 6 ring actuators and divergent nozzle flaps."
        },
        {
          id: 'turb_housing',
          name: 'Outer Bypass Casing & Acoustic Liners',
          category: 'Outer Containment',
          color: 'rgba(148, 163, 184, 0.85)',
          edgeColor: '#e2e8f0',
          basePos: [0, 0, 0],
          explodeVec: [0, -90, 0],
          size: [120, 70, 70],
          material: "Kevlar Wrapped Titanium Containment Ring",
          weight: "190.0 kg",
          tolerance: "±0.002 mm",
          specs: "Uncontained blade containment certified to FAA Part 33",
          instructions: "Step 5: Split upper and lower stator casings along horizontal flange."
        }
      ]
    };
  }

  buildRoboticsModel() {
    return {
      name: "Bipedal Autonomous Robotics Core (Dynamic Hydraulic Actuation)",
      parts: [
        {
          id: 'rob_head',
          name: 'Stereo Vision & LiDAR Sensor Pod',
          category: 'Perception Suite',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [0, -65, 0],
          explodeVec: [0, -110, 0],
          size: [28, 22, 26],
          material: "Gorilla Glass Victus Optical Dome & Magnesium Frame",
          weight: "4.8 kg",
          tolerance: "±0.005 mm",
          specs: "128-beam solid-state LiDAR • Dual 4K 120fps stereo depth cameras",
          instructions: "Step 1: Release dual-axis pan/tilt neck gimbal locks."
        },
        {
          id: 'rob_torso',
          name: 'Titanium Exoskeletal Torso & Hydraulic Power Pack',
          category: 'Core Chassis',
          color: 'rgba(71, 85, 105, 0.9)',
          edgeColor: '#94a3b8',
          basePos: [0, -15, 0],
          explodeVec: [0, 0, 0],
          size: [48, 55, 34],
          material: "Titanium 6Al-4V Additive Lattice Frame",
          weight: "28.5 kg",
          tolerance: "±0.002 mm",
          specs: "Integrated 210-bar micro-hydraulic manifold • 3.2 kW Power density",
          instructions: "Step 2: Center structural reference point for all limb attachments."
        },
        {
          id: 'rob_arms_left',
          name: '7-DoF Dexterous Manipulator Arm (Port)',
          category: 'Limb Actuation',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [-38, -25, 0],
          explodeVec: [-90, -30, 0],
          size: [18, 70, 18],
          material: "High-Modulus Carbon Fiber Spars with Harmonic Drive Reducers",
          weight: "7.2 kg",
          tolerance: "±0.001 mm",
          specs: "Payload capacity: 25 kg • Tactile fingertip force sensing array",
          instructions: "Step 3: Unplug quick-disconnect shoulder bus interface."
        },
        {
          id: 'rob_arms_right',
          name: '7-DoF Dexterous Manipulator Arm (Starboard)',
          category: 'Limb Actuation',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [38, -25, 0],
          explodeVec: [90, -30, 0],
          size: [18, 70, 18],
          material: "High-Modulus Carbon Fiber Spars with Harmonic Drive Reducers",
          weight: "7.2 kg",
          tolerance: "±0.001 mm",
          specs: "Payload capacity: 25 kg • Tactile fingertip force sensing array",
          instructions: "Step 4: Mirror assembly of Port side manipulator arm."
        },
        {
          id: 'rob_legs',
          name: 'High-Torque Quasi-Direct Drive Bipedal Legs',
          category: 'Locomotion Engine',
          color: 'rgba(16, 185, 129, 0.9)',
          edgeColor: '#34d399',
          basePos: [0, 50, 0],
          explodeVec: [0, 95, 0],
          size: [36, 85, 28],
          material: "Aerospace 7075-T651 Aluminum Links with Carbon Protection Skids",
          weight: "34.0 kg (Pair)",
          tolerance: "±0.002 mm",
          specs: "Jump height: 1.6m • Top sprint velocity: 5.5 m/s • 360 Nm Peak hip torque",
          instructions: "Step 5: Relieve knee hydraulic pressure valves before disengaging hip sockets."
        }
      ]
    };
  }

  initModal(containerId = 'dismantle-3d-modal') {
    this.canvas = document.getElementById('dismantle-3d-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.setupInteractions();
    this.renderPartsListUI();
    this.render();
  }

  openModal(modelType = 'car') {
    this.currentModelType = modelType;
    const modal = document.getElementById('dismantle-3d-modal');
    if (modal) {
      modal.classList.add('active');
    }

    const titleEl = document.getElementById('dismantle-model-title');
    if (titleEl) {
      const model = this.models[this.currentModelType] || this.models.car;
      titleEl.textContent = model.name;
    }

    setTimeout(() => {
      this.initModal();
    }, 100);
  }

  closeModal() {
    const modal = document.getElementById('dismantle-3d-modal');
    if (modal) modal.classList.remove('active');
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  switchModel(modelType) {
    if (this.models[modelType]) {
      this.currentModelType = modelType;
      this.selectedPartId = null;
      const titleEl = document.getElementById('dismantle-model-title');
      if (titleEl) titleEl.textContent = this.models[modelType].name;
      this.renderPartsListUI();
      this.render();
    }
  }

  setExplosionFactor(val) {
    this.explosionFactor = Math.max(0, Math.min(1.0, parseFloat(val)));
    const sliderValEl = document.getElementById('explosion-slider-val');
    if (sliderValEl) {
      sliderValEl.textContent = `${Math.round(this.explosionFactor * 100)}%`;
    }
    this.render();
  }

  setupInteractions() {
    if (!this.canvas) return;

    // Mouse drag rotation
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.rotY += dx * 0.008;
        this.rotX += dy * 0.008;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.render();
      }
    });

    // Touch swipe rotation
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - this.lastMouseX;
        const dy = e.touches[0].clientY - this.lastMouseY;
        this.rotY += dx * 0.01;
        this.rotX += dy * 0.01;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        this.render();
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom - e.deltaY * 0.001));
      this.render();
    });

    // Explosion slider listener
    const slider = document.getElementById('dismantle-explosion-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.setExplosionFactor(e.target.value);
      });
    }
  }

  selectPart(partId) {
    this.selectedPartId = partId;
    this.renderPartsListUI();
    this.renderPartTelemetryUI(partId);
    this.render();
  }

  renderPartsListUI() {
    const listEl = document.getElementById('dismantle-parts-list');
    if (!listEl) return;

    const model = this.models[this.currentModelType] || this.models.car;
    let html = '';
    model.parts.forEach((p, idx) => {
      const isSel = p.id === this.selectedPartId;
      html += `
        <div class="dismantle-part-list-item ${isSel ? 'active' : ''}" onclick="window.omDismantler.selectPart('${p.id}')">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${p.edgeColor};"></span>
            <span style="font-weight: 600; font-size: 0.82rem; color: #fff;">${idx + 1}. ${p.name}</span>
          </div>
          <span style="font-size: 0.7rem; color: #94a3b8;">${p.category}</span>
        </div>
      `;
    });
    listEl.innerHTML = html;

    if (!this.selectedPartId && model.parts.length > 0) {
      this.selectPart(model.parts[0].id);
    }
  }

  renderPartTelemetryUI(partId) {
    const telemetryEl = document.getElementById('dismantle-part-telemetry');
    if (!telemetryEl) return;

    const model = this.models[this.currentModelType] || this.models.car;
    const part = model.parts.find(p => p.id === partId);
    if (!part) return;

    telemetryEl.innerHTML = `
      <div style="border-left: 3px solid ${part.edgeColor}; padding-left: 10px; margin-bottom: 12px;">
        <div style="font-size: 1.05rem; font-weight: 800; color: #fff;">${part.name}</div>
        <div style="font-size: 0.74rem; color: var(--om-cyan); text-transform: uppercase; letter-spacing: 0.05em;">${part.category}</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.78rem; margin-bottom: 12px;">
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
          <span style="color: #94a3b8; display: block; font-size: 0.68rem;">MATERIAL</span>
          <span style="font-weight: 700; color: #fff;">${part.material}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
          <span style="color: #94a3b8; display: block; font-size: 0.68rem;">WEIGHT</span>
          <span style="font-weight: 700; color: #fff;">${part.weight}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
          <span style="color: #94a3b8; display: block; font-size: 0.68rem;">TOLERANCE</span>
          <span style="font-weight: 700; color: #34d399;">${part.tolerance}</span>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
          <span style="color: #94a3b8; display: block; font-size: 0.68rem;">EXPLOSION OFFSET</span>
          <span style="font-weight: 700; color: var(--om-cyan);">${Math.round(this.explosionFactor * 100)}% DISMANTLED</span>
        </div>
      </div>
      <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--om-cyan); margin-bottom: 4px;">ENGINEERING SPECIFICATIONS</div>
        <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">${part.specs}</div>
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">DISASSEMBLY PROCEDURE</div>
        <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">${part.instructions}</div>
      </div>
    `;
  }

  // 3D Projection Math
  project3D(x, y, z, cx, cy) {
    // Rotation around Y
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // Rotation around X
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective scale
    const cameraDist = 450;
    const perspective = cameraDist / (cameraDist + z2);
    const screenX = cx + x1 * perspective * this.zoom;
    const screenY = cy + y2 * perspective * this.zoom;

    return { x: screenX, y: screenY, z: z2, scale: perspective * this.zoom };
  }

  render() {
    if (!this.canvas || !this.ctx) return;

    const width = this.canvas.width = this.canvas.clientWidth || 700;
    const height = this.canvas.height = this.canvas.clientHeight || 500;
    const cx = width / 2;
    const cy = height / 2;
    const ctx = this.ctx;

    // Background Gradient (Cyber CAD Blueprint dark grid)
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

    // Draw Cyber CAD Isometric Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
    ctx.lineWidth = 1;
    const gridSize = 40 * this.zoom;
    for (let gx = 0; gx < width; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    const model = this.models[this.currentModelType] || this.models.car;

    // Compute 3D positions with explosion factor
    const renderedParts = model.parts.map((p, idx) => {
      const curX = p.basePos[0] + p.explodeVec[0] * this.explosionFactor;
      const curY = p.basePos[1] + p.explodeVec[1] * this.explosionFactor;
      const curZ = p.basePos[2] + p.explodeVec[2] * this.explosionFactor;

      const proj = this.project3D(curX, curY, curZ, cx, cy);
      const baseProj = this.project3D(p.basePos[0], p.basePos[1], p.basePos[2], cx, cy);

      return {
        part: p,
        idx: idx + 1,
        pos3D: [curX, curY, curZ],
        proj: proj,
        baseProj: baseProj,
        depth: proj.z
      };
    });

    // Sort by depth (painter's algorithm)
    renderedParts.sort((a, b) => b.depth - a.depth);

    // 1. Draw connecting holographic explosion trajectory lines
    if (this.explosionFactor > 0.05) {
      renderedParts.forEach(rp => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rp.baseProj.x, rp.baseProj.y);
        ctx.lineTo(rp.proj.x, rp.proj.y);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Small base datum dot
        ctx.beginPath();
        ctx.arc(rp.baseProj.x, rp.baseProj.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fill();
        ctx.restore();
      });
    }

    // 2. Render each 3D box component
    renderedParts.forEach(rp => {
      const p = rp.part;
      const isSelected = p.id === this.selectedPartId;
      const [w, h, d] = p.size;
      const [px, py, pz] = rp.pos3D;

      // 8 Vertices of the 3D box
      const halfW = w / 2;
      const halfH = h / 2;
      const halfD = d / 2;

      const v = [
        this.project3D(px - halfW, py - halfH, pz - halfD, cx, cy),
        this.project3D(px + halfW, py - halfH, pz - halfD, cx, cy),
        this.project3D(px + halfW, py + halfH, pz - halfD, cx, cy),
        this.project3D(px - halfW, py + halfH, pz - halfD, cx, cy),
        this.project3D(px - halfW, py - halfH, pz + halfD, cx, cy),
        this.project3D(px + halfW, py - halfH, pz + halfD, cx, cy),
        this.project3D(px + halfW, py + halfH, pz + halfD, cx, cy),
        this.project3D(px - halfW, py + halfH, pz + halfD, cx, cy),
      ];

      // Faces definition
      const faces = [
        [0, 1, 2, 3], // Front
        [5, 4, 7, 6], // Back
        [4, 0, 3, 7], // Left
        [1, 5, 6, 2], // Right
        [4, 5, 1, 0], // Top
        [3, 2, 6, 7]  // Bottom
      ];

      faces.forEach(f => {
        ctx.beginPath();
        ctx.moveTo(v[f[0]].x, v[f[0]].y);
        ctx.lineTo(v[f[1]].x, v[f[1]].y);
        ctx.lineTo(v[f[2]].x, v[f[2]].y);
        ctx.lineTo(v[f[3]].x, v[f[3]].y);
        ctx.closePath();

        ctx.fillStyle = isSelected ? 'rgba(6, 182, 212, 0.45)' : p.color;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : p.edgeColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();
      });

      // Callout Tag & Number
      ctx.save();
      ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Circular number badge
      ctx.beginPath();
      ctx.arc(rp.proj.x, rp.proj.y - 12, 10, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#06b6d4' : 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.strokeStyle = p.edgeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(rp.idx, rp.proj.x, rp.proj.y - 12);

      if (isSelected || this.explosionFactor > 0.4) {
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
        ctx.fillText(p.name, rp.proj.x, rp.proj.y + 14);
      }
      ctx.restore();
    });

    // 3. Technical Blueprint Title Block in bottom-left
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, height - 70, 240, 56);
    ctx.strokeRect(16, height - 70, 240, 56);

    ctx.fillStyle = 'var(--om-cyan)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('OM CAD 3D EXPLODED DECONSTRUCTOR v2.0', 26, height - 52);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(model.name.substring(0, 28) + '...', 26, height - 36);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`EXPLOSION: ${Math.round(this.explosionFactor * 100)}% | ENGINEER: Abhishek singh Yadav`, 26, height - 22);
    ctx.restore();
  }

  /* =========================================================================
     3D Process Image Blueprint Generator (Export High-Res PNG)
     ========================================================================= */
  exportBlueprintImage() {
    if (!this.canvas) return;
    this.render();

    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `OM_3D_Exploded_Blueprint_${this.currentModelType}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    if (window.omApp) {
      window.omApp.showToast('📸 3D Process Blueprint exported successfully as PNG!', 'success');
    }
  }

  /* =========================================================================
     3D Process Video Generator (360° Assembly Animation Video Recording)
     ========================================================================= */
  generateAssemblyVideo() {
    if (!this.canvas || this.isRecordingVideo) return;
    this.isRecordingVideo = true;
    this.recordedChunks = [];

    const videoBtn = document.getElementById('btn-dismantle-generate-video');
    if (videoBtn) {
      videoBtn.innerHTML = '🎥 Generating 3D Video... (Orbiting)';
      videoBtn.disabled = true;
    }

    if (window.omApp) {
      window.omApp.showToast('🎥 Recording 3D Assembly & Orbit Video...', 'info');
    }

    try {
      const stream = this.canvas.captureStream(30); // 30 FPS
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `OM_3D_Assembly_Animation_${this.currentModelType}_${Date.now()}.webm`;
        link.href = videoUrl;
        link.click();

        this.isRecordingVideo = false;
        if (videoBtn) {
          videoBtn.innerHTML = '🎥 Generate 3D Video';
          videoBtn.disabled = false;
        }
        if (window.omApp) {
          window.omApp.showToast('✅ 3D Process Video recorded & downloaded!', 'success');
        }
      };

      this.mediaRecorder.start();

      // Run animated 360° camera orbit + disassembly sequence for 4.5 seconds
      const startTime = performance.now();
      const duration = 4500;
      const initialRotY = this.rotY;

      const animateSequence = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        // Orbit 360 degrees
        this.rotY = initialRotY + progress * Math.PI * 2;
        // Cycle explosion: 0 -> 1.0 -> 0
        this.explosionFactor = Math.sin(progress * Math.PI) * 0.95;

        const slider = document.getElementById('dismantle-explosion-slider');
        if (slider) slider.value = this.explosionFactor;
        const sliderValEl = document.getElementById('explosion-slider-val');
        if (sliderValEl) sliderValEl.textContent = `${Math.round(this.explosionFactor * 100)}%`;

        this.render();

        if (progress < 1.0) {
          requestAnimationFrame(animateSequence);
        } else {
          this.mediaRecorder.stop();
        }
      };

      requestAnimationFrame(animateSequence);
    } catch (e) {
      console.warn("MediaRecorder failed:", e);
      this.isRecordingVideo = false;
      if (videoBtn) {
        videoBtn.innerHTML = '🎥 Generate 3D Video';
        videoBtn.disabled = false;
      }
      if (window.omApp) {
        window.omApp.showToast('Video recording not supported in this browser. Exporting High-Res 3D Blueprint instead.', 'info');
      }
      this.exportBlueprintImage();
    }
  }

  /* =========================================================================
     Photo-to-3D Dismantler Deconstruction Handler
     ========================================================================= */
  processImageTo3DDismantle(imageName) {
    const lower = (imageName || '').toLowerCase();
    let detectedType = 'car';
    if (lower.includes('plane') || lower.includes('jet') || lower.includes('engine') || lower.includes('turbine')) {
      detectedType = 'turbine';
    } else if (lower.includes('robot') || lower.includes('humanoid') || lower.includes('drone')) {
      detectedType = 'robot';
    }
    this.openModal(detectedType);
  }
}

window.omDismantler = new OMDismantler3D();
