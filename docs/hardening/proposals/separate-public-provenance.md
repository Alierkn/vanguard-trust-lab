# Security Hardening Proposal: Separate Private Authoring from Public Research Software

## Decision

Option 2, Clean-History Split-Public, is selected. The design is accepted only when the tree, new Git object database, Pages output, and release archive pass the publication checks.

## Executive Recommendation

We considered two complete options. **Option 1 — Rewrite and Scrub Existing History** preserves an established lineage by rewriting blobs, commit metadata, refs, tags, and releases. **Option 2 — Clean-History Split-Public** selects an allowlisted public snapshot, validates it, and gives it a new Git object database.

I recommend Option 2 under the current constraints. The private lineage has no public compatibility obligation, and importing it would create disclosure risk without research value. Option 1 becomes preferable only when already-public history carries important contributor attribution or downstream compatibility that cannot be abandoned.

## Evidence

I inspected the candidate source, repository checks, workflow definitions, release model, and legacy/public boundary. The evidence that most influenced the diagnosis is not one string; it is the number of places a publication can preserve old data even after the working tree looks clean.

| Evidence | Finding or document | What it establishes |
|---|---|---|
| `E-PUB-001` | Mixed-origin authoring risk | The private authoring boundary contains material that must not enter public history or releases. |
| `E-PUB-002` | Clean-history boundary available | A new public object database can be created without sacrificing required public lineage. |
| `E-PUB-003` | Publication-gate ownership | `scripts/verify.mjs` is a single enforcement point for public invariants. |
| `E-PUB-004` | Multiple public surfaces | Source files, Git metadata, Pages, images, workflow artifacts, and releases need the same classification decision. |

The first, second, and fourth items are observed from the repository separation and publication surfaces. We infer from `E-PUB-003` that centralizing the checks reduces future drift; that inference still depends on keeping the verifier mandatory in CI and release workflows.

## Current Design And Failure Mode

The unsafe baseline copies a mixed-origin authoring tree into a public-shaped directory and relies on individual edits. A deleted file can remain in a commit, tag, release, cache, or downloaded archive. A cleaned document can also leave visible text or metadata inside an image. This makes “the current branch looks clean” an insufficient security invariant.

We can see why the control drifts: metadata, research citations, interface copy, screenshots, workflows, releases, and commit identities each have a different owner and lifecycle. Without a central gate and a history boundary, a future change can satisfy ordinary tests while reintroducing restricted provenance.

## Desired Invariants

- Every public file is deliberately selected or produced by an approved transform.
- No public Git object shares ancestry or storage with the private repository.
- Public claims depend only on publicly retrievable sources.
- Images and archives are checked as release artifacts rather than trusted because their filenames look harmless.
- Commit authors, tags, remotes, Pages output, and releases follow the same public-data policy as source files.
- Unknown or prohibited classifications block publication.

## Constraints And Non-Goals

We preserve the static Lab, evidence taxonomy, deterministic tests, and cross-platform operation. We do not attempt to recall already-downloaded material, hide the normal identity of a public hosting account, make legal conclusions about attribution, or guarantee that future external contributors reveal no identity in their own public commits.

Runtime performance is not a deciding constraint because neither option changes the deployed Lab. Build-time scanning cost is unmeasured and must remain bounded enough for routine CI.

## Before Architecture

The current-risk view shows private authoring flowing through manual cleanup into several independently managed public surfaces.

[Before diagram](../diagrams/separate-public-provenance-before.mmd)

The important edge is the manual copy: it has no single owner for the privacy invariant and cannot prove that historical or generated surfaces are clean.

## Options

### Option 1: Rewrite and Scrub Existing History

This option is strongest when public lineage matters. We would enumerate every branch and tag, rewrite prohibited blobs and author metadata, replace releases, invalidate caches where the platform permits, and coordinate a force-push. Existing public contributors could retain a recognizable lineage, and downstream references could be mapped to rewritten commits.

