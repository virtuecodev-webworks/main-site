async function testNewsletter() {
  console.log('\n=========================================');
  console.log('TEST 1: Newsletter Subscription & Welcome Email');
  console.log('=========================================');
  const testEmail = `test.subscriber.${Date.now()}@example.com`;
  const res = await fetch('http://localhost:3000/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      locale: 'en',
      source: 'verification_test',
    }),
  });
  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response:', data);
  if (!res.ok) throw new Error('Newsletter subscription failed');
}

async function testContactInquiry() {
  console.log('\n=========================================');
  console.log('TEST 2: Contact Form Lead Intake');
  console.log('=========================================');
  const res = await fetch('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Lead',
      email: 'virtueco.dev+testlead@gmail.com',
      company: 'Test Company Global',
      service: 'custom',
      budget: 'platform',
      timeline: '2-4-weeks',
      message: 'This is an automated verification of the lead intake API and email dispatcher.',
      locale: 'en',
    }),
  });
  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response:', data);
  if (!res.ok) throw new Error('Contact intake failed: ' + JSON.stringify(data));
}

async function testOrderIntake() {
  console.log('\n=========================================');
  console.log('TEST 3: Order Intake & Escrow Processing');
  console.log('=========================================');
  const res = await fetch('http://localhost:3000/api/orders/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      packageId: 'custom-flagship',
      serviceTitle: 'Custom Next.js & React Web Apps',
      tier: 'flagship',
      projectName: 'Test Aurum Treasury',
      description: 'Full custom web platform with multi-currency checkout and customer dashboard.',
      clientName: 'Julian Test',
      clientEmail: 'virtueco.dev+order@gmail.com',
      currency: 'USD',
      locale: 'en',
    }),
  });
  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response:', data);
  if (!res.ok) throw new Error('Order intake failed: ' + JSON.stringify(data));
}

async function run() {
  await testNewsletter();
  await testContactInquiry();
  await testOrderIntake();
  console.log('\n✅ All backend API endpoints executed and verified successfully!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
