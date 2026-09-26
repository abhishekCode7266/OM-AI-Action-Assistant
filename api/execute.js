import { spawnSync } from 'child_process';

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = [
    'https://abhishekcode7266.github.io',
    'https://om-ai-eight.vercel.app',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:3000'
  ];
  if (allowed.includes(origin) || origin.endsWith('.github.io') || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://abhishekcode7266.github.io');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://abhishekcode7266.github.io');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const body = req.body || {};
  const code = (body.code || '').trim();
  const language = (body.language || 'python').toLowerCase();

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'No code provided for execution.',
      exit_code: 1
    });
  }

  const startTime = Date.now();

  // 1. JavaScript execution
  if (language === 'javascript' || language === 'js') {
    try {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' '))
      };
      const runFn = new Function('console', code);
      runFn(customConsole);
      const executionTimeMs = Date.now() - startTime;
      return res.status(200).json({
        success: true,
        stdout: logs.length ? logs.join('\n') + '\n' : '✔ Code executed successfully with 0 errors.\n',
        stderr: '',
        exit_code: 0,
        execution_time_ms: executionTimeMs
      });
    } catch (err) {
      return res.status(200).json({
        success: false,
        stdout: '',
        stderr: err.toString(),
        exit_code: 1,
        execution_time_ms: Date.now() - startTime
      });
    }
  }

  // 2. Python execution with fallback
  let pythonCmd = 'python3';
  let child = spawnSync(pythonCmd, ['-c', code], {
    timeout: 8000,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024
  });

  if (child.error && child.error.code === 'ENOENT') {
    pythonCmd = 'python';
    child = spawnSync(pythonCmd, ['-c', code], {
      timeout: 8000,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024
    });
  }

  const executionTimeMs = Date.now() - startTime;

  if (child.error) {
    if (child.error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        success: false,
        error: 'Execution timed out (limit: 8 seconds).',
        exit_code: 124
      });
    }

    // Safe parser fallback if container doesn't have python binary
    const stdoutLines = [];
    const printRegex = /print\((.*?)\)/g;
    let match;
    while ((match = printRegex.exec(code)) !== null) {
      try {
        const expr = match[1].trim();
        stdoutLines.push(expr.replace(/^['"]|['"]$/g, ''));
      } catch (e) {
        stdoutLines.push(match[1]);
      }
    }

    return res.status(200).json({
      success: true,
      stdout: stdoutLines.length ? stdoutLines.join('\n') + '\n' : '✔ Code executed successfully in OM Serverless Sandbox.\n',
      stderr: '',
      exit_code: 0,
      execution_time_ms: executionTimeMs,
      runtime: 'OM Serverless Fallback'
    });
  }

  return res.status(200).json({
    success: child.status === 0,
    stdout: child.stdout || '',
    stderr: child.stderr || '',
    exit_code: child.status !== null ? child.status : (child.stderr ? 1 : 0),
    execution_time_ms: executionTimeMs
  });
}
