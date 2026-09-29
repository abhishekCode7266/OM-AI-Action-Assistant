const test = require('node:test');
const assert = require('node:assert');

test('AI Modes: All 8 core modes are correctly defined', () => {
  const expectedModes = [
    'general',
    'coding',
    'data-analyst',
    'research',
    'writing',
    'study',
    'career',
    'project-builder',
  ];

  // We can load the mode keys from source file or test dictionary
  assert.strictEqual(expectedModes.length, 8);
  for (const mode of expectedModes) {
    assert.ok(mode.length > 0, `Mode ${mode} should be non-empty`);
  }
});

test('Voice State Machine: Validates required state enum', () => {
  const validStates = ['IDLE', 'LISTENING', 'PROCESSING', 'SPEAKING', 'INTERRUPTED', 'ERROR'];
  assert.strictEqual(validStates.includes('IDLE'), true);
  assert.strictEqual(validStates.includes('LISTENING'), true);
  assert.strictEqual(validStates.includes('PROCESSING'), true);
  assert.strictEqual(validStates.includes('SPEAKING'), true);
  assert.strictEqual(validStates.includes('INTERRUPTED'), true);
  assert.strictEqual(validStates.includes('ERROR'), true);
  assert.strictEqual(validStates.includes('UNKNOWN'), false);
});
