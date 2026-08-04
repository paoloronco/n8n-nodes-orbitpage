# Getting started

This guide installs `n8n-nodes-orbitpage`, creates a least-privilege credential,
and executes a non-destructive workspace read.

## Prerequisites

- A hosted OrbitPage account with access to a workspace.
- A current n8n 2.x installation that permits community nodes.
- Node.js 22.22 or newer for a self-hosted runtime. CI validates Node.js 22.22
  and 24.
- Permission to create personal API tokens in OrbitPage.

Protected operator operations require separate access to the OrbitPage operator
console. They are not part of the normal getting-started flow.

## Install through the n8n UI

1. Open **Settings > Community Nodes** in n8n.
2. Select **Install**.
3. Enter `n8n-nodes-orbitpage`.
4. Confirm the installation.
5. Restart self-hosted n8n if the node is not immediately available.

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

1. In OrbitPage, open **Dashboard > Account > Personal API tokens**.
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
| Token Type | **Personal Workspace Token** |
| Personal API Token | The copied `op_pat_...` secret |
| Base URL | `https://orbitpage.com` |

Save and test the credential. The test sends a non-destructive
`GET /api/v1/workspace` request, which specifically requires `workspace:read`.
A token can therefore be valid for another scoped API operation while still
failing this connection test if it lacks `workspace:read`.

The equivalent operator credential test calls
`GET /api/v1/operator/overview` and requires `operator:read`.

## Run the first workflow

1. Create a workflow and add a manual trigger.
2. Add the **OrbitPage** node.
3. Select **Workspace > Get Workspace**.
4. Select the saved **OrbitPage API** credential.
5. Select **Execute step**.

The result identifies the token-bound workspace and includes its current
revision. The token cannot select a different tenant through the workspace
endpoint.

## Import an example

The repository includes two starting workflows:

- [`read-workspace.json`](../../examples/read-workspace.json) performs the safe
  read described above;
- [`watch-publication.json`](../../examples/watch-publication.json) polls the
  publication state.

After import, open each OrbitPage node and replace the placeholder credential
reference with your saved credential. See the
[examples guide](../../examples/README.md) for scopes and trigger behavior.

## Before enabling a production workflow

- Reduce the token to the scopes listed in the
  [operation matrix](../OPERATIONS.md).
- Decide whether each write should remain a draft or publish immediately.
- Use automatic revision fetching unless the workflow deliberately coordinates
  its own read and write.
- Configure retries for `429` responses using `Retry-After`.
- Keep operator and tenant credentials in separate workflows.
- Require human review before destructive, externally visible, or AI-selected
  actions.

Continue with [Credentials and scopes](credentials-and-scopes.md) before adding
write operations.
