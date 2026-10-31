'use strict';
/* Pixel office: the main screen. Every employee is a character; every office module opens from an object on the floor. */
const PX = (() => {
const t_ = s => (typeof t === 'function' ? t(s) : s);
const CHAIRS = [];
const T=16, MW=40, MH=36;
const idx=(x,y)=>y*MW+x;
const floor=new Uint8Array(MW*MH), wall=new Uint8Array(MW*MH), solid=new Uint8Array(MW*MH), glass=new Uint8Array(MW*MH);
const fl=(a,b,c,d,t)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)floor[idx(x,y)]=t};
const wl=(a,b,c,d)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)wall[idx(x,y)]=1};
const door=(x,y)=>{wall[idx(x,y)]=0};

/* ---------- floor plan ---------- */
fl(0,0,MW-1,MH-1,1);          // speckled carpet
fl(1,1,10,10,2);              // private offices: wood
fl(29,1,38,10,3);             // meeting room: blue carpet
fl(1,22,4,27,4);              // restroom tiles
fl(6,22,9,27,2);              // dressing room
fl(1,29,11,34,6);             // print & archive
fl(30,21,38,26,7);            // kitchen check
fl(30,28,38,34,2);            // dining wood
wl(0,0,MW-1,0);wl(0,MH-1,MW-1,MH-1);wl(0,0,0,MH-1);wl(MW-1,0,MW-1,MH-1);
wl(11,0,11,11);wl(0,11,11,11);door(11,8);door(11,9);
wl(28,0,28,11);wl(28,11,MW-1,11);door(31,11);door(32,11);
wl(0,21,10,21);wl(10,21,10,28);wl(5,21,5,28);door(3,21);door(8,21);
wl(0,28,12,28);wl(12,28,12,MH-1);door(12,31);door(12,32);
wl(29,20,MW-1,20);wl(29,20,29,MH-1);wl(29,27,MW-1,27);door(29,23);door(29,24);door(34,27);door(29,31);
door(19,MH-1);door(20,MH-1);glass[idx(19,MH-1)]=glass[idx(20,MH-1)]=1;
for(let i=0;i<MW*MH;i++) if(wall[i]||glass[i]) solid[i]=1;


/* ---------- pixel helpers ---------- */
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)^0x5bd1e995;h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296};
const oval=(g,cx,cy,rx,ry,c)=>{g.fillStyle=c;for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry)));g.fillRect(Math.round(cx-w),Math.round(cy+y),w*2,1)}};
const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);return c};

/* ---------- static layer ---------- */
const FL={
 1:(g,x,y)=>{R(g,0,0,T,T,'#eadcc2');for(let i=0;i<5;i++){const a=hash(x*7+i,y*3+i);R(g,(a*16)|0,(hash(x+i,y*5)*16)|0,1,1,i%2?'#d9c7a6':'#f4ead6')}},
 2:(g,x,y)=>{R(g,0,0,T,T,'#c58a52');R(g,0,0,T,1,'#a8703f');R(g,0,8,T,1,'#a8703f');const o=((y%2)*8+(x%2)*4)%16;R(g,o,1,1,7,'#a8703f');R(g,(o+8)%16,9,1,7,'#a8703f');R(g,2,3,3,1,'#d39a62')},
 3:(g,x,y)=>{R(g,0,0,T,T,'#9fb2b8');if(hash(x,y)>.5)R(g,(hash(y,x)*14)|0,(hash(x*3,y)*14)|0,2,1,'#8ea1a8')},
 4:(g,x,y)=>{R(g,0,0,T,T,(x+y)%2?'#cfe3e4':'#bdd5d7');R(g,0,0,T,1,'#a9c4c7');R(g,0,0,1,T,'#a9c4c7')},
 5:(g)=>{R(g,0,0,T,T,'#b8b1a5');R(g,0,15,T,1,'#a69f93')},
 6:(g,x,y)=>{R(g,0,0,T,T,'#aaa498');R(g,0,0,T,1,'#9a9488');R(g,0,0,1,T,'#9a9488');if(hash(x,y)>.6)R(g,6,6,2,1,'#b7b1a5')},
 7:(g,x,y)=>{R(g,0,0,T,T,'#eee6d4');R(g,0,0,8,8,'#d8ccb2');R(g,8,8,8,8,'#d8ccb2')},
};
const bg=document.createElement('canvas');bg.width=MW*T;bg.height=MH*T;
(()=>{const g=bg.getContext('2d');
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){g.save();g.translate(x*T,y*T);(FL[floor[idx(x,y)]]||FL[1])(g,x,y);g.restore()}
 // rugs (gray pod mats, lounge, creative corner, doormat)
 const rug=(a,b,w,h,c,e)=>{R(g,a*T,b*T,w*T,h*T,e);R(g,a*T+2,b*T+2,w*T-4,h*T-4,c)};
 rug(13,4,7,6,'#cfc2aa','#bdae93');rug(20,4,7,6,'#cfc2aa','#bdae93');rug(13,11,7,6,'#cfc2aa','#bdae93');rug(20,11,7,6,'#cfc2aa','#bdae93');
 rug(2,13,6,5,'#c9a77e','#a98760');rug(30,13,8,6,'#d9c39a','#bfa77c');
 rug(19,33,2,2,'#7d5a3c','#5e4029');
 for(let i=0;i<6;i++)for(let j=0;j<5;j++)if((i+j)%2)R(g,(2+i)*T+4,(13+j)*T+4,8,8,'#c09d73');
 // walls
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
  const X=x*T,Y=y*T;
  if(glass[idx(x,y)]){R(g,X,Y,T,T,'#5a4a42');R(g,X+1,Y+2,T-2,T-2,'#9fd3e0');R(g,X+3,Y+4,2,8,'#d9f1f6');R(g,x===19?X+T-2:X,Y+2,2,T-2,'#5a4a42');continue}
  if(!wall[idx(x,y)])continue;
  const below=y<MH-1&&!wall[idx(x,y+1)];
  if(below){R(g,X,Y,T,5,'#5b463c');R(g,X,Y+5,T,9,'#f2e4c9');R(g,X,Y+13,T,3,'#a5835f');R(g,X,Y+5,T,1,'#d8c6a4')}
  else{R(g,X,Y,T,T,'#5b463c');R(g,X+1,Y+1,T-2,T-2,'#6c564a')}
 }
 // wall decorations
 const win=(x)=>{const X=x*T,Y=0;R(g,X+2,Y+5,12,8,'#8fc9de');R(g,X+2,Y+5,12,1,'#5b463c');R(g,X+7,Y+5,1,8,'#f2e4c9');R(g,X+3,Y+7,3,1,'#d8f0f7')};
 [2,3,4,24,25,26,35,36].forEach(win);
 R(g,31*T,5,5*T,8,'#fbfbf6');R(g,31*T,5,5*T,1,'#8b8b8b');R(g,31*T+6,8,20,1,'#4a7fc1');R(g,31*T+30,7,14,1,'#d0544b');R(g,32*T+8,10,40,1,'#5b9a5b'); // whiteboard
 oval(g,19*T+8,9,4,4,'#fbfbf6');R(g,19*T+8,6,1,3,'#3a2313');R(g,19*T+8,9,3,1,'#3a2313'); // wall clock
 R(g,8*T+3,21*T+6,10,6,'#d0569a'); // signs on walls
 R(g,3*T+4,21*T+6,8,6,'#5b8fc7');
})();

/* ---------- furniture ---------- */
const objs=[];
const add=(o)=>{o.top=o.top||0;o.img=mk(o.w*T,o.h*T+o.top,(g,W,H)=>o.draw(g,W,H,o.top));o.px=o.x*T;o.py=o.y*T-o.top;o.sy=(o.y+o.h)*T+(o.sb||0);
 if(o.solid!==false)for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)solid[idx(x,y)]=1;objs.push(o);return o};
const monitor=(g,x,y,back)=>{R(g,x,y,10,7,'#2b2d3a');if(!back)R(g,x+1,y+1,8,5,'#7fc6d9');else R(g,x+4,y+7,2,2,'#2b2d3a');if(!back)R(g,x+2,y+2,3,1,'#c6eef6')};
const deskDraw=(stuff)=>(g,W,H,top)=>{R(g,0,top+1,W,H-top-1,'#6e4422');R(g,1,top+2,W-2,H-top-8,'#cf9659');R(g,1,top+2,W-2,1,'#e2b07a');R(g,1,H-6,W-2,5,'#9a6236');R(g,1,H-6,W-2,1,'#7b4c28');if(stuff)stuff(g,W,H,top)};
const desk=(x,y,w,h,stuff,extra)=>add(Object.assign({x,y,w,h,draw:deskDraw(stuff),name:'โต๊ะทำงาน'},extra));
const chair=(x,y,c='#4a4f5c',face='u')=>(CHAIRS.push({x,y,face}),add({x,y,w:1,h:1,solid:false,sb:-16,draw:(g)=>{oval(g,8,9,5,4,'#00000022');R(g,3,4,10,8,c);R(g,4,5,8,6,'#646a79');if(face==='u')R(g,3,10,10,3,c);if(face==='d')R(g,3,2,10,3,c);if(face==='l')R(g,11,4,3,8,c);if(face==='r')R(g,2,4,3,8,c);R(g,7,12,2,3,'#2e3139')}}));
const plant=(x,y,big)=>add({x,y,w:1,h:1,top:big?18:12,name:'ต้นไม้',draw:(g,W,H,t)=>{
  oval(g,8,H-2,6,2,'#00000030');R(g,4,H-8,8,7,'#b8603a');R(g,3,H-9,10,2,'#cf7346');R(g,5,H-3,6,2,'#9b4c2c');
  const L=[[8,t-2,5,5,'#3c7a35'],[4,t+1,4,4,'#4c8f3f'],[12,t+1,4,4,'#4c8f3f'],[8,t+3,5,4,'#5aa84a'],[5,t-4+(big?-6:0),3,4,'#5aa84a'],[11,t-4+(big?-6:0),3,4,'#5aa84a'],[8,t-6+(big?-8:0),3,4,'#77c35c']];
  for(const l of L)oval(g,l[0],l[1],l[2],l[3],l[4])},talk:['ต้นไม้ดูสดชื่นดี ใบเป็นเงาเลย','มีคนรดน้ำไว้แล้ว ดินยังชื้นอยู่']});
const shelf=(x,y,w,name='ชั้นหนังสือ',talk)=>add({x,y,w,h:1,top:14,name,talk:talk||['หนังสือคู่มือ Excel สามเล่ม กับนิยายที่ใครลืมไว้','มีแฟ้มเขียนว่า "งบ Q3 อย่าแตะ"'],draw:(g,W,H)=>{
  R(g,0,0,W,H,'#6e4422');R(g,2,2,W-4,H-4,'#8f5a2f');const cols=['#c4513f','#4a7fc1','#e8a93a','#5b9a5b','#8c5fb0','#f2e4c9'];
  for(let r=0;r<3;r++){const yy=3+r*9;R(g,2,yy+7,W-4,2,'#6e4422');for(let i=3;i<W-3;i+=3)if(hash(i+x*9,r+y)>.18)R(g,i,yy+1+((hash(i,r)*2)|0),2,7-((hash(r,i)*2)|0),cols[(hash(i*3,r+x)*6)|0])}}});
const pod=(x,y,name,talk)=>add({x,y,w:5,h:2,name,talk,draw:deskDraw((g,W,H,t)=>{R(g,W/2-1,2,2,H-8,'#8b8b8b')})});

// private offices
desk(2,2,5,2,(g)=>{monitor(g,30,4,false);R(g,8,6,10,6,'#f6f1e3');R(g,10,8,6,1,'#9a9a9a');R(g,58,5,6,6,'#5b9a5b')},{name:'โต๊ะหัวหน้า',talk:['บนโต๊ะมีกรอบรูปแมวสามตัว','ปฏิทินวงวันนี้ไว้ด้วยปากกาแดง "ประชุม 10 โมง"']});
desk(1,4,1,3,(g,W,H)=>{for(let i=0;i<3;i++)R(g,3,8+i*14,10,2,'#7b4c28')},{name:'ตู้ลิ้นชัก',talk:['ลิ้นชักล็อกอยู่ คงเป็นเอกสารลับ']});
chair(4,4,'#3a3d48','u');
desk(3,8,5,2,(g)=>{monitor(g,20,4,false);monitor(g,34,4,false);R(g,60,6,8,10,'#f6f1e3')},{name:'โต๊ะรองหัวหน้า',talk:['จอสองจอ เปิด spreadsheet ค้างไว้ทั้งสองจอ']});
chair(5,7,'#3a3d48','d');
shelf(7,1,3);plant(9,9);plant(1,1);

// work zone
shelf(16,1,3);plant(13,1,true);plant(23,1,true);plant(27,1);
pod(14,6,'โต๊ะทีมการตลาด',['โพสต์อิทเต็มจอ ส่วนใหญ่เขียนว่า "ด่วน!"']);
pod(21,6,'โต๊ะทีมบัญชี',['เครื่องคิดเลขสามเครื่อง กับกองใบเสร็จ']);
const myPod=pod(14,13,'โต๊ะของคุณ',['โต๊ะคุณเอง มีแก้วส้มใบโปรดวางอยู่']);
pod(21,13,'โต๊ะทีมดีไซน์',['มีโมเดลกระดาษตั้งเรียงกัน กับจอสีแม่นยำ']);
[[15,5,'d'],[17,5,'d'],[15,8,'u'],[17,8,'u'],[22,5,'d'],[24,5,'d'],[22,8,'u'],[24,8,'u'],[15,12,'d'],[17,12,'d'],[15,15,'u'],[17,15,'u'],[22,12,'d'],[24,12,'d'],[22,15,'u'],[24,15,'u']].forEach(c=>chair(c[0],c[1],'#4a4f5c',c[2]));
plant(12,19);plant(27,19,true);

// lounge
add({x:3,y:14,w:2,h:2,name:'โต๊ะกลม',talk:['มีบอร์ดเกมกล่องหนึ่งวางทิ้งไว้ ชิ้นส่วนหายไปครึ่งหนึ่ง'],draw:(g,W,H)=>{oval(g,16,18,14,10,'#00000025');oval(g,16,15,14,11,'#7b4c28');oval(g,16,14,13,10,'#cf9659');oval(g,13,11,5,3,'#e2b07a');R(g,18,14,6,5,'#4a7fc1')}});
chair(3,13,'#4a4f5c','d');chair(5,14,'#4a4f5c','l');chair(2,15,'#4a4f5c','r');chair(4,16,'#4a4f5c','u');
add({x:7,y:13,w:1,h:1,top:4,name:'บีนแบ็ก',talk:['นั่งแล้วลุกยากมาก ห้ามนั่งก่อนประชุม'],draw:(g,W,H)=>{oval(g,8,H-4,7,3,'#00000025');oval(g,8,H-9,7,7,'#3f7f8f');oval(g,6,H-12,3,2,'#62a4b3')}});
plant(1,12,true);plant(1,19);plant(9,19);

