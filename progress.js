/* Daily quest, level, achievements, progress, library, settings, dashboard. */
(()=>{
const LBL=t=>t.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());
const today=()=>new Date().toISOString().slice(0,10);
const streak=()=>store.get('streak',{last:'',n:0});
const daily=()=>{let d=store.get('daily',{});if(d.date!==today())d={date:today()};return d};
const T3=[['writing','Save a Writing draft'],['speak','Record a Speaking answer'],['review','Review your word bank']];
const dq=()=>{const x=T3[new Date().getDay()%3];return[['ex',2,'Complete 2 exercises'],['words',3,'Save 3 new expressions'],[x[0],1,x[1]]]};
const ACH=[['first','First steps','Complete your first exercise',()=>history.length>=1],['ten','Dedicated','Complete 10 exercises',()=>history.length>=10],['perfect','Flawless','Score 100% in an exercise',()=>history.some(h=>h.score===h.total)],['words','Wordsmith','Save 10 expressions',()=>words.length>=10],['s3','On a roll','3-day streak',()=>streak().n>=3],['s7','Committed','7-day streak',()=>streak().n>=7],['writer','Writer','Save a Writing draft',()=>drafts().length>=1],['speaker','Speaker','Record a Speaking answer',()=>store.get('speakN',0)>=1],['maker','Creator','Create your own exercise',()=>custom.length>=1],['st100','Star collector','Collect 100 stars',()=>stars>=100]];
function checkAch(){const a=store.get('ach',{});ACH.forEach(([id,n,,f])=>{if(!a[id]&&f()){a[id]=1;store.set('ach',a);mascotSay(`Achievement unlocked: ${n} ★`,'happy',7000)}})}
window.bump=k=>{const d=daily();d[k]=(d[k]||0)+1;store.set('daily',d);const s=streak(),t=today();
 if(s.last!==t){const y=new Date(Date.now()-864e5).toISOString().slice(0,10);s.n=s.last===y?s.n+1:1;s.last=t;store.set('streak',s)}
 if(dq().every(([k2,n])=>(d[k2]||0)>=n)&&store.get('dqPaid','')!==t){store.set('dqPaid',t);stars+=15;store.set('stars',stars);mascotSay('Daily Quest complete! +15 stars ✨','happy',7000)}
 checkAch();refresh()};
const LV=[['Beginner',0],['Explorer',50],['Challenger',150],['Advanced',300],['Proficient',500],['C2 Master',800]];
const level=()=>{let i=0;LV.forEach((l,j)=>{if(stars>=l[1])i=j});return{i,name:LV[i][0],from:LV[i][1],to:LV[i+1]?LV[i+1][1]:null}};
window.onRefresh=()=>{const q=$('#homeQuest');if(!q)return;const d=daily(),L=level();q.textContent=dq().map(([k,n,t])=>`${(d[k]||0)>=n?'✓':'○'} ${t}`).join('  ·  ');$('#homeProg').textContent=`Level ${L.i+1} · ${L.name} · ${streak().n}-day streak`};
onShow.quest=()=>{const L=level(),d=daily(),a=store.get('ach',{});$('#questStars').textContent=stars;$('#qLevel').textContent=`Level ${L.i+1} · ${L.name}`;
 $('#qBar').style.width=(L.to?Math.min(100,(stars-L.from)/(L.to-L.from)*100):100)+'%';$('#qNext').textContent=L.to?`${L.to-stars} stars to the next level`:'Top level reached ✦';$('#qStreak').textContent=streak().n;
 $('#qDaily').innerHTML=dq().map(([k,n,t])=>{const v=Math.min(d[k]||0,n);return`<div class="wordrow"><span>${v>=n?'✓':'○'} ${t}</span><b>${v}/${n}</b></div>`}).join('');
 $('#qAch').innerHTML=ACH.map(([id,n,t])=>`<div class="ach ${a[id]?'on':''}"><b>${a[id]?'★':'☆'} ${n}</b><small>${t}</small></div>`).join('')};
onShow.progress=()=>{$('#pStars').textContent=stars;$('#pTasks').textContent=history.length;$('#pWords').textContent=words.length;
 const by={};history.forEach(h=>{const b=by[h.type]=by[h.type]||{s:0,t:0,n:0};b.s+=h.score;b.t+=h.total;b.n++});
 const rows=Object.entries(by).map(([t,b])=>[t,Math.round(100*b.s/b.t),b.n]).sort((a,b)=>a[1]-b[1]);
 $('#pTypes').innerHTML=rows.length?rows.map(([t,p,n])=>`<div class="bar-row"><span>${LBL(t)} <small>(${n})</small></span><div class="bar"><i style="width:${p}%"></i></div><b>${p}%</b></div>`).join(''):'<p class="muted">Complete exercises to see your accuracy by type.</p>';
 const weak=rows.length?rows.slice(0,3).map(r=>r[0]):['open_cloze','word_formation','key_word_transformation'];
 $('#pWeak').innerHTML=weak.map(t=>{const e=ALL().find(x=>x.type===t&&x.group!=='demo');return e?`<button class="tab" data-op="${e.id}">${LBL(t)} ↗</button>`:''}).join('');
 $$('[data-op]').forEach(b=>b.onclick=()=>openExercise(b.dataset.op));
 $('#pHist').innerHTML=history.slice(0,12).map(h=>`<div class="wordrow"><div><b>${escapeHtml(h.title)}</b><small>${new Date(h.date).toLocaleDateString('en-GB')}</small></div><b>${h.score}/${h.total}</b></div>`).join('')||'<p class="muted">No results yet.</p>';
 const m=mistakes().reduce((n,e)=>n+e.items.length,0);$('#pMist').textContent=m?`Repeat ${m} mistakes ↗`:'No mistakes to repeat 🎉';$('#pMist').onclick=()=>{if(m){store.set('pk-all',{g:'mistakes'});show('practice')}}};
onShow.library=()=>{const chip=e=>`<button class="tab" data-op="${e.id}">${escapeHtml(e.short||e.title)}${e.page?' · p.'+e.page:''}${e.track?' ♫':''}</button>`;
 $('#libUnits').innerHTML=Array.from({length:12},(_,i)=>i+1).map(u=>`<div class="unit"><b>Unit ${u}</b><div class="tabs">${ALL().filter(e=>grp(e)===''+u).map(chip).join('')||'<small class="muted">—</small>'}</div></div>`).join('');
 $$('#libUnits [data-op]').forEach(b=>b.onclick=()=>{const e=ALL().find(x=>x.id===b.dataset.op);store.set('pk-'+skillOf(e),{g:grp(e),id:e.id});openExercise(e.id)})};
$('#libPdf').onchange=e=>{const f=e.target.files[0];if(f)window.open(URL.createObjectURL(f),'_blank')};
/* ---- Settings ---- */
const ACC={smoky:['#8c9dad','#71899d'],sage:['#98aa98','#76907a'],clay:['#b39a8a','#977c6b']},DEF={accent:'smoky',size:'1',mascot:true,side:'right',anim:true};
const S=()=>Object.assign({},DEF,store.get('settings',{}));
function apply(){const s=S(),r=document.documentElement,[a,b]=ACC[s.accent]||ACC.smoky;r.style.setProperty('--blue',a);r.style.setProperty('--blue2',b);document.body.style.zoom=s.size;document.body.classList.toggle('no-anim',!s.anim);const d=$('.mascot-dock');d.style.display=s.mascot?'':'none';d.classList.toggle('left',s.side==='left')}
function saveS(){store.set('settings',{accent:$('#sAccent').value,size:$('#sSize').value,mascot:$('#sMascot').checked,side:$('#sSide').value,anim:$('#sAnim').checked});apply()}
onShow.settings=()=>{const s=S();$('#sAccent').value=s.accent;$('#sSize').value=s.size;$('#sMascot').checked=s.mascot;$('#sSide').value=s.side;$('#sAnim').checked=s.anim};
['sAccent','sSize','sMascot','sSide','sAnim'].forEach(id=>$('#'+id).onchange=saveS);
$('#sExport').onclick=()=>{const o={app:'get-that-c2',exported:new Date().toISOString()};Object.keys(localStorage).filter(k=>k.startsWith('getc2-')).forEach(k=>o[k]=localStorage.getItem(k));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='get-that-c2-backup.json';a.click()};
$('#sImport').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(o.app!=='get-that-c2')throw 0;if(!confirm('Replace the data on this device with the backup?'))return;Object.keys(o).filter(k=>k.startsWith('getc2-')).forEach(k=>localStorage.setItem(k,o[k]));location.reload()}catch(x){alert('This is not a Get that C2 backup file.')}};r.readAsText(f)};
$('#sReset').onclick=()=>{if(confirm('Delete ALL progress on this device? Export a backup first!')&&confirm('Really delete everything?')){Object.keys(localStorage).filter(k=>k.startsWith('getc2-')).forEach(k=>localStorage.removeItem(k));location.reload()}};
apply();refresh();
})();
