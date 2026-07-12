# Vanguard Host Trust: Integrity, Privilege, and Digital Trust

*An Evidence-Bounded System Security Research Project*

Version 1.1.1 · Public evidence snapshot: 12 July 2026

## 1. Abstract and Problem Definition

Competitive online games run on computers controlled by their players. That fact creates a difficult security problem: a service must decide whether to trust a game session even though an adversarial player may control ordinary applications, system configuration, peripherals, and potentially privileged software on the same host. Riot Vanguard addresses this problem with a public architecture that Riot describes as including a client-side component, a kernel-mode driver, and a remote platform [C-003] [S-RIOT-2020]. Riot's later public retrospective names the user-mode service as `vgc` and the kernel-mode driver as `vgk` [C-004] [S-RIOT-RETRO-2024]. These statements explain an intended trust model, but they are not independent inspection of the product.

The security question is therefore broader than whether a driver is present. A useful analysis must distinguish at least four properties. **Integrity** asks whether relevant bytes or state changed. **Authenticity** asks whether code or evidence came from an accepted origin. **Privilege** asks what a component can observe or affect, and how serious its failure could be. **Availability** asks whether legitimate users can still access the service under the security policy. A hash, a signature, privileged execution, and an admission decision provide different kinds of assurance; none proves complete security by itself [C-002] [S-NIST-80053] [S-MS-SIGNING] [S-W3C-WEBCRYPTO].

This report reconstructs a simplified public model of Vanguard and evaluates the trade-offs created by privileged enforcement and stronger Windows platform requirements. It compares the earlier system-start design with the optional On-Demand mode publicly announced in June 2026. The comparison is deliberately evidence-bounded: Riot publications are treated as vendor statements, Microsoft documentation establishes Windows mechanisms rather than Riot's private implementation, project interpretations are labeled as inferences, and demonstrator results apply only to the included static web application.

The principal conclusion is conditional. Deeper host visibility and stronger platform constraints can plausibly raise the cost of manipulating a competitive session under stated assumptions, but the same choices enlarge the responsibility attached to privileged code, platform compatibility, evidence interpretation, recovery, and access policy [C-018]. The public record does not justify an absolute verdict that the product is safe, unsafe, complete, private, or effective against every threat. This project is not a Vanguard audit, performs no live Windows or Vanguard measurement, and does not assess any specific installation, account, or device [C-017].

## 2. Research Question, Scope, and Contribution

The primary research question is:

> How does Riot Vanguard seek host-level game integrity, and what security and availability trade-offs follow from privileged enforcement and stronger platform requirements?

Four supporting questions organize the analysis. First, what assets and trust boundaries can be identified from the public architecture? Second, why does the design cross from user mode into kernel mode? Third, how does optional On-Demand activation change the historical assurance argument associated with a driver that starts with the system? Fourth, what can be demonstrated safely without reverse engineering, inspecting a live host, or interacting with proprietary components?

The scope includes public Riot architecture and product descriptions; official Microsoft documentation for user/kernel privilege, Secure Boot, TPM 2.0, VBS/HVCI, IOMMU-based DMA protection, driver signing, and runtime attestation; NIST security-control and terminology material; and the W3C Web Cryptography specification. The evidence register freezes 15 public primary sources as accessed on 12 July 2026. Eighteen bounded claims record the permitted interpretation and the overclaim that must be avoided. Secondary reporting, leaked material, forum assertions, social-media claims, and operational bypass discussions are excluded.

The contribution is a linked set of public artifacts rather than a claim of product certification. The first contribution is an evidence-governance method that separates source, claim, inference, and reproduced result. The second is a simplified system and threat model that makes four trust boundaries visible: application, privilege, platform, and network/policy. The third is a comparative analysis of continuous system-start observation and platform-supported On-Demand evidence. The fourth is an Interactive Security Demonstrator that reproduces posture aggregation and SHA-256 comparison without inspecting the host. The fifth is a machine-readable manifest and deterministic validation suite that make the public dossier auditable as a repository.

