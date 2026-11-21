import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ensureHarness } from './helpers/harness.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const E2E_DIR = __dirname;

const TIER_SPECS = [
  { tier: 1, file: 'tier1-features.e2e.test.mjs', min: 45 },
  { tier: 2, file: 'tier2-boundaries.e2e.test.mjs', min: 45 },
  { tier: 3, file: 'tier3-combinations.e2e.test.mjs', min: 9 },
  { tier: 4, file: 'tier4-workflows.e2e.test.mjs', min: 5 },
];

function parseArgs(argv) {
  const flags = {
    checkSuite: false,
    requireTiers: false,
    tier: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--check-suite') {
      flags.checkSuite = true;
    } else if (arg === '--require-tiers') {
      flags.requireTiers = true;
    } else if (arg.startsWith('--tier=')) {
      flags.tier = Number(arg.slice('--tier='.length));
    } else if (arg === '--tier' && i + 1 < argv.length) {
      flags.tier = Number(argv[i + 1]);
      i += 1;
    }
  }
  return flags;
}

function collectMjsFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMjsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.mjs')) {
      results.push(full);
    }
  }
  return results.sort();
}

function countTierTests(tierFileAbs) {
  const tierUrl = pathToFileURL(tierFileAbs).href;
  const counterScript = `
    import { registerHooks } from 'node:module';
    let active = 0;
    let skipped = 0;
    function stubSuite(_name, optsOrFn, maybeFn) {
      const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
      if (typeof fn === 'function') fn();
    }
    function stubTest(name, optsOrFn, maybeFn) {
      const opts = typeof optsOrFn === 'object' && optsOrFn !== null ? optsOrFn : {};
      const fn = typeof optsOrFn === 'function' ? optsOrFn : maybeFn;
      if (opts.skip || opts.todo) skipped += 1;
      else active += 1;
      void name;
      void fn;
    }
    stubTest.skip = () => { skipped += 1; };
    stubTest.todo = () => { skipped += 1; };
    stubTest.only = () => { active += 1; };
    stubSuite.skip = () => {};
    const noop = () => {};
    const mockExports = {
      default: stubTest,
      test: stubTest,
      it: stubTest,
      describe: stubSuite,
      suite: stubSuite,
      before: noop,
      after: noop,
      beforeEach: noop,
      afterEach: noop,
    };
    const stubSource = 'const m = globalThis.__E2E_MOCK_NODE_TEST__; export default m.default; export const { test, it, describe, suite, before, after, beforeEach, afterEach } = m;';
    globalThis.__E2E_MOCK_NODE_TEST__ = mockExports;
    registerHooks({
      load(url, context, nextLoad) {
        if (url === 'node:test') {
          return { format: 'module', source: stubSource, shortCircuit: true };
        }
        return nextLoad(url, context);
      },
    });
    await import(${JSON.stringify(tierUrl)});
    console.log(JSON.stringify({ active, skipped }));
  `;
  const stdout = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', counterScript],
    { cwd: ROOT_DIR, encoding: 'utf8', shell: false },
  );
  return JSON.parse(stdout.trim());
}

function runChildProcess(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT_DIR,
      env,
      shell: false,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) resolve(1);
      else resolve(code ?? 1);
    });
  });
}

