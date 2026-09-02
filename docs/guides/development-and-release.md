# Development and release

This package is a standalone public n8n community-node repository. Keep hosted
OrbitPage implementation details, private SaaS code, secrets, and internal
operational data outside it.

## Repository layout

```text
credentials/              OrbitPage API credential definition
nodes/OrbitPage/           action node, transport, properties, operation catalog
nodes/OrbitPageTrigger/    polling trigger
nodes/shared/              n8n compatibility helpers
docs/                      documentation index and generated operation matrix
docs/guides/               maintained user and contributor guides
examples/                  importable example workflows
scripts/                   package-load and documentation checks
test/                      Vitest tests
```

`dist/` and `node_modules/` are local generated directories and are ignored by
Git. The published npm package includes the built `dist/` output.

## Development setup

Use Node.js 22.22 or newer for package development:

```bash
npm ci
npm run dev
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run lint` | Run the official n8n node lint rules |
| `npm run build` | Build the package through `n8n-node` |
| `npm run load:check` | Load published node and credential classes in an isolated n8n-style runtime |
| `npm run docs:generate` | Regenerate the operation matrix from the built typed catalog |
| `npm run docs:check` | Fail if the checked-in operation matrix is stale |
| `npm test` | Run the Vitest suite |
| `npm run check` | Run lint, build, load, documentation, and test checks |

Run `npm run check` before opening a pull request.

## Architecture

The package intentionally uses one programmatic action node. Although simple
HTTP integrations can use a declarative node, OrbitPage also requires:

- a typed catalog spanning 65 workspace API operations and three n8n
  convenience operations (68 operations total);
- automatic revision preflight requests;
- direct signed binary uploads;
- per-input item linking and `Continue On Fail` behavior;
- guarded relative custom API requests.

Keep ordinary operation metadata in `nodes/OrbitPage/operations.ts`. Add custom
execution code only when behavior cannot be represented by the shared guided
request path.

## Changing an operation

1. Confirm the method, path, scope, parameters, request body, and revision
   behavior against the public OpenAPI contract.
2. Update `nodes/OrbitPage/operations.ts`.
3. Update `nodes/OrbitPage/description.ts` only when the editor needs a new
   field or display rule.
4. Update execution or transport code only when the request needs special
   handling.
5. Add tests for catalog reachability and runtime behavior.
6. Run:

   ```bash
   npm run build
   npm run docs:generate
   npm run check
   ```

`docs/OPERATIONS.md` is generated. Never edit it manually. Review its diff to
confirm that the public documentation reflects the intended catalog change.

If the public OpenAPI contract changes but the node cannot support the new
operation yet, do not silently update the documented operation count. Record
the gap and complete the implementation before claiming full coverage.

## Runtime expectations

- Preserve `pairedItem` linking for every input item.
- Preserve intentional `Continue On Fail` behavior.
- Never log credentials, signed URLs, or sensitive response bodies.
- Keep bearer authentication on the configured OrbitPage host.
- Require HTTPS except for explicit localhost development.
- Do not add runtime dependencies without a concrete need and review.
- Keep generated and hand-written documentation links relative within the
  package so they work on GitHub and npm.

## Tests

At minimum, a behavioral change should cover its successful request and its
important failure mode. High-risk areas include:

- automatic and manual revision handling;
- path substitution and custom-path validation;
- cross-origin and signed-upload behavior;
- upload finalization and cleanup;
- trigger baseline and snapshot changes;
- output item linking and `Continue On Fail`;
- credential Base URL and connection-test behavior.

The operation-count test protects the current catalog shape but is not a
substitute for request-level tests or comparison with the live OpenAPI contract.

## Versioning

The npm package follows semantic versioning:

- patch: compatible bug fixes and documentation corrections;
- minor: compatible operations or capabilities;
- major: package-level breaking changes.

The n8n node `version` is separate from the npm version. Increase the node
version when stored workflow parameters or execution semantics require n8n to
distinguish old and new node behavior; do not increment it for every npm patch.

Update `CHANGELOG.md` for user-visible changes. Compatibility-sensitive field
renames need an explicit migration or backward-compatible fallback.

## Release process

Releases are maintainer-only:

1. Confirm the working tree contains only the intended public changes.
2. Confirm the intended release notes and semantic-version impact.
3. Run `npm run check`.
4. Inspect `npm pack --dry-run` for unexpected private or source files.
5. Run `npm run release` locally. The official n8n CLI invokes `release-it` to
   choose the version, update release metadata, commit, tag, push, and create the
   GitHub release; it does not publish npm from the local machine.
6. Confirm the pushed `X.Y.Z` tag exactly matches `package.json` and both version
   fields in `package-lock.json`.
7. The GitHub Publish workflow verifies main ancestry, runs the complete package
   check, inspects `npm pack --dry-run`, and invokes the official n8n release
   command with npm Trusted Publishing/OIDC and provenance.
8. After npm reports the new version, run the official community-package scan:

   ```bash
   npx --yes @n8n/scan-community-package n8n-nodes-orbitpage
   ```

9. Confirm the npm description, keywords, README, repository link, homepage,
   provenance, and automatically created GitHub release all show the new
   version.
10. Once the published version passes the scan, submit or update the node in the
    [n8n Creator Portal](https://creators.n8n.io/nodes) for verified in-editor
    discovery.

The workflow does not accept an `NPM_TOKEN` fallback. The npm package settings
must trust `.github/workflows/publish.yml`; never commit or reintroduce a
long-lived registry write token.

GitHub's About description, website, topics, and social-preview image are
repository settings rather than package files. Review them after a release so
they remain aligned with the workspace-only public package.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the pull-request checklist.
