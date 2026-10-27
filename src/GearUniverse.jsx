import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GearUniverse.css';

// A compound gear train. All external meshes share a 3 mm module and a 20° pressure angle.
// Mesh center distance = m * (z1 + z2) / 2. Coaxial pairs have exactly equal angular speed.
const MODULE = 3;
const PRESSURE_ANGLE = Math.PI / 9;
const DEG = 180 / Math.PI;
const gearDefinitions = [
  {id:'input',teeth:18,x:-325,y:5,plane:0,topic:'input',color:'#e9d9ad'},
  {id:'drive',teeth:42,parent:'input',connection:'mesh',bearing:0,plane:0,topic:'autonomy',color:'#7de3f0'},
  {id:'drive-pinion',teeth:18,parent:'drive',connection:'shaft',plane:1,color:'#a6d9ec'},
  {id:'control',teeth:46,parent:'drive-pinion',connection:'mesh',bearing:-.29,plane:1,topic:'control',color:'#a5b0ff'},
  {id:'control-pinion',teeth:18,parent:'control',connection:'shaft',plane:2,color:'#a6d9ec'},
  {id:'robotics',teeth:38,parent:'control-pinion',connection:'mesh',bearing:.66,plane:2,topic:'robotics',color:'#8cf2c8'},
  {id:'robotics-pinion',teeth:18,parent:'robotics',connection:'shaft',plane:3,color:'#a6d9ec'},
  {id:'research',teeth:42,parent:'robotics-pinion',connection:'mesh',bearing:-.68,plane:3,topic:'research',color:'#ffd29a'},
  {id:'research-pinion',teeth:18,parent:'research',connection:'shaft',plane:4,color:'#a6d9ec'},
  {id:'software',teeth:38,parent:'research-pinion',connection:'mesh',bearing:.83,plane:4,topic:'software',color:'#fab2d4'},
  {id:'software-pinion',teeth:18,parent:'software',connection:'shaft',plane:5,color:'#a6d9ec'},
  {id:'mechanics',teeth:36,parent:'software-pinion',connection:'mesh',bearing:-.53,plane:5,topic:'mechanics',color:'#a4d9f8'},
  {id:'output-1',teeth:20,parent:'drive',connection:'mesh',bearing:-2.0,plane:0,color:'#7de3f0'},
  {id:'output-2',teeth:20,parent:'robotics',connection:'mesh',bearing:1.65,plane:2,color:'#8cf2c8'},
  {id:'output-3',teeth:20,parent:'software',connection:'mesh',bearing:.22,plane:4,color:'#fab2d4'}
];
const domains = [
  {id:'autonomy',title:'AUTONOMOUS SYSTEMS',tokens:['qcar','autonomous','racing','vehicle','lap time']},
  {id:'control',title:'CONTROL & OPTIMIZATION',tokens:['control','mpc','lqr','ilqr','optimal','stability','robust']},
  {id:'robotics',title:'ROBOTICS & NAVIGATION',tokens:['robot','ros','turtlebot','sort','mujoco','legged']},
  {id:'research',title:'RESEARCH & ANALYSIS',tokens:['analysis','simulation','uncertainty','learning','optimization']},
  {id:'software',title:'SOFTWARE & SIMULATION',tokens:['python','matlab','simulink','c++','opencv','pytorch']},
  {id:'mechanics',title:'MECHANICAL SYSTEMS',tokens:['dynamics','mechanical','motor','actuator','robot','vehicle']}
];
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const polar=(r,a)=>[r*Math.cos(a),r*Math.sin(a)];
const involute=(r,base)=>{
  const t=Math.sqrt(Math.max(0,(r/base)**2-1));
  return t-Math.atan(t);
};
function createToothProfile(z){
  // Flanks are sampled involutes; root relief is simplified, without cutter fillets.
  const pitch=MODULE*z/2,base=pitch*Math.cos(PRESSURE_ANGLE);
  const root=pitch-1.25*MODULE,addendum=pitch+MODULE;
  const step=2*Math.PI/z,atPitch=involute(pitch,base);
  const half=r=>Math.PI/(2*z)+atPitch-involute(Math.max(r,base),base);
  const bottom=Math.max(root,base),points=[];
  const push=(r,a)=>points.push(polar(r,a));
  for(let tooth=0;tooth<z;tooth++){
    const angle=tooth*step;
    push(root,angle-step*.37);
    push(bottom,angle-half(bottom));
    for(let i=1;i<=5;i++){
      const r=bottom+(addendum-bottom)*i/5;
      push(r,angle-half(r));
    }
    const tipHalf=half(addendum);
    for(let i=1;i<=3;i++)push(addendum,angle-tipHalf+(2*tipHalf*i/3));
    for(let i=4;i>=0;i--){
      const r=bottom+(addendum-bottom)*i/5;
      push(r,angle+half(r));
    }
    push(root,angle+step*.37);
    push(root,angle+step*.63);
  }
  return {path:d3.line().curve(d3.curveLinearClosed)(points),points,pitch,root,tip:addendum};
}
const profileCache=new Map();
function profile(z){if(!profileCache.has(z))profileCache.set(z,createToothProfile(z));return profileCache.get(z)}
const parts=[];
const byId=new Map();
gearDefinitions.forEach(def=>{
  const parent=byId.get(def.parent);
  const pitch=MODULE*def.teeth/2;
  let x=def.x??parent?.x??0,y=def.y??parent?.y??0;
  if(parent && def.connection==='mesh'){
    const distance=pitch+parent.pitch;
    x=parent.x+distance*Math.cos(def.bearing);
    y=parent.y+distance*Math.sin(def.bearing);
  }
  const ratio=!parent?1:def.connection==='shaft'?parent.ratio:-parent.ratio*parent.teeth/def.teeth;
  // Exact initial phase on pitch point: a tooth at parent mesh meets the child's gap.
  // θchild = -(zp/zc)θparent + ((zp+zc)/zc)α + π - π/zc
  const offset=!parent?0:def.connection==='shaft'?parent.offset:
    -(parent.teeth/def.teeth)*parent.offset+
    ((parent.teeth+def.teeth)/def.teeth)*def.bearing+
    Math.PI-Math.PI/def.teeth;
  const part={...def,x,y,pitch,ratio,offset};
  parts.push(part);byId.set(part.id,part);
});

