/* ============================================================
   NSPA AI Pulse — Assessment Logic
   ============================================================ */

/* ---------- 1. QUESTIONS ----------
   Each option carries two scores:
     u = USE / adoption   (horizontal axis, 0..3)
     c = CONFIDENCE+RESPONSIBLE practice (vertical axis, 0..3)
   The 5th question is weighted toward the responsibility axis.
*/
const QUESTIONS = [
  {
    eyebrow: "Question 1 of 5 · Adoption",
    text: "How often do you currently use a Gen AI tool (ChatGPT, Gemini, Claude, Copilot) for marketing or engagement work?",
    sub: "Think drafting emails, social posts, newsletters, FAQs, or donor updates.",
    options: [
      { label: "Never — I haven't started yet", u: 0, c: 0 },
      { label: "Once in a while, for the occasional task", u: 1, c: 1 },
      { label: "Most weeks, for several routine tasks", u: 2, c: 2 },
      { label: "Daily — it's woven into how my team works", u: 3, c: 2 }
    ]
  },
  {
    eyebrow: "Question 2 of 5 · Breadth",
    text: "Across how many parts of your marketing and engagement work does AI help today?",
    sub: "For example: email, social, applicant FAQs, donor reporting, reviewer materials.",
    options: [
      { label: "None yet", u: 0, c: 0 },
      { label: "One narrow area", u: 1, c: 1 },
      { label: "A few different areas", u: 2, c: 2 },
      { label: "Many areas, as a connected workflow", u: 3, c: 2 }
    ]
  },
  {
    eyebrow: "Question 3 of 5 · Confidence",
    text: "How confident are you writing a good prompt and judging whether the output is usable?",
    sub: "Confidence in getting useful results, not just in opening the tool.",
    options: [
      { label: "Not confident — I'm not sure where to start", u: 0, c: 0 },
      { label: "Somewhat — I get by but results are hit or miss", u: 1, c: 1 },
      { label: "Confident — I usually get strong first drafts", u: 2, c: 2 },
      { label: "Very confident — I refine, compare, and coach others", u: 2, c: 3 }
    ]
  },
  {
    eyebrow: "Question 4 of 5 · Review habits",
    text: "Before AI-drafted content goes out, what review happens?",
    sub: "Be honest about your real, everyday practice.",
    options: [
      { label: "I don't use AI for outgoing content", u: 0, c: 1 },
      { label: "I usually send AI drafts with light edits", u: 2, c: 0 },
      { label: "A person always reviews and edits before sending", u: 2, c: 2 },
      { label: "A person reviews AND we follow a written checklist", u: 2, c: 3 }
    ]
  },
  {
    eyebrow: "Question 5 of 5 · Privacy &amp; equity",
    text: "How do you handle applicant, donor, or student information when using AI?",
    sub: "This is the trust question, and it matters most.",
    options: [
      { label: "I haven't thought about this yet", u: 0, c: 0 },
      { label: "I'm careful but have no written rule", u: 1, c: 1 },
      { label: "I avoid pasting names or identifiers into AI tools", u: 2, c: 2 },
      { label: "We have a clear 'we will / we will not' policy the team follows", u: 2, c: 3 }
    ]
  }
];

/* ---------- 2. STATE ---------- */
let current = 0;
const answers = new Array(QUESTIONS.length).fill(null);
let myId = "";
let myScores = null;

