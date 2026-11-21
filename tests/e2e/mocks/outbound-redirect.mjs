import http from 'node:http';
import https from 'node:https';
import Module from 'node:module';
import { EventEmitter } from 'node:events';
import { pathToFileURL } from 'node:url';

const GUARD_SYM = Symbol.for('vcw.e2e.outboundRedirectInstalled');

const DISCOVERY_HOSTS = new Set([
  'overpass-api.de',
  'lz4.overpass-api.de',
  'overpass.kumi.systems',
  'nominatim.openstreetmap.org',
  'places.googleapis.com',
  'maps.googleapis.com',
  'google.serper.dev',
]);

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0']);
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 10;

export function buildNodeImportOption(filePath) {
  return `--import=${pathToFileURL(filePath).href}`;
}

function classifyUrl(urlObj) {
  const hostname = urlObj.hostname.toLowerCase();
  if (LOOPBACK_HOSTS.has(hostname)) {
    return { action: 'passthrough' };
  }
  if (hostname === 'generativelanguage.googleapis.com') {
    const origin = process.env.E2E_MOCK_GEMINI_ORIGIN;
    if (!origin) {
      throw new Error('E2E_MOCK_GEMINI_ORIGIN is not set for Gemini redirect');
    }
    return { action: 'rewrite', origin, extraHeaders: {} };
  }
  if (DISCOVERY_HOSTS.has(hostname)) {
    const origin = process.env.E2E_MOCK_DISCOVERY_ORIGIN;
    if (!origin) {
      throw new Error('E2E_MOCK_DISCOVERY_ORIGIN is not set for Discovery redirect');
    }
    return {
      action: 'rewrite',
      origin,
      extraHeaders: {
        'x-e2e-original-host': urlObj.host,
        'x-e2e-original-url': urlObj.href,
      },
    };
  }
  if (hostname === 'unreachable.mock.test') {
    return { action: 'enotfound', hostname };
  }
  if (hostname === 'timeout.mock.test') {
    return { action: 'timeout', hostname };
  }
  if (hostname === 'mock.test' || hostname.endsWith('.mock.test')) {
    const origin = process.env.E2E_MOCK_SITES_ORIGIN;
    if (!origin) {
      throw new Error('E2E_MOCK_SITES_ORIGIN is not set for *.mock.test redirect');
    }
    return {
      action: 'mock-site',
      origin,
      extraHeaders: {
        'x-mock-host': urlObj.host,
        'x-mock-scheme': urlObj.protocol.replace(':', ''),
      },
    };
  }
  return { action: 'block', href: urlObj.href };
}

function makeIsolationError(href) {
  return Object.assign(
    new Error(`E2E_NETWORK_ISOLATION_VIOLATION: Blocked outbound request to ${href}`),
    { code: 'E2E_NETWORK_ISOLATION_VIOLATION' },
  );
}

function makeEnotfoundCause(hostname) {
  return Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), {
    code: 'ENOTFOUND',
    errno: -3008,
    syscall: 'getaddrinfo',
    hostname,
  });
}

function withVirtualUrl(res, virtualUrl) {
  Object.defineProperty(res, 'url', { value: virtualUrl, configurable: true });
  const origClone = res.clone.bind(res);
  Object.defineProperty(res, 'clone', {
    value: () => withVirtualUrl(origClone(), virtualUrl),
    configurable: true,
  });
  return res;
}

function waitForTimeoutOrAbort(signal) {
  return new Promise((_, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('The operation was aborted', 'AbortError'));
      return;
    }

    const maxWaitMs = Number(process.env.E2E_MOCK_TIMEOUT_MS || 60000);
    let safetyTimer = null;

    const cleanup = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(signal.reason ?? new DOMException('The operation was aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    safetyTimer = setTimeout(() => {
      cleanup();
      reject(new DOMException('The operation timed out', 'TimeoutError'));
    }, maxWaitMs);
    if (!signal && typeof safetyTimer.unref === 'function') {
      safetyTimer.unref();
    }
  });
}

