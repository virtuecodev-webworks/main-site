'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Check,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Microscope,
  Brain,
  Dna,
  Flame,
  Award,
  ArrowUpRight,
  UserCheck,
  FileText,
  Lock,
  X,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

type BiomarkerCategory =
  | 'Heart & ApoB Lipids'
  | 'Hormones & Thyroid'
  | 'Metabolic & Insulin'
  | 'Inflammation & Biological Age'
  | 'Vitamins & Heavy Metals';

type BiomarkerId =
  | 'apob'
  | 'lpa'
  | 'hscrp'
  | 'fasting-insulin'
  | 'free-testosterone'
  | 'omega-3'
  | 'bio-age-pace';

interface BiomarkerSpec {
  id: BiomarkerId;
  name: string;
  clinicalCode: string;
  category: BiomarkerCategory;
  patientValue: string;
  unit: string;
  statusTag: 'Optimal Longevity Zone' | 'Actionable Optimization';
  optimalRange: string;
  standardLabRange: string;
  percentileRank: string;
  mdSummary: string;
  nutritionProtocol: string[];
  supplementProtocol: string[];
  trend6Mo: { month: string; value: number }[];
}

const CATEGORIES: BiomarkerCategory[] = [
  'Heart & ApoB Lipids',
  'Hormones & Thyroid',
  'Metabolic & Insulin',
  'Inflammation & Biological Age',
  'Vitamins & Heavy Metals',
];