/* ---------- 3. STAGE NAVIGATION ---------- */
function goStage(name) {
  document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
  document.getElementById('stage-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQuiz() {
  goStage('quiz');
  buildProgress();
  renderQ();
}

function restart() {
  current = 0;
  answers.fill(null);
  myId = ""; myScores = null;
  goStage('intro');
}

/* ---------- 4. QUIZ RENDER ---------- */
function buildProgress() {
  const p = document.getElementById('qProgress');
  p.innerHTML = QUESTIONS.map((_, i) => `<div class="seg" id="seg-${i}"></div>`).join('');
}
function updateProgress() {
  QUESTIONS.forEach((_, i) => {
    const seg = document.getElementById('seg-' + i);
    seg.className = 'seg';
    if (i < current) seg.classList.add('done');
    else if (i === current) seg.classList.add('current');
  });
}
function renderQ() {
  const q = QUESTIONS[current];
  const sel = answers[current];
  document.getElementById('qContainer').innerHTML = `
    <div class="q-eyebrow">${q.eyebrow}</div>
    <div class="q-text">${q.text}</div>
    <div class="q-sub">${q.sub}</div>
    <div class="opts">
      ${q.options.map((o, i) => `
        <div class="opt ${sel === i ? 'selected' : ''}" onclick="pick(${i})">
          <div class="marker"></div>
          <div class="opt-text">${o.label}</div>
        </div>`).join('')}
    </div>`;
  document.getElementById('backBtn').style.visibility = current === 0 ? 'hidden' : 'visible';
  document.getElementById('nextBtn').textContent = current === QUESTIONS.length - 1 ? 'See my results →' : 'Next →';
  document.getElementById('nextBtn').disabled = sel === null;
  updateProgress();
}
function pick(i) {
  answers[current] = i;
  renderQ();
}
function prevQ() { if (current > 0) { current--; renderQ(); } }
function nextQ() {
  if (answers[current] === null) return;
  if (current < QUESTIONS.length - 1) { current++; renderQ(); }
  else submit();
}

/* ---------- 5. SCORING ---------- */
function computeScores() {
  let use = 0, conf = 0;
  answers.forEach((sel, i) => {
    use += QUESTIONS[i].options[sel].u;
    conf += QUESTIONS[i].options[sel].c;
  });
  // raw maxes: use across Q1-Q5 = 3*5=15 ; conf = 3*5=15
  const usePct = Math.round((use / 15) * 100);
  const confPct = Math.round((conf / 15) * 100);
  return { use, conf, usePct, confPct };
}

/* Quadrant / archetype based on the two axes (midpoint = 50%). */
function archetype(s) {
  const hiUse = s.usePct >= 50;
  const hiConf = s.confPct >= 50;
  if (!hiUse && !hiConf) return {
    name: "Curious Newcomer",
    blurb: "You're early in the journey. AI isn't yet part of your routine, and that's a fine place to begin. The biggest gains here come from one small, safe win that builds confidence.",
    quad: "low-low"
  };
  if (hiUse && !hiConf) return {
    name: "Fast Mover",
    blurb: "You're using AI actively, which is great for speed. The opportunity now is to firm up the guardrails so that pace doesn't outrun review and privacy habits.",
    quad: "hi-low"
  };
  if (!hiUse && hiConf) return {
    name: "Careful Builder",
    blurb: "You think carefully about responsible use and review, you just haven't scaled it across your work yet. You're well positioned to expand with confidence.",
    quad: "low-hi"
  };
  return {
    name: "Trusted Steward",
    blurb: "You use AI broadly and you do it responsibly, with human review and privacy habits in place. You're a model others in the field can learn from.",
    quad: "hi-hi"
  };
}

/* ---------- 6. SUBMIT + SAVE/FETCH ---------- */
function submit() {
  goStage('loading');
  myScores = computeScores();
  myId = genId();

  const record = {
    id: myId,
    ts: new Date().toISOString(),
    a1: answers[0], a2: answers[1], a3: answers[2], a4: answers[3], a5: answers[4],
    use: myScores.use,
    conf: myScores.conf,
    usePct: myScores.usePct,
    confPct: myScores.confPct,
    arch: archetype(myScores).name
  };

  const endpoint = (window.NSPA_CONFIG && NSPA_CONFIG.SHEET_ENDPOINT || "").trim();

  if (!endpoint) {
    // DEMO MODE — no save, simulated peers
    setTimeout(() => showResults(simulatePeers(), true), 900);
    return;
  }

  saveAndFetch(endpoint, record)
    .then(peers => showResults(peers, false))
    .catch(() => {
      // Network/endpoint failure: still show results against simulated peers
      showResults(simulatePeers(), true);
    });
}

function saveAndFetch(endpoint, record) {
  // Apps Script Web Apps accept a simple POST. We use text/plain to avoid
  // a CORS preflight, and the script returns the full anonymized dataset.
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(record)
  })
  .then(r => r.json())
  .then(data => {
    // Expected shape: { ok: true, rows: [ {usePct, confPct, id}, ... ] }
    if (data && data.rows) {
      return data.rows
        .filter(row => row.id !== record.id)
        .map(row => ({ x: Number(row.usePct), y: Number(row.confPct) }));
    }
    return simulatePeers();
  });
}

/* Random anonymous ID, e.g. NSPA-7F3K9 */
function genId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "NSPA-" + s;
}

