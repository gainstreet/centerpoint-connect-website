/* Original scene, vehicles and characters; all geometry is generated locally. */
'use strict';
window.buildRooftopWorld=(r)=>{
 const R=R3,B=R.box,C=R.cylinder,Q=R.quad,N=R.node;
 const data=[],nodes=[],obstacles=[],roofBlocks=[],signs=[];
 const col={road:'#42515e',walk:'#b0b9ba',grass:'#7d997e',cream:'#dcd6c6',blue:'#3c7182',roof:'#dce3db',dark:'#293b48',yellow:'#efc956',steel:'#9aaeb5'};
 const box=(x,y,z,w,h,d,c,a=0)=>B(data,x,y,z,w,h,d,c,a);
 const cyl=(x,y,z,rad,h,c,s=12,r2=rad)=>C(data,x,y,z,rad,h,c,s,r2);
 function sign(text,x,y,z,w=8,h=1.2,bg='#213b4c',fg='#f5f2db',yaw=0){let ca=document.createElement('canvas');ca.width=1024;ca.height=128;let ctx=ca.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,128);ctx.fillStyle=fg;ctx.font='900 62px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,69,980);let g=[];Q(g,[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0],'#ffffff');let n=N(r.mesh(g,r.texture(ca)),x,y,z);n.yaw=yaw;nodes.push(n)}
 function building(x,z,w,d,h,c,name){box(x+w*.12,.043,z-d*.2,w*1.23,.045,d*1.4,'#526473');box(x,h/2,z,w,h,d,c);box(x,h+.12,z,w+.3,.25,d+.3,col.roof);obstacles.push({x,z,w:w+.5,d:d+.5,h:h+.3});for(const zz of [z-d/2,z+d/2]){box(x,h+.48,zz,w+.4,.72,.45,'#b6c3be');box(x,h+.87,zz,w+.6,.1,.62,col.steel)}for(const xx of [x-w/2,x+w/2]){box(xx,h+.48,z,.45,.72,d,'#b6c3be');box(xx,h+.87,z,.62,.1,d+.6,col.steel)}if(name)sign(name,x,h-1,z+d/2+.03,w*.75,1.3);for(let xx=x-w/2+3;xx<x+w/2-1;xx+=5){box(xx,1.65,z+d/2+.035,3.5,2.45,.09,'#284b60');box(xx,1.65,z+d/2+.12,.09,2.45,.1,col.steel);box(xx,.47,z+d/2+.12,3.7,.14,.25,col.cream);box(xx,2.8,z+d/2+.7,4, .2,1.6,col.blue)}return h+.245}
 function palm(x,z,h=10){box(x+1,.075,z-1,5,.04,3,'#627976');cyl(x, h/2,z,.25,h,'#88795f',7,.16);for(let i=0;i<7;i++){let a=i*6.283/7,t=[Math.cos(a),Math.sin(a)],p=[x,h,z],q=[x+t[0]*2.1,h+.6,z+t[1]*2.1],e=[x+t[0]*4.7,h-1.6,z+t[1]*4.7],side=[-t[1]*.55,0,t[0]*.55];Q(data,p,[q[0]+side[0],q[1],q[2]+side[2]],e,[q[0]-side[0],q[1]-.1,q[2]-side[2]],i%2?'#3f765b':'#638c60')}}
 function hvac(x,z,y,w=3,d=3){box(x,y+.28,z,w+.4,.5,d+.4,'#7e9193');box(x,y+1,z,w,1.2,d,'#a0b4b8');box(x,y+1.7,z,w+.2,.16,d+.15,'#c1cdca');for(let i=0;i<2;i++){cyl(x+(i-.5)*w*.45,y+1.81,z,.48,.08,'#263e4a',14);for(let j=0;j<3;j++)box(x+(i-.5)*w*.45,y+1.87,z,.06,.035,.8,'#8c9ea1',j*Math.PI/3)}for(let i=0;i<6;i++)box(x,y+.7+i*.13,z+d/2+.015,w*.8,.045,.04,'#556d79');box(x-w/2-.02,y+1,z,.05,.52,.62,col.blue);roofBlocks.push({x,z,w:w+.6,d:d+.6})}
 // Batched ground, roads, curbs, markings and landscape.
 box(0,-.14,0,350,.2,330,col.grass);box(0,-.005,0,260,.09,20,col.walk);box(0,.05,0,270,.05,16,col.road);box(-35,.055,0,16,.06,250,col.road);box(78,.055,0,16,.06,250,col.road);
 for(let x=-126;x<134;x+=8){box(x,.095,0,3.6,.022,.17,col.yellow);box(x,.095,.45,3.6,.022,.12,col.yellow)}
 for(let z=-112;z<122;z+=9){box(-35,.1,z,.15,.02,4,'#e5dcbc');box(78,.1,z,.15,.02,4,'#e5dcbc')}
 for(let x of [-44,-26,69,87])for(let z of [-13,13])for(let i=0;i<5;i++)box(x+i*.65,.12,z,.35,.04,5,'#d6d9cd');
 box(-56,.07,-22,30,.08,29,col.road);box(48,.07,-11,47,.08,15,col.road);box(48,.13,-17,43,.2,2,col.walk);
 for(let x=32;x<68;x+=5){box(x,.12,-11,.12,.04,7,'#dcd8ba');box(x+2.2,.12,-14.4,4.4,.04,.12,'#dcd8ba')}
 // Headquarters and the playable roof.
 building(-56,-37,25,22,6,'#587681','ROOFTOP / SERVICE CO.');
 for(let x=-66;x<-52;x+=7){box(x,1.8,-25.95,5,3.2,.09,'#70818a');for(let i=0;i<10;i++)box(x,.35+i*.31,-25.87,5,.04,.06,'#a5b4b7')}
 const roofY=building(48,-34,38,32,7,'#c8b7a2','WESTGATE PLAZA');
 for(let x=31;x<67;x+=4)box(x,roofY+.015,-34,.045,.015,30,'#b1c0ba');
 for(let z=-48;z<-19;z+=8)box(48,roofY+.02,z,36,.015,.035,'#c2cec6');
 for(let z=-25;z>-42;z-=2)box(33,roofY+.03,z,1.4,.035,1.7,'#82918d');
 hvac(49,-43,roofY,4.5,3.5);hvac(53,-31,roofY,3.3,3.6);hvac(39,-41,roofY,3,3);
 box(42,roofY+.2,-22.5,3,.35,2,'#798b8d');box(42,roofY+.49,-22.5,2.65,.22,1.65,'#7ca6b1');roofBlocks.push({x:42,z:-22.5,w:3.4,d:2.4});
 // Guarded roof hatch and corresponding ground access.
 box(32,1.4,-17.1,2.6,2.8,.7,col.dark);sign('ROOF ACCESS',32,3.15,-16.65,3,.38);
 box(32,roofY+.12,-20.6,2.3,.24,2.3,col.steel);box(32,roofY+.28,-20.6,1.7,.2,1.7,col.dark);
 for(let x of [30.75,33.25]){cyl(x,roofY+.7,-21.8,.06,1.4,col.yellow);box(x,roofY+1.36,-20.7,.1,.1,2.3,col.yellow)}
 // Observable conditions: leaves at a drain, lifted seam, sound patch.
 cyl(58,roofY+.055,-40,.85,.1,'#768e91',16);cyl(58,roofY+.14,-40,.48,.18,'#263c47',14);
 for(let i=0;i<12;i++){let a=i*2.4,rad=.55+(i%3)*.21;box(58+Math.cos(a)*rad,roofY+.18+(i%2)*.07,-40+Math.sin(a)*rad,.42,.07,.22,i%3?'#947545':'#596d4b',a)}
 box(43,roofY+.045,-30,5.2,.035,.18,'#536361');Q(data,[40.4,roofY+.06,-30],[45.6,roofY+.06,-30],[45.6,roofY+.27,-29.53],[40.4,roofY+.19,-29.53],'#c5d1c7');
 box(59,roofY+.045,-24,2.8,.065,2.15,'#b4c2b6');box(59,roofY+.081,-24,2.55,.018,1.9,'#c9d3c9');
 for(const [x,z] of [[62,-45],[36,-27]]){box(x,roofY+.07,z,1.3,.15,1.3,col.steel);cyl(x,roofY+.6,z,.19,1.1,'#536c79');cyl(x,roofY+1.18,z,.4,.12,col.steel)}
 // Neighbourhood: shopfronts, warehouse bays, varied towers.
 building(-6,-36,27,25,10,'#91a3a5','PACIFIC ELECTRIC');hvac(-8,-35,10.245,4,4);
 building(105,-40,35,36,12,'#6e8791','DISTRIBUTION 04');
 building(-65,43,37,36,9,'#d4c8af','NORTHSIDE SUPPLY');
 building(12,42,58,30,6.8,'#a5aaa0','SUNRISE COFFEE   /   TRADE COUNTER');
 building(111,35,41,26,8.2,'#9f9c8d','BAY 12');
 for(let i=0;i<9;i++){let x=-116+i*29,z=i%2?-103:110,h=16+i%4*8;building(x,z,18+i%3*3,22,h,['#83969e','#819fa5','#b4b9b4'][i%3],'');for(let row=0;row<Math.floor(h/3)-1;row++)for(let colx=-1;colx<=1;colx++)box(x+colx*4,4+row*3,z+11.025,2,1.3,.08,'#536f82')}
 for(const [x,z,h] of [[-72,-12,11],[-20,-13,10],[18,-12,12],[65,-12,11],[-17,13,12],[44,13,11],[94,12,13],[-78,18,14],[68,-61,12],[-76,-49,11]])palm(x,z,h);
 // Street lamps, bollards, cones, dumpster, roof-material stock.
 for(const x of [-81,-18,18,65,95]){cyl(x,4.5,10.6,.11,9,col.dark);box(x,8.9,9.4,.12,.12,2.4,col.dark);box(x,8.85,8.3,.8,.18,1.15,'#b0c4c7')}
 for(const x of [30,34,64,66]){cyl(x,.7,-16,.12,1.3,col.yellow);cyl(x,.7,-16,.125,.2,col.dark)}
 for(const x of [-49,-47,-45]){box(x,.12,-19,.55,.15,.55,col.dark);cyl(x,.55,-19,.25,.85,'#df8a4c',6,.035);cyl(x,.58,-19,.15,.12,'#f8ecd1',6,.11)}
 box(-66,.8,-17,3,1.6,1.6,'#376c66');box(-66,1.65,-17,3.1,.15,1.7,col.dark);
 for(let i=0;i<4;i++)cyl(-61+i*.9,.7,-18,.32,1.2,'#ced2c4',12);
 // Horizon hills keep the city from feeling like a floating board.
 for(let i=0;i<12;i++)cyl(-180+i*35,5,-159,38,44+i%3*14,['#91abb3','#8ca6ad','#a2b6b8'][i%3],5,0);
 nodes.unshift(N(r.mesh(data)));
 function humanoid(shirt='#37647a',vest=true){let root=N(),g=[];C(g,0,1.53,0,.34,.68,shirt,8,.4);B(g,0,1.11,0,.57,.23,.35,'#263c4e');C(g,0,2.02,0,.235,.39,'#b68c6a',10);B(g,0,1.92,.22,.33,.16,.05,'#57453d');B(g,-.085,2.065,.232,.035,.04,.025,'#26333a');B(g,.085,2.065,.232,.035,.04,.025,'#26333a');C(g,0,2.26,0,.28,.19,vest?'#e6c663':'#263e50',10,.18);C(g,0,2.19,.025,.32,.04,vest?'#edd786':'#263e50',12);if(vest){B(g,0,1.54,.3,.54,.57,.09,'#d4a543');for(let x of [-.18,.18])B(g,x,1.56,.351,.065,.54,.025,'#eee0b0');B(g,0,1.38,.353,.54,.06,.025,'#eee0b0');B(g,.31,1.11,0,.16,.24,.25,'#9b784c')}
 root.mesh=r.mesh(g);let legs=[],arms=[];for(let sign of [-1,1]){let l=[],a=[];C(l,0,-.42,0,.135,.82,'#31495a',7);B(l,0,-.86,.09,.3,.21,.5,'#574b3f');let ln=N(r.mesh(l),sign*.19,1,0);root.children.push(ln);legs.push(ln);C(a,0,-.27,0,.115,.55,shirt,7);C(a,0,-.6,.01,.087,.2,'#bd956f',7);let an=N(r.mesh(a),sign*.43,1.77,0);root.children.push(an);arms.push(an)}root.legs=legs;root.arms=arms;nodes.push(root);return root}
 function truck(paint='#287286',x=-50,z=-10,yaw=Math.PI/2){let root=N(null,x,0,z),g=[];B(g,0,.88,0,2.45,.63,5.1,paint);B(g,0,.43,0,2,.18,4.4,col.dark);B(g,0,1.32,1.6,2.4,.36,1.6,paint);B(g,0,1.88,.35,2.26,1.07,1.8,paint);B(g,0,2.47,.33,2.38,.14,1.96,'#e5e7dc');B(g,0,2.05,1.263,2.03,.65,.04,'#284552');B(g,0,2.05,-.57,1.94,.6,.04,'#284552');for(const side of [-1,1]){B(g,side*1.145,2.06,.38,.04,.63,1.52,'#38596b');B(g,side*1.17,2.05,.25,.05,.7,.07,col.steel);B(g,side*1.175,1.59,.18,.06,.08,.3,col.steel);B(g,side*1.35,1.91,1.02,.35,.15,.25,col.dark);B(g,side*1.17,1.29,-1.61,.16,.6,1.88,paint);B(g,side*.83,1.1,2.57,.55,.29,.07,'#eee5ba');B(g,side*1.07,.91,-2.57,.24,.45,.08,'#c5654b');for(let zz of [-2.12,-.92]){B(g,side*.98,2.03,zz,.095,1.25,.095,col.steel)}}B(g,0,1.17,-1.7,1.97,.12,1.7,col.dark);B(g,0,1.55,-2.43,1.96,.14,.2,col.steel);for(let zz of [-2.12,-.92])B(g,0,2.67,zz,2.12,.09,.09,col.steel);for(let xx of [-.35,.35])B(g,xx,2.78,-.1,.09,.12,4.8,'#d4bd74');for(let zz=-2.3;zz<2.3;zz+=.43)B(g,0,2.78,zz,.72,.07,.065,'#d4bd74');B(g,0,.72,2.65,2.52,.22,.2,col.steel);B(g,0,1.07,2.595,.89,.31,.08,col.dark);B(g,0,.75,-2.68,2.55,.23,.23,col.steel);root.mesh=r.mesh(g);root.yaw=yaw;root.wheels=[];for(let xx of [-1.25,1.25])for(let zz of [-1.65,1.65]){let a=[];C(a,0,0,0,.55,.27,'#26323b',14);C(a,0,.15,0,.29,.045,'#b4bcc0',10);C(a,0,-.15,0,.29,.045,'#b4bcc0',10);let wh=N(r.mesh(R.transform(a,R.model({rz:Math.PI/2}))),xx,.57,zz);root.children.push(wh);root.wheels.push(wh)}nodes.push(root);return root}
 const player=humanoid(),manager=humanoid('#547675',false);player.x=-47;player.z=-13.4;manager.x=37;manager.z=-15;manager.yaw=.45;
 const vehicle=truck();truck('#bf9a6f',110,13,-Math.PI/2);truck('#d6d9cf',-56,20,Math.PI/2);
 // One little roof resident; no game penalties or hazards.
 let bird=N(null,62,roofY,-32),bg=[];C(bg,0,.22,0,.17,.3,'#708392',7,.12);C(bg,0,.44,.1,.1,.18,'#506a78',7);B(bg,0,.42,.22,.05,.05,.12,'#c9ab67');B(bg,0,.26,-.19,.19,.08,.24,'#4e636e');bird.mesh=r.mesh(bg);nodes.push(bird);
 // Soft contact shadows for dynamic objects.
 const cv=document.createElement('canvas');cv.width=cv.height=64;let cx=cv.getContext('2d'),gr=cx.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(15,29,39,.35)');gr.addColorStop(1,'rgba(15,29,39,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);const shadowTex=r.texture(cv);
 function shadow(w,d){let g=[];Q(g,[-w/2,0,-d/2],[-w/2,0,d/2],[w/2,0,d/2],[w/2,0,-d/2],'#ffffff');let n=N(r.mesh(g,shadowTex));nodes.push(n);return n}
 const playerShadow=shadow(2.1,2.1),truckShadow=shadow(3.6,6.8);
 return {nodes,obstacles,roofBlocks,player,manager,vehicle,bird,playerShadow,truckShadow,roofY,signs};
};
