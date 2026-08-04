import { createHash } from 'node:crypto';
import type {
	GenericValue,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { cronNodeOptions, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { orbitPageApiRequest, type OrbitPageRequest } from '../OrbitPage/transport';
import { resolveMainConnectionType } from '../shared/n8nCompatibility';

const mainConnectionType = resolveMainConnectionType(NodeConnectionTypes);

export const TRIGGER_REQUESTS: Record<string, OrbitPageRequest> = {
	workspaceRevisionChanged: { method: 'GET', path: '/workspace' },
	publicationChanged: { method: 'GET', path: '/publication' },
	domainChanged: { method: 'GET', path: '/domains' },
	shopChanged: { method: 'GET', path: '/shop', qs: { refresh: '0' } },
};

const eventNames: Record<string, string> = {
	workspaceRevisionChanged: 'Page Draft Changed',
	publicationChanged: 'Publishing Details Changed',
	domainChanged: 'Custom Domain Status Changed',
	shopChanged: 'Shop Changed',
};
const eventSubtitle = `={{(${JSON.stringify(eventNames)})[$parameter["event"]] || "Choose a trigger"}}`;

function stableValue(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(stableValue);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value as Record<string, unknown>)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([key, nested]) => [key, stableValue(nested)]),
		);
	}
	return value;
}

const volatileShopRecordFields = new Set(['createdAt', 'updatedAt', 'stripeStatusCheckedAt']);

export function observedValue(event: string, response: unknown): unknown {
	if (
		event === 'workspaceRevisionChanged' &&
		response &&
		typeof response === 'object' &&
		!Array.isArray(response)
	) {
		const workspace = response as IDataObject;
		return { revision: workspace.revision };
	}
	if (
		event === 'shopChanged' &&
		response &&
		typeof response === 'object' &&
		!Array.isArray(response)
	) {
		const shopResponse = response as IDataObject;
		const shopRecord = shopResponse.shop;
		if (shopRecord && typeof shopRecord === 'object' && !Array.isArray(shopRecord)) {
			return {
				...shopResponse,
				shop: Object.fromEntries(
					Object.entries(shopRecord as IDataObject).filter(
						([key]) => !volatileShopRecordFields.has(key),
					),
				),
			};
		}
	}
	return response;
}

function fingerprint(value: unknown): string {
	return createHash('sha256')
		.update(JSON.stringify(stableValue(value)))
		.digest('hex');
}

function outputValue(value: unknown): GenericValue {
	return value as GenericValue;
}

export class OrbitPageTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OrbitPage Trigger',
		name: 'orbitPageTrigger',
		icon: {
			light: 'file:../../icons/orbitpage.svg',
			dark: 'file:../../icons/orbitpage.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: eventSubtitle,
		description:
			'Starts a workflow when an OrbitPage draft, publication, custom domain, or Shop state changes',
		defaults: { name: 'OrbitPage Trigger' },
		usableAsTool: undefined,
		inputs: [],
		outputs: [mainConnectionType],
		credentials: [{ name: 'orbitPageApi', required: true }],
		polling: true,
		properties: [
			{
				displayName: 'Poll Times',
				name: 'pollTimes',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Poll Time' },
				default: { item: [{ mode: 'everyMinute' }] },
				description: 'Times at which n8n checks OrbitPage for changes',
				placeholder: 'Add Poll Time',
				options: cronNodeOptions,
			},
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Custom Domain Status Changed',
						value: 'domainChanged',
						description:
							'DNS instructions, verification, or the active custom domain changed. Requires domains:read.',
					},
					{
						name: 'Publishing Details Changed',
						value: 'publicationChanged',
						description:
							'Draft revision, published revision, publishing status, or public URL changed. Requires publication:read.',
					},
					{
						name: 'Shop Changed',
						value: 'shopChanged',
						description:
							'Products, orders, customers, Stripe connection, appearance, or Shop publishing state changed. Uses a read-only snapshot and requires shop:read.',
					},
					{
						name: 'Page Draft Changed',
						value: 'workspaceRevisionChanged',
						description: 'The editable page revision changed. Requires workspace:read.',
					},
				],
				default: 'workspaceRevisionChanged',
			},
			{
				displayName: 'Run on First Poll',
				name: 'emitInitialState',
				type: 'boolean',
				default: false,
				description:
					'Whether to run the workflow with the current state on the first production poll. Manual tests always return the current state.',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = String(this.getNodeParameter('event'));
		const request = TRIGGER_REQUESTS[event];
		if (!request) {
			throw new NodeOperationError(this.getNode(), `Unsupported OrbitPage trigger event: ${event}`);
		}
		const current = await orbitPageApiRequest(this, request);
		const signature = fingerprint(observedValue(event, current));
		const staticData = this.getWorkflowStaticData('node');
		const previousSignature =
			typeof staticData.signature === 'string' ? staticData.signature : null;
		const manual = this.getMode() === 'manual';
		const emitInitialState = this.getNodeParameter('emitInitialState', false) === true;

		if (!manual) staticData.signature = signature;
		if (!manual && previousSignature === null && !emitInitialState) return null;
		if (!manual && previousSignature === signature) return null;

		return [
			this.helpers.returnJsonArray([
				{
					event,
					eventName: eventNames[event] ?? event,
					initial: previousSignature === null,
					previousSignature,
					currentSignature: signature,
					observedAt: new Date().toISOString(),
					data: outputValue(current),
				},
			]),
		];
	}
}
