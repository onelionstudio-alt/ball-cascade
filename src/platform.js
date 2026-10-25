// No SDK or ads load in 0.3. Supply a vendor adapter in a later integration.
export class PlatformAdapter{
  constructor(api=null){this.api=api;this.active=false;this.ready=false;this.intent=false;}
  async init(){let timer;try{if(this.api){await Promise.race([this.api.init(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('SDK timeout')),2500);})]);this.api.gameLoadingFinished?.();}}catch{this.api=null;}finally{clearTimeout(timer);this.ready=true;}}
  input(){this.intent=true;}
  update(playing){const active=!!(playing&&this.intent&&this.ready);if(active===this.active)return;this.active=active;try{this.api?.[active?'gameplayStart':'gameplayStop']?.();}catch{}}
}