function createStubClientRequest(mode, hostname, signal) {
  const emitter = new EventEmitter();
  let destroyed = false;
  let timer = null;
  let timeoutMs = null;
  let timeoutCb = null;
  const headers = new Map();

  emitter.setHeader = (k, v) => {
    headers.set(String(k).toLowerCase(), v);
  };
  emitter.getHeader = (k) => headers.get(String(k).toLowerCase());
  emitter.removeHeader = (k) => headers.delete(String(k).toLowerCase());
  emitter.write = () => true;
  emitter.setNoDelay = () => emitter;
  emitter.setSocketKeepAlive = () => emitter;
  emitter.setTimeout = (ms, cb) => {
    timeoutMs = ms;
    if (cb) timeoutCb = cb;
    return emitter;
  };
  emitter.abort = () => {
    emitter.destroy(new DOMException('The operation was aborted', 'AbortError'));
  };
  emitter.destroy = (err) => {
    if (destroyed) return emitter;
    destroyed = true;
    if (timer) clearTimeout(timer);
    if (err) {
      queueMicrotask(() => emitter.emit('error', err));
    }
    return emitter;
  };
  emitter.end = () => {
    if (mode === 'enotfound') {
      queueMicrotask(() => {
        if (!destroyed) {
          destroyed = true;
          emitter.emit('error', makeEnotfoundCause(hostname));
        }
      });
    } else if (mode === 'timeout') {
      if (signal?.aborted) {
        queueMicrotask(() => {
          if (!destroyed) {
            destroyed = true;
            emitter.emit('error', signal.reason ?? new DOMException('Aborted', 'AbortError'));
          }
        });
      } else {
        signal?.addEventListener(
          'abort',
          () => {
            emitter.destroy(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
        const wait = timeoutMs ?? Number(process.env.E2E_MOCK_TIMEOUT_MS || 60000);
        timer = setTimeout(() => {
          if (destroyed) return;
          if (timeoutCb) timeoutCb();
          emitter.emit('timeout');
        }, wait);
        if (typeof timer.unref === 'function') timer.unref();
      }
    }
    return emitter;
  };

  return emitter;
}

function normalizeNodeRequestArgs(defaultProtocol, urlOrOpts, maybeOpts, maybeCb) {
  let urlObj = null;
  let opts = {};
  let cb = maybeCb;

  if (typeof urlOrOpts === 'string' || urlOrOpts instanceof URL) {
    urlObj = urlOrOpts instanceof URL ? urlOrOpts : new URL(urlOrOpts);
    if (typeof maybeOpts === 'function') {
      cb = maybeOpts;
    } else if (maybeOpts && typeof maybeOpts === 'object') {
      opts = { ...maybeOpts };
    }
  } else if (urlOrOpts && typeof urlOrOpts === 'object') {
    opts = { ...urlOrOpts };
    if (typeof maybeOpts === 'function') {
      cb = maybeOpts;
    }
  }

  const protocol = urlObj?.protocol || opts.protocol || defaultProtocol;
  const hostField = opts.hostname || (typeof opts.host === 'string' ? opts.host.split(':')[0] : '');
  const hostname = urlObj?.hostname || hostField || 'localhost';
  const port =
    urlObj?.port ||
    opts.port ||
    (typeof opts.host === 'string' && opts.host.includes(':') ? opts.host.split(':')[1] : '');
  const path = urlObj
    ? `${urlObj.pathname}${urlObj.search}`
    : opts.path || '/';

  const constructed = new URL(`${protocol}//${hostname}${port ? `:${port}` : ''}${path.startsWith('/') ? path : `/${path}`}`);
  return { constructed, opts, cb };
}

export function installOutboundRedirect() {
  if (globalThis[GUARD_SYM]) {
    return;
  }
  globalThis[GUARD_SYM] = true;

  const origFetch = globalThis.fetch.bind(globalThis);
  const origHttpRequest = http.request.bind(http);
  const origHttpsRequest = https.request.bind(https);

  globalThis.fetch = async function patchedFetch(input, init) {
    const rawUrl =
      input instanceof Request ? input.url : input instanceof URL ? input.href : String(input);

    let urlObj;
    try {
      urlObj = new URL(rawUrl);
    } catch {
      return origFetch(input, init);
    }
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return origFetch(input, init);
    }
    const route = classifyUrl(urlObj);
    const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);

    if (route.action === 'passthrough') {
      return origFetch(input, init);
    }
    if (route.action === 'block') {
      throw makeIsolationError(route.href);
    }
    if (route.action === 'enotfound') {
      throw new TypeError('fetch failed', { cause: makeEnotfoundCause(route.hostname) });
    }
    if (route.action === 'timeout') {
      return waitForTimeoutOrAbort(signal);
    }

    if (route.action === 'rewrite') {
      const targetUrl = new URL(`${urlObj.pathname}${urlObj.search}`, route.origin);
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      for (const [k, v] of Object.entries(route.extraHeaders)) {
        headers.set(k, v);
      }
      if (input instanceof Request) {
        const reqClone = new Request(new Request(targetUrl.href, input), { ...init, headers });
        return origFetch(reqClone);
      }
      return origFetch(targetUrl.href, { ...init, headers });
    }

    // mock-site with redirect handling
    const redirectMode = init?.redirect ?? (input instanceof Request ? input.redirect : 'follow');
    let method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let bodyBuf = null;
    if (method !== 'GET' && method !== 'HEAD') {
      if (init?.body !== undefined) {
        bodyBuf = init.body;
      } else if (input instanceof Request && input.body !== null) {
        bodyBuf = await input.clone().arrayBuffer();
      }
    }

    const baseHeaders = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );

    let currentUrl = urlObj;
    let currentRoute = route;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      if (currentRoute.action === 'passthrough') {
        return origFetch(currentUrl.href, { ...init, method, headers: baseHeaders, body: bodyBuf });
      }
      if (currentRoute.action === 'block') {
        throw makeIsolationError(currentRoute.href);
      }
      if (currentRoute.action === 'enotfound') {
        throw new TypeError('fetch failed', { cause: makeEnotfoundCause(currentRoute.hostname) });
      }
      if (currentRoute.action === 'timeout') {
        return waitForTimeoutOrAbort(signal);
      }

      const targetUrl = new URL(`${currentUrl.pathname}${currentUrl.search}`, currentRoute.origin);
      const hopHeaders = new Headers(baseHeaders);
      for (const [k, v] of Object.entries(currentRoute.extraHeaders || {})) {
        hopHeaders.set(k, v);
      }

      const res = await origFetch(targetUrl.href, {
        method,
        headers: hopHeaders,
        body: method === 'GET' || method === 'HEAD' ? undefined : bodyBuf,
        signal,
        redirect: 'manual',
      });

      if (redirectMode === 'manual') {
        return withVirtualUrl(res, currentUrl.href);
      }

      if (REDIRECT_STATUSES.has(res.status)) {
        if (redirectMode === 'error') {
          throw new TypeError('fetch failed', { cause: new Error('unexpected redirect') });
        }
        const location = res.headers.get('location');
        if (!location) {
          return withVirtualUrl(res, currentUrl.href);
        }
        if (hop === MAX_REDIRECTS) {
          throw new TypeError('fetch failed', { cause: new Error('redirect count exceeded') });
        }
        if (res.status === 303 || ((res.status === 301 || res.status === 302) && method === 'POST')) {
          method = 'GET';
          bodyBuf = null;
          baseHeaders.delete('content-length');
          baseHeaders.delete('content-type');
        }
        currentUrl = new URL(location, currentUrl);
        currentRoute = classifyUrl(currentUrl);
        continue;
      }

      return withVirtualUrl(res, currentUrl.href);
    }

    throw new TypeError('fetch failed', { cause: new Error('redirect count exceeded') });
  };

  function makePatchedNodeRequest(defaultProtocol, origFn) {
    return function patchedNodeRequest(urlOrOpts, maybeOpts, maybeCb) {
      const { constructed, opts, cb } = normalizeNodeRequestArgs(
        defaultProtocol,
        urlOrOpts,
        maybeOpts,
        maybeCb,
      );
      const route = classifyUrl(constructed);

      if (route.action === 'passthrough') {
        return origFn(urlOrOpts, maybeOpts, maybeCb);
      }
      if (route.action === 'block') {
        throw makeIsolationError(route.href);
      }
      if (route.action === 'enotfound') {
        return createStubClientRequest('enotfound', route.hostname, opts.signal);
      }
      if (route.action === 'timeout') {
        return createStubClientRequest('timeout', route.hostname, opts.signal);
      }

      const mockUrl = new URL(route.origin);
      const rewrittenOpts = {
        ...opts,
        protocol: 'http:',
        hostname: mockUrl.hostname,
        host: mockUrl.hostname,
        port: Number(mockUrl.port),
        path: `${constructed.pathname}${constructed.search}`,
        headers: {
          ...(opts.headers || {}),
          ...route.extraHeaders,
        },
      };
      for (const tlsKey of [
        'agent',
        'servername',
        'rejectUnauthorized',
        'ca',
        'cert',
        'key',
        'pfx',
        'passphrase',
        'ciphers',
        'secureProtocol',
        'minVersion',
        'maxVersion',
        'checkServerIdentity',
        'sessionIdContext',
        'ALPNProtocols',
      ]) {
        delete rewrittenOpts[tlsKey];
      }
      return cb ? origHttpRequest(rewrittenOpts, cb) : origHttpRequest(rewrittenOpts);
    };
  }

  const patchedHttpRequest = makePatchedNodeRequest('http:', origHttpRequest);
  const patchedHttpsRequest = makePatchedNodeRequest('https:', origHttpsRequest);

  http.request = patchedHttpRequest;
  http.get = function patchedHttpGet(urlOrOpts, maybeOpts, maybeCb) {
    const req = patchedHttpRequest(urlOrOpts, maybeOpts, maybeCb);
    req.end();
    return req;
  };

  https.request = patchedHttpsRequest;
  https.get = function patchedHttpsGet(urlOrOpts, maybeOpts, maybeCb) {
    const req = patchedHttpsRequest(urlOrOpts, maybeOpts, maybeCb);
    req.end();
    return req;
  };

  Module.syncBuiltinESMExports();
}

installOutboundRedirect();
