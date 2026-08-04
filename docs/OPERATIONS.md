# OrbitPage operation matrix

This file is generated from the typed n8n operation catalog. It covers every operation in the OrbitPage OpenAPI 3.1 contract at `https://orbitpage.com/api/openapi.json`.

The names below match the labels shown in the n8n editor. **Possible effects** tells you whether an operation only reads data, changes a draft or private setting, changes public content, has an external side effect, deletes or replaces data, or sends an advanced request. More than one label can apply.

All API paths are relative to `/api/v1`. Guided operations authenticate with the selected **OrbitPage API** credential. Operations marked with a revision source can automatically read that endpoint and send its latest `ETag` or revision as `If-Match`.

## Workspace & Draft

Read workspace access, usage and the complete editable page draft

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Workspace Overview | Retrieve plan, access, usage and current revision for the connected workspace | Read Only | GET | `/workspace` | `200` | `workspace:read` | None | — |
| Get Full Page Draft | Retrieve all editable OrbitPage page data in one response | Read Only | GET | `/draft` | `200` | `workspace:read` | None | — |

## Profile

Read and update the identity shown on the public page

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Profile Draft | Retrieve profile identity and metadata from the page draft | Read Only | GET | `/profile` | `200` | `profile:read` | None | — |
| Update Profile Draft | Update profile fields in the draft; Publish Changes Immediately can publish the changes to the public page | Draft or Private Change · Public Change | PATCH | `/profile` | `200` | `profile:write` | Body: Send at least one profile field to change, such as name, bio, avatar, social_links, display settings, or SEO metadata. | `/profile` |

## Page Content (Blocks)

Read and manage the ordered blocks shown on the main page

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Many Content Blocks | Retrieve the complete ordered page-block collection and its current revision | Read Only | GET | `/links` | `200` | `links:read` | None | — |
| Replace All Content Blocks | Replace every page block, delete blocks omitted from the request, validate the collection and publish it immediately | Replaces or Deletes Data · Public Change | PUT | `/links` | `200` | `links:write` | Body: Start from the data array returned by Get Many Content Blocks. Send the complete list as that array or as {"links":[...]}; omitted blocks are deleted. | `/links` |
| Update One Content Block | Update one page block, validate the change and publish it immediately | Public Change | PATCH | `/links/{linkId}` | `200` | `links:write` | Content Block ID + Body: Send at least one editable block field, such as title, description, url, backgroundColor, isActive, or status. The block ID and type are preserved. | `/links` |

## Subpages

Read and replace the configured subpage collection

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Many Subpages | Retrieve all configured subpages | Read Only | GET | `/pages` | `200` | `pages:read` | None | — |
| Replace All Subpages | Replace the complete subpage collection; omitted subpages are deleted, and Publish Changes Immediately can publish the replacement | Draft or Private Change · Replaces or Deletes Data · Public Change | PUT | `/pages` | `200` | `pages:write` | Body: Start from the data array returned by Get Many Subpages. Send the complete list as that array or as {"pages":[...]}; omitted subpages are deleted. | `/pages` |

## Theme

Read and replace the page theme

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Theme Draft | Retrieve the active draft theme | Read Only | GET | `/theme` | `200` | `theme:read` | None | — |
| Replace Entire Theme Draft | Replace the complete draft theme; previous theme settings are overwritten, and Publish Changes Immediately can publish the replacement | Draft or Private Change · Replaces or Deletes Data · Public Change | PUT | `/theme` | `200` | `theme:write` | Body: Start from the data field returned by Get Theme Draft. Send the complete desired theme; omitted properties fall back to defaults. | `/theme` |

## Page Settings