// restroom + janitor
const toilet=(x,y)=>add({x,y,w:1,h:1,name:'ห้องน้ำ',talk:['ห้องว่าง สะอาดหอมกลิ่นมะนาว'],draw:(g)=>{R(g,1,2,5,12,'#e9eef0');R(g,1,2,5,12,'#e9eef0');oval(g,10,8,5,4,'#ffffff');oval(g,10,8,3,2,'#bcd6e0');R(g,0,0,7,1,'#9fb7bb')}});
toilet(1,23);toilet(1,26);
add({x:4,y:23,w:1,h:2,name:'อ่างล้างมือ',talk:['ล้างมือแล้ว สะอาดพร้อมทำงาน'],draw:(g,W,H)=>{R(g,0,0,W,H,'#d9d4c8');R(g,2,2,W-4,H-4,'#ece8de');oval(g,8,10,4,3,'#bcd6e0');oval(g,8,26,4,3,'#bcd6e0');R(g,13,8,2,4,'#9a9a9a');R(g,13,24,2,4,'#9a9a9a')}});
add({x:9,y:23,w:1,h:2,top:16,name:'Wardrobe',draw:(g,W,H)=>{R(g,0,0,W,H,'#6e4422');R(g,1,1,W-2,H-2,'#8f5a2f');R(g,7,2,2,H-4,'#6e4422');R(g,5,20,2,4,'#e8c27a');R(g,9,20,2,4,'#e8c27a');R(g,2,3,4,6,'#c4513f');R(g,10,3,4,6,'#4a7fc1')}});
add({x:6,y:23,w:1,h:1,top:14,name:'Mirror',draw:(g,W,H)=>{R(g,2,0,12,H-2,'#c8a777');R(g,3,1,10,H-4,'#bfe3ef');R(g,5,3,2,8,'#e9f7fb');R(g,9,6,1,6,'#e9f7fb');oval(g,8,H-2,5,1,'#00000030')}});
add({x:6,y:26,w:3,h:1,top:12,name:'Clothes rack',draw:(g,W,H)=>{R(g,1,0,2,H,'#5d636f');R(g,W-3,0,2,H,'#5d636f');R(g,1,1,W-2,2,'#8c939b');['#c4513f','#e8a93a','#5b9a5b','#4a7fc1','#8c5fb0','#f2e4c9','#2b2d3a','#d0569a'].forEach((c,i)=>{R(g,4+i*5,3,4,12,c);R(g,5+i*5,2,2,1,'#5d636f')})}});

// print & archive
const copier=(x,y,talk)=>add({x,y,w:2,h:2,top:6,name:'เครื่องถ่ายเอกสาร',talk,draw:(g,W,H)=>{R(g,1,4,W-2,H-6,'#c8ccce');R(g,1,4,W-2,4,'#e6e8e9');R(g,4,8,W-8,8,'#8e9599');R(g,W-10,10,6,3,'#7fc6d9');R(g,4,22,W-8,2,'#a6adb1');R(g,4,28,W-8,2,'#a6adb1');R(g,2,H-3,W-4,2,'#7a8084')}});
const printer=copier(1,30,['เครื่องพิมพ์พร้อมใช้งาน']);copier(4,30,['เครื่องนี้ติดกระดาษอีกแล้ว มีโน้ตแปะว่า "อย่าเตะ"']);
for(let i=0;i<4;i++)add({x:7+i,y:29,w:1,h:1,top:14,name:'ตู้เอกสาร',talk:[['แฟ้มสัญญาปี 2019-2022','ใบเสร็จเรียงตามเดือน ละเอียดมาก','แฟ้มสีแดง: ภาษี','ลิ้นชักนี้มีขนมซ่อนอยู่!'][i]],draw:(g,W,H)=>{R(g,1,0,14,H,'#7d8a96');R(g,2,1,12,H-2,'#93a1ad');for(let k=0;k<3;k++){R(g,2,2+k*9,12,1,'#6d7984');R(g,6,5+k*9,4,2,'#d7dde2')}}});
add({x:5,y:33,w:3,h:1,name:'โต๊ะแยกเอกสาร',talk:['กองกระดาษรอเย็บ กับที่เย็บกระดาษที่ไม่มีลวด'],draw:deskDraw((g)=>{R(g,6,4,10,7,'#f6f1e3');R(g,8,3,10,7,'#fbfbf6');R(g,30,5,6,4,'#c4513f')})});
add({x:1,y:33,w:1,h:1,top:4,name:'กล่องเอกสาร',talk:['กล่องเขียนว่า "เก็บถาวร ห้ามทิ้ง"'],draw:(g,W,H)=>{R(g,1,2,14,H-3,'#b98a55');R(g,1,2,14,3,'#cf9f68');R(g,5,10,6,3,'#f6f1e3')}});
plant(11,34);

// reception
desk(17,26,5,2,(g)=>{monitor(g,26,4,true);monitor(g,40,4,true);R(g,6,5,8,6,'#f6f1e3');R(g,58,6,6,4,'#e8a93a')},{name:'เคาน์เตอร์ต้อนรับ',talk:['สมุดลงชื่อผู้มาติดต่อ วันนี้มีแขกสองคน']});
chair(19,25,'#3a3d48','d');
plant(16,26,true);plant(22,26);
add({x:17,y:31,w:5,h:1,top:6,name:'โซฟารับแขก',talk:['โซฟานุ่มดี มีนิตยสารธุรกิจเก่าสามเดือน'],draw:(g,W,H)=>{oval(g,W/2,H-2,W/2-2,2,'#00000025');R(g,1,2,W-2,H-4,'#5e7f7a');R(g,3,8,W-6,H-12,'#7aa29c');R(g,1,2,4,H-4,'#4c6a65');R(g,W-5,2,4,H-4,'#4c6a65');R(g,W/2,8,1,H-12,'#5e7f7a')}});
plant(15,31);plant(23,31,true);plant(13,34);plant(26,34);

// meeting room
add({x:31,y:4,w:6,h:2,name:'โต๊ะประชุม',talk:['โต๊ะประชุมว่างอยู่ ประชุมเริ่ม 10 โมง'],draw:deskDraw((g)=>{R(g,10,6,8,6,'#f6f1e3');R(g,40,8,10,5,'#2b2d3a');R(g,70,6,8,6,'#f6f1e3');R(g,46,16,4,4,'#c4513f')})});
for(let i=0;i<6;i++){chair(31+i,3,'#3a3d48','d');chair(31+i,6,'#3a3d48','u')}
chair(30,4,'#3a3d48','r');chair(37,5,'#3a3d48','l');
plant(29,1,true);plant(38,1);plant(38,10);plant(29,10);

// creative corner
desk(32,14,4,2,(g)=>{monitor(g,10,4,false);monitor(g,36,4,false);R(g,22,8,8,8,'#f6f1e3');R(g,24,10,4,1,'#c4513f')},{name:'โต๊ะครีเอทีฟ',talk:['มีสเก็ตช์โลโก้วางเต็มโต๊ะ เวอร์ชันที่ 14']});
chair(33,13,'#4a4f5c','d');chair(34,13,'#4a4f5c','d');
const ball=(x,y,c)=>add({x,y,w:1,h:1,top:2,name:'ลูกบอลโยคะ',talk:['นั่งเด้งไปมา หลังหายปวดนิดหน่อย'],draw:(g,W,H)=>{oval(g,8,H-2,6,2,'#00000030');oval(g,8,H-8,7,7,c);oval(g,5,H-11,2,2,'#ffffff66')}});
ball(32,17,'#6fa8c9');ball(35,17,'#e8b13a');
plant(30,13,true);plant(37,13);plant(30,19);plant(38,19,true);

// kitchen
const counter=(x,y,w,stuff,name,talk)=>add({x,y,w,h:1,top:12,name,talk,draw:(g,W,H)=>{R(g,0,0,W,9,'#c8a777');for(let i=0;i<W;i+=16)R(g,i+1,1,14,7,'#d9bb8c');R(g,0,12,W,4,'#e6e2d8');R(g,0,16,W,H-16,'#b98a55');for(let i=0;i<W;i+=16){R(g,i,16,1,H-16,'#8f6638');R(g,i+12,20,2,3,'#6e4422')}if(stuff)stuff(g,W,H)}});
counter(30,21,6,(g)=>{oval(g,14,13,5,2,'#d6dde0');R(g,40,10,12,7,'#2b2d3a');R(g,42,11,6,4,'#5d636f');R(g,70,9,10,8,'#e9eef0');R(g,72,11,5,4,'#2b2d3a')},'เคาน์เตอร์ครัว',['อ่างล้างจาน มีแก้วรอล้างสองใบ']);
const coffee=add({x:33,y:21,w:1,h:1,top:14,sb:1,solid:true,name:'เครื่องชงกาแฟ',coffee:true,draw:(g,W,H)=>{R(g,2,4,12,14,'#3a3d48');R(g,3,5,10,4,'#5d636f');R(g,6,12,4,5,'#1f2026');R(g,11,6,2,2,'#e8a93a');R(g,6,18,4,3,'#fbfbf6')}});
add({x:37,y:21,w:2,h:1,top:16,name:'ตู้เย็น',talk:['ในตู้เย็นมีนมกล่องเขียนชื่อ "ต้น ห้ามกิน"','เค้กวันเกิดเหลือครึ่งก้อน... ไว้ก่อนดีกว่า'],draw:(g,W,H)=>{R(g,1,0,W-2,H,'#d7dee2');R(g,2,1,W-4,H-2,'#e9eef0');R(g,2,12,W-4,1,'#b3bdc2');R(g,W-6,4,2,6,'#9aa7ae');R(g,W-6,16,2,10,'#9aa7ae');R(g,6,5,6,4,'#e8a93a')}});
add({x:32,y:24,w:5,h:1,name:'โต๊ะครัว',talk:['มีขนมปังกล่องหนึ่งเขียนว่า "แบ่งกันกินนะ"'],draw:(g,W,H)=>{oval(g,W/2,H/2+2,W/2-1,7,'#7b4c28');oval(g,W/2,H/2,W/2-2,6,'#cf9659');R(g,30,5,10,5,'#f6f1e3');oval(g,58,8,3,2,'#c4513f')}});
[[32,23,'d'],[34,23,'d'],[36,23,'d'],[33,25,'u'],[35,25,'u']].forEach(c=>chair(c[0],c[1],'#8f5a2f',c[2]));
plant(38,26);

// dining
counter(30,28,5,(g)=>{R(g,8,10,14,6,'#2b2d3a');oval(g,12,12,3,2,'#5d636f');oval(g,18,12,3,2,'#5d636f');R(g,40,8,12,8,'#e9eef0');R(g,42,10,7,4,'#2b2d3a')},'ไมโครเวฟและเตา',['ไมโครเวฟมีคิวยาว ตอนเที่ยงต้องมาเร็ว']);
add({x:36,y:28,w:3,h:1,top:16,name:'ตู้เย็นใหญ่',talk:['ตู้เย็นใหญ่เต็มไปด้วยกล่องข้าวมีชื่อแปะ'],draw:(g,W,H)=>{R(g,1,0,W-2,H,'#a9b4ba');R(g,2,1,W-4,H-2,'#c5cdd1');R(g,W/2,1,1,H-2,'#93a1ad');R(g,W/2-4,8,2,12,'#7a8084');R(g,W/2+3,8,2,12,'#7a8084')}});
add({x:32,y:31,w:4,h:1,name:'โต๊ะทานข้าว',talk:['มีคนทิ้งเมนูร้านส้มตำไว้ ดูน่ากิน'],draw:deskDraw((g)=>{oval(g,12,7,4,3,'#fbfbf6');oval(g,46,7,4,3,'#fbfbf6');R(g,28,4,6,6,'#5b9a5b')})});
[[32,30,'d'],[34,30,'d'],[33,32,'u'],[35,32,'u']].forEach(c=>chair(c[0],c[1],'#8f5a2f',c[2]));
add({x:30,y:33,w:1,h:1,top:14,name:'ตู้น้ำดื่ม',talk:['ดื่มน้ำเย็นไปแก้วหนึ่ง สดชื่นขึ้น'],draw:(g,W,H)=>{R(g,3,12,10,H-12,'#e9eef0');oval(g,8,7,5,7,'#79b8d6');R(g,4,1,8,2,'#5f9fbe');R(g,5,16,2,2,'#4a7fc1');R(g,9,16,2,2,'#c4513f')}});
plant(38,34,true);



