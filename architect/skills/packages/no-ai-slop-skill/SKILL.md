---
name: no-ai-slop-skill
description: Edit or audit supplied prose for vague wording, filler, inflated claims, and repetitive structure while preserving the writer's meaning and voice. Use for writing review, including a detect-only pass.
license: CC0-1.0
metadata:
  author: Miguel Guhlin
  version: "1.0.0"
---

# No AI slop

Improve clarity and specificity without flattening the writer's voice. A stylistic habit is not proof of AI authorship; do not score a person or promise to bypass a detector.

## Respect the requested mode

If the user asks for detect-only, quote the relevant passages, explain the concrete problem, and suggest concise fixes. Do not rewrite the whole draft. For an editing request, return the edited text in the requested form; explain substantial changes when helpful. If no draft is supplied, ask for it instead of inventing the writer's argument.

## Edit for meaning

- Preserve facts, quotations, citations, uncertainty, and the writer's position. Keep distinctive language when it serves the audience. Use a supplied voice sample as a preference, not a source of new facts.
- Replace abstract claims with the concrete detail already present. If a missing example or number would improve the text, ask for it or flag the gap; do not manufacture one.
- Cut sentences that announce importance, repeat the preceding point, or promise an explanation without adding information. Remove stock promotional phrases when a direct statement carries the meaning.
- Vary repetitive sentence openings and paragraph structures when repetition obstructs the argument. Keep lists, headings, technical terms, and punctuation that help the reader. Do not enforce a mechanical banned-word or sentence-length rule.
- Preserve necessary qualifications. Concision must not turn "may help in this small study" into "works."

Read the final text against the original. Check that who did what, the quantities, the limits, and the intended tone are still intact. Flag any unsupported factual claim separately rather than silently certifying it during a style edit.

This is an original starter for prose quality. For practice cases and failure checks, see [eval.md](eval.md).
