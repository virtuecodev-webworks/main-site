// Diagnostic: verify Brevo SMTP credentials actually authenticate and send.
import fs from 'node:fs'
import nodemailer from 'nodemailer'

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')]
    }),
)

const host = env.BREVO_SMTP_HOST
const port = Number(env.BREVO_SMTP_PORT)
const user = env.BREVO_SMTP_LOGIN
const pass = env.BREVO_SMTP_KEY

console.log({ host, port, user, keyLength: pass?.length, from: env.BREVO_FROM_EMAIL })

const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })

try {
  await transport.verify()
  console.log('SMTP AUTH: OK')
} catch (err) {
  console.error('SMTP AUTH: FAILED ->', err.message)
  process.exit(1)
}

try {
  const info = await transport.sendMail({
    from: env.BREVO_FROM_EMAIL,
    to: env.LEAD_NOTIFICATION_EMAIL,
    subject: 'SMTP diagnostic — Virtue & Co. Webworks',
    text: 'If you can read this, transactional email is working.',
    html: '<p>If you can read this, <strong>transactional email is working</strong>.</p>',
  })
  console.log('SEND: OK', info.messageId, info.response)
} catch (err) {
  console.error('SEND: FAILED ->', err.message)
  process.exit(1)
}
