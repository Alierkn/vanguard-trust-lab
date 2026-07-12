# Research Package

This directory is the auditable evidence layer behind the browser Lab.

## Contents

- `research-question.md` — question, objectives, success criteria, and non-goals.
- `methodology.md` — evidence-bounded qualitative case-study method.
- `architecture.md` — simplified public component and trust model.
- `threat-model.md` — assets, adversary, controls, assumptions, and residual risk.
- `sources.csv` — public primary-source register.
- `claims.csv` — material claims, evidence class, allowed wording, and prohibited overclaim.
- `evidence-freeze.md` — public evidence snapshot and reopening rules.
- `limitations.md` — validity and generalization limits.
- `ethics-and-scope.md` — explicit safe research boundary.

## Evidence rule

A sentence about Vanguard must not silently move between evidence classes. A Riot statement can support “Riot states that…” but cannot by itself support “independent testing proves that…”. A project inference remains conditional even when technically plausible.

## Updating a claim

1. Identify the claim in `claims.csv`.
2. Read the registered primary source at the relevant location.
3. Record the narrow wording the source establishes.
4. Update the access date when a public page is rechecked.
5. Run `npm run ci`.
6. Explain material changes in the pull request and changelog.

Do not commit private documents, copyrighted source copies, personal data, or long quotations from public sources.
