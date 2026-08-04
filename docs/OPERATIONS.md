# OrbitPage operation matrix

This file is generated from the typed n8n operation catalog. It covers every operation in the OrbitPage OpenAPI 3.1 contract at `https://orbitpage.com/api/openapi.json`.

All paths below are relative to `/api/v1`. Guided operations authenticate with the selected **OrbitPage API** credential. Operations marked with a revision source automatically read that endpoint and send its latest `ETag` or revision as `If-Match`.

## AI

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Allowance | GET | `/ai/allowance` | `ai:read` | none | — |
| Plan Changes | POST | `/ai/plan` | `ai:write` | required | — |
| Commit Changes | POST | `/ai/commit` | `ai:write` | required | — |

## Analytics

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Analytics | GET | `/analytics` | `analytics:read` | none | — |

## Backup and Version

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Many Versions | GET | `/versions` | `backup:read` | none | — |
| Restore Version | POST | `/versions/{revision}/restore` | `backup:write` | none | `/draft` |
| Export Backup | GET | `/backup` | `backup:read` | none | — |
| Restore Backup | POST | `/backup/restore` | `backup:write` | required | `/draft` |

## Billing

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Billing | GET | `/billing` | `billing:read` | none | — |
| Create Checkout | POST | `/billing/checkout` | `billing:write` | required | — |
| Create Portal Session | POST | `/billing/portal` | `billing:write` | optional | — |
| Redeem Promotion Code | POST | `/billing/promotion-code` | `billing:write` | required | — |

## Block

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Many Blocks | GET | `/links` | `links:read` | none | — |
| Replace Blocks | PUT | `/links` | `links:write` | required | `/links` |
| Update Block | PATCH | `/links/{linkId}` | `links:write` | required | `/links` |

## Custom Domain

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Domain | GET | `/domains` | `domains:read` | none | — |
| Connect Domain | POST | `/domains` | `domains:write` | required | — |
| Refresh Domain | POST | `/domains/refresh` | `domains:write` | none | — |
| Disconnect Domain | DELETE | `/domains` | `domains:write` | none | — |

## Media

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Many Media Items | GET | `/media` | `media:read` | none | — |
| Clean Up Media | POST | `/media/cleanup` | `media:write` | optional | — |
| Reserve Video Upload | POST | `/media/uploads/reserve` | `media:write` | required | — |
| Finalize Video Upload | POST | `/media/uploads/finalize` | `media:write` | required | — |
| Abort Video Upload | DELETE | `/media/uploads` | `media:write` | required | — |

## Newsletter

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Newsletter | GET | `/newsletter` | `newsletter:read` | none | — |
| Update SMTP Settings | PUT | `/newsletter/settings` | `newsletter:write` | required | — |
| Test SMTP Settings | POST | `/newsletter/settings/test` | `newsletter:write` | required | — |
| Add Subscriber | POST | `/newsletter/subscribers` | `newsletter:write` | required | — |
| Remove Subscriber | DELETE | `/newsletter/subscribers/{subscriberId}` | `newsletter:write` | none | — |
| Save Campaign | POST | `/newsletter/campaigns` | `newsletter:write` | required | — |
| Delete Campaign | DELETE | `/newsletter/campaigns/{campaignId}` | `newsletter:write` | none | — |
| Send or Schedule Campaign | POST | `/newsletter/campaigns/{campaignId}/send` | `newsletter:write` | optional | — |
| Cancel Campaign | DELETE | `/newsletter/campaigns/{campaignId}/send` | `newsletter:write` | none | — |

