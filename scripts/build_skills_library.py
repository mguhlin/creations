"""Build the public Skills Library and reproducible, single-skill ZIPs."""
from pathlib import Path
from html import escape
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'architect/skills'

def build():
    catalog = json.loads((LIBRARY / 'catalog.json').read_text())
    downloads = LIBRARY / 'downloads'
    downloads.mkdir(exist_ok=True)
    rows, chooser, manifest = [], [], []
    for item in catalog:
        slug = item['slug']
        folder = LIBRARY / 'packages' / slug
        skill = (folder / 'SKILL.md').read_text()
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug)
        assert skill.startswith('---\n') and f'\nname: {slug}\n' in skill
        assert '\ndescription: ' in skill and (folder / 'eval.md').is_file()
        license_text = 'Original starter by Miguel Guhlin.\n\nTo the extent possible under law, the author has waived all copyright and related or neighboring rights to this original starter under CC0 1.0 Universal.\n\nhttps://creativecommons.org/publicdomain/zero/1.0/legalcode\n\nLinked third-party works retain their respective licenses.\n'
        (folder / 'LICENSE.txt').write_text(license_text)
        archive = downloads / f'{slug}.zip'
        with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
            for file in sorted(folder.rglob('*')):
                if not file.is_file():
                    continue
                member = zipfile.ZipInfo(f'{slug}/{file.relative_to(folder).as_posix()}', (2026, 10, 20, 0, 0, 0))
                member.compress_type = zipfile.ZIP_DEFLATED
                member.external_attr = 0o100644 << 16
                bundle.writestr(member, file.read_bytes())
        manifest.append({'file': archive.name, 'bytes': archive.stat().st_size, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()})
        e = lambda key: escape(item[key], quote=True)
        chooser.append(f'<a href="#{slug}">{e("title")}</a>')
        rows.append(f'''<article class="skill" id="{slug}">
<header class="skill-title"><p class="category">{e('category')}</p><h3>{e('title')}</h3><p>{e('purpose')}</p></header>
<div class="skill-content"><dl><dt>Use it for</dt><dd>{e('use')}</dd><dt>What it helps produce</dt><dd>{e('result')}</dd></dl>
<div class="actions"><a class="button" href="downloads/{slug}.zip" download>Download {e('title')} ZIP</a><a href="packages/{slug}/SKILL.md">SKILL.md</a><a href="packages/{slug}/eval.md">Practice tests</a></div><p class="download-meta">One skill · {archive.stat().st_size / 1024:.1f} KB · CC0 reuse</p>
<div class="practice"><h4>Try this request</h4><p id="test-{slug}" tabindex="-1">{e('test')}</p><button class="button secondary" data-copy="test-{slug}" hidden>Copy test request</button></div>
<details><summary>Read the skill instructions</summary><pre tabindex="0">{escape(skill)}</pre></details>
<p class="source">Related work: <a href="{e('url')}">{e('connection')}</a>.</p></div></article>''')
    template = (LIBRARY / 'page.template.html').read_text()
    page = template.replace('{{chooser}}', ''.join(chooser)).replace('{{skills}}', '\n'.join(rows)).replace('{{example}}', escape((LIBRARY / 'weekly-update-SKILL.md').read_text()))
    (LIBRARY / 'index.html').write_text(page)
    (downloads / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Built {len(catalog)} skill packages and The Skills Library.')

if __name__ == '__main__':
    build()
