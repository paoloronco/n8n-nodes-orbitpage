const BODY_GUIDANCE: Readonly<Record<string, string>> = {
	updateProfile:
		'Send at least one profile field to change, such as name, bio, avatar, social_links, display settings, or SEO metadata.',
	replaceLinks:
		'Start from the data array returned by Get Many Content Blocks. Send the complete list as that array or as {"links":[...]}; omitted blocks are deleted.',
	updateLink:
		'Send at least one editable block field, such as title, description, url, backgroundColor, isActive, or status. The block ID and type are preserved.',
	replaceSubpages:
		'Start from the data array returned by Get Many Subpages. Send the complete list as that array or as {"pages":[...]}; omitted subpages are deleted.',
	replaceTheme:
		'Start from the data field returned by Get Theme Draft. Send the complete desired theme; omitted properties fall back to defaults.',
	updateMenuSettings:
		'Start from data.menu returned by Get Page Settings and send the complete menu object. Missing required fields or unsupported fields are rejected; optional fields that you omit use their defaults.',
	updatePrivacySettings:
		'Start from data.privacy returned by Get Page Settings. Send the complete consent configuration with mode, enabled, and all settings required by that mode.',
	createTextFile:
		'Send path and content. Use /name.txt or /.well-known/name.txt with letters, numbers, dots, dashes, or underscores; a missing leading slash is added, while OrbitPage built-in paths and aliases are reserved. content accepts at most 50,000 characters. A workspace can store up to 20 custom TXT files and 128 KB across all managed TXT content. The path becomes public immediately.',
	updateTextFile:
		'Send content only, up to 50,000 characters and within the 128 KB total TXT allowance. Public Text File Key selects the file that changes immediately.',
	cleanupMedia:
		'Leave empty to preview unused media. Set dryRun to false only when you intend to delete the reported files permanently.',
	reserveMediaUpload:
		'Send filename, sizeBytes, and contentType as video/mp4 or video/webm. The filename must end in .mp4 or .webm to match contentType; sizeBytes must be a positive integer within the workspace plan and 100 MB direct-upload limits. purpose accepts upload or background; slot is optional.',
	finalizeMediaUpload:
		'Send slot and uploadToken exactly as returned by Reserve Video Upload. Reusing a slot replaces its current video.',
	abortMediaUpload: 'Send slot and uploadToken exactly as returned by Reserve Video Upload.',
	connectDomain: 'Send hostname without a path, such as a root domain or www subdomain.',
	planAiChanges:
		'Send message with 1 to 4,000 characters. history is optional and accepts at most 8 objects containing role as user or assistant and content with 1 to 4,000 characters. requestId is an optional UUID.',
	commitAiChanges:
		'Send previewToken from Preview AI Page Changes. Review removals and replacements in that preview; set publish to true only when the public change is approved.',
	saveShopProduct:
		'To update, start from the complete product returned by Get Shop Overview and add productId because omitted editable fields reset to defaults. Send type, title, description, and priceCents. A service also needs an HTTPS bookingUrl or fulfillmentText; sessionsIncluded, intakeQuestions, active, and cardStyle are optional. Changing a digital product to a service detaches its protected file.',
	updateShopAppearance:
		'Start from shop.appearance returned by Get Shop Overview and send the complete desired appearance. Omitted properties use defaults. If Shop is active, this also republishes its public artifact and synchronized page block.',
	reserveShopUpload:
		'Send productId, filename, contentType, and sizeBytes for a digital product. The filename extension must match a supported PDF, ZIP, JPEG, PNG, WebP, GIF, MP4, or WebM content type.',
	finalizeShopUpload:
		"Send uploadToken exactly as returned by Reserve Product File Upload. This replaces the product's current file when one exists.",
	abortShopUpload:
		'Send uploadToken exactly as returned by Reserve Product File Upload. The current finalized product file is not changed.',
	updateNewsletterSettings:
		'Send host, port, username, fromName, and fromEmail. Include password on first setup or when changing it; replyTo is optional.',
	testNewsletter:
		'Send recipient with the email address that should receive the real test message.',
	addNewsletterSubscriber:
		'Send email and consentConfirmed set to true only after recording consent. Name and source are optional.',
	saveNewsletterCampaign:
		'Send name, subject, and content. Content requires headline, body, accentColor, backgroundColor, and contentColor; add campaignId to update an existing draft.',
	sendNewsletterCampaign:
		'Leave the body empty, omit scheduledFor, or set scheduledFor to null to send immediately. To schedule, send only scheduledFor as an RFC 3339 date-time string with an explicit Z or numeric timezone offset; additional fields are rejected.',
	createTeamInvitation:
		'Send email and role. Supported roles are admin, profile_editor, and analytics_viewer.',
	updateTeamMember:
		'Send role only. Supported roles are admin, profile_editor, and analytics_viewer.',
	createCheckout:
		'Send planId as starter or pro and a UUID requestId. billingInterval is optional and accepts month or year.',
	createBillingPortal:
		'Leave empty for the general billing portal. To prepare a plan change, set targetPlanId to free, starter, or pro; billingInterval accepts month or year.',
	redeemPromotionCode: 'Send code and a new UUID requestId.',
	restoreBackup:
		'Send an exported managed backup directly, or place it under backup and optionally add sections from profile, links, theme, privacy, pages, menu, and discovery. Review the selected data before running because the restored result is published immediately.',
};

export function operationBodyGuidance(operation: string): string | undefined {
	return BODY_GUIDANCE[operation];
}

export { BODY_GUIDANCE };
