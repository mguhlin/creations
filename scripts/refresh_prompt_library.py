"""Render maintained image challenges, glossary, and skill search links."""
from pathlib import Path
from html import escape
import json
import re

ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/'architect/index.html'
ASSETS=ROOT/'architect/assets'

def block(source,name,content,before):
    start=f'<!-- BEGIN {name} -->'
    end=f'<!-- END {name} -->'
    rendered=start+'\n'+content+'\n'+end+'\n'
    if start in source:
        return re.sub(re.escape(start)+'.*?'+re.escape(end)+'\n?',lambda _:rendered,source,flags=re.S)
    assert before in source,before
    return source.replace(before,rendered+before,1)

def build():
    source=PAGE.read_text()
    challenges=json.loads((ASSETS/'image-challenges.json').read_text())
    cards=[]
    for item in challenges:
        e=lambda key:escape(item[key],quote=True)
        cards.append(f'''<div class="pcard" data-cat="image-prompts" data-type="short" data-keywords="{e('keywords')}">
<div class="pcard-header"><div class="pcard-meta"><div class="pcard-cat">Image challenge</div><div class="pcard-title">{e('title')}</div></div><span class="pcard-type type-short">Short</span></div>
<div class="pcard-body"><div class="pcard-desc">{e('description')}</div><div class="pcard-prompt">{e('prompt')}</div><div class="pcard-actions"><button class="btn-expand" onclick="toggleExpand(this)" aria-expanded="false">Expand</button><button class="btn-copy" onclick="copyPrompt(this)">Copy</button></div></div></div>''')
    section='''<div class="sec-divider" id="image-challenges" data-category="image-prompts"><div class="sec-divider-line"></div><span class="sec-divider-icon" aria-hidden="true">🎨</span><span class="sec-divider-lbl">Fun Image Challenges</span><div class="sec-divider-line"></div></div>
<p class="challenge-intro">Try these in ChatGPT with image creation, or another image tool. Replace the brackets, attach a reference when requested, and change one detail at a time. Check the result before sharing—especially text, counts, and any features you asked to preserve.</p>
<div class="prompts-grid">'''+ '\n'.join(cards)+'</div>\n'
    source=block(source,'IMAGE CHALLENGES',section,'<div class="sec-divider" id="image-prompts">')
    glossary=json.loads((ASSETS/'glossary.json').read_text())
    terms=[]
    for term,definition in sorted(glossary.items(),key=lambda item:item[0].casefold()):
        slug=re.sub(r'[^a-z0-9]+','-',term.lower()).strip('-')
        terms.append(f'<li id="term-{slug}"><strong>{escape(term)}.</strong> {escape(definition)}</li>')
    content='<div class="glossary-list"><p class="glossary-intro">Plain-language definitions for prompts, skills, image creation, and responsible use. Search at the top of the page to find a term.</p><ol>'+ '\n'.join(terms)+'</ol><p class="glossary-sources">Learn more: <a href="https://agentskills.io/specification">Agent Skills format</a> · <a href="https://learn.chatgpt.com/docs/build-skills">OpenAI skill guide</a> · <a href="https://developers.openai.com/api/docs/guides/image-generation">OpenAI image guide</a>.</p></div>\n\n'
    start=source.index('<div class="glossary-list">')
    end=source.index('<!-- ═══════════ AI WORKFLOW MODELS',start)
    source=source[:start]+content+source[end:]
    catalog=json.loads((ROOT/'architect/skills/catalog.json').read_text())
    links=''.join(f'<li><a class="skill-search-entry" href="skills/#{escape(item["slug"])}" data-search="{escape(item["title"]+" "+item["purpose"]+" "+item["use"]+" "+item["result"]+" "+item["test"]+" skill skills reusable workflow",quote=True)}">{escape(item["title"])}</a><span>{escape(item["purpose"])}</span></li>' for item in catalog)
    resources='<section id="library-search-resources" class="library-search-resources" hidden aria-labelledby="resource-results-title"><h2 id="resource-results-title">Skills and glossary matches</h2><p id="search-summary" role="status" aria-live="polite"></p><ul class="skill-search-results">'+links+'</ul><ul id="glossary-search-results"></ul><button type="button" id="clear-search">Clear search</button></section>'
    source=block(source,'SEARCH RESOURCES',resources,'<!-- PROMPT ENGINEERING -->')
    PAGE.write_text(source)
    print(f'Rendered {len(challenges)} image challenges, {len(glossary)} glossary terms, and {len(catalog)} skill links.')

if __name__=='__main__':build()
