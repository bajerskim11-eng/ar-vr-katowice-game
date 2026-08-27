import http from 'node:http';
import { spawn } from 'node:child_process';

const host = process.env.DSH_BRIDGE_HOST || '127.0.0.1';
const port = Number(process.env.DSH_BRIDGE_PORT || 4090);
const token = process.env.DSH_BRIDGE_TOKEN;
const dshVersion = process.env.DSH_VERSION || '0.1.1-rc.2';

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY');
  process.exit(1);
}
if (!token) {
  console.error('Missing DSH_BRIDGE_TOKEN');
  process.exit(1);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 100_000) reject(new Error('Body too large')); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function runDsh(task) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['-y', `@deepseek-ai/dsh@${dshVersion}`, '--profile', 'headless', task], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', c => { out += c; });
    child.stderr.on('data', c => { err += c; });
    const timer = setTimeout(() => child.kill('SIGTERM'), 180_000);
    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve(out.trim());
      else reject(new Error(`dsh exited ${code}: ${err.slice(-4000)}`));
    });
    child.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'GET' && req.url === '/health') {
    res.end(JSON.stringify({ ok: true, service: 'deepseek-harness-bridge', version: dshVersion }));
    return;
  }
  if (req.method !== 'POST' || req.url !== '/run') {
    res.statusCode = 404; res.end(JSON.stringify({ error: 'Not found' })); return;
  }
  if (req.headers.authorization !== `Bearer ${token}`) {
    res.statusCode = 401; res.end(JSON.stringify({ error: 'Unauthorized' })); return;
  }
  try {
    const body = JSON.parse(await readBody(req));
    const task = typeof body.task === 'string' ? body.task.trim() : '';
    if (!task) { res.statusCode = 400; res.end(JSON.stringify({ error: 'task is required' })); return; }
    const text = await runDsh(task);
    res.end(JSON.stringify({ text, provider: 'deepseek-harness', version: dshVersion }));
  } catch (e) {
    res.statusCode = 502; res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'dsh error' }));
  }
});

server.listen(port, host, () => console.log(`DeepSeek Harness bridge listening on http://${host}:${port}`));
