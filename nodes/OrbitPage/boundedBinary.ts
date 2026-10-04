import type { IBinaryData, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const MAX_MEDIA_UPLOAD_BYTES = 100 * 1024 * 1024;
export const MAX_SHOP_FILE_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function boundedBinaryBuffer(
	context: IExecuteFunctions,
	itemIndex: number,
	binary: IBinaryData,
	maximumBytes: number,
): Promise<Buffer> {
	const tooLarge = () =>
		new NodeOperationError(
			context.getNode(),
			`Binary input exceeds the ${maximumBytes / (1024 * 1024)} MiB upload limit`,
			{ itemIndex },
		);

	if (typeof binary.bytes === 'number' && binary.bytes > maximumBytes) throw tooLarge();

	if (binary.id) {
		const metadata = await context.helpers.getBinaryMetadata(binary.id);
		if (metadata.fileSize > maximumBytes) throw tooLarge();

		const stream = await context.helpers.getBinaryStream(binary.id, 64 * 1024);
		const chunks: Buffer[] = [];
		let size = 0;
		try {
			for await (const chunk of stream) {
				const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
				size += bytes.length;
				if (size > maximumBytes) throw tooLarge();
				chunks.push(bytes);
			}
		} finally {
			stream.destroy();
		}
		return Buffer.concat(chunks, size);
	}

	// Inline n8n binary data is base64. Its encoded length gives a bound before
	// the n8n helper allocates the decoded buffer; the actual length is checked too.
	if (typeof binary.data !== 'string' || binary.data.length > 4 * Math.ceil(maximumBytes / 3)) {
		throw tooLarge();
	}
	const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binary);
	if (buffer.length > maximumBytes) throw tooLarge();
	return buffer;
}
