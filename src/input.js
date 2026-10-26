import {W,H} from './math.js';
export function bindInput(canvas,engine,renderer,{onChange=()=>{},onPause=()=>{},onLaunch=()=>{},select=()=>{}}={}){
  let drag=null,pointer=null;
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};};
  function choose(id){renderer.selected=id;select(id);}
  function capture(e){pointer=e.pointerId;try{canvas.setPointerCapture(pointer);}catch{/* Detached or synthetic pointers can still move within the canvas. */}if(canvas.style)canvas.style.cursor=drag.id<0?'ew-resize':'grabbing';}
  canvas.addEventListener('pointerdown',e=>{
    if(e.isPrimary===false||pointer!==null||e.button>0)return;
    const p=point(e),r=canvas.getBoundingClientRect(),hx=Math.max(78,22*W/r.width),hy=Math.max(28,22*H/r.height);
    const m=engine.modules.filter(m=>Math.abs(m.x-p.x)<hx&&Math.abs(m.y-p.y)<hy).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    if(m){drag={id:m.id,dx:p.x-m.x,dy:p.y-m.y};choose(m.id);capture(e);}
    else if(p.y<125){
      // Grabbing the arrow preserves the finger's offset; tapping elsewhere in
      // the top strip still aims immediately and can continue into a drag.
      const onArrow=p.y<75&&Math.abs(p.x-engine.aim)<Math.max(44,22*W/r.width);
      drag={id:-1,dx:onArrow?p.x-engine.aim:0};
      if(!onArrow)engine.aimTo(p.x);choose(-1);capture(e);onChange();
    }
  });
  canvas.addEventListener('pointermove',e=>{
    const p=point(e);
    if(!drag){if(canvas.style)canvas.style.cursor=p.y<125?'ew-resize':'grab';return;}
    if(e.pointerId!==pointer)return;
    if(drag.id<0)engine.aimTo(p.x-drag.dx);else engine.moveModule(drag.id,p.x-drag.dx,p.y-drag.dy);
    onChange();
  });
  function end(e){if(e&&pointer!==null&&e.pointerId!==pointer)return;drag=null;pointer=null;if(canvas.style)canvas.style.cursor='';}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Escape'].includes(e.key))e.preventDefault();if(e.key==='Escape'){onPause();return;}if(e.key===' '){onLaunch();return;}const d=e.shiftKey?20:5,dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;if(dx||dy){if(renderer.selected<0)engine.aimTo(engine.aim+dx);else{const m=engine.modules[renderer.selected];if(m)engine.moveModule(m.id,m.x+dx,m.y+dy);}onChange();}});
  return {choose,cancel:end};
}
