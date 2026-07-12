# Presentation Guide

This guide turns the canonical report into a ten-slide, approximately 12–15 minute presentation. The speaking notes are prompts, not a script that must be memorized.

## Slide 1 — Title and one-sentence problem

**On slide**

- Vanguard Host Trust: Integrity, Privilege, and Digital Trust
- An Evidence-Bounded System Security Research Project
- Problem: deciding whether to trust a competitive session on a player-controlled host

**Speaker notes**

Open with the security asymmetry. The game service does not control the player's computer, but it still needs confidence that the session is fair. State immediately that the project analyzes public documentation and a teaching demonstrator; it is not an audit of a live Vanguard installation.

## Slide 2 — Research question and contribution

**On slide**

> How does Riot Vanguard seek host-level game integrity, and what security and availability trade-offs follow from privileged enforcement and stronger platform requirements?

- Public evidence register
- System and threat model
- System-start versus On-Demand comparison
- Reproducible demonstrator

**Speaker notes**

Explain that the project contributes a method and a traceable model, not a “safe” or “unsafe” verdict. Briefly show the five work packages and emphasize that the report is the main product; the web interface supports it.

## Slide 3 — Evidence method

**On slide**

| Class | What it can establish | What it cannot establish |
|---|---|---|
| Riot statement | What the vendor publicly describes | Independent implementation or effectiveness |
| Microsoft mechanism | Documented Windows behavior | Riot's private use or policy |
| Project inference | Conditional interpretation | Certainty |
| Demonstrator result | Tested repository behavior | Vanguard behavior |

**Speaker notes**

Show one claim identifier and one source identifier. Explain that all material wording is constrained by the claim register. This is the main defense against accidentally converting vendor statements into independent facts.

## Slide 4 — Public system model and trust boundaries

**On slide**

- Riot/League client and `vgc`: user mode
- `vgk`: kernel mode
- Windows, firmware, and hardware-supported controls
- Remote platform and policy
- Boundaries: application, privilege, platform, network/policy

**Speaker notes**

Use the demonstrator's system diagram. The diagram is simplified and is not a verified packet flow. Focus on the kernel boundary: it can give a control stronger visibility, but a defect can affect the whole system rather than one isolated process.

## Slide 5 — Four questions that must not be collapsed

**On slide**

- Integrity: did state change?
- Authenticity: who produced or approved it?
- Privilege: what can it affect, and what is the failure impact?
- Availability: can a legitimate user still access the service?

**Speaker notes**

Use the hash example. A matching digest does not prove that the baseline is genuine or safe. A valid signature does not prove bug-free code. A powerful control is not automatically trustworthy. A strict policy can protect sessions while excluding legitimate users.

## Slide 6 — Threats and layered controls

**On slide**

- User-mode and kernel-capable manipulation
- Pre-activation changes
- Tampered or vulnerable components
- DMA-capable devices and pre-OS state
- Controls: signing, Secure Boot, TPM, VBS/HVCI, IOMMU, runtime attestation

**Speaker notes**

Present the controls as complementary. Each covers a different part of the problem and has conditions. Avoid saying that the list creates a perfectly clean host. The private detection logic and backend acceptance policy are not available to this project.

## Slide 7 — System-start versus On-Demand

**On slide**

| System-start | Optional On-Demand |
|---|---|
| Early continuity | Later activation on eligible PCs |
| Longer privileged lifetime | Stronger stated platform prerequisites |
| Less need to reconstruct earlier state | Greater reliance on platform evidence and validation |

**Speaker notes**

Describe the key inference: trust is redistributed, not eliminated. System-start emphasizes continuous observation from early boot. On-Demand emphasizes hardened state, signed evidence, freshness, and backend interpretation. Do not call either model categorically superior.

## Slide 8 — Six findings

**On slide**

1. Privilege is both a control and an assurance burden.
2. Integrity, authenticity, and policy acceptance differ.
3. On-Demand changes where historical trust is obtained.
4. Platform mechanisms are complementary and conditional.
5. Privacy is not determined by privilege or active lifetime alone.
6. Availability is a security trade-off.

