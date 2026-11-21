import http from 'node:http';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
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

function sendHtml(res, status, html, extraHeaders = {}) {
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'content-length': Buffer.byteLength(html),
    ...extraHeaders,
  });
  res.end(html);
}

function getBuiltinResponse(virtualHost, pathname, scheme, scenario) {
  if (virtualHost === 'healthy.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Apex Dental Studio — Modern Dentistry</title><meta name="description" content="Comprehensive cosmetic and family dentistry with modern digital imaging and online booking."><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Apex Dental Studio</h1><p>Welcome to Apex Dental Studio. We deliver gentle, technology-forward preventive, restorative, and cosmetic dental care for families and busy professionals across our community.</p><p>Schedule your visit online or reach our care team at <a href="mailto:info@healthy.mock.test">info@healthy.mock.test</a> for appointments and insurance inquiries.</p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'slow-ttfb.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Slow Bistro — Artisan Dining</title><meta name="description" content="Seasonal neighborhood dining and private events."><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Slow Bistro</h1><p>Enjoy seasonal farm-to-table cuisine, craft beverages, and weekend brunch in a welcoming atmosphere. Reach our reservations desk at hello@slow-ttfb.mock.test for group bookings and catering requests.</p></main></body></html>`;
    return { status: 200, delayMs: scenario.slowDelayMs ?? 2600, headers: {}, body: html };
  }

  if (virtualHost === 'no-https.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Legacy Hardware Supply</title><meta name="description" content="Tools and fasteners since 1998."></head><body><main><h1>Legacy Hardware Supply</h1><p>Serving local contractors with dependable tools, lumber, and industrial supplies. Email contact@no-https.mock.test for bulk order pricing and delivery schedules.</p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'missing-meta-viewport.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body><main><h1>Summit Roofing Co.</h1><p>Residential and commercial roof repair, inspections, and storm restoration. Reach our estimating team at sales@missing-meta-viewport.mock.test for a free quote.</p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'wix-legacy.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Bella Salon</title><meta name="generator" content="Wix.com Website Builder"><meta name="description" content="Hair styling and spa treatments."></head><body><script src="https://static.wixstatic.com/media/app.js"></script><main><h1>Bella Salon</h1><p>Book your haircut or color treatment with our stylists. Contact <a href="mailto:studio@wix-legacy.mock.test">studio@wix-legacy.mock.test</a>.</p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: { 'x-wix-request-id': 'mock-wix-123' }, body: html };
  }

  if (virtualHost === 'weebly-legacy.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Oak Creek Landscaping</title><meta name="description" content="Lawn care and garden design."></head><body><script src="https://cdn2.editmysite.com/js/site/main.js"></script><main><h1>Oak Creek Landscaping</h1><p>Custom patios, lawn maintenance, and seasonal planting. Reach us at <a href="mailto:hello@weebly-legacy.mock.test">hello@weebly-legacy.mock.test</a>.</p></main><footer>Powered by <a href="https://www.weebly.com">Weebly</a></footer></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'http-500.mock.test' && pathname === '/') {
    return { status: 500, delayMs: 0, headers: {}, body: '<html><body><h1>500 Internal Server Error</h1></body></html>' };
  }

  if (virtualHost === 'http-404.mock.test' && pathname === '/') {
    return { status: 404, delayMs: 0, headers: {}, body: '<html><body><h1>404 Not Found</h1></body></html>' };
  }

  if (virtualHost === 'no-email.mock.test') {
    if (pathname === '/') {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Silent Bakery</title></head><body><main><h1>Silent Bakery</h1><p>Fresh sourdough and pastries baked every morning. Visit us in person on Main Street.</p></main></body></html>`;
      return { status: 200, delayMs: 0, headers: {}, body: html };
    }
    if (pathname === '/contact') {
      return { status: 404, delayMs: 0, headers: {}, body: '<html><body><h1>404 Not Found</h1></body></html>' };
    }
  }

  if (virtualHost === 'mailto-only.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Harbor Law Group</title><meta name="description" content="Business and estate attorneys."></head><body><main><h1>Harbor Law Group</h1><p>Schedule your initial consultation online today. <a href="mailto:bookings@mailto-only.mock.test?subject=Quote">Book Consultation</a></p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'visible-text-email.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Northstar Accounting</title><meta name="description" content="Small business tax and bookkeeping."></head><body><main><h1>Northstar Accounting</h1><p>Email team@visible-text-email.mock.test today for tax preparation and payroll support.</p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'contact-fallback.mock.test') {
    if (pathname === '/') {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Vanguard Fitness</title><meta name="description" content="Strength and conditioning studio."></head><body><main><h1>Vanguard Fitness</h1><p>Personal training and small group classes. Visit our <a href="/contact">Contact</a> page to reach our trainers.</p></main></body></html>`;
      return { status: 200, delayMs: 0, headers: {}, body: html };
    }
    if (pathname === '/contact') {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Contact — Vanguard Fitness</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Contact Us</h1><p>Reach our front desk at <a href="mailto:desk@contact-fallback.mock.test">desk@contact-fallback.mock.test</a>.</p></main></body></html>`;
      return { status: 200, delayMs: 0, headers: {}, body: html };
    }
  }

  if (virtualHost === 'noisy-emails.mock.test' && pathname === '/') {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Signal Print Shop</title><meta name="description" content="Commercial printing and signage."></head><body><img src="/assets/logo@2x.png" alt="Logo"><img src="/assets/hero@3x.webp" alt="Hero"><main><h1>Signal Print Shop</h1><p>Diagnostics: user@sentry.io, info@wixpress.com, test@example.com, noreply@noisy-emails.mock.test.</p><p>Real contact: <a href="mailto:hello@noisy-emails.mock.test">hello@noisy-emails.mock.test</a></p></main></body></html>`;
    return { status: 200, delayMs: 0, headers: {}, body: html };
  }

  if (virtualHost === 'redirect-to-https.mock.test') {
    if (pathname === '/' && scheme === 'http') {
      return {
        status: 301,
        delayMs: 0,
        headers: { location: 'https://redirect-to-https.mock.test/landing' },
        body: '',
      };
    }
    if (pathname === '/' || pathname === '/landing') {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Secure Wellness Clinic</title><meta name="description" content="Holistic care and preventive medicine in a modern clinic."><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main><h1>Secure Wellness Clinic</h1><p>Welcome to Secure Wellness Clinic. Our board-certified clinicians provide comprehensive wellness exams, diagnostic lab panels, and personalized care plans tailored to your family's needs.</p><p>Write to <a href="mailto:hello@redirect-to-https.mock.test">hello@redirect-to-https.mock.test</a> for scheduling.</p></main></body></html>`;
      return { status: 200, delayMs: 0, headers: {}, body: html };
    }
  }

  if (virtualHost === 'redirect-loop.mock.test') {
    if (pathname === '/') {
      return {
        status: 302,
        delayMs: 0,
        headers: { location: 'https://redirect-loop.mock.test/hop-a' },
        body: '',
      };
    }
    if (pathname === '/hop-a') {
      return {
        status: 302,
        delayMs: 0,
        headers: { location: 'https://redirect-loop.mock.test/hop-b' },
        body: '',
      };
    }
    if (pathname === '/hop-b') {
      return {
        status: 302,
        delayMs: 0,
        headers: { location: 'https://redirect-loop.mock.test/hop-a' },
        body: '',
      };
    }
  }

  return null;
}

