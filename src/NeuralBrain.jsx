import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './NeuralBrain.css';

const DOMAINS = [
  { id: 'autonomy', name: 'AUTONOMOUS SYSTEMS', color: '#75dfff', projects: ['QCar', 'Lap-Time MPC', 'AL-iLQR'] },
  { id: 'control', name: 'CONTROL SYSTEMS', color: '#9aafff', projects: ['Robust Self-Balancing Robot', 'Imitation MPC', 'Lap-Time MPC'] },
  { id: 'robotics', name: 'ROBOTICS', color: '#7df5cf', projects: ['TurtleBot3 ROS', 'Agricultural Sorting', 'Two-Wheeled Robot'] },
  { id: 'research', name: 'RESEARCH', color: '#ffc28d', projects: ['Computer-Aware Control', 'DeePC-V2X', 'Feedback Scheduling'] },
  { id: 'software', name: 'SOFTWARE', color: '#ffa1cb', projects: ['Python', 'MATLAB / Simulink', 'C++ / ROS'] }
];

function seededRandom() {
  let state = 23819;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}

function makeBrain() {
  const random = seededRandom(), nodes = [], edges = [], cellSize = 0.22, grid = new Map();
  const key = (a, b, c) => `${a},${b},${c}`;
  for (let tries = 0; tries < 42000 && nodes.length < 2600; tries++) {
    const x = (random() * 2 - 1) * 2.05;
    const y = (random() * 2 - 1) * 0.93;
    const z = (random() * 2 - 1) * 0.95;
    const side = x < 0 ? -1 : 1;
    const xLocal = x - side * 0.49;
    const hemisphere = (xLocal / 1.1) ** 2 + (y / 0.84) ** 2 + (z / 0.82) ** 2;
    const envelope = (x / 2.03) ** 2 + (y / 0.8) ** 2 + (z / 0.86) ** 2;
    if (hemisphere > 1 || envelope > 1 || (Math.abs(x) < 0.075 && y > -0.43)) continue;
    nodes.push({ x, y: y + 0.025 * Math.sin(17 * x + 9 * z), z, phase: random() });
  }
  nodes.forEach((node, index) => {
    const address = key(Math.floor(node.x / cellSize), Math.floor(node.y / cellSize), Math.floor(node.z / cellSize));
    if (!grid.has(address)) grid.set(address, []);
    grid.get(address).push(index);
  });
  nodes.forEach((node, index) => {
    const a = Math.floor(node.x / cellSize), b = Math.floor(node.y / cellSize), c = Math.floor(node.z / cellSize);
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(key(a + dx, b + dy, c + dz)) || []) {
        if (j <= index) continue;
        const other = nodes[j];
        const distance = (node.x - other.x) ** 2 + (node.y - other.y) ** 2 + (node.z - other.z) ** 2;
        if (distance < 0.055) neighbors.push([j, distance]);
      }
    }
    neighbors.sort((a, b) => a[1] - b[1]);
    neighbors.slice(0, 4).forEach(([j]) => edges.push([index, j]));
  });
  const anchors = DOMAINS.map((domain, index) => {
    const theta = index * Math.PI * 2 / DOMAINS.length - 0.5;
    return { ...domain, x: Math.cos(theta) * 1.22, y: Math.sin(theta * 1.5) * 0.48, z: Math.sin(theta) * 0.54 };
  });
  return { nodes, edges, anchors };
}

const GRAPH = makeBrain();

