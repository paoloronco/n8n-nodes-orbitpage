# Changelog

All notable changes to this package are documented here.

## Unreleased

### Fixed

- Point token setup instructions to Dashboard > Team, where personal API tokens are managed.

## 0.2.1 - 2026-09-02

### Fixed

- Make generated operation defaults statically recognizable by the official
  n8n community-package scanner without changing their runtime values.

## 0.2.0 - 2026-09-02

### Breaking changes

- Remove resources outside the public workspace API from the package. Review
  workflows created with v0.1.x before upgrading to 0.2.0. All remaining
  workspace resource and operation IDs are unchanged.

### Changed

- Clarify resource, operation, credential, trigger, and upload labels while
  preserving the internal values used by remaining workspace workflows.
- Keep Shop polling read-only with the API's `refresh=0` snapshot mode while
  preserving the stored `shopChanged` trigger value.
- Add explicit automatic, read-only snapshot, and forced-refresh modes to Get
  Shop Overview, and cancel failed compound file uploads so reservations and
  reserved storage are released promptly.
- Add task-based operation selection, request-body, effect, output-shape, and
  advanced-upload guidance for first-time users.
- Add operation-specific JSON guidance for every action with a request body,
  dynamic human-readable node subtitles, and combined possible-effect labels.
- Correct immediate-public restore and managed-text-file descriptions, align
  the bodyless Shop connection action with OpenAPI, and make credential tests
  reject unsafe remote HTTP or cross-origin redirects.
- Correct the scope guide to reflect that each selected write scope adds its
  matching read scope.
- Separate the published-version selector from the manual current-revision field,
  while retaining a fallback for existing workflows.
- Prevent Advanced API requests from reaching paths outside the public
  workspace API contract through alternate encodings or separators.
- Reorganize the npm README around requirements, installation, first use,
  scopes, safety and focused guides.
- Add contributor, security, example and maintainer documentation without
  changing the runtime node contract.
- Improve npm and in-editor discovery with a clearer OrbitPage/n8n description,
  focused package keywords, and a direct integration-guide link.
- Align the declared runtime floor with the current n8n toolchain at Node.js
  22.22, test Node.js 22.22 and 24 in CI, and require exact package/lock/tag
  parity for OIDC-only npm publishing.

## 0.1.2 - 2026-08-04

- Add an end-to-end quick start covering token creation, exact n8n credential
  fields, the non-destructive connection test and the first guided workflow.
- Add actionable troubleshooting for installation, redirects, authentication,
  scopes, revision conflicts and rate limits.
- Keep the typed operation catalog portable for OrbitPage OpenAPI and
  documentation parity checks without adding runtime dependencies.

## 0.1.1 - 2026-08-04

- Keep node class construction compatible with n8n 1.x installations that do
  not export `NodeConnectionTypes`.
- Verify all published node and credential class names through an n8n-style
  isolated loader during CI.

## 0.1.0 - 2026-08-04

- Add guided access to all 84 OrbitPage Automation REST API operations.
- Add automatic `ETag` acquisition for revision-controlled writes.
- Add complete direct video and protected Shop-file upload workflows.
- Add an advanced custom API request operation.
- Add polling triggers for workspace, publication, domain and Shop changes.
