# Getting started

This guide installs `n8n-nodes-orbitpage`, creates a least-privilege credential,
and executes a non-destructive workspace read.

## Prerequisites

- A hosted OrbitPage account with access to a workspace.
- An n8n 2.x installation that permits community nodes.
- Node.js 22.22 or newer for a self-hosted runtime. CI validates Node.js 22.22
  and 24.
- Permission to create personal API tokens in OrbitPage.

## Install through the self-hosted n8n UI

1. Sign in to self-hosted n8n as the instance owner.
2. Open **Settings > Community Nodes**.
3. Select **Install**.
4. Enter `n8n-nodes-orbitpage`.
5. Confirm the installation.
6. Restart n8n if the node is not immediately available.

Availability on n8n Cloud depends on the n8n community-node review process.

## Install on a self-hosted command line

From the community-nodes directory used by your n8n installation, run:

```bash
npm install n8n-nodes-orbitpage
```

Restart n8n after installation. If the node cannot be found, do not delete the
entire n8n data directory. Follow the targeted recovery steps in
[Troubleshooting](troubleshooting.md#class-could-not-be-found).

## Create the first token

1. In OrbitPage, open **Dashboard > Team > Personal API tokens**.
2. Create a token for this workflow and environment.
3. Grant `workspace:read` for the first connection test and safe read.
4. Use a finite expiration appropriate for the workflow.
5. Copy the `op_pat_...` value immediately. OrbitPage shows it only once.

Do not add unrelated scopes pre-emptively. Create a replacement token later if
the workflow gains new responsibilities.

## Create the n8n credential

In n8n, create an **OrbitPage API** credential with:

| Field | Value |
| --- | --- |
| OrbitPage API Token | The copied `op_pat_...` secret |
| OrbitPage Base URL | `https://orbitpage.com` |

Save and test the credential. The test sends a non-destructive
`GET /api/v1/workspace` request, which specifically requires `workspace:read`.
A token can therefore be valid for another scoped API operation while still
failing this connection test if it lacks `workspace:read`.

## Run the first workflow

1. Create a workflow and add a manual trigger.
2. Add the **OrbitPage** node.
3. Select **Workspace & Draft > Get Workspace Overview**.
4. Select the saved **OrbitPage API** credential.
5. Select **Execute step**.

The result identifies the token-bound workspace and includes its current
revision and usage. The token cannot select a different workspace through this
endpoint.

## Build the next operation

Choose **Resource** first and **Operation** second. Operation names identify the
target and effect; their descriptions state the required scope and whether the
operation reads, changes a draft, publishes, sends, or deletes.

| Goal | Resource > operation | Effect |
| --- | --- | --- |
| Read all editable page data | **Workspace & Draft > Get Full Page Draft** | Read only |
| Change profile data | **Profile > Update Profile Draft** | Draft change unless **Publish Changes Immediately** is enabled |
| Preview an AI edit | **AI Page Editing > Preview AI Page Changes** | Uses AI allowance; does not change the page |
| Publish reviewed changes | **Publication > Publish Current Draft** | Updates the public page |
| Upload or replace a video | **Media Library > Upload or Replace Video From Binary Input** | Replaces the selected slot when it already contains a video |

For operations that display **Request Body (JSON)**, enter the JSON value
itself. Do not add a `body` or `data` wrapper unless the operation schema names
that property. For example, this body makes **Media Library > Preview or Delete
Unused Media** return a preview without deleting files:

```json
{
  "dryRun": true
}
```

When the body is optional, leave `{}` to use the operation's defaults.

Use n8n expression mode to map values from the current input item. Do not put a
revision in this body: configure **Revision Check** separately. Required
fields and accepted values are defined by the public
[OpenAPI contract](https://orbitpage.com/api/openapi.json). The
[operation matrix](../OPERATIONS.md) lists each operation's required scope and
whether its body is required or optional.

By default, each input item produces the OrbitPage API response object. Enable
**Include HTTP Response Details** when a later node needs the HTTP status,
headers, or exact `ETag`; the output then contains `body`, `headers`, and
`statusCode`. Binary helpers also add `uploadedFile`. With **Continue On Fail**,
an unsuccessful input produces an `error` item that downstream nodes must
handle explicitly.

## Import an example

The repository includes two starting workflows:

- [`read-workspace.json`](../../examples/read-workspace.json) performs the safe
  read described above;
- [`watch-publication.json`](../../examples/watch-publication.json) polls the
  publication state.

After import, open each OrbitPage node and replace the placeholder credential
reference with your saved credential. See the
[examples guide](../../examples/README.md) for scopes and trigger behavior.

## Upgrade from 0.1.x to 0.2.0

Version 0.2.0 limits the public package to workspace-facing operations. Before
upgrading, inspect 0.1.x workflows for resources that are no longer present and
remove or replace those steps.

The persisted resource and operation IDs for the remaining workspace
operations are unchanged. Existing workspace workflows therefore do not need
their OrbitPage resource or operation selections remapped for this upgrade.

## Before enabling a production workflow

- Reduce the token to the scopes listed in the
  [operation matrix](../OPERATIONS.md).
- Decide whether each write should remain a draft or publish immediately.
- Use automatic revision fetching unless the workflow deliberately coordinates
  its own read and write.
- Configure retries for `429` responses using `Retry-After`.
- Require human review before destructive, externally visible, or AI-selected
  actions.

Continue with [Credentials and scopes](credentials-and-scopes.md) before adding
write operations.
