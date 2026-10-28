'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Terminal,
  Zap,
  Globe,
  ShieldCheck,
  Play,
  Copy,
  Check,
  Server,
  Activity,
  Sliders,
  ArrowUpRight,
  ChevronRight,
  Layers,
  Gauge,
  Key,
  Lock,
  Sparkles,
  RefreshCw,
  Code2,
  Database,
  Network,
  X,
  CheckCircle2,
  HardDrive,
  Boxes,
  Clock,
  DollarSign,
} from 'lucide-react';

type ModelId = 'llama-3.3-70b' | 'deepseek-r1-distill' | 'flux-1.1-pro-vision';
type SdkLang = 'typescript' | 'python' | 'curl';
type GpuId = 'b200' | 'h200' | 'h100' | 'l40s';
type BillingMode = 'hourly' | 'monthly' | 'annual';
type RegionId = 'us-east' | 'eu-north' | 'eu-central' | 'af-west' | 'ap-east';

interface ModelSpec {
  id: ModelId;
  name: string;
  provider: string;
  quantization: string;
  contextWindow: string;
  ttftMs: number;
  tps: number;
  costPer1M: number;
  defaultPrompt: string;
  sampleResponse: string;
}

const MODELS: ModelSpec[] = [
  {
    id: 'llama-3.3-70b',
    name: 'Llama-3.3-70B-Instruct',
    provider: 'Meta · FP8 Speculative',
    quantization: 'FP8-TensorRT-LLM',
    contextWindow: '128K tokens',
    ttftMs: 18.4,
    tps: 312,
    costPer1M: 0.4,
    defaultPrompt:
      'Design a zero-copy RDMA tensor parallelism ring topology for 64x NVIDIA B200 GPUs over 3.2 Tbps InfiniBand.',
    sampleResponse: `// KINETIX Topology Planner v4.8 — NVLink 5 + Quantum-2 InfiniBand
1. Intra-Node Domain (TP=8):
   • 8x B200 GPUs bridged via 1.8 TB/s bidirectional NVSwitch Gen4.
   • AllReduce latency: 1.9 µs using SHARP v3 in-network aggregation.

2. Inter-Node Rail-Optimized Ring (PP=2, DP=4):
   • 8x 400G ConnectX-8 NICs per chassis -> non-blocking fat-tree leaf spine.
   • Zero-copy GPUDirect RDMA bypasses host PCIe Gen6 root complex completely.

3. Expected Scaling Efficiency:
   • 98.4% weak scaling efficiency at 128K sequence length (FlashAttention-3 FP8).
   • Sustained cluster throughput: 1.14 ExaFLOPS dense FP8.`,
  },
  {
    id: 'deepseek-r1-distill',
    name: 'DeepSeek-R1-Distill',
    provider: 'DeepSeek · Reasoning MoE',
    quantization: 'FP8-vLLM-Disaggregated',
    contextWindow: '128K tokens',
    ttftMs: 19.2,
    tps: 286,
    costPer1M: 0.55,
    defaultPrompt:
      'Verify formal memory safety bounds for a custom CUDA warp-specialized Hopper/Blackwell persistent kernel.',
    sampleResponse: `<think>
Analyzing shared memory bank conflict stride & asynchronous TMA descriptor bounds...
Checking predicate masks for warp groups 0..3 across 228 KB SMEM allocation.
</think>

Formal Verification Summary (CUDA PTX ISA 8.6):
• Tensor Memory Accelerator (TMA): Multicast load descriptors aligned to 128-byte boundaries; zero out-of-bounds global reads proven.
• Warp-Group Specialization: Producer warps (WG0) decoupled from MMA consumer warps (WG1-WG3) via hardware mbarrier phase parity.
• Register Pressure: Capped at 168 regs/thread -> 0 bytes local memory spill.
• Estimated Kernel Utilization: 94.1% of peak Tensor Core SOL.`,
  },
  {
    id: 'flux-1.1-pro-vision',
    name: 'Flux-1.1-Pro-Vision',
    provider: 'Black Forest · Multimodal',
    quantization: 'BF16-TorchCompile',
    contextWindow: '64K multimodal',
    ttftMs: 16.8,
    tps: 348,
    costPer1M: 0.48,
    defaultPrompt:
      'Analyze wafer die inspection telemetry and classify sub-nanometer lithography defects with bounding coordinates.',
    sampleResponse: `{
  "inspection_id": "KX-WAFER-2026-9941",
  "die_grid": "EUV_High_NA_2nm",
  "inference_latency_ms": 16.8,
  "detections": [
    {
      "class": "stochastic_line_edge_roughness",
      "confidence": 0.996,
      "bbox_nm": [142.4, 88.0, 159.1, 102.5],
      "severity": "NONE_WITHIN_SPEC"
    },
    {
      "class": "via_contact_bridge_anomaly",
      "confidence": 0.989,
      "bbox_nm": [812.0, 404.2, 819.5, 411.8],
      "action": "TRIGGER_E_BEAM_RE_SCAN"
    }
  ],
  "wafer_yield_forecast": "99.42%"
}`,
  },
];

