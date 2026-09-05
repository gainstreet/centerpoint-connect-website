/* ROOFTOP 0.5 — weather-window pressure, Clean Sweep side challenge and mobile haptics. */
'use strict';
(()=>{
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),{world,renderer}=api;
  const LEAF_BONUS=75,WEATHER_BONUS=100,WEATHER_WINDOW=180;
  const leafSpots=[
   [55.9,-39.1,.18],[56.8,-41.1,-.4],[58.7,-42.0,.6],[60.1,-39.3,-.2],
   [45.4,-35.4,.3],[47.1,-36.3,-.5],[50.3,-36.7,.2],[52.6,-35.1,-.4],
   [38.0,-26.0,.5],[41.2,-25.2,-.2],[57.2,-27.2,.35],[61.0,-28.1,-.45]
  ];
  const leafNodes=[];
  for(let i=0;i<leafSpots.length;i++){
   const [x,z,rot]=leafSpots[i],data=[];
   R3.box(data,0,.035,0,.58,.07,.24,i%3===0?'#c7a35f':i%3===1?'#7d8f56':'#9d7248',rot);
   R3.box(data,.18,.07,.02,.34,.04,.08,'#5f7145',rot+.6);
   const n=R3.node(renderer.mesh(data),x,world.roofY+.08,z);n.visible=false;n.yaw=rot;world.nodes.push(n);leafNodes.push(n);
  }
  const ui=document.createElement('div');ui.id='bonusChallenge';ui.className='bonus-challenge hidden';ui.innerHTML='<div class="bonus-top"><b>CLEAN SWEEP</b><span id="weatherClock">3:00</span></div><div class="bonus-copy"><span id="leafCount">0 / 12</span><span>+$75 DEBRIS BONUS</span></div><div class="bonus-track"><i id="bonusFill"></i></div><small id="weatherLabel">+$100 WEATHER WINDOW</small>';
  document.getElementById('hud')?.appendChild(ui);
  const tint=document.createElement('div');tint.id='weatherTint';tint.className='weather-tint';document.body.appendChild(tint);
  let activeRun='',lastCollect=-1,lastHud='';
  const buzz=pattern=>{try{if(navigator.vibrate)navigator.vibrate(pattern)}catch{}};
  function state(){return api.get()}
  function ensure(){
   const s=state(),run=s.run;if(!run)return null;
   if(!run.bonusV5||run.bonusV5.version!==1)run.bonusV5={version:1,elapsed:0,collected:[],sweepPaid:false,weatherPaid:false,resultApplied:false,warned60:false,expired:false};
   if(!Array.isArray(run.bonusV5.collected))run.bonusV5.collected=[];
   return run.bonusV5;
  }
  function syncLeaves(){
   const s=state(),b=ensure(),on=!!(s.run?.onRoof&&!s.run.complete&&!s.photoMode&&!s.modal);
   for(let i=0;i<leafNodes.length;i++)leafNodes[i].visible=on&&!b?.collected.includes(i);
  }
  function collect(i){
   const s=state(),b=ensure();if(!b||b.collected.includes(i))return;
   b.collected.push(i);leafNodes[i].visible=false;lastCollect=i;buzz(18);
   const n=b.collected.length;
   if(n===4||n===8)api.toast('Clean Sweep '+n+'/12 — keep the roof tidy while you inspect.');
   if(n===12&&!b.sweepPaid){b.sweepPaid=true;s.profile.cash+=LEAF_BONUS;if(!s.profile.badges.includes('clean-sweep'))s.profile.badges.push('clean-sweep');api.saveProfile();api.updateStats();api.chime();buzz([20,45,20]);api.toast('CLEAN SWEEP +$75 — roof left better than you found it.');}
  }
  function updateBonusHud(){
   const s=state(),run=s.run,b=ensure();if(!run||!b)return;
   const show=run.onRoof&&!run.complete&&!s.photoMode&&!s.modal;
   ui.classList.toggle('hidden',!show);
   tint.classList.toggle('active',show);
   if(!show)return;
   const left=Math.max(0,WEATHER_WINDOW-b.elapsed),m=Math.floor(left/60),sec=Math.floor(left%60).toString().padStart(2,'0'),n=b.collected.length;
   $('weatherClock').textContent=m+':'+sec;$('leafCount').textContent=n+' / 12';$('bonusFill').style.width=(n/12*100)+'%';
   $('weatherLabel').textContent=left>0?'+$100 WEATHER WINDOW':'WEATHER BONUS EXPIRED';
   ui.classList.toggle('urgent',left>0&&left<=60);ui.classList.toggle('expired',left<=0);
   const pressure=Math.min(1,b.elapsed/WEATHER_WINDOW);tint.style.opacity=String(.04+pressure*.16);
  }
  function onStart(){base.onStart?.();activeRun=state().run?.id||'';lastHud='';const b=ensure();syncLeaves();updateBonusHud();if(state().run?.onRoof&&b?.elapsed===0)api.toast('BONUS: clear 12 debris pieces and finish inside the 3:00 weather window.');}
  function recorded(f){base.recorded?.(f);buzz([12,25,12]);}
  function finished(){
   base.finished?.();const s=state(),run=s.run,b=ensure();if(!run||!b||b.resultApplied)return;
   b.resultApplied=true;let extras=[];
   if(b.sweepPaid){run.pay+=LEAF_BONUS;extras.push('Clean Sweep +$'+LEAF_BONUS);}
   if(b.elapsed<=WEATHER_WINDOW&&!b.weatherPaid){b.weatherPaid=true;run.pay+=WEATHER_BONUS;s.profile.cash+=WEATHER_BONUS;if(!s.profile.badges.includes('beat-the-rain'))s.profile.badges.push('beat-the-rain');extras.push('Weather Window +$'+WEATHER_BONUS);}
   api.saveProfile();api.updateStats();buzz([25,50,25,50,40]);
   setTimeout(()=>{const body=$('sheetBody');if(!body||!run.complete||!extras.length)return;const row=document.createElement('div');row.className='bonus-result';row.innerHTML='<strong>BONUS WORK</strong><span>'+extras.join(' · ')+'</span>';body.prepend(row);},0);
  }
  function hud(){base.hud?.();const s=state(),b=ensure();if(!s.run||!b)return;const stamp=[s.run.id,s.run.onRoof,s.run.complete,s.photoMode,s.modal,b.collected.length,Math.floor(b.elapsed)].join('|');if(stamp===lastHud)return;lastHud=stamp;syncLeaves();updateBonusHud();}
  function frame(dt,t){
   base.frame?.(dt,t);const s=state(),run=s.run,b=ensure();if(!run||!b)return;
   if(run.id!==activeRun){activeRun=run.id;syncLeaves();}
   if(run.onRoof&&!run.complete&&!s.modal&&!s.photoMode){
    b.elapsed+=dt;
    const left=WEATHER_WINDOW-b.elapsed;
    if(left<=60&&!b.warned60){b.warned60=true;api.toast('One minute left for the weather-window bonus. No rush if it compromises the inspection.');buzz([30,70,30]);}
    if(left<=0&&!b.expired){b.expired=true;api.toast('Weather bonus expired. Finish the inspection properly — no penalty to your core score.');}
    for(let i=0;i<leafSpots.length;i++)if(!b.collected.includes(i)){
     const dx=s.player.x-leafSpots[i][0],dz=s.player.z-leafSpots[i][1];if(dx*dx+dz*dz<.72*.72)collect(i);
    }
    for(let i=0;i<leafNodes.length;i++)if(leafNodes[i].visible){leafNodes[i].yaw+=dt*(i%2?1:-1)*.22;leafNodes[i].y=world.roofY+.08+Math.sin(t*2+i)*.015;}
   }
   updateBonusHud();
  }
  function garage(back){return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}
  function nextTarget(){return base.nextTarget?.()}
  function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})();
