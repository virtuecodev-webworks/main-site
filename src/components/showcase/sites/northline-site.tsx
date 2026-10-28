'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Layers,
  Sun,
  Flame,
  Check,
  ArrowUpRight,
  ArrowRight,
  Sliders,
  Maximize2,
  ShieldCheck,
  Calendar,
  MapPin,
  Download,
  X,
  Sparkles,
  Home,
  Cpu,
  Clock,
  FileCheck2,
  Eye,
  Grid,
  DollarSign,
  ChevronRight,
  Building2,
  TreePine,
} from 'lucide-react';

interface CabinModel {
  id: 'n01' | 'n02' | 'n03';
  code: string;
  name: string;
  fullName: string;
  areaSqm: number;
  areaSqft: number;
  basePrice: number;
  bedrooms: string;
  bathrooms: string;
  craneDays: string;
  dimensionsM: string;
  rValue: string;
  leadTimeWeeks: number;
  description: string;
  exteriorImg: string;
  interiorImg: string;
  rooms: {
    id: string;
    name: string;
    dim: string;
    sqm: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
}

interface CladdingOption {
  id: 'charred-cedar' | 'nordic-larch' | 'matte-zinc';
  name: string;
  subtitle: string;
  priceDelta: number;
  swatchHex: string;
  accentHex: string;
  origin: string;
  lifespan: string;
  glazingSpec: string;
}

const CABIN_MODELS: CabinModel[] = [
  {
    id: 'n01',
    code: 'N-01',
    name: 'N-01 Solo Backyard Studio',
    fullName: 'N-01 Solo Backyard Studio (42 m² · $118,000)',
    areaSqm: 42,
    areaSqft: 452,
    basePrice: 118000,
    bedrooms: 'Studio +Murphy Suite',
    bathrooms: '1 Wet-Room Bath',
    craneDays: '1 Day Crane Set',
    dimensionsM: '8.4m × 5.0m × 3.4m',
    rValue: 'R-42 Roof / R-36 Wall',
    leadTimeWeeks: 10,
    description:
      'Engineered as an autonomous writer’s sanctuary, executive backyard office, or high-yield architectural guest suite. Delivered as two precision CLT volumetric modules.',
    exteriorImg:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1500&q=85',
    interiorImg:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=85',
    rooms: [
      { id: 'living', name: 'Living / Dining', dim: '4.6m × 4.2m', sqm: 19.3, x: 40, y: 40, w: 230, h: 190 },
      { id: 'suite', name: 'Primary Suite', dim: '3.2m × 2.8m', sqm: 9.0, x: 270, y: 40, w: 150, h: 115 },
      { id: 'bath', name: 'Bath & Sauna', dim: '3.2m × 1.8m', sqm: 5.8, x: 270, y: 155, w: 150, h: 75 },
      { id: 'deck', name: 'Covered Deck', dim: '8.4m × 1.6m', sqm: 7.9, x: 40, y: 230, w: 380, h: 65 },
    ],
  },
  {
    id: 'n02',
    code: 'N-02',
    name: 'N-02 Courtyard Residence',
    fullName: 'N-02 Courtyard Residence (88 m² · $215,000)',
    areaSqm: 88,
    areaSqft: 947,
    basePrice: 215000,
    bedrooms: '1 Primary + Study Alcove',
    bathrooms: '1.5 Architectural Baths',
    craneDays: '2 Days Crane Set',
    dimensionsM: '14.2m × 6.2m × 3.6m',
    rValue: 'R-44 Roof / R-38 Wall',
    leadTimeWeeks: 12,
    description:
      'Our signature single-family pavilion wrapped around a sheltered cantilevered deck. Features floor-to-ceiling triple-glazed Schüco sliders and integrated Gaggenau culinary island.',
    exteriorImg:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1500&q=85',
    interiorImg:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85',
    rooms: [
      { id: 'living', name: 'Living / Dining', dim: '7.4m × 5.2m', sqm: 38.5, x: 35, y: 35, w: 235, h: 185 },
      { id: 'suite', name: 'Primary Suite', dim: '4.8m × 4.2m', sqm: 20.2, x: 270, y: 35, w: 175, h: 115 },
      { id: 'bath', name: 'Bath & Sauna', dim: '4.8m × 2.6m', sqm: 12.5, x: 270, y: 150, w: 175, h: 70 },
      { id: 'deck', name: 'Covered Deck', dim: '11.2m × 2.4m', sqm: 16.8, x: 35, y: 220, w: 410, h: 75 },
    ],
  },
  {
    id: 'n03',
    code: 'N-03',
    name: 'N-03 Alpine Two-Bedroom Pavilion',
    fullName: 'N-03 Alpine Two-Bedroom Pavilion (134 m² · $310,000)',
    areaSqm: 134,
    areaSqft: 1442,
    basePrice: 310000,
    bedrooms: '2 King Suites + Bunk Loft',
    bathrooms: '2 Full Spa Baths',
    craneDays: '3 Days Crane Set',
    dimensionsM: '18.6m × 7.2m × 3.9m',
    rValue: 'R-48 Extreme Alpine Envelope',
    leadTimeWeeks: 14,
    description:
      'Designed for high-altitude snow loads and coastal wind shear. Dual private bedroom wings flank a soaring 3.9-meter acoustic spruce hearth hall and panoramic cedar terrace.',
    exteriorImg:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1500&q=85',
    interiorImg:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=85',
    rooms: [
      { id: 'living', name: 'Living / Dining', dim: '9.2m × 6.0m', sqm: 55.2, x: 30, y: 30, w: 245, h: 190 },
      { id: 'suite', name: 'Primary Suite', dim: '6.4m × 5.4m', sqm: 34.6, x: 275, y: 30, w: 185, h: 118 },
      { id: 'bath', name: 'Bath & Sauna', dim: '6.4m × 3.2m', sqm: 20.5, x: 275, y: 148, w: 185, h: 72 },
      { id: 'deck', name: 'Covered Deck', dim: '15.0m × 2.8m', sqm: 23.7, x: 30, y: 220, w: 430, h: 80 },
    ],
  },
];

const CLADDING_OPTIONS: CladdingOption[] = [
  {
    id: 'charred-cedar',
    name: 'Charred Japanese Cedar (Shou Sugi Ban)',
    subtitle: 'Kiln-carbonized cypress board · UV, rot & ember resistant',
    priceDelta: 0,
    swatchHex: '#1C1B1A',
    accentHex: '#C67D4E',
    origin: 'Milled & charred in Västerbotten',
    lifespan: '80+ Year Maintenance-Free',
    glazingSpec: 'Triple-glazed low-E argon anodized black aluminum frames',
  },
  {
    id: 'nordic-larch',
    name: 'Nordic Larch Natural',
    subtitle: 'Heartwood Siberian/Nordic Larch treated with SiOO:X silicate shield',
    priceDelta: 6500,
    swatchHex: '#C49A6C',
    accentHex: '#8C6239',
    origin: 'FSC 100% Certified Lapland Forestry',
    lifespan: '65+ Year Silver-Patina Weathering',
    glazingSpec: 'Triple-glazed warm bronze-anodized timber-curtain mullions',
  },
  {
    id: 'matte-zinc',
    name: 'Matte Zinc Standing Seam',
    subtitle: 'Pre-weathered titanium-zinc architectural skin with concealed fasteners',
    priceDelta: 14000,
    swatchHex: '#4A525A',
    accentHex: '#7A8691',
    origin: 'Rheinzink Architectural Grade (1.0mm)',
    lifespan: '100+ Year Self-Healing Patina',
    glazingSpec: 'Triple-glazed Schüco structural flush-glass curtain wall',
  },
];

const TURNKEY_STEPS = [
  {
    step: '01',
    phase: 'WEEK 01–02',
    title: 'Site Assessment',
    subtitle: 'LiDAR Drone Topography & Helical Pile Soil Engineering',
    description:
      'Our regional structural team conducts 3D LiDAR laser scanning of your parcel, evaluates crane staging access, and maps solar azimuth orientation without disturbing existing root systems.',
    deliverable: 'Stamped Geotechnical & Crane Path Dossier',
  },
  {
    step: '02',
    phase: 'WEEK 03–06',
    title: 'Permitting',
    subtitle: 'Pre-Approved State ADU & Modular Structural Stamps',
    description:
      'Northline handles 100% of municipal zoning, Title-24 / Eurocode energy compliance, and building department submissions using our pre-certified state modular engineering library.',
    deliverable: 'Full Municipal Building Permit & Utility Interconnect',
  },
  {
    step: '03',
    phase: 'WEEK 07–11',
    title: 'Factory Precision Milling',
    subtitle: '5-Axis CNC Cross-Laminated Timber Joinery (±0.3mm Tolerance)',
    description:
      'While helical screw piles or stem walls are installed on your site in 72 hours, your residence is milled indoors at our climate-controlled Scandinavian & Pacific NW timber works.',
    deliverable: 'ISO-9001 Factory Quality & Air-Tightness Pressure Certificate',
  },
  {
    step: '04',
    phase: 'WEEK 12 · DAY 01–03',
    title: 'Crane Delivery',
    subtitle: 'Volumetric Rigging & Weather-Tight Envelope Lock',
    description:
      'Modules arrive on air-ride flatbeds and are hoisted onto precision steel leveling plates via all-terrain hydraulic crane. The structure is weather-tight before sunset on Day 1.',
    deliverable: 'Structural Torque & Thermal Imaging Verification',
  },
  {
    step: '05',
    phase: 'WEEK 14 · DAY 14',
    title: 'Key Handover',
    subtitle: 'Commissioned Gaggenau Appliances, Solar Microgrid & Sauna',
    description:
      'Final architectural trim, hydronic floor heating balancing, Tesla Powerwall commissioning, and white-glove walkthrough. Walk in with your luggage on Day 14.',
    deliverable: '25-Year Structural CLT Warranty & Smart Home Passport',
  },
];

const COMPLETED_PROJECTS = [
  {
    id: 'stockholm-archipelago',
    title: 'Ingarö Granite Point Pavilion',
    location: 'STOCKHOLM ARCHIPELAGO, SWEDEN',
    model: 'N-03 Alpine Pavilion (134 m²)',
    cladding: 'Charred Japanese Cedar',
    installTime: '11 Days Total On-Site',
    foundation: 'Zero-Concrete Helical Rock Anchors',
    image:
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'sonoma-redwoods',
    title: 'Sea Ranch Ridge Studio & Sauna',
    location: 'SONOMA COAST, CALIFORNIA',
    model: 'N-02 Courtyard Residence (88 m²)',
    cladding: 'Nordic Larch Natural + Solar',
    installTime: '14 Days Turnkey',
    foundation: 'Pier & Beam Seismic Grade',
    image:
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'lofoten-fjord',
    title: 'Henningsvær Arctic Horizon Cabin',
    location: 'LOFOTEN ISLANDS, NORWAY',
    model: 'N-02 Courtyard Residence (88 m²)',
    cladding: 'Matte Zinc Standing Seam',
    installTime: '12 Days Turnkey',
    foundation: 'Galvanized Steel Bedrock Pins',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85',
  },
];

export function NorthlineStudioSite() {
  // Configurator State (Steps 1–4)
  const [selectedModelId, setSelectedModelId] = useState<CabinModel['id']>('n02');
  const [selectedCladdingId, setSelectedCladdingId] =
    useState<CladdingOption['id']>('charred-cedar');
  const [includeBirchGaggenau, setIncludeBirchGaggenau] = useState(true);
  const [includeSolarPowerwall, setIncludeSolarPowerwall] = useState(true);
  const [includeSaunaModule, setIncludeSaunaModule] = useState(false);

  // Visual Stage Mode: Exterior Render | Interior Render | Interactive SVG Blueprint
  const [stageView, setStageView] = useState<'exterior' | 'interior' | 'blueprint'>('exterior');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('living');

  // Cash vs Financing Calculator State
  const [paymentMode, setPaymentMode] = useState<'cash' | 'finance'>('finance');
  const [downPaymentPct, setDownPaymentPct] = useState<20 | 30>(20);

  // Modals: Reserve Build Slot Spec Sheet & Book Private Viewing
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reserveSubmitted, setReserveSubmitted] = useState(false);
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [viewingSubmitted, setViewingSubmitted] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('Soren Lindholm');
  const [clientEmail, setClientEmail] = useState('soren@lindholm-arch.se');
  const [siteLocation, setSiteLocation] = useState('Hudson Valley, NY / Parcel 14B');
  const [viewingLocation, setViewingLocation] = useState('Sonoma Coast Showroom (CA)');
  const [viewingDate, setViewingDate] = useState('Saturday, Nov 14 · 11:00 AM');

