# GitHub Repository Security Settings

This file records controls that live outside Git and therefore cannot be enforced by source alone.

## General

- Public visibility with a clean public-only history.
- Squash merge only; delete merged head branches.
- Issues enabled; wiki and unused features disabled.
- No personal email or private project metadata in profile-facing repository fields.

## Main branch ruleset

- block deletion and non-fast-forward updates;
- require pull requests and passing CI/CodeQL when collaboration makes review practical;
- require conversation resolution and linear history;
- do not require a review that a single maintainer cannot satisfy;
- allow emergency bypass only to the repository owner with a documented reason.

## Actions

- default `GITHUB_TOKEN` permission is read-only;
- allow only required GitHub-authored actions;
- pin every action to a full commit SHA;
- never execute fork code with `pull_request_target`;
- keep write permissions at job scope only;
- use timeouts, concurrency cancellation, locked installs, and ignored package scripts;
- keep workflow artifacts short-lived; use Releases for durable source bundles.

## Security features

Enable Dependabot alerts and security updates, CodeQL, secret scanning, push protection, private vulnerability reporting, and automatic deletion of merged branches. Review alerts rather than assuming a green dashboard proves absence of vulnerabilities.

## Pages boundary

GitHub Pages publishes `app/` only. Research files, repository metadata, release artifacts, and Git history are not part of the deployed site. The page has a CSP meta policy, but GitHub Pages does not provide repository-controlled custom security response headers; this limitation is recorded in `security-architecture.md`.

## Release boundary

The tag workflow has read-only contents permission and uploads a temporary source candidate. Publishing a permanent GitHub Release remains a deliberate maintainer action after validation.
