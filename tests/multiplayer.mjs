import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:5173';
const tokens=Array.from({length:9},()=>crypto.randomUUID());
async function post(i,b,ok=true){const res=await fetch(base+'/api/room',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tokens[i]},body:JSON.stringify(b)});const data=await res.json();if(ok)assert.equal(res.status,200,JSON.stringify(data));else assert.notEqual(res.status,200);return data;}
async function get(i,code){const res=await fetch(base+'/api/room?code='+code,{headers:{Authorization:'Bearer '+tokens[i]}});assert.equal(res.status,200);return res.json();}
let r=await post(0,{op:'create',name:'Host'});const code=r.code;
await post(0,{op:'start',code},false);
await Promise.all([1,2,3,4,5,6,7].map(i=>post(i,{op:'join',code,name:'Crew'+i})));
r=await get(0,code);assert.equal(r.players.length,8);
await post(8,{op:'join',code,name:'Extra'},false);
await post(1,{op:'start',code},false);
r=await post(0,{op:'start',code});assert.equal(r.budget,48);assert.equal(r.required,5);
await post(1,{op:'pause',code},false);
r=await post(0,{op:'pause',code});assert.equal(r.paused,true);
await post(1,{op:'action',code,round:1,game:r.game,action:'signal'},false);
r=await post(0,{op:'pause',code});assert.equal(r.paused,false);
await Promise.all(tokens.slice(0,8).map((_,i)=>post(i,{op:'action',code,round:1,game:r.game,action:'signal'})));
r=await get(0,code);assert.equal(r.round,2);assert.equal(r.budget,40);assert.ok(r.players.every(p=>p.echoes.length===1));
await post(0,{op:'action',code,round:1,game:r.game,action:'signal'},false);
await post(0,{op:'action',code,round:2,game:r.game,action:'west'});
const teammate=await get(1,code);assert.equal(teammate.players[0].ready,true);assert.equal(teammate.me.action,null);assert.ok(!JSON.stringify(teammate).includes('west'));
const reconnect=await post(0,{op:'join',code,name:'Host'});assert.equal(reconnect.me.id,r.me.id);assert.equal(reconnect.players.length,8);
await post(0,{op:'action',code,round:2,game:r.game,action:'west'},false);
for(const key of ['"x":','"y":','"token":','"source":','"hazards":'])assert.ok(!JSON.stringify(r).includes(key));
console.log('PASS: 8 concurrent players, capacity, host permissions, pause, synchronized resolution, shared cost, private choices, stale/duplicate actions, reconnect, hidden map. Room '+code);
