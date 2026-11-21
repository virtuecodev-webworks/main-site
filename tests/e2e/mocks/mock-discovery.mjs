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

function sendRaw(res, status, contentType, bodyText, extraHeaders = {}) {
  res.writeHead(status, {
    'content-type': contentType,
    'content-length': Buffer.byteLength(bodyText),
    ...extraHeaders,
  });
  res.end(bodyText);
}

function detectProvider(targetHost, pathname, method) {
  if (targetHost.includes('nominatim') || pathname === '/search' && method === 'GET' || pathname === '/nominatim/search') {
    return 'nominatim';
  }
  if (targetHost.includes('overpass') || pathname === '/api/interpreter') {
    return 'overpass';
  }
  if (targetHost.includes('places.googleapis.com') || pathname.includes('places:searchText')) {
    return 'google_places';
  }
  if (targetHost.includes('maps.googleapis.com') || pathname.startsWith('/maps/api/place/')) {
    return 'google_places_legacy';
  }
  if (targetHost.includes('serper') || (method === 'POST' && pathname === '/places')) {
    return pathname === '/search' ? 'serper_search' : 'serper_places';
  }
  if (method === 'POST' && pathname === '/search') {
    return 'serper_search';
  }
  return 'unknown';
}

function defaultPayloadFor(provider, pathname, query, bodyJson) {
  if (provider === 'nominatim') {
    const q = query.q || 'Austin';
    return [
      {
        place_id: 100101,
        osm_type: 'relation',
        osm_id: 175905,
        boundingbox: ['30.0986589', '30.5168630', '-97.9383829', '-97.5614889'],
        lat: '30.2711286',
        lon: '-97.7436995',
        display_name: `${q}, Texas, United States`,
      },
    ];
  }

  if (provider === 'overpass') {
    return {
      version: 0.6,
      generator: 'Overpass API',
      osm_base: '2026-11-21T00:00:00Z',
      elements: [
        {
          type: 'node',
          id: 900001,
          lat: 30.2711,
          lon: -97.7436,
          tags: {
            name: 'Bella Salon',
            shop: 'hairdresser',
            'addr:city': 'Austin',
            'addr:state': 'TX',
            website: 'https://wix-legacy.mock.test/',
            'contact:email': 'studio@wix-legacy.mock.test',
            phone: '+1-512-555-0101',
          },
        },
        {
          type: 'way',
          id: 900002,
          center: { lat: 30.275, lon: -97.741 },
          tags: {
            name: 'Legacy Hardware Supply',
            shop: 'hardware',
            'addr:city': 'Austin',
            'addr:state': 'TX',
            'contact:website': 'http://no-https.mock.test/',
            email: 'contact@no-https.mock.test',
          },
        },
        {
          type: 'node',
          id: 900003,
          lat: 30.281,
          lon: -97.752,
          tags: {
            name: 'No-Site Plumbing Co',
            craft: 'plumber',
            'addr:city': 'Austin',
            'addr:state': 'TX',
            'contact:email': 'owner@no-site-plumbing.mock.test',
            phone: '+1-512-555-0103',
          },
        },
      ],
    };
  }

  if (provider === 'google_places') {
    return {
      places: [
        {
          id: 'gp-e2e-1',
          displayName: { text: 'Summit Roofing Co.', languageCode: 'en' },
          formattedAddress: '410 Congress Ave, Austin, TX 78701, USA',
          nationalPhoneNumber: '(512) 555-0144',
          websiteUri: 'https://missing-meta-viewport.mock.test/',
          types: ['roofing_contractor', 'point_of_interest'],
        },
        {
          id: 'gp-e2e-2',
          displayName: { text: 'Apex Dental Studio', languageCode: 'en' },
          formattedAddress: '900 Barton Springs Rd, Austin, TX 78704, USA',
          nationalPhoneNumber: '(512) 555-0188',
          websiteUri: 'https://healthy.mock.test/',
          types: ['dentist', 'health'],
        },
      ],
    };
  }

  if (provider === 'google_places_legacy') {
    if (pathname.includes('/details/')) {
      return {
        status: 'OK',
        result: {
          name: 'Oak Creek Landscaping',
          formatted_address: '215 South Lamar Blvd, Austin, TX 78704',
          formatted_phone_number: '(512) 555-0192',
          website: 'https://weebly-legacy.mock.test/',
        },
      };
    }
    return {
      status: 'OK',
      results: [
        {
          place_id: 'legacy-place-1',
          name: 'Oak Creek Landscaping',
          formatted_address: '215 South Lamar Blvd, Austin, TX 78704',
          business_status: 'OPERATIONAL',
          types: ['landscaper'],
        },
      ],
    };
  }

  if (provider === 'serper_places') {
    return {
      searchParameters: { q: bodyJson?.q || 'dentists Austin', type: 'places' },
      places: [
        {
          position: 1,
          title: 'Harbor Law Group',
          address: '100 Lavaca St, Austin, TX 78701',
          phoneNumber: '(512) 555-0177',
          website: 'https://mailto-only.mock.test/',
          category: 'Law firm',
        },
      ],
    };
  }

  if (provider === 'serper_search') {
    return {
      searchParameters: { q: bodyJson?.q || 'accounting Austin', type: 'search' },
      places: [
        {
          position: 1,
          title: 'Northstar Accounting',
          address: '301 W 6th St, Austin, TX 78701',
          phoneNumber: '(512) 555-0166',
          website: 'https://visible-text-email.mock.test/',
          category: 'Accounting firm',
        },
      ],
      organic: [
        {
          position: 1,
          title: 'Northstar Accounting — Tax & Payroll',
          link: 'https://visible-text-email.mock.test/',
          snippet: 'Small business accounting and tax services in Austin.',
        },
      ],
    };
  }

  return { ok: true };
}

