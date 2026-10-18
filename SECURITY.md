# Security policy

## Report a vulnerability privately

Send suspected vulnerabilities to `contact@orbitpage.com`. Do not open a public
issue when a report contains or could expose:

- API tokens or authorization headers;
- signed upload URLs or upload tokens;
- workspace, subscriber, or other personal data;
- unpublished exploit details;
- sensitive n8n execution payloads.

Please include the package version, n8n and Node.js versions, affected node and
operation, security impact, and minimal reproduction steps. Use synthetic data
and redact secrets. If a credential is needed to reproduce the issue, request a
safe exchange method instead of sending a real production token by email.

Reports are assessed against the latest published package. Reports affecting an
older version are still useful; reproduce on the latest version when practical.
No public disclosure timeline should be assumed until scope and remediation
have been coordinated with the maintainers.

## Security boundaries

OrbitPage personal API tokens are bearer secrets. The n8n credential encrypts
stored values, but a workflow can perform every operation allowed by its
selected token.

- Use one token per workflow and environment.
- Grant the smallest required scopes and prefer finite expiration.
- Do not store tokens in workflow JSON, expressions, logs, screenshots, issue
  attachments, or example files.
- Do not log signed upload URLs, authorization headers, or sensitive response
  bodies.
- Change the Base URL only for an OrbitPage-provided staging environment. The
  bearer token is sent to the configured host.
- Require human review before destructive, publishing, email, billing, restore,
  or AI-selected actions.
- Revoke a token immediately after suspected disclosure.

The action node rejects non-local HTTP Base URLs, prevents credential forwarding
across cross-origin redirects, constrains authenticated requests to the
configured hostname, and uploads binary data to signed storage URLs without the
OrbitPage bearer token.

These controls do not replace secure n8n operations. Restrict access to
credentials, projects, execution data, logs, backups, and the host running n8n.

## Dependency and release integrity

The package has no runtime dependency other than the `n8n-workflow` peer. CI
builds and tests the package, while release artifacts are published through the
GitHub Actions workflow with npm provenance.

Verify the package name is exactly `n8n-nodes-orbitpage` and review npm
provenance before installing it in a sensitive environment.

### Development dependency checkpoint — 2026-10-18

The official CLI is pinned to `0.52.5` and the development copy of
`n8n-workflow` to `2.43.5`. These updates remove the vulnerable Axios versions;
the lockfile also selects patched `source-map-js` `1.2.2`. The Node.js floor,
peer dependency, node versions and workflow parameters remain unchanged.

The complete development tree still has upstream advisories. This checkpoint
does not claim that `npm audit` is clean:

- The official CLI pins affected `handlebars` and reaches unpatched `braces`
  through `fast-glob` and `micromatch`.
- Its AI SDK reaches affected `stream-json` 1.x, `qs` and LangChain `uuid`.
  The backend imports `stream-json/Assembler`, which is incompatible with the
  patched 3.x API.
- `release-it` reaches affected `undici` and `basic-ftp`. Its newer release
  raises the supported Node.js floor beyond this package's current minimum.

The official strict community-node rules reject an `overrides` field in the
published package. Do not disable those checks or force incompatible versions
to make an audit appear clean. Recheck upstream updates with `npm audit` and
`npm audit --omit=dev`; the latter excludes the development toolchain.

The pre-existing native development dependency `isolated-vm` `7.0.1` declares
Node.js `>=24`. Consequently, `npm ci --engine-strict` on Node.js 22.22 fails
both before and after these updates. Package loading and behavioral tests on
Node.js 22 do not establish support for that native expression engine. Use
Node.js 24 for the full development toolchain.
