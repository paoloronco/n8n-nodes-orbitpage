import type { IExecuteFunctions } from 'n8n-workflow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRequest = vi.hoisted(() => vi.fn());

vi.mock('../nodes/OrbitPage/transport', async () => {
	const actual = await vi.importActual<typeof import('../nodes/OrbitPage/transport')>(
		'../nodes/OrbitPage/transport',
	);
	return { ...actual, orbitPageApiRequest: apiRequest };
});

import { OrbitPage } from '../nodes/OrbitPage/OrbitPage.node';

function context(parameters: Record<string, unknown>) {
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: vi.fn((name: string, _itemIndex: number, fallback?: unknown) =>
			Object.hasOwn(parameters, name) ? parameters[name] : fallback,
		),
		getNode: () => ({ name: 'OrbitPage', type: 'n8n-nodes-orbitpage.orbitPage' }),
		continueOnFail: () => false,
	} as unknown as IExecuteFunctions;
}

describe('reviewed high-impact actions', () => {
	beforeEach(() => {
		apiRequest.mockReset();
		apiRequest.mockResolvedValue({ success: true });
	});

	it.each([
		['publishPage', '/publication', 'W/"42"', {}],
		['publishShop', '/shop/publish', '"shop-review"', {}],
		['sendNewsletterCampaign', '/newsletter/campaigns/campaign-1/send', '"newsletter-review"', { campaignId: 'campaign-1', jsonBody: '{}' }],
	])('sends only the supplied reviewed state for %s', async (operation, path, tag, extra) => {
		await new OrbitPage().execute.call(context({ operation, reviewedStateTag: tag, options: {}, ...extra }));
		expect(apiRequest).toHaveBeenCalledOnce();
		expect(apiRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ method: 'POST', path, headers: { 'If-Match': tag } }),
		);
	});

	it('rejects publication without a reviewed state rather than fetching the latest revision', async () => {
		await expect(
			new OrbitPage().execute.call(context({ operation: 'publishPage', options: {} })),
		).rejects.toThrow('Approved State ETag is required');
		expect(apiRequest).not.toHaveBeenCalled();
	});

	it('allows a cleanup preview but requires its approved tag for deletion', async () => {
		await new OrbitPage().execute.call(
			context({ operation: 'cleanupMedia', jsonBody: '{}', options: {} }),
		);
		expect(apiRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.not.objectContaining({ headers: expect.anything() }),
		);
		apiRequest.mockClear();
		await expect(
			new OrbitPage().execute.call(
				context({ operation: 'cleanupMedia', jsonBody: '{"dryRun":false}', options: {} }),
			),
		).rejects.toThrow('Approved State ETag is required');
		expect(apiRequest).not.toHaveBeenCalled();
		await new OrbitPage().execute.call(
			context({
				operation: 'cleanupMedia',
				jsonBody: '{"dryRun":false}',
				reviewedStateTag: '"media-review"',
				options: {},
			}),
		);
		expect(apiRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ headers: { 'If-Match': '"media-review"' } }),
		);
	});
});
