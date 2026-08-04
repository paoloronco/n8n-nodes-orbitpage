import type {
	GenericValue,
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { orbitPageProperties } from './description';
import {
	operationSpec,
	type OperationSpec,
	type OrbitPageMethod,
	type PathParameter,
} from './operations';
import { fullResponse, orbitPageApiRequest, responseRevision } from './transport';
import { resolveMainConnectionType } from '../shared/n8nCompatibility';

const mainConnectionType = resolveMainConnectionType(NodeConnectionTypes);

function parseJson(
	context: IExecuteFunctions,
	itemIndex: number,
	value: unknown,
	label: string,
): IHttpRequestOptions['body'] {
	if (value && typeof value === 'object') return value as IHttpRequestOptions['body'];
	if (typeof value !== 'string' || !value.trim()) return {};
	try {
		return JSON.parse(value) as IHttpRequestOptions['body'];
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`${label} must be valid JSON: ${error instanceof Error ? error.message : 'parse failed'}`,
			{ itemIndex },
		);
	}
}

function parseJsonObject(
	context: IExecuteFunctions,
	itemIndex: number,
	value: unknown,
	label: string,
): IDataObject {
	const parsed = parseJson(context, itemIndex, value, label);
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Buffer.isBuffer(parsed)) {
		throw new NodeOperationError(context.getNode(), `${label} must be a JSON object`, { itemIndex });
	}
	return parsed as IDataObject;
}

function jsonObject(value: unknown): IDataObject {
	if (value && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value)) {
		return value as IDataObject;
	}
	return { data: value as GenericValue };
}

function fullResponseOutput(response: IN8nHttpFullResponse): IDataObject {
	return {
		body: response.body as GenericValue,
		headers: response.headers,
		statusCode: response.statusCode,
		...(response.statusMessage ? { statusMessage: response.statusMessage } : {}),
	};
}

function safeCustomPath(context: IExecuteFunctions, itemIndex: number, value: string): string {
	const path = value.trim();
	if (!path.startsWith('/') || path.startsWith('//')) {
		throw new NodeOperationError(context.getNode(), 'Relative API Path must begin with one slash', {
			itemIndex,
		});
	}
	if (path.includes('?') || path.includes('#') || path.includes('://')) {
		throw new NodeOperationError(
			context.getNode(),
			'Put query parameters in Query Parameters (JSON), not in Relative API Path',
			{ itemIndex },
		);
	}
	if (path === '/api/v1' || path.startsWith('/api/v1/')) {
		throw new NodeOperationError(
			context.getNode(),
			'Relative API Path is already below /api/v1; for example, use /workspace',
			{ itemIndex },
		);
	}
	for (const segment of path.split('/')) {
		let decoded = segment;
		try {
			decoded = decodeURIComponent(segment);
		} catch {
			throw new NodeOperationError(context.getNode(), 'Relative API Path contains invalid URL encoding', {
				itemIndex,
			});
		}
		if (decoded === '.' || decoded === '..') {
			throw new NodeOperationError(context.getNode(), 'Relative API Path cannot contain dot segments', {
				itemIndex,
			});
		}
	}
	return path;
}

function operationPath(context: IExecuteFunctions, spec: OperationSpec, itemIndex: number): string {
	let path = spec.path ?? '';
	for (const parameter of spec.parameters ?? []) {
		const value = context.getNodeParameter(parameter, itemIndex);
		if (value === '' || value === undefined || value === null) {
			throw new NodeOperationError(context.getNode(), `${parameter} is required`, { itemIndex });
		}
		path = path.replace(`{${parameter}}`, encodeURIComponent(String(value)));
	}
	if (path.includes('{')) {
		throw new NodeOperationError(context.getNode(), 'The operation path still contains an unresolved parameter', {
			itemIndex,
		});
	}
	return path;
}

function operationQuery(context: IExecuteFunctions, spec: OperationSpec, itemIndex: number): IDataObject {
	const qs: IDataObject = {};
	if (spec.publishQuery && context.getNodeParameter('publish', itemIndex, false) === true) qs.publish = '1';
	if (spec.value === 'getAnalytics') qs.days = context.getNodeParameter('days', itemIndex, 30) as number;
	if (spec.value === 'exportBackup') {
		const sections = context.getNodeParameter('sections', itemIndex, []) as string[];
		if (sections.length) qs.sections = sections.join(',');
	}
	if (spec.value === 'getShop' && context.getNodeParameter('refresh', itemIndex, false) === true) qs.refresh = '1';
	if (['getOperatorOverview', 'listCrmProspects'].includes(spec.value)) {
		const search = String(context.getNodeParameter('search', itemIndex, '')).trim();
		if (search) qs.search = search;
	}
	if (spec.value === 'previewCrmAccountEmail') {
		qs.action = context.getNodeParameter('emailAction', itemIndex) as string;
		qs.locale = context.getNodeParameter('emailLocale', itemIndex) as string;
	}
	return qs;
}

