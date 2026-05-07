/* DrawSplat v2.6 — single source of app behaviour.
   v2.5 changes vs v2.4:
   - Object lookup is O(1) via a per-render Map.
   - render() is RAF-coalesced; pointermove no longer triggers a synchronous redraw per event.
   - History snapshots only happen on commit boundaries.
   - localStorage autosave falls back to IndexedDB on quota errors.
   - Image uploads are sniffed by magic bytes, not just MIME headers.
   - BroadcastChannel sends deltas plus a periodic full board for resync.
   - Keyboard shortcuts dialog (?), reduced-motion respect, focus-visible.
   - Service worker registered for offline shell.
*/
(function(){
const VERSION='2.6';
const svg=document.getElementById('boardSvg'), NS='http://www.w3.org/2000/svg', XHTML='http://www.w3.org/1999/xhtml';
const TEXTABLE_TYPES=['text','sticky','comment','audio','rect','ellipse','diamond','triangle','callout','speech'], SHAPE_TEXT_TYPES=['rect','ellipse','diamond','triangle','callout','speech'];
const ADVANCED_TOOLS=['connector','diamond','triangle','callout','speech','comment','audio'];
const STICKERS=[{id:'star',label:'Star',icon:'⭐',bg:'#fde68a'},{id:'check',label:'Check',icon:'✅',bg:'#bbf7d0'},{id:'idea',label:'Idea',icon:'💡',bg:'#fde68a'},{id:'question',label:'Question',icon:'❓',bg:'#dbeafe'},{id:'smile',label:'Smile',icon:'😀',bg:'#fecdd3'},{id:'book',label:'Book',icon:'📚',bg:'#ddd6fe'},{id:'pencil',label:'Pencil',icon:'✏️',bg:'#fed7aa'},{id:'pin',label:'Pin',icon:'📌',bg:'#fecaca'},{id:'search',label:'Search',icon:'🔍',bg:'#cffafe'},{id:'globe',label:'Globe',icon:'🌎',bg:'#bfdbfe'}];

let board={version:VERSION,title:'',className:'',studentName:'',mode:'teacher',assignmentMode:false,currentLayer:'shared',restorePoints:[],showAnswerKey:true,active:0,panels:[{id:id(),name:'Panel 1',bg:'grid',objects:[]}]};
let tool='select', selectedIds=[], drawing=null, drag=null, zoom=1, fillEnabled=true, connectorPendingFrom=null, marquee=null, clipboard=null;
let history=[], future=[], lastSnapshot=''; let localChannel=null, cloudTimer=null, collabRoom='', instanceId=id(), lastCloudTs=''; let liveCursors={}, mediaRecorder=null, recordChunks=[]; let inlineEditId=null, inlineEditOriginal=null;

/* v2.5: O(1) object lookup. Rebuilt every render. */
let objectIndex=new Map();
/* v2.5: render coalescing. */
let renderRequested=false;
function requestRender(){if(renderRequested) return; renderRequested=true; requestAnimationFrame(()=>{renderRequested=false; render()})}

const ui={};
['workspaceMode','interfaceMode','panelSelect','strokeColor','strokeWidth','fillColor','fillPattern','stickyColor','opacity','status','boardTitle','className','studentName','scriptUrl','richEditor','textColor','fontSize','fontSizeValue','textRotation','textRotationValue','autoScaleText','userMode','collabRoom','syncStatus','cursorStatus','templateSelect','stickerSelect','restorePointSelect','restorePointHint','assignmentModeToggle','activeLayerSelect','showAnswerKeyToggle','layerBadge'].forEach(k=>{ui[k]=document.getElementById(k)});

const SAFE_IMAGE_TYPES=['image/png','image/jpeg','image/webp','image/gif'];
const SAFE_AUDIO_TYPES=['audio/webm','audio/mpeg','audio/mp4','audio/wav','audio/ogg'];
const MAX_IMAGE_BYTES=25*1024*1024;
const MAX_AUDIO_BYTES=25*1024*1024;
const MAX_BOARD_BYTES=64*1024*1024;

/* v2.5: magic-byte sniff so a renamed .svg or .exe can't slip past the MIME whitelist. */
const IMAGE_SIGS=[
  {type:'image/png', bytes:[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]},
  {type:'image/jpeg',bytes:[0xFF,0xD8,0xFF]},
  {type:'image/gif', bytes:[0x47,0x49,0x46,0x38]},
  {type:'image/webp',bytes:[0x52,0x49,0x46,0x46]}
];
async function sniffImage(file){
  const head=new Uint8Array(await file.slice(0,16).arrayBuffer());
  for(const sig of IMAGE_SIGS){
    let ok=true; for(let i=0;i<sig.bytes.length;i++){ if(head[i]!==sig.bytes[i]){ ok=false; break } }
    if(ok){
      if(sig.type==='image/webp'){
        if(head[8]===0x57&&head[9]===0x45&&head[10]===0x42&&head[11]===0x50) return sig.type;
      } else return sig.type;
    }
  }
  return '';
}
function validateUpload(file,kind){
  if(!file) return false;
  const isImage=kind==='image', allowed=isImage?SAFE_IMAGE_TYPES:SAFE_AUDIO_TYPES, limit=isImage?MAX_IMAGE_BYTES:MAX_AUDIO_BYTES;
  if(!allowed.includes(file.type)){setStatus((isImage?'Image':'Audio')+' upload blocked. Use '+allowed.map(t=>t.split('/')[1].toUpperCase()).join(', ')+'.','danger'); return false}
  if(file.size>limit){setStatus((isImage?'Image':'Audio')+' upload blocked. Maximum size is '+Math.round(limit/1024/1024)+' MB.','danger'); return false}
  return true
}
async function validateImageDeep(file){
  if(!validateUpload(file,'image')) return false;
  const sniffed=await sniffImage(file);
  if(!sniffed){ setStatus('Image rejected: file content does not match a supported image format.','danger'); return false }
  return true;
}

function gid(x){return document.getElementById(x)}
function id(){return 'ib_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36)}
function panel(){return board.panels[board.active]}
function setStatus(msg,cls=''){if(ui.status){ui.status.className='hint '+cls;ui.status.textContent=msg}}
function setSyncStatus(msg,cls=''){if(ui.syncStatus){ui.syncStatus.className='hint '+cls;ui.syncStatus.textContent=msg}}
window.setStatus=setStatus; window.setSyncStatus=setSyncStatus;

function setTool(next){tool=next; document.querySelectorAll('#toolButtons button').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool)); if(tool!=='connector') connectorPendingFrom=null; applyToolContext()}
function applyToolContext(){const o=(selectedIds.length===1)?currentObj():null; const objType=o?o.type:null; document.querySelectorAll('.ctx-group').forEach(el=>{const ctx=el.dataset.context; const active=(tool===ctx)||(objType===ctx); el.open=active; el.classList.toggle('context-active',active)})}
function applyInterfaceMode(mode,quiet=false){mode=mode||ui.interfaceMode?.value||localStorage.getItem('drawsplat.interfaceMode')||'simple'; if(ui.interfaceMode) ui.interfaceMode.value=mode; localStorage.setItem('drawsplat.interfaceMode',mode); document.body.dataset.view=mode; document.querySelectorAll('[data-ui],[data-ui-section]').forEach(el=>{const level=el.dataset.uiSection||el.dataset.ui||'core'; el.classList.toggle('simple-hidden',mode==='simple'&&level==='advanced')}); if(mode==='simple'&&ADVANCED_TOOLS.includes(tool)) setTool('select'); if(!quiet) setStatus(mode==='simple'?'Simple interface enabled.':'Advanced interface enabled.','success')}
function applyWorkspaceMode(mode,quiet=false){mode=mode||ui.workspaceMode?.value||localStorage.getItem('drawsplat.workspaceMode')||'productivity'; if(mode!=='education') mode='productivity'; document.body.dataset.workspace=mode; if(ui.workspaceMode) ui.workspaceMode.value=mode; localStorage.setItem('drawsplat.workspaceMode',mode); const msg=mode==='education'?'Education tools enabled.':'Productivity workspace enabled. Education-only controls are hidden.'; const ws=gid('workspaceStatus'); if(ws) ws.textContent=mode==='education'?'Education Tools shows class, student, answer-key, turn-in, assignment, and moderation controls.':'Productivity hides classroom-only controls. Choose Education Tools to reveal class, student, answer-key, turn-in, and moderation features.'; if(!quiet) setStatus(msg,'success')}

function pt(evt){const r=svg.getBoundingClientRect();return{x:(evt.clientX-r.left)/zoom,y:(evt.clientY-r.top)/zoom}}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function style(){return{stroke:ui.strokeColor.value,strokeWidth:+ui.strokeWidth.value,fill:fillEnabled?ui.fillColor.value:'none',fillPattern:ui.fillPattern?ui.fillPattern.value:'',opacity:+ui.opacity.value/100}}
function defaultTextProps(type){const shape=SHAPE_TEXT_TYPES.includes(type);return{html:'',text:'',textColor:'#111827',fontSize:type==='sticky'?16:(type==='text'?24:20),hAlign:shape?'center':'left',vAlign:shape?'middle':'top',textRotation:0,autoScaleText:shape}}
function activeInsertLayer(){if(!board.assignmentMode) return 'shared'; if(board.mode==='student') return 'student'; return board.currentLayer||'teacher'}
function canEditObject(o){return !!o && !o.locked && !(board.assignmentMode && board.mode==='student' && o.layer==='teacher')}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))}
window.esc=esc;

function makeObj(type,x,y,w=120,h=80,extra={}){return{id:id(),type,x,y,w,h,locked:false,layer:activeInsertLayer(),...style(),...(TEXTABLE_TYPES.includes(type)?defaultTextProps(type):{}),...extra}}
function findObj(idv){return objectIndex.get(idv)||panel().objects.find(o=>o.id===idv)}
function currentObj(){return findObj(selectedIds[0])}
function isSelected(idv){return selectedIds.includes(idv)}
function clearSelection(){commitInlineTextEditor(); selectedIds=[]}
function setSingleSelection(idv){if(inlineEditId&&inlineEditId!==idv) commitInlineTextEditor(); selectedIds=idv?[idv]:[]}
function toggleSelection(idv){if(inlineEditId&&inlineEditId!==idv) commitInlineTextEditor(); selectedIds=isSelected(idv)?selectedIds.filter(x=>x!==idv):[...selectedIds,idv]}

