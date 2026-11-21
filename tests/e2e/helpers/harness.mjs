import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createMockSupabaseServer } from '../mocks/mock-supabase.mjs';
import { startMockSmtp } from '../mocks/mock-smtp.mjs';
import { startMockTargetSites } from '../mocks/mock-target-sites.mjs';
import { startMockDiscovery } from '../mocks/mock-discovery.mjs';
import { startMockGemini } from '../mocks/mock-gemini.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

const E2E_ANON_KEY = 'e2e-anon-key';
const E2E_SERVICE_ROLE_KEY = 'e2e-service-role-key';
const E2E_CRON_SECRET = 'e2e-cron-secret-value-123456';
const E2E_ADMIN_ALLOWLIST_EMAIL = 'allowlisted-admin@virtuecowebworks.solutions';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text.trim()) return resolve({});
      try {
        resolve(JSON.parse(text));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function readNextDevLock(rootDir = DEFAULT_ROOT_DIR) {
  const lockPath = path.join(rootDir, '.next', 'dev', 'lock');
  if (!fs.existsSync(lockPath)) return null;
  try {
    const raw = fs.readFileSync(lockPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isPidAlive(pid) {
  if (!pid || typeof pid !== 'number') return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err?.code === 'EPERM';
  }
}

function allocateEphemeralPort(host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, host, () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close((closeErr) => {
        if (closeErr) reject(closeErr);
        else resolve(port);
      });
    });
  });
}

async function controlRequest(controlUrl, method, endpoint, body) {
  const res = await fetch(`${controlUrl}${endpoint}`, {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(`Control request ${method} ${endpoint} failed (${res.status}): ${text}`);
  }
  return data;
}

export function resetHarness(controlUrl) {
  return controlRequest(controlUrl, 'POST', '/reset', {});
}

export function seedSupabase(controlUrl, data) {
  return controlRequest(controlUrl, 'POST', '/supabase/seed', data);
}

export function getSupabaseState(controlUrl) {
  return controlRequest(controlUrl, 'GET', '/supabase/state');
}

export function getSmtpMessages(controlUrl) {
  return controlRequest(controlUrl, 'GET', '/smtp/messages');
}

export function setSmtpScenario(controlUrl, scenario) {
  return controlRequest(controlUrl, 'POST', '/smtp/scenario', scenario);
}

export function setDiscoveryScenario(controlUrl, scenario) {
  return controlRequest(controlUrl, 'POST', '/discovery/scenario', scenario);
}

export function getDiscoveryRequests(controlUrl) {
  return controlRequest(controlUrl, 'GET', '/discovery/requests');
}

export function setGeminiScenario(controlUrl, scenario) {
  return controlRequest(controlUrl, 'POST', '/gemini/scenario', scenario);
}

export function setSitesScenario(controlUrl, scenario) {
  return controlRequest(controlUrl, 'POST', '/sites/scenario', scenario);
}

async function terminateProcessTree(child) {
  if (!child || child.exitCode !== null) return;
  try {
    child.kill('SIGTERM');
  } catch {
    // ignore
  }

  const exited = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 2000);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve(true);
    });
  });

  if (!exited && child.exitCode === null && process.platform === 'win32' && child.pid) {
    try {
      execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      // ignore if already exited
    }
  } else if (!exited && child.exitCode === null) {
    try {
      child.kill('SIGKILL');
    } catch {
      // ignore
    }
  }
}