async function runLiveSelfTests(harness) {
  const outboundRedirectAbs = path.resolve(E2E_DIR, 'mocks/outbound-redirect.mjs');
  const authCookiesUrl = pathToFileURL(path.resolve(E2E_DIR, 'helpers/auth-cookies.mjs')).href;
  const httpClientUrl = pathToFileURL(path.resolve(E2E_DIR, 'helpers/http-client.mjs')).href;
  const harnessUrl = pathToFileURL(path.resolve(E2E_DIR, 'helpers/harness.mjs')).href;

  const selfTestCode = `
    import assert from 'node:assert/strict';
    import http from 'node:http';
    import https from 'node:https';
    import nodemailer from 'nodemailer';
    import { createServerClient } from '@supabase/ssr';
    import { createClient } from '@supabase/supabase-js';
    import { mintAuthCookies } from ${JSON.stringify(authCookiesUrl)};
    import { createHttpClient } from ${JSON.stringify(httpClientUrl)};
    import {
      resetHarness,
      getSmtpMessages,
      setSmtpScenario,
      getDiscoveryRequests,
      setGeminiScenario,
      setDiscoveryScenario,
    } from ${JSON.stringify(harnessUrl)};

    const supabaseUrl = process.env.E2E_SUPABASE_URL;
    const controlUrl = process.env.E2E_CONTROL_URL;
    const smtpPort = Number(process.env.E2E_SMTP_PORT);
    const anonKey = 'e2e-anon-key';
    const serviceRoleKey = 'e2e-service-role-key';

    // 1. @supabase/ssr + auth-cookies.mjs
    for (const role of ['admin', 'agent', 'client', 'allowlist']) {
      const minted = mintAuthCookies({ role, supabaseUrl });
      const ssrClient = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll: () => minted.cookies,
          setAll: () => {},
        },
      });
      const { data: userData, error: userErr } = await ssrClient.auth.getUser();
      assert.equal(userErr, null, \`getUser failed for \${role}\`);
      assert.equal(userData.user.email, minted.user.email);

      const { data: profile, error: profErr } = await ssrClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', userData.user.id)
        .maybeSingle();
      assert.equal(profErr, null);
      const expectedProfileRole = role === 'allowlist' ? 'client' : role;
      assert.equal(profile.role, expectedProfileRole);
    }

    // Chunked cookies round-trip
    {
      const mintedChunked = mintAuthCookies({ role: 'admin', supabaseUrl, chunkSize: 200 });
      assert.ok(mintedChunked.cookies.length > 1, 'Expected chunked cookies');
      const ssrChunked = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll: () => mintedChunked.cookies,
          setAll: () => {},
        },
      });
      const { data, error } = await ssrChunked.auth.getUser();
      assert.equal(error, null);
      assert.equal(data.user.email, mintedChunked.user.email);
    }

    // Anon + malformed / forged / expired JWTs rejected
    {
      const anonClient = createServerClient(supabaseUrl, anonKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      });
      const { data: anonData } = await anonClient.auth.getUser();
      assert.equal(anonData.user, null);

      for (const badKind of ['forged_jwt', 'expired_jwt', 'base64', 'json', 'missing_fields']) {
        const badMinted = mintAuthCookies({ role: 'admin', supabaseUrl, malformed: badKind });
        const badClient = createServerClient(supabaseUrl, anonKey, {
          cookies: { getAll: () => badMinted.cookies, setAll: () => {} },
        });
        const { data: badData } = await badClient.auth.getUser();
        assert.equal(badData.user, null, \`Expected null user for malformed=\${badKind}\`);
      }
    }
    console.log('[self-test] PASS: @supabase/ssr & auth-cookies');

    // 2. @supabase/supabase-js PostgREST CRUD + RLS + PGRST116 + count=exact
    {
      const adminDb = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: upsertedSettings, error: settingsErr } = await adminDb
        .from('outreach_settings')
        .upsert({ id: true, daily_send_cap: 25, industries: ['dental'] }, { onConflict: 'id' })
        .select('*')
        .single();
      assert.equal(settingsErr, null);
      assert.equal(upsertedSettings.daily_send_cap, 25);

      const { data: insertedProspect, error: insErr } = await adminDb
        .from('outreach_prospects')
        .insert({
          business_name: 'SelfTest Dental',
          normalized_domain: 'selftest.mock.test',
          dedup_key: 'domain:selftest.mock.test',
          status: 'qualified',
        })
        .select('*')
        .single();
      assert.equal(insErr, null);
      assert.ok(insertedProspect.id);

      const { data: maybeNone, error: maybeErr } = await adminDb
        .from('outreach_prospects')
        .select('*')
        .eq('dedup_key', 'nonexistent')
        .maybeSingle();
      assert.equal(maybeErr, null);
      assert.equal(maybeNone, null);

      const { error: singleErr } = await adminDb
        .from('outreach_prospects')
        .select('*')
        .eq('dedup_key', 'nonexistent')
        .single();
      assert.ok(singleErr, 'Expected PGRST116 error on .single() with 0 rows');
      assert.equal(singleErr.code, 'PGRST116');

      const { data: searched } = await adminDb
        .from('outreach_prospects')
        .select('*')
        .ilike('business_name', '%selftest%')
        .range(0, 9);
      assert.equal(searched.length, 1);

      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
      await adminDb.from('outreach_dispatches').insert({
        prospect_id: insertedProspect.id,
        business_name: 'SelfTest Dental',
        recipient_email: 'owner@selftest.mock.test',
        is_dry_run: false,
        subject: 'Hello',
        status: 'sent',
        sent_at: now.toISOString(),
      });
      const { count, error: countErr } = await adminDb
        .from('outreach_dispatches')
        .select('id', { count: 'exact', head: true })
        .eq('is_dry_run', false)
        .eq('status', 'sent')
        .gte('sent_at', start)
        .lt('sent_at', end);
      assert.equal(countErr, null);
      assert.equal(count, 1);

      // RLS test: non-admin client rejected on outreach_settings insert/upsert
      const clientMinted = mintAuthCookies({ role: 'client', supabaseUrl });
      const nonAdminDb = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: \`Bearer \${clientMinted.accessToken}\` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: rlsErr } = await nonAdminDb
        .from('outreach_prospects')
        .insert({ business_name: 'Blocked', dedup_key: 'blocked:key' });
      assert.ok(rlsErr);
      assert.equal(rlsErr.code, '42501');

      await adminDb.from('outreach_prospects').delete().eq('id', insertedProspect.id);

      // Atomic multi-row POST rollback on 23505 collision
      const { error: batchErr } = await adminDb
        .from('outreach_prospects')
        .insert([
          {
            business_name: 'Batch Row 1',
            normalized_domain: 'batch-atomic.mock.test',
            dedup_key: 'domain:batch-atomic.mock.test:1',
            status: 'qualified',
          },
          {
            business_name: 'Batch Row 2',
            normalized_domain: 'batch-atomic.mock.test',
            dedup_key: 'domain:batch-atomic.mock.test:2',
            status: 'qualified',
          },
        ]);
      assert.ok(batchErr, 'Expected 23505 error on colliding multi-row insert');
      assert.equal(batchErr.code, '23505');
      const { data: afterBatchRows, error: afterBatchErr } = await adminDb
        .from('outreach_prospects')
        .select('id')
        .eq('normalized_domain', 'batch-atomic.mock.test');
      assert.equal(afterBatchErr, null);
      assert.equal(afterBatchRows.length, 0, 'Expected atomic rollback of multi-row POST');
    }
    console.log('[self-test] PASS: @supabase/supabase-js PostgREST CRUD, RLS, PGRST116 & count=exact');

    // 3. nodemailer plaintext SMTP + UTF-8 MIME + 550 bounce
    {
      await resetHarness(controlUrl);
      const transport = nodemailer.createTransport({
        host: '127.0.0.1',
        port: smtpPort,
        secure: false,
        auth: { user: 'e2e-smtp-user', pass: 'e2e-smtp-pass' },
      });

      await transport.sendMail({
        from: 'Virtue & Co. <hello@virtuecowebworks.solutions>',
        to: 'lead@healthy.mock.test',
        subject: 'Website Audit — Quick Wins ✓',
        text: 'Hello — check these quick wins ✓',
        html: '<p>Hello — check these <strong>quick wins ✓</strong></p>',
      });

      const { messages } = await getSmtpMessages(controlUrl);
      assert.equal(messages.length, 1);
      assert.equal(messages[0].subject, 'Website Audit — Quick Wins ✓');
      assert.ok(messages[0].html.includes('quick wins ✓'));
      assert.ok(messages[0].text.includes('—'));
      assert.deepEqual(messages[0].rcptTo, ['lead@healthy.mock.test']);

      // 550 bounce simulation
      await setSmtpScenario(controlUrl, { rejectRecipients: ['bounce@healthy.mock.test'] });
      await assert.rejects(
        () =>
          transport.sendMail({
            from: 'Virtue & Co. <hello@virtuecowebworks.solutions>',
            to: 'bounce@healthy.mock.test',
            subject: 'Should bounce',
            text: 'Bounce test',
          }),
        (err) => err && (err.responseCode === 550 || String(err.message).includes('550')),
      );
      await setSmtpScenario(controlUrl, { reset: true });
    }
    console.log('[self-test] PASS: nodemailer plaintext SMTP, UTF-8 MIME & 550 bounce');

    // 4. outbound-redirect.mjs + mock-gemini + mock-discovery + mock-target-sites
    {
      await resetHarness(controlUrl);

      // Gemini
      const gemRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyMockE2ETestKey1234567890abcdef',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Business: Bella Salon' }] }],
          }),
        },
      );
      assert.equal(gemRes.status, 200);
      const gemJson = await gemRes.json();
      const parsedPitch = JSON.parse(gemJson.candidates[0].content.parts[0].text);
      assert.ok(parsedPitch.subject.includes('Bella Salon'));

      await setGeminiScenario(controlUrl, { mode: 'rate_limit_429' });
      const gem429 = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test',
        { method: 'POST', body: '{}' },
      );
      assert.equal(gem429.status, 429);
      await setGeminiScenario(controlUrl, { reset: true });

      // Discovery (Overpass, Nominatim, Google Places, Serper)
      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=[out:json];node(1);out;',
      });
      assert.equal(overpassRes.status, 200);
      const overpassJson = await overpassRes.json();
      assert.ok(Array.isArray(overpassJson.elements) && overpassJson.elements.length > 0);

      const nomRes = await fetch('https://nominatim.openstreetmap.org/search?q=Austin&format=json');
      assert.equal(nomRes.status, 200);

      const gpRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ textQuery: 'roofing Austin' }),
      });
      assert.equal(gpRes.status, 200);

      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: 'accounting Austin' }),
      });
      assert.equal(serperRes.status, 200);

      const { requests: discReqs } = await getDiscoveryRequests(controlUrl);
      assert.equal(discReqs.length, 4);

      await setDiscoveryScenario(controlUrl, { provider: 'overpass', mode: 'error_500' });
      const err500 = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'x' });
      assert.equal(err500.status, 500);
      await setDiscoveryScenario(controlUrl, { reset: true });

      // Target sites + res.url + res.clone().url
      const wixRes = await fetch('https://wix-legacy.mock.test/');
      assert.equal(wixRes.status, 200);
      assert.equal(wixRes.url, 'https://wix-legacy.mock.test/');
      assert.equal(wixRes.clone().url, 'https://wix-legacy.mock.test/');
      const wixHtml = await wixRes.text();
      assert.ok(wixHtml.includes('static.wixstatic.com'));

      // redirect-to-https
      const upgradeRes = await fetch('http://redirect-to-https.mock.test/');
      assert.equal(upgradeRes.status, 200);
      assert.equal(upgradeRes.url, 'https://redirect-to-https.mock.test/landing');
      assert.equal(upgradeRes.clone().url, 'https://redirect-to-https.mock.test/landing');

      // redirect-loop
      await assert.rejects(() => fetch('https://redirect-loop.mock.test/'), /fetch failed/);

      // ENOTFOUND
      await assert.rejects(
        () => fetch('https://unreachable.mock.test/'),
        (err) => err?.cause?.code === 'ENOTFOUND',
      );

      // timeout
      await assert.rejects(
        () => fetch('https://timeout.mock.test/', { signal: AbortSignal.timeout(100) }),
        (err) => err?.name === 'TimeoutError' || err?.name === 'AbortError',
      );

      // Network isolation blocking (fetch + http + https + scheme/whitespace normalization)
      await assert.rejects(
        () => fetch('https://example.com/'),
        (err) => err?.code === 'E2E_NETWORK_ISOLATION_VIOLATION',
      );
      await assert.rejects(
        () => fetch('HTTP://example.com/'),
        (err) => err?.code === 'E2E_NETWORK_ISOLATION_VIOLATION',
      );
      await assert.rejects(
        () => fetch(' https://example.com/'),
        (err) => err?.code === 'E2E_NETWORK_ISOLATION_VIOLATION',
      );
      assert.throws(
        () => https.get('https://example.com/'),
        (err) => err?.code === 'E2E_NETWORK_ISOLATION_VIOLATION',
      );
      assert.throws(
        () => http.request('http://example.com/'),
        (err) => err?.code === 'E2E_NETWORK_ISOLATION_VIOLATION',
      );

      // https.get with explicit https.Agent against *.mock.test
      const agentStatus = await new Promise((resolve, reject) => {
        const req = https.get(
          'https://healthy.mock.test/',
          { agent: new https.Agent({ keepAlive: false }) },
          (res) => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
          },
        );
        req.on('error', reject);
      });
      assert.equal(agentStatus, 200);
    }
    console.log('[self-test] PASS: outbound-redirect, mock-gemini, mock-discovery & mock-target-sites');

    // 5. http-client.mjs (Set-Cookie + redirect: manual)
    {
      const localServer = http.createServer((req, res) => {
        if (req.url === '/login') {
          res.writeHead(302, {
            'set-cookie': ['session_id=abc123; Path=/; HttpOnly', 'flash=ok; Path=/'],
            location: '/dashboard',
          });
          res.end();
          return;
        }
        if (req.url === '/dashboard') {
          const payload = JSON.stringify({ cookieHeader: req.headers.cookie || '' });
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(payload);
          return;
        }
        res.writeHead(404);
        res.end();
      });

      await new Promise((resolve) => localServer.listen(0, '127.0.0.1', resolve));
      const { port } = localServer.address();
      const client = createHttpClient({ baseUrl: \`http://127.0.0.1:\${port}\` });

      const loginRes = await client.post('/login', { ok: true });
      assert.equal(loginRes.status, 302);
      assert.equal(loginRes.location, '/dashboard');
      assert.equal(loginRes.cookies.session_id, 'abc123');
      assert.equal(loginRes.cookies.flash, 'ok');

      const dashRes = await client.get('/dashboard');
      assert.equal(dashRes.status, 200);
      assert.ok(dashRes.json.cookieHeader.includes('session_id=abc123'));

      await new Promise((resolve) => localServer.close(resolve));
    }
    console.log('[self-test] PASS: http-client Set-Cookie & redirect: manual');
  `;

  const existingNodeOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : '';
  const importFlag = `--import=${pathToFileURL(outboundRedirectAbs).href}`;
  const childEnv = {
    ...process.env,
    NODE_OPTIONS: `${existingNodeOptions}${importFlag}`.trim(),
    E2E_MOCK_GEMINI_ORIGIN: harness.geminiOrigin,
    E2E_MOCK_DISCOVERY_ORIGIN: harness.discoveryOrigin,
    E2E_MOCK_SITES_ORIGIN: harness.sitesOrigin,
    E2E_CONTROL_URL: harness.controlUrl,
    E2E_SUPABASE_URL: harness.supabaseUrl,
    E2E_SMTP_PORT: String(harness.smtpPort),
  };

  const exitCode = await runChildProcess(
    ['--input-type=module', '-e', selfTestCode],
    childEnv,
  );
  if (exitCode !== 0) {
    throw new Error(`Live self-tests failed with exit code ${exitCode}`);
  }
}

