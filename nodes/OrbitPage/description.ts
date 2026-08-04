import type { INodeProperties } from 'n8n-workflow';
import {
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationsForResource,
	type PathParameter,
} from './operations';

const apiOperationsWithBody = OPERATION_SPECS.filter(
	(spec) => spec.kind === 'api' && Boolean(spec.body),
).map((spec) => spec.value);
const revisionOperations = OPERATION_SPECS.filter((spec) => Boolean(spec.revisionSource)).map(
	(spec) => spec.value,
);
const publishOperations = OPERATION_SPECS.filter((spec) => spec.publishQuery).map(
	(spec) => spec.value,
);

const parameterCopy: Record<
	PathParameter,
	{ displayName: string; description: string; placeholder: string }
> = {
	linkId: {
		displayName: 'Block ID',
		description: 'The stable block ID returned by Get Many Blocks',
		placeholder: 'portfolio-main',
	},
	key: {
		displayName: 'Text File Key',
		description: 'The managed text-file key returned by Get Settings',
		placeholder: 'robots.txt',
	},
	revision: {
		displayName: 'Version Revision',
		description: 'The numeric historical revision to restore',
		placeholder: '42',
	},
	productId: {
		displayName: 'Product ID',
		description: 'The Shop product ID',
		placeholder: 'product_123',
	},
	subscriberId: {
		displayName: 'Subscriber ID',
		description: 'The newsletter subscriber ID',
		placeholder: 'subscriber_123',
	},
	campaignId: {
		displayName: 'Campaign ID',
		description: 'The newsletter campaign ID',
		placeholder: 'campaign_123',
	},
	memberUid: {
		displayName: 'Member UID',
		description: 'The Firebase UID of the workspace member',
		placeholder: 'firebase-user-uid',
	},
	invitationId: {
		displayName: 'Invitation ID',
		description: 'The pending workspace invitation ID',
		placeholder: 'invitation_123',
	},
	prospectId: {
		displayName: 'Prospect ID',
		description: 'The operator CRM prospect ID',
		placeholder: 'prospect_123',
	},
	activityId: {
		displayName: 'Activity ID',
		description: 'The CRM activity ID',
		placeholder: 'activity_123',
	},
	promotionCodeId: {
		displayName: 'Promotion Code ID',
		description: 'The SHA-256 promotion-code ID returned by the operator API',
		placeholder: 'sha256-id',
	},
	tenantId: {
		displayName: 'Tenant ID',
		description: 'The target OrbitPage tenant ID',
		placeholder: 'tenant_123',
	},
};

const pathParameterProperties = (Object.keys(parameterCopy) as PathParameter[]).map(
	(parameter): INodeProperties => ({
		displayName: parameterCopy[parameter].displayName,
		name: parameter,
		type: parameter === 'revision' ? 'number' : 'string',
		typeOptions: parameter === 'revision' ? { minValue: 0, numberPrecision: 0 } : undefined,
		default: '',
		required: true,
		placeholder: parameterCopy[parameter].placeholder,
		description: parameterCopy[parameter].description,
		displayOptions: {
			show: {
				operation: OPERATION_SPECS.filter(
					(spec) => spec.parameters?.includes(parameter) || (parameter === 'productId' && spec.kind === 'shopFileUpload'),
				).map((spec) => spec.value),
			},
		},
	}),
);

const operationProperties = RESOURCE_OPTIONS.map(
	// Each generated resource selector has a concrete first-operation default.
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	(resource): INodeProperties => ({
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationsForResource(String(resource.value)),
		default: operationsForResource(String(resource.value))[0]?.value ?? '',
		displayOptions: {
			show: {
				resource: [resource.value],
			},
		},
	}),
);

