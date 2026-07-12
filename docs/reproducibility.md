# Reproducibility Protocol

## Reproducible scope

The repository reproduces:

- source/claim referential integrity;
- posture evaluation for zero, partial, and five manually confirmed groups;
- fixed SHA-256 sample digests and `MATCH`/`MISMATCH` transitions;
- byte-to-hex and file-size behavior;
- explicit non-inspection and non-authenticity warnings;
- absence of remote runtime scripts, stylesheets, fonts, and network APIs;
- public-release and privacy invariants.

It cannot reproduce Vanguard detection, privacy, performance, driver activity, Pre-Check eligibility, or backend policy.

## Maintained environment

- Primary runtime: Node.js 24 LTS
- Compatibility runtime: Node.js 22 until its 2027 end-of-life window
- Experimental runtime: Node.js 26 until its planned 2026 LTS transition
- Package manager: npm with committed lockfile
- Runtime application dependencies: none

## Automated protocol

```sh
npm ci --ignore-scripts
npm run ci
```

Expected outcome: syntax checks, Node tests, source/claim validation, public-safety checks, link policy, CSP policy, action-pin validation, and release-boundary checks all pass.

## Manual browser protocol

```sh
npm run serve
```

Open `http://127.0.0.1:8000` and follow `demo-guide.md`.

Expected results:

- the posture starts at 0 of 5 and remains explicitly manual;
- five selections produce a complete checklist without claiming Pre-Check eligibility;
- Sample A against itself produces `MATCH`;
- Modified Sample B against Sample A produces `MISMATCH`;
- refresh clears the in-memory baseline;
- developer tools show no runtime request to a third-party origin.

## Public-source review

Before republication, open every URL in `research/sources.csv`, compare current wording with registered claims, update access dates, and create a new evidence snapshot if a material statement changed.

## Release verification

The release workflow validates the repository, builds a source archive from the tagged commit, and generates `CHECKSUMS.sha256`. A release must not contain private documents, device captures, office files, account data, or third-party binaries.
