# Revisions and publishing

OrbitPage uses optimistic concurrency to prevent one workflow from silently
overwriting newer workspace changes. Revision-controlled writes must send a
current `If-Match` value.

## Automatic revision mode

**Fetch Latest Automatically** is the default. Immediately before each
revision-controlled write, the node:

1. reads the operation's related resource;
2. takes the response `ETag`, `X-OrbitPage-Revision`, or body `revision`;
3. sends that value in the write request's `If-Match` header.

The generated [operation matrix](../OPERATIONS.md) identifies the preflight
endpoint in its **Revision source** column.

Automatic mode protects an individual request from using an old revision. It
does not make a multi-step workflow transactional: another writer can still
change the workspace between separate n8n nodes.

## Manual revision mode

Choose **Enter Manually** when an earlier step deliberately read the resource
and the workflow should fail if anything changed afterward.

Enable **Include Response Headers and Status** on the read when the next node
needs the exact `ETag`. The output then includes:

```json
{
  "body": {},
  "headers": {},
  "statusCode": 200
}
```

Pass the current `ETag` or numeric revision to the manual revision input. Do not
cache it for later workflow executions.

> Package 0.1.2 limitation: **Backup > Restore Version** has an ambiguous
> manual revision input because the historical version and `If-Match` fields
> share the same internal parameter name. Use **Fetch Latest Automatically** for
> Restore Version until a later package version explicitly fixes this field.

## Handling conflicts

| Status | Meaning | Safe response |
| --- | --- | --- |
| `409 Conflict` | The workspace advanced after the supplied revision was read. | Read the resource again, compare the new state, and intentionally reapply the change. |
| `428 Precondition Required` | A protected write did not include `If-Match`. | Use automatic mode or pass the current revision manually. |

Do not blindly retry the same stale body. A retry is safe only after the
workflow has considered changes made by another user or automation.

## Draft and publication behavior

Profile, theme, pages, menu, and privacy writes update the draft by default.
For operations that display **Publish Immediately**, enabling it sends the
eligible mutation with `publish=1`.

A safer multi-change workflow is:

1. Read the current state.
2. Apply related draft changes with automatic revision fetching.
3. Validate the resulting draft.
4. Publish once with **Publication > Publish Page**.

Block `PATCH` and `PUT` operations publish immediately by API design. Treat
them as externally visible actions even though they also use revision control.

Restore operations replace draft state and require special care. Export or
confirm a usable backup before restoring, use automatic revision mode, inspect
the restored draft, and publish only after review.

## Recommended workflow controls

- Serialize writes that target the same workspace when possible.
- Keep `Continue On Fail` disabled for critical publish or restore operations
  unless the workflow explicitly handles the returned error item.
- Record operation IDs and status codes, but not tokens, signed URLs, or
  sensitive response bodies.
- Place a human approval step before publication, restore, bulk replacement, or
  an AI-generated commit.
- Treat `publication:write` and `backup:write` as privileged scopes.

See [AI and operator safety](ai-and-operator-safety.md) for additional controls
when an n8n AI agent can select the operation.
