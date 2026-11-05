import fs from 'node:fs/promises';
const base='http://127.0.0.1:5185';
const id='a'.repeat(24);
const phase=process.argv[2]||'before';
const root=new URL('./',import.meta.url);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const pages=process.env.AUDIT_ROUTE ? process.env.AUDIT_ROUTE.split('|') : phase==='before' ? ['/account/warranty','/thanh-vien?act=login','/auth/warranties','/auth/settings/user','/cart','/contact'] : ['/', '/shop','/bai-viet','/cart','/checkout','/contact','/thanh-vien?act=login','/thanh-vien?act=register','/quen-mat-khau','/account/profile','/account/addresses','/account/warranty','/account/change-password','/chinh-sach-bao-hanh','/auth/login','/auth/products','/auth/categories','/auth/brands','/auth/orders','/auth/users','/auth/warranties','/auth/settings/user'];
const results=[];
for(const route of pages) {
 const admin=route.startsWith('/auth');
 for(const width of (phase==='before'?[1365]:[1365,390])) {
  const target=await (await fetch('http://127.0.0.1:9337/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
  let seq=0;const pending=new Map();
  const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++seq;const timer=setTimeout(()=>{pending.delete(n);reject(new Error(method+' timeout'))},20000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}))});
  const warranty={_id:id,orderCode:'ORD-AUDIT',productName:'Warranty product',variantName:'Blue',status:'reviewing',createdAt:'2026-11-05T01:00:00Z',handlerName:'Staff Demo',handlerId:id,customerName:'Customer Demo'};
  const user={id,name:'Demo User',firstName:'Demo',lastName:'User',email:'demo@example.com',personalEmail:'demo@example.com',phone:'0901234567',role:'super_admin',mustChangePassword:false,onboardingRequired:false,personalEmailVerified:true};
  if(!admin){delete user.role;user.accountType='customer';}
  ws.addEventListener('message',async event=>{const msg=JSON.parse(event.data);if(msg.id){const p=pending.get(msg.id);if(p){clearTimeout(p.timer);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result)}return;}
   if(process.env.AUDIT_DEBUG && msg.method==='Runtime.consoleAPICalled' && msg.params.type==='error') console.log('console',msg.params.args.map(a=>a.value||a.description)); if(process.env.AUDIT_DEBUG && msg.method==='Page.frameNavigated')console.log('navigated',msg.params.frame.url); if(process.env.AUDIT_DEBUG && msg.method==='Runtime.exceptionThrown') console.log('PAGE ERROR', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description); if(msg.method==='Fetch.requestPaused') {
    const r=msg.params; if(process.env.AUDIT_DEBUG) console.log(r.request.method,r.request.url); const url=new URL(r.request.url);let data=[];let response={success:true,data,pagination:{page:1,limit:10,total:0,totalPages:1},meta:{pages:1}};
    if(url.pathname.endsWith('/refresh'))response.data={accessToken:'local-ui-audit-token'};
    else if(url.pathname.endsWith('/me'))response.data=user;
    else if(/\/requests\/[a-f0-9]{24}$/.test(url.pathname)) response.data={...warranty,__v:0,description:'Sample warranty description',updatedAt:'2026-11-05T01:00:00Z',customerEmail:'customer@example.com',customerPhone:'0901234567',images:[],history:[{status:'reviewing',note:'Sample acceptance',actorName:'Store',createdAt:'2026-11-05T01:00:00Z'}]};
    else if(url.pathname.endsWith('/requests')){response.data=[warranty];response.pagination.total=1;}
    else if(url.pathname.includes('/statistics'))response.data={total:0,active:0,inactive:0,totalProducts:0,totalRevenue:0,byStatus:[],dailyRevenue:[]};
    else if(url.pathname.includes('/policy')||url.pathname.includes('/documents/'))response.data=null;
    try{await call('Fetch.fulfillRequest',{requestId:r.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:base},{name:'Access-Control-Allow-Credentials',value:'true'},{name:'Access-Control-Allow-Headers',value:'authorization,content-type,x-login-area,x-auth-transport'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PATCH,PUT,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify(response)).toString('base64')});}catch{}
   }
  });
  await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'*api/v1/*',requestStage:'Request'}]});
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  const loggedIn=route!=='/auth/login'&&!route.startsWith('/thanh-vien')&&route!=='/quen-mat-khau';
  await call('Page.addScriptToEvaluateOnNewDocument',{source:`if(!sessionStorage.getItem('audit-ready')) {sessionStorage.setItem('audit-ready','1');localStorage.clear();localStorage.setItem('vite-ui-theme','${process.env.AUDIT_THEME || 'dark'}');${loggedIn?`localStorage.setItem('${admin?'admin-auth':'customer-auth'}',JSON.stringify({state:{hasSession:true,sessionId:'ui-audit'},version:2}));`:''}}`});
  await call('Page.navigate',{url:base+route});await sleep(600); for(let wait=0;wait<60;wait++){const ready=await call('Runtime.evaluate',{expression:"!!document.querySelector('h1,h2,h3')",returnByValue:true});if(ready.result.value)break;await sleep(250);} await sleep(700);
  if(phase.startsWith('selected')){await call('Runtime.evaluate',{expression:"document.querySelector('button[aria-pressed=\"false\"]')?.click()"});await sleep(700);}
  const {result}=await call('Runtime.evaluate',{returnByValue:true,expression:`JSON.stringify({path:location.pathname,width:innerWidth,scroll:document.documentElement.scrollWidth,heading:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.textContent).slice(0,5),controls:[...document.querySelectorAll('main button,main input,main select')].slice(0,14).map(e=>({text:(e.textContent||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').trim().slice(0,45),bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,border:getComputedStyle(e).borderColor})),surface:getComputedStyle(document.querySelector('main')||document.body).backgroundColor})`});
  if(process.env.AUDIT_DEBUG)console.log((await call('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true})).result.value?.slice(0,500));const report=JSON.parse(result.value);report.route=route;results.push(report);
  if(['/account/warranty','/auth/warranties','/thanh-vien?act=login'].includes(route)){
   const shot=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(new URL(`${phase}-${admin?'admin':route.includes('warranty')?'account':'login'}-${width}.png`,root),Buffer.from(shot.data,'base64'));
  }
  console.log(route,width,'overflow',report.scroll>width,'heading',report.heading[0]);
  ws.close();await fetch('http://127.0.0.1:9337/json/close/'+target.id);await sleep(250);
 }
}
await fs.writeFile(new URL(phase+'.json',root),JSON.stringify(results,null,2));
