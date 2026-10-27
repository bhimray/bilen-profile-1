import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GearUniverse.css';

const MODULE = 3;
const PRESSURE_ANGLE = Math.PI / 9;
const FACE_WIDTH = 11;
const SHAFT_SPACING = 18;
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const definition = [
  { id:'input', teeth:18, x:-325, y:0, plane:0, color:'#f3d99d', label:'INPUT' },
  { id:'autonomy', teeth:42, parent:'input', mesh:-0.03, plane:0, color:'#75e2f3', label:'AUTONOMY' },
  { id:'compound-1', teeth:18, parent:'autonomy', shaft:true, plane:1, color:'#7caac0' },
  { id:'control', teeth:46, parent:'compound-1', mesh:-0.36, plane:1, color:'#aab3ff', label:'CONTROL' },
  { id:'compound-2', teeth:18, parent:'control', shaft:true, plane:2, color:'#7caac0' },
  { id:'robotics', teeth:38, parent:'compound-2', mesh:0.72, plane:2, color:'#83f0c7', label:'ROBOTICS' },
  { id:'compound-3', teeth:18, parent:'robotics', shaft:true, plane:3, color:'#7caac0' },
  { id:'research', teeth:42, parent:'compound-3', mesh:-0.76, plane:3, color:'#ffd199', label:'RESEARCH' },
  { id:'compound-4', teeth:18, parent:'research', shaft:true, plane:4, color:'#7caac0' },
  { id:'software', teeth:38, parent:'compound-4', mesh:0.91, plane:4, color:'#f3a8d0', label:'SOFTWARE' },
  { id:'compound-5', teeth:18, parent:'software', shaft:true, plane:5, color:'#7caac0' },
  { id:'mechanics', teeth:36, parent:'compound-5', mesh:-0.64, plane:5, color:'#8fbfff', label:'MECHANICS' },
  { id:'aux-1', teeth:20, parent:'autonomy', mesh:2.72, plane:0, color:'#608fa9' },
  { id:'aux-2', teeth:20, parent:'robotics', mesh:2.05, plane:2, color:'#608fa9' },
  { id:'aux-3', teeth:20, parent:'software', mesh:2.34, plane:4, color:'#608fa9' }
];
const category = [
  { id:'autonomy', title:'Autonomous systems', terms:['qcar','autonomous','racing','vehicle','lap time'] },
  { id:'control', title:'Control & optimization', terms:['control','mpc','lqr','ilqr','stability','robust'] },
  { id:'robotics', title:'Robotics & navigation', terms:['robot','ros','turtlebot','sort','mujoco','legged'] },
  { id:'research', title:'Research & analysis', terms:['analysis','simulation','uncertainty','learning','optimization'] },
  { id:'software', title:'Software & simulation', terms:['python','matlab','simulink','c++','opencv','pytorch'] },
  { id:'mechanics', title:'Mechanical systems', terms:['dynamics','mechanical','motor','actuator','robot','vehicle'] }
];
function involute(r, base) {
  const t = Math.sqrt(Math.max(0, (r/base)**2 - 1));
  return t - Math.atan(t);
}
function toothContour(teeth) {
  const pitch = MODULE * teeth / 2;
  const root = pitch - 1.25 * MODULE;
  const tip = pitch + MODULE;
  const base = pitch * Math.cos(PRESSURE_ANGLE);
  const thickness = r => Math.PI/(2*teeth) + involute(pitch,base) - involute(Math.max(r,base),base);
  const start = Math.max(base,root), points=[];
  const push=(r,a)=>points.push([r*Math.cos(a),r*Math.sin(a)]);
  const step=TAU/teeth;
  for(let j=0;j<teeth;j++) {
    const a=j*step;
    push(root,a-step*.39);
    push(start,a-thickness(start));
    for(let k=1;k<=5;k++) { const r=start+(tip-start)*k/5; push(r,a-thickness(r)); }
    for(let k=1;k<=3;k++) push(tip,a-thickness(tip)+2*thickness(tip)*k/3);
    for(let k=4;k>=0;k--) { const r=start+(tip-start)*k/5; push(r,a+thickness(r)); }
    push(root,a+step*.39);
    push(root,a+step*.61);
  }
  return points;
}
const parts=[],lookup=new Map();
definition.forEach(def=>{
  const parent=lookup.get(def.parent);
  const pitch=MODULE*def.teeth/2, plane=def.plane||0;
  const x=parent ? parent.x + (def.shaft?0:(parent.pitch+pitch)*Math.cos(def.mesh)) : def.x;
  const y=parent ? parent.y + (def.shaft?0:(parent.pitch+pitch)*Math.sin(def.mesh)) : def.y;
  const ratio=parent ? (def.shaft?parent.ratio:-parent.ratio*parent.teeth/def.teeth) : 1;
  const phase=parent ? (def.shaft ? parent.phase :
    -(parent.teeth/def.teeth)*parent.phase +
    (parent.teeth+def.teeth)/def.teeth*def.mesh +
    Math.PI-Math.PI/def.teeth) : 0;
  const part={...def,pitch,x,y,plane,ratio,phase,contour:toothContour(def.teeth),z:plane*SHAFT_SPACING};
  parts.push(part);lookup.set(def.id,part);
});
const interesting=parts.filter(p=>p.label);
const bounds={
  minX:Math.min(...parts.map(p=>p.x-p.pitch-MODULE)),
  maxX:Math.max(...parts.map(p=>p.x+p.pitch+MODULE)),
  minY:Math.min(...parts.map(p=>p.y-p.pitch-MODULE)),
  maxY:Math.max(...parts.map(p=>p.y+p.pitch+MODULE))
};
const MID=[(bounds.minX+bounds.maxX)/2,(bounds.minY+bounds.maxY)/2,SHAFT_SPACING*2.5];
const SPAN=Math.max(bounds.maxX-bounds.minX,(bounds.maxY-bounds.minY)*1.55);
function relatedProjects(domain,projects) {
  if(!domain)return projects;
  return projects.map(project=>{
    const corpus=[project.title,project.overview,project.approach,...(project.technologies||[])].join(' ').toLowerCase();
    return {project,score:domain.terms.filter(t=>corpus.includes(t)).length};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score).map(x=>x.project);
}
function rgba(hex,alpha){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+alpha+')';
}
function line(ctx,a,b,color,width=.7){
  if(!a||!b)return;
  ctx.strokeStyle=color;ctx.lineWidth=width;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
}
function outline(ctx,points,fill,stroke,width=1){
  if(points.length<3)return;
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}
}
function drawMechanism(ctx,project,part,angle,highlight,time,reduceMotion){
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const world=(x,y,z)=>project([part.x+x*cos-y*sin,part.y+x*sin+y*cos,part.z+z]);
  const front=FACE_WIDTH/2,back=-FACE_WIDTH/2;
  const edge=part.contour.map(([x,y])=>world(x,y,front));
  const rear=part.contour.map(([x,y])=>world(x,y,back));
  // Solid backing with extruded tooth walls, sampled more densely around tooth tips.
  outline(ctx,rear,'#06131e',rgba(part.color,.24),.5);
  for(let i=0;i<edge.length;i+=2){
    const j=(i+2)%edge.length;
    const depth=(edge[i].depth+edge[j].depth+rear[i].depth+rear[j].depth)/4;
    outline(ctx,[rear[i],rear[j],edge[j],edge[i]],
      depth>0?'#133444':'#081a28',rgba(part.color,highlight?.12:.045),.38);
  }
  outline(ctx,edge,highlight?'#133447':'#092230',rgba(part.color,highlight?.88:.55),highlight?1.4:.85);
  const rings=[.77,.54,.3],segments=part.teeth*2;
  rings.forEach((fraction,j)=>{
    let previous=null,first=null;
    for(let i=0;i<=segments;i++){
      const theta=TAU*i/segments;
      const r=part.pitch*fraction;
      const point=world(r*Math.cos(theta),r*Math.sin(theta),front+.12);
      if(previous)line(ctx,previous,point,rgba(part.color,highlight?.43:.17),.7);
      if(i===0)first=point;
      previous=point;
    }
    if(first&&previous)line(ctx,previous,first,rgba(part.color,.21),.6);
  });
  // Create a brain-like connected net on each rotating face.
  const meshCount=Math.max(48,part.teeth*3);
  let prevOuter=null,prevInner=null;
  for(let i=0;i<meshCount;i++){
    const theta=TAU*i/meshCount, rOuter=part.pitch*.77,rInner=part.pitch*.54;
    const outer=world(Math.cos(theta)*rOuter,Math.sin(theta)*rOuter,front+.2);
    const inner=world(Math.cos(theta)*rInner,Math.sin(theta)*rInner,front+.2);
    if(i%2===0)line(ctx,outer,inner,rgba(part.color,highlight?.32:.15),.58);
    if(prevOuter && i%3===0)line(ctx,prevOuter,inner,rgba(part.color,.17),.46);
    if(i%3===0){
      const radius=highlight?1.65:1.05;
      ctx.beginPath();ctx.arc(outer.x,outer.y,radius,0,TAU);ctx.fillStyle=rgba(part.color,highlight?.8:.44);ctx.fill();
    }
    prevOuter=outer;prevInner=inner;
  }
  // Hub + 3D central shaft indicate the compound drive connection.
  const hub=[];
  for(let i=0;i<50;i++){
    const t=TAU*i/50,rad=part.pitch*.235;
    hub.push(world(rad*Math.cos(t),rad*Math.sin(t),front+.5));
  }
  outline(ctx,hub,'#06121d',rgba(part.color,.85),1.1);
  const axle=world(0,0,front+3);
  ctx.beginPath();ctx.arc(axle.x,axle.y,highlight?3.6:2.6,0,TAU);
  ctx.fillStyle=part.color;ctx.fill();
  if(highlight){
    const g=ctx.createRadialGradient(axle.x,axle.y,0,axle.x,axle.y,35);
    g.addColorStop(0,rgba(part.color,.19));g.addColorStop(1,rgba(part.color,0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(axle.x,axle.y,35,0,TAU);ctx.fill();
  }
  if(!reduceMotion && highlight){
    const a=(time*.85)%TAU;
    const pulse=world(Math.cos(a)*part.pitch*.77,Math.sin(a)*part.pitch*.77,front+.5);
    const grad=ctx.createRadialGradient(pulse.x,pulse.y,0,pulse.x,pulse.y,11);
    grad.addColorStop(0,rgba(part.color,.8));grad.addColorStop(1,rgba(part.color,0));
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(pulse.x,pulse.y,11,0,TAU);ctx.fill();
  }
  return {center:world(0,0,0),radius:Math.hypot(edge[0].x-axle.x,edge[0].y-axle.y)};
}
export default function GearUniverse({projects=[],onOpenPortfolio}){
  const [selected,setSelected]=useState('control');
  const [projectId,setProjectId]=useState(null);
  const [drawer,setDrawer]=useState(false);
  const [motor,setMotor]=useState(true);
  const [query,setQuery]=useState('');
  const [labels,setLabels]=useState(true);
  const [reading,setReading]=useState({part:'control',ratio:0});
  const canvasRef=useRef(null),runtime=useRef(null);
  const state=useRef({
    yaw:-.33,pitch:-.35,targetYaw:-.33,targetPitch:-.35,
    zoom:1,targetZoom:1,panX:0,panY:0,targetPanX:0,targetPanY:0,
    angle:0,speed:.005,drag:null,motor:true,selected:'control',labels:true,
    points:[],screenWidth:1,screenHeight:1
  });
  const current=category.find(x=>x.id===selected);
  const matching=useMemo(()=>relatedProjects(current,projects),[current,projects]);
  const filtered=matching.filter(p=>(p.title+' '+(p.technologies||[]).join(' ')).toLowerCase().includes(query.toLowerCase()));
  const project=projects.find(p=>p.id===projectId);
  useEffect(()=>{state.current.motor=motor},[motor]);
  useEffect(()=>{state.current.selected=selected},[selected]);
  useEffect(()=>{state.current.labels=labels},[labels]);
  useEffect(()=>{
    const priorBody=document.body.style.overflow,priorHtml=document.documentElement.style.overflow;
    document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
    return ()=>{document.body.style.overflow=priorBody;document.documentElement.style.overflow=priorHtml};
  },[]);
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d',{alpha:false});
    const view=state.current,media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,last=0,dpr=1,elapsed=0,visible=true;
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      dpr=Math.min(window.devicePixelRatio||1,2);
      view.screenWidth=Math.max(1,rect.width);view.screenHeight=Math.max(1,rect.height);
      canvas.width=Math.round(view.screenWidth*dpr);canvas.height=Math.round(view.screenHeight*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const visibility=()=>{visible=!document.hidden;last=0};
    document.addEventListener('visibilitychange',visibility);
    const draw=timestamp=>{
      frame=requestAnimationFrame(draw);
      if(!visible)return;
      const dt=clamp(last?(timestamp-last)/16.667:1,0,2.8);last=timestamp;
      const ease=v=>1-Math.pow(1-v,dt);
      const t=ease(.085);
      view.yaw=d3.interpolateNumber(view.yaw,view.targetYaw)(t);
      view.pitch=d3.interpolateNumber(view.pitch,view.targetPitch)(t);
      view.zoom=d3.interpolateNumber(view.zoom,view.targetZoom)(t);
      view.panX=d3.interpolateNumber(view.panX,view.targetPanX)(t);
      view.panY=d3.interpolateNumber(view.panY,view.targetPanY)(t);
      if(!media.matches&&!view.drag&&view.motor){
        view.angle+=view.speed*dt;
        view.speed=d3.interpolateNumber(view.speed,.005)(ease(.024));
        elapsed+=dt*.017;
      }
      const {screenWidth:w,screenHeight:h}=view;
      ctx.fillStyle='#030b16';ctx.fillRect(0,0,w,h);
      const bg=ctx.createRadialGradient(w*.5,h*.5,15,w*.5,h*.5,Math.max(w,h)*.55);
      bg.addColorStop(0,'#17324665');bg.addColorStop(1,'#040b1500');
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      // World coordinates -> orbit camera -> perspective projection (no Three.js).
      const projectPoint=p=>{
        const dx=p[0]-MID[0],dy=p[1]-MID[1],dz=p[2]-MID[2];
        const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),cx=Math.cos(view.pitch),sx=Math.sin(view.pitch);
        const X=dx*cy+dz*sy;
        const Z=-dx*sy+dz*cy;
        const Y=dy*cx-Z*sx;
        const depth=dy*sx+Z*cx;
        const perspective=1250/(1250-depth);
        const fit=Math.min(w/Math.max(SPAN,650),h/Math.max(SPAN*.78,510))*.84;
        const scale=fit*view.zoom*perspective;
        return {x:w*.5+(X+view.panX)*scale,y:h*.52-(Y+view.panY)*scale,depth,scale};
      };
      const locations=[];
      // Rendering sorted back to front keeps the 3D assembly visually coherent.
      for(const part of [...parts].sort((a,b)=>{
        const center=p=>projectPoint([p.x,p.y,p.z]).depth;
        return center(a)-center(b);
      })){
        const active=view.selected===part.id||view.selected===part.parent;
        const result=drawMechanism(ctx,projectPoint,part,
          view.angle*part.ratio+part.phase,active,elapsed,media.matches);
        locations.push({...part,...result});
      }
      if(view.labels){
        ctx.textAlign='center';ctx.textBaseline='middle';
        for(const p of locations.filter(x=>x.label)){
          const hub=p.center;
          const base=Math.max(10,Math.min(13,11*hub.scale));
          ctx.font='600 '+base+'px system-ui,sans-serif';
          const width=ctx.measureText(p.label).width+17;
          ctx.fillStyle='rgba(3,15,26,.89)';
          ctx.fillRect(hub.x-width/2,hub.y+17,width,21);
          ctx.fillStyle=p.color;ctx.fillText(p.label,hub.x,hub.y+28);
        }
      }
      view.points=locations;
    };
    frame=requestAnimationFrame(draw);
    runtime.current={resize};
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
  },[]);
  const select=part=>{
    if(!part)return;
    const node=part.label?part:lookup.get(part.parent)||part;
    const name=category.some(x=>x.id===node.id)?node.id:'input';
    state.current.selected=node.id;
    setSelected(name);
    setReading({part:part.id,ratio:part.ratio});
    setProjectId(null);setQuery('');setDrawer(true);
  };
  const localPoint=e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    return {x:e.clientX-rect.left,y:e.clientY-rect.top};
  };
  const down=e=>{
    if(e.button!==0&&e.pointerType==='mouse')return;
    const p=localPoint(e),view=state.current;
    const nodes=[...view.points].reverse();
    const hit=nodes.find(part=>{
      const distance=Math.hypot(p.x-part.center.x,p.y-part.center.y);
      return distance<clamp(part.pitch*part.center.scale*.72,14,150);
    });
    view.drag={type:hit?'gear':e.shiftKey||e.button===2?'pan':'orbit',part:hit,
      x:p.x,y:p.y,lastX:p.x,lastY:p.y,travel:0,
      yaw:view.targetYaw,pitch:view.targetPitch,panX:view.targetPanX,panY:view.targetPanY};
    canvasRef.current.setPointerCapture(e.pointerId);
  };
  const move=e=>{
    const view=state.current,drag=view.drag;
    if(!drag)return;
    const p=localPoint(e);
    const dx=p.x-drag.lastX,dy=p.y-drag.lastY;
    drag.travel+=Math.hypot(dx,dy);
    if(drag.type==='orbit'){
      view.targetYaw=drag.yaw+(p.x-drag.x)*.006;
      view.targetPitch=clamp(drag.pitch+(p.y-drag.y)*.006,-1.28,1.28);
    }else if(drag.type==='pan'){
      const fit=Math.min(view.screenWidth/Math.max(SPAN,650),view.screenHeight/Math.max(SPAN*.78,510))*.84;
      view.targetPanX=drag.panX+(p.x-drag.x)/(fit*view.zoom);
      view.targetPanY=drag.panY-(p.y-drag.y)/(fit*view.zoom);
    }else if(drag.type==='gear' && drag.part){
      const c=drag.part.center;
      const oldAngle=Math.atan2(drag.lastY-c.y,drag.lastX-c.x);
      const newAngle=Math.atan2(p.y-c.y,p.x-c.x);
      const delta=Math.atan2(Math.sin(newAngle-oldAngle),Math.cos(newAngle-oldAngle));
      if(drag.travel>3 && Math.abs(drag.part.ratio)>1e-8){
        view.angle+=delta/drag.part.ratio;
        view.speed=clamp(delta/drag.part.ratio*.2,-.045,.045);
      }
    }
    drag.lastX=p.x;drag.lastY=p.y;
  };
  const up=()=>{
    const drag=state.current.drag;
    state.current.drag=null;
    if(drag?.type==='gear'&&drag.travel<5)select(drag.part);
  };
  const wheel=e=>{e.preventDefault();state.current.targetZoom=clamp(state.current.targetZoom*Math.exp(-e.deltaY*.00115),.45,4)};
  const reset=()=>Object.assign(state.current,{targetYaw:-.33,targetPitch:-.35,targetZoom:1,targetPanX:0,targetPanY:0});
  const selectedPart=lookup.get(reading.part)||lookup.get('input');
  const ratioText=(1/Math.abs(selectedPart.ratio)).toFixed(2);
  return <section className="gear3d-home">
    <div className="gear3d-grain" aria-hidden="true"/>
    <header className="gear3d-header">
      <div className="gear3d-brand"><b>BR</b><span><strong>BIMLENDRA RAY</strong><small>CONTROLS · ROBOTICS · AUTONOMY</small></span></div>
      <div className="gear3d-top-actions"><span className="gear3d-online">● TRANSMISSION ONLINE</span><button onClick={()=>setDrawer(v=>!v)}>{drawer?'Hide explorer':'Explore'}</button><button className="gear3d-primary" onClick={onOpenPortfolio}>Full portfolio ↗</button></div>
    </header>
    <div className="gear3d-intro"><span className="gear3d-eyebrow">3D MECHANICAL KNOWLEDGE NETWORK</span><h1>Every idea<br/><em>moves another.</em></h1><p>A system of connected disciplines. Drive a gear, follow the motion, explore the engineering.</p></div>
    <canvas ref={canvasRef} className="gear3d-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{state.current.drag=null}} onWheel={wheel} onDoubleClick={reset} onContextMenu={e=>e.preventDefault()} aria-label="Interactive three-dimensional mechanical gear train"/>
    <div className="gear3d-telemetry"><span>LIVE TRANSMISSION</span><dl><dt>GEAR</dt><dd>{selectedPart.id.toUpperCase()}</dd><dt>INPUT / OUTPUT</dt><dd>1 : {ratioText}</dd><dt>DIRECTION</dt><dd>{selectedPart.ratio<0?'REVERSE':'FORWARD'}</dd><dt>GEOMETRY</dt><dd>3 MM · 20°</dd></dl><small>Calculated gear ratios · Shared-shaft constraints</small></div>
    <nav className="gear3d-controls" aria-label="3D gear camera controls"><span>DRAG BACKGROUND — ORBIT · SHIFT+DRAG — PAN · SCROLL — ZOOM · DRAG GEAR — DRIVE</span><div>
      <button onClick={()=>state.current.targetZoom=clamp(state.current.targetZoom*1.2,.45,4)} aria-label="Zoom in">+</button>
      <button onClick={()=>state.current.targetZoom=clamp(state.current.targetZoom/1.2,.45,4)} aria-label="Zoom out">−</button>
      <button onClick={reset}>Reset view</button>
      <button onClick={()=>setMotor(v=>!v)}>{motor?'Pause motor':'Run motor'}</button>
      <button onClick={()=>setLabels(v=>!v)}>{labels?'Hide labels':'Show labels'}</button>
    </div></nav>
    {drawer&&<aside className="gear3d-drawer" aria-label="Gear-connected engineering projects">
      <div className="gear3d-drawer-top"><span>ENGINEERING NETWORK</span><button onClick={()=>setDrawer(false)} aria-label="Close explorer">×</button></div>
      <div className="gear3d-drawer-body">
        <span className="gear3d-eyebrow">{project?'SELECTED PROJECT':current?'CONNECTED DISCIPLINE':'INPUT DRIVE'}</span>
        <h2>{project?.title||current?.title||'Engineering systems'}</h2>
        <p>{project?.overview||'Select a gear to browse projects and trace the methods connecting different engineering disciplines.'}</p>
        {project ? <><div className="gear3d-chips">{(project.technologies||[]).slice(0,8).map(t=><span key={t}>{t}</span>)}</div>{project.results?.[0]&&<div className="gear3d-result"><small>ENGINEERING RESULT</small><p>{project.results[0]}</p></div>}<a className="gear3d-project-link" href={\`#/projects/\${project.id}\`}>Open complete project ↗</a><button className="gear3d-back" onClick={()=>setProjectId(null)}>← Related projects</button></>:
        <><label className="gear3d-search">PROJECTS <span>{filtered.length}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search project or technology"/></label><div className="gear3d-projects">{filtered.map((p,i)=><button key={p.id} onClick={()=>setProjectId(p.id)}><span>{String(i+1).padStart(2,'0')}</span><strong>{p.title}</strong><span>↗</span></button>)}</div></>}
      </div><div className="gear3d-drawer-bottom"><button onClick={()=>setDrawer(false)}>Back to mechanism</button><button onClick={onOpenPortfolio}>Full portfolio ↗</button></div>
    </aside>}
  </section>;
}
