/* ROOFTOP 0.12 — contract-specific atmosphere, post-storm roof sheen and weather briefing. */
'use strict';
(()=>{
 const ATMOS={
  leak:{id:'leak',className:'weather-leak',label:'POST-STORM',detail:'COOL OVERCAST · WET MEMBRANE',sky:'#7592a1',accent:'#9fd2db'},
  maintenance:{id:'maintenance',className:'weather-maintenance',label:'EARLY MORNING',detail:'WARM LOW SUN · LIGHT HAZE',sky:'#c7a873',accent:'#f0d265'},
  audit:{id:'audit',className:'weather-audit',label:'CLEAR MIDDAY',detail:'CRISP VISIBILITY · DRY ROOF',sky:'#6e9dbc',accent:'#b9e3ef'}
 };
 function atmosphereFor(jobId){return ATMOS[jobId]||ATMOS.leak}
 window.ROOFTOP_V12_HELPERS={ATMOS,atmosphereFor};
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let weather=null,weatherChip=null,puddles=[],lastMode='',observer=null;
  function activeJob(){const r=state().run;return r?.dispatchV11?.job||'leak'}
  function activeAtmos(){return atmosphereFor(activeJob())}
  function makePuddleTexture(){
   const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
   if(!g)return renderer.texture(c);
   const grd=g.createRadialGradient(128,64,8,128,64,110);grd.addColorStop(0,'rgba(216,239,240,.30)');grd.addColorStop(.46,'rgba(91,139,153,.22)');grd.addColorStop(.76,'rgba(62,99,112,.13)');grd.addColorStop(1,'rgba(52,90,103,0)');g.fillStyle=grd;g.fillRect(0,0,256,128);
   g.strokeStyle='rgba(238,248,244,.22)';g.lineWidth=2;for(let i=0;i<4;i++){g.beginPath();g.ellipse(128,64,35+i*18,13+i*8,0,0,Math.PI*2);g.stroke()}
   return renderer.texture(c);
  }
  function makePuddles(){
   if(world.v12Puddles)return world.v12Puddles;
   const tex=makePuddleTexture(),spots=[[55.2,-38.1,4.5,2.0,.2],[60.7,-42.3,3.5,1.7,-.35],[45.3,-27.8,4.2,1.8,.1],[37.2,-36.6,3.2,1.55,-.25],[52.5,-23.2,2.8,1.25,.4]];
   puddles=spots.map(([x,z,w,d,yaw],i)=>{
    const q=[];R3.quad(q,[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],'#ffffff');
    const n=R3.node(renderer.mesh(q,tex),x,world.roofY+.055,z);n.yaw=yaw;n.v12={phase:i*.91,baseY:n.y};world.nodes.push(n);return n;
   });world.v12Puddles=puddles;return puddles;
  }
  function ensureUI(){
   if(!weather){weather=document.createElement('div');weather.id='weatherV12';weather.className='weather-v12 hidden';weather.setAttribute('aria-hidden','true');weather.innerHTML='<div class="weather-cloud c1"></div><div class="weather-cloud c2"></div><div class="weather-cloud c3"></div><div class="weather-sun"></div><div class="weather-haze"></div><div class="weather-droplets"><i></i><i></i><i></i><i></i><i></i></div>';document.body.appendChild(weather)}
   if(!weatherChip){weatherChip=document.createElement('div');weatherChip.id='weatherChipV12';weatherChip.className='weather-chip-v12 hidden';weatherChip.innerHTML='<i></i><span><b>POST-STORM</b><small>COOL OVERCAST · WET MEMBRANE</small></span>';document.getElementById('hud')?.appendChild(weatherChip)}
  }
  function injectDispatchWeather(){
   document.querySelectorAll('.dispatch-card[data-job]').forEach(card=>{if(card.querySelector('.dispatch-weather'))return;const a=atmosphereFor(card.dataset.job),copy=card.querySelector('.dispatch-copy');if(!copy)return;const line=document.createElement('span');line.className='dispatch-weather';line.innerHTML=`<b>${a.label}</b> · ${a.detail}`;copy.appendChild(line)});
  }
  function applyAtmos(force=false){
   ensureUI();makePuddles();const s=state(),a=activeAtmos(),key=[a.id,!!s.started,!!s.run?.onRoof,!!s.photoMode,!!s.modal,!!s.run?.complete,!!s.profile?.low].join('|');if(!force&&key===lastMode)return;lastMode=key;
   document.body.classList.remove('weather-leak','weather-maintenance','weather-audit');document.body.classList.add(a.className);document.documentElement.style.setProperty('--weather-sky',a.sky);document.documentElement.style.setProperty('--weather-accent',a.accent);
   const active=!!(s.started&&!s.run?.complete);weather.classList.toggle('hidden',!active);weather.classList.toggle('roof',!!s.run?.onRoof);weather.classList.toggle('camera',!!s.photoMode);weather.classList.toggle('low',!!s.profile?.low);
   weatherChip.classList.toggle('hidden',!active);weatherChip.querySelector('b').textContent=a.label;weatherChip.querySelector('small').textContent=a.detail;weatherChip.querySelector('i').className='weather-icon '+a.id;
   for(const p of puddles)p.visible=a.id==='leak';
   injectDispatchWeather();
  }
  function onStart(){base.onStart?.();ensureUI();makePuddles();applyAtmos(true);const a=activeAtmos();setTimeout(()=>api.toast(a.label+' · '+a.detail),720)}
  function hud(){base.hud?.();applyAtmos(false)}
  function frame(dt,t){
   base.frame?.(dt,t);if(!puddles.length)return;const s=state(),wet=activeJob()==='leak'&&s.started&&!s.run?.complete;for(let i=0;i<puddles.length;i++){const p=puddles[i];p.visible=wet;p.y=p.v12.baseY+(wet&&!s.profile?.low?Math.sin(t*1.6+p.v12.phase)*.004:0);if(wet&&!s.profile?.low)p.yaw+=dt*(i%2?.018:-.014)}
   if(weather&&!weather.classList.contains('hidden'))weather.style.setProperty('--weather-drift',String((t*.6)%100));
  }
  function finished(){base.finished?.();applyAtmos(true)}
  function recorded(f){base.recorded?.(f)}function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureUI();makePuddles();injectDispatchWeather();
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>injectDispatchWeather());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V12={ATMOS,atmosphereFor,state:()=>state(),puddles:()=>puddles,applyAtmos};}catch{}
  return {...base,onStart,hud,frame,finished,recorded,garage,scoreCard,nextTarget,photoBlocked};
 };
})();
