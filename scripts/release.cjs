'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

process.chdir(path.resolve(__dirname, '..'));
const [increment, ...extra] = process.argv.slice(2);
assert.ok(['patch', 'minor', 'major'].includes(increment) && extra.length === 0,
	'Usage: npm run release -- patch|minor|major (commit the release notes first).');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
assert.equal(git('branch', '--show-current'), 'main', 'Release from main.');
assert.equal(git('status', '--porcelain'), '', 'Commit all changes before releasing.');
assert.equal(git('remote', 'get-url', '--push', 'origin'), 'https://github.com/paoloronco/n8n-nodes-orbitpage.git');
assert.equal(git('rev-parse', '--abbrev-ref', '@{upstream}'), 'origin/main');
execFileSync('git', ['fetch', 'origin', 'main', '--no-tags'], { stdio: 'inherit' });
git('merge-base', '--is-ancestor', 'origin/main', 'HEAD');
execFileSync(process.execPath, [process.env.npm_execpath, 'run', 'check'], { stdio: 'inherit' });
execFileSync(process.execPath, [process.env.npm_execpath, 'version', increment, '--tag-version-prefix=',
	'--message=chore: release %s'], { stdio: 'inherit' });
const { version } = require('../package.json');
execFileSync('git', ['push', '--atomic', 'origin', 'main', `refs/tags/${version}`], { stdio: 'inherit' });