  // Active Timeline Step
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(2);

  const activeModel = useMemo(
    () => CABIN_MODELS.find((m) => m.id === selectedModelId) || CABIN_MODELS[1],
    [selectedModelId]
  );

  const activeCladding = useMemo(
    () => CLADDING_OPTIONS.find((c) => c.id === selectedCladdingId) || CLADDING_OPTIONS[0],
    [selectedCladdingId]
  );

  // Calculate total configured price & monthly financing
  const solarPrice = includeSolarPowerwall ? 24000 : 0;
  const saunaPrice = includeSaunaModule ? 16000 : 0;
  const totalConfiguredPrice =
    activeModel.basePrice + activeCladding.priceDelta + solarPrice + saunaPrice;

  // Monthly payment formula (15 years = 180 months, 5.49% APR architectural green construction loan)
  const monthlyPayment = useMemo(() => {
    const principal = totalConfiguredPrice * (1 - downPaymentPct / 100);
    const monthlyRate = 0.0549 / 12;
    const months = 180; // 15 yrs
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  }, [totalConfiguredPrice, downPaymentPct]);

  const activeRoom =
    activeModel.rooms.find((r) => r.id === selectedRoomId) || activeModel.rooms[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F1EC] text-[#161816] selection:bg-[#233329] selection:text-white font-sans antialiased">
      {/* 1. STICKY ARCHITECTURAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#F3F1EC]/95 backdrop-blur-md border-b border-[#161816]/15">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Minimalist Architectural Mark + NORTHLINE */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#161816] text-[#F3F1EC] flex items-center justify-center">
              <svg
                viewBox="0 0 32 32"
                className="w-6 h-6 stroke-current fill-none"
                strokeWidth="2"
              >
                <path d="M4 26 L16 6 L28 26" />
                <path d="M10 26 L16 15 L22 26" />
                <line x1="2" y1="26" x2="30" y2="26" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold tracking-[0.22em] text-[#161816]">
                  NORTHLINE
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-[#233329] text-[#E6E3DC] font-mono text-[9px] uppercase tracking-widest">
                  CLT PREFAB
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-[#5C605B] hidden sm:block">
                VÄSTERBOTTEN · OSLO · SAN FRANCISCO
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono uppercase tracking-widest text-[#373B37]">
            <button
              onClick={() => scrollToSection('northline-configurator')}
              className="hover:text-[#161816] transition-colors"
            >
              Models
            </button>
            <button
              onClick={() => {
                setStageView('exterior');
                scrollToSection('northline-configurator');
              }}
              className="hover:text-[#161816] transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B86B35]" />
              <span>3D Configurator</span>
            </button>
            <button
              onClick={() => {
                setStageView('blueprint');
                scrollToSection('northline-configurator');
              }}
              className="hover:text-[#161816] transition-colors"
            >
              Floorplans
            </button>
            <button
              onClick={() => scrollToSection('northline-process')}
              className="hover:text-[#161816] transition-colors"
            >
              Turnkey Process
            </button>
            <button
              onClick={() => {
                setPaymentMode('finance');
                scrollToSection('northline-configurator');
              }}
              className="hover:text-[#161816] transition-colors"
            >
              Financing
            </button>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setViewingSubmitted(false);
                setViewingModalOpen(true);
              }}
              className="px-4 py-2.5 border border-[#161816]/30 hover:border-[#161816] text-xs font-mono uppercase tracking-wider text-[#161816] transition-colors"
            >
              Book Private Viewing
            </button>
            <button
              onClick={() => scrollToSection('northline-configurator')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-[#161816] hover:bg-[#233329] text-[#F3F1EC] text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <span>Configure Yours</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FULL-BLEED NORDIC ARCHITECTURAL HERO */}
      <section className="relative bg-[#111412] text-[#F3F1EC] overflow-hidden border-b border-[#161816]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85"
            alt="Northline CLT Modular Residence in Nordic Forest"
            className="w-full h-full object-cover opacity-55 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111412] via-[#111412]/50 to-transparent" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E5DFD3] mb-6">
              <TreePine className="w-3.5 h-3.5 text-[#D48C56]" />
              <span>SCANDINAVIAN CROSS-LAMINATED TIMBER ARCHITECTURE</span>
            </div>

            <h1 className="font-sans text-4xl sm:text-6xl lg:text-[68px] font-light tracking-tight leading-[1.04] text-white mb-6">
              Milled in Lapland.{' '}
              <span className="font-normal text-[#E5DFD3]">
                Craned onto your land in 14 days.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#D0CCC2] font-light leading-relaxed max-w-2xl mb-10">
              Precision robotic mass-timber residences and autonomous backyard studios. Engineered
              to passive-house thermal standards with zero on-site concrete pouring.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollToSection('northline-configurator')}
                className="px-6 py-4 bg-[#D48C56] hover:bg-[#c07a45] text-[#111412] font-mono text-xs uppercase tracking-widest font-bold transition-colors inline-flex items-center gap-2.5"
              >
                <span>Launch 3D Studio Configurator</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setStageView('blueprint');
                  scrollToSection('northline-configurator');
                }}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2"
              >
                <Grid className="w-4 h-4 text-[#D48C56]" />
                <span>Inspect Blueprints & Specs</span>
              </button>
            </div>
          </div>

          {/* Hero Bottom Architectural Spec Strip */}
          <div className="mt-16 pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-[#161A17]/85 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#D48C56] mb-1">
                <span>THERMAL PERFORMANCE</span>
                <span>PASSIVE CERTIFIED</span>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-white">R-42 Thermal Envelope</p>
              <p className="text-xs text-[#A9A69E] mt-1">
                240mm wood-fiber insulation + triple-glazed argon Schüco curtain walls rated to −35°C.
              </p>
            </div>

            <div className="p-5 bg-[#161A17]/85 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#D48C56] mb-1">
                <span>RAPID DEPLOYMENT</span>
                <span>ZERO SITE MESS</span>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-white">14-Day Crane Installation</p>
              <p className="text-xs text-[#A9A69E] mt-1">
                Set onto removable helical earth screws in 48 hours; commissioned and handover-ready in 2 weeks.
              </p>
            </div>

            <div className="p-5 bg-[#161A17]/85 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[#D48C56] mb-1">
                <span>OFF-GRID AUTONOMY</span>
                <span>ISLANDING CAPABLE</span>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-white">Net-Zero Solar Ready</p>
              <p className="text-xs text-[#A9A69E] mt-1">
                Flush-integrated 12kW architectural solar roof array paired with dual Tesla Powerwall 3 storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 4-STEP CABIN CONFIGURATOR & BLUEPRINT VIEWER */}
      <section id="northline-configurator" className="py-16 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#161816]/15">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#B86B35] font-semibold mb-2">
              ARCHITECTURAL CONFIGURATOR & CAD BLUEPRINT ENGINE
            </p>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-[#161816]">
              Configure Your Northline Residence
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#5C605B]">
            <span>TOLERANCE: ±0.3MM CNC</span>
            <span>·</span>
            <span>STRUCTURAL WARRANTY: 25 YRS</span>
            <span>·</span>
            <span className="text-[#161816] font-semibold">Q1 2027 BUILD SLOTS OPEN</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT 7 COLUMNS: INTERACTIVE VISUAL STAGE (EXTERIOR / INTERIOR / SVG BLUEPRINT) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-5">
            {/* Stage View Switcher Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#E6E3DC] p-2 border border-[#161816]/15">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setStageView('exterior')}
                  className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                    stageView === 'exterior'
                      ? 'bg-[#161816] text-white font-semibold'
                      : 'text-[#373B37] hover:bg-black/5'
                  }`}
                >
                  01. Exterior Photo Render
                </button>
                <button
                  onClick={() => setStageView('interior')}
                  className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                    stageView === 'interior'
                      ? 'bg-[#161816] text-white font-semibold'
                      : 'text-[#373B37] hover:bg-black/5'
                  }`}
                >
                  02. Interior Living Render
                </button>
                <button
                  onClick={() => setStageView('blueprint')}
                  className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    stageView === 'blueprint'
                      ? 'bg-[#233329] text-white font-semibold'
                      : 'text-[#373B37] hover:bg-black/5'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-[#D48C56]" />
                  <span>03. Interactive SVG Floorplan</span>
                </button>
              </div>

              <span className="hidden sm:inline font-mono text-[11px] text-[#5C605B] pr-2">
                {activeModel.code} · {activeModel.areaSqm} m² ({activeModel.areaSqft} sq ft)
              </span>
            </div>

            {/* Stage Viewport */}
            <div className="relative bg-[#161816] border border-[#161816]/25 overflow-hidden min-h-[430px] sm:min-h-[500px] flex flex-col justify-between">
              {stageView === 'exterior' && (
                <div className="relative w-full h-[430px] sm:h-[500px]">
                  <img
                    src={activeModel.exteriorImg}
                    alt={activeModel.name}
                    className="w-full h-full object-cover opacity-90 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111412] via-transparent to-black/30" />

                  {/* Live Cladding & Off-Grid Hardware Overlay Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-[#111412]/85 backdrop-blur-md border border-white/15 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/40"
                        style={{ backgroundColor: activeCladding.swatchHex }}
                      />
                      <span>CLADDING: {activeCladding.name}</span>
                    </span>
                    {includeSolarPowerwall && (
                      <span className="px-3 py-1.5 bg-[#233329]/90 backdrop-blur-md border border-[#D48C56]/40 text-[#F3F1EC] font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-[#D48C56]" />
                        <span>12kW SOLAR + POWERWALL ACTIVE</span>
                      </span>
                    )}
                    {includeSaunaModule && (
                      <span className="px-3 py-1.5 bg-[#B86B35]/90 backdrop-blur-md text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        <span>WOOD-FIRED SAUNA MODULE</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Spec Bar inside Render */}
                  <div className="absolute bottom-4 inset-x-4 p-4 bg-[#111412]/90 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#D48C56]">
                        {activeModel.code} ARCHITECTURAL EXTERIOR ELEVATION
                      </p>
                      <p className="text-lg font-light">{activeModel.name}</p>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div>
                        <span className="text-[#8E948E] block text-[10px]">DIMENSIONS</span>
                        <span>{activeModel.dimensionsM}</span>
                      </div>
                      <div>
                        <span className="text-[#8E948E] block text-[10px]">ENVELOPE</span>
                        <span>{activeModel.rValue}</span>
                      </div>
                      <button
                        onClick={() => setStageView('blueprint')}
                        className="px-3 py-1.5 bg-[#D48C56] text-[#111412] font-semibold uppercase tracking-wider text-[11px]"
                      >
                        View CAD Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {stageView === 'interior' && (
                <div className="relative w-full h-[430px] sm:h-[500px]">
                  <img
                    src={activeModel.interiorImg}
                    alt={`${activeModel.name} Interior`}
                    className="w-full h-full object-cover opacity-90 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111412] via-transparent to-black/30" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-[#111412]/85 backdrop-blur-md border border-white/15 text-white font-mono text-xs uppercase tracking-wider">
                      INTERIOR: NORDIC BIRCH ACOUSTIC SLATS + GAGGENAU 400 SERIES
                    </span>
                  </div>

                  <div className="absolute bottom-4 inset-x-4 p-4 bg-[#111412]/90 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#D48C56]">
                        INTERIOR MILLWORK & GLAZING SPECIFICATION
                      </p>
                      <p className="text-sm text-[#E5DFD3]">{activeCladding.glazingSpec}</p>
                    </div>
                    <button
                      onClick={() => setStageView('blueprint')}
                      className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-mono uppercase tracking-wider text-[11px]"
                    >
                      Inspect Room Dimensions →
                    </button>
                  </div>
                </div>
              )}

              {stageView === 'blueprint' && (
                <div className="p-6 sm:p-8 bg-[#18221C] text-[#E6E3DC] h-full min-h-[500px] flex flex-col justify-between">
                  {/* Top CAD Title Block */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15 font-mono text-xs">
                    <div>
                      <span className="text-[#D48C56] font-bold">
                        CAD SHEET A-101 · {activeModel.code} VOLUMETRIC FLOORPLAN
                      </span>
                      <span className="text-white/60 ml-3">SCALE 1:50 · UNITS: METRIC (M)</span>
                    </div>
                    <div className="text-[11px] text-white/75">
                      CLICK ANY ZONE TO INSPECT DIMENSIONS
                    </div>
                  </div>

                  {/* Interactive SVG Architectural Blueprint */}
                  <div className="my-4 relative flex items-center justify-center bg-[#121A15] border border-white/15 p-4">
                    <svg
                      viewBox="0 0 500 330"
                      className="w-full max-h-[310px] select-none"
                      role="img"
                      aria-label={`${activeModel.name} interactive architectural blueprint`}
                    >
                      {/* Subtle CAD Grid Background */}
                      <defs>
                        <pattern
                          id="northline-cad-grid"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="0.75"
                          />
                        </pattern>
                      </defs>
                      <rect width="500" height="330" fill="url(#northline-cad-grid)" />

                      {/* North Arrow & Dimension Callout */}
                      <g transform="translate(465, 35)">
                        <circle
                          cx="0"
                          cy="0"
                          r="14"
                          fill="none"
                          stroke="rgba(212,140,86,0.6)"
                          strokeWidth="1"
                        />
                        <path d="M0 -10 L4 6 L0 2 L-4 6 Z" fill="#D48C56" />
                        <text
                          x="0"
                          y="-17"
                          textAnchor="middle"
                          fill="#D48C56"
                          fontSize="8"
                          fontFamily="monospace"
                        >
                          N
                        </text>
                      </g>

                      {/* Render Interactive Rooms */}
                      {activeModel.rooms.map((room) => {
                        const isSelected = room.id === activeRoom.id;
                        const isSaunaZone = room.id === 'bath' && includeSaunaModule;
                        return (
                          <g
                            key={room.id}
                            onClick={() => setSelectedRoomId(room.id)}
                            className="cursor-pointer transition-opacity"
                          >
                            <rect
                              x={room.x}
                              y={room.y}
                              width={room.w}
                              height={room.h}
                              fill={
                                isSelected
                                  ? 'rgba(212, 140, 86, 0.25)'
                                  : isSaunaZone
                                  ? 'rgba(184, 107, 53, 0.16)'
                                  : 'rgba(255, 255, 255, 0.04)'
                              }
                              stroke={isSelected ? '#D48C56' : 'rgba(255,255,255,0.55)'}
                              strokeWidth={isSelected ? '2.5' : '1.25'}
                            />

                            {/* Architectural Door / Glazing ticks */}
                            <line
                              x1={room.x + 12}
                              y1={room.y}
                              x2={room.x + room.w - 12}
                              y2={room.y}
                              stroke="#D48C56"
                              strokeWidth="2"
                              strokeDasharray="6 3"
                            />

                            <text
                              x={room.x + room.w / 2}
                              y={room.y + room.h / 2 - 6}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="11"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {room.name.toUpperCase()}
                            </text>
                            <text
                              x={room.x + room.w / 2}
                              y={room.y + room.h / 2 + 10}
                              textAnchor="middle"
                              fill="#D48C56"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {room.dim} ({room.sqm} m²)
                            </text>
                            {isSaunaZone && (
                              <text
                                x={room.x + room.w / 2}
                                y={room.y + room.h / 2 + 23}
                                textAnchor="middle"
                                fill="#F5B076"
                                fontSize="8.5"
                                fontFamily="monospace"
                              >
                                + HARVIA WOOD SAUNA STOVE
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Solar Roof Array Dashed Overlay if active */}
                      {includeSolarPowerwall && (
                        <g>
                          <rect
                            x="32"
                            y="26"
                            width="425"
                            height="18"
                            fill="rgba(212,140,86,0.18)"
                            stroke="#D48C56"
                            strokeDasharray="4 2"
                          />
                          <text
                            x="245"
                            y="38"
                            textAnchor="middle"
                            fill="#F3F1EC"
                            fontSize="8.5"
                            fontFamily="monospace"
                          >
                            12KW INTEGRATED MONOCRYSTALLINE SOLAR ROOF + DUAL TESLA POWERWALL BUS
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Selected Room Inspector Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/15 font-mono text-xs">
                    {activeModel.rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-2.5 text-left border transition-colors ${
                          activeRoom.id === room.id
                            ? 'bg-[#D48C56]/20 border-[#D48C56] text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        <p className="text-[10px] uppercase text-[#D48C56]">{room.name}</p>
                        <p className="font-bold mt-0.5">{room.dim}</p>
                        <p className="text-[10px] opacity-75">{room.sqm} m² net area</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Architectural Specification Summary Strip under Stage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#E6E3DC] p-4 border border-[#161816]/15 font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#5C605B] block">FOOTPRINT AREA</span>
                <span className="font-bold text-[#161816]">
                  {activeModel.areaSqm} m² / {activeModel.areaSqft} ft²
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C605B] block">LAYOUT</span>
                <span className="font-bold text-[#161816]">{activeModel.bedrooms}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C605B] block">CRANE RIGGING</span>
                <span className="font-bold text-[#161816]">{activeModel.craneDays}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5C605B] block">FACTORY LEAD TIME</span>
                <span className="font-bold text-[#B86B35]">{activeModel.leadTimeWeeks} Weeks</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: 4-STEP CONFIGURATOR CONTROLS + CASH/FINANCE CALCULATOR */}
          <div className="lg:col-span-5 space-y-8 bg-[#FAF8F5] p-6 sm:p-8 border border-[#161816]/20">
            {/* STEP 1: SELECT MODEL */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B86B35] font-bold">
                  STEP 01 — SELECT ARCHITECTURAL MODEL
                </span>
                <span className="font-mono text-[11px] text-[#5C605B]">CLT VOLUMETRIC</span>
              </div>
              <div className="space-y-2.5">
                {CABIN_MODELS.map((model) => {
                  const selected = model.id === selectedModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`w-full p-4 text-left border transition-all ${
                        selected
                          ? 'bg-[#161816] text-white border-[#161816] shadow-md'
                          : 'bg-[#F3F1EC] text-[#161816] border-[#161816]/20 hover:border-[#161816]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="font-mono text-sm font-bold">{model.fullName}</span>
                        {selected && <Check className="w-4 h-4 text-[#D48C56] shrink-0" />}
                      </div>
                      <p
                        className={`text-xs leading-relaxed ${
                          selected ? 'text-[#D0CCC2]' : 'text-[#5C605B]'
                        }`}
                      >
                        {model.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: EXTERIOR CLADDING & GLAZING */}
            <div className="pt-6 border-t border-[#161816]/15">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B86B35] font-bold">
                  STEP 02 — EXTERIOR CLADDING & GLAZING
                </span>
                <span className="font-mono text-[11px] text-[#5C605B]">WEATHER ENVELOPE</span>
              </div>

              <div className="space-y-2.5">
                {CLADDING_OPTIONS.map((clad) => {
                  const selected = clad.id === selectedCladdingId;
                  return (
                    <button
                      key={clad.id}
                      onClick={() => setSelectedCladdingId(clad.id)}
                      className={`w-full p-3.5 text-left border transition-all flex items-start gap-3.5 ${
                        selected
                          ? 'bg-[#161816] text-white border-[#161816]'
                          : 'bg-[#F3F1EC] text-[#161816] border-[#161816]/20 hover:border-[#161816]'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-none border border-white/30 shrink-0 mt-0.5"
                        style={{ backgroundColor: clad.swatchHex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-mono text-xs font-bold">{clad.name}</span>
                          <span className="font-mono text-xs text-[#D48C56] shrink-0">
                            {clad.priceDelta === 0
                              ? 'Included'
                              : `+$${clad.priceDelta.toLocaleString()}`}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            selected ? 'text-[#D0CCC2]' : 'text-[#5C605B]'
                          }`}
                        >
                          {clad.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: INTERIOR PACKAGE & OFF-GRID SYSTEMS */}
            <div className="pt-6 border-t border-[#161816]/15">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B86B35] font-bold">
                  STEP 03 — INTERIOR & OFF-GRID SYSTEMS
                </span>
                <span className="font-mono text-[11px] text-[#5C605B]">FACTORY INTEGRATED</span>
              </div>

              <div className="space-y-2.5">
                {/* Package 1: Nordic Birch + Gaggenau Kitchen */}
                <div
                  onClick={() => setIncludeBirchGaggenau((prev) => !prev)}
                  className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    includeBirchGaggenau
                      ? 'bg-[#233329] text-white border-[#233329]'
                      : 'bg-[#F3F1EC] text-[#161816] border-[#161816]/20'
                  }`}
                >
                  <div>
                    <p className="font-mono text-xs font-bold">Nordic Birch + Gaggenau Kitchen</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        includeBirchGaggenau ? 'text-[#D0CCC2]' : 'text-[#5C605B]'
                      }`}
                    >
                      Bookmatched birch architectural cabinetry, induction cooktop & concealed refrigeration
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#D48C56] shrink-0">Included</span>
                </div>

                {/* Package 2: 12kW Roof Solar + Tesla Powerwall (+$24,000) */}
                <div
                  onClick={() => setIncludeSolarPowerwall((prev) => !prev)}
                  className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    includeSolarPowerwall
                      ? 'bg-[#233329] text-white border-[#233329]'
                      : 'bg-[#F3F1EC] text-[#161816] border-[#161816]/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#D48C56]" />
                      <p className="font-mono text-xs font-bold">
                        12kW Roof Solar + Tesla Powerwall (+$24,000)
                      </p>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        includeSolarPowerwall ? 'text-[#D0CCC2]' : 'text-[#5C605B]'
                      }`}
                    >
                      Flush standing-seam monocrystalline solar array + 27kWh off-grid battery storage
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#D48C56] shrink-0">
                    {includeSolarPowerwall ? 'Selected' : '+$24,000'}
                  </span>
                </div>

                {/* Package 3: Wood-Fired Sauna Module (+$16,000) */}
                <div
                  onClick={() => setIncludeSaunaModule((prev) => !prev)}
                  className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    includeSaunaModule
                      ? 'bg-[#233329] text-white border-[#233329]'
                      : 'bg-[#F3F1EC] text-[#161816] border-[#161816]/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#D48C56]" />
                      <p className="font-mono text-xs font-bold">
                        Wood-Fired Sauna Module (+$16,000)
                      </p>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        includeSaunaModule ? 'text-[#D0CCC2]' : 'text-[#5C605B]'
                      }`}
                    >
                      Thermo-aspen benches, Harvia Legend hearth stove & panoramic forest window
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#D48C56] shrink-0">
                    {includeSaunaModule ? 'Selected' : '+$16,000'}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 4: LIVE CASH VS MONTHLY FINANCING CALCULATOR & RESERVE SLOT */}
            <div className="pt-6 border-t-2 border-[#161816] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#161816] font-bold">
                  STEP 04 — VALUATION & FINANCING
                </span>
                <div className="flex border border-[#161816]/30 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`px-2.5 py-1 uppercase ${
                      paymentMode === 'cash'
                        ? 'bg-[#161816] text-white font-semibold'
                        : 'text-[#5C605B]'
                    }`}
                  >
                    Pay Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('finance')}
                    className={`px-2.5 py-1 uppercase ${
                      paymentMode === 'finance'
                        ? 'bg-[#161816] text-white font-semibold'
                        : 'text-[#5C605B]'
                    }`}
                  >
                    15-Yr Finance
                  </button>
                </div>
              </div>

              {paymentMode === 'cash' ? (
                <div className="p-4 bg-[#E6E3DC] border border-[#161816]/20">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase text-[#5C605B]">
                      TURNKEY CONFIGURED CASH PRICE
                    </span>
                    <span className="text-3xl font-light text-[#161816] font-mono">
                      ${totalConfiguredPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#5C605B] mt-1">
                    Includes factory CLT milling, Gaggenau package, and crane rigging.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-[#E6E3DC] border border-[#161816]/20 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#B86B35] font-bold block">
                        ESTIMATED MONTHLY PAYMENT (15 YRS · 5.49% APR)
                      </span>
                      <span className="text-xs font-mono text-[#5C605B]">
                        Total Configured: ${totalConfiguredPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-[#161816] font-mono">
                      ${monthlyPayment.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#161816]/15 font-mono text-[11px]">
                    <span>Down Payment ({downPaymentPct}%):</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDownPaymentPct(20)}
                        className={`px-2 py-0.5 border ${
                          downPaymentPct === 20
                            ? 'bg-[#161816] text-white border-[#161816]'
                            : 'border-[#161816]/30'
                        }`}
                      >
                        20% (${Math.round(totalConfiguredPrice * 0.2).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownPaymentPct(30)}
                        className={`px-2 py-0.5 border ${
                          downPaymentPct === 30
                            ? 'bg-[#161816] text-white border-[#161816]'
                            : 'border-[#161816]/30'
                        }`}
                      >
                        30%
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setReserveSubmitted(false);
                  setReserveModalOpen(true);
                }}
                className="w-full py-4 bg-[#161816] hover:bg-[#233329] text-white font-mono text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>Reserve Build Slot & Generate Spec Sheet</span>
                <ArrowUpRight className="w-4 h-4 text-[#D48C56]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 5-STEP TURNKEY DELIVERY TIMELINE */}
      <section id="northline-process" className="py-16 lg:py-24 bg-[#161816] text-[#F3F1EC] border-y border-[#161816]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#D48C56] mb-2">
                SINGLE-POINT ARCHITECTURAL ACCOUNTABILITY
              </p>
              <h2 className="text-3xl sm:text-5xl font-light text-white">
                5-Step Turnkey Delivery Timeline
              </h2>
            </div>
            <p className="text-sm text-[#A9A69E] max-w-md font-mono">
              From LiDAR drone site scan to key handover in 14 weeks—with only 14 days of quiet
              on-site crane assembly.
            </p>
          </div>

          {/* 5-Step Interactive Horizontal Selector */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TURNKEY_STEPS.map((item, idx) => {
              const isActive = idx === activeTimelineIdx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveTimelineIdx(idx)}
                  className={`p-6 border cursor-pointer transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#233329] border-[#D48C56] text-white'
                      : 'bg-[#1D201D] border-white/10 text-[#A9A69E] hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs mb-4">
                      <span className="text-[#D48C56] font-bold">STEP {item.step}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-black/30">{item.phase}</span>
                    </div>
                    <h3 className="text-xl font-normal text-white mb-1.5">{item.title}</h3>
                    <p className="font-mono text-[11px] text-[#D48C56] mb-3">{item.subtitle}</p>
                    <p className="text-xs leading-relaxed text-[#D0CCC2] mb-6">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 font-mono text-[10px] uppercase tracking-wider text-white/80">
                    DELIVERABLE: {item.deliverable}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. COMPLETED PROJECTS GALLERY */}
      <section className="py-16 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#B86B35] font-semibold mb-2">
              COMMISSIONED FIELD ARCHIVE
            </p>
            <h2 className="text-3xl sm:text-5xl font-light text-[#161816]">
              Completed Northline Residences
            </h2>
          </div>
          <button
            onClick={() => {
              setViewingSubmitted(false);
              setViewingModalOpen(true);
            }}
            className="px-5 py-3 bg-[#161816] text-white font-mono text-xs uppercase tracking-widest hover:bg-[#233329] transition-colors self-start sm:self-auto"
          >
            Schedule Private Tour of a Residence
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {COMPLETED_PROJECTS.map((proj) => (
            <div
              key={proj.id}
              className="group bg-[#FAF8F5] border border-[#161816]/20 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-72 overflow-hidden bg-[#161816]">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#161816]/85 text-white font-mono text-[10px] uppercase tracking-widest">
                    {proj.location}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-light text-[#161816] mb-4">{proj.title}</h3>
                  <div className="space-y-2 font-mono text-xs border-t border-[#161816]/15 pt-4">
                    <div className="flex justify-between">
                      <span className="text-[#5C605B]">CONFIGURATION:</span>
                      <span className="font-semibold text-[#161816]">{proj.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C605B]">EXTERIOR SKIN:</span>
                      <span className="text-[#161816]">{proj.cladding}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C605B]">FOUNDATION:</span>
                      <span className="text-[#161816]">{proj.foundation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5C605B]">ON-SITE ASSEMBLY:</span>
                      <span className="font-bold text-[#B86B35]">{proj.installTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FULL ARCHITECTURAL STUDIO FOOTER */}
      <footer className="bg-[#111412] text-[#D0CCC2] border-t border-white/15">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D48C56] text-[#111412] flex items-center justify-center font-mono font-bold">
                  N
                </div>
                <span className="font-mono text-lg font-bold tracking-[0.22em] text-white">
                  NORTHLINE ARCHITECTURAL PREFAB
                </span>
              </div>
              <p className="text-sm text-[#9E9B93] max-w-md leading-relaxed">
                Precision cross-laminated timber residences and autonomous backyard studios.
                FSC-certified Nordic forestry, Hundegger 5-axis CNC joinery, and 14-day crane
                installation across North America and Northern Europe.
              </p>
              <p className="font-mono text-xs text-[#D48C56]">
                LIC. MODULAR MANUFACTURER #NL-88410 · ISO 14001 NET-ZERO TIMBER WORKS
              </p>
            </div>

            <div className="lg:col-span-4 space-y-3 font-mono text-xs">
              <p className="text-white uppercase tracking-widest font-bold">
                TIMBER WORKS & VIEWING PAVILIONS
              </p>
              <div className="space-y-2 text-[#9E9B93]">
                <p>
                  <strong className="text-white">SWEDEN FACTORY:</strong> Skellefteå Timber Port,
                  Västerbotten
                </p>
                <p>
                  <strong className="text-white">US WEST SHOWROOM:</strong> Sausalito & Sonoma
                  Coast, California
                </p>
                <p>
                  <strong className="text-white">US EAST PAVILION:</strong> Rhinebeck, Hudson
                  Valley, New York
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <p className="font-mono text-xs text-white uppercase tracking-widest font-bold">
                PRIVATE ARCHITECTURAL CONSULTATION
              </p>
              <p className="text-xs text-[#9E9B93] leading-relaxed">
                Speak with a Northline site engineer to run a complimentary LiDAR parcel feasibility
                check on your property.
              </p>
              <button
                onClick={() => {
                  setViewingSubmitted(false);
                  setViewingModalOpen(true);
                }}
                className="w-full py-3 bg-[#D48C56] hover:bg-[#c07a45] text-[#111412] font-mono text-xs uppercase tracking-widest font-bold transition-colors"
              >
                Book Private Viewing
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#78756E]">
            <p>© 2026 NORTHLINE ARCHITECTURAL PREFAB AB & INC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <span>EUROCODE 5 / IBC STAMPED</span>
              <span>·</span>
              <span>PASSIVE HOUSE INSTITUTE CERTIFIED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. RESERVE BUILD SLOT & DOWNLOADABLE SPEC SHEET MODAL */}
      <AnimatePresence>
        {reserveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setReserveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#F3F1EC] text-[#161816] border-2 border-[#161816] shadow-2xl overflow-hidden my-8"
            >
              <div className="px-6 py-4 bg-[#161816] text-white flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D48C56]">
                    NORTHLINE PRODUCTION QUEUE · SPECIFICATION DOSSIER
                  </p>
                  <h4 className="text-lg font-mono font-bold">
                    {reserveSubmitted
                      ? `SPEC SHEET GENERATED: ${activeModel.code}-2026-CLT`
                      : `Reserve Q1 Build Slot — ${activeModel.name}`}
                  </h4>
                </div>
                <button
                  onClick={() => setReserveModalOpen(false)}
                  className="p-1 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Architectural Spec Sheet Summary Box (Always visible) */}
                <div className="p-5 bg-white border border-[#161816]/25 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#161816]/15 pb-2">
                    <span className="font-bold text-[#B86B35]">
                      ARCHITECTURAL BUILD SHEET #NL-{activeModel.code}-409
                    </span>
                    <span>LEAD TIME: {activeModel.leadTimeWeeks} WEEKS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[#5C605B]">MODEL:</span>{' '}
                      <strong>{activeModel.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[#5C605B]">DIMENSIONS:</span> {activeModel.dimensionsM}
                    </div>
                    <div>
                      <span className="text-[#5C605B]">CLADDING:</span> {activeCladding.name}
                    </div>
                    <div>
                      <span className="text-[#5C605B]">SOLAR + POWERWALL:</span>{' '}
                      {includeSolarPowerwall ? 'Included (+$24,000)' : 'Not Selected'}
                    </div>
                    <div>
                      <span className="text-[#5C605B]">SAUNA MODULE:</span>{' '}
                      {includeSaunaModule ? 'Wood-Fired Sauna (+$16,000)' : 'Standard Spa Bath'}
                    </div>
                    <div>
                      <span className="text-[#5C605B]">CONFIGURED TOTAL:</span>{' '}
                      <strong className="text-[#161816]">
                        ${totalConfiguredPrice.toLocaleString()} (${monthlyPayment.toLocaleString()}
                        /mo)
                      </strong>
                    </div>
                  </div>
                </div>

                {reserveSubmitted ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#233329] text-white font-mono text-xs flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#D48C56] shrink-0" />
                      <div>
                        <p className="font-bold">
                          PRODUCTION SLOT PRIORITY LOCKED FOR {clientName.toUpperCase()}
                        </p>
                        <p className="text-white/80 mt-0.5">
                          CAD Dossier & LiDAR Site Assessment link dispatched to {clientEmail} for{' '}
                          {siteLocation}.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="w-full py-3 border border-[#161816] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#161816] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Print / Save Architectural Spec Sheet (PDF)</span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setReserveSubmitted(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                          Client or Principal Architect Name
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                          Email for CAD Package
                        </label>
                        <input
                          type="email"
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                        Installation Parcel Municipality / Coordinates
                      </label>
                      <input
                        type="text"
                        required
                        value={siteLocation}
                        onChange={(e) => setSiteLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#D48C56] hover:bg-[#c07a45] text-[#111412] font-mono text-xs uppercase tracking-widest font-bold transition-colors"
                    >
                      Generate Official Spec Sheet & Hold Build Slot ($1,000 Refundable Deposit)
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. BOOK PRIVATE VIEWING MODAL */}
      <AnimatePresence>
        {viewingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#F3F1EC] text-[#161816] border-2 border-[#161816] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#161816] text-white flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#D48C56]">
                    PRIVATE SHOWROOM & PARCEL CONSULTATION
                  </p>
                  <h4 className="font-mono text-base font-bold">
                    Book Private Architectural Viewing
                  </h4>
                </div>
                <button
                  onClick={() => setViewingModalOpen(false)}
                  className="p-1 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {viewingSubmitted ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#233329] text-white font-mono text-xs">
                      <p className="text-[#D48C56] font-bold mb-1">
                        PRIVATE VIEWING CONFIRMED
                      </p>
                      <p>PAVILION: {viewingLocation}</p>
                      <p>DATE & TIME: {viewingDate}</p>
                      <p className="mt-2 text-white/80">
                        Gate access code and architectural dossier sent to {clientEmail}.
                      </p>
                    </div>
                    <button
                      onClick={() => setViewingModalOpen(false)}
                      className="w-full py-3 bg-[#161816] text-white font-mono text-xs uppercase tracking-widest"
                    >
                      Close Confirmation
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setViewingSubmitted(true);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                        Select Viewing Pavilion
                      </label>
                      <select
                        value={viewingLocation}
                        onChange={(e) => setViewingLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                      >
                        <option>Sonoma Coast Showroom (CA) — N-02 & N-03</option>
                        <option>Hudson Valley Pavilion (NY) — N-01 & N-02</option>
                        <option>Stockholm Archipelago Island Pavilion — N-03</option>
                        <option>Live 1-on-1 Video Walkthrough from Factory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                        Preferred Date & Time Window
                      </label>
                      <input
                        type="text"
                        required
                        value={viewingDate}
                        onChange={(e) => setViewingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase text-[#5C605B] mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#161816]/30 text-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#161816] hover:bg-[#233329] text-white font-mono text-xs uppercase tracking-widest font-bold transition-colors"
                    >
                      Confirm Private Viewing Appointment
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default NorthlineStudioSite;
