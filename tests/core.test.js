import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/engine.js';
import {fresh,sanitize,createStorage,SAVE_KEY,OLD_KEY} from '../src/save.js';
import {LEVELS} from '../src/levels.js';
import {DT,MAX_BALLS,circleRect,bounce,random} from '../src/math.js';
import {addBall,removeBall,physicsStep} from '../src/physics.js';
import {metrics} from '../src/goals.js';
import {purchase,price,stars} from '../src/economy.js';
import {obstaclesAt,gravityAt} from '../src/obstacles.js';
import {PlatformAdapter} from '../src/platform.js';
import {bindInput} from '../src/input.js';
import {campaign,runAttempt,configure} from '../tools/campaign.js';

const memory=(entries={})=>{const data=new Map(Object.entries(entries));return{data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const sim=()=>new Engine(fresh());

test('all twelve missions clear sequentially without purchases through real rules',()=>{
  const r=campaign('strong',{upgrade:false});assert.equal(r.completed,12);assert(r.rows.every(x=>x.status==='won'));assert(r.totalSeconds>300&&r.totalSeconds<900);
});
test('earned money supports the upgrade campaign, without editing balances',()=>{
  const r=campaign('strong');assert.equal(r.completed,12);assert(r.rows.every(x=>x.coins>=0));assert(r.rows.at(-1).upgrades.flow>0);
});
const earned=fresh(),earner=new Engine(earned);
for(const l of LEVELS){assert(earner.load(l.id));assert.equal(runAttempt(earner).status,'won');}
for(const l of LEVELS){
  test(`${l.id+1} ${l.name}: weak route fails while strong replay succeeds`,()=>{
    for(const strategy of ['weak','strong']){const e=new Engine(sanitize(earned));e.load(l.id);const r=runAttempt(e,{strategy});assert.equal(r.status,strategy==='strong'?'won':'lost',r.reason);assert(r.duration<150);assert(r.lossRate>=0&&r.lossRate<=1);assert(r.efficiency>=0&&r.efficiency<=1);}
  });
}
test('Maze has a second successful route',()=>{const e=new Engine(sanitize(earned));e.load(9);assert.equal(runAttempt(e,{override:LEVELS[9].alternate}).status,'won');});
test('fresh campaign locks future missions and Challenge Replay',()=>{const e=sim();assert.equal(e.load(1),false);assert.equal(e.load(-1),false);assert.equal(e.load(NaN),false);assert.equal(e.replayUnlocked(),false);assert.equal(earner.replayUnlocked(),true);});
test('waiting with no adjustments cannot clear tutorial',()=>{const e=sim();e.start();while(e.phase==='running')e.step();assert.equal(e.phase,'lost');assert.match(e.result.reason,/Move at least|Aim/);assert.equal(e.profile.coins,0);});
test('preview cannot spend budget, score or money',()=>{const e=sim();configure(e);for(let i=0;i<120*60;i++)e.step();assert.equal(e.phase,'planning');assert.equal(e.emitted,0);assert.equal(e.roots.size,0);assert.equal(metrics(e).score,0);assert.equal(e.profile.coins,0);});
test('stopped attempt is recorded as failed and retry preserves upgrades',()=>{const e=sim();e.profile.coins=100;e.buy('flow');const balance=e.profile.coins;e.start();e.burst();e.retry();assert.equal(e.profile.journal.at(-1).status,'lost');assert.match(e.profile.journal.at(-1).reason,/stopped/);assert.equal(e.phase,'planning');assert.equal(e.profile.upgrades.flow,1);assert.equal(e.profile.coins,balance);assert.equal(e.profile.complete[0],false);});
test('budget and live-ball caps cannot be bypassed by bursts',()=>{const e=sim();e.start();for(let i=0;i<MAX_BALLS;i++)addBall(e,{});assert.equal(e.emit(),false);assert.equal(e.emitted,0);assert.equal(addBall(e,{}),null);e.balls=[];for(let i=0;i<100;i++)e.emit();assert.equal(e.emitted,e.level.budget);assert.equal(e.burst(),false);});
test('burst is finite and cooldown cannot be bypassed',()=>{const e=sim();e.start();assert(e.burst());const count=e.emitted;assert.equal(e.burst(),false);assert.equal(e.emitted,count);e.time=8;assert(e.burst());e.time=16;assert(e.burst());e.time=24;assert.equal(e.burst(),false);});
test('duplicate finish and identical replay cannot mint money',()=>{const e=sim();const a=runAttempt(e);const coins=e.profile.coins;assert.equal(e.finish(),false);assert.equal(e.profile.coins,coins);e.retry();const b=runAttempt(e);assert.equal(b.status,'won');assert.equal(b.reward,0);assert.equal(e.profile.coins,coins);assert.equal(a.stars,3);});
test('split descendants count once per original target and best score',()=>{const e=sim();e.start();e.emit();const b=e.balls[0];const child=addBall(e,{root:b.root,v:8});removeBall(e,b,null,2);removeBall(e,child,null,2);removeBall(e,child,null,2);const m=metrics(e);assert.equal(m.targeted,1);assert.equal(m.counts[2],1);assert.equal(m.score,40);assert.equal(m.efficiency,1);assert.equal(e.roots.get(0).pending,0);});
test('a lost branch is not a lost original if another branch lands',()=>{const e=sim();e.start();e.emit();const b=e.balls[0],c=addBall(e,{root:0});removeBall(e,b,'red trap');removeBall(e,c,null,2);assert.equal(metrics(e).failed,0);assert.equal(e.lostBalls,1);});
test('stalled originals are destroyed, never given a free landing',()=>{const e=sim();e.start();e.emit();e.balls[0].age=19;physicsStep(e,DT);assert.equal(metrics(e).delivered,0);assert.equal(metrics(e).failed,1);assert.equal(e.lossCauses['stalled for 18 seconds'],1);});
test('relative obstacle velocity transfers momentum correctly',()=>{const b={x:10,y:0,vx:0,vy:0};bounce(b,{nx:1,ny:0,depth:2},50,0,.72);assert.equal(b.vx,86);assert(b.x>12);});
test('inside-rectangle and exact-center contacts remain finite',()=>{const b={x:50,y:50,r:7,vx:0,vy:5};const c=circleRect(b,{x:0,y:0,w:100,h:100});bounce(b,c);assert(Number.isFinite(b.x+b.y+b.vx+b.vy));assert(c.depth>0);});
test('movers, crusher warnings and gravity changes are deterministic',()=>{const l=LEVELS[5];assert.deepEqual(obstaclesAt(l,3),obstaclesAt(l,3));const crusher=obstaclesAt(l,6.5).find(x=>x.type==='crusher');assert(crusher.warning&&!crusher.active);assert.equal(gravityAt(LEVELS[7],0).ax,-gravityAt(LEVELS[7],7).ax);});
test('random seeds replay exactly',()=>{const a=random(9),b=random(9);for(let i=0;i<100;i++)assert.equal(a(),b());});
test('permanent prices increase and tracks stop at six',()=>{const p=fresh();p.coins=99999;for(const k of Object.keys(p.upgrades)){let old=0;for(let i=0;i<6;i++){const cost=price(p,k);assert(cost>old);assert(purchase(p,k));old=cost;}assert.equal(purchase(p,k),false);}assert.equal(purchase(p,'other'),false);});
test('insufficient money and buying during a live attempt do nothing',()=>{const e=sim();assert.equal(e.buy('flow'),false);e.profile.coins=1000;e.start();assert.equal(e.buy('flow'),false);assert.equal(e.profile.coins,1000);});
test('star grading requires a win and rewards efficiency',()=>{assert.equal(stars(null,{status:'lost',efficiency:1,lossRate:0}),0);assert.equal(stars(null,{status:'won',efficiency:.9,lossRate:0}),3);assert.equal(stars(null,{status:'won',efficiency:.75,lossRate:.1}),2);});
test('0.2 migration preserves raw original and bounds compensation',()=>{const raw=JSON.stringify({cash:1e12,rate:99,value:99,bounce:99,balls:[{x:22}]});const m=memory({[OLD_KEY]:raw}),s=createStorage(m),p=s.load();assert.equal(m.getItem(OLD_KEY),raw);assert.equal(m.getItem('ball-cascade-v02-backup'),raw);assert.equal(p.coins,300);assert.deepEqual(p.upgrades,{flow:2,precision:2,burst:2});assert(p.complete.every(v=>!v));assert.equal(p.balls,undefined);s.save(p);assert.equal(createStorage(m).load().legacy,true);});
test('corrupt save is backed up and fresh campaign remains playable',()=>{const m=memory({[SAVE_KEY]:'{broken'}),s=createStorage(m);assert.equal(s.load().coins,0);assert.equal(m.getItem(SAVE_KEY+'-corrupt-backup'),'{broken');assert.match(s.notice,/backed up/);});
test('blocked storage remains playable and reports the limitation',()=>{const s=createStorage({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});assert.equal(s.load().version,3);assert.equal(s.save(fresh()),false);assert.equal(s.available,false);});
test('save validation rejects invalid values and impossible sequential unlocks',()=>{const p=sanitize({coins:NaN,complete:[false,true,true],upgrades:{flow:Infinity,precision:-4,burst:999},layouts:{0:[{x:NaN,y:1}]},balls:[1],bests:{0:{stars:99,efficiency:50}}});assert.equal(p.coins,0);assert.equal(p.upgrades.burst,6);assert(p.complete.every(v=>!v));assert.deepEqual(p.layouts,{});assert.equal(p.balls,undefined);assert.equal(p.bests[0].stars,3);});
test('reload retains layout/aim/progress but restarts unfinished physics',()=>{const e=sim();configure(e);e.start();e.burst();const p=sanitize(JSON.parse(JSON.stringify(e.profile))),next=new Engine(p);assert.equal(next.phase,'planning');assert.equal(next.balls.length,0);assert.equal(next.aim,e.aim);assert.equal(next.modules[0].x,e.modules[0].x);});
test('SDK failure cannot prevent play and lifecycle calls are deduplicated',async()=>{const bad=new PlatformAdapter({init:()=>Promise.reject(Error('offline'))});await bad.init();assert(bad.ready);bad.input();bad.update(true);assert(bad.active);const calls=[];const good=new PlatformAdapter({init:async()=>{},gameLoadingFinished:()=>calls.push('ready'),gameplayStart:()=>calls.push('start'),gameplayStop:()=>calls.push('stop')});await good.init();good.update(true);good.input();good.update(true);good.update(true);good.update(false);assert.deepEqual(calls,['ready','start','stop']);});
test('mobile-scaled touch pointer drag, secondary pointer rejection and cancellation',()=>{
  const listeners={},e=sim(),r={selected:-1};const canvas={getBoundingClientRect:()=>({left:10,top:20,width:384,height:216}),addEventListener:(k,f)=>listeners[k]=f,setPointerCapture:()=>{}};
  bindInput(canvas,e,r);const m=e.modules[0],sx=10+m.x*.4,sy=20+m.y*.4;
  listeners.pointerdown({clientX:sx,clientY:sy,pointerId:1,pointerType:'touch',isPrimary:true});
  listeners.pointermove({clientX:202,clientY:120,pointerId:2,pointerType:'touch'});assert.equal(m.x,160);
  listeners.pointermove({clientX:202,clientY:120,pointerId:1,pointerType:'touch'});assert.equal(m.x,480);assert.equal(m.y,250);
  listeners.pointercancel({pointerId:1});listeners.pointermove({clientX:250,clientY:160,pointerId:1});assert.equal(m.x,480);
});
test('keyboard and numeric positioning clamp modules and reject non-finite input',()=>{const e=sim();assert.equal(e.moveModule(0,NaN,200),false);e.moveModule(0,-999,999);assert.equal(e.modules[0].x,85);assert.equal(e.modules[0].y,445);assert.equal(e.aimTo(Infinity),false);});
