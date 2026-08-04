import type {
	IAllExecuteFunctions,
	IDataObject,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
} from 'n8n-workflow';
import type { OrbitPageMethod } from './operations';

export type OrbitPageRequest = {
	method: OrbitPageMethod;
	path: string;
	body?: IHttpRequestOptions['body'];
	qs?: IDataObject;
	headers?: IDataObject;
	returnFullResponse?: boolean;
};

function credentialBaseUrl(baseUrl: unknown): URL {
	const normalized = String(baseUrl || 'https://orbitpage.com').trim().replace(/\/+$/, '');
	const parsed = new URL(normalized);
	const localDevelopment = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
	if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && localDevelopment)) {
		throw new Error('OrbitPage Base URL must use HTTPS. HTTP is allowed only for local development.');
	}
	return parsed;
}

export async function orbitPageApiRequest(
	context: IAllExecuteFunctions,
	request: OrbitPageRequest,
): Promise<unknown | IN8nHttpFullResponse> {
	const credentials = await context.getCredentials('orbitPageApi');
	const baseUrl = credentialBaseUrl(credentials.baseUrl);
	if (!request.path.startsWith('/') || request.path.startsWith('//')) {
		throw new Error('OrbitPage API paths must be relative paths beginning with one slash.');
	}

	const options: IHttpRequestOptions = {
		method: request.method,
		url: `${baseUrl.toString().replace(/\/$/, '')}/api/v1${request.path}`,
		qs: request.qs,
		headers: request.headers,
		body: request.body,
		json: true,
		returnFullResponse: request.returnFullResponse,
		sendCredentialsOnCrossOriginRedirect: false,
		allowedDomains: baseUrl.hostname,
	};

	return await context.helpers.httpRequestWithAuthentication.call(
		context,
		'orbitPageApi',
		options,
	);
}

export function fullResponse(value: unknown): IN8nHttpFullResponse {
	if (!value || typeof value !== 'object' || !('headers' in value) || !('statusCode' in value)) {
		throw new Error('OrbitPage did not return the expected HTTP response metadata.');
	}
	return value as IN8nHttpFullResponse;
}

export function responseRevision(response: IN8nHttpFullResponse): string {
	const etag = response.headers.etag ?? response.headers.ETag;
	if (typeof etag === 'string' && etag.trim()) return etag;
	const revisionHeader =
		response.headers['x-orbitpage-revision'] ?? response.headers['X-OrbitPage-Revision'];
	if (typeof revisionHeader === 'string' && revisionHeader.trim()) return revisionHeader;
	if (
		response.body &&
		typeof response.body === 'object' &&
		!Array.isArray(response.body) &&
		'revision' in response.body
	) {
		const revision = (response.body as IDataObject).revision;
		if (typeof revision === 'number' || typeof revision === 'string') return String(revision);
	}
	throw new Error('The revision preflight response did not include an ETag or revision.');
}
