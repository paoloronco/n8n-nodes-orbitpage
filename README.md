# n8n-nodes-orbitpage: OrbitPage automation for n8n

[![CI status](https://github.com/paoloronco/n8n-nodes-orbitpage/actions/workflows/ci.yml/badge.svg)](https://github.com/paoloronco/n8n-nodes-orbitpage/actions/workflows/ci.yml)
[![npm package version](https://img.shields.io/npm/v/n8n-nodes-orbitpage.svg)](https://www.npmjs.com/package/n8n-nodes-orbitpage)
[![MIT license](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

`n8n-nodes-orbitpage` is the official OrbitPage community node package for
[n8n](https://n8n.io). It connects n8n workflows to
[OrbitPage](https://orbitpage.com/en-US), a one-page website and link-in-bio builder.
It lets you automate a hosted OrbitPage workspace directly from n8n workflows.

Use the **OrbitPage** node to read page data, update drafts, publish reviewed
changes, upload media, check analytics, and manage supported workspace
features. Use **OrbitPage Trigger** to start a workflow when a draft,
publication, custom domain, or Shop state changes.

Typical automations connect forms, databases, content systems, and scheduled
workflows to an OrbitPage public page. Start with the read-only workflow below.
Operations that publish, send, delete, or bill state their effect explicitly in
the editor.

## Contents

- [Requirements and compatibility](#requirements-and-compatibility)
- [Installation](#installation)
- [End-to-end quick start](#end-to-end-quick-start)
- [Choose the right operation](#choose-the-right-operation)
- [Nodes](#nodes)
- [Request bodies and output](#request-bodies-and-output)
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
| n8n | n8n 2.x; the package uses n8n Nodes API v1 and is load-checked with `n8n-workflow` 2.16.0 |
| Node.js | Runtime `>=22.22`; CI tests Node.js 22.22 and 24, while maintainers normally develop on 22.22 |
| n8n Cloud | Availability depends on the n8n community-node review process |

If you must use an older n8n 1.x installation or a materially newer runtime,
validate the package and your workflow in a staging instance before production.

OrbitPage features remain subject to the workspace plan, token scopes, and
account permissions.

## Installation

### Self-hosted n8n UI

As an n8n instance owner, open **Settings > Community Nodes**, select
**Install**, and enter:

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
   | OrbitPage API Token | The one-time `op_pat_...` secret copied from OrbitPage |
   | OrbitPage Base URL | `https://orbitpage.com` |

4. Save and test the credential. The credential test calls
   `GET /api/v1/workspace`, so it requires `workspace:read` even when the final
   workflow only performs another operation.
5. Add the **OrbitPage** node and select
   **Workspace & Draft → Get Workspace Overview**.
6. Attach the credential and select **Execute step**. This first request does
   not change data. The output contains the token-bound workspace, its current
   revision, and usage information.

You can also import [`examples/read-workspace.json`](examples/read-workspace.json)
or [`examples/watch-publication.json`](examples/watch-publication.json). Replace
the placeholder credential reference after import; never place a token in
workflow JSON. See [examples/README.md](examples/README.md) for details.

## Choose the right operation

| Goal | Resource → operation | Effect | Required scope |
| --- | --- | --- | --- |
| Verify a workspace credential | **Workspace & Draft → Get Workspace Overview** | Read only | `workspace:read` |
| Read all editable page data | **Workspace & Draft → Get Full Page Draft** | Read only | `workspace:read` |
| Change profile data without publishing | **Profile → Update Profile Draft** with **Publish Changes Immediately** disabled | Draft change | `profile:write` |
| Preview an AI edit | **AI Page Editing → Preview AI Page Changes** | Uses AI allowance; does not change the page | `ai:write` |
| Preview unused files | **Media Library → Preview or Delete Unused Media** with `{"dryRun": true}` | Preview only | `media:write` |
| Publish reviewed draft changes | **Publication → Publish Current Draft** | Changes the public page | `publication:write` |
| Upload or replace an n8n video | **Media Library → Upload or Replace Video From Binary Input** | Replaces the selected slot when it already contains a video | `media:write` |
| Watch publishing details | **OrbitPage Trigger → Publishing Details Changed** | Read-only polling | `publication:read` |

Choose the resource first, then the operation. The operation description states
what changes, whether it becomes public, and which scope is required. Use the
[operation matrix](docs/OPERATIONS.md) when building a least-privilege token.

## Nodes

### OrbitPage

The action node groups related operations under **Workspace & Draft**,
**Page Content (Blocks)**, **Profile**, **Theme**, **Subpages**,
**Page Settings**, **Publication**, **Media Library**,
**Custom Domain & DNS**, **Analytics**, **AI Page Editing**, **Shop**,
**Newsletter**, **Team & Invitations**, **Backups & Versions**, and
**Billing & Plans**. **Advanced API** provides relative custom requests.

Writes that use optimistic concurrency can fetch the current revision
automatically and send it as `If-Match`. Binary convenience operations handle
the reserve, signed upload, and finalize sequence without sending the OrbitPage
bearer token to the storage host.

### OrbitPage Trigger

The trigger polls a selected OrbitPage resource:

| Event | Endpoint | Required scope | Change observed |
| --- | --- | --- | --- |
| Page Draft Changed | `/workspace` | `workspace:read` | Editable page `revision` |
| Publishing Details Changed | `/publication` | `publication:read` | Current publication response |
| Custom Domain Status Changed | `/domains` | `domains:read` | Current domains response |
| Shop Changed | `/shop?refresh=0` | `shop:read` | Read-only Shop snapshot |

The first production poll establishes a baseline and emits nothing unless
**Run on First Poll** is enabled. A manual test always returns the current
state. This is state polling, not an event log: if a resource changes several
times between polls, the trigger emits the latest observed state rather than
replaying every intermediate change.

The Shop trigger explicitly requests `refresh=0`. Unlike the normal **Get Shop
Overview** action, polling does not initialize Shop data or refresh Stripe
connection state.

**Get Shop Overview** exposes the same behavior as **Shop Read Mode**:

| Mode | API query | Behavior |
| --- | --- | --- |
| **Automatic (Recommended)** | omitted | Returns Shop data and may initialize missing private state or refresh stale Stripe status |
| **Read-Only Snapshot** | `refresh=0` | Reads stored state without initialization or a Stripe request |
| **Force Stripe Status Refresh** | `refresh=1` | Checks Stripe before returning the overview |

## Request bodies and output

### Possible effect labels

The editor identifies every possible effect before the operation's inputs. An
operation can show more than one label when its outcome depends on a setting or
combines elevated access with another side effect:

| Effect | Meaning |
| --- | --- |
| **Read Only** | Reads OrbitPage state without changing it |
| **Draft or Private Change** | Changes draft, stored, or access-controlled data |
| **Public Change** | Publishes or immediately changes public content |
| **External Side Effect** | Sends email, starts billing, or calls another managed service |
| **Replaces or Deletes Data** | Removes or replaces data and needs explicit review |
| **Advanced Request** | Uses a lower-level or custom API path |

### Request Body (JSON)

For a write operation, **Request Body (JSON)** is the JSON value sent to OrbitPage.
Do not wrap it in `body` or `data` unless the operation schema explicitly
requires that property. For example, use the following body with **Media
Library → Preview or Delete Unused Media** to preview without deleting:

```json
{
  "dryRun": true
}
```

When the editor marks the body as optional, leave `{}` to use the operation's
defaults.

Use n8n expression mode to map the whole JSON value or individual values from
the current input item. Revision fields remain separate: **Revision Check** adds
`If-Match` automatically or accepts a revision from an earlier read. Compare
the body with the public
[OpenAPI contract](https://orbitpage.com/api/openapi.json) because strict
operations reject unknown fields.

### Output shapes

| Mode | Output for each input item |
| --- | --- |
| Default action | The OrbitPage API response object. A non-object response is returned under `data`. |
| **Include HTTP Response Details** | `{ "body": ..., "headers": ..., "statusCode": 200 }`, with `statusMessage` when available |
| Binary upload helper | The finalized API response plus `uploadedFile` metadata |
| OrbitPage Trigger | `event`, `eventName`, `initial`, signatures, `observedAt`, and the current response under `data` |
| **Continue On Fail** | `{ "error": "..." }` for the failing input item; downstream nodes must handle it |

Request bodies use the closed, named schemas in OpenAPI and reject unsupported
fields. Response objects remain forward-compatible: map only fields documented
for your operation and allow OrbitPage to add new response fields.

See [Revisions and publishing](docs/guides/revisions-and-publishing.md) before a
draft write and [Binary uploads](docs/guides/binary-uploads.md) before mapping
n8n binary data.

## Operation catalog

The catalog contains all 65 workspace operations in the public
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
- Review revision-controlled writes before publishing. When a `409 Conflict`
  returns `code: revision_conflict`, read the latest state and intentionally
  reapply the change. For every other `409`, resolve the business condition
  identified by `error.code` before retrying.
- Review restore inputs before execution: version and backup restores replace
  page data and publish the restored result immediately.
- The action node can be exposed to n8n AI agents as a tool and includes
  publishing, restore, deletion, email, and billing operations. Do not give an
  unattended agent a broad credential; require human review for destructive or
  externally visible actions.
- Prefer the reviewed **AI Page Editing > Preview AI Page Changes** then
  **AI Page Editing > Apply Previewed AI Changes** flow.
  A provider key is not an OrbitPage credential and must never be pasted into
  this node.
- Use guided operations when available. A custom API request can use every
  applicable workspace permission held by its selected credential and remains
  limited to the public workspace API contract.

Read the focused guides on
[credentials and scopes](docs/guides/credentials-and-scopes.md),
[revisions and publishing](docs/guides/revisions-and-publishing.md),
[binary uploads](docs/guides/binary-uploads.md), and
[AI safety](docs/guides/ai-safety.md).

## Documentation

- [Documentation index](docs/README.md)
- [Getting started](docs/guides/getting-started.md)
- [Complete operation matrix](docs/OPERATIONS.md)
- [Example workflows](examples/README.md)
- [Version history](CHANGELOG.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [OrbitPage API, token, and n8n integration guide](https://orbitpage.com/en-US/docs/api-tokens#integration)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

## Troubleshooting

| n8n message or API status | First action |
| --- | --- |
| `Class could not be found` | Restart n8n, remove only the stale `n8n-nodes-orbitpage` installation, and reinstall the current version. |
| `Maximum number of redirects exceeded` | Use exactly `https://orbitpage.com` as **OrbitPage Base URL**, without `/api/v1`, and check the reverse proxy. |
| `401 Unauthorized` | Replace the missing, malformed, expired, or revoked token. |
| `403 Forbidden` | Add the operation's required scope and confirm workspace access. |
| `409 Conflict` | If `error.code` is `revision_conflict`, read the current resource and intentionally reapply the change against its new revision. Otherwise resolve the documented business condition identified by `error.code`. |
| `428 Precondition Required` | Use automatic revision fetching or provide the current `ETag`/revision as `If-Match`. |
| `429 Too Many Requests` | Observe `Retry-After`, then retry with exponential backoff and jitter. |

The [troubleshooting guide](docs/guides/troubleshooting.md) includes diagnostic
requests, installation recovery, trigger behavior, upload failures, and manual
revision guidance.

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
