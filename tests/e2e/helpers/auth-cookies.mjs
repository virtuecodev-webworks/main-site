import { createHmac, timingSafeEqual } from 'node:crypto';

export const E2E_AUTH_JWT_SECRET =
  process.env.E2E_AUTH_JWT_SECRET || 'e2e-mock-supabase-jwt-secret';

export const E2E_USERS = Object.freeze({
  client: Object.freeze({
    id: '00000000-0000-4000-8000-000000000001',
    email: 'client@e2e.test',
    full_name: 'E2E Client User',
    profileRole: 'client',
  }),
  agent: Object.freeze({
    id: '00000000-0000-4000-8000-000000000002',
    email: 'agent@e2e.test',
    full_name: 'E2E Staff Agent',
    profileRole: 'agent',
  }),
  admin: Object.freeze({
    id: '00000000-0000-4000-8000-000000000003',
    email: 'admin-profile@e2e.test',
    full_name: 'E2E Profile Admin',
    profileRole: 'admin',
  }),
  allowlist: Object.freeze({
    id: '00000000-0000-4000-8000-000000000004',
    email: 'allowlisted-admin@virtuecowebworks.solutions',
    full_name: 'E2E Allowlist Admin',
    profileRole: 'client',
  }),
});

export function getSupabaseCookieBaseName(supabaseUrl = 'http://127.0.0.1:54321') {
  const hostname = new URL(supabaseUrl).hostname;
  const prefix = hostname.split('.')[0];
  return `sb-${prefix}-auth-token`;
}

function toBase64Url(input) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(segment) {
  return Buffer.from(segment, 'base64url').toString('utf8');
}

export function signE2eJwt(payload, secret = E2E_AUTH_JWT_SECRET) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

export function verifyE2eJwt(token, secret = E2E_AUTH_JWT_SECRET) {
  if (typeof token !== 'string' || !token) {
    return { valid: false, reason: 'missing_token' };
  }
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => !p)) {
    return { valid: false, reason: 'malformed_jwt' };
  }
  const [headerPart, payloadPart, sigPart] = parts;
  const expectedSig = createHmac('sha256', secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest('base64url');

  const sigBuf = Buffer.from(sigPart, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: 'invalid_signature' };
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(payloadPart));
  } catch {
    return { valid: false, reason: 'invalid_payload_json' };
  }

  if (!payload || typeof payload.sub !== 'string' || typeof payload.exp !== 'number') {
    return { valid: false, reason: 'missing_claims' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSec) {
    return { valid: false, reason: 'expired_jwt' };
  }

  return { valid: true, payload };
}

export function buildSessionObject({
  user,
  accessToken,
  refreshToken = 'e2e-refresh-token',
  ttlSeconds = 3600,
  expiresAt,
}) {
  const nowSec = Math.floor(Date.now() / 1000);
  const resolvedExpiresAt = expiresAt ?? nowSec + ttlSeconds;
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: ttlSeconds,
    expires_at: resolvedExpiresAt,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: user.email,
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
      user_metadata: {
        full_name: user.full_name ?? null,
      },
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_anonymous: false,
    },
  };
}

export function chunkCookieValue(baseName, encodedValue, chunkSize = 3180) {
  let encoded = encodeURIComponent(encodedValue);
  if (encoded.length <= chunkSize) {
    return [{ name: baseName, value: encodedValue }];
  }

  const chunks = [];
  while (encoded.length > 0) {
    let encodedHead = encoded.slice(0, chunkSize);
    const lastEscapePos = encodedHead.lastIndexOf('%');
    if (lastEscapePos > chunkSize - 3) {
      encodedHead = encodedHead.slice(0, lastEscapePos);
    }

    let decodedHead = '';
    while (encodedHead.length > 0) {
      try {
        decodedHead = decodeURIComponent(encodedHead);
        break;
      } catch (err) {
        if (
          err instanceof URIError &&
          encodedHead.charAt(encodedHead.length - 3) === '%' &&
          encodedHead.length > 3
        ) {
          encodedHead = encodedHead.slice(0, encodedHead.length - 3);
        } else {
          throw err;
        }
      }
    }

    chunks.push(decodedHead);
    encoded = encoded.slice(encodedHead.length);
  }

  return chunks.map((value, index) => ({
    name: `${baseName}.${index}`,
    value,
  }));
}

function serializeCookieHeader(cookies) {
  return cookies.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join('; ');
}

