/* ROOFTOP 0.28 — follow-up scope + quote builder. */
'use strict';
((g)=>{
 const BONUS=100;
 const ITEMS=[
  {id:'drain',code:'01',title:'Drain maintenance',detail:'Clear obstruction · verify drainage path',amount:325,required:true},
  {id:'seam',code:'02',title:'Localized TPO seam repair',detail:'Prep + heat-weld the open lap',amount:950,required:true},
  {id:'investigate',code:'03',title:'Leak-source investigation',detail:'Trace reported interior water before naming cause',amount:475,required:true},
  {id:'patch',code:'04',title:'Replace existing patch',detail:'Remove + replace the sound prior repair',amount:725,required:false}
 ];
 const REQUIRED=ITEMS.filter(x=>x.required).map(x=>x.id);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const totalFor=ids=>{const set=new Set(ids||[]);return ITEMS.reduce((n,x)=>n+(set.has(x.id)?x.amount:0),0)};
 const evaluate=ids=>{
  const set=new Set(ids||[]),missing=REQUIRED.filter(id=>!set.has(id)),unnecessary=set.has('patch')?['patch']:[];
  const score=clamp(100-missing.length*25-unnecessary.length*35,0,100);
  return {selected:[...set],missing,unnecessary,score,correct:score===100,total:totalFor(set),bonus:score===100?BONUS:0};
 };
 g.ROOFTOP_V28_HELPERS={BONUS,ITEMS,REQUIRED,totalFor,evaluate};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get();
  let observer=null,status=null,lastReady=false;

  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.quoteV28||r.quoteV28.version!==1)r.quoteV28={version:1,attempted:false,selected:[],total:0,score:0,correct:false,bonus:0,applied:false};
   return r.quoteV28;
  }
  function ready(){const s=state();return !!(s.started&&s.run?.onRoof&&!s.run?.complete&&Object.keys(s.run?.findings||{}).length>=3)}
  function vibrate(p){try{navigator.vibrate?.(p)}catch{}}
  function money(n){return '$'+Math.round(Number(n)||0).toLocaleString()}

  function ensureStatus(){
   const rail=$('missionFlowV27');if(!rail)return null;
   if(status&&status.isConnected)return status;
   status=document.createElement('div');status.id='quoteStatusV28';status.className='quote-status-v28 hidden';
   status.innerHTML='<span>FOLLOW-UP QUOTE</span><b id="quoteStatusTextV28">—</b><em id="quoteStatusScoreV28">—</em>';
   rail.appendChild(status);return status;
  }
  function ensureQuickHook(){
   const q=$('missionQuickV27');if(!q||q.dataset.v28QuoteHook==='1')return;
   q.dataset.v28QuoteHook='1';
   q.addEventListener('click',e=>{
    const s=state(),x=ensureRun();
    if(ready()&&x&&!x.attempted&&!s.modal&&!s.photoMode){e.preventDefault();e.stopImmediatePropagation();openQuote()}
   },true);
  }
  function lineMarkup(x){
   return `<button type="button" class="quote-line-v28" data-quote-item="${x.id}" aria-pressed="false"><span class="quote-code-v28">${x.code}</span><span class="quote-line-copy-v28"><b>${x.title}</b><small>${x.detail}</small></span><em>${money(x.amount)}</em><i>+</i></button>`;
  }
  function builderMarkup(){
   return `<div class="quote-board-v28"><div class="quote-head-v28"><div><small>CLIENT / WESTGATE PLAZA</small><b>FOLLOW-UP WORK ORDER</b></div><span>FIELD ESTIMATE</span></div><p class="quote-brief-v28">Build only what the evidence supports. Not every observed condition belongs in a repair scope.</p><div class="quote-lines-v28">${ITEMS.map(lineMarkup).join('')}</div><div class="quote-total-v28"><span><small>SELECTED SCOPE</small><b id="quoteCountV28">0 LINE ITEMS</b></span><em id="quoteTotalV28">$0</em></div><p class="note">Game pricing is fictional and simplified. Scope judgment is the challenge.</p></div>`;
  }
  function updateBuilder(selected){
   const total=totalFor(selected),count=selected.size;
   const a=$('quoteTotalV28'),b=$('quoteCountV28');if(a)a.textContent=money(total);if(b)b.textContent=count+' LINE ITEM'+(count===1?'':'S');
   document.querySelectorAll('[data-quote-item]').forEach(el=>{const on=selected.has(el.dataset.quoteItem);el.classList.toggle('selected-v28',on);el.setAttribute('aria-pressed',on?'true':'false');const i=el.querySelector('i');if(i)i.textContent=on?'✓':'+'});
  }
  function openQuote(){
   const x=ensureRun(),s=state();if(!x||!ready()||s.run?.complete)return;
   if(x.attempted){showResult(evaluate(x.selected));return}
   const selected=new Set();
   api.show('ESTIMATING / WESTGATE','Turn the roof evidence into a clean scope.',builderMarkup(),[
    {label:'SUBMIT FOLLOW-UP QUOTE →',fn:()=>{if(!selected.size){api.toast?.('Choose at least one supported line item.');vibrate(12);return}submitQuote([...selected])}},
    {label:'BACK TO ROOF',secondary:true,fn:api.close}
   ]);
   document.querySelectorAll('[data-quote-item]').forEach(el=>el.onclick=()=>{const id=el.dataset.quoteItem;if(selected.has(id))selected.delete(id);else selected.add(id);updateBuilder(selected);vibrate(5)});
   updateBuilder(selected);vibrate(8);
  }
  function resultMarkup(out){
   const selected=ITEMS.filter(x=>out.selected.includes(x.id));
   const rows=selected.map(x=>`<div class="quote-result-row-v28"><span>${x.code}</span><div><b>${x.title}</b><small>${x.detail}</small></div><em>${money(x.amount)}</em></div>`).join('')||'<p class="note">No scope selected.</p>';
   const miss=out.missing.length?`<p class="quote-coach-v28">Missing supported scope: ${out.missing.map(id=>ITEMS.find(x=>x.id===id)?.title).join(', ')}.</p>`:'';
   const extra=out.unnecessary.length?'<p class="quote-coach-v28 warn-v28">The existing patch was documented as sound. Replacing it added unsupported work and weakened trust.</p>':'';
   return `<div class="quote-result-v28 ${out.correct?'clean-v28':'review-v28'}"><div class="quote-score-v28"><span>${out.score}</span><small>SCOPE QA</small></div><div><small>FOLLOW-UP PIPELINE</small><b>${money(out.total)}</b><p>${out.correct?'Clean scope: maintain the drain, repair the open seam, and investigate the reported leak source without selling an unnecessary patch replacement.':'The quote can still go out, but the scope does not fully match the evidence.'}</p></div></div><div class="quote-result-lines-v28">${rows}</div>${miss}${extra}<div class="quote-result-foot-v28"><span>${out.correct?'✓ CLEAN SCOPE':'△ REVIEW SCOPE'}</span><b>${out.correct?money(BONUS)+' ESTIMATING BONUS BANKED':'CORE INSPECTION PAY SAFE'}</b></div>`;
  }
  function showResult(out){
   api.show('QUOTE READY / WESTGATE',out.correct?'Clean scope. No invented work.':'Scope needs tighter judgment.',resultMarkup(out),[
    {label:'RETURN TO FIELD REPORT',fn:()=>{api.close();api.toast?.(`QUOTE READY · ${money(out.total)} pipeline · ${out.score}/100 scope QA`)}},
    {label:'VIEW SCOPE AGAIN',secondary:true,fn:()=>showResult(out)}
   ]);
  }
  function submitQuote(ids){
   const x=ensureRun();if(!x||x.attempted)return;const out=evaluate(ids);
   x.attempted=true;x.selected=out.selected;x.total=out.total;x.score=out.score;x.correct=out.correct;x.bonus=out.bonus;api.save?.();api.chime?.(out.score>=75);vibrate(out.correct?[12,24,12,24,42]:[18,34,18]);showResult(out);sync(true);
  }
  function applyReward(){
   const s=state(),r=s.run,p=s.profile,x=ensureRun();if(!r||!p||!x||x.applied||!x.correct)return;
   x.applied=true;p.cash=(Number(p.cash)||0)+BONUS;p.rep=Math.min(100,(Number(p.rep)||0)+2);r.pay=(Number(r.pay)||0)+BONUS;
   if(!Array.isArray(p.badges))p.badges=[];if(!p.badges.includes('clean-scope'))p.badges.push('clean-scope');
   api.saveProfile?.();api.save?.();api.updateStats?.();api.chime?.();vibrate([10,20,10,20,38]);
  }
  function injectResult(){
   const s=state(),x=ensureRun(),body=$('sheetBody');if(!s.run?.complete||!x?.attempted||!body||body.querySelector('.quote-closeout-v28'))return;
   const card=document.createElement('div');card.className='quote-closeout-v28 '+(x.correct?'clean-v28':'review-v28');
   card.innerHTML=`<span>FOLLOW-UP QUOTE</span><b>${x.correct?'✓ CLEAN SCOPE':'△ SCOPE REVIEW'}</b><em>${money(x.total)} PIPELINE · ${x.score}/100${x.correct?' · +$'+BONUS:''}</em>`;body.prepend(card);
  }
  function sync(force=false){
   ensureQuickHook();ensureStatus();const s=state(),run=s.run,x=ensureRun(),isReady=ready(),rail=$('missionFlowV27'),q=$('missionQuickV27');
   if(!x||!rail)return;
   rail.classList.toggle('quote-ready-v28',isReady&&!x.attempted);
   if(isReady&&!x.attempted){
    const title=$('missionNavTitleV27'),meta=$('missionNavMetaV27');if(title)title.textContent='BUILD FOLLOW-UP SCOPE';if(meta)meta.textContent='QUOTE · Turn evidence into a clean work order';
    if(q){q.textContent='BUILD QUOTE';q.classList.remove('hidden')}
    status?.classList.add('hidden');
   }else if(isReady&&x.attempted){
    status?.classList.remove('hidden');const a=$('quoteStatusTextV28'),b=$('quoteStatusScoreV28');if(a)a.textContent=money(x.total)+' PIPELINE';if(b)b.textContent=x.score+'/100 QA';
    const title=$('missionNavTitleV27'),meta=$('missionNavMetaV27');if(title)title.textContent='CLOSE OUT THE CALL';if(meta)meta.textContent='Quote ready · submit the Field Report';
   }else status?.classList.add('hidden');
   if(force&&rail){rail.classList.remove('quote-pop-v28');void rail.offsetWidth;rail.classList.add('quote-pop-v28')}
   if(isReady&&!lastReady&&!x.attempted){lastReady=true;setTimeout(()=>{if(ready()&&!ensureRun()?.attempted)api.toast?.('FOLLOW-UP QUOTE UNLOCKED · Build the scope before closeout.')},900)}else if(!isReady)lastReady=false;
   setTimeout(injectResult,0);
  }
  function onStart(){base.onStart?.();ensureRun();ensureQuickHook();ensureStatus();sync()}
  function recorded(f){base.recorded?.(f);sync(true)}
  function finished(){base.finished?.();applyReward();sync();setTimeout(injectResult,0)}
  function hud(){base.hud?.();sync()}
  function frame(dt,t){base.frame?.(dt,t)}
  function garage(back){status?.classList.add('hidden');return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  ensureQuickHook();ensureStatus();
  const sheet=$('sheet');if(sheet&&g.MutationObserver){observer=new MutationObserver(()=>injectResult());observer.observe(sheet,{childList:true,subtree:true})}
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V28={evaluate,totalFor,ensureRun,openQuote,submitQuote,sync,state:()=>state()};}catch{}
  return {...base,onStart,recorded,finished,hud,frame,garage,scoreCard,nextTarget,photoBlocked,openQuote};
 };
})(typeof window!=='undefined'?window:globalThis);