function setInputIfIdle(el,val){if(!el) return; if(document.activeElement===el) return; if(el.value!==val) el.value=val}
function plainTextToHtml(t){return String(t||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(/\n/g,'<br>')}
function htmlToPlainText(h){const d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||d.innerText||'').trim()}
/* v2.5: stricter HTML cleaner — strip all tags except a small allowlist plus remove on* attributes. */
function cleanEditorHtml(h){
  let s=(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').trim();
  if(s==='<br>'||s==='<div><br></div>') return '';
  const tmp=document.createElement('div'); tmp.innerHTML=s;
  const allow=new Set(['B','I','U','EM','STRONG','BR','DIV','SPAN','UL','OL','LI','P']);
  const walker=document.createTreeWalker(tmp,NodeFilter.SHOW_ELEMENT,null);
  const remove=[];
  let n=walker.currentNode;
  while((n=walker.nextNode())){
    if(!allow.has(n.tagName)){ remove.push(n); continue }
    [...n.attributes].forEach(a=>{ const an=a.name.toLowerCase(); if(an.startsWith('on')||an==='style'||an==='href'||an==='src') n.removeAttribute(a.name) });
  }
  remove.forEach(node=>{ while(node.firstChild) node.parentNode.insertBefore(node.firstChild,node); node.parentNode.removeChild(node) });
  return tmp.innerHTML;
}
function objectHtml(o,f=''){if(o.id===inlineEditId) return ''; return cleanEditorHtml(o.html||plainTextToHtml(o.text||f||''))}

function objectTextEditBox(o){const b=normBox(o); if(SHAPE_TEXT_TYPES.includes(o.type)) return textBoxFor(o.type,b); if(o.type==='comment') return {x:b.x+24,y:b.y,w:Math.max(120,b.w-24),h:Math.max(50,b.h)}; if(o.type==='sticky'){const imageH=o.imageSrc?Math.min(b.h*0.45,110):0; return {x:b.x+12,y:b.y+12+(imageH?imageH+8:0),w:Math.max(40,b.w-24),h:Math.max(36,b.h-24-(imageH?imageH+8:0))}} return {x:b.x+8,y:b.y+8,w:Math.max(40,b.w-16),h:Math.max(36,b.h-16)}}
function positionInlineTextEditor(){if(!inlineEditId) return; const o=findObj(inlineEditId); const wrap=gid('inlineTextEditorWrap'); if(!o||!wrap) return commitInlineTextEditor(false); const box=objectTextEditBox(o); const left=Math.max(0,box.x*zoom), top=Math.max(0,box.y*zoom), width=Math.max(60,box.w*zoom), height=Math.max(40,box.h*zoom); wrap.style.left=left+'px'; wrap.style.top=top+'px'; wrap.style.width=width+'px'; wrap.style.height=height+'px'; const ta=gid('inlineTextEditor'); ta.style.minHeight='0'; ta.style.height=height+'px'}
function openInlineTextEditor(objId,starter=null){const o=findObj(objId); if(!o||!TEXTABLE_TYPES.includes(o.type)) return; if(inlineEditId&&inlineEditId!==objId) commitInlineTextEditor(); inlineEditId=objId; inlineEditOriginal={html:o.html||'',text:o.text||''}; setSingleSelection(objId); const wrap=gid('inlineTextEditorWrap'), ta=gid('inlineTextEditor'); const startVal=starter!==null?starter:(o.text||''); ta.value=startVal; ta.style.fontSize=(o.fontSize||16)+'px'; ta.style.color=o.textColor||'#111827'; ta.style.fontFamily='Inter, Arial, sans-serif'; ta.placeholder=o.type==='sticky'?'Add note...':(o.type==='audio'?'Voice note':(o.type==='comment'?'Add feedback...':(o.type==='text'?'Type here...':'Type here...'))); wrap.classList.add('show'); positionInlineTextEditor(); updateInlineTextObject(false); setTimeout(()=>{ta.focus(); ta.select()},0)}
function updateInlineTextObject(updateInspectorToo=true){if(!inlineEditId) return; const o=findObj(inlineEditId), ta=gid('inlineTextEditor'); if(!o||!ta) return; o.text=ta.value; o.html=plainTextToHtml(ta.value); if(updateInspectorToo&&ui.richEditor&&selectedIds.length===1&&selectedIds[0]===o.id) ui.richEditor.innerHTML=o.html}
function commitInlineTextEditor(save=true){if(!inlineEditId) return; const o=findObj(inlineEditId), wrap=gid('inlineTextEditorWrap'); if(save){updateInlineTextObject(true)}else if(o&&inlineEditOriginal){o.text=inlineEditOriginal.text;o.html=inlineEditOriginal.html} inlineEditId=null; inlineEditOriginal=null; if(wrap) wrap.classList.remove('show'); render(); if(save) saveState()}

function migrateBoard(b){if(!b||!Array.isArray(b.panels))return;b.version=VERSION;if(!b.mode)b.mode='teacher';if(b.title==='Untitled DrawSplat') b.title=''; if(!('studentName' in b)) b.studentName=''; if(!('assignmentMode' in b)) b.assignmentMode=false; if(!('currentLayer' in b)) b.currentLayer='shared'; if(!Array.isArray(b.restorePoints)) b.restorePoints=[]; if(!('showAnswerKey' in b)) b.showAnswerKey=true; b.panels.forEach((p,i)=>{if(!p.id) p.id='panel_'+id(); if(!p.name) p.name='Panel '+(i+1); if(!p.bg) p.bg='grid'; if(typeof p.bgImage!=='string') p.bgImage=''; p.objects=(p.objects||[]).map(migrateObject)}); ensureActivePanel()}
const LEGACY_PLACEHOLDERS=new Set(['Add note...','Voice note','Add feedback...','Type here','Text']);
function migrateObject(o){if(TEXTABLE_TYPES.includes(o.type)){const d=defaultTextProps(o.type); for(const k in d) if(o[k]===undefined) o[k]=d[k]; if((!o.html||o.html==='')&&o.text) o.html=plainTextToHtml(o.text); o.text=htmlToPlainText(o.html||o.text||''); if(LEGACY_PLACEHOLDERS.has(o.text)){o.text=''; o.html=''}} if(o.layer===undefined) o.layer='shared'; if(o.fillPattern===undefined) o.fillPattern=''; if(o.answerKey===undefined) o.answerKey=false; if(o.audioSrc===undefined) o.audioSrc=''; return o}
function normBox(o){if(o.type==='connector'){const p=connectorEndpoints(o);const x=Math.min(p.x1,p.x2),y=Math.min(p.y1,p.y2),w=Math.abs(p.x2-p.x1),h=Math.abs(p.y2-p.y1);return{x,y,w,h,cx:x+w/2,cy:y+h/2}} const x=Math.min(o.x,o.x+o.w),y=Math.min(o.y,o.y+o.h),w=Math.abs(o.w),h=Math.abs(o.h);return{x,y,w,h,cx:x+w/2,cy:y+h/2}}
function normalizeObject(o){if(!o||['line','arrow','path','connector'].includes(o.type))return;const b=normBox(o);o.x=b.x;o.y=b.y;o.w=b.w;o.h=b.h}
function resetInteractionState(){commitInlineTextEditor?.(true); selectedIds=[]; connectorPendingFrom=null; marquee=null; drawing=null; drag=null}

function switchPanel(panelId){ensureActivePanel(); const panelKey=String(panelId||''); let idx=board.panels.findIndex(p=>String(p.id)===panelKey); if(idx<0&&/^\d+$/.test(panelKey)) idx=parseInt(panelKey,10); if(idx<0||idx>=board.panels.length)return; if(idx===board.active){syncPanelSelect();return} resetInteractionState(); board.active=idx; render(); saveState(false); setStatus('Switched to '+(board.panels[idx]?.name||('Panel '+(idx+1)))+'.','success')}
function ensureActivePanel(){if(!board.panels.length) board.panels=[{id:'panel_'+id(),name:'Panel 1',bg:'grid',objects:[]}]; board.panels.forEach((p,i)=>{if(!p.id) p.id='panel_'+id(); if(!p.name) p.name='Panel '+(i+1); if(!p.bg) p.bg='grid'; if(!Array.isArray(p.objects)) p.objects=[]}); if(board.active<0||board.active>=board.panels.length) board.active=0}
function renderTabs(){ensureActivePanel();const tabs=gid('tabs');if(tabs){tabs.innerHTML='';board.panels.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='tab '+(i===board.active?'active':'');b.textContent=p.name||('Panel '+(i+1));b.dataset.panelId=p.id;b.dataset.panelIndex=String(i);b.setAttribute('aria-label','Switch to '+(p.name||('Panel '+(i+1))));tabs.appendChild(b)});const plus=document.createElement('button');plus.type='button';plus.className='tab';plus.textContent='+';plus.dataset.action='add-panel';plus.setAttribute('aria-label','Add panel');tabs.appendChild(plus)} syncPanelSelect()}
function syncPanelSelect(){ensureActivePanel();const sel=gid('panelSelect');if(!sel)return;const currentId=board.panels[board.active]?.id||'';sel.innerHTML=board.panels.map((p,i)=>`<option value="${esc(p.id)}">${esc(p.name||('Panel '+(i+1)))}</option>`).join('');sel.value=currentId;const hint=gid('panelCurrentHint');if(hint) hint.textContent=`Current panel: ${board.panels[board.active]?.name||('Panel '+(board.active+1))} (${board.active+1} of ${board.panels.length})`}
function handleTabsClick(evt){const btn=evt.target.closest('button'); if(!btn||!gid('tabs')?.contains(btn)) return; evt.preventDefault(); evt.stopPropagation(); if(btn.dataset.action==='add-panel') return addPanel(); switchPanel(btn.dataset.panelId||btn.dataset.panelIndex)}
if(gid('tabs')) gid('tabs').addEventListener('click',handleTabsClick);
if(gid('panelSelect')) gid('panelSelect').addEventListener('change',e=>switchPanel(e.target.value));

function bgDefs(bg){let pat=''; if(bg==='grid')pat='<pattern id="bgp" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#dbe3f3" stroke-width="1"/></pattern>'; if(bg==='dots')pat='<pattern id="bgp" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#cbd5e1"/></pattern>'; if(bg==='graph')pat='<pattern id="small" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#e5e7eb" stroke-width="1"/></pattern><pattern id="bgp" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="url(#small)"/><path d="M80 0H0V80" fill="none" stroke="#b6c2d8" stroke-width="1.4"/></pattern>'; if(bg==='lines')pat='<pattern id="bgp" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M0 47H48" stroke="#c7d2fe" stroke-width="1.2"/></pattern>'; if(bg==='isometric')pat='<pattern id="bgp" width="40" height="35" patternUnits="userSpaceOnUse"><path d="M20 0v35M0 17.5l20 17.5 20-17.5M0 17.5L20 0l20 17.5" fill="none" stroke="#dbe3f3" stroke-width="1"/></pattern>'; return pat}
function fillPatternDefs(){return '<pattern id="fillpat_dots" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="transparent"/><circle cx="2.5" cy="2.5" r="1.5" fill="rgba(30,57,141,.35)"/></pattern><pattern id="fillpat_diagonal" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="rgba(30,57,141,.35)" stroke-width="3"/></pattern><pattern id="fillpat_crosshatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0L12 12M12 0L0 12" stroke="rgba(30,57,141,.3)" stroke-width="1.5"/></pattern><pattern id="fillpat_checker" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="transparent"/><rect width="8" height="8" fill="rgba(30,57,141,.2)"/><rect x="8" y="8" width="8" height="8" fill="rgba(30,57,141,.2)"/></pattern>'}
function objectFill(o){return o.fillPattern?`url(#fillpat_${o.fillPattern})`:o.fill}
function presenceName(){return (board.mode==='teacher'?'Teacher':'Student')+(board.studentName?': '+board.studentName:'')}
function cursorColorFor(idv){let h=0; for(let i=0;i<idv.length;i++) h=(h*31+idv.charCodeAt(i))%360; return `hsl(${h} 70% 45%)`}

function rebuildIndex(){
  objectIndex=new Map();
  for(const p of board.panels) for(const o of p.objects) objectIndex.set(o.id,o);
}

function render(){
  rebuildIndex();
  renderTabs();
  const _lasers=[...svg.querySelectorAll('.laser-trail')];
  setInputIfIdle(ui.boardTitle,board.title); setInputIfIdle(ui.className,board.className); setInputIfIdle(ui.studentName,board.studentName||''); ui.userMode.value=board.mode||'teacher'; ui.assignmentModeToggle.checked=!!board.assignmentMode; ui.activeLayerSelect.value=board.currentLayer||'shared'; ui.showAnswerKeyToggle.checked=!!board.showAnswerKey;
  ui.layerBadge.textContent='Layer: '+((board.assignmentMode?(board.mode==='student'?'Student':'Teacher: '+(board.currentLayer||'shared')):'Shared').replace(/^Teacher: shared$/,'Shared'));
  refreshRestorePoints(); applyModeUI(); refreshFrameNav(); gid('zoomResetBtn').textContent=Math.round(zoom*100)+'%';
  const p=panel();
  const bgImageSvg=p.bgImage?`<image x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" href="${esc(p.bgImage)}"/>`:'';
  svg.innerHTML='<defs>'+bgDefs(p.bg)+fillPatternDefs()+'</defs>'+(p.bg==='blank'?'<rect width="100%" height="100%" fill="#fff"/>':'<rect width="100%" height="100%" fill="url(#bgp)"/>')+bgImageSvg+'<g id="viewport" transform="scale('+zoom+')"></g>';
  _lasers.forEach(l=>svg.appendChild(l));
  const g=svg.querySelector('#viewport');
  const layerOrder={teacher:0,shared:1,student:2};
  [...p.objects].filter(o=>!(o.answerKey && !board.showAnswerKey)).sort((a,b)=>((a.type==='connector'?-10:0)+(layerOrder[a.layer]??1))-((b.type==='connector'?-10:0)+(layerOrder[b.layer]??1))).forEach(o=>g.appendChild(drawObject(o)));
  drawLiveCursors(g);
  drawSelection();
  if(marquee&&marquee.active) g.appendChild(svgEl(`<rect class="marquee" x="${Math.min(marquee.x1,marquee.x2)}" y="${Math.min(marquee.y1,marquee.y2)}" width="${Math.abs(marquee.x2-marquee.x1)}" height="${Math.abs(marquee.y2-marquee.y1)}"/>`));
  updateInspector();
  applyToolContext();
  if(inlineEditId) positionInlineTextEditor();
}

function drawLiveCursors(g){const now=Date.now(); let count=0; Object.values(liveCursors).forEach(c=>{if(!c||c.panel!==board.active||now-c.ts>12000) return; count++; const x=c.x||0,y=c.y||0,color=c.color||'#2563eb'; g.appendChild(svgEl(`<g class="cursor-tag" opacity="0.98"><path d="M ${x} ${y} L ${x+10} ${y+24} L ${x+14} ${y+14} L ${x+28} ${y+14} Z" fill="${color}"/><rect x="${x+14}" y="${y+14}" rx="9" ry="9" width="${Math.max(74,(c.name||'User').length*8)}" height="24" fill="${color}"/><text x="${x+24}" y="${y+30}" font-size="12" font-weight="700" fill="white">${esc(c.name||'User')}</text></g>`))}); if(ui.cursorStatus) ui.cursorStatus.textContent=count?`${count} collaborator cursor${count===1?'':'s'} visible.`:'No live collaborator cursors yet.'}

