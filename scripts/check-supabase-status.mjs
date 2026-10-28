const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'nmftzlavysnpwzcjbwlz';

async function querySql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL query failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  console.log('--- 1. Querying Public Database Tables ---');
  const tables = await querySql(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log('Public tables:', tables.map((t) => t.table_name));

  console.log('\n--- 2. Checking Newsletter Subscribers ---');
  try {
    const subscribers = await querySql('SELECT count(*) as count FROM newsletter_subscribers;');
    console.log('Total newsletter subscribers:', subscribers[0].count);
  } catch (e) {
    console.log('newsletter_subscribers check:', e.message);
  }

  console.log('\n--- 3. Checking Client Enquiries ---');
  try {
    const enquiries = await querySql('SELECT count(*) as count FROM enquiries;');
    console.log('Total enquiries:', enquiries[0].count);
  } catch (e) {
    console.log('enquiries check:', e.message);
  }

  console.log('\n--- 4. Checking Orders & Payments ---');
  try {
    const orders = await querySql('SELECT count(*) as count FROM orders;');
    console.log('Total orders:', orders[0].count);
  } catch (e) {
    console.log('orders check:', e.message);
  }

  console.log('\n--- 5. Checking Push Subscriptions ---');
  try {
    const push = await querySql('SELECT count(*) as count FROM push_subscriptions;');
    console.log('Total push subscriptions:', push[0].count);
  } catch (e) {
    console.log('push_subscriptions check:', e.message);
  }

  console.log('\n--- 6. Checking Storage Buckets ---');
  try {
    const buckets = await querySql('SELECT id, name, public FROM storage.buckets;');
    console.log('Storage buckets:', buckets);
  } catch (e) {
    console.log('storage check:', e.message);
  }
}

main().catch(console.error);
