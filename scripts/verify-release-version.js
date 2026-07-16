'use strict';

const { version } = require('../package.json');

const tag = process.argv[2];
const expectedTag = `v${version}`;

if (!tag) {
  console.error('Usage: npm run verify:release -- <tag>');
  process.exit(1);
}

if (tag !== expectedTag) {
  console.error(
    `Release tag ${tag} does not match package.json version ${version} (expected ${expectedTag}).`
  );
  process.exit(1);
}

console.log(`Release version verified: ${tag}`);
