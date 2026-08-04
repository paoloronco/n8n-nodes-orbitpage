# AI safety

The OrbitPage action node supports OrbitPage AI operations and can also be
exposed to n8n AI agents as a tool. Its catalog includes destructive and
externally visible actions, so the selected credential is the primary security
boundary.

## OrbitPage AI preview and apply

Use the reviewed two-step flow:

1. **AI Page Editing > Preview AI Page Changes** generates a validated preview
   without changing the page.
2. A person or deterministic workflow step reviews the proposed operations.
3. **AI Page Editing > Apply Previewed AI Changes** receives the exact returned
   `previewToken`.
4. Applying the preview publishes only when the reviewed body explicitly
   authorizes it.

The AI allowance read requires `ai:read`; preview and apply require `ai:write`.
Do not treat a successful preview as approval to apply it.

An OpenAI or other model-provider key is not an OrbitPage API token. Store each
secret in its own credential and never paste a provider key into the OrbitPage
node.

## Using OrbitPage as an n8n AI tool

The action node can be used by n8n AI agents. The same node contains ordinary
reads as well as publish, restore, delete, email, and billing operations.

Before connecting it to an AI agent:

- create a dedicated token with only the smallest required read scopes;
- avoid write scopes unless a human approval gate follows the proposed action;
- restrict the workflow so the resource and operation are deterministic rather
  than model-selected when possible;
- validate every model-produced JSON body against the intended operation;
- limit retries and execution volume;
- review execution-data retention because responses may contain workspace or
  subscriber information.

Do not rely on prompt instructions as the only control. A token with a scope
authorizes the corresponding API request regardless of why the model selected
it.

## High-impact operations

Require explicit human review before operations that can:

- publish workspace or Shop content;
- restore a version or backup;
- remove blocks, products, subscribers, campaigns, team members, or files;
- send newsletter email;
- change billing or plan state.

Use read-only previews where available. Show the reviewer the exact target,
request body, and expected effect before execution.

## Custom API requests

**Advanced API > Send Custom API Request** is intended for forward-compatible
relative API access. It:

- accepts paths below `/api/v1`;
- rejects absolute URLs, dot segments, embedded query strings, and an extra
  `/api/v1` prefix;
- rejects paths outside the public workspace API contract after normalizing
  encoded separators and path segments;
- keeps authentication bound to the configured Base URL.

It still exposes every endpoint authorized by the selected credential. Prefer a
guided operation, especially in AI-driven workflows, because guided operations
make the required scope and revision behavior explicit.

## Incident response

If a token, signed upload URL, or sensitive execution payload may have been
exposed:

1. Stop the affected workflow.
2. Revoke or rotate the token.
3. Review recent n8n executions and OrbitPage audit records.
4. Remove sensitive retained execution data according to your n8n policy.
5. Report a suspected product vulnerability through the private process in
   [SECURITY.md](../../SECURITY.md).