The non-goals are as important as the contributions. This work does not reverse engineer binaries, inspect memory, capture traffic, analyze detection logic, modify game or Vanguard files, develop a driver, test bypasses, benchmark performance, certify hardware, or evaluate a specific user. It does not determine whether a device passes Vanguard Pre-Check. It does not use private portals, private course material, personal data, telemetry, credentials, or account access. These exclusions reduce both ethical risk and the chance that a teaching artifact is mistaken for a security assessment.

## 3. Integrity, Authenticity, Privilege, and Availability

### 3.1 Integrity

Integrity is a relationship between observed state and an expected state. In the simplest demonstrator case, a SHA-256 digest is computed for a byte sequence and compared with a baseline. Equal digests support the conclusion that the compared byte sequences are equal for the purpose of this exercise; unequal digests establish that the bytes differ. The included fixed samples deterministically produce registered digests and a `MISMATCH` transition when the modified sample is compared with the original baseline [C-016] [S-W3C-WEBCRYPTO]. This result says nothing about why the change occurred, who caused it, or whether either file is desirable.

At host scale, integrity is more complicated. Relevant state can include executable code, loaded drivers, boot configuration, security-policy state, and memory mappings. The expected value may be a signed allowlist, a measured boot value, a platform policy, or a server-side acceptance rule. Each baseline has an owner and a lifecycle. A technically correct comparison against an untrusted, stale, or incomplete baseline can produce a correct answer to the wrong question.

### 3.2 Authenticity

Authenticity concerns origin and approval. Windows driver signing links a package to a publisher identity and a certificate-based trust relationship. It helps detect unauthorized alteration and supports distribution policy, but a valid signature does not establish that code is flawless, invulnerable, appropriate for every device, or harmless in every execution context [C-012] [S-MS-SIGNING]. A digest and a signature therefore answer related but distinct questions: the digest supports equality with a chosen baseline, while the signature supports origin and integrity under a trust chain.

Authenticity also applies to evidence. Microsoft documents `GetRuntimeAttestationReport` as returning a signed Secure Kernel report that can include driver and code-integrity information. The caller can provide a nonce, and a validating backend can use freshness and report-validity conditions to reduce replay risk [C-008] [S-MS-RUNTIME]. The signature can support confidence that the report was produced under the documented platform mechanism. It does not independently prove a perfectly clean host, reveal Riot's private acceptance policy, or convert partial evidence into certainty.

### 3.3 Privilege

Microsoft distinguishes user mode, where processes are isolated in private address spaces, from kernel mode, where privileged components share system-level address space and can affect the operating system broadly [C-001] [S-MS-MODES]. Kernel privilege can be security-relevant because threats may also use kernel-capable code or privileged interfaces. A defensive component operating only as an ordinary process may be unable to observe or resist activity at a higher privilege level.

The same property creates risk. A kernel defect, incompatible interaction, compromised update, or policy mistake can have wider consequences than a fault in an isolated user process. Privilege is therefore neither proof of maliciousness nor proof of trustworthiness. NIST terminology associates a rootkit with concealment and continued privileged access; classification requires evidence about authorization, concealment, persistence, purpose, and behavior, not the single fact that a disclosed component runs in kernel mode [C-013] [S-NIST-ROOTKIT] [S-RIOT-2020]. Avoiding a sensational label does not remove the need for scrutiny. It makes the scrutiny more precise.

### 3.4 Availability

Availability includes both technical uptime and legitimate access. A security system may protect competitive integrity by rejecting a host whose state does not meet policy, yet that same decision can exclude a legitimate player. Stronger prerequisites may require newer operating-system versions, compatible firmware, enabled security features, or changes that interact with older drivers and hardware.

This produces a policy tension rather than a simple defect. Accepting uncertain evidence can weaken assurance for all participants; rejecting it can deny service to an honest user. Proportionate handling requires clear prerequisites, safe pre-checks, understandable remediation, compatibility testing, rollback or recovery paths, and an explanation of what a denial means. Availability is consequently part of the security analysis, not an operational detail to be considered after integrity.

## 4. Evidence Taxonomy and Method

The project uses a qualitative, evidence-bounded case-study method. Its central validity control is a four-class evidence taxonomy.