Manage menus, privacy, public text files and sitemap settings

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Page Settings | Retrieve menu, privacy, managed public text file and sitemap settings | Read Only | GET | `/settings` | `200` | `settings:read` | None | — |
| Replace Entire Menu Settings | Replace the complete draft menu settings; omitted values can reset, and Publish Changes Immediately can publish the replacement | Draft or Private Change · Replaces or Deletes Data · Public Change | PUT | `/settings/menu` | `200` | `settings:write` | Body: Start from data.menu returned by Get Page Settings and send the complete menu object. Missing required fields or unsupported fields are rejected; optional fields that you omit use their defaults. | `/settings` |
| Replace All Privacy and Consent Settings | Replace the complete consent and privacy settings; omitted values can reset, and Publish Changes Immediately can publish the replacement | Draft or Private Change · Replaces or Deletes Data · Public Change | PUT | `/settings/privacy` | `200` | `settings:write` | Body: Start from data.privacy returned by Get Page Settings. Send the complete consent configuration with mode, enabled, and all settings required by that mode. | `/settings` |
| Create Public Text File | Create a managed text file and update its public URL immediately | Public Change | POST | `/settings/text-files` | `201` | `settings:write` | Body: Send path and content. Use /name.txt or /.well-known/name.txt with letters, numbers, dots, dashes, or underscores; a missing leading slash is added, while OrbitPage built-in paths and aliases are reserved. content accepts at most 50,000 characters. A workspace can store up to 20 custom TXT files and 128 KB across all managed TXT content. The path becomes public immediately. | `/settings` |
| Replace Public Text File | Replace one managed text file and update its public URL immediately | Public Change | PUT | `/settings/text-files/{key}` | `200` | `settings:write` | Public Text File Key + Body: Send content only, up to 50,000 characters and within the 128 KB total TXT allowance. Public Text File Key selects the file that changes immediately. | `/settings` |
| Delete Public Text File | Delete or reset one managed text file and update its public URL immediately | Replaces or Deletes Data · Public Change | DELETE | `/settings/text-files/{key}` | `200` | `settings:write` | Public Text File Key | `/settings` |
| Regenerate Sitemap | Rebuild the managed public sitemap from current page content | Public Change | POST | `/settings/sitemap` | `200` | `settings:write` | None | `/settings` |

## Publication

Review publication status and publish validated drafts

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Draft and Publication Status | Retrieve draft revision, published revision, public URL and current publication status | Read Only | GET | `/publication` | `200` | `publication:read` | None | — |
| Publish Current Draft | Validate and publish the latest page draft to the public URL | Public Change | POST | `/publication` | `200` | `publication:write` | None | — |

## Media Library

Manage workspace media and direct video uploads

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Many Media Items | Retrieve workspace media metadata and current storage usage | Read Only | GET | `/media` | `200` | `media:read` | None | — |
| Preview or Delete Unused Media | Preview unused media or permanently delete it when deletion is requested; this does not publish the page | Read Only · Replaces or Deletes Data | POST | `/media/cleanup` | `200` | `media:write` | Optional body: Leave empty to preview unused media. Set dryRun to false only when you intend to delete the reported files permanently. | — |
| Upload or Replace Video From Binary Input | Reserve, upload and register an MP4 or WebM video from an n8n binary field; reusing a slot replaces its current video without publishing the page | Draft or Private Change · Replaces or Deletes Data | n8n | — | — | `media:write` | Binary video field | — |
| Reserve Video Upload (Advanced) | Create an advanced direct-upload reservation for an MP4 or WebM video | Draft or Private Change | POST | `/media/uploads/reserve` | `201` | `media:write` | Body: Send filename, sizeBytes, and contentType as video/mp4 or video/webm. The filename must end in .mp4 or .webm to match contentType; sizeBytes must be a positive integer within the workspace plan and 100 MB direct-upload limits. purpose accepts upload or background; slot is optional. | — |
| Finalize Reserved Video Upload (Advanced) | Register a video after an advanced direct upload succeeds; reusing a slot replaces its current video | Draft or Private Change · Replaces or Deletes Data | POST | `/media/uploads/finalize` | `200` | `media:write` | Body: Send slot and uploadToken exactly as returned by Reserve Video Upload. Reusing a slot replaces its current video. | — |
| Cancel Reserved Video Upload (Advanced) | Discard an active direct-upload reservation and delete its staged video without publishing the page | Draft or Private Change · Replaces or Deletes Data | DELETE | `/media/uploads` | `200` | `media:write` | Body: Send slot and uploadToken exactly as returned by Reserve Video Upload. | — |

## Custom Domain & DNS

