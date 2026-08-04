# OrbitPage n8n documentation

Use this index to move from installation to production operation without
reading the entire API catalog first.

## Start here

| Goal | Guide |
| --- | --- |
| Install the package and run a safe first request | [Getting started](guides/getting-started.md) |
| Choose a resource, operation, request body, and output shape | [Getting started: build an operation](guides/getting-started.md#build-the-next-operation) |
| Create tokens and choose the minimum scopes | [Credentials and scopes](guides/credentials-and-scopes.md) |
| Handle `ETag`, conflicts, draft changes, and publishing | [Revisions and publishing](guides/revisions-and-publishing.md) |
| Upload video or protected Shop files | [Binary uploads](guides/binary-uploads.md) |
| Use OrbitPage operations safely with AI | [AI safety](guides/ai-safety.md) |
| Diagnose installation, HTTP, trigger, or upload failures | [Troubleshooting](guides/troubleshooting.md) |
| Develop, test, and release the package | [Development and release](guides/development-and-release.md) |

## Reference

- [Operation matrix](OPERATIONS.md) lists all 65 workspace API operations and
  three n8n convenience operations with their method, path, scope, body
  requirement, and revision source.
- [Example workflows](../examples/README.md) explains how to import the checked-in
  examples safely.
- [Contributing](../CONTRIBUTING.md) defines the pull-request expectations.
- [Security policy](../SECURITY.md) explains private vulnerability reporting and
  secret handling.
- [Package README](../README.md) is the concise npm landing page.

## Generated documentation

`OPERATIONS.md` is generated from `nodes/OrbitPage/operations.ts`. Do not edit it
manually. After changing the typed catalog, run:

```bash
npm run build
npm run docs:generate
npm run docs:check
```

The focused guides in `docs/guides/` are maintained by hand. Keep them aligned
with the node editor, the generated matrix, and the public
[OrbitPage OpenAPI contract](https://orbitpage.com/api/openapi.json).