/* ---------- wardrobe: character looks ---------- */
const LOOKOPT = {
  skin: ['#f8d9bd', '#efc39c', '#d9a274', '#b07a4f', '#82543a', '#5c3a26'],
  hair: ['short', 'long', 'bob', 'bun', 'ponytail', 'spiky', 'curly', 'bald'],
  hairColor: ['#1e1a18', '#4a2e1c', '#7a4a2a', '#b5743a', '#e0c070', '#a8a8a8', '#efe9df', '#c4513f', '#3b5bab', '#8a5fd0', '#d06aa0', '#3f9a6e'],
  top: ['tee', 'shirt', 'hoodie', 'blazer', 'sweater', 'dress'],
  topColor: ['#2457d6', '#0f8a8a', '#1b8f4e', '#c4513f', '#e8803a', '#e8b13a', '#d0569a', '#7a4fd0', '#4b5563', '#f2ede4', '#1f2430', '#8f5a2f'],
  bottom: ['pants', 'shorts', 'skirt'],
  bottomColor: ['#2b2d3a', '#3a4660', '#4b5563', '#6b4426', '#c8b28a', '#1f3a5f', '#7a2e2e', '#e9e4da'],
  acc: ['none', 'glasses', 'round', 'shades'],
  hat: ['none', 'cap', 'beanie', 'headphones', 'flower', 'beret', 'cowboy', 'straw', 'topHat', 'wizard', 'witch', 'crown', 'mushroom', 'frog', 'animalEars', 'hood', 'helmet', 'bucket', 'sailor', 'tiara', 'leafCrown', 'chef', 'hardHat', 'viking', 'turban', 'bandana', 'bow', 'flowerCrown', 'halo', 'pumpkin', 'skull', 'mask'],
  hatColor: ['#c4513f', '#2457d6', '#1b8f4e', '#e8b13a', '#1f2430', '#d0569a', '#f2ede4'],
};
const LOOKS = {
  u1: { skin: '#efc39c', hair: 'bob', hairColor: '#7a4a2a', top: 'blazer', topColor: '#1b8f4e', bottom: 'pants', bottomColor: '#2b2d3a', acc: 'glasses', hat: 'none', hatColor: '#c4513f' },
  u2: { skin: '#d9a274', hair: 'short', hairColor: '#1e1a18', top: 'shirt', topColor: '#2457d6', bottom: 'pants', bottomColor: '#3a4660', acc: 'none', hat: 'none', hatColor: '#c4513f' },
  u3: { skin: '#efc39c', hair: 'long', hairColor: '#4a2e1c', top: 'sweater', topColor: '#d0569a', bottom: 'skirt', bottomColor: '#2b2d3a', acc: 'none', hat: 'flower', hatColor: '#e8b13a' },
  u4: { skin: '#b07a4f', hair: 'ponytail', hairColor: '#1e1a18', top: 'hoodie', topColor: '#7a4fd0', bottom: 'pants', bottomColor: '#3a4660', acc: 'none', hat: 'headphones', hatColor: '#1f2430' },
  u5: { skin: '#f8d9bd', hair: 'spiky', hairColor: '#e0c070', top: 'tee', topColor: '#0f8a8a', bottom: 'shorts', bottomColor: '#c8b28a', acc: 'none', hat: 'none', hatColor: '#c4513f' },
  u6: { skin: '#f8d9bd', hair: 'bun', hairColor: '#1e1a18', top: 'tee', topColor: '#e8803a', bottom: 'pants', bottomColor: '#2b2d3a', acc: 'round', hat: 'none', hatColor: '#c4513f' },
  u7: { skin: '#82543a', hair: 'curly', hairColor: '#1e1a18', top: 'blazer', topColor: '#e8803a', bottom: 'pants', bottomColor: '#1f3a5f', acc: 'none', hat: 'none', hatColor: '#c4513f' },
  u8: { skin: '#f8d9bd', hair: 'long', hairColor: '#b5743a', top: 'dress', topColor: '#7a2e2e', bottom: 'skirt', bottomColor: '#7a2e2e', acc: 'none', hat: 'beanie', hatColor: '#e8b13a' },
  u9: { skin: '#5c3a26', hair: 'short', hairColor: '#1e1a18', top: 'hoodie', topColor: '#4b5563', bottom: 'pants', bottomColor: '#2b2d3a', acc: 'none', hat: 'cap', hatColor: '#c4513f' },
  u10: { skin: '#efc39c', hair: 'bob', hairColor: '#1e1a18', top: 'shirt', topColor: '#d0569a', bottom: 'skirt', bottomColor: '#3a4660', acc: 'none', hat: 'none', hatColor: '#c4513f' },
  u11: { skin: '#d9a274', hair: 'short', hairColor: '#4a2e1c', top: 'sweater', topColor: '#1b8f4e', bottom: 'pants', bottomColor: '#6b4426', acc: 'glasses', hat: 'none', hatColor: '#c4513f' },
  u12: { skin: '#f8d9bd', hair: 'ponytail', hairColor: '#c4513f', top: 'tee', topColor: '#8a5fd0', bottom: 'shorts', bottomColor: '#1f3a5f', acc: 'shades', hat: 'none', hatColor: '#c4513f' },
};
const GREETER = {
  x: 19 * T + 8, y: 25 * T + 12, dir: 'd', welcomed: false, bubble: null,
  look: { skin: '#f8d9bd', hair: 'bun', hairColor: '#7a4a2a', top: 'blazer', topColor: '#1b8f4e', bottom: 'skirt', bottomColor: '#2b2d3a', acc: 'none', hat: 'flowerCrown', hatColor: '#e8b13a' },
};
function greetVisitor() {
  const th = typeof LANG !== 'undefined' && LANG === 'th';
  GREETER.bubble = { text: th ? 'ยินดีต้อนรับนะ! มีอะไรให้ช่วยไหม?' : 'Welcome! Need help finding anything?', until: Date.now() + 6500, mode: 'sys' };
  toast(th ? 'ยินดีต้อนรับ!' : 'Welcome!', th ? 'แวะทัก Mali ที่เคาน์เตอร์ต้อนรับได้เลย' : 'Say hi to Mali at the reception desk.', 'ok');
}
const pickH = (arr, n) => arr[Math.abs(n) % arr.length];
function randomLook(seed) {
  const r = seed == null ? () => Math.random() : (() => { let x = seed * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); })();
  const o = {}; for (const k in LOOKOPT) o[k] = LOOKOPT[k][Math.floor(r() * LOOKOPT[k].length)];
  if (o.top === 'dress') o.bottom = 'skirt';
  return o;
}
function lookOf(u) {
  if (u.look) return u.look;
  if (LOOKS[u.id]) return LOOKS[u.id];
  let h = 0; for (const c of u.id + u.name) h = h * 31 + c.charCodeAt(0) | 0;
  return randomLook(Math.abs(h) % 1000);
}
const shade = (hex, a) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };

const sprCache = new Map();
function sprite(L, dir, f) {
  const k = JSON.stringify(L) + dir + f; if (sprCache.has(k)) return sprCache.get(k);
  const c = mk(16, 24, (g) => {
    const S_ = L.skin, H = L.hairColor, TC = L.topColor, TD = shade(TC, -0.25), BC = L.bottomColor;
    const side = dir === 'l' || dir === 'r', Lf = dir === 'l';
    oval(g, 8, 22, 5, 2, '#00000035');
    // legs / bottom
    const lu = f === 1 ? 1 : 0, ru = f === 2 ? 1 : 0;
    const legC = L.bottom === 'pants' ? BC : S_;
    if (L.top !== 'dress') {
      R(g, 5, 18, 3, 4 - lu, legC); R(g, 8, 18, 3, 4 - ru, legC);
      if (L.bottom === 'shorts') { R(g, 5, 18, 3, 2, BC); R(g, 8, 18, 3, 2, BC); }
      if (L.bottom === 'skirt') R(g, 4, 18, 8, 2, BC), R(g, 4, 19, 8, 1, shade(BC, -0.2));
    } else { R(g, 6, 20, 2, 2 - lu, S_); R(g, 8, 20, 2, 2 - ru, S_); }
    R(g, 5, 21 - lu, 3, 1, '#2b2220'); R(g, 8, 21 - ru, 3, 1, '#2b2220');
    // torso
    R(g, 4, 12, 8, 7, TC);
    if (L.top === 'dress') { R(g, 3, 16, 10, 4, TC); R(g, 3, 19, 10, 1, TD); }
    if (L.top === 'shirt' && !side && dir === 'd') { R(g, 6, 12, 4, 1, '#f6f3ec'); R(g, 7, 13, 1, 1, '#f6f3ec'); R(g, 8, 14, 1, 1, TD); R(g, 8, 16, 1, 1, TD); }
    if (L.top === 'hoodie') { R(g, 4, 11, 8, 2, TD); if (dir === 'd') { R(g, 6, 15, 4, 2, TD); R(g, 6, 12, 1, 3, '#f6f3ec'); R(g, 9, 12, 1, 3, '#f6f3ec'); } if (dir === 'u') R(g, 5, 11, 6, 4, TD); }
    if (L.top === 'blazer' && dir === 'd') { R(g, 7, 12, 2, 6, '#f6f3ec'); R(g, 7, 13, 2, 4, '#c4513f'); R(g, 6, 12, 1, 4, TD); R(g, 9, 12, 1, 4, TD); }
    if (L.top === 'sweater') { R(g, 4, 14, 8, 1, shade(TC, 0.35)); R(g, 4, 16, 8, 1, shade(TC, 0.35)); }
    R(g, 4, 18, 8, 1, TD);
    // arms
    const sleeve = L.top === 'tee' || L.top === 'dress' ? 2 : 4;
    if (!side) {
      const a1 = f === 1 ? 1 : 0, a2 = f === 2 ? 1 : 0;
      R(g, 3, 13 + a1, 1, 4, S_); R(g, 12, 13 + a2, 1, 4, S_);
      R(g, 3, 13 + a1, 1, sleeve, TC); R(g, 12, 13 + a2, 1, sleeve, TC);
    } else { const ax = Lf ? 8 : 6; R(g, ax, 13, 2, 5, S_); R(g, ax, 13, 2, sleeve, TD); }
    // head
    R(g, 3, 3, 10, 9, S_); R(g, 3, 11, 10, 1, shade(S_, -0.12));
    if (!side && dir === 'd') { R(g, 5, 7, 1, 2, '#2b2220'); R(g, 10, 7, 1, 2, '#2b2220'); R(g, 7, 10, 2, 1, '#c97a66'); R(g, 4, 9, 1, 1, shade(S_, -0.08)); R(g, 11, 9, 1, 1, shade(S_, -0.08)); }
    if (side) { R(g, Lf ? 5 : 10, 7, 1, 2, '#2b2220'); R(g, Lf ? 2 : 13, 7, 1, 2, S_); R(g, Lf ? 4 : 11, 10, 1, 1, '#c97a66'); }
    // hair
    const hs = L.hair, HD = shade(H, -0.25);
    const back = dir === 'u';
    if (hs !== 'bald') {
      if (back) { R(g, 3, 2, 10, 10, H); if (hs === 'short' || hs === 'spiky' || hs === 'curly') R(g, 3, 9, 10, 3, S_); R(g, 3, 9, 10, 1, HD); }
      else if (side) { R(g, 3, 2, 10, 3, H); R(g, Lf ? 9 : 3, 4, 4, 5, H); }
      else { R(g, 3, 2, 10, 3, H); R(g, 3, 4, 1, 3, H); R(g, 12, 4, 1, 3, H); R(g, 4, 5, 2, 1, H); }
      if (hs === 'long') { if (back) R(g, 2, 4, 12, 9, H); else if (side) R(g, Lf ? 10 : 2, 4, 4, 9, H); else { R(g, 2, 4, 2, 9, H); R(g, 12, 4, 2, 9, H); } }
      if (hs === 'bob') { if (back) R(g, 2, 3, 12, 8, H); else if (side) R(g, Lf ? 10 : 2, 4, 4, 6, H); else { R(g, 2, 4, 2, 6, H); R(g, 12, 4, 2, 6, H); } }
      if (hs === 'bun') { R(g, 6, 0, 4, 3, H); R(g, 7, 0, 2, 1, shade(H, 0.2)); }
      if (hs === 'ponytail') { if (back) R(g, 7, 9, 2, 6, H); else if (side) R(g, Lf ? 13 : 1, 4, 2, 7, H); else R(g, 12, 6, 2, 5, HD); }
      if (hs === 'spiky') { R(g, 3, 1, 2, 1, H); R(g, 6, 0, 2, 2, H); R(g, 9, 1, 2, 1, H); R(g, 11, 1, 2, 2, H); }
      if (hs === 'curly') { R(g, 2, 1, 12, 4, H); R(g, 2, 4, 2, 3, H); R(g, 12, 4, 2, 3, H); [[3, 1], [6, 0], [9, 0], [12, 1]].forEach(([x, y]) => R(g, x, y, 2, 1, shade(H, 0.15))); if (back) R(g, 2, 2, 12, 10, H); }
      R(g, 4, 2, 3, 1, shade(H, 0.25));
    } else R(g, 4, 3, 3, 1, shade(S_, 0.2));
    // accessories
    if (!back && L.acc !== 'none') {
      const fc = L.acc === 'shades' ? '#111' : '#2b2220';
      if (side) { R(g, Lf ? 3 : 9, 7, 4, 1, fc); if (L.acc === 'shades') R(g, Lf ? 4 : 9, 7, 3, 2, '#111'); }
      else if (L.acc === 'round') { R(g, 4, 6, 3, 1, fc); R(g, 4, 9, 3, 1, fc); R(g, 4, 7, 1, 2, fc); R(g, 6, 7, 1, 2, fc); R(g, 9, 6, 3, 1, fc); R(g, 9, 9, 3, 1, fc); R(g, 9, 7, 1, 2, fc); R(g, 11, 7, 1, 2, fc); R(g, 7, 7, 2, 1, fc); }
      else { R(g, 4, 7, 3, L.acc === 'shades' ? 2 : 1, fc); R(g, 9, 7, 3, L.acc === 'shades' ? 2 : 1, fc); R(g, 7, 7, 2, 1, fc); if (L.acc === 'glasses') { R(g, 5, 8, 1, 1, '#2b2220'); R(g, 10, 8, 1, 1, '#2b2220'); } }
    }
    const HC = L.hatColor;
    if (L.hat === 'cap') { R(g, 3, 1, 10, 3, HC); R(g, 6, 1, 4, 1, shade(HC, 0.25)); if (dir === 'd') R(g, 2, 4, 12, 1, shade(HC, -0.25)); if (side) R(g, Lf ? 0 : 12, 3, 4, 1, shade(HC, -0.25)); }
    if (L.hat === 'beanie') { R(g, 3, 0, 10, 4, HC); R(g, 3, 3, 10, 1, shade(HC, 0.3)); R(g, 7, -1 + 1, 2, 1, shade(HC, -0.2)); }
    if (L.hat === 'headphones') { R(g, 3, 1, 10, 1, HC); if (!side) { R(g, 1, 6, 2, 4, HC); R(g, 13, 6, 2, 4, HC); } else R(g, Lf ? 9 : 5, 5, 3, 4, HC); }
    if (L.hat === 'flower') { const fx = side ? (Lf ? 10 : 3) : 11; R(g, fx, 2, 3, 3, HC); R(g, fx + 1, 3, 1, 1, '#fff6c8'); }
    if (L.hat === 'beret') { R(g, 3, 2, 10, 2, HC); R(g, 5, 0, 7, 2, HC); R(g, 4, 3, 9, 1, shade(HC, -0.25)); R(g, 9, 0, 1, 1, shade(HC, 0.3)); }
    if (L.hat === 'cowboy') { R(g, 1, 4, 14, 1, shade(HC, -0.28)); R(g, 3, 2, 10, 2, HC); R(g, 5, 0, 6, 2, HC); R(g, 6, 2, 4, 1, shade(HC, -0.2)); }
    if (L.hat === 'straw') { R(g, 1, 4, 14, 1, '#8a5a2c'); R(g, 2, 3, 12, 1, HC); R(g, 4, 1, 8, 2, HC); R(g, 6, 0, 4, 1, shade(HC, 0.2)); R(g, 3, 3, 10, 1, shade(HC, -0.15)); }
    if (L.hat === 'topHat') { R(g, 3, 4, 10, 1, shade(HC, -0.25)); R(g, 4, 1, 8, 3, HC); R(g, 5, 0, 6, 1, HC); R(g, 5, 1, 1, 2, shade(HC, 0.25)); }
    if (L.hat === 'wizard' || L.hat === 'witch') { R(g, 2, 4, 12, 1, shade(HC, -0.25)); R(g, 4, 3, 8, 1, HC); R(g, 5, 2, 6, 1, HC); R(g, 7, 1, 3, 1, HC); R(g, 8, 0, 2, 1, HC); if (L.hat === 'witch') R(g, 6, 3, 4, 1, '#e8b13a'); else R(g, 8, 2, 1, 1, '#e8b13a'); }
    if (L.hat === 'crown' || L.hat === 'tiara') { R(g, 3, 3, 10, 2, HC); R(g, 3, 1, 2, 2, HC); R(g, 7, 0, 2, 3, HC); R(g, 11, 1, 2, 2, HC); R(g, 4, 3, 8, 1, shade(HC, 0.28)); if (L.hat === 'tiara') R(g, 7, 2, 2, 1, '#d0569a'); else { R(g, 5, 2, 1, 1, '#c4513f'); R(g, 10, 2, 1, 1, '#2457d6'); } }
    if (L.hat === 'mushroom') { R(g, 2, 3, 12, 2, shade(HC, -0.25)); R(g, 3, 1, 10, 2, HC); R(g, 5, 0, 6, 1, HC); R(g, 5, 2, 2, 1, '#f2ede4'); R(g, 10, 1, 2, 1, '#f2ede4'); }
    if (L.hat === 'frog') { R(g, 3, 2, 10, 3, HC); R(g, 4, 1, 3, 2, HC); R(g, 9, 1, 3, 2, HC); R(g, 5, 1, 1, 1, '#f2ede4'); R(g, 10, 1, 1, 1, '#f2ede4'); R(g, 5, 1, 1, 1, '#2b2220'); R(g, 10, 1, 1, 1, '#2b2220'); }
    if (L.hat === 'animalEars') { R(g, 3, 2, 10, 2, HC); R(g, 3, 0, 3, 3, HC); R(g, 10, 0, 3, 3, HC); R(g, 4, 1, 1, 1, shade(HC, 0.35)); R(g, 11, 1, 1, 1, shade(HC, 0.35)); }
    if (L.hat === 'hood') { R(g, 2, 2, 2, 7, HC); R(g, 12, 2, 2, 7, HC); R(g, 3, 0, 10, 3, HC); R(g, 3, 2, 10, 1, shade(HC, 0.22)); }
    if (L.hat === 'helmet' || L.hat === 'hardHat') { R(g, 3, 2, 10, 3, HC); R(g, 4, 1, 8, 1, HC); R(g, 6, 0, 4, 1, HC); R(g, 2, 4, 12, 1, shade(HC, -0.25)); if (L.hat === 'helmet') R(g, 6, 3, 4, 1, '#8fd0dc'); else R(g, 7, 1, 2, 1, '#fff0a8'); }
    if (L.hat === 'bucket') { R(g, 2, 3, 12, 1, shade(HC, -0.25)); R(g, 4, 1, 8, 2, HC); R(g, 5, 0, 6, 1, HC); R(g, 4, 3, 8, 1, shade(HC, 0.2)); }
    if (L.hat === 'sailor') { R(g, 3, 2, 10, 3, HC); R(g, 5, 1, 6, 1, HC); R(g, 3, 4, 10, 1, '#f2ede4'); R(g, 7, 1, 2, 1, '#c4513f'); }
    if (L.hat === 'leafCrown') { R(g, 3, 3, 10, 1, shade(HC, -0.25)); [[3,2],[5,1],[7,2],[9,1],[11,2]].forEach(([x,y],i) => { R(g, x, y, 2, 2, i % 2 ? shade(HC, 0.2) : HC); }); }
    if (L.hat === 'chef') { R(g, 4, 3, 8, 2, HC); R(g, 3, 1, 4, 3, HC); R(g, 6, 0, 4, 4, HC); R(g, 9, 1, 4, 3, HC); R(g, 4, 4, 8, 1, shade(HC, -0.2)); }
    if (L.hat === 'viking') { R(g, 3, 3, 10, 2, HC); R(g, 4, 1, 8, 2, HC); R(g, 2, 0, 2, 3, '#f2ede4'); R(g, 12, 0, 2, 3, '#f2ede4'); R(g, 3, 0, 1, 2, shade(HC, 0.25)); R(g, 12, 0, 1, 2, shade(HC, 0.25)); }
    if (L.hat === 'turban') { R(g, 3, 2, 10, 3, HC); R(g, 4, 0, 8, 2, HC); R(g, 5, 1, 6, 1, shade(HC, 0.25)); R(g, 7, 1, 2, 2, shade(HC, -0.2)); R(g, 8, 1, 1, 1, '#e8b13a'); }
    if (L.hat === 'bandana') { R(g, 3, 2, 10, 2, HC); R(g, 3, 3, 2, 2, HC); if (side) R(g, Lf ? 11 : 3, 3, 4, 2, shade(HC, -0.2)); else R(g, 12, 3, 2, 3, shade(HC, -0.2)); }
    if (L.hat === 'bow') { R(g, 5, 1, 3, 3, HC); R(g, 9, 1, 3, 3, HC); R(g, 8, 2, 1, 2, shade(HC, -0.2)); R(g, 6, 2, 1, 1, shade(HC, 0.3)); R(g, 10, 2, 1, 1, shade(HC, 0.3)); }
    if (L.hat === 'flowerCrown') { R(g, 3, 3, 10, 1, shade(HC, -0.25)); [[3,2],[6,1],[9,2],[11,1]].forEach(([x,y],i) => { R(g, x, y, 2, 2, i % 2 ? '#e8b13a' : HC); R(g, x + 1, y, 1, 1, '#f2ede4'); }); }
    if (L.hat === 'halo') { R(g, 5, 0, 6, 1, '#e8b13a'); R(g, 4, 1, 1, 1, '#e8b13a'); R(g, 11, 1, 1, 1, '#e8b13a'); R(g, 5, 2, 6, 1, '#e8b13a'); }
    if (L.hat === 'pumpkin') { R(g, 4, 2, 8, 3, HC); R(g, 3, 3, 1, 2, shade(HC, -0.15)); R(g, 12, 3, 1, 2, shade(HC, -0.15)); R(g, 7, 0, 2, 2, '#4c8f3f'); R(g, 6, 1, 1, 1, '#4c8f3f'); R(g, 6, 3, 1, 2, shade(HC, 0.25)); R(g, 9, 3, 1, 2, shade(HC, 0.25)); }
    if (L.hat === 'skull') { R(g, 4, 1, 8, 4, HC); R(g, 3, 2, 1, 2, HC); R(g, 12, 2, 1, 2, HC); R(g, 5, 3, 2, 2, '#2b2220'); R(g, 9, 3, 2, 2, '#2b2220'); R(g, 7, 4, 2, 1, '#2b2220'); }
    if (L.hat === 'mask') { R(g, 4, 6, 8, 3, HC); R(g, 3, 7, 2, 1, shade(HC, -0.2)); R(g, 11, 7, 2, 1, shade(HC, -0.2)); if (side) R(g, Lf ? 9 : 5, 6, 1, 2, '#f2ede4'); else { R(g, 5, 7, 2, 1, '#f2ede4'); R(g, 9, 7, 2, 1, '#f2ede4'); } }
  });
  sprCache.set(k, c); return c;
}