**Riot statement** identifies a product, architecture, requirement, privacy, or reported operational description published by Riot. It is primary evidence of what the vendor publicly states. It is not independent confirmation of implementation, effectiveness, complete data flow, or every operational outcome.

**Microsoft platform mechanism** identifies an officially documented Windows behavior or prerequisite. This class can establish what Secure Boot, TPM, VBS/HVCI, IOMMU protection, driver signing, privilege modes, or runtime attestation are designed to provide. It cannot establish that Riot uses every mechanism exactly as inferred, disclose backend policy, or prove a product-level outcome.

**Project inference** is a conditional interpretation assembled from the first two classes and primary security standards. For example, the conclusion that On-Demand redistributes part of the trust argument from continuous Vanguard observation toward hardened platform state and signed evidence is an inference, not a quotation or implementation finding [C-014]. Its confidence is limited by missing source code, private policy, complete telemetry, and live observation.

**Demonstrator result** is behavior reproduced by repository code and tests. Fixed digest values and posture-logic transitions belong here. These results are high confidence for the demonstrator but provide no empirical evidence about Vanguard itself.

The procedure has nine steps. Sources are first registered with an identifier, access date, evidence class, and scope note. Material statements are converted into claim records. Each claim receives a confidence level, allowed wording, and prohibited overclaim. The public component model is then reconstructed and trust boundaries are identified. A threat model relates assets and threat classes to documented controls and residual limitations. The earlier system-start and optional On-Demand models are compared. Only safe concepts are implemented in the demonstrator. Deterministic behavior and repository invariants are tested. Finally, conclusions are reviewed for unsupported movement from vendor statement to independent fact, platform capability to product guarantee, or inference to certainty.

This method favors traceability over breadth. Claim identifiers such as `[C-008]` connect a conclusion to its bounded record; source identifiers such as `[S-MS-RUNTIME]` connect the record to a public primary source. An empty source field is meaningful for `[C-017]`, which records the project's own scope decision that no live measurement is performed. The manifest verifies counts and paths, while repository checks reject unknown identifiers. The evidence freeze prevents silent source drift: later product or documentation changes require the register and affected conclusions to be reopened.

## 5. Public Vanguard Architecture and Trust Boundaries

The simplified model contains four principal elements. The Riot or League client and the Vanguard user-mode service operate above the operating-system privilege boundary. Riot publicly describes a kernel-mode driver below that boundary and a remote Vanguard platform involved in the broader system [C-003] [S-RIOT-2020]. The public retrospective uses the names `vgc` for the user-mode service and `vgk` for the driver [C-004] [S-RIOT-RETRO-2024]. Riot also states that network communication is associated with the user-mode component and platform rather than a direct driver connection; this project attributes that statement and does not claim independent packet-level verification [C-015].

The first trust boundary is the **application boundary** between ordinary client activity and the security service. Inputs, process state, and service decisions cross a boundary where ordinary application behavior becomes security-relevant. The second is the **privilege boundary** between user mode and kernel mode. Crossing it can improve access to system-level observations and resistance to lower-privilege interference, while increasing defect impact and the assurance expected of code, update, and recovery processes.

The third is the **platform boundary** among the driver, the Windows kernel, firmware, and hardware-supported mechanisms. Secure Boot is relevant to establishing a trusted startup path [S-MS-SECUREBOOT]. TPM 2.0 can protect keys and support evidence bound to measured platform state, but does not decide by itself whether a driver or session is trustworthy [C-009] [S-MS-TPM]. VBS creates an isolated security environment and HVCI uses that boundary to strengthen kernel code-integrity enforcement, subject to prerequisites and compatibility [C-010] [S-MS-VBS] [S-MS-HVCI]. An IOMMU can remap and restrict memory access by DMA-capable devices, but coverage depends on platform, firmware, bus, driver, and boot-stage conditions [C-011] [S-MS-IOMMU].

The fourth is the **network and policy boundary** between local evidence and remote interpretation. A signed report, observed state, or component signal becomes a service decision only after policy evaluates it. Freshness, expected configuration, report validity, account context, and risk tolerance may all matter. The public sources do not reveal a complete policy. A diagram that draws a line from local evidence to a platform must therefore be read as a high-level relationship, not a verified packet sequence, API contract, or exhaustive data-flow map.

