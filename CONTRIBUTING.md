# Contributing

Contributions are welcome when they improve correctness, reproducibility, accessibility, or explanatory value without expanding the project into reverse engineering or adversarial implementation.

## Suitable changes

- factual corrections backed by an official primary source;
- accessibility, documentation, or cross-platform improvements;
- deterministic tests and privacy/security hardening;
- clearer separation of vendor statements, platform mechanisms, project inference, and demonstrator results;
- reviewed maintenance updates to pinned tooling.

Requests involving Vanguard inspection, bypass research, cheat development, exploit code, credentials, packet interception, or kernel-driver development are out of scope.

## Local workflow

```sh
npm ci --ignore-scripts
npm run ci
npm run serve
```

Use a short-lived branch and a focused pull request. Conventional Commit examples:

- `docs: distinguish integrity from authenticity`
- `fix: preserve baseline state after file selection`
- `test: add public-metadata regression coverage`
- `research: correct On-Demand requirement wording`

## Evidence requirements

Any material factual change must update `research/claims.csv` and, when needed, `research/sources.csv`. Prefer official Riot, Microsoft, NIST, or standards documentation. Secondary commentary can assist discovery but must not become the sole basis of a technical claim.

## Pull request checklist

- The change stays within the ethical scope.
- `npm run ci` passes.
- Changed claims use a registered source and bounded wording.
- No personal data, private document, generated office file, archive, or copyrighted source copy is committed.
- No new external runtime dependency or network request is introduced without a documented security review.
- User-facing behavior is documented and tested.

Evidence discipline is more important than rhetorical certainty.
