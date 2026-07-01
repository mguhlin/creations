const fs = require('fs');
const { execFileSync } = require('child_process');

const data = JSON.parse(fs.readFileSync('projects.json', 'utf8'));
const baseUrl = 'https://mguhlin.github.io/creations/';
const fallbackDate = gitDate(['log', '-1', '--format=%aI', '--', 'projects.json']) || new Date().toISOString();

const groups = [
  ['AI Tools & Prompt Libraries', 'Prompt builders, custom instructions, AI literacy resources, and ready-to-use assistant libraries.'],
  ['Teaching Strategies & Professional Learning', 'Coaching tools, strategy guides, reflection activities, course resources, and educator growth supports.'],
  ['Classroom Activities & Generators', 'Student-facing games, randomizers, puzzles, breakouts, warm-ups, and quick classroom makers.'],
  ['Data, Dashboards & Evaluation', 'Dashboards, rubrics, scoring tools, data displays, visualizations, and evidence-based decision aids.'],
  ['Library & Research Tools', 'Library programming tools, reading activities, source evaluation, citations, catalog practice, and research skills.'],
  ['Leadership, Policy & Planning', 'Planning frameworks, policy guides, technology integration resources, adoption roadmaps, and operational tools.'],
  ['Productivity, Utilities & Workflows', 'Reusable work tools, search portals, media scripts, onboarding generators, and workflow helpers.'],
  ['Conference & Workshop Materials', 'Session hubs, slide decks, web decks, training materials, and workshop-ready resources.']
];

