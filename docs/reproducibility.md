# Reproducibility Protocol

## Reproducible scope

The repository reproduces:

- the project manifest, work-package, deliverable, version, and evidence-count contract;
- report structure, 3,500–5,000-word range, and claim/source traceability;
- source/claim referential integrity and bounded public-source domains;
- posture evaluation for zero, partial, and five manually confirmed groups;
- fixed SHA-256 sample digests and `MATCH`/`MISMATCH` transitions;
- explicit non-inspection, non-audit, and non-authenticity warnings;
- absence of remote runtime scripts, stylesheets, fonts, and network APIs;
- current-tree, Git-history, screenshot-metadata, and public-release boundaries.

It cannot reproduce Vanguard detection, privacy, performance, driver activity, Pre-Check eligibility, or backend policy.

## Maintained environment

- Required CI runtimes: Node.js 22 and Node.js 24
- Experimental compatibility lane: Node.js 26 until LTS and ecosystem validation
- Package manager: npm 11 with committed lockfile
- Runtime application dependencies: none

## Automated protocol

```sh
npm ci --ignore-scripts
npm run ci
```

Expected outcome: syntax checks, deterministic Node tests, manifest/report validation, source/claim validation, public-safety checks, link policy, CSP policy, immutable action-pin validation, full-history binary checks, and release-boundary checks all pass.

`npm run verify:history` requires a full Git checkout. In a source archive without `.git`, it records that history is unavailable while the current-tree verifier continues to enforce the archive boundary.

## Manual browser protocol

```sh
npm run serve
```

Open `http://127.0.0.1:8000` and follow [the demonstrator guide](demo-guide.md).

Expected results:

- the posture starts at 0 of 5 and remains explicitly manual;
- five selections produce a complete checklist without claiming Pre-Check eligibility;
- Sample A against itself produces `MATCH`;
- Modified Sample B against Sample A produces `MISMATCH`;
- refresh clears the in-memory baseline;
- developer tools show no request to a third-party origin;
- navigation identifies System Model, Posture Model, Integrity Demonstrator, and Evidence.

After regenerating the two committed screenshots, run `npm run screenshots:sanitize`. The command retains only the required PNG structure (`IHDR`, `IDAT`, and `IEND`) before the repository verifier checks the images.

## Public-source review

Before republication, open every URL in `research/sources.csv`, compare current wording with registered claims, update access dates, and create a new evidence snapshot if a material statement changed.

## Release archive revalidation

The pinned release workflow performs the following sequence on the tagged commit:

1. runs the complete repository checks with full Git history;
2. creates a source ZIP with `git archive`;
3. generates and immediately verifies `CHECKSUMS.sha256`;
4. extracts the ZIP into a fresh directory;
5. runs `npm ci --ignore-scripts` and `npm run ci` inside the extracted source;
6. verifies the checksum again and confirms that `dist/` contains only the ZIP and checksum;
7. creates GitHub artifact attestations for both release assets.
8. verifies both attestations against the repository identity before uploading the candidate.

After publication, verify the downloaded assets independently:

```sh
sha256sum -c CHECKSUMS.sha256
gh attestation verify vanguard-trust-lab-v1.1.0.zip --repo Alierkn/vanguard-trust-lab
gh attestation verify CHECKSUMS.sha256 --repo Alierkn/vanguard-trust-lab
```

No PDF, presentation file, office document, private submission, device capture, account data, or third-party binary belongs in the source tree or release.
