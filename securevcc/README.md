# SecureVCC — Secure Vibe-Coded Creations

A portable security skill for reviewing and hardening AI-assisted apps, websites, APIs, scripts, and desktop tools.

**[Open the site](https://mguhlin.github.io/creations/securevcc/)** · **[Download securevcc.md](https://mguhlin.github.io/creations/securevcc/securevcc.md)** · [Sources](SOURCES.md)

## Get started

Download `securevcc.md`. It contains the complete skill, including its license; the other files are optional reading and provenance.

For an assistant that supports folder-based Markdown skills, create a folder named `securevcc` in that assistant's supported skills directory and save the download there as `SKILL.md`. Follow your assistant's current installation instructions. This download is plain Markdown, not a proprietary installer or executable.

For other coding assistants, attach the file or paste its contents and explicitly ask the assistant to follow it. Context limits, tool access, and instruction support vary. Reading the file does not automatically install it, run an audit, or give the assistant access to your code.

Start with:

> Use SecureVCC to review this project before launch. Begin by checking for hardcoded private passwords and API keys, including anything bundled into the browser. Review all applicable security domains, validate findings, and report evidence, fixes, and checks you could not run. Start with source review and safe local synthetic tests. Do not test a deployed service without authorization.

For a narrow review:

> Use SecureVCC to check authentication, tenant isolation, and database rules. Report demonstrated vulnerabilities separately from hardening suggestions and unresolved questions.

For repairs:

> Use SecureVCC to fix the confirmed findings in this project. Preserve intended behavior, add meaningful regression checks, and report what passed and what still needs verification. Do not deploy unless deployment is already authorized.

## The secrets advice to remember

Ask your coding assistant: **“Are my private passwords and API keys hardcoded in this app, committed to Git, or included in anything sent to the browser?”**

Someone who sees an exposed privileged key may be able to access your database or spend money through your accounts. Keep private credentials on the server, delivered through server environment configuration or a managed secret store. Keep local `.env` files out of Git and public build folders.

**Frontend environment variables can still be shipped in public JavaScript.** An `.env` file is not an encrypted safe. Check the actual browser bundle, generated HTML, serialized props, source maps, logs, and deployment configuration.

**If a key was exposed, revoke it and issue a replacement.** Moving it into an env file or deleting it from source is not enough. Update authorized consumers and confirm revocation with the provider. A public client configuration or publishable key is not automatically a secret; its permissions and effective backend rules matter.

## What it covers

The skill selects checks for the project's actual architecture:

- Passwords, API keys, Git history, frontend bundles, secret storage, and exposure response.
- Authentication, sessions, account recovery, OAuth, MFA, authorization, tenant isolation, and database/storage rules.
- Injection, HTML/Markdown/AI rendering, files and archives, SSRF, browser trust, HTTP/proxies, caching, and offline storage.
- Business rules, payments, webhooks, queues, concurrency, resource limits, and API/AI spending.
- Data lifecycle, deletion and restore, cryptography, dependencies, CI/release integrity, cloud deployment, logging, alerts, and failure recovery.
- AI retrieval, memory, tools, MCP, intent/approval binding, private data, and generated output.
- Conditional desktop/mobile/CLI/local-service and native-code checks.
- Separate accessibility and vendor-assurance reviews when applicable.

It requires evidence for findings, tracks PASS / FAIL / NOT RUN / N/A, distinguishes confirmed vulnerabilities from unresolved candidates and hardening, and asks the assistant to look for overlooked boundaries before finishing. A full audit includes an operation/permission matrix, coverage ledger, prioritized findings, and retest evidence. Focused questions remain focused.

No file or checklist can guarantee that every vulnerability will be found. This is a review aid, not a certification, legal opinion, penetration-testing authorization, or substitute for specialist review of high-risk systems. Tools and provider settings that cannot be inspected remain explicitly unverified.

## Files

| File | Purpose |
| --- | --- |
| `securevcc.md` | The complete single-file skill; rename to `SKILL.md` for supported skill folders |
| `index.html` | Accessible static landing page, installation guidance, prompts, download, and readable skill preview |
| `assets/securevcc-workstation.webp` | Optimized copy of the supplied retro workstation illustration |
| `SOURCES.md` | Source notes, official reference links, and source-file checksums |
| `sources/seccheck.md` | Original supplied website-security Markdown, preserved as provenance |
| `sources/security-audit-skill-main.zip` | Original supplied Cloudflare audit-skill ZIP, preserved as provenance |
| `sources/cloudflare-MIT-LICENSE.txt` | Original upstream MIT license |

The source ZIP is reference material; it is not needed to install or use SecureVCC. Original source documents may reference supporting files that were not supplied. SecureVCC itself has no such dependencies.

## Reuse

SecureVCC adapts the supplied `seccheck.md`, [Cloudflare's security-audit-skill](https://github.com/cloudflare/security-audit-skill), and the creator's secret-handling advice. The skill retains the full MIT notice in its own file. The upstream ZIP retains its original license. This folder's SecureVCC skill is an exception to any general CC0 label elsewhere in the Creations collection: retain its MIT attribution and notice. Official standards remain under their respective publishers' terms. The illustration was supplied by the creator; the skill's MIT notice does not relicense third-party standards or the illustration.
