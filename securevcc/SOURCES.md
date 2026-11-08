# SecureVCC sources

SecureVCC combines the supplied website-assessment Markdown, the supplied Cloudflare audit-skill archive, and the creator's advice about hardcoded credentials, frontend environment variables, server-side secrets, and revocation after exposure.

## Original supplied files

- [seccheck.md](sources/seccheck.md): practical web assessment, authorization boundaries, database policies, secrets, OWASP verification, accessibility, vendor evidence, and creator-ready reporting.
- [security-audit-skill-main.zip](sources/security-audit-skill-main.zip): the original source archive from [Cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill). Its methodology covers reconnaissance, planned coverage, vulnerability investigation, validation, severity, and reporting, with specialist domains for browser/HTTP/authentication, AI, cloud, supply chain, protocols, data lifecycle, availability, native code, and local applications.
- [Cloudflare MIT license](sources/cloudflare-MIT-LICENSE.txt): the archive's original license. The full notice is also retained inside `securevcc.md` so the skill can travel as one file.

These are preserved inputs, not a claim that the ZIP matches the upstream repository's current revision. The originals are reference material and may mention files not supplied with this project. SecureVCC does not depend on those files.

## What the adaptation changes

- Compresses the multi-file audit workflow into one portable Markdown skill.
- Retains source-to-sink reasoning, explicit trust boundaries, disconfirmation, realistic severity, scoped safe validation, and honest coverage reporting.
- Adds focused, full-audit, and secure-build/fix modes so a small question does not trigger an unrelated full audit.
- Removes mandatory subagent orchestration, custom JSON schemas, external validators, and companion-file dependencies. Independent review remains optional when available and permitted.
- Preserves separate accessibility and vendor evidence tracks from the supplied Markdown, without requiring its referenced image.
- Makes the private-password/API-key question, frontend bundle inspection, server-only privileged credentials, and exposed-key revocation a dedicated first section.
- Keeps platform-specific checks conditional and requires adding application-specific abuse cases beyond the checklist.

## Official reference material

| Resource | How SecureVCC uses it |
| --- | --- |
| [OWASP Top 10:2025](https://top10.owasp.org/2025/) | Web-risk categories and a starting coverage map; not a complete test standard |
| [OWASP ASVS 5.0.0](https://asvs.owasp.org/) | Select appropriate verification requirements and cite exact verified versions/identifiers |
| [OWASP WSTG 4.2](https://owasp.org/www-project-web-security-testing-guide/v42/) | Versioned web test procedures; distinguish released guidance from development content |
| [OWASP GenAI risks](https://genai.owasp.org/llm-top-10/) | Additional AI/LLM review topics where models participate in trust-sensitive operations |
| [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | Credential handling, lifecycle, and rotation considerations |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [WCAG 2.1](https://www.w3.org/TR/WCAG21/) | Selected accessibility targets and exact criterion text; no blanket conformance claim |
| [W3C Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/) | Initial accessibility review, with its limitations |

Use the current authoritative provider documentation and advisories for the exact stack under review. A reference link or category mapping is not evidence that a control passed. SecureVCC is not endorsed or certified by OWASP, W3C, or Cloudflare.

## File integrity

SHA-256 identifies the preserved input bytes; it does not establish the trustworthiness of a source.

```text
f7f1fcb4960bfac454148bf35f3dc1ee1c8949b39d5232805cfa2ac7ebd0261f  seccheck.md
03978c2563b15b4ecb609f5f96029d89a12604e0457d0f2e69faf24a56c57ae1  security-audit-skill-main.zip
e598e694aa506650c7192d5ea3be0e50aca0d356ea00551c53429f0b01eb6391  cloudflare-MIT-LICENSE.txt
```

## Illustration and licensing

The front-page illustration is the creator-supplied **Retro Secure Coding Workstation.png**, optimized to WebP without changing its composition. It illustrates the topic; its text is not executable code or verification evidence. Essential guidance is available as real page text and in the downloadable skill.

The skill's MIT notice is included inside `securevcc.md`. Original source files, standards, and the illustration retain their own applicable terms. A general CC0 label elsewhere in the portfolio does not override this folder's MIT notice or third-party rights.
