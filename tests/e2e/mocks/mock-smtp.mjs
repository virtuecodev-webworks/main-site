import net from 'node:net';
import { randomUUID } from 'node:crypto';

function decodeQuotedPrintableBytes(inputStr) {
  const unfolded = inputStr.replace(/=\r?\n/g, '');
  const bytes = [];
  for (let i = 0; i < unfolded.length; i += 1) {
    const ch = unfolded[i];
    if (ch === '=' && i + 2 < unfolded.length) {
      const hex = unfolded.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(Number.parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    const code = unfolded.charCodeAt(i);
    if (code <= 0xff) {
      bytes.push(code);
    } else {
      const utf8 = Buffer.from(ch, 'utf8');
      for (const b of utf8) bytes.push(b);
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

function decodeRfc2047Word(charset, encoding, payload) {
  const enc = encoding.toUpperCase();
  let buf;
  if (enc === 'B') {
    buf = Buffer.from(payload, 'base64');
  } else if (enc === 'Q') {
    const bytes = [];
    for (let i = 0; i < payload.length; i += 1) {
      const ch = payload[i];
      if (ch === '_') {
        bytes.push(0x20);
      } else if (ch === '=' && i + 2 < payload.length && /^[0-9A-Fa-f]{2}$/.test(payload.slice(i + 1, i + 3))) {
        bytes.push(Number.parseInt(payload.slice(i + 1, i + 3), 16));
        i += 2;
      } else {
        const b = Buffer.from(ch, 'utf8');
        for (const byte of b) bytes.push(byte);
      }
    }
    buf = Buffer.from(bytes);
  } else {
    return payload;
  }

  const cs = charset.toLowerCase();
  if (cs === 'latin1' || cs === 'iso-8859-1') {
    return buf.toString('latin1');
  }
  return buf.toString('utf8');
}

function decodeRfc2047(value) {
  if (typeof value !== 'string') return '';
  const collapsed = value.replace(/(\?=)\s+(=\?)/g, '$1$2');
  return collapsed.replace(/=\?([^?]+)\?([QBqb])\?([^?]*)\?=/g, (_, charset, enc, payload) =>
    decodeRfc2047Word(charset, enc, payload),
  );
}

function splitHeadersAndBody(rawPart) {
  const match = rawPart.match(/\r?\n\r?\n/);
  if (!match || match.index === undefined) {
    return { headerText: rawPart, bodyText: '' };
  }
  const idx = match.index;
  return {
    headerText: rawPart.slice(0, idx),
    bodyText: rawPart.slice(idx + match[0].length),
  };
}

function parseHeadersMap(headerText) {
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, ' ');
  const lines = unfolded.split(/\r?\n/);
  const headers = {};
  for (const line of lines) {
    if (!line.trim()) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const rawVal = line.slice(colonIdx + 1).trim();
    const decoded = decodeRfc2047(rawVal);
    headers[key] = headers[key] ? `${headers[key]}, ${decoded}` : decoded;
  }
  return headers;
}

function extractBoundary(contentType) {
  if (!contentType) return null;
  const quoted = contentType.match(/boundary="([^"]+)"/i);
  if (quoted) return quoted[1];
  const unquoted = contentType.match(/boundary=([^\s;]+)/i);
  return unquoted ? unquoted[1] : null;
}

function decodeBodyByTransferEncoding(bodyText, transferEncoding) {
  const cte = (transferEncoding || '7bit').trim().toLowerCase();
  if (cte === 'quoted-printable') {
    return decodeQuotedPrintableBytes(bodyText);
  }
  if (cte === 'base64') {
    return Buffer.from(bodyText.replace(/\s+/g, ''), 'base64').toString('utf8');
  }
  return bodyText;
}

function extractMimeParts(rawSection, out) {
  const { headerText, bodyText } = splitHeadersAndBody(rawSection);
  const headers = parseHeadersMap(headerText);
  const contentType = (headers['content-type'] || 'text/plain').toLowerCase();
  const cte = headers['content-transfer-encoding'] || '7bit';

  if (contentType.startsWith('multipart/')) {
    const boundary = extractBoundary(headers['content-type']);
    if (boundary) {
      const marker = `--${boundary}`;
      const segments = bodyText.split(marker);
      for (let i = 1; i < segments.length; i += 1) {
        let seg = segments[i];
        if (seg.startsWith('--')) break;
        seg = seg.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
        if (!seg) continue;
        extractMimeParts(seg, out);
      }
      return;
    }
  }

  const decoded = decodeBodyByTransferEncoding(bodyText, cte);
  if (contentType.includes('text/html')) {
    out.html = out.html === null ? decoded : `${out.html}\n${decoded}`;
  } else if (contentType.includes('text/plain')) {
    out.text = out.text === null ? decoded : `${out.text}\n${decoded}`;
  }
}

function parseRfc5322Message(raw) {
  const { headerText } = splitHeadersAndBody(raw);
  const headers = parseHeadersMap(headerText);
  const parts = { html: null, text: null };
  extractMimeParts(raw, parts);
  return { headers, html: parts.html, text: parts.text };
}

function unstuffSmtpData(rawPayloadStr) {
  const lines = rawPayloadStr.split(/\r?\n/);
  const unstuffed = lines.map((line) => (line.startsWith('..') ? line.slice(1) : line));
  return unstuffed.join('\r\n');
}

function isRecipientRejected(addr, rejectRecipients) {
  if (!rejectRecipients) return null;
  const lc = addr.trim().toLowerCase();

  if (Array.isArray(rejectRecipients)) {
    for (const pattern of rejectRecipients) {
      const p = String(pattern).trim().toLowerCase();
      if (!p) continue;
      if (p.includes('*')) {
        const re = new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`, 'i');
        if (re.test(lc)) return { code: 550, message: `5.1.1 <${addr}>: Recipient address rejected (simulated bounce)` };
      } else if (p === lc) {
        return { code: 550, message: `5.1.1 <${addr}>: Recipient address rejected (simulated bounce)` };
      }
    }
    return null;
  }

  if (rejectRecipients instanceof Set) {
    if (rejectRecipients.has(lc)) {
      return { code: 550, message: `5.1.1 <${addr}>: Recipient address rejected (simulated bounce)` };
    }
    return null;
  }

  if (rejectRecipients instanceof Map) {
    const hit = rejectRecipients.get(lc);
    if (hit) {
      return typeof hit === 'string'
        ? { code: 550, message: hit }
        : { code: hit.code ?? 550, message: hit.message ?? `5.1.1 <${addr}>: Recipient address rejected` };
    }
    return null;
  }

  if (typeof rejectRecipients === 'object') {
    for (const [key, val] of Object.entries(rejectRecipients)) {
      if (key.trim().toLowerCase() === lc) {
        if (typeof val === 'string') return { code: 550, message: val };
        if (val && typeof val === 'object') {
          return { code: val.code ?? 550, message: val.message ?? `5.1.1 <${addr}>: Recipient address rejected` };
        }
        return { code: 550, message: `5.1.1 <${addr}>: Recipient address rejected` };
      }
    }
  }

  return null;
}

export async function startMockSmtp({ host = '127.0.0.1', port = 0 } = {}) {
  let messages = [];
  let scenario = {};
  const activeSockets = new Set();

  function getMessages() {
    return structuredClone(messages);
  }

  function clear() {
    messages = [];
  }

  function setScenario(cfg = {}) {
    if (cfg?.reset) {
      scenario = {};
      return;
    }
    scenario = { ...scenario, ...(cfg || {}) };
  }

  function reset() {
    messages = [];
    scenario = {};
  }

  async function maybeDelay() {
    if (scenario.delayMs && scenario.delayMs > 0) {
      await new Promise((r) => setTimeout(r, scenario.delayMs));
    }
  }

  const server = net.createServer((socket) => {
    activeSockets.add(socket);
    socket.once('close', () => {
      activeSockets.delete(socket);
    });
    const state = {
      authenticated: false,
      authMethod: null,
      authUser: null,
      authStep: null,
      mailFrom: null,
      rcptTo: [],
      rejectedRcpt: [],
      dataMode: false,
      dataChunks: [],
      rawLineBuf: Buffer.alloc(0),
      processing: Promise.resolve(),
    };

    function sendLine(line) {
      if (!socket.destroyed) {
        socket.write(`${line}\r\n`);
      }
    }

    async function handleCommandLine(line) {
      await maybeDelay();

      if (state.authStep === 'PLAIN_DATA') {
        state.authStep = null;
        const decoded = Buffer.from(line.trim(), 'base64').toString('utf8').split('\0');
        const user = decoded[1] || decoded[0] || '';
        if (scenario.failAuth) {
          sendLine('535 5.7.8 Authentication credentials invalid');
        } else {
          state.authenticated = true;
          state.authMethod = 'PLAIN';
          state.authUser = user;
          sendLine('235 2.7.0 Authentication successful');
        }
        return;
      }

      if (state.authStep === 'LOGIN_USER') {
        state.authUser = Buffer.from(line.trim(), 'base64').toString('utf8');
        state.authStep = 'LOGIN_PASS';
        sendLine('334 UGFzc3dvcmQ6');
        return;
      }

      if (state.authStep === 'LOGIN_PASS') {
        state.authStep = null;
        if (scenario.failAuth) {
          sendLine('535 5.7.8 Authentication credentials invalid');
        } else {
          state.authenticated = true;
          state.authMethod = 'LOGIN';
          sendLine('235 2.7.0 Authentication successful');
        }
        return;
      }

      const upper = line.toUpperCase();

      if (upper.startsWith('EHLO')) {
        socket.write(
          '250-localhost Hello\r\n250-AUTH PLAIN LOGIN\r\n250-SIZE 20971520\r\n250 8BITMIME\r\n',
        );
        return;
      }

      if (upper.startsWith('HELO')) {
        sendLine('250 localhost');
        return;
      }

      if (upper.startsWith('AUTH PLAIN')) {
        const inline = line.slice('AUTH PLAIN'.length).trim();
        if (inline) {
          const decoded = Buffer.from(inline, 'base64').toString('utf8').split('\0');
          const user = decoded[1] || decoded[0] || '';
          if (scenario.failAuth) {
            sendLine('535 5.7.8 Authentication credentials invalid');
          } else {
            state.authenticated = true;
            state.authMethod = 'PLAIN';
            state.authUser = user;
            sendLine('235 2.7.0 Authentication successful');
          }
        } else {
          state.authStep = 'PLAIN_DATA';
          sendLine('334 ');
        }
        return;
      }

      if (upper === 'AUTH LOGIN' || upper.startsWith('AUTH LOGIN ')) {
        state.authStep = 'LOGIN_USER';
        sendLine('334 VXNlcm5hbWU6');
        return;
      }

      if (upper.startsWith('MAIL FROM:')) {
        if (scenario.failMailFrom) {
          sendLine('550 5.1.0 Sender rejected');
          return;
        }
        const match = line.match(/^MAIL FROM:\s*<([^>]*)>/i);
        state.mailFrom = match ? match[1] : line.slice('MAIL FROM:'.length).trim();
        state.rcptTo = [];
        state.rejectedRcpt = [];
        sendLine('250 2.1.0 OK');
        return;
      }

      if (upper.startsWith('RCPT TO:')) {
        const match = line.match(/^RCPT TO:\s*<([^>]*)>/i);
        const addr = (match ? match[1] : line.slice('RCPT TO:'.length).trim()).trim();
        const rejection = isRecipientRejected(addr, scenario.rejectRecipients);
        if (rejection) {
          state.rejectedRcpt.push(addr);
          sendLine(`${rejection.code} ${rejection.message}`);
          return;
        }
        state.rcptTo.push(addr);
        sendLine('250 2.1.5 OK');
        return;
      }

      if (upper === 'DATA') {
        if (scenario.failDataCommand) {
          sendLine('554 5.5.0 Transaction failed');
          return;
        }
        state.dataMode = true;
        state.dataChunks = [];
        sendLine('354 End data with <CR><LF>.<CR><LF>');
        return;
      }

      if (upper === 'RSET') {
        state.mailFrom = null;
        state.rcptTo = [];
        state.rejectedRcpt = [];
        state.dataMode = false;
        state.dataChunks = [];
        sendLine('250 2.0.0 Reset OK');
        return;
      }

      if (upper === 'NOOP') {
        sendLine('250 2.0.0 OK');
        return;
      }

      if (upper === 'QUIT') {
        sendLine('221 2.0.0 Bye');
        socket.end();
        return;
      }

      sendLine('502 5.5.1 Unrecognized command');
    }

    async function processBuffer() {
      while (state.rawLineBuf.length > 0) {
        if (state.dataMode) {
          const allBuf = Buffer.concat([...state.dataChunks, state.rawLineBuf]);
          state.dataChunks = [];
          state.rawLineBuf = Buffer.alloc(0);

          let termIdx = allBuf.indexOf(Buffer.from('\r\n.\r\n'));
          let termLen = 5;
          let emptyPrefix = false;

          if (termIdx === -1 && allBuf.subarray(0, 3).equals(Buffer.from('.\r\n'))) {
            termIdx = 0;
            termLen = 3;
            emptyPrefix = true;
          }
          if (termIdx === -1) {
            termIdx = allBuf.indexOf(Buffer.from('\n.\n'));
            termLen = 3;
          }

          if (termIdx === -1) {
            state.dataChunks.push(allBuf);
            return;
          }

          const payloadBuf = emptyPrefix ? Buffer.alloc(0) : allBuf.subarray(0, termIdx);
          const trailingBuf = allBuf.subarray(termIdx + termLen);
          state.dataMode = false;
          state.rawLineBuf = trailingBuf;

          await maybeDelay();
          if (scenario.failAfterData) {
            sendLine('451 4.3.0 Temporary local problem');
            continue;
          }

          const raw = unstuffSmtpData(payloadBuf.toString('utf8'));
          const parsed = parseRfc5322Message(raw);
          const msgId = parsed.headers['message-id'] || `<${randomUUID()}@mock-smtp.local>`;
          messages.push({
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            from: parsed.headers['from'] || state.mailFrom || '',
            mailFrom: state.mailFrom || '',
            rcptTo: [...state.rcptTo],
            to: parsed.headers['to'] || state.rcptTo.join(', '),
            replyTo: parsed.headers['reply-to'] || null,
            subject: parsed.headers['subject'] || '',
            messageId: msgId,
            headers: parsed.headers,
            html: parsed.html,
            text: parsed.text,
            raw,
          });
          sendLine(`250 2.0.0 OK queued as ${msgId}`);
          continue;
        }

        const nlIdx = state.rawLineBuf.indexOf(0x0a);
        if (nlIdx === -1) return;

        const rawLine = state.rawLineBuf.subarray(0, nlIdx).toString('utf8').replace(/\r$/, '');
        state.rawLineBuf = state.rawLineBuf.subarray(nlIdx + 1);
        await handleCommandLine(rawLine);
      }
    }

    sendLine('220 localhost ESMTP VirtueE2EMock');

    socket.on('data', (chunk) => {
      state.rawLineBuf = Buffer.concat([state.rawLineBuf, chunk]);
      state.processing = state.processing.then(() => processBuffer()).catch(() => {});
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve());
  });

  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : port;

  async function close() {
    server.closeAllConnections?.();
    for (const sock of activeSockets) {
      sock.destroy();
    }
    await new Promise((resolve) => server.close(() => resolve()));
  }

  return {
    host,
    port: actualPort,
    server,
    getMessages,
    clear,
    setScenario,
    reset,
    close,
  };
}
