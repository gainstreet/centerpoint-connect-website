/* ROOFTOP 0.18 — roof condition art pass + proximity inspection focus. */
'use strict';
((g)=>{
 const CUES={
  drain:{eyebrow:'DRAIN ASSEMBLY',cue:'Debris is collecting around the bowl and grate.'},
  seam:{eyebrow:'MEMBRANE SEAM',cue:'The lap edge is visibly raised along this run.'},
  patch:{eyebrow:'PREVIOUS REPAIR',cue:'Layered patch material and perimeter mastic are visible.'}
 };
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0));
 const proximity=(d,max=8,inspect=3.1)=>({distance:d,visible:d<=max,ready:d<=inspect,fill:clamp((max-d)/(max-inspect),0,1)});
 g.ROOFTOP_V18_HELPERS={CUES,clamp,distance,proximity};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer,conditions}=api;
  let hud=null,bar=null,title=null,meta=null,bracket=null,details=null,lastReadyId='',lastTargetId='';

  function meshNode(build){const d=[];build(d);const n=R3.node(renderer.mesh(d));world.nodes.push(n);return n}
  function addBox(d,x,y,z,w,h,depth,color){R3.box(d,x,y,z,w,h,depth,color)}
  function makeDetails(){
   if(world.v18ConditionArt){details=world.v18ConditionArt;bracket=world.v18FocusBracket;return details}
   const roofY=world.roofY+.035,map={};
   for(const f of conditions){
    const n=meshNode(d=>{
     if(f.id==='drain'){
      addBox(d,0,.018,0,1.55,.035,1.55,'#3e535b');
      addBox(d,0,.045,0,.92,.035,.92,'#182b33');
      addBox(d,-.31,.075,0,.045,.06,.72,'#73838a');addBox(d,0,.075,0,.045,.06,.72,'#73838a');addBox(d,.31,.075,0,.045,.06,.72,'#73838a');
      addBox(d,0,.075,-.31,.72,.06,.045,'#73838a');addBox(d,0,.075,0,.72,.06,.045,'#73838a');addBox(d,0,.075,.31,.72,.06,.045,'#73838a');
      addBox(d,-.78,.055,-.28,.42,.06,.16,'#74613a');addBox(d,-.56,.06,.54,.25,.07,.13,'#8a7240');addBox(d,.64,.06,.43,.34,.06,.15,'#63552f');addBox(d,.7,.055,-.53,.24,.05,.12,'#9b7d43');
      addBox(d,-1.02,.02,.15,.65,.018,.42,'#49646b');addBox(d,.96,.018,.03,.62,.015,.5,'#4a676e');
     }else if(f.id==='seam'){
      addBox(d,0,.018,0,3.2,.022,.86,'#889399');
      addBox(d,0,.055,-.08,3.15,.045,.34,'#a8afb1');
      addBox(d,.28,.105,.12,1.5,.055,.11,'#27383e');
      addBox(d,-1.15,.07,.29,.2,.04,.2,'#68777d');addBox(d,1.18,.07,.29,.2,.04,.2,'#68777d');
      addBox(d,-1.15,.09,.29,.06,.06,.06,'#d0d5d1');addBox(d,1.18,.09,.29,.06,.06,.06,'#d0d5d1');
     }else{
      addBox(d,0,.025,0,2.25,.04,1.65,'#606e73');
      addBox(d,0,.058,0,1.92,.035,1.32,'#737f83');
      addBox(d,0,.088,-.66,2.04,.032,.10,'#323f42');addBox(d,0,.088,.66,2.04,.032,.10,'#323f42');
      addBox(d,-.99,.088,0,.10,.032,1.34,'#323f42');addBox(d,.99,.088,0,.10,.032,1.34,'#323f42');
      addBox(d,.35,.115,-.1,.58,.035,.18,'#887144');
     }
    });
    n.x=f.x;n.y=roofY;n.z=f.z;map[f.id]=n;
   }
   bracket=meshNode(d=>{
    const c='#f0d265';
    addBox(d,-1.35,.08,-1.35,.58,.055,.08,c);addBox(d,-1.35,.08,-1.35,.08,.055,.58,c);
    addBox(d,1.35,.08,-1.35,.58,.055,.08,c);addBox(d,1.35,.08,-1.35,.08,.055,.58,c);
    addBox(d,-1.35,.08,1.35,.58,.055,.08,c);addBox(d,-1.35,.08,1.35,.08,.055,.58,c);
    addBox(d,1.35,.08,1.35,.58,.055,.08,c);addBox(d,1.35,.08,1.35,.08,.055,.58,c);
   });
   bracket.visible=false;world.v18ConditionArt=map;world.v18FocusBracket=bracket;details=map;return details;
  }
  function ensureHUD(){
   if(hud)return;
   hud=document.createElement('div');hud.id='inspectFocusV18';hud.className='inspect-focus-v18 hidden';
   hud.innerHTML='<div class="inspect-head-v18"><small id="inspectLabelV18">DETAIL FOCUS</small><b id="inspectTitleV18">—</b></div><div class="inspect-meter-v18"><i id="inspectBarV18"></i></div><span id="inspectMetaV18">Move closer for a useful inspection view.</span>';
   document.body.appendChild(hud);bar=$('inspectBarV18');title=$('inspectTitleV18');meta=$('inspectMetaV18');
  }
  function currentTarget(){
   const s=state(),run=s.run;if(!run)return null;
   const id=run.navTargetV17;return conditions.find(f=>f.id===id&&!run.findings?.[f.id])||base.nextTarget?.()||null;
  }
  function sync(){
   ensureHUD();makeDetails();const s=state(),run=s.run,onRoof=!!(s.started&&run?.onRoof&&!run.complete&&!s.photoMode),f=onRoof?currentTarget():null;
   bracket.visible=false;if(!f){hud.classList.add('hidden');return}
   const d=distance(s.player,f),p=proximity(d),cue=CUES[f.id]||{eyebrow:'ROOF DETAIL',cue:'Inspect the visible condition before making a recommendation.'};
   hud.classList.toggle('hidden',!p.visible);hud.classList.toggle('ready-v18',p.ready);$('inspectLabelV18').textContent=p.ready?'INSPECTION RANGE':'DETAIL FOCUS';title.textContent=cue.eyebrow;bar.style.transform='scaleX('+p.fill.toFixed(3)+')';meta.textContent=p.ready?'TAP INSPECT · '+Math.max(1,Math.round(d))+'m · '+cue.cue:Math.round(d)+'m · Move closer for a useful inspection view.';
   bracket.x=f.x;bracket.z=f.z;bracket.y=world.roofY+.09+Math.sin(performance.now()/190)*.035;bracket.visible=p.visible;
   if(lastTargetId!==f.id){lastTargetId=f.id;lastReadyId='';hud.classList.remove('lock-pop-v18');void hud.offsetWidth;hud.classList.add('lock-pop-v18')}
   if(p.ready&&lastReadyId!==f.id){lastReadyId=f.id;hud.classList.remove('range-pop-v18');void hud.offsetWidth;hud.classList.add('range-pop-v18');try{navigator.vibrate?.([8,18,8])}catch{};api.toast?.('Inspection range reached. Frame the '+f.title.toLowerCase()+', then tap INSPECT.')}
   if(!p.ready&&lastReadyId===f.id)lastReadyId='';
  }
  function onStart(){base.onStart?.();ensureHUD();makeDetails();sync()}
  function hudUpdate(){base.hud?.();sync()}
  function frame(dt,t){base.frame?.(dt,t);sync();if(bracket?.visible){bracket.yaw=Math.sin(t*2.4)*.04}}
  function recorded(f){base.recorded?.(f);if(details?.[f?.id])details[f.id].y=world.roofY+.03;sync()}
  function finished(){base.finished?.();if(hud)hud.classList.add('hidden');if(bracket)bracket.visible=false}
  function garage(back){if(hud)hud.classList.add('hidden');if(bracket)bracket.visible=false;return base.garage?.(back)}
  function nextTarget(){return currentTarget()||base.nextTarget?.()}
  function scoreCard(){return base.scoreCard?.()}function photoBlocked(eyePos,targetPos){return base.photoBlocked?.(eyePos,targetPos)||false}
  ensureHUD();makeDetails();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V18={helpers:g.ROOFTOP_V18_HELPERS,details:()=>details,bracket:()=>bracket,sync};}catch{}
  return {...base,onStart,hud:hudUpdate,frame,recorded,finished,garage,nextTarget,scoreCard,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