export async function startMockTargetSites({ host = '127.0.0.1', port = 0 } = {}) {
  let requests = [];
  let scenario = { routes: {} };

  function getRequests() {
    return structuredClone(requests);
  }

  function clearRequests() {
    requests = [];
  }

  function setScenario(cfg = {}) {
    if (cfg?.reset) {
      scenario = { routes: {} };
    }
    if (!cfg || typeof cfg !== 'object') return;
    const { routes, slowDelayMs } = cfg;
    if (typeof slowDelayMs === 'number') {
      scenario.slowDelayMs = slowDelayMs;
    }
    if (routes && typeof routes === 'object') {
      scenario.routes = { ...(scenario.routes || {}), ...routes };
    }
  }

  function reset() {
    requests = [];
    scenario = { routes: {} };
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}`);
    const method = (req.method || 'GET').toUpperCase();

    if (url.pathname === '/__e2e/scenario' && method === 'POST') {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      setScenario(body);
      return sendJson(res, 200, { ok: true });
    }
    if (url.pathname === '/__e2e/requests' && method === 'GET') {
      return sendJson(res, 200, { requests: getRequests() });
    }
    if (url.pathname === '/__e2e/reset' && method === 'POST') {
      reset();
      return sendJson(res, 200, { ok: true });
    }

    let virtualHost = String(
      req.headers['x-mock-host'] ?? req.headers['x-e2e-target-host'] ?? req.headers.host ?? '',
    )
      .split(':')[0]
      .toLowerCase();
    let pathname = url.pathname;

    if (pathname.startsWith('/__site/')) {
      const rest = pathname.slice('/__site/'.length);
      const slashIdx = rest.indexOf('/');
      if (slashIdx === -1) {
        virtualHost = rest.toLowerCase();
        pathname = '/';
      } else {
        virtualHost = rest.slice(0, slashIdx).toLowerCase();
        pathname = rest.slice(slashIdx) || '/';
      }
    }

    const scheme = String(
      req.headers['x-mock-scheme'] ?? req.headers['x-e2e-original-scheme'] ?? 'https',
    ).toLowerCase();

    requests.push({
      timestamp: new Date().toISOString(),
      method,
      virtualHost,
      scheme,
      path: pathname,
      headers: { ...req.headers },
    });

    const override =
      scenario.routes?.[`${virtualHost}${pathname}`] ?? scenario.routes?.[virtualHost] ?? null;

    const spec = override
      ? {
          status: override.redirectTo ? override.status ?? 302 : override.status ?? 200,
          delayMs: override.delayMs ?? 0,
          headers: {
            ...(override.headers || {}),
            ...(override.redirectTo ? { location: override.redirectTo } : {}),
          },
          body: override.body ?? '',
        }
      : getBuiltinResponse(virtualHost, pathname, scheme, scenario);

    if (!spec) {
      return sendHtml(res, 404, '<html><body><h1>404 Not Found</h1></body></html>');
    }

    if (spec.delayMs && spec.delayMs > 0) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, spec.delayMs);
        req.on('close', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (res.writableEnded || req.destroyed) return;
    }

    return sendHtml(res, spec.status, spec.body, spec.headers);
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
