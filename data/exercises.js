/* Exercise data. Each task carries its metadata, answers (all accepted variants) and explanations.
   Later, Ready for C2 tasks are added here (or in separate files) in exactly this format. */
const EXERCISES=[
{id:'demo-mcc-1',book:'Original demo',type:'multiple_choice_cloze',title:'Multiple-choice cloze',instructions:'Choose the best option for each sentence.',items:[
 {prompt:'The new policy is intended to ___ a more inclusive working environment.',options:['make','bring','create','do'],correct:2,explanation:'“Create an environment” is the natural collocation.'},
 {prompt:'Little ___ that the decision would have such far-reaching consequences.',options:['we knew','did we know','we had known','had we knew'],correct:1,explanation:'Negative adverbial “little” at the start triggers inversion.'},
 {prompt:'The findings should be treated with ___ until further research is available.',options:['caution','cautious','cautiously','cautioned'],correct:0,explanation:'“With” needs a noun: with caution.'}]},
{id:'demo-oc-1',book:'Original demo',type:'open_cloze',title:'Open cloze',instructions:'Write ONE word in each gap.',items:[
 {prompt:'Not ___ did she apologise, but she also offered to pay for the damage.',accepted:['only'],explanation:'“Not only” at the start of a clause requires inversion: did she apologise.'},
 {prompt:'The committee was sharply divided ___ the question of funding.',accepted:['on','over'],explanation:'Divided on / over a question.'},
 {prompt:'___ it not been for your help, I would have missed the deadline.',accepted:['had'],explanation:'Inverted third conditional: Had it not been for…'}]},
{id:'demo-wf-1',book:'Original demo',type:'word_formation',title:'Word formation',instructions:'Change the word in capitals so that it fits the gap.',items:[
 {prompt:'Her ___ to detail impressed the examiners.',keyword:'ATTEND',accepted:['attention'],explanation:'Verb → noun: attend → attention (to detail).'},
 {prompt:'The firm was accused of ___ in its hiring practices.',keyword:'DISCRIMINATE',accepted:['discrimination'],explanation:'Noun needed after “of”: discriminate → discrimination.'}]},
{id:'demo-kwt-1',book:'Original demo',type:'key_word_transformation',title:'Key word transformations',instructions:'Complete the second sentence using the key word. Use between two and five words, including the word given. Do not change the word.',items:[
 {source:'I regret not taking my teacher’s advice.',keyword:'WISH',prompt:'I ___ my teacher’s advice.',accepted:['wish I had taken','wish I’d taken'],explanation:'Regret about the past → wish + past perfect.'},
 {source:'People say that he is the best surgeon in the country.',keyword:'SAID',prompt:'He ___ the best surgeon in the country.',accepted:['is said to be'],explanation:'Passive reporting structure: is said to be.'}]}
];
