/* Library interactions: prompts, glossary terms, and portable skills. */
const btt=document.getElementById('back-to-top');
window.addEventListener('scroll',()=>btt.classList.toggle('visible',scrollY>500),{passive:true});

const copyStatus=document.createElement('p');
copyStatus.className='copy-status-message';copyStatus.setAttribute('role','status');copyStatus.setAttribute('aria-live','polite');document.body.append(copyStatus);
let statusTimer;
function announce(message){clearTimeout(statusTimer);copyStatus.textContent=message;statusTimer=setTimeout(()=>copyStatus.textContent='',5000);}
async function copyText(text,button,target){
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);
    else{
      const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();
      const copied=document.execCommand('copy');input.remove();if(!copied)throw new Error('Copy unavailable');
    }
    const label=button.textContent;button.textContent='Copied';button.classList.add('copied');announce('Copied to clipboard.');
    setTimeout(()=>{button.textContent=label;button.classList.remove('copied');},1800);
  }catch{
    if(target){target.classList.add('expanded');target.setAttribute('tabindex','-1');const range=document.createRange();range.selectNodeContents(target);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);target.focus();}
    announce('Copy is unavailable. Select the prompt text and copy it manually.');
  }
}
function copyPrompt(button){const prompt=button.closest('.pcard-body').querySelector('.pcard-prompt');return copyText(prompt.textContent.trim(),button,prompt);}
function toggleExpand(button){const prompt=button.closest('.pcard-body').querySelector('.pcard-prompt');const expanded=prompt.classList.toggle('expanded');button.textContent=expanded?'Collapse':'Expand';button.setAttribute('aria-expanded',String(expanded));}
document.querySelectorAll('.btn-expand').forEach(button=>button.setAttribute('aria-expanded','false'));

function runArchitect(){
  const field=document.getElementById('archInput');const input=field.value.trim();const type=document.getElementById('archType').value;
  if(!input){field.setCustomValidity('Enter the task you want help with.');field.reportValidity();return;}field.setCustomValidity('');
  const common='Use the sources and constraints I provide. Ask only for missing information that materially affects the result. Do not invent facts, sources, or completed checks. If a needed tool is unavailable, explain the limit and offer a useful next step.';
  const patterns={
    'triple-check':{text:`Task: ${input}\n\nIdentify the important assumptions and compare reasonable approaches. Draft the answer, then check it against my goal, constraints, and evidence. Correct weaknesses you find. Return the result with a concise explanation of important assumptions, checks, and remaining uncertainty. Do not present self-review as independent verification.`,guide:'Tool fit: use an assistant with the inputs and tools this task needs. A review scaffold helps organize the work; verify consequential claims against evidence.'},
    'few-shot':{text:`Task: ${input}\n\nFollow the structure and tone of these examples, while replacing their facts with the information for my actual task.\n\nExample input: [supply a relevant example]\nExample output: [supply the desired result]\n\nFeatures to preserve: [structure, tone, length, or fields]\nDetails that should change: [names, facts, audience, or context]\n\nIf the example is incomplete or conflicts with my task, identify the issue instead of copying the error.`,guide:'Tool fit: use an assistant that can read your examples and required inputs. Check that it copies the intended pattern rather than the example’s facts.'},
    'cot':{text:`Task: ${input}\n\nSolve the problem and give the answer with a concise explanation of the method, key assumptions, and relevant calculations or evidence. Check the result using an alternative calculation or example when useful. If information is missing, state what you need.`,guide:'Tool fit: for numerical or technical work, use available calculation or execution tools and verify the result. A concise explanation is more useful than requesting private internal reasoning.'},
    'tot':{text:`Task: ${input}\n\nCompare three plausible approaches using criteria relevant to my goal. For each, identify the main benefit, constraint, risk, and evidence needed. Recommend an approach conditionally and explain what new information would change it. Treat the perspectives as one assistant’s analysis, not independent experts or a research benchmark.`,guide:'Tool fit: use an assistant that can inspect the relevant evidence. Comparing alternatives does not require a fictional expert dialogue.'},
    'chaining':{text:`Goal: ${input}\n\nWork in stages.\n1. Review the inputs, goal, and constraints. Identify important gaps. Pause for my review.\n2. Propose an outline or plan grounded in those inputs. Pause for my review.\n3. Create the requested result. Check it against the agreed requirements.\n4. Provide a concise summary or visual only if it would help me use the result.\n\nWait for my “Continue” between stages. Use any research, file, or image tools only when available and relevant.`,guide:'Tool fit: one conversation can support a staged workflow. Separate tools or assistants are optional; check the information passed between stages.'},
    'rag':{text:`Using the attached or supplied documents as the evidence base, answer:\n${input}\n\nCite the document and specific passage or location supporting each substantive finding. Distinguish an exact quotation from a paraphrase. If the documents do not answer part of the question, say what is missing. Identify conflicting passages rather than choosing silently. Do not claim a source was read if it was unavailable.`,guide:'Tool fit: use an assistant that can access and retrieve relevant parts of your documents. Verify that the cited passages support the answer; a file upload alone does not guarantee grounding.'}
  };
  const pattern=patterns[type];document.getElementById('archText').textContent=pattern.text+'\n\n'+common;
  document.getElementById('archRec').textContent=pattern.guide;const output=document.getElementById('archOutput');output.style.display='block';output.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
}
document.getElementById('archInput').addEventListener('input',event=>event.target.setCustomValidity(''));
function copyArch(){return copyText(document.getElementById('archText').textContent,document.querySelector('.output-copy-btn'),document.getElementById('archText'));}