function emptyPayloadFor(provider) {
  switch (provider) {
    case 'nominatim':
      return [];
    case 'overpass':
      return { version: 0.6, generator: 'Overpass API', elements: [] };
    case 'google_places':
    case 'serper_places':
      return { places: [] };
    case 'google_places_legacy':
      return { status: 'ZERO_RESULTS', results: [] };
    case 'serper_search':
      return { organic: [], places: [] };
    default:
      return {};
  }
}

export async function startMockDiscovery({ host = '127.0.0.1', port = 0 } = {}) {
  let requests = [];
  let scenario = { byProvider: {}, queue: [] };

  function getRequests() {
    return structuredClone(requests);
  }

  function clearRequests() {
    requests = [];
  }

  function setScenario(cfg = {}) {
    if (cfg?.reset) {
      scenario = { byProvider: {}, queue: [] };
    }
    if (!cfg || typeof cfg !== 'object') return;
    if (Array.isArray(cfg.queue)) {
      scenario.queue = [...cfg.queue];
    }
    if (cfg.mode || cfg.delayMs || cfg.status || cfg.body !== undefined || cfg.headers) {
      const target = cfg.provider || 'all';
      scenario.byProvider[target] = {
        mode: cfg.mode || 'ok',
        delayMs: cfg.delayMs,
        status: cfg.status,
        headers: cfg.headers,
        body: cfg.body,
      };
    }
  }

  function reset() {
    requests = [];
    scenario = { byProvider: {}, queue: [] };
  }

  function pickRule(provider) {
    if (scenario.queue.length > 0) {
      const idx = scenario.queue.findIndex(
        (item) => !item.provider || item.provider === 'all' || item.provider === provider,
      );
      if (idx >= 0) {
        const [picked] = scenario.queue.splice(idx, 1);
        return picked;
      }
    }
    return scenario.byProvider[provider] || scenario.byProvider.all || { mode: 'ok' };
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

    const bodyText = await readBody(req);
    let bodyJson = null;
    if (bodyText.trim().startsWith('{') || bodyText.trim().startsWith('[')) {
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {
        bodyJson = null;
      }
    }

    const targetHost = String(
      req.headers['x-e2e-original-host'] ?? req.headers['x-e2e-target-host'] ?? req.headers.host ?? '',
    )
      .split(':')[0]
      .toLowerCase();

    const provider = detectProvider(targetHost, url.pathname, method);
    const query = Object.fromEntries(url.searchParams.entries());

    requests.push({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      provider,
      method,
      path: url.pathname,
      url: req.headers['x-e2e-original-url'] || url.href,
      query,
      headers: { ...req.headers },
      bodyText,
      bodyJson,
    });

    const rule = pickRule(provider);
    if (rule.delayMs && rule.delayMs > 0 && rule.mode !== 'timeout') {
      await new Promise((r) => setTimeout(r, rule.delayMs));
    }

    const mode = rule.mode || 'ok';
    if (mode === 'rate_limit_429') {
      return sendJson(res, 429, { error: 'Rate limit exceeded' }, { 'retry-after': '2' });
    }
    if (mode === 'error_500') {
      return sendJson(res, 500, { error: 'Upstream discovery provider error' });
    }
    if (mode === 'invalid_json') {
      return sendRaw(res, 200, 'application/json; charset=utf-8', '{invalid-json-response');
    }
    if (mode === 'empty') {
      return sendJson(res, 200, emptyPayloadFor(provider));
    }
    if (mode === 'timeout') {
      const waitMs = rule.delayMs ?? 30000;
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, waitMs);
        req.on('close', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (!res.writableEnded) {
        return sendJson(res, 504, { error: 'Gateway timeout' });
      }
      return;
    }
    if (mode === 'custom') {
      const status = rule.status ?? 200;
      const extraHeaders = rule.headers || {};
      if (typeof rule.body === 'string') {
        return sendRaw(res, status, 'application/json; charset=utf-8', rule.body, extraHeaders);
      }
      return sendJson(res, status, rule.body ?? {}, extraHeaders);
    }

    return sendJson(res, 200, defaultPayloadFor(provider, url.pathname, query, bodyJson));
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
