import { describe, expect, it } from 'vitest';
import { OrbitPageApi } from '../credentials/OrbitPageApi.credentials';
import { operationBodyGuidance } from '../nodes/OrbitPage/bodyGuidance';
import { orbitPageProperties } from '../nodes/OrbitPage/description';
import {
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationSpec,
	operationsForResource,
	type OperationQueryParameter,
} from '../nodes/OrbitPage/operations';
import { OrbitPage } from '../nodes/OrbitPage/OrbitPage.node';
import {
	OrbitPageTrigger,
	TRIGGER_REQUESTS,
	observedValue,
} from '../nodes/OrbitPageTrigger/OrbitPageTrigger.node';

const persistedResourceValues =
	'workspace links profile theme pages settings publication backup media domains analytics ai shop newsletter team billing advanced'.split(
		' ',
	);

const persistedOperationValues =
	'getWorkspace getDraft getProfile updateProfile listLinks replaceLinks updateLink listSubpages replaceSubpages getTheme replaceTheme getSettings updateMenuSettings updatePrivacySettings createTextFile updateTextFile deleteTextFile generateSitemap getPublication publishPage listMedia cleanupMedia uploadMediaBinary reserveMediaUpload finalizeMediaUpload abortMediaUpload getDomain connectDomain refreshDomain disconnectDomain getAnalytics getAiAllowance planAiChanges commitAiChanges getShop connectShop saveShopProduct deleteShopProduct updateShopAppearance publishShop unpublishShop uploadShopFileBinary reserveShopUpload finalizeShopUpload abortShopUpload getNewsletter updateNewsletterSettings testNewsletter addNewsletterSubscriber removeNewsletterSubscriber saveNewsletterCampaign deleteNewsletterCampaign sendNewsletterCampaign cancelNewsletterCampaign getTeam createTeamInvitation updateTeamMember removeTeamMember revokeTeamInvitation getBilling createCheckout createBillingPortal redeemPromotionCode listVersions restoreVersion exportBackup restoreBackup customRequest'.split(
		' ',
	);

