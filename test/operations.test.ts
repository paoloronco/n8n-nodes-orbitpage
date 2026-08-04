// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports -- Test-only README contract check; this import is not part of the packaged node runtime.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	API_OPERATION_SPECS,
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationSpec,
	operationsForResource,
} from '../nodes/OrbitPage/operations';

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

describe('OrbitPage operation catalog', () => {
	it('exposes all 84 operations from the public API contract', () => {
		expect(API_OPERATION_SPECS).toHaveLength(84);
		expect(new Set(API_OPERATION_SPECS.map((spec) => spec.value)).size).toBe(84);
		expect(new Set(API_OPERATION_SPECS.map((spec) => `${spec.method} ${spec.path}`)).size).toBe(84);
	});

	it('declares authentication scopes and valid revision preflights', () => {
		for (const spec of API_OPERATION_SPECS) {
			expect(spec.scope, spec.value).toMatch(/^[a-z]+:(read|write)$/);
			if (spec.revisionSource) {
				expect(spec.method, spec.value).not.toBe('GET');
				expect(spec.revisionSource, spec.value).toMatch(/^\/[a-z-]+$/);
			}
		}
	});

	it('keeps every operation reachable through one resource selector', () => {
		const resourceValues = new Set(RESOURCE_OPTIONS.map((resource) => String(resource.value)));
		expect(OPERATION_SPECS).toHaveLength(87);
		for (const spec of OPERATION_SPECS) {
			expect(resourceValues.has(spec.resource), spec.value).toBe(true);
			expect(operationsForResource(spec.resource).some((option) => option.value === spec.value)).toBe(true);
			expect(operationSpec(spec.value)).toBe(spec);
		}
	});

	it('includes the two safe binary workflows and a forward-compatible request', () => {
		expect(operationSpec('uploadMediaBinary')?.kind).toBe('mediaUpload');
		expect(operationSpec('uploadShopFileBinary')?.kind).toBe('shopFileUpload');
		expect(operationSpec('customRequest')?.kind).toBe('custom');
	});

	it('documents setup, the first safe read, examples and actionable failures', () => {
		for (const requiredDocumentation of [
			'## End-to-end quick start',
			'Personal Workspace Token',
			'https://orbitpage.com',
			'GET /api/v1/workspace',
			'Workspace → Get',
			'examples/read-workspace.json',
			'examples/watch-publication.json',
			'## Troubleshooting',
			'Maximum number of redirects exceeded',
			'401 Unauthorized',
			'403 Forbidden',
			'409 Conflict',
			'428 Precondition Required',
			'429 Too Many Requests',
		]) {
			expect(readme).toContain(requiredDocumentation);
		}
	});
});