export function mintAuthCookies(roleOrOptions) {
  const opts =
    typeof roleOrOptions === 'string' ? { role: roleOrOptions } : { ...(roleOrOptions || {}) };

  const {
    role = 'anon',
    supabaseUrl = process.env.E2E_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'http://127.0.0.1:54321',
    encoding = 'base64url',
    chunkSize = 3180,
    ttlSeconds = 3600,
    userOverrides = {},
    malformed,
    jwtSecret = E2E_AUTH_JWT_SECRET,
  } = opts;

  const baseName = getSupabaseCookieBaseName(supabaseUrl);

  if (malformed) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (malformed === 'base64') {
      const cookies = [{ name: baseName, value: 'base64-***invalid-base64url***' }];
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken: null,
        user: null,
      };
    }
    if (malformed === 'json') {
      const cookies = [{ name: baseName, value: `base64-${toBase64Url('{bad json')}` }];
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken: null,
        user: null,
      };
    }
    if (malformed === 'missing_fields') {
      const cookies = [
        { name: baseName, value: `base64-${toBase64Url(JSON.stringify({ access_token: 'only-this' }))}` },
      ];
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken: null,
        user: null,
      };
    }
    if (malformed === 'demo_cookie') {
      const cookies = [
        {
          name: 'vcw:demo_session',
          value: JSON.stringify({ userId: 'demo-admin', email: 'admin@e2e.test', role: 'admin' }),
        },
      ];
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken: null,
        user: null,
      };
    }

    const baseUser = E2E_USERS[role === 'anon' ? 'admin' : role] || E2E_USERS.admin;
    const user = { ...baseUser, ...userOverrides };

    if (malformed === 'forged_jwt') {
      const accessToken = signE2eJwt(
        {
          sub: user.id,
          email: user.email,
          role: 'authenticated',
          aud: 'authenticated',
          user_metadata: { full_name: user.full_name ?? null },
          iat: nowSec,
          exp: nowSec + ttlSeconds,
        },
        'wrong-forged-secret',
      );
      const session = buildSessionObject({ user, accessToken, ttlSeconds });
      const encoded =
        encoding === 'raw' ? JSON.stringify(session) : `base64-${toBase64Url(JSON.stringify(session))}`;
      const cookies = chunkCookieValue(baseName, encoded, chunkSize);
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken,
        user: session.user,
      };
    }

    if (malformed === 'expired_session') {
      const accessToken = signE2eJwt(
        {
          sub: user.id,
          email: user.email,
          role: 'authenticated',
          aud: 'authenticated',
          user_metadata: { full_name: user.full_name ?? null },
          iat: nowSec - 600,
          exp: nowSec + ttlSeconds,
        },
        jwtSecret,
      );
      const session = buildSessionObject({
        user,
        accessToken,
        ttlSeconds,
        expiresAt: nowSec - 300,
      });
      const encoded =
        encoding === 'raw' ? JSON.stringify(session) : `base64-${toBase64Url(JSON.stringify(session))}`;
      const cookies = chunkCookieValue(baseName, encoded, chunkSize);
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken,
        user: session.user,
      };
    }

    if (malformed === 'expired_jwt') {
      const accessToken = signE2eJwt(
        {
          sub: user.id,
          email: user.email,
          role: 'authenticated',
          aud: 'authenticated',
          user_metadata: { full_name: user.full_name ?? null },
          iat: nowSec - 600,
          exp: nowSec - 60,
        },
        jwtSecret,
      );
      const session = buildSessionObject({
        user,
        accessToken,
        ttlSeconds,
        expiresAt: nowSec + ttlSeconds,
      });
      const encoded =
        encoding === 'raw' ? JSON.stringify(session) : `base64-${toBase64Url(JSON.stringify(session))}`;
      const cookies = chunkCookieValue(baseName, encoded, chunkSize);
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken,
        user: session.user,
      };
    }

    if (malformed === 'wrong_prefix') {
      const accessToken = signE2eJwt(
        {
          sub: user.id,
          email: user.email,
          role: 'authenticated',
          aud: 'authenticated',
          user_metadata: { full_name: user.full_name ?? null },
          iat: nowSec,
          exp: nowSec + ttlSeconds,
        },
        jwtSecret,
      );
      const session = buildSessionObject({ user, accessToken, ttlSeconds });
      const encoded =
        encoding === 'raw' ? JSON.stringify(session) : `base64-${toBase64Url(JSON.stringify(session))}`;
      const cookies = chunkCookieValue('sb-wrongproject-auth-token', encoded, chunkSize);
      return {
        cookies,
        cookieHeader: serializeCookieHeader(cookies),
        accessToken,
        user: session.user,
      };
    }
  }

  if (role === 'anon') {
    return {
      cookies: [],
      cookieHeader: '',
      accessToken: null,
      user: null,
    };
  }

  const templateUser = E2E_USERS[role];
  if (!templateUser) {
    throw new Error(`Unknown E2E auth role: ${role}`);
  }
  const user = { ...templateUser, ...userOverrides };
  const nowSec = Math.floor(Date.now() / 1000);
  const accessToken = signE2eJwt(
    {
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      user_metadata: { full_name: user.full_name ?? null },
      iat: nowSec,
      exp: nowSec + ttlSeconds,
    },
    jwtSecret,
  );

  const session = buildSessionObject({ user, accessToken, ttlSeconds });
  const jsonStr = JSON.stringify(session);
  const encoded = encoding === 'raw' ? jsonStr : `base64-${toBase64Url(jsonStr)}`;
  const cookies = chunkCookieValue(baseName, encoded, chunkSize);

  return {
    cookies,
    cookieHeader: serializeCookieHeader(cookies),
    accessToken,
    user: session.user,
  };
}

export function mintAuthCookieHeader(role, options = {}) {
  return mintAuthCookies({ ...options, role }).cookieHeader;
}
