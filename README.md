# n8n-nodes-orbitpage

Community nodes for managing a hosted OrbitPage end to end from n8n. The
package implements every operation in the OrbitPage Automation REST API, adds
safe automatic revision handling, supports direct binary uploads, and includes
a polling trigger for important workspace state changes.

## Nodes

### OrbitPage

An action node with guided resources for:

- workspace and complete draft;
- page blocks, profile, theme and subpages;
- menu, privacy, public text files and sitemap;
- publication, version history and managed backups;
- media, custom domains and analytics;
- reviewed AI plan/commit flows;
- Shop products, appearance, publishing and protected files;
- newsletter SMTP, subscribers and campaigns;
- team members, invitations and billing;
- protected operator CRM, promotion, moderation and tenant operations;
- relative custom API requests for forward-compatible access.

The guided catalog contains all 84 operations in the public OpenAPI contract.
See [the complete operation matrix](docs/OPERATIONS.md).

### OrbitPage Trigger

A polling trigger that starts a workflow when one of these states changes:

- workspace revision;
- publication status;
- custom-domain status;
- Shop state.

The first production poll establishes a baseline and emits nothing unless
**Emit Initial State** is enabled. A manual test always returns the current
state.

## Installation

### n8n Community Nodes UI

Open **Settings → Community Nodes**, choose **Install**, then enter:

```text
n8n-nodes-orbitpage
```

Restart self-hosted n8n if your installation requires it. Verified community
node availability on n8n Cloud depends on the n8n review process.

### Self-hosted command line

From the n8n data directory:

```bash
npm install n8n-nodes-orbitpage
```

Use Node.js 22 or newer.

## Credentials

1. In OrbitPage, open **Dashboard → Account → Personal API tokens**.
2. Create one token for one workflow and environment.
3. Grant only the scopes required by the selected operations.
4. Copy the `op_pat_...` value immediately; OrbitPage shows it only once.
5. In n8n, create an **OrbitPage API** credential and paste the token.

For `/operator` operations, create a separate 30-day token in the protected
OrbitPage operator console and choose **Protected Operator Token** in the n8n
credential. Never reuse an operator credential in tenant workflows.

The default Base URL is `https://orbitpage.com`. Change it only when OrbitPage
support provides a staging URL. HTTP is accepted only for localhost development.

## Safe revision-controlled writes

OrbitPage protects draft writes with optimistic concurrency. For block,
profile, theme, page, settings and restore operations, the node defaults to
**Fetch Latest Automatically**:

1. it reads the related resource;
2. captures the response `ETag` or numeric revision;
3. sends that value as `If-Match` with the write.

Choose **Enter Manually** only when an earlier node already read the state and
you intentionally want a conflict if anything changed afterward. A `409`
response should lead back to a new read; do not retry a stale write blindly.

Profile, theme, pages and supported settings update the draft by default.
Enable **Publish Immediately** for a single eligible mutation, or make several
draft changes and finish with **Publication → Publish Page**. Block `PATCH` and
`PUT` operations publish immediately by API design.

## Binary uploads

### Video media

Choose **Media → Upload Video Binary**. The node:

1. reads an MP4 or WebM binary field from the input item;
2. reserves a temporary upload with OrbitPage;
3. sends bytes directly to the signed storage URL without forwarding the
   OrbitPage bearer token;
4. finalizes and registers the asset;
5. attempts to abort the reservation if upload or finalization fails.

### Protected Shop files

Choose **Shop → Upload Product File Binary**, provide the digital-product ID
and the input binary field. The node performs the same reserve/upload/finalize
sequence for supported protected product files.

Signed upload URLs expire quickly. Keep the three steps inside this compound
operation unless a workflow specifically needs the lower-level reserve and
finalize actions.

## AI workflows

Use **AI → Plan Changes** to produce a validated preview without changing the
page. Review the returned operations and keep its `previewToken`, then call
**AI → Commit Changes** with that exact token. Put `"publish": true` in the
commit body only when the workflow is authorized to make the result public.

An OpenAI provider key is not an OrbitPage credential and must never be placed
in this node.

## Custom API requests

**Advanced → Custom API Request** accepts a method, a path relative to
`/api/v1`, query parameters, a JSON body and an optional `If-Match` value.
Absolute URLs, query strings inside the path and dot segments are rejected so
the credential cannot be redirected to a different endpoint or host.

Use a guided operation whenever one exists: it documents the required scope,
path fields and revision behavior directly in the editor.

## Output and item linking

Each input item produces one linked output item. The default output is the API
response body. Enable **Include Response Headers and Status** to receive:

```json
{
  "body": {},
  "headers": {},
  "statusCode": 200
}
```

This is useful when a later node needs `ETag`, `Retry-After` or other response
metadata. **Continue On Fail** returns an error item linked to the failing input.

## Security practices

- Store tokens only in n8n credentials, never workflow JSON or expressions.
- Use one token per workflow and environment with the smallest scopes.
- Prefer finite expiry and rotate before it is reached.
- Do not log credentials, signed upload URLs or sensitive response bodies.
- Respect `Retry-After`; OrbitPage currently applies per-token minute and daily
  limits.
- Keep operator workflows and credentials isolated.
- Revoke a token immediately after suspected disclosure.

## Documentation

- [OrbitPage API guide](https://orbitpage.com/en-US/docs/api-tokens)
- [OpenAPI 3.1 contract](https://orbitpage.com/api/openapi.json)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

Importable example workflows are available in [`examples`](examples). After
changing the typed operation catalog, rebuild and regenerate its checked-in
reference with `npm run build && npm run docs:generate`.

The package has no runtime dependencies outside the `n8n-workflow` peer. It
uses the official `@n8n/node-cli` toolchain and is prepared for npm provenance
publishing through GitHub Actions.

For releases, create the public `paoloronco/n8n-nodes-orbitpage` repository,
push this package as its root and configure npm **Publish access → Trusted
Publishers** for that repository and `publish.yml`. OIDC is preferred and needs
no long-lived GitHub secret. A package-scoped `NPM_TOKEN` is supported only as
the initial/fallback publication route. Tagging a version such as `0.1.0`
starts the checked, provenance-attested release workflow.

## License

MIT © Paolo Ronco