export const orbitPageProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: RESOURCE_OPTIONS,
		default: 'workspace',
	},
	...operationProperties,
	...pathParameterProperties,
	{
		displayName: 'JSON Body',
		name: 'jsonBody',
		type: 'json',
		default: '{}',
		required: true,
		description:
			'Request body matching the operation schema in the OrbitPage OpenAPI document. Expressions can reference the current input item.',
		displayOptions: {
			show: {
				operation: apiOperationsWithBody,
			},
		},
	},
	{
		displayName: 'Revision Handling',
		name: 'revisionMode',
		type: 'options',
		options: [
			{
				name: 'Fetch Latest Automatically (Recommended)',
				value: 'auto',
				description: 'Read the related resource immediately before writing and use its ETag',
			},
			{
				name: 'Enter Manually',
				value: 'manual',
				description: 'Use an ETag or numeric revision from an earlier node',
			},
		],
		default: 'auto',
		description: 'OrbitPage rejects revision-controlled writes without a current If-Match value',
		displayOptions: {
			show: {
				operation: revisionOperations,
			},
		},
	},
	{
		displayName: 'ETag or Revision',
		name: 'revision',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'W/"42"',
		description: 'The ETag or numeric revision returned by the latest related GET request',
		displayOptions: {
			show: {
				operation: revisionOperations,
				revisionMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Publish Immediately',
		name: 'publish',
		type: 'boolean',
		default: false,
		description:
			'Whether to add publish=1. Leave disabled to review the draft and publish once with the Publication resource.',
		displayOptions: {
			show: {
				operation: publishOperations,
			},
		},
	},
	{
		displayName: 'Reporting Window',
		name: 'days',
		type: 'options',
		options: [
			{ name: '7 Days', value: 7 },
			{ name: '30 Days', value: 30 },
			{ name: '90 Days', value: 90 },
		],
		default: 30,
		description: 'The requested reporting window. The workspace plan can apply a smaller limit.',
		displayOptions: { show: { operation: ['getAnalytics'] } },
	},
	{
		displayName: 'Backup Sections',
		name: 'sections',
		type: 'multiOptions',
		options: [
			{ name: 'Discovery', value: 'discovery' },
			{ name: 'Links', value: 'links' },
			{ name: 'Menu', value: 'menu' },
			{ name: 'Pages', value: 'pages' },
			{ name: 'Privacy', value: 'privacy' },
			{ name: 'Profile', value: 'profile' },
			{ name: 'Theme', value: 'theme' },
		],
		default: [],
		description: 'Leave empty to export every supported section',
		displayOptions: { show: { operation: ['exportBackup'] } },
	},
	{
		displayName: 'Refresh Stripe State',
		name: 'refresh',
		type: 'boolean',
		default: false,
		description: 'Whether to refresh Stripe Connect state before returning Shop data',
		displayOptions: { show: { operation: ['getShop'] } },
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Optional operator search term',
		displayOptions: { show: { operation: ['getOperatorOverview', 'listCrmProspects'] } },
	},
	{
		displayName: 'Email Action',
		name: 'emailAction',
		type: 'options',
		options: [
			{ name: 'Onboarding Bundle', value: 'onboarding_bundle' },
			{ name: 'Password Setup', value: 'password_setup' },
			{ name: 'Verify Email', value: 'verify_email' },
			{ name: 'Welcome Email', value: 'welcome_email' },
		],
		default: 'onboarding_bundle',
		displayOptions: { show: { operation: ['previewCrmAccountEmail'] } },
	},
	{
		displayName: 'Email Locale',
		name: 'emailLocale',
		type: 'options',
		options: [
			{ name: 'English', value: 'en' },
			{ name: 'Italian', value: 'it' },
		],
		default: 'it',
		displayOptions: { show: { operation: ['previewCrmAccountEmail'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the input binary field containing the file to upload',
		displayOptions: {
			show: { operation: ['uploadMediaBinary', 'uploadShopFileBinary'] },
		},
	},
	{
		displayName: 'Media Purpose',
		name: 'mediaPurpose',
		type: 'options',
		options: [
			{ name: 'Background Video', value: 'background' },
			{ name: 'Content Video', value: 'upload' },
		],
		default: 'upload',
		displayOptions: { show: { operation: ['uploadMediaBinary'] } },
	},
	{
		displayName: 'Media Slot',
		name: 'mediaSlot',
		type: 'string',
		default: '',
		placeholder: 'hero-video',
		description: 'Optional stable slot. Reusing a slot replaces its current asset safely.',
		displayOptions: { show: { operation: ['uploadMediaBinary'] } },
	},
	{
		displayName: 'HTTP Method',
		name: 'customMethod',
		type: 'options',
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		default: 'GET',
		displayOptions: { show: { operation: ['customRequest'] } },
	},
	{
		displayName: 'Relative API Path',
		name: 'customPath',
		type: 'string',
		default: '/workspace',
		required: true,
		description:
			'A relative path below /api/v1. Absolute URLs are rejected so the token cannot be forwarded to another host.',
		displayOptions: { show: { operation: ['customRequest'] } },
	},
	{
		displayName: 'Query Parameters (JSON)',
		name: 'customQuery',
		type: 'json',
		default: '{}',
		description: 'An object of query-string parameters',
		displayOptions: { show: { operation: ['customRequest'] } },
	},
	{
		displayName: 'Request Body (JSON)',
		name: 'customBody',
		type: 'json',
		default: '{}',
		description: 'Optional JSON request body. It is ignored for GET requests.',
		displayOptions: { show: { operation: ['customRequest'] } },
	},
	{
		displayName: 'If-Match',
		name: 'customIfMatch',
		type: 'string',
		default: '',
		placeholder: 'W/"42"',
		description: 'Optional ETag or numeric revision for a custom revision-controlled write',
		displayOptions: { show: { operation: ['customRequest'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Include Response Headers and Status',
				name: 'includeResponseHeaders',
				type: 'boolean',
				default: false,
				description:
					'Whether to return body, response headers and status code instead of only the response body',
			},
		],
	},
];
