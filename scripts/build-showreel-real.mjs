import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FFMPEG = 'C:\\Users\\Dr Bankole\\.local\\bin\\ffmpeg.exe';
const WORK_DIR = 'scripts/reel_build';

if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true });
}

function runFFmpeg(args, desc) {
  console.log(`[FFmpeg] ${desc}...`);
  const res = spawnSync(FFMPEG, args, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`FFmpeg failed for: ${desc} (exit code ${res.status})`);
  }
}

// 1. Generate 6 Transparent SVG Motion Graphic Overlay Plates (1920x1080)
const OVERLAYS = [
  // Scene 1: Brand Hook & Architectural Grid
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f7d863" />
        <stop offset="100%" stop-color="#c5981d" />
      </linearGradient>
    </defs>
    <!-- Architectural Vignette & Dark Tint -->
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.38" />
    <rect x="0" y="0" width="1920" height="120" fill="url(#topGrad)" fill-opacity="0.7" />

    <!-- Top Status Bar -->
    <rect x="80" y="60" width="380" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.75" stroke="#f5f4f0" stroke-opacity="0.2" />
    <circle cx="106" cy="81" r="5" fill="#dcaa28" />
    <text x="124" y="86" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#f5f4f0" letter-spacing="2">VIRTUE &amp; CO. WEBWORKS</text>

    <rect x="1460" y="60" width="380" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.75" stroke="#f5f4f0" stroke-opacity="0.2" />
    <text x="1485" y="86" font-family="monospace" font-size="13" font-weight="500" fill="#dcaa28" letter-spacing="1.5">STUDIO REEL · 2026 EDITION</text>

    <!-- Center Hook Badge -->
    <g transform="translate(140, 480)">
      <rect x="0" y="0" width="1640" height="440" rx="24" fill="#0a0a0a" fill-opacity="0.78" stroke="#ffffff" stroke-opacity="0.16" />
      
      <text x="70" y="90" font-family="monospace" font-size="16" font-weight="600" fill="#dcaa28" letter-spacing="4">( ARCHITECTURAL WEB ENGINEERING )</text>
      <text x="70" y="210" font-family="Inter, sans-serif" font-size="82" font-weight="700" fill="#f5f4f0" letter-spacing="-3">Make. Every Website. Count.</text>
      <text x="70" y="290" font-family="Inter, sans-serif" font-size="28" font-weight="400" fill="#f5f4f0" fill-opacity="0.75">Bespoke Platforms · Fixed Pricing · Guaranteed Delivery · Zero Bloat</text>

      <line x1="70" y1="340" x2="1570" y2="340" stroke="#f5f4f0" stroke-opacity="0.15" stroke-width="1" />
      <text x="70" y="390" font-family="monospace" font-size="16" fill="#f5f4f0" fill-opacity="0.6">01 FINTECH &bull; 02 LUXURY COMMERCE &bull; 03 EDITORIAL &bull; 04 ARCHITECTURE &bull; 05 AI CLOUD</text>
      <text x="1440" y="390" font-family="monospace" font-size="15" fill="#dcaa28">SCENE 01 / 06</text>
    </g>
  </svg>
  `,

  // Scene 2: Aurum Private Treasury (Fintech)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.42" />

    <!-- Top Badge -->
    <rect x="80" y="60" width="460" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.8" stroke="#dcaa28" stroke-opacity="0.4" />
    <text x="105" y="86" font-family="monospace" font-size="13" font-weight="600" fill="#dcaa28" letter-spacing="2">PRACTICE 01 &bull; BESPOKE PLATFORMS</text>

    <!-- Floating UI Dashboard Card -->
    <g transform="translate(120, 240)">
      <rect x="0" y="0" width="1680" height="660" rx="28" fill="#0b0b0e" fill-opacity="0.88" stroke="#f5f4f0" stroke-opacity="0.22" />
      
      <!-- Card Header -->
      <text x="60" y="80" font-family="monospace" font-size="16" font-weight="600" fill="#dcaa28" letter-spacing="3">( CLIENT CASE STUDY 001 )</text>
      <text x="60" y="170" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#f5f4f0" letter-spacing="-2">Aurum Private Treasury OS</text>
      <text x="60" y="225" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#f5f4f0" fill-opacity="0.75">Sub-50ms Corporate Banking, Yield Accrual &amp; Global Wire Engine</text>

      <!-- Key Metrics Row -->
      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#dcaa28" stroke-opacity="0.35" />
        <text x="40" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#dcaa28">5.28% APY</text>
        <text x="40" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">OVERNIGHT T-BILL SWEEP</text>
        <text x="40" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Automated yield accrual on $400M+ assets</text>

        <rect x="520" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="560" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#f5f4f0">&lt; 45ms</text>
        <text x="560" y="110" font-family="monospace" font-size="14" fill="#dcaa28">LEDGER SETTLEMENT</text>
        <text x="560" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Instant optimistic multi-currency wire rails</text>

        <rect x="1040" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="1080" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#35c48d">100%</text>
        <text x="1080" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">ZERO UNAUTHORIZED WIRES</text>
        <text x="1080" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Dual-key cryptographic multi-signature</text>
      </g>

      <line x1="60" y1="540" x2="1620" y2="540" stroke="#f5f4f0" stroke-opacity="0.15" stroke-width="1" />
      <text x="60" y="600" font-family="monospace" font-size="15" fill="#f5f4f0" fill-opacity="0.7">STACK: NEXT.JS &bull; SUPABASE &bull; REAL-TIME WEBSOCKETS &bull; FINANCIAL TELEMETRY</text>
      <text x="1440" y="600" font-family="monospace" font-size="15" fill="#dcaa28">SCENE 02 / 06</text>
    </g>
  </svg>
  `,

  // Scene 3: Maison Finery Paris (Luxury E-Commerce)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.44" />

    <!-- Top Badge -->
    <rect x="80" y="60" width="460" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.8" stroke="#dcaa28" stroke-opacity="0.4" />
    <text x="105" y="86" font-family="monospace" font-size="13" font-weight="600" fill="#dcaa28" letter-spacing="2">PRACTICE 02 &bull; LUXURY E-COMMERCE</text>

    <!-- Floating UI Card -->
    <g transform="translate(120, 240)">
      <rect x="0" y="0" width="1680" height="660" rx="28" fill="#0b0b0e" fill-opacity="0.88" stroke="#f5f4f0" stroke-opacity="0.22" />
      
      <text x="60" y="80" font-family="monospace" font-size="16" font-weight="600" fill="#dcaa28" letter-spacing="3">( CLIENT CASE STUDY 002 )</text>
      <text x="60" y="170" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#f5f4f0" letter-spacing="-2">Maison Finery Paris</text>
      <text x="60" y="225" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#f5f4f0" fill-opacity="0.75">Headless Haute Couture Storefront &bull; Multi-Currency Bag &bull; Global Shipping</text>

      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#dcaa28" stroke-opacity="0.35" />
        <text x="40" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#dcaa28">+340%</text>
        <text x="40" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">CHECKOUT COMPLETION</text>
        <text x="40" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Eliminated 68% mobile cart abandonment</text>

        <rect x="520" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="560" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#f5f4f0">0.32s</text>
        <text x="560" y="110" font-family="monospace" font-size="14" fill="#dcaa28">CURRENCY SWITCH LATENCY</text>
        <text x="560" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Real-time USD, EUR, GBP &amp; NGN conversions</text>

        <rect x="1040" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="1080" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#35c48d">99/100</text>
        <text x="1080" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">CORE WEB VITALS</text>
        <text x="1080" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Zero layout shift on high-fashion runway media</text>
      </g>

      <line x1="60" y1="540" x2="1620" y2="540" stroke="#f5f4f0" stroke-opacity="0.15" stroke-width="1" />
      <text x="60" y="600" font-family="monospace" font-size="15" fill="#f5f4f0" fill-opacity="0.7">STACK: HEADLESS SHOPIFY &bull; NEXT.JS 16 &bull; TAILWIND &bull; STRIPE &amp; APPLE PAY</text>
      <text x="1440" y="600" font-family="monospace" font-size="15" fill="#dcaa28">SCENE 03 / 06</text>
    </g>
  </svg>
  `,

  // Scene 4: Kinetix AI Cloud (High-Tech GPU Compute)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.42" />

    <!-- Top Badge -->
    <rect x="80" y="60" width="460" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.8" stroke="#dcaa28" stroke-opacity="0.4" />
    <text x="105" y="86" font-family="monospace" font-size="13" font-weight="600" fill="#dcaa28" letter-spacing="2">PRACTICE 03 &bull; AI CLOUD PLATFORMS</text>

    <!-- Floating UI Card -->
    <g transform="translate(120, 240)">
      <rect x="0" y="0" width="1680" height="660" rx="28" fill="#0b0b0e" fill-opacity="0.88" stroke="#f5f4f0" stroke-opacity="0.22" />
      
      <text x="60" y="80" font-family="monospace" font-size="16" font-weight="600" fill="#dcaa28" letter-spacing="3">( CLIENT CASE STUDY 003 )</text>
      <text x="60" y="170" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#f5f4f0" letter-spacing="-2">Kinetix AI Cloud</text>
      <text x="60" y="225" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#f5f4f0" fill-opacity="0.75">Bare-Metal NVIDIA B200/H100 Clusters &bull; Streaming Token Playground &bull; Region Radar</text>

      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#dcaa28" stroke-opacity="0.35" />
        <text x="40" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#dcaa28">12.4ms</text>
        <text x="40" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">INFERENCE LATENCY</text>
        <text x="40" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Real-time token streaming playground</text>

        <rect x="520" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="560" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#f5f4f0">-62%</text>
        <text x="560" y="110" font-family="monospace" font-size="14" fill="#dcaa28">DEV ONBOARDING DROP-OFF</text>
        <text x="560" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Instant GPU cluster calculator &amp; 1-click SDK</text>

        <rect x="1040" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="1080" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#35c48d">100%</text>
        <text x="1080" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">TRANSPARENT PRICING</text>
        <text x="1080" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Zero hidden egress fees across global regions</text>
      </g>

      <line x1="60" y1="540" x2="1620" y2="540" stroke="#f5f4f0" stroke-opacity="0.15" stroke-width="1" />
      <text x="60" y="600" font-family="monospace" font-size="15" fill="#f5f4f0" fill-opacity="0.7">STACK: RUST EDGE WORKERS &bull; REACT 19 &bull; WEBSOCKETS &bull; TAILWIND CSS</text>
      <text x="1440" y="600" font-family="monospace" font-size="15" fill="#dcaa28">SCENE 04 / 06</text>
    </g>
  </svg>
  `,

  // Scene 5: Northline & Solace Health (Architecture & Diagnostics)
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.45" />

    <!-- Top Badge -->
    <rect x="80" y="60" width="520" height="42" rx="21" fill="#0a0a0a" fill-opacity="0.8" stroke="#dcaa28" stroke-opacity="0.4" />
    <text x="105" y="86" font-family="monospace" font-size="13" font-weight="600" fill="#dcaa28" letter-spacing="2">PRACTICE 04 &bull; ARCHITECTURE &amp; HEALTHCARE</text>

    <!-- Floating UI Card -->
    <g transform="translate(120, 240)">
      <rect x="0" y="0" width="1680" height="660" rx="28" fill="#0b0b0e" fill-opacity="0.88" stroke="#f5f4f0" stroke-opacity="0.22" />
      
      <text x="60" y="80" font-family="monospace" font-size="16" font-weight="600" fill="#dcaa28" letter-spacing="3">( CLIENT CASE STUDIES 004 &amp; 005 )</text>
      <text x="60" y="170" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#f5f4f0" letter-spacing="-2">Northline Prefab &amp; Solace Health</text>
      <text x="60" y="225" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#f5f4f0" fill-opacity="0.75">Interactive CAD Floorplans &bull; 110+ Biomarker Longevity Diagnostics &bull; Instant Booking</text>

      <g transform="translate(60, 290)">
        <rect x="0" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#dcaa28" stroke-opacity="0.35" />
        <text x="40" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#dcaa28">+420%</text>
        <text x="40" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">CONSULTATION BOOKINGS</text>
        <text x="40" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">4-step modular timber cabin configurator</text>

        <rect x="520" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="560" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#f5f4f0">110+</text>
        <text x="560" y="110" font-family="monospace" font-size="14" fill="#dcaa28">BIOMARKERS TRACKED</text>
        <text x="560" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Interactive whole-body MRI &amp; lab results</text>

        <rect x="1040" y="0" width="480" height="180" rx="18" fill="#141418" stroke="#ffffff" stroke-opacity="0.12" />
        <text x="1080" y="65" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#35c48d">99.8%</text>
        <text x="1080" y="110" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.8">PATIENT SATISFACTION</text>
        <text x="1080" y="145" font-family="Inter, sans-serif" font-size="14" fill="#f5f4f0" fill-opacity="0.5">Seamless 3-step digital clinical scheduling</text>
      </g>

      <line x1="60" y1="540" x2="1620" y2="540" stroke="#f5f4f0" stroke-opacity="0.15" stroke-width="1" />
      <text x="60" y="600" font-family="monospace" font-size="15" fill="#f5f4f0" fill-opacity="0.7">STACK: WIX STUDIO API &bull; SUPABASE RLS &bull; SVG BLUEPRINTS &bull; STRIPE BILLING</text>
      <text x="1440" y="600" font-family="monospace" font-size="15" fill="#dcaa28">SCENE 05 / 06</text>
    </g>
  </svg>
  `,

  // Scene 6: Architectural Outro & Call to Action
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
    <defs>
      <linearGradient id="virtue-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f7d863" />
        <stop offset="100%" stop-color="#c5981d" />
      </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="#0a0a0a" fill-opacity="0.65" />

    <g transform="translate(960, 360)">
      <!-- Master V Monogram Mark -->
      <rect x="-90" y="-140" width="180" height="180" rx="36" fill="#0a0a0a" stroke="#dcaa28" stroke-width="2" />
      <path d="M -44,-88 L -6,-88 L 4,2 Z" fill="url(#virtue-gold)" />
      <path d="M 44,-88 L 6,-88 L -4,2 Z" fill="url(#virtue-gold)" />

      <!-- Wordmark -->
      <text x="0" y="110" text-anchor="middle" font-family="Inter, sans-serif" font-size="64" font-weight="800" fill="#f5f4f0" letter-spacing="-1">VIRTUE &amp; CO.</text>
      <text x="0" y="160" text-anchor="middle" font-family="monospace" font-size="18" font-weight="600" fill="#dcaa28" letter-spacing="8">WEBWORKS</text>

      <text x="0" y="240" text-anchor="middle" font-family="Inter, sans-serif" font-size="36" font-weight="600" fill="#f5f4f0" letter-spacing="-1">Make. Every Website. Count.</text>
      <text x="0" y="295" text-anchor="middle" font-family="monospace" font-size="16" fill="#f5f4f0" fill-opacity="0.7">FIXED TIMELINES &bull; SENIOR COLLABORATION &bull; 100% OWNERSHIP</text>

      <rect x="-240" y="340" width="480" height="52" rx="26" fill="#dcaa28" />
      <text x="0" y="373" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#0a0a0a" letter-spacing="1">NOW BOOKING Q4 2026 PROJECTS</text>

      <text x="0" y="440" text-anchor="middle" font-family="monospace" font-size="14" fill="#f5f4f0" fill-opacity="0.5">HTTPS://VIRTUECOWEBWORKS.SOLUTIONS</text>
    </g>
  </svg>
  `
];

