# Research Question and Objectives

## Primary question

How does Riot Vanguard seek host-level game integrity, and what security and availability trade-offs follow from privileged enforcement and stronger platform requirements?

## Subquestions

1. Which protected assets and trust boundaries appear in the public architecture?
2. Why does the public design cross from user mode into kernel mode?
3. How do byte integrity, software authenticity, and a host-trust policy decision differ?
4. How does optional On-Demand operation change the historical-assurance argument?
5. What roles do Secure Boot, TPM 2.0, VBS/HVCI, IOMMU, and signed runtime attestation play?
6. Which security, privacy, compatibility, and availability costs remain?
7. What can a cross-platform Lab validly demonstrate without inspecting Vanguard?

## Objectives

- Build a defensible component and trust model from public primary sources.
- Separate vendor statements, platform mechanisms, project inference, and reproduced Lab results.
- Compare the earlier system-start continuity argument with the optional On-Demand argument.
- Provide a safe, dependency-free experiment for privilege boundaries and local integrity comparison.
- Make limitations strong enough that the artifact cannot be mistaken for an independent product audit.

## Success criteria

- Every material technical claim has a registered source or an explicit Lab-result label.
- No vendor effectiveness number is presented as independently reproduced.
- No live device or Vanguard measurement is implied.
- Deterministic tests pass and the app has no remote runtime dependency.
- The conclusion remains conditional and answers the research question.

## Non-goals

Reverse engineering, exploit validation, cheat or bypass development, binary inspection, kernel development, traffic interception, performance benchmarking, device certification, and product support are outside scope.
