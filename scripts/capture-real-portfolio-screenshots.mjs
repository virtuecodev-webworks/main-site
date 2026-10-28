import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000/en/showcase';
const OUT_DIR = path.resolve('public/work');

const CAPTURES = [
  // 1. Aurum Capital Platform
  {
    slug: 'aurum-capital-platform',
    outputs: [
      { filename: 'aurum-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'aurum-cards.jpg', scrollY: 920, waitSelector: 'h2' },
      { filename: 'aurum-wire.jpg', scrollY: 1850, waitSelector: 'h2' },
    ],
  },
  // 2. Maison Finery Luxury Store
  {
    slug: 'finery-commerce',
    outputs: [
      { filename: 'finery-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'finery-catalog.jpg', scrollY: 880, waitSelector: 'h2' },
      { filename: 'finery-cart.jpg', scrollY: 1750, waitSelector: 'h2' },
    ],
  },
  // 3. The Meridian Review
  {
    slug: 'meridian-editorial',
    outputs: [
      { filename: 'meridian-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'meridian-detail.jpg', scrollY: 780, waitSelector: 'h2' },
      { filename: 'meridian-audio.jpg', scrollY: 1650, waitSelector: 'h3' },
    ],
  },
  // 4. Northline Architectural Prefab
  {
    slug: 'northline-studio',
    outputs: [
      { filename: 'northline-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'northline-blueprint.jpg', scrollY: 900, waitSelector: 'h2' },
      { filename: 'northline-specs.jpg', scrollY: 1750, waitSelector: 'h2' },
    ],
  },
  // 5. Kinetix AI Cloud
  {
    slug: 'kinetix-ai-cloud',
    outputs: [
      { filename: 'kinetix-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'kinetix-pricing.jpg', scrollY: 820, waitSelector: 'h2' },
      { filename: 'kinetix-playground.jpg', scrollY: 1650, waitSelector: 'h2' },
    ],
  },
  // 6. Solace Health Portal
  {
    slug: 'solace-health-portal',
    outputs: [
      { filename: 'solace-hero.jpg', scrollY: 0, waitSelector: 'h1' },
      { filename: 'solace-markers.jpg', scrollY: 850, waitSelector: 'h2' },
      { filename: 'solace-calendar.jpg', scrollY: 1800, waitSelector: 'h2' },
    ],
  },
];

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--force-device-scale-factor=1.5',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
    },
  });

  const page = await browser.newPage();

  for (const item of CAPTURES) {
    const url = `${BASE_URL}/${item.slug}?embed=1`;
    console.log(`\nNavigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    // Brief sleep for font rendering & smooth animations
    await new Promise((r) => setTimeout(r, 1200));

    for (const out of item.outputs) {
      if (out.scrollY > 0) {
        await page.evaluate((y) => {
          window.scrollTo({ top: y, behavior: 'instant' });
        }, out.scrollY);
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        });
        await new Promise((r) => setTimeout(r, 400));
      }

      const outPath = path.join(OUT_DIR, out.filename);
      await page.screenshot({
        path: outPath,
        type: 'jpeg',
        quality: 92,
      });
      console.log(`  ✓ Saved: ${out.filename} (${outPath})`);
    }
  }

  await browser.close();
  console.log('\nAll 18 real portfolio screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
