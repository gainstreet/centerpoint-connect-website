/* ROOFTOP 0.14 — Crew Comms + service-rig art pass. */
'use strict';
((g)=>{
 const countFindings=run=>Object.keys(run?.findings||{}).length;
 function phaseForState(s={}){
  const run=s.run;if(!s.started||!run)return 'idle';
  if(run.complete)return 'complete';
  if(run.mode==='drive')return run.arrived?'parking':'enroute';
  if(!run.onRoof){if(!run.arrived)return 'yard';if(!run.talked)return 'checkin';return 'access'}
  const n=countFindings(run);if(n<=0)return 'roof';if(n===1)return 'finding1';if(n===2)return 'finding2';return 'report';
 }
 const RADIO={
  yard:{kicker:'MAYA / DISPATCH',title:'Westgate is live.',body:'Morning, boss. Service rig is loaded. Westgate wants eyes on a leak call before the next weather moves in.'},
  enroute:{kicker:'CREW COMMS',title:'Route locked.',body:'Westgate is pinned. Bring back clean evidence and a recommendation you would put your company name on.'},
  parking:{kicker:'CREW COMMS',title:'You are on site.',body:'Jordan is waiting near the entrance. Get the story, then use the marked roof access.'},
  checkin:{kicker:'MAYA / DISPATCH',title:'Talk before tools.',body:'Property manager first. The leak story matters as much as the roof detail.'},
  access:{kicker:'CREW COMMS',title:'Roof access is clear.',body:'Head up when you are ready. Work the details, not the assumptions.'},
  roof:{kicker:'ROOF CHANNEL',title:'Westgate roof.',body:'Three details are in play. Walk the roof, frame useful evidence, and make the honest call.'},
  finding1:{kicker:'ROOF CHANNEL',title:'One finding logged.',body:'Good start. Keep moving — one photo never tells the whole roof story.'},
  finding2:{kicker:'ROOF CHANNEL',title:'Two findings logged.',body:'One core detail remains. Finish the sweep before you close the report.'},
  report:{kicker:'MAYA / DISPATCH',title:'Field package is ready.',body:'Three findings are documented. Open FIELD REPORT when you are ready to make the closeout call.'},
  complete:{kicker:'MAYA / DISPATCH',title:'Nice closeout.',body:'Evidence is in, the customer has an answer, and the company ledger is updated. That is a service call.'}
 };
 const RIG_CONFIG={rackPosts:4,ladderRungs:8,doorPanels:2,toolbox:true,beacon:true};
 g.ROOFTOP_V14_HELPERS={phaseForState,countFindings,RADIO,RIG_CONFIG};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let rig=null,radio=null,radioTimer=0,lastPhase='',audio=null;

  function makeDoorPanel(){
   const c=document.createElement('canvas');c.width=640;c.height=280;const x=c.getContext('2d');
   x.fillStyle='#f2ead0';x.fillRect(0,0,c.width,c.height);x.fillStyle='#182c3c';x.fillRect(0,0,c.width,54);
   x.fillStyle='#f0d265';x.font='900 26px Arial';x.textAlign='left';x.fillText('ROOFTOP',32,37);
   x.fillStyle='#182c3c';x.font='900 58px Arial';x.fillText('SERVICE CO.',30,136);x.font='800 24px Arial';x.fillStyle='#4b6571';x.fillText('COMMERCIAL ROOFING',31,181);
   x.strokeStyle='#d7b94f';x.lineWidth=9;x.beginPath();x.moveTo(34,230);x.lineTo(110,198);x.lineTo(185,230);x.stroke();
   x.fillStyle='#182c3c';x.font='800 22px Arial';x.fillText('OWNER OPERATOR',218,232);
   const q=[];R3.quad(q,[-.72,-.315,0],[.72,-.315,0],[.72,.315,0],[-.72,.315,0],'#ffffff');return renderer.mesh(q,renderer.texture(c));
  }
  function makeRig(){
   if(world.v14ServiceRig){rig=world.v14ServiceRig;return rig}
   const d=[];
   // Powder-coated ladder rack and crossbars.
   for(const sx of [-1.06,1.06]){
    R3.box(d,sx,2.18,-1.72,.11,1.28,.11,'#263c47');R3.box(d,sx,2.18,1.25,.11,1.28,.11,'#263c47');
    R3.box(d,sx,2.76,-.2,.10,.12,5.35,'#314d5b');
   }
   for(const z of [-2.15,-.5,1.1,2.15])R3.box(d,0,2.76,z,2.26,.11,.12,'#314d5b');
   // Aluminum extension ladder.
   for(const sx of [-.48,.48])R3.box(d,sx,2.91,-.08,.075,.07,5.05,'#c8d2d0');
   for(let i=0;i<8;i++)R3.box(d,0,2.93,-2.1+i*.6,1.02,.065,.075,i%2?'#aab9b8':'#d5dedb');
   // Bed toolbox and small equipment case.
   R3.box(d,0,1.48,-1.48,2.18,.54,.78,'#536b75');R3.box(d,0,1.79,-1.48,2.25,.10,.84,'#9baeb0');
   R3.box(d,-.66,1.05,-2.05,.72,.42,.55,'#d2a74a');R3.box(d,-.66,1.28,-2.05,.76,.07,.59,'#182c3c');
   const root=R3.node(renderer.mesh(d),state().truck?.x||0,0,state().truck?.z||0);root.yaw=state().truck?.yaw||0;root.children=root.children||[];
   const panelMesh=makeDoorPanel();
   const left=R3.node(panelMesh,-1.235,1.93,.44);left.yaw=-Math.PI/2;const right=R3.node(panelMesh,1.235,1.93,.44);right.yaw=Math.PI/2;root.children.push(left,right);
   const b=[];R3.cylinder(b,0,.13,0,.18,.24,'#df9c37',14,.14);R3.box(b,0,.29,0,.37,.07,.18,'#f0c05a');
   const beacon=R3.node(renderer.mesh(b),0,2.63,.43);root.children.push(beacon);
   root.v14={beacon,panels:[left,right]};world.nodes.push(root);world.v14ServiceRig=root;rig=root;return root;
  }
  function syncRig(dt=0){
   const n=makeRig(),s=state(),truck=s.truck;if(!n||!truck)return;n.x=truck.x;n.z=truck.z;n.yaw=truck.yaw;n.visible=true;
   if(n.v14?.beacon){n.v14.beacon.yaw=(n.v14.beacon.yaw+dt*(s.started?4.8:1.2))%(Math.PI*2);n.v14.beacon.visible=!s.profile?.low||s.run?.mode==='drive'}
   for(const p of n.v14?.panels||[])p.visible=!s.profile?.low;
  }
  function ensureRadio(){
   if(radio)return radio;radio=document.createElement('div');radio.id='crewRadioV14';radio.className='crew-radio-v14';radio.setAttribute('role','status');radio.setAttribute('aria-live','polite');radio.innerHTML='<div class="crew-avatar-v14" aria-hidden="true"><div class="hair"></div><div class="head"><i class="eye e1"></i><i class="eye e2"></i><i class="mouth"></i></div><div class="headset"><i></i></div><span>M</span></div><div class="crew-copy-v14"><small id="crewKickerV14">MAYA / DISPATCH</small><b id="crewTitleV14">Westgate is live.</b><p id="crewBodyV14"></p></div><div class="crew-wave-v14" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';document.body.appendChild(radio);return radio;
  }
  function ensureRun(){const r=state().run;if(!r)return null;if(!r.radioV14||!Array.isArray(r.radioV14.seen))r.radioV14={seen:[]};return r.radioV14}
  function squawk(){
   if(!state().profile?.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),gain=audio.createGain();o.type='square';o.frequency.setValueAtTime(820,audio.currentTime);o.frequency.exponentialRampToValueAtTime(520,audio.currentTime+.11);gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.025,audio.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.14);o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+.15)}catch{}
  }
  function showRadio(key,force=false){
   const msg=RADIO[key];if(!msg)return;const r=ensureRun();if(!r)return;if(!force&&r.seen.includes(key))return;r.seen.push(key);if(r.seen.length>14)r.seen=r.seen.slice(-14);api.save();
   const el=ensureRadio();clearTimeout(radioTimer);$('crewKickerV14').textContent=msg.kicker;$('crewTitleV14').textContent=msg.title;$('crewBodyV14').textContent=msg.body;el.classList.remove('show');requestAnimationFrame(()=>el.classList.add('show'));squawk();try{navigator.vibrate?.(12)}catch{};radioTimer=setTimeout(()=>el.classList.remove('show'),4400);
  }
  function syncRadio(force=false){
   const s=state();if(!s.started||!s.run)return;const phase=phaseForState(s);if(phase==='idle')return;if(!force&&phase===lastPhase)return;lastPhase=phase;if(s.modal&&!force)return;showRadio(phase,force);
  }
  function onStart(){base.onStart?.();makeRig();ensureRadio();syncRig();lastPhase='';setTimeout(()=>syncRadio(false),1450)}
  function recorded(f){base.recorded?.(f);lastPhase='';setTimeout(()=>syncRadio(false),760)}
  function finished(){base.finished?.();lastPhase='';setTimeout(()=>syncRadio(false),900)}
  function hud(){base.hud?.();syncRadio(false)}
  function frame(dt,t){base.frame?.(dt,t);syncRig(dt)}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  makeRig();ensureRadio();syncRig();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V14={phaseForState,countFindings,RADIO,RIG_CONFIG,state:()=>state(),rig:()=>rig,showRadio};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
