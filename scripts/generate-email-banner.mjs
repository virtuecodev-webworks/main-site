import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="340" viewBox="0 0 1160 340" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E0E11" />
      <stop offset="100%" stop-color="#080809" />
    </linearGradient>
    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#161619" />
      <stop offset="100%" stop-color="#121214" />
    </linearGradient>
    <linearGradient id="gold-l" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7d863" />
      <stop offset="100%" stop-color="#c5981d" />
    </linearGradient>
    <linearGradient id="gold-r" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#eabf38" />
      <stop offset="100%" stop-color="#b58814" />
    </linearGradient>
  </defs>

  <!-- Outer Canvas -->
  <rect width="1160" height="340" rx="28" fill="url(#bgGrad)" />
  <rect x="1" y="1" width="1158" height="338" rx="27" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Centered Floating Navbar Pill matching live site header -->
  <rect x="80" y="80" width="1000" height="180" rx="90" fill="url(#pillGrad)" stroke="rgba(255,255,255,0.12)" stroke-width="2" />

  <!-- Logo Mark Squircle on the Left inside the pill -->
  <g transform="translate(140, 126)">
    <rect width="88" height="88" rx="22" fill="#0A0A0A" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
    <!-- Twin Pillars in Gold -->
    <path d="M 20,20 L 38,20 L 43,62 L 30,68 Z" fill="url(#gold-l)" />
    <path d="M 68,20 L 50,20 L 45,62 L 58,68 Z" fill="url(#gold-r)" />
  </g>

  <!-- Brand Typography -->
  <g transform="translate(258, 168)">
    <text font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">
      VIRTUE <tspan fill="#DCAA28">&amp;</tspan> CO.
    </text>
    <text y="30" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12.5" font-weight="700" fill="#9E9D9B" letter-spacing="0.22em">
      FAST, DEPENDABLE WEB DEVELOPMENT
    </text>
  </g>

  <!-- Right Pill Badge -->
  <g transform="translate(850, 148)">
    <rect width="180" height="44" rx="22" fill="rgba(220,170,40,0.1)" stroke="rgba(220,170,40,0.3)" stroke-width="1.5" />
    <circle cx="28" cy="22" r="4.5" fill="#DCAA28" />
    <text x="44" y="27" font-family="SF Mono, Consolas, monospace" font-size="11" font-weight="700" fill="#DCAA28" letter-spacing="0.12em">
      CLIENT DESK
    </text>
  </g>
</svg>`

async function main() {
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile('public/brand/email-banner.png')
  console.log('Created public/brand/email-banner.png')

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile('public/brand/email-banner.jpg')
  console.log('Created public/brand/email-banner.jpg')
}

main().catch(console.error)
