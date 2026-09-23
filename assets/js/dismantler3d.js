/**
 * OM AI Assistant - 3D Dismantler & Assemblable Studio (Meshy AI / Spline AI / Luma AI Style)
 * Pure HTML5 3D Perspective Canvas Engine (Zero External Dependencies)
 * 
 * Features:
 * 1. Text-to-3D Assemblable Model Generator (Prompt to Multi-Component 3D CAD)
 * 2. Interactive 0-100% Explosion / Deconstruction Slider
 * 3. Step-by-Step Magnetic Assembly Engine with Auto-Assemble Animation
 * 4. 360° Orbital Camera Drag, Pan, and Zoom
 * 5. Spline/Luma AI View Modes: PBR Solid, Holographic Wireframe, X-Ray Glass
 * 6. Direct 3D OBJ Wavefront Export (.obj) for Blender / Spline / 3D Printing
 * 7. 3D Technical Blueprint CAD PNG Export & 360° Video WebM Recording
 * 
 * Chief Architect: Udayast
 * Addressed as: Boss
 */

class OMDismantler3D {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.currentModelType = 'drone'; // default to high-tech assemblable drone
    this.explosionFactor = 0.45; // 0.0 (assembled) to 1.0 (fully dismantled)
    this.rotX = 0.35;
    this.rotY = -0.65;
    this.zoom = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.selectedPartId = null;
    this.hoveredPartId = null;
    this.animFrameId = null;

    // View & Assembly Mode
    this.viewMode = 'solid'; // 'solid', 'wireframe', 'xray'
    this.assemblyMode = 'explode'; // 'explode' or 'assembly'
    this.assemblyStep = 1;
    this.isAutoAssembling = false;
    this.autoAssembleTimer = null;

