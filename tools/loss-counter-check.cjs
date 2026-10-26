// Regression through actual UI controls, using a previously earned campaign save.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');let browser;
(async()=>{
 const baseline='0b0d192911541b58f604c4f020af254447e6f5d1',base=process.argv[2]||'http://127.0.0.1:8020/';
 const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).split('\n').filter(f=>['index.html','game.js','styles.css'].includes(f)||/^src\/[a-z-]+\.js$/.test(f));
 for(const file of files){const target=path.resolve('.qa/loss-before',file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,execFileSync('git',['show',baseline+':'+file]));}
 const profile=JSON.parse(await fs.readFile('docs/feel/after/results.json','utf8')).report.profile,out='docs/fixes/loss-counter';await fs.mkdir(out,{recursive:true});
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const rows=[],errors=[];
 for(const mode of ['before','after']){
  const context=await browser.newContext({viewport:{width:1440,height:900}});await context.addInitScript(saved=>localStorage.setItem('ball-cascade-v3',saved),JSON.stringify(profile));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+(mode==='before'?'.qa/loss-before/':'')+'?qaSpeed=8');await page.locator('[data-level="10"]').click();await page.locator('#controls summary').click();
  for(const [i,x,y]of [[0,480,220],[1,325,365],[2,635,365],[-1,480,220]]){await page.locator('#modulepick').selectOption(String(i));await page.locator('#coordx').fill(String(x));if(i>=0)await page.locator('#coordy').fill(String(y));await page.locator('#apply').click();}
  await page.locator('#controls summary').click();await page.locator('#launch').click();await page.locator('#result[open]').waitFor({timeout:30000});await page.locator('#resultclose').click();const displayed=Number(await page.locator('#lost').innerText()),label=await page.locator('#lost').locator('..').locator('small').innerText();await page.screenshot({path:out+'/'+mode+'.png',fullPage:true});
  if(mode==='after'){await page.setViewportSize({width:360,height:800});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/mobile.png',fullPage:true});}
  await page.locator('#help').click();await page.locator('#report').click();const report=JSON.parse(await page.locator('#reporttext').inputValue()),r=report.result,destroyed=Object.values(r.lossCauses).reduce((sum,n)=>sum+n,0);assert(destroyed>0);assert.equal(r.failed,0);assert.equal(displayed,mode==='before'?r.failed:destroyed);rows.push({mode,label,displayed,destroyed,fullyLostOriginals:r.failed,emitted:r.emitted,lossRate:r.lossRate,causes:r.lossCauses});await context.close();
 }
 assert.equal(rows[0].destroyed,rows[1].destroyed);assert.equal(errors.length,0);await fs.writeFile(out+'/results.json',JSON.stringify({baseline,source:'Actual Chrome UI attempt; identical unmodified previously earned save; no state injections during play',rows,errors},null,2));await browser.close();console.log(JSON.stringify(rows,null,2));
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
