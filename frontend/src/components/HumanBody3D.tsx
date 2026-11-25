import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrganEvidence, DrugJourneyStage } from '../types';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers, ShieldCheck, Sparkles, Activity } from 'lucide-react';

interface HumanBody3DProps {
  organEvidenceList?: OrganEvidence[];
  selectedOrganId?: string | null;
  onSelectOrgan?: (organId: string) => void;
  currentStage?: DrugJourneyStage | null;
  interactive?: boolean;
}

const STATUS_COLORS: Record<string, number> = {
  blue: 0x3b82f6,    // Selected
  green: 0x10b981,   // Normal
  yellow: 0xf59e0b,  // Precautionary / response
  orange: 0xf97316,  // Documented adverse / toxicity
  red: 0xef4444,     // Boxed warning / serious safety
  grey: 0x6b7280     // Insufficient evidence
};

export const HumanBody3D: React.FC<HumanBody3DProps> = ({
  organEvidenceList = [],
  selectedOrganId = null,
  onSelectOrgan,
  currentStage = null,
  interactive = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>('3d');
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const organMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const particlesRef = useRef<THREE.Points | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (renderMode !== '3d' || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 550;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.1, 4.0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(2, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.8);
    dirLight2.position.set(-2, -2, -2);
    scene.add(dirLight2);

    // Group for rotating body
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);
    rotationGroupRef.current = bodyGroup;

    // 5. Construct Translucent Human Silhouette / Wireframe
    const silhouetteMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.35,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: false
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    // Head
    const headGeom = new THREE.SphereGeometry(0.24, 24, 24);
    const headMesh = new THREE.Mesh(headGeom, silhouetteMaterial);
    headMesh.position.set(0, 1.75, 0);
    bodyGroup.add(headMesh);
    bodyGroup.add(new THREE.Mesh(headGeom, wireframeMaterial).copy(headMesh));

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.09, 0.11, 0.15, 16);
    const neckMesh = new THREE.Mesh(neckGeom, silhouetteMaterial);
    neckMesh.position.set(0, 1.55, 0);
    bodyGroup.add(neckMesh);

    // Torso / Chest
    const chestGeom = new THREE.CylinderGeometry(0.34, 0.28, 0.65, 24);
    const chestMesh = new THREE.Mesh(chestGeom, silhouetteMaterial);
    chestMesh.position.set(0, 1.2, 0);
    bodyGroup.add(chestMesh);
    bodyGroup.add(new THREE.Mesh(chestGeom, wireframeMaterial).copy(chestMesh));

    // Abdomen / Pelvis
    const abdomenGeom = new THREE.CylinderGeometry(0.28, 0.32, 0.55, 24);
    const abdomenMesh = new THREE.Mesh(abdomenGeom, silhouetteMaterial);
    abdomenMesh.position.set(0, 0.65, 0);
    bodyGroup.add(abdomenMesh);

    // Arms
    const armGeom = new THREE.CylinderGeometry(0.07, 0.05, 0.7, 16);
    const leftArm = new THREE.Mesh(armGeom, silhouetteMaterial);
    leftArm.position.set(-0.46, 1.15, 0);
    leftArm.rotation.z = 0.2;
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, silhouetteMaterial);
    rightArm.position.set(0.46, 1.15, 0);
    rightArm.rotation.z = -0.2;
    bodyGroup.add(rightArm);

    // Legs
    const legGeom = new THREE.CylinderGeometry(0.1, 0.06, 0.9, 16);
    const leftLeg = new THREE.Mesh(legGeom, silhouetteMaterial);
    leftLeg.position.set(-0.16, -0.05, 0);
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeom, silhouetteMaterial);
    rightLeg.position.set(0.16, -0.05, 0);
    bodyGroup.add(rightLeg);

    // 6. Detailed Anatomical Organs
    const organDefinitions = [
      { id: 'brain', geom: new THREE.SphereGeometry(0.17, 20, 20), pos: [0, 1.77, 0.02], scale: [1.1, 0.95, 1.2] },
      { id: 'heart', geom: new THREE.SphereGeometry(0.11, 20, 20), pos: [0.08, 1.25, 0.08], scale: [1, 1.2, 1] },
      { id: 'lungs', geom: new THREE.CapsuleGeometry(0.1, 0.2, 16, 16), pos: [-0.15, 1.26, 0.04], scale: [1.1, 1, 0.9] },
      { id: 'liver', geom: new THREE.ConeGeometry(0.18, 0.22, 16), pos: [-0.12, 0.94, 0.09], rot: [0, 0, -0.5], scale: [1.3, 1, 1] },
      { id: 'stomach', geom: new THREE.SphereGeometry(0.12, 18, 18), pos: [0.12, 0.95, 0.08], scale: [1.2, 0.9, 1] },
      { id: 'pancreas', geom: new THREE.BoxGeometry(0.18, 0.06, 0.06), pos: [0.02, 0.86, 0.03] },
      { id: 'intestines', geom: new THREE.TorusGeometry(0.14, 0.06, 16, 32), pos: [0, 0.65, 0.08], rot: [1.4, 0, 0] },
      { id: 'kidneys', geom: new THREE.CapsuleGeometry(0.06, 0.08, 16, 16), pos: [0.14, 0.82, -0.08], scale: [1, 1, 1.2] },
      { id: 'skin', geom: new THREE.IcosahedronGeometry(0.4, 1), pos: [0, 1.0, 0.28], scale: [0.7, 1.2, 0.3] }
    ];

    const organMeshes = new Map<string, THREE.Mesh>();

    organDefinitions.forEach(def => {
      // Find matching status color
      const ev = organEvidenceList.find(e => e.organ_id === def.id);
      const statusKey = ev ? ev.status : 'grey';
      const colorVal = STATUS_COLORS[statusKey] || 0x6b7280;

      const organMat = new THREE.MeshStandardMaterial({
        color: colorVal,
        emissive: colorVal,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.2
      });

      const mesh = new THREE.Mesh(def.geom, organMat);
      mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
      if (def.rot) mesh.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      if (def.scale) mesh.scale.set(def.scale[0], def.scale[1], def.scale[2]);
      mesh.userData = { organId: def.id };

      bodyGroup.add(mesh);
      organMeshes.set(def.id, mesh);
    });

    organMeshesRef.current = organMeshes;

    // 7. Circulatory Flow Particle System (Drug Journey active flow)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 0.45;
      positions[i + 1] = Math.random() * 1.6 + 0.2;
      positions[i + 2] = (Math.random() - 0.5) * 0.25;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    bodyGroup.add(particles);
    particlesRef.current = particles;

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow gentle idle rotation when not dragging
      if (!isDraggingRef.current && bodyGroup) {
        bodyGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.15;
      }

      // Animate bloodstream particles downward/pulsing
      if (particles) {
        const posArray = particles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < particleCount * 3; i += 3) {
          posArray[i] -= 0.008;
          if (posArray[i] < 0.2) {
            posArray[i] = 1.8;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      // Pulsing glow for selected or stage-targeted organ
      const targetOrganId = currentStage?.primary_organ || selectedOrganId;
      if (targetOrganId && organMeshes.has(targetOrganId)) {
        const mesh = organMeshes.get(targetOrganId)!;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 4) * 0.35;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Interactive Mouse / Touch Orbit and Raycasting
    const dom = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Rotate group on drag
      if (isDraggingRef.current && bodyGroup) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        bodyGroup.rotation.y += deltaX * 0.008;
        bodyGroup.rotation.x = Math.max(-0.4, Math.min(0.4, bodyGroup.rotation.x + deltaY * 0.005));
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }

      // Raycast to detect hover
      raycaster.setFromCamera(mouse, camera);
      const organMeshArray = Array.from(organMeshes.values());
      const intersects = raycaster.intersectObjects(organMeshArray);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        setHoveredOrgan(hitMesh.userData.organId);
        dom.style.cursor = 'pointer';
      } else {
        setHoveredOrgan(null);
        dom.style.cursor = 'grab';
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const organMeshArray = Array.from(organMeshes.values());
      const intersects = raycaster.intersectObjects(organMeshArray);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const organId = hitMesh.userData.organId;
        if (onSelectOrgan) onSelectOrgan(organId);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(2.2, Math.min(6.0, camera.position.z + e.deltaY * 0.004));
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('click', onClick);
    dom.addEventListener('wheel', onWheel);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [renderMode]);

  // Update organ colors whenever evidence or selection changes
  useEffect(() => {
    if (!organMeshesRef.current) return;

    organMeshesRef.current.forEach((mesh, organId) => {
      const isSelected = selectedOrganId === organId;
      const isStageFocus = currentStage?.primary_organ === organId;
      const ev = organEvidenceList.find(e => e.organ_id === organId);

      let colorVal = 0x6b7280;
      if (isSelected) {
        colorVal = STATUS_COLORS.blue;
      } else if (ev) {
        colorVal = STATUS_COLORS[ev.status] || 0x6b7280;
      }

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(colorVal);
      mat.emissive.setHex(colorVal);
      mat.emissiveIntensity = isSelected || isStageFocus ? 0.6 : 0.25;

      // Scale effect for selection
      if (isSelected || isStageFocus) {
        mesh.scale.set(1.15, 1.15, 1.15);
      } else {
        mesh.scale.set(1.0, 1.0, 1.0);
      }
    });
  }, [organEvidenceList, selectedOrganId, currentStage]);

  const handleResetCamera = () => {
    if (cameraRef.current && rotationGroupRef.current) {
      cameraRef.current.position.set(0, 1.1, 4.0);
      rotationGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(2.2, Math.min(6.0, cameraRef.current.position.z + delta));
    }
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Header Bar & Mode Toggle */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 pointer-events-auto">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            {renderMode === '3d' ? '3D Interactive Anatomy' : '2D Educational Fallback'}
          </span>
          {hoveredOrgan && (
            <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono rounded capitalize">
              {hoveredOrgan}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 pointer-events-auto">
          <button
            onClick={() => setRenderMode('3d')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              renderMode === '3d' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            3D WebGL
          </button>
          <button
            onClick={() => setRenderMode('2d')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
              renderMode === '2d' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D Vector
          </button>
        </div>
      </div>

      {/* Main Rendering Viewport */}
      {renderMode === '3d' ? (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        /* 2D Fallback Vector View */
        <div className="w-full h-full flex items-center justify-center p-6 bg-slate-950">
          <svg viewBox="0 0 400 600" className="w-full h-full max-h-[500px]">
            {/* Silhouette */}
            <path
              d="M 200,40 C 170,40 160,80 160,110 C 160,130 175,145 185,150 L 140,180 L 120,320 L 145,320 L 160,240 L 165,360 L 150,560 L 185,560 L 195,400 L 205,400 L 215,560 L 250,560 L 235,360 L 240,240 L 255,320 L 280,320 L 260,180 L 215,150 C 225,145 240,130 240,110 C 240,80 230,40 200,40 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            {/* Brain */}
            <circle
              cx="200" cy="90" r="28"
              fill={selectedOrganId === 'brain' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'brain')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'brain')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('brain')}
            />
            <text x="200" y="95" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Brain</text>

            {/* Heart */}
            <circle
              cx="215" cy="220" r="22"
              fill={selectedOrganId === 'heart' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'heart')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'heart')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('heart')}
            />
            <text x="215" y="224" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Heart</text>

            {/* Liver */}
            <ellipse
              cx="175" cy="275" rx="32" ry="20"
              fill={selectedOrganId === 'liver' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'liver')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'liver')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('liver')}
            />
            <text x="175" y="278" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Liver</text>

            {/* Stomach */}
            <ellipse
              cx="225" cy="275" rx="22" ry="16"
              fill={selectedOrganId === 'stomach' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'stomach')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'stomach')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('stomach')}
            />
            <text x="225" y="278" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Stomach</text>

            {/* Kidneys */}
            <ellipse
              cx="228" cy="315" rx="14" ry="18"
              fill={selectedOrganId === 'kidneys' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'kidneys')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'kidneys')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('kidneys')}
            />
            <text x="228" y="318" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Kidneys</text>

            {/* Intestines */}
            <rect
              x="170" y="335" width="60" height="35" rx="10"
              fill={selectedOrganId === 'intestines' ? '#3b82f6' : (STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'intestines')?.status || 'grey'] ? `#${STATUS_COLORS[organEvidenceList.find(e => e.organ_id === 'intestines')?.status || 'grey'].toString(16)}` : '#6b7280')}
              className="cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onSelectOrgan && onSelectOrgan('intestines')}
            />
            <text x="200" y="355" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Intestines</text>
          </svg>
        </div>
      )}

      {/* Floating 3D Navigation Controls */}
      {renderMode === '3d' && (
        <div className="absolute right-3 bottom-14 z-10 flex flex-col space-y-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <button
            onClick={() => handleZoom(-0.5)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.5)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Orientation"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6-State Color Classification Legend */}
      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 overflow-x-auto">
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span>Normal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            <span>Precautionary</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
            <span>Adverse Effect</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
            <span>Boxed Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-sm" />
            <span>Baseline</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 pl-3 shrink-0 hidden md:block">
          *Visual classifications indicate scientific benchmark evidence, not clinical damage.
        </div>
      </div>
    </div>
  );
};