async function revisionHeader(
	context: IExecuteFunctions,
	spec: OperationSpec,
	itemIndex: number,
): Promise<string | undefined> {
	if (!spec.revisionSource) return undefined;
	const revisionMode = context.getNodeParameter('revisionMode', itemIndex, 'auto') as string;
	if (revisionMode === 'manual') {
		const revision = String(context.getNodeParameter('revision', itemIndex, '')).trim();
		if (!revision) {
			throw new NodeOperationError(context.getNode(), 'ETag or Revision is required in manual mode', {
				itemIndex,
			});
		}
		return revision;
	}
	const response = fullResponse(
		await orbitPageApiRequest(context, {
			method: 'GET',
			path: spec.revisionSource,
			returnFullResponse: true,
		}),
	);
	return responseRevision(response);
}

function uploadResponse(value: unknown, file: IDataObject): IDataObject {
	const result = jsonObject(value);
	return { ...result, uploadedFile: file };
}

async function putSignedBinary(
	context: IExecuteFunctions,
	itemIndex: number,
	uploadUrl: string,
	headers: IDataObject,
	buffer: Buffer,
): Promise<void> {
	const target = new URL(uploadUrl);
	if (target.protocol !== 'https:') {
		throw new NodeOperationError(context.getNode(), 'The direct upload URL did not use HTTPS', {
			itemIndex,
		});
	}
	await context.helpers.httpRequest({
		method: 'PUT',
		url: uploadUrl,
		headers,
		body: buffer,
		json: false,
		sendCredentialsOnCrossOriginRedirect: false,
		allowedDomains: target.hostname,
	});
}

function reservationObject(
	context: IExecuteFunctions,
	itemIndex: number,
	value: unknown,
): IDataObject {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new NodeOperationError(context.getNode(), 'OrbitPage returned an invalid upload reservation', {
			itemIndex,
		});
	}
	return value as IDataObject;
}

async function uploadMediaBinary(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const binaryPropertyName = String(context.getNodeParameter('binaryPropertyName', itemIndex, 'data'));
	const binary = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binary);
	const contentType = binary.mimeType;
	if (!['video/mp4', 'video/webm'].includes(contentType)) {
		throw new NodeOperationError(
			context.getNode(),
			'OrbitPage direct media upload accepts only MP4 or WebM video binaries',
			{ itemIndex },
		);
	}
	const filename = binary.fileName || `orbitpage-video.${contentType === 'video/mp4' ? 'mp4' : 'webm'}`;
	const slot = String(context.getNodeParameter('mediaSlot', itemIndex, '')).trim();
	const reserveBody: IDataObject = {
		filename,
		contentType,
		sizeBytes: buffer.length,
		purpose: context.getNodeParameter('mediaPurpose', itemIndex, 'upload') as string,
		...(slot ? { slot } : {}),
	};
	const reservation = reservationObject(
		context,
		itemIndex,
		await orbitPageApiRequest(context, {
			method: 'POST',
			path: '/media/uploads/reserve',
			body: reserveBody,
		}),
	);
	const uploadUrl = String(reservation.uploadUrl || '');
	const uploadToken = String(reservation.uploadToken || '');
	const reservedSlot = String(reservation.slot || '');
	if (!uploadUrl || !uploadToken || !reservedSlot) {
		throw new NodeOperationError(context.getNode(), 'Upload reservation is incomplete', { itemIndex });
	}
	try {
		await putSignedBinary(context, itemIndex, uploadUrl, (reservation.headers as IDataObject) || {}, buffer);
		const finalized = await orbitPageApiRequest(context, {
			method: 'POST',
			path: '/media/uploads/finalize',
			body: { slot: reservedSlot, uploadToken },
		});
		return uploadResponse(finalized, { filename, contentType, sizeBytes: buffer.length, slot: reservedSlot });
	} catch (error) {
		await orbitPageApiRequest(context, {
			method: 'DELETE',
			path: '/media/uploads',
			body: { slot: reservedSlot, uploadToken },
		}).catch(() => undefined);
		throw new NodeOperationError(context.getNode(), error as Error, { itemIndex });
	}
}