/* ---------- zones ---------- */
const PZ = [
  [29, 1, 38, 10, 'meeting', 'Meeting Room'], [1, 1, 10, 10, 'private', 'Private Offices'], [1, 29, 11, 34, 'focus', 'Focus Room'],
  [1, 12, 10, 20, 'general', 'General Lounge'], [29, 12, 38, 19, 'design', 'Design Studio'], [13, 4, 19, 9, 'dev', 'Development'],
  [20, 4, 26, 9, 'marketing', 'Marketing'], [13, 11, 19, 16, 'designpod', 'Design team'], [20, 11, 26, 16, 'productpod', 'Product & Operations'], [6, 22, 9, 27, 'dressing', 'Dressing Room'], [1, 22, 4, 27, 'restroom', 'Restroom'],
  [30, 21, 38, 26, 'kitchen', 'Kitchen'], [30, 28, 38, 34, 'dining', 'Dining'], [13, 23, 27, 34, 'reception', 'Reception'], [12, 1, 27, 22, 'work', 'Work Floor'],
];
const zoneOf = (tx, ty) => PZ.find(z => tx >= z[0] && tx <= z[2] && ty >= z[1] && ty <= z[3]);
const zone = k => PZ.find(z => z[4] === k);
const ROOMKEYS = ['general', 'design', 'dev', 'marketing', 'meeting', 'private', 'focus'];
const inRect = (x, y, r) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
const PODS = { dev: [14, 5, 18, 8], marketing: [21, 5, 25, 8], design: [14, 12, 18, 15], ops: [21, 12, 25, 15] };
const DOOR = { x: 19, y: 34 };
const walk = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH && !solid[idx(x, y)];
const freeTiles = {};
function recomputeFree() { PZ.forEach(z => { const a = []; for (let y = z[1]; y <= z[3]; y++) for (let x = z[0]; x <= z[2]; x++) if (walk(x, y)) a.push({ x, y }); freeTiles[z[4]] = a; }); }
recomputeFree();
PODS.product = PODS.ops;

function bfs(sx, sy, tx, ty) {
  if (!walk(tx, ty)) return null;
  const prev = new Int32Array(MW * MH).fill(-1), q = [idx(sx, sy)]; prev[idx(sx, sy)] = idx(sx, sy);
  const goal = idx(tx, ty);
  for (let h = 0; h < q.length; h++) {
    const c = q[h]; if (c === goal) break;
    const cx = c % MW, cy = (c / MW) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (!walk(nx, ny)) continue; const n = idx(nx, ny); if (prev[n] !== -1) continue; prev[n] = c; q.push(n); }
  }
  if (prev[goal] === -1) return null;
  const path = []; let c = goal; while (c !== idx(sx, sy)) { path.unshift({ x: c % MW, y: (c / MW) | 0 }); c = prev[c]; }
  return path;
}

/* ---------- desk decoration ---------- */
const DESKOPT = {
  plant: ['none', 'cactus', 'succulent', 'flower', 'bonsai'],
  mug: ['#c4513f', '#2457d6', '#1b8f4e', '#e8b13a', '#f2ede4', '#7a4fd0'],
  gadget: ['none', 'lamp', 'photo', 'books', 'figurine', 'cat'],
  plate: ['#e8b13a', '#c8ccce', '#c4513f', '#2457d6', '#1b8f4e'],
  screens: ['none', 'laptop', '1', '2', '3'],
};
function randomDesk() { const o = {}; for (const k in DESKOPT) o[k] = DESKOPT[k][Math.floor(Math.random() * DESKOPT[k].length)]; return o; }
const deskCache = new Map();
function deskDeco(D) {
  const k = JSON.stringify(D); if (deskCache.has(k)) return deskCache.get(k);
  const c = mk(16, 16, (g) => {
    if (D.plant === 'cactus') { R(g, 12, 9, 3, 3, '#b8603a'); R(g, 13, 4, 1, 5, '#4c8f3f'); R(g, 12, 6, 1, 2, '#4c8f3f'); R(g, 14, 5, 1, 2, '#4c8f3f'); }
    if (D.plant === 'succulent') { R(g, 12, 9, 3, 3, '#e9eef0'); oval(g, 13, 7, 2, 2, '#6dbb52'); R(g, 13, 5, 1, 2, '#4c8f3f'); }
    if (D.plant === 'flower') { R(g, 12, 9, 3, 3, '#7aa2c9'); R(g, 13, 5, 1, 4, '#4c8f3f'); R(g, 12, 3, 3, 3, '#e05a8a'); R(g, 13, 4, 1, 1, '#fff6c8'); }
    if (D.plant === 'bonsai') { R(g, 11, 10, 5, 2, '#6e4422'); R(g, 13, 7, 1, 3, '#6e4422'); oval(g, 13, 6, 3, 2, '#3c7a35'); }
    R(g, 1, 8, 3, 4, D.mug); R(g, 4, 9, 1, 2, D.mug); R(g, 1, 8, 3, 1, '#ffffff66');
    if (D.gadget === 'lamp') { R(g, 6, 11, 4, 1, '#3a3d48'); R(g, 7, 6, 1, 5, '#3a3d48'); R(g, 6, 4, 4, 2, '#e8b13a'); R(g, 6, 6, 4, 1, '#fff3c0'); }
    if (D.gadget === 'photo') { R(g, 6, 6, 5, 6, '#6e4422'); R(g, 7, 7, 3, 4, '#9fd3e0'); R(g, 7, 9, 3, 2, '#5aa84a'); }
    if (D.gadget === 'books') { R(g, 5, 9, 7, 1, '#c4513f'); R(g, 6, 8, 6, 1, '#4a7fc1'); R(g, 5, 10, 7, 2, '#e8a93a'); }
    if (D.gadget === 'figurine') { R(g, 7, 10, 3, 2, '#3a3d48'); R(g, 7, 6, 3, 4, '#d0569a'); R(g, 7, 5, 3, 2, '#f2c9a0'); }
    if (D.gadget === 'cat') { R(g, 6, 8, 5, 4, '#e8a93a'); R(g, 6, 7, 1, 1, '#e8a93a'); R(g, 10, 7, 1, 1, '#e8a93a'); R(g, 7, 9, 1, 1, '#2b2220'); R(g, 9, 9, 1, 1, '#2b2220'); }
    const scr = (x, y, w, h) => { R(g, x, y, w, h, '#2b2d3a'); R(g, x + 1, y + 1, w - 2, h - 2, '#7fc6d9'); R(g, x + 1, y + 1, Math.max(1, w - 4), 1, '#c6eef6'); R(g, x + (w >> 1), y + h, 1, 1, '#2b2d3a'); };
    if (D.screens === 'laptop') { R(g, 5, 11, 7, 1, '#9aa3ab'); scr(6, 6, 5, 5); }
    const n = +D.screens || 0; if (n === 1) scr(5, 0, 6, 5); if (n === 2) { scr(1, 0, 6, 5); scr(9, 0, 6, 5); } if (n === 3) { scr(0, 1, 5, 4); scr(5, 0, 6, 5); scr(11, 1, 5, 4); }
    R(g, 4, 13, 8, 2, D.plate); R(g, 5, 13, 6, 1, '#ffffff55');
  });
  deskCache.set(k, c); return c;
}

