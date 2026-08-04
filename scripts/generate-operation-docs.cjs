const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const {
	API_OPERATION_SPECS,
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
	operationEffectLabel,
} = require('../dist/nodes/OrbitPage/operations.js');
const { operationBodyGuidance } = require('../dist/nodes/OrbitPage/bodyGuidance.js');

const outputPath = resolve(__dirname, '../docs/OPERATIONS.md');

function cell(value) {
	return String(value ?? '—')
		.replaceAll('|', '\\|')
		.replaceAll('\n', ' ');
}

const parameterLabels = {
	linkId: 'Content Block ID',
	key: 'Public Text File Key',
	revision: 'Published Version Number',
	productId: 'Product ID',
	subscriberId: 'Subscriber ID',
	campaignId: 'Campaign ID',
	memberUid: 'Team Member ID',
	invitationId: 'Invitation ID',
};

const queryParameterLabels = {
	days: 'Analytics Period (defaults to 30 days)',
	sections: 'Backup Sections (optional; defaults to all)',
	refresh: 'Shop Read Mode (automatic, read-only snapshot, or forced Stripe refresh)',
};

function requiredInput(spec) {
	if (spec.kind === 'mediaUpload') return 'Binary video field';
	if (spec.kind === 'shopFileUpload') return 'Product ID + binary file field';
	if (spec.kind === 'custom') return 'HTTP method + relative API path';
	const inputs = (spec.parameters || []).map(
		(parameter) => parameterLabels[parameter] || parameter,
	);
	inputs.push(
		...(spec.queryParameters || []).map(
			(parameter) => queryParameterLabels[parameter] || parameter,
		),
	);
	if (spec.body) {
		const guidance = operationBodyGuidance(spec.value) || 'Send the operation request body.';
		inputs.push(spec.body === 'optional' ? `Optional body: ${guidance}` : `Body: ${guidance}`);
	}
	return inputs.length ? inputs.join(' + ') : 'None';
}

function requiredScope(spec) {
	if (spec.kind === 'custom') return 'Depends on API path';
	return spec.scope ? `\`${cell(spec.scope)}\`` : '—';
}

const lines = [
	'# OrbitPage operation matrix',
	'',
	'This file is generated from the typed n8n operation catalog. It covers every operation in the OrbitPage OpenAPI 3.1 contract at `https://orbitpage.com/api/openapi.json`.',
	'',
	'The names below match the labels shown in the n8n editor. **Possible effects** tells you whether an operation only reads data, changes a draft or private setting, changes public content, has an external side effect, deletes or replaces data, or sends an advanced request. More than one label can apply.',
	'',
	'All API paths are relative to `/api/v1`. Guided operations authenticate with the selected **OrbitPage API** credential. Operations marked with a revision source can automatically read that endpoint and send its latest `ETag` or revision as `If-Match`.',
	'',
];

for (const resource of RESOURCE_OPTIONS) {
	const specs = OPERATION_SPECS.filter((spec) => spec.resource === resource.value);
	if (!specs.length) continue;
	lines.push(`## ${resource.name}`, '');
	if (resource.description) lines.push(resource.description, '');
	lines.push(
		'| Operation | What it does | Possible effects | Method | Path | Success | Required scope | Input | Revision source |',
	);
	lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
	for (const spec of specs) {
		lines.push(
			`| ${cell(spec.name)} | ${cell(spec.description)} | ${cell(operationEffectLabel(spec.effect))} | ${cell(spec.method || 'n8n')} | ${spec.path ? `\`${cell(spec.path)}\`` : '—'} | ${spec.kind === 'api' ? `\`${cell(spec.successStatus || 200)}\`` : '—'} | ${requiredScope(spec)} | ${cell(requiredInput(spec))} | ${spec.revisionSource ? `\`${cell(spec.revisionSource)}\`` : '—'} |`,
		);
	}
	lines.push('');
}

const convenience = OPERATION_SPECS.filter((spec) => spec.kind !== 'api');
lines.push(
	`API operations: **${API_OPERATION_SPECS.length}**. n8n convenience operations: **${convenience.length}**.`,
);
lines.push('');

const generated = `${lines.join('\n').trimEnd()}\n`;
if (process.argv.includes('--check')) {
	let existing = '';
	try {
		existing = readFileSync(outputPath, 'utf8').replaceAll('\r\n', '\n');
	} catch {
		process.stderr.write('docs/OPERATIONS.md is missing. Run npm run docs:generate.\n');
		process.exit(1);
	}
	if (existing !== generated) {
		process.stderr.write('docs/OPERATIONS.md is stale. Run npm run docs:generate.\n');
		process.exit(1);
	}
	process.stdout.write('Operation documentation is current.\n');
} else {
	writeFileSync(outputPath, generated, 'utf8');
	process.stdout.write(`Generated ${outputPath}.\n`);
}
