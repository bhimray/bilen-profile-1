import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GearUniverse.css';

const DOMAINS = [
  { id:'autonomy',label:'AUTONOMY',short:'AUTONOMY',color:'#7de2f1',teeth:23,terms:['qcar','autonomous','racing','vehicle','lap time'] },
  { id:'control',label:'CONTROL SYSTEMS',short:'CONTROL',color:'#a2a9fc',teeth:26,terms:['control','mpc','ilqr','lqr','stability','robust','optimization','pendulum'] },
  { id:'robotics',label:'ROBOTICS',short:'ROBOTICS',color:'#7ef0c8',teeth:24,terms:['robot','turtlebot','ros','sort','mujoco','legged'] },
  { id:'research',label:'RESEARCH',short:'RESEARCH',color:'#ffd098',teeth:22,terms:['analysis','uncertainty','optimal','learning','simulation','research'] },
  { id:'software',label:'SOFTWARE',short:'SOFTWARE',color:'#ffaaca',teeth:25,terms:['python','c++','matlab','simulink','opencv','pytorch','tensorflow'] },
  { id:'mechanics',label:'MECHANICAL SYSTEMS',short:'MECHANICS',color:'#a3d6ff',teeth:23,terms:['dynamics','mechanical','vehicle','actuator','motor','robot'] }
];
const MAIN_TEETH = 48;
const MAIN_PITCH = 120;
const MODULE = MAIN_PITCH / MAIN_TEETH;
const outerRing = 183;
const MINI_SPECS = [
  {parent:0,angle:-.35,teeth:11},
  {parent:1,angle:.25,teeth:10},
  {parent:2,angle:-.35,teeth:11},
  {parent:3,angle:.4,teeth:10},
  {parent:4,angle:-.3,teeth:11},
  {parent:5,angle:.45,teeth:10}
];
const degrees = r => r * 180 / Math.PI;

