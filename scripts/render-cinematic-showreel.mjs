import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FFMPEG = 'C:\\Users\\Dr Bankole\\.local\\bin\\ffmpeg.exe';
const WORK_DIR = 'scripts/reel_build';

if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true });
}

function run(args, desc) {
  console.log(`[FFmpeg] ${desc}...`);
  const res = spawnSync(FFMPEG, args, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`Command failed for: ${desc} (code ${res.status})`);
  }
}

// 6 Distinct Scenes, each exactly 5.0 seconds (Total = 30.0 seconds)
const SCENES = [
  {
    desc: 'Scene 1: Introduction & Brand Hook',
    video: 'raw_clips/clip_digital.mp4',
    start: '00:00:03',
    uiImg: 'public/work/aurum-hero.jpg',
    card: {
      tag: 'ARCHITECTURAL WEB ENGINEERING · 2026',
      title: 'VIRTUE & CO. WEBWORKS',
      sub: 'Make. Every Website. Count.',
      bullets: 'Bespoke Platforms &bull; High Conversion &bull; Guaranteed Fixed Deadlines',
    },
  },
  {
    desc: 'Scene 2: Aurum Private Treasury (Fintech)',
    video: 'raw_clips/clip_network.mp4',
    start: '00:00:02',
    uiImg: 'public/work/aurum-hero.jpg',
    card: {
      tag: '01 · BESPOKE WEB PLATFORMS',
      title: 'AURUM PRIVATE TREASURY',
      sub: 'Sub-50ms Corporate Banking & Yield OS',
      bullets: '5.28% T-Bill Vaults &bull; Optimistic Wires &bull; Dual-Key Security',
    },
  },
  {
    desc: 'Scene 3: Maison Finery Paris (Luxury E-Commerce)',
    video: 'test-clip.mp4',
    start: '00:00:04',
    uiImg: 'public/work/finery-hero.jpg',
    card: {
      tag: '02 · LUXURY E-COMMERCE STOREFRONTS',
      title: 'MAISON FINERY PARIS',
      sub: 'Haute Couture & Multi-Currency Bag',
      bullets: '+340% Mobile Checkout Speed &bull; USD EUR GBP NGN &bull; 99/100 Vitals',
    },
  },
  {
    desc: 'Scene 4: Kinetix AI Cloud (GPU Cloud)',
    video: 'raw_clips/clip_server_cut.mp4',
    start: '00:00:00',
    uiImg: 'public/work/kinetix-hero.jpg',
    card: {
      tag: '03 · AI CLOUD & INFRASTRUCTURE',
      title: 'KINETIX AI CLOUD',
      sub: 'Bare-Metal NVIDIA B200 Clusters',
      bullets: '12.4ms Inference Latency &bull; Streaming Token Playground &bull; Zero Egress',
    },
  },
  {
    desc: 'Scene 5: Architecture & Diagnostics (Northline & Solace)',
    video: 'raw_clips/clip_banner.mp4',
    start: '00:00:08',
    uiImg: 'public/work/northline-hero.jpg',
    card: {
      tag: '04 · ARCHITECTURAL CAD & CLINICAL TELEMETRY',
      title: 'NORTHLINE & SOLACE HEALTH',
      sub: 'Interactive CAD & 110+ Biomarkers',
      bullets: '4-Step Timber Configurator &bull; Longevity Age Clock &bull; Instant Booking',
    },
  },
  {
    desc: 'Scene 6: Climax & Client Call to Action',
    video: 'raw_clips/clip_digital.mp4',
    start: '00:00:15',
    uiImg: 'public/work/solace-hero.jpg',
    card: {
      tag: 'SENIOR WEB ENGINEERING STUDIO',
      title: 'MAKE. EVERY WEBSITE. COUNT.',
      sub: 'One Team. Zero Handoffs. Direct Collaboration.',
      bullets: 'NOW BOOKING Q4 2026 · VIRTUECOWEBWORKS.SOLUTIONS',
    },
  },
];