Its security effect is real but incomplete. Rewriting can remove reachable objects from the canonical repository, yet it cannot recall clones, forks, downloads, caches, logs, or copied release assets. It also solves a one-time state problem rather than the recurrence problem unless we add the same publication gate needed by Option 2.

The runtime Lab remains unchanged. Build memory and disk rise temporarily because rewriting walks and repacks the object database. Reliability gives me more pause: force-pushes invalidate commit IDs, signed tags, open pull requests, and local clones. Rollback requires a protected private mirror and coordinated restoration, and restoring can itself republish a prohibited object if the incident classification is wrong.

[Option 1 after diagram](../diagrams/separate-public-provenance-rewrite-history-after.mmd)

| Change | Before | After | Security consequence | Cost |
|---|---|---|---|---|
| Git objects | Mixed reachable history | Rewritten selected history | Removes known canonical objects | Old copies remain outside control. |
| Commit identity | Mixed historical authors | Rewritten approved identity set | Reduces direct metadata exposure | Attribution and signatures change. |
| Releases | Existing assets | Deleted and replaced assets | Removes canonical restricted assets | Downloads and caches remain. |
| Prevention | Manual cleanup | Rewrite plus publication gate | Reduces recurrence when the gate is retained | Highest one-time operational complexity. |

Option 1 can be rolled out in a temporary mirror, verified, and swapped only after every ref and release is audited. The rollback point is the protected original mirror, which must remain private and access-controlled.

### Option 2: Clean-History Split-Public

This option treats public distribution as a separate security domain. We select only approved files, replace private provenance with public primary sources, validate text and assets, initialize a new Git object database, use a project-level public identity, and create the remote last. There is no merge base, shared object store, imported tag, or private remote.

The attractive part is that the desired invariant becomes inspectable: every public object was created after the gate. Residual risk moves to a smaller set of owners—the selection process, verifier, hosting settings, manual release actions, and future contributions. The hosting account itself remains public and is not disguised as anonymous.

The runtime application pays no performance or memory cost. CI gains scans that read a small static tree, so the expected cost is linear and build-only; we must measure it rather than claim a percentage. Reliability improves through failure isolation: a false positive can delay a release, but it cannot make the deployed Lab unavailable. Operationally, the project must maintain two boundaries and port public improvements deliberately instead of merging histories.

[Option 2 after diagram](../diagrams/separate-public-provenance-clean-history-after.mmd)

| Change | Before | After | Security consequence | Cost |
|---|---|---|---|---|
| Source selection | Copy-most, remove-later | Explicit public snapshot | Unknown files fail closed | New files require classification. |
| Git lineage | Possible inherited objects | Fresh object database | Private blobs and authors cannot be inherited | Private development ancestry is absent. |
| Evidence | Mixed source classes possible | Public primary sources only | Private provenance stays outside public scope | Some claims need narrower wording. |
| Publication | Independent surfaces | Shared fail-closed gate | One policy covers source, Pages, and releases | Gate and asset review require maintenance. |

Before first publication, rollback is simple: discard the candidate and regenerate it. After publication, a privacy incident must assume cloning or download has occurred; the correct recovery is a new sanitized release plus incident response, not a promise that Git deletion recalled every copy.

## Comparison

| Dimension | Option 1 — rewrite | Option 2 — split-public | Validation plan |
|---|---|---|---|
| Security | Improves; medium confidence; source-derived. Canonical history is scrubbed, but external copies and rewrite omissions remain. | Improves; high confidence; source-derived. No inherited objects; selection and host settings remain trusted. | Inspect every ref, object, commit identity, Pages file, and archive. |
| Performance | Runtime neutral; high confidence. Rewrite cost is offline and unmeasured. | Runtime neutral; high confidence. Gate cost is CI-only and unmeasured. | Compare Lab load behavior and record full-gate wall time. |
| Memory | Runtime neutral; medium confidence. Repack needs temporary object storage. | Runtime neutral; medium confidence. Scanning retains only bounded file content. | Record peak RSS and temporary disk on a representative run. |
| Reliability | May regress during migration; medium confidence; analogous. Commit IDs and clones break. | Improves isolation; medium confidence; source-derived. False positives fail releases closed. | Exercise clone, branch, Pages, and release runbooks. |
| Operability | Highest one-time burden and coordination. | Moderate recurring classification and gate maintenance. | Trial one source, UI, image, and release update. |
| Migration | High complexity when history exists publicly. | Moderate one-time setup and predictable ongoing flow. | Rebuild the public repository only from its documented snapshot. |