async function uploadShopFileBinary(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const productId = String(context.getNodeParameter('productId', itemIndex)).trim();
	const binaryPropertyName = String(context.getNodeParameter('binaryPropertyName', itemIndex, 'data'));
	const binary = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binary);
	const filename = binary.fileName || 'orbitpage-product-file';
	const contentType = binary.mimeType || 'application/octet-stream';
	const reservation = reservationObject(
		context,
		itemIndex,
		await orbitPageApiRequest(context, {
			method: 'POST',
			path: '/shop/uploads/reserve',
			body: { productId, filename, contentType, sizeBytes: buffer.length },
		}),
	);
	const uploadUrl = String(reservation.uploadUrl || '');
	const uploadToken = String(reservation.uploadToken || '');
	if (!uploadUrl || !uploadToken) {
		throw new NodeOperationError(context.getNode(), 'Shop upload reservation is incomplete', {
			itemIndex,
		});
	}
	await putSignedBinary(context, itemIndex, uploadUrl, (reservation.headers as IDataObject) || {}, buffer);
	const finalized = await orbitPageApiRequest(context, {
		method: 'POST',
		path: '/shop/uploads/finalize',
		body: { uploadToken },
	});
	return uploadResponse(finalized, { filename, contentType, sizeBytes: buffer.length, productId });
}

async function customRequest(
	context: IExecuteFunctions,
	itemIndex: number,
	includeResponseHeaders: boolean,
): Promise<unknown> {
	const method = context.getNodeParameter('customMethod', itemIndex) as OrbitPageMethod;
	const path = safeCustomPath(context, itemIndex, String(context.getNodeParameter('customPath', itemIndex)));
	const qs = parseJsonObject(
		context,
		itemIndex,
		context.getNodeParameter('customQuery', itemIndex, '{}'),
		'Query Parameters',
	);
	const ifMatch = String(context.getNodeParameter('customIfMatch', itemIndex, '')).trim();
	return await orbitPageApiRequest(context, {
		method,
		path,
		qs,
		...(method === 'GET'
			? {}
			: {
					body: parseJson(
						context,
						itemIndex,
						context.getNodeParameter('customBody', itemIndex, '{}'),
						'Request Body',
					),
				}),
		...(ifMatch ? { headers: { 'If-Match': ifMatch } } : {}),
		returnFullResponse: includeResponseHeaders,
	});
}

export class OrbitPage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OrbitPage',
		name: 'orbitPage',
		icon: {
			light: 'file:../../icons/orbitpage.svg',
			dark: 'file:../../icons/orbitpage.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage OrbitPage end to end through the Automation REST API',
		defaults: { name: 'OrbitPage' },
		usableAsTool: true,
		inputs: [mainConnectionType],
		outputs: [mainConnectionType],
		credentials: [{ name: 'orbitPageApi', required: true }],
		properties: orbitPageProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = String(this.getNodeParameter('operation', itemIndex));
				const spec = operationSpec(operation);
				if (!spec) {
					throw new NodeOperationError(this.getNode(), `Unsupported OrbitPage operation: ${operation}`, {
						itemIndex,
					});
				}
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
				const includeResponseHeaders = options.includeResponseHeaders === true;
				let response: unknown;

				if (spec.kind === 'mediaUpload') response = await uploadMediaBinary(this, itemIndex);
				else if (spec.kind === 'shopFileUpload') response = await uploadShopFileBinary(this, itemIndex);
				else if (spec.kind === 'custom') response = await customRequest(this, itemIndex, includeResponseHeaders);
				else {
					const revision = await revisionHeader(this, spec, itemIndex);
					response = await orbitPageApiRequest(this, {
						method: spec.method as OrbitPageMethod,
						path: operationPath(this, spec, itemIndex),
						qs: operationQuery(this, spec, itemIndex),
						...(spec.body
							? {
									body: parseJson(
										this,
										itemIndex,
										this.getNodeParameter('jsonBody', itemIndex, '{}'),
										'JSON Body',
									),
								}
							: {}),
						...(revision ? { headers: { 'If-Match': revision } } : {}),
						returnFullResponse: includeResponseHeaders,
					});
				}

				const output = includeResponseHeaders && spec.kind !== 'mediaUpload' && spec.kind !== 'shopFileUpload'
					? fullResponseOutput(fullResponse(response))
					: jsonObject(response);
				returnData.push({ json: output, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error instanceof Error ? error.message : String(error) },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}
		return [returnData];
	}
}

export const pathParameters: PathParameter[] = [
	'linkId',
	'key',
	'revision',
	'productId',
	'subscriberId',
	'campaignId',
	'memberUid',
	'invitationId',
	'prospectId',
	'activityId',
	'promotionCodeId',
	'tenantId',
];
