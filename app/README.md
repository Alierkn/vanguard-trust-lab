# Browser Lab

This dependency-free demonstrator makes three security boundaries observable:

1. a simplified user-mode/kernel-mode component model;
2. a manual checklist of five public Vanguard On-Demand requirement groups;
3. a local SHA-256 comparison against an in-memory baseline.

It is not an official compatibility checker, device scanner, attestation client, anti-cheat, malware detector, or Vanguard audit.

## Run on macOS, Windows, or Linux

From the repository root:

```sh
npm ci --ignore-scripts
npm run serve
```

Open `http://127.0.0.1:8000`. A current Safari, Chrome, Firefox, or Edge browser is sufficient; the Lab itself has no package dependency.

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

The Lab is cross-platform by design. Its role is to provide a safe and reproducible research artifact, not to compensate for any particular development operating system.