console.log('1. Rendering SVG Overlays to PNG plates...');
OVERLAYS.forEach((svg, idx) => {
  const svgPath = path.join(WORK_DIR, `overlay_${idx}.svg`);
  const pngPath = path.join(WORK_DIR, `overlay_${idx}.png`);
  fs.writeFileSync(svgPath, svg.trim(), 'utf8');

  // Convert SVG to PNG using FFmpeg
  runFFmpeg(['-y', '-i', svgPath, pngPath], `Render overlay PNG ${idx}`);
});

// 2. Real Video Source Clips Mapping
const SCENE_CONFIGS = [
  { source: 'raw_clips/clip_digital.mp4', start: '00:00:02', duration: 5, overlay: 'overlay_0.png' },
  { source: 'raw_clips/clip_network.mp4', start: '00:00:01', duration: 5, overlay: 'overlay_1.png' },
  { source: 'test-clip.mp4', start: '00:00:04', duration: 5, overlay: 'overlay_2.png' },
  { source: 'raw_clips/clip_server_cut.mp4', start: '00:00:00', duration: 5, overlay: 'overlay_3.png' },
  { source: 'raw_clips/clip_banner.mp4', start: '00:00:06', duration: 5, overlay: 'overlay_4.png' },
  { source: 'raw_clips/clip_network.mp4', start: '00:00:08', duration: 5, overlay: 'overlay_5.png' },
];