/* Simulated peer cloud for demo / offline fallback */
function simulatePeers() {
  const n = (window.NSPA_CONFIG && NSPA_CONFIG.SEED_PEERS) || 60;
  const peers = [];
  for (let i = 0; i < n; i++) {
    // weighted toward mid-low adoption, mid confidence — realistic field shape
    const x = clamp(Math.round(gaussian(45, 22)), 4, 98);
    const y = clamp(Math.round(gaussian(52, 20)), 4, 98);
    peers.push({ x, y });
  }
  return peers;
}
function gaussian(mean, sd) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/* ---------- 7. RESULTS ---------- */
function showResults(peers, offline) {
  goStage('results');
  const arch = archetype(myScores);

  document.getElementById('resId').textContent = myId;
  document.getElementById('resArch').textContent = arch.name;

  // offline banner
  document.getElementById('offlineBanner').innerHTML = offline ? `
    <div class="banner warn">
      Preview mode: results are not being saved yet, and the dots around you are simulated.
      To go live, add your Google Sheet endpoint in <code>config.js</code> (see README, Step 3).
    </div>` : "";

  drawScatter(peers, { x: myScores.usePct, y: myScores.confPct });
  renderScores();
  renderInsight(arch, peers);
  renderGrowth(arch);
}

/* SVG scatter plot */
function drawScatter(peers, me) {
  const W = 720, H = 460, pad = 46;
  const px = v => pad + (v / 100) * (W - pad * 2);
  const py = v => (H - pad) - (v / 100) * (H - pad * 2);

  const grid = [25, 50, 75].map(g => `
    <line x1="${px(g)}" y1="${pad}" x2="${px(g)}" y2="${H-pad}" stroke="rgba(26,43,94,0.07)" />
    <line x1="${pad}" y1="${py(g)}" x2="${W-pad}" y2="${py(g)}" stroke="rgba(26,43,94,0.07)" />
  `).join('');

  // midpoint quadrant lines
  const mid = `
    <line x1="${px(50)}" y1="${pad}" x2="${px(50)}" y2="${H-pad}" stroke="rgba(26,43,94,0.2)" stroke-dasharray="4 5"/>
    <line x1="${pad}" y1="${py(50)}" x2="${W-pad}" y2="${py(50)}" stroke="rgba(26,43,94,0.2)" stroke-dasharray="4 5"/>`;

  const quadLabels = `
    <text x="${px(73)}" y="${py(94)}" fill="rgba(71,85,105,0.55)" font-family="DM Mono, monospace" font-size="11" text-anchor="middle">TRUSTED STEWARD</text>
    <text x="${px(27)}" y="${py(94)}" fill="rgba(71,85,105,0.55)" font-family="DM Mono, monospace" font-size="11" text-anchor="middle">CAREFUL BUILDER</text>
    <text x="${px(73)}" y="${py(7)}" fill="rgba(71,85,105,0.55)" font-family="DM Mono, monospace" font-size="11" text-anchor="middle">FAST MOVER</text>
    <text x="${px(27)}" y="${py(7)}" fill="rgba(71,85,105,0.55)" font-family="DM Mono, monospace" font-size="11" text-anchor="middle">CURIOUS NEWCOMER</text>`;

  const dots = peers.map(p =>
    `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="6" fill="#0D9488" opacity="0.45"/>`
  ).join('');

  const youDot = `
    <circle cx="${px(me.x)}" cy="${py(me.y)}" r="15" fill="rgba(240,165,0,0.22)"/>
    <circle cx="${px(me.x)}" cy="${py(me.y)}" r="8" fill="#F0A500" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="${px(me.x)}" y="${py(me.y) - 19}" fill="#1A2B5E" font-family="DM Mono, monospace" font-size="13" font-weight="500" text-anchor="middle">YOU</text>`;

  // axes labels
  const axes = `
    <text x="${W/2}" y="${H-8}" fill="#64748B" font-family="DM Mono, monospace" font-size="11" text-anchor="middle">ADOPTION  ·  how much you use Gen AI →</text>
    <text x="14" y="${H/2}" fill="#64748B" font-family="DM Mono, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 14 ${H/2})">CONFIDENCE &amp; RESPONSIBLE PRACTICE →</text>`;

  document.getElementById('chartHolder').innerHTML =
    `<svg class="scatter" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of providers">
      ${grid}${mid}${quadLabels}${dots}${youDot}${axes}
    </svg>`;
}