These boundaries show why “is the driver trusted?” is underspecified. Trust is distributed across publisher identity, Windows enforcement, firmware and hardware configuration, local component behavior, evidence freshness, backend interpretation, updates, and user-facing recovery. A weakness or false assumption at one boundary can reduce assurance elsewhere. Conversely, multiple independent controls can provide defense in depth without any single control becoming proof of a clean host.

## 6. Threat and Control Analysis

The protected assets are confidence in a fair game state; integrity of the game and local security components; trustworthy evidence about the host; availability for legitimate players; authenticity of updates; and user confidence that privileged software remains within its disclosed purpose. The relevant adversary is a player or software supplier seeking an unfair advantage on a computer the player controls. High-level threat classes include user-mode process manipulation, kernel-capable code, misuse of vulnerable signed drivers, changes before anti-cheat activation, DMA-capable peripherals, and pre-operating-system manipulation. Operational bypass detail is excluded.

Against user-mode manipulation, a privileged driver may obtain visibility or resistance unavailable to an ordinary process. This is a plausible rationale for crossing the privilege boundary, not proof of complete detection. Private detection logic, update quality, false-positive handling, and server-side correlation remain unknown. The residual risk includes the wider failure impact of privileged code [C-001] [C-018].

Against substitution or tampering, hashes, signatures, certificates, and Windows code-integrity rules can work together. A digest detects a byte-level difference from a selected baseline. Signing associates code with an accepted publisher and supports integrity through a trust chain. HVCI can strengthen enforcement of kernel code integrity. None establishes that a correctly signed component is free from design errors or exploitable defects [C-010] [C-012]. Update provenance, certificate handling, vulnerability response, and rollback remain important controls.

Against manipulation before activation, the earlier Vanguard design relies on starting the driver with the system. Riot explains this as reducing a “who loads first” observation gap: a control that begins later may lack trustworthy knowledge about earlier host state [C-005] [S-RIOT-2020] [S-RIOT-ONDEMAND-2026]. Early presence improves continuity only under assumptions about the boot chain, component integrity, and observation quality. It cannot prove that no earlier or lower-level manipulation occurred.

On an eligible platform, Secure Boot, measured state, VBS/HVCI, IOMMU protection, and signed runtime evidence can address different portions of the late-start problem. Secure Boot protects the startup chain; TPM-supported measurements and keys help bind evidence to platform state; HVCI strengthens kernel code-integrity policy; IOMMU remapping reduces some DMA exposure; and runtime attestation can provide signed, nonce-bound evidence for backend validation [C-007] [C-008] [C-009] [C-010] [C-011]. Coverage and configuration matter. A list of mechanisms is not equivalent to a validated end-to-end policy.

Availability and user trust remain residual concerns. A legitimate device may lack a prerequisite, use incompatible firmware or drivers, or produce evidence the service cannot accept. Remediation that asks users to change firmware security settings can itself be risky if instructions, backup, and recovery are inadequate. Privacy analysis also remains bounded: Riot states a relationship in which the user-mode component communicates with the platform, but the project does not independently inspect traffic, telemetry fields, retention, or every data practice [C-015]. Disclosure and user controls improve accountability; they do not replace verification.

The overall control strategy is best understood as layered risk reduction. Kernel privilege addresses a class of local asymmetry. Platform security mechanisms address boot, code-integrity, key, and DMA concerns. Signed evidence supports remote reasoning. Service policy turns evidence into access decisions. Each layer adds assumptions and operational responsibilities. The public model can plausibly increase assurance, but it cannot establish a perfectly clean host or a complete detection boundary.

## 7. System-Start and On-Demand Comparison

The earlier public design starts the Vanguard driver with the system. Riot's stated rationale is continuity: when a control is present early, it reduces uncertainty about changes that could occur before later activation [C-005]. The assurance argument is temporal. The system trusts an observation chain that begins near startup and remains present until the protected session. Its strength is reduced dependence on reconstructing earlier state. Its trade-off is that the public model assigns a longer active lifetime to privileged code and therefore a continuing availability and trust responsibility [C-018].

