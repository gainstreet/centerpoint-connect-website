/* ROOFTOP 0.32 — living district pass: signal-aware traffic, contractor vehicles, responsive road ambience + proximity braking. */
'use strict';
((g)=>{
 const TAU=Math.PI*2;
 const INTERSECTION={x:78,z:0};
 const ROUTES=[
  {id:'east',axis:'x',fixed:3.2,min:-126,max:126,speed:8.2,dir:1,group:'h'},
  {id:'west',axis:'x',fixed:-2.7,min:-126,max:126,speed:7.5,dir:-1,group:'h'},
  {id:'north',axis:'z',fixed:81.0,min:-118,max:118,speed:6.8,dir:1,group:'v'},
  {id:'south',axis:'z',fixed:75.0,min:-118,max:118,speed:7.1,dir:-1,group:'v'}
 ];
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const wrap=(v,a,b)=>{const span=b-a;while(v>b)v-=span;while(v<a)v+=span;return v};
 function signalPhase(clock){
  const t=((Number(clock)||0)%12+12)%12;
  if(t<5)return {h:'green',v:'red'};
  if(t<6)return {h:'yellow',v:'red'};
  if(t<11)return {h:'red',v:'green'};
  return {h:'red',v:'yellow'};
 }
 function distanceToStop(route,p){
  if(route.axis==='x')return route.dir>0?INTERSECTION.x-7-p:p-(INTERSECTION.x+7);
  return route.dir>0?INTERSECTION.z-7-p:p-(INTERSECTION.z+7);
 }
 function signalBrake(route,p,phase){
  const light=phase[route.group];if(light==='green')return 1;
  const d=distanceToStop(route,p);if(d<0||d>18)return 1;
  const yellow=light==='yellow';return clamp((d-(yellow?1.3:2.2))/(yellow?8:10),yellow?.25:.04,1);
 }
 function routePoint(route,p){return route.axis==='x'?{x:p,z:route.fixed}:{x:route.fixed,z:p}}
 g.ROOFTOP_V32_HELPERS={ROUTES,INTERSECTION,clamp,wrap,signalPhase,distanceToStop,signalBrake,routePoint};

 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api)||{},$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let traffic=[],signalNodes=[],pill=null,lastWarn=0,lastOnRoof=null,audio=null,roadOsc=null,roadGain=null,created=false;

  function vehicleGeometry(type,color){
   const q=[];
   const B=R3.box;
   // Shared low-poly silhouette with stronger commercial-road character than the old static backdrop.
   if(type==='box'){
    B(q,0,.76,-.15,2.15,.95,4.75,'#e6e5dc');B(q,0,1.65,-.45,2.05,1.25,2.7,'#f2f0e6');B(q,0,1.33,1.25,2.05,.65,1.05,color);
    B(q,0,1.66,1.79,1.75,.52,.04,'#2b4757');B(q,0,.78,-2.54,1.82,.52,.05,'#a54c40');
   }else if(type==='van'){
    B(q,0,.72,0,1.95,.78,4.35,color);B(q,0,1.48,.1,1.86,1.02,3.08,color);B(q,0,1.58,1.66,1.62,.62,.04,'#294856');
    B(q,0,1.34,-1.62,1.48,.46,.04,'#304751');B(q,0,.9,-2.2,1.45,.12,.04,'#b44d42');
   }else if(type==='pickup'){
    B(q,0,.68,0,1.92,.66,4.28,color);B(q,0,1.35,.86,1.82,.94,1.62,color);B(q,0,1.5,1.7,1.55,.55,.04,'#294856');
    B(q,0,1.02,-1.05,1.7,.6,1.34,'#334955');B(q,0,.96,-1.03,1.45,.18,1.05,'#596c70');
   }else{
    B(q,0,.57,0,1.86,.56,3.8,color);B(q,0,1.12,.35,1.72,.75,1.95,color);B(q,0,1.3,1.34,1.5,.46,.04,'#294856');
    B(q,0,1.08,-.72,1.55,.42,.04,'#294856');
   }
   // Wheels, lamps, and bright work-vehicle marker details are boxes to keep draw cost low.
   for(const side of [-1,1])for(const z of [-1.25,1.25])B(q,side*.91,.43,z,.18,.55,.62,'#24333b');
   B(q,-.58,.76,2.08,.48,.18,.05,'#ece8bd');B(q,.58,.76,2.08,.48,.18,.05,'#ece8bd');
   B(q,-.58,.73,-2.1,.45,.15,.05,'#b64e44');B(q,.58,.73,-2.1,.45,.15,.05,'#b64e44');
   if(type==='van'||type==='box'){B(q,0,1.58,-1.05,1.25,.22,.04,'#f0d265');B(q,0,1.58,-1.09,.88,.08,.045,'#243b49')}
   return q;
  }
  function makeSignalPole(x,z,yaw=0){
   const parts=[];let q=[];
   R3.cylinder(q,0,2.4,0,.095,4.8,'#263b46',8,.08);R3.box(q,0,4.7,.72,.16,.16,1.55,'#263b46');
   const mast=R3.node(renderer.mesh(q),x,.05,z);mast.yaw=yaw;world.nodes.push(mast);parts.push(mast);
   const colors={red:'#d74f43',yellow:'#e7bd4d',green:'#56a66f'};
   for(const [i,c] of ['red','yellow','green'].entries()){
    let g2=[];R3.box(g2,0,0,0,.42,.42,.13,'#162a34');R3.box(g2,0,0,.071,.26,.26,.025,colors[c]);
    const n=R3.node(renderer.mesh(g2),x,4.97-i*.5,z);n.yaw=yaw;n.v32Color=c;world.nodes.push(n);parts.push(n);
   }
   return parts;
  }
  function ensureScene(){
   if(created)return;created=true;
   if(world.v32Traffic){traffic=world.v32Traffic;signalNodes=world.v32Signals||[];return}
   const specs=[
    {route:0,p:-88,type:'pickup',color:'#467889'},
    {route:0,p:15,type:'car',color:'#c0c5bd'},
    {route:1,p:112,type:'van',color:'#d6b958'},
    {route:1,p:28,type:'car',color:'#8d9ba0'},
    {route:2,p:-73,type:'box',color:'#597987'},
    {route:3,p:61,type:'pickup',color:'#744f45'}
   ];
   for(const spec of specs){
    const route=ROUTES[spec.route],pt=routePoint(route,spec.p),node=R3.node(renderer.mesh(vehicleGeometry(spec.type,spec.color)),pt.x,.11,pt.z);
    node.yaw=route.axis==='x'?(route.dir>0?Math.PI/2:-Math.PI/2):(route.dir>0?0:Math.PI);
    node.v32={...spec,route,speed:route.speed*(.92+((spec.p+140)%19)/95),p:spec.p};world.nodes.push(node);traffic.push(node);
   }
   signalNodes=[...makeSignalPole(70.8,7.1,Math.PI/2),...makeSignalPole(85.2,-7.1,-Math.PI/2)];
   world.v32Traffic=traffic;world.v32Signals=signalNodes;
  }
  function ensureUI(){
   if(pill)return;const hud=$('hud');if(!hud)return;
   pill=document.createElement('div');pill.id='districtLifeV32';pill.className='district-life-v32 hidden';pill.innerHTML='<i></i><span>WESTGATE DISTRICT</span><b>LIVE TRAFFIC</b>';hud.appendChild(pill);
  }
  function syncUI(){
   ensureUI();const s=state(),show=!!(s.started&&!s.modal&&!s.photoMode&&!s.run?.complete&&!s.run?.onRoof);
   pill?.classList.toggle('hidden',!show);
   if(show&&lastOnRoof!==false){pill?.classList.remove('pulse-v32');if(pill){void pill.offsetWidth;pill.classList.add('pulse-v32')}}
   lastOnRoof=!!s.run?.onRoof;
  }
  function actorDistance(pt){
   const s=state(),a=s.run?.mode==='drive'?s.truck:s.player;if(!a)return Infinity;return Math.hypot((a.x||0)-pt.x,(a.z||0)-pt.z);
  }
  function updateSignals(clock){
   const phase=signalPhase(clock);
   for(const n of signalNodes){if(!n.v32Color)continue;
    // First signal faces the horizontal road; second faces vertical traffic.
    const horizontal=n.x<78;const current=horizontal?phase.h:phase.v;n.visible=n.v32Color===current;
   }
  }
  function updateTraffic(dt,clock){
   ensureScene();const s=state(),phase=signalPhase(clock),low=!!s.profile?.low;
   let nearest=Infinity;
   for(let i=0;i<traffic.length;i++){
    const n=traffic[i],m=n.v32;if(low&&i>=4){n.visible=false;continue}else n.visible=!!s.started;
    const before=routePoint(m.route,m.p),actorD=actorDistance(before),signalFactor=signalBrake(m.route,m.p,phase);
    const actorFactor=actorD<10?clamp((actorD-3.2)/6.8,.03,1):1;
    m.p=wrap(m.p+m.speed*m.route.dir*Math.min(.05,Math.max(0,dt))*Math.min(signalFactor,actorFactor),m.route.min,m.route.max);
    const pt=routePoint(m.route,m.p);n.x=pt.x;n.z=pt.z;nearest=Math.min(nearest,actorDistance(pt));
   }
   if(s.started&&!s.run?.onRoof&&!s.modal&&!s.photoMode&&nearest<5.5&&performance.now()-lastWarn>5000){lastWarn=performance.now();try{navigator.vibrate?.([6,28,6])}catch{};api.toast?.('LIVE TRAFFIC · District vehicles will brake around you.')}
   updateRoadAudio(nearest);
  }
  function ensureAudio(){
   if(audio||!state().profile?.sound)return;
   try{const A=g.AudioContext||g.webkitAudioContext;if(!A)return;audio=new A();roadOsc=audio.createOscillator();roadGain=audio.createGain();roadOsc.type='triangle';roadOsc.frequency.value=58;roadGain.gain.value=.0001;roadOsc.connect(roadGain);roadGain.connect(audio.destination);roadOsc.start()}catch{audio=null}
  }
  function updateRoadAudio(nearest){
   const s=state();if(!s.profile?.sound){if(roadGain&&audio)roadGain.gain.setTargetAtTime(.0001,audio.currentTime,.16);return}
   ensureAudio();if(!audio||!roadGain)return;try{if(audio.state==='suspended')audio.resume();const roof=s.run?.onRoof?0.36:1,near=clamp(1-(nearest-4)/35,0,1),gain=(s.started&&!s.modal&&!s.photoMode)?.0008+near*.0042*roof:.0001;roadGain.gain.setTargetAtTime(Math.max(.0001,gain),audio.currentTime,.22);roadOsc.frequency.setTargetAtTime(52+near*22,audio.currentTime,.2)}catch{}
  }
  function onStart(){base.onStart?.();ensureScene();syncUI();api.toast?.('WESTGATE DISTRICT LIVE · Traffic and signals are active.')}
  function frame(dt,clock){base.frame?.(dt,clock);if(!created&&state().started)ensureScene();if(created){updateTraffic(dt,clock);updateSignals(clock)}syncUI()}
  return {...base,onStart,frame};
 };
})(window);
