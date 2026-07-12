# Public Release and Archive Policy

## Version model

Semantic versions identify the public research-software artifact. A release is immutable; corrections require a new version.

## Allowed release assets

- source ZIP built from the tagged public commit;
- `CHECKSUMS.sha256` for that archive;
- concise release notes with evidence date and limitations.

## Prohibited release assets

- restricted submissions or source copies;
- names, direct identifiers, contact addresses, or account exports;
- office documents, device captures, logs, telemetry, credentials, or local configuration;
- game or Vanguard files and third-party binaries.

## Release checklist

1. Confirm version consistency in `VERSION`, `package.json`, `CITATION.cff`, and the changelog.
2. Run `npm ci --ignore-scripts` and `npm run ci` in a clean clone.
3. Audit tracked files and the complete public Git history for private metadata.
4. Create an annotated tag from the validated commit.
5. Let the pinned release workflow build the source candidate.
6. Verify checksums independently before publishing the GitHub Release.
7. Record known limitations and evidence changes.

Long-term archival may be added later. No DOI or external archive is claimed until the service confirms it.
