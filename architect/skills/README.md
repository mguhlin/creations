# The Skills Library

Live: https://mguhlin.github.io/creations/architect/skills/

This is a dedicated page within The Prompt Library, rather than a separate site. It introduces reusable Agent Skills, explains common-format authoring and host-specific setup, and offers six independent downloads. It uses the existing navy, slate blue, and white visual language.

## Maintain the collection

- Edit starter metadata and example requests in `catalog.json`.
- Edit each skill in `packages/<name>/SKILL.md` and its practice tests in `eval.md`. Keep each folder name identical to the frontmatter name.
- Edit the page structure in `page.template.html`, styles in `library.css`, and copy behavior in `library.js`.
- Run `python3 scripts/build_skills_library.py` from the repository root. It rebuilds the page, single-folder ZIPs, and checksum manifest. ZIPs are deterministic; the timestamps are fixed and are not release dates.
- Run `python3 scripts/refresh_prompt_library.py` after catalog changes to update the main library's searchable skill entries. This also renders image challenges and glossary entries from `architect/assets/`.

The six instruction sets are new original starters, based on the supplied `Skill-Starter-Library.md` overview and recurring workflows in Miguel's public projects. The overview named original ZIPs but did not supply them. In particular, No AI Slop is an original implementation, not a reproduction of an unavailable SKILL.md or eval.md.

Each downloadable ZIP contains exactly one skill folder with `SKILL.md`, `eval.md`, and `LICENSE.txt`. There are no executable scripts, tool dependencies, account identifiers, or platform-specific paths in the starter packages. Source Integrity needs browsing for external verification; other checks adapt to the tools actually available.

## Sources and inspiration

The public page credits these projects. Their instructions are not bundled or copied into the original starter packages.

| Project | Ideas considered | License checked in the relevant folder |
| --- | --- | --- |
| [Anthropic Skill Creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | Realistic evaluation prompts and iteration from results | Apache 2.0 |
| [Anthropic Web App Testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | Inspecting and exercising an actual artifact | Apache 2.0 |
| [OpenAI Skill Creator](https://github.com/openai/skills/tree/main/skills/.system/skill-creator) | Focused discovery descriptions and optional supporting resources | Apache 2.0 |
| [Siqi Chen's Humanizer](https://github.com/blader/humanizer) | Concrete editing patterns and meaning preservation | MIT |

Current setup and format references: [Agent Skills](https://agentskills.io/specification), [OpenAI](https://learn.chatgpt.com/docs/build-skills), and [Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude). Platform support differs by surface and workspace permissions; do not promise identical behavior or universal installation.

## Main Prompt Library changes

The main library keeps its existing categories and examples. It now has 313 prompt cards, including eight fun image challenges; 53 glossary entries; and links to all six skills. Search covers prompt content, skill descriptions and example requests, and glossary definitions. Queries support unordered words, quoted phrases, Unicode normalization, ampersands, and a shareable `?q=` parameter. Escape clears search; `/` focuses it.

The editorial pass corrected 144 double-encoded ampersands and edited 54 existing prompt cards. It removes unsupported numerical claims and stale model recommendations, improves missing-input handling, and distinguishes a draft or subjective review from verified results. The Prompt Architect's six patterns now ask for useful outputs and checks rather than fabricated expert debates or private internal reasoning. Custom slash commands preserve the host's instruction hierarchy.

## Artwork

The built-in imagegen tool generated both project-bound assets:

- `architect/assets/skills-library-hero.webp`: 1440 × 720; approximately 175 KB.
- `architect/assets/prompt-library-splash.webp`: 800 × 400; approximately 18 KB, displayed at 290 px wide on a large screen and 180–200 px on smaller screens.

Exact generation prompts: `image-prompts.json`. Both images have live HTML headings, alt text, and a small generated-image disclosure. The Prompt Library splash remains compact.

## Validation

The skill-creator validator passed for all six folders. Local checks verified links and anchors, one-folder ZIP structure, checksums, and byte-for-byte matches between ZIP entries and editable sources. Browser checks covered copying, a real download, multiword and phrase search, skill and glossary search, URL queries, all six architect patterns, navigation, access without JavaScript, and 360/412/800/1440 px layouts. Screenshots were inspected for both library pages.

The practice cases are not claimed as completed ChatGPT or Claude behavioral benchmarks. Run them in the accounts and tools where a skill will actually be used, including a normal request, an edge case, and an unrelated request.

Publication uses this repository's existing GitHub Pages deployment from `main` at `/`; no additional hosting service or build workflow is needed. The root `.nojekyll` keeps SKILL.md files with YAML frontmatter available as their original Markdown instead of converting them to HTML. The existing site is static HTML and has no Jekyll configuration or layouts.