Connect, verify or disconnect the workspace custom domain

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Domain Status and DNS Instructions | Retrieve the current custom domain, DNS requirements and verification status | Read Only | GET | `/domains` | `200` | `domains:read` | None | — |
| Connect Custom Domain | Connect a custom hostname, start external DNS verification and activate the public route immediately when already verified | External Side Effect · Public Change | POST | `/domains` | `201` | `domains:write` | Body: Send hostname without a path, such as a root domain or www subdomain. | — |
| Recheck Domain Verification | Refresh external DNS verification and activate the public custom domain when requirements are satisfied | External Side Effect · Public Change | POST | `/domains/refresh` | `200` | `domains:write` | None | — |
| Disconnect Custom Domain | Disconnect the current custom domain so it stops serving the public page | Replaces or Deletes Data · External Side Effect · Public Change | DELETE | `/domains` | `200` | `domains:write` | None | — |

## Analytics

Read the plan-bounded workspace analytics report

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Analytics Report | Retrieve dashboard analytics for the selected reporting window, limited by the workspace plan | Read Only | GET | `/analytics` | `200` | `analytics:read` | Analytics Period (defaults to 30 days) | — |

## AI Page Editing

Review AI usage, preview page changes and apply an approved preview

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get AI Usage and Allowance | Retrieve current AI request usage and remaining allowance | Read Only | GET | `/ai/allowance` | `200` | `ai:read` | None | — |
| Preview AI Page Changes | Use the external AI service, consume allowance and store a private validated preview without changing or publishing the page | Draft or Private Change · External Side Effect | POST | `/ai/plan` | `200` | `ai:write` | Body: Send message with 1 to 4,000 characters. history is optional and accepts at most 8 objects containing role as user or assistant and content with 1 to 4,000 characters. requestId is an optional UUID. | — |
| Apply Previewed AI Changes | Apply a previously validated AI preview to the draft; the preview can replace or remove content and publishes only when the reviewed request explicitly authorizes publication | Draft or Private Change · Replaces or Deletes Data · Public Change | POST | `/ai/commit` | `200` | `ai:write` | Body: Send previewToken from Preview AI Page Changes. Review removals and replacements in that preview; set publish to true only when the public change is approved. | — |

## Shop