interface GpuArchitecture {
  id: GpuId;
  name: string;
  shortName: string;
  vramPerGpuGB: number;
  fp8PflopsPerGpu: number;
  interconnect: string;
  memBandwidth: string;
  baseHourlyPerGpu: number;
  awsEquivalentPerGpu: number;
  gcpEquivalentPerGpu: number;
  badge: string;
}

const GPU_ARCHITECTURES: GpuArchitecture[] = [
  {
    id: 'b200',
    name: 'NVIDIA B200 192GB',
    shortName: 'B200 SXM6',
    vramPerGpuGB: 192,
    fp8PflopsPerGpu: 9.0,
    interconnect: '3.2 Tbps Quantum-2 InfiniBand + 1.8 TB/s NVLink 5',
    memBandwidth: '8.0 TB/s HBM3e',
    baseHourlyPerGpu: 3.45,
    awsEquivalentPerGpu: 6.85,
    gcpEquivalentPerGpu: 6.4,
    badge: 'Flagship Blackwell',
  },
  {
    id: 'h200',
    name: 'NVIDIA H200 141GB',
    shortName: 'H200 SXM5',
    vramPerGpuGB: 141,
    fp8PflopsPerGpu: 3.96,
    interconnect: '3.2 Tbps InfiniBand + 900 GB/s NVLink 4',
    memBandwidth: '4.8 TB/s HBM3e',
    baseHourlyPerGpu: 2.39,
    awsEquivalentPerGpu: 4.92,
    gcpEquivalentPerGpu: 4.65,
    badge: 'High Memory Bandwidth',
  },
  {
    id: 'h100',
    name: 'NVIDIA H100 SXM5 80GB',
    shortName: 'H100 SXM5',
    vramPerGpuGB: 80,
    fp8PflopsPerGpu: 3.96,
    interconnect: '3.2 Tbps InfiniBand + 900 GB/s NVLink 4',
    memBandwidth: '3.35 TB/s HBM3',
    baseHourlyPerGpu: 1.89,
    awsEquivalentPerGpu: 3.95,
    gcpEquivalentPerGpu: 3.72,
    badge: 'Production Standard',
  },
  {
    id: 'l40s',
    name: 'NVIDIA L40S 48GB',
    shortName: 'L40S PCIe',
    vramPerGpuGB: 48,
    fp8PflopsPerGpu: 1.46,
    interconnect: '800 Gbps RoCEv2 + PCIe Gen5 x16',
    memBandwidth: '864 GB/s GDDR6',
    baseHourlyPerGpu: 0.78,
    awsEquivalentPerGpu: 1.82,
    gcpEquivalentPerGpu: 1.68,
    badge: 'Fine-Tuning & Vision',
  },
];

interface RegionSpec {
  id: RegionId;
  name: string;
  code: string;
  city: string;
  coordinates: { x: number; y: number };
  pue: string;
  energyMix: string;
  availableGpus: string;
  rttMs: number;
  ttftP50Ms: number;
  ttftP99Ms: number;
  uplinkCapacity: string;
  coolingTech: string;
}

const REGIONS: RegionSpec[] = [
  {
    id: 'us-east',
    name: 'US-East (Ashburn)',
    code: 'iad-01',
    city: 'Ashburn, Virginia, USA',
    coordinates: { x: 26, y: 38 },
    pue: '1.08 PUE',
    energyMix: '94% Nuclear + Solar PPA',
    availableGpus: '5,120x B200 · 3,840x H100',
    rttMs: 6.2,
    ttftP50Ms: 14.8,
    ttftP99Ms: 19.1,
    uplinkCapacity: '64 Tbps Direct Peering',
    coolingTech: 'Direct-to-Chip Cold Plate Liquid',
  },
  {
    id: 'eu-north',
    name: 'EU-North (Iceland Hydro-Cooled)',
    code: 'kef-02',
    city: 'Reykjanesbær, Iceland',
    coordinates: { x: 43, y: 21 },
    pue: '1.03 PUE',
    energyMix: '100% Geothermal + Hydroelectric',
    availableGpus: '4,096x B200 · 2,048x H200',
    rttMs: 18.4,
    ttftP50Ms: 16.2,
    ttftP99Ms: 21.4,
    uplinkCapacity: '48 Tbps Subsea Fiber Ring',
    coolingTech: 'Closed-Loop Glacial Ambient + DLC',
  },
  {
    id: 'eu-central',
    name: 'EU-Central (Frankfurt)',
    code: 'fra-01',
    city: 'Frankfurt am Main, Germany',
    coordinates: { x: 51, y: 31 },
    pue: '1.09 PUE',
    energyMix: '100% North Sea Offshore Wind',
    availableGpus: '2,560x H200 · 1,536x H100',
    rttMs: 8.9,
    ttftP50Ms: 15.6,
    ttftP99Ms: 19.8,
    uplinkCapacity: '80 Tbps DE-CIX Spine',
    coolingTech: 'Two-Phase Immersion + Heat Reuse',
  },
  {
    id: 'af-west',
    name: 'AF-West (Lagos Edge)',
    code: 'los-01',
    city: 'Victoria Island, Lagos, Nigeria',
    coordinates: { x: 49, y: 58 },
    pue: '1.12 PUE',
    energyMix: '91% Utility Solar Microgrid + Gas Reserve',
    availableGpus: '768x H100 · 1,024x L40S',
    rttMs: 9.4,
    ttftP50Ms: 17.9,
    ttftP99Ms: 23.0,
    uplinkCapacity: '32 Tbps Equiano + 2Africa Landing',
    coolingTech: 'Adiabatic Chilled Loop + DLC',
  },
  {
    id: 'ap-east',
    name: 'AP-East (Tokyo)',
    code: 'nrt-03',
    city: 'Inzai, Chiba, Tokyo, Japan',
    coordinates: { x: 84, y: 39 },
    pue: '1.07 PUE',
    energyMix: '96% Hydro + Zero-Carbon Grid',
    availableGpus: '2,048x B200 · 1,536x H200',
    rttMs: 7.1,
    ttftP50Ms: 15.1,
    ttftP99Ms: 19.4,
    uplinkCapacity: '56 Tbps Trans-Pacific Express',
    coolingTech: 'Direct Liquid Cooling 60°C Return',
  },
];

