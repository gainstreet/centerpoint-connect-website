/* ROOFTOP 0.34 — tap-to-walk roof navigation: radar waypoints, obstacle-aware pathfinding, 3D destination marker + touch-first walk assist. */
'use strict';
((g)=>{
 const ROOF={minX:29,maxX:67,minZ:-50,maxZ:-18};
 const SAFE={minX:30.15,maxX:65.85,minZ:-48.85,maxZ:-19.15};
 const PAD=18,CELL=1;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const dist=(a,b)=>a&&b?Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0)):Infinity;
 const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const project=(p,b=ROOF,w=260,h=260,pad=PAD)=>({x:pad+clamp(((p?.x||0)-b.minX)/(b.maxX-b.minX))*(w-pad*2),y:pad+clamp(((p?.z||0)-b.minZ)/(b.maxZ-b.minZ))*(h-pad*2)});
 const unproject=(p,b=ROOF,w=260,h=260,pad=PAD)=>({x:b.minX+clamp(((p?.x||0)-pad)/(w-pad*2))*(b.maxX-b.minX),z:b.minZ+clamp(((p?.y||0)-pad)/(h-pad*2))*(b.maxZ-b.minZ)});
 const inside=(p,b=SAFE)=>!!p&&p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ;
 function blocked(p,blocks=[],margin=.5){
  if(!inside(p))return true;
  return (blocks||[]).some(o=>Math.abs(p.x-o.x)<(Number(o.w)||0)/2+margin&&Math.abs(p.z-o.z)<(Number(o.d)||0)/2+margin);
 }
 const gridSpec=(b=SAFE,cell=CELL)=>({cols:Math.floor((b.maxX-b.minX)/cell)+1,rows:Math.floor((b.maxZ-b.minZ)/cell)+1});
 const key=(i,j)=>i+','+j;
 function nearestCell(p,blocks=[],b=SAFE,cell=CELL){
  const {cols,rows}=gridSpec(b,cell),ci=clamp(Math.round((p.x-b.minX)/cell),0,cols-1),cj=clamp(Math.round((p.z-b.minZ)/cell),0,rows-1);
  for(let r=0;r<8;r++)for(let j=Math.max(0,cj-r);j<=Math.min(rows-1,cj+r);j++)for(let i=Math.max(0,ci-r);i<=Math.min(cols-1,ci+r);i++){
   if(r&&Math.abs(i-ci)!==r&&Math.abs(j-cj)!==r)continue;
   const q={x:b.minX+i*cell,z:b.minZ+j*cell};if(!blocked(q,blocks))return {i,j,p:q};
  }
  return null;
 }
 function planPath(start,end,blocks=[],b=SAFE,cell=CELL){
  if(!start||!end)return [];
  const s=nearestCell(start,blocks,b,cell),goal=nearestCell(end,blocks,b,cell);if(!s||!goal)return [];
  const {cols,rows}=gridSpec(b,cell),open=[s],gScore=new Map([[key(s.i,s.j),0]]),came=new Map(),closed=new Set();
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let guard=0;
  while(open.length&&guard++<cols*rows*3){
   let best=0,bestF=Infinity;
   for(let n=0;n<open.length;n++){const q=open[n],gs=gScore.get(key(q.i,q.j))??Infinity,h=Math.hypot(goal.i-q.i,goal.j-q.j),f=gs+h;if(f<bestF){bestF=f;best=n}}
   const cur=open.splice(best,1)[0],ck=key(cur.i,cur.j);if(closed.has(ck))continue;
   if(cur.i===goal.i&&cur.j===goal.j){
    const rev=[cur.p];let walk=ck;
    while(came.has(walk)){walk=came.get(walk);const [i,j]=walk.split(',').map(Number);rev.push({x:b.minX+i*cell,z:b.minZ+j*cell})}
    rev.reverse();
    const out=[{x:start.x,z:start.z}],eps=.02;
    for(let n=1;n<rev.length-1;n++){const a=out[out.length-1],c=rev[n],d=rev[n+1],v1={x:c.x-a.x,z:c.z-a.z},v2={x:d.x-c.x,z:d.z-c.z};if(Math.abs(v1.x*v2.z-v1.z*v2.x)>eps)out.push(c)}
    out.push({x:goal.p.x,z:goal.p.z});return out;
   }
   closed.add(ck);
   for(const [di,dj] of dirs){
    const ni=cur.i+di,nj=cur.j+dj;if(ni<0||nj<0||ni>=cols||nj>=rows)continue;
    const np={x:b.minX+ni*cell,z:b.minZ+nj*cell};if(blocked(np,blocks))continue;
    if(di&&dj){
     const a={x:b.minX+(cur.i+di)*cell,z:b.minZ+cur.j*cell},c={x:b.minX+cur.i*cell,z:b.minZ+(cur.j+dj)*cell};
     if(blocked(a,blocks)||blocked(c,blocks))continue;
    }
    const nk=key(ni,nj),step=di&&dj?Math.SQRT2:1,tent=(gScore.get(ck)??Infinity)+step;if(tent>=(gScore.get(nk)??Infinity))continue;
    came.set(nk,ck);gScore.set(nk,tent);open.push({i:ni,j:nj,p:np});
   }
  }
  return [];
 }
 function nearestCondition(p,conditions=[],radius=3.2){let best=null,bd=radius;for(const c of conditions){const d=dist(p,c);if(d<bd){bd=d;best=c}}return best}
 g.ROOFTOP_V34_HELPERS={ROOF,SAFE,PAD,CELL,clamp,dist,angle,project,unproject,inside,blocked,nearestCell,planPath,nearestCondition};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api)||{},$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api,conditions=api.conditions||[];
  let overlay=null,ctx=null,status=null,keyBtn=null,marker=null,path=[],pathIndex=1,destination=null,destinationLabel='',active=false,lastRoof=false,lastDraw=0,walkClock=0;
  const vibration=p=>{try{navigator.vibrate?.(p)}catch{}};
  function makeMarker(){
   if(marker||!g.R3||!renderer)return;
   try{const q=[];R3.cylinder(q,0,.018,0,.6,.035,'#f0d265',24,.5);R3.cylinder(q,0,.04,0,.36,.028,'#173447',24,.34);R3.box(q,0,.07,0,.1,.05,1.05,'#fff1a6');R3.box(q,0,.072,0,1.05,.05,.1,'#fff1a6');marker=R3.node(renderer.mesh(q),0,world.roofY+.09,0);marker.visible=false;world.nodes.push(marker)}catch{}
  }
  function ensureUI(){
   const box=$('radarBox'),smart=$('smartRadarV30');if(!box||!smart)return null;
   if(!overlay?.isConnected){
    overlay=document.createElement('canvas');overlay.id='walkRadarV34';overlay.className='walk-radar-v34 disabled-v34';overlay.width=260;overlay.height=260;overlay.setAttribute('aria-label','Tap the roof plan to set a walk-assist destination');overlay.setAttribute('role','button');overlay.tabIndex=0;box.insertBefore(overlay,smart.nextSibling);ctx=overlay.getContext('2d');
    overlay.addEventListener('pointerup',e=>{if(overlay.classList.contains('disabled-v34'))return;e.preventDefault();e.stopPropagation();const rect=overlay.getBoundingClientRect(),p={x:(e.clientX-rect.left)*overlay.width/rect.width,y:(e.clientY-rect.top)*overlay.height/rect.height};setDestination(unproject(p))});
    overlay.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!overlay.classList.contains('disabled-v34')){e.preventDefault();const t=base.nextTarget?.()||conditions.find(c=>!state().run?.findings?.[c.id]);if(t)setDestination(t)}});
   }
   if(!status?.isConnected){
    status=document.createElement('div');status.id='walkAssistV34';status.className='walk-assist-v34 hidden';status.innerHTML='<span><small>WALK ASSIST</small><b id="walkAssistTextV34">TAP ROOF MAP</b></span><button id="walkCancelV34" class="hidden" aria-label="Cancel walk assist">×</button>';
    const target=$('radarTargetV30');target?.insertAdjacentElement('afterend',status);$('walkCancelV34').onclick=e=>{e.preventDefault();cancel(true)};
   }
   if(!keyBtn?.isConnected){keyBtn=document.createElement('button');keyBtn.id='mapKeyV34';keyBtn.className='map-key-v34 hidden';keyBtn.textContent='KEY';keyBtn.setAttribute('aria-label','Toggle roof map legend');keyBtn.onclick=e=>{e.preventDefault();box.classList.toggle('radar-detail-v30');vibration(4)};box.appendChild(keyBtn)}
   makeMarker();return overlay;
  }
  function safeBlocks(){return Array.isArray(world?.roofBlocks)?world.roofBlocks:[]}
  function setDestination(raw){
   const s=state(),run=s.run;if(!run?.onRoof||run.complete||s.modal||s.photoMode)return false;
   let target={x:clamp(raw.x,SAFE.minX,SAFE.maxX),z:clamp(raw.z,SAFE.minZ,SAFE.maxZ)},snap=nearestCondition(target,conditions,3.6);
   if(snap){target={x:snap.x,z:snap.z};destinationLabel=String(snap.title||'ROOF DETAIL').toUpperCase()}else destinationLabel='ROOF WAYPOINT';
   const next=planPath(s.player,target,safeBlocks());if(next.length<2){api.toast?.('WALK ASSIST · That spot is blocked by rooftop equipment.');vibration([8,20,8]);return false}
   path=next;pathIndex=1;destination={x:next[next.length-1].x,z:next[next.length-1].z};active=true;walkClock=0;
   if(marker){marker.x=destination.x;marker.z=destination.z;marker.visible=true}
   overlay?.classList.add('active-v34');vibration(7);api.toast?.(`${destinationLabel} · Walk assist engaged. Touch MOVE to take over.`);syncStatus(true);drawOverlay();return true;
  }
  function cancel(user=false){
   const was=active;active=false;path=[];pathIndex=1;destination=null;destinationLabel='';if(marker)marker.visible=false;overlay?.classList.remove('active-v34');syncStatus();drawOverlay();if(user&&was){vibration(5);api.toast?.('WALK ASSIST CANCELLED · Manual movement restored.')}
  }
  function arrive(){
   const label=destinationLabel||'ROOF WAYPOINT';active=false;path=[];pathIndex=1;if(marker)marker.visible=false;overlay?.classList.remove('active-v34');vibration([7,13,7]);api.chime?.(true);api.save?.();api.toast?.(`${label} REACHED · Use the action button when ready.`);destination=null;destinationLabel='';syncStatus(true);drawOverlay()
  }
  function syncStatus(force=false){
   ensureUI();const s=state(),roof=!!(s.started&&s.run?.onRoof&&!s.run.complete&&!s.photoMode&&!s.modal);overlay?.classList.toggle('disabled-v34',!roof);status?.classList.toggle('hidden',!roof);keyBtn?.classList.toggle('hidden',!roof);
   if(!roof&&active)cancel(false);
   const text=$('walkAssistTextV34'),cancelBtn=$('walkCancelV34');if(text)text.textContent=active&&destination?`AUTO WALK · ${Math.max(0,Math.round(dist(s.player,destination)))}M`:'TAP ROOF MAP TO WALK';cancelBtn?.classList.toggle('hidden',!active);
   if(force&&status&&!status.classList.contains('hidden')){status.classList.remove('pop-v34');void status.offsetWidth;status.classList.add('pop-v34')}
   if(roof!==lastRoof&&roof){api.toast?.('ROOF WALK ASSIST ONLINE · Tap anywhere on the roof plan to navigate around equipment.')}lastRoof=roof;
  }
  function drawOverlay(){
   ensureUI();if(!ctx||!overlay)return;ctx.clearRect(0,0,overlay.width,overlay.height);if(!active||!destination||path.length<2)return;
   const pts=path.slice(Math.max(0,pathIndex-1)).map(p=>project(p));if(pts.length<2)return;
   ctx.save();ctx.strokeStyle='#f0d265dd';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();ctx.setLineDash([]);
   const d=project(destination),pulse=11+3*Math.sin(performance.now()/180);ctx.beginPath();ctx.arc(d.x,d.y,pulse,0,Math.PI*2);ctx.strokeStyle='#fff1a6';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#f0d265';ctx.beginPath();ctx.arc(d.x,d.y,4,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function stepWalk(dt,t){
   if(!active)return;const s=state(),run=s.run,p=s.player;if(!run?.onRoof||run.complete||run.mode!=='walk'||s.modal||s.photoMode||!p){cancel(false);return}
   let remaining=Math.min(.22,Math.max(0,dt))*4.2,guard=0;walkClock+=dt*10;
   while(remaining>0&&active&&guard++<8){
    const target=path[pathIndex]||destination;if(!target){arrive();break}
    const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d<.12){pathIndex++;if(pathIndex>=path.length){arrive();break}continue}
    const move=Math.min(remaining,d),nx=p.x+dx/d*move,nz=p.z+dz/d*move;
    if(blocked({x:nx,z:nz},safeBlocks(),.34)){cancel(false);api.toast?.('WALK ASSIST PAUSED · Route changed around rooftop equipment.');break}
    p.x=nx;p.z=nz;p.y=world.roofY+.04+Math.sin(walkClock*1.8)*.016;p.yaw+=angle(Math.atan2(dx,dz)-p.yaw)*Math.min(1,dt*13);remaining-=move;
    if(Array.isArray(p.legs)&&p.legs.length>1){p.legs[0].rx=Math.sin(walkClock)*.48;p.legs[1].rx=-Math.sin(walkClock)*.48}
    if(Array.isArray(p.arms)&&p.arms.length>1){p.arms[0].rx=-Math.sin(walkClock)*.38;p.arms[1].rx=Math.sin(walkClock)*.38}
    if(destination&&dist(p,destination)<.5){arrive();break}
   }
   if(marker&&active){marker.yaw=(Number(marker.yaw)||0)+dt*.7;marker.y=world.roofY+.09+Math.sin(t*4)*.025}
  }
  function bindManualCancel(){const joy=$('joystick');joy?.addEventListener('pointerdown',()=>{if(active)cancel(false)},{passive:true});$('action')?.addEventListener('pointerdown',()=>{if(active)cancel(false)},{passive:true})}
  function onStart(){base.onStart?.();ensureUI();cancel(false);lastRoof=false;syncStatus(true)}
  function hud(){base.hud?.();syncStatus()}
  function frame(dt,t){base.frame?.(dt,t);ensureUI();stepWalk(dt,t);const interval=state().profile?.low?.14:.06;if(t-lastDraw>interval){lastDraw=t;drawOverlay();syncStatus()}}
  function recorded(f){base.recorded?.(f);if(active)syncStatus(true)}
  function finished(){cancel(false);base.finished?.()}
  function garage(back){cancel(false);return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();bindManualCancel();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V34={helpers:g.ROOFTOP_V34_HELPERS,setDestination,cancel,route:()=>path.slice(),active:()=>active,state:()=>state()}}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
