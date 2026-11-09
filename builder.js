/* Create Exercise: write exercises in simple text lines, import JSON made by Claude, manage your own. */
(()=>{
const T={multiple_choice:['Multiple choice','Question with ___ | option A | option B | option C | option D | B | explanation (optional)'],
open_cloze:['Open cloze','Not ___ did she apologise, but she paid. | only | Negative adverbial → inversion.'],
gap_fill:['Gap fill','He is allergic ___ nuts. | to | Allergic + to.'],
word_formation:['Word formation','Her ___ to detail impressed us. | ATTEND | attention | Verb → noun.'],
key_word_transformation:['Key word transformation','I regret not taking his advice. | WISH | I ___ his advice. | wish I had taken / wish I’d taken | Wish + past perfect.']};
const SKL={grammar:'Grammar Lab',vocabulary:'Vocabulary',reading:'Reading',useofenglish:'Use of English',listening:'Listening'};
const fill=(id,o)=>$(id).innerHTML=o;
fill('#bType',Object.entries(T).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join(''));
fill('#bSkill',Object.entries(SKL).map(([k,v])=>`<option value="${k}">${v}</option>`).join(''));
fill('#bUnit','<option value="mine">My exercises</option>'+Array.from({length:12},(_,i)=>`<option value="${i+1}">Unit ${i+1}</option>`).join(''));
const help=()=>{const t=$('#bType').value;$('#bHelp').innerHTML=`One question per line, parts separated by <b>|</b>. Several correct answers: separate them with <b>/</b>.<br><br><code>${escapeHtml(T[t][1])}</code>`};
$('#bType').onchange=help;help();
const alts=s=>(s||'').split('/').map(x=>x.trim()).filter(Boolean);
function parse(type,text){const items=[],errs=[];
 text.split('\n').map(l=>l.trim()).filter(Boolean).forEach((line,n)=>{const p=line.split('|').map(s=>s.trim()),bad=m=>errs.push(`Line ${n+1}: ${m}`);
  if(type==='multiple_choice'){let k=-1;for(let j=3;j<p.length;j++)if(/^[A-Fa-f]$/.test(p[j])&&p[j].toUpperCase().charCodeAt(0)-65<j-1){k=j;break}
   if(k<0)return bad('need: question | options… | correct letter (A, B…)');items.push({prompt:p[0],options:p.slice(1,k),correct:p[k].toUpperCase().charCodeAt(0)-65,explanation:p[k+1]||''})}
  else if(type==='word_formation'){if(p.length<3||!p[0].includes('___'))return bad('need: sentence with ___ | KEYWORD | answer');items.push({prompt:p[0],keyword:p[1],accepted:alts(p[2]),explanation:p[3]||''})}
  else if(type==='key_word_transformation'){if(p.length<4||!p[2].includes('___'))return bad('need: sentence | KEYWORD | second sentence with ___ | answer');items.push({source:p[0],keyword:p[1],prompt:p[2],accepted:alts(p[3]),explanation:p[4]||''})}
  else{if(p.length<2||!p[0].includes('___'))return bad('need: sentence with ___ | answer');items.push({prompt:p[0],accepted:alts(p[1]),explanation:p[2]||''})}});
 return{items,errs}}
function addEx(x){custom.push(x);store.set('custom',custom);list()}
$('#bSave').onclick=()=>{const type=$('#bType').value,title=$('#bTitle').value.trim()||'My exercise',{items,errs}=parse(type,$('#bText').value);
 if(errs.length||!items.length){$('#bMsg').innerHTML='<div class="fb bad">'+(errs.join('<br>')||'Please add at least one line.')+'</div>';return}
 const unit=$('#bUnit').value,skill=$('#bSkill').value,id='my-'+Date.now();
 addEx({id,group:unit,skill,listening:skill==='listening'||undefined,book:'My exercise',unit:unit==='mine'?null:+unit,type,short:title.slice(0,26),title,instructions:type==='multiple_choice'?'Choose the best option.':'Complete the gaps.',items});
 $('#bMsg').innerHTML=`<div class="fb ok">Saved ✓ (${items.length} questions) — find it in ${SKL[skill]} → ${unit==='mine'?'My exercises':'Unit '+unit}.</div>`;$('#bText').value='';mascotSay('A new exercise! You are building your own course ✦','happy');bump('create')};
function list(){$('#bList').innerHTML=custom.length?custom.map((e,i)=>`<div class="wordrow"><div><b>${escapeHtml(e.title)}</b><small>${SKL[e.skill]||''} · ${gname(grp(e))} · ${e.items.length} questions</small></div><div><button class="tab" data-o="${e.id}">Open</button> <button class="tab" data-d="${i}">Delete</button></div></div>`).join(''):'<p class="muted">Nothing here yet.</p>';
 $$('[data-o]').forEach(b=>b.onclick=()=>{const e=custom.find(x=>x.id===b.dataset.o);store.set('pk-'+skillOf(e),{g:grp(e),id:e.id});show(e.skill==='vocabulary'?'vocabulary':e.skill)});
 $$('[data-d]').forEach(b=>b.onclick=()=>{if(confirm('Delete this exercise?')){custom.splice(+b.dataset.d,1);store.set('custom',custom);list()}})}
$('#bPrompt').onclick=()=>{const t=$('#bType').value,topic=$('#bTopic').value.trim()||'the language focus of Unit 1';
 copyText(`Create 1 original Cambridge C2 Proficiency exercise (${T[t][0]}, 6–8 questions) on: ${topic}. Return ONLY valid JSON (no markdown): a list with one object {"title":"…","skill":"grammar|vocabulary|reading|useofenglish","group":"unit number 1-12 or mine","type":"${t}","instructions":"…","items":[…]}. Item formats — multiple_choice: {"prompt":"… ___ …","options":["…","…","…","…"],"correct":0,"explanation":"…"}; open_cloze / gap_fill: {"prompt":"… ___ …","accepted":["answer","other valid answer"],"explanation":"…"}; word_formation: same plus "keyword":"BASE"; key_word_transformation: {"source":"…","keyword":"WORD","prompt":"second sentence with ___ gap (2–5 words)","accepted":["every valid answer"],"explanation":"…"}. Double-check every answer and list ALL acceptable variants. Use varied C2-level vocabulary and grammar.`,'Prompt copied ✓ — paste it into Claude, then paste the JSON answer below.')};
$('#bImp').onclick=()=>{try{let a=JSON.parse($('#bJson').value.replace(/```json|```/g,'').trim());if(!Array.isArray(a))a=[a];let n=0;
 a.forEach(x=>{if(!x||!x.type||!Array.isArray(x.items)||!x.items.length)throw Error('Each exercise needs "type" and "items".');
  x.items.forEach(it=>{if(typeof it.accepted==='string')it.accepted=[it.accepted];if(x.type.startsWith('multiple_choice')){if(!Array.isArray(it.options)||typeof it.correct!=='number')throw Error('Multiple-choice items need "options" and "correct" (0 = first option).')}else if(!Array.isArray(it.accepted)||!it.accepted.length)throw Error('Gap items need "accepted" answers.')});
  const g=/^\d+$/.test(x.group)?String(x.group):'mine',skill=SKL[x.skill]?x.skill:'grammar';
  custom.push(Object.assign({},x,{id:'imp-'+Date.now()+'-'+n++,group:g,skill,listening:skill==='listening'||undefined,unit:g==='mine'?null:+g,book:'My exercise',title:x.title||'Imported exercise',short:(x.short||x.title||'Exercise').slice(0,26)}))});
 store.set('custom',custom);list();$('#bJson').value='';$('#bMsg').innerHTML=`<div class="fb ok">Imported ${n} exercise(s) ✓</div>`}catch(e){$('#bMsg').innerHTML=`<div class="fb bad">Could not import: ${escapeHtml(e.message)}</div>`}};
onShow.builder=list;
})();
