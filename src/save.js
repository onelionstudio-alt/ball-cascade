import {clamp,finite} from './math.js';
import {LEVELS} from './levels.js';
export const SAVE_KEY='ball-cascade-v3',OLD_KEY='ball-cascade-v1';
export function fresh(){return {version:3,coins:0,upgrades:{flow:0,precision:0,burst:0},complete:Array(12).fill(false),bests:{},layouts:{},aims:{},sound:false,tutorial:{stage:0,skipped:false},journal:[],attemptSerial:0,legacy:false};}
export function sanitize(raw){
  const p=fresh();if(!raw||typeof raw!=='object'||Array.isArray(raw))return p;
  p.coins=clamp(Math.floor(finite(raw.coins)),0,99999);
  for(const key of Object.keys(p.upgrades))p.upgrades[key]=clamp(Math.floor(finite(raw.upgrades?.[key])),0,6);
  p.complete=p.complete.map((_,i)=>raw.complete?.[i]===true);
  // Campaign completion is sequential; a damaged last-level flag cannot unlock replay.
  let blocked=false;p.complete=p.complete.map(v=>{if(!v)blocked=true;return !blocked&&v;});
  p.sound=raw.sound===true;p.legacy=raw.legacy===true;
  p.tutorial={stage:clamp(Math.floor(finite(raw.tutorial?.stage)),0,3),skipped:raw.tutorial?.skipped===true};
  p.attemptSerial=clamp(Math.floor(finite(raw.attemptSerial)),0,1e9);
  for(const level of LEVELS){
    const a=raw.layouts?.[level.id];
    if(Array.isArray(a)&&a.length===level.modules.length&&a.every(m=>m&&Number.isFinite(m.x)&&Number.isFinite(m.y)))p.layouts[level.id]=a.map((m,id)=>({x:clamp(m.x,85,875),y:clamp(m.y,145,445)}));
    const aim=raw.aims?.[level.id];if(Number.isFinite(aim))p.aims[level.id]=clamp(aim,45,915);
    const b=raw.bests?.[level.id];if(b&&typeof b==='object')p.bests[level.id]={stars:clamp(Math.floor(finite(b.stars)),0,3),efficiency:clamp(finite(b.efficiency),0,1),score:clamp(finite(b.score),0,1e8),duration:clamp(finite(b.duration),0,3600)};
  }
  if(Array.isArray(raw.journal))p.journal=raw.journal.slice(-40).filter(x=>x&&typeof x==='object').map(x=>({level:clamp(finite(x.level),0,11),status:x.status==='won'?'won':'lost',duration:clamp(finite(x.duration),0,3600),efficiency:clamp(finite(x.efficiency),0,1),reward:clamp(finite(x.reward),0,1000),reason:String(x.reason||'').slice(0,200)}));
  return p;
}
export function createStorage(storage){
  let available=true,notice='';
  function backup(key,text){if(!storage.getItem(key))storage.setItem(key,text);}
  function load(){
    try{
      const current=storage.getItem(SAVE_KEY);
      if(current){try{return sanitize(JSON.parse(current));}catch{backup(SAVE_KEY+'-corrupt-backup',current);notice='Damaged campaign save backed up. A fresh campaign is ready.';return fresh();}}
      const old=storage.getItem(OLD_KEY);
      if(old){
        backup('ball-cascade-v02-backup',old);
        let legacy;try{legacy=JSON.parse(old);}catch{notice='Unreadable 0.2 save retained as a backup. Starting a fresh campaign.';return fresh();}
        const p=fresh();p.legacy=true;
        p.coins=clamp(Math.floor(finite(legacy.cash)/100),0,300);
        p.upgrades.flow=clamp(Math.floor(finite(legacy.rate)/4),0,2);
        p.upgrades.precision=clamp(Math.floor(finite(legacy.value)/4),0,2);
        p.upgrades.burst=clamp(Math.floor(finite(legacy.bounce)/4),0,2);
        notice='0.2 save backed up. Upgrades converted; the new challenges start at First Light.';
        return p;
      }
    }catch{available=false;notice='Saving unavailable. This session remains playable.';}
    return fresh();
  }
  function save(profile){try{storage.setItem(SAVE_KEY,JSON.stringify(profile));available=true;return true;}catch{available=false;notice='Saving unavailable. Keep this tab open to keep your campaign.';return false;}}
  return {load,save,get available(){return available;},get notice(){return notice;}};
}
