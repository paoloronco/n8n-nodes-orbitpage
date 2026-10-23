'use strict';

const { execFileSync } = require('node:child_process');
const { cpSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc')], { cwd: root, stdio: 'inherit' });

for (const folder of ['credentials', 'nodes']) {
	for (const file of readdirSync(path.join(root, folder), { recursive: true })) {
		if (!/\.(png|svg|json)$/.test(file)) continue;
		const destination = path.join(dist, folder, file);
		mkdirSync(path.dirname(destination), { recursive: true });
		cpSync(path.join(root, folder, file), destination);
	}
}