async function runCheckSuite(flags) {
  const mjsFiles = collectMjsFiles(E2E_DIR);
  console.log(`[check-suite] Syntax checking ${mjsFiles.length} .mjs file(s)...`);
  for (const file of mjsFiles) {
    execFileSync(process.execPath, ['--check', file], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: false,
    });
  }
  console.log('[check-suite] Syntax check passed.');

  for (const spec of TIER_SPECS) {
    const abs = path.join(E2E_DIR, spec.file);
    if (!fs.existsSync(abs)) {
      if (flags.requireTiers) {
        console.error(`[check-suite] FAIL: Missing required tier file ${spec.file}`);
        return 1;
      }
      console.log(`[check-suite] Tier file pending (E2E-M2): skipping count check for ${spec.file}`);
      continue;
    }
    const counts = countTierTests(abs);
    if (counts.skipped > 0 || counts.active < spec.min) {
      console.error(
        `[check-suite] FAIL: ${spec.file} active=${counts.active} (min ${spec.min}), skipped=${counts.skipped}`,
      );
      return 1;
    }
    console.log(`[check-suite] PASS: ${spec.file} active=${counts.active}, skipped=${counts.skipped}`);
  }

  const harness = await ensureHarness({ mocksOnly: true, forceStandalone: true });
  try {
    await runLiveSelfTests(harness);
  } finally {
    await harness.close();
  }

  console.log('[check-suite] All checks passed.');
  return 0;
}

