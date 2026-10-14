import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:7002';
const out=fileURLToPath(new URL('../../test-results/launch-auth/', import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge'});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const page=await context.newPage();
const report={checks:[],pages:[],errors:[],outbound:[],mutations:[]};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('request',request=>{
 const url=new URL(request.url());
 if(!['127.0.0.1','localhost'].includes(url.hostname))report.outbound.push(url.origin+url.pathname);
 if(request.method()!=='GET')report.mutations.push({method:request.method(),path:url.pathname});
});
const check=(name)=>report.checks.push(name);
const shot=async(name)=>page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
try {
 for(const route of ['/signin','/signup','/forgot-password','/reset-password','/cellphone','/wechat']) {
  const response=await page.goto(base+route);
  assert.equal(response.status(),200);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.waitForTimeout(150);
  const body=await page.locator('body').innerText();
  report.pages.push({route,text:body});
  await shot(route.slice(1)+'-after');
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth>window.innerWidth),false);
  if(['/signin','/signup'].includes(route)) {
   for(const name of ['Google','GitHub','WeChat','Phone'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0);
   assert(!body.includes('Or continue with'));
  }
  if(route==='/signup')await expect(page.locator('#image')).toHaveCount(0);
  if(route==='/forgot-password'){
   await expect(page.locator('form')).toHaveCount(0);
   await expect(page.getByRole('link',{name:'zw83716@gmail.com'})).toHaveAttribute('href','mailto:zw83716@gmail.com');
  }
  if(route==='/reset-password')await expect(page.locator('form')).toHaveCount(0);
  if(route==='/wechat')await expect(page.locator('#login_container')).toHaveCount(0);
  if(route==='/cellphone')await expect(page.locator('form')).toHaveCount(0);
 }
 check('Six auth pages render, no placeholder providers or unusable reset form');
 // Real clicks preserve the tool destination through sign-in, sign-up and recovery.
 await page.goto(base+'/rumpelstiltskin-dance-video');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Sign in',exact:true}).click();
 await expect(page).toHaveURL(/signin\?returnTo=%2Frumpelstiltskin-dance-video/);
 await page.getByRole('link',{name:'Forgot password?',exact:true}).click();
 await page.getByRole('link',{name:'Back to sign in',exact:true}).click();
 await page.getByRole('link',{name:'Sign up',exact:true}).click();
 assert.equal(new URL(page.url()).searchParams.get('returnTo'),'/rumpelstiltskin-dance-video');
 check('Tool -> sign-in -> forgot/back -> sign-up preserves returnTo');
 const email=`e2e-launch-auth-${Date.now()}@example.com`;
 const password='Launch-test-'+crypto.randomUUID();
 await page.locator('#name').fill('Launch Test');
 await page.locator('#email').fill(email);
 await page.locator('#password').fill(password);
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page).toHaveURL(base+'/rumpelstiltskin-dance-video',{timeout:20000});
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await expect(nav.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
 assert.equal((await (await context.request.get(base+'/api/credits/balance')).json()).balance,40);
 await shot('signed-in-desktop');
 check('Real email registration auto-signs in and returns to original tool; internal trial credits are intact');
 await page.setViewportSize({width:390,height:844});
 await shot('signed-in-mobile');
 assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth>window.innerWidth),false);
 check('Mobile signed-in header has no horizontal overflow');
 await nav.getByRole('button',{name:'Sign out',exact:true}).click();
 await expect(nav.getByRole('link',{name:'Sign in',exact:true})).toBeVisible({timeout:10000});
 check('Sign out returns header to anonymous state');
 await nav.getByRole('link',{name:'Sign in',exact:true}).click();
 await page.locator('#email').fill(email);
 await page.locator('#password').fill(password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page).toHaveURL(base+'/rumpelstiltskin-dance-video',{timeout:20000});
 await expect(nav.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
 check('Real sign-in restores session and original tool destination');
 await page.goto(base+'/signin?returnTo=%2Frumpelstiltskin-ai-video-generator');
 await expect(page).toHaveURL(base+'/rumpelstiltskin-ai-video-generator');
 check('Already signed-in auth redirect honors safe returnTo');
 // Delete only the account created by this script, through Better Auth's supported API.
 const sessionResponse=await context.request.get(base+'/api/auth/get-session');
 const sessionData=await sessionResponse.json();
 assert.equal(sessionData.user.email,email,'Cleanup is restricted to this run’s test account');
 const cleanup=await context.request.post(base+'/api/auth/delete-user',{headers:{Origin:base},data:{password}});
 report.cleanupStatus=cleanup.status();
 if(!cleanup.ok())throw new Error('Test account cleanup failed: '+cleanup.status());
 await page.goto(base+'/signin?returnTo=https%3A%2F%2Fexample.com');
 const signupHref=await page.getByRole('link',{name:'Sign up',exact:true}).getAttribute('href');
 assert.equal(new URL(signupHref,base).searchParams.get('returnTo'),'/');
 check('External returnTo is normalized to home');
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/signup'); await shot('signup-mobile-after');
 assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth>window.innerWidth),false);
 check('Mobile registration is readable without horizontal overflow');
 assert.deepEqual(report.errors,[]);
 assert.deepEqual(report.outbound,[]);
 check('No browser exceptions or external OAuth/email/SMS requests');
 report.passed=true;
} catch(error) {report.passed=false;report.failure=String(error);await shot('failure');process.exitCode=1;}
finally {await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