const BIOMARKERS: BiomarkerSpec[] = [
  {
    id: 'apob',
    name: 'ApoB (Apolipoprotein B)',
    clinicalCode: 'LIPID-APOB-Q',
    category: 'Heart & ApoB Lipids',
    patientValue: '58',
    unit: 'mg/dL',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '< 65 mg/dL (Centenarian Decile)',
    standardLabRange: '< 110 mg/dL (Conventional Normal)',
    percentileRank: 'Top 8% for age cohort',
    mdSummary:
      'ApoB measures the exact concentration of atherogenic lipoproteins (LDL, VLDL, IDL) capable of penetrating the arterial wall. At 58 mg/dL, plaque progression risk is minimized.',
    nutritionProtocol: [
      '38g+ soluble fiber daily (beta-glucan oats, psyllium husk, lupini beans)',
      'Replace saturated dairy fats with high-polyphenol extra virgin olive oil',
    ],
    supplementProtocol: [
      'Citrus Bergamot Extract 500mg twice daily',
      'Pharmaceutical-grade EPA/DHA 2,400mg with evening meal',
    ],
    trend6Mo: [
      { month: 'May', value: 86 },
      { month: 'Jun', value: 79 },
      { month: 'Jul', value: 71 },
      { month: 'Aug', value: 65 },
      { month: 'Sep', value: 61 },
      { month: 'Oct', value: 58 },
    ],
  },
  {
    id: 'lpa',
    name: 'Lp(a) — Lipoprotein (a)',
    clinicalCode: 'GEN-CARDIO-LPA',
    category: 'Heart & ApoB Lipids',
    patientValue: '19',
    unit: 'nmol/L',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '< 30 nmol/L',
    standardLabRange: '< 75 nmol/L',
    percentileRank: 'Low Genetic Risk Profile',
    mdSummary:
      'Lp(a) is a genetically determined causal factor for premature coronary calcification and aortic stenosis, rarely ordered in routine physicals. Your level confirms low baseline genetic atherothrombotic risk.',
    nutritionProtocol: [
      'Maintain ultra-low glycemic variability and endothelial nitric oxide support (arugula, beets)',
    ],
    supplementProtocol: [
      'CoQ10 Ubiquinol 100mg AM',
      'Vitamin K2 (MK-7) 180mcg + D3 4,000 IU',
    ],
    trend6Mo: [
      { month: 'May', value: 21 },
      { month: 'Jun', value: 20 },
      { month: 'Jul', value: 20 },
      { month: 'Aug', value: 19 },
      { month: 'Sep', value: 19 },
      { month: 'Oct', value: 19 },
    ],
  },
  {
    id: 'hscrp',
    name: 'hs-CRP (High-Sensitivity CRP)',
    clinicalCode: 'INFLAM-HSCRP',
    category: 'Inflammation & Biological Age',
    patientValue: '0.34',
    unit: 'mg/L',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '< 0.50 mg/L',
    standardLabRange: '< 3.00 mg/L',
    percentileRank: 'Top 5% Systemic Calm',
    mdSummary:
      'Micro-vascular systemic inflammation marker. Levels below 0.50 mg/L correlate strongly with preserved telomere length, endothelial elasticity, and lower neuro-inflammatory load.',
    nutritionProtocol: [
      'Eliminate refined seed oils and late-night glycemic spikes within 3 hours of sleep',
      'Wild Alaskan sockeye salmon & fermented polyphenol intake 4x/week',
    ],
    supplementProtocol: [
      'Curcumin Phytosome (Meriva) 500mg',
      'Specialized Pro-Resolving Mediators (SPMs) 2 softgels',
    ],
    trend6Mo: [
      { month: 'May', value: 1.15 },
      { month: 'Jun', value: 0.88 },
      { month: 'Jul', value: 0.64 },
      { month: 'Aug', value: 0.49 },
      { month: 'Sep', value: 0.39 },
      { month: 'Oct', value: 0.34 },
    ],
  },
  {
    id: 'fasting-insulin',
    name: 'Fasting Insulin & HOMA-IR',
    clinicalCode: 'METAB-INS-FAST',
    category: 'Metabolic & Insulin',
    patientValue: '3.6',
    unit: 'uIU/mL',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '2.0 – 5.0 uIU/mL',
    standardLabRange: '2.6 – 24.9 uIU/mL',
    percentileRank: 'HOMA-IR: 0.76 (Elite Sensitivity)',
    mdSummary:
      'Fasting insulin rises up to a decade before fasting glucose or HbA1c cross pre-diabetic thresholds. At 3.6 uIU/mL, your skeletal muscle glucose disposal and mitochondrial flexibility are optimal.',
    nutritionProtocol: [
      '10-minute post-prandial walk after largest carbohydrate meal',
      '35g leucine-rich protein anchor at first meal of the day',
    ],
    supplementProtocol: [
      'Magnesium Bisglycinate 400mg before bed',
      'Myo-Inositol + Chromium Picolinate on high-training days',
    ],
    trend6Mo: [
      { month: 'May', value: 6.8 },
      { month: 'Jun', value: 5.9 },
      { month: 'Jul', value: 5.1 },
      { month: 'Aug', value: 4.4 },
      { month: 'Sep', value: 3.9 },
      { month: 'Oct', value: 3.6 },
    ],
  },
  {
    id: 'free-testosterone',
    name: 'Free Testosterone & SHBG Ratio',
    clinicalCode: 'ENDO-FTEST-LCMS',
    category: 'Hormones & Thyroid',
    patientValue: '18.4',
    unit: 'pg/mL',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '15.0 – 24.0 pg/mL',
    standardLabRange: '6.8 – 21.5 pg/mL',
    percentileRank: 'Top 12% Endocrine Vitality',
    mdSummary:
      'Assayed via gold-standard Equilibrium Dialysis LC/MS-MS alongside Free T3, Estradiol, and DHEA-S. Supports lean muscle preservation, bone mineral density, and cognitive drive.',
    nutritionProtocol: [
      'Ensure adequate dietary cholesterol & zinc-rich bivalves/pumpkin seeds',
      'Protect deep slow-wave sleep architecture (cool 65°F bedroom)',
    ],
    supplementProtocol: [
      'Boron Glycinate 6mg daily (optimizes SHBG release)',
      'Ashwagandha KSM-66 600mg (cortisol modulation)',
    ],
    trend6Mo: [
      { month: 'May', value: 13.8 },
      { month: 'Jun', value: 14.9 },
      { month: 'Jul', value: 16.1 },
      { month: 'Aug', value: 17.0 },
      { month: 'Sep', value: 17.8 },
      { month: 'Oct', value: 18.4 },
    ],
  },
  {
    id: 'omega-3',
    name: 'Omega-3 Index (RBC Membrane)',
    clinicalCode: 'NUTR-OM3-RBC',
    category: 'Vitamins & Heavy Metals',
    patientValue: '9.4',
    unit: '%',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '8.0% – 11.0%',
    standardLabRange: '> 4.0%',
    percentileRank: 'Cardio-Neuro Protective Tier',
    mdSummary:
      'Reflects 120-day red blood cell membrane saturation of EPA + DHA. An Omega-3 Index above 8% is associated with a 35% reduction in sudden cardiac events and superior hippocampal volume.',
    nutritionProtocol: [
      'SMASH fish (Sardines, Mackerel, Anchovies, Salmon, Herring) 3x weekly',
      'Chia, hemp hearts, and walnuts for ALA conversion support',
    ],
    supplementProtocol: [
      'Triglyceride-form Norway Fish Oil (2.4g combined EPA/DHA)',
      'Astaxanthin 6mg lipid antioxidant protection',
    ],
    trend6Mo: [
      { month: 'May', value: 5.8 },
      { month: 'Jun', value: 6.7 },
      { month: 'Jul', value: 7.5 },
      { month: 'Aug', value: 8.3 },
      { month: 'Sep', value: 8.9 },
      { month: 'Oct', value: 9.4 },
    ],
  },
  {
    id: 'bio-age-pace',
    name: 'Biological Age Pace (DunedinPACE)',
    clinicalCode: 'EPIGEN-PACE-V3',
    category: 'Inflammation & Biological Age',
    patientValue: '0.76',
    unit: 'yr/yr',
    statusTag: 'Optimal Longevity Zone',
    optimalRange: '< 0.85 biological yrs per chronological yr',
    standardLabRange: '1.00 yr/yr (Population Mean)',
    percentileRank: 'Aging 24% Slower Than Calendar',
    mdSummary:
      'Measured via next-generation DNA methylation array across 950,000 CpG sites. A pace of 0.76 indicates you accumulate only 9.1 months of biological wear per 12 calendar months.',
    nutritionProtocol: [
      'Methyl-donor nutrient density (folate from dark leafy greens, choline, betaine)',
      '14-hour overnight circadian fasting window aligned with daylight',
    ],
    supplementProtocol: [
      'Creatine Monohydrate 5g daily (methylation sparing)',
      'Nicotinamide Riboside (NR) 300mg + TMG 500mg',
    ],
    trend6Mo: [
      { month: 'May', value: 0.91 },
      { month: 'Jun', value: 0.88 },
      { month: 'Jul', value: 0.84 },
      { month: 'Aug', value: 0.81 },
      { month: 'Sep', value: 0.78 },
      { month: 'Oct', value: 0.76 },
    ],
  },
];

interface ClinicLocation {
  id: 'ny-soho' | 'london-marylebone' | 'zurich-paradeplatz' | 'lagos-vi';
  name: string;
  address: string;
  scannerSpec: string;
  leadMd: string;
  image: string;
  availableDates: string[];
}

