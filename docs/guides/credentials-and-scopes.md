# Credentials and scopes

OrbitPage API tokens are bearer secrets bound to account permissions and a
workspace. Store them only in n8n credentials.

## Credential fields

Create a personal token in OrbitPage under **Dashboard > Team > Personal API
tokens**. The public n8n credential contains only these fields:

| Field | Production value |
| --- | --- |
| OrbitPage API Token | The one-time `op_pat_...` secret copied from OrbitPage |
| OrbitPage Base URL | `https://orbitpage.com` |

## Connection-test scopes

The credential test is a read operation:

| Test endpoint | Scope required by the test |
| --- | --- |
| `GET /api/v1/workspace` | `workspace:read` |

This requirement applies to the n8n connection test even when the workflow's
business operation only needs a different scope. For example, a token created
for `theme:write` also receives `theme:read`, but it still cannot pass the
workspace connection test without `workspace:read`. Include the relevant test
scope when the workflow owner must use **Test connection**, and keep every
other granted scope minimal.

## Resource scopes

The generated [operation matrix](../OPERATIONS.md) remains the source of truth
for individual operations.

| Resource | Available scopes |
| --- | --- |
| Workspace & Draft | `workspace:read` |
| Page Content (Blocks) | `links:read`, `links:write` |
| Profile | `profile:read`, `profile:write` |
| Theme | `theme:read`, `theme:write` |
| Subpages | `pages:read`, `pages:write` |
| Page Settings | `settings:read`, `settings:write` |
| Publication | `publication:read`, `publication:write` |
| Backups & Versions | `backup:read`, `backup:write` |
| Media Library | `media:read`, `media:write` |
| Custom Domain & DNS | `domains:read`, `domains:write` |
| Analytics | `analytics:read` |
| AI Page Editing | `ai:read`, `ai:write` |
| Shop | `shop:read`, `shop:write` |
| Newsletter | `newsletter:read`, `newsletter:write` |
| Team & Invitations | `team:read`, `team:write` |
| Billing & Plans | `billing:read`, `billing:write` |

Selecting a write scope automatically adds its matching read scope. The saved
token summary shows both. Select only the write categories the workflow needs;
do not add unrelated scopes.

The **Advanced API > Send Custom API Request** operation does not bypass
authorization.
The selected endpoint still enforces its own scope and all permissions held by
the credential remain available to that request. It accepts only paths within
the public workspace API contract.

## Trigger scopes

| Trigger event | Required scope |
| --- | --- |
| Page Draft Changed | `workspace:read` |
| Publishing Details Changed | `publication:read` |
| Custom Domain Status Changed | `domains:read` |
| Shop Changed | `shop:read` |

Polling reads the endpoint at the configured schedule. It does not request
extra write scopes. **Shop Changed** uses `/shop?refresh=0`, so polling reads a
snapshot without initializing Shop data or refreshing Stripe connection state.

## OrbitPage Base URL

Use `https://orbitpage.com` as **OrbitPage Base URL** in production. The node
appends `/api/v1` itself, so do not include that suffix in the credential.

Change **OrbitPage Base URL** only when OrbitPage support supplies a dedicated
staging environment. Verify the host before selecting **Test connection** because the
bearer token is sent to that URL. Authenticated action and trigger requests
require HTTPS except for `localhost`, `127.0.0.1`, or `::1`, reject cross-origin
credential redirects, and remain restricted to the configured hostname.

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

- `401 Unauthorized`: token missing, malformed, expired, or revoked.
- `403 Forbidden`: missing scope, lost workspace access, protected resource, or
  plan/account restriction.
- HTML or repeated redirects instead of JSON: incorrect **OrbitPage Base URL**
  or reverse proxy configuration.

Continue with [Revisions and publishing](revisions-and-publishing.md) before
building write workflows.
