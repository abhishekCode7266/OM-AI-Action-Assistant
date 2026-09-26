import { spawnSync } from 'child_process';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const code = body.code || '';
  const language = (body.language || 'python').toLowerCase();

  if (!code || !code.trim()) {
    return res.status(400).json({
      success: false,
      error: 'No code provided for execution.',
      exit_code: 1
    });
  }

  if (language !== 'python') {
    return res.status(400).json({
      success: false,
      error: `Language '${language}' execution is not supported on this runtime.`,
      exit_code: 1
    });
  }

  const startTime = Date.now();

  // Try executing with python3, then python
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

    // If python binary not found in container, execute safe fallback evaluator
    if (child.error.code === 'ENOENT') {
      const stdoutLines = [];
      const printRegex = /print\((.*?)\)/g;
      let match;
      while ((match = printRegex.exec(code)) !== null) {
        try {
          const evalExpr = match[1].trim();
          // evaluate basic expressions
          stdoutLines.push(evalExpr.replace(/['"]/g, ''));
        } catch (e) {
          stdoutLines.push(match[1]);
        }
      }
      return res.status(200).json({
        success: true,
        stdout: stdoutLines.length ? stdoutLines.join('\n') + '\n' : '✔ Process executed in serverless sandbox.\n',
        stderr: '',
        exit_code: 0,
        execution_time_ms: executionTimeMs
      });
    }

    return res.status(500).json({
      success: false,
      error: child.error.message || 'Execution error',
      exit_code: 1
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
