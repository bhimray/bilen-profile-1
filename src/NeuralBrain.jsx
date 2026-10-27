import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import './NeuralBrain.css';

// Structural fibers create the silhouette; semantic links represent actual project relationships.
const AREAS = [
  { id:'autonomy', label:'AUTONOMY', color:'#65d9f6', angle:-2.45, keywords:['qcar','racing','autonomous','vehicle','lap time'], subtitle:'Planning · Perception · Vehicles' },
  { id:'control', label:'CONTROL', color:'#9aa6ff', angle:-1.05, keywords:['control','mpc','ilqr','lqr','stability','pendulum','trajectory','robust'], subtitle:'Optimization · Stability · MPC' },
  { id:'robotics', label:'ROBOTICS', color:'#71e5bb', angle:0.35, keywords:['robot','ros','turtlebot','sort','mujoco','legged'], subtitle:'Navigation · Manipulation · Motion' },
  { id:'research', label:'RESEARCH', color:'#f9bd84', angle:1.65, keywords:['uncertainty','analysis','simulation','learning','optimal'], subtitle:'Experiments · Validation · Methods' },
  { id:'software', label:'SOFTWARE', color:'#f29bd2', angle:2.8, keywords:['python','c++','matlab','tensorflow','pytorch','opencv','simulink','ros'], subtitle:'Infrastructure · Tools · Code' },
];

const ALGORITHMS = [
  { name:'Model Predictive Control', tokens:['mpc','predictive'] },
  { name:'Optimal Control', tokens:['optimal','ilqr','optimization'] },
  { name:'Robust Control', tokens:['robust','stability','h-infinity','lqr'] },
  { name:'Robot Navigation', tokens:['navigation','trajectory','ros','turtlebot'] },
  { name:'Learning & Perception', tokens:['learning','classification','vision','pytorch','opencv'] },
  { name:'Simulation', tokens:['simulation','mujoco','matlab','simulink'] }
];

const randomGenerator = () => { let state=682113; return () => ((state=(1664525*state+1013904223)>>>0)/4294967296); };
const random = randomGenerator();
const clamp = (x,lo,hi) => Math.max(lo,Math.min(hi,x));
const normalized = v => (v || '').toLowerCase();
const match = (text,tokens) => tokens.some(word => text.includes(word));

function buildBrain() {
  const nodes=[], links=[], grid=new Map(), side=0.19;
  const address=(a,b,c)=>a+','+b+','+c;
  for(let attempts=0;attempts<62000 && nodes.length<2900;attempts++){
    const x=(random()*2-1)*1.92, y=(random()*2-1)*0.91, z=(random()*2-1)*0.92;
    const h=x<0?-1:1, localX=x-h*0.48;
    const shell=Math.pow(localX/1.07,2)+Math.pow(y/0.84,2)+Math.pow(z/0.86,2);
    const envelope=Math.pow(x/1.97,2)+Math.pow(y/0.83,2)+Math.pow(z/0.87,2);
    const cleft=Math.abs(x)<0.08 && y>-.54;
    const contour=Math.sin(x*17+z*6)*Math.cos(z*14-y*7);
    const fold=0.045*contour;
    if(shell>1.04+fold || envelope>1.01+fold || cleft)continue;
    // Sampling near the outer surface increases the visibility of the brain's folds.
    if(random()<0.28 && shell<0.62) continue;
    nodes.push({ x,y:y+0.016*Math.sin(x*13+z*9),z,phase:random(),intensity:random() });
  }
  nodes.forEach((p,i)=>{
    const k=address(Math.floor(p.x/side),Math.floor(p.y/side),Math.floor(p.z/side));
    if(!grid.has(k))grid.set(k,[]);
    grid.get(k).push(i);
  });
  nodes.forEach((p,i)=>{
    const gx=Math.floor(p.x/side), gy=Math.floor(p.y/side),gz=Math.floor(p.z/side),near=[];
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)
      for(const j of grid.get(address(gx+a,gy+b,gz+c))||[]){
        if(j<=i)continue;
        const q=nodes[j],dist=(p.x-q.x)**2+(p.y-q.y)**2+(p.z-q.z)**2;
        if(dist<0.052)near.push({j,dist});
      }
    near.sort((a,b)=>a.dist-b.dist);
    for(const item of near.slice(0,4))links.push([i,item.j]);
  });
  return { nodes,links };
}
const STRUCTURE=buildBrain();
const AREAS_3D=AREAS.map((area,i)=>{
  const a=area.angle;
  return {...area,index:i,x:1.37*Math.cos(a),y:0.56*Math.sin(a*1.35),z:0.69*Math.sin(a)};
});

