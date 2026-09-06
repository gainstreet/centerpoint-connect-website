/* ROOFTOP 0.27 — mission flow HUD, waypoint clarity + checkpoint feedback. */
'use strict';
((g)=>{
 const PARK={x:44,z:-10},HATCH={x:32,z:-17};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>a&&b?Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0)):Infinity;
 const bearing=(from,to)=>{
  if(!from||!to)return '';
  const deg=(Math.atan2((to.x||0)-(from.x||0),-((to.z||0)-(from.z||0)))*180/Math.PI+360)%360;
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg/45)%8];
 };
 const findingCount=run=>Object.keys(run?.findings||{}).length;
 const missionStage=(s,world,conditions,nextTarget)=>{
  const run=s?.run;if(!s?.started||!run)return {key:'idle',title:'STANDBY',detail:'',target:null,index:0};
  const actor=run.mode==='drive'?s.truck:s.player;
  if(!run.arrived){
   if(run.mode==='drive')return {key:'mobilize',title:'DRIVE TO WESTGATE',detail:'Follow the route to the service entrance',target:PARK,index:0,actor};
   return {key:'truck',title:'GET TO UNIT 01',detail:'Start the service call from your work truck',target:s.truck,index:0,actor};
  }
  if(!run.talked){
   return run.mode==='drive'
    ?{key:'park',title:'PARK + GET OUT',detail:'Stop near the entrance, then meet Jordan',target:world?.manager||PARK,index:1,actor}
    :{key:'checkin',title:'CHECK IN WITH JORDAN',detail:'Get the leak history before you access the roof',target:world?.manager||PARK,index:1,actor};
  }
  const accessed=!!(run.v27Accessed||run.onRoof||findingCount(run));
  if(!accessed)return {key:'access',title:'TAKE ROOF ACCESS',detail:'Use the designated hatch beside the entrance',target:HATCH,index:2,actor};
  const n=findingCount(run);
  if(n<conditions.length){
   const t=nextTarget?.()||conditions.find(f=>!run.findings?.[f.id])||null;
   return {key:'inspect',title:t?`INSPECT ${String(t.title||'NEXT DETAIL').toUpperCase()}`:'INSPECT ROOF DETAILS',detail:`Evidence ${n} / ${conditions.length} · document the next condition`,target:t,index:3,actor};
  }
  if(!run.complete)return {key:'report',title:'CLOSE OUT THE CALL',detail:'All core evidence is ready · open Field Report',target:null,index:4,actor};
  return {key:'complete',title:'SHIFT COMPLETE',detail:'Westgate inspection closed out',target:null,index:5,actor};
 };
 g.ROOFTOP_V27_HELPERS={PARK,HATCH,clamp,distance,bearing,findingCount,missionStage};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,conditions}=api;
  let rail=null,checkpoint=null,lastStage='',lastFindings=-1,expanded=false,accessSaved=false;
  const labels=['MOBILIZE','CHECK IN','ACCESS','INSPECT','CLOSEOUT'];

  function ensureHUD(){
   if(rail)return;
   const mission=$('mission');if(!mission)return;
   rail=document.createElement('div');rail.id='missionFlowV27';rail.className='mission-flow-v27';
   rail.innerHTML=`<button id="missionNavV27" class="mission-nav-v27" type="button" aria-expanded="false"><span class="mission-nav-icon-v27">◆</span><span class="mission-nav-copy-v27"><small>NEXT ACTION</small><b id="missionNavTitleV27">—</b><em id="missionNavMetaV27">—</em></span><span class="mission-nav-chevron-v27">⌄</span></button><div id="missionStepsV27" class="mission-steps-v27" aria-label="Mission progress">${labels.map((x,i)=>`<div class="mission-step-v27" data-step="${i}"><i>${i+1}</i><span>${x}</span></div>`).join('')}</div><button id="missionQuickV27" class="mission-quick-v27 hidden" type="button"></button>`;
   mission.appendChild(rail);
   const nav=$('missionNavV27');
   nav.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();expanded=!expanded;rail.classList.toggle('expanded-v27',expanded);nav.setAttribute('aria-expanded',expanded?'true':'false');try{navigator.vibrate?.(6)}catch{}});
   $('missionQuickV27')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();quickAction()});
   checkpoint=document.createElement('div');checkpoint.id='checkpointV27';checkpoint.className='checkpoint-v27 hidden';checkpoint.innerHTML='<small>CHECKPOINT</small><b id="checkpointTextV27">—</b>';
   $('hud')?.appendChild(checkpoint);
  }
  function current(){return missionStage(state(),world,conditions,()=>base.nextTarget?.())}
  function quickAction(){
   const m=current(),q=$('missionQuickV27');if(!q)return;
   if(m.key==='report'){$('reportButton')?.click();return}
   if(m.key==='inspect'){$('roofNavNextV17')?.click();return}
   if(m.key==='mobilize'){
    const r=$('route');if(r&&!r.classList.contains('hidden')){r.click();return}
   }
  }
  function checkpointPulse(text){
   ensureHUD();if(!checkpoint||!text)return;
   $('checkpointTextV27').textContent=text;
   checkpoint.classList.remove('hidden','show-v27');void checkpoint.offsetWidth;checkpoint.classList.add('show-v27');
   setTimeout(()=>checkpoint?.classList.remove('show-v27'),1900);
   try{navigator.vibrate?.([10,28,12])}catch{}
   api.chime?.(true);
  }
  function completedSteps(s){
   const run=s.run,n=findingCount(run),accessed=!!(run?.v27Accessed||run?.onRoof||n);
   return [!!run?.arrived,!!run?.talked,accessed,n>=conditions.length,!!run?.complete];
  }
  function sync(force=false){
   ensureHUD();const s=state(),run=s.run;
   if(!rail)return;
   const visible=!!(s.started&&run&&!run.complete&&!s.photoMode&&!s.modal);
   rail.classList.toggle('hidden',!visible);if(!visible)return;
   if(run.onRoof&&!run.v27Accessed){run.v27Accessed=true;if(!accessSaved){accessSaved=true;api.save?.()}}
   const m=current(),actor=m.actor||(run.mode==='drive'?s.truck:s.player),d=m.target?distance(actor,m.target):Infinity,dir=m.target?bearing(actor,m.target):'';
   $('missionNavTitleV27').textContent=m.title;
   $('missionNavMetaV27').textContent=Number.isFinite(d)?`${dir} · ${Math.max(0,Math.round(d))}m · ${m.detail}`:m.detail;
   const done=completedSteps(s);
   rail.querySelectorAll('.mission-step-v27').forEach((el,i)=>{el.classList.toggle('done-v27',done[i]);el.classList.toggle('active-v27',i===Math.min(4,m.index));});
   const q=$('missionQuickV27');q.classList.add('hidden');q.textContent='';
   if(m.key==='report'){q.textContent='OPEN FIELD REPORT';q.classList.remove('hidden')}
   else if(m.key==='inspect'&&conditions.length-findingCount(run)>1){q.textContent='CYCLE ROOF TARGET';q.classList.remove('hidden')}
   else if(m.key==='mobilize'&&run.mode==='drive'&&!$('route')?.classList.contains('hidden')){q.textContent='AUTO DRIVE';q.classList.remove('hidden')}
   const n=findingCount(run);
   if(lastStage&&m.key!==lastStage){
    const prev=lastStage;
    if((prev==='truck'||prev==='mobilize')&&(m.key!=='truck'&&m.key!=='mobilize'))checkpointPulse('ARRIVED AT WESTGATE');
    else if((prev==='park'||prev==='checkin')&&m.key==='access')checkpointPulse('CLIENT CHECK-IN COMPLETE');
    else if(prev==='access'&&m.key==='inspect')checkpointPulse('ROOF ACCESS COMPLETE');
    else if(prev==='inspect'&&m.key==='report')checkpointPulse('ROOF GRID COMPLETE');
   }
   if(lastFindings>=0&&n>lastFindings&&m.key==='inspect'){
    rail.classList.remove('evidence-pop-v27');void rail.offsetWidth;rail.classList.add('evidence-pop-v27');
   }
   lastStage=m.key;lastFindings=n;
   if(force){rail.classList.remove('sync-pop-v27');void rail.offsetWidth;rail.classList.add('sync-pop-v27')}
  }
  function onStart(){base.onStart?.();ensureHUD();accessSaved=!!state().run?.v27Accessed;lastStage='';lastFindings=findingCount(state().run);sync(true);lastStage=current().key}
  function hud(){base.hud?.();sync()}
  function frame(dt,t){base.frame?.(dt,t)}
  function recorded(f){base.recorded?.(f);sync(true)}
  function finished(){base.finished?.();if(rail)rail.classList.add('hidden');if(checkpoint)checkpoint.classList.add('hidden')}
  function garage(back){if(rail)rail.classList.add('hidden');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureHUD();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V27={helpers:g.ROOFTOP_V27_HELPERS,current,sync,completedSteps:()=>completedSteps(state())};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
