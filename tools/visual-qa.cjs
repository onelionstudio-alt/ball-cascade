// Real-browser captures and earned campaign regression. All campaign actions
// use the visible UI; no game state or completion flag is set.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const mode=process.argv[2]||'after',base=process.argv[3]||'http://127.0.0.1:8020/';
const out=path.resolve('docs/visual',mode);
let activeBrowser;
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser=activeBrowser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[],rows=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+'?qaSpeed=8');await page.locator('[data-level="0"]').waitFor();
 const take=async name=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true,animations:'disabled'});console.log('SCREENSHOT',mode,name);};
 const controls=async()=>{if(!await page.locator('#controls').evaluate(e=>e.open))await page.locator('#controls summary').click();};
 const place=async(i,x,y)=>{await page.locator('#modulepick').selectOption(String(i));await page.locator('#coordx').fill(String(x));if(i>=0)await page.locator('#coordy').fill(String(y));await page.locator('#apply').click();};
 const plans=[{aim:530,modules:[[480,220]]},{aim:280,modules:[[280,180],[820,365]]},{aim:285,modules:[[285,200],[820,370]]},{aim:480,modules:[[480,175],[340,335],[620,335]]},{aim:370,modules:[[430,245],[130,385]]},{aim:220,modules:[[220,195],[220,380]]},{aim:265,modules:[[265,170],[600,400]]},{aim:480,modules:[[480,175],[330,345],[630,345]]},{aim:320,modules:[[320,190],[800,410]]},{aim:300,modules:[[300,185],[850,400]]},{aim:480,modules:[[480,170],[325,365],[635,365]]},{aim:480,modules:[[480,170],[325,355],[635,355],[120,430]]}];
 const configure=async id=>{await controls();for(let i=0;i<plans[id].modules.length;i++)await place(i,...plans[id].modules[i]);await place(-1,plans[id].aim);await page.locator('#controls summary').click();await page.locator('.workshop').evaluate(e=>e.scrollTop=0);};
 const launch=async()=>{await page.locator('#launch').click();if(await page.locator('#launch').isEnabled())await page.locator('#launch').click();};
 const resolve=async()=>{const deadline=Date.now()+45000;while(!await page.locator('#result').evaluate(e=>e.open)){assert(Date.now()<deadline,'Attempt did not resolve');if(await page.locator('#launch').isEnabled()&&/BURST/i.test(await page.locator('#launch').innerText()))await page.locator('#launch').click();await page.waitForTimeout(100);}return {title:await page.locator('#resulttitle').innerText(),reason:await page.locator('#resultreason').innerText(),stats:await page.locator('#resultstats').innerText()};};
 await take('01-first-light-before');
 // A genuine failed attempt, using the unchanged starting machine.
 await launch();await resolve();assert.equal(await page.locator('#next').isVisible(),false);await take('05-defeat');await page.locator('#resultretry').click();
 for(let id=0;id<12;id++){
  await configure(id);await launch();
  if(id===0||id===10){await page.waitForFunction(()=>Number(document.querySelector('#budget').textContent.split('/')[0])>=12);await page.locator('#pause').click();await take(id===0?'02-first-light-playing':'03-obstacles');await page.locator('#pause').click();}
  const result=await resolve();assert(await page.locator('#next').isVisible(),`Mission ${id+1} failed: ${result.reason}`);rows.push({level:id+1,...result});console.log('WON',mode,id+1,result.stats.replace(/\n/g,' | '));
  if(id===0){await page.waitForTimeout(1000);await take('04-victory');await page.locator('#resultclose').click();await take('06-workshop');await page.locator('#launch').click();}
  if(id<11)await page.locator('#next').click();
 }
 await page.locator('#next').click();
 const layouts=[];
 for(const [name,width,height]of [['iphone',390,844],['android',360,800],['tablet',768,1024],['landscape',844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);await take('07-'+name);
  const size=await page.evaluate(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return{viewport:innerWidth,scroll:document.documentElement.scrollWidth,canvas:{x:r.x,y:r.y,width:r.width,height:r.height},launch:document.querySelector('#launch').getBoundingClientRect().toJSON()};});
  assert(size.scroll<=width,`${name}: horizontal overflow`);assert(size.canvas.width>0&&size.canvas.height>0,`${name}: invisible board`);layouts.push({name,width,height,...size});
 }
 // The exported local report is UI data, not an injected campaign fixture.
 await page.setViewportSize({width:1440,height:900});await page.locator('#help').click();await page.locator('#report').click();const report=JSON.parse(await page.locator('#reporttext').inputValue());assert(report.profile.complete.every(Boolean));
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({mode,base,rows,layouts,errors,report},null,2));
 assert.equal(errors.length,0,errors.join('\n'));
 await browser.close();console.log('VISUAL QA COMPLETE',mode);
})().catch(async e=>{console.error(e);await activeBrowser?.close();process.exitCode=1;});
