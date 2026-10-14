import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out=fileURLToPath(new URL('../../test-results/launch-auth/', import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const report=[];
for(const path of ['/signin?returnTo=%2Frumpelstiltskin-dance-video','/signup','/forgot-password','/reset-password','/cellphone','/wechat']) {
 await page.goto('http://127.0.0.1:7002'+path);
 await page.waitForTimeout(700);
 const data=await page.locator('body').innerText();
 report.push({path,text:data});
 await page.screenshot({path:out+path.split('?')[0].slice(1)+'-before.png',fullPage:true});
}
await writeFile(out+'before.json',JSON.stringify(report,null,2));
console.log(report);
await browser.close();
