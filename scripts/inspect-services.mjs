const res = await fetch('https://vantra-studio.webflow.io/');
const html = await res.text();

const match = html.match(/class="[^"]*services[^"]*"[\s\S]*?<\/section>/i);
if (match) {
  console.log('--- FOUND SERVICES SECTION ---');
  console.log(match[0]);
} else {
  console.log('Services class not found, checking all sections:');
  const sections = html.match(/<section[\s\S]*?<\/section>/gi) || [];
  sections.forEach((s, idx) => {
    const cls = s.match(/class="([^"]+)"/);
    console.log(`Section ${idx}: ${cls ? cls[1] : 'no class'}`);
    if (s.includes('help') || s.includes('service') || s.includes('services')) {
      console.log(s.slice(0, 1000));
    }
  });
}