function renderScores() {
  const peersNote = "vs. field midpoint 50";
  document.getElementById('scoreGrid').innerHTML = `
    <div class="score-box">
      <div class="lbl">Adoption score</div>
      <div class="val">${myScores.usePct}<small>/100</small></div>
      <div class="score-bar"><span style="width:${myScores.usePct}%"></span></div>
    </div>
    <div class="score-box">
      <div class="lbl">Confidence &amp; responsibility</div>
      <div class="val">${myScores.confPct}<small>/100</small></div>
      <div class="score-bar"><span style="width:${myScores.confPct}%"></span></div>
    </div>`;
}

function renderInsight(arch, peers) {
  // percentile of adoption vs peers
  const below = peers.filter(p => p.x < myScores.usePct).length;
  const pct = peers.length ? Math.round((below / peers.length) * 100) : 50;
  const standing = pct >= 66 ? "ahead of most providers" :
                   pct >= 34 ? "right around the middle of the field" :
                   "earlier in the journey than most";

  document.getElementById('insightCard').innerHTML = `
    <h3>You are a ${arch.name}</h3>
    <p>${arch.blurb}</p>
    <p>On adoption, your use of Gen AI puts you <strong>${standing}</strong> (ahead of about ${pct}% of responses so far). Your strongest axis is
      ${myScores.confPct >= myScores.usePct
        ? "responsible practice and confidence, which is the harder half to build, so lead with that strength as you expand."
        : "active adoption, so your fastest gains will come from strengthening review and privacy habits to match your pace."}
    </p>`;
}

/* Growth steps tailored to quadrant */
function renderGrowth(arch) {
  const banks = {
    "low-low": [
      "Pick one low-risk task this week (a routine email or an FAQ rewrite) and draft it with AI. One win builds more confidence than a workshop.",
      "Use a simple prompt recipe: role + task + audience + format + 'flag anything you're unsure about.' Save the ones that work.",
      "Never paste applicant, donor, or student names into a tool. Practice with anonymized or made-up sample data first.",
      "Set a personal rule: a person always reads and edits any AI draft before it goes out.",
      "Sign up for the NSPA AI Training Series to build a foundation alongside peers."
    ],
    "hi-low": [
      "Add a written review step before AI content is sent. A second set of human eyes catches tone and accuracy issues your speed can hide.",
      "Draft a one-page 'we will / we will not' rule for your team so privacy habits are explicit, not assumed.",
      "Audit a sample of recent AI outputs against the source material to check for invented facts or missed nuance.",
      "Watch for bias in AI copy (assumptions about school type, language, or background) and correct it before publishing.",
      "Document your best prompts into a shared library so the whole team benefits, not just you."
    ],
    "low-hi": [
      "You have the habits, now widen the scope: add one new use area each month (donor updates, reviewer instructions, social posts).",
      "Build a reusable prompt pack for your most common tasks so expanding doesn't mean starting from scratch each time.",
      "Pilot AI on a slightly higher-value task with your existing review checklist already in place.",
      "Track time saved on a couple of recurring tasks so you can show leadership the value of scaling.",
      "Mentor a colleague who is just starting, teaching reinforces your own practice."
    ],
    "hi-hi": [
      "Codify what works into a short internal playbook so your strong practice survives staff turnover.",
      "Run a quarterly bias-and-accuracy audit on a sample of AI-assisted content to keep quality high as you scale.",
      "Measure outcomes (time saved, fewer revision cycles, reviewer consistency) and report them to your board.",
      "Share a workflow at an NSPA session, the field needs models of responsible use.",
      "Stress-test your 'we will / we will not' policy against new tools and edge cases as the technology shifts."
    ]
  };
  const steps = banks[arch.quad] || banks["low-low"];
  document.getElementById('growList').innerHTML = steps.map((s, i) =>
    `<li><span class="step-num">${i+1}</span><span>${s}</span></li>`
  ).join('');
}

/* ---------- 8. LIVE COUNT ON INTRO (optional) ---------- */
(function loadCount() {
  const endpoint = (window.NSPA_CONFIG && NSPA_CONFIG.SHEET_ENDPOINT || "").trim();
  if (!endpoint) return;
  fetch(endpoint + "?action=count")
    .then(r => r.json())
    .then(d => { if (d && typeof d.count === 'number') document.getElementById('tallyCount').textContent = d.count; })
    .catch(() => {});
})();

/* keyboard: Enter advances */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('stage-quiz').classList.contains('active')) {
    if (!document.getElementById('nextBtn').disabled) nextQ();
  }
});
