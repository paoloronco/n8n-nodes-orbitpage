'use strict';

const assert = require('node:assert/strict');
const { version } = require('../package.json');

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Publish through the GitHub Actions tag workflow.');
assert.equal(process.env.GITHUB_REPOSITORY, 'paoloronco/n8n-nodes-orbitpage');
assert.equal(process.env.GITHUB_REF, `refs/tags/${version}`, 'The tag must match the package version.');
