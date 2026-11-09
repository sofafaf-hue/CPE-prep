/* Vocabulary review, Writing workshop, Speaking studio. */
window.copyText=(t,msg)=>{const ok=()=>mascotSay(msg||'Copied ✓','happy',4500);
 const fb=()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){prompt('Copy this text:',t)}a.remove()};
 navigator.clipboard?navigator.clipboard.writeText(t).then(ok).catch(fb):fb()};
(()=>{
/* ---- Vocabulary review (spaced repetition) ---- */
const DAY=864e5,INT=[0,1,3,7,16,35];
function renderReview(){const due=words.filter(w=>(w.due||0)<=Date.now()),box=$('#vCard');$('#vDue').textContent=due.length+' DUE';
 if(!words.length){box.innerHTML='<p class="muted">Save some expressions above, then come back to review them.</p>';return}
 if(!due.length){box.innerHTML='<p class="muted">Nothing to review right now — well done! ✦</p>';return}
 const q=[...due].sort(()=>Math.random()-.5);let i=0;
 const next=()=>{if(i>=q.length){box.innerHTML='<p>Review complete ✦</p>';mascotSay('Review done — your memory thanks you!','happy');bump('review');return}
  const w=q[i],head=`<p style="font-size:20px"><b>${escapeHtml(w.word)}</b></p>`;box.innerHTML=head+'<button class="btn" id="vShow">Show meaning</button>';
  $('#vShow').onclick=()=>{box.innerHTML=head+`<p class="muted">${escapeHtml(w.meaning)}</p><div class="actions"><button class="btn" data-r="0">Again</button><button class="btn" data-r="1">Got it</button></div>`;
   $$('[data-r]').forEach(b=>b.onclick=()=>{const ok=b.dataset.r==='1';w.box=ok?Math.min(5,(w.box||0)+1):0;w.due=Date.now()+(ok?INT[w.box]*DAY:6e5);store.set('words',words);i++;next()})}};
 next()}
const pv=onShow.vocabulary;onShow.vocabulary=()=>{pv&&pv();renderReview()};
/* ---- Writing ---- */
const WP={essay:['Some people believe that remote work will make cities less important as centres of culture and innovation. Write an essay discussing the effects on (a) local communities and (b) creativity and collaboration. Decide which is more significant and explain why.','Public libraries are increasingly being replaced by digital services. Write an essay evaluating two of: (a) access to knowledge, (b) community life, (c) cost. Say which is most important.'],
article:['You have been asked to write an article for an international magazine on how learning another language changes the way people think. Describe a personal example and assess the benefits and drawbacks.','Write an article for a travel website called “The places that surprised me”, describing a destination that did not meet your expectations and what you learnt from it.'],
letter:['Write a formal letter to the director of a local museum proposing a series of evening events for young adults. Explain your idea, suggest practical details and say why it would benefit the museum.','Write a letter to a former teacher asking for a reference for a postgraduate course. Explain what you have done since leaving school and why the course matters to you.'],
report:['Your college wants to improve its study spaces. Write a report for the principal assessing the current facilities, identifying two problems and recommending improvements.','Write a report for a city council on the effects of a recently introduced cycle-lane scheme, including positive and negative impacts and a recommendation.'],
review:['Write a review of a book, film or series that deals with an important social issue. Describe it briefly, evaluate how effectively it handles the topic and say who would enjoy it.','Write a review of a café or restaurant that has recently changed its concept. Compare it with the previous version and recommend whether readers should visit.']};
const WL={essay:'Part 1 · Essay',article:'Part 2 · Article',letter:'Part 2 · Letter',report:'Part 2 · Report',review:'Part 2 · Review'};
const CR=['Content','Communicative Achievement','Organisation','Language'];
let wTask='',secs=0,tm=null;const drafts=()=>store.get('drafts',[]);window.drafts=drafts;
$('#wType').innerHTML=Object.keys(WP).map(k=>`<option value="${k}">${WL[k]}</option>`).join('');
$('#wCrit').innerHTML=CR.map((c,i)=>`<label>${c} <input type="range" id="c${i}" min="0" max="5" value="0"> <b id="c${i}v">0</b>/5</label>`).join('');
CR.forEach((c,i)=>$('#c'+i).oninput=e=>$('#c'+i+'v').textContent=e.target.value);
const newTask=()=>{const a=WP[$('#wType').value];$('#wTask').textContent=wTask=a[Math.floor(Math.random()*a.length)]};
const count=()=>{const n=$('#writingNote').value.trim().split(/\s+/).filter(Boolean).length;$('#wCount').textContent=n;return n};
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
$('#wNew').onclick=newTask;$('#wType').onchange=newTask;newTask();
$('#writingNote').value=store.get('writing','');count();
$('#writingNote').oninput=()=>{store.set('writing',$('#writingNote').value);count()};
$('#wTime').onclick=()=>{if(tm){clearInterval(tm);tm=null;$('#wTime').textContent='Resume timer';return}$('#wTime').textContent='Pause timer';tm=setInterval(()=>{secs++;$('#wTimer').textContent=fmt(secs)},1000)};
function drawDrafts(){const d=drafts();$('#draftList').innerHTML=d.length?d.map((x,i)=>`<div class="wordrow"><div><b>${WL[x.type]||x.type} · ${x.words} words</b><small>${new Date(x.date).toLocaleDateString('en-GB')} · ${escapeHtml(x.text.slice(0,70))}…</small></div><div><button class="tab" data-l="${i}">Load</button> <button class="tab" data-x="${i}">Delete</button></div></div>`).join(''):'<p class="muted">No saved drafts yet.</p>';
 $$('[data-l]').forEach(b=>b.onclick=()=>{const x=drafts()[+b.dataset.l];$('#wType').value=x.type;$('#wTask').textContent=wTask=x.task;$('#writingNote').value=x.text;store.set('writing',x.text);count();window.scrollTo({top:0,behavior:'smooth'})});
 $$('[data-x]').forEach(b=>b.onclick=()=>{const d=drafts();if(confirm('Delete this draft?')){d.splice(+b.dataset.x,1);store.set('drafts',d);drawDrafts()}})}
$('#wSave').onclick=()=>{const text=$('#writingNote').value.trim();if(!text){alert('Write something first.');return}
 const d=drafts();d.unshift({type:$('#wType').value,task:wTask,text,words:count(),secs,scores:CR.map((c,i)=>+$('#c'+i).value),date:new Date().toISOString()});store.set('drafts',d.slice(0,60));drawDrafts();mascotSay('Draft saved! Every text makes you stronger ✍️','happy');bump('writing')};
$('#wAI').onclick=()=>{const text=$('#writingNote').value.trim();if(!text){alert('Write your text first.');return}
 copyText(`You are a Cambridge C2 Proficiency Writing examiner. Assess the ${WL[$('#wType').value]} below using the four Cambridge criteria (Content, Communicative Achievement, Organisation, Language). Give a band 0–5 for each with a short justification, estimate the overall level on the Cambridge English Scale, list the 5 most important language errors with corrections, and rewrite one weak paragraph at a stronger C2 level.\n\nTASK:\n${wTask}\n\nSTUDENT TEXT (${count()} words):\n${text}`,'Prompt copied ✓ — paste it into Claude for detailed feedback.')};
onShow.writing=drawDrafts;
/* ---- Speaking ---- */
const SP={1:['What made you decide to take on a challenge as demanding as C2?','How has the way you use English in daily life changed over the past few years?','Is there a place you associate strongly with feeling at home? Why?','What do you think people your age worry about most?'],
2:['Discuss how a town could encourage more people to read for pleasure. Then decide which two ideas would work best.','Talk about the ways schools can prepare students for jobs that do not exist yet, and decide which approach is most realistic.','Discuss what makes a public space welcoming. Then agree on the three most important features.'],
3:['Talk for two minutes: is it better to specialise early in a career or keep your options open? Consider flexibility, expertise and job satisfaction.','Talk for two minutes about the role of tradition in a rapidly changing society. Consider identity, progress and the younger generation.','Talk for two minutes about whether social media has made people better informed. Consider access, accuracy and attention.'],
4:['To what extent should governments regulate what companies do with personal data?','Do you think competition at school does more harm than good?','How far is it possible to separate a work of art from the person who created it?']};
const SL={1:'Part 1 · Interview (2 min)',2:'Part 2 · Collaborative task (4 min)',3:'Part 3 · Long turn (2 min)',4:'Part 4 · Discussion (4 min)'},ST={1:120,2:240,3:120,4:240};
let st=null,left=0;
$('#spPart').innerHTML=Object.keys(SL).map(k=>`<option value="${k}">${SL[k]}</option>`).join('');
const sp=()=>{const a=SP[$('#spPart').value];$('#spPrompt').textContent=a[Math.floor(Math.random()*a.length)];clearInterval(st);st=null;left=ST[$('#spPart').value];$('#spTimer').textContent=fmt(left)};
$('#spNew').onclick=sp;$('#spPart').onchange=sp;sp();
$('#spGo').onclick=()=>{if(st){clearInterval(st);st=null;$('#spGo').textContent='Start timer';return}$('#spGo').textContent='Pause';st=setInterval(()=>{left--;$('#spTimer').textContent=fmt(Math.max(left,0));if(left<=0){clearInterval(st);st=null;$('#spGo').textContent='Start timer';mascotSay('Time’s up! How did that feel?','hello')}},1000)};
let mr,ch=[];
$('#spRec').onclick=async()=>{if(mr&&mr.state==='recording'){mr.stop();return}
 try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mr=new MediaRecorder(s);ch=[];mr.ondataavailable=e=>ch.push(e.data);
  mr.onstop=()=>{s.getTracks().forEach(t=>t.stop());const a=$('#spAudio');a.src=URL.createObjectURL(new Blob(ch,{type:mr.mimeType}));a.classList.remove('hidden');$('#spRec').textContent='● Record';store.set('speakN',store.get('speakN',0)+1);bump('speak');mascotSay('Recorded! Listen back and notice one thing to improve.','happy')};
  mr.start();$('#spRec').textContent='■ Stop'}catch(e){alert('Allow microphone access in Safari to record yourself.')}};
$('#spAI').onclick=()=>copyText(`Act as a Cambridge C2 Proficiency Speaking examiner. I will answer this ${SL[$('#spPart').value]} prompt:\n"${$('#spPrompt').textContent}"\nAfter I paste my answer (transcript), assess it on Grammatical Resource, Lexical Resource, Discourse Management, Pronunciation and Interactive Communication (bands 0–5), correct my errors and show me a stronger model answer.`,'Prompt copied ✓ — paste it into Claude, then add your transcript.');
})();
