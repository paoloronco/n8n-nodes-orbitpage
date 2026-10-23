'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawn } = require('node:child_process');
const { mkdirSync, realpathSync, symlinkSync } = require('node:fs');
const { homedir } = require('node:os');
const path = require('node:path');
const { parseArgs } = require('node:util');

const root = path.resolve(__dirname, '..');
const { values } = parseArgs({ options: {
	'external-n8n': { type: 'boolean', default: false },
	'custom-user-folder': { type: 'string', default: path.join(homedir(), '.n8n-node-cli') },
} });
const userFolder = path.resolve(values['custom-user-folder']);
const link = path.join(userFolder, '.n8n', 'custom', 'node_modules', require('../package.json').name);
mkdirSync(path.dirname(link), { recursive: true });
try {
	symlinkSync(root, link, process.platform === 'win32' ? 'junction' : 'dir');
} catch (error) {
	if (error.code !== 'EEXIST') throw error;
	assert.equal(realpathSync(link), realpathSync(root), 'The development link already targets another package.');
}
execFileSync(process.execPath, [path.join(__dirname, 'build.cjs')], { stdio: 'inherit' });

const children = [];
let stopping = false;
function stop(code) {
	if (stopping) return;
	stopping = true;
	for (const child of children) {
		if (!child.pid || child.exitCode !== null) continue;
		try {
			if (process.platform === 'win32') {
				execFileSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true });
			} else {
				process.kill(-child.pid, 'SIGTERM');
			}
		} catch (error) {
			if (error.code !== 'ESRCH' && process.platform !== 'win32') throw error;
		}
	}
	process.exit(code);
}
function start(args, options = {}) {
	const child = spawn(process.execPath, args, {
		cwd: root, stdio: 'inherit', detached: process.platform !== 'win32', windowsHide: true, ...options,
	});
	children.push(child);
	child.on('error', (error) => { console.error(error.message); stop(1); });
	child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
start([require.resolve('typescript/bin/tsc'), '--watch', '--pretty']);
if (!values['external-n8n']) {
	start([process.env.npm_execpath, 'exec', '--yes', '--prefer-online', '--', 'n8n@latest'], {
		cwd: userFolder,
		env: { ...process.env, N8N_DEV_RELOAD: 'true', DB_SQLITE_POOL_SIZE: '10', N8N_USER_FOLDER: userFolder },
	});
}
