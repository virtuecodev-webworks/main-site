import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { E2E_AUTH_JWT_SECRET, E2E_USERS, verifyE2eJwt } from '../helpers/auth-cookies.mjs';

const OUTREACH_TABLES = new Set([
  'outreach_settings',
  'outreach_prospects',
  'outreach_runs',
  'outreach_dispatches',
  'outreach_opt_outs',
]);

const AUX_TABLES = new Set([
  'site_design',
  'projects',
  'inquiries',
  'transactions',
  'orders',
  'newsletter_dispatches',
  'newsletter_subscribers',
]);

const ALL_TABLES = new Set(['profiles', ...OUTREACH_TABLES, ...AUX_TABLES]);

const PRIMARY_KEYS = {
  profiles: ['id'],
  outreach_settings: ['id'],
  outreach_prospects: ['id'],
  outreach_runs: ['id'],
  outreach_dispatches: ['id'],
  outreach_opt_outs: ['email'],
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
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

function sendEmpty(res, status, extraHeaders = {}) {
  res.writeHead(status, {
    ...extraHeaders,
  });
  res.end();
}

function parsePrefer(headerVal) {
  const raw = typeof headerVal === 'string' ? headerVal : '';
  const tokens = raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  let resolution = null;
  if (tokens.includes('resolution=merge-duplicates')) {
    resolution = 'merge-duplicates';
  } else if (tokens.includes('resolution=ignore-duplicates')) {
    resolution = 'ignore-duplicates';
  }
  const returnRepresentation = tokens.includes('return=representation');
  const countExact = tokens.some(
    (t) => t === 'count=exact' || t === 'count=planned' || t === 'count=estimated',
  );
  return { resolution, returnRepresentation, countExact };
}

function coerceFilterScalar(rawVal, sampleVal) {
  if (rawVal === 'null') return null;
  if (rawVal === 'true') return true;
  if (rawVal === 'false') return false;
  if (typeof sampleVal === 'number') {
    const num = Number(rawVal);
    if (!Number.isNaN(num)) return num;
  }
  if (typeof sampleVal === 'boolean') {
    if (rawVal === 'true' || rawVal === '1') return true;
    if (rawVal === 'false' || rawVal === '0') return false;
  }
  return rawVal;
}

function likePatternToRegExp(pattern, caseInsensitive) {
  let regexStr = '^';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      regexStr += next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
    } else if (ch === '%') {
      regexStr += '.*';
    } else if (ch === '_') {
      regexStr += '.';
    } else {
      regexStr += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  regexStr += '$';
  return new RegExp(regexStr, caseInsensitive ? 'is' : 's');
}

function parseInList(rawList) {
  const inner = rawList.startsWith('(') && rawList.endsWith(')') ? rawList.slice(1, -1) : rawList;
  if (!inner.trim()) return [];
  const items = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (ch === '"' && inner[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      items.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur !== '' || inner.endsWith(',')) {
    items.push(cur.trim());
  }
  return items;
}

function splitTopLevelCommas(str) {
  const parts = [];
  let cur = '';
  let depth = 0;
  let inQuotes = false;
  for (let i = 0; i < str.length; i += 1) {
    const ch = str[i];
    if (ch === '"' && str[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      cur += ch;
      continue;
    }
    if (!inQuotes) {
      if (ch === '(') depth += 1;
      else if (ch === ')' && depth > 0) depth -= 1;
      else if (ch === ',' && depth === 0) {
        parts.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function evaluateOperator(rowVal, op, rawVal) {
  if (op === 'is') {
    if (rawVal === 'null') return rowVal === null || rowVal === undefined;
    if (rawVal === 'true') return rowVal === true;
    if (rawVal === 'false') return rowVal === false;
    return false;
  }

  if (op === 'in') {
    const list = parseInList(rawVal).map((item) => coerceFilterScalar(item, rowVal));
    return list.some((item) => item === rowVal);
  }

  if (rowVal === null || rowVal === undefined) {
    return op === 'neq' ? rawVal !== 'null' : false;
  }

  if (op === 'like' || op === 'ilike') {
    const re = likePatternToRegExp(rawVal, op === 'ilike');
    return re.test(String(rowVal));
  }

  const target = coerceFilterScalar(rawVal, rowVal);

  switch (op) {
    case 'eq':
      return rowVal === target || String(rowVal) === String(rawVal);
    case 'neq':
      return rowVal !== target && String(rowVal) !== String(rawVal);
    case 'gt':
      return rowVal > target;
    case 'gte':
      return rowVal >= target;
    case 'lt':
      return rowVal < target;
    case 'lte':
      return rowVal <= target;
    case 'cs':
      if (Array.isArray(rowVal)) {
        const clean = rawVal.replace(/^\{|\}$/g, '');
        const wanted = clean ? clean.split(',').map((s) => s.replace(/^"|"$/g, '')) : [];
        return wanted.every((w) => rowVal.includes(w));
      }
      return false;
    default:
      return true;
  }
}

function parseFilterExpression(expr) {
  if (expr.startsWith('not.')) {
    const rest = expr.slice(4);
    const dotIdx = rest.indexOf('.');
    if (dotIdx === -1) return { negate: true, op: 'eq', val: rest };
    return { negate: true, op: rest.slice(0, dotIdx), val: rest.slice(dotIdx + 1) };
  }
  const dotIdx = expr.indexOf('.');
  if (dotIdx === -1) return { negate: false, op: 'eq', val: expr };
  return { negate: false, op: expr.slice(0, dotIdx), val: expr.slice(dotIdx + 1) };
}

function matchesLogicalNode(row, nodeStr) {
  const trimmed = nodeStr.trim();
  if (trimmed.startsWith('or(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(3, -1);
    const children = splitTopLevelCommas(inner);
    return children.some((child) => matchesLogicalNode(row, child));
  }
  if (trimmed.startsWith('and(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(4, -1);
    const children = splitTopLevelCommas(inner);
    return children.every((child) => matchesLogicalNode(row, child));
  }

  const firstDot = trimmed.indexOf('.');
  if (firstDot === -1) return true;
  const col = trimmed.slice(0, firstDot);
  const rest = trimmed.slice(firstDot + 1);
  const { negate, op, val } = parseFilterExpression(rest);
  const matched = evaluateOperator(row[col], op, val);
  return negate ? !matched : matched;
}

function matchesAllParams(row, searchParams) {
  const reserved = new Set(['select', 'on_conflict', 'order', 'limit', 'offset', 'columns']);
  for (const [key, value] of searchParams.entries()) {
    if (reserved.has(key)) continue;
    if (key === 'or' || key === 'and') {
      const expr = value.startsWith('(') && value.endsWith(')') ? `${key}${value}` : `${key}(${value})`;
      if (!matchesLogicalNode(row, expr)) return false;
      continue;
    }
    const { negate, op, val } = parseFilterExpression(value);
    const matched = evaluateOperator(row[key], op, val);
    if (negate ? matched : !matched) return false;
  }
  return true;
}

function sortRows(rows, orderParam) {
  if (!orderParam) return rows;
  const clauses = orderParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const tokens = part.split('.');
      return {
        col: tokens[0],
        asc: tokens[1] !== 'desc',
        nullsFirst: tokens.includes('nullsfirst') ? true : tokens.includes('nullslast') ? false : null,
      };
    });

  return [...rows].sort((a, b) => {
    for (const clause of clauses) {
      const va = a[clause.col];
      const vb = b[clause.col];
      const aNull = va === null || va === undefined;
      const bNull = vb === null || vb === undefined;
      if (aNull && bNull) continue;
      if (aNull) {
        if (clause.nullsFirst !== null) return clause.nullsFirst ? -1 : 1;
        return clause.asc ? 1 : -1;
      }
      if (bNull) {
        if (clause.nullsFirst !== null) return clause.nullsFirst ? 1 : -1;
        return clause.asc ? -1 : 1;
      }
      if (va < vb) return clause.asc ? -1 : 1;
      if (va > vb) return clause.asc ? 1 : -1;
    }
    return 0;
  });
}

function projectRow(row, selectParam) {
  if (!selectParam || selectParam.trim() === '*') {
    return structuredClone(row);
  }
  const fields = selectParam
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  if (fields.includes('*')) {
    return structuredClone(row);
  }
  const out = {};
  for (const field of fields) {
    const colonIdx = field.indexOf(':');
    if (colonIdx !== -1) {
      const alias = field.slice(0, colonIdx).trim();
      const sourceCol = field.slice(colonIdx + 1).trim();
      out[alias] = row[sourceCol] !== undefined ? structuredClone(row[sourceCol]) : null;
    } else {
      out[field] = row[field] !== undefined ? structuredClone(row[field]) : null;
    }
  }
  return out;
}

function buildDefaultState() {
  const nowIso = new Date().toISOString();
  return {
    profiles: [
      {
        id: E2E_USERS.client.id,
        email: E2E_USERS.client.email,
        full_name: E2E_USERS.client.full_name,
        role: E2E_USERS.client.profileRole,
        phone: null,
        company: null,
        country: null,
        created_at: nowIso,
      },
      {
        id: E2E_USERS.agent.id,
        email: E2E_USERS.agent.email,
        full_name: E2E_USERS.agent.full_name,
        role: E2E_USERS.agent.profileRole,
        phone: null,
        company: null,
        country: null,
        created_at: nowIso,
      },
      {
        id: E2E_USERS.admin.id,
        email: E2E_USERS.admin.email,
        full_name: E2E_USERS.admin.full_name,
        role: E2E_USERS.admin.profileRole,
        phone: null,
        company: null,
        country: null,
        created_at: nowIso,
      },
      {
        id: E2E_USERS.allowlist.id,
        email: E2E_USERS.allowlist.email,
        full_name: E2E_USERS.allowlist.full_name,
        role: E2E_USERS.allowlist.profileRole,
        phone: null,
        company: null,
        country: null,
        created_at: nowIso,
      },
    ],
    outreach_settings: [
      {
        id: true,
        is_paused: false,
        daily_send_cap: 15,
        industries: [],
        locations: [],
        keywords: [],
        discovery_provider: 'auto',
        min_issue_score: 30,
        dry_run_default: false,
        test_recipient_email: null,
        updated_at: nowIso,
      },
    ],
    outreach_prospects: [],
    outreach_runs: [],
    outreach_dispatches: [],
    outreach_opt_outs: [],
    site_design: [],
    projects: [],
    inquiries: [],
    transactions: [],
    orders: [],
    newsletter_dispatches: [],
    newsletter_subscribers: [],
  };
}

function applyRowDefaultsAndTriggers(table, inputRow, isUpdate = false) {
  const nowIso = new Date().toISOString();
  const row = { ...inputRow };

  if (table === 'profiles') {
    if (!isUpdate) {
      row.id = row.id ?? randomUUID();
      row.role = row.role ?? 'client';
      row.phone = row.phone ?? null;
      row.company = row.company ?? null;
      row.country = row.country ?? null;
      row.created_at = row.created_at ?? nowIso;
    }
    return row;
  }

  if (table === 'outreach_settings') {
    if (!isUpdate) {
      row.id = row.id ?? true;
      row.is_paused = row.is_paused ?? false;
      row.daily_send_cap = row.daily_send_cap ?? 15;
      row.industries = row.industries ?? [];
      row.locations = row.locations ?? [];
      row.keywords = row.keywords ?? [];
      row.discovery_provider = row.discovery_provider ?? 'auto';
      row.min_issue_score = row.min_issue_score ?? 30;
      row.dry_run_default = row.dry_run_default ?? false;
      row.test_recipient_email = row.test_recipient_email ?? null;
    }
    row.updated_at = row.updated_at ?? nowIso;
    return row;
  }

  if (table === 'outreach_prospects') {
    if (!isUpdate) {
      row.id = row.id ?? randomUUID();
      row.normalized_domain = row.normalized_domain ?? null;
      row.website_url = row.website_url ?? null;
      row.industry = row.industry ?? null;
      row.location = row.location ?? null;
      row.contact_email = row.contact_email ?? null;
      row.phone = row.phone ?? null;
      row.source_provider = row.source_provider ?? 'osm';
      row.source_external_id = row.source_external_id ?? null;
      row.evaluation_status = row.evaluation_status ?? 'pending';
      row.has_website = row.has_website ?? false;
      row.issue_score = row.issue_score ?? 0;
      row.issues = row.issues ?? [];
      row.http_status = row.http_status ?? null;
      row.ttfb_ms = row.ttfb_ms ?? null;
      row.site_title = row.site_title ?? null;
      row.evaluation_notes = row.evaluation_notes ?? null;
      row.pitch_subject = row.pitch_subject ?? null;
      row.pitch_preview = row.pitch_preview ?? null;
      row.status = row.status ?? 'discovered';
      row.last_evaluated_at = row.last_evaluated_at ?? null;
      row.last_pitched_at = row.last_pitched_at ?? null;
      row.last_error = row.last_error ?? null;
      row.raw_metadata = row.raw_metadata ?? null;
      row.created_at = row.created_at ?? nowIso;
    }
    row.updated_at = row.updated_at ?? nowIso;
    return row;
  }

  if (table === 'outreach_runs') {
    if (!isUpdate) {
      row.id = row.id ?? randomUUID();
      row.run_date = row.run_date ?? nowIso.slice(0, 10);
      row.status = row.status ?? 'running';
      row.triggered_by = row.triggered_by ?? null;
      row.scouted_count = row.scouted_count ?? 0;
      row.qualified_count = row.qualified_count ?? 0;
      row.sent_count = row.sent_count ?? 0;
      row.skipped_count = row.skipped_count ?? 0;
      row.failed_count = row.failed_count ?? 0;
      row.daily_cap_snapshot = row.daily_cap_snapshot ?? 0;
      row.sent_today_before_run = row.sent_today_before_run ?? 0;
      row.error_summary = row.error_summary ?? null;
      row.details = row.details ?? {};
      row.started_at = row.started_at ?? nowIso;
      row.completed_at = row.completed_at ?? null;
      row.created_at = row.created_at ?? nowIso;
    }
    row.updated_at = row.updated_at ?? nowIso;
    return row;
  }

  if (table === 'outreach_dispatches') {
    if (!isUpdate) {
      row.id = row.id ?? randomUUID();
      row.run_id = row.run_id ?? null;
      row.prospect_id = row.prospect_id ?? null;
      row.is_dry_run = row.is_dry_run ?? false;
      row.body_preview = row.body_preview ?? null;
      row.message_id = row.message_id ?? null;
      row.error = row.error ?? null;
      row.sent_at = row.sent_at ?? nowIso;
      row.created_at = row.created_at ?? nowIso;
    }
    return row;
  }

  if (table === 'outreach_opt_outs') {
    if (typeof row.email === 'string') {
      row.email = row.email.trim().toLowerCase();
    }
    if (!isUpdate) {
      row.reason = row.reason ?? null;
      row.source = row.source ?? 'unsubscribe';
      row.prospect_id = row.prospect_id ?? null;
      row.created_at = row.created_at ?? nowIso;
    }
    return row;
  }

  return row;
}

function validateRowConstraints(table, row) {
  if (table === 'profiles') {
    if (!row.id) {
      return { status: 400, code: '23502', message: 'null value in column "id" violates not-null constraint' };
    }
    if (!['admin', 'agent', 'client', 'editor', 'viewer'].includes(row.role)) {
      return { status: 400, code: '23514', message: 'violates check constraint "profiles_role_check"' };
    }
    return null;
  }

  if (table === 'outreach_settings') {
    if (row.id !== true) {
      return { status: 400, code: '23514', message: 'violates check constraint "outreach_settings_singleton"' };
    }
    if (typeof row.daily_send_cap !== 'number' || row.daily_send_cap < 1 || row.daily_send_cap > 200) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_settings_daily_send_cap_range"',
      };
    }
    if (!['osm', 'google_places', 'serper', 'auto'].includes(row.discovery_provider)) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_settings_discovery_provider_check"',
      };
    }
    if (typeof row.min_issue_score !== 'number' || row.min_issue_score < 0 || row.min_issue_score > 100) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_settings_min_issue_score_range"',
      };
    }
    if (row.test_recipient_email !== null) {
      if (
        typeof row.test_recipient_email !== 'string' ||
        row.test_recipient_email !== row.test_recipient_email.trim().toLowerCase() ||
        row.test_recipient_email.indexOf('@') < 1
      ) {
        return {
          status: 400,
          code: '23514',
          message: 'violates check constraint "outreach_settings_test_recipient_email_check"',
        };
      }
    }
    return null;
  }

  if (table === 'outreach_prospects') {
    if (typeof row.business_name !== 'string' || row.business_name === '') {
      return {
        status: 400,
        code: '23502',
        message: 'null value in column "business_name" violates not-null constraint',
      };
    }
    if (typeof row.dedup_key !== 'string') {
      return {
        status: 400,
        code: '23502',
        message: 'null value in column "dedup_key" violates not-null constraint',
      };
    }
    if (row.dedup_key !== row.dedup_key.trim().toLowerCase() || row.dedup_key.length === 0) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_prospects_dedup_key_check"',
      };
    }
    if (row.normalized_domain !== null) {
      if (
        typeof row.normalized_domain !== 'string' ||
        row.normalized_domain !== row.normalized_domain.trim().toLowerCase() ||
        row.normalized_domain.length === 0
      ) {
        return {
          status: 400,
          code: '23514',
          message: 'violates check constraint "outreach_prospects_normalized_domain_check"',
        };
      }
    }
    if (typeof row.issue_score !== 'number' || row.issue_score < 0 || row.issue_score > 100) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_prospects_issue_score_range"',
      };
    }
    if (!Array.isArray(row.issues)) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_prospects_issues_array"',
      };
    }
    const validStatuses = new Set([
      'discovered',
      'qualified',
      'qualified_no_email',
      'pitched',
      'replied',
      'converted',
      'opted_out',
      'skipped',
      'failed',
    ]);
    if (!validStatuses.has(row.status)) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_prospects_status_check"',
      };
    }
    return null;
  }

  if (table === 'outreach_runs') {
    if (!['cron', 'manual', 'dry_run'].includes(row.mode)) {
      return { status: 400, code: '23514', message: 'violates check constraint "outreach_runs_mode_check"' };
    }
    if (!['running', 'completed', 'paused', 'cap_reached', 'failed'].includes(row.status)) {
      return { status: 400, code: '23514', message: 'violates check constraint "outreach_runs_status_check"' };
    }
    const nonNegCols = [
      'scouted_count',
      'qualified_count',
      'sent_count',
      'skipped_count',
      'failed_count',
      'daily_cap_snapshot',
      'sent_today_before_run',
    ];
    for (const c of nonNegCols) {
      if (typeof row[c] !== 'number' || row[c] < 0) {
        return {
          status: 400,
          code: '23514',
          message: 'violates check constraint "outreach_runs_counts_nonneg"',
        };
      }
    }
    if (!row.details || typeof row.details !== 'object' || Array.isArray(row.details)) {
      return { status: 400, code: '23514', message: 'violates check constraint "outreach_runs_details_object"' };
    }
    return null;
  }

  if (table === 'outreach_dispatches') {
    if (!row.business_name || !row.recipient_email || !row.subject) {
      return { status: 400, code: '23502', message: 'null value violates not-null constraint' };
    }
    if (!['sent', 'dry_run', 'failed', 'skipped'].includes(row.status)) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_dispatches_status_check"',
      };
    }
    return null;
  }

  if (table === 'outreach_opt_outs') {
    if (
      typeof row.email !== 'string' ||
      row.email !== row.email.trim().toLowerCase() ||
      row.email.length <= 3 ||
      row.email.indexOf('@') < 1
    ) {
      return {
        status: 400,
        code: '23514',
        message: 'violates check constraint "outreach_opt_outs_email_check"',
      };
    }
    return null;
  }

  return null;
}

