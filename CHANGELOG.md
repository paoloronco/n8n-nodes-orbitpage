# Changelog

All notable changes to this package are documented here.

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