function gitDate(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function displayTitle(project) {
  return stripTags(project.title || '')
    .replace(/^TCEA\s+/i, '')
    .replace(/\s+[-—]\s+TCEA$/i, '')
    .replace(/\s+\|\s+TCEA\s+WebDeck$/i, ' WebDeck')
    .replace(/\s+TCEA\s+resource$/i, '')
    .trim();
}

function cleanSummary(value, project) {
  const title = escapeRegExp(displayTitle(project));
  const href = escapeRegExp(primaryHref(project));
  return stripTags(value)
    .replace(/\s*TCEA resource\s*/gi, ' ')
    .replace(/\s*Added to the creations index so it can be found through search and section navigation\.?/gi, ' ')
    .replace(href ? new RegExp(`\\s*available at\\s+${href}\\.?`, 'gi') : /$^/, ' ')
    .replace(title ? new RegExp(`^${title}\\s+`, 'i') : /$^/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function displaySummary(project) {
  for (const option of [project.subtitle, project.description, project.category]) {
    const summary = cleanSummary(option || '', project);
    if (summary) return summary;
  }
  return stripTags(project.category || '');
}

function displayGroup(project) {
  const section = stripTags(project.section || '').toLowerCase();
  const category = stripTags(project.category || '').toLowerCase();
  const title = stripTags(project.title || '').toLowerCase();
  const href = primaryHref(project).toLowerCase();
  const haystack = [section, category, title, href].join(' ');

  if (haystack.includes('libvibes') || href.includes('/vcl/') || href.includes('/vcll/')) return groups[4][0];
  if (haystack.includes('dashboard') || haystack.includes('data') || haystack.includes('visual') || haystack.includes('rubric') || haystack.includes('assessment system') || haystack.includes('scoring') || haystack.includes('evaluation') || haystack.includes('chart') || haystack.includes('graph')) return groups[3][0];
  if (haystack.includes('classroom') || haystack.includes('interactive') || haystack.includes('breakout') || haystack.includes('game') || haystack.includes('puzzle') || haystack.includes('spinner') || haystack.includes('dice') || haystack.includes('bingo') || haystack.includes('wheel') || haystack.includes('word search') || haystack.includes('activity') || haystack.includes('flashcards')) return groups[2][0];
  if (haystack.includes('professional') || haystack.includes('coaching') || haystack.includes('coach') || haystack.includes('course') || haystack.includes('reflection') || haystack.includes('strategy') || haystack.includes('visible learning') || haystack.includes('instructional')) return groups[1][0];
  if (haystack.includes('ai') || haystack.includes('prompt') || haystack.includes('claude') || haystack.includes('boodlebox') || haystack.includes('custom instructions') || haystack.includes('protect') || haystack.includes('vibe coding')) return groups[0][0];
  if (haystack.includes('policy') || haystack.includes('leadership') || haystack.includes('roadmap') || haystack.includes('planning') || haystack.includes('technology integration') || haystack.includes('edtech framework') || haystack.includes('vendor') || haystack.includes('privacy') || haystack.includes('intake') || haystack.includes('organizer')) return groups[5][0];
  if (haystack.includes('conference') || haystack.includes('session') || haystack.includes('workshop') || haystack.includes('webdeck') || haystack.includes('slide deck') || haystack.includes('training') || haystack.includes('lunch')) return groups[7][0];
  return groups[6][0];
}

function primaryHref(project) {
  const primary = (project.links || []).find(link => link.primary) || (project.links || [])[0];
  return primary ? primary.href : `#${project.id}`;
}

function absoluteUrl(href) {
  if (/^https?:\/\//i.test(href)) return href;
  return new URL(href, baseUrl).toString();
}

function localPathFromHref(href) {
  if (/^https?:\/\//i.test(href)) return '';
  const clean = href.replace(/#.*/, '').replace(/^\.\//, '');
  if (!clean || clean.startsWith('#')) return '';
  return clean.endsWith('/') ? clean + 'index.html' : clean;
}

function itemDate(project, index) {
  const path = localPathFromHref(primaryHref(project));
  let date = path ? gitDate(['log', '--diff-filter=A', '--follow', '-1', '--format=%aI', '--', path]) : '';
  if (!date && path) date = gitDate(['log', '-1', '--format=%aI', '--', path]);
  const parsed = new Date(date || fallbackDate);
  parsed.setSeconds(parsed.getSeconds() + index);
  return parsed;
}

function groupDescription(groupName) {
  return (groups.find(([name]) => name === groupName) || [groupName, 'Project resource.'])[1];
}

function words(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}

function makeWriteup(project) {
  const title = displayTitle(project);
  const summary = displaySummary(project);
  const group = displayGroup(project);
  const category = stripTags(project.category || 'resource');
  const features = (project.features || []).map(stripTags).filter(Boolean).slice(0, 4);
  const featureSentence = features.length
    ? `Notable elements include ${features.join(', ')}, giving visitors concrete starting points instead of a blank page.`
    : 'The resource is designed to be direct and usable, with enough structure for quick scanning and enough context for practical follow-through.';
  const text = `${title} is part of the ${group} collection. ${summary} It fits best as a ${category.toLowerCase()} for educators, administrators, trainers, or knowledge workers who need a focused resource they can open, understand, and use quickly. ${featureSentence} The page links directly to the working project, so readers can move from the index or RSS reader into the live material without hunting through folders. It is included in the Creative Works feed to make new and restored resources easier to notice, revisit, share, and cite over time.`;
  const list = words(text);
  if (list.length >= 100) return list.slice(0, 100).join(' ') + '.';

  const filler = words(`This entry emphasizes discoverability, plain-language context, and a stable link for future reference. ${groupDescription(group)}`);
  let i = 0;
  while (list.length < 100) {
    list.push(filler[i % filler.length]);
    i += 1;
  }
  return list.slice(0, 100).join(' ') + '.';
}

function xml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  return String(value || '').replace(/]]>/g, ']]]]><![CDATA[>');
}

const items = data.projects.map((project, index) => {
  const href = primaryHref(project);
  return {
    title: displayTitle(project),
    summary: displaySummary(project),
    writeup: makeWriteup(project),
    link: absoluteUrl(href),
    date: itemDate(project, index),
    group: displayGroup(project)
  };
}).sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));

const latestDate = items[0]?.date || new Date();
const feedUrl = new URL('feed.xml', baseUrl).toString();
const channelDescription = data.meta?.description || 'A curated portfolio of digital creations.';

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Creative Works by Miguel Guhlin</title>
    <link>${xml(baseUrl)}</link>
    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${xml(channelDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <pubDate>${latestDate.toUTCString()}</pubDate>
    <generator>MGuhlin Creative Works static feed</generator>
${items.map(item => `    <item>
      <title>${xml(item.title)}</title>
      <link>${xml(item.link)}</link>
      <guid isPermaLink="true">${xml(item.link)}</guid>
      <dc:creator>Miguel Guhlin</dc:creator>
      <category>${xml(item.group)}</category>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${xml(item.summary)}</description>
      <content:encoded><![CDATA[<p>${cdata(item.summary)}</p><p>${cdata(item.writeup)}</p><p><a href="${xml(item.link)}">Open ${cdata(item.title)}</a></p>]]></content:encoded>
    </item>`).join('\n')}
  </channel>
</rss>
`;

fs.writeFileSync('feed.xml', rss);
console.log(`wrote feed.xml with ${items.length} items`);
