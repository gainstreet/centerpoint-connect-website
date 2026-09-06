/* ROOFTOP 0.9 — evidence-camera coaching and photo documentation quality. */
'use strict';
(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function gradePhotoMetrics(m={}){
  const contrast=clamp(Number(m.contrast)||0,0,80),edge=clamp(Number(m.edge)||0,0,45),center=clamp(Number(m.center)||0,0,2),exposure=clamp(Number(m.exposure)||0,0,1);
  const score=clamp(Math.round((contrast/42)*31+(edge/23)*31+(center/1.12)*22+exposure*16),0,100);
  const stars=score>=76?3:score>=48?2:1;
  return {score,stars,contrast:Math.round(clamp(contrast/42,0,1)*100),detail:Math.round(clamp(edge/23,0,1)*100),framing:Math.round(clamp(center/1.12,0,1)*100),exposure:Math.round(exposure*100)};
 }
 window.ROOFTOP_PHOTO_QA={gradePhotoMetrics};
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{conditions}=api;
  let coach=null,observer=null,lastStamp='',analysisToken=0,pending={};
  function ensureProfile(){const p=state().profile;if(!Number.isFinite(p.photoSets))p.photoSets=0;if(!Array.isArray(p.badges))p.badges=[];return p}
  function ensureRun(){const r=state().run;if(!r)return null;if(!r.photoV9||r.photoV9.version!==1)r.photoV9={version:1,grades:{},awarded:false};if(!r.photoV9.grades||typeof r.photoV9.grades!=='object')r.photoV9.grades={};return r.photoV9}
  function stars(n){return '★'.repeat(n)+'☆'.repeat(3-n)}
  function buzz(pattern){try{navigator.vibrate?.(pattern)}catch{}}
  function nearestCondition(){const s=state();if(!s.player)return null;let best=null;for(const f of conditions){const d=Math.hypot(s.player.x-f.x,s.player.z-f.z);if(!best||d<best.d)best={...f,d}}return best}
  function ensureCoach(){if(coach)return coach;coach=document.createElement('div');coach.id='photoCoach';coach.className='photo-coach hidden';coach.innerHTML='<div class="photo-coach-top"><span>FIELD EVIDENCE CAMERA</span><b id="photoCoachSubject">ROOF DETAIL</b></div><div class="photo-thirds"><i></i><i></i><i></i><i></i><div class="photo-focus-box"><span>+</span></div></div><div class="photo-coach-bottom"><span id="photoCoachDistance">STANDOFF —</span><b>SHOW THE CONDITION + SURROUNDING ROOF</b></div>';document.getElementById('hud')?.appendChild(coach);return coach}
  function syncCoach(){ensureCoach();const s=state(),show=!!(s.started&&s.photoMode&&!s.modal&&!s.run?.complete);coach.classList.toggle('hidden',!show);if(!show)return;const n=nearestCondition();if(!n)return;const good=n.d>=1.4&&n.d<=3.5;$('photoCoachSubject').textContent=n.title.toUpperCase();$('photoCoachDistance').textContent=(good?'✓ ':'△ ')+n.d.toFixed(1)+'m STANDOFF';coach.classList.toggle('good',good)}
  async function analyze(src){
   const image=new Image();image.src=src;try{if(image.decode)await image.decode();else await new Promise((ok,no)=>{image.onload=ok;image.onerror=no})}catch{return gradePhotoMetrics({contrast:20,edge:10,center:.8,exposure:.8})}
   const c=document.createElement('canvas');c.width=96;c.height=54;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return gradePhotoMetrics({contrast:20,edge:10,center:.8,exposure:.8});g.drawImage(image,0,0,c.width,c.height);let d;try{d=g.getImageData(0,0,c.width,c.height).data}catch{return gradePhotoMetrics({contrast:20,edge:10,center:.8,exposure:.8})}
   const lum=new Float32Array(c.width*c.height);let sum=0,valid=0;for(let i=0,p=0;i<d.length;i+=4,p++){const y=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];lum[p]=y;sum+=y;if(y>18&&y<242)valid++}const mean=sum/lum.length;let variance=0,edges=0,centerEdges=0,centerN=0,totalN=0;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=y*c.width+x,q=lum[i];variance+=(q-mean)*(q-mean);if(x<c.width-1&&y<c.height-1){const e=(Math.abs(q-lum[i+1])+Math.abs(q-lum[i+c.width]))*.5;edges+=e;totalN++;if(x>c.width*.24&&x<c.width*.76&&y>c.height*.22&&y<c.height*.78){centerEdges+=e;centerN++}}}
   const contrast=Math.sqrt(variance/lum.length),edge=edges/Math.max(1,totalN),centerAvg=centerEdges/Math.max(1,centerN),overall=edge||1,center=centerAvg/overall,exposure=valid/lum.length;
   return gradePhotoMetrics({contrast,edge,center,exposure});
  }
  function photoCondition(){const tag=($('sheetTag')?.textContent||'').toUpperCase();return conditions.find(f=>tag.includes(f.title.toUpperCase()))||nearestCondition()}
  function qaMarkup(q){const label=q.stars===3?'STRONG DOCUMENTATION':q.stars===2?'USABLE EVIDENCE':'RETAKE RECOMMENDED';return `<div class="photo-qa-card grade-${q.stars}"><div class="photo-grade-head"><span>PHOTO QA / ${label}</span><b>${stars(q.stars)}</b></div><div class="photo-grade-bars"><label>FRAMING <i><em style="width:${q.framing}%"></em></i><b>${q.framing}</b></label><label>DETAIL <i><em style="width:${q.detail}%"></em></i><b>${q.detail}</b></label><label>LIGHT <i><em style="width:${q.exposure}%"></em></i><b>${q.exposure}</b></label></div><p>${q.stars===3?'The condition reads clearly and there is enough surrounding roof for context.':q.stars===2?'This works, but a cleaner angle or more context could strengthen the record.':'Use RETAKE PHOTO. Step back slightly and keep the condition plus surrounding membrane visible.'}</p></div>`}
  async function injectCaptureQA(){
   const body=$('sheetBody'),tag=$('sheetTag'),img=body?.querySelector('.evidence-img');if(!body||!tag||!img||!tag.textContent.startsWith('PHOTO CAPTURED')||body.querySelector('.photo-qa-card'))return;
   const f=photoCondition();if(!f)return;const token=++analysisToken;const loading=document.createElement('div');loading.className='photo-qa-loading';loading.textContent='ANALYZING EVIDENCE…';img.insertAdjacentElement('afterend',loading);const q=await analyze(img.src);if(token!==analysisToken||!loading.isConnected)return;pending[f.id]=q;loading.outerHTML=qaMarkup(q);buzz(q.stars===3?[10,20,10]:q.stars===1?25:10);
  }
  function injectReportGrades(){
   const body=$('sheetBody');if(!body||!body.querySelector('.report-row'))return;const x=ensureRun();if(!x)return;for(const row of body.querySelectorAll('.report-row')){if(row.querySelector('.evidence-grade'))continue;const title=row.querySelector('h3')?.textContent||'',f=conditions.find(c=>title.includes(c.title));if(!f)continue;const q=x.grades[f.id];if(!q)continue;const badge=document.createElement('span');badge.className='evidence-grade grade-'+q.stars;badge.textContent=stars(q.stars)+' PHOTO QA';row.querySelector('div')?.appendChild(badge)}
  }
  function injectResult(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x||!body||body.querySelector('.photo-result-card'))return;const qs=Object.values(x.grades);if(!qs.length)return;const avg=qs.reduce((a,q)=>a+q.score,0)/qs.length,star=Math.max(1,Math.min(3,Math.round(qs.reduce((a,q)=>a+q.stars,0)/qs.length)));const card=document.createElement('div');card.className='photo-result-card grade-'+star;card.innerHTML=`<span><small>EVIDENCE QUALITY</small><strong>${stars(star)} · ${Math.round(avg)} / 100</strong></span><b>${qs.length} PHOTO${qs.length===1?'':'S'}</b>`;body.prepend(card)
  }
  function rewardIfReady(){
   const s=state(),x=ensureRun(),p=ensureProfile();if(!x||x.awarded)return;const ids=conditions.map(f=>f.id);if(!ids.every(id=>x.grades[id]?.stars>=2))return;x.awarded=true;p.rep=clamp((Number(p.rep)||0)+1,0,100);p.photoSets+=1;if(!p.badges.includes('documentation-pro'))p.badges.push('documentation-pro');api.saveProfile();api.save();api.updateStats();api.chime();buzz([12,24,12,24,42]);setTimeout(()=>api.toast('DOCUMENTATION PRO · Three usable evidence photos · +1 reputation'),220)
  }
  function recorded(f){base.recorded?.(f);const x=ensureRun();if(!x||!f)return;const q=pending[f.id]||x.grades[f.id]||gradePhotoMetrics({contrast:22,edge:12,center:.9,exposure:.85});x.grades[f.id]=q;delete pending[f.id];api.save();rewardIfReady();setTimeout(()=>{injectReportGrades();injectResult()},0)}
  function onStart(){base.onStart?.();ensureProfile();ensureRun();pending={};ensureCoach();syncCoach();setTimeout(()=>{injectCaptureQA();injectReportGrades();injectResult()},0)}
  function finished(){base.finished?.();ensureProfile();ensureRun();rewardIfReady();syncCoach();setTimeout(injectResult,0)}
  function hud(){base.hud?.();const s=state(),x=ensureRun();if(!x)return;const stamp=[s.run?.id,s.photoMode,s.modal,s.run?.complete,Object.keys(x.grades).length].join('|');if(stamp!==lastStamp){lastStamp=stamp;syncCoach();setTimeout(()=>{injectCaptureQA();injectReportGrades();injectResult()},0)}}
  function frame(dt,t){base.frame?.(dt,t);if(coach&&!coach.classList.contains('hidden'))coach.style.setProperty('--coach-pulse',String(.5+.5*Math.sin(t*4.2)))}
  function garage(back){return base.garage?.(back)}function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureProfile();ensureRun();ensureCoach();
  const sheet=$('sheet');if(sheet&&window.MutationObserver){observer=new MutationObserver(()=>{injectCaptureQA();injectReportGrades();injectResult()});observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V9={gradePhotoMetrics,analyze,ensureRun,rewardIfReady,state:()=>state()}}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked};
 };
})();
