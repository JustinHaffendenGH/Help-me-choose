// Quick unit checks for normalizeProviderName
// Run with: node scripts/test-normalize.js

const { normalizeProviderName } = require('./test-normalize-helpers');

function assertEqual(a, b, msg) {
  if (a !== b) {
    console.error('FAIL:', msg, 'expected:', b, 'got:', a);
    process.exitCode = 2;
  } else {
    console.log('PASS:', msg);
  }
}

// Happy path
assertEqual(normalizeProviderName('Netflix'), 'netflix', 'Simple netflix');
assertEqual(normalizeProviderName('NETFLIX Standard with Ads'), 'netflix', 'Netflix variant with ads');
// Edge cases
assertEqual(normalizeProviderName('Amazon Prime Video (US)'), 'amazon prime video', 'Amazon with region');
assertEqual(normalizeProviderName('Starz Roku Premium Channel'), 'starz', 'Strip roku premium channel');

if (!process.exitCode) console.log('All tests completed');
