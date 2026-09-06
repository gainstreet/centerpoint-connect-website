/* ROOFTOP 0.16 — tactical roof radar + expandable inspection map. */
'use strict';
((g)=>{
 const BOUNDS={minX:29.85,maxX:66.15,minZ:-49.15,maxZ:-18.85};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const headingDeg=yaw=>(((Math.PI-yaw)*180/Math.PI)%360+360)%360;
 const mapPoint=(p,size=420,pad=34,b=BOUNDS)=>({
  x:pad+(p.x-b.minX)/(b.maxX-b.minX)*(size-pad*2),
  y:pad+(p.z-b.minZ)/(b.maxZ-b.minZ)*(size-pad*2)
 });
 const nearestMissing=(player,conditions,findings={})=>{
  let best=null,d=Infinity;
  for(const f of conditions){if(findings[f.id])continue;const n=Math.hypot(f.x-player.x,f.z-player.z);if(n<d){d=n;best=f}}
  return best?{condition:best,distance:d}:null;
 };
 g.ROOFTOP_V16_HELPERS={BOUNDS,headingDeg,mapPoint,nearestMissing};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,conditions}=api;
  let canvas=null,ctx=null,toggle=null,expanded=false,lastDraw=-1,pingId='',pingUntil=0;
  const radarBox=$('radarBox'),districtRadar=$('radar'),radarLabel=$('radarLabel');

  function ensureMap(){
   if(canvas)return canvas;
   canvas=document.createElement('canvas');canvas.id='roofRadarV16';canvas.width=420;canvas.height=420;canvas.className='roof-radar-v16 hidden';canvas.setAttribute('aria-label','Roof inspection radar');radarBox.appendChild(canvas);ctx=canvas.getContext('2d');
   toggle=document.createElement('button');toggle.id='roofMapToggleV16';toggle.className='roof-map-toggle-v16 hidden';toggle.type='button';toggle.textContent='EXPAND';toggle.setAttribute('aria-label','Expand roof inspection map');
   toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();expanded=!expanded;radarBox.classList.toggle('expanded-v16',expanded);toggle.textContent=expanded?'CLOSE MAP':'EXPAND';toggle.setAttribute('aria-label',expanded?'Close expanded roof inspection map':'Expand roof inspection map');try{navigator.vibrate?.(8)}catch{};draw(true)});
   radarBox.appendChild(toggle);return canvas;
  }
  function setRoofMode(on){
   ensureMap();radarBox.classList.toggle('roof-mode-v16',on);canvas.classList.toggle('hidden',!on);toggle.classList.toggle('hidden',!on);
   if(districtRadar)districtRadar.setAttribute('aria-hidden',on?'true':'false');
   if(!on){expanded=false;radarBox.classList.remove('expanded-v16');toggle.textContent='EXPAND';if(radarLabel)radarLabel.textContent='WESTGATE'}
  }
  function roundedRect(c,x,y,w,h,r){
   r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  function draw(force=false){
   ensureMap();const s=state(),run=s.run,p=s.player,onRoof=!!(s.started&&run?.onRoof&&!run.complete&&!s.photoMode);
   setRoofMode(onRoof);if(!onRoof||!ctx)return;
   const now=performance.now();if(!force&&now-lastDraw<90)return;lastDraw=now;
   const size=canvas.width,pad=34,roofW=size-pad*2,roofH=size-pad*2,c=ctx;
   c.clearRect(0,0,size,size);
   c.save();c.beginPath();c.arc(size/2,size/2,size/2-7,0,Math.PI*2);c.clip();
   c.fillStyle='#112a3a';c.fillRect(0,0,size,size);
   const grad=c.createLinearGradient(0,0,0,size);grad.addColorStop(0,'rgba(48,79,91,.55)');grad.addColorStop(1,'rgba(15,38,53,.15)');c.fillStyle=grad;c.fillRect(0,0,size,size);
   c.strokeStyle='rgba(172,197,198,.10)';c.lineWidth=1;
   for(let i=1;i<8;i++){const q=pad+(roofW/8)*i;c.beginPath();c.moveTo(q,pad);c.lineTo(q,size-pad);c.stroke();const r=pad+(roofH/8)*i;c.beginPath();c.moveTo(pad,r);c.lineTo(size-pad,r);c.stroke()}
   roundedRect(c,pad,pad,roofW,roofH,9);c.fillStyle='#62747a';c.globalAlpha=.38;c.fill();c.globalAlpha=1;c.strokeStyle='rgba(240,210,101,.72)';c.lineWidth=3;c.stroke();
   const safePad=12;roundedRect(c,pad+safePad,pad+safePad,roofW-safePad*2,roofH-safePad*2,7);c.strokeStyle='rgba(240,210,101,.25)';c.lineWidth=2;c.setLineDash([8,8]);c.stroke();c.setLineDash([]);
   // Major rooftop equipment creates an immediately readable roof plan without adding world draw calls.
   for(const b of (world.roofBlocks||[]).slice(0,4)){
    const a=mapPoint({x:b.x-(b.w||1)/2,z:b.z-(b.d||1)/2},size,pad),z=mapPoint({x:b.x+(b.w||1)/2,z:b.z+(b.d||1)/2},size,pad);
    roundedRect(c,a.x,a.y,Math.max(7,z.x-a.x),Math.max(7,z.y-a.y),3);c.fillStyle='rgba(23,49,62,.82)';c.fill();c.strokeStyle='rgba(170,193,195,.38)';c.lineWidth=1.5;c.stroke();
   }
   const hatch=mapPoint({x:32,z:-20.6},size,pad);c.fillStyle='#d5e0dc';c.font='800 19px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('H',hatch.x,hatch.y);
   const near=nearestMissing(p,conditions,run.findings||{}),pp=mapPoint(p,size,pad);
   if(near){const tp=mapPoint(near.condition,size,pad);c.strokeStyle='rgba(240,210,101,.42)';c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();c.moveTo(pp.x,pp.y);c.lineTo(tp.x,tp.y);c.stroke();c.setLineDash([])}
   for(const f of conditions){
    const mp=mapPoint(f,size,pad),logged=!!run.findings?.[f.id],active=near?.condition?.id===f.id;
    if(active&&!logged){const pulse=8+5*(.5+.5*Math.sin(now/180));c.beginPath();c.arc(mp.x,mp.y,18+pulse,0,Math.PI*2);c.strokeStyle='rgba(240,210,101,.20)';c.lineWidth=3;c.stroke()}
    if(pingId===f.id&&now<pingUntil){const t=1-(pingUntil-now)/1800;c.beginPath();c.arc(mp.x,mp.y,20+t*30,0,Math.PI*2);c.strokeStyle=`rgba(156,221,177,${Math.max(0,.8-t)})`;c.lineWidth=4;c.stroke()}
    c.beginPath();c.arc(mp.x,mp.y,logged?15:13,0,Math.PI*2);c.fillStyle=logged?'#9cddb1':active?'#f0d265':'#244454';c.fill();c.strokeStyle=logged?'#e9fff0':'rgba(244,239,219,.65)';c.lineWidth=2;c.stroke();
    c.fillStyle=logged?'#133143':active?'#142c3c':'#e9efeb';c.font='900 14px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(logged?'✓':f.id==='drain'?'D':f.id==='seam'?'S':'P',mp.x,mp.y+1);
   }
   c.save();c.translate(pp.x,pp.y);c.rotate(headingDeg(p.yaw)*Math.PI/180);c.beginPath();c.moveTo(0,-18);c.lineTo(12,13);c.lineTo(0,8);c.lineTo(-12,13);c.closePath();c.fillStyle='#fff3bd';c.fill();c.strokeStyle='#173344';c.lineWidth=3;c.stroke();c.restore();
   c.fillStyle='#f0d265';c.font='900 18px Arial';c.textAlign='center';c.textBaseline='top';c.fillText('N',size/2,10);
   c.restore();
   c.beginPath();c.arc(size/2,size/2,size/2-8,0,Math.PI*2);c.strokeStyle='rgba(243,234,213,.55)';c.lineWidth=7;c.stroke();
   if(radarLabel){const n=Object.keys(run.findings||{}).length;radarLabel.textContent=`ROOF GRID · ${n}/3`}
  }
  function onStart(){base.onStart?.();ensureMap();draw(true)}
  function hud(){base.hud?.();draw()}
  function frame(dt,t){base.frame?.(dt,t);draw()}
  function recorded(f){base.recorded?.(f);pingId=f?.id||'';pingUntil=performance.now()+1800;draw(true)}
  function finished(){base.finished?.();setRoofMode(false)}
  function garage(back){setRoofMode(false);return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eyePos,target){return base.photoBlocked?.(eyePos,target)||false}
  ensureMap();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V16={helpers:g.ROOFTOP_V16_HELPERS,draw,canvas:()=>canvas};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