const CLINICS: ClinicLocation[] = [
  {
    id: 'ny-soho',
    name: 'New York — SoHo',
    address: '458 Broome Street, Suite 4B, SoHo, New York, NY 10013',
    scannerSpec: '3.0T Twin-Gradient Whole-Body AI MRI + Fasting Phlebotomy Lounge',
    leadMd: 'Dr. Claire Vance, MD',
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80',
    availableDates: ['Thu, Nov 12', 'Fri, Nov 13', 'Mon, Nov 16', 'Wed, Nov 18'],
  },
  {
    id: 'london-marylebone',
    name: 'London — Marylebone',
    address: '28 Harley Street, Marylebone, London W1G 9PS, United Kingdom',
    scannerSpec: '3.0T Silent-Bore Whole-Body MRI + DEXA + VO2 Max Lab',
    leadMd: 'Dr. Soren Lindqvist, MD PhD',
    image:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    availableDates: ['Fri, Nov 13', 'Tue, Nov 17', 'Thu, Nov 19', 'Fri, Nov 20'],
  },
  {
    id: 'zurich-paradeplatz',
    name: 'Zurich — Paradeplatz',
    address: 'Bahnhofstrasse 32, 8001 Zürich, Switzerland',
    scannerSpec: 'Swiss Precision Epigenetics + Whole-Body MRI + Coronary CTA Suite',
    leadMd: 'Dr. Soren Lindqvist, MD PhD',
    image:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
    availableDates: ['Mon, Nov 16', 'Wed, Nov 18', 'Fri, Nov 20', 'Mon, Nov 23'],
  },
  {
    id: 'lagos-vi',
    name: 'Lagos — Victoria Island',
    address: '14 Adeola Odeku Street, Victoria Island, Lagos, Nigeria',
    scannerSpec: 'Executive Preventative Cardiology + 3.0T Whole-Body MRI Sanctuary',
    leadMd: 'Dr. Tunde Bankole, MD',
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80',
    availableDates: ['Thu, Nov 12', 'Mon, Nov 16', 'Tue, Nov 17', 'Thu, Nov 19'],
  },
];

const PHYSICIANS = [
  {
    name: 'Dr. Claire Vance, MD',
    credential: 'Harvard Longevity Fellowship',
    role: 'Chief Medical Officer · Epigenetics & Oncology Screening',
    bio: 'Former Attending Physician at Massachusetts General Hospital. Leads Solace protocols for liquid biopsy early cancer detection and multi-organ MRI interpretation.',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Dr. Tunde Bankole, MD',
    credential: 'Preventive Cardiology',
    role: 'Director of Lipidology & Vascular Longevity',
    bio: 'Pioneered ApoB/Lp(a) intensive regression pathways and AI coronary plaque quantification. Oversees athletic VO2 max and endothelial health across our clinics.',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Dr. Soren Lindqvist, MD PhD',
    credential: 'Metabolic & Neuro Diagnostics',
    role: 'Head of Neuro-Imaging & Insulin Kinetics',
    bio: 'Karolinska Institutet MD/PhD specializing in brain volumetric MRI biomarkers, hippocampal preservation, and mitochondrial insulin sensitivity.',
    image:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
  },
];

const FAQS = [
  {
    q: 'How is Solace different from my annual primary care checkup?',
    a: 'A conventional primary care visit typically tests 15–18 basic markers after symptoms appear and relies on broad population reference ranges based on sick averages. Solace measures 110+ advanced biomarkers twice a year—including ApoB, Lp(a), Fasting Insulin, Free Thyroid hormones, heavy metals, and DunedinPACE biological age—paired with radiation-free Whole-Body MRI to detect silent aneurysms, fatty liver, and stage-1 solid tumors years before symptoms arise.',
  },
  {
    q: 'Does the Whole-Body MRI use ionizing radiation or IV contrast dye?',
    a: 'Zero ionizing radiation and zero gadolinium IV contrast. Our 45-minute scan utilizes 3.0-Tesla magnetic fields and AI diffusion-weighted sequences across the brain, neck, chest, abdomen, pelvis, and spine, making it completely safe for annual preventative tracking.',
  },
  {
    q: 'Can I use my HSA or FSA card for Solace Membership?',
    a: 'Yes. Both the $499/yr Annual Lab Membership and the $2,490/yr Complete MRI + Longevity Executive tier are eligible for HSA/FSA reimbursement. We provide an itemized diagnostic receipt immediately upon enrollment.',
  },
  {
    q: 'What happens if an actionable finding appears on my labs or MRI?',
    a: 'Your dedicated Solace Longevity MD reviews your results within 48 hours, conducts a 45-minute video or in-clinic consultation, and coordinates any specialist follow-up, prescriptions, or targeted re-testing at 90 days.',
  },
];