function drawObject(o){const el=document.createElementNS(NS,'g');el.classList.add('object');if(isSelected(o.id))el.classList.add('selected');el.dataset.id=o.id;el.style.cursor=o.locked?'not-allowed':(o.type==='connector'?'pointer':'move');const b=normBox(o);let node=null;const common=`stroke="${o.stroke}" stroke-width="${o.strokeWidth}" fill="${objectFill(o)}" opacity="${o.opacity}"`; if(o.type==='rect')node=svgEl(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8" ${common}/>`);if(o.type==='ellipse')node=svgEl(`<ellipse cx="${b.x+b.w/2}" cy="${b.y+b.h/2}" rx="${b.w/2}" ry="${b.h/2}" ${common}/>`);if(o.type==='line')node=svgEl(`<line x1="${o.x}" y1="${o.y}" x2="${o.x+o.w}" y2="${o.y+o.h}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}" stroke-linecap="round"/>`);if(o.type==='arrow')node=svgEl(`<g opacity="${o.opacity}"><defs><marker id="m_${o.id}" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${o.stroke}"/></marker></defs><line x1="${o.x}" y1="${o.y}" x2="${o.x+o.w}" y2="${o.y+o.h}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" stroke-linecap="round" marker-end="url(#m_${o.id})"/></g>`);if(o.type==='connector'){const p=connectorEndpoints(o);node=svgEl(`<g opacity="${o.opacity}"><defs><marker id="cm_${o.id}" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${o.stroke}"/></marker></defs><path d="M ${p.x1} ${p.y1} L ${p.x2} ${p.y2}" fill="none" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" stroke-linecap="round" marker-end="url(#cm_${o.id})"/></g>`)} if(o.type==='diamond')node=svgEl(`<polygon points="${b.x+b.w/2},${b.y} ${b.x+b.w},${b.y+b.h/2} ${b.x+b.w/2},${b.y+b.h} ${b.x},${b.y+b.h/2}" ${common}/>`);if(o.type==='triangle')node=svgEl(`<polygon points="${b.x+b.w/2},${b.y} ${b.x+b.w},${b.y+b.h} ${b.x},${b.y+b.h}" ${common}/>`);if(o.type==='callout')node=svgEl(`<path d="${calloutPath(b)}" ${common}/>`);if(o.type==='speech')node=svgEl(`<path d="${speechPath(b)}" ${common}/>`);if(o.type==='path')node=svgEl(`<path d="${o.d}" fill="none" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}" stroke-linecap="round" stroke-linejoin="round"/>`);if(o.type==='image')node=svgEl(`<image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${esc(o.src)}" preserveAspectRatio="xMidYMid meet" opacity="${o.opacity}"/>`);if(o.type==='text')node=createTextObject(o,b);if(o.type==='sticky')node=createStickyObject(o,b);if(o.type==='comment')node=createCommentObject(o,b);if(o.type==='stamp')node=createStampObject(o,b);if(o.type==='audio')node=createAudioObject(o,b); if(node)el.appendChild(node); if(SHAPE_TEXT_TYPES.includes(o.type)) el.appendChild(createShapeTextObject(o,b)); if(o.answerKey&&board.showAnswerKey){el.appendChild(svgEl(`<g><rect x="${b.x+6}" y="${b.y+6}" rx="8" ry="8" width="76" height="20" fill="#FAA634" opacity="0.95"/><text x="${b.x+16}" y="${b.y+20}" font-size="11" font-weight="800" fill="#111827">ANSWER KEY</text></g>`))} el.addEventListener('pointerdown',objectDown); el.addEventListener('dblclick',ev=>{ev.stopPropagation(); if(TEXTABLE_TYPES.includes(o.type)){openInlineTextEditor(o.id)}}); return el}

function calloutPath(b){const r=Math.min(16,b.w/8,b.h/8),tx=b.x+Math.min(40,b.w*.3),ty=b.y+b.h,n=Math.min(26,b.h*.22);return`M ${b.x+r} ${b.y} H ${b.x+b.w-r} Q ${b.x+b.w} ${b.y} ${b.x+b.w} ${b.y+r} V ${b.y+b.h-n-r} Q ${b.x+b.w} ${b.y+b.h-n} ${b.x+b.w-r} ${b.y+b.h-n} H ${tx+18} L ${tx} ${ty} L ${tx+8} ${b.y+b.h-n} H ${b.x+r} Q ${b.x} ${b.y+b.h-n} ${b.x} ${b.y+b.h-n-r} V ${b.y+r} Q ${b.x} ${b.y} ${b.x+r} ${b.y} Z`}
function speechPath(b){const r=Math.min(18,b.w/8,b.h/8),n=Math.min(28,b.h*.22),cx=b.x+b.w*.55;return`M ${b.x+r} ${b.y} H ${b.x+b.w-r} Q ${b.x+b.w} ${b.y} ${b.x+b.w} ${b.y+r} V ${b.y+b.h-n-r} Q ${b.x+b.w} ${b.y+b.h-n} ${b.x+b.w-r} ${b.y+b.h-n} H ${cx+18} L ${cx-2} ${b.y+b.h} L ${cx-8} ${b.y+b.h-n} H ${b.x+r} Q ${b.x} ${b.y+b.h-n} ${b.x} ${b.y+b.h-n-r} V ${b.y+r} Q ${b.x} ${b.y} ${b.x+r} ${b.y} Z`}
function shapeClipNode(type,b){if(type==='rect')return svgEl(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="8"/>`);if(type==='ellipse')return svgEl(`<ellipse cx="${b.x+b.w/2}" cy="${b.y+b.h/2}" rx="${b.w/2}" ry="${b.h/2}"/>`);if(type==='diamond')return svgEl(`<polygon points="${b.x+b.w/2},${b.y} ${b.x+b.w},${b.y+b.h/2} ${b.x+b.w/2},${b.y+b.h} ${b.x},${b.y+b.h/2}"/>`);if(type==='triangle')return svgEl(`<polygon points="${b.x+b.w/2},${b.y} ${b.x+b.w},${b.y+b.h} ${b.x},${b.y+b.h}"/>`);if(type==='callout')return svgEl(`<path d="${calloutPath(b)}"/>`);return svgEl(`<path d="${speechPath(b)}"/>`)}
function textBoxFor(type,b){if(type==='ellipse')return{x:b.x+b.w*.18,y:b.y+b.h*.18,w:b.w*.64,h:b.h*.64};if(type==='diamond')return{x:b.x+b.w*.21,y:b.y+b.h*.21,w:b.w*.58,h:b.h*.58};if(type==='triangle')return{x:b.x+b.w*.19,y:b.y+b.h*.16,w:b.w*.62,h:b.h*.68};if(type==='callout'||type==='speech')return{x:b.x+14,y:b.y+12,w:b.w-28,h:b.h-Math.min(30,b.h*.24)-16};if(type==='sticky')return{x:b.x+12,y:b.y+12,w:b.w-24,h:b.h-24};if(type==='text')return{x:b.x,y:b.y,w:b.w,h:b.h};return{x:b.x+12,y:b.y+12,w:b.w-24,h:b.h-24}}

