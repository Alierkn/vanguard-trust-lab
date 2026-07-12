# Governance

## Maintenance model

The repository owner maintains the release branch. Contributors participate through issues and pull requests; no public contact details are required.

## Decision principles

1. protect people, systems, privacy, and research integrity;
2. preserve factual correctness and evidence boundaries;
3. keep the research dossier and demonstrator understandable and reproducible;
4. minimize dependencies, privileges, and maintenance risk;
5. improve explanatory quality without overstating conclusions.

Material architectural choices are recorded in `docs/adr/`. Research corrections update the claim register and changelog.

## Branch and review model

- `main` is the releasable source of truth.
- Work uses short-lived branches and pull requests.
- Required checks must pass before merge.
- Force pushes and deletion of `main` are blocked by a GitHub ruleset.
- Reviews are required when a second maintainer is available; the ruleset must not make emergency recovery impossible for a single-owner repository.

## Releases

- Semantic versions identify the public research-software artifact.
- Release notes record evidence-date changes and known limitations.
- Releases contain a source archive and checksum only.
- Restricted authoring material, personal data, device captures, and third-party binaries are never release assets.
