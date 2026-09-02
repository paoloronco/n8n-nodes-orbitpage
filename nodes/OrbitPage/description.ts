import type { INodeProperties } from 'n8n-workflow';
import { operationBodyGuidance } from './bodyGuidance';
import {
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationEffectLabel,
	operationsForResource,
	type OperationQueryParameter,
	type PathParameter,
} from './operations';

const bodyOperations = OPERATION_SPECS.filter((spec) => spec.kind === 'api' && Boolean(spec.body));
const revisionOperations = OPERATION_SPECS.filter((spec) => Boolean(spec.revisionSource)).map(
	(spec) => spec.value,
);
const publishOperations = OPERATION_SPECS.filter((spec) => spec.publishQuery).map(
	(spec) => spec.value,
);
const operationsWithQueryParameter = (parameter: OperationQueryParameter) =>
	OPERATION_SPECS.filter((spec) => spec.queryParameters?.includes(parameter)).map(
		(spec) => spec.value,
	);

const parameterCopy: Record<
	PathParameter,
	{ displayName: string; description: string; placeholder: string }
> = {
	linkId: {
		displayName: 'Content Block ID',
		description: 'The stable ID returned by Get Many Content Blocks',
		placeholder: 'e.g. portfolio-main',
	},
	key: {
		displayName: 'Public Text File Key',
		description: 'The managed text-file key returned by Get Page Settings',
		placeholder: 'e.g. robots.txt',
	},
	revision: {
		displayName: 'Published Version Number',
		description:
			'The previously published version to restore; this is not the current revision used for concurrency checking',
		placeholder: 'e.g. 42',
	},
	productId: {
		displayName: 'Product ID',
		description: 'The ID of the Shop product',
		placeholder: 'e.g. product_123',
	},
	subscriberId: {
		displayName: 'Subscriber ID',
		description: 'The ID of the newsletter subscriber',
		placeholder: 'e.g. subscriber_123',
	},
	campaignId: {
		displayName: 'Campaign ID',
		description: 'The ID of the newsletter campaign',
		placeholder: 'e.g. campaign_123',
	},
	memberUid: {
		displayName: 'Team Member ID',
		description: 'The member ID returned by Get Members and Invitations',
		placeholder: 'e.g. member_123',
	},
	invitationId: {
		displayName: 'Invitation ID',
		description: 'The pending workspace invitation ID',
		placeholder: 'e.g. invitation_123',
	},
};

export function pathParameterDisplayName(parameter: PathParameter): string {
	return parameterCopy[parameter].displayName;
}

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
					(spec) =>
						spec.parameters?.includes(parameter) ||
						(parameter === 'productId' && spec.kind === 'shopFileUpload'),
				).map((spec) => spec.value),
			},
		},
	}),
);

const operationProperties = RESOURCE_OPTIONS.map(
	(resource): INodeProperties => ({
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationsForResource(String(resource.value)),
		default: String(operationsForResource(String(resource.value))[0]?.value ?? ''),
		displayOptions: {
			show: {
				resource: [resource.value],
			},
		},
	}),
);

const operationHelpProperties = OPERATION_SPECS.map(
	(spec): INodeProperties => ({
		displayName: `Possible Effects: ${operationEffectLabel(spec.effect)}`,
		name: `operationHelp${spec.value.charAt(0).toUpperCase()}${spec.value.slice(1)}`,
		type: 'notice',
		default: '',
		description: `${spec.description}. Required scope: ${spec.scope ?? 'Depends on the API path'}.`,
		displayOptions: {
			show: {
				operation: [spec.value],
			},
		},
	}),
);

