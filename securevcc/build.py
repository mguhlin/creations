#!/usr/bin/env python3
"""Synchronize the readable skill preview and validate the public checklist."""
import argparse
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Fail if the page needs rebuilding; write nothing.')
args = parser.parse_args()
skill = (ROOT / 'securevcc.md').read_text(encoding='utf-8')
page = (ROOT / 'index.html').read_text(encoding='utf-8')
checks = re.findall(r'^- \*\*([A-Z][A-Z0-9]*-\d{2}) —', skill, re.M)
listed = re.findall(r'<li data-check="([A-Z][A-Z0-9]*-\d{2})">', page)
if not checks or len(checks) != len(set(checks)) or len(listed) != len(set(listed)):
    raise SystemExit('Missing or duplicate check IDs in the skill or website.')
if set(checks) != set(listed):
    raise SystemExit(f'Update the public checklist: missing {sorted(set(checks)-set(listed))}; extra {sorted(set(listed)-set(checks))}.')
updated, count = re.subn(r'(<pre class="preview" tabindex="0">)[\s\S]*?(</pre>)',
                       lambda m: m[1] + html.escape(skill) + m[2], page, count=1)
if count != 1:
    raise SystemExit('The readable skill preview is missing.')
updated, count = re.subn(r'Here is what SecureVCC addresses: \d+ review checks',
                       f'Here is what SecureVCC addresses: {len(checks)} review checks', updated, count=1)
if count != 1:
    raise SystemExit('The checklist count is missing.')
if args.check and page != updated:
    raise SystemExit('Run python3 securevcc/build.py and commit the refreshed page.')
if not args.check and page != updated:
    (ROOT / 'index.html').write_text(updated, encoding='utf-8')
print(f'SecureVCC: {len(checks)} unique checks; public checklist complete; preview matches the download.')
