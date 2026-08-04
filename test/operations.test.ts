import { describe, expect, it } from 'vitest';
import {
	API_OPERATION_SPECS,
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationSpec,
	operationsForResource,
} from '../nodes/OrbitPage/operations';

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
});
