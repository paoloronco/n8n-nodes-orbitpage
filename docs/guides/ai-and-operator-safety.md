# AI and operator safety

The OrbitPage action node supports OrbitPage AI operations and can also be
exposed to n8n AI agents as a tool. Its catalog includes destructive and
externally visible actions, so the selected credential is the primary security
boundary.

## OrbitPage AI plan and commit

Use the reviewed two-step flow:

1. **AI > Plan Changes** generates a validated preview without changing the
   page.
2. A person or deterministic workflow step reviews the proposed operations.
3. **AI > Commit Changes** receives the exact returned `previewToken`.
4. The commit publishes only when the reviewed body explicitly authorizes it.

The AI allowance read requires `ai:read`; plan and commit require `ai:write`.
Do not treat a successful plan as approval to commit.

An OpenAI or other model-provider key is not an OrbitPage API token. Store each
secret in its own credential type and never paste a provider key into the
OrbitPage node.

## Using OrbitPage as an n8n AI tool

The current action node advertises itself as usable by n8n AI agents. The same
node contains ordinary reads as well as publish, restore, delete, email,
moderation, billing, and protected operator operations.

Before connecting it to an AI agent:

- create a dedicated token with only the smallest required read scopes;
- avoid write scopes unless a human approval gate follows the proposed action;
- never attach an operator credential to an unattended agent;
- restrict the workflow so the resource and operation are deterministic rather
  than model-selected when possible;
- validate every model-produced JSON body against the intended operation;
- limit retries and execution volume;
- review execution data retention because responses may contain customer or
  tenant information.

Do not rely on prompt instructions as the only control. A token with a scope
authorizes the corresponding API request regardless of why the model selected
it.

## High-impact operations

Require explicit human review before operations that can:

- publish workspace or Shop content;
- restore a version or backup;
- remove blocks, products, subscribers, campaigns, team members, or files;
- send newsletter or account email;
- change billing or plan state;
- suspend, reactivate, onboard, link, or permanently delete a tenant;
- create or revoke protected demo access.

Use read-only preview operations where available and show the exact target,
body, and expected effect to the reviewer.

## Operator credentials

Operator tokens are created only in the protected operator console and should
have a short expiration. Store them in a dedicated n8n project with restricted
membership and separate workflows from workspace automation.

The n8n operator credential test calls `GET /api/v1/operator/overview`, so it
requires `operator:read`. Grant `operator:write` only to workflows that perform
an identified operator mutation.

For permanent tenant deletion, preserve the API's exact-confirmation body and
never synthesize it from an untrusted model response. Keep the resulting audit
record outside ordinary workflow logs when it contains sensitive data.

## Custom API requests

**Advanced > Custom API Request** is intended for forward-compatible relative
API access. It:

- accepts paths below `/api/v1`;
- rejects absolute URLs, dot segments, embedded query strings, and an extra
  `/api/v1` prefix;
- keeps authentication bound to the configured Base URL.

It still exposes every endpoint authorized by the selected credential. Prefer a
guided operation, especially in AI-driven workflows, because guided operations
make the required scope and revision behavior explicit.

## Incident response

If a token, signed upload URL, or sensitive execution payload may have been
exposed:

1. stop the affected workflow;
2. revoke or rotate the token;
3. review recent n8n executions and OrbitPage audit records;
4. remove sensitive retained execution data according to your n8n policy;
5. report a suspected product vulnerability through the private process in
   [SECURITY.md](../../SECURITY.md).
