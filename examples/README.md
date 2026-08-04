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
by **Workspace > Get Workspace**.

- Required scope: `workspace:read`
- Data changes: none
- Recommended use: first credential and package validation

Select **Execute Workflow** and inspect the returned workspace, access, plan,
usage, and revision data.

## Watch publication

[`watch-publication.json`](watch-publication.json) contains an OrbitPage polling
trigger configured for **Publication State Changed** every minute.

- Required scope: `publication:read`
- Data changes: none
- **Emit Initial State**: disabled

A manual test returns the current publication state. After activation, the
first production poll records a baseline without emitting. Later polls emit
when the publication response differs from the previous snapshot.

This trigger is not an event log. If publication changes several times between
polls, the workflow receives the latest observed state rather than every
intermediate transition.

## Adapt safely

- Duplicate the example before adding write operations.
- Create a workflow-specific token instead of expanding a shared credential.
- Read [Credentials and scopes](../docs/guides/credentials-and-scopes.md) before
  adding permissions.
- Read [Revisions and publishing](../docs/guides/revisions-and-publishing.md)
  before changing draft or public content.
- Require human review before publish, restore, delete, email, billing,
  moderation, or AI-selected actions.
