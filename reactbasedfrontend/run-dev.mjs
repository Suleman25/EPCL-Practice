// Orchestrate dev from reactbasedfrontend: landing page + React (Vite)
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false, ...opts });
  return child;
}

function prefixPipe(child, label) {
  child.stdout.on('data', d => process.stdout.write(`[${label}] ${d}`));
  child.stderr.on('data', d => process.stderr.write(`[${label}] ${d}`));
}

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('Starting dev servers from reactbasedfrontend...');
console.log('- Landing Page -> http://127.0.0.1:5174');
console.log('- React (Vite) -> http://127.0.0.1:3000');
console.log('Press Ctrl+C to stop.');

const landing = run(process.execPath, [path.join(__dirname, 'serve-landing.mjs')], { cwd: __dirname });
prefixPipe(landing, 'landing');

// Start React by setting cwd to risk-viz-nexus (no --prefix to avoid Windows spawn issues)
const reactCwd = path.join(__dirname, 'risk-viz-nexus');
const react = run(npmCmd, ['run', 'dev'], { cwd: reactCwd });
prefixPipe(react, 'react');

async function waitForUrl(target, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(target, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) return reject(new Error('timeout'));
        setTimeout(attempt, 500);
      });
    };
    attempt();
  });
}

function openInBrowser(targetUrl) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', targetUrl], { stdio: 'ignore', detached: true }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [targetUrl], { stdio: 'ignore', detached: true }).unref();
  } else {
    spawn('xdg-open', [targetUrl], { stdio: 'ignore', detached: true }).unref();
  }
}

waitForUrl('http://127.0.0.1:5174').then(() => {
  console.log('[orchestrator] Opening landing page...');
  openInBrowser('http://127.0.0.1:5174');
}).catch(() => {
  console.log('[orchestrator] Landing page did not become ready in time.');
});

function shutdown() {
  console.log('\nShutting down...');
  landing.kill('SIGINT');
  react.kill('SIGINT');
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const exits = [];
function handleExit(label, code, signal) {
  console.log(`[${label}] exited code=${code} signal=${signal}`);
  exits.push(label);
  if (exits.length >= 2) process.exit(code ?? 0);
}
landing.on('exit', (c, s) => handleExit('landing', c, s));
react.on('exit', (c, s) => handleExit('react', c, s));