Manage products, files, appearance, Stripe connection and Shop publication

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Shop Overview | Retrieve products, orders, customers, publication status and appearance; this can initialize private Shop state and refresh cached Stripe status | Read Only · Draft or Private Change · External Side Effect | GET | `/shop` | `200` | `shop:read` | Shop Read Mode (automatic, read-only snapshot, or forced Stripe refresh) | — |
| Start or Continue Stripe Setup | Create or continue external Stripe Connect onboarding without publishing Shop | External Side Effect | POST | `/shop/connect` | `200` | `shop:write` | None | — |
| Create or Update Product | Create a product or replace all editable fields of an existing product; changing its type can detach a protected file, an already published Shop is republished, and the returned overview can refresh stale Stripe status | Draft or Private Change · Replaces or Deletes Data · External Side Effect · Public Change | POST | `/shop/products` | `201` | `shop:write` | Body: To update, start from the complete product returned by Get Shop Overview and add productId because omitted editable fields reset to defaults. Send type, title, description, and priceCents. A service also needs an HTTPS bookingUrl or fulfillmentText; sessionsIncluded, intakeQuestions, active, and cardStyle are optional. Changing a digital product to a service detaches its protected file. | — |
| Delete Product | Permanently delete a product; an already published Shop is republished, and the returned overview can refresh stale Stripe status | Replaces or Deletes Data · External Side Effect · Public Change | DELETE | `/shop/products/{productId}` | `200` | `shop:write` | Product ID | — |
| Replace Entire Shop Appearance | Replace the complete appearance; omitted values use defaults, an already published Shop is republished, and the returned overview can refresh stale Stripe status | Draft or Private Change · Replaces or Deletes Data · External Side Effect · Public Change | PUT | `/shop/appearance` | `200` | `shop:write` | Body: Start from shop.appearance returned by Get Shop Overview and send the complete desired appearance. Omitted properties use defaults. If Shop is active, this also republishes its public artifact and synchronized page block. | — |
| Publish Shop | Check current Stripe readiness, then publish Shop and its synchronized page block for visitors | External Side Effect · Public Change | POST | `/shop/publish` | `200` | `shop:write` | None | — |
| Unpublish Shop | Remove Shop and its synchronized page block without deleting products; the returned overview can refresh stale Stripe status | External Side Effect · Public Change | POST | `/shop/unpublish` | `200` | `shop:write` | None | — |
| Upload or Replace Product File From Binary Input | Reserve, upload and register a protected product file; this replaces the current file and the returned overview can refresh stale Stripe status | Draft or Private Change · Replaces or Deletes Data · External Side Effect | n8n | — | — | `shop:write` | Product ID + binary file field | — |
| Reserve Product File Upload (Advanced) | Create an advanced protected upload reservation for a digital-product file | Draft or Private Change | POST | `/shop/uploads/reserve` | `201` | `shop:write` | Body: Send productId, filename, contentType, and sizeBytes for a digital product. The filename extension must match a supported PDF, ZIP, JPEG, PNG, WebP, GIF, MP4, or WebM content type. | — |
| Finalize or Replace Product File Upload (Advanced) | Register a protected product file after direct upload; this replaces the current file and the returned overview can refresh stale Stripe status | Draft or Private Change · Replaces or Deletes Data · External Side Effect | POST | `/shop/uploads/finalize` | `200` | `shop:write` | Body: Send uploadToken exactly as returned by Reserve Product File Upload. This replaces the product's current file when one exists. | — |
| Cancel Reserved Product File Upload (Advanced) | Cancel an active product-file upload, release its reserved storage and delete its staged object without changing the current product file | Draft or Private Change · Replaces or Deletes Data | DELETE | `/shop/uploads` | `200` | `shop:write` | Body: Send uploadToken exactly as returned by Reserve Product File Upload. The current finalized product file is not changed. | — |

## Newsletter

Manage email delivery, subscribers and newsletter campaigns

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Newsletter Overview | Retrieve subscribers, campaigns and email-delivery status | Read Only | GET | `/newsletter` | `200` | `newsletter:read` | None | — |
| Update Email Delivery Settings | Update encrypted SMTP settings used to send newsletters without sending email | Draft or Private Change | PUT | `/newsletter/settings` | `200` | `newsletter:write` | Body: Send host, port, username, fromName, and fromEmail. Include password on first setup or when changing it; replyTo is optional. | — |
| Send Test Email | Verify the saved email-delivery settings by sending a real test email to the requested recipient | External Side Effect | POST | `/newsletter/settings/test` | `200` | `newsletter:write` | Body: Send recipient with the email address that should receive the real test message. | — |
| Create or Update Subscriber | Add a consented subscriber or update an existing subscriber without sending email | Draft or Private Change | POST | `/newsletter/subscribers` | `201` | `newsletter:write` | Body: Send email and consentConfirmed set to true only after recording consent. Name and source are optional. | — |
| Remove Subscriber | Permanently remove one subscriber from the newsletter audience without sending email | Replaces or Deletes Data | DELETE | `/newsletter/subscribers/{subscriberId}` | `200` | `newsletter:write` | Subscriber ID | — |
| Create or Update Campaign | Create a campaign or update an existing campaign without sending it | Draft or Private Change | POST | `/newsletter/campaigns` | `201` | `newsletter:write` | Body: Send name, subject, and content. Content requires headline, body, accentColor, backgroundColor, and contentColor; add campaignId to update an existing draft. | — |
| Delete Campaign | Permanently delete one newsletter campaign and its delivery records without sending email | Replaces or Deletes Data | DELETE | `/newsletter/campaigns/{campaignId}` | `200` | `newsletter:write` | Campaign ID | — |
| Queue Campaign Now or Schedule Delivery | Queue the campaign for delivery to real recipients now or schedule external email delivery | External Side Effect | POST | `/newsletter/campaigns/{campaignId}/send` | `200` | `newsletter:write` | Campaign ID + Optional body: Leave the body empty, omit scheduledFor, or set scheduledFor to null to send immediately. To schedule, send only scheduledFor as an RFC 3339 date-time string with an explicit Z or numeric timezone offset; additional fields are rejected. | — |
| Cancel Scheduled Campaign | Cancel queued external email delivery; messages already sent cannot be recalled | External Side Effect | DELETE | `/newsletter/campaigns/{campaignId}/send` | `200` | `newsletter:write` | Campaign ID | — |

