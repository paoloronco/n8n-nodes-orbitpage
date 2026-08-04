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
