# Binary uploads

The OrbitPage action node includes compound operations that transfer binary
data directly to signed storage URLs. This avoids routing large files through
the OrbitPage Automation API.

## Security model

For both upload workflows, the node:

1. creates a reservation through the authenticated OrbitPage API;
2. verifies that the returned upload URL uses HTTPS;
3. uploads bytes directly to that exact storage hostname;
4. does not forward the OrbitPage bearer token to the storage host;
5. finalizes the reservation through the authenticated OrbitPage API.

Signed upload URLs and upload tokens are temporary secrets. Do not log them,
store them in workflow data, or send them to another service.

## Upload a video

Choose **Media > Upload Video Binary** and configure:

- **Input Binary Field**: the n8n binary property, normally `data`;
- **Purpose**: the intended OrbitPage media use;
- **Slot**: an optional target slot when the operation exposes it.

The convenience operation accepts `video/mp4` and `video/webm`. It uses the
binary filename when available and otherwise creates an appropriate fallback
filename.

The sequence is:

1. `POST /media/uploads/reserve`;
2. direct signed `PUT` to storage;
3. `POST /media/uploads/finalize`;
4. best-effort `DELETE /media/uploads` if upload or finalization fails.

The output includes the finalized API response and an `uploadedFile` object
with filename, content type, byte size, and reserved slot.

## Upload a protected Shop file

Choose **Shop > Upload Product File Binary**, then provide:

- the target product ID;
- the input binary field, normally `data`.

The sequence is:

1. `POST /shop/uploads/reserve`;
2. direct signed `PUT` to storage;
3. `POST /shop/uploads/finalize`.

The output adds `uploadedFile` metadata containing the product ID, filename,
content type, and byte size. OrbitPage validates the product, file type, plan,
and storage allowance.

Unlike the media convenience operation, the current Shop upload flow has no
automatic abort request after a failed direct upload or finalization. A failed
reservation should be allowed to expire, or be inspected through the supported
Shop management flow before retrying.

## Retry guidance

- Retry the complete compound operation with the original binary input instead
  of reusing a signed URL or upload token.
- Do not retry a `4xx` validation response without correcting the product,
  file, scope, or plan condition.
- For `429 Too Many Requests`, wait for `Retry-After` and use exponential
  backoff with jitter.
- Confirm the n8n worker has enough memory for the binary because the node reads
  it into a buffer before upload.
- Keep the reserve, upload, and finalize steps in one execution unless a custom
  workflow has a specific reason to use the lower-level API operations.

## Required scopes

- Media upload: `media:write`
- Protected Shop upload: `shop:write`

See [Troubleshooting](troubleshooting.md#binary-upload-failures) for common
failure points.