/* ---------- object interactions ---------- */
const go2 = (r, tab) => () => { if (tab) UI.tabs[tab[0]] = tab[1]; go(r); };
const flavor = (t, b) => () => toast(t, b || '', 'info');
const ACT = {
  'โต๊ะของคุณ': ['Desk · My Tasks', go2('tasks')], 'โต๊ะทีมการตลาด': ['Desk · My Tasks', go2('tasks')], 'โต๊ะทีมบัญชี': ['Desk · My Tasks', go2('tasks')], 'โต๊ะทีมดีไซน์': ['Desk · My Tasks', go2('tasks')],
  'โต๊ะประชุม': ['Meeting table · Meetings', go2('meetings')],
  'ชั้นหนังสือ': ['Bookshelf · Knowledge base', go2('files', ['files', 'kb'])],
  'ตู้เอกสาร': ['Cabinet · File Center', go2('files', ['files', 'files'])], 'ตู้ลิ้นชัก': ['Cabinet · File Center', go2('files', ['files', 'files'])], 'กล่องเอกสาร': ['Archive box · File Center', go2('files', ['files', 'files'])],
  'เครื่องถ่ายเอกสาร': ['Printer · Submit work', () => { go('submissions'); setTimeout(() => A.submitWork({}), 60); }],
  'โต๊ะแยกเอกสาร': ['Sorting desk · Follow-ups', go2('followups')],
  'เคาน์เตอร์ต้อนรับ': ['Reception · Announcements', go2('announcements')],
  'โซฟารับแขก': ['Lobby · Employees & HR', go2('employees')],
  'โต๊ะหัวหน้า': ['Director desk · Reports', go2('reports')],
  'โต๊ะรองหัวหน้า': ['Manager desk · Overview', go2('dashboard')],
  'โต๊ะครีเอทีฟ': ['Studio desk · Projects', go2('projects')],
  'โต๊ะกลม': ['Lounge table · Chat', go2('chat')], 'โต๊ะครัว': ['Kitchen table · Chat', go2('chat')], 'โต๊ะทานข้าว': ['Dining table · People & rooms', go2('office')],
  'บีนแบ็ก': ['Beanbag · Availability & DND', go2('availability')],
  'ลูกบอลโยคะ': ['Yoga ball · 25 min focus', () => startFocus(25)],
  'เครื่องชงกาแฟ': ['Coffee machine · Coffee break', () => { const m = me(); setTemp(m, 'away', now() + 10 * MIN, 'manual'); log(ME, 'took a coffee break'); toast('Coffee break', 'Status set to Away for 10 minutes.', 'ok'); commit(); }],
  'ตู้น้ำดื่ม': ['Water cooler', flavor('Refreshing', 'You drank a glass of cold water.')],
  'ตู้เย็น': ['Fridge', flavor('Fridge', 'Someone labelled their milk. Better not.')], 'ตู้เย็นใหญ่': ['Fridge', flavor('Fridge', 'Full of lunch boxes with names on them.')],
  'Mirror': ['Mirror · Dressing room', () => openEditor('look')], 'Wardrobe': ['Wardrobe · Dressing room', () => openEditor('look')], 'Clothes rack': ['Clothes rack · Dressing room', () => openEditor('look')],
  'ต้นไม้': ['Plant', flavor('Plant', 'You watered the plant.')],
};
const booth = add({ x: 7, y: 18, w: 2, h: 1, top: 10, name: 'DJ booth', draw: (g, W, H) => { R(g, 0, 8, W, H - 8, '#2b2233'); R(g, 1, 9, W - 2, 3, '#3d3150'); R(g, 0, 6, W, 4, '#4a3d5e'); oval(g, 8, 6, 5, 2, '#1a1a22'); oval(g, 24, 6, 5, 2, '#1a1a22'); R(g, 7, 5, 2, 1, '#e05a8a'); R(g, 23, 5, 2, 1, '#5ad0e0'); [4, 9, 14, 19, 24].forEach((x, i) => R(g, x, 14, 3, 2, ['#e05a8a', '#e8b13a', '#5ad06a', '#5ad0e0', '#8a5fd0'][i])); R(g, 14, 2, 4, 4, '#c8ccce'); R(g, 15, 0, 2, 2, '#c8ccce'); } });
ACT['DJ booth'] = ['DJ booth · Music', () => go('dj')];
recomputeFree();
objs.forEach(o => { if (ACT[o.name]) o.act = ACT[o.name]; });
const HOTSPOTS = [{ x: 19, y: 0, w: 1, h: 1, act: ['Wall clock · Calendar', go2('calendar')] }, { x: 31, y: 0, w: 5, h: 1, act: ['Whiteboard · Projects', go2('projects')] }];
function actAt(tx, ty) {
  const o = objs.filter(o => o.act && tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h).sort((a, b) => b.sy - a.sy)[0];
  if (o) return o;
  return HOTSPOTS.find(h => tx >= h.x && tx < h.x + h.w && ty >= h.y && ty < h.y + h.h) || null;
}
function myDeskTile() { const u = user(ME); if (!u) return null; const s = homeSeat(u); if (!s) return null; const v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[s.face] || [0, -1]; return { x: s.x + v[0], y: s.y + v[1] }; }
function facing(p) { const t = tileOf(p), v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[p.dir]; return { x: t.x + v[0], y: t.y + v[1] }; }
function interact() {
  const p = P.get(ME); if (!p) return;
  if (placing) return;
  const sc = seatPrompt(p); if (sc && sc.can) { claimSeat(sc.chair); return; }
  const f = facing(p); if (f.x === 19 && f.y === 25) { greetVisitor(); return; }
  const a = actAt(f.x, f.y);
  if (a) { a.act[1](); return; }
  const other = [...P.values()].find(q => q.id !== ME && !q.hidden && tileOf(q).x === f.x && tileOf(q).y === f.y);
  if (other) { openDrawer('user', other.id); return; }
  const rp = [...RP.values()].find(q => Math.floor(q.x / T) === f.x && Math.floor((q.y - 4) / T) === f.y);
  if (rp) showRemote(rp);
}

/* ---------- permanent desks and placing new desks ---------- */
function seatPrompt(p) {
  if (!p || p.moving || p.hidden) return null;
  const tl = tileOf(p), ch = CHAIRS.find(c => c.x === tl.x && c.y === tl.y); if (!ch) return null;
  if (ch.x === 19 && ch.y === 25) return { chair: ch, can: false, label: 'Reception desk' };
  const u = user(ME); if (!u || u.seat === tl.x + ',' + tl.y) return null;
  const hs = homeSeat(u); if (hs && hs.x === tl.x && hs.y === tl.y) return null;
  const owner = S.users.find(x => x.id !== ME && x.seat === tl.x + ',' + tl.y);
  if (owner) return { chair: ch, can: false, label: 'Desk of ' + owner.name.split(' ')[0] };
  return { chair: ch, can: true, label: 'Make this my desk' };
}
function claimSeat(ch) {
  const u = user(ME); u.seat = ch.x + ',' + ch.y; log(ME, 'chose a permanent desk');
  toast('This is your desk now', 'You will come back to this seat whenever you are at your desk.', 'ok'); commit();
}
const built = new Map();
function buildDesk(d) {
  const o = add({ x: d.x, y: d.y, w: 2, h: 1, name: 'Custom desk', draw: deskDraw() });
  o.custom = d.id; o.act = ['Desk', () => deskMenu(o)];
  chair(d.x, d.y + 1, '#4a4f5c', 'u'); const c = CHAIRS[CHAIRS.length - 1]; c.custom = d.id; objs[objs.length - 1].custom = d.id;
  built.set(d.id, true);
}
function removeBuilt(id) {
  for (let i = objs.length - 1; i >= 0; i--) if (objs[i].custom === id) { const o = objs[i]; if (o.solid !== false) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (!wall[idx(x, y)]) solid[idx(x, y)] = 0; objs.splice(i, 1); }
  for (let i = CHAIRS.length - 1; i >= 0; i--) if (CHAIRS[i].custom === id) CHAIRS.splice(i, 1);
  built.delete(id);
}
function syncDesks() {
  const list = S.desks || (S.desks = []); let ch = false;
  list.forEach(d => { if (!built.has(d.id)) { buildDesk(d); ch = true; } });
  for (const id of [...built.keys()]) if (!list.some(d => d.id === id)) { removeBuilt(id); ch = true; }
  if (ch) { recomputeFree(); seatSig = ''; S.users.forEach(u => { if (u.seat && !CHAIRS.some(c => c.x + ',' + c.y === u.seat)) u.seat = null; }); }
}
function deskMenu(o) {
  const d = (S.desks || []).find(x => x.id === o.custom); const mine = d && (d.by === ME || role() === 'admin');
  openModal(t_('Desk'), `<p class="muted" style="margin:0">${d ? esc(t_('Added by') + ' ' + uname(d.by)) : ''}</p>`,
    `${mine ? `<button type="button" class="btn danger" data-a="pxRemoveDesk" data-id="${o.custom}">${t_('Remove this desk')}</button>` : ''}<span style="flex:1"></span><button type="button" class="btn" data-a="closeModal">${t_('Close')}</button><button type="button" class="btn primary" data-a="openWin" data-v="tasks">${t_('Open My Tasks')}</button>`);
}
function removeDesk(id) { S.desks = (S.desks || []).filter(d => d.id !== id); closeModal(); toast(t_('Desk removed'), '', 'info'); commit(); }
let placing = false, ghost = null;
function startPlacing() { placing = true; ghost = null; closeModal(); go('floor'); toast(t_('Place a desk'), t_('Click an empty spot on the floor. Esc to cancel.'), 'info'); }
function validDesk(x, y) {
  if (y < 1 || y + 1 > MH - 3) return false;
  const tiles = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]];
  return tiles.every(([a, b]) => walk(a, b) && !CHAIRS.some(c => c.x === a && c.y === b)) && ![...P.values()].some(q => { const tl = tileOf(q); return tiles.some(([a, b]) => a === tl.x && b === tl.y); });
}

/* ---------- people ---------- */
const P = new Map();
const tileOf = p => ({ x: Math.floor(p.x / T), y: Math.floor((p.y - 4) / T) });
const reserved = () => new Set([...P.values()].filter(p => p.seat).map(p => p.seat));
let seatSig = '', seatMapC = new Map();
function seatMap() {
  const sig = S.users.map(u => u.id + ':' + u.dept + ':' + (u.seat || '')).join('|') + '#' + CHAIRS.length;
  if (sig === seatSig) return seatMapC;
  seatSig = sig; const m = new Map(), taken = new Set();
  const key = c => c.x + ',' + c.y;
  S.users.forEach(u => { if (u.seat) { const c = CHAIRS.find(c => key(c) === u.seat); if (c && !taken.has(u.seat)) { m.set(u.id, c); taken.add(u.seat); } } });
  const work = CHAIRS.filter(c => inRect(c.x, c.y, [13, 4, 26, 16]));
  S.users.forEach(u => {
    if (m.has(u.id)) return;
    const pod = PODS[u.dept] || PODS.ops;
    const extra = u.dept === 'design' ? zone('design') : null;
    const c = CHAIRS.find(c => inRect(c.x, c.y, pod) && !taken.has(key(c))) || (extra && CHAIRS.find(c => inRect(c.x, c.y, extra) && !taken.has(key(c)))) || work.find(c => !taken.has(key(c))) || CHAIRS.find(c => c.custom && !taken.has(key(c))) || work[0];
    if (c) { m.set(u.id, c); taken.add(key(c)); }
  });
  seatMapC = m; return m;
}
function homeSeat(u) { return seatMap().get(u.id) || CHAIRS[0]; }
const seatOwner = (x, y) => { for (const [id, c] of seatMap()) if (c.x === x && c.y === y) return user(id); return null; };
function desiredKey(u) {
  const s = u.status;
  if (s === 'offline') return 'exit';
  if (u.room && ROOMKEYS.includes(u.room)) return u.room;
  if (s === 'meeting') return 'meeting';
  if (s === 'focus') return 'focus';
  if (s === 'away') return 'break';
  return 'home';
}
function targetFor(u, key, p) {
  const taken = reserved(); if (p && p.seat) taken.delete(p.seat);
  if (key === 'exit') return { x: DOOR.x, y: DOOR.y };
  if (key === 'home') return Object.assign({}, homeSeat(u), { seat: true });
  const zs = key === 'break' ? ['kitchen', 'dining'] : [key];
  const chairs = CHAIRS.filter(c => zs.some(z => inRect(c.x, c.y, zone(z))) && !taken.has(c.x + ',' + c.y));
  if (chairs.length && (key !== 'general' || Math.random() < 0.7)) return Object.assign({}, chairs[Math.floor(Math.random() * chairs.length)], { seat: true });
  const tiles = zs.flatMap(z => freeTiles[z]).filter(t => !taken.has(t.x + ',' + t.y));
  return tiles[Math.floor(Math.random() * tiles.length)] || { x: DOOR.x, y: DOOR.y - 1 };
}
function sendTo(p, t) {
  const cur = tileOf(p);
  const path = bfs(cur.x, cur.y, t.x, t.y);
  p.path = path || []; p.goal = t; p.seat = t.seat ? t.x + ',' + t.y : null; p.face = t.face || null;
  if (!path) { p.x = t.x * T + 8; p.y = t.y * T + 12; }
}
function place(p, t) { p.x = t.x * T + 8; p.y = t.y * T + 12; p.path = []; p.goal = t; p.seat = t.seat ? t.x + ',' + t.y : null; p.face = t.face || null; if (t.face) p.dir = t.face; }
function spawn(id) {
  const u = user(id); if (!u) return;
  let p = P.get(id);
  if (!p) { p = { id, x: 0, y: 0, dir: 'u', step: 0, path: [], key: desiredKey(u), hidden: false, bubble: null, wait: 0 }; P.set(id, p); }
  p.hidden = false; p.key = desiredKey(u); place(p, DOOR); p.dir = 'u';
  sendTo(p, targetFor(u, p.key, p)); p.manual = false; p.pending = null;
}
function sync() {
  if (!S) return;
  S.users.forEach(u => {
    let p = P.get(u.id);
    const key = desiredKey(u);
    if (!p) {
      p = { id: u.id, x: 0, y: 0, dir: 'd', step: 0, path: [], key, hidden: key === 'exit', bubble: null, wait: 0, errand: null };
      P.set(u.id, p);
      place(p, key === 'exit' ? DOOR : targetFor(u, key, p));
      return;
    }
    if (key === p.key) return;
    p.key = key; p.errand = null;
    if (p.hidden && key !== 'exit') { p.hidden = false; place(p, DOOR); p.dir = 'u'; }
    const t = tileOf(p), z = zoneOf(t.x, t.y);
    if (u.id === ME && (key === 'home' || (z && (z[4] === key || (key === 'break' && ['kitchen', 'dining'].includes(z[4])))))) return;
    sendTo(p, targetFor(u, key, p));
  });
  for (const id of [...P.keys()]) if (!user(id)) P.delete(id);
}
let lastMsg = Date.now();
function step(dt) {
  syncDesks();
  sync();
  const liveUsers = new Set((CAP.peers || []).map(pe => pe.presence && pe.presence.uid).filter(Boolean));
  const t0 = Date.now();
  S.messages.forEach(m => { if (m.at > lastMsg) { const p = P.get(m.from); if (p && !p.hidden) p.bubble = { text: m.text.length > 26 ? m.text.slice(0, 25) + '…' : m.text, until: t0 + 5000 }; } });
  if (S.messages.length) lastMsg = Math.max(lastMsg, ...S.messages.slice(-5).map(m => m.at));
  P.forEach(p => {
    const u = user(p.id); if (!u) return;
    if (p.id !== ME && window.ND_HOSTED && !liveUsers.has(p.id) && u.status !== 'offline') {
      const home = homeSeat(u);
      p.path = []; p.errand = null; p.moving = false; p.key = desiredKey(u);
      if (home) { p.x = home.x * T + 8; p.y = home.y * T + 12; p.dir = home.face || 'u'; p.seat = home.x + ',' + home.y; p.hidden = false; }
      return;
    }
    if (p.id === ME && kbMove(p, dt)) return;
    if (p.path.length) {
      const n = p.path[0], tx = n.x * T + 8, ty = n.y * T + 12, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
      const sp = (p.id === ME ? 76 : 44) * dt;
      if (d <= sp) { p.x = tx; p.y = ty; p.path.shift(); if (!p.path.length) arrive(p, u); }
      else { p.x += dx / d * sp; p.y += dy / d * sp; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); }
      p.step += dt * 8; p.moving = true;
    } else {
      p.moving = false; p.wait -= dt;
      if (p.id !== ME && !window.ND_HOSTED && p.wait <= 0 && !p.hidden) {
        p.wait = 4 + Math.random() * 10;
        if (p.errand) { p.errand = null; sendTo(p, targetFor(u, p.key, p)); }
        else if (p.key === 'home' && u.status === 'online' && Math.random() < 0.15) { p.errand = true; sendTo(p, pick([{ x: 33, y: 22 }, { x: 31, y: 33 }, { x: 37, y: 22 }])); }
        else if (['general', 'design', 'break'].includes(p.key) && Math.random() < 0.35) sendTo(p, targetFor(u, p.key, p));
      }
    }
  });
}
function arrive(p, u) {
  if (p.key === 'exit' && p.goal && p.goal.x === DOOR.x && p.goal.y === DOOR.y) { p.hidden = true; return; }
  if (p.face) p.dir = p.face;
  if (p.errand) p.wait = 3 + Math.random() * 4;
  if (p.id === ME) {
    if (p.pending) { const o = p.pending; p.pending = null; const cx = o.x + (o.w || 1) / 2 - 0.5, cy = o.y + (o.h || 1) / 2 - 0.5, t = tileOf(p); const dx = cx - t.x, dy = cy - t.y; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'); o.act[1](); }
    if (p.manual) { p.manual = false; arrivedMe(p); }
  }
}
let lastZoneMe = null;
function arrivedMe(p) {
  const t = tileOf(p), z = zoneOf(t.x, t.y), k = z ? z[4] : null, m = me();
  if (k === lastZoneMe) return; lastZoneMe = k;
  if (k && ROOMKEYS.includes(k) && m.room !== k) A.joinRoom({ id: k });
  else if (m.room && k !== m.room) A.leaveRoom();
  if (k === 'dressing') openEditor('look');
  p.key = desiredKey(m);
}
/* keyboard: walk with WASD / arrows, E or Space to use what you face */
const keys = {};
const blockedKeys = () => !user(ME) || UI.route !== 'floor' || document.getElementById('overlay').innerHTML || UI.drawer || document.getElementById('onb')?.innerHTML || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
const KM = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
addEventListener('keydown', e => {
  if (placing && e.key === 'Escape') { placing = false; ghost = null; e.stopImmediatePropagation(); return; }
  if (blockedKeys()) { for (const k in keys) keys[k] = 0; return; }
  if ((e.code === 'Space' || e.code === 'Enter') && document.activeElement && document.activeElement.tagName === 'BUTTON') return;
  if (KM[e.code]) { keys[KM[e.code]] = 1; e.preventDefault(); }
  else if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); interact(); }
  else if (e.code === 'KeyM' && !e.repeat) { mode = mode === 'fit' ? 'follow' : 'fit'; render(); }
  else if (e.code === 'KeyT' && !e.repeat) { e.preventDefault(); const s = document.getElementById('sayInput'); if (s) s.focus(); }
});
addEventListener('keyup', e => { if (KM[e.code]) keys[KM[e.code]] = 0; });
addEventListener('blur', () => { for (const k in keys) keys[k] = 0; });
function padKey(k, on) { keys[k] = on ? 1 : 0; }
function kbMove(p, dt) {
  const dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
  if (!dx && !dy) { if (p.kb) { p.kb = false; p.manual = false; p.moving = false; arrivedMe(p); } return false; }
  p.kb = true; p.path = []; p.seat = null; p.pending = null;
  const sp = 76 * dt, l = Math.hypot(dx, dy);
  const free = (x, y) => [[-5, -5], [5, -5], [-5, 0], [5, 0]].every(([ox, oy]) => walk(Math.floor((x + ox) / T), Math.floor((y + oy) / T)));
  if (dx && free(p.x + dx / l * sp, p.y)) p.x += dx / l * sp;
  if (dy && free(p.x, p.y + dy / l * sp)) p.y += dy / l * sp;
  p.dir = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u'; p.step += dt * 9; p.moving = true;
  return true;
}

