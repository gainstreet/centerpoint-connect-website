/* ROOFTOP 0.10 — living district, cinematic mission transitions and procedural ambience. */
'use strict';
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function wrapAxis(v,min,max){const span=max-min;return v<min?max-((min-v)%span):v>max?min+((v-max)%span):v}
 function ambienceMode(s={}){
  if(!s.started||s.modal||s.run?.complete)return 'quiet';
  if(s.run?.mode==='drive')return 'drive';
  if(s.run?.onRoof)return 'roof';
  return 'ground';
 }
 window.ROOFTOP_V10_HELPERS={wrapAxis,ambienceMode};
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),{world,renderer}=api,state=()=>api.get();
  let cinematic=null,statusChip=null,traffic=[],fans=[],lastRoof=null,lastRun='',cinematicTimer=0,audio=null,windGain=null,cityGain=null,hvacGain=null,lastAudioMode='';

  function makeTraffic(){
   if(world.v10Traffic)return world.v10Traffic;
   const configs=[
    {axis:'x',x:-92,z:-3.3,dir:1,speed:9.4,color:'#d9d2c0',yaw:Math.PI/2},
    {axis:'x',x:72,z:3.4,dir:-1,speed:8.2,color:'#b26f57',yaw:-Math.PI/2},
    {axis:'z',x:-38.5,z:72,dir:-1,speed:7.6,color:'#5f8293',yaw:Math.PI},
    {axis:'z',x:81.5,z:-74,dir:1,speed:8.7,color:'#d6b95b',yaw:0}
   ];
   traffic=configs.map((c,i)=>{
    const d=[];
    R3.box(d,0,.48,0,1.55,.5,3.0,c.color);
    R3.box(d,0,.92,-.18,1.34,.55,1.55,'#425d6b');
    R3.box(d,0,.7,1.43,1.24,.12,.08,'#e8dfb7');
    R3.box(d,0,.62,-1.52,1.18,.16,.08,'#a65349');
    for(const sx of [-.77,.77])for(const sz of [-.92,.92])R3.cylinder(d,sx,.29,sz,.25,.18,'#24343e',10);
    const n=R3.node(renderer.mesh(d),c.x,.12,c.z);n.yaw=c.yaw;n.v10={...c,phase:i*.7};world.nodes.push(n);return n;
   });
   world.v10Traffic=traffic;return traffic;
  }
  function makeFans(){
   if(world.v10Fans)return world.v10Fans;
   const spots=[[49,-43,2.1],[53,-31,2.0],[39,-41,1.9]];
   fans=spots.map(([x,z,raise],idx)=>{
    const d=[];
    for(let i=0;i<4;i++)R3.box(d,1.02,0,0,1.65,.06,.32,i%2?'#405665':'#6e858d',i*Math.PI/2);
    R3.cylinder(d,0,.05,0,.28,.13,'#243c4b',14);
    const n=R3.node(renderer.mesh(d),x,world.roofY+raise,z);n.v10={speed:1.6+idx*.45};world.nodes.push(n);return n;
   });
   world.v10Fans=fans;return fans;
  }
  function ensureUI(){
   if(!cinematic){
    cinematic=document.createElement('div');cinematic.id='cinematicV10';cinematic.className='cinematic-v10 hidden';cinematic.innerHTML='<div class="cinematic-bars top"></div><div class="cinematic-copy"><small id="cineKicker">WESTGATE DISTRICT</small><strong id="cineTitle">WATER OVER AISLE SIX</strong><span id="cineSub">COMMERCIAL SERVICE CALL</span></div><div class="cinematic-bars bottom"></div>';document.body.appendChild(cinematic);
   }
   if(!statusChip){
    statusChip=document.createElement('div');statusChip.id='worldStatusV10';statusChip.className='world-status-v10 hidden';statusChip.innerHTML='<i></i><span>WESTGATE DISTRICT</span>';document.getElementById('hud')?.appendChild(statusChip);
   }
  }
  function showCinematic(kicker,title,sub,duration=2100){
   ensureUI();clearTimeout(cinematicTimer);$('cineKicker').textContent=kicker;$('cineTitle').textContent=title;$('cineSub').textContent=sub;cinematic.classList.remove('hidden','leaving');requestAnimationFrame(()=>cinematic.classList.add('active'));cinematicTimer=setTimeout(()=>{cinematic.classList.add('leaving');setTimeout(()=>{cinematic.classList.add('hidden');cinematic.classList.remove('active','leaving')},520)},duration);
  }
  function syncStatus(){
   ensureUI();const s=state(),run=s.run;if(!s.started||!run||run.complete){statusChip.classList.add('hidden');return}
   statusChip.classList.remove('hidden');const span=statusChip.querySelector('span');
   if(run.mode==='drive')span.textContent='EN ROUTE · WESTGATE DISTRICT';
   else if(run.onRoof)span.textContent='ROOF LEVEL · INSPECTION ACTIVE';
   else if(run.arrived)span.textContent='WESTGATE PLAZA · JOB SITE';
   else span.textContent='SERVICE YARD · WESTGATE DISTRICT';
   statusChip.classList.toggle('roof',!!run.onRoof);
  }
  function initAudio(){
   if(audio)return;
   try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=new AC();
    const master=audio.createGain();master.gain.value=.72;master.connect(audio.destination);
    const noiseBuffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),arr=noiseBuffer.getChannelData(0);for(let i=0;i<arr.length;i++)arr[i]=(Math.random()*2-1)*.42;
    const wind=audio.createBufferSource();wind.buffer=noiseBuffer;wind.loop=true;const windFilter=audio.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=780;windGain=audio.createGain();windGain.gain.value=0;wind.connect(windFilter);windFilter.connect(windGain);windGain.connect(master);wind.start();
    const city=audio.createOscillator();city.type='triangle';city.frequency.value=56;cityGain=audio.createGain();cityGain.gain.value=0;city.connect(cityGain);cityGain.connect(master);city.start();
    const hvac=audio.createOscillator();hvac.type='sine';hvac.frequency.value=92;hvacGain=audio.createGain();hvacGain.gain.value=0;hvac.connect(hvacGain);hvacGain.connect(master);hvac.start();
   }catch{audio=null}
  }
  function syncAudio(force=false){
   const s=state(),p=s.profile||{};let mode=ambienceMode(s);if(!p.sound)mode='quiet';if(mode===lastAudioMode&&!force)return;lastAudioMode=mode;
   if(p.sound){initAudio();try{if(audio?.state==='suspended')audio.resume()}catch{}}
   if(!audio||!windGain||!cityGain||!hvacGain)return;const t=audio.currentTime;
   const gains={quiet:[0,0,0],ground:[.012,.012,0],drive:[.006,.008,0],roof:[.025,.004,.016]}[mode]||[0,0,0];
   windGain.gain.cancelScheduledValues(t);cityGain.gain.cancelScheduledValues(t);hvacGain.gain.cancelScheduledValues(t);
   windGain.gain.linearRampToValueAtTime(gains[0],t+.35);cityGain.gain.linearRampToValueAtTime(gains[1],t+.35);hvacGain.gain.linearRampToValueAtTime(gains[2],t+.35);
  }
  function animateWorld(dt,t){
   const s=state(),p=s.profile||{},low=!!p.low;
   for(let i=0;i<traffic.length;i++){
    const n=traffic[i],c=n.v10;n.visible=!low||i<2;if(!n.visible)continue;
    if(c.axis==='x'){n.x=wrapAxis(n.x+c.dir*c.speed*dt,-128,128);n.z=c.z+Math.sin(t*.38+c.phase)*.18}
    else{n.z=wrapAxis(n.z+c.dir*c.speed*dt,-118,118);n.x=c.x+Math.sin(t*.42+c.phase)*.14}
   }
   for(let i=0;i<fans.length;i++){const n=fans[i];n.visible=!low||i===0;if(n.visible)n.yaw=(n.yaw+n.v10.speed*dt)%(Math.PI*2)}
   const m=world.manager;if(m&&s.started&&!s.modal&&!s.run?.complete){m.yaw+=Math.sin(t*.62)*dt*.03;m.y=(Math.sin(t*1.55)*.012)}
  }
  function onStart(){
   base.onStart?.();makeTraffic();makeFans();ensureUI();const s=state(),run=s.run;lastRun=run?.id||'';lastRoof=!!run?.onRoof;syncStatus();syncAudio(true);
   if(run?.quick)showCinematic('WESTGATE PLAZA · ROOF LEVEL','FIELD INSPECTION','DOCUMENT · DIAGNOSE · REPORT',1850);
   else showCinematic('WESTGATE DISTRICT · SERVICE CALL','WATER OVER AISLE SIX','YOUR TRUCK · YOUR COMPANY · YOUR CALL',2250);
  }
  function recorded(f){base.recorded?.(f);if(f)showCinematic('EVIDENCE LOGGED',f.title.toUpperCase(),'FIELD REPORT UPDATED',900)}
  function finished(){base.finished?.();syncStatus();syncAudio(true)}
  function hud(){
   base.hud?.();const s=state(),run=s.run;syncStatus();
   if(run&&run.id!==lastRun){lastRun=run.id;lastRoof=!!run.onRoof}
   const roof=!!run?.onRoof;if(run&&!run.complete&&roof!==lastRoof){lastRoof=roof;if(roof)showCinematic('WESTGATE PLAZA','ROOF LEVEL','INSPECTION ACTIVE',1350);else showCinematic('WESTGATE PLAZA','GROUND LEVEL','SERVICE CALL ACTIVE',1100)}
   syncAudio();
  }
  function frame(dt,t){base.frame?.(dt,t);animateWorld(dt,t)}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}

  makeTraffic();makeFans();ensureUI();
  $('sound')?.addEventListener('click',()=>setTimeout(()=>syncAudio(true),0),{passive:true});
  addEventListener('pagehide',()=>{try{if(audio)audio.close()}catch{}},{once:true});
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V10={wrapAxis,ambienceMode,traffic:()=>traffic,fans:()=>fans,state:()=>state(),showCinematic,syncStatus};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})();
