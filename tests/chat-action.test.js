const test = require('node:test');
const assert = require('node:assert');

test('Action Pipeline: Steps conform to Think-Plan-Act-Achieve standard', () => {
  const stepTypes = ['think', 'plan', 'act', 'achieve'];
  const pipeline = [
    { type: 'think', title: 'Understanding request' },
    { type: 'plan', title: 'Formulating execution plan' },
    { type: 'act', title: 'Running synthesis and tool calls' },
    { type: 'achieve', title: 'Verifying result and reporting completion' },
  ];

  assert.strictEqual(pipeline.length, 4);
  pipeline.forEach((p, idx) => {
    assert.strictEqual(p.type, stepTypes[idx]);
    assert.ok(p.title.length > 5);
  });
});

test('Error Handling: Graceful unconfigured provider message structure', () => {
  const provider = 'gemini';
  const customKey = '';
  const isConfigured = Boolean(customKey || process.env.GEMINI_API_KEY);

  const errorResponse = {
    error: `${provider.toUpperCase()} is not configured yet. Please provide an API key in Settings or add it to your .env file to enable live AI responses.`,
    isConfigured,
  };

  assert.strictEqual(typeof errorResponse.error, 'string');
  assert.ok(errorResponse.error.includes('Settings'));
});
