/* Get that C2 — exercise engine. Knows nothing about design or storage. */
const Engine=(()=>{
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABEL={multiple_choice:'Multiple choice',multiple_choice_cloze:'Multiple-choice cloze',open_cloze:'Open cloze',word_formation:'Word formation',key_word_transformation:'Key word transformation',gap_fill:'Gap fill'};
const TEXT=new Set(['open_cloze','word_formation','key_word_transformation','gap_fill','sentence_completion']);const isChoice=t=>!TEXT.has(t);
const norm=s=>String(s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/[.,;:!?"“”]/g,'').replace(/-/g,' ').replace(/\bcan ?not\b|\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/n't\b/g,' not').replace(/\s+/g,' ').trim();
function prep(ex){if(!ex.letters)return ex;const L=ex.letters.split('');return Object.assign({},ex,{items:ex.items.map(it=>Object.assign({},it,{options:L,correct:L.indexOf(it.answer)}))})}
function check(type,item,val){
 if(val===''||val==null)return false;
 if(isChoice(type))return +val===item.correct;
 return item.accepted.some(a=>norm(a)===norm(val));}
function shown(type,item){return isChoice(type)?item.options[item.correct]:item.accepted[0]}
function field(type,i){return `<input class="gap ${type==='key_word_transformation'?'wide':''}" data-i="${i}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="answer ${i+1}">`}
function itemHtml(type,it,i){
 let body;
 if(isChoice(type))body=`<p><b>${i+1}.</b> ${esc(it.prompt||'')}</p><div class="answers">${it.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o===String.fromCharCode(65+j)?o:String.fromCharCode(65+j)+'. '+esc(o)}</label>`).join('')}</div>`;
 else{
  const pr=esc(it.prompt||''),p=pr.includes('___')?pr.replace('___',field(type,i)):pr+' '+field(type,i);
  const kw=it.keyword?` <span class="kw">${esc(it.keyword)}</span>`:'';
  body=type==='key_word_transformation'?`<p><b>${i+1}.</b> ${esc(it.source||'')}${kw}</p><p>${p}</p>`:`<p><b>${i+1}.</b> ${p}${kw}</p>`;}
 return `<div class="question" data-q="${i}">${body}<div class="fb-slot"></div></div>`;}
function mount(el,ex0,onFinish){
 const ex=prep(ex0);
 const meta=[ex.book,ex.unit!=null&&'Unit '+ex.unit,ex.part!=null&&'Part '+ex.part,ex.page&&'p. '+ex.page,ex.label||LABEL[ex.type]||ex.type].filter(Boolean).join(' · ');
 el.innerHTML=`<div class="exmeta">${esc(meta)}</div><h2>${esc(ex.title)}</h2><p class="muted">${esc(ex.instructions||'')}</p>${ex.audio?`<div class="notice" style="margin:8px 0">♫ Track ${ex.track||''}<audio controls preload="none" src="${esc(ex.audio)}" style="width:100%;margin-top:6px"></audio></div>`:ex.listening?`<div class="notice" style="margin:8px 0">♫ Pick the audio track for this task from your device:<input type="file" accept="audio/*" class="field" data-audiopick><audio controls class="hidden" style="width:100%"></audio></div>`:''}${ex.items.map((it,i)=>itemHtml(ex.type,it,i)).join('')}<div class="actions"><button class="btn" data-act="check">Check answers</button><button class="btn hidden" data-act="retry">Try again ↻</button></div><div class="result" aria-live="polite"></div>`;
 const get=i=>{const q=el.querySelector(`[data-q="${i}"]`);if(isChoice(ex.type)){const c=q.querySelector('input:checked');return c?c.value:''}return q.querySelector('input.gap').value};
 el.querySelector('[data-act=retry]').onclick=()=>mount(el,ex0,onFinish);
 const ap=el.querySelector('[data-audiopick]');if(ap)ap.onchange=()=>{const f=ap.files[0];if(f){const a=ap.nextElementSibling;a.src=URL.createObjectURL(f);a.classList.remove('hidden')}};
 el.querySelector('[data-act=check]').onclick=()=>{
  let score=0;const wrong=[];
  ex.items.forEach((it,i)=>{
   const val=get(i),ok=check(ex.type,it,val),q=el.querySelector(`[data-q="${i}"]`);
   if(ok)score++;else wrong.push(i);
   q.querySelectorAll('input').forEach(x=>x.disabled=true);
   if(isChoice(ex.type))q.querySelectorAll('label').forEach((l,j)=>{if(j===it.correct)l.classList.add('right');else if(String(j)===val)l.classList.add('wrongpick')});
   const alt=!isChoice(ex.type)&&it.accepted.length>1?`<br>Also accepted: ${it.accepted.slice(1).map(esc).join(' / ')}`:'';
   q.querySelector('.fb-slot').innerHTML=`<div class="fb ${ok?'ok':'bad'}">${ok?'✓ Correct':'✗ Correct answer: <b>'+esc(shown(ex.type,it))+'</b>'}${alt}${it.explanation?'<br>'+esc(it.explanation):''}</div>`;});
  el.querySelector('.result').textContent=`You got ${score}/${ex.items.length} correct.`;
  el.querySelector('[data-act=check]').classList.add('hidden');el.querySelector('[data-act=retry]').classList.remove('hidden');
  onFinish&&onFinish({id:ex.id,title:ex.title,type:ex.type,score,total:ex.items.length,wrong,perfect:score===ex.items.length});};}
return{mount,check,norm};})();
if(typeof module!=='undefined')module.exports=Engine;