Riot's June 2026 publication describes an optional On-Demand mode that can start Vanguard with a Riot game on a sufficiently secured, eligible PC [C-006] [S-RIOT-ONDEMAND-2026]. Public requirement groups include Windows 11 25H2 or later, UEFI Secure Boot, TPM 2.0, VBS/HVCI, and IOMMU support [C-007]. A manual checklist of these groups is not the actual Pre-Check and cannot determine eligibility. Version details, configuration, report contents, policy thresholds, and device-specific behavior remain the responsibility of the actual product.

The On-Demand assurance argument is evidentiary rather than continuously observational. If a security component starts later, it needs another basis for accepting earlier host state. Hardened startup requirements, protected measurements, code-integrity enforcement, DMA controls, and signed runtime reports can provide evidence about that state. Microsoft documents nonce support and backend validation for runtime attestation, which is relevant to freshness and replay resistance [C-008]. The service must still decide which evidence is sufficient, current, internally consistent, and applicable to the requested session.

This project therefore interprets On-Demand as a redistribution of trust: part of the historical assurance moves from uninterrupted Vanguard observation toward platform-enforced state, signed evidence, and backend interpretation [C-014]. It would be an overclaim to call that model categorically more secure, less secure, more private, or equivalent. The two designs make different assumptions and concentrate responsibility in different places.

System-start continuity depends strongly on the early component, its update path, and its ability to remain compatible throughout its stated lifetime. On-Demand depends visibly on the documented Windows and hardware prerequisites, correct configuration, evidence freshness, and backend validation [C-006] [C-007] [C-014]. On-Demand is available only on eligible systems; the public evidence does not establish comparative device coverage or compatibility rates. Neither design removes platform dependencies, admission errors, or the need for transparent recovery [C-018].

Privacy implications also require careful wording. The public descriptions establish different activation lifetimes, but lifetime alone does not establish what data is collected, how it is processed, or whether private policy changed [C-005] [C-006] [C-015]. Conversely, continuous presence does not prove continuous collection. Without traffic capture, sufficient telemetry documentation, or implementation access, the defensible result is a change in trust structure—not a privacy benefit or complete privacy verdict [C-017].

## 8. Security, Privacy, Compatibility, and Availability Findings

**Finding 1 — Privilege is both a control and an assurance burden.** Kernel execution can place a defensive component near the privilege level of relevant threats, improving potential visibility and resistance. It also increases the blast radius of defects, incompatible interactions, or compromise. The security case must therefore include the privileged control itself, its signing and update chain, recovery, and responsible disclosure [C-001] [C-018].

**Finding 2 — Integrity, authenticity, and policy acceptance must remain separate.** A matching hash supports byte equality with a baseline. A trusted signature supports origin and integrity under a certificate relationship. A runtime report supports statements covered by its signed structure and validity rules. A service decision adds private policy. Treating any one as proof of safety collapses distinct questions and creates false assurance [C-002] [C-008] [C-012].

**Finding 3 — On-Demand changes where historical trust is obtained.** The system-start argument favors continuity from early boot. The On-Demand argument relies more heavily on hardened platform state, signed runtime evidence, freshness, and remote interpretation. This is a redistribution of trust rather than removal of trust [C-005] [C-014].

**Finding 4 — Platform controls are complementary and conditional.** Secure Boot, TPM 2.0, VBS/HVCI, IOMMU protection, and runtime attestation address different threat surfaces. Their guarantees depend on configuration, hardware and firmware support, coverage, report validation, and policy. Manually confirming five labels does not reproduce the product's eligibility decision [C-007] [C-008] [C-009] [C-010] [C-011].

**Finding 5 — Privacy cannot be inferred from privilege or active lifetime alone.** Riot states that the user-mode component and platform have the network relationship described in its public architecture [C-015]. This study neither confirms the complete flow nor measures data collection. The documented activation change does not by itself prove a privacy improvement [C-005] [C-006] [C-017].

**Finding 6 — Availability is an explicit security trade-off.** Strong posture requirements may increase assurance for admitted sessions while excluding legitimate users, exposing firmware and driver incompatibilities, or requiring remediation. Sound security therefore includes pre-check clarity, safe instructions, compatibility testing, meaningful errors, rollback, and recovery—not only rejection of uncertain hosts [C-018].

