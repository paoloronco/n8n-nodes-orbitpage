import type { IExecuteFunctions } from 'n8n-workflow';
import { describe, expect, it, vi } from 'vitest';

const apiRequest = vi.hoisted(() => vi.fn());

vi.mock('../nodes/OrbitPage/transport', async () => {
	const actual = await vi.importActual<typeof import('../nodes/OrbitPage/transport')>(
		'../nodes/OrbitPage/transport',
	);
	return { ...actual, orbitPageApiRequest: apiRequest };
});

import { operationQuery, uploadShopFileBinary } from '../nodes/OrbitPage/OrbitPage.node';
import { operationSpec } from '../nodes/OrbitPage/operations';

function parameterReader(parameters: Record<string, unknown>) {
	return vi.fn((name: string, _itemIndex: number, fallback?: unknown) =>
		Object.hasOwn(parameters, name) ? parameters[name] : fallback,
	);
}

describe('Shop API behavior', () => {
	it.each([
		['auto', false, {}],
		['snapshot', false, { refresh: '0' }],
		['force', false, { refresh: '1' }],
		['auto', true, { refresh: '1' }],
	])('maps Shop read mode %s and legacy refresh %s to the API query', (mode, legacy, expected) => {
		const context = {
			getNodeParameter: parameterReader({ shopReadMode: mode, refresh: legacy }),
		} as unknown as IExecuteFunctions;
		expect(operationQuery(context, operationSpec('getShop')!, 0)).toEqual(expected);
	});

	it('cancels a Shop reservation when the signed upload fails', async () => {
		const reservationId = crypto.randomUUID();
		apiRequest.mockReset();
		apiRequest
			.mockResolvedValueOnce({
				uploadUrl: 'https://storage.example/upload',
				uploadToken: reservationId,
				headers: { 'content-type': 'application/pdf' },
			})
			.mockResolvedValueOnce({ success: true });

		const context = {
			getNodeParameter: parameterReader({
				productId: 'product-1',
				binaryPropertyName: 'data',
			}),
			getNode: () => ({
				name: 'OrbitPage',
				type: 'n8n-nodes-orbitpage.orbitPage',
				typeVersion: 1,
				position: [0, 0],
				parameters: {},
			}),
			helpers: {
				assertBinaryData: () => ({
					fileName: 'guide.pdf',
					mimeType: 'application/pdf',
				}),
				getBinaryDataBuffer: async () => Buffer.from('test file'),
				httpRequest: vi.fn().mockRejectedValue(new Error('signed upload failed')),
			},
		} as unknown as IExecuteFunctions;

		await expect(uploadShopFileBinary(context, 0)).rejects.toThrow('signed upload failed');
		expect(apiRequest).toHaveBeenCalledTimes(2);
		expect(apiRequest).toHaveBeenNthCalledWith(2, context, {
			method: 'DELETE',
			path: '/shop/uploads',
			body: { uploadToken: reservationId },
		});
	});
});