async function runTiers(flags) {
  const selectedSpecs =
    flags.tier !== null ? TIER_SPECS.filter((s) => s.tier === flags.tier) : TIER_SPECS;

  const tierFiles = selectedSpecs
    .map((s) => path.join(E2E_DIR, s.file))
    .filter((p) => fs.existsSync(p));

  if (tierFiles.length === 0) {
    console.error('[run-e2e] No matching tier test files found under tests/e2e/.');
    return 1;
  }

  const harness = await ensureHarness();
  let closing = false;
  const handleSignal = async () => {
    if (closing) return;
    closing = true;
    await harness.close();
    process.exit(1);
  };
  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  try {
    const env = {
      ...process.env,
      E2E_BASE_URL: harness.baseUrl,
      E2E_CONTROL_URL: harness.controlUrl,
      E2E_SUPABASE_URL: harness.supabaseUrl,
      E2E_SMTP_PORT: String(harness.smtpPort),
      E2E_CRON_SECRET: harness.cronSecret,
      E2E_ADMIN_ALLOWLIST_EMAIL: harness.adminAllowlistEmail,
      E2E_MOCK_SITES_ORIGIN: harness.sitesOrigin,
      E2E_MOCK_DISCOVERY_ORIGIN: harness.discoveryOrigin,
      E2E_MOCK_GEMINI_ORIGIN: harness.geminiOrigin,
    };
    const exitCode = await runChildProcess(
      ['--test', '--test-concurrency=1', ...tierFiles],
      env,
    );
    return exitCode;
  } finally {
    process.removeListener('SIGINT', handleSignal);
    process.removeListener('SIGTERM', handleSignal);
    await harness.close();
  }
}

const flags = parseArgs(process.argv.slice(2));
const exitCode = flags.checkSuite ? await runCheckSuite(flags) : await runTiers(flags);
process.exit(exitCode);
