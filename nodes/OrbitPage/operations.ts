export type OrbitPageMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type OrbitPageResource =
	| 'workspace'
	| 'links'
	| 'profile'
	| 'theme'
	| 'pages'
	| 'settings'
	| 'publication'
	| 'backup'
	| 'media'
	| 'domains'
	| 'analytics'
	| 'ai'
	| 'shop'
	| 'newsletter'
	| 'team'
	| 'billing'
	| 'operator'
	| 'advanced';

export type PathParameter =
	| 'linkId'
	| 'key'
	| 'revision'
	| 'productId'
	| 'subscriberId'
	| 'campaignId'
	| 'memberUid'
	| 'invitationId'
	| 'prospectId'
	| 'activityId'
	| 'promotionCodeId'
	| 'tenantId';

export type OperationKind = 'api' | 'mediaUpload' | 'shopFileUpload' | 'custom';

type OrbitPageNodeOption = {
	name: string;
	value: string;
	action?: string;
	description?: string;
};

export type OperationSpec = {
	value: string;
	name: string;
	action: string;
	description: string;
	resource: OrbitPageResource;
	kind: OperationKind;
	method?: OrbitPageMethod;
	path?: string;
	scope?: string;
	body?: 'required' | 'optional';
	parameters?: PathParameter[];
	revisionSource?: string;
	publishQuery?: boolean;
};

const api = (
	resource: OrbitPageResource,
	value: string,
	name: string,
	action: string,
	description: string,
	method: OrbitPageMethod,
	path: string,
	scope: string,
	options: Pick<
		OperationSpec,
		'body' | 'parameters' | 'revisionSource' | 'publishQuery'
	> = {},
): OperationSpec => ({
	resource,
	value,
	name,
	action,
	description,
	kind: 'api',
	method,
	path,
	scope,
	...options,
});

export const RESOURCE_OPTIONS: OrbitPageNodeOption[] = [
	{ name: 'AI', value: 'ai' },
	{ name: 'Analytics', value: 'analytics' },
	{ name: 'Backup and Version', value: 'backup' },
	{ name: 'Billing', value: 'billing' },
	{ name: 'Block', value: 'links' },
	{ name: 'Custom Domain', value: 'domains' },
	{ name: 'Media', value: 'media' },
	{ name: 'Newsletter', value: 'newsletter' },
	{ name: 'Operator', value: 'operator' },
	{ name: 'Page', value: 'pages' },
	{ name: 'Profile', value: 'profile' },
	{ name: 'Publication', value: 'publication' },
	{ name: 'Settings', value: 'settings' },
	{ name: 'Shop', value: 'shop' },
	{ name: 'Team', value: 'team' },
	{ name: 'Theme', value: 'theme' },
	{ name: 'Workspace', value: 'workspace' },
	{ name: 'Advanced', value: 'advanced' },
];

