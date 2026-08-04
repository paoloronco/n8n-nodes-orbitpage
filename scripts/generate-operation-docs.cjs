const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const {
	API_OPERATION_SPECS,
	OPERATION_SPECS,
	RESOURCE_OPTIONS,
} = require('../dist/nodes/OrbitPage/operations.js');

const outputPath = resolve(__dirname, '../docs/OPERATIONS.md');

function cell(value) {
	return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

const lines = [
	'# OrbitPage operation matrix',
	'',
	'This file is generated from the typed n8n operation catalog. It covers every operation in the OrbitPage OpenAPI 3.1 contract at `https://orbitpage.com/api/openapi.json`.',
	'',
	'All paths below are relative to `/api/v1`. Guided operations authenticate with the selected **OrbitPage API** credential. Operations marked with a revision source automatically read that endpoint and send its latest `ETag` or revision as `If-Match`.',
	'',
];

for (const resource of RESOURCE_OPTIONS) {
	const specs = API_OPERATION_SPECS.filter((spec) => spec.resource === resource.value);
	if (!specs.length) continue;
	lines.push(`## ${resource.name}`, '');
	lines.push('| Operation | Method | Path | Required scope | Body | Revision source |');
	lines.push('| --- | --- | --- | --- | --- | --- |');
	for (const spec of specs) {
		lines.push(
			`| ${cell(spec.name)} | ${cell(spec.method)} | \`${cell(spec.path)}\` | \`${cell(spec.scope)}\` | ${cell(spec.body || 'none')} | ${spec.revisionSource ? `\`${cell(spec.revisionSource)}\`` : '—'} |`,
		);
	}
	lines.push('');
}

const convenience = OPERATION_SPECS.filter((spec) => spec.kind !== 'api');
lines.push('## n8n convenience operations', '');
lines.push('| Operation | Resource | Behavior |');
lines.push('| --- | --- | --- |');
for (const spec of convenience) {
	lines.push(`| ${cell(spec.name)} | ${cell(spec.resource)} | ${cell(spec.description)} |`);
}
lines.push('');
lines.push(`API operations: **${API_OPERATION_SPECS.length}**. n8n convenience operations: **${convenience.length}**.`);
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
