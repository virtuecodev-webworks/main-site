import https from 'node:https';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

const ids = [
  '29399763', // typing code
  '30467645', // modern workspace coding
  '30355470', // modern architecture
  '29431718', // fashion urban
];

for (const id of ids) {
  try {
    const html = await fetchPage(`https://www.pexels.com/video/${id}/`);
    const matches = html.match(/https:\/\/videos\.pexels\.com\/video-files\/[^\"]+\.mp4/g);
    const unique = [...new Set(matches || [])];
    const preferred = unique.find(u => u.includes('1920_1080') || u.includes('1280_720')) || unique[0];
    console.log(`ID ${id}:`, preferred);
  } catch (err) {
    console.error(`ID ${id} failed:`, err.message);
  }
}