function createStyledDiv(o){const d=document.createElementNS(XHTML,'div'),h=o.hAlign||'left',v=o.vAlign||'top';d.setAttribute('xmlns',XHTML);Object.assign(d.style,{width:'100%',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:v==='top'?'flex-start':(v==='middle'?'center':'flex-end'),alignItems:h==='left'?'flex-start':(h==='center'?'center':'flex-end'),textAlign:h,padding:'2px',color:o.textColor||'#111827',fontFamily:'Inter, Arial, sans-serif',fontSize:(o.fontSize||20)+'px',lineHeight:'1.25',transform:`rotate(${o.textRotation||0}deg)`,transformOrigin:'center center',wordBreak:'break-word',overflow:'hidden'});d.innerHTML=objectHtml(o,o.type==='sticky'?'Add note...':(o.type==='text'?'Text':''));return d}
function createShapeTextObject(o,b){const g=document.createElementNS(NS,'g'),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath');clip.id='clip_'+o.id;clip.appendChild(shapeClipNode(o.type,b));defs.appendChild(clip);g.appendChild(defs);const fo=document.createElementNS(NS,'foreignObject'),box=textBoxFor(o.type,b);fo.setAttribute('x',box.x);fo.setAttribute('y',box.y);fo.setAttribute('width',Math.max(10,box.w));fo.setAttribute('height',Math.max(10,box.h));fo.setAttribute('clip-path',`url(#clip_${o.id})`);fo.setAttribute('pointer-events','none');fo.appendChild(createStyledDiv(o));g.appendChild(fo);return g}
function createTextObject(o,b){const fo=document.createElementNS(NS,'foreignObject');fo.setAttribute('x',b.x);fo.setAttribute('y',b.y);fo.setAttribute('width',Math.max(20,b.w));fo.setAttribute('height',Math.max(20,b.h));fo.setAttribute('opacity',o.opacity);fo.appendChild(createStyledDiv(o));return fo}
function createStickyObject(o,b){const fo=document.createElementNS(NS,'foreignObject');fo.setAttribute('x',b.x);fo.setAttribute('y',b.y);fo.setAttribute('width',Math.max(20,b.w));fo.setAttribute('height',Math.max(20,b.h));fo.setAttribute('opacity',o.opacity);const d=document.createElementNS(XHTML,'div');d.setAttribute('xmlns',XHTML);d.className='postit';Object.assign(d.style,{background:o.fill,width:'100%',height:'100%',fontSize:(o.fontSize||16)+'px',color:o.textColor||'#111827',display:'flex',flexDirection:'column',justifyContent:(o.vAlign||'top')==='top'?'flex-start':((o.vAlign||'top')==='middle'?'center':'flex-end'),textAlign:o.hAlign||'left',alignItems:(o.hAlign||'left')==='left'?'flex-start':((o.hAlign||'left')==='center'?'center':'flex-end'),transform:`rotate(${o.textRotation||0}deg)`,transformOrigin:'center center',gap:'8px'});if(o.imageSrc){const img=document.createElementNS(XHTML,'img');img.setAttribute('src',o.imageSrc);Object.assign(img.style,{width:'100%',maxHeight:'45%',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(0,0,0,.12)'});d.appendChild(img)}const content=document.createElementNS(XHTML,'div');content.innerHTML=objectHtml(o,'Add note...');content.style.width='100%';d.appendChild(content);fo.appendChild(d);return fo}
function createCommentObject(o,b){const g=document.createElementNS(NS,'g');const pinFill=o.resolved?'#9ca3af':'#ef4444';g.appendChild(svgEl(`<line x1="${b.x+14}" y1="${b.y+16}" x2="${b.x+14}" y2="${b.y+b.h}" stroke="${pinFill}" stroke-width="3" opacity="${o.opacity}"/>`));g.appendChild(svgEl(`<circle cx="${b.x+14}" cy="${b.y+14}" r="10" fill="${pinFill}" opacity="${o.opacity}"/>`));const fo=document.createElementNS(NS,'foreignObject');fo.setAttribute('x',b.x+24);fo.setAttribute('y',b.y);fo.setAttribute('width',Math.max(120,b.w-24));fo.setAttribute('height',Math.max(50,b.h));const d=document.createElementNS(XHTML,'div');d.setAttribute('xmlns',XHTML);Object.assign(d.style,{width:'100%',height:'100%',background:o.resolved?'#f3f4f6':'#fff7e6',border:'1px solid '+(o.resolved?'#d1d5db':'#f59e0b'),borderRadius:'10px',padding:'10px',fontSize:(o.fontSize||16)+'px',color:o.textColor||'#111827',display:'flex',flexDirection:'column',justifyContent:'space-between'});const badge=document.createElementNS(XHTML,'div');badge.textContent=o.resolved?'Resolved Comment':'Feedback Pin';badge.style.fontWeight='700';badge.style.fontSize='12px';badge.style.marginBottom='6px';const content=document.createElementNS(XHTML,'div');content.innerHTML=objectHtml(o,'Add feedback...');content.style.flex='1';content.style.wordBreak='break-word';d.appendChild(badge);d.appendChild(content);fo.appendChild(d);g.appendChild(fo);return g}
function createStampObject(o,b){const fo=document.createElementNS(NS,'foreignObject');fo.setAttribute('x',b.x);fo.setAttribute('y',b.y);fo.setAttribute('width',Math.max(30,b.w));fo.setAttribute('height',Math.max(30,b.h));fo.setAttribute('opacity',o.opacity);const d=document.createElementNS(XHTML,'div');d.setAttribute('xmlns',XHTML);Object.assign(d.style,{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',border:'2px solid rgba(0,0,0,.08)',borderRadius:'18px',background:o.stampBg||'#eef2ff'});const icon=(o.stampSrc?document.createElementNS(XHTML,'img'):document.createElementNS(XHTML,'div'));if(o.stampSrc){icon.setAttribute('src',o.stampSrc);Object.assign(icon.style,{maxWidth:'70%',maxHeight:'56%',objectFit:'contain'})}else{icon.textContent=o.stampIcon||'⭐';icon.style.fontSize=Math.max(26,Math.min(b.w,b.h)*0.56)+'px';}const label=document.createElementNS(XHTML,'div');label.textContent=o.stampLabel||'Sticker';label.style.fontSize='12px';label.style.fontWeight='700';label.style.marginTop='4px';d.appendChild(icon);d.appendChild(label);fo.appendChild(d);return fo}
function createAudioObject(o,b){const fo=document.createElementNS(NS,'foreignObject');fo.setAttribute('x',b.x);fo.setAttribute('y',b.y);fo.setAttribute('width',Math.max(80,b.w));fo.setAttribute('height',Math.max(60,b.h));fo.setAttribute('opacity',o.opacity);const d=document.createElementNS(XHTML,'div');d.setAttribute('xmlns',XHTML);d.className='audio-card';Object.assign(d.style,{width:'100%',height:'100%',background:o.fill&&o.fill!=='none'?o.fill:'#eff6ff',border:'1px solid #bfdbfe'});const pill=document.createElementNS(XHTML,'div');pill.className='audio-pill';pill.textContent=o.audioSrc?'Audio Ready':'Audio Note';const title=document.createElementNS(XHTML,'div');title.style.fontWeight='700';title.innerHTML=objectHtml(o,'Voice note');const meta=document.createElementNS(XHTML,'div');meta.style.fontSize='12px';meta.style.color='#475569';meta.textContent=o.audioSrc?(o.audioName||'Tap Play Audio in the inspector'):'Use Record Audio or Load Audio';d.appendChild(pill);d.appendChild(title);d.appendChild(meta);fo.appendChild(d);return fo}
function svgEl(s){const t=document.createElementNS(NS,'g');t.innerHTML=s.trim();return t.firstChild}

function selectionBounds(ids=selectedIds){const objs=ids.map(findObj).filter(Boolean);if(!objs.length)return null;const boxes=objs.map(normBox);const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y)),r=Math.max(...boxes.map(b=>b.x+b.w)),bt=Math.max(...boxes.map(b=>b.y+b.h));return{x,y,w:r-x,h:bt-y}}
function drawSelection(){const g=svg.querySelector('#viewport');if(!selectedIds.length||!g)return;selectedIds.forEach(idv=>{const o=findObj(idv);if(!o)return;const b=normBox(o);g.appendChild(svgEl(`<rect class="selection" x="${b.x-4}" y="${b.y-4}" width="${b.w+8}" height="${b.h+8}"/>`))});if(selectedIds.length===1){const o=findObj(selectedIds[0]);if(o&&o.type!=='connector'){const b=normBox(o);const h=svgEl(`<rect class="handle" x="${b.x+b.w-6}" y="${b.y+b.h-6}" width="12" height="12" rx="2"/>`);h.addEventListener('pointerdown',resizeDown);g.appendChild(h)}}else{const b=selectionBounds(); if(b) g.appendChild(svgEl(`<rect class="selection" x="${b.x-8}" y="${b.y-8}" width="${b.w+16}" height="${b.h+16}"/>`))}}
function groupMembers(o){if(!o||!o.groupId)return[o?.id].filter(Boolean);return panel().objects.filter(x=>x.groupId===o.groupId).map(x=>x.id)}

function objectDown(e){e.stopPropagation();const o=findObj(e.currentTarget.dataset.id);if(!o)return; if(board.assignmentMode&&board.mode==='student'&&o.layer==='teacher'){setStatus('Teacher-layer items are protected in assignment mode.','danger'); return} if(tool==='connector'){if(o.type==='connector')return; if(!connectorPendingFrom){connectorPendingFrom=o.id; setSingleSelection(o.id); render(); setStatus('Connector: select the second shape.','success'); return}else if(connectorPendingFrom!==o.id){panel().objects.push(makeObj('connector',0,0,0,0,{fromId:connectorPendingFrom,toId:o.id,fill:'none'})); connectorPendingFrom=null; render(); saveState(); setStatus('Connector added.','success'); return}else{connectorPendingFrom=null; setStatus('Connector cancelled.'); return}}
  const ids=e.shiftKey?(toggleSelection(o.id),selectedIds):((o.groupId&&!e.altKey)?groupMembers(o):[o.id]); if(!e.shiftKey) selectedIds=ids; if(o.locked||o.type==='connector'){render();return} const p=pt(e); drag={resize:false,ids:[...selectedIds],startX:p.x,startY:p.y,starts:selectedIds.map(idv=>{const s=findObj(idv);return{id:s.id,x:s.x,y:s.y,w:s.w,h:s.h,fontSize:s.fontSize||20}})}; render()}
function resizeDown(e){e.stopPropagation();const o=currentObj();if(!o||o.locked||selectedIds.length!==1||o.type==='connector')return;const b=normBox(o),p=pt(e);drag={resize:true,ids:[o.id],sx:p.x,sy:p.y,ox:b.x,oy:b.y,ow:b.w,oh:b.h,ofontSize:o.fontSize||20}}

svg.addEventListener('pointerdown',e=>{const p=pt(e); if(tool==='eraser'){const objEl=e.target.closest('.object'); if(objEl){const o=findObj(objEl.dataset.id); if(o&&canEditObject(o)&&!o.locked){cleanupConnectors([o.id]); panel().objects=panel().objects.filter(x=>x.id!==o.id); clearSelection(); render(); saveState()}} return} if(tool==='laser'){drawing={id:'laser_'+id(),type:'laser',d:`M ${p.x} ${p.y}`,x:p.x,y:p.y,w:1,h:1}; const path=svgEl(`<path class="laser-trail" d="${drawing.d}" stroke="#ef4444" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95"/>`); svg.appendChild(path); drawing._laserPath=path; return} if(tool==='select'){if(e.target===svg){clearSelection(); connectorPendingFrom=null; marquee={active:true,x1:p.x,y1:p.y,x2:p.x,y2:p.y}; render()} return} if(['rect','ellipse','line','arrow','diamond','triangle','callout','speech'].includes(tool)){const extra=TEXTABLE_TYPES.includes(tool)?{html:'',text:'',textColor:ui.textColor.value,fontSize:+ui.fontSize.value||20,hAlign:'center',vAlign:'middle',textRotation:0,autoScaleText:true}:{}; drawing=makeObj(tool,p.x,p.y,1,1,extra); panel().objects.push(drawing); setSingleSelection(drawing.id); render(); return} if(tool==='pen'){drawing={id:id(),type:'path',d:`M ${p.x} ${p.y}`,x:p.x,y:p.y,w:1,h:1,locked:false,...style()}; panel().objects.push(drawing); setSingleSelection(drawing.id); return} if(tool==='text'){const obj=makeObj('text',p.x,p.y,240,80,{fill:'none',stroke:'none',html:'',text:'',fontSize:+ui.fontSize.value||24,textColor:ui.textColor.value,hAlign:'left',vAlign:'top',autoScaleText:true}); addObj(obj); openInlineTextEditor(obj.id); return} if(tool==='sticky'){const obj=makeObj('sticky',p.x,p.y,180,160,{fill:ui.stickyColor.value,stroke:'#111827',strokeWidth:1,html:'',text:'',fontSize:+ui.fontSize.value||16,textColor:ui.textColor.value,autoScaleText:true,imageSrc:''}); addObj(obj); openInlineTextEditor(obj.id); return} if(tool==='comment'){const obj=makeObj('comment',p.x,p.y,220,120,{fill:'#fff7e6',stroke:'#f59e0b',strokeWidth:2,html:'',text:'',fontSize:16,textColor:'#111827',resolved:false}); addObj(obj); openInlineTextEditor(obj.id); return} if(tool==='audio'){addObj(makeObj('audio',p.x,p.y,220,100,{fill:'#eff6ff',stroke:'#93c5fd',strokeWidth:2,html:'',text:'',fontSize:18,textColor:'#111827',audioSrc:'',audioName:''})); return} if(tool==='connector'){connectorPendingFrom=null; setStatus('Connector: click first shape, then second shape.'); return}});

/* v2.5: pointermove uses requestRender (RAF coalescing). */
let lastCursorBroadcast=0;
svg.addEventListener('pointermove',e=>{const p=pt(e); const now=performance.now(); if(localChannel && now-lastCursorBroadcast>50){ broadcastCursor(p.x,p.y); lastCursorBroadcast=now } if(marquee&&marquee.active){marquee.x2=p.x; marquee.y2=p.y; requestRender(); return} if(drag){if(drag.resize){const o=findObj(drag.ids[0]); if(!o)return; o.x=drag.ox; o.y=drag.oy; o.w=Math.max(20,drag.ow+(p.x-drag.sx)); o.h=Math.max(20,drag.oh+(p.y-drag.sy)); if(TEXTABLE_TYPES.includes(o.type)&&o.autoScaleText){const s=Math.min(o.w/drag.ow,o.h/drag.oh); o.fontSize=clamp(Math.round(drag.ofontSize*s),8,96)} requestRender(); return}else{const dx=p.x-drag.startX,dy=p.y-drag.startY; drag.starts.forEach(s=>{const o=findObj(s.id); if(!o||o.locked||o.type==='connector')return; o.x=s.x+dx; o.y=s.y+dy}); requestRender(); return}} if(drawing){if(drawing.type==='laser'){drawing.d+=` L ${p.x} ${p.y}`; if(drawing._laserPath) drawing._laserPath.setAttribute('d',drawing.d); return} if(drawing.type==='path'){drawing.d+=` L ${p.x} ${p.y}`; drawing.w=Math.max(drawing.w,p.x-drawing.x); drawing.h=Math.max(drawing.h,p.y-drawing.y)} else {drawing.w=p.x-drawing.x; drawing.h=p.y-drawing.y} requestRender()}});

window.addEventListener('pointerup',()=>{if(marquee&&marquee.active){const m={x:Math.min(marquee.x1,marquee.x2),y:Math.min(marquee.y1,marquee.y2),w:Math.abs(marquee.x2-marquee.x1),h:Math.abs(marquee.y2-marquee.y1)}; selectedIds=panel().objects.filter(o=>{const b=normBox(o); return !(board.assignmentMode&&board.mode==='student'&&o.layer==='teacher') && b.x<=m.x+m.w && b.x+b.w>=m.x && b.y<=m.y+m.h && b.y+b.h>=m.y}).map(o=>o.id); marquee=null; render(); return} if(drawing&&drawing.type==='laser'){const path=drawing._laserPath; if(path){setTimeout(()=>{path.style.transition='opacity 1.2s ease-out'; path.style.opacity='0'; setTimeout(()=>path.remove(),1300)},1500)} drawing=null; return} if(drawing)normalizeObject(drawing); if(drag) drag.ids.forEach(i=>normalizeObject(findObj(i))); if(drag||drawing)saveState(); drag=null; drawing=null; render()});

function addObj(o){panel().objects.push(o); setSingleSelection(o.id); render(); saveState()}
function cleanupConnectors(ids){panel().objects=panel().objects.filter(o=>o.type!=='connector'||(!ids.includes(o.id)&&!ids.includes(o.fromId)&&!ids.includes(o.toId)))}
function deleteSelected(){if(!selectedIds.length)return; const editable=selectedIds.filter(idv=>canEditObject(findObj(idv))); cleanupConnectors(editable); panel().objects=panel().objects.filter(o=>!editable.includes(o.id)); clearSelection(); render(); saveState()}
function duplicateSelected(){if(!selectedIds.length)return; const copies=[], map={}; selectedIds.forEach(sel=>{const o=findObj(sel); if(!o||o.type==='connector'||!canEditObject(o))return; const c=JSON.parse(JSON.stringify(o)); c.id=id(); c.x+=24; c.y+=24; if(board.assignmentMode&&board.mode==='student') c.layer='student'; map[o.id]=c.id; copies.push(c)}); panel().objects.push(...copies); selectedIds=copies.map(c=>c.id); render(); saveState()}
function copySelection(){if(!selectedIds.length)return; const list=panel().objects.filter(o=>selectedIds.includes(o.id) && o.type!=='connector').map(o=>JSON.parse(JSON.stringify(o))); const selSet=new Set(list.map(o=>o.id)); const connectors=panel().objects.filter(o=>o.type==='connector'&&selSet.has(o.fromId)&&selSet.has(o.toId)).map(o=>JSON.parse(JSON.stringify(o))); clipboard={objects:list,connectors}; setStatus('Selection copied.','success')}
function pasteClipboard(){if(!clipboard||!clipboard.objects?.length)return; const idMap={}, items=[]; clipboard.objects.forEach(o=>{const c=JSON.parse(JSON.stringify(o)); idMap[o.id]=id(); c.id=idMap[o.id]; c.x+=28; c.y+=28; if(board.assignmentMode&&board.mode==='student') c.layer='student'; items.push(c)}); clipboard.connectors?.forEach(o=>{const c=JSON.parse(JSON.stringify(o)); c.id=id(); c.fromId=idMap[o.fromId]; c.toId=idMap[o.toId]; if(c.fromId&&c.toId) items.push(c)}); panel().objects.push(...items); selectedIds=items.filter(o=>o.type!=='connector').map(o=>o.id); render(); saveState()}
function groupSelected(){const ids=selectedIds.filter(idv=>findObj(idv)?.type!=='connector'); if(ids.length<2)return; const gidv='grp_'+id(); ids.forEach(i=>{const o=findObj(i); if(o) o.groupId=gidv}); render(); saveState(); setStatus('Grouped '+ids.length+' items.','success')}
function ungroupSelected(){const gids=[...new Set(selectedIds.map(i=>findObj(i)?.groupId).filter(Boolean))]; if(!gids.length)return; panel().objects.forEach(o=>{if(gids.includes(o.groupId)) delete o.groupId}); render(); saveState(); setStatus('Ungrouped selection.','success')}
function selectCurrentGroup(){const o=currentObj(); if(!o) return setStatus('Select an item first.','danger'); if(!o.groupId){selectedIds=[o.id]; render(); return setStatus('This item is not grouped.','danger')} selectedIds=groupMembers(o); render(); setStatus('Group selected.','success')}

document.addEventListener('keydown',e=>{const tag=(e.target&&e.target.tagName?e.target.tagName.toLowerCase():'');if(tag==='textarea'||tag==='input'||e.target?.isContentEditable)return; const meta=e.ctrlKey||e.metaKey; const o=currentObj();
  if(!meta&&!e.altKey&&e.key==='?'&&!e.shiftKey){/* shift+/ on US */}
  if(!meta&&!e.altKey&&(e.key==='?'||(e.shiftKey&&e.key==='/'))){e.preventDefault(); openShortcutsDialog(); return}
  if(!meta&&!e.altKey&&selectedIds.length===1&&o&&TEXTABLE_TYPES.includes(o.type)&&canEditObject(o)){if(e.key==='Enter'){e.preventDefault(); openInlineTextEditor(o.id); return} if(e.key.length===1){e.preventDefault(); openInlineTextEditor(o.id,e.key); return}}
  if(e.key==='Delete'||e.key==='Backspace')deleteSelected();
  if(meta&&e.key.toLowerCase()==='d'){e.preventDefault(); duplicateSelected()}
  if(meta&&e.key.toLowerCase()==='c'){e.preventDefault(); copySelection()}
  if(meta&&e.key.toLowerCase()==='v'){e.preventDefault(); pasteClipboard()}
  if(meta&&e.key.toLowerCase()==='g'){e.preventDefault(); if(e.shiftKey) ungroupSelected(); else groupSelected()}
  if(meta&&e.key.toLowerCase()==='z'){e.preventDefault(); e.shiftKey?redo():undo()}
});

gid('toolButtons').addEventListener('click',e=>{const btn=e.target.closest('[data-tool]'); if(btn&&gid('toolButtons').contains(btn)&&!btn.classList.contains('simple-hidden')){setTool(btn.dataset.tool)}});
document.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{panel().bg=b.dataset.bg; render(); saveState()});

function buildStickerUI(){ui.stickerSelect.innerHTML=STICKERS.map(s=>`<option value="${s.id}">${s.label}</option>`).join(''); const grid=gid('stickerGrid'); grid.innerHTML=STICKERS.map(s=>`<button class="sticker-tile" data-sticker="${esc(s.id)}" aria-label="${esc(s.label)}"><span class="sticker-icon" style="background:${esc(s.bg)}">${s.icon}</span><span>${esc(s.label)}</span></button>`).join(''); grid.querySelectorAll('[data-sticker]').forEach(btn=>btn.onclick=()=>{ui.stickerSelect.value=btn.dataset.sticker; insertSticker(btn.dataset.sticker); gid('stickerDialog').close()})}
function insertSticker(idv){const s=STICKERS.find(x=>x.id===idv)||STICKERS[0]; addObj(makeObj('stamp',90,90,88,88,{stampId:s.id,stampIcon:s.icon,stampLabel:s.label,stampBg:s.bg,fill:'none',stroke:'none',strokeWidth:0}))}
gid('openStickerLibraryBtn').onclick=()=>gid('stickerDialog').showModal();
gid('insertStickerBtn').onclick=()=>insertSticker(ui.stickerSelect.value);
gid('closeStickerDialog').onclick=()=>gid('stickerDialog').close();
buildStickerUI();

gid('imageBtn').onclick=()=>gid('imageInput').click();
gid('imageInput').onchange=async e=>{const f=e.target.files[0]; if(!f)return; if(!(await validateImageDeep(f))){e.target.value='';return} const r=new FileReader(); r.onload=()=>addObj(makeObj('image',80,80,320,220,{src:r.result,fill:'none',stroke:'#000',strokeWidth:1})); r.readAsDataURL(f); e.target.value=''};
gid('stickyImageInput').onchange=async e=>{const f=e.target.files[0], o=currentObj(); if(!f||!o||o.type!=='sticky') return; if(!(await validateImageDeep(f))){e.target.value='';return} const r=new FileReader(); r.onload=()=>{o.imageSrc=r.result; render(); saveState()}; r.readAsDataURL(f); e.target.value=''};
gid('customStickerInput').onchange=async e=>{const f=e.target.files[0]; if(!f) return; if(!(await validateImageDeep(f))){e.target.value='';return} const r=new FileReader(); r.onload=()=>addObj(makeObj('stamp',90,90,104,104,{stampLabel:(f.name||'Sticker').replace(/\.[^.]+$/,''),stampBg:'#ffffff',stampSrc:r.result,fill:'none',stroke:'none',strokeWidth:0})); r.readAsDataURL(f); e.target.value=''};
gid('audioInput').onchange=e=>{const f=e.target.files[0], o=currentObj(); if(!f||!o||o.type!=='audio') return; if(!validateUpload(f,'audio')){e.target.value='';return} const r=new FileReader(); r.onload=()=>setAudioOnCurrent(r.result,f.name||'Audio file'); r.readAsDataURL(f); e.target.value=''};
function compressImageForBg(file,maxDim=1600,quality=0.85){return new Promise((resolve,reject)=>{const fr=new FileReader(); fr.onload=()=>{const img=new Image(); img.onload=()=>{const scale=Math.min(1,maxDim/Math.max(img.width,img.height)); const w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale)); const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const cx=cv.getContext('2d'); cx.drawImage(img,0,0,w,h); resolve(cv.toDataURL('image/jpeg',quality))}; img.onerror=()=>reject(new Error('decode failed')); img.src=fr.result}; fr.onerror=()=>reject(new Error('read failed')); fr.readAsDataURL(file)})}
gid('loadBgImageBtn').onclick=()=>gid('bgImageInput').click();
gid('clearBgImageBtn').onclick=()=>{if(!panel().bgImage) return; panel().bgImage=''; render(); saveState(); setStatus('Background cleared.','success')};
gid('bgImageInput').onchange=async e=>{const f=e.target.files[0]; if(!f) return; if(!(await validateImageDeep(f))){e.target.value=''; return} try{const data=await compressImageForBg(f); panel().bgImage=data; render(); saveState(); setStatus('Background image set.','success')}catch(err){setStatus('Background image failed. '+err.message,'danger')} e.target.value=''};

gid('inlineTextSaveBtn').onclick=()=>commitInlineTextEditor(true);
gid('inlineTextCancelBtn').onclick=()=>commitInlineTextEditor(false);
gid('inlineTextEditor').addEventListener('input',()=>updateInlineTextObject(true));
gid('inlineTextEditor').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault(); commitInlineTextEditor(true)} if(e.key==='Escape'){e.preventDefault(); commitInlineTextEditor(false)}});
gid('inlineTextEditor').addEventListener('blur',()=>{if(inlineEditId) commitInlineTextEditor(true)});

