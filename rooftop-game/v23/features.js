/* ROOFTOP 0.23 — post-storm roof atmosphere, wet-surface visuals and live wind HUD. */
'use strict';
((g)=>{
 const BASE_WIND=17;
 const GUST_WIND=31;
 const CYCLE=11.5;
 function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
 function smoothstep(a,b,v){const x=clamp((v-a)/(b-a));return x*x*(3-2*x)}
 function windAt(t,seed=0){
  const phase=(Number(t)||0)*Math.PI*2/CYCLE+(seed%19)*.17;
  const wave=.5+.5*Math.sin(phase);
  const ripple=.5+.5*Math.sin(phase*2.37+1.4);
  const gust=smoothstep(.58,.96,wave)*(.72+.28*ripple);
  return +(BASE_WIND+(GUST_WIND-BASE_WIND)*gust).toFixed(1);
 }
 function conditionFor(w){return w>=28?'GUSTING':w>=22?'BREEZY':'STEADY'}
 g.ROOFTOP_V23_HELPERS={BASE_WIND,GUST_WIND,CYCLE,clamp,smoothstep,windAt,conditionFor};
 const previous=g.createRoofUpgrades;
 if(typeof previous!=='function'||typeof document==='undefined')return;
 g.createRoofUpgrades=function(api){
  const base=previous(api),$=id=>document.getElementById(id),state=()=>api.get(),{world,renderer}=api;
  let weather=null,sky=null,wetLayer=null,ponding=[],toneCtx=null,windSource=null,windGain=null,windFilter=null;
  let roofActive=false,lastWind=BASE_WIND,lastCondition='STEADY',seed=0,lastHudStamp='';

  function ensureRun(){
   const r=state().run;if(!r)return null;
   if(!r.weatherV23||r.weatherV23.version!==1)r.weatherV23={version:1,announced:false,seed:Math.abs(String(r.id||'westgate').split('').reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0))%997};
   return r.weatherV23;
  }
  function makeTexture(){
   const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');if(!x)return c;
   x.clearRect(0,0,c.width,c.height);
   const grad=x.createLinearGradient(0,0,512,512);grad.addColorStop(0,'rgba(40,82,92,.02)');grad.addColorStop(.5,'rgba(24,63,75,.14)');grad.addColorStop(1,'rgba(71,111,116,.04)');x.fillStyle=grad;x.fillRect(0,0,512,512);
   x.globalCompositeOperation='screen';
   for(let i=0;i<18;i++){const px=(i*89)%512,py=(i*137)%512,r=24+(i%5)*17;const g2=x.createRadialGradient(px,py,0,px,py,r);g2.addColorStop(0,'rgba(210,234,230,.12)');g2.addColorStop(1,'rgba(210,234,230,0)');x.fillStyle=g2;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill()}
   return c;
  }
  function makeWetRoof(){
   if(world.v23WetRoof){wetLayer=world.v23WetRoof.layer;ponding=world.v23WetRoof.ponding||[];return}
   try{
    const y=world.roofY+.058,g=[],Q=R3.quad;
    Q(g,[30.2,y,-49.6],[65.8,y,-49.6],[65.8,y,-18.4],[30.2,y,-18.4],'#ffffff');
    wetLayer=R3.node(renderer.mesh(g,renderer.texture(makeTexture())));world.nodes.push(wetLayer);
    const spots=[[58,-40,1.7,.04],[57.2,-39.4,.82,.06],[58.8,-40.55,.64,.055],[51.4,-43.6,.72,.028],[45.6,-29.4,.58,.02]];
    ponding=spots.map(([x,z,r,h],i)=>{const d=[];R3.cylinder(d,0,h/2,0,r,h,i<3?'#567f88':'#6c9296',20,r*.92);const n=R3.node(renderer.mesh(d),x,y+(i<3?.006:.003),z);world.nodes.push(n);return n});
    world.v23WetRoof={layer:wetLayer,ponding};
   }catch{}
  }
  function ensureUI(){
   if(!sky){
    sky=document.createElement('div');sky.id='stormSkyV23';sky.className='storm-sky-v23 hidden';sky.setAttribute('aria-hidden','true');
    sky.innerHTML='<i></i><i></i><i></i><span class="mist-v23"></span>';document.body.appendChild(sky);
   }
   if(!weather){
    weather=document.createElement('div');weather.id='roofWeatherV23';weather.className='roof-weather-v23 hidden';weather.innerHTML='<div class="weather-head-v23"><span>POST-STORM CONDITIONS</span><b id="weatherStateV23">STEADY</b></div><div class="weather-main-v23"><div class="wind-icon-v23"><i></i><em>↗</em></div><div><strong id="weatherWindV23">17</strong><small>KM/H WIND</small></div><div class="weather-surface-v23"><span>WET TPO</span><b>WATCH FOOTING</b></div></div><div class="weather-gust-v23"><i id="weatherGustV23"></i></div>';
    document.getElementById('hud')?.appendChild(weather);
   }
  }
  function vibration(p){try{navigator.vibrate?.(p)}catch{}}
  function ensureWindAudio(){
   if(!state().profile?.sound||!roofActive)return stopWindAudio();
   try{
    if(!toneCtx)toneCtx=new (g.AudioContext||g.webkitAudioContext)();if(toneCtx.state==='suspended')toneCtx.resume();if(windSource)return;
    const len=toneCtx.sampleRate*2,buf=toneCtx.createBuffer(1,len,toneCtx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(.5+.5*Math.sin(i*.013));
    windSource=toneCtx.createBufferSource();windSource.buffer=buf;windSource.loop=true;windFilter=toneCtx.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=720;windGain=toneCtx.createGain();windGain.gain.value=.007;windSource.connect(windFilter);windFilter.connect(windGain);windGain.connect(toneCtx.destination);windSource.start();
   }catch{}
  }
  function stopWindAudio(){try{windSource?.stop()}catch{}windSource=null;windGain=null;windFilter=null}
  function syncAudio(){ensureWindAudio();if(windGain)windGain.gain.value=.006+clamp((lastWind-BASE_WIND)/(GUST_WIND-BASE_WIND))*.014;if(windFilter)windFilter.frequency.value=580+lastWind*14}
  function syncVisibility(){
   ensureUI();makeWetRoof();const s=state(),on=!!(s.started&&s.run?.onRoof&&!s.run.complete&&!s.photoMode);
   roofActive=on;weather?.classList.toggle('hidden',!on);sky?.classList.toggle('hidden',!on||!!s.profile?.low);if(wetLayer)wetLayer.visible=on;for(const n of ponding)n.visible=on;
   if(!on)stopWindAudio();else syncAudio();
   const r=ensureRun();if(on&&r&&!r.announced){r.announced=true;api.save();setTimeout(()=>api.toast('POST-STORM ROOF · Wet TPO and shifting wind. Watch your footing while you document conditions.'),420)}
  }
  function updateWeather(t){
   const r=ensureRun();if(!r)return;seed=r.seed||0;lastWind=windAt(t,seed);const cond=conditionFor(lastWind),ratio=clamp((lastWind-BASE_WIND)/(GUST_WIND-BASE_WIND));
   if($('weatherWindV23'))$('weatherWindV23').textContent=Math.round(lastWind);if($('weatherStateV23'))$('weatherStateV23').textContent=cond;if($('weatherGustV23'))$('weatherGustV23').style.width=Math.round(20+ratio*80)+'%';
   weather?.classList.toggle('gust-v23',cond==='GUSTING');weather?.style.setProperty('--wind-v23',String(ratio));sky?.style.setProperty('--wind-v23',String(ratio));
   const arrow=weather?.querySelector('.wind-icon-v23 em');if(arrow)arrow.style.transform=`rotate(${18+ratio*28}deg)`;
   if(cond==='GUSTING'&&lastCondition!=='GUSTING'&&roofActive){vibration([10,18,10]);api.toast('WIND GUST · Keep a stable stance near edges and equipment.')}
   lastCondition=cond;syncAudio();
   if(ponding.length){for(let i=0;i<ponding.length;i++){const n=ponding[i];n.y=(world.roofY+.064)+(Math.sin(t*2.2+i)*.004);n.yaw=Math.sin(t*.28+i)*.025}}
  }
  function onStart(){base.onStart?.();ensureRun();makeWetRoof();lastCondition='STEADY';syncVisibility()}
  function hud(){base.hud?.();const s=state(),stamp=[s.run?.id,s.started,s.run?.onRoof,s.run?.complete,s.photoMode,s.profile?.sound].join('|');if(stamp!==lastHudStamp){lastHudStamp=stamp;syncVisibility()}}
  function frame(dt,t){base.frame?.(dt,t);if(!roofActive)return;updateWeather(t)}
  function recorded(f){base.recorded?.(f);syncVisibility()}
  function finished(){base.finished?.();roofActive=false;weather?.classList.add('hidden');sky?.classList.add('hidden');if(wetLayer)wetLayer.visible=false;for(const n of ponding)n.visible=false;stopWindAudio()}
  function garage(back){roofActive=false;weather?.classList.add('hidden');sky?.classList.add('hidden');if(wetLayer)wetLayer.visible=false;for(const n of ponding)n.visible=false;stopWindAudio();return base.garage?.(back)}
  function scoreCard(){return base.scoreCard?.()}function nextTarget(){return base.nextTarget?.()}function photoBlocked(eye,t){return base.photoBlocked?.(eye,t)||false}
  ensureUI();makeWetRoof();
  try{if(new URLSearchParams(location.search).has('qa'))g.__ROOFTOP_V23={helpers:g.ROOFTOP_V23_HELPERS,weather:()=>({wind:lastWind,condition:lastCondition,active:roofActive,nodes:ponding.length}),syncVisibility,updateWeather};}catch{}
  return {...base,onStart,hud,frame,recorded,finished,garage,scoreCard,nextTarget,photoBlocked};
 };
})(typeof window!=='undefined'?window:globalThis);