const hamburger=document.getElementById('hamburger'),sidebar=document.getElementById('sidebar'),overlay=document.getElementById('sidebarOverlay');
hamburger.setAttribute('aria-expanded','false');hamburger.setAttribute('aria-controls','sidebar');
function openSidebar(){sidebar.classList.add('open');overlay.classList.add('open');hamburger.classList.add('open');hamburger.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';}
function closeSidebar(){sidebar.classList.remove('open');overlay.classList.remove('open');hamburger.classList.remove('open');hamburger.setAttribute('aria-expanded','false');document.body.style.overflow='';}
hamburger.addEventListener('click',()=>sidebar.classList.contains('open')?closeSidebar():openSidebar());overlay.addEventListener('click',closeSidebar);
document.querySelectorAll('.sidebar-link').forEach(link=>link.addEventListener('click',()=>{if(innerWidth<=768)closeSidebar();}));

const cards=Array.from(document.querySelectorAll('.pcard'));
const typePills=document.querySelectorAll('.type-pill'),catLinks=document.querySelectorAll('.sidebar-link[data-cat]');
const searchInput=document.getElementById('searchInput'),noResults=document.getElementById('no-results');
const resources=document.getElementById('library-search-resources'),summary=document.getElementById('search-summary');
const glossary=document.querySelector('.glossary-list'),glossaryDivider=document.getElementById('glossary');
const glossaryResults=document.getElementById('glossary-search-results');
const normalize=text=>text.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/&(?:amp;)+/g,' and ').replace(/&/g,' and ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const searchTerms=text=>Array.from(text.matchAll(/"([^"]+)"|(\S+)/g),match=>normalize(match[1]||match[2])).filter(Boolean);
const matches=(hay,terms)=>terms.every(term=>hay.includes(term));
const cardIndex=cards.map(card=>({card,text:normalize([card.dataset.cat,card.dataset.keywords,card.querySelector('.pcard-title')?.textContent,card.querySelector('.pcard-desc')?.textContent,card.querySelector('.pcard-prompt')?.textContent].join(' '))}));
const glossaryIndex=Array.from(glossary.querySelectorAll('li')).map(item=>({item,text:normalize(item.textContent),title:item.querySelector('strong').textContent.replace(/\.$/,'')}));
const skillIndex=Array.from(document.querySelectorAll('.skill-search-entry')).map(link=>({link,item:link.closest('li'),text:normalize(link.dataset.search)}));
let activeType='all',activeCat='all-cat',searchTerm=new URL(location.href).searchParams.get('q')||'';
const catCounts={};cards.forEach(card=>catCounts[card.dataset.cat]=(catCounts[card.dataset.cat]||0)+1);
document.getElementById('total-count').textContent=cards.length;document.getElementById('hero-count').textContent=cards.length;document.getElementById('cnt-all').textContent=cards.length;document.getElementById('category-count').textContent=Object.keys(catCounts).length;
Object.entries(catCounts).forEach(([category,count])=>{const element=document.getElementById('cnt-'+category);if(element)element.textContent=count;});
function syncFilters(){typePills.forEach(pill=>{const active=pill.dataset.filter===activeType;pill.classList.toggle('active',active);pill.setAttribute('aria-pressed',String(active));});catLinks.forEach(link=>link.classList.toggle('active',link.dataset.cat===activeCat));}
function applyFilters(){
  const terms=searchTerms(searchTerm);let visible=0;
  cardIndex.forEach(({card,text})=>{const show=(activeType==='all'||card.dataset.type===activeType)&&(activeCat==='all-cat'||card.dataset.cat===activeCat)&&matches(text,terms);card.style.display=show?'':'none';if(show){card.classList.add('visible');visible++;}});
  document.querySelectorAll('.prompts-grid').forEach(grid=>{const show=Array.from(grid.querySelectorAll('.pcard')).some(card=>card.style.display!=='none');grid.style.display=show?'':'none';let previous=grid.previousElementSibling;if(previous?.classList.contains('challenge-intro')){previous.style.display=show?'':'none';previous=previous.previousElementSibling;}if(previous?.classList.contains('sec-divider'))previous.style.display=show?'':'none';});
  document.querySelectorAll('.ai-theme-heading').forEach(heading=>{let node=heading.nextElementSibling,show=false;while(node&&!node.classList.contains('ai-theme-heading')){if(node.classList?.contains('pcard')&&node.style.display!=='none'){show=true;break;}node=node.nextElementSibling;}heading.style.display=show?'flex':'none';});
  const glossaryMatches=glossaryIndex.filter(({text})=>matches(text,terms));glossaryIndex.forEach(entry=>entry.item.hidden=terms.length>0&&!matches(entry.text,terms));
  glossary.hidden=terms.length>0&&!glossaryMatches.length;glossaryDivider.hidden=glossary.hidden;
  let skills=0;skillIndex.forEach(({item,text})=>{item.hidden=!terms.length||!matches(text,terms);if(!item.hidden)skills++;});
  glossaryResults.replaceChildren();
  if(terms.length)glossaryMatches.forEach(({item,title})=>{const row=document.createElement('li'),link=document.createElement('a');link.href='#'+item.id;link.textContent=title;row.append(link);glossaryResults.append(row);});
  resources.hidden=!terms.length;
  summary.textContent=`${visible} prompt${visible===1?'':'s'}, ${skills} skill${skills===1?'':'s'}, and ${terms.length?glossaryMatches.length:0} glossary term${glossaryMatches.length===1?'':'s'} match your search.`;
  document.getElementById('visible-count').textContent=visible;noResults.style.display=visible===0&&(!terms.length||skills+glossaryMatches.length===0)?'block':'none';
  syncFilters();
}
typePills.forEach(pill=>pill.addEventListener('click',()=>{activeType=pill.dataset.filter;applyFilters();}));
function handleCatClick(event,category){activeCat=category;applyFilters();}
function setSearch(value){searchTerm=value;searchInput.value=value;if(value.trim()){activeType='all';activeCat='all-cat';}const url=new URL(location.href);if(value.trim())url.searchParams.set('q',value);else url.searchParams.delete('q');try{history.replaceState(null,'',url);}catch{}applyFilters();}
searchInput.value=searchTerm;searchInput.setAttribute('aria-controls','library-search-resources');
searchInput.addEventListener('input',()=>setSearch(searchInput.value));
searchInput.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();const first=cards.find(card=>card.style.display!=='none');(first||resources).scrollIntoView({block:'start',behavior:'auto'});}});
document.getElementById('clear-search').addEventListener('click',()=>{activeType='all';activeCat='all-cat';setSearch('');searchInput.focus();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(sidebar.classList.contains('open')){closeSidebar();hamburger.focus();}else if(searchInput.value){setSearch('');searchInput.focus();}}if(event.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)&&!event.target.isContentEditable){event.preventDefault();searchInput.focus();}});
const sections=Array.from(document.querySelectorAll('.sec-divider[id]'));
window.addEventListener('scroll',()=>{if(searchTerm)return;const y=scrollY+100;let current='all-cat';sections.forEach(section=>{if(section.offsetTop<=y)current=section.dataset.category||section.id;});catLinks.forEach(link=>link.classList.toggle('active',link.dataset.cat===current));},{passive:true});
applyFilters();
