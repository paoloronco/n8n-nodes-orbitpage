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
	| 'advanced';

export type PathParameter =
	| 'linkId'
	| 'key'
	| 'revision'
	| 'productId'
	| 'subscriberId'
	| 'campaignId'
	| 'memberUid'
	| 'invitationId';

export type OperationKind = 'api' | 'mediaUpload' | 'shopFileUpload' | 'custom';
export type OperationEffect =
	| 'read'
	| 'draft'
	| 'public'
	| 'external'
	| 'destructive'
	| 'advanced';
export type OperationEffects = OperationEffect | readonly OperationEffect[];
export type OperationQueryParameter =
	| 'days'
	| 'sections'
	| 'refresh';

export const OPERATION_EFFECT_LABELS: Record<OperationEffect, string> = {
	read: 'Read Only',
	draft: 'Draft or Private Change',
	public: 'Public Change',
	external: 'External Side Effect',
	destructive: 'Replaces or Deletes Data',
	advanced: 'Advanced Request',
};

export function operationEffectLabel(effect: OperationEffects): string {
	const effects = typeof effect === 'string' ? [effect] : effect;
	return effects.map((item) => OPERATION_EFFECT_LABELS[item]).join(' · ');
}

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
	effect: OperationEffects;
	method?: OrbitPageMethod;
	path?: string;
	scope?: string;
	body?: 'required' | 'optional';
	parameters?: PathParameter[];
	queryParameters?: OperationQueryParameter[];
	revisionSource?: string;
	publishQuery?: boolean;
	successStatus?: 200 | 201;
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
	options: Partial<
		Pick<
			OperationSpec,
			| 'body'
			| 'parameters'
			| 'queryParameters'
			| 'revisionSource'
			| 'publishQuery'
			| 'successStatus'
			| 'effect'
		>
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
	effect: method === 'GET' ? 'read' : 'draft',
	successStatus: 200,
	...options,
});

export const RESOURCE_OPTIONS: OrbitPageNodeOption[] = [
	{
		name: 'Workspace & Draft',
		value: 'workspace',
		description: 'Read workspace access, usage and the complete editable page draft',
	},
	{
		name: 'Profile',
		value: 'profile',
		description: 'Read and update the identity shown on the public page',
	},
	{
		name: 'Page Content (Blocks)',
		value: 'links',
		description: 'Read and manage the ordered blocks shown on the main page',
	},
	{
		name: 'Subpages',
		value: 'pages',
		description: 'Read and replace the configured subpage collection',
	},
	{ name: 'Theme', value: 'theme', description: 'Read and replace the page theme' },
	{
		name: 'Page Settings',
		value: 'settings',
		description: 'Manage menus, privacy, public text files and sitemap settings',
	},
	{
		name: 'Publication',
		value: 'publication',
		description: 'Review publication status and publish validated drafts',
	},
	{
		name: 'Media Library',
		value: 'media',
		description: 'Manage workspace media and direct video uploads',
	},
	{
		name: 'Custom Domain & DNS',
		value: 'domains',
		description: 'Connect, verify or disconnect the workspace custom domain',
	},
	{
		name: 'Analytics',
		value: 'analytics',
		description: 'Read the plan-bounded workspace analytics report',
	},
	{
		name: 'AI Page Editing',
		value: 'ai',
		description: 'Review AI usage, preview page changes and apply an approved preview',
	},
	{
		name: 'Shop',
		value: 'shop',
		description: 'Manage products, files, appearance, Stripe connection and Shop publication',
	},
	{
		name: 'Newsletter',
		value: 'newsletter',
		description: 'Manage email delivery, subscribers and newsletter campaigns',
	},
	{
		name: 'Team & Invitations',
		value: 'team',
		description: 'Manage workspace members, roles and invitations',
	},
	{
		name: 'Billing & Plans',
		value: 'billing',
		description: 'Read subscription state and open authenticated billing flows',
	},
	{
		name: 'Backups & Versions',
		value: 'backup',
		description: 'Export backups and restore historical workspace data',
	},
	{
		name: 'Advanced API',
		value: 'advanced',
		description: 'Send custom requests to relative OrbitPage API paths',
	},
];

