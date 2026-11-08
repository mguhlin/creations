# SecureVCC — Secure Vibe-Coded Creations

A portable security skill for reviewing and hardening AI-assisted apps, websites, APIs, scripts, and desktop tools.

**[Security checklist](https://mguhlin.github.io/creations/securevcc/#checklist)** · **[Open the site](https://mguhlin.github.io/creations/securevcc/)** · **[Download securevcc.md](https://mguhlin.github.io/creations/securevcc/securevcc.md)** · [Sources](SOURCES.md)

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

For a state-machine review:

> Use SecureVCC to find the implicit state machines in this app. Map states, events, guards, side effects, persistence, failure, cancellation, retries, and recovery. Choose focused improvements that benefit the user experience (UX), developer experience (DX), and agent experience (AX) together. Preserve working behavior and public interfaces, explain tradeoffs, and verify normal, invalid, stale, and partially failed transitions with meaningful regression checks.

## Practical questions to ask

Prefix a focused request with “Use SecureVCC.” Ask for source evidence and safe synthetic tests, not just reassurance.

| Question | What the review should establish |
| --- | --- |
| Are private passwords or API keys hardcoded or delivered to the browser? | Server-only secrets, actual bundle inspection, and revocation of exposed credentials |
| Can someone read or change private database data without logging in, or see another person’s order by changing an ID? | Authentication **and** per-object authorization, effective RLS/storage policies, and anonymous/user/tenant separation |
| Are password-reset links random, short-lived, account-bound, and single use? Do administrators have enforced MFA? | Safe recovery, attempt limits, replay rejection, protected MFA fallback, and verified provider settings |
| Does the server trust browser prices, discounts, trial eligibility, roles, or recipient lists? | Final authority on the server, backed by authoritative records and permission checks |
| Can double clicks, retries, or a timeout create duplicate charges or accounts? | Durable, atomic idempotency, stable operation IDs, and reconciliation of unknown outcomes |
| Are Stripe webhooks verified before granting paid access? | Correct signing secret and raw-body verification, order/amount checks, and safe duplicate/out-of-order handling |
| What happens when an external call hangs or a multi-step operation partly fails? | Explicit deadlines, bounded safe retries, appropriate transactions or saga compensation, and recoverable state |
| Can we safely cache repeated reads and paginate large queries? | Measured improvements, permission-scoped caches, invalidation, capped queries, stable pagination, and appropriate indexes |
| Can two different requests book the same slot, redeem one deal twice, or overspend a balance? | Atomic resource constraints and concurrency tests across actors/instances; idempotency alone is insufficient |
| Can a changed file name or direct storage request open, upload, replace, or delete someone else’s file? | Ownership checks, traversal protection, constrained storage grants, and upload validation beyond the file picker |
| Can a supplied URL reach a private/internal address through the server? | SSRF destination/redirect controls and bounded fetches, using only controlled local fixtures |
| Is untrusted input safe in database queries and every HTML/Markdown rendering context? | Parameterized SQL, deliberate validation/escaping/sanitization, and demonstrated SQL-injection/XSS prevention |
| Can someone send fake official notifications or spam unrelated users? | Authorized senders/recipients, controlled wording and destinations, consent, and rate limits |
| Can someone call the email/SMS API directly and send arbitrary messages or recipients? | Server-only credentials, constrained public workflows or authorized senders, recipient/template checks, and abuse limits |
| Does the site restrict unwanted framing without breaking intentional embeds? | Effective CSP `frame-ancestors` response headers and scoped browser checks |
| Can we establish which terms a user agreed to? | Trusted identity, retained terms version/text, server acceptance time, and protected records; legal validity assessed separately |
| If something failed yesterday, could we reconstruct the relevant sequence? | Useful redacted logs, correlation IDs, protected access, appropriate retention, and tested alerts |
| Will the actual user journey work after a change? | Browser smoke tests of meaningful pages/results with synthetic accounts and mocked/sandboxed external effects |
| Do dependency alerts and security-update PRs cover this project? | Effective Dependabot/equivalent settings, tested updates, and actual merge/deployment status |

## Security, reliability, and optional polish

The skill includes safe caching, pagination, idempotency, timeouts, compensation, and notification checks when the architecture needs them. It does not require a cache or saga framework for every app. A timeout does not prove that a payment failed, and compensation cannot always undo a completed action.

For requested UX/launch work, it also checks favicon, readable mobile text, consistent CTAs and heading roles, measured asset/rendering performance, and optional motion that respects reduced-motion preferences. For a published mobile app, banners and store-review prompts are optional product checks subject to platform rules. These are separate from security vulnerabilities; a missing animation or store prompt is not a security failure.

For apps taking payments, business structure, separate finances, insurance, and obligations belong in a separate discussion with qualified legal/accounting advisers. An LLC is not universally required, and neither an entity nor a bank account guarantees protection of personal assets. SecureVCC does not form entities, open accounts, or move money.

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
- Server authority, payment/webhook verification, durable idempotency, transactions/saga compensation, safe timeouts/retries, push notifications, rate limits, and API/AI spending.
- Permission-aware caches, invalidation, capped pagination, query indexes, asset loading, and measured rendering performance.
- Implicit state machines, authoritative state, transition guards, truthful completion, cancellation/retry recovery, and joint UX/DX/AX decisions.
- Data lifecycle, deletion and restore, cryptography, dependencies and Dependabot/equivalent coverage, CI/release integrity, cloud deployment, investigation logs, alerts, smoke tests, and failure recovery.
- AI retrieval, memory, tools, MCP, intent/approval binding, private data, and generated output.
- Conditional desktop/mobile/CLI/local-service and native-code checks.
- Separate accessibility, optional launch/UX quality, business-readiness questions, and vendor-assurance reviews when applicable.

It requires evidence for findings, tracks PASS / FAIL / NOT RUN / N/A, distinguishes confirmed vulnerabilities from unresolved candidates and hardening, and asks the assistant to look for overlooked boundaries before finishing. A full audit includes an operation/permission matrix, coverage ledger, prioritized findings, and retest evidence. Focused questions remain focused.

No file or checklist can guarantee that every vulnerability will be found. This is a review aid, not a certification, legal opinion, penetration-testing authorization, or substitute for specialist review of high-risk systems. Tools and provider settings that cannot be inspected remain explicitly unverified.

## Files

| File | Purpose |
| --- | --- |
| `securevcc.md` | The complete single-file skill; rename to `SKILL.md` for supported skill folders |
| `build.py` | Website preview synchronization and checklist consistency check; not required to use the skill |
| `index.html` | Accessible static landing page, installation guidance, prompts, download, and readable skill preview |
| `assets/favicon.svg` | Local browser-tab icon |
| `assets/securevcc-workstation.webp` | Optimized copy of the supplied retro workstation illustration |
| `SOURCES.md` | Source notes, official reference links, and source-file checksums |
| `sources/seccheck.md` | Original supplied website-security Markdown, preserved as provenance |
| `sources/security-audit-skill-main.zip` | Original supplied Cloudflare audit-skill ZIP, preserved as provenance |
| `sources/cloudflare-MIT-LICENSE.txt` | Original upstream MIT license |

The source ZIP is reference material; it is not needed to install or use SecureVCC. Original source documents may reference supporting files that were not supplied. SecureVCC itself has no such dependencies.

## Maintain the website

After editing the downloadable skill, run `python3 securevcc/build.py` from the repository root. It refreshes the full preview and checklist count, and requires every skill check ID to appear exactly once in the public checklist. Add or revise the plain-language checklist entries when their corresponding checks change. Run `python3 securevcc/build.py --check` before publication; CI reports the same consistency check. This publishing helper is optional website tooling, not a dependency of the one-file skill.

## Reuse

SecureVCC adapts the supplied `seccheck.md`, [Cloudflare's security-audit-skill](https://github.com/cloudflare/security-audit-skill), and the creator's secret-handling advice. The skill retains the full MIT notice in its own file. The upstream ZIP retains its original license. This folder's SecureVCC skill is an exception to any general CC0 label elsewhere in the Creations collection: retain its MIT attribution and notice. Official standards remain under their respective publishers' terms. The illustration was supplied by the creator; the skill's MIT notice does not relicense third-party standards or the illustration.
