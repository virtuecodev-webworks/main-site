// Diagnostic: inspect live Supabase state with the service-role key.
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

for (const table of ['inquiries', 'newsletter_subscribers', 'subscribers', 'profiles', 'orders', 'orders_count']) {
  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: table === 'orders_count' })
    .limit(5)
  console.log(`\n=== ${table} ===`)
  if (error) {
    console.log('ERROR:', error.message)
  } else if (table === 'orders_count') {
    console.log('count:', count)
  } else {
    console.log('rows:', Array.isArray(data) ? data.length : 0)
    console.log(JSON.stringify(data, null, 2)?.slice(0, 2000))
  }
}

const { data: users, error: usersErr } = await supabase.auth.admin.listUsers()
console.log('\n=== auth.users ===')
if (usersErr) console.log('ERROR:', usersErr.message)
else {
  console.log(
    users.users.map((u) => ({
      email: u.email,
      confirmed: Boolean(u.email_confirmed_at),
      created: u.created_at,
    })),
  )
}