describe('OrbitPage editor copy', () => {
	it('preserves the workspace resource and operation values across the breaking boundary', () => {
		expect(RESOURCE_OPTIONS.map((resource) => resource.value).sort()).toEqual(
			[...persistedResourceValues].sort(),
		);
		expect(OPERATION_SPECS.map((operation) => operation.value).sort()).toEqual(
			[...persistedOperationValues].sort(),
		);
		expect(RESOURCE_OPTIONS.some((resource) => resource.value === 'operator')).toBe(false);
		expect(OPERATION_SPECS.some((operation) => operation.path?.startsWith('/operator'))).toBe(
			false,
		);
	});

	it('gives every resource and operation a clear, unique label', () => {
		expect(RESOURCE_OPTIONS).toHaveLength(17);
		for (const resource of RESOURCE_OPTIONS) {
			expect(resource.description, String(resource.value)).toBeTruthy();
		}

		expect(new Set(OPERATION_SPECS.map((spec) => spec.name)).size).toBe(OPERATION_SPECS.length);
		expect(new Set(OPERATION_SPECS.map((spec) => spec.action)).size).toBe(OPERATION_SPECS.length);
		for (const spec of OPERATION_SPECS) {
			expect(spec.name.trim(), spec.value).toBeTruthy();
			expect(spec.action.trim(), spec.value).toBeTruthy();
			expect(spec.description.trim(), spec.value).toBeTruthy();
			const effects = typeof spec.effect === 'string' ? [spec.effect] : spec.effect;
			expect(effects.length, spec.value).toBeGreaterThan(0);
			for (const effect of effects) {
				expect(effect, spec.value).toMatch(/^(read|draft|public|external|destructive|advanced)$/);
			}
			expect(spec.scope, spec.value).toBeTruthy();
		}
	});

	it('uses explicit names for ambiguous and high-impact operations', () => {
		expect(operationSpec('replaceLinks')?.name).toBe('Replace All Content Blocks');
		expect(operationSpec('replaceLinks')?.description).toContain('publish it immediately');
		expect(operationSpec('cleanupMedia')?.name).toBe('Preview or Delete Unused Media');
		expect(operationSpec('planAiChanges')?.name).toBe('Preview AI Page Changes');
		expect(operationSpec('commitAiChanges')?.name).toBe('Apply Previewed AI Changes');
		expect(operationSpec('testNewsletter')?.name).toBe('Send Test Email');
		expect(operationSpec('restoreVersion')?.name).toBe('Restore and Publish Historical Version');
		expect(operationSpec('createTextFile')?.effect).toContain('public');
		expect(operationSpec('createTeamInvitation')?.description).toContain('no email is sent');
	});

	it('documents strict request constraints that are easy to miss', () => {
		expect(operationBodyGuidance('reserveMediaUpload')).toContain(
			'filename must end in .mp4 or .webm',
		);
		expect(operationBodyGuidance('createTextFile')).toContain('/.well-known/name.txt');
		expect(operationBodyGuidance('planAiChanges')).toContain('at most 8 objects');
		expect(operationBodyGuidance('restoreBackup')).toContain(
			'profile, links, theme, privacy, pages, menu, and discovery',
		);
		expect(operationBodyGuidance('createCheckout')).toContain('starter or pro');
		expect(operationBodyGuidance('sendNewsletterCampaign')).toContain(
			'RFC 3339 date-time string with an explicit Z or numeric timezone offset',
		);
		expect(operationBodyGuidance('sendNewsletterCampaign')).toContain(
			'additional fields are rejected',
		);
	});

	it('keeps a GET operation first for each guided resource', () => {
		for (const resource of RESOURCE_OPTIONS.filter((option) => option.value !== 'advanced')) {
			const first = operationSpec(String(operationsForResource(String(resource.value))[0]?.value));
			expect(first?.method, String(resource.value)).toBe('GET');
		}
	});

	it('shows operation help and distinguishes required from optional JSON bodies', () => {
		const notices = orbitPageProperties.filter((property) =>
			property.name.startsWith('operationHelp'),
		);
		expect(notices).toHaveLength(OPERATION_SPECS.length);
		expect(notices.every((property) => property.type === 'notice')).toBe(true);

		const bodySpecs = OPERATION_SPECS.filter((spec) => Boolean(spec.body));
		const bodyFields = orbitPageProperties.filter((property) => property.name === 'jsonBody');
		expect(bodyFields).toHaveLength(bodySpecs.length);
		const requiredOperations = bodyFields
			.filter((property) => property.required === true)
			.flatMap((property) => property.displayOptions?.show?.operation ?? []);
		const optionalOperations = bodyFields
			.filter((property) => property.required !== true)
			.flatMap((property) => property.displayOptions?.show?.operation ?? []);
		expect(requiredOperations.length).toBeGreaterThan(0);
		expect(optionalOperations).toEqual([
			'cleanupMedia',
			'sendNewsletterCampaign',
			'createBillingPortal',
		]);
		expect(requiredOperations.some((value) => optionalOperations.includes(value))).toBe(false);
		for (const spec of bodySpecs) {
			expect(operationBodyGuidance(spec.value), spec.value).toBeTruthy();
			const field = bodyFields.find(
				(property) => property.displayOptions?.show?.operation?.[0] === spec.value,
			);
			expect(field?.description, spec.value).toContain(operationBodyGuidance(spec.value));
		}
	});

	it('separates the published version number and uses a backup-scoped revision preflight', () => {
		const versionNumber = orbitPageProperties.find((property) => property.name === 'revision');
		const currentRevision = orbitPageProperties.find(
			(property) => property.name === 'ifMatchRevision',
		);
		expect(versionNumber?.displayName).toBe('Published Version Number');
		expect(currentRevision?.displayName).toBe('Current Revision or ETag');
		expect(operationSpec('restoreVersion')?.revisionSource).toBe('/versions');
		expect(operationSpec('restoreBackup')?.revisionSource).toBe('/versions');
	});

	it('keeps guided query controls in the typed operation contract', () => {
		const expectedQueries = {
			getAnalytics: ['days'],
			exportBackup: ['sections'],
			getShop: ['refresh'],
		};
		for (const [operation, queryParameters] of Object.entries(expectedQueries)) {
			expect(operationSpec(operation)?.queryParameters, operation).toEqual(queryParameters);
		}

		const queryFields = {
			days: 'days',
			sections: 'sections',
			refresh: 'shopReadMode',
		};
		for (const [queryParameter, fieldName] of Object.entries(queryFields)) {
			const operations = OPERATION_SPECS.filter((spec) =>
				spec.queryParameters?.includes(queryParameter as OperationQueryParameter),
			).map((spec) => spec.value);
			const field = orbitPageProperties.find((property) => property.name === fieldName);
			expect(field?.displayOptions?.show?.operation, queryParameter).toEqual(operations);
		}
	});

	it('discloses replacement, cleanup, and Shop provider effects', () => {
		expect(operationSpec('abortMediaUpload')?.effect).toContain('destructive');
		expect(operationSpec('abortShopUpload')?.effect).toContain('destructive');
		expect(operationSpec('replaceSubpages')?.effect).toContain('draft');
		expect(operationSpec('replaceTheme')?.effect).toContain('draft');
		expect(operationSpec('commitAiChanges')?.effect).toContain('destructive');
		expect(operationSpec('saveShopProduct')?.effect).toContain('destructive');
		expect(operationSpec('updateShopAppearance')).toMatchObject({
			name: 'Replace Entire Shop Appearance',
			action: 'Replace entire Shop appearance',
		});
		expect(operationSpec('updateShopAppearance')?.effect).toContain('public');
		expect(operationSpec('deleteNewsletterCampaign')?.description).toContain('delivery records');
		for (const operation of [
			'saveShopProduct',
			'deleteShopProduct',
			'updateShopAppearance',
			'publishShop',
			'unpublishShop',
			'uploadShopFileBinary',
			'finalizeShopUpload',
		]) {
			expect(operationSpec(operation)?.effect, operation).toContain('external');
		}
	});

	it('offers all three API modes for reading Shop state', () => {
		const field = orbitPageProperties.find((property) => property.name === 'shopReadMode');
		expect(field?.displayName).toBe('Shop Read Mode');
		expect(field?.default).toBe('auto');
		expect(field?.options?.map((option) => option.value)).toEqual([
			'auto',
			'force',
			'snapshot',
		]);
	});
});

