# Public Release and Archive Policy

## Version model

Semantic versions identify the public research-software artifact. A release is immutable; corrections require a new version. `VERSION`, package metadata, lockfile metadata, `CITATION.cff`, and `project/manifest.json` must agree before tagging.

## Allowed v1.1.0 release assets

- source ZIP built from the tagged public commit;
- `CHECKSUMS.sha256` for that archive.

The GitHub-generated “Source code” links may also appear as platform-provided links. No project-generated PDF, PPTX, DOCX, dataset, executable, or private delivery file is published.

## Release-note contract

Release notes use exactly these reader-facing sections:

1. **Research** — report, dossier, principal findings, and traceability changes;
2. **Demonstrator** — interface or reproducible-behavior changes;
3. **Evidence Snapshot** — snapshot date and source/claim counts;
4. **Known Limits** — non-audit, no-live-measurement, temporal, and generalization boundaries.

## Prohibited release assets

- restricted submissions or source copies;
- names, direct identifiers, contact addresses, or account exports;
- office documents, PDF files, archives nested inside the source archive, device captures, logs, telemetry, credentials, or local configuration;
- game or Vanguard files and third-party binaries.

## Release checklist

1. Confirm v1.1.0 metadata and the changelog entry.
2. Run `npm ci --ignore-scripts` and `npm run ci` in a full clean clone.
3. Audit the current tree and all reachable public Git history.
4. Confirm both regenerated PNGs contain no text or EXIF metadata chunks.
5. Merge through a reviewed pull request after required CI and CodeQL checks pass.
6. Create an annotated `v1.1.0` tag from the validated `main` commit.
7. Let the pinned release workflow build, extract, rescan, retest, checksum, and attest the source candidate.
8. Independently verify `CHECKSUMS.sha256` and GitHub artifact provenance.
9. Publish an immutable GitHub Release with the four required note sections and only the two allowed project assets.

Long-term archival may be added later. No DOI or external archive is claimed until an archival service confirms it.

Independent provenance verification uses:

```sh
gh attestation verify vanguard-trust-lab-v1.1.0.zip --repo Alierkn/vanguard-trust-lab
gh attestation verify CHECKSUMS.sha256 --repo Alierkn/vanguard-trust-lab
```