**Speaker notes**

Spend about one sentence on each. The strongest synthesis is that stronger host assurance can be plausible while increasing engineering, governance, compatibility, privacy, and recovery responsibilities.

## Slide 9 — Live demonstrator

**On slide**

- Manually complete the five posture groups
- Load Sample A and set the in-memory baseline
- Load Modified Sample B and compare
- Expected result: `MISMATCH`

**Speaker notes**

Say the boundary before clicking: the page has not inspected a device and the posture checklist is not Pre-Check. After the mismatch, state that only the bytes differ. Point out that the app has no backend or runtime network request and works in a modern browser on macOS, Windows, or Linux.

## Slide 10 — Conclusion and limits

**On slide**

- Digital trust is composed, conditional, and policy-mediated.
- Stronger controls move and reduce risk; they do not remove it.
- No live measurement, reverse engineering, bypass work, or product verdict.
- Evidence snapshot: 12 July 2026.

**Speaker notes**

Answer the research question directly. Vanguard's public model combines privileged enforcement with platform trust and remote policy. This can plausibly raise assurance against relevant threat classes, while increasing the consequences of defects and the importance of compatibility, evidence validation, transparency, and recovery.

## Likely defense questions

### “Why did you build a browser demonstrator if Vanguard is Windows software?”

The demonstrator does not simulate or replace Vanguard. It isolates concepts that are safe and reproducible on any modern desktop: privilege boundaries, multi-attribute posture reasoning, and byte-integrity comparison. Its cross-platform design is methodological, not a workaround for missing Windows access.

### “Does kernel access make Vanguard a rootkit?”

No classification can be made from privilege alone. Authorization, disclosure, concealment, persistence, purpose, and observed behavior are also relevant. The project neither applies that label nor treats privileged software as exempt from scrutiny.

### “Is On-Demand more private or more secure?”

The public evidence supports a change in active lifetime and trust structure, not a categorical ranking. A complete answer would require implementation, telemetry, policy, compatibility, and operational evidence outside this project's scope.

### “Do five enabled requirements prove that a PC is eligible?”

No. The demonstrator accepts manual inputs and never reads a host. The actual product decides eligibility using its real Pre-Check, versions, configuration, evidence, and private policy.

### “What does the hash experiment prove?”

Only whether the compared bytes match the selected in-memory baseline. It does not prove origin, authorization, safety, malware absence, or anti-cheat effectiveness.

### “What is the most important limitation?”

There is no live Windows or Vanguard measurement. The report is a traceable analysis of public claims and platform mechanisms, and its conclusions are deliberately conditional.

### “Why use only official public sources?”

The restricted source set makes provenance and wording easier to audit. Riot material establishes what the vendor publicly states; Microsoft, NIST, and W3C material establishes platform, terminology, control, and cryptographic context. Secondary commentary may help discovery but cannot silently become the basis of a technical conclusion.

### “Does runtime attestation prove that a host is clean?”

No. Microsoft documents a signed report, nonce support, validity conditions, and backend validation. That evidence can support specific statements about covered state, but it does not prove a perfectly clean host or reveal Riot's private acceptance policy.

### “What is the principal availability risk?”

A stronger posture policy can reject a legitimate user whose operating system, firmware, hardware, configuration, or evidence does not meet the rule. Proportionate handling therefore needs clear prerequisites, safe remediation, compatibility testing, meaningful errors, and recovery.

### “What evidence would most strengthen a future version?”

A materially changed official source should first reopen the evidence snapshot. Separately authorized and ethically reviewed independent measurements could answer performance or compatibility questions, but they would require new claims, methods, risk controls, and a scope decision rather than being folded into this public dossier automatically.

## Presentation safety checklist

- Attribute product descriptions to Riot.
- Attribute Windows mechanisms to Microsoft.
- Label comparative conclusions as project inference.
- Describe demonstrator results as repository behavior only.
- Never imply a device, account, driver, or network was inspected.
- Avoid absolute words such as “guarantees,” “perfectly secure,” “spyware,” or “complete detection.”
