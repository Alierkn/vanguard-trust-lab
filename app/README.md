# Interactive Security Demonstrator

This dependency-free browser artifact supports the **Vanguard Host Trust** public research dossier. It makes three bounded security concepts observable:

1. a simplified user-mode/kernel-mode system model;
2. a manual posture model combining five public Vanguard On-Demand requirement groups; and
3. a local SHA-256 comparison against an in-memory baseline.

It is not the project itself, an official compatibility checker, device scanner, attestation client, anti-cheat, malware detector, Vanguard audit, Pre-Check, or substitute for live Windows measurement.

## Run on macOS, Windows, or Linux

From the repository root:

```sh
npm ci --ignore-scripts
npm run serve
```

Open `http://127.0.0.1:8000`. A current Safari, Chrome, Firefox, or Edge browser is sufficient; the static demonstrator itself has no package dependency.

## Reproduce the integrity result

1. Load **Sample A** and set it as the baseline.
2. Load **Sample A** again and compare: the result is `MATCH`.
3. Load **Modified Sample B** and compare: the result is `MISMATCH`.
4. Refresh the page: the baseline is cleared.

A match establishes byte equality with the selected baseline. It does not establish source, authorization, safety, intent, or absence of vulnerabilities.

## Privacy and safety properties

- no backend, upload, analytics, tracking, account, or persistent storage;
- no remote script, stylesheet, font, or runtime package;
- selected file bytes remain inside the browser context;
- baseline state exists only in memory and clears on refresh;
- no OS, firmware, game, Vanguard, process, memory, or network inspection;
- restrictive Content Security Policy and a 50 MiB interface limit.

The demonstrator is cross-platform by design. Its role is methodological: it provides a safe, reproducible experiment layer for the research without depending on a particular development operating system.