Together, the findings reject two simplistic conclusions. The public evidence does not support “kernel driver equals rootkit” because privilege alone does not establish concealment, unauthorized persistence, or purpose [C-013]. It also does not support “documented controls equal complete safety” because vendor statements, platform mechanisms, and private policy leave residual uncertainty. The defensible position is conditional: the architecture can plausibly raise assurance against relevant threat classes while creating substantial engineering and governance obligations.

## 9. Interactive Demonstrator Design and Reproducible Results

The Interactive Security Demonstrator is a supporting artifact, not the principal research product. It has four views: System Model, Posture Model, Integrity Demonstrator, and Evidence. The System Model makes the user-mode/kernel-mode boundary visible. The Posture Model lets a reader manually mark the five public On-Demand requirement groups. The Integrity Demonstrator computes SHA-256 locally and compares a selected file with an in-memory baseline. The Evidence view preserves the difference among vendor statement, platform documentation, inference, and reproduced result.

The demonstrator is intentionally static and dependency-free at runtime. It has no backend, account system, analytics, upload endpoint, remote script, external font, or runtime network request. A restrictive Content Security Policy sets `connect-src 'none'`. Selected file bytes remain in the browser context, and the baseline is cleared on refresh. The application does not read operating-system configuration, firmware, TPM state, drivers, processes, game memory, Vanguard state, or network traffic.

The posture exercise aggregates five manual Boolean inputs. An incomplete state means only that the reader has not confirmed every field. A complete state means only that the five public groups were manually marked. It is not a Vanguard Pre-Check result, and it cannot decide whether a Windows PC is eligible. The pedagogical result is that a trust decision commonly combines several attributes rather than relying on one control.

The integrity exercise provides two harmless fixed text samples. Sample A produces SHA-256 `98e1521a889fa6ef3e88b60a125bd569f0b6a9c228a4b492e902ef6b2c8e7c9a`. Modified Sample B produces `677197ccc10c1da9241d73ec32413cc125e0fd89616ca6c4637247b85f7e5588`. Setting Sample A as the baseline and comparing Sample B yields `MISMATCH`; repository tests reproduce both digests and the comparison semantics [C-016]. A match would prove only equality with the selected baseline for this exercise. Neither outcome proves authenticity, authorization, safety, malware absence, or any Vanguard property [C-012].

Reproduction uses Node only to serve and test static files consistently. `npm ci --ignore-scripts` establishes the locked development environment; `npm run ci` checks syntax, unit behavior, repository invariants, evidence links, and security boundaries; `npm run serve` exposes the static app on localhost. The maintained CI matrix covers Node 22 and 24, while the application itself runs in a current browser on macOS, Windows, or Linux. Determinism comes from fixed input bytes and the standard SHA-256 algorithm, not from a simulated anti-cheat result.

## 10. Validity, Ethical Boundary, and Non-Goals

The strongest validity limitation is the absence of live product measurement [C-017]. The project records no startup timing, performance, process list, driver state, network trace, telemetry, firmware state, compatibility outcome, or security event. Vanguard source code, proprietary detection logic, complete component inventory, backend policy, and full data handling are unavailable. Riot material is first-party evidence. Microsoft documentation establishes platform behavior but cannot prove Riot's exact use or validation. The architecture is a teaching model, not a verified data-flow diagram.

Temporal validity is also limited. The report uses a fixed 12 July 2026 snapshot. Product requirements and platform documentation may change. Reuse after the snapshot requires checking the official sources, updating the register, and reassessing dependent claims. Findings should not be generalized automatically to every anti-cheat, endpoint-security product, operating system, or hardware platform.

The ethical boundary excludes reverse engineering, exploit discovery, bypass or evasion development, memory manipulation, process injection, persistence, packet interception, credential use, modification of product files, kernel or firmware development, and testing without authorization. No human-subject study, player profiling, or personal dataset is involved. This scope supports critical analysis without producing operational abuse guidance.