const GPU_COUNTS = [8, 16, 32, 64, 128, 256, 512];

export function KinetixAiCloudSite() {
  // Navigation & Modal State
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [sshKeyName, setSshKeyName] = useState('prod-ml-cluster-ed25519');
  const [sshPublicKey, setSshPublicKey] = useState(
    'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKinetixBareMetalClusterKey9928174 ops@kinetix.cloud'
  );
  const [clusterNameInput, setClusterNameInput] = useState('kx-blackwell-pretrain-01');
  const [modalRegion, setModalRegion] = useState<RegionId>('us-east');
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  // Hero Inference Playground State
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('llama-3.3-70b');
  const [selectedSdk, setSelectedSdk] = useState<SdkLang>('typescript');
  const [promptText, setPromptText] = useState<string>(MODELS[0].defaultPrompt);
  const [streamedOutput, setStreamedOutput] = useState<string>(MODELS[0].sampleResponse);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [liveTokensCount, setLiveTokensCount] = useState<number>(142);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  // GPU Cluster Configurator State
  const [selectedGpuId, setSelectedGpuId] = useState<GpuId>('b200');
  const [gpuSliderIndex, setGpuSliderIndex] = useState<number>(3); // Default 64 GPUs
  const [billingMode, setBillingMode] = useState<BillingMode>('monthly');

  // Region Explorer State
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('us-east');

  const activeModel = useMemo(
    () => MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0],
    [selectedModelId]
  );

  const activeGpu = useMemo(
    () => GPU_ARCHITECTURES.find((g) => g.id === selectedGpuId) ?? GPU_ARCHITECTURES[0],
    [selectedGpuId]
  );

  const activeRegion = useMemo(
    () => REGIONS.find((r) => r.id === selectedRegionId) ?? REGIONS[0],
    [selectedRegionId]
  );

  const gpuCount = GPU_COUNTS[gpuSliderIndex] ?? 64;

  // Handle model selection change
  const handleSelectModel = (id: ModelId) => {
    const found = MODELS.find((m) => m.id === id);
    if (!found) return;
    setSelectedModelId(id);
    setPromptText(found.defaultPrompt);
    setStreamedOutput(found.sampleResponse);
    setIsStreaming(false);
    setLiveTokensCount(Math.max(96, Math.round(found.sampleResponse.length / 3.6)));
  };

  // Trigger simulated real-time token streaming
  const runLiveInference = () => {
    if (isStreaming) return;
    setIsStreaming(true);
    setStreamedOutput('');
    setLiveTokensCount(0);
    const fullText = activeModel.sampleResponse;
    let index = 0;

    const interval = setInterval(() => {
      index += 14;
      if (index >= fullText.length) {
        setStreamedOutput(fullText);
        setLiveTokensCount(Math.max(96, Math.round(fullText.length / 3.5)));
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setStreamedOutput(fullText.slice(0, index));
        setLiveTokensCount(Math.max(8, Math.round(index / 3.5)));
      }
    }, 28);
  };

  // Code snippet generator for SDK tabs
  const sdkSnippet = useMemo(() => {
    if (selectedSdk === 'typescript') {
      return `import { Kinetix } from '@kinetix/sdk';

const kx = new Kinetix({ apiKey: process.env.KINETIX_API_KEY });

const stream = await kx.chat.completions.create({
  model: '${activeModel.name}',
  messages: [{ role: 'user', content: ${JSON.stringify(promptText.slice(0, 68) + '...')} }],
  stream: true,
  speculative_decoding: true,
  max_tokens: 2048,
});`;
    }
    if (selectedSdk === 'python') {
      return `from kinetix import AsyncKinetix
import os

client = AsyncKinetix(api_key=os.environ["KINETIX_API_KEY"])

stream = await client.chat.completions.create(
    model="${activeModel.name}",
    messages=[{"role": "user", "content": "${promptText.slice(0, 64)}..."}],
    stream=True,
    fp8_kv_cache=True,
)`;
    }
    return `curl https://api.kinetix.cloud/v1/chat/completions \\
  -H "Authorization: Bearer $KINETIX_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${activeModel.name}",
    "messages": [{"role": "user", "content": "${promptText.slice(0, 60)}..."}],
    "stream": true
  }'`;
  }, [selectedSdk, activeModel, promptText]);

  // Cluster Calculations
  const clusterMetrics = useMemo(() => {
    const discountMultiplier =
      billingMode === 'hourly' ? 1.0 : billingMode === 'monthly' ? 0.8 : 0.62;
    const effectiveHourlyPerGpu = activeGpu.baseHourlyPerGpu * discountMultiplier;
    const totalHourly = effectiveHourlyPerGpu * gpuCount;
    const totalMonthly = totalHourly * 730;

    const awsHourlyTotal = activeGpu.awsEquivalentPerGpu * gpuCount;
    const gcpHourlyTotal = activeGpu.gcpEquivalentPerGpu * gpuCount;

    const totalVramTB = ((activeGpu.vramPerGpuGB * gpuCount) / 1024).toFixed(2);
    const totalFp8Pflops = (activeGpu.fp8PflopsPerGpu * gpuCount).toFixed(1);
    const chassisNodes = Math.ceil(gpuCount / 8);
    const savingsPercent = Math.round(
      ((awsHourlyTotal - totalHourly) / awsHourlyTotal) * 100
    );

    return {
      effectiveHourlyPerGpu,
      totalHourly,
      totalMonthly,
      awsHourlyTotal,
      gcpHourlyTotal,
      totalVramTB,
      totalFp8Pflops,
      chassisNodes,
      savingsPercent,
    };
  }, [activeGpu, gpuCount, billingMode]);

  const copyCodeToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sdkSnippet).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const copyCliCommand = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npx kinetix-cli login --region iad-01').catch(() => {});
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 1800);
  };

  const openProvisionModal = (regionOverride?: RegionId) => {
    if (regionOverride) setModalRegion(regionOverride);
    setProvisionSuccess(false);
    setDeployModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* Subtle Background Grid & Radial Glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30,41,59,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.35) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none fixed top-0 left-1/4 w-[620px] h-[420px] bg-emerald-500/10 blur-[150px] rounded-full z-0" />
      <div className="pointer-events-none fixed bottom-1/4 right-10 w-[520px] h-[420px] bg-cyan-500/10 blur-[150px] rounded-full z-0" />

      {/* STICKY DEVELOPER PLATFORM HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#06080D]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-600 p-[1px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#06080D] rounded-[7px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
                    <path d="M12 22V12" />
                    <path d="M21 7L12 12L3 7" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold tracking-wider text-base text-white">
                    KINETIX
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    v4.8 Cloud
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  BARE-METAL GPU INFRASTRUCTURE
                </span>
              </div>
            </a>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a
                href="#configurator"
                className="hover:text-emerald-400 transition-colors"
              >
                GPU Clusters
              </a>
              <a
                href="#inference"
                className="hover:text-emerald-400 transition-colors"
              >
                Serverless Inference
              </a>
              <a
                href="#benchmarks"
                className="hover:text-emerald-400 transition-colors"
              >
                Benchmarks
              </a>
              <a
                href="#regions"
                className="hover:text-emerald-400 transition-colors"
              >
                Global Regions
              </a>
              <a
                href="#configurator"
                className="hover:text-emerald-400 transition-colors"
              >
                Pricing
              </a>
            </nav>
          </div>

          {/* Right Status Pill + CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-semibold">99.99% Uptime</span>
              <span className="text-slate-600">·</span>
              <span>14,200 GPUs Online</span>
            </div>

            <button
              onClick={() => openProvisionModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-mono font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Deploy Cluster</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO + INTERACTIVE LIVE INFERENCE PLAYGROUND */}
      <section id="inference" className="relative z-10 pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* Left Column: High-Impact Engineering Pitch */}
            <div className="lg:col-span-5 space-y-6 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>NVIDIA B200 SXM6 + 3.2 Tbps Quantum-2 InfiniBand Now GA</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Bare-Metal GPU Clusters &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Sub-20ms
                </span>{' '}
                Model Inference.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Zero virtualization tax. Provision non-oversubscribed{' '}
                <span className="text-white font-medium">NVIDIA B200 & H100 SXM5</span>{' '}
                clusters with GPUDirect RDMA in 45 seconds, or serve frontier open-weights
                models at <span className="text-emerald-400 font-mono">310+ tokens/sec</span>{' '}
                on our disaggregated FP8 TensorRT-LLM fabric.
              </p>

              {/* Key Engineering Specs Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
                  <div className="text-xs font-mono text-slate-400">Time to First Token</div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 mt-1">
                    18.4 ms
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    P50 Global Edge
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
                  <div className="text-xs font-mono text-slate-400">RDMA Interconnect</div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">
                    3.2 Tbps
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Non-blocking Rail
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90">
                  <div className="text-xs font-mono text-slate-400">Cloud Savings</div>
                  <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mt-1">
                    -54%
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    vs Hyperscalers
                  </div>
                </div>
              </div>

              {/* Action Buttons & CLI Quickstart */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openProvisionModal()}
                    className="px-5 py-3 rounded-xl font-mono text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Server className="w-4 h-4" />
                    <span>Provision Bare-Metal Node</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#configurator"
                    className="px-4 py-3 rounded-xl font-mono text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
                  >
                    Price Calculator
                  </a>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-800/90 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 select-none">$</span>
                    <span className="truncate">npx kinetix-cli login --region iad-01</span>
                  </div>
                  <button
                    onClick={copyCliCommand}
                    className="ml-2 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy CLI command"
                  >
                    {copiedCli ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Inference Playground */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#0B0F17]/95 border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">
                {/* Playground Top Bar */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      LIVE SERVERLESS INFERENCE ENGINE
                    </span>
                  </div>

                  {/* Live Telemetry Badges */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {activeModel.ttftMs} ms TTFT
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {activeModel.tps} tokens/sec
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      $0.0004 cost
                    </span>
                  </div>
                </div>

                {/* Model Selector Pills */}
                <div className="p-4 border-b border-slate-800/80 bg-[#090D14]">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                    1. Select Quantized Frontier Model
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {MODELS.map((model) => {
                      const active = model.id === selectedModelId;
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-500/10 border-emerald-500/60 shadow-sm'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-white truncate">
                              {model.name}
                            </span>
                            {active && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                            {model.provider}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Prompt Editor & SDK Code Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-800/80">
                  {/* Prompt Box */}
                  <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between bg-[#0B0F17]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                          2. Input Prompt
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {activeModel.contextWindow}
                        </span>
                      </div>
                      <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg bg-slate-950/90 border border-slate-800 p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60 resize-none"
                      />
                    </div>

                    <button
                      onClick={runLiveInference}
                      disabled={isStreaming}
                      className="mt-3 w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isStreaming ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming FP8 Tokens...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Live Inference</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SDK Code Tab */}
                  <div className="md:col-span-7 p-4 bg-[#070A10] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        {(['typescript', 'python', 'curl'] as SdkLang[]).map((sdk) => (
                          <button
                            key={sdk}
                            onClick={() => setSelectedSdk(sdk)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                              selectedSdk === sdk
                                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sdk === 'typescript'
                              ? 'TypeScript'
                              : sdk === 'python'
                                ? 'Python'
                                : 'cURL'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={copyCodeToClipboard}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SDK</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      <code>{sdkSnippet}</code>
                    </pre>
                  </div>
                </div>

                {/* Live Streaming Output Terminal */}
                <div className="p-4 bg-[#05070B]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Disaggregated KV-Cache Stream Output
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {activeModel.quantization}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Generated: <span className="text-white">{liveTokensCount} tokens</span> ·{' '}
                      <span className="text-emerald-400">{activeModel.ttftMs} ms TTFT</span>
                    </div>
                  </div>

                  <div className="min-h-[165px] max-h-[210px] overflow-y-auto rounded-xl bg-slate-950 border border-slate-800/90 p-3.5 font-mono text-xs text-emerald-100/90 whitespace-pre-wrap leading-relaxed">
                    {streamedOutput}
                    {isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 align-middle bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE GPU CLUSTER CONFIGURATOR & PRICE CALCULATOR */}
      <section
        id="configurator"
        className="relative z-10 py-20 border-b border-slate-800/80 bg-[#070A10]/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Bare-Metal Cluster Configurator</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Architect Your Dedicated Supercluster
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Every node ships with dedicated 3.2 Tbps Quantum-2 InfiniBand rails, local NVMe
              RAID-0 scratch storage, and root Kubernetes or Slurm orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Hardware Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Pick GPU Architecture */}
              <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    1. Select GPU Architecture
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    100% Dedicated SXM / PCIe Gen5
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GPU_ARCHITECTURES.map((gpu) => {
                    const isSelected = gpu.id === selectedGpuId;
                    return (
                      <button
                        key={gpu.id}
                        onClick={() => setSelectedGpuId(gpu.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/5'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                            {gpu.badge}
                          </span>
                          <span className="font-mono text-sm font-bold text-white">
                            ${gpu.baseHourlyPerGpu.toFixed(2)}/hr
                          </span>
                        </div>
                        <div className="font-mono text-base font-bold text-white mt-2.5">
                          {gpu.name}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>{gpu.memBandwidth}</span>
                          <span className="text-cyan-300">
                            {gpu.fp8PflopsPerGpu} PFLOPS FP8
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Slide Node Count */}
              <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    2. Scale Cluster Size (8 GPUs per SXM Chassis)
                  </span>
                  <span className="font-mono text-lg font-bold text-emerald-400">
                    {gpuCount} GPUs ({clusterMetrics.chassisNodes} Nodes)
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={GPU_COUNTS.length - 1}
                  step={1}
                  value={gpuSliderIndex}
                  onChange={(e) => setGpuSliderIndex(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer my-3"
                />

                <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
                  {GPU_COUNTS.map((count, idx) => (
                    <button
                      key={count}
                      onClick={() => setGpuSliderIndex(idx)}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        idx === gpuSliderIndex
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'hover:text-white'
                      }`}
                    >
                      {count} GPUs
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-emerald-400" />
                    Fabric: {activeGpu.interconnect}
                  </span>
                  <span className="text-slate-400">
                    {gpuCount * 3.84} TB Local NVMe Scratch
                  </span>
                </div>
              </div>

              {/* Step 3: Billing Commitment Mode */}
              <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  3. Reservation & Billing Commitment
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'hourly' as BillingMode,
                      label: 'On-Demand Hourly',
                      sub: 'Per-second billing, cancel anytime',
                      tag: 'Standard',
                    },
                    {
                      id: 'monthly' as BillingMode,
                      label: 'Monthly Reserved -20%',
                      sub: 'Guaranteed capacity block',
                      tag: 'Save 20%',
                    },
                    {
                      id: 'annual' as BillingMode,
                      label: 'Annual Cluster -38%',
                      sub: 'Dedicated pod + custom rack SLA',
                      tag: 'Best Value',
                    },
                  ].map((mode) => {
                    const active = billingMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setBillingMode(mode.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-500/15 border-emerald-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold">{mode.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{mode.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live Telemetry Summary & Hyperscaler Comparison */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0E1420] to-[#090D15] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                      Cluster Specification Summary
                    </span>
                    <h3 className="text-xl font-mono font-bold text-white mt-0.5">
                      {gpuCount}x {activeGpu.name}
                    </h3>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                    Save {clusterMetrics.savingsPercent}% vs AWS
                  </div>
                </div>

                {/* Live Compute & VRAM Readout */}
                <div className="grid grid-cols-2 gap-3 my-5">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      Total Coherent VRAM
                    </div>
                    <div className="text-2xl font-mono font-bold text-white mt-1">
                      {clusterMetrics.totalVramTB} TB
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {activeGpu.vramPerGpuGB * gpuCount} GB HBM3e/HBM3
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      FP8 Compute Capacity
                    </div>
                    <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">
                      {clusterMetrics.totalFp8Pflops} PFLOPS
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      Dense Tensor Core Peak
                    </div>
                  </div>
                </div>

                {/* Price Comparison Bars vs AWS / GCP */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/90 mb-5">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Hourly Cluster Rate Comparison ({gpuCount} GPUs)
                  </div>

                  {/* Kinetix Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">
                        KINETIX Bare-Metal ({$Format(clusterMetrics.effectiveHourlyPerGpu)}/GPU/hr)
                      </span>
                      <span className="text-white font-bold">
                        ${clusterMetrics.totalHourly.toLocaleString('en-US', { maximumFractionDigits: 0 })}/hr
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: '48%' }}
                      />
                    </div>
                  </div>

                  {/* GCP Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Google Cloud A3/A4 Mega</span>
                      <span>
                        ${clusterMetrics.gcpHourlyTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}/hr
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-slate-600 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* AWS Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>AWS EC2 P5e / P5 Capacity Block</span>
                      <span>
                        ${clusterMetrics.awsHourlyTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}/hr
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                {/* Total Pricing Footer */}
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <div className="text-xs font-mono text-slate-400">Estimated Cluster Total</div>
                    <div className="text-3xl font-mono font-bold text-white">
                      ${clusterMetrics.totalHourly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm text-slate-400 font-normal"> / hour</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400">Monthly Equivalent</div>
                    <div className="text-sm font-semibold text-emerald-400">
                      ${Math.round(clusterMetrics.totalMonthly).toLocaleString('en-US')}/mo
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openProvisionModal()}
                  className="w-full py-3.5 px-5 rounded-xl font-mono text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Provision Cluster ({gpuCount}x {activeGpu.shortName})</span>
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Egress Fees
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated NCCL Health Checks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENCHMARKS SECTION */}
      <section id="benchmarks" className="relative z-10 py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                MLPerf v4.1 & Disaggregated TensorRT-LLM Benchmarks
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Engineered to Saturate Silicon Roofline
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Verified on 64x NVIDIA B200 SXM6 · CUDA 12.8 · FP8 KV-Cache
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>ALL-REDUCE COLLECTIVE BANDWIDTH</span>
                <span className="text-emerald-400">SHARP v3 ON</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">378.4 GB/s</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sustained bus bandwidth across 512 GPUs using rail-optimized Quantum-2
                InfiniBand with adaptive routing and zero TCP fallback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>LLAMA-3.3-70B SERVING THROUGHPUT</span>
                <span className="text-cyan-400">FP8 SPECULATIVE</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">14,820 tok/s/node</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                2.4x higher throughput per dollar than standard vLLM deployments via prefill/decode
                disaggregation over NVLink 5.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>CHECKPOINT SAVE TO NVME FABRIC</span>
                <span className="text-emerald-400">GPUDIRECT STORAGE</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">1.42 TB/sec</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Asynchronous 1T-parameter model checkpoint writes complete in under 2.1 seconds
                without stalling training forward passes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE GLOBAL DATA CENTER MAP & REGION LATENCY TABLE */}
      <section id="regions" className="relative z-10 py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Sovereign Green AI Data Centers</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Global Low-Latency Spine & Hydro-Cooled Regions
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => {
                const active = region.id === selectedRegionId;
                return (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegionId(region.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {region.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Interactive Stylized Map Panel */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0B0F17] border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
              <div className="flex items-center justify-between z-10">
                <div className="font-mono text-xs text-slate-400">
                  ACTIVE REGION TELEMETRY:{' '}
                  <span className="text-emerald-400 font-bold">{activeRegion.name}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
                  {activeRegion.pue} · {activeRegion.energyMix}
                </span>
              </div>

              {/* Stylized SVG World Backbone Map */}
              <div className="relative my-6 h-56 w-full rounded-xl bg-[#06090F] border border-slate-800/80 overflow-hidden">
                <svg viewBox="0 0 100 65" className="w-full h-full opacity-80">
                  {/* Subtle lat/long grid */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.2" />
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#1e293b" strokeWidth="0.2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.2" />
                  <line x1="25" y1="0" x2="25" y2="65" stroke="#1e293b" strokeWidth="0.2" />
                  <line x1="50" y1="0" x2="50" y2="65" stroke="#1e293b" strokeWidth="0.2" />
                  <line x1="75" y1="0" x2="75" y2="65" stroke="#1e293b" strokeWidth="0.2" />

                  {/* Subsea Fiber Mesh Lines connecting data centers */}
                  <path
                    d="M 26 38 Q 34 26 43 21"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.45"
                    strokeDasharray="1.2 0.8"
                  />
                  <path
                    d="M 43 21 Q 48 25 51 31"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.45"
                    strokeDasharray="1.2 0.8"
                  />
                  <path
                    d="M 26 38 Q 38 34 51 31"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="0.4"
                  />
                  <path
                    d="M 51 31 Q 48 45 49 58"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.45"
                    strokeDasharray="1.2 0.8"
                  />
                  <path
                    d="M 51 31 Q 68 33 84 39"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="0.4"
                  />
                </svg>

                {/* Interactive Region Nodes */}
                {REGIONS.map((reg) => {
                  const isCurrent = reg.id === selectedRegionId;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => setSelectedRegionId(reg.id)}
                      style={{
                        left: `${reg.coordinates.x}%`,
                        top: `${reg.coordinates.y}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full transition-transform ${
                          isCurrent ? 'scale-125' : 'hover:scale-110'
                        }`}
                      >
                        {isCurrent && (
                          <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            isCurrent
                              ? 'bg-emerald-400 ring-4 ring-emerald-500/30'
                              : 'bg-cyan-400/80'
                          }`}
                        />
                      </span>
                      <span
                        className={`mt-1 block px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap border ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700'
                        }`}
                      >
                        {reg.code.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Region Details Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <div className="text-[11px] font-mono text-slate-400">Location</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {activeRegion.city}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">Available Capacity</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                    {activeRegion.availableGpus}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">Thermal Architecture</div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {activeRegion.coolingTech}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">Backbone Uplink</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                    {activeRegion.uplinkCapacity}
                  </div>
                </div>
              </div>
            </div>

            {/* Region Latency & Sustainability Benchmark Table */}
            <div className="lg:col-span-5 rounded-2xl bg-[#0B0F17] border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Region Latency & Sustainability Matrix
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400">Live Ping Probe</span>
                </div>

                <div className="space-y-2.5">
                  {REGIONS.map((reg) => {
                    const isSelected = reg.id === selectedRegionId;
                    return (
                      <div
                        key={reg.id}
                        onClick={() => setSelectedRegionId(reg.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/60'
                            : 'bg-slate-900/50 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-emerald-400' : 'bg-slate-600'
                              }`}
                            />
                            <span className="font-mono text-xs font-bold text-white">
                              {reg.name}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            {reg.rttMs} ms RTT
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>TTFT P50: {reg.ttftP50Ms}ms</span>
                          <span>{reg.pue}</span>
                          <span className="text-slate-300 truncate max-w-[160px]">
                            {reg.energyMix}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => openProvisionModal(activeRegion.id)}
                className="mt-5 w-full py-3 px-4 rounded-xl font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Deploy in {activeRegion.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FULL DEVELOPER CLOUD FOOTER */}
      <footer className="relative z-10 bg-[#04060A] pt-14 pb-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-mono font-bold text-sm">
                  K
                </div>
                <span className="font-mono font-bold text-white tracking-wider">
                  KINETIX AI CLOUD
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Bare-metal NVIDIA B200 & H100 SXM5 GPU clusters, 3.2 Tbps Quantum-2 InfiniBand
                fabrics, and sub-20ms disaggregated serverless model inference.
              </p>

              {/* Quick CLI Box */}
              <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
                <span className="text-emerald-400">$</span>
                <code>npx kinetix-cli login</code>
                <button
                  onClick={copyCliCommand}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedCli ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 text-xs font-mono">
              <div className="text-white font-bold uppercase tracking-wider mb-3">
                Compute
              </div>
              <div><a href="#configurator" className="hover:text-emerald-400">NVIDIA B200 SXM6</a></div>
              <div><a href="#configurator" className="hover:text-emerald-400">NVIDIA H200 141GB</a></div>
              <div><a href="#configurator" className="hover:text-emerald-400">NVIDIA H100 SXM5</a></div>
              <div><a href="#configurator" className="hover:text-emerald-400">3.2T InfiniBand</a></div>
            </div>

            <div className="md:col-span-2 space-y-2 text-xs font-mono">
              <div className="text-white font-bold uppercase tracking-wider mb-3">
                Developers
              </div>
              <div><a href="#inference" className="hover:text-emerald-400">Inference API Docs</a></div>
              <div><a href="#benchmarks" className="hover:text-emerald-400">NCCL Topology Guide</a></div>
              <div><a href="#regions" className="hover:text-emerald-400">Slurm & Kubernetes</a></div>
              <div><a href="#inference" className="hover:text-emerald-400">Python & TS SDKs</a></div>
            </div>

            <div className="md:col-span-3 space-y-3 text-xs font-mono">
              <div className="text-white font-bold uppercase tracking-wider mb-3">
                Compliance & Live Status
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  All 5 Regions Operational
                </div>
                <div className="text-[11px] text-slate-400">
                  SOC2 Type II · ISO 27001 · HIPAA BAA Ready
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
            <div>© {new Date().getFullYear()} Kinetix Cloud Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <span>Status: 99.99% SLA</span>
              <span>Security</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DEPLOY CLUSTER / SSH KEY MODAL */}
      <AnimatePresence>
        {deployModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B0F17] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Provision Bare-Metal GPU Cluster</span>
                </div>
                <button
                  onClick={() => setDeployModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {provisionSuccess ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-mono text-lg font-bold text-white">
                      Cluster Allocation Initialized!
                    </h4>
                    <p className="text-xs font-mono text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your <span className="text-emerald-400">{gpuCount}x {activeGpu.name}</span>{' '}
                      cluster (<span className="text-white">{clusterNameInput}</span>) is booting
                      via PXE NVMe image in{' '}
                      <span className="text-cyan-300">
                        {REGIONS.find((r) => r.id === modalRegion)?.name}
                      </span>
                      .
                    </p>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-xs text-emerald-300">
                      <div>$ ssh root@198.51.100.42 -i ~/.ssh/{sshKeyName}</div>
                      <div className="text-slate-500 mt-1">
                        # Slurm & NCCL ring topology verified (3.2 Tbps IB active)
                      </div>
                    </div>
                    <button
                      onClick={() => setDeployModalOpen(false)}
                      className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold bg-emerald-500 text-slate-950 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono text-xs">
                      <div>
                        <div className="text-slate-400">Selected Hardware</div>
                        <div className="text-white font-bold mt-0.5">
                          {gpuCount}x {activeGpu.name} ({clusterMetrics.totalVramTB} TB VRAM)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400">Rate</div>
                        <div className="text-emerald-400 font-bold mt-0.5">
                          ${clusterMetrics.totalHourly.toFixed(2)}/hr
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Cluster Hostname Prefix
                      </label>
                      <input
                        type="text"
                        value={clusterNameInput}
                        onChange={(e) => setClusterNameInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Target Data Center Region
                      </label>
                      <select
                        value={modalRegion}
                        onChange={(e) => setModalRegion(e.target.value as RegionId)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      >
                        {REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.pue} ({r.availableGpus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        SSH Key Name & Ed25519 Public Key
                      </label>
                      <input
                        type="text"
                        value={sshKeyName}
                        onChange={(e) => setSshKeyName(e.target.value)}
                        className="w-full px-3 py-1.5 mb-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300"
                      />
                      <textarea
                        rows={2}
                        value={sshPublicKey}
                        onChange={(e) => setSshPublicKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300"
                      />
                    </div>

                    <button
                      onClick={() => setProvisionSuccess(true)}
                      className="w-full py-3 rounded-xl font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Launch Bare-Metal Nodes Now (45s Boot)
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function $Format(val: number): string {
  return `$${val.toFixed(2)}`;
}