function buildNetwork(projects){
  const mapped=projects.map((project,index)=>{
    const tech=(project.technologies||[]).join(' ');
    const searchable=normalized([project.title,project.overview,project.approach,tech].join(' '));
    const areaScores=AREAS.map(area=>({area,score:area.keywords.filter(keyword=>searchable.includes(keyword)).length}));
    areaScores.sort((a,b)=>b.score-a.score);
    const primary=areaScores[0].area.id;
    const secondary=areaScores.filter(x=>x.score>0).slice(1,3).map(x=>x.area.id);
    const methods=ALGORITHMS.filter(a=>match(searchable,a.tokens)).map(a=>a.name);
    return {...project,index,primary,secondary,methods,searchable};
  });
  const relationships=[];
  mapped.forEach((project,i)=>{
    mapped.slice(i+1).forEach(other=>{
      const sharedMethods=project.methods.filter(method=>other.methods.includes(method));
      const sharedTech=(project.technologies||[]).filter(t=>other.technologies?.some(v=>normalized(v)===normalized(t)));
      if(sharedMethods.length||sharedTech.length>=2)relationships.push({source:project.id,target:other.id,strength:sharedMethods.length+sharedTech.length*.5});
    });
  });
  return {mapped,relationships};
}

function renderNode(ctx,p,r,color,glow=0){
  if(glow){
    const gradient=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,glow);
    gradient.addColorStop(0,color+'9a');
    gradient.addColorStop(0.25,color+'38');
    gradient.addColorStop(1,color+'00');
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,glow,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
}