const bodyProperties = bodyOperations.map(
	(spec): INodeProperties => ({
		displayName: 'Request Body (JSON)',
		name: 'jsonBody',
		type: 'json',
		default: '{}',
		...(spec.body === 'required' ? { required: true } : {}),
		description: `${operationBodyGuidance(spec.value) ?? 'Send the JSON value accepted by this operation.'} ${
			spec.body === 'optional'
				? 'Leave {} to use the operation default described above.'
				: 'This request body is required.'
		} Send the JSON value directly; do not wrap it in body or data`,
		displayOptions: {
			show: {
				operation: [spec.value],
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
	...operationHelpProperties,
	...pathParameterProperties,
	...bodyProperties,
	{
		displayName: 'Revision Check',
		name: 'revisionMode',
		type: 'options',
		options: [
			{
				name: 'Use Latest Automatically (Recommended)',
				value: 'auto',
				description:
					'Read the current revision immediately before writing to prevent stale updates',
			},
			{
				name: 'Enter Revision Manually',
				value: 'manual',
				description: 'Use a revision or ETag from an earlier workflow step',
			},
		],
		default: 'auto',
		description: 'Controls how the node prevents one workflow from overwriting newer changes',
		displayOptions: {
			show: {
				operation: revisionOperations,
			},
		},
	},
	{
		displayName: 'Current Revision or ETag',
		name: 'ifMatchRevision',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. W/"42"',
		description: 'The ETag or numeric revision returned by the latest related GET request',
		displayOptions: {
			show: {
				operation: revisionOperations,
				revisionMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Publish Changes Immediately',
		name: 'publish',
		type: 'boolean',
		default: false,
		description:
			'Whether to publish these changes immediately. Leave disabled to keep them in the draft for review.',
		displayOptions: {
			show: {
				operation: publishOperations,
			},
		},
	},
	{
		displayName: 'Analytics Period',
		name: 'days',
		type: 'options',
		options: [
			{ name: '7 Days', value: 7 },
			{ name: '30 Days', value: 30 },
			{ name: '90 Days', value: 90 },
		],
		default: 30,
		description: 'The requested reporting window. The workspace plan can apply a smaller limit.',
		displayOptions: { show: { operation: operationsWithQueryParameter('days') } },
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
		displayOptions: { show: { operation: operationsWithQueryParameter('sections') } },
	},
	{
		displayName: 'Shop Read Mode',
		name: 'shopReadMode',
		type: 'options',
		options: [
			{
				name: 'Automatic (Recommended)',
				value: 'auto',
				description:
					'Return Shop data and let OrbitPage initialize missing private state or refresh stale Stripe status when needed',
			},
			{
				name: 'Force Stripe Status Refresh',
				value: 'force',
				description: 'Request a Stripe status check before returning Shop data',
			},
			{
				name: 'Read-Only Snapshot',
				value: 'snapshot',
				description:
					'Return current stored Shop data without initializing state or contacting Stripe',
			},
		],
		default: 'auto',
		description: 'Controls whether Get Shop Overview may perform provider or private-state work',
		displayOptions: { show: { operation: operationsWithQueryParameter('refresh') } },
	},
	{
		displayName: 'Input Binary Field Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the incoming binary field that contains the file to upload',
		displayOptions: {
			show: { operation: ['uploadMediaBinary', 'uploadShopFileBinary'] },
		},
	},
	{
		displayName: 'Video Placement',
		name: 'mediaPurpose',
		type: 'options',
		options: [
			{ name: 'Page Background', value: 'background' },
			{ name: 'Content Block', value: 'upload' },
		],
		default: 'upload',
		displayOptions: { show: { operation: ['uploadMediaBinary'] } },
	},
	{
		displayName: 'Video Slot ID',
		name: 'mediaSlot',
		type: 'string',
		default: '',
		placeholder: 'e.g. hero-video',
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
		displayName: 'API Path',
		name: 'customPath',
		type: 'string',
		default: '/workspace',
		required: true,
		description:
			'Relative public workspace path below /api/v1, such as /workspace. Absolute URLs and paths outside the public workspace API contract are rejected.',
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
		displayOptions: {
			show: {
				operation: ['customRequest'],
				customMethod: ['DELETE', 'PATCH', 'POST', 'PUT'],
			},
		},
	},
	{
		displayName: 'Revision or ETag (If-Match)',
		name: 'customIfMatch',
		type: 'string',
		default: '',
		placeholder: 'e.g. W/"42"',
		description: 'Optional ETag or numeric revision for a custom revision-controlled write',
		displayOptions: {
			show: {
				operation: ['customRequest'],
				customMethod: ['DELETE', 'PATCH', 'POST', 'PUT'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Include HTTP Response Details',
				name: 'includeResponseHeaders',
				type: 'boolean',
				default: false,
				description:
					'Whether to return body, headers, statusCode, and statusMessage instead of only the response body',
			},
		],
	},
];
