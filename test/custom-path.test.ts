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

function parameterReader(parameters: Record<string, unknown>) {
	return vi.fn((name: string, _itemIndex: number, fallback?: unknown) =>
		Object.hasOwn(parameters, name) ? parameters[name] : fallback,
	);
}

async function executeCustomRequest(path: string) {
	const context = {
		getInputData: () => [{ json: {} }],
		getNodeParameter: parameterReader({
			operation: 'customRequest',
			customMethod: 'GET',
			customPath: path,
			customQuery: '{}',
			customIfMatch: '',
			options: {},
		}),
		getNode: () => ({
			name: 'OrbitPage',
			type: 'n8n-nodes-orbitpage.orbitPage',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		continueOnFail: () => false,
	} as unknown as IExecuteFunctions;

	return await new OrbitPage().execute.call(context);
}

describe('Advanced API path boundary', () => {
	beforeEach(() => {
		apiRequest.mockReset();
		apiRequest.mockResolvedValue({ ok: true });
	});

	it.each([
		'/operator',
		'/operator/overview',
		'/operator//overview',
		'/OpErAtOr/overview',
		'/%6fperator/overview',
		'/%256fperator/overview',
		'/%256fperator/%25',
		'/%2foperator/overview',
		'/%5coperator/overview',
		'/\\operator/overview',
	])('does not send requests whose normalized first segment is operator: %s', async (path) => {
		await expect(executeCustomRequest(path)).rejects.toThrow('public workspace API contract');
		expect(apiRequest).not.toHaveBeenCalled();
	});

	it.each([
		'//operator/overview',
		'///operator/overview',
		'/./operator/overview',
		'/%2e/operator/overview',
		'/workspace/../operator/overview',
		'/workspace/%252e%252e/operator/overview',
	])('rejects separator and traversal variants before transport: %s', async (path) => {
		await expect(executeCustomRequest(path)).rejects.toThrow();
		expect(apiRequest).not.toHaveBeenCalled();
	});

	it.each(['/workspace', '/operator-tools', '/workspace/operator', '/shop/products'])(
		'sends a legitimate public API path unchanged: %s',
		async (path) => {
			await expect(executeCustomRequest(path)).resolves.toEqual([
				[{ json: { ok: true }, pairedItem: { item: 0 } }],
			]);
			expect(apiRequest).toHaveBeenCalledOnce();
			expect(apiRequest).toHaveBeenCalledWith(expect.anything(), {
				method: 'GET',
				path,
				qs: {},
				returnFullResponse: false,
			});
		},
	);
});