export default function NeuralBrain() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ rx: 0.12, ry: -0.3, tx: 0.12, ty: -0.3, zoom: 1, drag: false, moved: false, lastX: 0, lastY: 0 });
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);
  const [activeProject, setActiveProject] = useState('');
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false });
    const state = stateRef.current;
    let frameId, width = 0, height = 0, clock = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    const project = (point) => {
      const cy = Math.cos(state.ry), sy = Math.sin(state.ry);
      const cx = Math.cos(state.rx), sx = Math.sin(state.rx);
      const x = point.x * cy + point.z * sy;
      const z = -point.x * sy + point.z * cy;
      const y = point.y * cx - z * sx;
      const depth = point.y * sx + z * cx;
      const perspective = 3.7 / (4.9 - depth);
      const scale = Math.min(width * 0.32, height * 0.58) * state.zoom * perspective;
      return { x: width * (width < 650 ? 0.5 : 0.46) + x * scale, y: height * 0.52 - y * scale, z: depth };
    };
    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (state.drag) {
        const dx = event.clientX - state.lastX, dy = event.clientY - state.lastY;
        if (Math.abs(dx) + Math.abs(dy) > 1) state.moved = true;
        state.ty += dx * 0.007;
        state.tx = Math.max(-1.35, Math.min(1.35, state.tx + dy * 0.006));
        state.lastX = event.clientX; state.lastY = event.clientY;
      } else {
        state.ty = -0.3 + ((event.clientX - rect.left) / width - 0.5) * 0.75;
        state.tx = 0.12 + ((event.clientY - rect.top) / height - 0.5) * 0.45;
      }
    };
    const onDown = (event) => {
      state.drag = true; state.moved = false; state.lastX = event.clientX; state.lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onUp = (event) => {
      state.drag = false;
      if (state.moved) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      const hit = GRAPH.anchors.map((anchor) => ({ anchor, p: project(anchor) }))
        .map((entry) => ({ ...entry, distance: Math.hypot(entry.p.x - x, entry.p.y - y) }))
        .filter((entry) => entry.distance < 25).sort((a, b) => a.distance - b.distance)[0];
      if (hit) { setSelected(hit.anchor); setActiveProject(''); }
    };
    const onWheel = (event) => {
      event.preventDefault();
      state.zoom = Math.max(0.65, Math.min(2.6, state.zoom * Math.exp(-event.deltaY * 0.0008)));
    };
    const draw = () => {
      frameId = requestAnimationFrame(draw);
      if (!pausedRef.current) clock += 0.014;
      state.rx = d3.interpolateNumber(state.rx, state.tx)(0.07);
      state.ry = d3.interpolateNumber(state.ry, state.ty)(0.07);
      context.fillStyle = '#030914'; context.fillRect(0, 0, width, height);
      const projected = GRAPH.nodes.map(project);
      context.lineWidth = 0.65;
      for (const [a, b] of GRAPH.edges) {
        const p = projected[a], q = projected[b];
        context.strokeStyle = p.z + q.z > 0 ? 'rgba(72,185,222,0.17)' : 'rgba(51,108,157,0.09)';
        context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(q.x, q.y); context.stroke();
      }
      const sorted = projected.map((p, i) => ({ ...p, i })).sort((a, b) => a.z - b.z);
      for (const p of sorted) {
        const alpha = Math.max(0.14, Math.min(0.83, 0.38 + p.z * 0.22));
        context.fillStyle = `rgba(112,213,245,${alpha})`;
        context.beginPath(); context.arc(p.x, p.y, Math.max(0.7, state.zoom * 1.05), 0, Math.PI * 2); context.fill();
      }
      for (const anchor of GRAPH.anchors) {
        const p = project(anchor), chosen = selectedRef.current?.id === anchor.id;
        const radius = (chosen ? 35 : 26) * state.zoom;
        const glow = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        glow.addColorStop(0, anchor.color + 'b0'); glow.addColorStop(1, anchor.color + '00');
        context.fillStyle = glow; context.beginPath(); context.arc(p.x, p.y, radius, 0, Math.PI * 2); context.fill();
        context.fillStyle = anchor.color; context.beginPath();
        context.arc(p.x, p.y, (chosen ? 7 : 5) * state.zoom + Math.sin(clock * 2) * 0.3, 0, Math.PI * 2); context.fill();
        context.font = '600 11px system-ui, sans-serif'; context.textAlign = 'center';
        context.fillStyle = '#e6f8ff'; context.fillText(anchor.name, p.x, p.y - 17 * state.zoom);
      }
      const domain = selectedRef.current;
      if (domain) {
        const center = project(domain);
        domain.projects.forEach((name, index) => {
          const angle = index * Math.PI * 2 / domain.projects.length;
          const satellite = project({ x: domain.x + Math.cos(angle) * 0.52, y: domain.y + Math.sin(angle) * 0.4, z: domain.z + Math.sin(angle) * 0.35 });
          context.strokeStyle = domain.color + 'aa'; context.lineWidth = 1.5;
          context.beginPath(); context.moveTo(center.x, center.y); context.lineTo(satellite.x, satellite.y); context.stroke();
          context.fillStyle = domain.color; context.beginPath(); context.arc(satellite.x, satellite.y, 4.2, 0, Math.PI * 2); context.fill();
          context.fillStyle = '#f0faff'; context.font = '12px system-ui, sans-serif'; context.fillText(name, satellite.x, satellite.y - 12);
        });
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); resize(); draw();
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frameId); observer.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <section className="neural-observatory" aria-label="Interactive 3D engineering knowledge brain">
      <canvas ref={canvasRef} className="neural-canvas" aria-label="Rotatable digital brain made of connected nodes" />
      <div className="neural-title"><span>INTERACTIVE KNOWLEDGE GRAPH</span><h2>Engineering, connected.</h2><p>Move to rotate · Drag to orbit · Scroll to zoom · Select a glowing node</p></div>
      <aside className="neural-panel">
        <span>{selected ? 'SELECTED DOMAIN' : 'NEURAL OBSERVATORY'}</span>
        <h3>{activeProject || selected?.name || 'Explore the brain'}</h3>
        <p>{activeProject ? 'This project is part of the connected engineering portfolio. Explore the detailed project cards below.' : selected ? 'Select a connected project to explore its work.' : 'A 3D digital brain composed of neural connections and highlighted engineering domains.'}</p>
        {selected && <div className="neural-projects">{selected.projects.map((project) => <button key={project} onClick={() => setActiveProject(project)}>{project}</button>)}</div>}
        <div className="neural-actions"><button onClick={() => { setSelected(null); setActiveProject(''); stateRef.current.zoom = 1; }}>Reset</button><button onClick={() => setPaused((value) => !value)}>{paused ? 'Resume pulses' : 'Pause pulses'}</button></div>
      </aside>
    </section>
  );
}
