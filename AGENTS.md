# AGENTS.md

This directory is the standalone public `n8n-nodes-orbitpage` community-node
repository. Instructions in this file apply to every file below this directory.

## Public repository boundary

- Keep this package independently buildable and publishable to npm.
- Do not copy private OrbitPage SaaS code, internal architecture, credentials,
  customer data, tenant data, or non-public operational details into this repo.
- Public API behavior may be documented from
  `https://orbitpage.com/api/openapi.json` and the public token guide.
- The Git remote for this submodule is the public
  `https://github.com/paoloronco/n8n-nodes-orbitpage.git` repository. Do not mix
  commits or remotes with the private SaaS superproject.

## Sources of truth

- `nodes/OrbitPage/operations.ts`: guided operation catalog.
- `nodes/OrbitPage/description.ts`: n8n editor properties and display rules.
- `nodes/OrbitPage/transport.ts`: authenticated API transport and revision
  extraction.
- `nodes/OrbitPage/OrbitPage.node.ts`: action execution and compound uploads.
- `nodes/OrbitPageTrigger/OrbitPageTrigger.node.ts`: polling behavior.
- `credentials/OrbitPageApi.credentials.ts`: token types and connection tests.
- `package.json`: package entry points, versions, scripts, and published files.

## Generated files

`docs/OPERATIONS.md` is generated from the built operation catalog by
`scripts/generate-operation-docs.cjs`. Never edit it manually.

After changing operation metadata, run:

```bash
npm run build
npm run docs:generate
```

`dist/` is generated and Git-ignored. Do not treat it as source.

## Required checks

Use Node.js 22 or newer for development. Install with `npm ci` and run:

```bash
npm run check
```

This must pass before handoff. For documentation work, also validate relative
Markdown links and confirm `npm run docs:check` remains clean.

## Implementation rules

- Preserve input/output item linking and `Continue On Fail` behavior.
- Keep request paths relative to `/api/v1` and credentials inside the shared
  transport.
- Do not weaken HTTPS, redirect, or allowed-host protections.
- Do not forward OrbitPage bearer credentials to signed upload hosts.
- Keep runtime dependencies empty unless a reviewed requirement justifies one.
- Add behavioral tests for revisions, path substitution, transport, uploads,
  triggers, and credentials when those areas change.
- Prefer a catalog entry and shared execution path over one-off code.
- Treat destructive, publishing, email, billing, moderation, operator, and
  AI-selected actions as high risk.

## Documentation rules

- Keep `README.md` focused on installation and first use.
- Put detailed procedures in `docs/guides/` and link them from
  `docs/README.md`.
- Keep `examples/README.md` aligned with the checked-in workflow JSON.
- Document the exact scope required by every operation or trigger.
- State that credential tests require `workspace:read` or `operator:read`.
- State that polling observes snapshots and may aggregate multiple changes
  between polls.
- Use relative repository links and primary public external sources.
- Never publish real tokens, credential IDs, signed URLs, or customer data.

## Compatibility and releases

- Use semantic versioning for the npm package.
- The n8n node version is independent; change it only when stored workflow
  compatibility requires distinct old and new behavior.
- Parameter renames require a migration or backward-compatible fallback.
- Update `CHANGELOG.md` for user-visible changes.
- Releases are maintainer-only and use the checked-in GitHub Actions workflow
  with npm provenance.

Do not create tags, publish packages, or push changes unless the user explicitly
requests that action.
