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

	documentationUrl = 'https://orbitpage.com/en-US/docs/api-tokens';

	properties: INodeProperties[] = [
		{
			displayName: 'Token Type',
			name: 'credentialKind',
			type: 'options',
			options: [
				{
					name: 'Personal Workspace Token',
					value: 'workspace',
				},
				{
					name: 'Protected Operator Token',
					value: 'operator',
				},
			],
			default: 'workspace',
			description:
				'Personal tokens are created in Dashboard > Account. Operator tokens are created only in the protected operator console.',
		},
		{
			displayName: 'Personal API Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'op_pat_...',
			description: 'The scoped OrbitPage bearer token. It is stored encrypted by n8n.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://orbitpage.com',
			description:
				'Use the production URL unless OrbitPage support supplied a dedicated staging environment',
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
			baseURL: '={{$credentials.baseUrl.replace(/\\/$/, "")}}',
			url: '={{$credentials.credentialKind === "operator" ? "/api/v1/operator/overview" : "/api/v1/workspace"}}',
			method: 'GET',
		},
	};
}
