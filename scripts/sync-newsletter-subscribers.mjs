import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.trim().startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function syncAll() {
  console.log('--- Fetching all profiles and auth users ---');
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: inquiries } = await supabase.from('inquiries').select('email, name');
  const { data: users } = await supabase.auth.admin.listUsers();

  const emailsToSync = new Set();
  
  if (profiles) {
    for (const p of profiles) {
      if (p.email) emailsToSync.add(p.email.toLowerCase().trim());
    }
  }

  if (users?.users) {
    for (const u of users.users) {
      if (u.email) emailsToSync.add(u.email.toLowerCase().trim());
    }
  }

  // Also include user personal email if subscribed previously
  emailsToSync.add('adeniranglory129@gmail.com');
  emailsToSync.add('globalgraphics129@gmail.com');
  emailsToSync.add('virtueco.dev@gmail.com');

  console.log('Emails to ensure subscribed:', Array.from(emailsToSync));

  for (const email of emailsToSync) {
    const { error: err1 } = await supabase.from('newsletter_subscribers').upsert(
      {
        email,
        status: 'active',
        source: 'user_sync',
        confirmed_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (err1) console.error('Error syncing newsletter_subscribers for', email, err1.message);

    const { error: err2 } = await supabase.from('subscribers').upsert(
      {
        email,
        locale: 'en',
        source: 'user_sync',
      },
      { onConflict: 'email' }
    );
    if (err2) console.error('Error syncing subscribers for', email, err2.message);
  }

  // Check current count
  const { count: activeCount } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log('Total active subscribers in newsletter_subscribers now:', activeCount);

  const { data: currentList } = await supabase
    .from('newsletter_subscribers')
    .select('email, status, source, created_at')
    .order('created_at', { ascending: false });

  console.log('Current roster:', currentList);
}

syncAll();
