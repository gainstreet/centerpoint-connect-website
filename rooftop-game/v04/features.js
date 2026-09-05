/* ROOFTOP 0.4 — quick play, garage, evidence feedback and score cards.
   Original, local-only assets. No registration, analytics or external services. */
'use strict';
(()=>{
 const build=window.buildRooftopWorld;
 window.buildRooftopWorld=function(renderer){
  const buffers=new WeakMap(),mesh=renderer.mesh;
  renderer.mesh=function(data,texture){const m=mesh.call(this,data,texture);buffers.set(m,{data:data.slice(),texture});return m};
  let world;try{world=build(renderer)}finally{renderer.mesh=mesh}
  // Discard hidden building-top faces below roof slabs. Avoid redundant geometry.
  const batch=world.nodes[0],base=buffers.get(batch.mesh),clean=[];
  for(let i=0;i<base.data.length;i+=33){const t=base.data.slice(i,i+33),hidden=t[4]>.99&&world.obstacles.some(o=>Math.abs(t[1]-(o.h-.3))<.001&&[0,11,22].every(k=>Math.abs(t[k]-o.x)<=o.w/2&&Math.abs(t[k+2]-o.z)<=o.d/2));if(!hidden)clean.push(...t)}
  const oldBatch=batch.mesh;batch.mesh=renderer.mesh(clean,base.texture);if(renderer.gl)renderer.gl.deleteBuffer(oldBatch.buffer);
  const source=buffers.get(world.vehicle.mesh),original=R3.color('#287286'),indices=[];
  for(let i=6;i<source.data.length;i+=11)if(original.every((v,j)=>Math.abs(v-source.data[i+j])<.00001))indices.push(i);
  world.setTruckPaint=hex=>{const data=source.data.slice(),c=R3.color(hex);for(const i of indices)for(let j=0;j<3;j++)data[i+j]=c[j];const next=renderer.mesh(data,source.texture),old=world.vehicle.mesh;world.vehicle.mesh=next;world.vehicle.paint=hex;if(renderer.gl&&old.buffer)renderer.gl.deleteBuffer(old.buffer)};
  const wings=[];for(const side of [-1,1]){const data=[];R3.quad(data,[side*.1,.3,0],[side*.7,.24,-.08],[side*.6,.22,-.38],[side*.13,.26,-.24],'#536e80');const wing=R3.node(renderer.mesh(data));world.bird.children.push(wing);wings.push(wing)}world.wings=wings;
  const ringData=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2,b=(i+.72)/24*Math.PI*2;R3.quad(ringData,[Math.cos(a)*1.9,0,Math.sin(a)*1.9],[Math.cos(a)*2.02,0,Math.sin(a)*2.02],[Math.cos(b)*2.02,0,Math.sin(b)*2.02],[Math.cos(b)*1.9,0,Math.sin(b)*1.9],'#dacd88')}world.guideRing=R3.node(renderer.mesh(ringData));world.guideRing.visible=false;world.nodes.push(world.guideRing);return world;
 };
 window.createRoofUpgrades=function(api){
  const $=id=>document.getElementById(id),{world,conditions,renderer}=api;
  const paints=[{id:'ocean',name:'Pacific Blue',hex:'#287286',price:0,score:0},{id:'chalk',name:'Fresh Start',hex:'#e0dfce',price:300,score:60},{id:'safety',name:'Overtime Orange',hex:'#c4773c',price:600,score:80},{id:'midnight',name:'After Hours',hex:'#273945',price:1000,score:100}];
  const current=()=>api.get(),rank=p=>p.best>=100?'ROOF BOSS':p.best>=80?'FIELD PRO':'ROOKIE OPERATOR';
  const paint=()=>paints.find(p=>p.id===current().profile.paint)||paints[0];
  let lastHud='',popTimer=0,pigeonRun='',downloadUrl=null;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  function truckSVG(hex){return `<svg viewBox="0 0 600 220" role="img" aria-label="Work pickup paint preview"><ellipse cx="305" cy="186" rx="246" ry="18" fill="#0b202e" opacity=".7"/><path d="M64 107H278V83L308 43H414L449 104H507L539 127V167H57Z" fill="${hex}" stroke="#101f2c" stroke-width="6"/><path d="M289 82L315 51H407L432 97H289Z" fill="#9fb5bb" stroke="#132b3a" stroke-width="5"/><path d="M357 50V162M282 94V166" stroke="#182d3c" stroke-width="5"/><path d="M73 112H261V143H73Z" fill="#132b3b" opacity=".7"/><path d="M274 163H448" stroke="#e5dec4" stroke-width="7"/><rect x="325" y="113" width="22" height="5" rx="2" fill="#d9e2d8"/><rect x="516" y="124" width="21" height="15" rx="3" fill="#ffe6a5"/><rect x="55" y="134" width="12" height="19" fill="#cb7452"/><path d="M90 111V34H263V103M87 33H389" fill="none" stroke="#abc1c3" stroke-width="8"/><path d="M60 18H405M60 28H405" stroke="#dab766" stroke-width="5"/><path d="M90 16V30M122 16V30M154 16V30M186 16V30M218 16V30M250 16V30M282 16V30M314 16V30M346 16V30M378 16V30" stroke="#dab766" stroke-width="4"/><circle cx="140" cy="168" r="37" fill="#182630" stroke="#0b1d28" stroke-width="6"/><circle cx="448" cy="168" r="37" fill="#182630" stroke="#0b1d28" stroke-width="6"/><circle cx="140" cy="168" r="19" fill="#9aaeb2"/><circle cx="448" cy="168" r="19" fill="#9aaeb2"/><circle cx="140" cy="168" r="7" fill="#324856"/><circle cx="448" cy="168" r="7" fill="#324856"/></svg>`}
  function applyPaint(){world.setTruckPaint(paint().hex)}
  function garage(back=null){
   const p=current().profile;
   api.show('MY GARAGE / '+rank(p),'Make it your truck.',`<div class="garage-truck">${truckSVG(paint().hex)}</div><div class="garage-balance"><b>${paint().name}</b><span>$${p.cash.toLocaleString()} available</span></div><p class="note">Earn an inspection score to unlock a finish, then buy it with fictional company cash. Your paint appears on the actual truck.</p><div id="paintOptions"></div>`,[{label:back?'BACK':'BACK TO GAME',secondary:true,fn:()=>back?back():api.close()}]);
   for(const item of paints){
    const owned=item.id==='ocean'||p.unlocked.includes(item.id),eligible=p.best>=item.score,selected=p.paint===item.id;
    const b=document.createElement('button');b.className='paint-option'+(selected?' selected':'');b.disabled=!owned&&(!eligible||p.cash<item.price);b.innerHTML=`<span class="paint-dot" style="background:${item.hex}"></span><span><strong>${item.name}</strong><small>${selected?'EQUIPPED':owned?'OWNED · TAP TO EQUIP':!eligible?'SCORE '+item.score+' TO UNLOCK':'BUY FOR $'+item.price}</small></span><span class="paint-state">${selected?'✓':owned?'→':!eligible?'◇':'$'}</span>`;
    b.onclick=()=>{if(!owned){if(p.best<item.score||p.cash<item.price)return;p.cash-=item.price;p.unlocked.push(item.id)}p.paint=item.id;applyPaint();api.saveProfile();api.updateStats();api.chime();garage(back);api.toast(item.name+' equipped. Your truck, your style.')};$('paintOptions').appendChild(b);
   }
  }
  function nextTarget(){const s=current();if(!s.run?.onRoof||s.run.complete)return null;return conditions.filter(f=>!s.run.findings[f.id]).sort((a,b)=>distance(a,s.player)-distance(b,s.player))[0]||null}
  function onStart(){lastHud='';applyPaint();$('evidencePop').classList.remove('show');document.body.classList.toggle('quick-run',!!current().run?.quick)}
  function recorded(){const n=Object.keys(current().run.findings).length;clearTimeout(popTimer);$('evidencePop').innerHTML=`<span>✓ EVIDENCE LOGGED</span><b>${n}<small> / 3</small></b><em>${n===3?'REPORT READY':'KEEP LOOKING'}</em>`;$('evidencePop').classList.remove('show');void $('evidencePop').offsetWidth;$('evidencePop').classList.add('show');popTimer=setTimeout(()=>$('evidencePop').classList.remove('show'),2100);$('cameraFlash').classList.add('flash');setTimeout(()=>$('cameraFlash').classList.remove('flash'),200)}
  function finished(){const p=current().profile,r=current().run;for(const badge of ['first-shift',...(r.score===100?['roof-boss']:[])])if(!p.badges.includes(badge))p.badges.push(badge);api.saveProfile();$('evidencePop').classList.remove('show')}
  function hud(){const s=current(),run=s.run;if(!run)return;const n=Object.keys(run.findings).length,nearest=nextTarget();$('rankPill').textContent=rank(s.profile);$('rankPill').classList.toggle('hidden',s.photoMode||s.modal);const stamp=[run.onRoof,s.photoMode,s.modal,run.complete,n,nearest?.id].join('|');if(lastHud===stamp)return;lastHud=stamp;$('nextDetail').classList.toggle('hidden',!run.onRoof||s.photoMode||s.modal||run.complete);$('nextDetail').innerHTML=n===3?'<b>3 / 3</b><span>ALL SET. OPEN YOUR REPORT.</span>':`<b>${n} / 3</b><span>${nearest?'NEXT: '+nearest.title.toUpperCase():'REPORT READY'}</span>`;}
  function frame(dt,t){const s=current(),near=s.started&&s.run?.onRoof&&distance(s.player,world.bird)<4;for(let i=0;i<world.wings.length;i++)world.wings[i].rz=Math.sin(t*(near?18:2))*(near?.52:.035)*(i===0?1:-1);if(near&&pigeonRun!==s.run.id){pigeonRun=s.run.id;if(!s.profile.badges.includes('quality-control')){s.profile.badges.push('quality-control');api.saveProfile()}api.toast('Quality control says: “Coo. Needs more photos.”')}
   const f=nextTarget();world.guideRing.visible=!!(s.started&&s.run?.quick&&f&&!s.photoMode&&!s.run.complete);if(f){world.guideRing.x=f.x;world.guideRing.y=world.roofY+.045;world.guideRing.z=f.z;world.guideRing.yaw=t*.12}
  }
  function photoBlocked(eye,target){for(let i=0;i<20;i++){const t=i/20,x=eye[0]+(target[0]-eye[0])*t,y=eye[1]+(target[1]-eye[1])*t,z=eye[2]+(target[2]-eye[2])*t;if(y<world.roofY+1.95&&world.roofBlocks.slice(0,4).some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2))return true}return false}
  async function scoreCard(){
   const {run,profile}=current();if(!run?.complete)return;
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const g=canvas.getContext('2d');g.fillStyle='#142b3d';g.fillRect(0,0,1080,1350);
   g.fillStyle='#f0d265';g.fillRect(64,65,65,7);g.font='800 20px sans-serif';g.fillText('CENTERPOINT CONNECT / FIELD NOTES',64,121);g.fillStyle='#f5f1da';g.font='italic 900 125px sans-serif';g.fillText('ROOFTOP',57,250);g.fillStyle='#b3c4ca';g.font='700 24px sans-serif';g.fillText('OWNER OPERATOR',66,300);
   const shot=api.photos.get('seam')||[...api.photos.values()][0];if(shot){try{const image=new Image();image.src=shot;await image.decode();g.drawImage(image,64,348,952,425);g.fillStyle='rgba(15,36,50,.13)';g.fillRect(64,348,952,425)}catch{}}
   g.fillStyle='#f0d265';g.font='italic 900 200px sans-serif';g.fillText(String(run.score),59,987);g.fillStyle='#b3c4ca';g.font='800 44px sans-serif';g.fillText('/ 100',470,974);g.fillStyle='#f5f1da';g.font='800 29px sans-serif';g.fillText(rank(profile),66,1050);g.font='26px sans-serif';g.fillStyle='#d7e0df';g.fillText('Three roof details. Three calls to make.',66,1110);g.fillStyle='#f0d265';g.fillRect(64,1163,952,2);g.font='800 25px sans-serif';g.fillText('THINK YOU CAN RUN A ROOFING COMPANY?',66,1220);g.fillStyle='#b3c4ca';g.font='19px sans-serif';g.fillText('Play ROOFTOP in your browser. No download. No sign-up.',66,1265);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob){api.toast('The score image could not be created. Use Share Your Score instead.');return}
   if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(blob);const url=downloadUrl;
   api.show('YOUR SCORE CARD','Roofers keep receipts.',`<img class="score-card-preview" src="${url}" alt="ROOFTOP score card showing ${run.score} out of 100"><p class="note">Save the image or share it with the game link. No score is uploaded to a server.</p>`,[{label:'SAVE IMAGE',fn:()=>{const a=document.createElement('a');a.href=url;a.download='rooftop-score-'+run.score+'.png';document.body.appendChild(a);a.click();a.remove()}},{label:'SHARE IMAGE + LINK',secondary:true,fn:async()=>{const file=new File([blob],'rooftop-score.png',{type:'image/png'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'ROOFTOP: '+run.score+'/100',text:'I scored '+run.score+'/100. Your turn: '+location.href.split('?')[0]});return}}catch(e){if(e.name==='AbortError')return}api.toast('Image sharing is unavailable in this browser. Use SAVE IMAGE, then Share Your Score for the link.')}},{label:'BACK TO RESULTS',secondary:true,fn:api.results}]);
  }
  const p=current().profile;if(!paints.some(x=>x.id===p.paint))p.paint='ocean';if(p.paint!=='ocean'&&!p.unlocked.includes(p.paint))p.paint='ocean';
  applyPaint();$('quickStart').disabled=false;$('quickStart').onclick=()=>api.start(false,true);$('garageEntry').disabled=false;$('garageEntry').onclick=()=>garage();
  return {onStart,recorded,finished,hud,frame,nextTarget,photoBlocked,garage,scoreCard};
 };
})();
