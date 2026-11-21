import http from 'node:http';
import { randomUUID } from 'node:crypto';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, data, extraHeaders = {}) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    ...extraHeaders,
  });
  res.end(payload);
}

function sendRaw(res, status, contentType, bodyText) {
  res.writeHead(status, {
    'content-type': contentType,
    'content-length': Buffer.byteLength(bodyText),
  });
  res.end(bodyText);
}

function extractPromptText(bodyJson) {
  if (!bodyJson || !Array.isArray(bodyJson.contents)) return '';
  const parts = [];
  for (const entry of bodyJson.contents) {
    if (entry && Array.isArray(entry.parts)) {
      for (const p of entry.parts) {
        if (typeof p?.text === 'string') parts.push(p.text);
      }
    }
  }
  return parts.join('\n');
}

function inferBusinessName(promptText) {
  const patterns = [
    /business(?:\s+name)?\s*[:=]\s*["']?([^\n"',.]+)/i,
    /company\s*[:=]\s*["']?([^\n"',.]+)/i,
    /prospect\s*[:=]\s*["']?([^\n"',.]+)/i,
  ];
  for (const re of patterns) {
    const m = promptText.match(re);
    if (m && m[1]?.trim()) return m[1].trim();
  }
  return 'Local Business';
}

function buildDefaultGeneratedText(promptText) {
  if (promptText.includes('contentHtml') && promptText.includes('contentText')) {
    return JSON.stringify({
      title: 'Virtue & Co. Digital Dispatch',
      subtitle: 'Modern Web Engineering Insights',
      ctaText: 'Book a Strategy Call',
      ctaUrl: 'https://virtuecowebworks.solutions/contact',
      contentHtml: '<p>Curated web performance and conversion upgrades.</p>',
      contentText: 'Curated web performance and conversion upgrades.',
    });
  }

  const businessName = inferBusinessName(promptText);
  return JSON.stringify({
    subject: `Quick website upgrade ideas for ${businessName}`,
    headline: `Helping ${businessName} convert more local visitors`,
    greeting: `Hi ${businessName} team,`,
    opening: `We took a quick look at ${businessName}'s online presence and spotted a few straightforward fixes that can immediately boost mobile inquiries and search visibility.`,
    auditBullets: [
      'Add mobile viewport and Core Web Vitals optimization for faster load times.',
      'Tighten page titles, meta descriptions, and local conversion calls-to-action.',
      'Modernize the layout so prospective clients can book or request quotes in seconds.',
    ],
    recommendedPackage: 'Custom Growth Website ($350)',
    ctaText: 'Reply for a free 5-minute walkthrough',
    closing: 'Best regards, Virtue & Co. Webworks',
  });
}

export async function startMockGemini({ host = '127.0.0.1', port = 0 } = {}) {
  let requests = [];
  let scenario = { mode: 'ok', queue: [] };

  function getRequests() {
    return structuredClone(requests);
  }

  function clearRequests() {
    requests = [];
  }

  function setScenario(cfg = {}) {
    if (cfg?.reset) {
      scenario = { mode: 'ok', queue: [] };
    }
    if (!cfg || typeof cfg !== 'object') return;
    if (Array.isArray(cfg.queue)) {
      scenario.queue = [...cfg.queue];
    }
    const { queue: _q, reset: _r, ...rest } = cfg;
    scenario = { ...scenario, ...rest };
  }

  function reset() {
    requests = [];
    scenario = { mode: 'ok', queue: [] };
  }

  function nextRule() {
    if (Array.isArray(scenario.queue) && scenario.queue.length > 0) {
      return scenario.queue.shift();
    }
    return scenario;
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}`);
    const method = (req.method || 'GET').toUpperCase();

    if (url.pathname === '/__e2e/scenario' && method === 'POST') {
      const raw = await readBody(req);
      setScenario(raw ? JSON.parse(raw) : {});
      return sendJson(res, 200, { ok: true });
    }
    if (url.pathname === '/__e2e/requests' && method === 'GET') {
      return sendJson(res, 200, { requests: getRequests() });
    }
    if (url.pathname === '/__e2e/reset' && method === 'POST') {
      reset();
      return sendJson(res, 200, { ok: true });
    }

    const match = url.pathname.match(/^\/v1beta\/models\/([^/:]+):generateContent$/);
    if (!match || method !== 'POST') {
      return sendJson(res, 404, { error: { code: 404, message: 'Not found', status: 'NOT_FOUND' } });
    }

    const model = match[1];
    const bodyText = await readBody(req);
    let bodyJson = null;
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      bodyJson = null;
    }
    const promptText = extractPromptText(bodyJson);

    requests.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      model,
      url: url.href,
      query: Object.fromEntries(url.searchParams.entries()),
      headers: { ...req.headers },
      bodyJson,
      promptText,
    });

    const rule = nextRule();
    if (rule.delayMs && rule.delayMs > 0) {
      await new Promise((r) => setTimeout(r, rule.delayMs));
    }

    const mode = rule.mode || 'ok';
    if (mode === 'error_500') {
      return sendJson(res, 500, {
        error: { code: 500, message: 'Internal error encountered.', status: 'INTERNAL' },
      });
    }
    if (mode === 'rate_limit_429') {
      return sendJson(
        res,
        429,
        { error: { code: 429, message: 'Resource has been exhausted.', status: 'RESOURCE_EXHAUSTED' } },
        { 'retry-after': '5' },
      );
    }
    if (mode === 'malformed_json') {
      if (rule.malformedType === 'http_body') {
        return sendRaw(res, 200, 'application/json; charset=utf-8', '{malformed-gemini-http-json');
      }
      return sendJson(res, 200, {
        candidates: [
          {
            content: { role: 'model', parts: [{ text: 'Sure! Here is JSON: {broken_json' }] },
            finishReason: 'STOP',
            index: 0,
          },
        ],
      });
    }
    if (mode === 'empty_candidates') {
      return sendJson(res, 200, {
        candidates: [],
        promptFeedback: { blockReason: 'SAFETY' },
      });
    }
    if (mode === 'custom') {
      const status = rule.status ?? 200;
      const body = rule.customBody ?? {
        candidates: [
          {
            content: { role: 'model', parts: [{ text: rule.customText ?? '' }] },
            finishReason: 'STOP',
            index: 0,
          },
        ],
      };
      return sendJson(res, status, body);
    }

    const text = rule.customText ?? buildDefaultGeneratedText(promptText);
    return sendJson(res, 200, {
      candidates: [
        {
          content: { role: 'model', parts: [{ text }] },
          finishReason: 'STOP',
          index: 0,
        },
      ],
      usageMetadata: {
        promptTokenCount: 100,
        candidatesTokenCount: 80,
        totalTokenCount: 180,
      },
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });

  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;
  const origin = `http://${host}:${actualPort}`;

  async function close() {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    await new Promise((resolve) => server.close(() => resolve()));
  }

  return {
    host,
    port: actualPort,
    origin,
    server,
    getRequests,
    clearRequests,
    setScenario,
    reset,
    close,
  };
}
