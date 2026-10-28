import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = path.resolve('public/work');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function writeSvgToJpg(svgString, filename, quality = 92) {
  const filePath = path.join(OUT_DIR, filename);
  const buffer = Buffer.from(svgString);
  await sharp(buffer)
    .jpeg({ quality, chromaSubsampling: '4:4:4' })
    .toFile(filePath);
  console.log(`Generated: ${filename}`);
}

async function generateAll() {
  // ==========================================
  // 1. AURUM PRIVATE TREASURY (Banking / Vaults)
  // ==========================================
  const aurum1 = `
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="#080809"/>
    <defs>
      <linearGradient id="aurumGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#dcaa28"/>
        <stop offset="100%" stop-color="#f5e6a3"/>
      </linearGradient>
    </defs>
    <!-- Top Bar -->
    <rect x="100" y="60" width="1720" height="1" fill="#f5f4f0" fill-opacity="0.12"/>
    <text x="100" y="48" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">AURUM PRIVATE TREASURY · LIQUIDITY OS</text>
    <text x="1820" y="48" text-anchor="end" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">TOTAL VAULT DEPOSITS: $412,850,000 USD</text>

    <!-- Main Dashboard Card -->
    <rect x="100" y="100" width="1720" height="880" rx="16" fill="#111114" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>

    <!-- Left Stats & Sweep Vault -->
    <g transform="translate(160, 180)">
      <text x="0" y="0" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0" fill-opacity="0.5">TREASURY YIELD ACCRUAL (T-BILL 4-WEEK BILLS)</text>
      <text x="0" y="64" font-family="sans-serif" font-size="64" font-weight="700" fill="url(#aurumGold)" letter-spacing="-2">5.28% APY</text>
      <text x="0" y="105" font-family="sans-serif" font-size="18" fill="#f5f4f0" fill-opacity="0.8">Automated overnight cash sweep with continuous interest compounding.</text>

      <!-- Simulated Yield Chart -->
      <g transform="translate(0, 160)">
        <rect x="0" y="0" width="940" height="380" rx="12" fill="#0a0a0c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
        <path d="M 40 320 Q 200 280, 360 210 T 680 140 T 900 60" fill="none" stroke="#dcaa28" stroke-width="3"/>
        <circle cx="900" cy="60" r="6" fill="#f5f4f0"/>
        <text x="760" y="50" font-family="sans-serif" font-size="14" font-weight="700" fill="#dcaa28">+$21,798 / Day</text>

        <!-- Chart Grid Lines -->
        <line x1="40" y1="120" x2="900" y2="120" stroke="#f5f4f0" stroke-opacity="0.06"/>
        <line x1="40" y1="200" x2="900" y2="200" stroke="#f5f4f0" stroke-opacity="0.06"/>
        <line x1="40" y1="280" x2="900" y2="280" stroke="#f5f4f0" stroke-opacity="0.06"/>
        <text x="40" y="360" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">OCT 01</text>
        <text x="320" y="360" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">OCT 10</text>
        <text x="600" y="360" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">OCT 20</text>
        <text x="860" y="360" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">OCT 28</text>
      </g>
    </g>

    <!-- Right Live Telemetry Vault Breakdown -->
    <g transform="translate(1180, 180)">
      <rect x="0" y="0" width="560" height="700" rx="12" fill="#0a0a0c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
      <text x="36" y="50" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="2">ACTIVE TREASURY ALLOCATIONS</text>

      <g transform="translate(36, 90)">
        <text x="0" y="24" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">US Treasury 4W Bills</text>
        <text x="480" y="24" text-anchor="end" font-family="sans-serif" font-size="15" font-weight="700" fill="#dcaa28">$284,500,000</text>
        <rect x="0" y="40" width="480" height="6" rx="3" fill="#202026"/>
        <rect x="0" y="40" width="360" height="6" rx="3" fill="#dcaa28"/>
      </g>

      <g transform="translate(36, 190)">
        <text x="0" y="24" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">Overnight Repurchase Vaults</text>
        <text x="480" y="24" text-anchor="end" font-family="sans-serif" font-size="15" font-weight="700" fill="#dcaa28">$96,250,000</text>
        <rect x="0" y="40" width="480" height="6" rx="3" fill="#202026"/>
        <rect x="0" y="40" width="220" height="6" rx="3" fill="#dcaa28"/>
      </g>

      <g transform="translate(36, 290)">
        <text x="0" y="24" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">Immediate Wire Settlement Buffer</text>
        <text x="480" y="24" text-anchor="end" font-family="sans-serif" font-size="15" font-weight="700" fill="#dcaa28">$32,100,000</text>
        <rect x="0" y="40" width="480" height="6" rx="3" fill="#202026"/>
        <rect x="0" y="40" width="100" height="6" rx="3" fill="#dcaa28"/>
      </g>

      <!-- Security Stamp -->
      <rect x="36" y="430" width="488" height="180" rx="8" fill="#141418" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
      <text x="60" y="475" font-family="sans-serif" font-size="13" font-weight="700" fill="#f5f4f0">100% Cryptographic Verification</text>
      <text x="60" y="505" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.6">
        All withdrawals require 2 of 3 hardware key signatures. Sub-45ms ledger balance replication across US and European nodes.
      </text>
    </g>
  </svg>`;
  await writeSvgToJpg(aurum1, 'aurum-hero.jpg');

  // aurum-wire.jpg: Wire transfer engine (1200x1500)
  const aurum2 = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1500" fill="#09090b"/>
    <rect x="80" y="80" width="1040" height="1340" rx="16" fill="#131317" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">CROSS-BORDER SETTLEMENT PIPELINE</text>
      <text x="0" y="70" font-family="sans-serif" font-size="32" font-weight="700" fill="#f5f4f0">Sub-45ms Wire Latency</text>
      <line x1="0" y1="100" x2="920" y2="100" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Wire Simulation Card -->
      <rect x="0" y="140" width="920" height="420" rx="12" fill="#0c0c0e" stroke="#dcaa28" stroke-width="1.5" stroke-opacity="0.3"/>
      <text x="40" y="195" font-family="sans-serif" font-size="13" font-weight="600" fill="#f5f4f0" fill-opacity="0.5">INSTANT WIRE EXECUTION</text>
      <text x="40" y="250" font-family="sans-serif" font-size="44" font-weight="700" fill="#f5f4f0">$18,400,000.00 <tspan font-size="24" fill="#dcaa28">USD</tspan></text>
      <text x="40" y="290" font-family="sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.6">Recipient: Rothschild &amp; Co Private Vaults, Zurich (CH-9382-019)</text>

      <g transform="translate(40, 340)">
        <rect x="0" y="0" width="140" height="32" rx="6" fill="#059669" fill-opacity="0.2" stroke="#059669" stroke-width="1"/>
        <text x="70" y="21" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#34d399">SETTLED IN 42ms</text>
      </g>

      <!-- Multi-Sig Approval Row -->
      <g transform="translate(0, 620)">
        <rect x="0" y="0" width="920" height="260" rx="12" fill="#18181c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
        <text x="40" y="50" font-family="sans-serif" font-size="16" font-weight="700" fill="#f5f4f0">Executive Multi-Signature Matrix</text>
        <text x="40" y="80" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">2 of 3 physical FIDO2 keys required for wires above $10M.</text>

        <g transform="translate(40, 120)">
          <circle cx="20" cy="20" r="16" fill="#059669" fill-opacity="0.2"/>
          <text x="20" y="25" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#34d399">✓</text>
          <text x="50" y="25" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Chief Investment Officer (Signed)</text>

          <circle cx="20" cy="70" r="16" fill="#059669" fill-opacity="0.2"/>
          <text x="20" y="75" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#34d399">✓</text>
          <text x="50" y="75" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Managing General Partner (Signed)</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(aurum2, 'aurum-wire.jpg');

  // aurum-cards.jpg: Corporate Visa Infinite cards (1600x1000)
  const aurum3 = `
  <svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#09090b"/>
    <rect x="80" y="80" width="1440" height="840" rx="16" fill="#131317" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">PROGRAMMABLE CORPORATE CARDS MATRIX</text>
      <line x1="0" y1="50" x2="1160" y2="50" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Physical/Virtual Card Rendering -->
      <g transform="translate(60, 100)">
        <rect x="0" y="0" width="460" height="280" rx="16" fill="#08080a" stroke="#dcaa28" stroke-width="1.5" stroke-opacity="0.5"/>
        <text x="36" y="50" font-family="sans-serif" font-size="16" font-weight="700" fill="#dcaa28" letter-spacing="2">AURUM PRIVATE TREASURY</text>
        <circle cx="50" cy="110" r="16" fill="#dcaa28" fill-opacity="0.3"/>
        <text x="36" y="200" font-family="monospace" font-size="20" fill="#f5f4f0" letter-spacing="4">•••• •••• •••• 4289</text>
        <text x="36" y="240" font-family="sans-serif" font-size="13" font-weight="600" fill="#f5f4f0">JULIAN VANE · MANAGING PARTNER</text>
        <text x="420" y="240" text-anchor="end" font-family="sans-serif" font-size="15" font-weight="700" fill="#f5f4f0" letter-spacing="1">VISA</text>
      </g>

      <!-- Rules Matrix -->
      <g transform="translate(580, 100)">
        <rect x="0" y="0" width="560" height="480" rx="12" fill="#0b0b0e" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
        <text x="32" y="44" font-family="sans-serif" font-size="14" font-weight="700" fill="#dcaa28">PROGRAMMABLE CARD SPEND CONTROLS</text>

        <g transform="translate(32, 90)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Category Lock: Private Aviation &amp; Hotels</text>
          <text x="480" y="20" text-anchor="end" font-family="sans-serif" font-size="13" fill="#34d399">ACTIVE</text>
        </g>
        <line x1="32" y1="140" x2="528" y2="140" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(32, 170)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Single-Transaction Limit: $500,000</text>
          <text x="480" y="20" text-anchor="end" font-family="sans-serif" font-size="13" fill="#34d399">ENFORCED</text>
        </g>
        <line x1="32" y1="220" x2="528" y2="220" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(32, 250)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Zero-Trust Instant Card Freeze</text>
          <text x="480" y="20" text-anchor="end" font-family="sans-serif" font-size="13" fill="#34d399">STANDBY</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(aurum3, 'aurum-cards.jpg');

  // ==========================================
  // 2. MAISON FINERY (Luxury E-Commerce)
  // ==========================================
  // finery-catalog.jpg (1200x1500)
  const finery2 = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1500" fill="#0d0d0f"/>
    <rect x="80" y="80" width="1040" height="1340" rx="16" fill="#131316" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">HAUTE COUTURE CATALOG &amp; PDP NAVIGATION</text>
      <text x="0" y="70" font-family="sans-serif" font-size="32" font-weight="700" fill="#f5f4f0">Zero-Shift Image Pipeline</text>
      <line x1="0" y1="100" x2="920" y2="100" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- 4-Currency Price Switcher Card -->
      <rect x="0" y="140" width="920" height="120" rx="12" fill="#18181c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
      <g transform="translate(36, 180)">
        <text x="0" y="16" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">ACTIVE CURRENCY REGION</text>
        <g transform="translate(260, -8)">
          <rect x="0" y="0" width="80" height="36" rx="6" fill="#dcaa28" fill-opacity="0.15" stroke="#dcaa28" stroke-width="1"/>
          <text x="40" y="23" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28">USD $</text>

          <rect x="90" y="0" width="80" height="36" rx="6" fill="#101012" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="130" y="23" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="500" fill="#f5f4f0">EUR €</text>

          <rect x="180" y="0" width="80" height="36" rx="6" fill="#101012" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="220" y="23" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="500" fill="#f5f4f0">GBP £</text>

          <rect x="270" y="0" width="80" height="36" rx="6" fill="#101012" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="310" y="23" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="500" fill="#f5f4f0">NGN ₦</text>
        </g>
      </g>

      <!-- Lookbook Product Grid Representation -->
      <g transform="translate(0, 300)">
        <rect x="0" y="0" width="440" height="560" rx="12" fill="#18181c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
        <rect x="20" y="20" width="400" height="420" rx="8" fill="#202026"/>
        <text x="220" y="230" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#f5f4f0" fill-opacity="0.4">Silk Crepe Evening Coat</text>
        <text x="24" y="480" font-family="sans-serif" font-size="16" font-weight="600" fill="#f5f4f0">Silk Crepe Evening Coat</text>
        <text x="24" y="510" font-family="sans-serif" font-size="16" font-weight="700" fill="#dcaa28">$1,850 · €1,690 · £1,450</text>
        <text x="416" y="510" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="600" fill="#34d399">In Stock (Paris)</text>
      </g>

      <g transform="translate(480, 300)">
        <rect x="0" y="0" width="440" height="560" rx="12" fill="#18181c" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
        <rect x="20" y="20" width="400" height="420" rx="8" fill="#202026"/>
        <text x="220" y="230" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#f5f4f0" fill-opacity="0.4">Pleated Cashmere Tunic</text>
        <text x="24" y="480" font-family="sans-serif" font-size="16" font-weight="600" fill="#f5f4f0">Pleated Cashmere Tunic</text>
        <text x="24" y="510" font-family="sans-serif" font-size="16" font-weight="700" fill="#dcaa28">$920 · €840 · £720</text>
        <text x="416" y="510" text-anchor="end" font-family="sans-serif" font-size="12" font-weight="600" fill="#34d399">In Stock (London)</text>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(finery2, 'finery-catalog.jpg');

  // finery-cart.jpg (1600x1000)
  const finery3 = `
  <svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#0a0a0c"/>
    <rect x="80" y="80" width="1440" height="840" rx="16" fill="#121215" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">SLIDE-OUT BAG &amp; 1-TAP APPLE PAY CHECKOUT</text>
      <text x="1160" y="24" text-anchor="end" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.5">340% CHECKOUT VELOCITY</text>
      <line x1="0" y1="50" x2="1160" y2="50" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Slide out Cart Drawer representation -->
      <g transform="translate(300, 80)">
        <rect x="0" y="0" width="560" height="680" rx="14" fill="#18181c" stroke="#dcaa28" stroke-width="1.5" stroke-opacity="0.4"/>
        <text x="40" y="50" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Shopping Bag (2 items)</text>

        <!-- Item 1 -->
        <g transform="translate(40, 90)">
          <rect x="0" y="0" width="70" height="70" rx="8" fill="#24242c"/>
          <text x="90" y="25" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Silk Crepe Evening Coat</text>
          <text x="90" y="50" font-family="sans-serif" font-size="13" fill="#dcaa28" font-weight="600">Size 38 · $1,850.00</text>
        </g>
        <line x1="40" y1="185" x2="520" y2="185" stroke="#f5f4f0" stroke-opacity="0.08"/>

        <!-- Item 2 -->
        <g transform="translate(40, 210)">
          <rect x="0" y="0" width="70" height="70" rx="8" fill="#24242c"/>
          <text x="90" y="25" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">Pleated Cashmere Tunic</text>
          <text x="90" y="50" font-family="sans-serif" font-size="13" fill="#dcaa28" font-weight="600">Size S · $920.00</text>
        </g>
        <line x1="40" y1="305" x2="520" y2="305" stroke="#f5f4f0" stroke-opacity="0.08"/>

        <!-- Total -->
        <g transform="translate(40, 360)">
          <text x="0" y="0" font-family="sans-serif" font-size="15" fill="#f5f4f0" fill-opacity="0.6">Subtotal</text>
          <text x="480" y="0" text-anchor="end" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">$2,770.00 USD</text>
          <text x="0" y="30" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">Complimentary Express Shipping &amp; Duties Included</text>

          <!-- Apple Pay Button -->
          <rect x="0" y="60" width="480" height="56" rx="10" fill="#f5f4f0"/>
          <text x="240" y="96" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#0a0a0c">Pay with Apple Pay</text>

          <!-- Standard Checkout -->
          <rect x="0" y="130" width="480" height="50" rx="10" fill="#dcaa28"/>
          <text x="240" y="162" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#0a0a0c">Checkout with Card · 1 Click</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(finery3, 'finery-cart.jpg');

  // ==========================================
  // 3. NORTHLINE STUDIO (Nordic Architecture)
  // ==========================================
  // northline-blueprint.jpg (1200x1500)
  const northline2 = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1500" fill="#0c0c0e"/>
    <rect x="80" y="80" width="1040" height="1340" rx="16" fill="#121215" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">INTERACTIVE TIMBER ARCHITECTURAL BLUEPRINT</text>
      <text x="0" y="70" font-family="sans-serif" font-size="32" font-weight="700" fill="#f5f4f0">Model 84 Cabin: 104 m² Floorplan</text>
      <line x1="0" y1="100" x2="920" y2="100" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Blueprint SVG Grid Frame -->
      <g transform="translate(0, 140)">
        <rect x="0" y="0" width="920" height="680" rx="12" fill="#08080a" stroke="#dcaa28" stroke-width="1.5" stroke-opacity="0.35"/>
        <line x1="100" y1="100" x2="820" y2="100" stroke="#f5f4f0" stroke-width="2"/>
        <line x1="820" y1="100" x2="820" y2="580" stroke="#f5f4f0" stroke-width="2"/>
        <line x1="820" y1="580" x2="100" y2="580" stroke="#f5f4f0" stroke-width="2"/>
        <line x1="100" y1="580" x2="100" y2="100" stroke="#f5f4f0" stroke-width="2"/>

        <!-- Interior Room Partitions -->
        <line x1="500" y1="100" x2="500" y2="580" stroke="#f5f4f0" stroke-width="1.5" stroke-dasharray="4"/>
        <line x1="100" y1="360" x2="500" y2="360" stroke="#f5f4f0" stroke-width="1.5" stroke-dasharray="4"/>

        <!-- Room Labels with Dimensions -->
        <text x="280" y="220" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#f5f4f0">Living &amp; Dining (42 m²)</text>
        <text x="280" y="250" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#dcaa28">Triple-Glazed Glulam Windows</text>

        <text x="280" y="460" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#f5f4f0">Nordic Pine Sauna (14 m²)</text>
        <text x="280" y="490" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#dcaa28">Integrated Helo Harvia Stove</text>

        <text x="660" y="340" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#f5f4f0">Master Suite &amp; Loft (48 m²)</text>
        <text x="660" y="370" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#dcaa28">Cross-Laminated Timber Ceilings</text>
      </g>

      <!-- Spec Badges -->
      <g transform="translate(0, 860)">
        <rect x="0" y="0" width="920" height="140" rx="10" fill="#16161a" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
        <g transform="translate(40, 45)">
          <text x="0" y="16" font-family="sans-serif" font-size="12" font-weight="600" fill="#dcaa28">FOUNDATION READY</text>
          <text x="0" y="46" font-family="sans-serif" font-size="20" font-weight="700" fill="#f5f4f0">4 Weeks to Site Delivery</text>
        </g>
        <g transform="translate(360, 45)">
          <text x="0" y="16" font-family="sans-serif" font-size="12" font-weight="600" fill="#dcaa28">PASSIVE ENERGY</text>
          <text x="0" y="46" font-family="sans-serif" font-size="20" font-weight="700" fill="#f5f4f0">U-Value 0.12 W/m²K</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(northline2, 'northline-blueprint.jpg');

  // northline-specs.jpg (1600x1000)
  const northline3 = `
  <svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#09090b"/>
    <rect x="80" y="80" width="1440" height="840" rx="16" fill="#121215" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">4-STEP MODULAR SPECIFICATION OVERVIEW</text>
      <text x="1160" y="24" text-anchor="end" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.5">420% INCREASE IN QUALIFIED BOOKINGS</text>
      <line x1="0" y1="50" x2="1160" y2="50" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- 4 Steps representation -->
      <g transform="translate(0, 90)">
        <rect x="0" y="0" width="260" height="380" rx="10" fill="#16161a" stroke="#dcaa28" stroke-width="1" stroke-opacity="0.3"/>
        <text x="24" y="40" font-family="sans-serif" font-size="12" font-weight="700" fill="#dcaa28">STEP 01</text>
        <text x="24" y="75" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Select Model</text>
        <text x="24" y="110" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">Choose footprint from Model 48 to Model 142.</text>

        <rect x="300" y="0" width="260" height="380" rx="10" fill="#16161a" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
        <text x="324" y="40" font-family="sans-serif" font-size="12" font-weight="700" fill="#dcaa28">STEP 02</text>
        <text x="324" y="75" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Timber Grade</text>
        <text x="324" y="110" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">Nordic Spruce, Larch, or Charred Kebony cladding.</text>

        <rect x="600" y="0" width="260" height="380" rx="10" fill="#16161a" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
        <text x="624" y="40" font-family="sans-serif" font-size="12" font-weight="700" fill="#dcaa28">STEP 03</text>
        <text x="624" y="75" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Additions</text>
        <text x="624" y="110" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">Glazed breezeway, rooftop solar, or Finnish sauna.</text>

        <rect x="900" y="0" width="260" height="380" rx="10" fill="#16161a" stroke="#dcaa28" stroke-width="1" stroke-opacity="0.3"/>
        <text x="924" y="40" font-family="sans-serif" font-size="12" font-weight="700" fill="#dcaa28">STEP 04</text>
        <text x="924" y="75" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Book Site Visit</text>
        <text x="924" y="110" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.6">Instant consultation with senior architectural lead.</text>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(northline3, 'northline-specs.jpg');

  // ==========================================
  // 4. KINETIX AI CLOUD (GPU Infrastructure)
  // ==========================================
  // kinetix-pricing.jpg (1200x1500)
  const kinetix2 = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1500" fill="#08080a"/>
    <rect x="80" y="80" width="1040" height="1340" rx="16" fill="#101013" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">BARE-METAL NVIDIA B200 / H100 PRICING CALCULATOR</text>
      <text x="0" y="70" font-family="sans-serif" font-size="32" font-weight="700" fill="#f5f4f0">Zero Hidden Egress Fees</text>
      <line x1="0" y1="100" x2="920" y2="100" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Pricing Slider Console -->
      <g transform="translate(0, 140)">
        <rect x="0" y="0" width="920" height="420" rx="12" fill="#08080a" stroke="#dcaa28" stroke-width="1.5" stroke-opacity="0.35"/>
        <text x="40" y="50" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">CLUSTER SIZE: 32x NVIDIA B200 NVL72</text>
        <text x="40" y="110" font-family="sans-serif" font-size="54" font-weight="700" fill="#f5f4f0">$3.85 <tspan font-size="20" fill="#dcaa28">/ GPU / HOUR</tspan></text>
        <text x="40" y="150" font-family="sans-serif" font-size="16" fill="#f5f4f0" fill-opacity="0.7">Monthly estimate: $88,704 USD · Guaranteed 99.99% Hardware Uptime</text>

        <!-- Slider Bar -->
        <g transform="translate(40, 220)">
          <rect x="0" y="0" width="840" height="8" rx="4" fill="#202028"/>
          <rect x="0" y="0" width="420" height="8" rx="4" fill="#dcaa28"/>
          <circle cx="420" cy="4" r="14" fill="#f5f4f0"/>
        </g>
        <text x="40" y="260" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">8 GPUs</text>
        <text x="440" y="260" font-family="sans-serif" font-size="12" font-weight="600" fill="#dcaa28">32 GPUs</text>
        <text x="840" y="260" font-family="sans-serif" font-size="12" fill="#f5f4f0" fill-opacity="0.4">128 GPUs</text>

        <!-- Spec Pills -->
        <g transform="translate(40, 310)">
          <rect x="0" y="0" width="180" height="36" rx="6" fill="#181820" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="90" y="23" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#f5f4f0">1.8 TB/s NVLink 5</text>

          <rect x="200" y="0" width="180" height="36" rx="6" fill="#181820" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="290" y="23" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#f5f4f0">3.2 Tbps InfiniBand</text>

          <rect x="400" y="0" width="180" height="36" rx="6" fill="#181820" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="490" y="23" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#f5f4f0">Direct Liquid Cooled</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(kinetix2, 'kinetix-pricing.jpg');

  // kinetix-playground.jpg (1600x1000)
  const kinetix3 = `
  <svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#09090b"/>
    <rect x="80" y="80" width="1440" height="840" rx="16" fill="#111114" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28" letter-spacing="3">TOKEN STREAMING TELEMETRY &amp; FIBER LATENCY RADAR</text>
      <line x1="0" y1="50" x2="1160" y2="50" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Console Playground -->
      <g transform="translate(0, 80)">
        <rect x="0" y="0" width="700" height="480" rx="12" fill="#08080a" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
        <text x="32" y="44" font-family="monospace" font-size="14" fill="#dcaa28">&gt; kinetix run --model deepseek-r1-671b --cluster us-east-4</text>
        <g transform="translate(32, 80)">
          <text x="0" y="20" font-family="monospace" font-size="13" fill="#f5f4f0" fill-opacity="0.8">Connecting to 64x B200 SXM6 cluster... [OK]</text>
          <text x="0" y="50" font-family="monospace" font-size="13" fill="#f5f4f0" fill-opacity="0.8">Allocating 12.2 TB distributed HBM3e VRAM... [OK]</text>
          <text x="0" y="80" font-family="monospace" font-size="13" fill="#34d399">Inference Active: Streaming at 182.4 tokens/second</text>
          <text x="0" y="110" font-family="monospace" font-size="13" fill="#f5f4f0" fill-opacity="0.8">First Token Latency (TTFT): 12.4 ms</text>
        </g>
      </g>

      <!-- Latency Radar Box -->
      <g transform="translate(740, 80)">
        <rect x="0" y="0" width="420" height="480" rx="12" fill="#0d0d10" stroke="#dcaa28" stroke-width="1" stroke-opacity="0.2"/>
        <text x="32" y="44" font-family="sans-serif" font-size="13" font-weight="700" fill="#dcaa28">GLOBAL FIBER ROUNDTRIP</text>

        <g transform="translate(32, 90)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">US-East (Virginia)</text>
          <text x="340" y="20" text-anchor="end" font-family="monospace" font-size="14" fill="#34d399">12.4 ms</text>
        </g>
        <line x1="32" y1="130" x2="388" y2="130" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(32, 160)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">EU-Central (Frankfurt)</text>
          <text x="340" y="20" text-anchor="end" font-family="monospace" font-size="14" fill="#34d399">18.2 ms</text>
        </g>
        <line x1="32" y1="200" x2="388" y2="200" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(32, 230)">
          <text x="0" y="20" font-family="sans-serif" font-size="14" font-weight="600" fill="#f5f4f0">AP-Tokyo (Equinix)</text>
          <text x="340" y="20" text-anchor="end" font-family="monospace" font-size="14" fill="#34d399">64.8 ms</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(kinetix3, 'kinetix-playground.jpg');

  // ==========================================
  // 5. SOLACE LONGEVITY (Health / Diagnostics)
  // ==========================================
  // solace-markers.jpg (1200x1500)
  const solace2 = `
  <svg width="1200" height="1500" viewBox="0 0 1200 1500" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1500" fill="#080a09"/>
    <rect x="80" y="80" width="1040" height="1340" rx="16" fill="#0e1210" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#34d399" letter-spacing="3">110+ CLINICAL BIOMARKER DIAGNOSTIC REPORT</text>
      <text x="0" y="70" font-family="sans-serif" font-size="32" font-weight="700" fill="#f5f4f0">Longitudinal Biological Clock</text>
      <line x1="0" y1="100" x2="920" y2="100" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Age Clock Display -->
      <g transform="translate(0, 140)">
        <rect x="0" y="0" width="920" height="240" rx="12" fill="#090d0b" stroke="#34d399" stroke-width="1.5" stroke-opacity="0.3"/>
        <text x="40" y="50" font-family="sans-serif" font-size="13" font-weight="600" fill="#f5f4f0" fill-opacity="0.6">DNA METHYLATION BIOLOGICAL AGE</text>
        <text x="40" y="110" font-family="sans-serif" font-size="54" font-weight="700" fill="#34d399">37.2 YRS <tspan font-size="20" fill="#f5f4f0" fill-opacity="0.6">(Chronological: 42.0)</tspan></text>
        <text x="40" y="150" font-family="sans-serif" font-size="16" font-weight="600" fill="#34d399">-4.8 Years Reversal via Prescribed Clinical Protocols</text>
      </g>

      <!-- Biomarker List -->
      <g transform="translate(0, 420)">
        <rect x="0" y="0" width="920" height="480" rx="12" fill="#111613" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.08"/>
        <text x="36" y="44" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">CARDIOVASCULAR &amp; METABOLIC BIOMARKERS</text>

        <g transform="translate(36, 90)">
          <text x="0" y="20" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">ApoB (Apolipoprotein B)</text>
          <text x="680" y="20" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">58 mg/dL</text>
          <text x="820" y="20" text-anchor="end" font-family="sans-serif" font-size="12" fill="#34d399">OPTIMAL</text>
        </g>
        <line x1="36" y1="130" x2="880" y2="130" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(36, 160)">
          <text x="0" y="20" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">hs-CRP (High-Sensitivity Inflammation)</text>
          <text x="680" y="20" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">0.24 mg/L</text>
          <text x="820" y="20" text-anchor="end" font-family="sans-serif" font-size="12" fill="#34d399">OPTIMAL</text>
        </g>
        <line x1="36" y1="200" x2="880" y2="200" stroke="#f5f4f0" stroke-opacity="0.06"/>

        <g transform="translate(36, 230)">
          <text x="0" y="20" font-family="sans-serif" font-size="15" font-weight="600" fill="#f5f4f0">Fasting Insulin</text>
          <text x="680" y="20" font-family="sans-serif" font-size="14" font-weight="700" fill="#34d399">3.2 µIU/mL</text>
          <text x="820" y="20" text-anchor="end" font-family="sans-serif" font-size="12" fill="#34d399">OPTIMAL</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(solace2, 'solace-markers.jpg');

  // solace-calendar.jpg (1600x1000)
  const solace3 = `
  <svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1600" height="1000" fill="#080a09"/>
    <rect x="80" y="80" width="1440" height="840" rx="16" fill="#0e1210" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.12"/>
    <g transform="translate(140, 140)">
      <text x="0" y="24" font-family="sans-serif" font-size="13" font-weight="700" fill="#34d399" letter-spacing="3">3-STEP WHOLE-BODY DIAGNOSTIC SCAN SCHEDULER</text>
      <text x="1160" y="24" text-anchor="end" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.5">ZERO PAPERWORK · 99.8% SATISFACTION</text>
      <line x1="0" y1="50" x2="1160" y2="50" stroke="#f5f4f0" stroke-opacity="0.1" stroke-width="1"/>

      <!-- Intake Flow -->
      <g transform="translate(0, 90)">
        <rect x="0" y="0" width="1160" height="420" rx="12" fill="#090d0b" stroke="#34d399" stroke-width="1" stroke-opacity="0.25"/>
        <text x="40" y="50" font-family="sans-serif" font-size="18" font-weight="700" fill="#f5f4f0">Step 2 of 3: Reserve 3T Full-Body MRI Suite</text>
        <text x="40" y="80" font-family="sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.6">Harley Street Diagnostic Center, London</text>

        <!-- Calendar Slot Selection -->
        <g transform="translate(40, 120)">
          <rect x="0" y="0" width="160" height="80" rx="8" fill="#141c18" stroke="#34d399" stroke-width="1.5"/>
          <text x="80" y="35" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#f5f4f0">THU, NOV 05</text>
          <text x="80" y="60" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#34d399">09:00 AM</text>

          <rect x="180" y="0" width="160" height="80" rx="8" fill="#101512" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="260" y="35" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="500" fill="#f5f4f0">THU, NOV 05</text>
          <text x="260" y="60" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.5">02:30 PM</text>

          <rect x="360" y="0" width="160" height="80" rx="8" fill="#101512" stroke="#f5f4f0" stroke-width="1" stroke-opacity="0.1"/>
          <text x="440" y="35" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="500" fill="#f5f4f0">FRI, NOV 06</text>
          <text x="440" y="60" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#f5f4f0" fill-opacity="0.5">10:15 AM</text>
        </g>
      </g>
    </g>
  </svg>`;
  await writeSvgToJpg(solace3, 'solace-calendar.jpg');

  console.log('ALL BESPOKE IMAGES FOR ALL 6 PROJECTS GENERATED SUCCESSFULLY!');
}

generateAll().catch(console.error);
