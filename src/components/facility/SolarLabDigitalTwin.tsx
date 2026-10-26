import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun, Moon, Zap, Battery, Monitor, Maximize2, RotateCcw, Eye, ShieldCheck, Activity } from 'lucide-react';

interface SolarLabDigitalTwinProps {
  onClose?: () => void;
  projectName?: string;
  isInline?: boolean;
}

export const SolarLabDigitalTwin: React.FC<SolarLabDigitalTwinProps> = ({
  onClose,
  projectName = 'IFOPSIM – Inclusive IT Solar Classroom',
  isInline = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isDayMode, setIsDayMode] = useState<boolean>(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'solar' | 'battery' | 'desks'>('overview');
  const [activeTelemetry, setActiveTelemetry] = useState({
    pvGenerationKw: 4.8,
    batterySocPct: 94,
    powerLoadW: 760,
    inverterEfficiencyPct: 97.8,
    ambientTempC: 28,
  });

  // Scene references for live toggling
  const sceneStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    sunLight?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
    particleSystem?: THREE.Points;
    flowParticles?: THREE.BufferGeometry;
    particlePositions?: Float32Array;
    inverterLed?: THREE.Mesh;
    laptopScreens?: THREE.Mesh[];
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDayMode ? 0xf1f5f9 : 0x0f172a);
    scene.fog = new THREE.FogExp2(isDayMode ? 0xf1f5f9 : 0x0f172a, 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(11, 8, 12);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera under floor
    controls.minDistance = 3;
    controls.maxDistance = 25;
    controls.target.set(0, 1.2, 0);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDayMode ? 0.7 : 0.25);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, isDayMode ? 0.6 : 0.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaf0, isDayMode ? 1.6 : 0.2);
    sunLight.position.set(10, 15, 8);
    sunLight.castShadow = !isSoftwareGl;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 30;
      sunLight.shadow.camera.left = -10;
      sunLight.shadow.camera.right = 10;
      sunLight.shadow.camera.top = 10;
      sunLight.shadow.camera.bottom = -10;
      sunLight.shadow.bias = -0.001;
    }
    scene.add(sunLight);

    // 6. Ground & Foundation
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !isSoftwareGl;
    scene.add(ground);

    // Classroom Floor Platform
    const floorGeo = new THREE.BoxGeometry(10, 0.2, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0.1, 0);
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Wall Perimeter Frame
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.1,
    });
    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3.2, 0.2), wallMat);
    backWall.position.set(0, 1.7, -4);
    backWall.receiveShadow = !isSoftwareGl;
    scene.add(backWall);

    // Left wall with window cut
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 8), wallMat);
    leftWall.position.set(-5, 1.7, 0);
    leftWall.receiveShadow = !isSoftwareGl;
    scene.add(leftWall);

    // Educational Sign on Back Wall
    const signGeo = new THREE.BoxGeometry(4.5, 0.8, 0.05);
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d');
    if (signCtx) {
      signCtx.fillStyle = '#0f2b48';
      signCtx.fillRect(0, 0, 512, 128);
      signCtx.fillStyle = '#10b981';
      signCtx.fillRect(0, 120, 512, 8);
      signCtx.fillStyle = '#ffffff';
      signCtx.font = 'bold 26px sans-serif';
      signCtx.fillText('TEFA • IFOPSIM SOLAR LAB', 30, 55);
      signCtx.fillStyle = '#94a3b8';
      signCtx.font = '18px monospace';
      signCtx.fillText('Clean Energy & Inclusive Digital Hub (Cameroon)', 30, 90);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 2.4, -3.88);
    scene.add(signMesh);

    // -----------------------------------------------------------
    // A. SOLAR PV ARRAY (Procedural Composite Group)
    // -----------------------------------------------------------
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-3.2, 0.2, 4.2);

    // Aluminum mounting frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.25,
    });
    // Base struts
    const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), frameMat);
    strut1.position.set(-1.4, 0.9, -0.6);
    const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), frameMat);
    strut2.position.set(1.4, 0.9, -0.6);
    const strutFront1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0), frameMat);
    strutFront1.position.set(-1.4, 0.5, 0.8);
    const strutFront2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0), frameMat);
    strutFront2.position.set(1.4, 0.5, 0.8);

    solarGroup.add(strut1, strut2, strutFront1, strutFront2);

    // Photovoltaic panel texture
    const pvCanvas = document.createElement('canvas');
    pvCanvas.width = 256;
    pvCanvas.height = 256;
    const pvCtx = pvCanvas.getContext('2d');
    if (pvCtx) {
      pvCtx.fillStyle = '#1e3a5f';
      pvCtx.fillRect(0, 0, 256, 256);
      pvCtx.strokeStyle = '#38bdf8';
      pvCtx.lineWidth = 1;
      // Grid lines
      for (let x = 0; x <= 256; x += 32) {
        pvCtx.beginPath();
        pvCtx.moveTo(x, 0);
        pvCtx.lineTo(x, 256);
        pvCtx.stroke();
      }
      for (let y = 0; y <= 256; y += 32) {
        pvCtx.beginPath();
        pvCtx.moveTo(0, y);
        pvCtx.lineTo(256, y);
        pvCtx.stroke();
      }
    }
    const pvTexture = new THREE.CanvasTexture(pvCanvas);
    const pvMat = new THREE.MeshStandardMaterial({
      map: pvTexture,
      roughness: 0.15,
      metalness: 0.4,
    });

    // 4 Solar panels tilted 28° toward the sun
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 1.5), pvMat);
      panel.position.set((i - 1.5) * 0.95, 1.25, 0.1);
      panel.rotation.x = -Math.PI / 6; // 30 deg tilt
      panel.castShadow = !isSoftwareGl;
      solarGroup.add(panel);
    }

    // Junction box
    const jBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 })
    );
    jBox.position.set(0, 0.4, -0.6);
    solarGroup.add(jBox);

    scene.add(solarGroup);

    // -----------------------------------------------------------
    // B. INVERTER & BATTERY RACK SYSTEM
    // -----------------------------------------------------------
    const inverterGroup = new THREE.Group();
    inverterGroup.position.set(-4.4, 0.2, -3.2);

    // Metal cabinet rack
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.7), rackMat);
    cabinet.position.set(0, 1.1, 0);
    cabinet.castShadow = !isSoftwareGl;
    inverterGroup.add(cabinet);

    // 4 Lithium Iron Phosphate (LiFePO4) battery drawer modules
    const battMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.4,
    });
    for (let b = 0; b < 4; b++) {
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.28, 0.65), battMat);
      drawer.position.set(0, 0.4 + b * 0.36, 0.04);
      inverterGroup.add(drawer);
    }

    // Inverter Display Screen (glowing cyan)
    const screenGeo = new THREE.PlaneGeometry(0.35, 0.2);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 1.85, 0.36);
    inverterGroup.add(screenMesh);

    // Pulsing Status LED
    const ledGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.25, 1.85, 0.36);
    inverterGroup.add(ledMesh);

    scene.add(inverterGroup);

    // -----------------------------------------------------------
    // C. IT COMPUTER WORKSTATIONS (Desks + Laptops + Ergonomic Chairs)
    // -----------------------------------------------------------
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.1,
      roughness: 0.6,
    });
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const laptopBodyMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.7,
      roughness: 0.3,
    });
    const laptopScreenMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    const laptopScreensList: THREE.Mesh[] = [];

    // 4 Dual-Student Workstations (2 rows of 2 desks)
    const deskPositions = [
      { x: -1.8, z: -1.6 },
      { x: 1.8, z: -1.6 },
      { x: -1.8, z: 1.2 },
      { x: 1.8, z: 1.2 },
    ];

    deskPositions.forEach((pos, dIdx) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(pos.x, 0.2, pos.z);

      // Desktop table surface
      const tabletop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.1), deskMat);
      tabletop.position.set(0, 0.74, 0);
      tabletop.castShadow = !isSoftwareGl;
      tabletop.receiveShadow = !isSoftwareGl;
      deskGroup.add(tabletop);

      // 4 Metal Legs
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74), legMat);
      leg1.position.set(-1.1, 0.37, -0.45);
      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74), legMat);
      leg2.position.set(1.1, 0.37, -0.45);
      const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74), legMat);
      leg3.position.set(-1.1, 0.37, 0.45);
      const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.74), legMat);
      leg4.position.set(1.1, 0.37, 0.45);
      deskGroup.add(leg1, leg2, leg3, leg4);

      // 2 Laptops on each desk (1 per student)
      [-0.6, 0.6].forEach((offset) => {
        const laptop = new THREE.Group();
        laptop.position.set(offset, 0.78, 0.05);

        // Base keyboard
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.26), laptopBodyMat);
        base.position.set(0, 0.01, 0);
        laptop.add(base);

        // Screen lid angled 110 deg
        const lid = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.02), laptopBodyMat);
        lid.position.set(0, 0.12, -0.12);
        lid.rotation.x = -Math.PI / 10;
        laptop.add(lid);

        // Display panel
        const display = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), laptopScreenMat);
        display.position.set(0, 0.12, -0.108);
        display.rotation.x = -Math.PI / 10;
        laptop.add(display);
        laptopScreensList.push(display);

        deskGroup.add(laptop);

        // Ergonomic Chair behind laptop
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.05, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        chair.position.set(offset, 0.45, 0.55);
        deskGroup.add(chair);
      });

      scene.add(deskGroup);
    });

    // -----------------------------------------------------------
    // D. POWER FLOW PARTICLES (Animated Cable Conduit)
    // -----------------------------------------------------------
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Particle path from solar (-3.2, 0.2, 4.2) -> inverter (-4.4, 0.2, -3.2) -> desks (0, 0.8, 0)
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      positions[i * 3] = -3.2 + t * 3.2;
      positions[i * 3 + 1] = 0.25;
      positions[i * 3 + 2] = 4.2 - t * 4.2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // Store references
    sceneStateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      sunLight,
      ambientLight,
      particleSystem: particlePoints,
      flowParticles: particleGeo,
      particlePositions: positions,
      inverterLed: ledMesh,
      laptopScreens: laptopScreensList,
    };

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Damped controls
      controls.update();

      // Pulse inverter LED
      if (ledMesh) {
        const pulse = (Math.sin(elapsed * 4) + 1) / 2;
        (ledMesh.material as THREE.MeshBasicMaterial).color.setHex(pulse > 0.4 ? 0x10b981 : 0x059669);
      }

      // Animate power flow particles along path
      if (particleGeo && positions) {
        const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        const speed = isDayMode ? 1.5 : 0.8;

        for (let i = 0; i < particleCount; i++) {
          let t = ((i / particleCount) + (elapsed * speed * 0.15)) % 1.0;
          // Waypoint 0: Solar (-3.2, 0.2, 4.2)
          // Waypoint 1: Inverter (-4.4, 0.4, -3.2)
          // Waypoint 2: Room center (0, 0.8, 0)
          if (t < 0.5) {
            const segT = t / 0.5;
            array[i * 3] = -3.2 + segT * (-4.4 - -3.2);
            array[i * 3 + 1] = 0.25 + Math.sin(segT * Math.PI) * 0.1;
            array[i * 3 + 2] = 4.2 + segT * (-3.2 - 4.2);
          } else {
            const segT = (t - 0.5) / 0.5;
            array[i * 3] = -4.4 + segT * (0 - -4.4);
            array[i * 3 + 1] = 0.25 + segT * 0.55;
            array[i * 3 + 2] = -3.2 + segT * (0 - -3.2);
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Day / Night state dynamically
  useEffect(() => {
    const { scene, sunLight, ambientLight } = sceneStateRef.current;
    if (!scene || !sunLight || !ambientLight) return;

    if (isDayMode) {
      scene.background = new THREE.Color(0xf1f5f9);
      if (scene.fog) scene.fog.color = new THREE.Color(0xf1f5f9);
      sunLight.intensity = 1.6;
      sunLight.position.set(10, 15, 8);
      sunLight.color.setHex(0xfffaf0);
      ambientLight.intensity = 0.7;

      setActiveTelemetry({
        pvGenerationKw: 4.8,
        batterySocPct: 94,
        powerLoadW: 760,
        inverterEfficiencyPct: 97.8,
        ambientTempC: 28,
      });
    } else {
      scene.background = new THREE.Color(0x0f172a);
      if (scene.fog) scene.fog.color = new THREE.Color(0x0f172a);
      sunLight.intensity = 0.25;
      sunLight.position.set(-6, 12, -8);
      sunLight.color.setHex(0x60a5fa);
      ambientLight.intensity = 0.25;

      setActiveTelemetry({
        pvGenerationKw: 0.0,
        batterySocPct: 88,
        powerLoadW: 520,
        inverterEfficiencyPct: 96.5,
        ambientTempC: 22,
      });
    }
  }, [isDayMode]);

  // Camera presets
  const handleSelectView = (view: 'overview' | 'solar' | 'battery' | 'desks') => {
    setSelectedView(view);
    const { camera, controls } = sceneStateRef.current;
    if (!camera || !controls) return;

    if (view === 'overview') {
      camera.position.set(11, 8, 12);
      controls.target.set(0, 1.2, 0);
    } else if (view === 'solar') {
      camera.position.set(-3.2, 3.5, 7.8);
      controls.target.set(-3.2, 1.2, 4.2);
    } else if (view === 'battery') {
      camera.position.set(-2.2, 2.2, -1.8);
      controls.target.set(-4.4, 1.2, -3.2);
    } else if (view === 'desks') {
      camera.position.set(0, 3.8, 4.2);
      controls.target.set(0, 0.8, -0.5);
    }
  };

  return (
    <div
      className={`relative bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ${
        isInline ? 'w-full h-[580px]' : 'fixed inset-4 z-50 flex flex-col'
      }`}
    >
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 backdrop-blur-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">
                3D Digital Twin: {projectName}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PBR THREE.JS SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interaktive Inspektion von Solaranlage, Batteriespeicher & 12 IT-Schulungsplätzen (Kamerun)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Day / Night Toggle */}
          <button
            onClick={() => setIsDayMode(!isDayMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all backdrop-blur-md border ${
              isDayMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            {isDayMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            {isDayMode ? 'Tag: Direkte Solarerzeugung' : 'Nacht: Batteriespeicher'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/70 hover:bg-slate-800 transition-colors backdrop-blur-md"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Floating Camera View Selector */}
      <div className="absolute top-20 left-4 flex flex-col gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700/60 shadow-lg text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
          Perspektiven
        </span>
        <button
          onClick={() => handleSelectView('overview')}
          className={`px-3 py-1.5 rounded-lg text-left font-medium transition-all flex items-center gap-2 ${
            selectedView === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" /> Gesamtlabor
        </button>
        <button
          onClick={() => handleSelectView('solar')}
          className={`px-3 py-1.5 rounded-lg text-left font-medium transition-all flex items-center gap-2 ${
            selectedView === 'solar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" /> Photovoltaik-Array
        </button>
        <button
          onClick={() => handleSelectView('battery')}
          className={`px-3 py-1.5 rounded-lg text-left font-medium transition-all flex items-center gap-2 ${
            selectedView === 'battery' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Battery className="w-3.5 h-3.5 text-emerald-400" /> Batteriespeicher (LiFePO4)
        </button>
        <button
          onClick={() => handleSelectView('desks')}
          className={`px-3 py-1.5 rounded-lg text-left font-medium transition-all flex items-center gap-2 ${
            selectedView === 'desks' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-sky-400" /> IT-Workstations
        </button>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 inset-x-4 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/60 shadow-xl grid grid-cols-2 sm:grid-cols-5 gap-3 pointer-events-auto">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> PV-Einspeisung
            </div>
            <div className="text-base font-bold font-mono text-emerald-400">
              {activeTelemetry.pvGenerationKw.toFixed(1)} kWp
            </div>
            <div className="text-[10px] text-slate-400">
              {isDayMode ? 'Aktive Einstrahlung (Douala)' : 'Ruhezustand'}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Battery className="w-3 h-3 text-emerald-400" /> Speicherstand
            </div>
            <div className="text-base font-bold font-mono text-white">
              {activeTelemetry.batterySocPct} %
            </div>
            <div className="text-[10px] text-slate-400">10 kWh Kapazität</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" /> Reallast Labor
            </div>
            <div className="text-base font-bold font-mono text-sky-300">
              {activeTelemetry.powerLoadW} W
            </div>
            <div className="text-[10px] text-slate-400">12 Laptops + Router</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Inverter-Wirkungsgrad
            </div>
            <div className="text-base font-bold font-mono text-white">
              {activeTelemetry.inverterEfficiencyPct} %
            </div>
            <div className="text-[10px] text-emerald-400">Nominal im Sollbereich</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" /> Raumtemperatur
            </div>
            <div className="text-base font-bold font-mono text-amber-300">
              {activeTelemetry.ambientTempC} °C
            </div>
            <div className="text-[10px] text-slate-400">Passive Lüftung aktiv</div>
          </div>
        </div>
      </div>
    </div>
  );
};
