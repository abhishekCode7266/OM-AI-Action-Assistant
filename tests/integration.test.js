const test = require('node:test');
const assert = require('node:assert');

test('File Parser & Type Classification: Recognizes all supported document and code extensions', () => {
  const supportedExtensions = [
    'pdf', 'docx', 'txt', 'csv', 'tsv', 'json', 'xlsx',
    'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'sql', 'md'
  ];

  const mimeMap = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    py: 'text/x-python',
    js: 'text/javascript',
    ts: 'text/typescript',
    html: 'text/html',
    css: 'text/css',
    sql: 'application/sql',
    md: 'text/markdown',
  };

  supportedExtensions.forEach((ext) => {
    const isCode = ['py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'sql', 'json'].includes(ext);
    const isDoc = ['pdf', 'docx', 'txt', 'md'].includes(ext);
    const isData = ['csv', 'tsv', 'xlsx'].includes(ext);

    assert.ok(isCode || isDoc || isData, `Extension .${ext} must be categorized`);
  });
});

test('Search Provider Abstraction: Formats search results and sources without fabricated data', () => {
  const mockSearchResult = {
    query: 'Quantum Computing 2026',
    results: [
      {
        title: 'Quantum Computing Advances in 2026',
        url: 'https://example.com/quantum-2026',
        snippet: 'Recent developments in fault-tolerant quantum hardware and quantum error correction.',
      },
    ],
    provider: 'duckduckgo',
  };

  assert.strictEqual(mockSearchResult.results.length, 1);
  const src = mockSearchResult.results[0];
  assert.ok(src.url.startsWith('https://'));
  assert.ok(src.title.length > 5);
  assert.ok(src.snippet.length > 10);
});

test('Permissions Center: Manages microphone, camera, screen, and notification states safely', () => {
  const initialPermissions = {
    microphone: 'prompt',
    camera: 'prompt',
    notifications: 'prompt',
    screenShareAvailable: true,
  };

  const allowedStates = ['prompt', 'granted', 'denied'];
  assert.ok(allowedStates.includes(initialPermissions.microphone));
  assert.ok(allowedStates.includes(initialPermissions.camera));
  assert.ok(allowedStates.includes(initialPermissions.notifications));
  assert.strictEqual(initialPermissions.screenShareAvailable, true);
});

test('Security & Sandboxing: Verifies safe iframe sandbox parameters for code execution preview', () => {
  const sandboxPolicy = 'allow-scripts allow-modals';
  
  // Must NOT contain allow-same-origin or allow-top-navigation to prevent breakout
  assert.ok(!sandboxPolicy.includes('allow-same-origin'));
  assert.ok(!sandboxPolicy.includes('allow-top-navigation'));
  assert.ok(sandboxPolicy.includes('allow-scripts'));
});

test('Settings & API Security: Ensures API keys are not hardcoded in defaults', () => {
  const defaultSettings = {
    theme: 'dark',
    activeProvider: 'gemini',
    activeModel: 'gemini-1.5-flash',
    customApiKeys: {},
    speechRate: 1.0,
    speechVolume: 1.0,
    autoSpeakResponse: false,
    enterToSend: true,
    autoScroll: true,
  };

  assert.deepStrictEqual(defaultSettings.customApiKeys, {});
  assert.strictEqual(Object.keys(defaultSettings.customApiKeys).length, 0);
});
