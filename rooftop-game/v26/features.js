/* ROOFTOP 0.26 — owner-operator character art + mobile touch feedback pass. */
'use strict';
((g)=>{
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0));
 function motion(previous,current,dt){
  const d=distance(previous,current),safe=Math.max(.016,Number(dt)||0);
  return clamp(d/safe/5.5,0,1);
 }
 function actionPulse(next,previous,disabled){return !disabled&&!!next&&next!==previous}
 g.ROOFTOP_V26_HELPERS={clamp,distance,motion,actionPulse};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let kit=null,lastPlayer=null,lastAction='',lastPulse=0,touchInstalled=false;

  function addNode(parent,data,x=0,y=0,z=0,yaw=0){
   const n=R3.node(renderer.mesh(data),x,y,z);n.yaw=yaw;
   if(!Array.isArray(parent.children))parent.children=[];parent.children.push(n);return n;
  }
  function boxNode(parent,x,y,z,w,h,d,color,yaw=0){const q=[];R3.box(q,0,0,0,w,h,d,color,yaw);return addNode(parent,q,x,y,z)}
  function cylinderNode(parent,x,y,z,r,h,color,s=10,r2=r){const q=[];R3.cylinder(q,0,0,0,r,h,color,s,r2);return addNode(parent,q,x,y,z)}
  function buildAvatarKit(){
   if(world.v26AvatarKit)return world.v26AvatarKit;
   const p=world.player,m=world.manager;if(!p)return null;
   const parts=[],sway=[],limb=[];
   // Hard-hat silhouette: wide brim, crown and rear adjustment block.
   parts.push(cylinderNode(p,0,2.31,.005,.35,.075,'#f1d15f',14,.35));
   parts.push(cylinderNode(p,0,2.405,-.012,.285,.18,'#e5bd43',14,.235));
   parts.push(boxNode(p,0,2.315,.25,.45,.055,.16,'#f5df84'));
   parts.push(boxNode(p,0,2.38,-.24,.24,.07,.08,'#263e4b'));
   // Safety glasses read clearly in third person when the camera swings around.
   parts.push(boxNode(p,-.105,2.075,.268,.16,.075,.035,'#233945'));
   parts.push(boxNode(p,.105,2.075,.268,.16,.075,.035,'#233945'));
   parts.push(boxNode(p,0,2.075,.27,.055,.03,.035,'#93a8ae'));
   // Tool belt, tape pouch, phone/tablet and shoulder radio.
   parts.push(boxNode(p,0,1.23,-.015,.72,.11,.42,'#4c4034'));
   const pouch=boxNode(p,-.43,1.15,.02,.25,.38,.34,'#7a5b3d');parts.push(pouch);sway.push(pouch);
   const tape=cylinderNode(p,.43,1.18,.06,.15,.12,'#e8c452',10,.15);tape.rz=Math.PI/2;parts.push(tape);sway.push(tape);
   const tablet=boxNode(p,.5,1.43,-.02,.13,.48,.36,'#1d3440');parts.push(tablet);sway.push(tablet);
   parts.push(boxNode(p,.5,1.43,.175,.08,.37,.24,'#486a77'));
   const radio=boxNode(p,.39,1.77,.08,.16,.33,.18,'#233944');parts.push(radio);
   parts.push(cylinderNode(p,.42,2.005,.08,.025,.22,'#202d34',7,.015));
   parts.push(boxNode(p,.39,1.84,.18,.05,.09,.025,'#f0d265'));
   // Gloves inherit arm animation; knee pads and toe caps inherit each leg's stride.
   if(Array.isArray(p.arms))p.arms.forEach((arm,i)=>{
    const glove=boxNode(arm,0,-.7,.03,.25,.2,.24,'#202f35');parts.push(glove);limb.push(glove);
    const cuff=boxNode(arm,0,-.59,.02,.27,.07,.25,'#e0c458');parts.push(cuff);limb.push(cuff);
   });
   if(Array.isArray(p.legs))p.legs.forEach((leg,i)=>{
    const knee=boxNode(leg,0,-.38,.15,.27,.22,.1,'#263b46');parts.push(knee);limb.push(knee);
    const toe=boxNode(leg,0,-.87,.22,.32,.14,.31,'#2c2b27');parts.push(toe);limb.push(toe);
   });
   // Give Jordan a clipboard + ID badge so the jobsite contact reads as a real character.
   const manager=[];
   if(m){
    manager.push(boxNode(m,0,1.52,.33,.22,.3,.035,'#f4f0da'));
    manager.push(boxNode(m,0,1.72,.35,.08,.08,.025,'#e1b94f'));
    if(Array.isArray(m.arms)&&m.arms[0]){
     const clip=boxNode(m.arms[0],0,-.56,.22,.42,.58,.055,'#765c3e');manager.push(clip);
     manager.push(boxNode(m.arms[0],0,-.53,.255,.31,.45,.025,'#e6e5d8'));
     manager.push(boxNode(m.arms[0],0,-.28,.27,.15,.055,.03,'#293d48'));
    }
   }
   world.v26AvatarKit={parts,sway,limb,manager};return world.v26AvatarKit;
  }
  function installTouchPolish(){
   if(touchInstalled)return;touchInstalled=true;
   const joy=$('joystick'),action=$('action');
   const vibrate=p=>{try{navigator.vibrate?.(p)}catch{}};
   if(joy){
    joy.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){joy.classList.add('touching-v26');vibrate(5)}},{passive:true});
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(ev,()=>joy.classList.remove('touching-v26'));
   }
   if(action){
    action.addEventListener('pointerdown',e=>{if(!action.disabled&&(e.pointerType==='touch'||e.pointerType==='pen')){action.classList.add('touching-v26');vibrate(7)}},{passive:true});
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])action.addEventListener(ev,()=>action.classList.remove('touching-v26'));
   }
  }
  function syncParts(){
   const s=state(),p=world.player,visible=!!(s.started&&p?.visible);
   if(!kit)kit=buildAvatarKit();if(!kit)return;
   kit.parts.forEach(n=>n.visible=visible);
   kit.manager.forEach(n=>n.visible=!!s.started);
  }
  function syncActionFeedback(){
   const action=$('action'),label=$('actionText')?.textContent?.trim()||'';
   if(!action)return;
   const now=performance.now(),pulse=actionPulse(label,lastAction,action.disabled);
   if(pulse&&now-lastPulse>650){
    lastPulse=now;action.classList.remove('context-ready-v26');void action.offsetWidth;action.classList.add('context-ready-v26');
    try{if(matchMedia('(pointer:coarse)').matches)navigator.vibrate?.(5)}catch{}
   }
   lastAction=label;
  }
  function onStart(){base.onStart?.();kit=buildAvatarKit();installTouchPolish();lastPlayer={x:state().player?.x||0,z:state().player?.z||0};lastAction='';syncParts()}
  function hud(){base.hud?.();syncParts();syncActionFeedback()}
  function frame(dt,t){
   base.frame?.(dt,t);if(!kit)kit=buildAvatarKit();if(!kit)return;
   const s=state(),p=s.player;if(!p)return;
   const prev=lastPlayer||{x:p.x,z:p.z},moving=s.started&&s.run?.mode==='walk'&&!s.modal&&!s.photoMode?motion(prev,p,dt):0;
   lastPlayer={x:p.x,z:p.z};
   const sway=Math.sin(t*10.5)*.07*moving;
   kit.sway.forEach((n,i)=>{n.rz=sway*(i%2?-.65:1);n.rx=Math.cos(t*9.2+i)*.025*moving});
   if(kit.parts[0])kit.parts[0].y=2.31+(moving?Math.sin(t*10.5)*.006:0);
   syncParts();
  }
  function finished(){base.finished?.();if(kit){kit.parts.forEach(n=>n.visible=false);kit.manager.forEach(n=>n.visible=false)}}
  function garage(back){return base.garage?.(back)}function recorded(f){return base.recorded?.(f)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  kit=buildAvatarKit();installTouchPolish();syncParts();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V26={helpers:g.ROOFTOP_V26_HELPERS,kit:()=>({player:kit?.parts?.length||0,manager:kit?.manager?.length||0,limb:kit?.limb?.length||0}),syncActionFeedback};}catch{}
  return {...base,onStart,hud,frame,finished,garage,recorded,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
