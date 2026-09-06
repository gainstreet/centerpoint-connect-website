/* ROOFTOP 0.30 — smart district/roof radar, live target bearing + breadcrumb navigation. */
'use strict';
((g)=>{
 const DISTRICT={minX:-62,maxX:70,minZ:-55,maxZ:8};
 const ROOF={minX:29,maxX:67,minZ:-50,maxZ:-18};
 const PARK={x:44,z:-10},HATCH={x:32,z:-17},ROOF_HATCH={x:32,z:-20.6};
 const RTUS=[{x:49,z:-43},{x:53,z:-31},{x:39,z:-41}];
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const dist=(a,b)=>a&&b?Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0)):Infinity;
 const project=(p,b,w=260,h=260,pad=18)=>({x:pad+clamp(((p?.x||0)-b.minX)/(b.maxX-b.minX))*(w-pad*2),y:pad+clamp(((p?.z||0)-b.minZ)/(b.maxZ-b.minZ))*(h-pad*2)});
 const bearing=(from,to)=>{if(!from||!to)return 0;return (Math.atan2((to.x||0)-(from.x||0),-((to.z||0)-(from.z||0)))*180/Math.PI+360)%360};
 const compass=deg=>['N','NE','E','SE','S','SW','W','NW'][Math.round((((Number(deg)||0)%360)+360)%360/45)%8];
 const findingCount=run=>Object.keys(run?.findings||{}).length;
 function navTarget(s,world,conditions=[],nextTarget){
  const run=s?.run;if(!s?.started||!run||run.complete)return null;
  const actor=run.mode==='drive'?(s.truck||world?.vehicle):(s.player||world?.player);
  if(!run.arrived)return run.mode==='drive'?{key:'job',label:'WESTGATE',pos:PARK,actor}:{key:'truck',label:'UNIT 01',pos:s.truck||world?.vehicle,actor};
  if(!run.talked)return {key:'manager',label:'JORDAN',pos:world?.manager||PARK,actor};
  if(!run.onRoof&&!findingCount(run))return {key:'access',label:'ROOF ACCESS',pos:HATCH,actor};
  if(run.onRoof&&findingCount(run)<conditions.length){const t=nextTarget?.()||conditions.find(c=>!run.findings?.[c.id]);if(t)return {key:'condition',label:String(t.title||'ROOF DETAIL').toUpperCase(),pos:t,actor}}
  return null;
 }
 g.ROOFTOP_V30_HELPERS={DISTRICT,ROOF,PARK,HATCH,ROOF_HATCH,RTUS,clamp,dist,project,bearing,compass,findingCount,navTarget};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,conditions}=api;
  let canvas=null,ctx=null,detail=false,lastDraw=-1,lastMode='',trail=[],lastTrail=null,lastTargetKey='',announceRoof=false;

  function ensureUI(){
   const box=$('radarBox');if(!box)return null;
   if(canvas?.isConnected)return canvas;
   canvas=document.createElement('canvas');canvas.id='smartRadarV30';canvas.className='smart-radar-v30';canvas.width=260;canvas.height=260;canvas.setAttribute('aria-label','Live district and rooftop navigation map');canvas.setAttribute('role','button');canvas.tabIndex=0;
   const old=$('radar');if(old)box.insertBefore(canvas,old.nextSibling);else box.prepend(canvas);
   ctx=canvas.getContext('2d');
   const meta=document.createElement('div');meta.id='radarMetaV30';meta.className='radar-meta-v30';meta.innerHTML='<b id="radarModeV30">DISTRICT GPS</b><span id="radarRangeV30">N-UP · LIVE</span>';
   box.appendChild(meta);
   const chip=document.createElement('div');chip.id='radarTargetV30';chip.className='radar-target-v30';chip.innerHTML='<small>NEXT</small><b id="radarTargetNameV30">—</b><span id="radarTargetRangeV30">—</span>';
   box.appendChild(chip);
   const legend=document.createElement('div');legend.id='radarLegendV30';legend.className='radar-legend-v30';legend.innerHTML='<span><i class="you-v30"></i>YOU</span><span><i class="target-v30"></i>TARGET</span><span><i class="done-v30"></i>LOGGED</span><small>TAP MAP · TOGGLE KEY</small>';
   box.appendChild(legend);
   const toggle=()=>{detail=!detail;box.classList.toggle('radar-detail-v30',detail);canvas.setAttribute('aria-pressed',detail?'true':'false');try{navigator.vibrate?.(5)}catch{}};
   canvas.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle()});
   canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
   return canvas;
  }
  function line(a,b,color,width=2,dash=[]){ctx.beginPath();ctx.setLineDash(dash);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([])}
  function dot(p,r,fill,stroke='#ffffffaa',lw=2){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
  function label(text,p,align='center'){
   ctx.font='800 12px system-ui,-apple-system,sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle='#f6f1d8';ctx.shadowColor='#0a1d2b';ctx.shadowBlur=4;ctx.fillText(text,p.x,p.y);ctx.shadowBlur=0;
  }
  function actorArrow(p,yaw,fill='#f0d265'){
   const a=Number(yaw)||0,ang=a-Math.PI/2,s=11;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(s,0);ctx.lineTo(-s*.7,-s*.62);ctx.lineTo(-s*.34,0);ctx.lineTo(-s*.7,s*.62);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#fff7d2';ctx.lineWidth=2;ctx.stroke();ctx.restore();
  }
  function drawBase(bounds,roof){
   const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
   const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#102c3d');grad.addColorStop(1,'#081d2b');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
   ctx.strokeStyle='#8eb3bc18';ctx.lineWidth=1;for(let i=1;i<5;i++){const x=i*w/5,y=i*h/5;line({x,y:0},{x,y:h},'#8eb3bc18');line({x:0,y},{x:w,y},'#8eb3bc18')}
   if(roof){const a=project({x:30,z:-49},bounds,w,h),b=project({x:66,z:-19},bounds,w,h);ctx.fillStyle='#e7e2cb12';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.strokeStyle='#f0d26544';ctx.lineWidth=2;ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y)}
   else{const a=project({x:29,z:-49},bounds,w,h),b=project({x:67,z:-18},bounds,w,h);ctx.fillStyle='#d9d5c51b';ctx.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);ctx.strokeStyle='#adc3c74a';ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);label('WESTGATE',{x:(a.x+b.x)/2,y:(a.y+b.y)/2})}
   ctx.fillStyle='#f0d265';ctx.font='900 12px system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillText('N',w/2,13);line({x:w/2,y:18},{x:w/2,y:27},'#f0d265',2);
  }
  function drawDistrict(s,bounds,target,t){
   const w=canvas.width,h=canvas.height;
   const route=[{x:-50,z:-10},{x:-37,z:-5},{x:20,z:-5},{x:44,z:-10}].map(p=>project(p,bounds,w,h));for(let i=1;i<route.length;i++)line(route[i-1],route[i],'#f0d26555',3,[7,7]);
   const manager=project(world?.manager||PARK,bounds,w,h);dot(manager,5,'#9cddb1','#d9f6e2',1);label('J',{x:manager.x+10,y:manager.y-9},'left');
   const truck=s.truck||world?.vehicle;if(truck){const p=project(truck,bounds,w,h);ctx.save();ctx.translate(p.x,p.y);ctx.rotate((Number(truck.yaw)||0)-Math.PI/2);ctx.fillStyle='#b8d1d4';ctx.fillRect(-8,-4,16,8);ctx.fillStyle='#f0d265';ctx.fillRect(3,-4,5,8);ctx.restore()}
   const actor=s.run?.mode==='drive'?truck:(s.player||world?.player);if(actor)actorArrow(project(actor,bounds,w,h),actor.yaw,'#f0d265');
   drawTrail(bounds);
   if(target?.pos)drawTarget(project(target.pos,bounds,w,h),t);
  }
  function drawRoof(s,bounds,target,t){
   const w=canvas.width,h=canvas.height,run=s.run||{};
   for(const u of RTUS){const p=project(u,bounds,w,h);ctx.fillStyle='#57717a';ctx.fillRect(p.x-8,p.y-6,16,12);ctx.strokeStyle='#9eb4b9';ctx.strokeRect(p.x-8,p.y-6,16,12)}
   const hatch=project(ROOF_HATCH,bounds,w,h);ctx.fillStyle='#f0d26599';ctx.fillRect(hatch.x-5,hatch.y-5,10,10);
   for(const c of conditions){const p=project(c,bounds,w,h),done=!!run.findings?.[c.id];dot(p,done?6:5,done?'#9cddb1':'#d7725d',done?'#e0f7e7':'#ffd2c8',1.5);if(done){ctx.fillStyle='#183244';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText('✓',p.x,p.y+3)}}
   drawTrail(bounds);
   const actor=s.player||world?.player;if(actor)actorArrow(project(actor,bounds,w,h),actor.yaw,'#f0d265');
   if(target?.pos)drawTarget(project(target.pos,bounds,w,h),t);
  }
  function drawTrail(bounds){
   if(trail.length<2)return;const pts=trail.map(p=>project(p,bounds,canvas.width,canvas.height));for(let i=1;i<pts.length;i++){const alpha=.08+.3*(i/pts.length);line(pts[i-1],pts[i],`rgba(240,210,101,${alpha.toFixed(3)})`,2)}
  }
  function drawTarget(p,t){
   const pulse=8+4*(.5+.5*Math.sin((Number(t)||0)*4.2));ctx.beginPath();ctx.arc(p.x,p.y,pulse,0,Math.PI*2);ctx.strokeStyle='#f0d265cc';ctx.lineWidth=2;ctx.stroke();dot(p,4,'#f0d265','#fff6ca',1.5);
  }
  function updateTrail(actor,mode){
   if(!actor)return;if(lastMode!==mode){trail=[];lastTrail=null;lastMode=mode}
   const p={x:Number(actor.x)||0,z:Number(actor.z)||0};if(!lastTrail||dist(p,lastTrail)>1.5){trail.push(p);if(trail.length>22)trail.shift();lastTrail=p}
  }
  function draw(t=0,force=false){
   ensureUI();if(!ctx)return;const s=state(),run=s.run;if(!s.started||!run||run.complete){canvas?.classList.add('hidden');return}canvas.classList.remove('hidden');
   const mode=run.onRoof?'roof':'district',bounds=mode==='roof'?ROOF:DISTRICT,target=navTarget(s,world,conditions,()=>base.nextTarget?.()),actor=run.mode==='drive'?(s.truck||world?.vehicle):(s.player||world?.player);
   updateTrail(actor,mode);drawBase(bounds,mode==='roof');if(mode==='roof')drawRoof(s,bounds,target,t);else drawDistrict(s,bounds,target,t);
   const modeNode=$('radarModeV30'),rangeNode=$('radarRangeV30'),name=$('radarTargetNameV30'),range=$('radarTargetRangeV30'),labelNode=$('radarLabel');
   if(modeNode)modeNode.textContent=mode==='roof'?'ROOF PLAN':'DISTRICT GPS';if(rangeNode)rangeNode.textContent=mode==='roof'?'38M GRID · N-UP':'132M GRID · N-UP';if(labelNode)labelNode.textContent=mode==='roof'?'ROOF GRID':'WESTGATE';
   if(name)name.textContent=target?.label||'FIELD REPORT';if(range){const d=target?.pos?dist(actor,target.pos):0,dir=target?.pos?compass(bearing(actor,target.pos)):'';range.textContent=target?.pos?`${dir} · ${Math.round(d)}M`:'READY'}
   if(target?.key!==lastTargetKey){lastTargetKey=target?.key||'';const box=$('radarBox');box?.classList.remove('target-pop-v30');if(box){void box.offsetWidth;box.classList.add('target-pop-v30')}}
   if(mode==='roof'&&!announceRoof){announceRoof=true;api.toast?.('ROOF RADAR ONLINE · red details need evidence · green details are logged.');}
   if(mode!=='roof')announceRoof=false;
  }
  function onStart(){base.onStart?.();ensureUI();lastDraw=-1;lastMode='';trail=[];lastTrail=null;lastTargetKey='';announceRoof=!!state().run?.onRoof;draw(0,true)}
  function hud(){base.hud?.();ensureUI()}
  function frame(dt,t){base.frame?.(dt,t);const s=state(),interval=s.profile?.low?.18:.09;if(lastDraw<0||t-lastDraw>=interval){lastDraw=t;draw(t)}}
  function recorded(f){base.recorded?.(f);draw(lastDraw<0?0:lastDraw,true)}
  function finished(){base.finished?.();canvas?.classList.add('hidden')}
  function garage(back){canvas?.classList.add('hidden');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V30={helpers:g.ROOFTOP_V30_HELPERS,draw,state:()=>state(),target:()=>navTarget(state(),world,conditions,()=>base.nextTarget?.()),trail:()=>trail.slice()};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
