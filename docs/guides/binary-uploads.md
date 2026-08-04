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

Choose **Media Library > Upload or Replace Video From Binary Input** and
configure:

- **Input Binary Field Name**: the n8n binary property, normally `data`;
- **Video Placement**: page background or content block;
- **Video Slot ID**: an optional stable target slot.

The convenience operation accepts `video/mp4` and `video/webm`. It uses the
binary filename when available and otherwise creates an appropriate fallback
filename. If the selected placement and slot already contain a video, the
finalization replaces that file reference.

The sequence is:

1. `POST /media/uploads/reserve`;
2. direct signed `PUT` to storage;
3. `POST /media/uploads/finalize`;
4. best-effort `DELETE /media/uploads` if upload or finalization fails.

The output includes the finalized API response and an `uploadedFile` object
with filename, content type, byte size, and reserved slot.

## Upload a protected Shop file

Choose **Shop > Upload or Replace Product File From Binary Input**, then
provide:

- the target product ID;
- **Input Binary Field Name**, normally `data`.

The sequence is:

1. `POST /shop/uploads/reserve`;
2. direct signed `PUT` to storage;
3. `POST /shop/uploads/finalize`;
4. best-effort `DELETE /shop/uploads` if upload or finalization fails.

The output adds `uploadedFile` metadata containing the product ID, filename,
content type, and byte size. OrbitPage validates the product, file type, plan,
and storage allowance. If the product already has a protected file, finalizing
the upload replaces its current file reference.

When the direct upload or finalization fails, the helper requests cancellation
to clear the active reservation, release reserved storage, and remove staged
data. Cleanup is best effort so the original upload error remains visible; an
uncleared reservation also expires through OrbitPage's scheduled cleanup.

## Advanced low-level operations

Use the complete binary helpers above for normal n8n workflows. The following
operations expose individual API stages for workflows that deliberately manage
temporary upload URLs and tokens themselves:

- **Media Library > Reserve Video Upload (Advanced)**,
  **Finalize Reserved Video Upload (Advanced)**, and
  **Cancel Reserved Video Upload (Advanced)**;
- **Shop > Reserve Product File Upload (Advanced)** and
  **Finalize or Replace Product File Upload (Advanced)**, plus
  **Cancel Reserved Product File Upload (Advanced)**.

Do not mix a complete binary helper with its low-level stages in the same
upload. A reservation response contains short-lived sensitive values, and a
successful reserve call alone does not register a usable file.

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
