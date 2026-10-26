import test from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/engine.js';
import {fresh} from '../src/save.js';
import {bindInput} from '../src/input.js';

function fixture(pointerType='mouse',width=384,height=216){
  const listeners={},captured=[],engine=new Engine(fresh()),renderer={selected:0};
  const canvas={style:{},getBoundingClientRect:()=>({left:10,top:20,width,height}),addEventListener:(type,fn)=>listeners[type]=fn,setPointerCapture:id=>captured.push(id)};
  const input=bindInput(canvas,engine,renderer);
  const send=(type,x,y,extra={})=>listeners[type]({clientX:10+x*width/960,clientY:20+y*height/540,pointerId:1,pointerType,isPrimary:true,button:0,...extra});
  return {engine,renderer,canvas,captured,input,send};
}
for(const type of ['mouse','touch'])test(`${type}: grab arrow without snapping, drag both ways, save and release`,()=>{
  const {engine,renderer,canvas,captured,send}=fixture(type);
  send('pointerdown',500,30);assert.equal(engine.aim,480);assert.equal(renderer.selected,-1);assert.deepEqual(captured,[1]);assert.equal(canvas.style.cursor,'ew-resize');
  send('pointermove',620,180);assert.equal(engine.aim,600);assert.equal(engine.profile.aims[0],600);assert.equal(engine.actions.aimed,true);
  send('pointermove',360,180);assert.equal(engine.aim,340);send('pointerup',360,180);send('pointermove',700,30);assert.equal(engine.aim,340);
});
test('drag clamps to emitter bounds and ignores a second finger',()=>{const {engine,send}=fixture('touch');send('pointerdown',480,30);send('pointermove',300,30,{pointerId:2});assert.equal(engine.aim,480);send('pointerup',300,30,{pointerId:2});send('pointermove',-100,30);assert.equal(engine.aim,45);send('pointermove',1500,30);assert.equal(engine.aim,915);});
test('tap elsewhere at top still aims; cancel stops the following drag',()=>{const {engine,send}=fixture('touch');send('pointerdown',700,100);assert.equal(engine.aim,700);send('pointermove',750,100);assert.equal(engine.aim,750);send('pointercancel',750,100);send('pointermove',100,100);assert.equal(engine.aim,750);});
test('lost capture and page cancellation release an emitter drag',()=>{const {engine,send,input}=fixture();send('pointerdown',480,30);send('lostpointercapture',480,30);send('pointermove',600,30);assert.equal(engine.aim,480);send('pointerdown',480,30);input.cancel();send('pointermove',600,30);assert.equal(engine.aim,480);});
test('secondary mouse button does not move the emitter',()=>{const {engine,send,captured}=fixture();send('pointerdown',700,30,{button:2});send('pointermove',800,30);assert.equal(engine.aim,480);assert.equal(captured.length,0);});
test('arrow takes priority over expanded module hit targets on short mobile boards',()=>{const {engine,renderer,send}=fixture('touch',160,90);engine.moveModule(0,480,145);send('pointerdown',480,30);send('pointermove',600,30);assert.equal(renderer.selected,-1);assert.equal(engine.aim,600);assert.equal(engine.modules[0].x,480);});
