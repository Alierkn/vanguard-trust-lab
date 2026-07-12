# Public References

This index mirrors the 15 records frozen in [`sources.csv`](sources.csv) on 12 July 2026. The CSV remains the machine-readable canonical register; this page is the reader-facing route to the official sources. Source IDs also appear in the report and claim register.

## Security standards and terminology

### [S-NIST-80053] Security and Privacy Controls for Information Systems and Organizations — SP 800-53 Rev. 5

- **Publisher:** NIST
- **Version/date:** 2020; update 1
- **Evidence class:** Primary standard
- **Project scope:** Least privilege and assurance context
- **Accessed:** 12 July 2026
- **Official source:** [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

### [S-NIST-ROOTKIT] rootkit — CSRC Glossary

- **Publisher:** NIST
- **Version/date:** Current at access
- **Evidence class:** Primary terminology
- **Project scope:** Rootkit definitions and cited source documents
- **Accessed:** 12 July 2026
- **Official source:** [NIST CSRC glossary entry](https://csrc.nist.gov/glossary/term/rootkit)

## Riot public statements

### [S-RIOT-2020] A Message About Vanguard From Our Security & Privacy Teams

- **Publisher:** Riot Games
- **Published:** 17 April 2020
- **Evidence class:** Riot statement
- **Project scope:** Public component architecture, privilege rationale, privacy, and control statements
- **Accessed:** 12 July 2026
- **Official source:** [Riot Games article](https://www.riotgames.com/en/news/a-message-about-vanguard-from-our-security-privacy-teams)

### [S-RIOT-LOL-2024] /dev: Vanguard x LoL

- **Publisher:** Riot Games / League of Legends
- **Published:** 11 April 2024
- **Evidence class:** Riot statement
- **Project scope:** League deployment context and public product explanation
- **Accessed:** 12 July 2026
- **Official source:** [League of Legends developer article](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol/)

### [S-RIOT-RETRO-2024] /dev: Vanguard x LoL Retrospective

- **Publisher:** Riot Games / League of Legends
- **Published:** 22 August 2024
- **Evidence class:** Riot statement
- **Project scope:** Component names and reported operational and compatibility context
- **Accessed:** 12 July 2026
- **Official source:** [League of Legends retrospective](https://www.leagueoflegends.com/en-us/news/dev/dev-vanguard-x-lol-retrospective/)

### [S-RIOT-ONDEMAND-2026] Incoming: Vanguard On-Demand

- **Publisher:** Riot Games
- **Published:** 24 June 2026
- **Evidence class:** Riot statement
- **Project scope:** Optional On-Demand model, Pre-Check groups, and system-start rationale
- **Accessed:** 12 July 2026
- **Official source:** [Riot Games article](https://www.riotgames.com/en/news/vanguard-on-demand)

## Microsoft platform mechanisms

### [S-MS-MODES] User Mode and Kernel Mode

- **Publisher:** Microsoft
- **Updated:** 31 October 2025
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Privilege separation, isolation, and failure impact
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/user-mode-and-kernel-mode)

### [S-MS-RUNTIME] GetRuntimeAttestationReport function

- **Publisher:** Microsoft
- **Updated:** 22 January 2026
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Signed Secure Kernel report, nonce, report types, and validity requirements
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn API reference](https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getruntimeattestationreport)

### [S-MS-TPM] Trusted Platform Module fundamentals

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Hardware-backed keys and measured platform state
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/hardware-security/tpm/tpm-fundamentals)

### [S-MS-VBS] Virtualization-based Security

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Hypervisor-backed isolation and security boundary
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-vbs)

### [S-MS-HVCI] Memory integrity enablement

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** VBS/HVCI kernel code-integrity mechanism and prerequisites
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-hvci-enablement)

### [S-MS-IOMMU] Kernel DMA Protection

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** IOMMU/DMA remapping purpose and scope limits
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/hardware-security/kernel-dma-protection-for-thunderbolt)

### [S-MS-SIGNING] Driver signing

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Windows driver-signing purpose and trust relationship
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/driver-signing)

### [S-MS-SECUREBOOT] Secure the Windows boot process

- **Publisher:** Microsoft
- **Version/date:** Current at access
- **Evidence class:** Microsoft platform mechanism
- **Project scope:** Secure Boot and the trusted startup path
- **Accessed:** 12 July 2026
- **Official source:** [Microsoft Learn](https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/secure-the-windows-10-boot-process)

## Demonstrator web standard

### [S-W3C-WEBCRYPTO] Web Cryptography Level 2

- **Publisher:** W3C
- **Version/date:** Working Draft at access
- **Evidence class:** Web standard
- **Project scope:** Browser `SubtleCrypto.digest()` API used by the demonstrator
- **Accessed:** 12 July 2026
- **Official source:** [W3C Web Cryptography Level 2](https://www.w3.org/TR/webcrypto/)

## Use boundary

These links support the evidence classes and narrow scope notes recorded above. A vendor statement is not independent verification; a platform mechanism does not reveal a private product implementation; and a demonstrator result applies only to this repository.