export async function ensureHarness(options = {}) {
  const rootDir = options.rootDir || DEFAULT_ROOT_DIR;

  if (!options.forceStandalone && process.env.E2E_BASE_URL && process.env.E2E_CONTROL_URL) {
    const health = await controlRequest(process.env.E2E_CONTROL_URL, 'GET', '/health');
    return {
      ...health,
      baseUrl: process.env.E2E_BASE_URL,
      controlUrl: process.env.E2E_CONTROL_URL,
      close: async () => {},
    };
  }

  const mockSupabase = await createMockSupabaseServer({
    anonKey: E2E_ANON_KEY,
    serviceRoleKey: E2E_SERVICE_ROLE_KEY,
  });
  const mockSmtp = await startMockSmtp();
  const mockSites = await startMockTargetSites();
  const mockDiscovery = await startMockDiscovery();
  const mockGemini = await startMockGemini();

  let baseUrl = null;
  let nextChild = null;
  let controlServer = null;

  try {
    let nextPort = null;
    if (!options.mocksOnly) {
      const existingLock = readNextDevLock(rootDir);
      if (existingLock && isPidAlive(existingLock.pid)) {
        throw new Error(
          `Existing next dev server is running (pid=${existingLock.pid}, appUrl=${existingLock.appUrl || 'unknown'}). Stop it before running E2E or set E2E_BASE_URL and E2E_CONTROL_URL.`,
        );
      }
      nextPort = await allocateEphemeralPort('127.0.0.1');
      baseUrl = `http://127.0.0.1:${nextPort}`;
    }

    let controlUrl = '';
    const healthPayload = () => ({
      ok: true,
      baseUrl,
      controlUrl,
      supabaseUrl: mockSupabase.url,
      smtpPort: mockSmtp.port,
      sitesOrigin: mockSites.origin,
      discoveryOrigin: mockDiscovery.origin,
      geminiOrigin: mockGemini.origin,
      cronSecret: E2E_CRON_SECRET,
      adminAllowlistEmail: E2E_ADMIN_ALLOWLIST_EMAIL,
    });

    controlServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const method = (req.method || 'GET').toUpperCase();
      try {
        if (url.pathname === '/health' && method === 'GET') {
          return sendJson(res, 200, healthPayload());
        }
        if (url.pathname === '/reset' && method === 'POST') {
          mockSupabase.reset();
          mockSmtp.reset();
          mockSites.reset();
          mockDiscovery.reset();
          mockGemini.reset();
          return sendJson(res, 200, { ok: true });
        }
        if (url.pathname === '/supabase/seed' && method === 'POST') {
          const body = await readJsonBody(req);
          mockSupabase.seed(body);
          return sendJson(res, 200, { ok: true });
        }
        if (url.pathname === '/supabase/state' && method === 'GET') {
          return sendJson(res, 200, mockSupabase.getState());
        }
        if (url.pathname === '/smtp/messages' && method === 'GET') {
          return sendJson(res, 200, { messages: mockSmtp.getMessages() });
        }
        if (url.pathname === '/smtp/scenario' && method === 'POST') {
          const body = await readJsonBody(req);
          mockSmtp.setScenario(body);
          return sendJson(res, 200, { ok: true });
        }
        if (url.pathname === '/discovery/scenario' && method === 'POST') {
          const body = await readJsonBody(req);
          mockDiscovery.setScenario(body);
          return sendJson(res, 200, { ok: true });
        }
        if (url.pathname === '/discovery/requests' && method === 'GET') {
          return sendJson(res, 200, { requests: mockDiscovery.getRequests() });
        }
        if (url.pathname === '/gemini/scenario' && method === 'POST') {
          const body = await readJsonBody(req);
          mockGemini.setScenario(body);
          return sendJson(res, 200, { ok: true });
        }
        if (url.pathname === '/sites/scenario' && method === 'POST') {
          const body = await readJsonBody(req);
          mockSites.setScenario(body);
          return sendJson(res, 200, { ok: true });
        }
        return sendJson(res, 404, { error: 'Unknown control endpoint' });
      } catch (err) {
        return sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
      }
    });

    await new Promise((resolve, reject) => {
      controlServer.once('error', reject);
      controlServer.listen(0, '127.0.0.1', () => resolve());
    });
    const controlAddr = controlServer.address();
    const controlPort = typeof controlAddr === 'object' && controlAddr ? controlAddr.port : 0;
    controlUrl = `http://127.0.0.1:${controlPort}`;

    if (!options.mocksOnly) {
      const outboundRedirectAbs = path.resolve(rootDir, 'tests/e2e/mocks/outbound-redirect.mjs');
      const importFlag = `--import=${pathToFileURL(outboundRedirectAbs).href}`;
      const existingNodeOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : '';

      const childEnv = {
        ...process.env,
        NODE_OPTIONS: `${existingNodeOptions}${importFlag}`.trim(),
        E2E_MOCK_GEMINI_ORIGIN: mockGemini.origin,
        E2E_MOCK_DISCOVERY_ORIGIN: mockDiscovery.origin,
        E2E_MOCK_SITES_ORIGIN: mockSites.origin,
        NEXT_TELEMETRY_DISABLED: '1',
        CI: '1',
        NEXT_PUBLIC_SITE_URL: baseUrl,
        NEXT_PUBLIC_SUPABASE_URL: mockSupabase.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: E2E_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: E2E_SERVICE_ROLE_KEY,
        ADMIN_EMAIL_ALLOWLIST: E2E_ADMIN_ALLOWLIST_EMAIL,
        BREVO_SMTP_HOST: '127.0.0.1',
        BREVO_SMTP_PORT: String(mockSmtp.port),
        BREVO_SMTP_LOGIN: 'e2e-smtp-user',
        BREVO_SMTP_KEY: 'e2e-smtp-pass',
        BREVO_FROM_EMAIL: 'Virtue & Co. Webworks <hello@virtuecowebworks.solutions>',
        LEAD_NOTIFICATION_EMAIL: 'admin-e2e@virtuecowebworks.solutions',
        SMTP_HOST: '127.0.0.1',
        SMTP_PORT: String(mockSmtp.port),
        SMTP_LOGIN: 'e2e-smtp-user',
        SMTP_KEY: 'e2e-smtp-pass',
        SMTP_FROM_EMAIL: 'Virtue & Co. Webworks <hello@virtuecowebworks.solutions>',
        CRON_SECRET: E2E_CRON_SECRET,
        GEMINI_API_KEY: 'AIzaSyMockE2ETestKey1234567890abcdef',
        GOOGLE_PLACES_API_KEY: 'e2e-places-key',
        SERPER_API_KEY: 'e2e-serper-key',
        NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: '',
        FLUTTERWAVE_SECRET_KEY: '',
        FLUTTERWAVE_SECRET_KEY_PROD: '',
        FLUTTERWAVE_WEBHOOK_HASH: '',
        NEXT_PUBLIC_FLUTTERWAVE_REDIRECT_URL: '',
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: '',
        VAPID_PRIVATE_KEY: '',
        NEXT_PUBLIC_AGENCY_EMAIL: '',
      };

      const logLines = [];
      const pushLogs = (chunk) => {
        const lines = chunk.toString('utf8').split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
          logLines.push(line);
          if (logLines.length > 80) logLines.shift();
        }
      };

      nextChild = spawn(
        process.execPath,
        ['./node_modules/next/dist/bin/next', 'dev', '-H', '127.0.0.1', '-p', String(nextPort)],
        {
          cwd: rootDir,
          env: childEnv,
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      nextChild.stdout?.on('data', pushLogs);
      nextChild.stderr?.on('data', pushLogs);

      const deadline = Date.now() + (options.startupTimeoutMs ?? 90_000);
      let ready = false;
      while (Date.now() < deadline) {
        if (nextChild.exitCode !== null) {
          throw new Error(
            `Next.js exited prematurely with code ${nextChild.exitCode}.\nLogs:\n${logLines.join('\n')}`,
          );
        }
        try {
          const probe = await fetch(`${baseUrl}/api/session`, {
            signal: AbortSignal.timeout(5000),
          });
          if (probe.ok) {
            ready = true;
            break;
          }
        } catch {
          // retry after short sleep
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!ready) {
        throw new Error(
          `Timed out waiting for Next.js dev server at ${baseUrl}/api/session.\nLogs:\n${logLines.join('\n')}`,
        );
      }
    }

    let closed = false;
    async function close() {
      if (closed) return;
      closed = true;
      await terminateProcessTree(nextChild);
      if (controlServer) {
        if (typeof controlServer.closeAllConnections === 'function') {
          controlServer.closeAllConnections();
        }
        await new Promise((resolve) => controlServer.close(() => resolve()));
      }
      await Promise.allSettled([
        mockSupabase.close(),
        mockSmtp.close(),
        mockSites.close(),
        mockDiscovery.close(),
        mockGemini.close(),
      ]);
    }

    return {
      ...healthPayload(),
      close,
    };
  } catch (err) {
    await terminateProcessTree(nextChild);
    if (controlServer) {
      if (typeof controlServer.closeAllConnections === 'function') {
        controlServer.closeAllConnections();
      }
      await new Promise((resolve) => controlServer.close(() => resolve()));
    }
    await Promise.allSettled([
      mockSupabase.close(),
      mockSmtp.close(),
      mockSites.close(),
      mockDiscovery.close(),
      mockGemini.close(),
    ]);
    throw err;
  }
}