const formatRatio=v=>{
  const magnitude=1/Math.abs(v);
  return Math.abs(magnitude-1)<.015?'1 : 1':magnitude>=1?`1 : ${magnitude.toFixed(2)}`:`${(1/magnitude).toFixed(2)} : 1`;
};
function projectMatches(domain,projects){
  if(!domain)return projects;
  return projects.map(project=>{
    const text=[project.title,project.overview,project.approach,...(project.technologies||[])].join(' ').toLowerCase();
    return {project,score:domain.tokens.filter(t=>text.includes(t)).length};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score).map(x=>x.project);
}
function Gear({part,rotorRef,onPointerDown,onKeyActivate,active,labels}){
  const geometry=profile(part.teeth);
  const primary=Boolean(part.topic&&part.topic!=='input');
  const color=part.color;
  const baseDepth=part.plane*1.15;
  const depth=7+baseDepth;
  // Rear tooth surfaces and separate shading give dimensionality while remaining D3/SVG-only.
  const sampled=geometry.points.filter((_,i)=>i%3===0);
  return <g transform={`translate(${part.x} ${part.y})`} className={`mechanical-gear ${primary?'mechanical-primary':''} ${active?'active':''}`}
    tabIndex={part.topic?0:-1} role={part.topic?'button':undefined}
    aria-label={part.topic=== 'input'?'Rotate the input pinion':primary?`Explore ${domains.find(x=>x.id===part.topic)?.title}`:undefined}
    onPointerDown={e=>onPointerDown(e,part)}
    onKeyDown={e=>{if((e.key==='Enter'||e.key===' ')&&part.topic){e.preventDefault();onKeyActivate(part)}}}>
    <g ref={rotorRef} className="mechanical-rotor">
      <path d={geometry.path} transform={`translate(3 ${depth})`} fill="#030c13" stroke="#183746" strokeWidth="1"/>
      {sampled.map((p,i)=>{
        const q=sampled[(i+1)%sampled.length];
        return <path key={i} d={`M ${p[0]} ${p[1]} L ${q[0]} ${q[1]} L ${q[0]+3} ${q[1]+depth} L ${p[0]+3} ${p[1]+depth} Z`}
          fill={i%3===0?'#244656':'#0e2837'} opacity=".87"/>;
      })}
      <path d={geometry.path} fill="#0d2636" stroke={color} strokeOpacity=".78" strokeWidth=".95"/>
      <circle r={geometry.pitch*.92} fill="none" stroke={color} strokeOpacity=".23" strokeWidth="1.9"/>
      <circle r={geometry.pitch*.79} fill="none" stroke="#bedce7" strokeOpacity=".3" strokeDasharray="2.5 6"/>
      {Array.from({length:part.teeth>30?6:4},(_,i)=>{
        const a=(i/(part.teeth>30?6:4))*Math.PI*2;
        const c=Math.cos(a),s=Math.sin(a);
        return <g key={i} transform={`rotate(${a*180/Math.PI})`}><path d={`M -6 ${-geometry.pitch*.25} L -8 ${-geometry.pitch*.68} L 8 ${-geometry.pitch*.68} L 6 ${-geometry.pitch*.25}Z`} fill="#071622" stroke={color} strokeOpacity=".52" strokeWidth=".85"/><circle cx="0" cy={-geometry.pitch*.72} r="1.6" fill="#8babb9" opacity=".6"/></g>;
      })}
      <circle r={geometry.pitch*.23} fill="#07121c" stroke={color} strokeWidth="1.6"/>
      <circle r={geometry.pitch*.125} fill="#95bdc9"/>
      <circle r={geometry.pitch*.075} fill="#102530"/>
    </g>
    <circle r={geometry.pitch*.7} fill="transparent" className="mechanical-hit"/>
    {primary&&labels&&<g className="mechanical-label">
      <rect x="-58" y={geometry.pitch+17} width="116" height="20" rx="5" fill="#061622" opacity=".91" stroke={color} strokeOpacity=".4"/>
      <text y={geometry.pitch+30} textAnchor="middle" fill="#d9f4fb" fontSize="9.5" fontWeight="600" letterSpacing=".65">{part.topic.toUpperCase()}</text>
    </g>}
  </g>;
}
export default function GearUniverse({projects=[],onOpenPortfolio}){
  const [selected,setSelected]=useState('control');
  const [projectId,setProjectId]=useState(null);
  const [drawer,setDrawer]=useState(false);
  const [labels,setLabels]=useState(true);
  const [motor,setMotor]=useState(true);
  const [query,setQuery]=useState('');
  const [camera,setCamera]=useState({zoom:1.1,panX:0,panY:0});
  const [activeRatio,setActiveRatio]=useState('control');
  const svgRef=useRef(null),sceneRef=useRef(null),rotors=useRef(new Map());
  const interaction=useRef(null),rotation=useRef(0),angularSpeed=useRef(.004),modeRef=useRef(true);
  const [size,setSize]=useState({w:1200,h:800});
  const chosen=parts.find(p=>p.topic===selected)||parts[0];
  const domain=domains.find(d=>d.id===selected);
  const projectsInDomain=useMemo(()=>projectMatches(domain,projects),[domain,projects]);
  const filtered=projectsInDomain.filter(p=>[p.title,...(p.technologies||[])].join(' ').toLowerCase().includes(query.toLowerCase()));
  const project=projects.find(p=>p.id===projectId);
  const choose=part=>{
    setSelected(part.topic||'input');setProjectId(null);setDrawer(true);setQuery('');
    setActiveRatio(part.id);
  };
  useEffect(()=>{
    const oldBody=document.body.style.overflow,oldHtml=document.documentElement.style.overflow;
    document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
    return ()=>{document.body.style.overflow=oldBody;document.documentElement.style.overflow=oldHtml};
  },[]);
  useEffect(()=>{
    const update=()=>setSize({w:window.innerWidth,h:window.innerHeight});
    update();window.addEventListener('resize',update);
    return ()=>window.removeEventListener('resize',update);
  },[]);
  useEffect(()=>{modeRef.current=motor},[motor]);
  useEffect(()=>{
    let id=0,previous=0;
    const tick=time=>{
      const dt=clamp(previous?(time-previous)/16.67:1,0,3);previous=time;
      if(modeRef.current&&!interaction.current&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        rotation.current+=angularSpeed.current*dt;
        angularSpeed.current+=(.004-angularSpeed.current)*.018;
      }
      for(const part of parts){
        const el=rotors.current.get(part.id);
        if(el)el.setAttribute('transform',`rotate(${(rotation.current*part.ratio+part.offset)*DEG})`);
      }
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(id);
  },[]);
  function coordinates(event,element=sceneRef.current){
    const point=svgRef.current.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const matrix=element?.getScreenCTM();
    if(!matrix)return {x:0,y:0};
    const local=point.matrixTransform(matrix.inverse());
    return {x:local.x,y:local.y};
  }
  function grabGear(event,part){
    if(event.button!==undefined&&event.button!==0)return;
    event.stopPropagation();
    const p=coordinates(event);
    interaction.current={type:'gear',part,last:Math.atan2(p.y-part.y,p.x-part.x),x:event.clientX,y:event.clientY,moved:false};
    svgRef.current.setPointerCapture(event.pointerId);
  }
  function grabBackground(event){
    if(event.target.closest?.('.mechanical-gear'))return;
    if(event.button!==undefined&&event.button!==0)return;
    interaction.current={type:'pan',x:event.clientX,y:event.clientY,moved:false,panX:camera.panX,panY:camera.panY};
    svgRef.current.setPointerCapture(event.pointerId);
  }
  function move(event){
    const current=interaction.current;
    if(!current)return;
    if(current.type==='pan'){
      if(Math.hypot(event.clientX-current.x,event.clientY-current.y)>3)current.moved=true;
      // Scale screen pixels to SVG viewbox units.
      const bounds=svgRef.current.getBoundingClientRect(),scale=Math.min(bounds.width/900,bounds.height/570)||1;
      setCamera(cam=>({...cam,panX:current.panX+(event.clientX-current.x)/scale,panY:current.panY+(event.clientY-current.y)/scale}));
      return;
    }
    const p=coordinates(event),a=Math.atan2(p.y-current.part.y,p.x-current.part.x);
    const delta=Math.atan2(Math.sin(a-current.last),Math.cos(a-current.last));
    if(Math.hypot(event.clientX-current.x,event.clientY-current.y)>4)current.moved=true;
    if(current.moved&&Math.abs(current.part.ratio)>1e-10){
      const inputDelta=delta/current.part.ratio;
      rotation.current+=inputDelta;
      angularSpeed.current=clamp(inputDelta*.21,-.035,.035);
    }
    current.last=a;
  }
  function release(){
    const state=interaction.current;
    if(!state)return;
    interaction.current=null;
    if(state.type==='gear'&&!state.moved)choose(state.part);
  }
  function wheel(event){
    event.preventDefault();
    const point=coordinates(event,svgRef.current);
    setCamera(cam=>{
      const zoom=clamp(cam.zoom*Math.exp(-event.deltaY*.0012),.55,2.9);
      const factor=zoom/cam.zoom;
      return {zoom,panX:point.x-(point.x-cam.panX)*factor,panY:point.y-(point.y-cam.panY)*factor};
    });
  }
  const output=parts.find(p=>p.id===activeRatio)||chosen;
  return <main className="machinery-home">
    <div className="machinery-grid" aria-hidden="true"/>
    <header className="machinery-header">
      <div className="machinery-brand"><div className="machinery-brand-icon">BR</div><div><strong>BIMLENDRA RAY</strong><small>CONTROL SYSTEMS · ROBOTICS · AUTONOMY</small></div></div>
      <div className="machinery-top-tools"><span className="machinery-live"><i/> COMPOUND TRANSMISSION</span><button onClick={()=>setDrawer(v=>!v)}>{drawer?'Hide explorer':'Explore work'}</button><button className="machinery-solid-button" onClick={onOpenPortfolio}>Full portfolio ↗</button></div>
    </header>
    <div className="machinery-left"><span className="machinery-kicker">MECHANICAL KNOWLEDGE SYSTEM</span><h1>One idea.<br/><em>Many moving parts.</em></h1><p>Drive any gear. Trace the connections between control, robotics, autonomy, and the systems behind them.</p></div>
    <div className="machinery-stage">
      <svg ref={svgRef} viewBox="-450 -285 900 570" className="machinery-svg" onPointerDown={grabBackground} onPointerMove={move} onPointerUp={release} onPointerCancel={()=>{interaction.current=null}} onWheel={wheel}>
        <defs>
          <radialGradient id="metalFace" cx="35%" cy="25%" r="80%"><stop offset="0%" stopColor="#1a4557"/><stop offset="100%" stopColor="#071622"/></radialGradient>
        </defs>
        <g ref={sceneRef} transform={`translate(${camera.panX} ${camera.panY}) scale(${camera.zoom})`}>
          <g className="mechanical-shafts">{parts.filter(p=>p.connection==='shaft').map(p=>{
            const parent=parts.find(t=>t.id===p.parent);
            return <g key={p.id}><circle cx={p.x} cy={p.y} r={parent.pitch*.25} fill="#07121b" stroke="#7bafc1" strokeOpacity=".25"/><circle cx={p.x} cy={p.y} r={parent.pitch*.12} fill="none" stroke="#7bafc1" strokeOpacity=".4"/></g>;
          })}</g>
          {parts.slice().sort((a,b)=>a.plane-b.plane).map(part=><Gear key={part.id} part={part} rotorRef={el=>{if(el)rotors.current.set(part.id,el);else rotors.current.delete(part.id)}} onPointerDown={grabGear} onKeyActivate={choose} active={part.topic===selected} labels={labels}/>)}
          <g className="mechanical-annotation" aria-hidden="true"><text x="-330" y="-42">INPUT PINION</text><path d="M-327 -34 L-325 -21" stroke="#86cbd9" opacity=".4"/><text x="150" y="137">MULTI-STAGE COMPOUND TRAIN</text></g>
        </g>
      </svg>
    </div>
    <aside className="machinery-metrics"><div className="machinery-metric-heading">TRANSMISSION TELEMETRY</div><div className="machinery-metric"><span>SELECTED STAGE</span><strong>{output.id.toUpperCase().replaceAll('-',' ')}</strong></div><div className="machinery-metric"><span>INPUT : STAGE SPEED</span><strong>{formatRatio(output.ratio)}</strong></div><div className="machinery-metric"><span>ROTATION SENSE</span><strong>{output.ratio<0?'REVERSED':'SAME'}</strong></div><div className="machinery-metric"><span>MODULE / PRESSURE ANGLE</span><strong>3 mm / 20°</strong></div><p>Gear pitch radii, shaft velocities and angular ratios are calculated from tooth counts.</p></aside>
    <footer className="machinery-footer"><div>DRAG GEARS TO DRIVE <span>·</span> DRAG BACKGROUND TO PAN <span>·</span> SCROLL TO ZOOM</div><div className="machinery-footer-actions"><button onClick={()=>setCamera(cam=>({...cam,zoom:clamp(cam.zoom*1.2,.55,2.9)}))}>＋</button><button onClick={()=>setCamera(cam=>({...cam,zoom:clamp(cam.zoom/1.2,.55,2.9)}))}>－</button><button onClick={()=>setCamera({zoom:1.1,panX:0,panY:0})}>RESET VIEW</button><button onClick={()=>setMotor(v=>!v)}>{motor?'PAUSE':'RUN'} MOTOR</button><button onClick={()=>setLabels(v=>!v)}>{labels?'HIDE':'SHOW'} LABELS</button></div></footer>
    {drawer&&<div className="machinery-explorer" role="dialog" aria-label="Engineering projects" aria-modal="false">
      <div className="machinery-explorer-head"><span>KNOWLEDGE TRANSMISSION / {project?'PROJECT':'DOMAIN'}</span><button onClick={()=>{setDrawer(false);setProjectId(null)}} aria-label="Close explorer">×</button></div>
      <div className="machinery-explorer-content">
        <div className="machinery-kicker">{project?'PROJECT DETAILS':domain?'SELECTED GEAR':'SYSTEM OVERVIEW'}</div>
        <h2>{project?.title||domain?.title||'THE ENGINEERING SYSTEM'}</h2>
        <p>{project?.overview||'Every gear represents part of a connected engineering practice. Choose a gear and discover projects, algorithms and results.'}</p>
        {project?<><div className="machinery-tags">{(project.technologies||[]).slice(0,9).map(t=><span key={t}>{t}</span>)}</div>{project.results?.[0]&&<div className="machinery-result"><small>PROJECT RESULT</small><p>{project.results[0]}</p></div>}<a className="machinery-project-cta" href={`#/projects/${project.id}`}>OPEN COMPLETE PROJECT ↗</a><button className="machinery-link" onClick={()=>setProjectId(null)}>← Back to related projects</button></>:
        <><label className="machinery-search">RELATED PROJECTS <span>{filtered.length}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search titles or technologies"/></label><div className="machinery-projects">{filtered.map((p,i)=><button key={p.id} onClick={()=>setProjectId(p.id)}><span>{String(i+1).padStart(2,'0')}</span><strong>{p.title}</strong><span>↗</span></button>)}</div></>}
      </div>
      <div className="machinery-explorer-foot"><button onClick={()=>setProjectId(null)}>PROJECTS</button><button onClick={onOpenPortfolio}>FULL PORTFOLIO ↗</button></div>
    </div>}
  </main>;
}
