'use strict';

// Node.js 21+ removed SlowBuffer. Legacy jwt deps (jwa → buffer-equal-constant-time)
// still touch SlowBuffer.prototype at load time, so this must run via --require
// before any application modules are imported.
const buffer = require('node:buffer');

if (typeof buffer.SlowBuffer === 'undefined') {
  buffer.SlowBuffer = buffer.Buffer;
}