export default function NeuralBrain({ projects=[] }){
  const graph=useMemo(()=>buildNetwork(projects),[projects]);
  const [mode,setMode]=useState({type:'brain',id:null});
  const [hover,setHover]=useState(null);
  const [paused,setPaused]=useState(false);
  const [query,setQuery]=useState('');
  const [infoOpen,setInfoOpen]=useState(true);
  const canvasRef=useRef(null);
  const modeRef=useRef(mode),hoverRef=useRef(hover),pausedRef=useRef(paused),pointerRef=useRef({x:-1000,y:-1000});
  const camera=useRef({rx:.18,ry:-.22,tx:.18,ty:-.22,zoom:1,drag:false,moved:false,lastX:0,lastY:0,t:0});
  useEffect(()=>{modeRef.current=mode},[mode]);
  useEffect(()=>{hoverRef.current=hover},[hover]);
  useEffect(()=>{pausedRef.current=paused},[paused]);
  const selection=mode.type==='area'?AREAS_3D.find(a=>a.id===mode.id):mode.type==='project'?graph.mapped.find(p=>p.id===mode.id):null;
  const suggestions=graph.mapped.filter(p=>(mode.type!=='area'||p.primary===mode.id||p.secondary.includes(mode.id))&&(!query||normalized(p.title+' '+p.technologies?.join(' ')).includes(normalized(query))));
  const openProject=useCallback(id=>{setMode({type:'project',id});setHover(null);setQuery('');setInfoOpen(true)},[]);
  const reset=useCallback(()=>{setMode({type:'brain',id:null});setHover(null);setQuery('');camera.current.zoom=1},[]);
  const gotoProject=()=>{if(mode.type==='project')window.location.hash='#/projects/'+mode.id};

  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d',{alpha:false});
    let w=0,h=0,raf=0,dpr=1,hoverNow=null;
    const cam=camera.current;
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      w=rect.width;h=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const screen=p=>{
      const cy=Math.cos(cam.ry),sy=Math.sin(cam.ry),cx=Math.cos(cam.rx),sx=Math.sin(cam.rx);
      const x=p.x*cy+p.z*sy,z=-p.x*sy+p.z*cy;
      const y=p.y*cx-z*sx,depth=p.y*sx+z*cx;
      const factor=3.65/(5-depth),scale=Math.min(w*.285,h*.49)*cam.zoom*factor;
      return {x:w*.5+x*scale,y:h*.53-y*scale,z:depth,scale};
    };
    const semantic=()=>{
      const current=modeRef.current;
      if(current.type==='brain')return [];
      const area=current.type==='area'?AREAS_3D.find(a=>a.id===current.id):null;
      const focus=current.type==='project'?graph.mapped.find(p=>p.id===current.id):null;
      const involved=current.type==='area'?graph.mapped.filter(p=>p.primary===current.id||p.secondary.includes(current.id)):graph.mapped.filter(p=>p.id===current.id||graph.relationships.some(link=>(link.source===current.id&&link.target===p.id)||(link.target===current.id&&link.source===p.id)));
      const count=Math.max(1,involved.length),base=area||AREAS_3D.find(a=>a.id===focus?.primary)||AREAS_3D[0];
      return involved.map((p,index)=>{
        const a=(index/count)*Math.PI*2-.45;
        // Custom 3D constellation targets; D3 interpolation animates their arrival.
        const radius=current.type === 'project' ? 0.86 : 1.03;
        return {...p,x:base.x*.23+Math.cos(a)*radius,y:Math.sin(a)*.74,z:Math.sin(a+1.2)*.62,base,color:base.color};
      });
    };
    const onMove=e=>{
      const rect=canvas.getBoundingClientRect();
      const px=e.clientX-rect.left,py=e.clientY-rect.top;
      pointerRef.current={x:px,y:py};
      if(cam.drag){
        const dx=e.clientX-cam.lastX,dy=e.clientY-cam.lastY;
        if(Math.abs(dx)+Math.abs(dy)>1)cam.moved=true;
        cam.ty+=dx*.006;
        cam.tx=clamp(cam.tx+dy*.006,-1.3,1.3);
        cam.lastX=e.clientX;cam.lastY=e.clientY;
      } else {
        cam.ty=-.22+(px/w-.5)*.58;
        cam.tx=.18+(py/h-.5)*.32;
      }
    };
    const onDown=e=>{
      cam.drag=true;cam.moved=false;cam.lastX=e.clientX;cam.lastY=e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp=()=>{
      cam.drag=false;
      if(cam.moved)return;
      const target=hoverNow;
      if(!target)return;
      if(target.type==='area'){setMode({type:'area',id:target.id});setInfoOpen(true)}
      else if(target.type==='project')openProject(target.id);
    };
    const onWheel=e=>{e.preventDefault();cam.zoom=clamp(cam.zoom*Math.exp(-e.deltaY*.00075),.72,2.15)};
    const draw=()=>{
      raf=requestAnimationFrame(draw);
      const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!pausedRef.current&&!reduceMotion)cam.t+=.013;
      cam.rx=d3.interpolateNumber(cam.rx,cam.tx)(.055);
      cam.ry=d3.interpolateNumber(cam.ry,cam.ty)(.055);
      ctx.fillStyle='#030812';ctx.fillRect(0,0,w,h);
      const current=modeRef.current;
      const expanded=current.type!=='brain';
      const focusNodes=semantic();
      const projected=STRUCTURE.nodes.map(screen);
      const fade = expanded ? 0.29 : 1;
      const scaleFactor=w<640?.68:1;
      // Sparse, deliberately subtle background stars, derived from stable structural points.
      for(let i=0;i<110;i++){
        const p=STRUCTURE.nodes[i*23%STRUCTURE.nodes.length];
        const x=(p.phase*w*1.72+i*73)%w,y=((i*167.39)%h);
        ctx.fillStyle='rgba(95,175,207,.11)';
        ctx.fillRect(x,y,.8,.8);
      }
      ctx.lineWidth=.55;
      for(const [a,b] of STRUCTURE.links){
        const p=projected[a],q=projected[b];
        ctx.strokeStyle=p.z+q.z>0?`rgba(84,192,231,${.15*fade})`:`rgba(50,106,157,${.065*fade})`;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
      for(let i=0;i<projected.length;i++){
        const p=projected[i],node=STRUCTURE.nodes[i],light=clamp(.22+p.z*.22,.1,.66)*fade;
        const pulse=(!reduceMotion && i % 31 === 0) ? 0.23 * Math.sin(cam.t * 2 + node.phase * 6) : 0;
        ctx.fillStyle=`rgba(109,215,248,${clamp(light+pulse,.06,.8)})`;
        ctx.beginPath();ctx.arc(p.x,p.y,scaleFactor*(p.z>0?1.08:.8),0,Math.PI*2);ctx.fill();
      }
      let targets=[];
      if(!expanded){
        targets=AREAS_3D.map(a=>({...a,type:'area',sp:screen(a)}));
      } else {
        const base=AREAS_3D.find(a=>a.id===(current.type==='area'?current.id:graph.mapped.find(p=>p.id===current.id)?.primary));
        if(base) targets.push({...base,type:'area',sp:screen(base)});
        focusNodes.forEach(p=>targets.push({...p,type:'project',sp:screen(p)}));
      }
      // Draw highlighted semantic structure (real shared algorithms/technologies).
      const map=new Map(targets.filter(p=>p.type==='project').map(p=>[p.id,p]));
      for(const edge of graph.relationships){
        const a=map.get(edge.source),b=map.get(edge.target);
        if(!a||!b)continue;
        ctx.strokeStyle='rgba(138,206,245,.23)';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(a.sp.x,a.sp.y);ctx.lineTo(b.sp.x,b.sp.y);ctx.stroke();
      }
      const center=targets.find(p=>p.type==='area');
      if(expanded&&center)for(const item of targets.filter(p=>p.type==='project')){
        const p=center.sp,q=item.sp;
        ctx.strokeStyle=item.color+'66';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
      const mouse=pointerRef.current;
      hoverNow=null;let nearest=25;
      for(const p of targets){
        const distance=Math.hypot(mouse.x-p.sp.x,mouse.y-p.sp.y);
        if(distance<nearest){nearest=distance;hoverNow={type:p.type,id:p.id,label:p.type==='area'?p.label:p.title};}
      }
      if(hoverNow?.id!==hoverRef.current?.id || hoverNow?.type!==hoverRef.current?.type)setHover(hoverNow);
      canvas.style.cursor=hoverNow?'pointer':cam.drag?'grabbing':'grab';
      for(const p of targets.sort((a,b)=>a.sp.z-b.sp.z)){
        const selected=hoverNow?.id===p.id||current.id===p.id;
        const core=p.type==='area'?5.6:4.2;
        renderNode(ctx,p.sp,(selected?1.5:1)*core*scaleFactor,p.color||'#8adbef',(selected?37:23)*scaleFactor);
        ctx.font=(selected?'600 ':'500 ')+(w<640?'10':'11')+'px system-ui, sans-serif';
        ctx.textAlign='center';
        ctx.fillStyle=selected?'#ffffff':'#bbdeec';
        const label=p.type==='area'?p.label:p.title.length>35?p.title.slice(0,33)+'…':p.title;
        ctx.fillText(label,p.sp.x,p.sp.y-(selected?20:15));
      }
    };
    const observer=new ResizeObserver(resize);
    observer.observe(canvas);resize();draw();
    canvas.addEventListener('pointermove',onMove);
    canvas.addEventListener('pointerdown',onDown);
    canvas.addEventListener('pointerup',onUp);
    canvas.addEventListener('wheel',onWheel,{passive:false});
    return ()=>{
      cancelAnimationFrame(raf);observer.disconnect();
      canvas.removeEventListener('pointermove',onMove);
      canvas.removeEventListener('pointerdown',onDown);
      canvas.removeEventListener('pointerup',onUp);
      canvas.removeEventListener('wheel',onWheel);
    };
  },[graph,openProject]);

  return <section className="neural-scene" id="neural-observatory" aria-label="3D engineering knowledge graph">
    <canvas ref={canvasRef} className="neural-stage" aria-label="Interactive neural brain; use the exploration controls to access projects" />
    <div className="neural-vignette" aria-hidden="true" />
    <div className="neural-topbar"><div className="neural-brand"><span className="neural-status-dot" /> ENGINEERING UNIVERSE <span className="neural-divider">/</span> 001</div><button className="neural-icon-button" onClick={()=>setInfoOpen(v=>!v)} aria-label="Toggle information panel">{infoOpen?'Hide details':'Explore'}</button></div>
    <div className="neural-intro"><div className="neural-kicker">AN INTERACTIVE MAP OF MY WORK</div><h2>Ideas are<br/><em>connected.</em></h2><p>Explore the systems, algorithms, and research behind my engineering projects.</p></div>
    <div className="neural-hint">DRAG TO ORBIT <span>·</span> HOVER TO DISCOVER <span>·</span> CLICK TO EXPLORE</div>
    {infoOpen&&<aside className="neural-inspector" aria-live="polite">
      <div className="neural-inspector-head"><span>{mode.type==='brain'?'THE KNOWLEDGE NETWORK':mode.type==='area'?'DOMAIN EXPLORER':'PROJECT FOCUS'}</span><span className="neural-count">{graph.mapped.length} PROJECTS</span></div>
      <h3>{mode.type==='brain'?'Explore an idea.':mode.type==='area'?selection?.label:selection?.title}</h3>
      <p>{mode.type==='brain'?'Select a luminous domain to reveal the work behind it. Every connection has a technical reason.':mode.type==='area'?AREAS.find(a=>a.id===mode.id)?.subtitle:selection?.overview}</p>
      {mode.type!=='brain'&&<div className="neural-backline"><button onClick={reset}>← All domains</button>{mode.type==='project'&&<button onClick={()=>setMode({type:'area',id:selection?.primary})}>← Domain</button>}</div>}
      {mode.type==='project'&&selection&&<div className="neural-project-info">
        <div className="neural-metadata">{selection.platform}</div>
        <div className="neural-chip-row">{selection.methods.slice(0,4).map(m=><span key={m}>{m}</span>)}</div>
        {selection.results?.[0]&&<div className="neural-result"><small>ENGINEERING RESULT</small><p>{selection.results[0]}</p></div>}
        <button className="neural-primary" onClick={gotoProject}>View complete project <span>↗</span></button>
      </div>}
      {mode.type!=='project'&&<div className="neural-discover">
        <label htmlFor="neural-search">DISCOVER PROJECTS</label>
        <input id="neural-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects or technologies" />
        <div className="neural-project-list">{suggestions.slice(0,mode.type==='brain'?4:7).map(p=><button key={p.id} onClick={()=>openProject(p.id)}><span className="neural-list-title">{p.title}</span><span>↗</span></button>)}</div>
      </div>}
      <div className="neural-inspector-bottom"><button onClick={()=>setPaused(v=>!v)}>{paused?'Resume animation':'Pause animation'}</button><button onClick={()=>{camera.current.zoom=1;camera.current.tx=.18;camera.current.ty=-.22}}>Reset camera</button></div>
    </aside>}
    <nav className="neural-areas" aria-label="Explore engineering domains">{AREAS.map(a=><button key={a.id} className={(mode.id===a.id?'is-active ':'')+'neural-area-button'} onClick={()=>{setMode({type:'area',id:a.id});setInfoOpen(true);setQuery('')}}><span style={{background:a.color}} />{a.label}</button>)}</nav>
  </section>;
}
