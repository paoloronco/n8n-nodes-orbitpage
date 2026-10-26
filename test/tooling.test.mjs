import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = require('../package.json');

describe('dependency-free tooling', () => {
	it('retains every official Cloud rule and rejects unsafe package metadata and runtime imports', async () => {
		const lint = new ESLint();
		for (const file of ['package.json', 'nodes/OrbitPage/OrbitPage.node.ts', 'credentials/OrbitPageApi.credentials.ts']) {
			const config = await lint.calculateConfigForFile(file);
			for (const [rule, severity] of Object.entries(n8nCommunityNodesPlugin.configs.recommended.rules)) {
				expect(config.rules[rule][0], `${file}: ${rule}`).toBe(severity === 'error' ? 2 : 1);
			}
		}
		const [valid] = await lint.lintText(JSON.stringify(manifest), { filePath: 'package.json' });
		expect(valid.errorCount).toBe(0);
		const [invalid] = await lint.lintText(JSON.stringify({ ...manifest, overrides: { uuid: '11.1.1' }, dependencies: { uuid: '11.1.1' } }), { filePath: 'package.json' });
		expect(invalid.messages.map(({ ruleId }) => ruleId)).toEqual(expect.arrayContaining([
			'@n8n/community-nodes/no-overrides-field', '@n8n/community-nodes/no-runtime-dependencies',
		]));
		const [runtime] = await lint.lintText('import fs from "node:fs"; export const read = fs.readFileSync;', { filePath: 'nodes/OrbitPage/unsafe.ts' });
		expect(runtime.messages.map(({ ruleId }) => ruleId)).toContain('@n8n/community-nodes/no-restricted-imports');
	}, 30000);

	it('cleans stale output and preserves node metadata in the built package', () => {
		const stale = path.join(root, 'dist', 'stale.js');
		mkdirSync(path.dirname(stale), { recursive: true });
		writeFileSync(stale, 'stale');
		execFileSync(process.execPath, ['scripts/build.cjs'], { cwd: root });
		expect(existsSync(stale)).toBe(false);
		for (const node of ['OrbitPage', 'OrbitPageTrigger']) {
			const file = `nodes/${node}/${node}.node.json`;
			expect(readFileSync(path.join(root, 'dist', file), 'utf8')).toBe(readFileSync(path.join(root, file), 'utf8'));
		}
	}, 30000);

	it('uses fully qualified node identifiers in codex metadata', () => {
		for (const [node, identifier] of [
			['OrbitPage', 'n8n-nodes-orbitpage.orbitPage'],
			['OrbitPageTrigger', 'n8n-nodes-orbitpage.orbitPageTrigger'],
		]) {
			const metadata = JSON.parse(readFileSync(path.join(root, 'nodes', node, `${node}.node.json`), 'utf8'));
			expect(metadata.node).toBe(identifier);
		}
	});

	it('only permits the matching public-repository tag to pass the publish guard', () => {
		const valid = { GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'paoloronco/n8n-nodes-orbitpage', GITHUB_REF: `refs/tags/${manifest.version}` };
		for (const [change, expected] of [[{}, 0], [{ GITHUB_ACTIONS: 'false' }, 1], [{ GITHUB_REPOSITORY: 'other/repo' }, 1], [{ GITHUB_REF: 'refs/heads/main' }, 1], [{ GITHUB_REF: 'refs/tags/0.0.0' }, 1]]) {
			const result = spawnSync(process.execPath, ['scripts/check-publish.cjs'], { cwd: root, env: { ...process.env, ...valid, ...change } });
			expect(result.status).toBe(expected);
		}
	});

	it('starts the compiler and isolated n8n server, supports external n8n and stops its children', () => {
		const source = readFileSync(path.join(root, 'scripts/dev.cjs'), 'utf8');
		for (const external of [false, true]) {
			const started = [];
			const killed = [];
			const signals = {};
			const links = [];
			const userFolder = path.join(root, 'test-user-folder');
			const fakeRequire = (id) => {
				if (id === '../package.json') return manifest;
				if (id === 'node:util') return { parseArgs: () => ({ values: { 'external-n8n': external, 'custom-user-folder': userFolder } }) };
				if (id === 'node:fs') return { mkdirSync() {}, symlinkSync: (...args) => links.push(args) };
				if (id === 'node:child_process') return {
					execFileSync() {},
					spawn: (...args) => { started.push(args); return { pid: started.length, exitCode: null, on() {} }; },
				};
				return require(id);
			};
			fakeRequire.resolve = require.resolve;
			vm.runInNewContext(source, {
				__dirname: path.join(root, 'scripts'), require: fakeRequire,
				process: { execPath: process.execPath, platform: 'linux', env: { npm_execpath: 'npm-cli.js' },
					on: (signal, callback) => { signals[signal] = callback; }, kill: (pid) => killed.push(pid), exit() {} },
			});
			expect(links[0][1]).toBe(path.join(userFolder, '.n8n', 'custom', 'node_modules', manifest.name));
			expect(started).toHaveLength(external ? 1 : 2);
			expect(started[0][1]).toContain('--watch');
			if (!external) expect(started[1][2].env).toMatchObject({ N8N_DEV_RELOAD: 'true', N8N_USER_FOLDER: userFolder });
			signals.SIGTERM();
			expect(killed).toEqual(external ? [-1] : [-1, -2]);
		}
	});

	it('prepares releases with branch, worktree and origin guards before an atomic push', () => {
		const source = readFileSync(path.join(root, 'scripts/release.cjs'), 'utf8');
		for (const bad of [null, 'branch', 'dirty', 'origin', 'behind', 'checks']) {
			const calls = [];
			const fakeExec = (command, args) => {
				calls.push([command, ...args]);
				if (args[0] === 'branch') return bad === 'branch' ? 'feature' : 'main';
				if (args[0] === 'status') return bad === 'dirty' ? ' M package.json' : '';
				if (args[0] === 'remote') return bad === 'origin' ? 'https://github.com/other/repo.git' : manifest.repository.url.replace(/^git\+/, '');
				if (args[0] === 'rev-parse') return 'origin/main';
				if ((bad === 'behind' && args[0] === 'merge-base') || (bad === 'checks' && args.includes('check'))) throw new Error('failed gate');
				return '';
			};
			const run = () => vm.runInNewContext(source, {
				__dirname: path.join(root, 'scripts'),
				process: { argv: ['node', 'release.cjs', 'patch'], execPath: process.execPath, env: { npm_execpath: 'npm-cli.js' }, chdir() {} },
				require: (id) => id === 'node:child_process' ? { execFileSync: fakeExec } : id === '../package.json' ? { version: '0.3.3' } : require(id),
			});
			if (bad) {
				expect(run).toThrow();
				expect(calls.some((call) => call.includes('push') || call.includes('version'))).toBe(false);
			} else {
				run();
				expect(calls.at(-1)).toEqual(['git', 'push', '--atomic', 'origin', 'main', 'refs/tags/0.3.3']);
				expect(calls.some((call) => call.includes('publish'))).toBe(false);
			}
		}
	});
});
