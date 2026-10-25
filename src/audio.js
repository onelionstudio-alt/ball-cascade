export class AudioSystem{
  constructor(){this.enabled=false;this.context=null;this.last=-10;}
  enable(value){this.enabled=value;if(value){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch{}}else this.suspend();}
  suspend(){try{this.context?.suspend().catch(()=>{});}catch{}}
  play(type){
    if(!this.enabled||!this.context)return;const c=this.context,important=['win','fail'].includes(type);
    if(!important&&c.currentTime-this.last<.09)return;this.last=c.currentTime;
    const notes={pocket:[420],multi:[720],split:[560,840],kick:[320],destroy:[110],portal:[600,900],reactor:[800],chain:[660,880],win:[523,659,784],fail:[260,170],upgrade:[700],burst:[280,400],start:[440],retry:[350]}[type];if(!notes)return;
    try{c.resume().catch(()=>{});notes.forEach((hz,i)=>{const t=c.currentTime+i*.08,o=c.createOscillator(),g=c.createGain();o.type=type==='destroy'?'triangle':'sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(important?.035:.015,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.15);});}catch{}
  }
}