describe('OrbitPage credentials and trigger copy', () => {
	it('uses one neutral token label and protects the connection test', () => {
		const credential = new OrbitPageApi();
		const token = credential.properties.find((property) => property.name === 'accessToken');
		const baseUrl = credential.properties.find((property) => property.name === 'baseUrl');
		expect(credential.properties.some((property) => property.name === 'credentialKind')).toBe(
			false,
		);
		expect(token?.displayName).toBe('OrbitPage API Token');
		expect(token?.required).toBe(true);
		expect(baseUrl?.displayName).toBe('OrbitPage Base URL');
		expect(baseUrl?.required).toBe(true);
		expect(credential.test?.request.sendCredentialsOnCrossOriginRedirect).toBe(false);
		expect(credential.test?.request.allowedDomains).toBeTruthy();
		expect(credential.test?.request.method).toBe('GET');
		expect(credential.test?.request.url).toBe('/api/v1/workspace');
	});

	it('maps saved operation and event values to human-readable canvas subtitles', () => {
		const actionNode = new OrbitPage();
		const triggerNode = new OrbitPageTrigger();
		expect(actionNode.description.subtitle).toContain('Get Workspace Overview');
		expect(actionNode.description.subtitle).toContain('Restore and Publish Historical Version');
		expect(triggerNode.description.subtitle).toContain('Publishing Details Changed');
		expect(triggerNode.description.usableAsTool).toBeUndefined();

		const triggerOn = triggerNode.description.properties.find(
			(property) => property.name === 'event',
		);
		expect(triggerOn?.displayName).toBe('Trigger On');
		expect(triggerOn?.options?.map((option) => option.name)).toEqual([
			'Custom Domain Status Changed',
			'Publishing Details Changed',
			'Shop Changed',
			'Page Draft Changed',
		]);
		expect(triggerOn?.options?.map((option) => option.value)).toEqual([
			'domainChanged',
			'publicationChanged',
			'shopChanged',
			'workspaceRevisionChanged',
		]);
		expect(TRIGGER_REQUESTS.shopChanged).toEqual({
			method: 'GET',
			path: '/shop',
			qs: { refresh: '0' },
		});
	});

	it('ignores only volatile Shop-record timestamps when detecting changes', () => {
		const first = {
			shop: {
				enabled: false,
				createdAt: '2026-08-04T10:00:00.000Z',
				updatedAt: '2026-08-04T10:00:00.000Z',
				stripeStatusCheckedAt: '2026-08-04T10:00:00.000Z',
			},
			products: [{ productId: 'product-1', updatedAt: '2026-08-04T09:00:00.000Z' }],
		};
		const second = {
			shop: {
				...first.shop,
				createdAt: '2026-08-04T10:01:00.000Z',
				updatedAt: '2026-08-04T10:01:00.000Z',
				stripeStatusCheckedAt: '2026-08-04T10:01:00.000Z',
			},
			products: first.products,
		};
		expect(observedValue('shopChanged', first)).toEqual(observedValue('shopChanged', second));

		const productChanged = {
			...second,
			products: [{ ...second.products[0], updatedAt: '2026-08-04T10:01:00.000Z' }],
		};
		expect(observedValue('shopChanged', first)).not.toEqual(
			observedValue('shopChanged', productChanged),
		);
	});
});
