# ADR-0003: Keep the browser Lab dependency-free

- Status: Accepted
- Date: 12 July 2026

## Context

The demonstrator must be reproducible across common desktop operating systems without an account, network service, privileged access, or third-party runtime package. It processes user-selected local files.

## Decision

Use static HTML, CSS, and JavaScript; the browser Web Cryptography API; an in-memory baseline; and harmless fixed samples. Use Node only for consistent local serving and automated tests.

## Consequences

- The Lab runs on macOS, Windows, and Linux or through GitHub Pages.
- Runtime supply-chain and network exposure remain minimal.
- Tests stay deterministic and fast.
- The Lab cannot and must not implement live attestation, host inspection, or Vanguard integration.
