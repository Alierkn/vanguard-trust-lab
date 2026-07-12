# Public Evidence Snapshot

## Snapshot

- Review date: 12 July 2026
- Sources: public Riot, Microsoft, NIST, and W3C pages in `sources.csv`
- Claims: bounded statements in `claims.csv`
- Lab fixtures: fixed Sample A and Modified Sample B in `app/app.js` and tests

## Purpose

The snapshot prevents silent source drift. It also makes clear that the optional On-Demand model is described using public documentation available shortly after its June 2026 publication.

## Reopening rule

Reopen the evidence set when an official source materially changes, a registered claim is shown to be inaccurate, or a later republication is planned.

When reopening:

1. create a research-correction issue;
2. update the access date and claim register;
3. review each affected documentation and interface statement;
4. rerun `npm run ci`;
5. record the change in `CHANGELOG.md`.
