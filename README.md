# Vanguard Trust Lab

An independent, evidence-bounded study of Riot Vanguard's public host-trust model, paired with a small cross-platform security lab.

[![CI](https://github.com/Alierkn/vanguard-trust-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/Alierkn/vanguard-trust-lab/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Alierkn/vanguard-trust-lab/actions/workflows/codeql.yml/badge.svg)](https://github.com/Alierkn/vanguard-trust-lab/actions/workflows/codeql.yml)
[![GitHub release](https://img.shields.io/github/v/release/Alierkn/vanguard-trust-lab?display_name=tag&sort=semver)](https://github.com/Alierkn/vanguard-trust-lab/releases)
[![License: MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-071B3D)](LICENSE.md)

![Vanguard Trust Lab interface showing a public trust model and local integrity workflow](assets/screenshots/trust-lab-overview.png)

## Why the lab exists

The Lab is not a workaround for developing on macOS. It is the project's reproducible experiment layer and runs in a modern browser on macOS, Windows, or Linux.

It turns three abstract security questions into observable behavior:

1. **Where is the trust boundary?** A simplified diagram makes the user-mode/kernel-mode privilege transition visible.
2. **How is a posture decision assembled?** A manual checklist shows how several public platform requirements combine without pretending to inspect the host.
3. **What does integrity prove?** A local SHA-256 experiment distinguishes byte equality from authenticity, safety, and authorization.

This gives readers something they can run, challenge, and reproduce instead of relying only on prose. Even on a Windows computer with Vanguard installed, this public Lab would intentionally avoid driver inspection, game-memory access, traffic capture, reverse engineering, or private protocol interaction. Its value is methodological: it demonstrates bounded claims safely.

## Research question

> How does Riot Vanguard seek host-level game integrity, and what security and availability trade-offs follow from privileged enforcement and stronger platform requirements?

The analysis separates four evidence classes:

- **Riot statement** — a first-party product or architecture description;
- **Microsoft platform mechanism** — documented Windows behavior or requirements;
- **project inference** — a conditional interpretation of the public evidence;
- **demonstrator result** — behavior reproduced by this repository's tests or browser app.

Vendor statements are not presented as independent verification, and Lab results are never presented as a Vanguard audit.

## Try it locally

Requirements: Node.js 24 LTS and npm 11 for the maintained development environment.

```sh
npm ci --ignore-scripts
npm run ci
npm run serve
```

Open `http://127.0.0.1:8000`. The same static application is published through GitHub Pages.

The page has no runtime package dependency, analytics, remote JavaScript, external font, account system, backend, or upload endpoint. Selected files are hashed locally through the Web Cryptography API and the baseline is kept only in memory.

## What the Lab does — and does not do

| It does | It does not |
|---|---|
| Visualize a public, simplified privilege model | Inspect `vgk`, `vgc`, Windows, firmware, or the current device |
| Model five documented On-Demand requirement groups through manual input | Reproduce Vanguard Pre-Check or decide device eligibility |
| Compare local bytes with an in-memory SHA-256 baseline | Prove that a file is authentic, safe, authorized, or malware-free |
| Provide deterministic samples and tests | Implement anti-cheat detection, attestation, bypasses, or exploits |

## Repository map

| Path | Purpose |
|---|---|
| `app/` | Dependency-free browser Lab deployed to GitHub Pages. |
| `research/` | Question, methodology, threat model, public sources, claims, and limitations. |
| `tests/` | Unit, repository-integrity, privacy, and security-policy checks. |
| `docs/` | Reproducibility, decisions, publication security, and maintenance guidance. |
| `scripts/` | Cross-platform local server, verification, link policy, and checksums. |
| `.github/` | Least-privilege CI, CodeQL, Pages, release packaging, and Dependabot. |

## Reproduce the fixed result

```sh
npm test
npm run verify
```

Expected SHA-256 values:

- Sample A: `6af1022470965f08d997eb048309a6b95b898289e19f224df7a3e91604ff004b`
- Modified Sample B: `7240f01f4de745ed075feea3edd5d02c8632979050f31126faf3c5cfd44c10a6`

Using Sample A as the baseline and comparing Modified Sample B produces `MISMATCH`. That result establishes only that the bytes differ.

## Public-by-design security

- This repository was created with a fresh Git history; restricted authoring files and personal metadata were never imported.
- The static site has a restrictive Content Security Policy and no remote runtime dependencies.
- GitHub Actions use least-privilege tokens, immutable full-length commit pins, timeouts, and concurrency limits.
- CI validates evidence links, claim/source relationships, public-release boundaries, PII patterns, and deterministic behavior.
- CodeQL, Dependabot, secret scanning, push protection, and private vulnerability reporting complement the repository checks.
- Releases contain source bundles and checksums only—no private submissions, account data, device captures, or third-party binaries.

See [Security Architecture](docs/security-architecture.md), [Security Policy](SECURITY.md), and [Ethics and Scope](research/ethics-and-scope.md).

## Evidence and limits

The public source register uses primary material from Riot Games, Microsoft, NIST, and W3C. Product and platform pages can change; access dates and bounded wording are recorded in [`research/sources.csv`](research/sources.csv) and [`research/claims.csv`](research/claims.csv).

The project contains no live Vanguard measurement and makes no statement about a specific installation, player, account, or computer. See [Limitations](research/limitations.md).

## Licensing and trademarks

Software is MIT-licensed. Original prose and diagrams are CC BY 4.0 unless a file states otherwise. Riot Games, League of Legends, Vanguard, Microsoft, Windows, and other names are trademarks of their respective owners.

This independent educational research project is not affiliated with, endorsed by, or sponsored by Riot Games or Microsoft. See [Disclaimer](DISCLAIMER.md) and [Notices](NOTICE.md).