export const OPERATION_SPECS: OperationSpec[] = [
	api(
		'workspace',
		'getWorkspace',
		'Get Workspace Overview',
		'Get workspace overview',
		'Retrieve plan, access, usage and current revision for the connected workspace',
		'GET',
		'/workspace',
		'workspace:read',
	),
	api(
		'workspace',
		'getDraft',
		'Get Full Page Draft',
		'Get full page draft',
		'Retrieve all editable OrbitPage page data in one response',
		'GET',
		'/draft',
		'workspace:read',
	),

	api(
		'profile',
		'getProfile',
		'Get Profile Draft',
		'Get profile draft',
		'Retrieve profile identity and metadata from the page draft',
		'GET',
		'/profile',
		'profile:read',
	),
	api(
		'profile',
		'updateProfile',
		'Update Profile Draft',
		'Update profile draft',
		'Update profile fields in the draft; Publish Changes Immediately can publish the changes to the public page',
		'PATCH',
		'/profile',
		'profile:write',
		{
			body: 'required',
			revisionSource: '/profile',
			publishQuery: true,
			effect: ['draft', 'public'],
		},
	),

	api(
		'links',
		'listLinks',
		'Get Many Content Blocks',
		'Get many content blocks',
		'Retrieve the complete ordered page-block collection and its current revision',
		'GET',
		'/links',
		'links:read',
	),
	api(
		'links',
		'replaceLinks',
		'Replace All Content Blocks',
		'Replace all content blocks',
		'Replace every page block, delete blocks omitted from the request, validate the collection and publish it immediately',
		'PUT',
		'/links',
		'links:write',
		{ body: 'required', revisionSource: '/links', effect: ['destructive', 'public'] },
	),
	api(
		'links',
		'updateLink',
		'Update One Content Block',
		'Update one content block',
		'Update one page block, validate the change and publish it immediately',
		'PATCH',
		'/links/{linkId}',
		'links:write',
		{ body: 'required', parameters: ['linkId'], revisionSource: '/links', effect: 'public' },
	),

	api(
		'pages',
		'listSubpages',
		'Get Many Subpages',
		'Get many subpages',
		'Retrieve all configured subpages',
		'GET',
		'/pages',
		'pages:read',
	),
	api(
		'pages',
		'replaceSubpages',
		'Replace All Subpages',
		'Replace all subpages',
		'Replace the complete subpage collection; omitted subpages are deleted, and Publish Changes Immediately can publish the replacement',
		'PUT',
		'/pages',
		'pages:write',
		{
			body: 'required',
			revisionSource: '/pages',
			publishQuery: true,
			effect: ['draft', 'destructive', 'public'],
		},
	),

	api(
		'theme',
		'getTheme',
		'Get Theme Draft',
		'Get theme draft',
		'Retrieve the active draft theme',
		'GET',
		'/theme',
		'theme:read',
	),
	api(
		'theme',
		'replaceTheme',
		'Replace Entire Theme Draft',
		'Replace entire theme draft',
		'Replace the complete draft theme; previous theme settings are overwritten, and Publish Changes Immediately can publish the replacement',
		'PUT',
		'/theme',
		'theme:write',
		{
			body: 'required',
			revisionSource: '/theme',
			publishQuery: true,
			effect: ['draft', 'destructive', 'public'],
		},
	),

	api(
		'settings',
		'getSettings',
		'Get Page Settings',
		'Get page settings',
		'Retrieve menu, privacy, managed public text file and sitemap settings',
		'GET',
		'/settings',
		'settings:read',
	),
	api(
		'settings',
		'updateMenuSettings',
		'Replace Entire Menu Settings',
		'Replace entire menu settings',
		'Replace the complete draft menu settings; omitted values can reset, and Publish Changes Immediately can publish the replacement',
		'PUT',
		'/settings/menu',
		'settings:write',
		{
			body: 'required',
			revisionSource: '/settings',
			publishQuery: true,
			effect: ['draft', 'destructive', 'public'],
		},
	),
	api(
		'settings',
		'updatePrivacySettings',
		'Replace All Privacy and Consent Settings',
		'Replace all privacy and consent settings',
		'Replace the complete consent and privacy settings; omitted values can reset, and Publish Changes Immediately can publish the replacement',
		'PUT',
		'/settings/privacy',
		'settings:write',
		{
			body: 'required',
			revisionSource: '/settings',
			publishQuery: true,
			effect: ['draft', 'destructive', 'public'],
		},
	),
	api(
		'settings',
		'createTextFile',
		'Create Public Text File',
		'Create public text file',
		'Create a managed text file and update its public URL immediately',
		'POST',
		'/settings/text-files',
		'settings:write',
		{ body: 'required', revisionSource: '/settings', effect: 'public', successStatus: 201 },
	),
	api(
		'settings',
		'updateTextFile',
		'Replace Public Text File',
		'Replace public text file',
		'Replace one managed text file and update its public URL immediately',
		'PUT',
		'/settings/text-files/{key}',
		'settings:write',
		{
			body: 'required',
			parameters: ['key'],
			revisionSource: '/settings',
			effect: 'public',
		},
	),
	api(
		'settings',
		'deleteTextFile',
		'Delete Public Text File',
		'Delete public text file',
		'Delete or reset one managed text file and update its public URL immediately',
		'DELETE',
		'/settings/text-files/{key}',
		'settings:write',
		{
			parameters: ['key'],
			revisionSource: '/settings',
			effect: ['destructive', 'public'],
		},
	),
	api(
		'settings',
		'generateSitemap',
		'Regenerate Sitemap',
		'Regenerate sitemap',
		'Rebuild the managed public sitemap from current page content',
		'POST',
		'/settings/sitemap',
		'settings:write',
		{ revisionSource: '/settings', effect: 'public' },
	),

	api(
		'publication',
		'getPublication',
		'Get Draft and Publication Status',
		'Get draft and publication status',
		'Retrieve draft revision, published revision, public URL and current publication status',
		'GET',
		'/publication',
		'publication:read',
	),
	api(
		'publication',
		'publishPage',
		'Publish Current Draft',
		'Publish current page draft',
		'Validate and publish the latest page draft to the public URL',
		'POST',
		'/publication',
		'publication:write',
		{ effect: 'public' },
	),

	api(
		'media',
		'listMedia',
		'Get Many Media Items',
		'Get many media items',
		'Retrieve workspace media metadata and current storage usage',
		'GET',
		'/media',
		'media:read',
	),
	api(
		'media',
		'cleanupMedia',
		'Preview or Delete Unused Media',
		'Preview or delete unused media',
		'Preview unused media or permanently delete it when deletion is requested; this does not publish the page',
		'POST',
		'/media/cleanup',
		'media:write',
		{ body: 'optional', effect: ['read', 'destructive'] },
	),
	{
		resource: 'media',
		value: 'uploadMediaBinary',
		name: 'Upload or Replace Video From Binary Input',
		action: 'Upload or replace video from binary input',
		description:
			'Reserve, upload and register an MP4 or WebM video from an n8n binary field; reusing a slot replaces its current video without publishing the page',
		kind: 'mediaUpload',
		effect: ['draft', 'destructive'],
		scope: 'media:write',
	},
	api(
		'media',
		'reserveMediaUpload',
		'Reserve Video Upload (Advanced)',
		'Reserve video upload',
		'Create an advanced direct-upload reservation for an MP4 or WebM video',
		'POST',
		'/media/uploads/reserve',
		'media:write',
		{ body: 'required', successStatus: 201 },
	),
	api(
		'media',
		'finalizeMediaUpload',
		'Finalize Reserved Video Upload (Advanced)',
		'Finalize reserved video upload',
		'Register a video after an advanced direct upload succeeds; reusing a slot replaces its current video',
		'POST',
		'/media/uploads/finalize',
		'media:write',
		{ body: 'required', effect: ['draft', 'destructive'] },
	),
	api(
		'media',
		'abortMediaUpload',
		'Cancel Reserved Video Upload (Advanced)',
		'Cancel reserved video upload',
		'Discard an active direct-upload reservation and delete its staged video without publishing the page',
		'DELETE',
		'/media/uploads',
		'media:write',
		{ body: 'required', effect: ['draft', 'destructive'] },
	),

	api(
		'domains',
		'getDomain',
		'Get Domain Status and DNS Instructions',
		'Get domain status and DNS instructions',
		'Retrieve the current custom domain, DNS requirements and verification status',
		'GET',
		'/domains',
		'domains:read',
	),
	api(
		'domains',
		'connectDomain',
		'Connect Custom Domain',
		'Connect custom domain',
		'Connect a custom hostname, start external DNS verification and activate the public route immediately when already verified',
		'POST',
		'/domains',
		'domains:write',
		{ body: 'required', effect: ['external', 'public'], successStatus: 201 },
	),
	api(
		'domains',
		'refreshDomain',
		'Recheck Domain Verification',
		'Recheck domain verification',
		'Refresh external DNS verification and activate the public custom domain when requirements are satisfied',
		'POST',
		'/domains/refresh',
		'domains:write',
		{ effect: ['external', 'public'] },
	),
	api(
		'domains',
		'disconnectDomain',
		'Disconnect Custom Domain',
		'Disconnect custom domain',
		'Disconnect the current custom domain so it stops serving the public page',
		'DELETE',
		'/domains',
		'domains:write',
		{ effect: ['destructive', 'external', 'public'] },
	),

	api(
		'analytics',
		'getAnalytics',
		'Get Analytics Report',
		'Get analytics report',
		'Retrieve dashboard analytics for the selected reporting window, limited by the workspace plan',
		'GET',
		'/analytics',
		'analytics:read',
		{ queryParameters: ['days'] },
	),

	api(
		'ai',
		'getAiAllowance',
		'Get AI Usage and Allowance',
		'Get AI usage and allowance',
		'Retrieve current AI request usage and remaining allowance',
		'GET',
		'/ai/allowance',
		'ai:read',
	),
	api(
		'ai',
		'planAiChanges',
		'Preview AI Page Changes',
		'Preview AI page changes',
		'Use the external AI service, consume allowance and store a private validated preview without changing or publishing the page',
		'POST',
		'/ai/plan',
		'ai:write',
		{ body: 'required', effect: ['draft', 'external'] },
	),
	api(
		'ai',
		'commitAiChanges',
		'Apply Previewed AI Changes',
		'Apply previewed AI changes',
		'Apply a previously validated AI preview to the draft; the preview can replace or remove content and publishes only when the reviewed request explicitly authorizes publication',
		'POST',
		'/ai/commit',
		'ai:write',
		{ body: 'required', effect: ['draft', 'destructive', 'public'] },
	),

	api(
		'shop',
		'getShop',
		'Get Shop Overview',
		'Get Shop overview',
		'Retrieve products, orders, customers, publication status and appearance; this can initialize private Shop state and refresh cached Stripe status',
		'GET',
		'/shop',
		'shop:read',
		{ queryParameters: ['refresh'], effect: ['read', 'draft', 'external'] },
	),
	api(
		'shop',
		'connectShop',
		'Start or Continue Stripe Setup',
		'Start or continue Stripe setup',
		'Create or continue external Stripe Connect onboarding without publishing Shop',
		'POST',
		'/shop/connect',
		'shop:write',
		{ effect: 'external' },
	),
	api(
		'shop',
		'saveShopProduct',
		'Create or Update Product',
		'Create or update Shop product',
		'Create a product or replace all editable fields of an existing product; changing its type can detach a protected file, an already published Shop is republished, and the returned overview can refresh stale Stripe status',
		'POST',
		'/shop/products',
		'shop:write',
		{
			body: 'required',
			effect: ['draft', 'destructive', 'external', 'public'],
			successStatus: 201,
		},
	),
	api(
		'shop',
		'deleteShopProduct',
		'Delete Product',
		'Delete Shop product',
		'Permanently delete a product; an already published Shop is republished, and the returned overview can refresh stale Stripe status',
		'DELETE',
		'/shop/products/{productId}',
		'shop:write',
		{ parameters: ['productId'], effect: ['destructive', 'external', 'public'] },
	),
	api(
		'shop',
		'updateShopAppearance',
		'Replace Entire Shop Appearance',
		'Replace entire Shop appearance',
		'Replace the complete appearance; omitted values use defaults, an already published Shop is republished, and the returned overview can refresh stale Stripe status',
		'PUT',
		'/shop/appearance',
		'shop:write',
		{ body: 'required', effect: ['draft', 'destructive', 'external', 'public'] },
	),
	api(
		'shop',
		'publishShop',
		'Publish Shop',
		'Publish Shop',
		'Check current Stripe readiness, then publish Shop and its synchronized page block for visitors',
		'POST',
		'/shop/publish',
		'shop:write',
		{ effect: ['external', 'public'] },
	),
	api(
		'shop',
		'unpublishShop',
		'Unpublish Shop',
		'Unpublish Shop',
		'Remove Shop and its synchronized page block without deleting products; the returned overview can refresh stale Stripe status',
		'POST',
		'/shop/unpublish',
		'shop:write',
		{ effect: ['external', 'public'] },
	),
	{
		resource: 'shop',
		value: 'uploadShopFileBinary',
		name: 'Upload or Replace Product File From Binary Input',
		action: 'Upload or replace Shop product file from binary input',
		description:
			"Reserve, upload and register a protected product file; this replaces the current file and the returned overview can refresh stale Stripe status",
		kind: 'shopFileUpload',
		effect: ['draft', 'destructive', 'external'],
		scope: 'shop:write',
	},
	api(
		'shop',
		'reserveShopUpload',
		'Reserve Product File Upload (Advanced)',
		'Reserve product file upload',
		'Create an advanced protected upload reservation for a digital-product file',
		'POST',
		'/shop/uploads/reserve',
		'shop:write',
		{ body: 'required', successStatus: 201 },
	),
	api(
		'shop',
		'finalizeShopUpload',
		'Finalize or Replace Product File Upload (Advanced)',
		'Finalize or replace product file upload',
		"Register a protected product file after direct upload; this replaces the current file and the returned overview can refresh stale Stripe status",
		'POST',
		'/shop/uploads/finalize',
		'shop:write',
		{ body: 'required', effect: ['draft', 'destructive', 'external'] },
	),
	api(
		'shop',
		'abortShopUpload',
		'Cancel Reserved Product File Upload (Advanced)',
		'Cancel reserved Shop product file upload',
		'Cancel an active product-file upload, release its reserved storage and delete its staged object without changing the current product file',
		'DELETE',
		'/shop/uploads',
		'shop:write',
		{ body: 'required', effect: ['draft', 'destructive'] },
	),

	api(
		'newsletter',
		'getNewsletter',
		'Get Newsletter Overview',
		'Get newsletter overview',
		'Retrieve subscribers, campaigns and email-delivery status',
		'GET',
		'/newsletter',
		'newsletter:read',
	),
	api(
		'newsletter',
		'updateNewsletterSettings',
		'Update Email Delivery Settings',
		'Update newsletter email delivery settings',
		'Update encrypted SMTP settings used to send newsletters without sending email',
		'PUT',
		'/newsletter/settings',
		'newsletter:write',
		{ body: 'required' },
	),
	api(
		'newsletter',
		'testNewsletter',
		'Send Test Email',
		'Send newsletter test email',
		'Verify the saved email-delivery settings by sending a real test email to the requested recipient',
		'POST',
		'/newsletter/settings/test',
		'newsletter:write',
		{ body: 'required', effect: 'external' },
	),
	api(
		'newsletter',
		'addNewsletterSubscriber',
		'Create or Update Subscriber',
		'Create or update newsletter subscriber',
		'Add a consented subscriber or update an existing subscriber without sending email',
		'POST',
		'/newsletter/subscribers',
		'newsletter:write',
		{ body: 'required', successStatus: 201 },
	),
	api(
		'newsletter',
		'removeNewsletterSubscriber',
		'Remove Subscriber',
		'Remove newsletter subscriber',
		'Permanently remove one subscriber from the newsletter audience without sending email',
		'DELETE',
		'/newsletter/subscribers/{subscriberId}',
		'newsletter:write',
		{ parameters: ['subscriberId'], effect: 'destructive' },
	),
	api(
		'newsletter',
		'saveNewsletterCampaign',
		'Create or Update Campaign',
		'Create or update newsletter campaign',
		'Create a campaign or update an existing campaign without sending it',
		'POST',
		'/newsletter/campaigns',
		'newsletter:write',
		{ body: 'required', successStatus: 201 },
	),
	api(
		'newsletter',
		'deleteNewsletterCampaign',
		'Delete Campaign',
		'Delete newsletter campaign',
		'Permanently delete one newsletter campaign and its delivery records without sending email',
		'DELETE',
		'/newsletter/campaigns/{campaignId}',
		'newsletter:write',
		{ parameters: ['campaignId'], effect: 'destructive' },
	),
	api(
		'newsletter',
		'sendNewsletterCampaign',
		'Queue Campaign Now or Schedule Delivery',
		'Queue newsletter campaign now or schedule delivery',
		'Queue the campaign for delivery to real recipients now or schedule external email delivery',
		'POST',
		'/newsletter/campaigns/{campaignId}/send',
		'newsletter:write',
		{ body: 'optional', parameters: ['campaignId'], effect: 'external' },
	),
	api(
		'newsletter',
		'cancelNewsletterCampaign',
		'Cancel Scheduled Campaign',
		'Cancel scheduled newsletter campaign',
		'Cancel queued external email delivery; messages already sent cannot be recalled',
		'DELETE',
		'/newsletter/campaigns/{campaignId}/send',
		'newsletter:write',
		{ parameters: ['campaignId'], effect: 'external' },
	),

	api(
		'team',
		'getTeam',
		'Get Members and Invitations',
		'Get team members and invitations',
		'Retrieve workspace members and pending invitations',
		'GET',
		'/team',
		'team:read',
	),
	api(
		'team',
		'createTeamInvitation',
		'Create Team Invitation Link',
		'Create team invitation link',
		'Create a pending workspace invitation and return its relative invitation path once; send it securely because no email is sent',
		'POST',
		'/team/invitations',
		'team:write',
		{ body: 'required', effect: 'draft', successStatus: 201 },
	),
	api(
		'team',
		'updateTeamMember',
		'Update Member Role',
		'Update team member role',
		'Change the access role assigned to one workspace member',
		'PATCH',
		'/team/members/{memberUid}',
		'team:write',
		{ body: 'required', parameters: ['memberUid'], effect: 'draft' },
	),
	api(
		'team',
		'removeTeamMember',
		'Remove Member',
		'Remove team member',
		'Remove one member and revoke their access to the workspace',
		'DELETE',
		'/team/members/{memberUid}',
		'team:write',
		{ parameters: ['memberUid'], effect: 'destructive' },
	),
	api(
		'team',
		'revokeTeamInvitation',
		'Revoke Invitation',
		'Revoke team invitation',
		'Cancel one pending workspace invitation so it can no longer be accepted',
		'DELETE',
		'/team/invitations/{invitationId}',
		'team:write',
		{ parameters: ['invitationId'], effect: 'destructive' },
	),

	api(
		'billing',
		'getBilling',
		'Get Plan and Subscription',
		'Get plan and subscription',
		'Retrieve current OrbitPage plan and Stripe subscription status',
		'GET',
		'/billing',
		'billing:read',
	),
	api(
		'billing',
		'createCheckout',
		'Start Plan Checkout',
		'Start plan checkout',
		'Create an external authenticated Stripe Checkout session for the selected paid plan',
		'POST',
		'/billing/checkout',
		'billing:write',
		{ body: 'required', effect: 'external' },
	),
	api(
		'billing',
		'createBillingPortal',
		'Create Billing Portal Link',
		'Create billing portal link',
		'Create a short-lived authenticated Stripe Billing Portal URL',
		'POST',
		'/billing/portal',
		'billing:write',
		{ body: 'optional', effect: 'external' },
	),
	api(
		'billing',
		'redeemPromotionCode',
		'Redeem Promotion Code and Apply Plan Change',
		'Redeem promotion code and apply plan change',
		'Apply a valid promotion code and reconcile the plan, which can unpublish or republish the public page when entitlements change',
		'POST',
		'/billing/promotion-code',
		'billing:write',
		{ body: 'required', effect: ['external', 'destructive', 'public'] },
	),

	api(
		'backup',
		'listVersions',
		'Get Many Published Versions',
		'Get many published page versions',
		'Retrieve restorable historical versions captured when the page was published',
		'GET',
		'/versions',
		'backup:read',
	),
	api(
		'backup',
		'restoreVersion',
		'Restore and Publish Historical Version',
		'Restore and publish historical page version',
		'Replace the current page with a selected previously published version and publish it immediately',
		'POST',
		'/versions/{revision}/restore',
		'backup:write',
		{
			parameters: ['revision'],
			revisionSource: '/versions',
			effect: ['destructive', 'public'],
		},
	),
	api(
		'backup',
		'exportBackup',
		'Export Workspace Backup',
		'Export workspace backup',
		'Download all supported workspace data or selected sections without changing the workspace',
		'GET',
		'/backup',
		'backup:read',
		{ queryParameters: ['sections'] },
	),
	api(
		'backup',
		'restoreBackup',
		'Restore and Publish Workspace Backup',
		'Restore and publish workspace backup',
		'Validate the backup, replace the selected workspace data and publish the restored page immediately',
		'POST',
		'/backup/restore',
		'backup:write',
		{
			body: 'required',
			revisionSource: '/versions',
			effect: ['destructive', 'public'],
		},
	),

	{
		resource: 'advanced',
		value: 'customRequest',
		name: 'Send Custom API Request',
		action: 'Send custom OrbitPage API request',
		description:
			'Call a relative public workspace API v1 path using every applicable permission granted to the selected credential; paths outside the public workspace API contract are unavailable',
		kind: 'custom',
		effect: 'advanced',
		scope: 'Depends on API path',
	},
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
