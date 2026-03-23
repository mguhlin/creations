# MGuhlin Creations

A portfolio of AI-powered tools, reference guides, coaching frameworks, and interactive resources built for educators, administrators, and knowledge workers.

**Author:** Miguel Guhlin · [MGuhlin.org](https://mguhlin.org)
**License:** [CC0 1.0 Universal](LICENSE) — open for reuse without restriction

---

## Projects

| # | Folder | Project | Type |
|---|--------|---------|------|
| 01 | [`acl/`](#01-ai-capability-ladder) | AI Capability Ladder Self-Assessment | Interactive Quiz |
| 02 | [`aici/`](#02-tcea-ai-custom-instructions-library) | AI Custom Instructions Library | Reference Library |
| 03 | [`architect/`](#03-ai-prompt-architect--workflow-guide) | AI Prompt Architect & Workflow Guide | Interactive Tool |
| 04 | [`claude/`](#04-tcea-ai-skills-suite--nonprofit-edition) | AI Skills Suite — Nonprofit Edition | Claude Skills |
| 05 | [`cudl/`](#05-coaching-for-every-learner--udl-protocols) | Coaching for Every Learner — UDL Protocols | Coaching Tool |
| 06 | [`eog/`](#06-employee-onboarding-guide-generator) | Employee Onboarding Guide Generator | Claude Project |
| 07 | [`twc/`](#07-think-with-claude--technical-orientation) | Think with Claude — Technical Orientation | Screencast Guide |
| 08 | [`txca/`](#08-boodlebox-basics--beyond--txca-office-automation) | BoodleBox Basics & Beyond / TxCA Office Automation | Webinar + Reference |
| 09 | [`visuals/`](#09-career-longevity-in-edtech-leadership) | Career Longevity in EdTech Leadership | Data Visualization |
| 10 | [`vlet/`](#10-visible-learning-with-ed-tech) | Visible Learning with Ed Tech | Strategy Reference |

---

## 01 — AI Capability Ladder

**Path:** `acl/index.html`

A five-question self-assessment that scores AI fluency and places respondents on the Capability Ladder across four levels: Disconnected, Foundational, Integrated, and Strategic. Designed for scholarship and nonprofit office contexts. Responses are automatically logged to a Google Apps Script endpoint.

**Levels**

| Level | Score | What It Looks Like |
|-------|-------|--------------------|
| Disconnected | 5–8 | Mostly manual work; no shared templates |
| Foundational | 9–12 | Inconsistent AI use for simple tasks |
| Integrated | 13–16 | Shared Projects, consistent prompts, equity checks |
| Strategic | 17–20 | Processes redesigned around AI; automation chains |

**Features**
- Five multiple-choice questions, one per fluency dimension
- Instant scored result with level description
- Full reference grid rendered on result
- Automatic response logging (Google Apps Script)
- No dependencies; single-file HTML

---

## 02 — TCEA AI Custom Instructions Library

**Path:** `aici/index.html`  
**Live:** [mguhlin.github.io/aici/index.html](https://mguhlin.github.io/aici/index.html)

A browsable library of copy-paste custom instructions for purpose-built AI assistants. Each set of instructions can be dropped directly into any major Gen AI platform. Grew from the TCEA session *Automating Office Tasks with AI* (March 2026).

**Compatible Platforms**
- GPTs (ChatGPT)
- Claude Projects
- Google Gems
- BoodleBox Bots
- Microsoft Copilot
- NotebookLM

**Categories and Bots (35+)**

| Category | Bots Included |
|----------|--------------|
| Productivity | BLUF Bot, Outline Helper, Meeting Minutes Bot, Logic Architect, Project Kickstart |
| Communications | Email Responder, Newsletter Coach, PD Announcements Coach, Voice Card Builder |
| Content Creation | Diagram Generator, Animated GIF Creator, SlideDeckMaker, Session Designer |
| Education | Essay Reviser, Lesson Plan Assistant, Report Card Narrative, Rubric Builder, Employee Onboarding Guide |
| Analysis Tools | SWOTLinker Pro, Spreadsheet Analysis, TCEA PROTECT Assessment |
| Classroom AI Bots | SIFT Approach Bot, PRISM Framework, Skeptical Thinker, Vocabulary Bot, Freewriting Coach, AI Citation Assistant |
| Fun & Specialty | Personality Quizzes, Epictetus Guide, ETHICAL Model, Harmonica Tutorial, Madlibs Creator, Ethical AI Modules |
| More | PolicySummarizer, ParentCommunicator, GrantWritingHelper, DataNarrativeWriter, AccommodationAdvisor, CurriculumAligner |

**Features**
- Sticky sidebar navigation with 37 anchor sections
- One-click copy-to-clipboard for every instruction set
- Expandable card layout per bot
- Color-coded category tags (blue, gold, green)
- BoodleBox promotional code included (2-month free access)

---

## 03 — AI Prompt Architect & Workflow Guide

**Path:** `architect/index.html`

An interactive prompt optimizer and workflow identification guide. Paste any basic request, select a framework, and receive a ready-to-use engineered prompt plus a model recommendation.

**Prompt Frameworks**

| Framework | Best For | Recommended Model |
|-----------|----------|------------------|
| Triple-Check | High-stakes analysis requiring self-critique | Gemini 1.5 Pro or Claude Sonnet |
| Few-Shot | Consistent tone across multiple outputs | ChatGPT-4o or Claude Sonnet |
| Chain-of-Thought | Logic, math, complex reasoning | OpenAI o3 or Claude Sonnet |
| Tree-of-Thought | Multi-perspective problem solving | Claude Opus |
| Prompt Chaining | Multi-step workflows | BoodleBox Bot Stacking |
| RAG Organization | Knowledge-grounded answers | BoodleBox Knowledge Bank or NotebookLM |

**Strategic Workflow Models**
- **Problem-Based Learning (PBL)** — identify pain points with measurable ROI
- **Use Case Model** — find quick-win pilots using four pillars: Data-Driven, Repetitive, Predictive, Generative

**Features**
- Live prompt generation with copy-to-clipboard
- Model and tool recommendation per framework
- Glossary of 9 key concepts (including Bot Stacking, Nano Banana, Star Docs)
- Responsive single-file HTML; no dependencies

---

## 04 — TCEA AI Skills Suite — Nonprofit Edition

**Path:** `claude/index.html`  
**Bonus:** `claude/copywriting.html` — standalone copywriting frameworks visual

Seven downloadable Claude Skills for nonprofits and education-adjacent organizations. Each `.skill` file is a precision-engineered instruction set — upload once to a Claude Project and Claude applies it to every matching request automatically.

**Skills**

| Skill File | What It Produces |
|------------|-----------------|
| `blog-writer.skill` | Impact stories and donor updates in a consistent nonprofit voice |
| `pptx-builder.skill` | Download-ready `.pptx` board and funder decks via PptxGenJS |
| `infographic-designer.skill` | Blueprint-first PNG infographics from program data |
| `mermaid-designer.skill` | Branded Mermaid diagram code with TCEA color theming |
| `drawio-xml-builder.skill` | Importable mxGraph XML for Draw.io and diagrams.net |
| `rubric-builder.skill` | Analytic, holistic, and single-point rubrics |
| `lesson-plan-architect.skill` | Complete volunteer and staff training plans |

**Also Includes**
- 8-step Claude Cowork setup guide (requires Claude Pro + desktop app)
- "Ask First" method — make Claude generate clarifying questions before executing
- Feature table for all eight Claude surfaces: Chat, Cowork, Projects, Artifacts, Excel, Connectors, Plugins, Skills
- Claude Skills advanced reference (context7, ralph-loop, claude-mem, frontend-design, code-review-agents)
- Official Anthropic course catalog (8 courses at anthropic.skilljar.com)

---

## 05 — Coaching for Every Learner — UDL Protocols

**Path:** `cudl/index.html`  
**Live:** [mguhlin.github.io/cudl/index.html](https://mguhlin.github.io/cudl/index.html)

An interactive scenario-based coaching tool grounded in CAST UDL Guidelines 3.0. Built for the TCEA 2026 session on coaching every learner. Three separate protocol pages, each with randomized scenario cards.

**Protocols**

| File | Protocol | Focus |
|------|----------|-------|
| `index.html` | **ARC** — Acknowledge · Reframe · Commit | Validate teacher reality, shift toward UDL, agree on a next step |
| `nwn.html` | **Notice-Wonder-Next** | Observe evidence, pose an inquiry, determine the immediate step |
| `viva.html` | **VIVA** — Verify · Illustrate · Validate · Apply | Identify design barriers, model a UDL option, confirm with data, implement |

**UDL 3.0 Alignment (per scenario)**
- Engagement: Welcoming Interests & Identities · Sustaining Effort · Emotional Capacity
- Representation: Perception · Language & Symbols · Building Knowledge
- Action & Expression: Interaction · Expression & Communication · Strategy Development

**Scenarios include**
- The "Fairness" Dilemma (speech-to-text refusal)
- The "Textbook" Reliance
- Assessment Rigidity
- Time Constraint
- Cultural Disconnect
- Executive Function challenges
- Motivation myths
- Gifted student boredom

---

## 06 — Employee Onboarding Guide Generator

**Path:** `eog/index.html`  
**Examples:** `eog/tcea.html` · `eog/example1.html` (Mac Haik Georgetown)

A Claude Project system prompt that turns a company name into a complete, single-file HTML onboarding website. Claude searches the web for brand colors, addresses, hours, and organizational context before generating any HTML.

**Generation Workflow**
1. Claude searches for official website, brand colors, addresses, phone numbers, business hours, org structure, and systems
2. Extracts hex color codes and maps them to CSS variables
3. Confirms research summary with user before generating
4. Produces a fully styled, anchor-navigated HTML file

**Required Output Sections**
1. Human Resources & Payroll
2. Operational Systems
3. Safety & Compliance
4. Communication & IT
5. Systems / Platform-Specific (role-based)
6. Locations & Contact Info
7. First Week Checklist
8. Key Contacts

**Live Examples**

| File | Organization | Industry |
|------|-------------|---------|
| `tcea.html` | Texas Computer Education Association | Education Nonprofit |
| `example1.html` | Mac Haik Georgetown | Automotive Dealership |

**Features**
- Single-file HTML output (no dependencies except Google Fonts)
- Amber-styled placeholders for unverifiable data
- Sticky header with anchor nav
- Sidebar table of contents (sticky)
- Adapts section names to industry type
- Full iteration support (complete file regenerated on every change request)

---

## 07 — Think with Claude — Technical Orientation

**Path:** `twc/index.html`

A TCEA Knowledge Booster orientation series — four screencasts that prepare K–12 educators to use Claude's interface before a deeper professional learning series begins.

**Screencasts**

| # | Title | Duration | Topics |
|---|-------|----------|--------|
| SC1 | Creating Your Account & Navigating Claude | 9–10 min | Account setup, interface layout, first conversation, Free vs. Pro |
| SC2 | Projects, File Uploads & Artifacts | 10–11 min | Projects, file uploads, Artifacts panel, document workflow |
| SC3 | Personalizing Claude, Model Selector & Mobile | 8–10 min | Custom instructions, model selector, mobile app, voice input |
| SC4 | Power Habits — Working Smarter with Claude | 11–13 min | Context windows, session summaries, Julian date naming, role assignment |

**Total:** ~40 minutes · 2.0 CPE Credits

**Power Habits Covered (SC4)**
- Right-sizing your model (Haiku / Sonnet / Opus)
- Context window management
- Summarize & Continue prompt
- Deep Re-Prompt move (summary + next-session opening prompt)
- Session Summary (generate and paste at start of every new session)
- Julian Date naming convention for conversations (e.g., `26067-Unit-Overview`)
- One task per conversation discipline
- Working Agreement prompt
- Role assignment by project stage

**Copyable Prompts Included**
- Quick Summary
- Deep Summary + Re-Prompt
- Session Summary
- Auto-Remind (add to Project Instructions)
- Julian Date naming patterns
- Working Agreement template
- Role Assignment template

---

## 08 — BoodleBox Basics & Beyond / TxCA Office Automation

**Path:** `txca/index.html`

A dual-purpose reference: a 6-part webinar guide on BoodleBox for educators, and a comprehensive office automation guide mapping Texas Counseling Association (TxCA) administrative tasks to AI workflows.

### Webinar Guide (6 Parts)

| Part | Title | Duration |
|------|-------|----------|
| 1 | Welcome & The "Why" of BoodleBox | 10 min |
| 2 | Interface Tour & Quick Wins | 15 min |
| 3 | Mastering the Knowledge Bank | 15 min |
| 4 | Modes & Collaborative Group Chats | 15 min |
| 5 | Bot Stacking & App Smashing | 20 min |
| 6 | Wrap-Up, Q&A, and Next Steps | 15 min |

### Office Automation Guide — Task Categories

| Category | Tasks Covered |
|----------|--------------|
| Member Communication | Renewal reminders, welcome emails, newsletter content, inquiry responses |
| Conferences & Events | Session schedules, speaker logistics, CEU descriptions, post-event follow-up |
| Advocacy & Government Relations | Legislative alerts, bill summaries, position statements, testimony preparation |
| Membership & Chapter Operations | Reports, chapter communications, board onboarding |
| Professional Development & CE | CE applications, learning objectives, certificate generation, webinar copy |
| Marketing & Social Media | Awareness campaigns, sponsorship outreach, blog posts, A/B subject lines |
| Financial & Administrative | Board reports, grant applications, meeting minutes, invoicing |

### RAG Configurations (8 System Prompts)

| ID | Configuration | Use |
|----|--------------|-----|
| `rag-member-comms` | Member Communication Templates | On-brand renewal and welcome emails |
| `rag-member-faq` | Member FAQ & Policy Knowledge Base | Accurate member support responses |
| `rag-newsletter` | Newsletter & Content Calendar | Timely newsletter content |
| `rag-conference` | Conference Planning Playbook | Scheduling, proposals, speaker logistics |
| `rag-advocacy` | Advocacy & Legislative Toolkit | Bill summaries, action alerts, testimony |
| `rag-chapter` | Chapter Operations Guide | Board onboarding, governance queries |
| `rag-ce` | CE Program Standards & Templates | NBCC/TBHEC compliant CE applications |
| `rag-brand` | TCA Brand Voice & Social Content | Platform-specific social media posts |

---

## 09 — Career Longevity in EdTech Leadership

**Path:** `visuals/career.html`

An interactive data visualization comparing individual career tenure data against national benchmarks for K–12, nonprofit, and public sector leadership roles (1994–2026).

**Data Points**

| Metric | Value |
|--------|-------|
| Years in profession | 32 |
| Average tenure (all roles) | 6.2 years |
| Longest single tenure | 10 years (achieved twice) |
| Industry benchmark (education) | 5.3 years |
| Advantage over benchmark | +0.9 years |

**Roles Visualized**
- Campus & District Roles (1994–2000) — 6 years
- Northside ISD / HBU (2001–2002) — 1 year
- SAISD, Director of Instructional Technology (2002–2012) — 10 years
- East Central ISD, Director of Technology Operations (2012–2016) — 4 years
- TCEA, Director of Professional Development (2016–present) — 10 years

**Features**
- Scroll-triggered entrance animations
- Animated tenure bar fills
- Animated comparison bar charts (industry vs. individual)
- Collapsible sections with chevron toggle
- Fixed navigation dot system
- Three key takeaways: Organizational Loyalty, Defying Nonprofit Burnout, Strategic Mobility

---

## 10 — Visible Learning with Ed Tech

**Path:** `vlet/index.html`  
**Live:** [mglearn.github.io/vlet/](https://mglearn.github.io/vlet/)  
**BoodleBox Strategy Partner:** [box.boodle.ai/a/@VLET_StrategyPartner](https://box.boodle.ai/a/@VLET_StrategyPartner)

A comprehensive strategy reference grounded in John Hattie's *Visible Learning* research, Mike Bell's memory science, and CAST's UDL 3.0 Guidelines. For teachers, instructional coaches, and campus leaders.

**Core Content**

| Section | Key Ideas |
|---------|-----------|
| Evidence-Based Teaching | Effect sizes explained; Zone of Desired Effects (ES > 0.4) |
| Three Phases of Learning | Surface → Deep → Transfer; strategy-phase matching |
| SOLO Taxonomy | Pre-Structural through Extended Abstract with classroom examples |
| Strategy Table | 13 high-impact strategies with effect sizes and phase tags |
| Jigsaw Deep Dive | ES: 0.92 — only strategy effective in both Surface and Deep phases |
| Reciprocal Teaching | ES: 0.74 — Predict, Question, Clarify, Summarize |
| Concept Mapping | ES: 0.66 — BOOM model; map types by SOLO level |
| Transfer Learning | Problem-Solving Teaching (0.61) and Critical Thinking (0.79) |

**Instructional Frameworks (Tabbed)**

| Framework | Purpose |
|-----------|---------|
| ALDO | Amazing Lesson Design Outline — 5-step planning architecture |
| EIIR | TCEA Coaching Cycle — Empower, Investigate, Implement, Reflect |
| RISE Goals | Relevant, Impactful, Specific, Energized goal-setting criteria |
| LEARNS Cycle | Mike Bell's memory-aligned instructional design cycle |
| FLOATER | Melanie Trecek-King's claim evaluation framework (7 criteria) |
| SIFT | Mike Caulfield's media literacy method (Stop, Investigate, Find, Trace) |

**High-Impact Strategies Reference**

| Strategy | Effect Size | Phase |
|----------|-------------|-------|
| Collective Teacher Efficacy | 1.01 | All |
| Video Microteaching | 0.99 | Professional Learning |
| Jigsaw Method | 0.92 | Surface + Deep |
| Argumentation | 0.86 | Deep |
| Teacher Clarity | 0.85 | All |
| Self-Reported Grades | 0.81 | All |
| Critical Thinking | 0.79 | Deep + Transfer |
| Reciprocal Teaching | 0.74 | Deep |
| Concept Mapping | 0.66 | Deep |
| Vocabulary Programs | 0.62 | Surface |
| Problem-Solving Teaching | 0.61 | Transfer |

**AI Use by SOLO Level**
Each level maps to a specific AI role: from teacher-led exposure (Pre-Structural) through AI as prototyping tool (Extended Abstract). Includes a caution on the shortcut problem — AI-generated work that looks Extended Abstract without the underlying understanding.

---

## Repository Structure

```
/
├── acl/                    AI Capability Ladder Self-Assessment
│   ├── index.html
│   └── LICENSE
├── aici/                   TCEA AI Custom Instructions Library
│   ├── index.html
│   ├── README.md
│   └── LICENSE
├── architect/              AI Prompt Architect & Workflow Guide
│   └── index.html
├── claude/                 TCEA AI Skills Suite — Nonprofit Edition
│   ├── index.html
│   ├── copywriting.html
│   ├── README.md
│   └── skills/             Downloadable .skill files
│       ├── blog-writer.skill
│       ├── pptx-builder.skill
│       ├── infographic-designer.skill
│       ├── mermaid-designer.skill
│       ├── drawio-xml-builder.skill
│       ├── rubric-builder.skill
│       └── lesson-plan-architect.skill
├── cudl/                   Coaching for Every Learner — UDL Protocols
│   ├── index.html          ARC Protocol
│   ├── nwn.html            Notice-Wonder-Next
│   ├── viva.html           VIVA Framework
│   └── LICENSE
├── eog/                    Employee Onboarding Guide Generator
│   ├── index.html          System prompt & documentation
│   ├── tcea.html           TCEA example
│   ├── example1.html       Mac Haik Georgetown example
│   └── LICENSE
├── twc/                    Think with Claude — Orientation
│   └── index.html
├── txca/                   BoodleBox & TxCA Office Automation
│   └── index.html
├── visuals/                Data Visualizations
│   └── career.html
├── vlet/                   Visible Learning with Ed Tech
│   └── index.html
├── index.html              Portfolio landing page (this repository's menu)
└── README.md               This file
```

---

## Usage

All projects are self-contained HTML files. No build step, no package manager, no server required.

```bash
# Clone the repository
git clone https://github.com/mguhlin/creations.git

# Open any project directly in a browser
open creations/index.html
open creations/vlet/index.html
open creations/cudl/index.html
```

For the Claude Project tools (`claude/`, `eog/`), copy the system prompt text from the documentation page and paste it into a Claude Project's Custom Instructions field at [claude.ai](https://claude.ai).

---

## License

All projects in this repository are released under the [CC0 1.0 Universal](LICENSE) public domain dedication. You may copy, modify, distribute, and use the work for any purpose without permission or attribution, though both are appreciated.

---

## Contact

**Miguel Guhlin**  
Director of Professional Development, TCEA  
[mguhlin.org](https://mguhlin.org) · [mguhlin@tcea.org](mailto:mguhlin@tcea.org) · [blog.tcea.org](https://blog.tcea.org)
