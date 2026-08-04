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
import { orbitPageApiRequest } from '../OrbitPage/transport';

const eventPaths: Record<string, string> = {
	workspaceRevisionChanged: '/workspace',
	publicationChanged: '/publication',
	domainChanged: '/domains',
	shopChanged: '/shop',
};

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

function observedValue(event: string, response: unknown): unknown {
	if (
		event === 'workspaceRevisionChanged' &&
		response &&
		typeof response === 'object' &&
		!Array.isArray(response)
	) {
		const workspace = response as IDataObject;
		return { revision: workspace.revision };
	}
	return response;
}

function fingerprint(value: unknown): string {
	return createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
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
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts a workflow when selected OrbitPage state changes',
		defaults: { name: 'OrbitPage Trigger' },
		usableAsTool: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'orbitPageApi', required: true }],
		polling: true,
		properties: [
			{
				displayName: 'Poll Times',
				name: 'pollTimes',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Poll Time' },
				default: { item: [{ mode: 'everyMinute' }] },
				description: 'Time at which polling should occur',
				placeholder: 'Add Poll Time',
				options: cronNodeOptions,
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Custom Domain Changed',
						value: 'domainChanged',
						description: 'DNS requirements, verification or active domain changed',
					},
					{
						name: 'Publication State Changed',
						value: 'publicationChanged',
						description: 'Draft revision, published revision, status or public URL changed',
					},
					{
						name: 'Shop State Changed',
						value: 'shopChanged',
						description: 'Products, commerce connection, appearance or publication state changed',
					},
					{
						name: 'Workspace Revision Changed',
						value: 'workspaceRevisionChanged',
						description: 'The editable workspace revision changed',
					},
				],
				default: 'workspaceRevisionChanged',
			},
			{
				displayName: 'Emit Initial State',
				name: 'emitInitialState',
				type: 'boolean',
				default: false,
				description:
					'Whether the first production poll should emit the current state. Manual tests always return the current state.',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = String(this.getNodeParameter('event'));
		const path = eventPaths[event];
		if (!path) {
			throw new NodeOperationError(this.getNode(), `Unsupported OrbitPage trigger event: ${event}`);
		}
		const current = await orbitPageApiRequest(this, { method: 'GET', path });
		const signature = fingerprint(observedValue(event, current));
		const staticData = this.getWorkflowStaticData('node');
		const previousSignature = typeof staticData.signature === 'string' ? staticData.signature : null;
		const manual = this.getMode() === 'manual';
		const emitInitialState = this.getNodeParameter('emitInitialState', false) === true;

		if (!manual) staticData.signature = signature;
		if (!manual && previousSignature === null && !emitInitialState) return null;
		if (!manual && previousSignature === signature) return null;

		return [
			this.helpers.returnJsonArray([
				{
					event,
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
