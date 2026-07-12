# ADR-0001: Use a public-evidence case-study scope

- Status: Accepted
- Date: 12 July 2026

## Context

Vanguard's implementation and backend policy are proprietary. A direct audit cannot be supported or reproduced from public material, and operational anti-cheat testing would introduce ethical and safety risk.

## Decision

Use a qualitative case study based only on public Riot, Microsoft, NIST, and W3C sources. Make the absence of live product measurement a first-class limitation.

## Consequences

- Architecture and trade-offs can be explained defensibly.
- Binary safety, detection effectiveness, privacy verification, and performance cannot be claimed.
- Product statements require attribution.
- The practical component demonstrates general security concepts without inspecting proprietary software.