if(ui.workspaceMode){ui.workspaceMode.value=localStorage.getItem('drawsplat.workspaceMode')||'productivity'; ui.workspaceMode.addEventListener('change',()=>applyWorkspaceMode(ui.workspaceMode.value))}
if(ui.interfaceMode){ui.interfaceMode.value=localStorage.getItem('drawsplat.interfaceMode')||'simple'; ui.interfaceMode.addEventListener('change',()=>{applyInterfaceMode(ui.interfaceMode.value); refreshViewToggle()})}

gid('deleteBtn').onclick=deleteSelected;
gid('duplicateBtn').onclick=duplicateSelected;
gid('groupBtn').onclick=groupSelected;
gid('ungroupBtn').onclick=ungroupSelected;
gid('selectGroupBtn').onclick=selectCurrentGroup;
gid('attachStickyImageBtn').onclick=()=>{const o=currentObj(); if(!o||o.type!=='sticky'){setStatus('Select a sticky note first.','danger'); return} gid('stickyImageInput').click()};
gid('toggleCommentResolvedBtn').onclick=()=>{const o=currentObj(); if(!o||o.type!=='comment'){setStatus('Select a comment pin first.','danger'); return} o.resolved=!o.resolved; render(); saveState()};
gid('recordAudioBtn').onclick=()=>startAudioRecording();
gid('loadAudioBtn').onclick=()=>{const o=currentObj(); if(!o||o.type!=='audio') return setStatus('Select an audio note first.','danger'); gid('audioInput').click()};
gid('playAudioBtn').onclick=()=>playSelectedAudio();
gid('answerKeyBtn').onclick=()=>{const editable=selectedIds.map(idv=>findObj(idv)).filter(o=>o&&canEditObject(o)); if(!editable.length) return setStatus('Select one or more editable objects first.','danger'); const next=!editable.every(o=>o.answerKey); editable.forEach(o=>o.answerKey=next); render(); saveState(); setStatus(next?'Marked as answer key.':'Removed from answer key.','success')};
gid('frontBtn').onclick=()=>{if(!selectedIds.length)return; const sel=panel().objects.filter(o=>selectedIds.includes(o.id)), others=panel().objects.filter(o=>!selectedIds.includes(o.id)); panel().objects=[...others,...sel]; render(); saveState()};
gid('backBtn').onclick=()=>{if(!selectedIds.length)return; const sel=panel().objects.filter(o=>selectedIds.includes(o.id)), others=panel().objects.filter(o=>!selectedIds.includes(o.id)); panel().objects=[...sel,...others]; render(); saveState()};
gid('refreshModerationBtn').onclick=()=>openModerationDashboard();
gid('openModerationBtn').onclick=()=>openModerationDashboard();
gid('closeModerationDialog').onclick=()=>gid('moderationDialog').close();
gid('tntBtn').onclick=()=>runTntReset();
gid('lockBtn').onclick=()=>{selectedIds.forEach(i=>{const o=findObj(i); if(o) o.locked=true}); render(); saveState()};
gid('unlockBtn').onclick=()=>{selectedIds.forEach(i=>{const o=findObj(i); if(o) o.locked=false}); render(); saveState()};
gid('noFillBtn').onclick=()=>{fillEnabled=!fillEnabled; gid('noFillBtn').textContent=fillEnabled?'No fill':'Use fill'};
gid('createCustomStickerBtn').onclick=()=>gid('customStickerInput').click();

['strokeColor','strokeWidth','fillColor','opacity','fillPattern'].forEach(k=>gid(k).addEventListener('input',()=>{selectedIds.forEach(idv=>{const o=findObj(idv); if(o&&!o.locked&&o.type!=='connector') Object.assign(o,style())}); const c=currentObj(); if(c&&c.type==='sticky') c.fill=ui.stickyColor.value; render(); saveState()}));
ui.stickyColor.addEventListener('change',()=>{selectedIds.forEach(idv=>{const o=findObj(idv); if(o&&o.type==='sticky') o.fill=ui.stickyColor.value}); render(); saveState()});
ui.fontSize.addEventListener('input',()=>{ui.fontSizeValue.textContent=ui.fontSize.value+'px'; const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.fontSize=+ui.fontSize.value; render(); saveState()}});
ui.textColor.addEventListener('input',()=>{const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.textColor=ui.textColor.value; render(); saveState()}});
ui.textRotation.addEventListener('input',()=>{ui.textRotationValue.textContent=ui.textRotation.value+'°'; const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.textRotation=+ui.textRotation.value; render(); saveState()}});
ui.autoScaleText.addEventListener('change',()=>{const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.autoScaleText=ui.autoScaleText.checked; saveState()}});

document.querySelectorAll('.editor-toolbar [data-cmd]').forEach(btn=>btn.onclick=()=>{ui.richEditor.focus(); document.execCommand(btn.dataset.cmd,false,null)});
gid('clearFormattingBtn').onclick=()=>{ui.richEditor.focus(); document.execCommand('removeFormat',false,null)};
document.querySelectorAll('[data-axis="h"]').forEach(btn=>btn.onclick=()=>{const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.hAlign=btn.dataset.align; markAlignButtons(); render(); saveState()}});
document.querySelectorAll('[data-axis="v"]').forEach(btn=>btn.onclick=()=>{const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.vAlign=btn.dataset.align; markAlignButtons(); render(); saveState()}});
function markAlignButtons(){const o=currentObj(); document.querySelectorAll('[data-axis="h"]').forEach(btn=>btn.classList.toggle('active',selectedIds.length===1&&o&&o.hAlign===btn.dataset.align)); document.querySelectorAll('[data-axis="v"]').forEach(btn=>btn.classList.toggle('active',selectedIds.length===1&&o&&o.vAlign===btn.dataset.align))}

function updateInspector(){const info=gid('selectedInfo'), wrap=gid('textEditorWrap'); if(!selectedIds.length){info.textContent='No object selected.'; wrap.hidden=true; gid('answerKeyBtn').textContent='Toggle Answer Key'; return} if(selectedIds.length>1){info.innerHTML=`<b>${esc(selectedIds.length)} items selected</b><br>${esc('Use group drag, group/ungroup, delete, duplicate, and front/back ordering.')}`; wrap.hidden=true; gid('answerKeyBtn').textContent='Toggle Answer Key'; return} const o=currentObj(), b=normBox(o); info.innerHTML=`<b>${esc(o.type)}</b><br>${Math.round(b.x)}, ${Math.round(b.y)} · ${Math.round(b.w)} × ${Math.round(b.h)}${o.groupId?' · grouped':''}${o.locked?' · locked':''}${o.layer?' · layer: '+esc(o.layer):''}${o.answerKey?' · answer key':''}${o.audioSrc?' · has audio':''}`; if(ui.fillPattern && typeof o.fillPattern!=='undefined') ui.fillPattern.value=o.fillPattern||''; gid('answerKeyBtn').textContent=o.answerKey?'Remove Answer Key':'Mark Answer Key'; wrap.hidden=!TEXTABLE_TYPES.includes(o.type); if(!wrap.hidden){const ph=o.type==='sticky'?'Add note...':(o.type==='audio'?'Voice note':(o.type==='comment'?'Add feedback...':(o.type==='text'?'Type here':'Type text'))); ui.richEditor.dataset.placeholder=ph; if(document.activeElement!==ui.richEditor){const desired=o.html||''; if(ui.richEditor.innerHTML!==desired) ui.richEditor.innerHTML=desired} refreshRichEditorEmpty(); setInputIfIdle(ui.textColor,o.textColor||'#111827'); setInputIfIdle(ui.fontSize,String(o.fontSize||20)); ui.fontSizeValue.textContent=(o.fontSize||20)+'px'; setInputIfIdle(ui.textRotation,String(o.textRotation||0)); ui.textRotationValue.textContent=(o.textRotation||0)+'°'; ui.autoScaleText.checked=!!o.autoScaleText; markAlignButtons()}}
function refreshRichEditorEmpty(){if(!ui.richEditor) return; const txt=(ui.richEditor.textContent||'').replace(/ /g,' ').trim(); ui.richEditor.dataset.empty=txt===''?'true':'false'}

gid('applyTextBtn').onclick=()=>{const o=currentObj(); if(o&&selectedIds.length===1){o.html=cleanEditorHtml(ui.richEditor.innerHTML); o.text=htmlToPlainText(o.html); o.textColor=ui.textColor.value; o.fontSize=+ui.fontSize.value; o.textRotation=+ui.textRotation.value; o.autoScaleText=ui.autoScaleText.checked; render(); saveState()}};
ui.richEditor.addEventListener('input',()=>{const o=currentObj(); if(o&&TEXTABLE_TYPES.includes(o.type)&&selectedIds.length===1){o.html=cleanEditorHtml(ui.richEditor.innerHTML); o.text=htmlToPlainText(o.html); saveState(false)} refreshRichEditorEmpty()});
ui.richEditor.addEventListener('blur',refreshRichEditorEmpty);

ui.boardTitle.oninput=()=>{board.title=ui.boardTitle.value; saveState(false)};
ui.className.oninput=()=>{board.className=ui.className.value; saveState(false)};
ui.studentName.oninput=()=>{board.studentName=ui.studentName.value; saveState(false)};
ui.userMode.onchange=()=>{board.mode=ui.userMode.value; if(board.mode==='student'&&!board.assignmentMode) board.showAnswerKey=false; applyModeUI(); saveState(false); render()};
ui.assignmentModeToggle.onchange=()=>{board.assignmentMode=ui.assignmentModeToggle.checked; if(board.assignmentMode && board.currentLayer==='shared') board.currentLayer='teacher'; if(!board.assignmentMode) board.currentLayer='shared'; render(); saveState()};
ui.activeLayerSelect.onchange=()=>{board.currentLayer=ui.activeLayerSelect.value; render(); saveState(false)};
ui.showAnswerKeyToggle.onchange=()=>{board.showAnswerKey=ui.showAnswerKeyToggle.checked; render(); saveState(false)};
function applyModeUI(){document.querySelectorAll('.teacher-only').forEach(el=>el.classList.toggle('hidden-by-mode',board.mode==='student')); ui.assignmentModeToggle.disabled=board.mode==='student'; ui.activeLayerSelect.disabled=board.mode==='student' || !board.assignmentMode; ui.showAnswerKeyToggle.disabled=(board.mode==='student'); if(board.mode==='student'&&board.assignmentMode) ui.layerBadge.textContent='Layer: Student'}