function gearPath(teeth, pitch){
  const root=pitch-6,tip=pitch+7,step=Math.PI*2/teeth;
  const points=[];
  for(let i=0;i<teeth;i++){
    const a=i*step;
    points.push([a-step*.48,root],[a-step*.33,root],[a-step*.23,tip],[a+step*.23,tip],[a+step*.33,root],[a+step*.48,root]);
  }
  return d3.lineRadial().angle(d=>d[0]).radius(d=>d[1]).curve(d3.curveLinearClosed)(points);
}
function rotate(node, radians){
  if(!node)return;
  node.setAttribute('transform',`rotate(${degrees(radians)})`);
}
const outlineCache=new Map();
function outline(teeth,pitch){const key=teeth+'-'+pitch;if(!outlineCache.has(key))outlineCache.set(key,gearPath(teeth,pitch));return outlineCache.get(key)}
function projectsFor(domain,projects){
  return projects.map(project=>{
    const text=[project.title,project.overview,project.approach,...(project.technologies||[])].join(' ').toLowerCase();
    return {project,score:domain.terms.reduce((sum,token)=>sum+(text.includes(token)?1:0),0)};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.project);
}
function makeParts(){
  const gears=[{id:'core',teeth:MAIN_TEETH,pitch:MAIN_PITCH,x:0,y:0,depth:0,phase:0,color:'#8edce8'}];
  DOMAINS.forEach((d,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/6;
    const pitch=d.teeth*MODULE;
    const distance=MAIN_PITCH+pitch;
    gears.push({...d,pitch,x:distance*Math.cos(a),y:distance*Math.sin(a),depth:1,phase:Math.PI/d.teeth,i});
  });
  MINI_SPECS.forEach((mini,i)=>{
    const parent=gears[i+1],a=Math.atan2(parent.y,parent.x)+mini.angle;
    const pitch=mini.teeth*MODULE,distance=parent.pitch+pitch;
    gears.push({id:'aux-'+i,teeth:mini.teeth,pitch,x:parent.x+Math.cos(a)*distance,y:parent.y+Math.sin(a)*distance,depth:2,parent:i+1,phase:Math.PI/mini.teeth,color:DOMAINS[i].color});
  });
  return gears;
}
const PARTS=makeParts();

function GearVisual({part,selected,onSelect,onGrab,register}){
  const isCore=part.id==='core',mini=part.depth===2;
  const r=part.pitch;
  const spokes=mini?3:isCore?8:5;
  return <g className={`gear-position ${selected?'selected':''} ${mini?'mini':''}`} transform={`translate(${part.x} ${part.y})`}
    onPointerDown={e=>onGrab(e,part)} onClick={e=>onSelect(e,part)} tabIndex={mini?-1:0}
    role={mini?undefined:'button'} aria-label={isCore?'Open the engineering system overview':`Explore ${part.label}`}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(e,part)}}}>
    <g ref={el=>register(part.id,el)} className="gear-rotor">
      <path d={outline(part.teeth,r)} className="gear-shell" style={{'--gear-accent':part.color}}/>
      <circle r={r*.82} className="gear-inner-track"/>
      <circle r={r*.67} className="gear-inner-track thin"/>
      {Array.from({length:spokes},(_,i)=>{
        const angle=2*Math.PI*i/spokes;
        return <g transform={`rotate(${degrees(angle)})`} key={i}>
          <path d={`M -6 ${-r*.23} L -7 ${-r*.64} L 7 ${-r*.64} L 6 ${-r*.23} Z`} className="gear-spoke" />
          <circle cy={-r*.71} r={mini?1.5:2.1} className="gear-rivet"/>
        </g>;
      })}
      <circle r={r*.26} className="gear-hub"/>
      <circle r={mini?3:5} className="gear-axle"/>
      {!mini&&<circle r={r*.13} className="gear-hub-mark" strokeDasharray="2 5"/>}
    </g>
    <circle r={mini?r*.87:r*.81} fill="transparent" stroke="none" className="gear-hit"/>
    {!mini&&<g className="gear-static-label">
      <text y={isCore?-12:1} className="gear-name">{isCore?'THE SYSTEM':part.short}</text>
      {isCore&&<><text y={10} className="gear-subline">BIMLENDRA RAY</text><text y={30} className="gear-core-mark">ENGINEERING / 001</text></>}
    </g>}
  </g>;
}
export default function GearUniverse({projects=[],onOpenPortfolio}){
  const [selected,setSelected]=useState('core');
  const [activeProject,setActiveProject]=useState(null);
  const [paused,setPaused]=useState(false);
  const [inspect,setInspect]=useState(false);
  const [query,setQuery]=useState('');
  const [showLegend,setShowLegend]=useState(true);
  const [torque,setTorque]=useState(0);
  const svg=useRef(null),rotors=useRef(new Map()),angle=useRef(0),velocity=useRef(.0032),drag=useRef(null),clicked=useRef(false);
  const [dimensions,setDimensions]=useState({width:1200,height:800});
  const current=DOMAINS.find(d=>d.id===selected);
  const related=useMemo(()=>current?projectsFor(current,projects):projects,[current,projects]);
  const filtered=related.filter(p=>(p.title+' '+(p.technologies||[]).join(' ')).toLowerCase().includes(query.toLowerCase()));
  const active=projects.find(p=>p.id===activeProject);
  const angleFor=(part,central)=>{
    if(part.depth===0)return central;
    const parent=part.depth===2?PARTS[part.parent]:PARTS[0];
    const parentAngle=part.depth===2?angleFor(parent,central):central;
    return -parentAngle*parent.teeth/part.teeth+part.phase;
  };
  const register=(id,element)=>{if(element)rotors.current.set(id,element);else rotors.current.delete(id)};
  useEffect(()=>{
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous};
  },[]);
  useEffect(()=>{
    const onResize=()=>setDimensions({width:window.innerWidth,height:window.innerHeight});
    onResize();window.addEventListener('resize',onResize);
    return ()=>window.removeEventListener('resize',onResize);
  },[]);
  useEffect(()=>{
    let frameId=0,last=0;
    const loop=ts=>{
      if(!last)last=ts;
      const dt=Math.min((ts-last)/16.67,3);
      last=ts;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!drag.current && !paused && !reduced){
        angle.current+=velocity.current*dt;
        velocity.current+=(0.0032-velocity.current)*0.013*dt;
      }
      for(const part of PARTS)rotate(rotors.current.get(part.id),angleFor(part,angle.current));
      frameId=requestAnimationFrame(loop);
    };
    frameId=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(frameId);
  },[paused]);
  const pointerPosition=e=>{
    const element=svg.current,point=element.createSVGPoint();
    point.x=e.clientX;point.y=e.clientY;
    const matrix=element.getScreenCTM();
    if(!matrix)return {x:0,y:0};
    const result=point.matrixTransform(matrix.inverse());
    return {x:result.x,y:result.y};
  };
  const grab=(e,part)=>{
    if(e.button!==undefined&&e.button!==0)return;
    const p=pointerPosition(e);
    drag.current={part,startX:p.x,startY:p.y,last:Math.atan2(p.y-part.y,p.x-part.x),moved:false};
    clicked.current=false;
    svg.current.setPointerCapture(e.pointerId);
  };
  const move=e=>{
    if(!drag.current)return;
    const g=drag.current,p=pointerPosition(e);
    if(Math.hypot(p.x-g.startX,p.y-g.startY)>3)g.moved=true;
    const a=Math.atan2(p.y-g.part.y,p.x-g.part.x);
    const diff=Math.atan2(Math.sin(a-g.last),Math.cos(a-g.last));
    const ratio=g.part.depth===0?1:g.part.depth===1?-g.part.teeth/MAIN_TEETH:g.part.teeth/MAIN_TEETH;
    if(g.moved){angle.current+=diff*ratio;velocity.current=clamp(diff*ratio*.25,-.08,.08);}
    g.last=a;
  };
  const release=()=>{
    if(drag.current){clicked.current=drag.current.moved;drag.current=null;}
  };
  const select=(e,part)=>{
    if(clicked.current){clicked.current=false;return;}
    if(part.depth===2){part=PARTS[part.parent];}
    setSelected(part.id);setActiveProject(null);setQuery('');setInspect(true);
    velocity.current=velocity.current>.015?velocity.current:velocity.current+.01;
    setTorque(v=>v+1);
  };
  const reset=()=>{setSelected('core');setActiveProject(null);setQuery('');setInspect(false);angle.current=0;velocity.current=.0032};
  const openProject=id=>{setActiveProject(id);setInspect(true)};
  const large=dimensions.width>900;
  const viewWidth=large?1060:900;
  const viewHeight=large?740:900;
  return <div className="gear-universe">
    <div className="gear-grid" aria-hidden="true"/>
    <header className="gear-header"><div className="gear-identity"><span className="gear-symbol">BR</span><span><strong>BIMLENDRA RAY</strong><small>CONTROLS · ROBOTICS · AUTONOMY</small></span></div>
      <div className="gear-top-actions"><span className="gear-live"><i/> INTERACTIVE MECHANISM</span><button onClick={()=>setShowLegend(v=>!v)}>{showLegend?'Hide labels':'Show labels'}</button><button className="gear-primary-action" onClick={onOpenPortfolio}>Full portfolio <span>↗</span></button></div>
    </header>
    <div className="gear-headline"><span className="gear-eyebrow">MECHANICAL KNOWLEDGE UNIVERSE / 001</span><h1>Everything<br/><em>is connected.</em></h1><p>Turn one idea. Set the whole system in motion.</p></div>
    <div className="gear-diagram" style={{'--gear-label-visible':showLegend?1:0}}>
      <svg ref={svg} className="gear-svg" viewBox={`${-viewWidth/2} ${-viewHeight/2} ${viewWidth} ${viewHeight}`} role="img" aria-label="Interactive system of linked rotating gears representing engineering disciplines" onPointerMove={move} onPointerUp={release} onPointerCancel={release}>
        <defs>
          <radialGradient id="gearBackground"><stop offset="0%" stopColor="#123044" stopOpacity=".25"/><stop offset="100%" stopColor="#030a12" stopOpacity="0"/></radialGradient>
          <filter id="gearGlow"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        <circle cx="0" cy="0" r="370" fill="url(#gearBackground)"/>
        <g className="gear-linkage"><circle r={305} fill="none" strokeDasharray="2 10" opacity=".14"/><circle r={215} fill="none" strokeDasharray="2 12" opacity=".2"/></g>
        {PARTS.slice().reverse().map(part=><GearVisual key={part.id} part={part} selected={part.id===selected||PARTS.find(p=>p.id===selected)?.parent===PARTS.indexOf(part)} onSelect={select} onGrab={grab} register={register}/>)}
      </svg>
    </div>
    <div className="gear-console"><span className="gear-console-top">TORQUE TRANSFER <b>ACTIVE</b></span><span className="gear-console-count">01 <i>/</i> 13</span><span className="gear-console-caption">CONNECTED GEARS <span>·</span> 6 ENGINEERING DOMAINS</span><div className="gear-wave"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></div>
    <div className="gear-footnote"><span>DRAG A GEAR TO DRIVE THE MECHANISM</span><span className="gear-foot-divider">+</span><span>CLICK TO EXPLORE</span><span className="gear-foot-divider">+</span><button onClick={()=>setPaused(v=>!v)}>{paused?'START MOTOR':'PAUSE MOTOR'}</button><button onClick={reset}>RESET</button></div>
    {inspect&&<section className="gear-inspector" aria-label="Engineering domain details">
      <div className="gear-inspector-top"><span>EXPLORER / {active?'PROJECT':selected==='core'?'SYSTEM':'DOMAIN'}</span><button className="gear-close" onClick={()=>{setInspect(false);setActiveProject(null)}} aria-label="Close details">×</button></div>
      <div className="gear-inspector-body">
        <span className="gear-overline">{active?'SELECTED PROJECT':current?'CONNECTED DISCIPLINE':'KNOWLEDGE ENGINE'}</span>
        <h2>{active?active.title:current?.label||'ENGINEERING UNIVERSE'}</h2>
        <p>{active?active.overview:current?'Connected projects, methods, and technologies. Each gear drives the whole engineering system.':'Six disciplines mesh together to form one cohesive engineering practice. Select a gear to explore.'}</p>
        {active?<><div className="gear-tech">{(active.technologies||[]).slice(0,7).map(t=><span key={t}>{t}</span>)}</div>{active.results?.[0]&&<div className="gear-feature"><small>SELECTED RESULT</small><p>{active.results[0]}</p></div>}<a className="gear-view-project" href={`#/projects/${active.id}`}>OPEN FULL PROJECT <span>↗</span></a><button className="gear-text-button" onClick={()=>setActiveProject(null)}>← All related projects</button></>:
        <><div className="gear-filter"><label htmlFor="gear-search">PROJECT NETWORK <span>{filtered.length}</span></label><input id="gear-search" placeholder="Search projects or tools..." value={query} onChange={e=>setQuery(e.target.value)} /></div><div className="gear-project-list">{filtered.map((p,i)=><button key={p.id} onClick={()=>openProject(p.id)}><span className="gear-list-index">{String(i+1).padStart(2,'0')}</span><span>{p.title}</span><span>↗</span></button>)}</div></>}
      </div>
      <div className="gear-inspector-bottom"><button onClick={()=>{setInspect(false);setActiveProject(null)}}>BACK TO GEARS</button><button onClick={onOpenPortfolio}>FULL PORTFOLIO ↗</button></div>
    </section>}
  </div>;
}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
