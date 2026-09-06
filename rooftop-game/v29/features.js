/* ROOFTOP 0.29 — operator career XP, live call score + shift grades. */
'use strict';
((g)=>{
 const CAREER_KEY='rooftop-v29-career';
 const LEVELS=[
  {xp:0,title:'ROOKIE OPERATOR'},
  {xp:200,title:'FIELD OPERATOR'},
  {xp:500,title:'LEAD INSPECTOR'},
  {xp:900,title:'SERVICE CAPTAIN'},
  {xp:1400,title:'OWNER OPERATOR'},
  {xp:2000,title:'ROOF BOSS'}
 ];
 const XP_BY_GRADE={S:140,A:110,B:90,C:70,D:50};
 const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
 const average=o=>{const v=Object.values(o||{}).filter(Number.isFinite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0};
 const levelFor=xp=>{let i=0;for(let n=0;n<LEVELS.length;n++)if(xp>=LEVELS[n].xp)i=n;return {index:i,...LEVELS[i],next:LEVELS[i+1]||null}};
 const gradeFor=score=>score>=90?'S':score>=78?'A':score>=65?'B':score>=50?'C':'D';
 function scoreShift(state,conditions=[]){
  const run=state?.run||{},findings=run.findings||{};
  const access=!!(run.onRoof||run.v27Accessed||Object.keys(findings).length);
  const mobilize=(run.arrived?3:0)+(run.talked?4:0)+(access?3:0);
  let accurate=0;for(const c of conditions){if(findings[c.id]?.rec===c.correct)accurate++}
  const evidence=Math.min(30,accurate*10);
  const qa=run.cameraQaV22||{},qaAvg=average(qa.scores),qaCount=Object.keys(qa.scores||{}).length;
  const camera=qaAvg>=82?10:qaAvg>=72?7:qaCount>=3?4:0;
  const diagnostic=run.diagnosticV20?.correct===true?10:run.diagnosticV20?.attempted?3:0;
  const thermal=run.thermalV21?.complete?10:0;
  const mechanical=run.mechanicalV24?.complete?8:0;
  const quote=Math.round(clamp(Number(run.quoteV28?.score)||0)*.12);
  const closeout=run.complete?10:0;
  const total=clamp(mobilize+evidence+camera+diagnostic+thermal+mechanical+quote+closeout);
  return {total,grade:gradeFor(total),mobilize,evidence,camera,diagnostic,thermal,mechanical,quote,closeout,accurate,qaAvg:Math.round(qaAvg)};
 }
 g.ROOFTOP_V29_HELPERS={CAREER_KEY,LEVELS,XP_BY_GRADE,clamp,average,levelFor,gradeFor,scoreShift};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),conditions=api.conditions||[];
  let hud=null,observer=null,lastScore=-1,lastGrade='',lastStamp='',awardBurst=null;

  function readCareer(){
   let x=null;try{x=JSON.parse(localStorage.getItem(CAREER_KEY)||'null')}catch{}
   if(!x||x.version!==1)x={version:1,xp:0,completed:[],bestGrade:'',sGrades:0};
   x.xp=Math.max(0,Math.floor(Number(x.xp)||0));if(!Array.isArray(x.completed))x.completed=[];x.completed=x.completed.filter(v=>typeof v==='string').slice(-40);
   x.sGrades=Math.max(0,Math.floor(Number(x.sGrades)||0));return x;
  }
  function writeCareer(x){try{localStorage.setItem(CAREER_KEY,JSON.stringify(x));return true}catch{return false}}
  function xpForecast(score){return XP_BY_GRADE[gradeFor(score)]||50}
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function ensureHUD(){
   if(hud?.isConnected)return hud;
   const mission=$('mission');if(!mission)return null;
   hud=document.createElement('section');hud.id='careerHudV29';hud.className='career-hud-v29 hidden';
   hud.innerHTML='<div class="career-top-v29"><span><small>OPERATOR CAREER</small><b id="careerTitleV29">ROOKIE OPERATOR</b></span><em id="careerLevelV29">LV 1</em></div><div class="career-progress-v29"><i id="careerBarV29"></i></div><div class="career-bottom-v29"><span id="careerXpV29">0 / 200 XP</span><b id="careerShiftV29">CALL SCORE 0 · +50 XP</b></div>';
   const rail=$('missionFlowV27');if(rail?.parentNode===mission)mission.insertBefore(hud,rail);else mission.appendChild(hud);
   return hud;
  }
  function flashScore(score,grade){
   const node=ensureHUD();if(!node)return;node.classList.remove('score-pop-v29','grade-pop-v29');void node.offsetWidth;node.classList.add(score>lastScore?'score-pop-v29':'grade-pop-v29');
   if(grade!==lastGrade&&lastGrade){vibrate([7,18,7]);api.chime?.(true)}else vibrate(5);
  }
  function sync(force=false){
   ensureHUD();const s=state(),run=s.run;if(!hud)return;
   const visible=!!(s.started&&run&&!run.complete&&!s.photoMode&&!s.modal);hud.classList.toggle('hidden',!visible);if(!run)return;
   const career=readCareer(),lev=levelFor(career.xp),perf=scoreShift(s,conditions),next=lev.next;
   const baseXp=lev.xp,nextXp=next?.xp||Math.max(baseXp+600,career.xp+600),span=Math.max(1,nextXp-baseXp),pct=clamp((career.xp-baseXp)/span,0,1)*100;
   $('careerTitleV29').textContent=lev.title;$('careerLevelV29').textContent='LV '+(lev.index+1);$('careerBarV29').style.width=pct.toFixed(1)+'%';
   $('careerXpV29').textContent=next?`${career.xp} / ${next.xp} XP`:`${career.xp} XP · MAX RANK`;
   $('careerShiftV29').textContent=`CALL SCORE ${perf.total} · ${perf.grade} · +${xpForecast(perf.total)} XP`;
   const rank=$('rankPill');if(rank)rank.textContent=lev.title;
   if(lastScore>=0&&(perf.total>lastScore||perf.grade!==lastGrade))flashScore(perf.total,perf.grade);
   if(force){hud.classList.remove('sync-v29');void hud.offsetWidth;hud.classList.add('sync-v29')}
   lastScore=perf.total;lastGrade=perf.grade;
  }
  function awardCareer(){
   const s=state(),run=s.run;if(!run?.complete||!run.id)return null;
   const career=readCareer();if(career.completed.includes(run.id))return {already:true,career,perf:scoreShift(s,conditions),gained:0,levelUp:false};
   const perf=scoreShift(s,conditions),gained=XP_BY_GRADE[perf.grade]||50,before=levelFor(career.xp);career.xp+=gained;career.completed.push(run.id);career.completed=career.completed.slice(-40);
   if(perf.grade==='S')career.sGrades+=1;const order=['D','C','B','A','S'];if(!career.bestGrade||order.indexOf(perf.grade)>order.indexOf(career.bestGrade))career.bestGrade=perf.grade;
   const after=levelFor(career.xp),levelUp=after.index>before.index;writeCareer(career);
   if(perf.grade==='S'){
    const p=s.profile;if(p){if(!Array.isArray(p.badges))p.badges=[];if(!p.badges.includes('perfect-call'))p.badges.push('perfect-call');api.saveProfile?.()}
   }
   return {already:false,career,perf,gained,before,after,levelUp};
  }
  function breakdownRow(label,value,max,good=true){return `<div class="career-row-v29 ${good?'good-v29':''}"><span>${label}</span><b>${value} / ${max}</b></div>`}
  function resultMarkup(result){
   const p=result.perf,c=result.career,after=result.after||levelFor(c.xp),next=after.next;
   return `<div class="career-grade-card-v29 grade-${p.grade.toLowerCase()}-v29"><div class="career-grade-v29"><span>${p.grade}</span><small>SHIFT GRADE</small></div><div class="career-grade-copy-v29"><small>OWNER-OPERATOR PERFORMANCE</small><b>${p.total} / 100 CALL SCORE</b><p>${p.grade==='S'?'Complete professional call: strong evidence, disciplined diagnosis, field extras and clean scope.':p.grade==='A'?'Strong service call. A few optional field systems separate this from an S-grade run.':p.grade==='B'?'Solid closeout with room to improve documentation, diagnostics or field coverage.':p.grade==='C'?'Core work completed. Layer in the advanced tools and tighter evidence next shift.':'Call closed, but too much professional workflow was left on the table.'}</p></div></div><div class="career-breakdown-v29">${breakdownRow('Mobilize + check-in',p.mobilize,10,p.mobilize===10)}${breakdownRow('Accurate evidence',p.evidence,30,p.evidence===30)}${breakdownRow('Camera QA',p.camera,10,p.camera===10)}${breakdownRow('Cause + origin',p.diagnostic,10,p.diagnostic===10)}${breakdownRow('Thermal sweep',p.thermal,10,p.thermal===10)}${breakdownRow('Mechanical walkdown',p.mechanical,8,p.mechanical===8)}${breakdownRow('Scope QA',p.quote,12,p.quote===12)}${breakdownRow('Closeout',p.closeout,10,p.closeout===10)}</div><div class="career-xp-bank-v29"><span><small>CAREER XP</small><b>+${result.gained||0} XP BANKED</b></span><em>LV ${after.index+1} · ${after.title}</em>${next?`<i>${c.xp} / ${next.xp} XP</i>`:'<i>MAX RANK</i>'}</div>${result.levelUp?`<div class="career-levelup-v29">LEVEL UP · ${after.title}</div>`:''}${p.grade==='S'?'<div class="career-perfect-v29">★ PERFECT CALL BADGE UNLOCKED</div>':''}`;
  }
  function injectResult(result){
   const s=state(),body=$('sheetBody');if(!s.run?.complete||!body||body.querySelector('.career-closeout-v29'))return;
   const r=result||awardBurst||awardCareer();if(!r)return;const wrap=document.createElement('section');wrap.className='career-closeout-v29';wrap.innerHTML=resultMarkup(r);body.prepend(wrap);
  }
  function onStart(){base.onStart?.();lastScore=-1;lastGrade='';lastStamp='';awardBurst=null;ensureHUD();sync(true)}
  function recorded(f){base.recorded?.(f);sync(true)}
  function hudTick(){
   base.hud?.();const s=state(),r=s.run,stamp=[r?.id,r?.arrived,r?.talked,r?.onRoof,r?.v27Accessed,r?.complete,Object.keys(r?.findings||{}).length,r?.cameraQaV22?.banked,r?.diagnosticV20?.attempted,r?.diagnosticV20?.correct,r?.thermalV21?.complete,r?.mechanicalV24?.complete,r?.quoteV28?.score,s.photoMode,s.modal].join('|');
   if(stamp!==lastStamp){lastStamp=stamp;sync();setTimeout(()=>injectResult(),0)}
  }
  function finished(){
   base.finished?.();hud?.classList.add('hidden');awardBurst=awardCareer();if(awardBurst&&!awardBurst.already){api.chime?.(true);vibrate(awardBurst.levelUp?[12,18,12,18,12,34]:[10,22,10]);if(awardBurst.levelUp)setTimeout(()=>api.toast?.(`LEVEL UP · ${awardBurst.after.title}`),420)}
   setTimeout(()=>injectResult(awardBurst),0);
  }
  function frame(dt,t){base.frame?.(dt,t);if(hud&&!hud.classList.contains('hidden'))hud.style.setProperty('--career-pulse-v29',String(.5+.5*Math.sin(t*2.8)))}
  function garage(back){hud?.classList.add('hidden');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureHUD();const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V29={helpers:g.ROOFTOP_V29_HELPERS,readCareer,writeCareer,score:()=>scoreShift(state(),conditions),awardCareer,sync,state:()=>state()};}catch{}
  return {...base,onStart,recorded,hud:hudTick,finished,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