function addPanel(){ensureActivePanel(); resetInteractionState(); const newPanel={id:'panel_'+id(),name:'Panel '+(board.panels.length+1),bg:'grid',objects:[]}; board.panels.push(newPanel); board.active=board.panels.length-1; render(); saveState(); setStatus('Added '+newPanel.name+'.','success')}
gid('addPanelBtn').onclick=addPanel;
gid('frameNavPrev')?.addEventListener('click',()=>{if(board.active>0) switchPanel(board.panels[board.active-1].id)});
gid('frameNavNext')?.addEventListener('click',()=>{if(board.active<board.panels.length-1) switchPanel(board.panels[board.active+1].id)});
gid('frameNavAdd')?.addEventListener('click',addPanel);
gid('clearFrameBtn')?.addEventListener('click',()=>{if(confirm('Clear this frame?')){panel().objects=[]; clearSelection(); render(); saveState(); setStatus('Frame cleared.','success')}});
gid('bgSelectSimple')?.addEventListener('change',e=>{panel().bg=e.target.value; render(); saveState()});
gid('moreOptionsBtn')?.addEventListener('click',()=>gid('moreOptionsDialog').showModal());
gid('closeMoreOptions')?.addEventListener('click',()=>gid('moreOptionsDialog').close());
['saveLocalBtn','loadLocalBtn','exportBtn','exportPdfBtn','saveDriveBtn','loadDriveBtn','deletePanelBtn','tntBtn'].forEach(target=>{const m=gid('more_'+target); if(m) m.onclick=()=>{gid('moreOptionsDialog').close(); gid(target)?.click()}});
gid('simpleImageBtn')?.addEventListener('click',()=>gid('imageBtn').click());
gid('simpleTntBtn')?.addEventListener('click',()=>gid('tntBtn').click());
gid('simpleBgImageBtn')?.addEventListener('click',()=>gid('loadBgImageBtn').click());
gid('simpleClearBgBtn')?.addEventListener('click',()=>gid('clearBgImageBtn').click());
function refreshViewToggle(){const btn=gid('viewToggleBtn'); if(!btn) return; const m=ui.interfaceMode?.value||'simple'; const text=m==='simple'?'Simple':'Advanced'; const lbl=btn.querySelector('.icon-label'); if(lbl) lbl.textContent=text; else btn.textContent=text; const tip=m==='simple'?'Switch to Advanced view':'Switch to Simple view'; btn.setAttribute('title',tip); btn.setAttribute('aria-label',tip)}
gid('viewToggleBtn')?.addEventListener('click',()=>{const next=(ui.interfaceMode?.value||'simple')==='simple'?'advanced':'simple'; if(ui.interfaceMode) ui.interfaceMode.value=next; applyInterfaceMode(next); refreshViewToggle()});
function refreshFrameNav(){const c=gid('frameCounter'); if(c) c.textContent=(board.active+1)+' of '+board.panels.length; const bs=gid('bgSelectSimple'); if(bs) bs.value=panel().bg||'grid'}
gid('renamePanelBtn').onclick=()=>{const n=prompt('Panel name:',panel().name); if(n){panel().name=n; render(); saveState()}};
gid('deletePanelBtn').onclick=()=>{if(board.panels.length<2)return alert('Keep at least one panel.'); const deletedId=panel().id; board.panels=board.panels.filter(p=>p.id!==deletedId); board.active=Math.max(0,Math.min(board.active,board.panels.length-1)); resetInteractionState(); render(); saveState(); setStatus('Panel deleted.','success')};
gid('clearPanelBtn').onclick=()=>{if(confirm('Clear this panel?')){panel().objects=[]; clearSelection(); render(); saveState()}};
gid('zoomInBtn').onclick=()=>{zoom=Math.min(2,zoom+.1); render()};
gid('zoomOutBtn').onclick=()=>{zoom=Math.max(.4,zoom-.1); render()};
gid('zoomResetBtn').onclick=()=>{zoom=1; render()};

function connectorEndpoints(o){const a=findObj(o.fromId),b=findObj(o.toId); if(!a||!b)return{x1:0,y1:0,x2:0,y2:0}; const ba=normBox(a),bb=normBox(b),p1=edgePoint(ba,bb.cx,bb.cy,a.type),p2=edgePoint(bb,ba.cx,ba.cy,b.type); return{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y}}
function edgePoint(box,tx,ty,type){const cx=box.cx,cy=box.cy,dx=tx-cx,dy=ty-cy; if(type==='ellipse'){const rx=Math.max(1,box.w/2),ry=Math.max(1,box.h/2),s=1/Math.sqrt((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)||1); return{x:cx+dx*s,y:cy+dy*s}} const hw=box.w/2,hh=box.h/2,s=Math.min(dx===0?1e9:hw/Math.abs(dx),dy===0?1e9:hh/Math.abs(dy)); return{x:cx+dx*s,y:cy+dy*s}}

