# Methodology

## Design

The project uses a qualitative, evidence-bounded case-study method. It reconstructs a simplified public model of Riot Vanguard and evaluates trust, integrity, authenticity, privilege, and availability without attempting experimental validation of proprietary detection logic.

## Evidence classes

### 1. Riot statement

A product, architecture, privacy, requirement, or effectiveness description published by Riot. It is first-party evidence about intended design or reported operation, not independent verification.

### 2. Microsoft platform mechanism

Officially documented Windows behavior, prerequisites, or guarantees, including runtime attestation, TPM, Secure Boot, VBS/HVCI, IOMMU protection, driver signing, and privilege modes. It does not establish Riot's private policy or exact implementation.

### 3. Project inference

A reasoned interpretation built from the first two classes and primary security standards. It remains conditional because source code, backend policy, complete telemetry, and proprietary detection logic are unavailable.

### 4. Demonstrator result

Behavior reproduced in the included static browser Lab, such as a fixed SHA-256 digest or `MATCH`/`MISMATCH` transition. It is evidence about the Lab only.

## Source selection

The claim base uses official Riot publications, Microsoft platform documentation, NIST standards or terminology, and the W3C Web Cryptography specification. Secondary articles, forum posts, social-media claims, leaked material, and bypass discussions are excluded.

## Procedure

1. Register each public primary source with an identifier, scope note, and access date.
2. Convert material statements into claim records.
3. Assign an evidence class, confidence, allowed wording, and prohibited overclaim.
4. Build a simplified architecture and identify trust boundaries.
5. Model assets, adversary classes, public controls, assumptions, and residual limitations.
6. Compare system-start continuity with optional On-Demand activation.
7. Implement only safely reproducible concepts: diagram rendering, manual posture logic, and local SHA-256 comparison.
8. Test deterministic fixtures and repository security invariants.
9. Review every conclusion for unsupported movement from statement to fact or inference to certainty.

## Analysis frame

- **Integrity:** has relevant state changed relative to an expected value?
- **Authenticity:** who produced or approved the code, and which trust chain supports that statement?
- **Privilege:** what can the control observe or affect, and what is the failure impact?
- **Availability:** can a legitimate user still access the service under the policy?

## Validity controls

- Vendor claims are attributed.
- Platform mechanisms use official documentation.
- Project inference is labeled and conditional.
- Lab claims are restricted to tested behavior.
- Fixed digests are verified independently with Node's cryptographic library.
- Public source access dates and an evidence snapshot are recorded.
- CI checks source/claim relationships, runtime dependencies, release boundaries, and public metadata.

## Threats to validity

- First-party material may omit defects, policy details, or unfavorable outcomes.
- Platform documentation cannot establish a vendor's backend interpretation.
- Product behavior may change after the evidence snapshot.
- The project intentionally includes no live Windows/Vanguard measurement.
- A simplified teaching diagram cannot capture every component or data flow.
- A local hash experiment cannot validate anti-cheat effectiveness.

These constraints determine the strength of the conclusion rather than appearing as minor caveats.