## Team & Invitations

Manage workspace members, roles and invitations

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Members and Invitations | Retrieve workspace members and pending invitations | Read Only | GET | `/team` | `200` | `team:read` | None | — |
| Create Team Invitation Link | Create a pending workspace invitation and return its relative invitation path once; send it securely because no email is sent | Draft or Private Change | POST | `/team/invitations` | `201` | `team:write` | Body: Send email and role. Supported roles are admin, profile_editor, and analytics_viewer. | — |
| Update Member Role | Change the access role assigned to one workspace member | Draft or Private Change | PATCH | `/team/members/{memberUid}` | `200` | `team:write` | Team Member ID + Body: Send role only. Supported roles are admin, profile_editor, and analytics_viewer. | — |
| Remove Member | Remove one member and revoke their access to the workspace | Replaces or Deletes Data | DELETE | `/team/members/{memberUid}` | `200` | `team:write` | Team Member ID | — |
| Revoke Invitation | Cancel one pending workspace invitation so it can no longer be accepted | Replaces or Deletes Data | DELETE | `/team/invitations/{invitationId}` | `200` | `team:write` | Invitation ID | — |

## Billing & Plans

Read subscription state and open authenticated billing flows

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Plan and Subscription | Retrieve current OrbitPage plan and Stripe subscription status | Read Only | GET | `/billing` | `200` | `billing:read` | None | — |
| Start Plan Checkout | Create an external authenticated Stripe Checkout session for the selected paid plan | External Side Effect | POST | `/billing/checkout` | `200` | `billing:write` | Body: Send planId as starter or pro and a UUID requestId. billingInterval is optional and accepts month or year. | — |
| Create Billing Portal Link | Create a short-lived authenticated Stripe Billing Portal URL | External Side Effect | POST | `/billing/portal` | `200` | `billing:write` | Optional body: Leave empty for the general billing portal. To prepare a plan change, set targetPlanId to free, starter, or pro; billingInterval accepts month or year. | — |
| Redeem Promotion Code and Apply Plan Change | Apply a valid promotion code and reconcile the plan, which can unpublish or republish the public page when entitlements change | External Side Effect · Replaces or Deletes Data · Public Change | POST | `/billing/promotion-code` | `200` | `billing:write` | Body: Send code and a new UUID requestId. | — |

## Backups & Versions

Export backups and restore historical workspace data

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Get Many Published Versions | Retrieve restorable historical versions captured when the page was published | Read Only | GET | `/versions` | `200` | `backup:read` | None | — |
| Restore and Publish Historical Version | Replace the current page with a selected previously published version and publish it immediately | Replaces or Deletes Data · Public Change | POST | `/versions/{revision}/restore` | `200` | `backup:write` | Published Version Number | `/versions` |
| Export Workspace Backup | Download all supported workspace data or selected sections without changing the workspace | Read Only | GET | `/backup` | `200` | `backup:read` | Backup Sections (optional; defaults to all) | — |
| Restore and Publish Workspace Backup | Validate the backup, replace the selected workspace data and publish the restored page immediately | Replaces or Deletes Data · Public Change | POST | `/backup/restore` | `200` | `backup:write` | Body: Send an exported managed backup directly, or place it under backup and optionally add sections from profile, links, theme, privacy, pages, menu, and discovery. Review the selected data before running because the restored result is published immediately. | `/versions` |

## Advanced API

Send custom requests to relative OrbitPage API paths

| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Send Custom API Request | Call a relative public workspace API v1 path using every applicable permission granted to the selected credential; paths outside the public workspace API contract are unavailable | Advanced Request | n8n | — | — | Depends on API path | HTTP method + relative API path | — |

API operations: **65**. n8n convenience operations: **3**.
