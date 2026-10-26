const TONES={peg:[1047],pocket:[392],multi:[659,988],split:[587,880],kick:[330],destroy:[110],portal:[523,1047],reactor:[784],chain:[659,880,1047],win:[523,659,784],fail:[330,262],upgrade:[659,880],burst:[392,523],start:[440,659],retry:[392],place:[440]};
export class AudioSystem{
 constructor(){this.enabled=false;this.context=null;this.last=-10;this.cooldowns=new Map();this.voices=new Set();this.master=null;}
 enable(value){this.enabled=value;if(value){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch{}}else this.suspend();}
 suspend(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();try{this.context?.suspend().catch(()=>{});}catch{}}
 play(type,data={}){
  if(!this.enabled||!this.context||!TONES[type])return;const c=this.context,important=type==='win'||type==='fail',now=c.currentTime;
  const gap=type==='peg'?.12:type==='portal'?.18:type==='chain'?.22:.09;
  if(!important&&(now-this.last<.045||now-(this.cooldowns.get(type)??-10)<gap))return;
  this.last=now;this.cooldowns.set(type,now);
  if(!this.master){this.master=c.createGain();this.master.gain.value=.55;this.master.connect(c.destination);}
  const notes=type==='pocket'&&data.target?[784,1047]:TONES[type],duration=type==='peg'?.045:type==='destroy'?.12:important?.22:.13;
  try{c.resume().catch(()=>{});for(let i=0;i<notes.length&&this.voices.size<8;i++){
   const t=now+i*.055,o=c.createOscillator(),g=c.createGain();o.type=type==='destroy'||type==='peg'?'triangle':'sine';o.frequency.setValueAtTime(notes[i],t);
   if(type==='portal'||type==='multi')o.frequency.exponentialRampToValueAtTime(notes[i]*1.12,t+.08);
   if(type==='destroy')o.frequency.exponentialRampToValueAtTime(55,t+.1);
   const volume=type==='peg'?.007:important?.035:type==='destroy'?.013:.019;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.master);this.voices.add(o);o.onended=()=>this.voices.delete(o);o.start(t);o.stop(t+duration+.01);
  }}catch{}
 }
}