The comparison favors Option 2 because public lineage preservation has no stated value here. If that constraint changes, the strongest argument for Option 1 becomes material and the decision should be reopened.

## Recommendation

I recommend Option 2 and would be comfortable publishing after the tree, image metadata, commit identity, remote list, all Git objects, Pages output, and source archive pass independent checks. We should keep the private repository private and never join the two histories later for convenience.

Option 1 should win only if an established public ecosystem depends on existing commit IDs or contributor ancestry and the project can coordinate the rewrite across all controlled refs and releases.

## Evidence Coverage And Residual Risk

| Evidence | Option 1 | Option 2 | Tactical work still required |
|---|---|---|---|
| `E-PUB-001` — Mixed-origin authoring risk | Mitigates through rewriting known objects | Addresses inheritance by never importing private objects | Keep the private boundary access-controlled. |
| `E-PUB-002` — Clean-history boundary available | Does not use the available advantage | Directly uses the clean boundary | Verify no graft, alternate object store, or private remote. |
| `E-PUB-003` — Publication-gate ownership | Required in addition to the rewrite | Central to the design | Keep checks mandatory in CI, Pages, and tag workflows. |
| `E-PUB-004` — Multiple public surfaces | Mitigates only if every surface is purged | Addresses with one classification policy | Inspect images and manually created release assets. |

Residual risk remains in public account metadata, contributor identities, issues, third-party caches, hosting-platform behavior, scanner false negatives, and a maintainer's ability to bypass source policy through manual uploads.

## Migration And Rollout

- Classify restricted authoring material and keep it inside the private boundary.
- Select the public source snapshot and replace private provenance with public primary evidence.
- Regenerate or inspect images and strip unnecessary metadata.
- Run the publication gate before `git init` and again against tracked files.
- Initialize a fresh object database with a public project identity and only a public remote.
- Push the single clean lineage; enable Pages and repository security controls.
- Create source-only release assets from the tagged public commit and verify checksums.
- Preserve tactical PII, secret, binary, CSP, source, action, and release checks during future migration.

## Validation Plan

- Run syntax, unit, repository, and link checks on Node 22 and 24; treat Node 26 as experimental.
- Test positive and negative fixtures for generic email, identifier-label, local-path, private-portal, and binary patterns.
- Inspect screenshot pixels and file types; remove unnecessary metadata.
- Inspect `git log --format=fuller`, every ref, and `git rev-list --objects --all`.
- Confirm that only the public remote is configured and no alternates or grafts exist.
- Compare the Pages artifact allowlist with `app/`.
- List every source archive entry and scan the extracted archive before release.
- Record publication-gate wall time and peak memory if the repository grows materially.

Acceptance requires no prohibited match, a fresh public-only root commit, passing CI, successful CodeQL and Pages runs, and a source-only release whose checksum verifies.

## Implementation Work Packages

1. Public-data classification and source allowlist.
2. Evidence migration to public primary sources.
3. Interface, metadata, asset, and policy sanitization.
4. Fail-closed repository and workflow checks.
5. Fresh Git initialization and object/identity audit.
6. Pages, release, and GitHub security-setting validation.

The implementation handoff is recorded in `../implementation/clean-history-split-public.md`.

## Open Questions

- When should the repository move from an individual public account to a project organization?
- What CI time threshold should trigger optimization of the publication scan?
- Should a future host replace GitHub Pages if response-header control becomes mandatory?
