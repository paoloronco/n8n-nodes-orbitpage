# Troubleshooting

Start with the smallest non-destructive request that exercises the same
credential boundary: **Workspace & Draft > Get Workspace Overview**.

## Class could not be found

An interrupted or partial community-node installation can leave stale package
files behind.

1. Stop the n8n process.
2. Locate the community-nodes directory used by that specific n8n instance.
3. Remove only its stale `n8n-nodes-orbitpage` package.
4. Start n8n.
5. Install the current package again.

Do not remove the whole n8n data directory, unrelated community packages, or
workflow storage. Some n8n releases retain the incomplete package until the
process restarts.

## Credential test fails

The credential test is not scope-neutral: it calls `GET /api/v1/workspace` and
requires `workspace:read`.

A token that is valid for a different operation can fail **Test connection** if
it lacks the relevant read scope. See
[Credentials and scopes](credentials-and-scopes.md#connection-test-scopes).

## Maximum number of redirects exceeded

Use exactly `https://orbitpage.com` as the production Base URL. Do not append
`/api/v1`, a workspace slug, or an endpoint path.

If the value is correct, inspect the self-hosted n8n reverse proxy, outbound
proxy, and DNS configuration. The node does not forward credentials across a
cross-origin redirect.

## HTTP status reference

| Status | Likely cause | Resolution |
| --- | --- | --- |
| `400 Bad Request` | Invalid JSON or unsupported fields. | Compare the body with the public API contract and use a guided operation. |
| `401 Unauthorized` | Missing, malformed, expired, or revoked token. | Create a replacement token and update the OrbitPage credential. |
| `403 Forbidden` | Missing scope, lost workspace access, protected resource, or plan restriction. | Check the operation matrix, account access, and workspace plan. |
| `404 Not Found` | Incorrect identifier or custom relative path. | Read the resource again and pass the returned stable ID. |
| `409 Conflict` | Either the workspace revision is stale or a business rule prevents the operation. | For `error.code: revision_conflict`, read the current state and intentionally reapply the change. For every other code, resolve the documented business condition before retrying. |
| `413 Payload Too Large` | Body or upload exceeds the route limit. | Reduce the payload or use the intended direct-upload operation. |
| `415 Unsupported Media Type` | Unsupported request or binary content type. | Use an accepted media type and uncompressed JSON requests. |
| `428 Precondition Required` | Missing `If-Match` on a revision-controlled write. | Enable automatic revision fetching or pass the current value manually. |
| `429 Too Many Requests` | Per-token minute or daily limit reached. | Wait for `Retry-After`, then retry with exponential backoff and jitter. |

When **Continue On Fail** is enabled, the node returns an error item linked to
the failing input instead of stopping the workflow. Downstream nodes must check
that output explicitly.

## Revision conflicts and historical restore

Use **Use Latest Automatically (Recommended)** for normal revision-controlled
writes. **Published Version Number** selects the history entry used by
**Backups & Versions > Restore and Publish Historical Version**. **Current
Revision or ETag** is a separate concurrency value and should come from a
preceding read in the same workflow path when manual checking is necessary.
The restore publishes immediately, so approve the target before the node runs.

See [Revisions and publishing](revisions-and-publishing.md) for the full model.

## Trigger does not emit

Check all of the following:

- the workflow is active;
- a Poll Time is configured;
- the token has the trigger's read scope;
- the monitored state actually changed after the first production poll;
- **Run on First Poll** is enabled if the baseline itself should run the
  workflow.

A manual test always returns the current state. In production, the first poll
normally records a baseline without emitting. The trigger compares snapshots;
multiple changes between polls are aggregated into the latest observed state
and are not replayed individually.

## Binary upload failures

1. Confirm the selected input item contains the configured binary property.
2. For media uploads, use `video/mp4` or `video/webm`.
3. Confirm the token has `media:write` or `shop:write`.
4. Check plan, quota, product, and file-size constraints in the API response.
5. Retry the complete operation; do not reuse a signed URL or upload token.

The media flow attempts to abort a reservation after a failed upload or
finalization. The current Shop convenience flow does not send an automatic
abort request; failed reservations should be allowed to expire or inspected
through supported Shop management.

## Diagnose outside n8n

From a trusted shell, test the same personal-token boundary without printing
the token:

```bash
read -rsp 'OrbitPage API token: ' ORBITPAGE_TOKEN
printf '\n'
curl --silent --show-error --include \
  --header "Authorization: Bearer $ORBITPAGE_TOKEN" \
  https://orbitpage.com/api/v1/workspace
unset ORBITPAGE_TOKEN
```

A JSON `401`, `403`, or `429` response is an actionable API result. An HTML
response or redirect loop normally indicates a host or proxy problem.

## Requesting support

Share:

- package version;
- n8n and Node.js versions;
- operation name;
- HTTP status and JSON error `code`;
- whether the failure is reproducible with a non-destructive request.

Never share the token, `Authorization` header, signed upload URL, full sensitive
response body, or workspace/subscriber data in a public issue. Report suspected
vulnerabilities through [SECURITY.md](../../SECURITY.md).
