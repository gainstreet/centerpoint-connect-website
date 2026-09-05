/* ROOFTOP 0.6 — post-inspection quote desk, contract decisions and career stats. */
'use strict';
(()=>{
 const previous=window.createRoofUpgrades;
 if(typeof previous!=='function')return;
 window.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id);
  const strategies=[
   {id:'competitive',name:'Competitive Bid',mult:.82,chance:.86,margin:'LEAN MARGIN',rep:1,copy:'Price to land the relationship. Strong win rate, smaller upside.'},
   {id:'balanced',name:'Balanced Bid',mult:1,chance:.70,margin:'HEALTHY MARGIN',rep:2,copy:'Fair scope, fair margin, good close probability.'},
   {id:'premium',name:'Premium Service',mult:1.34,chance:.44,margin:'PREMIUM MARGIN',rep:3,copy:'Higher-touch service at a higher price. Harder close, better upside.'}
  ];
  let lastRun='',careerStamp='';
  const state=()=>api.get();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function ensureProfile(){
   const p=state().profile;
   if(!Number.isFinite(p.contracts))p.contracts=0;
   if(!Number.isFinite(p.bids))p.bids=0;
   if(!Number.isFinite(p.contractValue))p.contractValue=0;
   if(!Array.isArray(p.badges))p.badges=[];
   return p;
  }
  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.quoteV6||r.quoteV6.version!==1)r.quoteV6={version:1,resolved:false,accepted:false,strategy:'',price:0,deposit:0,roll:null,applied:false};
   return r.quoteV6;
  }
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296}
  function scope(){
   const r=state().run;if(!r)return [];
   const out=[];
   if(r.findings?.drain?.rec==='maintenance')out.push('Drain cleaning & drainage maintenance');
   if(r.findings?.seam?.rec==='repair')out.push('Targeted membrane seam repair');
   if(r.findings?.drain?.rec==='investigate'||r.findings?.seam?.rec==='investigate')out.push('Focused leak-source investigation');
   if(r.findings?.patch?.rec==='monitor')out.push('Document existing patch for monitoring');
   if(!out.length)out.push('Follow-up site review based on field report');
   return out;
  }
  function basePrice(){
   const s=scope();let value=650;
   for(const item of s)value+=item.includes('seam')?650:item.includes('Drain')?350:item.includes('investigation')?500:150;
   return Math.round(value/50)*50;
  }
  function money(v){return '$'+Math.round(v).toLocaleString()}
  function career(){
   const p=ensureProfile(),stamp=[p.contracts,p.rep,p.best].join('|');
   let el=$('careerStrip');
   if(!el){el=document.createElement('div');el.id='careerStrip';el.className='career-strip';document.querySelector('#titleScreen .title-copy')?.appendChild(el)}
   let pill=$('contractPill');
   if(!pill){pill=document.createElement('div');pill.id='contractPill';pill.className='contract-pill';document.getElementById('hud')?.appendChild(pill)}
   if(stamp===careerStamp)return;careerStamp=stamp;
   if(el)el.innerHTML=`<span><b>${p.contracts}</b> CONTRACT${p.contracts===1?'':'S'} WON</span><span><b>${p.rep}</b> REPUTATION</span><span><b>${p.best}</b> BEST SCORE</span>`;
   if(pill)pill.textContent=p.contracts+' CONTRACT'+(p.contracts===1?'':'S')+' WON';
  }
  function quoteSummary(){
   const r=state().run,q=ensureRun();if(!r||!q||r.score<70)return;
   const body=$('sheetBody'),actions=$('sheetActions');if(!body||!actions)return;
   if(body.querySelector?.('.quote-result-card')||actions.querySelector?.('[data-quote-action]'))return;
   const card=document.createElement('div');card.className='quote-result-card';
   if(q.resolved){
    card.innerHTML=q.accepted?`<div><small>FOLLOW-UP CONTRACT</small><strong>ACCEPTED · ${money(q.price)}</strong><span>${money(q.deposit)} mobilization deposit added to company cash.</span></div><b>✓ WON</b>`:`<div><small>FOLLOW-UP CONTRACT</small><strong>NOT AWARDED · ${money(q.price)}</strong><span>The client passed on this proposal. The inspection revenue is still yours.</span></div><b>↗ NEXT</b>`;
    body.prepend(card);
   }else{
    card.innerHTML='<div><small>NEW OPPORTUNITY</small><strong>Jordan asked for a repair quote.</strong><span>Turn your inspection into a contract.</span></div><b>+$</b>';
    body.prepend(card);
    const b=document.createElement('button');b.className='primary quote-action';b.dataset.quoteAction='1';b.textContent='BUILD FOLLOW-UP QUOTE →';b.onclick=quoteDesk;actions.prepend(b);
   }
  }
  function quoteDesk(){
   const s=state(),r=s.run,p=ensureProfile(),q=ensureRun();if(!r||r.score<70){api.toast('Earn a solid inspection score before quoting follow-up work.');return}
   if(q.resolved){quoteResult();return}
   const items=scope(),baseValue=basePrice();
   api.show('QUOTE DESK / WESTGATE','Turn the inspection into work.',`<div class="quote-brief"><small>FIELD-VERIFIED SCOPE</small>${items.map(x=>`<p>✓ ${x}</p>`).join('')}<span>Choose how you want to price the opportunity. These are fictional game values.</span></div><div id="quoteOptions" class="quote-options"></div><p class="note">Win probability reflects this fictional client, your reputation, and inspection quality. Real roofing pricing requires actual estimating.</p>`,[{label:'BACK TO RESULTS',secondary:true,fn:api.results}]);
   const holder=$('quoteOptions');if(!holder)return;
   for(const item of strategies){
    const price=Math.round(baseValue*item.mult/50)*50,qualityBoost=clamp((r.score-70)*.0025,0,.075),repBoost=clamp((p.rep-50)*.003,-.12,.12),chance=clamp(item.chance+qualityBoost+repBoost,.18,.96),deposit=Math.round(price*.1/25)*25;
    const b=document.createElement('button');b.className='quote-option';b.innerHTML=`<span><strong>${item.name}</strong><small>${item.copy}</small></span><span class="quote-numbers"><b>${money(price)}</b><em>${Math.round(chance*100)}% CLIENT FIT</em><i>${item.margin}</i></span>`;
    b.onclick=()=>resolve(item,price,deposit,chance);holder.appendChild(b);
   }
  }
  function resolve(item,price,deposit,chance){
   const s=state(),r=s.run,p=ensureProfile(),q=ensureRun();if(!r||!q||q.resolved)return;
   const roll=hash(r.id+'|'+item.id+'|quote-v6'),accepted=roll<chance;
   q.resolved=true;q.accepted=accepted;q.strategy=item.id;q.price=price;q.deposit=accepted?deposit:0;q.roll=roll;
   p.bids+=1;
   if(accepted&&!q.applied){q.applied=true;p.contracts+=1;p.contractValue+=price;p.cash+=deposit;p.rep=clamp(p.rep+item.rep,0,100);if(!p.badges.includes('first-contract'))p.badges.push('first-contract')}
   if(!accepted&&!q.applied){q.applied=true;if(item.id==='premium')p.rep=clamp(p.rep-1,0,100)}
   if(!p.badges.includes('first-bid'))p.badges.push('first-bid');
   api.saveProfile();api.save();api.updateStats();career();api.chime(accepted);
   try{if(navigator.vibrate)navigator.vibrate(accepted?[25,45,25,45,60]:[45,65,45])}catch{}
   quoteResult();
  }
  function quoteResult(){
   const q=ensureRun();if(!q?.resolved)return quoteDesk();
   const item=strategies.find(x=>x.id===q.strategy)||strategies[1];
   const body=q.accepted?`<div class="contract-stamp won">CONTRACT AWARDED</div><div class="contract-total"><span>FOLLOW-UP VALUE</span><b>${money(q.price)}</b></div><p>Jordan accepted the <strong>${item.name}</strong>. A fictional ${money(q.deposit)} mobilization deposit has been added to company cash.</p><p class="note">You still have to deliver the work. Future versions can turn awarded contracts into crew, material and scheduling missions.</p>`:`<div class="contract-stamp lost">NOT AWARDED</div><div class="contract-total"><span>YOUR BID</span><b>${money(q.price)}</b></div><p>The client passed on the <strong>${item.name}</strong>. You keep the inspection revenue and can chase the next opportunity.</p><p class="note">Commercial roofing owners do not win every bid. The game intentionally keeps contract outcomes separate from inspection quality.</p>`;
   api.show('CLIENT RESPONSE / WESTGATE',q.accepted?'You won the work.':'Not every quote closes.',body,[{label:'BACK TO SHIFT RESULTS',fn:api.results},{label:'PLAY ANOTHER SHIFT',secondary:true,fn:()=>{api.close();api.start(false,false)}}]);
  }
  function onStart(){base.onStart?.();lastRun=state().run?.id||'';ensureProfile();ensureRun();career()}
  function finished(){base.finished?.();ensureProfile();ensureRun();career();setTimeout(quoteSummary,0)}
  function hud(){base.hud?.();const s=state();if(s.run?.id!==lastRun){lastRun=s.run?.id||'';ensureRun()}career()}
  function garage(back){return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}
  function nextTarget(){return base.nextTarget?.()}
  function photoBlocked(eye,target){return base.photoBlocked?.(eye,target)||false}
  career();
  try{if(new URLSearchParams(location.search).has('qa'))window.__ROOFTOP_V6={quoteDesk,state:()=>state(),quoteSummary};}catch{}
  return {...base,onStart,finished,hud,garage,scoreCard,nextTarget,photoBlocked,quoteDesk};
 };
})();