/* ---------- live players: other people who have this office open right now ---------- */
const RP = new Map();
let lastNet = 0, lastNetStr = '';
function netPush(force) {
  if (force) { lastNetStr = ''; lastNet = 0; }
  if (!CAP.room || !user(ME)) return;
  const p = P.get(ME), u = me(); if (!p) return;
  const t = Date.now(); if (t - lastNet < 160) return;
  const pres = { uid: ME, n: u.name.slice(0, 40), t: (u.title || '').slice(0, 40), lk: lookOf(u), x: Math.round(p.x), y: Math.round(p.y), d: p.dir, s: u.status, m: !!p.moving, mu: !!S.voice.muted, df: !!S.voice.deafened, vr: S.voice.room || null, vm: S.voice.mode === 'shout' ? 'shout' : 'near', w: (activityOf(u, true) || { text: '' }).text.slice(0, 40), wk: (activityOf(u, true) || { kind: '' }).kind };
  const str = JSON.stringify(pres); if (str === lastNetStr) return;
  lastNet = t; lastNetStr = str;
  CAP.room.presence(pres).catch(() => {});
}
const liveIds = () => { const s = new Set(); RP.forEach(r => { if (r.uid) s.add(r.uid); }); s.delete(ME); return s; };
function syncRemote(dt) {
  const seen = new Set();
  (CAP.peers || []).forEach(pe => {
    if (pe.isMe || !pe.presence || typeof pe.presence.x !== 'number') return;
    seen.add(pe.peer);
    const pr = pe.presence; let r = RP.get(pe.peer);
    if (!r) { r = { peer: pe.peer, x: pr.x, y: pr.y, step: 0 }; RP.set(pe.peer, r); }
    r.tx = Math.max(0, Math.min(MW * T, +pr.x || 0)); r.ty = Math.max(0, Math.min(MH * T, +pr.y || 0));
    r.dir = ['u', 'd', 'l', 'r'].includes(pr.d) ? pr.d : 'd'; r.s = PRES[pr.s] ? pr.s : 'online';
    r.uid = String(pr.uid || '').slice(0, 20); r.mu = !!pr.mu; r.df = !!pr.df; r.w = String(pr.w || '').slice(0, 40); r.wk = ['task', 'custom', 'focus', 'meeting', 'break', 'view', 'room'].includes(pr.wk) ? pr.wk : 'custom';
    r.n = String(pr.n || 'Guest').slice(0, 40); r.t = String(pr.t || '').slice(0, 40); r.guest = !!pe.guest;
    const lk = pr.lk && typeof pr.lk === 'object' ? pr.lk : {}; const safe = {};
    for (const k in LOOKOPT) safe[k] = LOOKOPT[k].includes(lk[k]) || (LOOKOPT[k][0][0] === '#' && /^#[0-9a-f]{6}$/i.test(lk[k] || '')) ? lk[k] : LOOKOPT[k][0];
    r.lk = safe;
  });
  for (const k of [...RP.keys()]) if (!seen.has(k)) RP.delete(k);
  RP.forEach(r => { const dx = r.tx - r.x, dy = r.ty - r.y, d = Math.hypot(dx, dy); r.moving = d > 0.6; if (d > 80) { r.x = r.tx; r.y = r.ty; } else if (d > 0.1) { const sp = Math.min(d, 90 * dt); r.x += dx / d * sp; r.y += dy / d * sp; } if (r.moving) r.step += dt * 8; });
}
const NEAR = 4.5 * T;
const clip = s => s.length > 30 ? s.slice(0, 29) + '…' : s;
function remoteSay(msg) {
  if (msg.isMe) return;
  const r = RP.get(msg.peer); const text = String((msg.data && msg.data.text) || '').slice(0, 120); if (!r || !text) return;
  const mode = msg.data && msg.data.mode === 'shout' ? 'shout' : 'near';
  if (S.voice.deafened) { r.bubble = { text: '🎧', until: Date.now() + 2500, mode: 'far' }; return; }
  const p = P.get(ME); const far = mode === 'near' && (!p || Math.hypot(p.x - r.x, p.y - r.y) > NEAR);
  r.bubble = far ? { text: '…', until: Date.now() + 4000, mode: 'far' } : { text: clip(text), until: Date.now() + 6500, mode };
}
function say(text) {
  text = String(text || '').trim().slice(0, 120); if (!text) return;
  if (S.voice.muted) { toast(t_('Your mic is off'), t_('Turn the microphone on to talk.'), 'warn'); return; }
  const mode = S.voice.mode === 'shout' ? 'shout' : 'near';
  const p = P.get(ME); if (p) p.bubble = { text: clip(text), until: Date.now() + 6500, mode };
  if (CAP.room) CAP.room.emit('say', { text, mode }).catch(() => {});
}
function hearCount() { const p = P.get(ME); if (!p) return 0; if (S.voice.mode === 'shout') return RP.size + [...P.values()].filter(q => q.id !== ME && !q.hidden).length; let n = 0; RP.forEach(r => { if (Math.hypot(p.x - r.x, p.y - r.y) <= NEAR) n++; }); P.forEach(q => { if (q.id !== ME && !q.hidden && Math.hypot(p.x - q.x, p.y - q.y) <= NEAR) n++; }); return n; }
function showRemote(r) {
  openModal(r.n, `<div class="row" style="gap:14px"><canvas id="rpcv" width="16" height="24" style="width:64px;image-rendering:pixelated;background:#e9dcc4;border-radius:8px;padding:6px"></canvas><div><b style="font-size:16px">${esc(r.n)}</b>${r.guest ? ' <span class="pill">Guest</span>' : ''}<div class="muted">${esc(r.t)}</div><div style="margin-top:6px"><span class="pill" style="color:${PRES[r.s].c}">${pdot(r.s)}${PRES[r.s].l}</span> <span class="live">Live</span></div></div></div><p class="muted" style="margin:12px 0 0;font-size:12.5px">This person has the office open right now on another device. Press T to say something; they will see a speech bubble.</p>`, `<button type="button" class="btn" data-a="closeModal">Close</button>`);
  setTimeout(() => { const c = document.getElementById('rpcv'); if (c) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sprite(r.lk, 'd', 0), 0, 0); } }, 20);
}

