# Credentials and scopes

OrbitPage API tokens are bearer secrets bound to the account permissions and,
for personal tokens, to a workspace. Store them only in n8n credentials.

## Credential types

| Token type in n8n | Created in | Intended use |
| --- | --- | --- |
| Personal Workspace Token | OrbitPage **Dashboard > Account > Personal API tokens** | Normal workspace automation |
| Protected Operator Token | Protected OrbitPage operator console | Platform CRM, moderation, promotion, plan, and tenant operations |

Never attach an operator credential to a tenant workflow. Use a separate
credential, workflow, owner, and expiration policy for elevated automation.

## Connection-test scopes

The current credential tests are read operations:

| Credential type | Test endpoint | Scope required by the test |
| --- | --- | --- |
| Personal Workspace Token | `GET /api/v1/workspace` | `workspace:read` |
| Protected Operator Token | `GET /api/v1/operator/overview` | `operator:read` |

This requirement applies to the n8n connection test even when the workflow's
business operation only needs a different scope. For example, a valid token
with only `theme:write` cannot pass the workspace connection test. Include the
relevant test scope if operators must use n8n's **Test connection** action, and
then keep every other granted scope minimal.

## Resource scopes

The generated [operation matrix](../OPERATIONS.md) remains the source of truth
for individual operations.

| Resource | Available scopes |
| --- | --- |
| Workspace | `workspace:read` |
| Blocks and links | `links:read`, `links:write` |
| Profile | `profile:read`, `profile:write` |
| Theme | `theme:read`, `theme:write` |
| Pages | `pages:read`, `pages:write` |
| Settings | `settings:read`, `settings:write` |
| Publication | `publication:read`, `publication:write` |
| Backups and versions | `backup:read`, `backup:write` |
| Media | `media:read`, `media:write` |
| Domains | `domains:read`, `domains:write` |
| Analytics | `analytics:read` |
| AI | `ai:read`, `ai:write` |
| Shop | `shop:read`, `shop:write` |
| Newsletter | `newsletter:read`, `newsletter:write` |
| Team | `team:read`, `team:write` |
| Billing | `billing:read`, `billing:write` |
| Operator | `operator:read`, `operator:write` |

Grant both read and write only when the workflow actually performs both. Do not
assume a write scope automatically grants the corresponding read scope.

The **Advanced > Custom API Request** operation does not bypass authorization.
The selected endpoint still enforces its own scope and all permissions held by
the credential remain available to that request.

## Trigger scopes

| Trigger event | Required scope |
| --- | --- |
| Workspace Revision Changed | `workspace:read` |
| Publication State Changed | `publication:read` |
| Custom Domain Changed | `domains:read` |
| Shop State Changed | `shop:read` |

Polling reads the endpoint at the configured schedule. It does not request
extra write scopes.

## Base URL

Use `https://orbitpage.com` for production. The node appends `/api/v1` itself,
so do not include that suffix in the credential.

Change the Base URL only when OrbitPage support supplies a dedicated staging
environment. The bearer token is sent to the configured host. The node requires
HTTPS except for `localhost`, `127.0.0.1`, or `::1`, rejects cross-origin
credential redirects, and restricts authenticated requests to the configured
hostname.

## Token lifecycle

Use one token per workflow and environment so that a single workflow can be
revoked without interrupting unrelated automation.

When permissions or workspace ownership change:

1. Create a replacement token with the intended scopes.
2. Update the n8n credential without exposing the secret in workflow JSON.
3. Test the workflow against non-destructive operations.
4. Revoke the previous token.

Revoke immediately after suspected disclosure. A token displayed only once
cannot be recovered; replace it instead.

## Common authentication failures

- `401 Unauthorized`: token missing, malformed, expired, revoked, or wrong token
  type selected.
- `403 Forbidden`: missing scope, lost workspace access, protected resource, or
  plan/account restriction.
- HTML or repeated redirects instead of JSON: incorrect Base URL or reverse
  proxy configuration.

Continue with [Revisions and publishing](revisions-and-publishing.md) before
building write workflows.