    // Video Recording
    this.isRecordingVideo = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];

    // Pre-built & Procedural Assemblable Models
    this.models = {
      drone: this.buildDroneModel(),
      hand: this.buildBionicHandModel(),
      car: this.buildSupercarModel(),
      turbine: this.buildTurbineModel(),
      robot: this.buildRoboticsModel(),
      satellite: this.buildSatelliteModel(),
      blaster: this.buildBlasterModel(),
      engine: this.buildV8EngineModel()
    };
  }

  /* =========================================================================
     Model 1: Combat Recon Drone (Assemblable)
     ========================================================================= */
  buildDroneModel() {
    return {
      name: "Apex Valkyrie X-4 Autonomous Drone",
      category: "Aerospace Robotics",
      prompt: "Combat Recon Quad-Rotor Drone",
      parts: [
        {
          id: 'drone_core',
          name: 'Central Titanium Avionics Core',
          category: 'Core Subsystem',
          color: 'rgba(30, 41, 59, 0.92)',
          edgeColor: '#38bdf8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [60, 24, 60],
          material: "Grade 5 Titanium & Beryllium Alloy",
          weight: "2.4 kg",
          tolerance: "±0.001 mm",
          specs: "Dual redundant flight controllers with neural obstacle avoidance.",
          step: 1,
          instructions: "Step 1: Secure primary datum frame to assembly jig."
        },
        {
          id: 'drone_battery',
          name: 'Solid-State High-Energy Power Cell',
          category: 'Energy Storage',
          color: 'rgba(16, 185, 129, 0.88)',
          edgeColor: '#34d399',
          basePos: [0, 16, 0],
          explodeVec: [0, 80, 0],
          size: [48, 14, 48],
          material: "Lithium-Sulfur Solid-State Matrix",
          weight: "1.8 kg",
          tolerance: "±0.005 mm",
          specs: "4,200 mAh @ 28.8V • 45 min loiter duration.",
          step: 2,
          instructions: "Step 2: Insert energy block into ventral locking channel."
        },
        {
          id: 'drone_arms',
          name: 'Toray T1000 Carbon Quad Rotor Booms',
          category: 'Airframe Structure',
          color: 'rgba(71, 85, 105, 0.9)',
          edgeColor: '#94a3b8',
          basePos: [0, -2, 0],
          explodeVec: [0, -45, 0],
          size: [140, 10, 140],
          material: "Pre-preg Filament-Wound Carbon Fiber",
          weight: "1.2 kg",
          tolerance: "±0.002 mm",
          specs: "High torsional stiffness boom spar matrix.",
          step: 3,
          instructions: "Step 3: Fasten 8 M3 titanium bolts to central core."
        },
        {
          id: 'drone_motors',
          name: 'Brushless High-Torque Outrunners (4x)',
          category: 'Propulsion Assembly',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [0, -14, 0],
          explodeVec: [0, -90, 0],
          size: [130, 18, 130],
          material: "Neodymium N52SH Magnets & Enameled Copper",
          weight: "0.95 kg",
          tolerance: "±0.0005 mm",
          specs: "2,200 KV • 1.8 kW combined thrust to weight 4.2:1.",
          step: 4,
          instructions: "Step 4: Align motor shafts with vibration-damping bushings."
        },
        {
          id: 'drone_propellers',
          name: 'Aero-Acoustic Carbon-Fiber Rotors',
          category: 'Aero Lift Surface',
          color: 'rgba(6, 182, 212, 0.85)',
          edgeColor: '#22d3ee',
          basePos: [0, -26, 0],
          explodeVec: [0, -135, 0],
          size: [150, 6, 150],
          material: "Compression-Molded Carbon Aero Foil",
          weight: "0.22 kg",
          tolerance: "±0.001 mm",
          specs: "Toroidal low-noise rotor tip geometry.",
          step: 5,
          instructions: "Step 5: Hand-tighten self-locking CW/CCW propeller nuts."
        },
        {
          id: 'drone_gimbal',
          name: '3-Axis Stabilized 8K Multispectral Gimbal',
          category: 'Sensor Payload',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [0, -18, 28],
          explodeVec: [0, -50, 95],
          size: [24, 22, 26],
          material: "CNC 7075-T6 Anodized Aluminum",
          weight: "0.45 kg",
          tolerance: "±0.002 mm",
          specs: "FLIR Thermal + 8K Optical + LiDAR rangefinder.",
          step: 6,
          instructions: "Step 6: Clip optical ribbon bus into front sensor header."
        },
        {
          id: 'drone_canopy',
          name: 'Radar-Absorbent Stealth Top Canopy',
          category: 'Aero Fairing',
          color: 'rgba(168, 85, 247, 0.88)',
          edgeColor: '#c084fc',
          basePos: [0, -18, 0],
          explodeVec: [0, -95, 0],
          size: [52, 16, 52],
          material: "Kevlar-Reinforced Metamaterial Composite",
          weight: "0.38 kg",
          tolerance: "±0.005 mm",
          specs: "Electromagnetic shielding against EMP pulses.",
          step: 7,
          instructions: "Step 7: Snap magnetic top cowl to finish assembly."
        }
      ]
    };
  }

  /* =========================================================================
     Model 2: Bionic Cybernetic Hand (Assemblable)
     ========================================================================= */
  buildBionicHandModel() {
    return {
      name: "CyberGrip Pro Bionic Hand (Myoelectric Prosthetic)",
      category: "Biomechatronics",
      prompt: "Bionic Cybernetic Hand",
      parts: [
        {
          id: 'hand_palm',
          name: 'Carbon-Titanium Palm Metacarpal Frame',
          category: 'Structural Chassis',
          color: 'rgba(30, 41, 59, 0.9)',
          edgeColor: '#94a3b8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [60, 65, 24],
          material: "Additive Ti-6Al-4V Medical Grade Lattice",
          weight: "0.42 kg",
          tolerance: "±0.001 mm",
          specs: "Integrated bus routing for 6 independent finger tendons.",
          step: 1,
          instructions: "Step 1: Anchor palm base to wrist bearing bracket."
        },
        {
          id: 'hand_servos',
          name: 'Brushless Micro-Actuator Transmission (6x)',
          category: 'Drive Actuation',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [0, 8, 0],
          explodeVec: [0, 75, 0],
          size: [48, 42, 18],
          material: "Cobalt-Samarium Magnetic Motors & Planetary Gears",
          weight: "0.28 kg",
          tolerance: "±0.0005 mm",
          specs: "Max grip force: 140 N per digit • Response latency: 12 ms.",
          step: 2,
          instructions: "Step 2: Bolt motor block to internal palm cavity."
        },
        {
          id: 'hand_thumb',
          name: 'Circumductive Articulated Thumb Digit',
          category: 'Opposable Gripper',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [-36, -8, 0],
          explodeVec: [-95, -20, 0],
          size: [24, 46, 18],
          material: "PEEK Polymer with Conductive Silicone Pad",
          weight: "0.08 kg",
          tolerance: "±0.002 mm",
          specs: "2 active Degrees of Freedom (Flexion + Opposition).",
          step: 3,
          instructions: "Step 3: Connect dual-axis thumb gimbal pin."
        },
        {
          id: 'hand_index',
          name: 'Index Phalange & Tactile Pressure Sensor',
          category: 'Digit Assembly',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [-18, -48, 0],
          explodeVec: [-30, -95, 0],
          size: [14, 52, 16],
          material: "Carbon-Reinforced PEEK with Piezo Fingertip",
          weight: "0.06 kg",
          tolerance: "±0.001 mm",
          specs: "Resolves 0.05 N pressure variation for egg grasping.",
          step: 4,
          instructions: "Step 4: Thread synthetic Dyneema tendon through guide loop."
        },
        {
          id: 'hand_middle',
          name: 'Middle Phalange Heavy-Load Digit',
          category: 'Digit Assembly',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [-2, -54, 0],
          explodeVec: [0, -115, 0],
          size: [14, 58, 16],
          material: "Carbon-Reinforced PEEK with Silicone Grip",
          weight: "0.07 kg",
          tolerance: "±0.001 mm",
          specs: "Sustains 50 kg direct deadlift load per finger.",
          step: 5,
          instructions: "Step 5: Pin primary joint pivot with stainless needle bearings."
        },
        {
          id: 'hand_ring_pinky',
          name: 'Ring & Little Finger Dual Unit',
          category: 'Digit Assembly',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [20, -46, 0],
          explodeVec: [45, -95, 0],
          size: [24, 48, 16],
          material: "Carbon-Reinforced PEEK",
          weight: "0.09 kg",
          tolerance: "±0.001 mm",
          specs: "Conformable adaptive wrap grasp on irregular shapes.",
          step: 6,
          instructions: "Step 6: Secure lateral metacarpal pivot rod."
        },
        {
          id: 'hand_wrist',
          name: 'Myoelectric Wrist Quick-Disconnect Unit',
          category: 'Interface Coupling',
          color: 'rgba(168, 85, 247, 0.88)',
          edgeColor: '#c084fc',
          basePos: [0, 48, 0],
          explodeVec: [0, 110, 0],
          size: [52, 26, 32],
          material: "Anodized Aerospace 7075-T6 Aluminum",
          weight: "0.32 kg",
          tolerance: "±0.002 mm",
          specs: "360° continuous rotation with 12-channel gold slip rings.",
          step: 7,
          instructions: "Step 7: Lock wrist ring with knurled quick-release collar."
        }
      ]
    };
  }

  /* =========================================================================
     Model 3: Apex Cyber-EV Hypercar
     ========================================================================= */
  buildSupercarModel() {
    return {
      name: "Apex Cyber-EV Hypercar (Autonomous Powertrain)",
      category: "Automotive Engineering",
      prompt: "Cyber-EV Hypercar",
      parts: [
        {
          id: 'body_shell',
          name: 'Aerodynamic Outer Shell & Butterfly Doors',
          category: 'Aero Structure',
          color: 'rgba(56, 189, 248, 0.85)',
          edgeColor: '#38bdf8',
          basePos: [0, -35, 0],
          explodeVec: [0, -110, 0],
          size: [140, 24, 75],
          material: "Pre-preg Toray T1000 Dry Carbon Fiber",
          weight: "84.5 kg",
          tolerance: "±0.002 mm",
          specs: "Downforce coefficient: -1.45 at 250 km/h with active aero flaps.",
          step: 1,
          instructions: "Step 1: Release 16 titanium quick-release aero fasteners."
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
          specs: "Torsional rigidity: 58,000 Nm/degree • Integrated crash-box.",
          step: 2,
          instructions: "Step 2: Center reference datum for all suspension brackets."
        },
        {
          id: 'powertrain_rear',
          name: 'Dual High-Output Electric Motors (Rear)',
          category: 'Propulsion Array',
          color: 'rgba(239, 68, 68, 0.88)',
          edgeColor: '#f87171',
          basePos: [-45, 2, 0],
          explodeVec: [-95, 0, 0],
          size: [48, 30, 42],
          material: "Billet 6061-T6 Aluminum with Ceramic Plasma Coated Liners",
          weight: "92.4 kg",
          tolerance: "±0.0005 mm",
          specs: "1,150 HP @ 18,000 RPM • 1,280 Nm Torque • 800V Silicon Carbide.",
          step: 3,
          instructions: "Step 3: Disconnect high-voltage bus bar and coolant lines."
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
          material: "Silicon-Graphene Cylindrical Cells in Cast Aluminum",
          weight: "380.0 kg",
          tolerance: "±0.005 mm",
          specs: "800V DC Fast Charging (10-80% in 12 mins).",
          step: 4,
          instructions: "Step 4: Engage safety isolation interlock before dropping tray."
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
          specs: "Active magnetorheological dampers • Dynamic 4-wheel steer.",
          step: 5,
          instructions: "Step 5: Relieve hydraulic damper preload before unbolting."
        },
        {
          id: 'wheels_left',
          name: 'Carbon-Ceramic Rotors & Forged Mag Wheels',
          category: 'Wheel Assembly',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [0, 10, -42],
          explodeVec: [0, 0, -90],
          size: [110, 32, 14],
          material: "Forged Magnesium Alloy & Carbon Silicon-Carbide",
          weight: "26.4 kg",
          tolerance: "±0.002 mm",
          specs: "420mm front rotors • 10-piston monobloc calipers.",
          step: 6,
          instructions: "Step 6: Torque center-lock wheel nut to 650 Nm."
        }
      ]
    };
  }

  /* =========================================================================
     Model 4: Mach-4 Jet Turbine
     ========================================================================= */
  buildTurbineModel() {
    return {
      name: "Mach-4 Variable-Cycle Afterburning Turbofan",
      category: "Aerospace Propulsion",
      prompt: "Jet Turbine Engine",
      parts: [
        {
          id: 'turb_fan',
          name: 'Wide-Chord Hollow Titanium Fan Stage',
          category: 'Intake & Compression',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [65, 0, 0],
          explodeVec: [120, 0, 0],
          size: [35, 64, 64],
          material: "Superplastically Formed Ti-6Al-4V Titanium",
          weight: "95.0 kg",
          tolerance: "±0.0005 mm",
          specs: "Bypass ratio: 0.35 • Air mass flow: 145 kg/sec.",
          step: 1,
          instructions: "Step 1: Mount forward fan rotor onto low-pressure shaft."
        },
        {
          id: 'turb_combustor',
          name: 'Annular Low-Emissions Combustion Chamber',
          category: 'Thermal Reactor',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [15, 0, 0],
          explodeVec: [20, 75, 0],
          size: [36, 52, 52],
          material: "Ceramic Matrix Composite (CMC) Oxide/Oxide",
          weight: "68.2 kg",
          tolerance: "±0.001 mm",
          specs: "Turbine entry temperature: 1,750°C.",
          step: 2,
          instructions: "Step 2: Inspect 18 atomizing fuel injector nozzles."
        },
        {
          id: 'turb_high_turbine',
          name: 'High-Pressure Single-Crystal Turbine Rotor',
          category: 'Power Extraction',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [-25, 0, 0],
          explodeVec: [-60, 0, 0],
          size: [30, 56, 56],
          material: "CMSX-4 Fourth-Generation Single Crystal Superalloy",
          weight: "82.5 kg",
          tolerance: "±0.0001 mm",
          specs: "Internal serpentine cooling passages with film discharge.",
          step: 3,
          instructions: "Step 3: Measure tip clearance tolerances across rotor stages."
        },
        {
          id: 'turb_afterburner',
          name: '3D Vectoring Afterburner Nozzle',
          category: 'Exhaust Acceleration',
          color: 'rgba(168, 85, 247, 0.9)',
          edgeColor: '#c084fc',
          basePos: [-75, 0, 0],
          explodeVec: [-130, 0, 0],
          size: [44, 62, 62],
          material: "Titanium Aluminide (TiAl) with Thermal Barrier Coating",
          weight: "110.0 kg",
          tolerance: "±0.005 mm",
          specs: "Thrust with afterburner: 35,000 lbf • 3D Pitch/Yaw ±20°.",
          step: 4,
          instructions: "Step 4: Decouple 6 ring actuators and nozzle flaps."
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
          specs: "FAA certified uncontained blade containment casing.",
          step: 5,
          instructions: "Step 5: Split upper and lower casing along flange."
        }
      ]
    };
  }

  /* =========================================================================
     Model 5: Bipedal Autonomous Robot Core
     ========================================================================= */
  buildRoboticsModel() {
    return {
      name: "Bipedal Autonomous Robotics Core (Dynamic Actuation)",
      category: "Humanoid Robotics",
      prompt: "Humanoid Autonomous Robot",
      parts: [
        {
          id: 'rob_head',
          name: 'Stereo Vision & LiDAR Sensor Dome',
          category: 'Perception Suite',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [0, -65, 0],
          explodeVec: [0, -110, 0],
          size: [28, 22, 26],
          material: "Gorilla Glass Victus Optical Dome & Magnesium",
          weight: "4.8 kg",
          tolerance: "±0.005 mm",
          specs: "128-beam solid-state LiDAR • Dual 4K 120fps cameras.",
          step: 1,
          instructions: "Step 1: Release dual-axis pan/tilt neck gimbal locks."
        },
        {
          id: 'rob_torso',
          name: 'Titanium Exoskeletal Torso Frame',
          category: 'Core Chassis',
          color: 'rgba(71, 85, 105, 0.9)',
          edgeColor: '#94a3b8',
          basePos: [0, -15, 0],
          explodeVec: [0, 0, 0],
          size: [48, 55, 34],
          material: "Titanium 6Al-4V Additive Lattice Frame",
          weight: "28.5 kg",
          tolerance: "±0.002 mm",
          specs: "Integrated 210-bar micro-hydraulic manifold.",
          step: 2,
          instructions: "Step 2: Center structural reference point for limb brackets."
        },
        {
          id: 'rob_arms_left',
          name: '7-DoF Dexterous Manipulator Arm (Port)',
          category: 'Limb Actuation',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [-36, -20, 0],
          explodeVec: [-80, -20, 0],
          size: [18, 58, 18],
          material: "Carbon-Fiber Tube with Harmonized Cycloidal Drives",
          weight: "8.2 kg",
          tolerance: "±0.001 mm",
          specs: "Payload capacity: 20 kg at full extension.",
          step: 3,
          instructions: "Step 3: Unbolt 4 M8 shoulder bolts and optical CAN lines."
        },
        {
          id: 'rob_legs',
          name: 'High-Torque Quasi-Direct Drive Leg Assembly',
          category: 'Locomotion Engine',
          color: 'rgba(16, 185, 129, 0.9)',
          edgeColor: '#34d399',
          basePos: [0, 50, 0],
          explodeVec: [0, 105, 0],
          size: [44, 75, 28],
          material: "Forged 7075-T6 Aluminum Links & Brushless Actuators",
          weight: "36.0 kg",
          tolerance: "±0.002 mm",
          specs: "Backdrivable torque density: 42 Nm/kg • 4 m/s sprint speed.",
          step: 4,
          instructions: "Step 4: Lock knee flexion brakes before pelvis disassembly."
        }
      ]
    };
  }

  /* =========================================================================
     Model 6: Orbital Deep-Space Satellite
     ========================================================================= */
  buildSatelliteModel() {
    return {
      name: "Helios-9 Deep Space Quantum Satellite",
      category: "Spacecraft Engineering",
      prompt: "Orbital Spacecraft Satellite",
      parts: [
        {
          id: 'sat_bus',
          name: 'Hexagonal Carbon Avionics Bus',
          category: 'Core Satellite Bus',
          color: 'rgba(30, 41, 59, 0.92)',
          edgeColor: '#38bdf8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [55, 60, 55],
          material: "Aluminum-Lithium 2195 & Gold Mylar Insulation",
          weight: "450 kg",
          tolerance: "±0.001 mm",
          specs: "Rad-hardened space compute with cold-gas reaction thrusters.",
          step: 1,
          instructions: "Step 1: Anchor satellite central payload ring."
        },
        {
          id: 'sat_solar_left',
          name: 'Gallium-Arsenide Solar Array (Port Wing)',
          category: 'Solar Power Generation',
          color: 'rgba(37, 99, 235, 0.9)',
          edgeColor: '#60a5fa',
          basePos: [-75, 0, 0],
          explodeVec: [-130, 0, 0],
          size: [85, 45, 6],
          material: "Triple-Junction GaAs Solar Cells on Carbon Honeycomb",
          weight: "48 kg",
          tolerance: "±0.005 mm",
          specs: "Peak power output: 12 kW at 1 AU • 34% Solar efficiency.",
          step: 2,
          instructions: "Step 2: Deploy solar array gimbal hinge pins."
        },
        {
          id: 'sat_solar_right',
          name: 'Gallium-Arsenide Solar Array (Starboard Wing)',
          category: 'Solar Power Generation',
          color: 'rgba(37, 99, 235, 0.9)',
          edgeColor: '#60a5fa',
          basePos: [75, 0, 0],
          explodeVec: [130, 0, 0],
          size: [85, 45, 6],
          material: "Triple-Junction GaAs Solar Cells on Carbon Honeycomb",
          weight: "48 kg",
          tolerance: "±0.005 mm",
          specs: "Dual continuous sun-tracking rotation drive.",
          step: 3,
          instructions: "Step 3: Align deployment spring latch mechanism."
        },
        {
          id: 'sat_dish',
          name: 'High-Gain Ka-Band Parabolic Dish Antenna',
          category: 'Deep Space Telemetry',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [0, -55, 0],
          explodeVec: [0, -110, 0],
          size: [48, 22, 48],
          material: "Gold-Plated Molybdenum Mesh Reflector",
          weight: "32 kg",
          tolerance: "±0.002 mm",
          specs: "G/T: 32 dB/K • 10 Gbps optical laser downlink.",
          step: 4,
          instructions: "Step 4: Lock fine-pointing gimbal feed horn."
        },
        {
          id: 'sat_thruster',
          name: 'Hall-Effect Xenon Ion Engine Stage',
          category: 'Orbital Propulsion',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [0, 52, 0],
          explodeVec: [0, 95, 0],
          size: [38, 28, 38],
          material: "Ceramic Discharge Chamber & Samarium Magnets",
          weight: "65 kg",
          tolerance: "±0.001 mm",
          specs: "Specific Impulse (Isp): 3,200 sec • 250 mN continuous thrust.",
          step: 5,
          instructions: "Step 5: Bolt xenon pressure line manifold to thrust plate."
        }
      ]
    };
  }

  /* =========================================================================
     Model 7: Sci-Fi Plasma Blaster
     ========================================================================= */
  buildBlasterModel() {
    return {
      name: "Phobos Hyper-Velocity Plasma Accelerator",
      category: "Directed Energy Systems",
      prompt: "Sci-Fi Plasma Blaster",
      parts: [
        {
          id: 'blaster_frame',
          name: 'Skeletonized Titanium Receiver Frame',
          category: 'Core Housing',
          color: 'rgba(30, 41, 59, 0.92)',
          edgeColor: '#94a3b8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [110, 35, 24],
          material: "Additively Formed Titanium-Ceramic Composite",
          weight: "1.8 kg",
          tolerance: "±0.001 mm",
          specs: "Integrated electromagnetic pulse containment damper.",
          step: 1,
          instructions: "Step 1: Mount receiver to precision assembly rail."
        },
        {
          id: 'blaster_barrel',
          name: 'Superconducting Magnetic Accelerator Rails',
          category: 'Plasma Acceleration',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [65, -8, 0],
          explodeVec: [115, 0, 0],
          size: [80, 22, 20],
          material: "Yttrium Barium Copper Oxide (YBCO) Superconductor",
          weight: "1.4 kg",
          tolerance: "±0.0005 mm",
          specs: "Magnetic flux density: 14 Tesla • Velocity: Mach 18.",
          step: 2,
          instructions: "Step 2: Slide superconductor rails into ceramic insulator."
        },
        {
          id: 'blaster_cell',
          name: 'Micro-Fusion Deuterium Plasma Cell',
          category: 'Power Reservoir',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [-15, 28, 0],
          explodeVec: [0, 85, 0],
          size: [28, 38, 20],
          material: "Tritium Magnetic Bottle with Diamond Heat Spreader",
          weight: "0.85 kg",
          tolerance: "±0.002 mm",
          specs: "500 kW pulse discharge • 120 sustained shots per charge.",
          step: 3,
          instructions: "Step 3: Insert magnetic cell into mag-well latch."
        },
        {
          id: 'blaster_optic',
          name: 'Holographic Thermal Targeting Matrix',
          category: 'Target Acquisition',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [5, -30, 0],
          explodeVec: [0, -75, 0],
          size: [45, 18, 18],
          material: "Single-Crystal Sapphire Lens & OLED Reticle",
          weight: "0.32 kg",
          tolerance: "±0.001 mm",
          specs: "Auto-lead trajectory computing with windage correction.",
          step: 4,
          instructions: "Step 4: Tighten quick-detach Picatinny rail thumb screw."
        }
      ]
    };
  }

  /* =========================================================================
     Model 8: Twin-Turbo V8 Engine
     ========================================================================= */
  buildV8EngineModel() {
    return {
      name: "Apex 4.0L Twin-Turbo Flat-Plane V8 Engine",
      category: "Internal Combustion Powertrain",
      prompt: "Twin-Turbo V8 Engine",
      parts: [
        {
          id: 'v8_block',
          name: 'Al-Si Alloy 90° Engine Block with Iron Liners',
          category: 'Engine Core Block',
          color: 'rgba(71, 85, 105, 0.92)',
          edgeColor: '#94a3b8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [70, 48, 60],
          material: "High-Pressure Die-Cast A356 Aluminum Alloy",
          weight: "44.0 kg",
          tolerance: "±0.0005 mm",
          specs: "Cross-bolted 6-bolt main bearing caps.",
          step: 1,
          instructions: "Step 1: Mount bare block onto rotating engine stand."
        },
        {
          id: 'v8_crank',
          name: 'Billet 4340 Steel Flat-Plane Crankshaft',
          category: 'Rotating Assembly',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [0, 18, 0],
          explodeVec: [0, 80, 0],
          size: [68, 18, 18],
          material: "Forged & Nitrided 4340 Chromoly Steel",
          weight: "18.5 kg",
          tolerance: "±0.0002 mm",
          specs: "180° flat-plane journal spacing • 9,000 RPM redline.",
          step: 2,
          instructions: "Step 2: Lay crank into tri-metal bearings and torque caps."
        },
        {
          id: 'v8_pistons',
          name: 'Forged 2618 Pistons & Titanium Rods (8x)',
          category: 'Reciprocating Assembly',
          color: 'rgba(239, 68, 68, 0.9)',
          edgeColor: '#f87171',
          basePos: [0, -10, 0],
          explodeVec: [0, -60, 0],
          size: [64, 28, 54],
          material: "Forged 2618 Alloy with Diamond-Like Carbon Pins",
          weight: "6.8 kg (Set)",
          tolerance: "±0.0005 mm",
          specs: "Compression ratio 10.5:1 • Boost capability 2.4 bar.",
          step: 3,
          instructions: "Step 3: Compress rings and tap pistons into cylinders."
        },
        {
          id: 'v8_heads',
          name: 'Dual CNC Ported 32-Valve Cylinder Heads',
          category: 'Valvetrain Assembly',
          color: 'rgba(56, 189, 248, 0.9)',
          edgeColor: '#38bdf8',
          basePos: [0, -32, 0],
          explodeVec: [0, -115, 0],
          size: [72, 24, 62],
          material: "Cast A356-T6 with Sodium-Filled Inconel Valves",
          weight: "22.4 kg (Pair)",
          tolerance: "±0.001 mm",
          specs: "Quad overhead hollow camshafts with dual VVT.",
          step: 4,
          instructions: "Step 4: Torque ARP head studs in 3 progressive stages."
        },
        {
          id: 'v8_turbos',
          name: 'Twin Symmetrical Ball-Bearing Turbos & Manifolds',
          category: 'Forced Induction',
          color: 'rgba(168, 85, 247, 0.9)',
          edgeColor: '#c084fc',
          basePos: [0, -18, 42],
          explodeVec: [0, -20, 110],
          size: [60, 32, 28],
          material: "Inconel 713C Turbine Wheels & Billet Impellers",
          weight: "16.8 kg",
          tolerance: "±0.0005 mm",
          specs: "Ceramic dual ball bearings • 850 HP peak capacity.",
          step: 5,
          instructions: "Step 5: Bolt hot-side exhaust manifold with copper nuts."
        }
      ]
    };
  }

  /* =========================================================================
     Meshy AI / Spline AI / Luma AI Text-to-3D Procedural Engine
     ========================================================================= */
  generateFromPrompt(promptText) {
    const raw = (promptText || '').trim();
    if (!raw) return;

    const lower = raw.toLowerCase();

    // Matching built-ins if directly matched
    if (lower.includes('drone') || lower.includes('quadcopter') || lower.includes('uav')) {
      this.switchModel('drone');
      this.announceGeneration(this.models.drone.name);
      return;
    }
    if (lower.includes('hand') || lower.includes('bionic') || lower.includes('prosthetic') || lower.includes('arm')) {
      this.switchModel('hand');
      this.announceGeneration(this.models.hand.name);
      return;
    }
    if (lower.includes('car') || lower.includes('ev') || lower.includes('vehicle') || lower.includes('automobile')) {
      this.switchModel('car');
      this.announceGeneration(this.models.car.name);
      return;
    }
    if (lower.includes('turbine') || lower.includes('jet') || lower.includes('fan') || lower.includes('propulsion')) {
      this.switchModel('turbine');
      this.announceGeneration(this.models.turbine.name);
      return;
    }
    if (lower.includes('robot') || lower.includes('humanoid') || lower.includes('mech') || lower.includes('android')) {
      this.switchModel('robot');
      this.announceGeneration(this.models.robot.name);
      return;
    }
    if (lower.includes('satellite') || lower.includes('space') || lower.includes('orbit')) {
      this.switchModel('satellite');
      this.announceGeneration(this.models.satellite.name);
      return;
    }
    if (lower.includes('blaster') || lower.includes('weapon') || lower.includes('gun') || lower.includes('plasma') || lower.includes('laser')) {
      this.switchModel('blaster');
      this.announceGeneration(this.models.blaster.name);
      return;
    }
    if (lower.includes('engine') || lower.includes('v8') || lower.includes('motor') || lower.includes('piston')) {
      this.switchModel('engine');
      this.announceGeneration(this.models.engine.name);
      return;
    }

    // Procedural Dynamic Generation for ANY arbitrary prompt
    const generatedModel = this.synthesizeProceduralModel(raw);
    const customKey = 'custom_' + Date.now();
    this.models[customKey] = generatedModel;
    this.switchModel(customKey);
    this.announceGeneration(generatedModel.name);
  }

  synthesizeProceduralModel(prompt) {
    const titleCase = prompt.replace(/\b\w/g, c => c.toUpperCase());
    return {
      name: `${titleCase} (Autonomous 3D Assemblable CAD)`,
      category: "Synthesized 3D Model",
      prompt: prompt,
      parts: [
        {
          id: 'gen_chassis',
          name: `${titleCase} Primary Structural Chassis`,
          category: 'Base Foundation',
          color: 'rgba(30, 41, 59, 0.92)',
          edgeColor: '#94a3b8',
          basePos: [0, 0, 0],
          explodeVec: [0, 0, 0],
          size: [75, 30, 55],
          material: "Additive Aerospace Titanium Lattice",
          weight: "12.4 kg",
          tolerance: "±0.001 mm",
          specs: "High-rigidity datum fixture for sub-component nesting.",
          step: 1,
          instructions: "Step 1: Anchor base chassis onto precision alignment cradle."
        },
        {
          id: 'gen_core',
          name: `${titleCase} Neural Quantum Logic Engine`,
          category: 'Core Processor',
          color: 'rgba(6, 182, 212, 0.9)',
          edgeColor: '#22d3ee',
          basePos: [0, -18, 0],
          explodeVec: [0, -75, 0],
          size: [48, 16, 42],
          material: "Photonic Crystal Optical Substrate",
          weight: "3.2 kg",
          tolerance: "±0.0002 mm",
          specs: "10 Petaflops edge inference computation matrix.",
          step: 2,
          instructions: "Step 2: Mate optical multi-fiber bus to chassis socket."
        },
        {
          id: 'gen_power',
          name: 'Solid-State Hyper-Capacitive Power Cell',
          category: 'Energy Distribution',
          color: 'rgba(16, 185, 129, 0.9)',
          edgeColor: '#34d399',
          basePos: [0, 18, 0],
          explodeVec: [0, 85, 0],
          size: [52, 16, 46],
          material: "Graphene Electrolyte Cell",
          weight: "8.6 kg",
          tolerance: "±0.005 mm",
          specs: "Continuous 400V power delivery with zero thermal throttling.",
          step: 3,
          instructions: "Step 3: Slide battery module into underbelly locking guides."
        },
        {
          id: 'gen_actuator_left',
          name: 'High-Precision Articulated Actuators (Left)',
          category: 'Dynamic Motion',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [-48, 0, 0],
          explodeVec: [-95, 0, 0],
          size: [28, 42, 34],
          material: "Anodized 7075-T6 Alloy with Planetary Micro-Gears",
          weight: "4.5 kg",
          tolerance: "±0.001 mm",
          specs: "Sub-milliradian positioning accuracy under load.",
          step: 4,
          instructions: "Step 4: Fasten 4 M6 hex socket bolts to port flange."
        },
        {
          id: 'gen_actuator_right',
          name: 'High-Precision Articulated Actuators (Right)',
          category: 'Dynamic Motion',
          color: 'rgba(245, 158, 11, 0.9)',
          edgeColor: '#fbbf24',
          basePos: [48, 0, 0],
          explodeVec: [95, 0, 0],
          size: [28, 42, 34],
          material: "Anodized 7075-T6 Alloy with Planetary Micro-Gears",
          weight: "4.5 kg",
          tolerance: "±0.001 mm",
          specs: "Sub-milliradian positioning accuracy under load.",
          step: 5,
          instructions: "Step 5: Fasten 4 M6 hex socket bolts to starboard flange."
        },
        {
          id: 'gen_shroud',
          name: 'Aerodynamic Carbon Protective Enclosure',
          category: 'Outer Armor',
          color: 'rgba(168, 85, 247, 0.88)',
          edgeColor: '#c084fc',
          basePos: [0, -36, 0],
          explodeVec: [0, -125, 0],
          size: [85, 18, 64],
          material: "Toray T1100 Carbon Fiber & Epoxy Monocoque",
          weight: "5.1 kg",
          tolerance: "±0.002 mm",
          specs: "Thermal dissipation fins with electromagnetic seal.",
          step: 6,
          instructions: "Step 6: Lower upper cowl and lock with quarter-turn fasteners."
        }
      ]
    };
  }

  announceGeneration(modelName) {
    if (window.omApp) {
      window.omApp.showToast(`✨ Generated 3D Assemblable Model: ${modelName}`, 'success');
    }
    // Update select dropdown if exists
    const select = document.getElementById('dismantle-model-select');
    if (select) {
      let opt = Array.from(select.options).find(o => o.value === this.currentModelType);
      if (!opt) {
        opt = document.createElement('option');
        opt.value = this.currentModelType;
        opt.textContent = `✨ ${modelName}`;
        select.appendChild(opt);
      }
      select.value = this.currentModelType;
    }
  }

  /* =========================================================================
     Step-by-Step Magnetic Assembler Engine
     ========================================================================= */
  setAssemblyMode(mode) {
    this.assemblyMode = mode === 'assembly' ? 'assembly' : 'explode';
    if (this.assemblyMode === 'assembly') {
      this.assemblyStep = 1;
      this.updateAssemblyStepUI();
    }
    this.render();
  }

  nextAssemblyStep() {
    const model = this.models[this.currentModelType] || this.models.drone;
    if (this.assemblyStep < model.parts.length) {
      this.assemblyStep++;
      this.updateAssemblyStepUI();
      this.render();
    } else {
      if (this.isAutoAssembling) this.stopAutoAssemble();
      if (window.omApp) window.omApp.showToast("🎉 Full 3D Model Assembled Successfully!", "success");
    }
  }

  prevAssemblyStep() {
    if (this.assemblyStep > 1) {
      this.assemblyStep--;
      this.updateAssemblyStepUI();
      this.render();
    }
  }

  resetAssembly() {
    this.assemblyStep = 1;
    this.updateAssemblyStepUI();
    this.render();
  }

  toggleAutoAssemble() {
    if (this.isAutoAssembling) {
      this.stopAutoAssemble();
    } else {
      this.startAutoAssemble();
    }
  }

  startAutoAssemble() {
    this.isAutoAssembling = true;
    this.assemblyMode = 'assembly';
    const btn = document.getElementById('btn-auto-assemble');
    if (btn) btn.innerHTML = '⏸️ Pause Assembly';

    const loop = () => {
      if (!this.isAutoAssembling) return;
      const model = this.models[this.currentModelType] || this.models.drone;
      if (this.assemblyStep >= model.parts.length) {
        this.assemblyStep = 1; // cycle or finish
      } else {
        this.assemblyStep++;
      }
      this.updateAssemblyStepUI();
      this.render();
      this.autoAssembleTimer = setTimeout(loop, 1200);
    };

    this.autoAssembleTimer = setTimeout(loop, 400);
  }

  stopAutoAssemble() {
    this.isAutoAssembling = false;
    if (this.autoAssembleTimer) {
      clearTimeout(this.autoAssembleTimer);
      this.autoAssembleTimer = null;
    }
    const btn = document.getElementById('btn-auto-assemble');
    if (btn) btn.innerHTML = '▶️ Auto-Assemble';
  }

  updateAssemblyStepUI() {
    const model = this.models[this.currentModelType] || this.models.drone;
    const currentPart = model.parts[this.assemblyStep - 1];

    const stepLabel = document.getElementById('assembly-step-counter');
    if (stepLabel) {
      stepLabel.textContent = `Step ${this.assemblyStep} of ${model.parts.length}`;
    }

    const instrEl = document.getElementById('assembly-step-instruction');
    if (instrEl && currentPart) {
      instrEl.innerHTML = `<span style="color: var(--om-cyan); font-weight: 700;">Fitting: ${currentPart.name}</span> • <span style="color: #cbd5e1;">${currentPart.instructions}</span>`;
    }

    if (currentPart) {
      this.selectedPartId = currentPart.id;
      this.renderPartTelemetryUI(currentPart.id);
    }
  }

  setViewMode(mode) {
    this.viewMode = mode; // 'solid', 'wireframe', 'xray'
    this.render();
  }

  /* =========================================================================
     Meshy / Spline AI Standard 3D OBJ Exporter (.obj file download)
     ========================================================================= */
  exportOBJ() {
    const model = this.models[this.currentModelType] || this.models.drone;
    let obj = `# Wavefront 3D OBJ Export - OM AI 3D Assemblable Studio\n`;
    obj += `# Modeled: ${model.name}\n`;
    obj += `# Category: ${model.category}\n`;
    obj += `# Chief Architect: Udayast\n`;
    obj += `# Compatible with Blender, Spline AI, Unreal Engine, Maya, CAD\n\n`;

    let vertOffset = 1;

    model.parts.forEach(p => {
      obj += `g ${p.id}_${p.name.replace(/\s+/g, '_')}\n`;
      const [w, h, d] = p.size;
      const hw = w / 2;
      const hh = h / 2;
      const hd = d / 2;
      const [px, py, pz] = p.basePos;

      // 8 Vertices
      const corners = [
        [px - hw, py - hh, pz - hd],
        [px + hw, py - hh, pz - hd],
        [px + hw, py + hh, pz - hd],
        [px - hw, py + hh, pz - hd],
        [px - hw, py - hh, pz + hd],
        [px + hw, py - hh, pz + hd],
        [px + hw, py + hh, pz + hd],
        [px - hw, py + hh, pz + hd]
      ];

      corners.forEach(c => {
        obj += `v ${c[0].toFixed(3)} ${(-c[1]).toFixed(3)} ${c[2].toFixed(3)}\n`;
      });

      // 6 Faces (quads)
      const faces = [
        [1, 2, 3, 4],
        [6, 5, 8, 7],
        [5, 1, 4, 8],
        [2, 6, 7, 3],
        [5, 6, 2, 1],
        [4, 3, 7, 8]
      ];

      faces.forEach(f => {
        obj += `f ${f[0] + vertOffset - 1} ${f[1] + vertOffset - 1} ${f[2] + vertOffset - 1} ${f[3] + vertOffset - 1}\n`;
      });

      vertOffset += 8;
      obj += `\n`;
    });

    const blob = new Blob([obj], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `OM_3D_Model_${this.currentModelType}_${Date.now()}.obj`;
    link.href = url;
    link.click();

    if (window.omApp) {
      window.omApp.showToast(`📦 Exported 3D Wavefront OBJ: OM_3D_Model_${this.currentModelType}.obj (Ready for Blender & Spline)`, 'success');
    }
  }

  /* =========================================================================
     3D Canvas Engine & Interaction
     ========================================================================= */
  initCanvas(canvasId = 'dismantle-3d-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.attachEventListeners();
    this.render();
  }

  openModal(modelType = 'drone') {
    this.currentModelType = modelType;
    const modal = document.getElementById('dismantle-3d-modal');
    if (modal) {
      modal.classList.add('active');
    }

    setTimeout(() => {
      this.initCanvas('dismantle-3d-canvas');
      this.switchModel(modelType);
    }, 100);
  }

  closeModal() {
    const modal = document.getElementById('dismantle-3d-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.stopAutoAssemble();
  }

  switchModel(modelType) {
    if (!this.models[modelType]) modelType = 'drone';
    this.currentModelType = modelType;
    this.selectedPartId = null;
    this.assemblyStep = 1;

    const titleEl = document.getElementById('dismantle-model-title');
    if (titleEl) {
      titleEl.textContent = this.models[modelType].name;
    }

    const selectEl = document.getElementById('dismantle-model-select');
    if (selectEl) {
      selectEl.value = modelType;
    }

    this.renderPartsListUI();
    this.updateAssemblyStepUI();
    this.render();
  }

  setExplosion(val) {
    this.explosionFactor = parseFloat(val);
    const label = document.getElementById('explosion-slider-val');
    if (label) {
      label.textContent = `${Math.round(this.explosionFactor * 100)}%`;
    }
    this.render();
  }

  attachEventListeners() {
    if (!this.canvas) return;

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
        this.rotY += dx * 0.01;
        this.rotX += dy * 0.01;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.render();
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom += e.deltaY * -0.0012;
      this.zoom = Math.max(0.4, Math.min(2.8, this.zoom));
      this.render();
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      if (this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      this.checkPartClick(mouseX, mouseY);
    });
  }

  checkPartClick(mx, my) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const model = this.models[this.currentModelType] || this.models.drone;

    for (let i = model.parts.length - 1; i >= 0; i--) {
      const p = model.parts[i];
      let curFactor = this.explosionFactor;
      if (this.assemblyMode === 'assembly') {
        curFactor = p.step <= this.assemblyStep ? 0.0 : 1.0;
      }

      const curX = p.basePos[0] + p.explodeVec[0] * curFactor;
      const curY = p.basePos[1] + p.explodeVec[1] * curFactor;
      const curZ = p.basePos[2] + p.explodeVec[2] * curFactor;
      const proj = this.project3D(curX, curY, curZ, cx, cy);

      const dx = mx - proj.x;
      const dy = my - proj.y;
      if (Math.hypot(dx, dy) < 24) {
        this.selectPart(p.id);
        break;
      }
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

    const model = this.models[this.currentModelType] || this.models.drone;
    listEl.innerHTML = model.parts.map((p, idx) => `
      <div class="dismantle-part-item ${p.id === this.selectedPartId ? 'selected' : ''}" 
           onclick="window.omDismantler.selectPart('${p.id}')">
        <span class="part-indicator-dot" style="background: ${p.edgeColor};"></span>
        <div style="flex: 1; min-width: 0;">
          <div class="part-item-name">${idx + 1}. ${p.name}</div>
          <div class="part-item-category">${p.category} • ${p.material.substring(0, 24)}...</div>
        </div>
        <span class="part-step-badge">Step ${p.step || idx + 1}</span>
      </div>
    `).join('');
  }

  renderPartTelemetryUI(partId) {
    const telemetryEl = document.getElementById('dismantle-part-telemetry');
    if (!telemetryEl) return;

    const model = this.models[this.currentModelType] || this.models.drone;
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
          <span style="color: #94a3b8; display: block; font-size: 0.68rem;">STATUS</span>
          <span style="font-weight: 700; color: var(--om-cyan);">${this.assemblyMode === 'assembly' ? (part.step <= this.assemblyStep ? 'LOCKED / ASSEMBLED' : 'STANDBY') : `${Math.round(this.explosionFactor * 100)}% EXPLODED`}</span>
        </div>
      </div>
      <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--om-cyan); margin-bottom: 4px;">ENGINEERING SPECIFICATIONS</div>
        <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">${part.specs}</div>
      </div>
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">ASSEMBLY DIRECTIVE</div>
        <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">${part.instructions}</div>
      </div>
    `;
  }

  // 3D Perspective Math
  project3D(x, y, z, cx, cy) {
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

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

    // Background Cyber Grid
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, width, height);

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

    const model = this.models[this.currentModelType] || this.models.drone;

    // Compute coordinates for parts
    const renderedParts = model.parts.map((p, idx) => {
      let curFactor = this.explosionFactor;
      let alpha = 1.0;

      if (this.assemblyMode === 'assembly') {
        if (p.step <= this.assemblyStep) {
          curFactor = 0.0; // fully assembled at basePos
          alpha = 1.0;
        } else {
          curFactor = 1.0; // standby exploded
          alpha = 0.28; // dim un-assembled parts
        }
      }

      const curX = p.basePos[0] + p.explodeVec[0] * curFactor;
      const curY = p.basePos[1] + p.explodeVec[1] * curFactor;
      const curZ = p.basePos[2] + p.explodeVec[2] * curFactor;

      const proj = this.project3D(curX, curY, curZ, cx, cy);
      const baseProj = this.project3D(p.basePos[0], p.basePos[1], p.basePos[2], cx, cy);

      return {
        part: p,
        idx: idx + 1,
        pos3D: [curX, curY, curZ],
        proj: proj,
        baseProj: baseProj,
        depth: proj.z,
        alpha: alpha,
        isAssembled: this.assemblyMode === 'assembly' ? p.step <= this.assemblyStep : this.explosionFactor === 0
      };
    });

    // Sort by depth (painter's algorithm)
    renderedParts.sort((a, b) => b.depth - a.depth);

    // 1. Draw connecting holographic assembly/explosion vectors
    renderedParts.forEach(rp => {
      if (this.explosionFactor > 0.05 || (this.assemblyMode === 'assembly' && !rp.isAssembled)) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rp.baseProj.x, rp.baseProj.y);
        ctx.lineTo(rp.proj.x, rp.proj.y);
        ctx.strokeStyle = rp.isAssembled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rp.baseProj.x, rp.baseProj.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fill();
        ctx.restore();
      }
    });

    // 2. Render 3D Box Components with View Mode
    renderedParts.forEach(rp => {
      const p = rp.part;
      const isSelected = p.id === this.selectedPartId;
      const [w, h, d] = p.size;
      const [px, py, pz] = rp.pos3D;

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

      const faces = [
        [0, 1, 2, 3], // Front
        [5, 4, 7, 6], // Back
        [4, 0, 3, 7], // Left
        [1, 5, 6, 2], // Right
        [4, 5, 1, 0], // Top
        [3, 2, 6, 7]  // Bottom
      ];

      ctx.save();
      ctx.globalAlpha = rp.alpha;

      faces.forEach(f => {
        ctx.beginPath();
        ctx.moveTo(v[f[0]].x, v[f[0]].y);
        ctx.lineTo(v[f[1]].x, v[f[1]].y);
        ctx.lineTo(v[f[2]].x, v[f[2]].y);
        ctx.lineTo(v[f[3]].x, v[f[3]].y);
        ctx.closePath();

        if (this.viewMode === 'wireframe') {
          ctx.strokeStyle = isSelected ? '#ffffff' : p.edgeColor;
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.stroke();
        } else if (this.viewMode === 'xray') {
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)';
          ctx.fill();
          ctx.strokeStyle = p.edgeColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // PBR Solid
          ctx.fillStyle = isSelected ? 'rgba(6, 182, 212, 0.5)' : p.color;
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#ffffff' : p.edgeColor;
          ctx.lineWidth = isSelected ? 2.5 : 1.2;
          ctx.stroke();
        }
      });

      // Callout number badge
      ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.beginPath();
      ctx.arc(rp.proj.x, rp.proj.y - 12, 10, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#06b6d4' : (rp.isAssembled ? 'rgba(16, 185, 129, 0.9)' : 'rgba(15, 23, 42, 0.85)');
      ctx.fill();
      ctx.strokeStyle = p.edgeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(rp.idx, rp.proj.x, rp.proj.y - 12);

      if (isSelected || this.explosionFactor > 0.35) {
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#38bdf8' : '#cbd5e1';
        ctx.fillText(p.name, rp.proj.x, rp.proj.y + 14);
      }
      ctx.restore();
    });

    // 3. Technical Blueprint Title Block in bottom-left
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillRect(16, height - 72, 260, 58);
    ctx.strokeRect(16, height - 72, 260, 58);

    ctx.fillStyle = 'var(--om-cyan)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('OM 3D CAD ASSEMBLABLE STUDIO v3.0', 26, height - 54);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(model.name.substring(0, 30) + '...', 26, height - 38);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`MODE: ${this.assemblyMode.toUpperCase()} | CHIEF ARCHITECT: Udayast`, 26, height - 22);
    ctx.restore();
  }

  /* =========================================================================
     Export PNG Blueprint & 360° Video Recording
     ========================================================================= */
  exportBlueprintImage() {
    if (!this.canvas) return;
    this.render();

    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `OM_3D_Blueprint_${this.currentModelType}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    if (window.omApp) {
      window.omApp.showToast('📸 3D CAD Blueprint exported successfully as PNG!', 'success');
    }
  }

  generateAssemblyVideo() {
    if (!this.canvas || this.isRecordingVideo) return;
    this.isRecordingVideo = true;
    this.recordedChunks = [];

    const videoBtn = document.getElementById('btn-dismantle-generate-video');
    if (videoBtn) {
      videoBtn.innerHTML = '🎥 Recording 3D Assembly...';
      videoBtn.disabled = true;
    }

    if (window.omApp) {
      window.omApp.showToast('🎥 Recording 360° 3D Assembly & Orbit Video...', 'info');
    }

    try {
      const stream = this.canvas.captureStream(30);
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

      const startTime = performance.now();
      const duration = 4500;
      const initialRotY = this.rotY;

      const animateSequence = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        this.rotY = initialRotY + progress * Math.PI * 2;
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
      console.warn("MediaRecorder fallback:", e);
      this.isRecordingVideo = false;
      if (videoBtn) {
        videoBtn.innerHTML = '🎥 Generate 3D Video';
        videoBtn.disabled = false;
      }
      this.exportBlueprintImage();
    }
  }

  processImageTo3DDismantle(imageName) {
    this.generateFromPrompt(imageName);
    this.openModal(this.currentModelType);
  }
}

window.omDismantler = new OMDismantler3D();
