// Runs every e2e suite in order and reports a summary. Usage: BASE=http://localhost:3000 npm run test:e2e
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const suites = fs.readdirSync(__dirname).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
let failed = 0;
for (const suite of suites) {
    console.log(`\n=== ${suite} ===`);
    const r = spawnSync(process.execPath, [path.join(__dirname, suite)], { stdio: 'inherit', env: process.env });
    if (r.status !== 0) failed++;
}
console.log(failed ? `\n${failed} suite(s) failed` : '\nAll suites passed');
process.exit(failed ? 1 : 0);
