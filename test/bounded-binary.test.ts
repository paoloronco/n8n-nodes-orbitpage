import type { IBinaryData, IExecuteFunctions } from 'n8n-workflow';
import { describe, expect, it, vi } from 'vitest';
import { boundedBinaryBuffer } from '../nodes/OrbitPage/boundedBinary';

function context(helpers: Record<string, unknown>) {
	return {
		getNode: () => ({ name: 'OrbitPage', type: 'n8n-nodes-orbitpage.orbitPage' }),
		helpers,
	} as unknown as IExecuteFunctions;
}

function binary(data: Partial<IBinaryData>): IBinaryData {
	return { data: '', mimeType: 'application/pdf', ...data };
}

function binaryStream(chunks: Buffer[]) {
	return {
		destroy: vi.fn(),
		async *[Symbol.asyncIterator]() {
			for (const chunk of chunks) yield chunk;
		},
	};
}

describe('bounded binary input', () => {
	it('rejects declared and inline sizes before decoding', async () => {
		const getBinaryDataBuffer = vi.fn();
		const execution = context({ getBinaryDataBuffer });
		await expect(boundedBinaryBuffer(execution, 0, binary({ bytes: 11 }), 10)).rejects.toThrow(
			'upload limit',
		);
		await expect(
			boundedBinaryBuffer(execution, 0, binary({ data: 'a'.repeat(17) }), 10),
		).rejects.toThrow('upload limit');
		expect(getBinaryDataBuffer).not.toHaveBeenCalled();
	});

	it('rejects stored data using metadata before opening its stream', async () => {
		const getBinaryStream = vi.fn();
		const execution = context({
			getBinaryMetadata: vi.fn().mockResolvedValue({ fileSize: 11 }),
			getBinaryStream,
		});
		await expect(boundedBinaryBuffer(execution, 0, binary({ id: 'stored' }), 10)).rejects.toThrow(
			'upload limit',
		);
		expect(getBinaryStream).not.toHaveBeenCalled();
	});

	it('stops a stored stream when actual bytes exceed the limit despite stale metadata', async () => {
		const stream = binaryStream([Buffer.from('123456'), Buffer.from('78901')]);
		const execution = context({
			getBinaryMetadata: vi.fn().mockResolvedValue({ fileSize: 5 }),
			getBinaryStream: vi.fn().mockResolvedValue(stream),
		});
		await expect(boundedBinaryBuffer(execution, 0, binary({ id: 'stored' }), 10)).rejects.toThrow(
			'upload limit',
		);
		expect(stream.destroy).toHaveBeenCalledOnce();
	});

	it('reads a valid stored binary within the bound', async () => {
		const execution = context({
			getBinaryMetadata: vi.fn().mockResolvedValue({ fileSize: 4 }),
			getBinaryStream: vi.fn().mockResolvedValue(binaryStream([Buffer.from('test')])),
		});
		await expect(boundedBinaryBuffer(execution, 0, binary({ id: 'stored' }), 10)).resolves.toEqual(
			Buffer.from('test'),
		);
	});
});
