# n8n-nodes-orbitpage

[![CI](https://github.com/paoloronco/n8n-nodes-orbitpage/actions/workflows/ci.yml/badge.svg)](https://github.com/paoloronco/n8n-nodes-orbitpage/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-orbitpage.svg)](https://www.npmjs.com/package/n8n-nodes-orbitpage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

Community nodes for managing a hosted OrbitPage workspace from n8n. The
package provides guided access to all 84 operations in the OrbitPage Automation
REST API, revision-aware writes, direct binary uploads, and polling triggers for
important workspace state changes.

## Contents

- [Requirements and compatibility](#requirements-and-compatibility)
- [Installation](#installation)
- [End-to-end quick start](#end-to-end-quick-start)
- [Nodes](#nodes)
- [Operation catalog](#operation-catalog)
- [Safety](#safety)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)

## Requirements and compatibility

| Requirement | Supported setup |
| --- | --- |
| OrbitPage | A hosted OrbitPage account and workspace at `https://orbitpage.com` |
| n8n | Current n8n 2.x releases; the package uses n8n Nodes API v1 |
| Node.js | Runtime `>=20.19`; CI tests Node.js 20.19 and 22, while maintainers normally develop on 22 |
| n8n Cloud | Availability depends on the n8n community-node review process |

The package is built and load-checked against `n8n-workflow` 2.16.0. If you
must use an older n8n 1.x installation, validate the package and your workflow
in a staging instance before using it in production.

OrbitPage features remain subject to the workspace plan, token scopes, and
account permissions. Protected `/operator` operations require a separate
operator token and are not available to ordinary workspace accounts.

## Installation

### n8n Community Nodes UI

Open **Settings > Community Nodes**, select **Install**, and enter:

```text
n8n-nodes-orbitpage
```

Restart self-hosted n8n if your installation requires it.

### Self-hosted command line

From the community-nodes directory used by your n8n installation, run:

```bash
npm install n8n-nodes-orbitpage
```

Restart n8n after installation. See the
[getting-started guide](docs/guides/getting-started.md) for the complete setup
and recovery steps for partial installations.

## End-to-end quick start

1. In OrbitPage, open **Dashboard > Account > Personal API tokens**.
2. Create a token for this workflow with `workspace:read` for the initial
   connection test and first safe read.
3. In n8n, create an **OrbitPage API** credential with:

   | Field | Value |
   | --- | --- |
   | Token Type | **Personal Workspace Token** |
   | Personal API Token | The one-time `op_pat_...` secret copied from OrbitPage |
   | Base URL | `https://orbitpage.com` |

4. Save and test the credential. The workspace credential test calls
   `GET /api/v1/workspace`, so it requires `workspace:read` even when the final
   workflow only performs another operation. The operator credential test calls
   `GET /api/v1/operator/overview` and requires `operator:read`.
5. Add the **OrbitPage** node and select **Workspace → Get Workspace**.
6. Attach the credential and select **Execute step**. This first request does
   not change data.

You can also import [`examples/read-workspace.json`](examples/read-workspace.json)
or [`examples/watch-publication.json`](examples/watch-publication.json). Replace
the placeholder credential reference after import; never place a token in
workflow JSON. See [examples/README.md](examples/README.md) for details.

## Nodes

### OrbitPage

The action node groups the API into guided resources for workspace data, page
content, profile, theme, settings, publication, backups, media, domains,
analytics, AI, Shop, newsletter, team, billing, and protected operator tasks.
It also includes a relative custom API request for forward-compatible access.

Writes that use optimistic concurrency can fetch the current revision
automatically and send it as `If-Match`. Binary convenience operations handle
the reserve, signed upload, and finalize sequence without sending the OrbitPage
bearer token to the storage host.

### OrbitPage Trigger

The trigger polls a selected OrbitPage resource:

| Event | Endpoint | Required scope | Change observed |
| --- | --- | --- | --- |
| Workspace Revision Changed | `/workspace` | `workspace:read` | Workspace `revision` |
| Publication State Changed | `/publication` | `publication:read` | Current publication response |
| Custom Domain Changed | `/domains` | `domains:read` | Current domains response |
| Shop State Changed | `/shop` | `shop:read` | Current Shop response |

The first production poll establishes a baseline and emits nothing unless
**Emit Initial State** is enabled. A manual test always returns the current
state. This is state polling, not an event log: if a resource changes several
times between polls, the trigger emits the latest observed state rather than
replaying every intermediate change.

## Operation catalog

The guided catalog contains all 84 operations in the public
[OpenAPI 3.1 contract](https://orbitpage.com/api/openapi.json), plus three n8n
convenience operations for binary uploads and custom requests.

Use the generated [operation matrix](docs/OPERATIONS.md) to find the method,
relative path, required scope, request-body requirement, and revision source for
each operation. The matrix is generated from the typed catalog and must not be
edited manually.

## Safety

- Use one token per workflow and environment, with only the required scopes.
- Store bearer tokens only in n8n credentials. Do not put them in workflow JSON,
  expressions, logs, screenshots, or support messages.
- Keep operator credentials isolated from tenant workflows and prefer short
  expiry for elevated access.
- Review revision-controlled writes before publishing. Treat `409 Conflict` as
  a request to read the latest state, not as a blind retry signal.
- The action node can be exposed to n8n AI agents as a tool and includes
  publishing, restore, deletion, email, moderation, billing, and operator
  operations. Do not give an unattended agent a broad or operator credential;
  require human review for destructive or externally visible actions.
- Prefer the reviewed **AI > Plan Changes** then **AI > Commit Changes** flow.
  A provider key is not an OrbitPage credential and must never be pasted into
  this node.
- Use guided operations when available. A custom API request inherits every
  permission held by its selected credential.

Read the focused guides on
[credentials and scopes](docs/guides/credentials-and-scopes.md),
[revisions and publishing](docs/guides/revisions-and-publishing.md),
[binary uploads](docs/guides/binary-uploads.md), and
[AI and operator safety](docs/guides/ai-and-operator-safety.md).

## Documentation

- [Documentation index](docs/README.md)
- [Getting started](docs/guides/getting-started.md)
- [Complete operation matrix](docs/OPERATIONS.md)
- [Example workflows](examples/README.md)
- [OrbitPage API and token guide](https://orbitpage.com/en-US/docs/api-tokens)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

## Troubleshooting

| n8n message or API status | First action |
| --- | --- |
| `Class could not be found` | Restart n8n, remove only the stale `n8n-nodes-orbitpage` installation, and reinstall the current version. |
| `Maximum number of redirects exceeded` | Use exactly `https://orbitpage.com` as Base URL, without `/api/v1`, and check the reverse proxy. |
| `401 Unauthorized` | Replace the missing, malformed, expired, or revoked token and confirm the selected token type. |
| `403 Forbidden` | Add the operation's required scope or use the correctly isolated operator credential. |
| `409 Conflict` | Read the current resource and retry the intended change against its new revision. |
| `428 Precondition Required` | Use automatic revision fetching or provide the current `ETag`/revision as `If-Match`. |
| `429 Too Many Requests` | Observe `Retry-After`, then retry with exponential backoff and jitter. |

The [troubleshooting guide](docs/guides/troubleshooting.md) includes diagnostic
requests, installation recovery, trigger behavior, upload failures, and the
known Restore Version manual-revision limitation in package 0.1.2.

## Development

```bash
npm ci
npm run check
```

`npm run check` lints, builds, verifies package loading, checks generated
operation documentation, and runs the test suite. Read
[CONTRIBUTING.md](CONTRIBUTING.md) and the
[development and release guide](docs/guides/development-and-release.md) before
changing the operation catalog or preparing a release.

## License

[MIT](LICENSE.md) © Paolo Ronco
