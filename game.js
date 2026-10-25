'use strict';
const $=id=>document.getElementById(id),cv=$('game'),ctx=cv.getContext('2d'),KEY='ball-cascade-v1';
const WIDTH=960,HEIGHT=540,SX=WIDTH/600,SY=HEIGHT/700;
const X=n=>n*SX,Y=n=>n*SY;
const names=['First light','Mint machine','Split decision','Golden hour','Orbital garden','Infinite playground'],goals=[0,300,1800,9000,40000,180000];
// Save data is untrusted: retain valid progress and discard malformed fields.
const caps={rate:16,value:20,bounce:15};
const pockets=[[1,2,5,2,1],[2,4,1,4,2],[1,3,6,3,1],[5,2,1,2,5],[2,5,2,5,2],[3,4,7,4,3]];
const boardTips=[
  'First light · Feed the center ×5 pocket. Place ×2 on the way down.',
  'Mint machine · Two ×4 pockets. Chain both multipliers before the landing.',
  'Split decision · Split early, then catch both branches with multipliers.',
  'Golden hour · Edge pockets pay ×5. Kick a branch toward an outside lane.',
  'Orbital garden · Inner side pockets pay ×5. Use the kickers to separate your streams.',
  'Infinite playground · Combine two splits and three multipliers. Center pays ×7.'
];
function fresh(){return {cash:0,total:0,count:0,rate:0,value:0,bounce:0,board:0,unlocked:0,layouts:{},geometry:2,aim:WIDTH/2,seen:false,won:false,seconds:0,bursts:0,moves:0,cooldown:0,visits:[true,false,false,false,false,false]};}
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
function clean(raw){
  const out=fresh();
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  for(const k of ['cash','total','count','seconds','bursts','moves'])
    if(Number.isFinite(raw[k])&&raw[k]>=0)out[k]=Math.min(1e15,raw[k]);
  out.total=Math.max(out.cash,out.total);
  if(Number.isFinite(raw.cooldown))out.cooldown=clamp(raw.cooldown,0,8);
  for(const k of Object.keys(caps))if(Number.isFinite(raw[k]))out[k]=clamp(Math.floor(raw[k]),0,caps[k]);
  if(Number.isFinite(raw.unlocked))out.unlocked=clamp(Math.floor(raw.unlocked),0,5);
  if(Number.isFinite(raw.board))out.board=clamp(Math.floor(raw.board),0,out.unlocked);
  const legacy=raw.geometry!==2;
  if(Number.isFinite(raw.aim))out.aim=clamp(legacy?X(raw.aim):raw.aim,X(35),X(565));
  out.seen=raw.seen===true||out.total>0;
  out.won=raw.won===true&&out.unlocked===5&&out.total>=1e6;
  out.visits=Array.from({length:6},(_,i)=>i<=out.unlocked&&(raw.visits?.[i]===true||i===out.board||i===0));
  // Module types always come from the board preset, never from stored strings.
  if(raw.layouts&&typeof raw.layouts==='object')for(let i=0;i<6;i++){
    const a=raw.layouts[i];
    if(Array.isArray(a)&&a.length<=5&&a.every(m=>m&&Number.isFinite(m.x)&&Number.isFinite(m.y)))
      out.layouts[i]=a.map(m=>({x:clamp(legacy?X(m.x):m.x,X(58),X(542)),y:clamp(legacy?Y(m.y):m.y,Y(185),Y(570))}));
  }
  return out;
}
let s=fresh(),storageOK=true,saveWarning=false;
try{const raw=localStorage.getItem(KEY);if(raw)s=clean(JSON.parse(raw));}catch{storageOK=false;}
let balls=[],particles=[],labels=[],modules=[],pegs=[],running=true,muted=true,audio,last=0,acc=0,spawn=0,burstReady=s.cooldown,drag=null,toneAt=0;
let selected=-1,simTime=0,flightCache={},recent=[],boardCount=0,centerCount=0,boardEarned=0,boardSeconds=0;
const ballValue=()=>Math.pow(1.6,s.value);
const interval=()=>Math.max(.08,.85/Math.pow(1.17,s.rate));
const playing=()=>running&&!document.hidden&&!document.querySelector('dialog[open]')&&(!window.Portal||(window.Portal.ready&&window.Portal.interacted));
function syncPlatform(){window.Portal?.update(playing());}
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
function save(){
  try{s.cooldown=Math.max(0,burstReady-simTime);localStorage.setItem(KEY,JSON.stringify(s));storageOK=true;}
  catch{storageOK=false;if(!saveWarning){saveWarning=true;toast('Saving unavailable. Keep this tab open to keep your session.');}}
  $('savestate').textContent=storageOK?'Progress saved on this device':'Session only · saving unavailable';
}
function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.opacity=0,2200);}
function beep(f=440){if(muted||!playing())return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();if(audio.currentTime-toneAt<.045)return;toneAt=audio.currentTime;const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.1);}catch{}}
function setup(){drag=null;selected=-1;balls=flightCache[s.board]||[];particles=[];labels=[];spawn=0;recent=[];boardCount=0;centerCount=0;boardEarned=0;boardSeconds=0;pegs=[];for(let row=0;row<7;row++){for(let col=0;col<9;col++){let x=55+col*61+(row%2?28:0);if(x>560)continue;if(s.board===3&&col===4)continue;pegs.push({x:X(x),y:Y(160+row*65),r:5+(s.board===4?2:0),glow:0});}}const presets=[[{x:250,y:280,type:'multi'},{x:365,y:420,type:'kick'}],[{x:300,y:220,type:'multi'},{x:180,y:385,type:'multi'},{x:400,y:485,type:'kick'}],[{x:300,y:210,type:'split'},{x:195,y:360,type:'multi'},{x:405,y:460,type:'multi'}],[{x:300,y:185,type:'split'},{x:210,y:330,type:'split'},{x:385,y:430,type:'kick'},{x:300,y:550,type:'multi'}],[{x:180,y:220,type:'kick'},{x:420,y:320,type:'kick'},{x:300,y:420,type:'split'},{x:300,y:555,type:'multi'}],[{x:300,y:190,type:'split'},{x:190,y:320,type:'multi'},{x:410,y:320,type:'multi'},{x:300,y:450,type:'split'},{x:300,y:560,type:'multi'}]][s.board];modules=presets.map((m,i)=>({...m,x:X(m.x),y:Y(m.y),...(s.layouts[s.board]?.length===presets.length?s.layouts[s.board][i]:{}),id:i}));$('boardtip').textContent=boardTips[s.board];s.visits[s.board]=true;$('modulepick').innerHTML='<option value="-1">Emitter</option>'+modules.map((m,i)=>`<option value="${i}">Module ${i+1} · ${m.type}</option>`).join('');$('selection').textContent='Emitter selected';$('boardnum').textContent=`BOARD 0${s.board+1} / 06`;$('boardname').textContent=names[s.board];renderUI();}
function addBall(x=s.aim,y=Y(65),v=1,vx=(Math.random()-.5)*X(60),used=[]){if(balls.length>=220)return false;balls.push({x,y,vx,vy:Y(20),v,used:[...used],trail:[],age:0});return true;}
function cost(k){return Math.round(({rate:35,value:55,bounce:80}[k])*Math.pow(k==='value'?1.9:k==='bounce'?1.7:1.68,s[k]));}
const shop=[['rate','Faster flow','More balls. More possibilities.'],['value','Richer balls','Every ball is worth more.'],['bounce','Golden chance','Chance of a gold ball worth ×5.']];
function effect(k){
  if(k==='rate')return (1/interval()).toFixed(1)+' balls/s'+(s.rate<caps.rate?' → '+(1/Math.max(.08,.85/Math.pow(1.17,s.rate+1))).toFixed(1):'');
  if(k==='value')return '$'+ballValue().toFixed(2)+(s.value<caps.value?' → $'+(ballValue()*1.6).toFixed(2):'')+' per ball';
  return (s.bounce*4)+'%'+(s.bounce<caps.bounce?' → '+((s.bounce+1)*4)+'%':'')+' chance of ×5 gold';
}
function patch(id,html){
  const host=$(id),temp=document.createElement('div');temp.innerHTML=html;
  if(host.children.length!==temp.children.length){host.replaceChildren(...temp.children);return;}
  [...temp.children].forEach((next,i)=>{
    const old=host.children[i];
    old.disabled=next.disabled;old.className=next.className;
    if(old.innerHTML!==next.innerHTML)old.innerHTML=next.innerHTML;
  });
}
function renderUI(){$('stagecash').textContent='$'+fmt(s.cash);for(const [id,val]of [['balance','$'+fmt(s.cash)],['total','$'+fmt(s.total)],['collected',fmt(s.count)],['value','$'+(ballValue()<1000?ballValue().toFixed(2):fmt(ballValue()))]])$(id).textContent=val;patch('shop',shop.map(([k,title,desc])=>`<button class="upgrade" data-buy="${k}" ${s.cash<cost(k)||s[k]>=caps[k]?'disabled':''}><strong>${title}</strong><span class="muted">${effect(k)}</span><span class="row"><span>LEVEL ${s[k]} / ${caps[k]}</span><b>${s[k]>=caps[k]?'MAX':'$'+fmt(cost(k))+' ↗'}</b></span></button>`).join(''));patch('boards',names.map((n,i)=>`<button class="boardtab ${i===s.board?'active':''}" data-board="${i}" ${i>s.unlocked?'disabled':''}>${i<=s.unlocked?'0'+(i+1):'◇'} ${n}<span>${i<=s.unlocked?(i===s.board?'Current board':'Explore board'):'$'+fmt(goals[i])+' lifetime'}</span></button>`).join(''));let next=s.unlocked+1;$('goalname').textContent=next<6?'Unlock '+names[next]:'The cascade is yours';$('goaltext').textContent=next<6?'$'+fmt(s.total)+' / $'+fmt(goals[next])+' lifetime earnings':s.total>=1e6?'Millionaire! All six boards complete. Keep experimenting or revisit any board.':'Next milestone: $1M lifetime earnings';$('goalbar').style.width=Math.min(100,s.total/(goals[next]||1e6)*100)+'%';$('next').disabled=next>=6||s.total<goals[next];$('next').textContent=next<6?'Unlock board 0'+(next+1):'All six boards unlocked';}
$('shop').onclick=e=>{const b=e.target.closest('[data-buy]');if(!b)return;let k=b.dataset.buy,c=cost(k);if(s.cash<c||s[k]>=caps[k])return;s.cash-=c;s[k]++;beep(660);save();renderUI();};$('boards').onclick=e=>{const b=e.target.closest('[data-board]');if(b&&+b.dataset.board<=s.unlocked){if(+b.dataset.board===s.board)return;window.Portal?.stop();flightCache[s.board]=balls;s.board=+b.dataset.board;setup();save();}};$('next').onclick=()=>{if(s.unlocked<5&&s.total>=goals[s.unlocked+1]){window.Portal?.stop();flightCache[s.board]=balls;s.board=++s.unlocked;setup();save();toast('New board · '+names[s.board]);}};
$('burst').onclick=()=>{
  if(simTime<burstReady||!playing())return;
  const count=Math.min(10,220-balls.length);
  if(!count){toast('Board full · wait for balls to land');return;}
  for(let i=0;i<count;i++)addBall(s.aim+(i-(count-1)/2)*X(9),Y(65),1,(i-(count-1)/2)*X(22));
  burstReady=simTime+8;s.bursts++;beep(300);
};
$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'Sound off':'Sound on';$('sound').setAttribute('aria-pressed',String(!muted));beep();};
function pause(){running=window.Portal&&!window.Portal.interacted?true:!running;$('pause').textContent=running?'Pause flow':'Resume flow';syncStatus();}
function syncStatus(){syncPlatform();$('pauseTop').textContent=window.Portal&&!window.Portal.interacted?'Start':running?'Pause':'Resume';$('status').textContent=document.hidden?'TAB PAUSED':window.Portal&&!window.Portal.ready?'LOADING':window.Portal&&!window.Portal.interacted?'TAP TO START':!running?'PAUSED':document.querySelector('dialog[open]')?'HELP / PAUSED':'FLOWING';}
$('pause').onclick=pause;$('pauseTop').onclick=pause;
$('help').onclick=()=>{$('guide').showModal();syncStatus();};
$('close').onclick=()=>{$('guide').close();s.seen=true;save();syncStatus();};
$('guide').addEventListener('close',()=>{s.seen=true;save();syncStatus();});
$('reset').onclick=()=>{$('guide').close();$('resetdialog').showModal();syncStatus();};
$('resetcancel').onclick=()=>{$('resetdialog').close();syncStatus();};
$('resetconfirm').onclick=()=>{
  $('resetdialog').close();
  s=fresh();flightCache={};balls=[];burstReady=0;simTime=0;running=true;
  $('pause').textContent='Pause flow';setup();save();$('guide').showModal();syncStatus();
};
function remember(){s.layouts[s.board]=modules.map(({x,y})=>({x,y}));s.moves++;save();}
function selectModule(i){selected=i;$('selection').textContent=i<0?'Emitter selected':`Module ${i+1}: ${modules[i].type} selected`;}
$('modulepick').onchange=e=>selectModule(+e.target.value);
cv.onkeydown=e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Tab','Escape'].includes(e.key)){
    if(e.key==='Tab')return;
    e.preventDefault();
    if(e.key===' '){$('burst').click();return;}
    if(e.key==='Escape'){pause();return;}
    const d=(e.shiftKey?20:5)*SX,dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;
    if(selected<0){s.aim=clamp(s.aim+dx,X(35),X(565));save();}
    else{const m=modules[selected];m.x=clamp(m.x+dx,X(58),X(542));m.y=clamp(m.y+dy*SY/SX,Y(185),Y(570));remember();}
  }
};
$('restore').onclick=()=>{delete s.layouts[s.board];flightCache[s.board]=balls;setup();save();toast('Board layout restored · earnings kept');};
$('continue').onclick=()=>{$('complete').close();syncStatus();};
function point(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*WIDTH/r.width,y:(e.clientY-r.top)*HEIGHT/r.height};}cv.onpointerdown=e=>{if(e.isPrimary===false)return;window.Portal?.input();syncStatus();const p=point(e),r=cv.getBoundingClientRect(),hitY=Math.max(X(24),22*HEIGHT/r.height),hitX=Math.max(X(58),22*WIDTH/r.width);drag=modules.filter(m=>Math.abs(m.x-p.x)<hitX&&Math.abs(m.y-p.y)<hitY).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(drag){drag.offsetX=p.x-drag.x;drag.offsetY=p.y-drag.y;cv.setPointerCapture(e.pointerId);selectModule(drag.id);$('modulepick').value=String(drag.id);}else if(p.y<Y(145)){s.aim=clamp(p.x,X(35),X(565));save();}};cv.onpointermove=e=>{if(!drag||e.isPrimary===false)return;const p=point(e);drag.x=clamp(p.x-drag.offsetX,X(58),X(542));drag.y=clamp(p.y-drag.offsetY,Y(185),Y(570));};function end(){if(drag){remember();drag=null;}}cv.onpointerup=end;cv.onpointercancel=end;
function earn(b){const slot=Math.max(0,Math.min(4,Math.floor(b.x/(WIDTH/5)))),mult=pockets[s.board][slot],amount=b.v*ballValue()*mult;s.cash=Math.min(1e15,s.cash+amount);s.total=Math.min(1e15,s.total+amount);s.count++;boardCount++;if(mult===Math.max(...pockets[s.board]))centerCount++;boardEarned+=amount;recent.push({time:simTime,amount});if(labels.length<25)labels.push({x:b.x,y:Y(645),text:'+$'+fmt(amount),life:1});for(let i=0;i<4&&particles.length<180;i++)particles.push({x:b.x,y:Y(652),vx:(Math.random()-.5)*100,vy:-Math.random()*100,life:1});beep(300+slot*100);}
function step(dt){simTime+=dt;s.seconds+=dt;boardSeconds+=dt;spawn+=dt;const period=interval();if(spawn>=period){spawn%=period;addBall(s.aim,Y(65),Math.random()<Math.min(.6,.04*s.bounce)?5:1);}const children=[];for(let i=balls.length-1;i>=0;i--){let b=balls[i];b.age+=dt;b.trail.push({x:b.x,y:b.y});if(b.trail.length>5)b.trail.shift();b.vy+=Y(460)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<X(12)){b.x=X(12);b.vx=Math.abs(b.vx)*.8;}if(b.x>X(588)){b.x=X(588);b.vx=-Math.abs(b.vx)*.8;}for(const p of pegs){let dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),r=7+p.r;if(d<r){if(d<.01){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d;b.x=p.x+nx*(r+.1);b.y=p.y+ny*(r+.1);let v=b.vx*nx+b.vy*ny;if(v<0){b.vx-=1.65*v*nx;b.vy-=1.65*v*ny;b.vx+=(Math.random()-.5)*X(16);}p.glow=1;}}for(const m of modules){if(b.used.includes(m.id)||Math.abs(b.x-m.x)>X(48)||Math.abs(b.y-m.y)>X(15))continue;b.used.push(m.id);if(m.type==='multi'){b.v*=2;beep(780);}else if(m.type==='split'){if(balls.length+children.length<220)children.push({x:b.x+X(10),y:b.y+Y(20),v:b.v,vx:X(85),used:[...b.used]});b.vx=-X(85);b.y+=Y(20);}else{b.vx=m.x<WIDTH/2?X(200):-X(200);b.vy=-Y(110);b.y-=Y(20);}}if(b.y>Y(650)){earn(b);balls.splice(i,1);}else if(b.age>18){b.y=Y(651);} }for(const b of children)addBall(b.x,b.y,b.v,b.vx,b.used);for(const p of pegs)p.glow=Math.max(0,p.glow-dt*3);for(const a of particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=200*dt;a.life-=dt*2;}particles=particles.filter(a=>a.life>0);for(const a of labels){a.y-=dt*35;a.life-=dt;}labels=labels.filter(a=>a.life>0);}
function round(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}function draw(){ctx.clearRect(0,0,WIDTH,HEIGHT);const bg=ctx.createLinearGradient(0,0,WIDTH,HEIGHT);bg.addColorStop(0,'#152c33');bg.addColorStop(1,'#102027');ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.fillStyle='#5b85851c';for(let x=20;x<WIDTH;x+=25)for(let y=20;y<Y(650);y+=25)ctx.fillRect(x,y,1,1);ctx.strokeStyle='#dbff7020';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(s.aim,Y(70));ctx.lineTo(s.aim,Y(145));ctx.stroke();ctx.setLineDash([]);round(s.aim-X(25),Y(20),X(50),Y(35),8,'#dfff80');ctx.fillStyle='#233b30';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('↓',s.aim,Y(44));for(const p of pegs){ctx.beginPath();ctx.arc(p.x,p.y,p.r+3*p.glow,0,Math.PI*2);ctx.fillStyle=p.glow?'#dfff80':'#55777d';ctx.fill();ctx.beginPath();ctx.arc(p.x-1,p.y-1,2,0,7);ctx.fillStyle='#ffffff35';ctx.fill();}for(const b of balls){ctx.beginPath();b.trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=b.v>1?'#e4ff8340':'#ade9dc30';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.arc(b.x,b.y,7,0,7);ctx.fillStyle=b.v>1?'#e3ff7b':'#a7ead7';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=9;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(b.x-2,b.y-2,2,0,7);ctx.fillStyle='#fff9';ctx.fill();}for(const m of modules){if(m.id===selected){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(m.x-X(52),m.y-X(20),X(104),X(40));}const col=m.type==='multi'?'#a7ead7':m.type==='split'?'#e6acff':'#ffbc86';round(m.x-X(48),m.y-X(16),X(96),X(32),9,col);ctx.fillStyle='#15312d';ctx.font='bold '+X(14)+'px system-ui';ctx.fillText(m.type==='multi'?'×2 VALUE':m.type==='split'?'⑂ SPLIT':m.x<WIDTH/2?'KICK ↗':'↖ KICK',m.x,m.y+X(5));ctx.fillStyle=col+'60';ctx.fillRect(m.x-X(20),m.y+X(20),X(40),2);}for(let i=0;i<5;i++){round(i*WIDTH/5+X(4),Y(650),X(112),Y(42),8,pockets[s.board][i]===Math.max(...pockets[s.board])?'#dcff80':i%2?'#284c4d':'#22383f');ctx.fillStyle=pockets[s.board][i]===Math.max(...pockets[s.board])?'#173425':'#b9d9d4';ctx.font='bold '+X(18)+'px system-ui';ctx.fillText('×'+pockets[s.board][i],i*WIDTH/5+WIDTH/10,Y(678));}for(const p of particles){ctx.globalAlpha=p.life;ctx.fillStyle='#dbff70';ctx.fillRect(p.x,p.y,3,3);}for(const a of labels){ctx.globalAlpha=a.life;ctx.fillStyle='#eaffaa';ctx.font='bold 17px system-ui';ctx.fillText(a.text,a.x,a.y);}ctx.globalAlpha=1;}
let uiTime=0;
function frame(t){
  syncPlatform();
  const dt=Math.min((t-(last||t))/1000,.05);last=t;
  if(playing()){acc+=dt;while(acc>=1/120){step(1/120);acc-=1/120;}}
  draw();
  if(t-uiTime>250){
    uiTime=t;renderUI();syncStatus();
    recent=recent.filter(e=>simTime-e.time<10);
    $('flowstats').textContent='$'+(recent.reduce((a,e)=>a+e.amount,0)/Math.max(1,Math.min(10,boardSeconds))).toFixed(1)+'/s · best pockets '+(boardCount?Math.round(centerCount/boardCount*100):0)+'%';
    $('active').textContent=balls.length+' / 220 balls';
    const wait=Math.max(0,Math.ceil(burstReady-simTime));
    $('burst').disabled=wait>0||!playing()||balls.length>=220;
    $('burst').textContent=wait?'BURST RECHARGING · '+wait+'s':balls.length>=220?'BOARD FULL · WAIT FOR LANDINGS':'DROP A BURST · 10 BALLS';
    if(!s.won&&s.unlocked===5&&s.total>=1e6&&!document.querySelector('dialog[open]')){
      s.won=true;save();$('completetime').textContent='Six boards · $1M earned · '+Math.floor(s.seconds/60)+'m '+Math.floor(s.seconds%60)+'s recorded active play';$('complete').showModal();syncStatus();
    }
  }
  requestAnimationFrame(frame);
}
setup();save();fitBoard();if(typeof ResizeObserver!=='undefined')new ResizeObserver(fitBoard).observe(cv.parentElement);window.addEventListener('resize',fitBoard);window.Portal?.load();requestAnimationFrame(frame);setInterval(save,3000);
window.addEventListener('pagehide',()=>{end();save();});
document.addEventListener('visibilitychange',()=>{last=0;acc=0;end();syncStatus();save();});
if(!s.seen){$('guide').showModal();syncStatus();}

function fitBoard(){
  const wrap=cv.parentElement;if(!wrap)return;
  const height=Math.max(0,Math.min(wrap.clientHeight,wrap.clientWidth*HEIGHT/WIDTH));
  cv.style.height=height+'px';cv.style.width=height*WIDTH/HEIGHT+'px';
}
// Capture first intent, but never report active gameplay while a dialog is open.
for(const type of ['click','keydown'])document.addEventListener(type,e=>{if(type==='keydown'&&e.target!==cv)return;window.Portal?.input();syncStatus();});
window.addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)&&!['SELECT','TEXTAREA','INPUT'].includes(e.target.tagName))e.preventDefault();
});
window.addEventListener('wheel',e=>{
  const panel=e.target.closest?.('.left,.right,.panel,dialog,#boards');
  if(!panel)e.preventDefault();
},{passive:false});