/* ---------- canvas, camera, input ---------- */
const cv = document.createElement('canvas');
cv.className = 'pxcv'; cv.tabIndex = 0; cv.setAttribute('aria-label', 'Office floor. WASD or arrow keys to walk, E to use what you face, click to walk or use objects.');
const ctx = cv.getContext('2d');
let mode = 'follow', cam = null, hover = null, hoverObj = null, running = false, lastT = 0, view = { s: 1, ox: 0, oy: 0 };
const STC = { online: '#2fb36a', busy: '#e08a1e', dnd: '#e04848', focus: '#8b6cf0', meeting: '#3d7bf0', away: '#e3c34a', offline: '#8a96a5' };
function layout() {
  const dpr = devicePixelRatio || 1, cw = cv.clientWidth || 600, ch = cv.clientHeight || 400;
  if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const W = cv.width, H = cv.height, fit = Math.min(W / (MW * T), H / (MH * T));
  const p = P.get(ME);
  if (mode === 'follow' && p) {
    const s = Math.max(fit * 1.6, Math.min(3.2, Math.max(2.2, cw / 420)) * dpr), vw = W / s, vh = H / s;
    const cx = vw >= MW * T ? MW * T / 2 : Math.max(vw / 2, Math.min(MW * T - vw / 2, p.x)), cy = vh >= MH * T ? MH * T / 2 : Math.max(vh / 2, Math.min(MH * T - vh / 2, p.y - 8));
    cam = cam ? { x: cam.x + (cx - cam.x) * 0.15, y: cam.y + (cy - cam.y) * 0.15 } : { x: cx, y: cy };
    view = { s, ox: W / 2 - cam.x * s, oy: H / 2 - cam.y * s };
  } else { cam = null; view = { s: fit, ox: (W - MW * T * fit) / 2, oy: (H - MH * T * fit) / 2 }; }
}
function draw(t) {
  layout();
  const { s, ox, oy } = view, dpr = devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2a1d17'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(s, 0, 0, s, ox, oy);
  ctx.drawImage(bg, 0, 0);
  const list = objs.map(o => ({ sy: o.sy, f: () => ctx.drawImage(o.img, o.px, o.py) }));
  // desk decorations
  S.users.forEach(u => {
    const st = homeSeat(u); if (!st) return; const v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[st.face] || [0, -1];
    const dx = st.x + v[0], dy = st.y + v[1]; const d = u.desk || (u.desk = randomDesk());
    const o = objs.find(o => dx >= o.x && dx < o.x + o.w && dy >= o.y && dy < o.y + o.h);
    list.push({ sy: (o ? o.sy : (dy + 1) * T) + 0.2, f: () => ctx.drawImage(deskDeco(d), dx * T, dy * T - (st.face === 'u' ? 2 : 6)) });
  });
  const me_ = P.get(ME); let prompt = null;
  if (me_ && !me_.hidden && S.voice.mode !== 'shout' && !S.voice.muted) drawRadar(me_, t);
  if (placing && ghost) { const ok = validDesk(ghost.x, ghost.y); ctx.fillStyle = ok ? 'rgba(80,200,120,.45)' : 'rgba(230,70,70,.45)'; ctx.fillRect(ghost.x * T, ghost.y * T, 2 * T, 2 * T); ctx.strokeStyle = ok ? '#2f6b3f' : '#c0392b'; ctx.strokeRect(ghost.x * T + .5, ghost.y * T + .5, 2 * T - 1, 2 * T - 1); }
  const seatP = me_ ? seatPrompt(me_) : null;
  if (me_ && !me_.hidden && !me_.moving && !seatP) { const f = facing(me_); const a = actAt(f.x, f.y); if (a) prompt = a; }
  const hl = hoverObj || prompt;
  if (hl) { ctx.fillStyle = 'rgba(255,230,120,.28)'; ctx.fillRect(hl.x * T, hl.y * T - (hl.top || 0), (hl.w || 1) * T, (hl.h || 1) * T + (hl.top || 0)); }
  const LIVE = liveIds();
  const receptionistSeat = chairAt(19, 25);
  if (receptionistSeat) list.push({ sy: GREETER.y + 0.5, f: () => drawChar(GREETER.look, GREETER.x, GREETER.y, GREETER.dir, 0, { chair: receptionistSeat, atDesk: true }, false, t, GREETER.x) });
  if (UI.route === 'floor' && !GREETER.welcomed) { GREETER.welcomed = true; greetVisitor(); }
  P.forEach(p => {
    if (p.hidden || LIVE.has(p.id)) return; const u = user(p.id); if (!u) return;
    const fr = p.moving ? [0, 1, 0, 2][Math.floor(p.step) % 4] : 0;
    const seat = p.moving ? null : seatedInfo(p.x, p.y, p.dir);
    const working = !!(seat && seat.atDesk && ['online', 'busy', 'dnd'].includes(u.status));
    list.push({ sy: p.y + 0.5, f: () => {
      if (p.id === ME && !seat) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 1, 7, 3, 0, 0, 7); ctx.fill(); }
      drawChar(lookOf(u), p.x, p.y, seat ? seat.chair.face : p.dir, fr, seat, working, t, p.x);
    } });
  });
  RP.forEach(r => { const fr = r.moving ? [0, 1, 0, 2][Math.floor(r.step) % 4] : 0; const seat = r.moving ? null : seatedInfo(r.x, r.y, r.dir); const working = !!(seat && seat.atDesk && r.wk === 'task'); list.push({ sy: r.y + 0.5, f: () => { if (!seat) { ctx.fillStyle = 'rgba(120,200,255,.5)'; ctx.beginPath(); ctx.ellipse(r.x, r.y - 1, 7, 3, 0, 0, 7); ctx.fill(); } drawChar(r.lk, r.x, r.y, seat ? seat.chair.face : r.dir, fr, seat, working, t, r.x); } }); });
  list.sort((a, b) => a.sy - b.sy).forEach(e => e.f());
  if (typeof DJ !== 'undefined' && DJ.playing() && !REDUCED) { ctx.font = '700 7px Figtree, sans-serif'; for (let i = 0; i < 4; i++) { const ph = ((t / 1600) + i / 4) % 1; ctx.fillStyle = `rgba(${['224,90,138', '90,208,224', '232,177,58', '138,95,208'][i]},${1 - ph})`; ctx.fillText(i % 2 ? '♫' : '♪', booth.x * T + 4 + i * 6 + Math.sin(ph * 6 + i) * 3, booth.y * T - 10 - ph * 22); } }
  // screen-space overlays
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fs = Math.max(10.5, Math.min(13, 11 * s / dpr)) * dpr;
  ctx.font = `600 ${fs}px Figtree, system-ui, sans-serif`; ctx.textBaseline = 'middle';
  const pill = (x, y, text, bg, fg, center) => { const w = ctx.measureText(text).width + fs * 0.9, h = fs * 1.6; const X = center ? x - w / 2 : x; ctx.fillStyle = bg; rr(X, y - h / 2, w, h, h / 2); ctx.fill(); ctx.fillStyle = fg; ctx.fillText(text, X + fs * 0.45, y + 0.5); return w; };
  const counts = {}; P.forEach(p => { if (p.hidden || LIVE.has(p.id)) return; const tl = tileOf(p), z = zoneOf(tl.x, tl.y); if (z) counts[z[4]] = (counts[z[4]] || 0) + 1; });
  RP.forEach(r => { const z = zoneOf(Math.floor(r.x / T), Math.floor((r.y - 4) / T)); if (z) counts[z[4]] = (counts[z[4]] || 0) + 1; });
  PZ.forEach(z => { if (['work', 'restroom'].includes(z[4])) return; const myPod = user(ME) && ((z[4] === 'designpod' && me().dept === 'design') || (z[4] === 'productpod' && ['product', 'ops'].includes(me().dept)) || (z[4] === me().dept && ['dev', 'marketing'].includes(z[4]))); const x = ox + (z[0] * T + 3) * s, y = oy + (z[1] * T + 6) * s; const n = counts[z[4]] || 0; pill(x, y + fs * 0.4, t_(z[5]) + (n ? ' · ' + n : '') + (myPod ? ' · ' + t_('your team') : ''), myPod ? 'rgba(47,107,63,.92)' : ROOMKEYS.includes(z[4]) ? 'rgba(36,87,214,.88)' : 'rgba(30,24,20,.72)', '#fff'); });
  const micBadge = (bx, by, kind) => {
    const r = Math.max(3.6 * dpr, 2.4 * s);
    ctx.fillStyle = kind === 'mic' ? '#d93b3b' : '#3a3d48'; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, r * 0.22);
    if (kind === 'mic') { ctx.beginPath(); ctx.moveTo(bx, by - r * 0.55); ctx.lineTo(bx, by + r * 0.1); ctx.stroke(); ctx.beginPath(); ctx.arc(bx, by - r * 0.05, r * 0.38, 0.2, Math.PI - 0.2); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(bx, by + r * 0.1, r * 0.45, Math.PI, 0); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(bx - r * 0.6, by - r * 0.6); ctx.lineTo(bx + r * 0.6, by + r * 0.6); ctx.stroke();
  };
  const head = (x, y, name, st, isMe, live, bubble, showName, act, mu, df) => {
    const sx = ox + x * s, sy = oy + (y - 24) * s;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + 6 * s, sy + 3 * s, Math.max(3.5 * dpr, 2.2 * s), 0, 7); ctx.fill();
    ctx.fillStyle = STC[st] || STC.online; ctx.beginPath(); ctx.arc(sx + 6 * s, sy + 3 * s, Math.max(2.5 * dpr, 1.5 * s), 0, 7); ctx.fill();
    if (st === 'dnd') { ctx.fillStyle = '#fff'; ctx.fillRect(sx + 6 * s - 1.2 * s, sy + 3 * s - 0.3 * s, 2.4 * s, 0.6 * s); }
    if (mu) micBadge(sx - 6 * s, sy + 3 * s, 'mic');
    if (df) micBadge(sx - 6 * s - Math.max(8 * dpr, 5 * s), sy + 3 * s, 'head');
    let ly = sy - fs * 0.6;
    if (showName) { pill(sx, ly, name, isMe ? 'rgba(36,87,214,.95)' : live ? 'rgba(14,138,160,.95)' : 'rgba(20,24,32,.85)', '#fff', true); ly -= fs * 1.75; }
    if (act) { ctx.font = `600 ${fs * 0.88}px Figtree, system-ui, sans-serif`; const bob = REDUCED ? 0 : Math.sin(t / 600 + x) * 0.6 * s; pill(sx, ly + bob, act.text, ACT_C[act.kind] || ACT_C.custom, '#fff', true); ctx.font = `600 ${fs}px Figtree, system-ui, sans-serif`; ly -= fs * 1.65; }
    if (bubble && bubble.until > Date.now()) { const by = ly - fs * 0.15; if (bubble.mode === 'shout') { ctx.font = `800 ${fs * 1.15}px Figtree, system-ui, sans-serif`; pill(sx, by - fs * 0.2, bubble.text + ' !', 'rgba(255,214,90,.98)', '#3a2313', true); ctx.font = `600 ${fs}px Figtree, system-ui, sans-serif`; } else if (bubble.mode === 'far') pill(sx, by, bubble.text, 'rgba(255,255,255,.55)', '#55606e', true); else if (bubble.mode === 'sys') { const k = Math.min(1, (bubble.until - Date.now()) / 600); ctx.globalAlpha = k; pill(sx, by - (1 - k) * fs, bubble.text, 'rgba(255,250,235,.97)', '#3a2313', true); ctx.globalAlpha = 1; } else { ctx.font = `italic 500 ${fs * 0.95}px Figtree, system-ui, sans-serif`; pill(sx, by, bubble.text, 'rgba(240,247,255,.96)', '#2a3a55', true); ctx.font = `600 ${fs}px Figtree, system-ui, sans-serif`; } }
    if (st === 'focus') { ctx.fillStyle = 'rgba(139,108,240,.9)'; ctx.fillText('z', sx - 8 * s, sy - 2 * s + Math.sin(t / 400) * 2 * s); }
  };
  P.forEach(p => { if (p.hidden || LIVE.has(p.id)) return; const u = user(p.id); if (!u) return; head(p.x, p.y, p.id === ME ? t_('You') : u.name.split(' ')[0] + ' · ' + t_(PRES[u.status].l), u.status, p.id === ME, false, p.bubble, p.id === ME || hover === p.id, activityOf(u, p.id === ME), p.id === ME && S.voice.muted, p.id === ME && S.voice.deafened); });
  RP.forEach(r => head(r.x, r.y, r.n.split(' ')[0] + ' · ' + t_('Live'), r.s, false, true, r.bubble, true, r.w ? { kind: r.wk, text: r.w } : null, r.mu, r.df));
  head(GREETER.x, GREETER.y, 'Mali · Reception', 'online', false, false, GREETER.bubble, true, null, false, false);
  if (seatP && me_) { const sx = ox + me_.x * s, sy = oy + (me_.y + 6) * s; pill(sx, sy + fs, (seatP.can ? 'E · ' : '') + t_(seatP.label), 'rgba(247,223,172,.97)', '#3a2313', true); }
  if (placing) { pill(cv.width / 2, oy > 0 ? oy + fs * 2 : fs * 5, t_('Click an empty spot on the floor. Esc to cancel.'), 'rgba(47,107,63,.95)', '#fff', true); }
  if (prompt && me_) { const sx = ox + me_.x * s, sy = oy + (me_.y + 6) * s; pill(sx, sy + fs, 'E · ' + t_(prompt.act[0]), 'rgba(247,223,172,.97)', '#3a2313', true); }
  if (hoverObj && hoverObj !== prompt) { const sx = ox + (hoverObj.x + (hoverObj.w || 1) / 2) * T * s, sy = oy + (hoverObj.y * T - (hoverObj.top || 0)) * s; pill(sx, sy - fs, t_(hoverObj.act[0]), 'rgba(247,223,172,.97)', '#3a2313', true); }
  const hn = document.getElementById('hearN'); if (hn) { const n = String(hearCount()); if (hn.textContent !== n) hn.textContent = n; }
  const hz = document.getElementById('hudzone'); if (hz && me_) { const tl = tileOf(me_), z = zoneOf(tl.x, tl.y); const txt = t_(z ? z[5] : 'Hallway'); if (hz.textContent !== txt) hz.textContent = txt; }
}
/* what someone is doing, shown above their head */
const ACT_C = { task: 'rgba(36,87,214,.92)', custom: 'rgba(47,107,63,.92)', focus: 'rgba(109,79,216,.92)', meeting: 'rgba(36,87,214,.92)', break: 'rgba(201,140,0,.95)', view: 'rgba(70,80,96,.85)', room: 'rgba(14,138,160,.92)' };
const short = (s, n = 26) => s.length > n ? s.slice(0, n - 1) + '…' : s;
function activityOf(u, isMe) {
  if (!u) return null;
  if (u.status === 'focus') return { kind: 'focus', text: t_('Focusing') };
  if (u.status === 'meeting') return { kind: 'meeting', text: t_('In a meeting') };
  const where = placeOf(u);
  if (where && where.zone === 'restroom') return { kind: 'break', text: t_('In the restroom') };
  if (where && (where.zone === 'kitchen' || where.zone === 'dining') && !where.p.moving) return { kind: 'break', text: t_('Having a meal') };
  if (u.doing && u.doing.text) return { kind: 'custom', text: short(u.doing.text) };
  const pickTask = () => { if (u.doing && u.doing.task) { const k = task(u.doing.task); if (k && k.status !== 'done') return k; } return S.tasks.filter(k => k.assignees.includes(u.id) && ['progress', 'revision', 'overdue'].includes(k.status)).sort((a, b) => a.due - b.due)[0]; };
  if (where && where.seat && where.seat.atDesk) { const k = pickTask(); return k ? { kind: 'task', text: short(t_('Working on') + ' ' + k.id + ' ' + k.title) } : { kind: 'task', text: t_('Working at desk') }; }
  if (u.doing && u.doing.task) { const k = task(u.doing.task); if (k && k.status !== 'done') return { kind: 'task', text: short(t_('Working on') + ' ' + k.id + ' ' + k.title) }; }
  if (u.status === 'away') return { kind: 'break', text: t_('On a break') };
  if (isMe && UI.route !== 'floor') { const it = NAV.flatMap(g => g[1]).find(x => x[0] === UI.route); if (it) return { kind: 'view', text: short(t_('Viewing') + ' ' + t_(it[1])) }; if (UI.route === 'dj') return { kind: 'view', text: t_('At the DJ booth') }; }
  if (u.room && ROOMKEYS.includes(u.room)) { const r = ROOMS.find(x => x.id === u.room); if (r) return { kind: 'room', text: short(t_('Talking in') + ' ' + t_(r.name)) }; }
  if (where && where.seat) return { kind: 'view', text: t_('Sitting') };
  return null;
}
const chairAt = (x, y) => CHAIRS.find(c => c.x === x && c.y === y);
function seatedInfo(x, y, dir) {
  const tx = Math.floor(x / T), ty = Math.floor((y - 4) / T), ch = chairAt(tx, ty); if (!ch) return null;
  const v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[ch.face] || [0, -1];
  const dx = tx + v[0], dy = ty + v[1];
  const desk = objs.some(o => o.solid !== false && /โต๊ะ|desk/i.test(o.name || '') && !/ประชุม|กลม|ครัว|ทานข้าว/.test(o.name) && dx >= o.x && dx < o.x + o.w && dy >= o.y && dy < o.y + o.h);
  return { chair: ch, atDesk: desk };
}
function placeOf(u) { const p = P.get(u.id); if (!p || p.hidden) return null; const tl = tileOf(p), z = zoneOf(tl.x, tl.y); return { p, zone: z ? z[4] : null, seat: p.moving ? null : seatedInfo(p.x, p.y, p.dir) }; }
function flash(text) { const p = P.get(ME); if (p) p.bubble = { text, until: Date.now() + 1800, mode: 'sys' }; }
/* Nearby mic mode: rings that start small at you, grow to the edge of your hearing range and fade, one after another */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WAVE = 2200, WAVES = 3;
function drawRadar(me_, t) {
  const cx = me_.x, cy = me_.y - 4, R0 = NEAR;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.8);
  ctx.strokeStyle = 'rgba(70,210,120,.16)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(0, 0, R0, 0, 7); ctx.stroke();
  const phases = REDUCED ? [0.55] : Array.from({ length: WAVES }, (_, i) => ((t / WAVE) + i / WAVES) % 1);
  phases.forEach(ph => {
    const r = R0 * (0.08 + 0.92 * ph), a = REDUCED ? 0.35 : Math.pow(1 - ph, 1.4);
    ctx.fillStyle = `rgba(80,220,130,${0.10 * a})`; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(90,230,140,${0.75 * a})`; ctx.lineWidth = 0.6 + 1.4 * (1 - ph); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  });
  ctx.restore();
  const blip = (x, y) => {
    const dx = x - cx, dy = (y - 4 - cy) / 0.8, d = Math.hypot(dx, dy); if (d > R0 || d < 2) return;
    let glow = REDUCED ? 0.6 : 0;
    if (!REDUCED) phases.forEach(ph => { const r = R0 * (0.08 + 0.92 * ph); const gap = Math.abs(r - d); if (gap < 10) glow = Math.max(glow, (1 - gap / 10) * Math.pow(1 - ph, 0.6)); });
    ctx.fillStyle = `rgba(120,255,160,${0.25 + 0.6 * glow})`; ctx.beginPath(); ctx.ellipse(x, y - 1, 5 + 3 * glow, 2.5 + 1.5 * glow, 0, 0, 7); ctx.fill();
  };
  P.forEach(q => { if (q.id !== ME && !q.hidden) blip(q.x, q.y); }); RP.forEach(r => blip(r.x, r.y));
}
/* standing, walking, sitting, and a busy little typing wiggle when working at a desk */
function drawChar(look, x, y, dir, fr, seat, working, t, seed) {
  const X = Math.round(x - 8), Y = Math.round(y - 22);
  if (!seat) { ctx.drawImage(sprite(look, dir, fr), X, Y); return; }
  const tick = REDUCED ? 0 : Math.floor((t + seed * 37) / 170);
  const f = working ? [1, 2][tick % 2] : 0;
  const bob = working && !REDUCED ? (tick % 4 === 0 ? 1 : 0) : 0;
  const spr = sprite(look, dir, f), sy = Y + 4 + bob;
  ctx.drawImage(spr, 0, 0, 16, 18, X, sy, 16, 18);
  const pc = look.bottom === 'pants' ? look.bottomColor : look.top === 'dress' ? look.topColor : look.bottomColor;
  if (dir === 'd') { R(ctx, X + 4, sy + 18, 8, 2, pc); R(ctx, X + 4, sy + 20, 3, 1, '#2b2220'); R(ctx, X + 9, sy + 20, 3, 1, '#2b2220'); }
  else if (dir === 'l' || dir === 'r') { R(ctx, X + (dir === 'l' ? 2 : 6), sy + 18, 8, 2, pc); }
  if (working && !REDUCED) {
    const dx = { u: 0, d: 0, l: -9, r: 9 }[dir] || 0, dy = dir === 'u' ? -1 : dir === 'd' ? 12 : 8;
    const k = tick % 3; ctx.fillStyle = 'rgba(255,255,255,.9)';
    [0, 1, 2].forEach(i => { if ((i + k) % 3 === 0) ctx.fillRect(X + 4 + i * 4 + dx, sy + dy - ((tick + i) % 2), 1, 1); });
    if (tick % 12 < 4) { ctx.fillStyle = 'rgba(255,240,160,.95)'; ctx.fillRect(X + 13 + dx, sy - 2 - (tick % 4), 1, 1); ctx.fillRect(X + 12 + dx, sy - 1 - (tick % 4), 1, 1); }
  }
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function toWorld(e) { const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1; return { x: ((e.clientX - r.left) * dpr - view.ox) / view.s, y: ((e.clientY - r.top) * dpr - view.oy) / view.s }; }
function hit(w) { let best = null; const LIVE = liveIds(); P.forEach(p => { if (!p.hidden && !LIVE.has(p.id) && Math.abs(w.x - p.x) < 7 && w.y > p.y - 23 && w.y < p.y + 2) if (!best || p.y > best.y) best = { p }; }); RP.forEach(r => { if (Math.abs(w.x - r.x) < 7 && w.y > r.y - 23 && w.y < r.y + 2) best = { r }; }); if (Math.abs(w.x - GREETER.x) < 8 && w.y > GREETER.y - 24 && w.y < GREETER.y + 2) best = { npc: GREETER }; return best; }
function objAtWorld(w) {
  const tx = Math.floor(w.x / T), ty = Math.floor(w.y / T);
  const o = objs.filter(o => o.act && w.x >= o.px && w.x < o.px + o.w * T && w.y >= o.py && w.y < o.py + o.h * T + o.top).sort((a, b) => b.sy - a.sy)[0];
  return o || HOTSPOTS.find(h => tx >= h.x && tx < h.x + h.w && ty >= h.y && ty < h.y + h.h) || null;
}
cv.addEventListener('mousemove', e => { const w = toWorld(e); if (placing) { ghost = { x: Math.floor(w.x / T), y: Math.floor(w.y / T) };  return; } const h = hit(w); hover = h && h.p ? h.p.id : null; hoverObj = h ? null : objAtWorld(w);  });
cv.addEventListener('mouseleave', () => { hover = null; hoverObj = null; });
cv.addEventListener('click', e => {
  if (!user(ME)) return;
  const w = toWorld(e), h = hit(w), p = P.get(ME); if (!p) return;
  if (placing) { const gx = Math.floor(w.x / T), gy = Math.floor(w.y / T); if (!validDesk(gx, gy)) { toast(t_('This spot is not free'), t_('Pick an empty patch of floor, 2 by 2 tiles.'), 'warn'); return; } (S.desks || (S.desks = [])).push({ id: rid('desk'), x: gx, y: gy, by: ME, at: now() }); placing = false; ghost = null; log(ME, 'added a desk'); toast(t_('Desk added'), t_('Sit on its chair and press E to make it yours.'), 'ok'); commit(); return; }
  if (h && h.npc) { greetVisitor(); return; }
  if (h && h.r) return h.r.uid && user(h.r.uid) ? openDrawer('user', h.r.uid) : showRemote(h.r);
  if (h) { if (h.p.id === ME) openEditor('look'); else openDrawer('user', h.p.id); return; }
  const o = objAtWorld(w);
  if (o) {
    const cand = []; for (let y = o.y - 1; y <= o.y + (o.h || 1); y++) for (let x = o.x - 1; x <= o.x + (o.w || 1); x++) { const inside = x >= o.x && x < o.x + (o.w || 1) && y >= o.y && y < o.y + (o.h || 1); const diag = (x < o.x || x >= o.x + (o.w || 1)) && (y < o.y || y >= o.y + (o.h || 1)); if (!inside && !diag && walk(x, y)) cand.push({ x, y }); }
    const cur = tileOf(p);
    if (cand.some(c => c.x === cur.x && c.y === cur.y)) { p.pending = o; arrive(p, user(ME)); return; }
    let best = null; cand.forEach(c => { const path = bfs(cur.x, cur.y, c.x, c.y); if (path && (!best || path.length < best.path.length)) best = { c, path }; });
    if (best) { p.manual = true; p.pending = o; p.errand = null; p.path = best.path; p.goal = best.c; p.seat = null; p.face = null; return; }
    o.act[1](); return;
  }
  const tx = Math.floor(w.x / T), ty = Math.floor(w.y / T);
  let tgt = { x: tx, y: ty };
  if (!walk(tx, ty)) { let best = null, bd = 9; for (let y = ty - 2; y <= ty + 2; y++) for (let x = tx - 2; x <= tx + 2; x++) if (walk(x, y)) { const d = Math.abs(x - tx) + Math.abs(y - ty); if (d < bd) { bd = d; best = { x, y }; } } if (!best) return; tgt = best; }
  const ch = CHAIRS.find(c => c.x === tgt.x && c.y === tgt.y); if (ch) tgt.face = ch.face, tgt.seat = true;
  p.manual = true; p.errand = null; p.pending = null; sendTo(p, tgt);
});
function loop(t) {
  if (!cv.isConnected) { running = false; return; }
  const dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
  if (S) { step(dt); syncRemote(dt); draw(t); netPush(); }
  requestAnimationFrame(loop);
}
function mount() {
  const slot = document.getElementById('pxslot'); if (!slot) return;
  if (cv.parentNode !== slot) slot.appendChild(cv);
  if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); }
}

/* ---------- editors: Stardew-style character creator and desk ---------- */
const LBL = { skin: 'Skin', hair: 'Hair', hairColor: 'Hair color', top: 'Top', topColor: 'Top color', bottom: 'Bottom', bottomColor: 'Bottom color', acc: 'Eyewear', hat: 'Headwear', hatColor: 'Headwear color', plant: 'Plant', screens: 'Screens', mug: 'Mug', gadget: 'Desk item', plate: 'Name plate' };
const ED = { look: null, desk: null, dir: 'd' };
const OPTS = { look: LOOKOPT, desk: DESKOPT };
const STEPS_ = { look: ['skin', 'hair', 'top', 'bottom', 'acc', 'hat'], desk: ['screens', 'plant', 'gadget', 'mug', 'plate'] };
const SLIDE_ = { look: ['hairColor', 'topColor', 'bottomColor', 'hatColor'], desk: [] };
const hex2hsv = hex => { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round((h * 60 + 360) % 360); return [h, Math.round(mx ? d / mx * 100 : 0), Math.round(mx * 100)]; };
const hsv2hex = (h, s, v) => { s /= 100; v /= 100; const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return '#' + [f(5), f(3), f(1)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
function startEdit(kind, value) { ED[kind] = Object.assign({}, value); if (kind === 'look') ED.dir = 'd'; }
const DICE = '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#fffaf0" stroke="#7a4a26" stroke-width="1.5"/><circle cx="5" cy="5" r="1.4" fill="#7a4a26"/><circle cx="11" cy="11" r="1.4" fill="#7a4a26"/><circle cx="8" cy="8" r="1.4" fill="#7a4a26"/><circle cx="11" cy="5" r="1.4" fill="#7a4a26"/><circle cx="5" cy="11" r="1.4" fill="#7a4a26"/></svg>';
function editorHTML(kind, who) {
  const look = kind === 'look';
  return `<div class="sv-ed"><div class="sv-left"><div class="sv-frame ${look ? '' : 'desk'}"><canvas id="ed-${kind}" width="${look ? 16 : 48}" height="${look ? 24 : 32}"></canvas></div>
    ${look ? `<div class="sv-rot"><button type="button" class="sv-arr" data-a="edRot" data-v="-1" aria-label="${t_('Rotate left')}">↺</button><span class="sv-who">${esc(who || '')}</span><button type="button" class="sv-arr" data-a="edRot" data-v="1" aria-label="${t_('Rotate right')}">↻</button></div>` : ''}
    <button type="button" class="sv-dice" data-a="edShuffle" data-kind="${kind}">${DICE}${t_('Random')}</button></div>
    <div class="sv-right" id="edb-${kind}"></div></div>`;
}
const HAT_LABELS = { topHat: 'Top hat', animalEars: 'Animal ears', leafCrown: 'Leaf crown', hardHat: 'Hard hat', flowerCrown: 'Flower crown' };
const cap1 = v => v === 'none' ? t_('None') : /^\d$/.test(v) ? v + ' ' + t_('screens') : t_(HAT_LABELS[v] || v.charAt(0).toUpperCase() + v.slice(1));
function renderEditor(kind) {
  const b = document.getElementById('edb-' + kind), V = ED[kind]; if (!b || !V) return;
  const O = OPTS[kind];
  STEPS_[kind].forEach(k => { if (V[k] == null) V[k] = O[k][0]; });
  const rows = STEPS_[kind].filter(k => !(k === 'bottom' && V.top === 'dress')).map(k => {
    const opts = O[k], i = Math.max(0, opts.indexOf(V[k])), isColor = opts[0][0] === '#';
    return `<div class="sv-row"><span class="sv-lbl">${t_(LBL[k])}</span><button type="button" class="sv-arr" data-a="edStep" data-kind="${kind}" data-k="${k}" data-v="-1" aria-label="${t_('Previous')} ${t_(LBL[k])}">◀</button><span class="sv-val">${isColor ? `<i class="sv-sw" style="background:${V[k]}"></i>` : cap1(V[k])}<small>${i + 1}/${opts.length}</small></span><button type="button" class="sv-arr" data-a="edStep" data-kind="${kind}" data-k="${k}" data-v="1" aria-label="${t_('Next')} ${t_(LBL[k])}">▶</button></div>`;
  }).join('');
  const sliders = SLIDE_[kind].filter(k => !(k === 'hatColor' && V.hat === 'none') && !(k === 'bottomColor' && V.top === 'dress')).map(k => {
    const [h, s, v] = hex2hsv(V[k]);
    const sl = (ch, val, max, lab) => `<label class="sv-sl"><span>${t_(lab)}</span><input type="range" min="0" max="${max}" value="${val}" data-i="edColor" data-kind="${kind}" data-k="${k}" data-ch="${ch}" class="sv-range ${ch}" aria-label="${t_(LBL[k])} ${t_(lab)}" ${ch === 's' || ch === 'v' ? `style="--hue:${h}"` : ''}></label>`;
    return `<div class="sv-row sv-colrow"><span class="sv-lbl">${t_(LBL[k])}</span><i class="sv-sw big" id="sw-${kind}-${k}" style="background:${V[k]}"></i><div class="sv-sls">${sl('h', h, 360, 'Hue')}${sl('s', s, 100, 'Saturation')}${sl('v', v, 100, 'Brightness')}</div></div>`;
  }).join('');
  b.innerHTML = rows + sliders;
  preview(kind);
}
function preview(kind) {
  const c = document.getElementById('ed-' + kind); if (!c || !ED[kind]) return;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, c.width, c.height);
  if (kind === 'look') g.drawImage(sprite(ED.look, ED.dir, 0), 0, 0);
  else { g.fillStyle = '#6e4422'; g.fillRect(0, 6, 48, 22); g.fillStyle = '#cf9659'; g.fillRect(1, 7, 46, 15); g.fillStyle = '#9a6236'; g.fillRect(1, 22, 46, 5); g.fillStyle = '#2b2d3a'; g.fillRect(4, 8, 10, 7); g.fillStyle = '#7fc6d9'; g.fillRect(5, 9, 8, 5); g.drawImage(deskDeco(ED.desk), 18, 6); }
}
function stepOpt(kind, k, d) { const opts = OPTS[kind][k], i = Math.max(0, opts.indexOf(ED[kind][k])); setOpt(kind, k, opts[(i + d + opts.length) % opts.length]); }
function setOpt(kind, k, v) { ED[kind][k] = v; if (kind === 'look' && k === 'top' && v === 'dress') ED.look.bottom = 'skirt'; renderEditor(kind); }
function rotate(d) { const D = ['d', 'r', 'u', 'l']; ED.dir = D[(D.indexOf(ED.dir) + d + 4) % 4]; preview('look'); }
function colorInput(el) {
  const kind = el.dataset.kind, k = el.dataset.k, row = el.closest('.sv-colrow'); if (!ED[kind] || !row) return;
  const get = ch => +row.querySelector('.sv-range.' + ch).value;
  const hex = hsv2hex(get('h'), get('s'), get('v')); ED[kind][k] = hex;
  const sw = document.getElementById('sw-' + kind + '-' + k); if (sw) sw.style.background = hex;
  row.querySelectorAll('.sv-range.s,.sv-range.v').forEach(r => r.style.setProperty('--hue', get('h')));
  if (sprCache.size > 600) sprCache.clear();
  preview(kind);
}
function shuffleEd(kind) { ED[kind] = kind === 'look' ? randomLook() : randomDesk(); renderEditor(kind); }
function openEditor(kind) {
  const u = user(ME); if (!u) return;
  startEdit(kind, kind === 'look' ? lookOf(u) : (u.desk || randomDesk()));
  openModal(t_(kind === 'look' ? 'Dressing room' : 'Decorate your desk'), editorHTML(kind, u.name),
    `<span style="flex:1"></span><button type="button" class="btn" data-a="closeModal">${t_('Cancel')}</button><button type="button" class="btn primary" data-a="edSave" data-kind="${kind}">${t_('OK')}</button>`, { wide: true });
  document.querySelector('#overlay .modal')?.classList.add('sv-modal');
  renderEditor(kind);
}
function saveEd(kind) {
  const u = user(ME); if (!u) return;
  if (kind === 'look') u.look = Object.assign({}, ED.look); else u.desk = Object.assign({}, ED.desk);
  closeModal(); log(ME, kind === 'look' ? 'changed outfit' : 'decorated their desk');
  toast(t_(kind === 'look' ? 'Outfit saved' : 'Desk decorated'), t_(kind === 'look' ? 'Everyone in the office sees your new look.' : 'Walk to your desk to see it.'), 'ok'); commit();
}

return {
  mount, sync, spawn, say, remoteSay, netPush, padKey, interact, sprite, lookOf, randomLook, randomDesk, deskDeco,
  get mode() { return mode; }, set mode(v) { mode = v; },
  openEditor, renderEditor, editorHTML, startEdit, preview, setOpt, stepOpt, rotate, colorInput, shuffleEd, saveEd, getEd: k => ED[k],
  startPlacing, removeDesk, flash, activityOf, boothPos: () => ({ x: booth.x * T + T, y: booth.y * T + 8 }), myPos: () => { const q = P.get(ME); return q ? { x: q.x, y: q.y } : null; }, get placing() { return placing; },
};
})();
