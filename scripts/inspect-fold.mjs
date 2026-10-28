import fs from 'fs';

const raw = fs.readFileSync('C:/Users/Dr Bankole/.gemini/antigravity/brain/37424487-e41e-4204-bb6d-c030707d5531/.system_generated/steps/1291/output.txt', 'utf8');

// Find all headings, paragraphs, and sections
const clean = raw
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '');

// Extract sections
const sections = clean.match(/<section[\s\S]*?<\/section>/gi) || [];
console.log(`Found ${sections.length} sections`);

sections.forEach((sec, i) => {
  const text = sec.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const classMatch = sec.match(/class="([^"]+)"/);
  console.log(`\n--- Section ${i + 1} (${classMatch ? classMatch[1] : 'no-class'}) ---`);
  console.log(text.slice(0, 400));
});

// Also find image URLs in sections
const imgMatches = clean.match(/src="https:\/\/cdn\.prod\.website-files\.com[^"]+"/g) || [];
console.log('\nSample images:', imgMatches.slice(0, 8));