export const OPERATION_SPECS: OperationSpec[] = [
	api('workspace', 'getWorkspace', 'Get Workspace', 'Get workspace details', 'Read plan, access, usage and revision for the token-bound workspace.', 'GET', '/workspace', 'workspace:read'),
	api('workspace', 'getDraft', 'Get Complete Draft', 'Get the complete draft', 'Read the complete editable OrbitPage draft.', 'GET', '/draft', 'workspace:read'),

	api('links', 'listLinks', 'Get Many Blocks', 'Get many page blocks', 'List the complete ordered page-block collection and its revision.', 'GET', '/links', 'links:read'),
	api('links', 'replaceLinks', 'Replace Blocks', 'Replace all page blocks', 'Replace the complete ordered block collection. Omitted blocks are removed.', 'PUT', '/links', 'links:write', { body: 'required', revisionSource: '/links' }),
	api('links', 'updateLink', 'Update Block', 'Update a page block', 'Update editable fields on one existing block.', 'PATCH', '/links/{linkId}', 'links:write', { body: 'required', parameters: ['linkId'], revisionSource: '/links' }),

	api('profile', 'getProfile', 'Get Profile', 'Get the profile', 'Read profile identity and metadata.', 'GET', '/profile', 'profile:read'),
	api('profile', 'updateProfile', 'Update Profile', 'Update the profile', 'Update profile fields in the draft.', 'PATCH', '/profile', 'profile:write', { body: 'required', revisionSource: '/profile', publishQuery: true }),

	api('theme', 'getTheme', 'Get Theme', 'Get the theme', 'Read the active draft theme.', 'GET', '/theme', 'theme:read'),
	api('theme', 'replaceTheme', 'Replace Theme', 'Replace the theme', 'Replace the complete draft theme.', 'PUT', '/theme', 'theme:write', { body: 'required', revisionSource: '/theme', publishQuery: true }),

	api('pages', 'listSubpages', 'Get Many Pages', 'Get many pages', 'List configured subpages.', 'GET', '/pages', 'pages:read'),
	api('pages', 'replaceSubpages', 'Replace Pages', 'Replace all pages', 'Replace the configured subpage collection.', 'PUT', '/pages', 'pages:write', { body: 'required', revisionSource: '/pages', publishQuery: true }),

	api('settings', 'getSettings', 'Get Settings', 'Get settings', 'Read menu, privacy, managed text-file and sitemap settings.', 'GET', '/settings', 'settings:read'),
	api('settings', 'updateMenuSettings', 'Update Menu', 'Update menu settings', 'Update the draft menu settings.', 'PUT', '/settings/menu', 'settings:write', { body: 'required', revisionSource: '/settings', publishQuery: true }),
	api('settings', 'updatePrivacySettings', 'Update Privacy', 'Update privacy settings', 'Update consent and privacy settings.', 'PUT', '/settings/privacy', 'settings:write', { body: 'required', revisionSource: '/settings', publishQuery: true }),
	api('settings', 'createTextFile', 'Create Text File', 'Create a managed text file', 'Create a managed public text file.', 'POST', '/settings/text-files', 'settings:write', { body: 'required', revisionSource: '/settings' }),
	api('settings', 'updateTextFile', 'Update Text File', 'Update a managed text file', 'Update a managed public text file.', 'PUT', '/settings/text-files/{key}', 'settings:write', { body: 'required', parameters: ['key'], revisionSource: '/settings' }),
	api('settings', 'deleteTextFile', 'Delete Text File', 'Delete a managed text file', 'Delete a managed public text file.', 'DELETE', '/settings/text-files/{key}', 'settings:write', { parameters: ['key'], revisionSource: '/settings' }),
	api('settings', 'generateSitemap', 'Generate Sitemap', 'Generate the sitemap', 'Regenerate the managed sitemap.', 'POST', '/settings/sitemap', 'settings:write', { revisionSource: '/settings' }),

	api('publication', 'getPublication', 'Get Publication Status', 'Get publication status', 'Read draft revision, published revision, public URL and publication status.', 'GET', '/publication', 'publication:read'),
	api('publication', 'publishPage', 'Publish Page', 'Publish the page', 'Publish the latest validated draft.', 'POST', '/publication', 'publication:write'),

	api('backup', 'listVersions', 'Get Many Versions', 'Get many page versions', 'List restorable page versions.', 'GET', '/versions', 'backup:read'),
	api('backup', 'restoreVersion', 'Restore Version', 'Restore a page version', 'Restore a selected page version into the current draft.', 'POST', '/versions/{revision}/restore', 'backup:write', { parameters: ['revision'], revisionSource: '/draft' }),
	api('backup', 'exportBackup', 'Export Backup', 'Export a workspace backup', 'Export all or selected managed workspace sections.', 'GET', '/backup', 'backup:read'),
	api('backup', 'restoreBackup', 'Restore Backup', 'Restore a workspace backup', 'Validate and restore a managed backup.', 'POST', '/backup/restore', 'backup:write', { body: 'required', revisionSource: '/draft' }),

	api('media', 'listMedia', 'Get Many Media Items', 'Get many media items', 'List workspace media metadata and current storage usage.', 'GET', '/media', 'media:read'),
	api('media', 'cleanupMedia', 'Clean Up Media', 'Clean up unused media', 'Preview or delete unreferenced workspace media.', 'POST', '/media/cleanup', 'media:write', { body: 'optional' }),
	api('media', 'reserveMediaUpload', 'Reserve Video Upload', 'Reserve a video upload', 'Reserve a direct MP4 or WebM upload.', 'POST', '/media/uploads/reserve', 'media:write', { body: 'required' }),
	api('media', 'finalizeMediaUpload', 'Finalize Video Upload', 'Finalize a video upload', 'Finalize and register a directly uploaded video object.', 'POST', '/media/uploads/finalize', 'media:write', { body: 'required' }),
	api('media', 'abortMediaUpload', 'Abort Video Upload', 'Abort a video upload', 'Abort an active direct-upload reservation.', 'DELETE', '/media/uploads', 'media:write', { body: 'required' }),
	{ resource: 'media', value: 'uploadMediaBinary', name: 'Upload Video Binary', action: 'Upload a video binary', description: 'Reserve, upload and finalize an n8n MP4 or WebM binary in one operation', kind: 'mediaUpload' },

	api('domains', 'getDomain', 'Get Domain', 'Get the custom domain', 'Read custom-domain state and DNS requirements.', 'GET', '/domains', 'domains:read'),
	api('domains', 'connectDomain', 'Connect Domain', 'Connect a custom domain', 'Connect a custom hostname to the workspace.', 'POST', '/domains', 'domains:write', { body: 'required' }),
	api('domains', 'refreshDomain', 'Refresh Domain', 'Refresh domain verification', 'Refresh domain verification and activation.', 'POST', '/domains/refresh', 'domains:write'),
	api('domains', 'disconnectDomain', 'Disconnect Domain', 'Disconnect the custom domain', 'Disconnect the current custom domain.', 'DELETE', '/domains', 'domains:write'),

	api('analytics', 'getAnalytics', 'Get Analytics', 'Get analytics', 'Read the plan-bounded dashboard analytics report.', 'GET', '/analytics', 'analytics:read'),

	api('ai', 'getAiAllowance', 'Get Allowance', 'Get the AI allowance', 'Read AI allowance and current usage.', 'GET', '/ai/allowance', 'ai:read'),
	api('ai', 'planAiChanges', 'Plan Changes', 'Plan AI changes', 'Generate a validated AI page-change preview without mutating the page.', 'POST', '/ai/plan', 'ai:write', { body: 'required' }),
	api('ai', 'commitAiChanges', 'Commit Changes', 'Commit AI changes', 'Commit a previously validated AI preview.', 'POST', '/ai/commit', 'ai:write', { body: 'required' }),

	api('shop', 'getShop', 'Get Shop', 'Get the Shop dashboard', 'Read products, commerce status and appearance.', 'GET', '/shop', 'shop:read'),
	api('shop', 'connectShop', 'Connect Shop', 'Connect Shop to Stripe', 'Create or continue Stripe Connect onboarding.', 'POST', '/shop/connect', 'shop:write', { body: 'optional' }),
	api('shop', 'saveShopProduct', 'Save Product', 'Create or update a Shop product', 'Create or update a digital or service product.', 'POST', '/shop/products', 'shop:write', { body: 'required' }),
	api('shop', 'deleteShopProduct', 'Delete Product', 'Delete a Shop product', 'Delete a Shop product.', 'DELETE', '/shop/products/{productId}', 'shop:write', { parameters: ['productId'] }),
	api('shop', 'updateShopAppearance', 'Update Appearance', 'Update Shop appearance', 'Update Shop appearance settings.', 'PUT', '/shop/appearance', 'shop:write', { body: 'required' }),
	api('shop', 'publishShop', 'Publish Shop', 'Publish Shop', 'Publish Shop and its synchronized page block.', 'POST', '/shop/publish', 'shop:write'),
	api('shop', 'unpublishShop', 'Unpublish Shop', 'Unpublish Shop', 'Unpublish Shop.', 'POST', '/shop/unpublish', 'shop:write'),
	api('shop', 'reserveShopUpload', 'Reserve File Upload', 'Reserve a Shop file upload', 'Reserve a protected file upload for a digital product.', 'POST', '/shop/uploads/reserve', 'shop:write', { body: 'required' }),
	api('shop', 'finalizeShopUpload', 'Finalize File Upload', 'Finalize a Shop file upload', 'Finalize a protected digital-product file upload.', 'POST', '/shop/uploads/finalize', 'shop:write', { body: 'required' }),
	{ resource: 'shop', value: 'uploadShopFileBinary', name: 'Upload Product File Binary', action: 'Upload a product file binary', description: 'Reserve, upload and finalize an n8n binary for a digital product in one operation', kind: 'shopFileUpload' },

	api('newsletter', 'getNewsletter', 'Get Newsletter', 'Get the newsletter dashboard', 'Read subscribers, campaigns and SMTP state.', 'GET', '/newsletter', 'newsletter:read'),
	api('newsletter', 'updateNewsletterSettings', 'Update SMTP Settings', 'Update SMTP settings', 'Update encrypted newsletter SMTP settings.', 'PUT', '/newsletter/settings', 'newsletter:write', { body: 'required' }),
	api('newsletter', 'testNewsletter', 'Test SMTP Settings', 'Test SMTP settings', 'Send a newsletter configuration test.', 'POST', '/newsletter/settings/test', 'newsletter:write', { body: 'required' }),
	api('newsletter', 'addNewsletterSubscriber', 'Add Subscriber', 'Add a subscriber', 'Add or update a consented subscriber.', 'POST', '/newsletter/subscribers', 'newsletter:write', { body: 'required' }),
	api('newsletter', 'removeNewsletterSubscriber', 'Remove Subscriber', 'Remove a subscriber', 'Remove a newsletter subscriber.', 'DELETE', '/newsletter/subscribers/{subscriberId}', 'newsletter:write', { parameters: ['subscriberId'] }),
	api('newsletter', 'saveNewsletterCampaign', 'Save Campaign', 'Create or update a campaign', 'Create or update a newsletter campaign.', 'POST', '/newsletter/campaigns', 'newsletter:write', { body: 'required' }),
	api('newsletter', 'deleteNewsletterCampaign', 'Delete Campaign', 'Delete a campaign', 'Delete a newsletter campaign.', 'DELETE', '/newsletter/campaigns/{campaignId}', 'newsletter:write', { parameters: ['campaignId'] }),
	api('newsletter', 'sendNewsletterCampaign', 'Send or Schedule Campaign', 'Send or schedule a campaign', 'Queue immediately or schedule a newsletter campaign.', 'POST', '/newsletter/campaigns/{campaignId}/send', 'newsletter:write', { body: 'optional', parameters: ['campaignId'] }),
	api('newsletter', 'cancelNewsletterCampaign', 'Cancel Campaign', 'Cancel a campaign', 'Cancel a queued newsletter campaign.', 'DELETE', '/newsletter/campaigns/{campaignId}/send', 'newsletter:write', { parameters: ['campaignId'] }),

	api('team', 'getTeam', 'Get Team', 'Get the team', 'List workspace members and pending invitations.', 'GET', '/team', 'team:read'),
	api('team', 'createTeamInvitation', 'Invite Member', 'Invite a team member', 'Invite a workspace collaborator.', 'POST', '/team/invitations', 'team:write', { body: 'required' }),
	api('team', 'updateTeamMember', 'Update Member', 'Update a team member', 'Update a member role.', 'PATCH', '/team/members/{memberUid}', 'team:write', { body: 'required', parameters: ['memberUid'] }),
	api('team', 'removeTeamMember', 'Remove Member', 'Remove a team member', 'Remove a workspace member.', 'DELETE', '/team/members/{memberUid}', 'team:write', { parameters: ['memberUid'] }),
	api('team', 'revokeTeamInvitation', 'Revoke Invitation', 'Revoke an invitation', 'Revoke a pending workspace invitation.', 'DELETE', '/team/invitations/{invitationId}', 'team:write', { parameters: ['invitationId'] }),

	api('billing', 'getBilling', 'Get Billing', 'Get billing', 'Read plan and subscription state.', 'GET', '/billing', 'billing:read'),
	api('billing', 'createCheckout', 'Create Checkout', 'Create a billing checkout', 'Create an authenticated Stripe plan checkout.', 'POST', '/billing/checkout', 'billing:write', { body: 'required' }),
	api('billing', 'createBillingPortal', 'Create Portal Session', 'Create a billing portal session', 'Create an authenticated Stripe billing-portal session.', 'POST', '/billing/portal', 'billing:write', { body: 'optional' }),
	api('billing', 'redeemPromotionCode', 'Redeem Promotion Code', 'Redeem a promotion code', 'Redeem an OrbitPage promotion code.', 'POST', '/billing/promotion-code', 'billing:write', { body: 'required' }),

	api('operator', 'getOperatorOverview', 'Get Overview', 'Get the operator overview', 'Read platform health, tenants and operational activity.', 'GET', '/operator/overview', 'operator:read'),
	api('operator', 'listCrmProspects', 'Get Many CRM Prospects', 'Get many CRM prospects', 'List and search CRM prospects.', 'GET', '/operator/crm', 'operator:read'),
	api('operator', 'createCrmProspect', 'Create CRM Prospect', 'Create a CRM prospect', 'Create a CRM prospect.', 'POST', '/operator/crm', 'operator:write', { body: 'required' }),
	api('operator', 'getCrmProspect', 'Get CRM Prospect', 'Get a CRM prospect', 'Read a CRM prospect and its activity.', 'GET', '/operator/crm/{prospectId}', 'operator:read', { parameters: ['prospectId'] }),
	api('operator', 'updateCrmProspect', 'Update CRM Prospect', 'Update a CRM prospect', 'Update a CRM prospect with CRM revision control.', 'PATCH', '/operator/crm/{prospectId}', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'saveCrmNote', 'Save CRM Note', 'Save a CRM note', 'Create, update or archive a CRM note.', 'POST', '/operator/crm/{prospectId}/notes', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'saveCrmMessage', 'Save CRM Message', 'Save a CRM message', 'Create or update a CRM message.', 'POST', '/operator/crm/{prospectId}/messages', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'updateCrmActivity', 'Update CRM Activity', 'Update a CRM activity', 'Update a CRM activity.', 'PATCH', '/operator/crm/{prospectId}/activities/{activityId}', 'operator:write', { body: 'required', parameters: ['prospectId', 'activityId'] }),
	api('operator', 'linkCrmWorkspace', 'Link CRM Workspace', 'Link a CRM workspace', 'Link or unlink a prepared workspace.', 'POST', '/operator/crm/{prospectId}/link', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'onboardCrmProspect', 'Onboard CRM Prospect', 'Onboard a CRM prospect', 'Complete audited prospect onboarding.', 'POST', '/operator/crm/{prospectId}/onboard', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'previewCrmAccountEmail', 'Preview Account Email', 'Preview an account email', 'Preview a CRM account email.', 'GET', '/operator/crm/{prospectId}/account-email', 'operator:read', { parameters: ['prospectId'] }),
	api('operator', 'sendCrmAccountEmail', 'Send Account Email', 'Send an account email', 'Send an audited CRM account email.', 'POST', '/operator/crm/{prospectId}/account-email', 'operator:write', { body: 'required', parameters: ['prospectId'] }),
	api('operator', 'listOperatorPromotionCodes', 'Get Many Promotion Codes', 'Get many promotion codes', 'List operator promotion codes.', 'GET', '/operator/promotion-codes', 'operator:read'),
	api('operator', 'createOperatorPromotionCode', 'Create Promotion Code', 'Create a promotion code', 'Create an audited promotion code.', 'POST', '/operator/promotion-codes', 'operator:write', { body: 'required' }),
	api('operator', 'updateOperatorPromotionCode', 'Update Promotion Code', 'Update a promotion code', 'Activate or deactivate a promotion code.', 'PATCH', '/operator/promotion-codes/{promotionCodeId}', 'operator:write', { body: 'required', parameters: ['promotionCodeId'] }),
	api('operator', 'moderateTenant', 'Moderate Tenant', 'Moderate a tenant', 'Suspend or reactivate a tenant.', 'POST', '/operator/tenants/{tenantId}/moderation', 'operator:write', { body: 'required', parameters: ['tenantId'] }),
	api('operator', 'changeTenantPlan', 'Change Tenant Plan', 'Change a tenant plan', 'Grant a complimentary tenant plan.', 'POST', '/operator/tenants/{tenantId}/plan', 'operator:write', { body: 'required', parameters: ['tenantId'] }),
	api('operator', 'createTenantDemoAccess', 'Create Demo Access', 'Create tenant demo access', 'Create protected prospect demo access.', 'POST', '/operator/tenants/{tenantId}/demo-access', 'operator:write', { body: 'required', parameters: ['tenantId'] }),
	api('operator', 'revokeTenantDemoAccess', 'Revoke Demo Access', 'Revoke tenant demo access', 'Revoke prospect demo access.', 'DELETE', '/operator/tenants/{tenantId}/demo-access', 'operator:write', { body: 'required', parameters: ['tenantId'] }),
	api('operator', 'deleteTenant', 'Delete Tenant', 'Permanently delete a tenant', 'Permanently delete a tenant after exact confirmation.', 'DELETE', '/operator/tenants/{tenantId}', 'operator:write', { body: 'required', parameters: ['tenantId'] }),

	{ resource: 'advanced', value: 'customRequest', name: 'Custom API Request', action: 'Make a custom API request', description: 'Call a relative OrbitPage API v1 path while keeping authentication in the credential', kind: 'custom' },
];

export const API_OPERATION_SPECS = OPERATION_SPECS.filter(
	(spec): spec is OperationSpec & { kind: 'api'; method: OrbitPageMethod; path: string } =>
		spec.kind === 'api' && Boolean(spec.method) && Boolean(spec.path),
);

export function operationSpec(value: string): OperationSpec | undefined {
	return OPERATION_SPECS.find((spec) => spec.value === value);
}

export function operationsForResource(resource: string): OrbitPageNodeOption[] {
	return OPERATION_SPECS.filter((spec) => spec.resource === resource).map((spec) => ({
		name: spec.name,
		value: spec.value,
		action: spec.action,
		description: spec.description,
	}));
}
