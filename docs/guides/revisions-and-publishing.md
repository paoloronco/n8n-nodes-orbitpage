# Revisions and publishing

OrbitPage uses optimistic concurrency to prevent one workflow from silently
overwriting newer workspace changes. Revision-controlled writes must send a
current `If-Match` value.

## Automatic revision mode

**Use Latest Automatically (Recommended)** is the default. Immediately before
each revision-controlled write, the node:

1. reads the operation's related resource;
2. takes the response `ETag`, `X-OrbitPage-Revision`, or body `revision`;
3. sends that value in the write request's `If-Match` header.

The generated [operation matrix](../OPERATIONS.md) identifies the preflight
endpoint in its **Revision source** column.

Automatic mode protects an individual request from using an old revision. It
does not make a multi-step workflow transactional: another writer can still
change the workspace between separate n8n nodes.

Publication, Shop publication, newsletter delivery, and media deletion use
**Approved State ETag** instead. The node never fetches a new tag for these
actions at execution time, because that would replace the state a reviewer saw.

## Manual revision mode

Choose **Enter Revision Manually** when an earlier step deliberately read the
resource and the workflow should fail if anything changed afterward.

Enable **Include HTTP Response Details** on the read when the next node
needs the exact `ETag`. The output then includes:

```json
{
  "body": {},
  "headers": {},
  "statusCode": 200
}
```

Pass the current `ETag` or numeric revision to **Current Revision or ETag**. Do
not cache it for later workflow executions.

## Reviewed effects

Before one of these effects, review the named response and pass its tag unchanged
to **Approved State ETag** on the effect node:

| Effect | Review source |
| --- | --- |
| Publish Current Draft | `ETag` from Get Draft and Publication Status with response details enabled |
| Publish Shop | `reviewTag` or `ETag` from Get Shop Overview in Read-Only Snapshot mode |
| Queue newsletter campaign | That campaign's `reviewTag` from Get Newsletter Overview |
| Delete unused media | `reviewTag` from Preview or Delete Unused Media with `dryRun` true; review all candidates first |

Media cleanup previews need no tag. Deletion is refused when the previewed set
changes or contains more than 50 objects. Re-read and re-approve after a
conflict. Existing workflows that invoke these effects without an approved tag
must be updated; the API returns `428` for a missing tag.

> Package 0.1.2 limitation: the operation labelled **Backups & Versions >
> Restore Saved Version to Draft** in that release has an ambiguous manual
> revision input because the historical version and `If-Match` fields share the
> same internal parameter name. The current source separates these fields. When
> using 0.1.2, select **Use Latest Automatically (Recommended)** for that
> operation.

## Handling conflicts

| Status | Meaning | Safe response |
| --- | --- | --- |
| `409 Conflict` with `error.code: revision_conflict` | The workspace advanced after the supplied revision was read. | Read the resource again, compare the new state, and intentionally reapply the change. |
| `409 Conflict` with `error.code: reviewed_state_conflict` | The approved Shop, campaign, or media set changed. | Review the new state and use its new tag. |
| Other `409 Conflict` | A business rule prevents the operation in its current state. | Resolve the documented condition identified by `error.code`; do not treat it as a stale-revision retry. |
| `428 Precondition Required` | A protected write did not include `If-Match`. | For reviewed effects, pass the tag that was approved; for other revisioned writes, use automatic or manual mode. |

Do not blindly retry the same stale body. A retry is safe only after the
workflow has considered changes made by another user or automation.

## Draft and publication behavior

Profile, theme, pages, menu, and privacy writes update the draft by default.
For operations that display **Publish Changes Immediately**, enabling it sends
the eligible mutation with `publish=1`.

A safer multi-change workflow is:

1. Read the current state.
2. Apply related draft changes with automatic revision fetching.
3. Validate the resulting draft.
4. Review the final draft and pass the publication `ETag` to **Publication > Publish Current Draft**.

**Page Content (Blocks) > Update One Content Block** and **Replace All Content
Blocks** publish immediately by API design. Treat them as public changes even
though they also use revision control.

**Backups & Versions > Restore and Publish Historical Version** and **Restore
and Publish Workspace Backup** are exceptions to the draft-first flow. They
replace page data and publish the restored result immediately. Export or
confirm a usable backup, review the exact version or backup and sections, then
place human approval before the restore node. There is no post-restore draft
review step before the public change.

## Recommended workflow controls

- Serialize writes that target the same workspace when possible.
- Keep `Continue On Fail` disabled for critical publish or restore operations
  unless the workflow explicitly handles the returned error item.
- Record operation IDs and status codes, but not tokens, signed URLs, or
  sensitive response bodies.
- Place a human approval step before publication, restore, bulk replacement, or
  **AI Page Editing > Apply Previewed AI Changes**.
- Treat `publication:write` and `backup:write` as privileged scopes.

See [AI safety](ai-safety.md) for additional controls
when an n8n AI agent can select the operation.
