import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class OrbitPageApi implements ICredentialType {
	name = 'orbitPageApi';

	displayName = 'OrbitPage API';

	icon: Icon = {
		light: 'file:../icons/orbitpage.svg',
		dark: 'file:../icons/orbitpage.dark.svg',
	};

	documentationUrl = 'https://orbitpage.com/en-US/docs/api-tokens#integration';

	properties: INodeProperties[] = [
		{
			displayName: 'OrbitPage API Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'e.g. op_pat_...',
			description: 'Paste the token shown once by OrbitPage. n8n stores it encrypted.',
		},
		{
			displayName: 'OrbitPage Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://orbitpage.com',
			required: true,
			validateType: 'url',
			description:
				'Use https://orbitpage.com in production. Do not add /api/v1. Change this only when OrbitPage support provides another environment.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
				Accept: 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{/^(https:\\/\\/|http:\\/\\/(localhost|127\\.0\\.0\\.1|\\[::1\\])(?=[:/]|$))/i.test($credentials.baseUrl) ? $credentials.baseUrl.replace(/\\/$/, "") : "https://invalid.invalid"}}',
			url: '/api/v1/workspace',
			method: 'GET',
			sendCredentialsOnCrossOriginRedirect: false,
			allowedDomains:
				'={{$credentials.baseUrl.replace(/^https?:\\/\\//i, "").replace(/\\/.*$/, "").replace(/:\\d+$/, "").replace(/^\\[|\\]$/g, "")}}',
		},
	};
}
