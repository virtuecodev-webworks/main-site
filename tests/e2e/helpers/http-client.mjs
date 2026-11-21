function isPlainBodyObject(value) {
  if (value === null || typeof value !== 'object') return false;
  if (
    value instanceof Uint8Array ||
    Buffer.isBuffer(value) ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ReadableStream ||
    value instanceof ArrayBuffer ||
    value instanceof Blob
  ) {
    return false;
  }
  return Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype;
}

function parseSetCookieHeader(setCookieStr) {
  const parts = setCookieStr.split(';');
  const first = parts[0] || '';
  const eqIdx = first.indexOf('=');
  if (eqIdx <= 0) return null;

  const name = first.slice(0, eqIdx).trim();
  const rawVal = first.slice(eqIdx + 1).trim();
  let value = rawVal;
  try {
    value = decodeURIComponent(rawVal);
  } catch {
    value = rawVal;
  }

  let maxAge = null;
  let expiresPast = false;
  for (let i = 1; i < parts.length; i += 1) {
    const attr = parts[i].trim();
    const lower = attr.toLowerCase();
    if (lower.startsWith('max-age=')) {
      const n = Number(attr.slice('max-age='.length));
      if (!Number.isNaN(n)) maxAge = n;
    } else if (lower.startsWith('expires=')) {
      const ts = Date.parse(attr.slice('expires='.length));
      if (!Number.isNaN(ts) && ts <= Date.now()) {
        expiresPast = true;
      }
    }
  }

  const shouldDelete = value === '' || (maxAge !== null && maxAge <= 0) || expiresPast;
  return { name, value, shouldDelete };
}

export function createHttpClient({ baseUrl, cookies = {}, defaultHeaders = {} } = {}) {
  const jar = new Map();

  function setCookie(name, value) {
    if (value === undefined || value === null || value === '') {
      jar.delete(name);
    } else {
      jar.set(name, String(value));
    }
  }

  function setCookies(input) {
    if (!input) return;
    if (Array.isArray(input)) {
      for (const item of input) {
        if (item && typeof item.name === 'string') {
          setCookie(item.name, item.value);
        }
      }
      return;
    }
    if (input instanceof Map) {
      for (const [k, v] of input.entries()) {
        setCookie(k, v);
      }
      return;
    }
    if (typeof input === 'object') {
      for (const [k, v] of Object.entries(input)) {
        setCookie(k, v);
      }
    }
  }

  function deleteCookie(name) {
    jar.delete(name);
  }

  function clearCookies() {
    jar.clear();
  }

  function getCookies() {
    return Object.fromEntries(jar.entries());
  }

  function getCookieHeader() {
    if (jar.size === 0) return '';
    return Array.from(jar.entries())
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('; ');
  }

  setCookies(cookies);

  async function request(pathOrUrl, options = {}) {
    const targetUrl =
      pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
        ? pathOrUrl
        : new URL(pathOrUrl, baseUrl).href;

    const headers = new Headers(defaultHeaders);
    if (options.headers) {
      const extra = new Headers(options.headers);
      for (const [k, v] of extra.entries()) {
        headers.set(k, v);
      }
    }

    if (jar.size > 0 && !headers.has('cookie')) {
      headers.set('cookie', getCookieHeader());
    }

    let body = options.body;
    if (isPlainBodyObject(body)) {
      body = JSON.stringify(body);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }
    }

    const redirect = options.redirect ?? 'manual';
    const fetchOpts = {
      ...options,
      headers,
      body,
      redirect,
    };

    const res = await fetch(targetUrl, fetchOpts);

    const setCookiesList =
      typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    for (const rawCookie of setCookiesList) {
      const parsed = parseSetCookieHeader(rawCookie);
      if (!parsed) continue;
      if (parsed.shouldDelete) {
        jar.delete(parsed.name);
      } else {
        jar.set(parsed.name, parsed.value);
      }
    }

    const text = await res.text();
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    let json = null;
    if (text && (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('['))) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      location: res.headers.get('location'),
      url: res.url,
      text,
      json,
      cookies: getCookies(),
      raw: res,
    };
  }

  return {
    setCookie,
    setCookies,
    deleteCookie,
    clearCookies,
    getCookieHeader,
    getCookies,
    request,
    get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body }),
    patch: (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body }),
    put: (path, body, opts = {}) => request(path, { ...opts, method: 'PUT', body }),
    del: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
  };
}
