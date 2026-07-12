# 2026/2027 Maintenance Calendar

## Runtime policy

| Window | Action |
|---|---|
| July 2026 | Maintain Node 24; keep Node 22 as compatibility; treat Node 26 as experimental. |
| Planned October 2026 | Review the Node 26 LTS transition and promote only after ecosystem validation. |
| Before Node 22 end of life | Remove Node 22 and update the minimum supported runtime. |
| Before republication | Recheck time-sensitive Riot and Microsoft claims and create a new evidence snapshot. |

Confirm dates against the official [Node.js Release Working Group](https://github.com/nodejs/Release) and [Node.js previous releases](https://nodejs.org/en/about/previous-releases) pages.

## Immutable GitHub Action pins reviewed 12 July 2026

| Action | Release | Commit SHA |
|---|---:|---|
| `actions/checkout` | 7.0.0 | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` |
| `actions/setup-node` | 6.4.0 | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` |
| `actions/upload-artifact` | 7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` |
| `actions/configure-pages` | 6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |
| `actions/upload-pages-artifact` | 5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages` | 5.0.0 | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` |
| `github/codeql-action` | 4.37.0 | `99df26d4f13ea111d4ec1a7dddef6063f76b97e9` |

Actions use immutable SHAs; Dependabot proposes reviewed updates.

## Monthly

- Review dependency and Action updates.
- Run `npm run ci` on the maintained runtime.
- Confirm Pages deploys only `app/`.
- Check that public history and release assets contain no personal or private material.

## Quarterly

- Review workflow permissions and branch rules.
- Confirm private vulnerability reporting, secret scanning, and push protection.
- Audit claim wording and public source availability.
- Review CSP and browser compatibility.

## Before a release

- freeze sources and version metadata;
- validate a clean clone;
- inspect tracked files and Git history for public-only content;
- generate the source bundle from the tagged commit;
- publish SHA-256 checksums and limitations.