function findUniqueCollision(table, rows, candidate, excludeIndex = -1) {
  for (let i = 0; i < rows.length; i += 1) {
    if (i === excludeIndex) continue;
    const existing = rows[i];

    const pkCols = PRIMARY_KEYS[table] || ['id'];
    if (pkCols.every((col) => candidate[col] !== undefined && existing[col] === candidate[col])) {
      return { constraint: `${table}_pkey`, index: i };
    }

    if (table === 'outreach_prospects') {
      if (existing.dedup_key === candidate.dedup_key) {
        return { constraint: 'outreach_prospects_dedup_key_key', index: i };
      }
      if (
        typeof candidate.normalized_domain === 'string' &&
        candidate.normalized_domain !== '' &&
        typeof existing.normalized_domain === 'string' &&
        existing.normalized_domain !== '' &&
        existing.normalized_domain.toLowerCase() === candidate.normalized_domain.toLowerCase()
      ) {
        return { constraint: 'outreach_prospects_domain_uidx', index: i };
      }
    }
  }
  return null;
}

export async function createMockSupabaseServer({
  port = 0,
  host = '127.0.0.1',
  anonKey = 'e2e-anon-key',
  serviceRoleKey = 'e2e-service-role-key',
  jwtSecret = E2E_AUTH_JWT_SECRET,
} = {}) {
  let tables = buildDefaultState();
  let requestLog = [];
  const registeredUsers = new Map();

  function syncRegisteredUsersFromProfiles() {
    registeredUsers.clear();
    for (const p of tables.profiles) {
      registeredUsers.set(p.id, {
        id: p.id,
        email: p.email,
        full_name: p.full_name ?? null,
      });
    }
  }
  syncRegisteredUsersFromProfiles();

  function reset() {
    tables = buildDefaultState();
    requestLog = [];
    syncRegisteredUsersFromProfiles();
  }

  function registerUser(user) {
    if (!user || !user.id) return;
    registeredUsers.set(user.id, {
      id: user.id,
      email: user.email,
      full_name: user.full_name ?? null,
    });
    const idx = tables.profiles.findIndex((p) => p.id === user.id);
    const profileRow = applyRowDefaultsAndTriggers('profiles', {
      id: user.id,
      email: user.email,
      full_name: user.full_name ?? null,
      role: user.profileRole ?? user.role ?? 'client',
    });
    if (idx >= 0) {
      tables.profiles[idx] = { ...tables.profiles[idx], ...profileRow };
    } else {
      tables.profiles.push(profileRow);
    }
  }

  function seed(data = {}) {
    if (!data || typeof data !== 'object') return;
    for (const [tableName, value] of Object.entries(data)) {
      if (!ALL_TABLES.has(tableName)) continue;

      if (tableName === 'outreach_settings' && !Array.isArray(value) && typeof value === 'object' && value !== null) {
        const merged = applyRowDefaultsAndTriggers(
          'outreach_settings',
          { ...(tables.outreach_settings[0] || {}), ...value, id: true },
          true,
        );
        tables.outreach_settings = [merged];
        continue;
      }

      if (!Array.isArray(value)) continue;
      for (const item of value) {
        const prepared = applyRowDefaultsAndTriggers(tableName, item, false);
        const collision = findUniqueCollision(tableName, tables[tableName], prepared);
        if (collision) {
          tables[tableName][collision.index] = {
            ...tables[tableName][collision.index],
            ...prepared,
          };
        } else {
          tables[tableName].push(prepared);
        }
      }
    }
    syncRegisteredUsersFromProfiles();
  }

  function getState() {
    return {
      ...structuredClone(tables),
      requestLog: structuredClone(requestLog),
    };
  }

  function isAdminUser(uid) {
    if (!uid) return false;
    return tables.profiles.some((p) => p.id === uid && p.role === 'admin');
  }

  function resolveAuthContext(req) {
    const apikey = req.headers['apikey'];
    if (apikey !== anonKey && apikey !== serviceRoleKey) {
      return { errorStatus: 401, errorBody: { code: '401', message: 'Invalid API key', details: null, hint: null } };
    }
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';

    if (token === serviceRoleKey) {
      return { role: 'service_role', uid: null };
    }
    if (!token || token === anonKey) {
      return { role: 'anon', uid: null };
    }
    const verified = verifyE2eJwt(token, jwtSecret);
    if (!verified.valid) {
      return {
        errorStatus: 401,
        errorBody: { code: 'PGRST301', message: 'JWT expired or invalid', details: verified.reason, hint: null },
      };
    }
    return { role: 'authenticated', uid: verified.payload.sub, jwtPayload: verified.payload };
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${host}`);
    const method = (req.method || 'GET').toUpperCase();
    const pathname = url.pathname;

    // GoTrue Auth Endpoints
    if (pathname === '/auth/v1/user' && method === 'GET') {
      const apikey = req.headers['apikey'];
      if (apikey !== anonKey && apikey !== serviceRoleKey) {
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, role: 'none', status: 401 });
        return sendJson(
          res,
          401,
          { code: 401, error_code: 'invalid_api_key', msg: 'Invalid API key' },
          { 'x-supabase-api-version': '2024-01-01' },
        );
      }

      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
      if (!token || token === anonKey || token === serviceRoleKey) {
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, role: 'anon', status: 401 });
        return sendJson(
          res,
          401,
          { code: 401, error_code: 'bad_jwt', msg: 'Invalid token' },
          { 'x-supabase-api-version': '2024-01-01' },
        );
      }

      const verified = verifyE2eJwt(token, jwtSecret);
      if (!verified.valid) {
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, role: 'invalid', status: 401 });
        return sendJson(
          res,
          401,
          { code: 401, error_code: 'bad_jwt', msg: 'Invalid or expired JWT' },
          { 'x-supabase-api-version': '2024-01-01' },
        );
      }

      const payload = verified.payload;
      const profile = tables.profiles.find((p) => p.id === payload.sub);
      const regUser = registeredUsers.get(payload.sub);
      const email = profile?.email ?? regUser?.email ?? payload.email ?? null;
      const fullName = profile?.full_name ?? regUser?.full_name ?? payload.user_metadata?.full_name ?? null;

      requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, role: 'authenticated', status: 200 });
      return sendJson(
        res,
        200,
        {
          id: payload.sub,
          aud: 'authenticated',
          role: 'authenticated',
          email,
          email_confirmed_at: '2026-01-01T00:00:00.000Z',
          phone: '',
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: { full_name: fullName },
          identities: [],
          created_at: profile?.created_at ?? '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          is_anonymous: false,
        },
        { 'x-supabase-api-version': '2024-01-01' },
      );
    }

    if (pathname === '/auth/v1/token' && method === 'POST') {
      requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, role: 'anon', status: 400 });
      return sendJson(
        res,
        400,
        {
          code: 400,
          error_code: 'refresh_token_not_found',
          msg: 'Invalid Refresh Token: Refresh Token Not Found',
        },
        { 'x-supabase-api-version': '2024-01-01' },
      );
    }

    // PostgREST Endpoints
    if (pathname.startsWith('/rest/v1/')) {
      const table = pathname.slice('/rest/v1/'.length).replace(/\/+$/, '');
      const authCtx = resolveAuthContext(req);
      if (authCtx.errorStatus) {
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role: 'error', status: authCtx.errorStatus });
        return sendJson(res, authCtx.errorStatus, authCtx.errorBody);
      }

      if (!ALL_TABLES.has(table)) {
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role: authCtx.role, status: 404 });
        return sendJson(res, 404, {
          code: 'PGRST205',
          details: null,
          hint: null,
          message: `Could not find the table 'public.${table}' in the schema cache`,
        });
      }

      const { role, uid } = authCtx;
      const adminUser = isAdminUser(uid);

      // Anon permissions
      if (role === 'anon') {
        if (table === 'profiles' || OUTREACH_TABLES.has(table)) {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 401 });
          return sendJson(res, 401, {
            code: '42501',
            details: null,
            hint: null,
            message: `permission denied for table ${table}`,
          });
        }
        if (AUX_TABLES.has(table) && method !== 'GET' && method !== 'HEAD') {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 401 });
          return sendJson(res, 401, {
            code: '42501',
            details: null,
            hint: null,
            message: `permission denied for table ${table}`,
          });
        }
      }

      // Authenticated non-admin write blocks on profiles INSERT/DELETE or outreach_* POST
      if (role === 'authenticated') {
        if (table === 'profiles' && (method === 'POST' || method === 'DELETE')) {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 403 });
          return sendJson(res, 403, {
            code: '42501',
            details: null,
            hint: null,
            message: `new row violates row-level security policy for table "${table}"`,
          });
        }
        if (OUTREACH_TABLES.has(table) && !adminUser && method === 'POST') {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 403 });
          return sendJson(res, 403, {
            code: '42501',
            details: null,
            hint: null,
            message: `new row violates row-level security policy for table "${table}"`,
          });
        }
      }

      const prefer = parsePrefer(req.headers['prefer']);
      const acceptHeader = (req.headers['accept'] || '').toLowerCase();
      const wantsSingleObject = acceptHeader.includes('application/vnd.pgrst.object+json');
      const selectParam = url.searchParams.get('select') || '*';
      const orderParam = url.searchParams.get('order');
      const onConflictParam = url.searchParams.get('on_conflict');
      const offsetParam = url.searchParams.has('offset') ? Math.max(0, Number(url.searchParams.get('offset')) || 0) : 0;
      const limitParam = url.searchParams.has('limit') ? Math.max(0, Number(url.searchParams.get('limit')) || 0) : null;

      const isRowVisible = (row) => {
        if (role === 'service_role') return true;
        if (role === 'anon') return AUX_TABLES.has(table);
        if (table === 'profiles') return row.id === uid || adminUser;
        if (OUTREACH_TABLES.has(table)) return adminUser;
        return true;
      };

      if (method === 'GET' || method === 'HEAD') {
        const matchedRows = tables[table].filter((row) => isRowVisible(row) && matchesAllParams(row, url.searchParams));
        const orderedRows = sortRows(matchedRows, orderParam);
        const totalCount = orderedRows.length;
        const slicedRows =
          limitParam !== null
            ? orderedRows.slice(offsetParam, offsetParam + limitParam)
            : offsetParam > 0
              ? orderedRows.slice(offsetParam)
              : orderedRows;

        const projectedRows = slicedRows.map((r) => projectRow(r, selectParam));

        if (wantsSingleObject) {
          if (projectedRows.length !== 1) {
            requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 406 });
            return sendJson(res, 406, {
              code: 'PGRST116',
              details: `The result contains ${projectedRows.length} rows`,
              hint: null,
              message: 'Cannot coerce the result to a single JSON object',
            });
          }
          const extraHeaders = {};
          if (prefer.countExact) {
            extraHeaders['content-range'] = `0-0/${totalCount}`;
          }
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 200 });
          if (method === 'HEAD') {
            return sendEmpty(res, 200, extraHeaders);
          }
          return sendJson(res, 200, projectedRows[0], extraHeaders);
        }

        const extraHeaders = {};
        if (prefer.countExact) {
          extraHeaders['content-range'] =
            projectedRows.length > 0 && method !== 'HEAD'
              ? `${offsetParam}-${offsetParam + projectedRows.length - 1}/${totalCount}`
              : `*/${totalCount}`;
        }

        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 200 });
        if (method === 'HEAD') {
          return sendEmpty(res, 200, extraHeaders);
        }
        return sendJson(res, 200, projectedRows, extraHeaders);
      }

      const rawBody = await readBody(req);
      let bodyJson = null;
      if (rawBody.trim()) {
        try {
          bodyJson = JSON.parse(rawBody);
        } catch {
          return sendJson(res, 400, { code: 'PGRST102', message: 'Invalid JSON body', details: null, hint: null });
        }
      }

      if (method === 'POST') {
        const incomingRows = Array.isArray(bodyJson) ? bodyJson : bodyJson ? [bodyJson] : [];
        const conflictCols = onConflictParam
          ? onConflictParam.split(',').map((s) => s.trim()).filter(Boolean)
          : PRIMARY_KEYS[table] || ['id'];

        const stagedTable = [...tables[table]];
        const affected = [];

        for (const rawItem of incomingRows) {
          const candidate = applyRowDefaultsAndTriggers(table, rawItem, false);
          const constraintErr = validateRowConstraints(table, candidate);
          if (constraintErr) {
            requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: constraintErr.status });
            return sendJson(res, constraintErr.status, {
              code: constraintErr.code,
              message: constraintErr.message,
              details: null,
              hint: null,
            });
          }

          if (prefer.resolution === 'merge-duplicates') {
            const existingIdx = stagedTable.findIndex((row) =>
              conflictCols.every((col) => candidate[col] !== undefined && row[col] === candidate[col]),
            );
            if (existingIdx >= 0) {
              const existingRow = structuredClone(stagedTable[existingIdx]);
              const mergedInput = {
                ...existingRow,
                ...rawItem,
                id: existingRow.id,
                created_at: existingRow.created_at,
              };
              if (
                (table === 'outreach_settings' ||
                  table === 'outreach_prospects' ||
                  table === 'outreach_runs') &&
                rawItem?.updated_at === undefined
              ) {
                mergedInput.updated_at = new Date().toISOString();
              }
              const merged = applyRowDefaultsAndTriggers(table, mergedInput, true);
              const updateErr = validateRowConstraints(table, merged);
              if (updateErr) {
                return sendJson(res, updateErr.status, {
                  code: updateErr.code,
                  message: updateErr.message,
                  details: null,
                  hint: null,
                });
              }
              const otherCollision = findUniqueCollision(table, stagedTable, merged, existingIdx);
              if (otherCollision) {
                return sendJson(res, 409, {
                  code: '23505',
                  message: `duplicate key value violates unique constraint "${otherCollision.constraint}"`,
                  details: null,
                  hint: null,
                });
              }
              stagedTable[existingIdx] = merged;
              affected.push(merged);
              continue;
            }
          }

          const collision = findUniqueCollision(table, stagedTable, candidate);
          if (collision) {
            if (prefer.resolution === 'ignore-duplicates') {
              continue;
            }
            requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 409 });
            return sendJson(res, 409, {
              code: '23505',
              message: `duplicate key value violates unique constraint "${collision.constraint}"`,
              details: null,
              hint: null,
            });
          }

          stagedTable.push(candidate);
          affected.push(candidate);
        }

        tables[table] = stagedTable;
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 201 });
        if (!prefer.returnRepresentation) {
          return sendEmpty(res, 201);
        }
        const projected = affected.map((r) => projectRow(r, selectParam));
        if (wantsSingleObject) {
          if (projected.length !== 1) {
            return sendJson(res, 406, {
              code: 'PGRST116',
              details: `The result contains ${projected.length} rows`,
              hint: null,
              message: 'Cannot coerce the result to a single JSON object',
            });
          }
          return sendJson(res, 201, projected[0]);
        }
        return sendJson(res, 201, projected);
      }

      if (method === 'PATCH') {
        const patch = bodyJson && typeof bodyJson === 'object' ? bodyJson : {};
        const updatedRows = [];

        for (let i = 0; i < tables[table].length; i += 1) {
          const existing = tables[table][i];
          if (!isRowVisible(existing) || !matchesAllParams(existing, url.searchParams)) {
            continue;
          }

          const sanitizedPatch = { ...patch };
          if (table === 'profiles' && role === 'authenticated' && !adminUser) {
            sanitizedPatch.role = existing.role;
          }

          const mergedInput = { ...existing, ...sanitizedPatch };
          if (
            (table === 'outreach_settings' ||
              table === 'outreach_prospects' ||
              table === 'outreach_runs') &&
            sanitizedPatch.updated_at === undefined
          ) {
            mergedInput.updated_at = new Date().toISOString();
          }

          const candidate = applyRowDefaultsAndTriggers(
            table,
            mergedInput,
            true,
          );
          const constraintErr = validateRowConstraints(table, candidate);
          if (constraintErr) {
            return sendJson(res, constraintErr.status, {
              code: constraintErr.code,
              message: constraintErr.message,
              details: null,
              hint: null,
            });
          }

          const collision = findUniqueCollision(table, tables[table], candidate, i);
          if (collision) {
            return sendJson(res, 409, {
              code: '23505',
              message: `duplicate key value violates unique constraint "${collision.constraint}"`,
              details: null,
              hint: null,
            });
          }

          tables[table][i] = candidate;
          updatedRows.push(candidate);
        }

        if (!prefer.returnRepresentation) {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 204 });
          return sendEmpty(res, 204);
        }
        const projected = updatedRows.map((r) => projectRow(r, selectParam));
        if (wantsSingleObject) {
          if (projected.length !== 1) {
            requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 406 });
            return sendJson(res, 406, {
              code: 'PGRST116',
              details: `The result contains ${projected.length} rows`,
              hint: null,
              message: 'Cannot coerce the result to a single JSON object',
            });
          }
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 200 });
          return sendJson(res, 200, projected[0]);
        }
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 200 });
        return sendJson(res, 200, projected);
      }

      if (method === 'DELETE') {
        const deletedRows = [];
        const remaining = [];
        for (const existing of tables[table]) {
          if (isRowVisible(existing) && matchesAllParams(existing, url.searchParams)) {
            deletedRows.push(existing);
          } else {
            remaining.push(existing);
          }
        }
        tables[table] = remaining;

        if (!prefer.returnRepresentation) {
          requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 204 });
          return sendEmpty(res, 204);
        }
        const projected = deletedRows.map((r) => projectRow(r, selectParam));
        if (wantsSingleObject) {
          if (projected.length !== 1) {
            return sendJson(res, 406, {
              code: 'PGRST116',
              details: `The result contains ${projected.length} rows`,
              hint: null,
              message: 'Cannot coerce the result to a single JSON object',
            });
          }
          return sendJson(res, 200, projected[0]);
        }
        requestLog.push({ timestamp: new Date().toISOString(), method, path: pathname, query: url.search, role, status: 200 });
        return sendJson(res, 200, projected);
      }
    }

    return sendJson(res, 404, { error: 'Not found' });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });

  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;
  const url = `http://${host}:${actualPort}`;

  async function close() {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    await new Promise((resolve) => server.close(() => resolve()));
  }

  return {
    server,
    port: actualPort,
    url,
    close,
    reset,
    seed,
    getState,
    registerUser,
  };
}
