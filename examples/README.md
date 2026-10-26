# Example workflows

These examples are intentionally small so you can validate installation and
credentials before building a production workflow.

## Import an example

1. Download or clone this repository.
2. In n8n, choose **Import from File**.
3. Select one of the JSON files in this directory.
4. Open every OrbitPage node in the imported workflow.
5. Replace `REPLACE_WITH_YOUR_CREDENTIAL_ID` by selecting your saved
   **OrbitPage API** credential.
6. Review scopes and behavior before activating the workflow.

The placeholder is an n8n credential reference, not a secret. Never paste a
token directly into workflow JSON, and inspect exported workflows before
sharing them.

## Read workspace

[`read-workspace.json`](read-workspace.json) contains a manual trigger followed
by **Workspace & Draft > Get Workspace Overview**.

- Required scope: `workspace:read`
- Data changes: none
- Recommended use: first credential and package validation

Select **Execute Workflow** and inspect the returned workspace, access, plan,
usage, and revision data.

## Watch publication

[`watch-publication.json`](watch-publication.json) contains an OrbitPage polling
trigger configured for **Publishing Details Changed** every minute.

- Required scope: `publication:read`
- Data changes: none
- **Run on First Poll**: disabled

A manual test returns the current publication state. After activation, the
first production poll records a baseline without emitting. Later polls emit
when the publication response differs from the previous snapshot.

This trigger is not an event log. If publication changes several times between
polls, the workflow receives the latest observed state rather than every
intermediate transition.

## Release Guardian

[`release-guardian.json`](release-guardian.json) checks each newly published
page revision, emails an optional success report, and offers approval to restore
the last revision previously verified by the workflow when the live check
fails. It also retains an approval branch for private drafts deliberately
created through an eligible API or ChatGPT write with publication disabled.

- Minimum OrbitPage node version: `n8n-nodes-orbitpage@0.3.2`
- Required scopes: `workspace:read`, `publication:read`, `publication:write`,
  `backup:read`, and `backup:write`
- Additional credential: Gmail OAuth2 for verification, approval, and failure
  messages
- Default behavior: `SEND_SUCCESS_EMAIL` is `YES`; `ENABLE_PUBLISH` is `NO`
- Data changes: dashboard releases are only observed and checked. A private
  draft is published only after approval and only when `ENABLE_PUBLISH=YES`;
  rollback always requires separate approval

After import, select the same OrbitPage credential on every OrbitPage node and
a Gmail credential on every Gmail node. Replace the email address in
**Configuration**, keep `ENABLE_PUBLISH=NO`, and run the manual trigger once.
It checks the current public release and sends a success email when
`SEND_SUCCESS_EMAIL=YES`. Activate the workflow, save a dashboard change, and
expect the next polling execution to verify the new public revision. Set
`ENABLE_PUBLISH=YES` only when the workflow must approve private API drafts.

The comparison stores only a bounded projection of public-facing fields in n8n
workflow static data after a successful production execution. The first run is
therefore a baseline, and manual test executions may not persist it. Configure
n8n execution-data retention according to the sensitivity of unpublished page
content returned by the read nodes.

The trigger polls once per minute. It sees only revisions saved to OrbitPage,
never unsaved browser form state, and it receives the latest state rather than
every transition between polls. Dashboard saves schedule publication
automatically, so the Guardian validates them after publication rather than
pretending it can intercept them. On its first successful check it establishes
a baseline; rollback becomes available only after an earlier revision has been
verified and remains in OrbitPage version history.

## AI Page Copilot

[`ai-page-copilot.json`](ai-page-copilot.json) provides a private n8n chat agent
that can inspect an OrbitPage, explain its current state, prepare a validated AI
edit, and publish only after reviewed approval.

- Minimum OrbitPage node version: `n8n-nodes-orbitpage@0.3.2`
- n8n requirement: n8n 2.x with AI Agent, Chat Trigger, Simple Memory, Chat
  human review, and community-node tool usage available
- Required OrbitPage scopes: `workspace:read`, `publication:read`,
  `publication:write`, `ai:read`, and `ai:write`
- Additional credential: one supported chat-model credential; the checked-in
  example uses the OpenAI Chat Model with `gpt-5-mini` as a replaceable default
- Data changes: read tools never change data, AI preview consumes allowance but
  does not edit the page, and apply publishes only the exact reviewed preview

After import, select the same dedicated OrbitPage credential on every OrbitPage
tool and select the model credential. Keep **When Chat Message Received**
private during setup. Publish the workflow, then test this sequence:

1. Ask `What is currently on my OrbitPage?` and confirm the agent uses only
   read tools.
2. Ask for one harmless, reversible wording change.
3. Confirm that Chat renders the proposal as Markdown with summary, changes,
   reviewed revision, expiry, and **Approve and publish** / **Reject** buttons.
4. Select **Approve and publish** without sending another chat message.
5. Confirm the final Chat response contains publication evidence from
   **Verify Published State**.

The AI agent has no apply tool. A Code node extracts the server-issued opaque
`previewToken` from the completed preview call, formats only the reviewable
fields for Chat, and keeps the token out of the message. The deterministic
approval branch passes that token to an ordinary OrbitPage action node with
`publish: true` fixed by the workflow. The token can still be rejected when it
expires or the underlying revision changes. Rejecting the Chat review bypasses
the write node and reports that nothing changed.

The agent calls **Preview AI Page Changes** at most once per user message. If
OrbitPage returns an error or times out, it reports that failure without an
automatic second attempt.

Edit intent is sent to OrbitPage as a concise natural-language instruction
instead of a field-by-field page dump. The agent returns its intermediate tool
steps so **Prepare Chat Response** can recover the validated proposal and route
the opaque token to the deterministic approval branch.

The workflow intentionally provides no custom HTTP tool and no billing, domain,
Shop, newsletter, team, media-delete, backup, or restore operations. Keep those
capabilities outside this credential. If a self-hosted instance does not expose
the generated **OrbitPage Tool** nodes, verify that its community-node AI-tool
usage is enabled before changing the workflow.

Simple Memory preserves ordinary conversation context, but approval and the
preview token remain inside one waiting workflow execution and do not depend on
memory. Use a supported database-backed memory only when the conversation must
survive restarts or serve multiple workers. Configure n8n execution-data
retention because full page drafts and AI proposals can appear in execution
logs.

## Understand the output

The action example returns the OrbitPage API response as one n8n item. The
trigger returns `event`, `eventName`, `initial`, change signatures,
`observedAt`, and the current publication response under `data`.

For action workflows, enabling **Include HTTP Response Details** changes
the output to `body`, `headers`, and `statusCode`. Enabling **Continue On Fail**
returns an `error` item for a failed input, so add an explicit downstream error
branch before activating the workflow.

## Adapt safely

- Duplicate the example before adding write operations.
- Create a workflow-specific token instead of expanding a shared credential.
- Read [Credentials and scopes](../docs/guides/credentials-and-scopes.md) before
  adding permissions.
- Read [Revisions and publishing](../docs/guides/revisions-and-publishing.md)
  before changing draft or public content.
- Require human review before publish, restore, delete, email, billing, or
  AI-selected actions.
