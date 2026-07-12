# ADR-0004: Separate private authoring and public Git histories

- Status: Accepted
- Date: 12 July 2026

## Context

Removing a file from the current branch does not remove it from earlier commits, tags, releases, caches, or workflow artifacts. A repository that ever contained personal or restricted authoring material is therefore a poor publication boundary.

## Decision

Preserve the authoring repository as private and create this public repository from a new Git history containing only deliberately selected public assets. Do not merge, graft, import, fork, or rewrite private commits into the public repository.

## Consequences

- Public history can be audited as a closed set.
- Private releases and personal metadata remain outside the public trust boundary.
- Commit ancestry between private and public artifacts is intentionally absent.
- Shared improvements must be ported as reviewed patches rather than history merges.