export function SolaceHealthPortalSite() {
  // Hero Interactive Biological Age State
  const [chronoAge, setChronoAge] = useState<number>(42);
  const [heroBioTab, setHeroBioTab] = useState<'epigenetic' | 'organ'>('epigenetic');

  // Biomarker Explorer State
  const [selectedCategory, setSelectedCategory] = useState<BiomarkerCategory | 'All'>('All');
  const [selectedBiomarkerId, setSelectedBiomarkerId] = useState<BiomarkerId>('apob');

  // Clinic & Appointment Scheduler State
  const [selectedClinicId, setSelectedClinicId] = useState<ClinicLocation['id']>('ny-soho');
  const [selectedDate, setSelectedDate] = useState<string>('Thu, Nov 12');
  const [selectedSlot, setSelectedSlot] = useState<string>('08:30 AM (Fasting Blood + MRI)');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Membership Modal & FAQ State
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [selectedTierModal, setSelectedTierModal] = useState<'core' | 'executive'>('core');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [memberJoined, setMemberJoined] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const filteredBiomarkers = useMemo(() => {
    if (selectedCategory === 'All') return BIOMARKERS;
    return BIOMARKERS.filter((b) => b.category === selectedCategory);
  }, [selectedCategory]);

  const activeBiomarker = useMemo(
    () => BIOMARKERS.find((b) => b.id === selectedBiomarkerId) ?? BIOMARKERS[0],
    [selectedBiomarkerId]
  );

  const activeClinic = useMemo(
    () => CLINICS.find((c) => c.id === selectedClinicId) ?? CLINICS[0],
    [selectedClinicId]
  );

  const biologicalAge = useMemo(() => {
    return +(chronoAge - 7.4).toFixed(1);
  }, [chronoAge]);

  const handleSelectClinic = (id: ClinicLocation['id']) => {
    const found = CLINICS.find((c) => c.id === id);
    if (!found) return;
    setSelectedClinicId(id);
    setSelectedDate(found.availableDates[0]);
    setBookingConfirmed(false);
  };

  const openMembershipModal = (tier: 'core' | 'executive') => {
    setSelectedTierModal(tier);
    setMemberJoined(false);
    setJoinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18221D] font-sans selection:bg-[#1E3F32]/20 selection:text-[#18221D]">
      {/* Top Clinical Assurance Banner */}
      <div className="bg-[#163026] text-[#EDE7DC] text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span>
          CLIA-Certified Diagnostics · 110+ Biomarkers Included · Radiation-Free 3.0T Whole-Body
          MRI · HSA/FSA Eligible
        </span>
      </div>

      {/* STICKY CLINICAL EDITORIAL HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Botanical / Medical Emblem + Brand */}
          <a href="#top" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#163026] text-[#F4EFE6] flex items-center justify-center shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#D8C39A]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 2v20" />
                <path d="M12 6c3.5-2 7 0 7 3.5S15.5 15 12 13" />
                <path d="M12 6C8.5 4 5 6 5 9.5S8.5 15 12 13" />
                <circle cx="12" cy="4" r="1.3" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight font-semibold text-[#163026] block leading-none">
                SOLACE HEALTH
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#5B6B62] block mt-1">
                Longevity & Diagnostics
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#2E3D35]">
            <a href="#biomarkers" className="hover:text-[#163026] transition-colors">
              110+ Biomarkers
            </a>
            <a href="#mri-section" className="hover:text-[#163026] transition-colors">
              Whole-Body MRI
            </a>
            <a href="#biomarkers" className="hover:text-[#163026] transition-colors">
              Sample Lab Report
            </a>
            <a href="#physicians" className="hover:text-[#163026] transition-colors">
              Physicians
            </a>
            <a href="#membership" className="hover:text-[#163026] transition-colors">
              Membership
            </a>
            <a href="#clinics" className="hover:text-[#163026] transition-colors">
              Clinics
            </a>
          </nav>

          {/* Member Sign In & Join CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openMembershipModal('core')}
              className="hidden sm:inline-flex text-sm font-medium text-[#2E3D35] hover:text-[#163026] px-3 py-2 cursor-pointer"
            >
              Member Sign In
            </button>
            <button
              onClick={() => openMembershipModal('core')}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#163026] hover:bg-[#1E4033] text-[#FAF7F2] shadow-sm transition-all cursor-pointer"
            >
              Join Solace ($499/yr)
            </button>
          </div>
        </div>
      </header>

      {/* WARM EDITORIAL HEALTHCARE HERO */}
      <section className="relative pt-10 pb-20 lg:pt-14 lg:pb-24 border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 6 Cols: Editorial Headline + Key Facts */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE3D5] text-[#163026] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D3F]" />
                <span>Preventative Medicine Designed for the 100-Year Life</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] text-[#14241D] leading-[1.12] tracking-tight">
                Know What Is Happening Inside Your Body —{' '}
                <span className="italic font-normal text-[#2D5A47]">
                  Years Before Symptoms Appear.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#45544C] leading-relaxed">
                Every year, Solace tests <strong className="text-[#163026]">110+ blood biomarkers</strong>{' '}
                across your heart, hormones, metabolism, inflammation, and heavy metals—combined
                with a radiation-free{' '}
                <strong className="text-[#163026]">Whole-Body MRI</strong> and a dedicated{' '}
                <strong className="text-[#163026]">Longevity MD</strong> action plan.
              </p>

              {/* Key Facts Pills */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs">
                  <div className="font-serif text-2xl font-semibold text-[#163026]">
                    110+
                  </div>
                  <div className="text-xs text-[#54635B] mt-0.5">
                    Lab Biomarkers Tested Twice Yearly
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs">
                  <div className="font-serif text-2xl font-semibold text-[#163026]">
                    0 Rad
                  </div>
                  <div className="text-xs text-[#54635B] mt-0.5">
                    Radiation-Free Whole-Body MRI
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs">
                  <div className="font-serif text-2xl font-semibold text-[#163026]">
                    1:1 MD
                  </div>
                  <div className="text-xs text-[#54635B] mt-0.5">
                    Dedicated Longevity MD Care
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => openMembershipModal('core')}
                  className="px-6 py-3.5 rounded-full text-sm font-semibold bg-[#163026] hover:bg-[#1E4033] text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Start Your Baseline ($499/yr)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <a
                  href="#biomarkers"
                  className="px-5 py-3.5 rounded-full text-sm font-medium bg-white hover:bg-[#F2ECE1] text-[#163026] border border-[#D8CFC0] transition-colors"
                >
                  Explore Sample Lab Report
                </a>
              </div>
            </div>

            {/* Right 6 Cols: Clinical Photography + Interactive Biological Age vs Chronological Age Preview Card */}
            <div className="lg:col-span-6 space-y-5">
              {/* Editorial Clinical Photography Banner */}
              <div className="relative rounded-3xl overflow-hidden border border-[#DED6C6] shadow-lg h-64 sm:h-72 bg-[#E8E0D2]">
                <img
                  src="/work/solace-hero.jpg"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85';
                  }}
                  alt="Solace Longevity Diagnostic Consultation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11221B]/80 via-[#11221B]/20 to-transparent flex items-end p-6">
                  <div className="flex items-center justify-between w-full text-white">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-[#D8C39A] block">
                        Member Portal Live Preview
                      </span>
                      <span className="font-serif text-lg">
                        Comprehensive Annual Baseline + Epigenetic Clock
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/25">
                      CLIA #33D20941
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Biological Age vs Chronological Age Preview Card */}
              <div className="rounded-3xl bg-white border border-[#DED6C6] p-6 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#EFE9DD]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D5A47]">
                      Interactive Biological Age Preview
                    </span>
                    <h3 className="font-serif text-xl text-[#14241D] font-semibold">
                      Biological Age vs. Chronological Age
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-full text-xs">
                    <button
                      onClick={() => setHeroBioTab('epigenetic')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        heroBioTab === 'epigenetic'
                          ? 'bg-[#163026] text-white font-medium'
                          : 'text-[#4E5E55]'
                      }`}
                    >
                      DunedinPACE
                    </button>
                    <button
                      onClick={() => setHeroBioTab('organ')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        heroBioTab === 'organ'
                          ? 'bg-[#163026] text-white font-medium'
                          : 'text-[#4E5E55]'
                      }`}
                    >
                      Organ Clocks
                    </button>
                  </div>
                </div>

                {heroBioTab === 'epigenetic' ? (
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#F8F5EE] border border-[#E8E1D3]">
                        <div className="text-xs text-[#5B6B62]">Chronological Calendar Age</div>
                        <div className="font-serif text-3xl font-semibold text-[#18221D] mt-1">
                          {chronoAge}.0 <span className="text-sm font-sans font-normal">yrs</span>
                        </div>
                        <div className="text-[11px] text-[#6E7D75] mt-1">
                          Adjust slider below to preview
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#163026] text-white">
                        <div className="text-xs text-[#C4D4CC]">Solace Biological Age</div>
                        <div className="font-serif text-3xl font-semibold text-[#E8D5B0] mt-1">
                          {biologicalAge} <span className="text-sm font-sans font-normal">yrs</span>
                        </div>
                        <div className="text-[11px] text-emerald-300 mt-1">
                          7.4 Years Younger · 0.76x Pace
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#4E5E55] mb-1">
                        <span>Simulate Your Chronological Age ({chronoAge} yrs)</span>
                        <span className="font-semibold text-[#163026]">
                          Target Bio Age: {biologicalAge} yrs
                        </span>
                      </div>
                      <input
                        type="range"
                        min={28}
                        max={75}
                        value={chronoAge}
                        onChange={(e) => setChronoAge(Number(e.target.value))}
                        className="w-full accent-[#163026] h-2 bg-[#E5DEC9] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { organ: 'Cardiovascular & ApoB', delta: '-9.2 yrs', score: '96/100' },
                      { organ: 'Metabolic & Hepatic', delta: '-7.8 yrs', score: '94/100' },
                      { organ: 'Neuro & Hippocampal MRI', delta: '-6.4 yrs', score: '93/100' },
                    ].map((item) => (
                      <div
                        key={item.organ}
                        className="p-3 rounded-xl bg-[#F8F5EE] border border-[#E8E1D3]"
                      >
                        <div className="text-xs font-medium text-[#18221D]">{item.organ}</div>
                        <div className="font-serif text-lg font-semibold text-[#1E523B] mt-1">
                          {item.delta}
                        </div>
                        <div className="text-[11px] text-[#66756D]">Resilience: {item.score}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 110+ BIOMARKER EXPLORER & SAMPLE PATIENT DASHBOARD */}
      <section id="biomarkers" className="py-20 border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[#2D5A47] font-semibold mb-2">
                Interactive Sample Lab Report & Biomarker Explorer
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#14241D]">
                110+ Deep Biomarkers. Calibrated for Optimal Longevity.
              </h2>
            </div>
            <p className="text-sm text-[#4E5E55] max-w-md">
              Standard lab reference ranges only flag disease after it develops. Click any
              biomarker below to inspect how Solace compares your levels against centenarian
              optimal zones.
            </p>
          </div>

          {/* 5 Clinical Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#163026] text-white shadow-xs'
                  : 'bg-white text-[#37473E] border border-[#DED6C6] hover:bg-[#F2ECE1]'
              }`}
            >
              All 5 Clinical Domains ({BIOMARKERS.length} Featured)
            </button>
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    const firstInCat = BIOMARKERS.find((b) => b.category === category);
                    if (firstInCat) setSelectedBiomarkerId(firstInCat.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#163026] text-white shadow-xs'
                      : 'bg-white text-[#37473E] border border-[#DED6C6] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Dashboard Split: Left Biomarker Selector List + Right Live Patient Lab Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Cols: Biomarker Cards */}
            <div className="lg:col-span-5 space-y-3">
              {filteredBiomarkers.map((marker) => {
                const isSelected = marker.id === selectedBiomarkerId;
                return (
                  <button
                    key={marker.id}
                    onClick={() => setSelectedBiomarkerId(marker.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#163026] text-white border-[#163026] shadow-md'
                        : 'bg-white text-[#18221D] border-[#E2DAC9] hover:border-[#C5B9A2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] uppercase tracking-wider font-medium ${
                          isSelected ? 'text-[#D8C39A]' : 'text-[#5E6E65]'
                        }`}
                      >
                        {marker.category}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : 'bg-[#E9F3ED] text-[#1E523B]'
                        }`}
                      >
                        {marker.statusTag}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <h3 className="font-serif text-lg font-semibold">{marker.name}</h3>
                      <div className="font-serif text-xl font-bold">
                        {marker.patientValue}{' '}
                        <span className="text-xs font-sans font-normal opacity-80">
                          {marker.unit}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`text-xs mt-1.5 flex items-center justify-between ${
                        isSelected ? 'text-[#C6D4CD]' : 'text-[#64736B]'
                      }`}
                    >
                      <span>Optimal: {marker.optimalRange}</span>
                      <span>{marker.percentileRank}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right 7 Cols: Live Patient Lab Chart & MD Action Plan */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-[#DED6C6] p-6 sm:p-8 shadow-lg">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#EFE9DD]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#F4EFE6] text-[#5B6B62]">
                      {activeBiomarker.clinicalCode}
                    </span>
                    <span className="text-xs font-semibold text-[#1E523B] bg-[#E9F3ED] px-3 py-0.5 rounded-full">
                      ✓ {activeBiomarker.statusTag}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#14241D] mt-2">
                    {activeBiomarker.name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#5E6E65]">Sample Patient Value</div>
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[#163026]">
                    {activeBiomarker.patientValue}{' '}
                    <span className="text-sm font-sans font-normal text-[#5E6E65]">
                      {activeBiomarker.unit}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#2D5A47]">
                    {activeBiomarker.percentileRank}
                  </div>
                </div>
              </div>

              {/* Optimal Longevity Zone vs Standard Lab Range Visual Bar */}
              <div className="my-6 p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D2]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2E3D35] mb-3">
                  <span>Reference Zone Calibration</span>
                  <span className="text-[#1E523B]">
                    Solace Optimal: {activeBiomarker.optimalRange}
                  </span>
                </div>

                <div className="relative h-7 rounded-full bg-[#E6DFD1] overflow-hidden flex">
                  <div className="w-[46%] h-full bg-gradient-to-r from-[#1E523B] to-[#34785A] flex items-center justify-center text-[11px] font-semibold text-white">
                    Optimal Longevity Zone ({activeBiomarker.optimalRange})
                  </div>
                  <div className="w-[34%] h-full bg-[#D9C79E] flex items-center justify-center text-[11px] font-medium text-[#3A3222]">
                    Standard Lab Range ({activeBiomarker.standardLabRange})
                  </div>
                  <div className="w-[20%] h-full bg-[#D99B8C] flex items-center justify-center text-[11px] font-medium text-[#4A2018]">
                    Elevated Risk
                  </div>
                </div>

                {/* 6-Month Longitudinal Trend Graph */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-[#4E5E55] mb-3">
                    <span className="font-semibold text-[#18221D]">
                      6-Month Longitudinal Biomarker Trajectory
                    </span>
                    <span>Re-tested every 90–180 days</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2 items-end h-28 pt-4 px-3 bg-white rounded-xl border border-[#EAE2D3]">
                    {activeBiomarker.trend6Mo.map((pt, idx) => {
                      const maxVal = Math.max(...activeBiomarker.trend6Mo.map((t) => t.value));
                      const heightPct = Math.max(25, Math.round((pt.value / maxVal) * 100));
                      const isLatest = idx === activeBiomarker.trend6Mo.length - 1;
                      return (
                        <div
                          key={pt.month}
                          className="flex flex-col items-center justify-end h-full gap-1"
                        >
                          <span
                            className={`text-[11px] font-mono ${
                              isLatest ? 'font-bold text-[#163026]' : 'text-[#6A7870]'
                            }`}
                          >
                            {pt.value}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[36px] rounded-t-md transition-all ${
                              isLatest ? 'bg-[#163026]' : 'bg-[#BFD3C8]'
                            }`}
                          />
                          <span className="text-[10px] text-[#6A7870] pb-1">{pt.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Physician Clinical Interpretation & Protocols */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#2D5A47] mb-1">
                    Physician Clinical Note (Dr. Tunde Bankole, MD)
                  </h4>
                  <p className="text-sm text-[#37473E] leading-relaxed">
                    {activeBiomarker.mdSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F5F1E8] border border-[#E5DEC9]">
                    <div className="text-xs font-semibold text-[#163026] mb-2">
                      Personalized Nutrition Protocol
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#3E4E45]">
                      {activeBiomarker.nutritionProtocol.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#1E523B] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F1E8] border border-[#E5DEC9]">
                    <div className="text-xs font-semibold text-[#163026] mb-2">
                      Targeted Supplement Protocol
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#3E4E45]">
                      {activeBiomarker.supplementProtocol.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#1E523B] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHOLE-BODY MRI HIGHLIGHT BANNER */}
      <section id="mri-section" className="py-16 bg-[#163026] text-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D8C39A] font-semibold">
                Radiation-Free 3.0T Twin-Gradient MRI
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
                Full-Body Multi-Organ Imaging in 45 Calm Minutes.
              </h2>
              <p className="text-sm sm:text-base text-[#CBD8D1] leading-relaxed max-w-2xl">
                Our AI-accelerated 3.0-Tesla MRI screens for over 500 conditions across the brain,
                carotid arteries, lungs, liver, pancreas, kidneys, pelvis, and spine—detecting
                stage-1 solid tumors as small as 2mm, silent cerebral aneurysms, and visceral
                adipose volume without a single drop of IV contrast or radiation.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                  <div className="font-serif text-xl text-[#E8D5B0]">Brain & Neuro</div>
                  <div className="text-xs text-[#BDCCC4] mt-1">
                    Hippocampal volume & white matter integrity
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                  <div className="font-serif text-xl text-[#E8D5B0]">Cardio & Torso</div>
                  <div className="text-xs text-[#BDCCC4] mt-1">
                    Aortic root, liver fat fraction & pancreas screening
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                  <div className="font-serif text-xl text-[#E8D5B0]">Spine & Pelvis</div>
                  <div className="text-xs text-[#BDCCC4] mt-1">
                    Disc hydration, prostate/ovarian & psoas muscle index
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#0F231B] p-4">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80"
                  alt="3.0T Whole-Body MRI Suite"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="pt-4 flex items-center justify-between text-xs text-[#D8C39A]">
                  <span>Wide-Bore 70cm Comfort · Cinema Visor Included</span>
                  <span className="font-semibold text-white">45 Min Scan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL ADVISORY BOARD & CLINIC LOCATIONS + INTERACTIVE APPOINTMENT SCHEDULER */}
      <section id="physicians" className="py-20 border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.18em] text-[#2D5A47] font-semibold mb-2">
              Medical Advisory Board & Clinical Leadership
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14241D]">
              Led by World-Renowned Preventive Physicians
            </h2>
          </div>

          {/* 3 Real Physician Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {PHYSICIANS.map((doc) => (
              <div
                key={doc.name}
                className="rounded-3xl bg-white border border-[#DED6C6] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-60 overflow-hidden bg-[#E5DEC9]">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-[#EFE9DD] text-[#2D5A47]">
                      {doc.credential}
                    </span>
                    <h3 className="font-serif text-xl font-semibold text-[#14241D] mt-2">
                      {doc.name}
                    </h3>
                    <div className="text-xs font-medium text-[#54635B] mt-0.5">{doc.role}</div>
                    <p className="text-xs text-[#4E5E55] mt-3 leading-relaxed">{doc.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Clinic Switcher & Appointment Scheduler */}
          <div id="clinics" className="pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#2D5A47] font-semibold mb-2">
                  Diagnostic Sanctuaries & Live Scheduling
                </div>
                <h3 className="font-serif text-3xl text-[#14241D]">
                  Reserve Your Baseline Diagnostic Visit
                </h3>
              </div>

              {/* Clinic Switcher Pills */}
              <div className="flex flex-wrap gap-2">
                {CLINICS.map((clinic) => {
                  const active = clinic.id === selectedClinicId;
                  return (
                    <button
                      key={clinic.id}
                      onClick={() => handleSelectClinic(clinic.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#163026] text-white'
                          : 'bg-white text-[#2E3D35] border border-[#DED6C6] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      {clinic.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 6 Cols: Selected Clinic Sanctuary Card */}
              <div className="lg:col-span-6 rounded-3xl bg-white border border-[#DED6C6] overflow-hidden flex flex-col justify-between shadow-sm">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={activeClinic.image}
                    alt={activeClinic.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#163026]/90 text-white text-xs font-medium">
                    {activeClinic.name}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-[#2E3D35]">
                    <MapPin className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                    <span className="font-medium">{activeClinic.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#54635B]">
                    <Microscope className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                    <span>{activeClinic.scannerSpec}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#54635B]">
                    <Stethoscope className="w-4 h-4 text-[#2D5A47] shrink-0" />
                    <span>Lead Attending Physician: {activeClinic.leadMd}</span>
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Interactive Appointment Scheduler */}
              <div className="lg:col-span-6 rounded-3xl bg-white border border-[#DED6C6] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                {bookingConfirmed ? (
                  <div className="my-auto text-center space-y-4 py-6">
                    <div className="w-12 h-12 rounded-full bg-[#E9F3ED] text-[#1E523B] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-2xl text-[#14241D]">
                      Diagnostic Appointment Reserved
                    </h4>
                    <p className="text-sm text-[#4E5E55] max-w-md mx-auto">
                      We have held your fasting blood panel & diagnostic slot at{' '}
                      <strong className="text-[#163026]">{activeClinic.name}</strong> on{' '}
                      <strong className="text-[#163026]">{selectedDate}</strong> at{' '}
                      <strong className="text-[#163026]">{selectedSlot}</strong>.
                    </p>
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DEC9] text-xs text-[#4E5E55]">
                      Fasting Prep: Water and black electrolytes only for 10 hours prior to arrival.
                    </div>
                    <button
                      onClick={() => setBookingConfirmed(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#163026] text-white cursor-pointer"
                    >
                      Modify Appointment Slot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#2D5A47]">
                        Interactive Appointment Scheduler
                      </span>
                      <h4 className="font-serif text-2xl text-[#14241D] mt-1">
                        Schedule at {activeClinic.name}
                      </h4>
                    </div>

                    {/* Step 1: Pick Date */}
                    <div>
                      <label className="block text-xs font-semibold text-[#37473E] mb-2">
                        1. Select Preferred Date
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {activeClinic.availableDates.map((d) => {
                          const active = selectedDate === d;
                          return (
                            <button
                              key={d}
                              onClick={() => setSelectedDate(d)}
                              className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#163026] text-white border-[#163026]'
                                  : 'bg-[#FAF7F2] text-[#2E3D35] border-[#E2DAC9] hover:border-[#163026]'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Pick Morning / Afternoon Slot */}
                    <div>
                      <label className="block text-xs font-semibold text-[#37473E] mb-2">
                        2. Select Morning Fasting Lab or Afternoon MRI Window
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          '07:45 AM (Fasting Blood Panel)',
                          '08:30 AM (Fasting Blood + MRI)',
                          '10:15 AM (Fasting Lab + DEXA)',
                          '02:00 PM (Whole-Body MRI + MD Consult)',
                        ].map((slot) => {
                          const active = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-3.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#163026] text-white border-[#163026]'
                                  : 'bg-[#FAF7F2] text-[#2E3D35] border-[#E2DAC9] hover:border-[#163026]'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingConfirmed(true)}
                      className="w-full py-3.5 px-6 rounded-full text-sm font-semibold bg-[#163026] hover:bg-[#1E4033] text-white shadow-md transition-all cursor-pointer"
                    >
                      Confirm Booking ({activeClinic.name} · {selectedDate})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP COMPARISON ($499/YR VS $2,490/YR) */}
      <section id="membership" className="py-20 border-b border-[#E5DEC9] bg-[#F4EFE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.18em] text-[#2D5A47] font-semibold mb-2">
              Transparent Preventative Membership
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14241D]">
              Invest in Decades of Vibrant Healthspan
            </h2>
            <p className="text-sm text-[#4E5E55] mt-2">
              Over $15,000 in retail clinical diagnostics condensed into two clear annual
              memberships. HSA & FSA cards accepted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tier 1: Annual Lab Membership $499/yr */}
            <div className="rounded-3xl bg-white border border-[#DED6C6] p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#2D5A47] bg-[#E9F3ED] px-3 py-1 rounded-full">
                    Most Popular Baseline
                  </span>
                  <span className="text-xs text-[#64736B]">HSA / FSA Eligible</span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#14241D] mt-4">
                  Annual Lab Membership
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-[#163026]">$499</span>
                  <span className="text-sm text-[#5E6E65]">/ year ($41.50/mo)</span>
                </div>
                <p className="text-xs text-[#4E5E55] mt-2">
                  Comprehensive 110+ biomarker blood & urine panels twice a year with personalized
                  physician-written protocols.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#2E3D35]">
                  {[
                    '110+ Lab Biomarkers across Heart (ApoB, Lp(a)), Hormones, Thyroid & Insulin',
                    'Mid-year 60+ Biomarker Follow-Up Re-Test included at 6 months',
                    'Heavy Metals (Lead, Mercury), Omega-3 Index & Vitamin D3/B12/Ferritin',
                    'Interactive Longitudinal Health Dashboard & Optimal Range Tracking',
                    'Comprehensive Written MD Clinical Action Plan & Supplement Protocol',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#1E523B] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => openMembershipModal('core')}
                className="mt-8 w-full py-3.5 rounded-full text-sm font-semibold bg-[#163026] hover:bg-[#1E4033] text-white transition-all cursor-pointer"
              >
                Join Annual Lab Membership ($499/yr)
              </button>
            </div>

            {/* Tier 2: Complete MRI + Longevity Executive $2,490/yr */}
            <div className="rounded-3xl bg-[#163026] text-white border border-[#2D5A47] p-8 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#163026] bg-[#E8D5B0] px-3 py-1 rounded-full">
                    Complete Executive Diagnostics
                  </span>
                  <span className="text-xs text-[#C6D4CD]">Includes 3.0T Whole-Body MRI</span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-white mt-4">
                  Complete MRI + Longevity Executive
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-bold text-[#E8D5B0]">$2,490</span>
                  <span className="text-sm text-[#C6D4CD]">/ year</span>
                </div>
                <p className="text-xs text-[#C6D4CD] mt-2">
                  Everything in Annual Lab Membership plus annual radiation-free Whole-Body MRI,
                  DunedinPACE epigenetic clock, and 1:1 concierge MD care.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#EDE7DC]">
                  {[
                    'Everything in the $499/yr Annual Lab Membership (110+ Biomarkers 2x/yr)',
                    'Annual 45-Minute Radiation-Free 3.0T Whole-Body MRI (Brain, Chest, Abdomen, Pelvis)',
                    'DunedinPACE Epigenetic Biological Age & Multi-Organ Aging Clock',
                    'DEXA Body Composition + Visceral Fat & Bone Mineral Density Scan',
                    'Dedicated 1:1 Longevity MD Video & In-Clinic Consultations (Quarterly)',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#E8D5B0] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => openMembershipModal('executive')}
                className="mt-8 w-full py-3.5 rounded-full text-sm font-semibold bg-[#E8D5B0] hover:bg-[#F3E3C3] text-[#163026] transition-all cursor-pointer"
              >
                Reserve Complete MRI + Executive ($2,490/yr)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="py-16 border-b border-[#E5DEC9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[#14241D] text-center mb-10">
            Clinical & Membership Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white border border-[#DED6C6] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-serif text-lg font-medium text-[#14241D]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#2D5A47] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-[#4E5E55] leading-relaxed border-t border-[#F2ECE1] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL MEDICAL COMPLIANCE FOOTER */}
      <footer className="bg-[#11241C] text-[#C6D4CD] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            <div className="md:col-span-5 space-y-3">
              <div className="font-serif text-xl text-white font-semibold">
                SOLACE LONGEVITY & DIAGNOSTICS
              </div>
              <p className="text-xs text-[#9EB0A7] max-w-sm leading-relaxed">
                Preventative diagnostic medicine combining 110+ twice-yearly blood biomarkers,
                radiation-free 3.0T Whole-Body MRI, and concierge physician guidance.
              </p>
              <div className="text-[11px] text-[#D8C39A]">
                HIPAA Compliant · CLIA-Certified Partner Labs (#33D20941) · SOC2 Type II Encrypted
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <div className="text-white font-semibold uppercase tracking-wider mb-2">
                Diagnostic Panels
              </div>
              <div>Heart & ApoB Lipoproteins</div>
              <div>Hormones, Thyroid & Metabolic</div>
              <div>Graeri Liquid Biopsy & MRI</div>
              <div>DunedinPACE Epigenetic Clock</div>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs">
              <div className="text-white font-semibold uppercase tracking-wider mb-2">
                Global Sanctuaries
              </div>
              <div>New York — 458 Broome St, SoHo</div>
              <div>London — 28 Harley St, Marylebone</div>
              <div>Zurich — Bahnhofstrasse 32, Paradeplatz</div>
              <div>Lagos — 14 Adeola Odeku St, Victoria Island</div>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-[#85998F] flex flex-col sm:flex-row justify-between gap-4">
            <p>
              Medical Disclaimer: Laboratory testing and MRI imaging are ordered by licensed
              physicians in your jurisdiction. Solace Health does not replace emergency care.
            </p>
            <p>© {new Date().getFullYear()} Solace Longevity Medical Group P.C.</p>
          </div>
        </div>
      </footer>

      {/* JOIN SOLACE MEMBERSHIP BOOKING MODAL */}
      <AnimatePresence>
        {joinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[#FAF7F2] border border-[#DED6C6] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9]">
                <h4 className="font-serif text-2xl text-[#14241D]">
                  Begin Your Solace Membership
                </h4>
                <button
                  onClick={() => setJoinModalOpen(false)}
                  className="text-[#5E6E65] hover:text-[#14241D] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {memberJoined ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#E9F3ED] text-[#1E523B] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif text-xl text-[#14241D]">
                    Welcome to Solace Longevity
                  </h5>
                  <p className="text-xs text-[#4E5E55] leading-relaxed">
                    Your lab requisition for 110+ biomarkers has been issued. Check your inbox for
                    your private member portal link and clinic check-in pass.
                  </p>
                  <button
                    onClick={() => setJoinModalOpen(false)}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#163026] text-white cursor-pointer"
                  >
                    Return to Portal
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setSelectedTierModal('core')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer ${
                        selectedTierModal === 'core'
                          ? 'bg-[#163026] text-white border-[#163026]'
                          : 'bg-white text-[#14241D] border-[#DED6C6]'
                      }`}
                    >
                      <div className="text-xs font-semibold">Annual Lab</div>
                      <div className="font-serif text-lg font-bold">$499/yr</div>
                    </button>
                    <button
                      onClick={() => setSelectedTierModal('executive')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer ${
                        selectedTierModal === 'executive'
                          ? 'bg-[#163026] text-white border-[#163026]'
                          : 'bg-white text-[#14241D] border-[#DED6C6]'
                      }`}
                    >
                      <div className="text-xs font-semibold">MRI + Executive</div>
                      <div className="font-serif text-lg font-bold">$2,490/yr</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#37473E] mb-1">
                      Email Address for Requisition & Lab Portal
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D8CFC0] text-sm text-[#14241D]"
                    />
                  </div>

                  <button
                    onClick={() => setMemberJoined(true)}
                    className="w-full py-3.5 rounded-full text-sm font-semibold bg-[#163026] hover:bg-[#1E4033] text-white cursor-pointer"
                  >
                    Complete Enrollment (
                    {selectedTierModal === 'core' ? '$499/yr' : '$2,490/yr'})
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
