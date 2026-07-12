# Security Hardening Review: Public Research Boundary

## Evidence Basis

We inspected the publication candidate as an ordinary source snapshot and compared it with the legacy private authoring boundary. The evidence does not show a vulnerability in the static Lab; it shows a structural publication risk. Private authoring and public distribution cannot safely share Git ancestry when restricted metadata, generated deliverables, tags, and release assets have existed on the private side.

The compact inventory is in `context.md`. It records four locally meaningful evidence items: mixed-origin authoring risk (`E-PUB-001`), the available clean-history boundary (`E-PUB-002`), a central publication-gate opportunity (`E-PUB-003`), and the number of public surfaces that must follow the same rule (`E-PUB-004`).

## Constraints

- Public files, Git objects, assets, and releases must contain no restricted identity or private deliverable.
- Public claims must use publicly retrievable primary evidence.
- The static Lab and its evidence-bounded wording must remain understandable and reproducible.
- Runtime dependencies, privileged inspection, and product integration remain out of scope.
- No measured CI latency or memory budget was supplied, so we use a balanced profile and validate build-time cost rather than inventing a target.
- Unknown classifications fail closed.

## Opportunity Portfolio

| Opportunity | Evidence | Options | Recommendation | Proposal |
|---|---|---|---|---|
| Separate private authoring from public distribution | Mixed-origin risk, clean-history availability, missing central gate, and multiple public surfaces (`E-PUB-001`–`E-PUB-004`) | 1. Rewrite and scrub history; 2. Clean-history split-public | Select Option 2 and validate every public surface | [Separate public provenance](proposals/separate-public-provenance.md) |

## Recommendation Summary

I recommend Option 2, the clean-history split-public design, under the recorded constraints. A history rewrite is useful when valuable public lineage must survive, but that is not our situation. Starting a new object database costs us private development ancestry that should not be public in the first place, while making the privacy invariant substantially easier to reason about.

The selected design combines a deliberate source snapshot, public-only evidence, project-level metadata, a fail-closed verifier, regenerated or reviewed assets, and source-only releases. It does not claim perfect anonymity: the public hosting account, future contributors, issue authors, and external caches remain visible according to the platform's normal behavior.

## Next Decisions

- Decide when a second maintainer is available so required review can increase from zero to one.
- Revisit static hosting if response-header control becomes a requirement.
- Define a project-owned organization identity if stronger separation from a personal hosting account is later desired.
- Revalidate the public snapshot, Git metadata, Pages output, and release archive before every release.
