# Implementation Plan: Clean-History Split-Public

## Selected Design And Constraints

Create the public artifact from an allowlisted, sanitized snapshot. Do not import private commits, tags, releases, objects, remotes, or generated deliverables. Preserve the static Lab and public evidence method.

## Source Revision And Drift Check

The target had no Git revision when the design was selected. Bind the final analysis to the computed snapshot digest, then initialize Git. Recompute and record drift whenever non-analysis source changes before publication.

## Affected Components

- root metadata, licenses, governance, and support policy;
- `app/` UI copy, CSP, Pages security contact, and images;
- `research/` public source and claim registers;
- `scripts/verify.mjs` and repository tests;
- `.github/workflows/` and host-side security settings;
- public Git identity, tags, Pages, and release assets.

## Ordered Work Packages

1. Remove direct identity and private provenance from the public candidate.
2. Replace private conceptual references with official Microsoft, NIST, Riot, and W3C sources.
3. Add public metadata, disclaimers, security architecture, and cross-platform Lab rationale.
4. Add PII/path/binary/CSP/action/source/release checks and run them locally.
5. Recreate or remove stale visual assets and verify their real formats.
6. Initialize a fresh repository with a public no-reply identity; audit objects and remotes.
7. Create the public remote, enable security settings, push, and verify workflows.
8. Tag and publish a source-only release with checksum.

## Compatibility And Migration

The browser behavior and sample digests remain stable. Private and public histories intentionally have no common ancestor. Improvements cross the boundary only as reviewed file patches.

## Tactical Protections During Migration

Keep the private repository private. Do not publish until generic and exact private-term scans, binary review, Git identity review, and archive review pass. If any result is uncertain, discard the public object database and rebuild from the sanitized snapshot.

## Tests And Security Validation

- `npm run ci` on maintained runtimes;
- CodeQL for JavaScript/TypeScript;
- CSP and no-network application checks;
- exact source/claim referential integrity;
- public metadata and prohibited binary checks;
- workflow action allowlist and immutable pins;
- Git object, author, tag, remote, image, Pages, and release-archive audit.

## Performance And Resource Benchmarks

The design changes no runtime path. Record CI wall time, peak memory, and archive size if the tree grows enough that full scanning becomes material. Optimize by streaming files, not by weakening classification coverage.

## Rollout And Rollback

Create the remote only after local acceptance. Roll out CI first, then CodeQL and Pages, then the tag/release path. Before public publication, rollback means deleting the candidate and regenerating it. After publication, assume copies exist; remove the affected surface, rotate any exposed secret, issue a corrected release, and document the incident without repeating restricted content.

## Acceptance Criteria

- All local checks pass on a clean working tree.
- The public repository has one clean lineage and no private remote or object alternate.
- Commit and tag metadata contain only the approved public identity.
- GitHub CI, CodeQL, and Pages complete successfully.
- Secret scanning, push protection, Dependabot, and private vulnerability reporting are enabled.
- The release contains only a source archive and checksum, and the checksum verifies.

## Open Decisions

- Timing for organization-owned hosting.
- Required-review count when additional maintainers join.
- Hosting migration threshold for custom security headers.
