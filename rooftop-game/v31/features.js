/* ROOFTOP 0.31 — hands-on drain service: drag debris, hold-to-flush, visible ponding recession + field reward. */
'use strict';
((g)=>{
 const DRAIN={x:58,z:-40};
 const DEBRIS=6;
 const HOLD_MS=1150;
 const REWARD_CASH=75;
 const REWARD_REP=1;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const dist=(a,b)=>a&&b?Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0)):Infinity;
 const popcount=n=>{n=Number(n)||0;let c=0;while(n){c+=n&1;n>>>=1}return c};
 const completeMask=()=>((1<<DEBRIS)-1);
 function serviceReady(s){const r=s?.run;return !!(s?.started&&r?.onRoof&&!r.complete&&r.findings?.drain&&!r.serviceFixV31?.complete)}
 g.ROOFTOP_V31_HELPERS={DRAIN,DEBRIS,HOLD_MS,REWARD_CASH,REWARD_REP,clamp,dist,popcount,completeMask,serviceReady};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let button=null,status=null,cleanNodes=[],drainProgress=0,flushStarted=0,flushRAF=0,open=false,lastNear=false,lastDone=false,lastStamp='';

  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.serviceFixV31||r.serviceFixV31.version!==1)r.serviceFixV31={version:1,mask:0,complete:false,banked:false};
   r.serviceFixV31.mask=Math.max(0,Math.min(completeMask(),Number(r.serviceFixV31.mask)||0));
   return r.serviceFixV31;
  }
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function tone(kind='tick'){
   if(!state().profile?.sound)return;
   try{
    const A=g.AudioContext||g.webkitAudioContext;if(!A)return;const a=tone.ctx||(tone.ctx=new A());if(a.state==='suspended')a.resume();
    const now=a.currentTime,o=a.createOscillator(),gain=a.createGain();o.connect(gain);gain.connect(a.destination);
    o.type=kind==='flush'?'sine':'triangle';o.frequency.setValueAtTime(kind==='flush'?170:kind==='done'?520:300,now);if(kind==='flush')o.frequency.exponentialRampToValueAtTime(92,now+.48);if(kind==='done')o.frequency.exponentialRampToValueAtTime(760,now+.22);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='flush'?.045:.025,now+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+(kind==='flush'?.55:.24));o.start(now);o.stop(now+(kind==='flush'?.58:.27));
   }catch{}
  }
  function ensureUI(){
   const hud=$('hud');if(!hud)return;
   if(!button){
    button=document.createElement('button');button.id='fieldFixV31';button.className='field-fix-v31 hidden';button.innerHTML='<small>FIELD FIX</small><b>CLEAR DRAIN</b><span id="fieldFixProgressV31">0 / 6 DEBRIS</span>';button.onclick=()=>openService();hud.appendChild(button);
   }
   if(!status){
    status=document.createElement('div');status.id='serviceStatusV31';status.className='service-status-v31 hidden';status.innerHTML='<span>ON-SITE SERVICE</span><b>✓ DRAIN FLOW RESTORED</b>';hud.appendChild(status);
   }
  }
  function makeCleanProps(){
   if(world.v31DrainProps){cleanNodes=world.v31DrainProps;return}
   try{
    const y=world.roofY+.14,nodes=[];
    let g1=[];R3.cylinder(g1,0,.07,0,.72,.14,'#778b91',18,.63);R3.cylinder(g1,0,.16,0,.48,.06,'#263d48',18,.48);
    for(let i=-2;i<=2;i++)R3.box(g1,i*.17,.205,0,.055,.035,.82,'#a8b7b7');
    for(let i=-2;i<=2;i++)R3.box(g1,0,.208,i*.17,.82,.035,.055,'#a8b7b7');
    const grate=R3.node(renderer.mesh(g1),DRAIN.x,y,DRAIN.z);grate.visible=false;world.nodes.push(grate);nodes.push(grate);
    let g2=[];R3.box(g2,0,.36,0,.75,.72,.55,'#536d59');R3.cylinder(g2,0,.78,0,.18,.2,'#31493b',8,.04);R3.box(g2,0,.25,.285,.5,.16,.03,'#f0d265');
    const bag=R3.node(renderer.mesh(g2),60.05,world.roofY+.06,-39.2);bag.yaw=-.35;bag.visible=false;world.nodes.push(bag);nodes.push(bag);
    world.v31DrainProps=nodes;cleanNodes=nodes;
   }catch{}
  }
  function syncCleanScene(force=false){
   makeCleanProps();const s=state(),r=ensureRun(),on=!!(s.started&&s.run?.onRoof&&!s.run.complete&&r?.complete);
   if(r?.complete)drainProgress=force?1:Math.max(drainProgress,0);else drainProgress=0;
   for(const n of cleanNodes)n.visible=on;
   if(!on)return;
   const ponds=world.v23WetRoof?.ponding||[];
   for(let i=0;i<Math.min(3,ponds.length);i++)ponds[i].y=(world.roofY+.064)-drainProgress*(.16+i*.018);
  }
  function bankReward(){
   const s=state(),r=ensureRun(),p=s.profile;if(!r?.complete||r.banked||!p)return false;
   const key='v31-drain:'+String(s.run?.id||'run');if(Array.isArray(p.paid)&&p.paid.includes(key)){r.banked=true;api.save?.();return false}
   p.cash=Math.max(0,(Number(p.cash)||0)+REWARD_CASH);p.rep=Math.min(100,Math.max(0,(Number(p.rep)||0)+REWARD_REP));if(!Array.isArray(p.badges))p.badges=[];if(!p.badges.includes('drain-runner'))p.badges.push('drain-runner');if(!Array.isArray(p.paid))p.paid=[];p.paid.push(key);p.paid=p.paid.slice(-40);r.banked=true;api.saveProfile?.();api.updateStats?.();api.save?.();return true;
  }
  function syncHUD(force=false){
   ensureUI();const s=state(),r=ensureRun();if(!r)return;
   const ready=serviceReady(s),near=ready&&dist(s.player,DRAIN)<=4.7,done=!!r.complete;
   const visible=!!(near&&!s.photoMode&&!s.modal);button?.classList.toggle('hidden',!visible);status?.classList.toggle('hidden',!(done&&s.run?.onRoof&&!s.run.complete&&!s.photoMode&&!s.modal));
   const c=popcount(r.mask);if($('fieldFixProgressV31'))$('fieldFixProgressV31').textContent=`${c} / ${DEBRIS} DEBRIS`;
   if(button)button.classList.toggle('ready-v31',c===DEBRIS);
   if(near&&!lastNear){button?.classList.remove('pop-v31');if(button){void button.offsetWidth;button.classList.add('pop-v31')}vibrate(6);api.toast?.('FIELD FIX AVAILABLE · Clear the obstructed drain, then verify flow.')}
   if(done&&!lastDone){status?.classList.remove('pop-v31');if(status){void status.offsetWidth;status.classList.add('pop-v31')}}
   lastNear=near;lastDone=done;
   if(force&&button&&!button.classList.contains('hidden')){button.classList.remove('pop-v31');void button.offsetWidth;button.classList.add('pop-v31')}
  }
  function leafMarkup(mask){
   const pos=[[18,28],[70,18],[82,58],[63,82],[23,76],[10,52]];let out='';
   for(let i=0;i<DEBRIS;i++){if(mask&(1<<i))continue;const [x,y]=pos[i];out+=`<button class="debris-v31" data-i="${i}" style="--x:${x}%;--y:${y}%" aria-label="Drag debris cluster ${i+1} away from the drain"><i></i><i></i><i></i></button>`}
   return out;
  }
  function serviceMarkup(r){
   const c=popcount(r.mask),all=c===DEBRIS;
   return `<section class="service-game-v31"><div class="service-meter-v31"><span><small>DEBRIS CLEARANCE</small><b id="debrisCountV31">${c} / ${DEBRIS}</b></span><i><em id="debrisBarV31" style="width:${Math.round(c/DEBRIS*100)}%"></em></i></div><div class="drain-board-v31 ${all?'clear-v31':''}" id="drainBoardV31"><div class="water-v31"><i></i><i></i><i></i></div><div class="drain-v31"><i></i><i></i><i></i><i></i></div>${leafMarkup(r.mask)}<div class="drag-zone-v31">DRAG OUT</div></div><p class="service-instruction-v31" id="serviceInstructionV31">${all?'Drain opening is clear. Hold the flush test to verify flow.':'Drag every debris cluster away from the drain opening.'}</p><div class="flush-wrap-v31 ${all?'':'locked-v31'}" id="flushWrapV31"><button id="flushHoldV31" ${all?'':'disabled'}><span>HOLD TO FLUSH TEST</span><i><em id="flushBarV31"></em></i></button><small>1.2 SEC HOLD · VERIFY POSITIVE DRAINAGE</small></div><p class="note">Field simulation only. Actual roof service should follow site procedures and manufacturer requirements.</p></section>`;
  }
  function bindDebris(){
   const r=ensureRun(),board=$('drainBoardV31');if(!r||!board)return;
   for(const leaf of board.querySelectorAll('.debris-v31')){
    let sx=0,sy=0,active=false;
    leaf.addEventListener('pointerdown',e=>{e.preventDefault();active=true;sx=e.clientX;sy=e.clientY;leaf.setPointerCapture?.(e.pointerId);leaf.classList.add('dragging-v31');vibrate(4)});
    leaf.addEventListener('pointermove',e=>{if(!active)return;e.preventDefault();const dx=e.clientX-sx,dy=e.clientY-sy;leaf.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${dx*.18}deg)`;if(Math.hypot(dx,dy)>=56)clearDebris(leaf,Number(leaf.dataset.i)||0)});
    const stop=()=>{if(!active)return;active=false;leaf.classList.remove('dragging-v31');leaf.style.transform='translate(-50%,-50%)'};
    leaf.addEventListener('pointerup',stop);leaf.addEventListener('pointercancel',stop);leaf.addEventListener('lostpointercapture',stop);
   }
   bindFlush();
  }
  function clearDebris(leaf,i){
   const r=ensureRun();if(!r||(r.mask&(1<<i)))return;r.mask|=(1<<i);leaf.classList.add('cleared-v31');vibrate([5,10,5]);tone('tick');api.save?.();
   const c=popcount(r.mask),count=$('debrisCountV31'),bar=$('debrisBarV31');if(count)count.textContent=`${c} / ${DEBRIS}`;if(bar)bar.style.width=Math.round(c/DEBRIS*100)+'%';
   setTimeout(()=>leaf.remove(),180);
   if(c===DEBRIS){const board=$('drainBoardV31'),wrap=$('flushWrapV31'),btn=$('flushHoldV31'),inst=$('serviceInstructionV31');board?.classList.add('clear-v31');wrap?.classList.remove('locked-v31');if(btn)btn.disabled=false;if(inst)inst.textContent='Drain opening is clear. Hold the flush test to verify flow.';api.toast?.('DRAIN OPEN · Hold the flush test to confirm positive flow.');tone('done');vibrate([7,16,7])}
  }
  function bindFlush(){
   const btn=$('flushHoldV31');if(!btn||btn.disabled)return;
   const cancel=()=>{flushStarted=0;cancelAnimationFrame(flushRAF);const bar=$('flushBarV31');if(bar)bar.style.width='0%';btn.classList.remove('holding-v31')};
   const step=now=>{if(!flushStarted)return;const p=clamp((now-flushStarted)/HOLD_MS);const bar=$('flushBarV31');if(bar)bar.style.width=(p*100).toFixed(1)+'%';if(p>=1){completeFlush();return}flushRAF=requestAnimationFrame(step)};
   btn.addEventListener('pointerdown',e=>{e.preventDefault();if(flushStarted)return;flushStarted=performance.now();btn.setPointerCapture?.(e.pointerId);btn.classList.add('holding-v31');vibrate(8);tone('flush');flushRAF=requestAnimationFrame(step)});
   btn.addEventListener('pointerup',cancel);btn.addEventListener('pointercancel',cancel);btn.addEventListener('lostpointercapture',cancel);btn.addEventListener('contextmenu',e=>e.preventDefault());
  }
  function completeFlush(){
   cancelAnimationFrame(flushRAF);flushStarted=0;const r=ensureRun();if(!r||r.complete)return;r.complete=true;drainProgress=0;bankReward();api.save?.();tone('done');api.chime?.(true);vibrate([10,18,10,18,18]);
   api.show?.('FIELD FIX / COMPLETE','Drain flow restored',`<section class="service-complete-v31"><div class="flow-icon-v31">✓</div><small>WESTGATE PLAZA · DRAIN ASSEMBLY</small><h3>Positive drainage confirmed.</h3><p>The obstruction is cleared and the ponding around the drain is receding. The documented maintenance recommendation remains in the field report.</p><div class="service-reward-v31"><span><small>FIELD BONUS</small><b>+$${REWARD_CASH} CASH</b></span><span><small>REPUTATION</small><b>+${REWARD_REP}</b></span></div><div class="service-badge-v31">★ DRAIN RUNNER BADGE</div></section>`,[{label:'BACK TO ROOF',fn:()=>{open=false;api.close?.();syncHUD(true);api.toast?.('DRAIN FLOW RESTORED · On-site service logged to this call.')}}]);syncCleanScene();
  }
  function openService(){
   const s=state(),r=ensureRun();if(!r||!serviceReady(s))return;open=true;api.show?.('OPTIONAL FIELD SERVICE','Clear the obstructed drain',serviceMarkup(r),[{label:'BACK TO ROOF',secondary:true,fn:()=>{open=false;api.close?.();syncHUD()}}]);setTimeout(bindDebris,0);
  }
  function overrideRadar(){
   const s=state(),r=ensureRun();if(!r||r.complete||!s.run?.onRoof)return;const findings=Object.keys(s.run.findings||{}).length;
   if(findings<3||r.complete)return;const n=$('radarTargetNameV30'),rr=$('radarTargetRangeV30');if(n)n.textContent='OPTIONAL · CLEAR DRAIN';if(rr){const d=dist(s.player,DRAIN);rr.textContent=`${Math.round(d)}M · FIELD FIX`}
  }
  function injectCloseout(){
   const s=state(),body=$('sheetBody'),r=s.run?.serviceFixV31;if(!s.run?.complete||!r?.complete||!body||body.querySelector('.service-closeout-v31'))return;
   const section=document.createElement('section');section.className='service-closeout-v31';section.innerHTML=`<span>ON-SITE SERVICE</span><b>✓ DRAIN FLOW RESTORED</b><small>Debris cleared · positive flow verified · +$${REWARD_CASH} field bonus</small>`;body.appendChild(section);
  }
  function onStart(){base.onStart?.();ensureUI();ensureRun();makeCleanProps();drainProgress=state().run?.serviceFixV31?.complete?1:0;lastNear=false;lastDone=!!state().run?.serviceFixV31?.complete;syncCleanScene(true);syncHUD(true)}
  function recorded(f){base.recorded?.(f);if(f?.id==='drain')setTimeout(()=>syncHUD(true),60);else syncHUD()}
  function hud(){base.hud?.();const s=state(),r=ensureRun(),stamp=[s.run?.id,s.run?.onRoof,s.run?.complete,!!s.run?.findings?.drain,r?.mask,r?.complete,s.photoMode,s.modal,Math.round(dist(s.player,DRAIN)*2)].join('|');if(stamp!==lastStamp){lastStamp=stamp;syncHUD()}overrideRadar();setTimeout(injectCloseout,0)}
  function frame(dt,t){base.frame?.(dt,t);const r=ensureRun();if(r?.complete&&state().run?.onRoof&&!state().run?.complete){drainProgress=clamp(drainProgress+dt*.72);syncCleanScene()}if(status&&!status.classList.contains('hidden'))status.style.setProperty('--flow-v31',String(.5+.5*Math.sin(t*3.4)))}
  function finished(){base.finished?.();button?.classList.add('hidden');status?.classList.add('hidden');for(const n of cleanNodes)n.visible=false;setTimeout(injectCloseout,45)}
  function garage(back){button?.classList.add('hidden');status?.classList.add('hidden');for(const n of cleanNodes)n.visible=false;return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();makeCleanProps();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V31={helpers:g.ROOFTOP_V31_HELPERS,state:()=>state(),run:()=>ensureRun(),openService,bankReward,syncCleanScene};}catch{}
  return {...base,onStart,recorded,hud,frame,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
