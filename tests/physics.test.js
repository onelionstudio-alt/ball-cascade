import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/engine.js';
import {fresh} from '../src/save.js';
import {addBall,physicsStep} from '../src/physics.js';
import {DT} from '../src/math.js';
// Isolated contacts deliberately place a ball at a contact surface. These unit
// fixtures are separate from the earned, sequential campaign tests.
function contact(obstacles=[],modules=[]){const e=new Engine(fresh());e.level={...e.level,obstacles};e.pegs=[];e.modules=modules;e.start();e.emit();e.balls[0].x=480;e.balls[0].y=250;e.balls[0].vx=0;e.balls[0].vy=0;return e;}
test('static wall bounces an approaching ball',()=>{const e=contact([{type:'wall',x:450,y:255,w:60,h:20}]);e.balls[0].vy=100;physicsStep(e,DT);assert(e.balls[0].vy<0);assert.equal(e.balls.length,1);});
test('active trap destroys once and records an explicit cause',()=>{const e=contact([{type:'trap',x:450,y:245,w:60,h:20}]);physicsStep(e,DT);assert.equal(e.balls.length,0);assert.equal(e.lostBalls,1);assert.equal(e.lossCauses['red trap'],1);physicsStep(e,DT);assert.equal(e.lostBalls,1);});
test('inactive crusher is traversable, active crusher is dangerous',()=>{const o={type:'crusher',x:450,y:245,w:60,h:20,range:0,period:7,duty:.35};const e=contact([o]);e.time=4;physicsStep(e,DT);assert.equal(e.balls.length,1);e.time=0;physicsStep(e,DT);assert.equal(e.balls.length,0);});
test('portal has predictable exit velocity, cooldown and hop limit',()=>{const e=contact([{type:'portal',x:480,y:250,ex:800,ey:340,r:27}]);physicsStep(e,DT);let b=e.balls[0];assert.equal(b.x,800);assert.equal(b.y,376);assert.equal(b.vx,0);assert.equal(b.vy,70);assert.equal(b.hops,1);assert.equal(e.roots.get(0).portal,true);b.x=480;b.y=250;physicsStep(e,DT);assert.equal(b.hops,1);b.portalCooldown=0;b.hops=3;physicsStep(e,DT);assert.equal(e.balls.length,0);assert.equal(e.lossCauses['portal loop'],1);});
test('splitter inherits root ownership and cannot retrigger itself',()=>{const e=contact([],[{id:0,type:'split',x:480,y:250}]);physicsStep(e,DT);assert.equal(e.balls.length,2);assert.equal(e.roots.get(0).pending,2);assert(e.balls.every(b=>b.used.includes(0)&&b.root===0));for(const b of e.balls){b.x=480;b.y=250;}physicsStep(e,DT);assert.equal(e.balls.length,2);});
test('multipliers cap at eight and cannot multiply repeatedly on one module',()=>{const e=contact([],[0,1,2,3,4].map(id=>({id,type:'multi',x:480,y:250})));physicsStep(e,DT);assert.equal(e.balls[0].v,8);assert.equal(e.balls[0].used.length,5);assert(e.roots.get(0).boosted);});
test('wind and horizontal gravity accelerate gradually',()=>{const e=contact([{type:'wind',x:400,y:200,w:200,h:100,force:120}]);e.level.gravity=60;e.level.gravityPeriod=7;physicsStep(e,DT);assert.equal(e.balls[0].vx,180*DT);e.time=7;e.balls[0].vx=0;physicsStep(e,DT);assert.equal(e.balls[0].vx,60*DT);});
test('reactors stop adding descendants at depth three',()=>{const e=contact([{id:0,type:'reactor',x:480,y:250,tx:600,ty:350,r:25}]);e.balls[0].chainDepth=3;physicsStep(e,DT);assert.equal(e.balls.length,1);assert.equal(e.chains,0);});
test('maximum population remains finite across moving geometry',()=>{const e=contact([{type:'mover',x:400,y:255,w:150,h:18,axis:'x',range:60,period:7}]);for(let i=1;i<220;i++)addBall(e,{x:15+i*4,y:180,vx:150-i});for(let i=0;i<120*20;i++){e.time+=DT;physicsStep(e,DT);assert(e.balls.length<=220);assert(e.balls.every(b=>Number.isFinite(b.x+b.y+b.vx+b.vy)));}assert.equal(e.balls.length,0);});