console.log('2. Compositing Real Video Clips with Motion Graphic Overlays...');
SCENE_CONFIGS.forEach((cfg, idx) => {
  const outScene = path.join(WORK_DIR, `scene_${idx}.mp4`);
  const overlayPng = path.join(WORK_DIR, cfg.overlay);

  // Take real video, scale to 1920x1080 crop, overlay motion graphic plate, fade in/out
  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30[vid]`,
    `[vid][1:v]overlay=0:0[composed]`,
    `[composed]fade=t=in:st=0:d=0.35,fade=t=out:st=4.65:d=0.35[outv]`
  ].join(';');

  runFFmpeg([
    '-y',
    '-ss', cfg.start,
    '-t', `${cfg.duration}`,
    '-i', cfg.source,
    '-i', overlayPng,
    '-filter_complex', filter,
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    outScene
  ], `Encode Scene ${idx}`);
});

console.log('3. Concatenating all 6 scenes into 30.0s master video...');
const concatList = path.join(WORK_DIR, 'concat.txt');
const concatContent = SCENE_CONFIGS.map((_, idx) => `file 'scene_${idx}.mp4'`).join('\n');
fs.writeFileSync(concatList, concatContent, 'utf8');

const videoOnly = path.join(WORK_DIR, 'showreel_visuals.mp4');
runFFmpeg([
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatList,
  '-c', 'copy',
  videoOnly
], 'Concat scenes');

console.log('4. Synthesizing Harmonic Soundbed & Final Render...');
const finalOutput = 'public/media/brand-intro-v2.mp4';

// Synthesize ambient drone chord with rhythmic pulses
const audioFilter = `
  sine=frequency=55:duration=30.0[bass];
  sine=frequency=110:duration=30.0[mid];
  sine=frequency=220:duration=30.0[high];
  sine=frequency=330:duration=30.0[harmonic];
  anoisesrc=d=30:c=pink:r=48000:a=0.015[noise];
  [bass][mid]amix=inputs=2:weights=0.5 0.3[b1];
  [b1][high]amix=inputs=2:weights=0.7 0.2[b2];
  [b2][harmonic]amix=inputs=2:weights=0.8 0.15[b3];
  [b3][noise]amix=inputs=2:weights=0.85 0.15[outa];
  [outa]afade=t=in:st=0:d=1.5,afade=t=out:st=28.5:d=1.5,volume=0.8[finala]
`.replace(/\n/g, '');

runFFmpeg([
  '-y',
  '-i', videoOnly,
  '-filter_complex', audioFilter,
  '-map', '0:v',
  '-map', '[finala]',
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-ar', '48000',
  '-movflags', '+faststart',
  finalOutput
], 'Final Master Render');

console.log('SHOWREEL GENERATION COMPLETE!');
