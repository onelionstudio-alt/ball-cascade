export function obstaclesAt(level,time){return level.obstacles.map((o,id)=>{
  const r={...o,id,vx:0,vy:0,active:true,warning:false};
  if(o.type==='mover'){
    const angle=(time+(o.phase||0))*Math.PI*2/o.period,delta=Math.sin(angle)*o.range,velocity=Math.cos(angle)*o.range*Math.PI*2/o.period;
    r[o.axis]+=delta;r[o.axis==='x'?'vx':'vy']=velocity;
  }
  if(o.type==='crusher'){
    const p=(time%o.period)/o.period;r.active=p<o.duty;r.warning=!r.active&&p>1-.8/o.period;
    r.y=o.y+Math.sin(time*Math.PI*2/o.period)*o.range;r.vy=Math.cos(time*Math.PI*2/o.period)*o.range*Math.PI*2/o.period;
  }
  return r;
});}
export function gravityAt(level,time){if(!level.gravity)return {ax:0,next:0,remaining:0};const step=level.gravityPeriod||7,index=Math.floor(time/step),sign=index%2?-1:1;return {ax:sign*level.gravity,next:-sign,remaining:step-time%step};}
