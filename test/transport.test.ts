import type { IAllExecuteFunctions } from 'n8n-workflow';
import { describe, expect, it, vi } from 'vitest';
import { orbitPageApiRequest } from '../nodes/OrbitPage/transport';

function requestContext(baseUrl: string) {
	const send = vi.fn().mockResolvedValue({ success: true });
	const context = {
		getCredentials: async () => ({ baseUrl }),
		helpers: { httpRequestWithAuthentication: send },
	} as unknown as IAllExecuteFunctions;
	return { context, send };
}

describe('authenticated API transport', () => {
	it.each([
		'https://orbitpage.com',
		'http://localhost:5678',
		'http://127.0.0.1:5678',
		'http://[::1]:5678',
	])('accepts the supported origin %s without forwarding credentials across redirects', async (baseUrl) => {
		const { context, send } = requestContext(baseUrl);
		await expect(orbitPageApiRequest(context, { method: 'GET', path: '/workspace' }))
			.resolves.toEqual({ success: true });
		expect(send).toHaveBeenCalledWith('orbitPageApi', expect.objectContaining({
			url: `${baseUrl}/api/v1/workspace`,
			allowedDomains: new URL(baseUrl).hostname,
			sendCredentialsOnCrossOriginRedirect: false,
		}));
	});

	it.each(['http://example.com', 'http://127.0.0.2', 'http://[::2]', 'ftp://localhost'])(
		'rejects the unsupported origin %s before using credentials',
		async (baseUrl) => {
			const { context, send } = requestContext(baseUrl);
			await expect(orbitPageApiRequest(context, { method: 'GET', path: '/workspace' }))
				.rejects.toThrow('must use HTTPS');
			expect(send).not.toHaveBeenCalled();
		},
	);
});