async function exportCanvas(){const keep=[...selectedIds]; clearSelection(); render(); const clone=svg.cloneNode(true); clone.setAttribute('width',svg.clientWidth); clone.setAttribute('height',svg.clientHeight); const data='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone)), img=new Image(); await new Promise((res,rej)=>{img.onload=res; img.onerror=rej; img.src=data}); const c=document.createElement('canvas'); c.width=svg.clientWidth*2; c.height=svg.clientHeight*2; const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.scale(2,2); ctx.drawImage(img,0,0); selectedIds=keep; render(); return c}
async function exportPng(){return (await exportCanvas()).toDataURL('image/png')}
gid('exportBtn').onclick=async()=>download(await exportPng(),(board.title||'drawsplat').replace(/\W+/g,'-')+'.png');
gid('exportPdfBtn').onclick=async()=>{const canvas=await exportCanvas(); const pdfBlob=canvasToPdfBlob(canvas); download(URL.createObjectURL(pdfBlob),(board.title||'drawsplat').replace(/\W+/g,'-')+'.pdf',true)};
function download(data,name,isBlobUrl){const a=document.createElement('a'); a.href=data; a.download=name; document.body.appendChild(a); a.click(); a.remove(); if(isBlobUrl) setTimeout(()=>URL.revokeObjectURL(data),2000)}
function canvasToPdfBlob(canvas){const jpegData=canvas.toDataURL('image/jpeg',0.92); const bin=atob(jpegData.split(',')[1]); const imgBytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) imgBytes[i]=bin.charCodeAt(i); const W=canvas.width, H=canvas.height; const pageW=612, pageH=Math.max(200,Math.round(pageW*(H/W))); const content=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ`; const enc=new TextEncoder(); const parts=[]; const add=s=>parts.push(enc.encode(s)); add('%PDF-1.4\n'); const offsets=[0]; let len=parts[0].length; function pushObj(str,binArr){offsets.push(len); const head=enc.encode(str); parts.push(head); len+=head.length; if(binArr){parts.push(binArr); len+=binArr.length; const tail=enc.encode('\nendstream\nendobj\n'); parts.push(tail); len+=tail.length}} add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'); add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'); add(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`); offsets.push(len); const o4h=enc.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`); parts.push(o4h); len+=o4h.length; parts.push(imgBytes); len+=imgBytes.length; const o4t=enc.encode('\nendstream\nendobj\n'); parts.push(o4t); len+=o4t.length; offsets.push(len); const contBytes=enc.encode(content); const o5h=enc.encode(`5 0 obj\n<< /Length ${contBytes.length} >>\nstream\n`); parts.push(o5h); len+=o5h.length; parts.push(contBytes); len+=contBytes.length; const o5t=enc.encode('\nendstream\nendobj\n'); parts.push(o5t); len+=o5t.length; const xrefStart=len; const count=6; let xref='xref\n0 '+count+'\n0000000000 65535 f \n'; for(let i=1;i<count;i++) xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n'; xref+=`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`; parts.push(enc.encode(xref)); return new Blob(parts,{type:'application/pdf'}) }

/* v2.5: IndexedDB autosave fallback when localStorage hits quota. */
const IDB_DB='drawsplat',IDB_STORE='kv',IDB_KEY='autosave';
let idbReady=null;
function openIdb(){
  if(idbReady) return idbReady;
  idbReady=new Promise((resolve,reject)=>{
    const req=indexedDB.open(IDB_DB,1);
    req.onupgradeneeded=()=>{ req.result.createObjectStore(IDB_STORE) };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return idbReady;
}
async function idbPut(value){try{const db=await openIdb(); return new Promise((resolve,reject)=>{ const tx=db.transaction(IDB_STORE,'readwrite'); tx.objectStore(IDB_STORE).put(value,IDB_KEY); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error) })}catch(_){}}
async function idbGet(){try{const db=await openIdb(); return new Promise((resolve)=>{ const tx=db.transaction(IDB_STORE,'readonly'); const r=tx.objectStore(IDB_STORE).get(IDB_KEY); r.onsuccess=()=>resolve(r.result||null); r.onerror=()=>resolve(null) })}catch(_){return null}}

function cloneBoardForRestore(){const c=JSON.parse(JSON.stringify(board)); c.restorePoints=[]; return c}
function snapshot(){return JSON.stringify(board)}
function persistLocal(){
  const snap=snapshot();
  try{ localStorage.setItem('drawsplat.autosave',snap) }
  catch(err){ idbPut(snap) /* falls back when localStorage quota exceeds */ }
  /* always mirror to IDB on big boards so a future load works even if LS was wiped. */
  if(snap.length>2_000_000) idbPut(snap);
}
function initHistory(){const snap=snapshot(); history=[snap]; future=[]; lastSnapshot=snap}
function saveState(pushHistory=true){persistLocal(); if(pushHistory){const snap=snapshot(); if(snap!==lastSnapshot){history.push(snap); if(history.length>50) history.shift(); future=[]; lastSnapshot=snap}} broadcastLocal(); pushCloudRoom()}
function undo(){if(history.length<2)return; future.push(history.pop()); board=JSON.parse(history[history.length-1]); migrateBoard(board); clearSelection(); connectorPendingFrom=null; lastSnapshot=history[history.length-1]; persistLocal(); render(); broadcastLocal()}
function redo(){if(!future.length)return; const snap=future.pop(); history.push(snap); board=JSON.parse(snap); migrateBoard(board); clearSelection(); connectorPendingFrom=null; lastSnapshot=snap; persistLocal(); render(); broadcastLocal()}
function refreshRestorePoints(){const pts=board.restorePoints||[]; ui.restorePointSelect.innerHTML=pts.map((p,i)=>`<option value="${i}">${esc(p.name)} — ${new Date(p.at).toLocaleString()}</option>`).join(''); ui.restorePointHint.textContent=pts.length?`${pts.length} restore point${pts.length===1?'':'s'} available.`:'No restore points yet.'}
function saveRestorePoint(){const name=prompt('Restore point name:','Checkpoint '+((board.restorePoints?.length||0)+1)); if(!name) return; board.restorePoints=board.restorePoints||[]; board.restorePoints.unshift({name,at:new Date().toISOString(),state:cloneBoardForRestore()}); board.restorePoints=board.restorePoints.slice(0,20); refreshRestorePoints(); saveState(); setStatus('Restore point saved.','success')}
function restoreSelectedPoint(){const idx=parseInt(ui.restorePointSelect.value||'-1',10); const pt=board.restorePoints?.[idx]; if(!pt) return setStatus('Choose a restore point first.','danger'); if(!confirm('Restore this checkpoint? Current unsaved work on the board will be replaced.')) return; const savedPoints=board.restorePoints; board=JSON.parse(JSON.stringify(pt.state)); migrateBoard(board); board.restorePoints=savedPoints; clearSelection(); initHistory(); render(); persistLocal(); setStatus('Restore point loaded.','success')}
gid('saveRestorePointBtn').onclick=saveRestorePoint;
gid('restorePointBtn').onclick=restoreSelectedPoint;
gid('undoBtn').onclick=undo;
gid('redoBtn').onclick=redo;

gid('saveLocalBtn').onclick=()=>download('data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(board,null,2)),(board.title||'drawsplat').replace(/\W+/g,'-')+'.drawsplat.json');
gid('loadLocalBtn').onclick=()=>gid('jsonInput').click();
gid('jsonInput').onchange=e=>{const f=e.target.files[0]; if(!f)return; if(f.size>MAX_BOARD_BYTES){setStatus('Board import blocked. Maximum board file size is '+Math.round(MAX_BOARD_BYTES/1024/1024)+' MB.','danger'); e.target.value=''; return} const r=new FileReader(); r.onload=()=>{try{const loaded=JSON.parse(r.result); board=loaded; migrateBoard(board); clearSelection(); initHistory(); render(); persistLocal(); setStatus('Board loaded.','success')}catch(err){setStatus('Board import failed. The file is not valid DrawSplat JSON.','danger')}}; r.readAsText(f); e.target.value=''};

function startLocalSync(){stopSync('local'); collabRoom=ui.collabRoom.value.trim(); if(!collabRoom)return setSyncStatus('Enter a room name first.','danger'); if(!('BroadcastChannel' in window))return setSyncStatus('This browser does not support local BroadcastChannel sync.','danger'); localChannel=new BroadcastChannel('drawsplat_'+collabRoom); localChannel.onmessage=(evt)=>{const m=evt.data||{}; if(!m||typeof m!=='object'||m.instanceId===instanceId)return; if(m.type==='board' && m.board && Array.isArray(m.board.panels)){board=m.board; migrateBoard(board); clearSelection(); connectorPendingFrom=null; persistLocal(); lastSnapshot=snapshot(); render(); setSyncStatus('Local sync active for room: '+collabRoom,'success')} if(m.type==='cursor' && m.cursor && typeof m.cursor.x==='number'){liveCursors[m.instanceId]={...m.cursor,ts:Date.now()}; requestRender()}}; setSyncStatus('Local sync active for room: '+collabRoom,'success'); broadcastLocal()}
function stopSync(which='both'){if((which==='both'||which==='local')&&localChannel){localChannel.close(); localChannel=null; liveCursors={}} if((which==='both'||which==='cloud')&&cloudTimer){clearInterval(cloudTimer); cloudTimer=null; lastCloudTs=''} if(which==='both') collabRoom=''; setSyncStatus('Sync stopped.'); if(ui.cursorStatus) ui.cursorStatus.textContent=''}
function broadcastLocal(){if(localChannel) localChannel.postMessage({type:'board',instanceId,room:collabRoom,board})}
function broadcastCursor(x,y){if(localChannel) localChannel.postMessage({type:'cursor',instanceId,room:collabRoom,cursor:{x,y,panel:board.active,name:presenceName(),color:cursorColorFor(instanceId)}})}

async function startCloudSync(){stopSync('cloud'); collabRoom=ui.collabRoom.value.trim(); const url=ui.scriptUrl.value.trim(); if(!collabRoom)return setSyncStatus('Enter a room name first.','danger'); if(!url)return setSyncStatus('Add your Google Apps Script URL for cloud sync.','danger'); await pullCloudRoom(true); cloudTimer=setInterval(()=>pullCloudRoom(false),4000); setSyncStatus('Cloud sync active for room: '+collabRoom,'success'); pushCloudRoom()}
let cloudPushPending=false;
async function pushCloudRoom(){if(!cloudTimer&& !ui.syncStatus.textContent.includes('Cloud sync active')) return; const url=ui.scriptUrl.value.trim(); if(!url||!collabRoom||cloudPushPending) return; cloudPushPending=true; try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'roomSave',room:collabRoom,instanceId,board})}); const out=await res.json(); if(out.ok && out.updatedAt) lastCloudTs=out.updatedAt}catch(err){} finally{cloudPushPending=false}}
async function pullCloudRoom(force){const url=ui.scriptUrl.value.trim(); if(!url||!collabRoom) return; try{const ref='?action=roomLoad&room='+encodeURIComponent(collabRoom)+(force?'':'&since='+encodeURIComponent(lastCloudTs||'')); const res=await fetch(url+ref); const out=await res.json(); if(out.ok && out.board && out.updatedAt && out.updatedAt!==lastCloudTs && out.instanceId!==instanceId){board=out.board; migrateBoard(board); clearSelection(); connectorPendingFrom=null; persistLocal(); lastSnapshot=snapshot(); lastCloudTs=out.updatedAt; render(); setSyncStatus('Cloud sync active for room: '+collabRoom,'success')} else if(out.ok && out.updatedAt){lastCloudTs=out.updatedAt}}catch(err){setSyncStatus('Cloud sync error: '+err.message,'danger')}}
gid('startSyncBtn').onclick=startLocalSync;
gid('startCloudSyncBtn').onclick=startCloudSync;
gid('stopSyncBtn').onclick=()=>stopSync('both');
gid('refreshCloudBtn').onclick=()=>pullCloudRoom(true);

function templateObjects(name){const objs=[]; const add=(o)=>objs.push(o);
  if(name==='frayer'){add(makeObj('rect',60,60,460,300,{fill:'#fff'})); add(makeObj('line',290,60,0,300,{fill:'none'})); add(makeObj('line',60,210,460,0,{fill:'none'})); add(makeObj('rect',180,20,220,40,{fill:'#FFF7E6',html:'Frayer Model',text:'Frayer Model',hAlign:'center',vAlign:'middle'})); [['Definition',80,90],['Characteristics',320,90],['Examples',80,240],['Non-Examples',320,240]].forEach(([t,x,y])=>add(makeObj('text',x,y,160,40,{fill:'none',stroke:'none',html:t,text:t,fontSize:22})))}
  if(name==='kwl'){add(makeObj('rect',50,70,540,290,{fill:'#fff'})); add(makeObj('line',230,70,0,290,{fill:'none'})); add(makeObj('line',410,70,0,290,{fill:'none'})); ['K','W','L'].forEach((t,i)=>add(makeObj('rect',50+i*180,20,180,50,{fill:'#FFF7E6',html:t,text:t,hAlign:'center',vAlign:'middle',fontSize:26})))}
  if(name==='tchart'){add(makeObj('line',320,70,0,280,{fill:'none',strokeWidth:5})); add(makeObj('line',80,70,480,0,{fill:'none',strokeWidth:5})); add(makeObj('text',90,20,200,40,{fill:'none',stroke:'none',html:'Side A',text:'Side A',fontSize:24})); add(makeObj('text',350,20,200,40,{fill:'none',stroke:'none',html:'Side B',text:'Side B',fontSize:24}))}
  if(name==='storyboard'){for(let i=0;i<4;i++){const x=50+(i%2)*290,y=50+Math.floor(i/2)*190; add(makeObj('rect',x,y,240,140,{fill:'#fff'})); add(makeObj('text',x+10,y+145,220,30,{fill:'none',stroke:'none',html:'Caption',text:'Caption',fontSize:18}))}}
  if(name==='venn'){add(makeObj('ellipse',120,90,220,200,{fill:'#dbeafe'})); add(makeObj('ellipse',260,90,220,200,{fill:'#fde68a'})); add(makeObj('text',150,120,100,30,{fill:'none',stroke:'none',html:'A',text:'A',fontSize:28})); add(makeObj('text',380,120,100,30,{fill:'none',stroke:'none',html:'B',text:'B',fontSize:28})); add(makeObj('text',260,170,80,30,{fill:'none',stroke:'none',html:'Both',text:'Both',fontSize:22,hAlign:'center'}))}
  if(name==='brainstorm'){add(makeObj('ellipse',230,140,180,100,{fill:'#FFF7E6',html:'Main Idea',text:'Main Idea',hAlign:'center',vAlign:'middle'})); [[80,40],[420,40],[40,230],[460,230],[220,280]].forEach((p,i)=>{add(makeObj('sticky',p[0],p[1],120,90,{fill:['#fff59d','#bae6fd','#bbf7d0','#fecdd3','#fed7aa'][i%5],html:'Idea',text:'Idea'})); add(makeObj('connector',0,0,0,0,{fromId:objs[0]?.id||'',toId:objs[objs.length-1].id,fill:'none'}))})}
  if(name==='timeline'){add(makeObj('line',80,220,500,0,{fill:'none',strokeWidth:5})); for(let i=0;i<5;i++){const x=100+i*110; add(makeObj('ellipse',x,200,20,20,{fill:'#1E398D'})); add(makeObj('text',x-30,150,80,40,{fill:'none',stroke:'none',html:'Event '+(i+1),text:'Event '+(i+1),fontSize:18,hAlign:'center'}))}}
  return objs}
function insertTemplate(newPanel){const name=ui.templateSelect.value; if(newPanel) addPanel(); const objects=templateObjects(name); const groupId='grp_tpl_'+id(); objects.forEach(o=>{o.groupId=groupId; if(board.assignmentMode&&board.mode==='teacher'&&board.currentLayer==='shared') o.layer='teacher'}); panel().objects.push(...objects); selectedIds=objects.filter(o=>o.type!=='connector').map(o=>o.id); render(); saveState(); setStatus('Template inserted and grouped: '+name,'success')}
gid('insertTemplateBtn').onclick=()=>insertTemplate(false);
gid('newTemplatePanelBtn').onclick=()=>insertTemplate(true);

async function saveToGoogle(){const url=ui.scriptUrl.value.trim(); if(!url)return setStatus('Add your Google Apps Script Web App URL first.','danger'); setStatus('Saving board to Google Drive and Sheets...'); try{const png=await exportPng(); const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'save',board,png})}); const out=await res.json(); if(out.ok)setStatus('Saved: '+(out.folderUrl||out.fileUrl),'success'); else setStatus(out.error||'Save failed.','danger')}catch(err){setStatus('Google save failed. '+err.message,'danger')}}
async function saveCurrentAsTemplate(){const url=ui.scriptUrl.value.trim(); if(!url)return setStatus('Add your Google Apps Script URL first.','danger'); const name=prompt('Template name:', board.title+' Template'); if(!name)return; const payload={name,bg:panel().bg,objects:JSON.parse(JSON.stringify(panel().objects))}; try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'templateSave',template:payload})}); const out=await res.json(); if(out.ok) setStatus('Template saved to Google Drive.','success'); else setStatus(out.error||'Template save failed.','danger')}catch(err){setStatus('Template save failed. '+err.message,'danger')}}
async function loadTemplateGallery(){const url=ui.scriptUrl.value.trim(); if(!url)return setStatus('Add your Google Apps Script URL first.','danger'); try{const res=await fetch(url+'?action=templateList'); const out=await res.json(); if(!out.ok||!out.templates||!out.templates.length) return setStatus('No templates found in Google Drive.','danger'); const menu=out.templates.map((t,i)=>`${i+1}. ${t.name}`).join('\n'); const choice=prompt('Choose a template number:\n'+menu); const idx=Math.max(1,parseInt(choice||'0',10))-1; if(!out.templates[idx]) return; const load=await fetch(url+'?action=templateLoad&templateId='+encodeURIComponent(out.templates[idx].templateId)); const loaded=await load.json(); if(loaded.ok&&loaded.template){const tpl=loaded.template; panel().bg=tpl.bg||panel().bg; panel().objects=(tpl.objects||[]).map(o=>migrateObject(o)); clearSelection(); render(); saveState(); setStatus('Template loaded: '+tpl.name,'success')} else setStatus(loaded.error||'Template load failed.','danger')}catch(err){setStatus('Template gallery failed. '+err.message,'danger')}}
async function submitTurnIn(){const url=ui.scriptUrl.value.trim(); if(!url)return setStatus('Add your Google Apps Script URL first.','danger'); const student=board.studentName||prompt('Student name:',board.studentName||''); if(!student)return setStatus('Enter a student name first.','danger'); board.studentName=student; ui.studentName.value=student; try{const png=await exportPng(); const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'turnInSave',turnin:{studentName:student,className:board.className,title:board.title,board},png})}); const out=await res.json(); if(out.ok) setStatus('Turn-in submitted.','success'); else setStatus(out.error||'Turn-in failed.','danger')}catch(err){setStatus('Turn-in failed. '+err.message,'danger')}}
async function reviewTurnIns(){const url=ui.scriptUrl.value.trim(); if(!url)return setStatus('Add your Google Apps Script URL first.','danger'); try{const res=await fetch(url+'?action=turnInList'); const out=await res.json(); if(!out.ok||!out.turnins||!out.turnins.length) return setStatus('No turn-ins found.','danger'); const menu=out.turnins.map((t,i)=>`${i+1}. ${t.studentName} — ${t.title} (${t.className||'No class'})`).join('\n'); const choice=prompt('Choose a turn-in number to load:\n'+menu); const idx=Math.max(1,parseInt(choice||'0',10))-1; if(!out.turnins[idx]) return; const load=await fetch(url+'?action=turnInLoad&turninId='+encodeURIComponent(out.turnins[idx].turninId)); const loaded=await load.json(); if(loaded.ok&&loaded.turnin&&loaded.turnin.board){board=loaded.turnin.board; migrateBoard(board); clearSelection(); initHistory(); render(); persistLocal(); setStatus('Loaded turn-in from '+(loaded.turnin.studentName||'student')+'.','success')} else setStatus(loaded.error||'Turn-in load failed.','danger')}catch(err){setStatus('Turn-in review failed. '+err.message,'danger')}}
gid('saveDriveBtn').onclick=saveToGoogle;
gid('saveTemplateBtn').onclick=saveCurrentAsTemplate;
gid('loadTemplateGalleryBtn').onclick=loadTemplateGallery;
gid('submitTurnInBtn').onclick=submitTurnIn;
gid('reviewTurnInsBtn').onclick=reviewTurnIns;
gid('loadDriveBtn').onclick=async()=>{const url=ui.scriptUrl.value.trim(),boardId=prompt('Paste DrawSplat boardId from the Sheet:'); if(!url||!boardId)return; try{const res=await fetch(url+'?action=load&boardId='+encodeURIComponent(boardId)); const out=await res.json(); if(out.ok){board=out.board; migrateBoard(board); clearSelection(); initHistory(); render(); persistLocal(); setStatus('Loaded board from Google.','success')} else setStatus(out.error||'Load failed.','danger')}catch(err){setStatus('Google load failed. '+err.message,'danger')}};
gid('settingsBtn').onclick=()=>gid('setupDialog').showModal();
gid('closeSetup').onclick=()=>gid('setupDialog').close();
gid('optionsBtn').onclick=()=>gid('optionsDialog').showModal();
gid('closeOptions').onclick=()=>gid('optionsDialog').close();
gid('aboutBtn').onclick=()=>gid('aboutDialog').showModal();
gid('closeAbout').onclick=()=>gid('aboutDialog').close();
function setInspectorOpen(open){const ins=document.querySelector('.inspector'),bd=gid('inspectorBackdrop'); if(!ins) return; ins.classList.toggle('show',open); if(bd) bd.classList.toggle('show',open)}
gid('inspectorToggleBtn').onclick=()=>setInspectorOpen(!document.querySelector('.inspector').classList.contains('show'));
gid('inspectorCloseBtn').onclick=()=>setInspectorOpen(false);
gid('inspectorBackdrop').onclick=()=>setInspectorOpen(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.inspector')?.classList.contains('show')) setInspectorOpen(false)});
async function loadTurnInById(turninId){const url=ui.scriptUrl.value.trim(); if(!url||!turninId) return; const load=await fetch(url+'?action=turnInLoad&turninId='+encodeURIComponent(turninId)); const loaded=await load.json(); if(loaded.ok&&loaded.turnin&&loaded.turnin.board){board=loaded.turnin.board; migrateBoard(board); clearSelection(); initHistory(); render(); persistLocal(); gid('moderationDialog').close(); setStatus('Loaded turn-in from '+(loaded.turnin.studentName||'student')+'.','success')}}
async function openModerationDashboard(){const comments=[]; board.panels.forEach((p,pi)=>p.objects.filter(o=>o.type==='comment').forEach(o=>comments.push({panelIndex:pi,panelName:p.name,obj:o}))); const unresolved=comments.filter(c=>!c.obj.resolved).length, resolved=comments.length-unresolved; gid('moderationSummary').innerHTML=`<span class="pill warn">${esc(unresolved)} unresolved</span> <span class="pill ok">${esc(resolved)} resolved</span> <span class="pill">${esc(comments.length)} total comments</span>`; gid('moderationComments').innerHTML=comments.length?comments.map((c,i)=>`<div class="list-item"><h4>${esc(c.panelName)} — ${c.obj.resolved?'Resolved':'Open'}</h4><p>${esc(c.obj.text||htmlToPlainText(c.obj.html)||'No text')}</p><button data-jump-comment="${i}">Jump to Comment</button></div>`).join(''):'<div class="list-item">No comments on this board.</div>'; gid('moderationComments').querySelectorAll('[data-jump-comment]').forEach(btn=>btn.onclick=()=>{const c=comments[+btn.dataset.jumpComment]; board.active=c.panelIndex; setSingleSelection(c.obj.id); gid('moderationDialog').close(); render()}); let turnins=[]; const url=ui.scriptUrl.value.trim(); if(url){ try{const res=await fetch(url+'?action=turnInList'); const out=await res.json(); if(out.ok&&out.turnins) turnins=out.turnins}catch(err){} } gid('moderationTurnins').innerHTML=turnins.length?turnins.map(t=>`<div class="list-item"><h4>${esc(t.studentName||'Student')} — ${esc(t.title||'Untitled')}</h4><p>${esc(t.className||'No class')} · ${esc(t.updatedAt||'')}</p><button data-load-turnin="${esc(t.turninId)}">Load Turn-In</button></div>`).join(''):'<div class="list-item">No Google turn-ins found yet.</div>'; gid('moderationTurnins').querySelectorAll('[data-load-turnin]').forEach(btn=>btn.onclick=()=>loadTurnInById(btn.dataset.loadTurnin)); gid('moderationDialog').showModal()}
function runTntReset(){if(!confirm('Blow up the current panel and start over?')) return; const overlay=gid('boomOverlay'); overlay.classList.add('show'); setTimeout(()=>{panel().objects=[]; clearSelection(); render(); saveState(); setStatus('Boom! Panel cleared.','success')},1100); setTimeout(()=>overlay.classList.remove('show'),1700)}

function setAudioOnCurrent(dataUrl,name='Audio note'){const o=currentObj(); if(!o||o.type!=='audio') return setStatus('Select an audio note first.','danger'); o.audioSrc=dataUrl; o.audioName=name; render(); saveState(); setStatus('Audio attached.','success')}
async function startAudioRecording(){const o=currentObj(); if(!o||o.type!=='audio') return setStatus('Select an audio note first.','danger'); if(mediaRecorder&&mediaRecorder.state==='recording'){mediaRecorder.stop(); return} if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined') return setStatus('Audio recording is not supported in this browser.','danger'); try{const stream=await navigator.mediaDevices.getUserMedia({audio:true}); recordChunks=[]; mediaRecorder=new MediaRecorder(stream); mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size) recordChunks.push(e.data)}; mediaRecorder.onstop=()=>{const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'}); const r=new FileReader(); r.onload=()=>setAudioOnCurrent(r.result,'Recorded audio'); r.readAsDataURL(blob); stream.getTracks().forEach(t=>t.stop()); gid('recordAudioBtn').textContent='Record Audio'}; mediaRecorder.start(); gid('recordAudioBtn').textContent='Stop Recording'; setStatus('Recording audio... click again to stop.','success')}catch(err){setStatus('Audio recording failed. '+err.message,'danger')}}
function playSelectedAudio(){const o=currentObj(); if(!o||o.type!=='audio'||!o.audioSrc) return setStatus('Select an audio note with audio attached.','danger'); new Audio(o.audioSrc).play().catch(err=>setStatus('Playback failed. '+err.message,'danger'))}

/* v2.5: keyboard shortcuts dialog. Opened by '?' key or by the new button if present. */
function openShortcutsDialog(){
  let dlg=gid('shortcutsDialog');
  if(!dlg){
    dlg=document.createElement('dialog');
    dlg.id='shortcutsDialog';
    dlg.innerHTML=`<div class="modal-head"><h2>Keyboard Shortcuts</h2><button class="close" id="closeShortcutsDialog" aria-label="Close">×</button></div><dl class="shortcuts-list">
      <dt><span class="kbd">Shift</span> + click</dt><dd>Multi-select</dd>
      <dt>Drag empty canvas</dt><dd>Marquee select</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + C</dt><dd>Copy selection</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + V</dt><dd>Paste selection</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + D</dt><dd>Duplicate selection</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + G</dt><dd>Group selection</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + Shift + G</dt><dd>Ungroup selection</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + Z</dt><dd>Undo</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + Shift + Z</dt><dd>Redo</dd>
      <dt><span class="kbd">Delete</span> / <span class="kbd">Backspace</span></dt><dd>Delete selection</dd>
      <dt>Double-click shape</dt><dd>Edit text inside</dd>
      <dt><span class="kbd">Ctrl/Cmd</span> + Enter</dt><dd>Apply inline text edits</dd>
      <dt><span class="kbd">Esc</span></dt><dd>Cancel inline text edits</dd>
      <dt><span class="kbd">?</span></dt><dd>This shortcuts dialog</dd>
    </dl>`;
    document.body.appendChild(dlg);
    dlg.querySelector('#closeShortcutsDialog').onclick=()=>dlg.close();
  }
  dlg.showModal();
}
const shortcutsBtn=document.getElementById('shortcutsBtn');
if(shortcutsBtn) shortcutsBtn.onclick=openShortcutsDialog;

async function loadAutosnapshot(){
  let s=null;
  try{ s=localStorage.getItem('drawsplat.autosave') }catch(_){}
  if(!s) s=await idbGet();
  if(s){try{board=JSON.parse(s); migrateBoard(board)}catch{}} else migrateBoard(board);
}

/* v2.5: register service worker for offline shell. Skipped on file:// where it cannot run. */
function registerServiceWorker(){
  if(!('serviceWorker' in navigator)) return;
  if(location.protocol!=='http:'&&location.protocol!=='https:') return;
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

(async function init(){
  await loadAutosnapshot();
  initHistory();
  applyWorkspaceMode(ui.workspaceMode?.value||'productivity',true);
  applyInterfaceMode(ui.interfaceMode?.value||'simple',true);
  refreshViewToggle?.();
  render();
  registerServiceWorker();
  /* v2.5: replay-friendly version stamp the user can read in DevTools. */
  const verEl=document.getElementById('appVersion'); if(verEl) verEl.textContent='v'+VERSION;
  document.title=(document.title||'DrawSplat').replace(/^DrawSplat(\s+v[\d.]+)?/, 'DrawSplat v'+VERSION);
  console.info('[DrawSplat] v'+VERSION+' ready');
})();

/* v2.5: language switcher (kept here so it works without i18n.js). */
(function(){
  const pages={en:'index.html',es:'index-sp.html',vi:'index-vn.html',ar:'index-ab.html',zh:'index-cn.html',uh:'index.uh.html'};
  const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const current=currentFile.includes('index-sp')?'es':currentFile.includes('index-vn')?'vi':currentFile.includes('index-ab')?'ar':currentFile.includes('index-cn')?'zh':currentFile.includes('index.uh')?'uh':'en';
  const sel=document.getElementById('languageSwitcher');
  if(sel){ sel.value=current; sel.addEventListener('change',()=>{ location.href=pages[sel.value]||'index.html' }) }
})();

/* v2.5: icon-ization. Identical to v2.4 but with explicit aria-labels on every entry. */
(function(){
  const toolIcons={ select:['↖','Select'], pen:['✏️','Pen'], eraser:['🧽','Eraser'], laser:['🔴','Laser Pointer'], line:['╱','Line'], arrow:['➜','Arrow'], rect:['▭','Rectangle'], ellipse:['◯','Ellipse'], text:['T','Text'], sticky:['🗒️','Sticky Note'], connector:['🔗','Connector'], diamond:['◇','Diamond'], triangle:['△','Triangle'], callout:['▣','Callout'], speech:['💬','Speech'], comment:['📍','Comment'], audio:['🎙️','Audio'] };
  const buttonIcons={ undoBtn:['↶','Undo'], redoBtn:['↷','Redo'], saveDriveBtn:['☁️','Save to Google'], exportBtn:['🖼️','Export PNG'], exportPdfBtn:['📄','Export PDF'], tntBtn:['🧨','TNT Reset'], imageBtn:['🖼️','Load Image'], duplicateBtn:['⧉','Duplicate'], frontBtn:['⬆️','Bring Front'], backBtn:['⬇️','Send Back'], groupBtn:['⛓️','Group'], ungroupBtn:['⛓','Ungroup'], openStickerLibraryBtn:['⭐','Open Sticker Library'], insertStickerBtn:['➕','Insert Sticker'], createCustomStickerBtn:['🖼️','Create Custom Sticker'], insertTemplateBtn:['▦','Insert Template'], newTemplatePanelBtn:['▣','New Template Panel'], saveTemplateBtn:['💾','Save as Template'], loadTemplateGalleryBtn:['📚','Load Gallery'], addPanelBtn:['＋','Add Panel'], renamePanelBtn:['✎','Rename Panel'], deletePanelBtn:['🗑️','Delete Panel'], clearPanelBtn:['🧹','Clear Panel'], saveRestorePointBtn:['📌','Save Restore Point'], restorePointBtn:['⏪','Restore Point'], applyTextBtn:['✓','Apply Text'], attachStickyImageBtn:['🖼️','Attach Sticky Image'], toggleCommentResolvedBtn:['✓','Resolve/Reopen Comment'], recordAudioBtn:['🎙️','Record Audio'], loadAudioBtn:['🎵','Load Audio'], playAudioBtn:['▶','Play Audio'], selectGroupBtn:['▦','Select Group'], answerKeyBtn:['🔑','Answer Key'], lockBtn:['🔒','Lock'], unlockBtn:['🔓','Unlock'], deleteBtn:['🗑️','Delete'], startSyncBtn:['🔁','Start Local Sync'], startCloudSyncBtn:['☁️','Start Cloud Sync'], stopSyncBtn:['■','Stop Sync'], refreshCloudBtn:['↧','Pull Cloud'], saveLocalBtn:['💾','Save File'], loadLocalBtn:['📂','Load File'], loadDriveBtn:['☁️','Load from Google'], settingsBtn:['⚙️','Setup'], submitTurnInBtn:['📤','Submit Turn-In'], reviewTurnInsBtn:['📥','Review Turn-Ins'], openModerationBtn:['🛡️','Open Moderation Dashboard'], refreshModerationBtn:['↻','Refresh Data'], zoomOutBtn:['−','Zoom Out'], zoomResetBtn:['100%','Reset Zoom'], zoomInBtn:['+','Zoom In'], closeSetup:['×','Close'], closeStickerDialog:['×','Close'], closeModerationDialog:['×','Close'], inlineTextCancelBtn:['×','Cancel'], inlineTextSaveBtn:['✓','Done'], shortcutsBtn:['⌨','Keyboard Shortcuts'], optionsBtn:['⚙','Options'], closeOptions:['×','Close'], aboutBtn:['ⓘ','About'], closeAbout:['×','Close'], viewToggleBtn:['⇄','Switch View'], loadBgImageBtn:['🖼️','Load Background'], clearBgImageBtn:['🚫','Clear Background'], frameNavPrev:['◀','Previous Frame'], frameNavNext:['▶','Next Frame'], frameNavAdd:['＋','Add Frame'], clearFrameBtn:['🧹','Clear Frame'], moreOptionsBtn:['⋮','More Options'], closeMoreOptions:['×','Close'], simpleImageBtn:['🖼️','Add Image'], simpleTntBtn:['🧨','TNT Reset'], simpleBgImageBtn:['🌄','Set Background'], simpleClearBgBtn:['🚫','Clear Background'] };
  const keepTextIds=new Set(['saveDriveBtn','exportBtn','exportPdfBtn','tntBtn','submitTurnInBtn','reviewTurnInsBtn','openModerationBtn','refreshModerationBtn','settingsBtn','loadDriveBtn','saveLocalBtn','loadLocalBtn','inlineTextSaveBtn','inlineTextCancelBtn','optionsBtn','aboutBtn','viewToggleBtn']);
  function currentLabel(el,fallback){ const text=(el.textContent||'').trim(); return el.getAttribute('aria-label')||el.getAttribute('title')||text||fallback }
  function iconize(el,icon,label,withText=false){ if(!el||el.dataset.iconized==='1') return; const finalLabel=currentLabel(el,label); el.dataset.iconized='1'; el.classList.add('icon-btn'); if(withText) el.classList.add('icon-with-text'); el.setAttribute('aria-label',finalLabel); el.setAttribute('title',finalLabel); el.setAttribute('data-tooltip',finalLabel); el.innerHTML=`<span class="icon-symbol" aria-hidden="true">${icon}</span><span class="icon-label">${esc(finalLabel)}</span>` }
  function applyIcons(){
    document.body.classList.add('tool-palette-condensed');
    document.querySelectorAll('#toolButtons [data-tool]').forEach(btn=>{const data=toolIcons[btn.dataset.tool]; if(data) iconize(btn,data[0],data[1],false)});
    Object.entries(buttonIcons).forEach(([elid,data])=>{const el=document.getElementById(elid); if(el) iconize(el,data[0],data[1],keepTextIds.has(elid))});
    document.querySelectorAll('[data-bg]').forEach(btn=>{const label=currentLabel(btn,'Background'); const map={blank:'□',grid:'▦',dots:'⠿',graph:'⊞',lines:'☰',isometric:'◇'}; iconize(btn,map[btn.dataset.bg]||'▦',label,false)});
    /* v2.5: explicit aria-labels on form controls without visible labels. */
    document.querySelectorAll('input,select,textarea').forEach(el=>{
      if(el.getAttribute('aria-label')) return;
      const lbl=el.closest('.row,.checkrow')?.querySelector('label')?.textContent?.trim();
      if(lbl) el.setAttribute('aria-label',lbl);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyIcons); else applyIcons();
})();

})();
