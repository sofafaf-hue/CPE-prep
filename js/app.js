const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem('getc2-'+k))??d}catch(e){return d}},set(k,v){localStorage.setItem('getc2-'+k,JSON.stringify(v))}};
let words=store.get('words',[]),stars=store.get('stars',0),tasks=store.get('tasks',0);

let mascotTimer;
function mascotSay(message,mood='hello',duration=5200){
 const avatar=$('#mascotAvatar'),bubble=$('#mascotBubble');
 $('#mascotMessage').textContent=message;
 bubble.classList.add('show');
 avatar.classList.remove('hello','happy','think');
 void avatar.offsetWidth;
 avatar.classList.add(mood);
 clearTimeout(mascotTimer);
 mascotTimer=setTimeout(()=>bubble.classList.remove('show'),duration);
}
$('#mascotAvatar').addEventListener('click',()=>mascotSay('You have got this! One focused step at a time. ✦','happy'));

const pages=['home','vocabulary','grammar','reading','listening','writing','speaking','practice','quest','library','progress','settings'];
function show(id){pages.forEach(p=>$('#'+p).classList.toggle('active',p===id));$$('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'});refresh();if(id==='home')mascotSay('Welcome back! Shall we make today count?','hello');else if(id==='practice')mascotSay('Take your time. Read each sentence carefully!','think');else if(id==='vocabulary')mascotSay('A lovely new expression is waiting to be learned.','hello');else if(id==='quest')mascotSay('Let’s collect some stars together!','happy');}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.open)));
$('#date').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()).toUpperCase();
function drawWords(){$('#wordCount').textContent=words.length+' ITEMS';$('#wordList').innerHTML=words.length?words.map((w,i)=>`<div class="wordrow"><div><b>${escapeHtml(w.word)}</b><small>${escapeHtml(w.meaning)}</small></div><button class="tab" data-del="${i}">Remove</button></div>`).join(''):'<p class="muted">Your word bank is empty. Add your first expression above.</p>';$$('[data-del]').forEach(b=>b.onclick=()=>{words.splice(+b.dataset.del,1);store.set('words',words);drawWords();refresh()})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#addWord').onclick=()=>{let word=$('#newWord').value.trim(),meaning=$('#newMeaning').value.trim();if(!word||!meaning){alert('Please enter both the expression and its meaning.');return}words.unshift({word,meaning});store.set('words',words);$('#newWord').value='';$('#newMeaning').value='';drawWords();refresh()};
function refresh(){$('#stars').textContent=stars;$('#questStars').textContent=stars;$('#tasksDone').textContent=tasks;$('#pStars').textContent=stars;$('#pTasks').textContent=tasks;$('#pWords').textContent=words.length}
drawWords();refresh();setTimeout(()=>mascotSay('Hello! I’ll be here for hints, feedback, and little celebrations.','hello',6500),650);
$('#audioFile').onchange=e=>{let f=e.target.files[0];if(f){let a=$('#audioPlayer');a.src=URL.createObjectURL(f);a.classList.remove('hidden');$('#audioName').textContent=f.name}};
$('#saveWriting').onclick=()=>{store.set('writing',$('#writingNote').value);$('#writingSaved').textContent=' Saved on this device ✓'};
$('#writingNote').value=store.get('writing','');
const prompts=['Some people believe that formal education should focus less on academic knowledge and more on practical life skills. To what extent do you agree?','To what extent has technology made people more independent, rather than more reliant on others?','Is it ever justifiable to prioritise economic growth over environmental protection?'];
$('#newPrompt').onclick=()=>{$('#speaking .panel p').textContent=prompts[Math.floor(Math.random()*prompts.length)]};
$('#exportData').onclick=()=>{let data={exported:new Date().toISOString(),words,stars,tasks,writing:store.get('writing',''),history,done};let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='get-that-c2-backup.json';a.click();URL.revokeObjectURL(a.href)};

/* ---- Exercise engine hookup ---- */
const history=store.get('history',[]),done=store.get('done',{});
function drawExList(cur){$('#exList').innerHTML=EXERCISES.map((e,i)=>`<button class="tab ${i===cur?'active':''}" data-ex="${i}">${escapeHtml(e.title)}${done[e.id]?' ✓':''}</button>`).join('');$$('[data-ex]').forEach(b=>b.onclick=()=>openEx(+b.dataset.ex))}
function openEx(i){drawExList(i);Engine.mount($('#exPanel'),EXERCISES[i],r=>{
 history.unshift({id:r.id,title:r.title,type:r.type,date:new Date().toISOString(),score:r.score,total:r.total,wrong:r.wrong});history.length=Math.min(history.length,300);store.set('history',history);
 if(r.perfect&&!done[r.id]){done[r.id]=1;stars+=10;tasks++;store.set('done',done);store.set('stars',stars);store.set('tasks',tasks);drawExList(i);mascotSay('Flawless! +10 stars for you. I’m so proud! ✨','happy',7000)}
 else if(r.perfect)mascotSay('Perfect again — lovely and consistent!','happy',6000);
 else mascotSay(`${r.score}/${r.total}. Read the notes under each mistake, then try again!`,'think',7000);
 refresh()})}
openEx(0);
