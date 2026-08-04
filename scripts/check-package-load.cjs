'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

const actualWorkflow = require('n8n-workflow');
const distRoot = path.resolve(__dirname, '..', 'dist');
const targets = [
	['nodes/OrbitPage/OrbitPage.node.js', 'OrbitPage', 'orbitPage'],
	['nodes/OrbitPageTrigger/OrbitPageTrigger.node.js', 'OrbitPageTrigger', 'orbitPageTrigger'],
	['credentials/OrbitPageApi.credentials.js', 'OrbitPageApi', 'orbitPageApi'],
];

function clearDistCache() {
	for (const filePath of Object.keys(require.cache)) {
		if (filePath.startsWith(distRoot)) delete require.cache[filePath];
	}
}

function loadTargets(workflowExports, scenario) {
	const originalLoad = Module._load;
	Module._load = function load(request, parent, isMain) {
		if (request === 'n8n-workflow') return workflowExports;
		return originalLoad.call(this, request, parent, isMain);
	};

	try {
		clearDistCache();
		const context = vm.createContext({ require });
		for (const [relativePath, className, typeName] of targets) {
			const filePath = path.join(distRoot, relativePath).replaceAll('\\', '/');
			const instance = new vm.Script(
				`new (require(${JSON.stringify(filePath)}).${className})()`,
			).runInContext(context);
			assert.equal(instance.constructor.name, className, `${scenario}: ${className} export`);
			assert.equal(
				instance.description?.name ?? instance.name,
				typeName,
				`${scenario}: ${className} type name`,
			);
		}
	} finally {
		Module._load = originalLoad;
		clearDistCache();
	}
}

loadTargets(actualWorkflow, 'current n8n');
loadTargets({ ...actualWorkflow, NodeConnectionTypes: undefined }, 'legacy n8n');

console.log('Package classes load with current and legacy n8n connection exports.');
