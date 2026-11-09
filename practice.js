/* Exercise browser: shows exercises by section/unit, saves results, stars, mistakes. */
window.onShow=window.onShow||{};
const history=store.get('history',[]),done=store.get('done',{});
let custom=store.get('custom',[]);
const ALL=()=>EXERCISES.concat(custom);
const grp=e=>String(e.group||'demo');
const skillOf=e=>e.skill||(e.listening?'listening':(e.part>=5?'reading':'useofenglish'));
const rank=g=>g==='mine'?1:g==='mistakes'?2:g==='demo'?3:0;
const gname=g=>({demo:'Demo tasks',mine:'My exercises',mistakes:'Repeat my mistakes'}[g]||'Unit '+g);
const CFG=window.APP_CONFIG||{};
EXERCISES.forEach(e=>{if(e.track&&CFG.supabaseUrl)e.audio=`${CFG.supabaseUrl}/storage/v1/object/public/${CFG.audioBucket}/${encodeURIComponent(CFG.audioPattern.replace('{n}',e.track))}`});
function mistakes(){const seen=new Set(),by={},cl=store.get('cleared',[]);
 history.forEach(h=>{const ex=ALL().find(e=>e.id===h.id);if(!ex||!h.wrong)return;const px=Engine.prep(ex);
  h.wrong.forEach(i=>{const k=h.id+':'+i,it=px.items[i];if(!it||seen.has(k)||cl.includes(k))return;seen.add(k);(by[ex.type]=by[ex.type]||[]).push(Object.assign({},it,{_k:k,prompt:it.prompt||`${ex.short||ex.title} · Q${i+1}`}))})});
 return Object.entries(by).map(([t,items])=>({id:'mistakes-'+t,group:'mistakes',type:t,short:t.replace(/_/g,' '),title:'Mistakes · '+t.replace(/_/g,' '),instructions:'Questions you got wrong before — answer them again!',items:items.slice(0,15)}))}
function finish(r,ex){
 if(ex.group==='mistakes'){const c=store.get('cleared',[]);ex.items.forEach((it,i)=>{if(!r.wrong.includes(i)&&it._k)c.push(it._k)});store.set('cleared',c);mascotSay(r.perfect?'All fixed! Those mistakes are history ✦':'Some are still tricky — try again later!',r.perfect?'happy':'think',6000);bump('ex');return}
 history.unshift({id:r.id,title:r.title,type:r.type,skill:skillOf(ex),unit:ex.unit||null,date:new Date().toISOString(),score:r.score,total:r.total,wrong:r.wrong});history.length=Math.min(history.length,400);store.set('history',history);
 const prev=+done[r.id]||0,now=Math.round(10*r.score/r.total),earn=Math.max(0,now-prev);
 if(earn>0){if(!prev)tasks++;done[r.id]=now;stars+=earn;store.set('done',done);store.set('stars',stars);store.set('tasks',tasks)}
 if(r.perfect)mascotSay(earn?`Flawless! +${earn} stars for you. I’m so proud! ✨`:'Perfect again — lovely and consistent!','happy',7000);
 else mascotSay(`${r.score}/${r.total}${earn?` · +${earn} ✦`:''}. Check the answers marked ✗, then try again!`,'think',7000);
 bump('ex')}
function mountPicker(root,skill){
 if(!root)return;const key='pk-'+(skill||'all'),st=store.get(key,{});
 const arr=ALL().filter(e=>!skill||skillOf(e)===skill).concat(skill?[]:mistakes());
 if(!arr.length){root.innerHTML='<div class="panel"><p class="muted">No tasks in this section yet. You can create your own — or ask me to prepare a set from your Workbook units.</p><button class="btn" data-go>Create an exercise ↗</button></div>';root.querySelector('[data-go]').onclick=()=>show('builder');return}
 const gs=[...new Set(arr.map(grp))].sort((a,b)=>rank(a)-rank(b)||(+a)-(+b));if(!gs.includes(st.g))st.g=gs[0];
 root.innerHTML='<select class="field" aria-label="Choose unit" style="width:auto;min-width:220px;margin:0 0 4px"></select><div class="tabs"></div><div class="panel"></div>';
 const sel=root.querySelector('select'),tabs=root.querySelector('.tabs'),panel=root.querySelector('.panel');
 const inG=()=>arr.filter(e=>grp(e)===st.g);
 const drawTabs=()=>{tabs.innerHTML=inG().map(e=>`<button class="tab ${e.id===st.id?'active':''}" data-id="${e.id}">${escapeHtml(e.short||e.title)}${done[e.id]>=8?' ✓':''}</button>`).join('');tabs.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{st.id=b.dataset.id;open()})};
 const open=()=>{const ex=inG().find(e=>e.id===st.id)||inG()[0];st.id=ex.id;store.set(key,st);drawTabs();Engine.mount(panel,ex,r=>{finish(r,ex);drawTabs()})};
 sel.innerHTML=gs.map(g=>`<option value="${g}" ${g===st.g?'selected':''}>${gname(g)}</option>`).join('');
 sel.onchange=()=>{st.g=sel.value;st.id=null;open()};open()}
function openExercise(id){const e=ALL().find(x=>x.id===id);if(!e)return;store.set('pk-all',{g:grp(e),id});show('practice')}
const SK=['grammar','vocabulary','reading','listening','useofenglish'];
SK.forEach(s=>{const prev=onShow[s];onShow[s]=()=>{mountPicker($(`[data-skill=${s}]`),s);prev&&prev()}});
onShow.practice=()=>mountPicker($('#practiceBox'),null);
