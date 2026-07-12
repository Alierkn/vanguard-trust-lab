# Lab Guide

## Start on macOS, Windows, or Linux

```sh
npm ci --ignore-scripts
npm run serve
```

Open `http://127.0.0.1:8000`.

## Two-minute walkthrough

### 1. Trust boundary

Identify the Riot/League client and `vgc` in user mode, the privilege boundary, `vgk` in kernel mode, Windows resources, and the remote platform. State that this is a simplified public model rather than a verified data flow.

### 2. Manual posture reasoning

Toggle the five public requirement groups. The page never reads host state. Even five confirmed inputs are a completed teaching checklist, not a Vanguard Pre-Check result.

### 3. SHA-256 baseline

1. Load Sample A.
2. Set it as the in-memory baseline.
3. Load Sample A again and compare: `MATCH`.
4. Load Modified Sample B and compare: `MISMATCH`.

Interpretation: a mismatch proves that the compared bytes differ from the chosen baseline. It does not prove why they changed, who changed them, whether the baseline was trustworthy, or whether either file is safe.

## Privacy properties

- no upload endpoint, analytics, account, or tracking;
- no runtime request required after page load;
- no external script, stylesheet, or font;
- baseline stored only in memory and cleared on refresh;
- no operating-system, game, Vanguard, firmware, process, or network inspection.

The browser Lab is platform-independent. Node is used only to serve and test the static files consistently.
