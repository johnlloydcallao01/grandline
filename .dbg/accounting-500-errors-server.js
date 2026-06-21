const http = require('http');
const fs = require('fs');
const path = require('path');

const session = 'accounting-500-errors';
const outdir = path.resolve(__dirname);
const port = 7777;
const idleMs = 1200 * 1000;
const logFile = path.join(outdir, `trae-debug-log-${session}.ndjson`);
const envFile = path.join(outdir, `${session}.env`);

fs.mkdirSync(outdir, { recursive: true });
fs.writeFileSync(logFile, '');

let last = Date.now();

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
  last = Date.now();

  if (req.method === 'OPTIONS' && req.url === '/event') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const event = JSON.parse(body || '{}');
        if (!event.ts) event.ts = Date.now();
        fs.appendFileSync(logFile, `${JSON.stringify(event)}\n`);
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        res.writeHead(400, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(error && error.message ? error.message : error) }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, sessionId: session }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(port, '127.0.0.1', () => {
  const api = `http://127.0.0.1:${port}/event`;
  fs.writeFileSync(envFile, `DEBUG_SERVER_URL=${api}\nDEBUG_SESSION_ID=${session}\n`);
  console.log('@@DEBUG_SERVER_INFO');
  console.log(
    JSON.stringify(
      {
        api_url: api,
        session_id: session,
        log_dir: outdir,
        log_file: logFile,
        env_file: envFile,
      },
      null,
      2,
    ),
  );
  console.log('@@END_DEBUG_SERVER_INFO');
});

setInterval(() => {
  if (Date.now() - last > idleMs) {
    server.close(() => process.exit(0));
  }
}, 1000);