## Operator

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Overview | GET | `/operator/overview` | `operator:read` | none | — |
| Get Many CRM Prospects | GET | `/operator/crm` | `operator:read` | none | — |
| Create CRM Prospect | POST | `/operator/crm` | `operator:write` | required | — |
| Get CRM Prospect | GET | `/operator/crm/{prospectId}` | `operator:read` | none | — |
| Update CRM Prospect | PATCH | `/operator/crm/{prospectId}` | `operator:write` | required | — |
| Save CRM Note | POST | `/operator/crm/{prospectId}/notes` | `operator:write` | required | — |
| Save CRM Message | POST | `/operator/crm/{prospectId}/messages` | `operator:write` | required | — |
| Update CRM Activity | PATCH | `/operator/crm/{prospectId}/activities/{activityId}` | `operator:write` | required | — |
| Link CRM Workspace | POST | `/operator/crm/{prospectId}/link` | `operator:write` | required | — |
| Onboard CRM Prospect | POST | `/operator/crm/{prospectId}/onboard` | `operator:write` | required | — |
| Preview Account Email | GET | `/operator/crm/{prospectId}/account-email` | `operator:read` | none | — |
| Send Account Email | POST | `/operator/crm/{prospectId}/account-email` | `operator:write` | required | — |
| Get Many Promotion Codes | GET | `/operator/promotion-codes` | `operator:read` | none | — |
| Create Promotion Code | POST | `/operator/promotion-codes` | `operator:write` | required | — |
| Update Promotion Code | PATCH | `/operator/promotion-codes/{promotionCodeId}` | `operator:write` | required | — |
| Moderate Tenant | POST | `/operator/tenants/{tenantId}/moderation` | `operator:write` | required | — |
| Change Tenant Plan | POST | `/operator/tenants/{tenantId}/plan` | `operator:write` | required | — |
| Create Demo Access | POST | `/operator/tenants/{tenantId}/demo-access` | `operator:write` | required | — |
| Revoke Demo Access | DELETE | `/operator/tenants/{tenantId}/demo-access` | `operator:write` | required | — |
| Delete Tenant | DELETE | `/operator/tenants/{tenantId}` | `operator:write` | required | — |

## Page

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Many Pages | GET | `/pages` | `pages:read` | none | — |
| Replace Pages | PUT | `/pages` | `pages:write` | required | `/pages` |

## Profile

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Profile | GET | `/profile` | `profile:read` | none | — |
| Update Profile | PATCH | `/profile` | `profile:write` | required | `/profile` |

## Publication

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Publication Status | GET | `/publication` | `publication:read` | none | — |
| Publish Page | POST | `/publication` | `publication:write` | none | — |

## Settings

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Settings | GET | `/settings` | `settings:read` | none | — |
| Update Menu | PUT | `/settings/menu` | `settings:write` | required | `/settings` |
| Update Privacy | PUT | `/settings/privacy` | `settings:write` | required | `/settings` |
| Create Text File | POST | `/settings/text-files` | `settings:write` | required | `/settings` |
| Update Text File | PUT | `/settings/text-files/{key}` | `settings:write` | required | `/settings` |
| Delete Text File | DELETE | `/settings/text-files/{key}` | `settings:write` | none | `/settings` |
| Generate Sitemap | POST | `/settings/sitemap` | `settings:write` | none | `/settings` |

## Shop

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Shop | GET | `/shop` | `shop:read` | none | — |
| Connect Shop | POST | `/shop/connect` | `shop:write` | optional | — |
| Save Product | POST | `/shop/products` | `shop:write` | required | — |
| Delete Product | DELETE | `/shop/products/{productId}` | `shop:write` | none | — |
| Update Appearance | PUT | `/shop/appearance` | `shop:write` | required | — |
| Publish Shop | POST | `/shop/publish` | `shop:write` | none | — |
| Unpublish Shop | POST | `/shop/unpublish` | `shop:write` | none | — |
| Reserve File Upload | POST | `/shop/uploads/reserve` | `shop:write` | required | — |
| Finalize File Upload | POST | `/shop/uploads/finalize` | `shop:write` | required | — |

## Team

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Team | GET | `/team` | `team:read` | none | — |
| Invite Member | POST | `/team/invitations` | `team:write` | required | — |
| Update Member | PATCH | `/team/members/{memberUid}` | `team:write` | required | — |
| Remove Member | DELETE | `/team/members/{memberUid}` | `team:write` | none | — |
| Revoke Invitation | DELETE | `/team/invitations/{invitationId}` | `team:write` | none | — |

## Theme

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Theme | GET | `/theme` | `theme:read` | none | — |
| Replace Theme | PUT | `/theme` | `theme:write` | required | `/theme` |

## Workspace

| Operation | Method | Path | Required scope | Body | Revision source |
| --- | --- | --- | --- | --- | --- |
| Get Workspace | GET | `/workspace` | `workspace:read` | none | — |
| Get Complete Draft | GET | `/draft` | `workspace:read` | none | — |

## n8n convenience operations

| Operation | Resource | Behavior |
| --- | --- | --- |
| Upload Video Binary | media | Reserve, upload and finalize an n8n MP4 or WebM binary in one operation |
| Upload Product File Binary | shop | Reserve, upload and finalize an n8n binary for a digital product in one operation |
| Custom API Request | advanced | Call a relative OrbitPage API v1 path while keeping authentication in the credential |

API operations: **84**. n8n convenience operations: **3**.
