'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'buffer-equal-constant-time',
  'index.js'
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, 'utf8');
const broken = "var SlowBuffer = require('buffer').SlowBuffer;";
const fixed =
  "// SlowBuffer was removed in modern Node; fall back to Buffer.\nvar SlowBuffer = require('buffer').SlowBuffer || Buffer;";

if (source.includes(broken)) {
  fs.writeFileSync(target, source.replace(broken, fixed));
  console.log('Patched buffer-equal-constant-time for Node.js without SlowBuffer');
}
