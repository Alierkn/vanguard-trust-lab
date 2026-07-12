# ADR-0002: Adopt a four-class evidence taxonomy

- Status: Accepted
- Date: 12 July 2026

## Context

First-party product statements, operating-system documentation, analytical inference, and reproduced Lab behavior have different evidential strength. Mixing them would overstate the result.

## Decision

Classify material claims as Riot statement, Microsoft platform mechanism, project inference, or demonstrator result. Register allowed wording and prohibited overclaim in `research/claims.csv`.

## Consequences

- Claims are cautious and auditable.
- Corrections target a source and statement.
- Vendor claims cannot silently become independently verified facts.
- Inference remains conditional even when technically plausible.
