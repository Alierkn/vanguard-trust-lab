# Threat Model

## Scope

The model considers confidence in a competitive game session running on a player-controlled Windows PC. It evaluates public architecture and platform mechanisms, not a specific Vanguard build.

## Assets

- confidence in a fair game state;
- integrity of the game process and local anti-cheat components;
- trustworthy evidence about the Windows environment;
- availability for legitimate players;
- user confidence that privileged software remains within its disclosed purpose;
- authenticity and controlled distribution of security components and updates.

## Adversary model

The relevant adversary is a player or software supplier seeking an unfair advantage on a PC the player controls. Publicly discussed threat classes include user-mode process manipulation, kernel-capable code, misuse of vulnerable signed drivers, changes before anti-cheat activation, DMA-capable peripherals, and pre-OS manipulation.

The project deliberately omits operational bypass detail. The model describes classes and defensive relationships only.

## Threat-control-limitation matrix

| Asset or concern | Threat or failure | Public mechanism | Residual limitation or trade-off |
|---|---|---|---|
| Fair game state | User-mode automation or process manipulation | User component, privileged driver, server policy | Detection logic is private; privilege increases defect impact. |
| Component integrity | Tampered or substituted driver | Hashes, code signing, certificates, Windows code integrity | A signed driver may still be vulnerable or incorrect. |
| Early system state | Manipulation before anti-cheat activation | Earlier system-start continuity, Secure Boot, measured state | Correct configuration and evidence interpretation remain necessary. |
| Kernel integrity | Unauthorized executable kernel code | VBS/HVCI Memory Integrity | Hardware and driver compatibility matter; residual kernel risks remain. |
| Memory against peripheral DMA | DMA-capable device accesses unintended memory | IOMMU and DMA remapping | Coverage depends on firmware, driver, bus, and boot stage. |
| On-Demand history | Driver starts late without reliable history | Signed runtime attestation plus platform prerequisites | Evidence is not certainty; the acceptance policy is private. |
| Legitimate access | Unsupported posture prevents play | Pre-Check guidance, optional mode, explicit requirements | Strong posture can exclude users or require risky firmware changes. |
| User trust | Concern about active lifetime and scope | Disclosure, signing, removal/disable controls, optional On-Demand mode | Vendor statements do not independently verify every data practice. |

## Privilege as control and risk

Kernel privilege can place a defensive component at or near the privilege level of relevant threats. That may improve visibility and resistance. The same privilege enlarges the blast radius of defects, incompatibility, update compromise, or policy mistakes. The security control must therefore remain inside the threat model rather than being treated as inherently trusted.

## Availability tension

Rejecting an uncertain PC may protect other players' competitive integrity while denying service to a legitimate user. A proportionate design needs clear requirements, safe pre-checks, understandable remediation, compatibility testing, recovery, and an explicit explanation of what an access denial means.

## Defensible conclusion

The public model can plausibly increase assurance under stated assumptions. It cannot establish complete detection or a perfectly clean host. Deeper privilege and stronger platform constraints move risk; they do not eliminate it.