const sanitize = (str) =>
  str
    .replace(/&bull;/g, '·')
    .replace(/'/g, '')
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%');

console.log('Rendering 6 Cinematic Scenes...');

SCENES.forEach((s, idx) => {
  const sceneOut = path.join(WORK_DIR, `cinematic_${idx}.mp4`);

  // FilterGraph:
  // 1. Scale/crop real video to 1920x1080 @ 30fps with subtle dark tint
  // 2. Scale UI preview screenshot to 840x525 with 2px border
  // 3. Overlay UI preview on the right (x=980, y=260)
  // 4. Draw frosted dark backdrop card on the left (x=100, y=240, w=820, h=560)
  // 5. Draw top status pill
  // 6. Draw typography tags, bold titles, and bullet pills
  // 7. Add smooth 0.35s in/out fades
  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,eq=brightness=-0.08:contrast=1.12[bg]`,
    `[1:v]scale=840:525:force_original_aspect_ratio=increase,crop=840:525[ui]`,
    `[bg]drawbox=x=0:y=0:w=1920:h=1080:color=black@0.45:t=fill[darkened]`,
    `[darkened]drawbox=x=80:y=60:w=520:h=46:color=black@0.85:t=fill,drawbox=x=80:y=60:w=520:h=46:color=0xdcaa28@0.4:t=2[withtop]`,
    `[withtop]drawtext=text='VIRTUE & CO. WEBWORKS · 2026 REEL':fontcolor=0xdcaa28:fontsize=15:x=115:y=76[withbrand]`,
    `[withbrand]drawbox=x=1540:y=60:w=300:h=46:color=black@0.85:t=fill,drawbox=x=1540:y=60:w=300:h=46:color=white@0.2:t=2[withstatus]`,
    `[withstatus]drawtext=text='SCENE 0${idx+1} / 06':fontcolor=white:fontsize=15:x=1615:y=76[withmeta]`,
    `[withmeta][ui]overlay=980:260[withui]`,
    `[withui]drawbox=x=980:y=260:w=840:h=525:color=0xdcaa28@0.5:t=2[withuiborder]`,
    `[withuiborder]drawbox=x=100:y=240:w=820:h=560:color=0x0b0b0f@0.92:t=fill,drawbox=x=100:y=240:w=820:h=560:color=white@0.18:t=2[withcard]`,
    `[withcard]drawtext=text='${sanitize(s.card.tag)}':fontcolor=0xdcaa28:fontsize=16:x=140:y=300[t1]`,
    `[t1]drawtext=text='${sanitize(s.card.title)}':fontcolor=white:fontsize=46:x=140:y=350[t2]`,
    `[t2]drawtext=text='${sanitize(s.card.sub)}':fontcolor=white@0.85:fontsize=22:x=140:y=440[t3]`,
    `[t3]drawbox=x=140:y=510:w=740:h=1:color=white@0.15:t=fill[sep]`,
    `[sep]drawtext=text='${sanitize(s.card.bullets)}':fontcolor=0xdcaa28:fontsize=17:x=140:y=560[t4]`,
    `[t4]drawbox=x=140:y=640:w=320:h=46:color=0xdcaa28@0.2:t=fill,drawbox=x=140:y=640:w=320:h=46:color=0xdcaa28@0.8:t=2[btn]`,
    `[btn]drawtext=text='VIEW LIVE PLATFORM':fontcolor=white:fontsize=14:x=195:y=656[composed]`,
    `[composed]fade=t=in:st=0:d=0.35,fade=t=out:st=4.65:d=0.35[outv]`
  ].join(';');

  run([
    '-y',
    '-ss', s.start,
    '-t', '5.0',
    '-i', s.video,
    '-i', s.uiImg,
    '-filter_complex', filter,
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    sceneOut
  ], s.desc);
});

console.log('Concatenating scenes into 30.0s master...');
const concatTxt = path.join(WORK_DIR, 'cinematic_concat.txt');
fs.writeFileSync(concatTxt, SCENES.map((_, i) => `file 'cinematic_${i}.mp4'`).join('\n'), 'utf8');

const visualMaster = path.join(WORK_DIR, 'cinematic_master.mp4');
run([
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatTxt,
  '-c', 'copy',
  visualMaster
], 'Concatenate 6 scenes');

console.log('Synthesizing Ambient Audio Soundbed & Final Render...');
const finalOutput = 'public/media/brand-intro-v2.mp4';

const audioFilter = `
  sine=frequency=55:duration=30.0[bass];
  sine=frequency=110:duration=30.0[mid];
  sine=frequency=220:duration=30.0[high];
  anoisesrc=d=30:c=pink:r=48000:a=0.01[noise];
  [bass][mid]amix=inputs=2:weights=0.5 0.3[m1];
  [m1][high]amix=inputs=2:weights=0.7 0.2[m2];
  [m2][noise]amix=inputs=2:weights=0.85 0.15[outa];
  [outa]afade=t=in:st=0:d=1.5,afade=t=out:st=28.5:d=1.5,volume=0.85[finala]
`.replace(/\n/g, '');

run([
  '-y',
  '-i', visualMaster,
  '-filter_complex', audioFilter,
  '-map', '0:v',
  '-map', '[finala]',
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-ar', '48000',
  '-movflags', '+faststart',
  finalOutput
], 'Final Master Render with Audio');

// Also update hero loop
run([
  '-y',
  '-ss', '00:00:00',
  '-t', '8.0',
  '-i', 'public/media/brand-intro-v2.mp4',
  '-an',
  '-c:v', 'libx264',
  '-crf', '24',
  '-preset', 'fast',
  'public/media/hero-loop.mp4'
], 'Update hero-loop.mp4');

// Update preview GIF
run([
  '-y',
  '-ss', '00:00:00',
  '-t', '6.0',
  '-i', 'public/media/brand-intro-v2.mp4',
  '-vf', 'fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
  'public/media/brand-showreel-preview.gif'
], 'Update preview GIF');

// Copy to artifact directory
const artDir = 'C:\\Users\\Dr Bankole\\.gemini\\antigravity\\brain\\37424487-e41e-4204-bb6d-c030707d5531';
fs.copyFileSync('public/media/brand-intro-v2.mp4', path.join(artDir, 'virtue-brand-showreel.mp4'));
fs.copyFileSync('public/media/brand-showreel-preview.gif', path.join(artDir, 'virtue-showreel-animated.gif'));
fs.copyFileSync('public/media/hero-loop.mp4', path.join(artDir, 'virtue-hero-loop.mp4'));

console.log('CINEMATIC 30S SHOWREEL WITH REAL FOOTAGE RENDERED SUCCESSFULLY!');