The public repository is privacy-minimized by construction. It contains no student record, institutional mailbox, player/account data, device capture, private portal reference, or restricted source. Public citations identify organizations and documents, while authorship uses a project-level contributor identity. Git hosting necessarily exposes the repository owner's handle and any contributor identities attached to public commits; that platform metadata is not presented as student or institutional project data. The demonstrator processes files locally and retains its baseline only in memory.

Finally, the report avoids both endorsement and accusation. It is independent educational research and is not affiliated with Riot Games or Microsoft. Public names are used only to identify the subject and sources. An unresolved question remains unresolved: evidence gaps are not filled with speculation, and a lack of independent verification is not converted into a negative finding.

## 11. Conclusion

Riot Vanguard's public host-trust model addresses a real asymmetry: a competitive service must reason about a session running on a computer controlled by the participant. Riot describes a user-mode component, a kernel-mode driver, and a remote platform [C-003] [C-004]. Kernel privilege can support observation and resistance at a level relevant to privileged threats, but it also enlarges failure impact and the assurance burden [C-001] [C-018].

The comparison between system-start and optional On-Demand operation shows a change in the structure of trust. The earlier model emphasizes continuity from early system startup [C-005]. The On-Demand model is available only on eligible systems and publicly names stronger Windows and hardware-supported prerequisites [C-006] [C-007]. The most defensible interpretation is that part of the historical trust moves toward platform hardening, signed evidence, freshness, and backend policy [C-014]. This may alter active lifetime and compatibility, but the public evidence does not establish a universal security or privacy ranking.

The broader lesson is that digital trust is composed. Integrity, authenticity, privilege, availability, platform state, evidence freshness, and policy acceptance must be analyzed separately before they are combined [C-002]. Secure Boot, TPM 2.0, VBS/HVCI, IOMMU protection, driver signing, and runtime attestation are complementary controls with scope conditions [C-007] [C-008] [C-009] [C-010] [C-011] [C-012]. They can raise assurance without proving a perfectly clean host.

The Interactive Security Demonstrator reinforces that boundary. It makes privilege and posture concepts visible and reproduces a deterministic hash mismatch [C-016], while explicitly providing no evidence about a live Vanguard installation [C-017]. The project's result is therefore methodological and conditional: stronger host-integrity assurance can be plausible under documented assumptions, yet it increases engineering, governance, compatibility, privacy, and availability responsibilities. That is a more useful conclusion than an absolute verdict because it identifies where trust is placed, what supports it, and what remains unknown.

## 12. Public References

The machine-readable canonical register is [`research/sources.csv`](../research/sources.csv). A [human-readable reference index](../research/references.md) provides the same 15 records with direct official links, access dates, evidence classes, and scope notes.

- `[S-NIST-80053]` NIST, *Security and Privacy Controls for Information Systems and Organizations, SP 800-53 Rev. 5*.
- `[S-NIST-ROOTKIT]` NIST, *rootkit — CSRC Glossary*.
- `[S-RIOT-2020]` Riot Games, *A Message About Vanguard From Our Security & Privacy Teams* (2020).
- `[S-RIOT-LOL-2024]` Riot Games / League of Legends, */dev: Vanguard x LoL* (2024).
- `[S-RIOT-RETRO-2024]` Riot Games / League of Legends, */dev: Vanguard x LoL Retrospective* (2024).
- `[S-RIOT-ONDEMAND-2026]` Riot Games, *Incoming: Vanguard On-Demand* (2026).
- `[S-MS-MODES]` Microsoft, *User Mode and Kernel Mode*.
- `[S-MS-RUNTIME]` Microsoft, *GetRuntimeAttestationReport function*.
- `[S-MS-TPM]` Microsoft, *Trusted Platform Module fundamentals*.
- `[S-MS-VBS]` Microsoft, *Virtualization-based Security*.
- `[S-MS-HVCI]` Microsoft, *Memory integrity enablement*.
- `[S-MS-IOMMU]` Microsoft, *Kernel DMA Protection*.
- `[S-MS-SIGNING]` Microsoft, *Driver signing*.
- `[S-MS-SECUREBOOT]` Microsoft, *Secure the Windows boot process*.
- `[S-W3C-WEBCRYPTO]` W3C, *Web Cryptography Level 2*.
