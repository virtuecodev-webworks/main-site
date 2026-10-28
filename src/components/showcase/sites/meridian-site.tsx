'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  BookOpen,
  Bookmark,
  Share2,
  X,
  Check,
  ArrowUpRight,
  Globe,
  Clock,
  SlidersHorizontal,
  BarChart3,
  Newspaper,
  Sparkles,
  ChevronRight,
  Volume2,
  Mail,
  MapPin,
  Printer,
  Quote,
  FileText,
  Layers,
} from 'lucide-react';

type Category =
  | 'All Dispatches'
  | 'Geopolitics'
  | 'Infrastructure'
  | 'Macroeconomics'
  | 'Architecture & Design';

interface Footnote {
  id: number;
  text: string;
  source: string;
}

interface Article {
  id: string;
  number: string;
  category: Exclude<Category, 'All Dispatches'>;
  bureau: string;
  dateline: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
    role: string;
    bureau: string;
    bio: string;
  };
  readTime: string;
  audioDurationSec: number;
  audioLabel: string;
  narrator: string;
  imageUrl: string;
  imageCaption: string;
  isLead?: boolean;
  pullQuote: string;
  keyStat: {
    value: string;
    label: string;
    context: string;
  };
  body: {
    heading?: string;
    paragraphs: string[];
  }[];
  footnotes: Footnote[];
}

interface RegionInfrastructureData {
  id: 'north-america' | 'european-union' | 'east-asia' | 'west-africa';
  name: string;
  bureauCode: string;
  headline: string;
  summary: string;
  analystName: string;
  analystTitle: string;
  analystNote: string;
  cagr: string;
  gridAdditionGw: string;
  semiFabShare: string;
  primaryBottleneck: string;
  yearlyData: {
    year: string;
    gridCapex: number; // $B
    semiCapex: number; // $B
    gwAdded: number;
  }[];
  takeaways: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'copper-meridian-grid',
    number: 'ESSAY I · COVER DISPATCH',
    category: 'Infrastructure',
    bureau: 'ZURICH & ANTOFAGASTA',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'The Copper Standard: Why High-Voltage Transmission Is the New Maritime Chokepoint',
    subtitle:
      'For seventy years, geopolitical leverage flowed through tanker straits and LNG terminals. In the age of hyperscale compute and industrial electrification, sovereign power belongs to whoever builds ultrahigh-voltage transformers and mines Andean porphyry.',
    author: {
      name: 'Henrik Lindqvist',
      role: 'Senior Infrastructure Editor',
      bureau: 'Zurich Bureau',
      bio: 'Henrik Lindqvist covers continental energy grids, metallurgical supply chains, and industrial policy from Zurich. Formerly an energy economist at ETH Zurich.',
    },
    readTime: '14 min read',
    audioDurationSec: 842,
    audioLabel: '14:02',
    narrator: 'Read by Julian Vance',
    imageUrl:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
    imageCaption:
      'Fig 1.1 — 800kV High-Voltage Direct Current (HVDC) pylons crossing the Alpine pass near Göschenen, Switzerland.',
    isLead: true,
    pullQuote:
      'We have software that thinks at the speed of light, tethered to transformer substations permitted at the speed of nineteenth-century municipal courts.',
    keyStat: {
      value: '42 Months',
      label: 'Average lead time for a 400kV grain-oriented electrical steel power transformer in 2026',
      context: 'Up from 11 months in 2019 across OECD utilities',
    },
    body: [
      {
        paragraphs: [
          'Walk through the assembly hall of Hitachi Energy’s high-voltage transformer works outside Ludvika, Sweden, and the first thing that strikes you is the silence. Despite the presence of three-hundred-ton overhead cranes and spools of enamel-coated copper conductor thicker than a dockworker’s wrist, the decisive bottleneck of the twenty-first-century economy is wound by hand. Craftsmen spend up to nine weeks insulating a single 800-kilovolt phase coil with oil-impregnated cellulose pressboard—a material whose tolerances cannot be rushed by robotic automation without risking catastrophic dielectric breakdown.',
          'Every artificial intelligence cluster in Northern Virginia, every battery gigafactory in Brandenburg, and every green-hydrogen electrolyzer in Western Australia ultimately waits in line for this room. While financial markets obsess over lithography wavelengths in Veldhoven and HBM3e packaging yields in Hsinchu, the physical ceiling on industrial growth has shifted downward into the mundane metallurgy of the grid: grain-oriented electrical steel (GOES), sulfur hexafluoride switchgear, and sub-sea mass-impregnated HVDC cables.',
        ],
      },
      {
        heading: 'I. The Arithmetic of Copper and Waiting Queues',
        paragraphs: [
          'Across the North Atlantic and East Asian industrial cores, over 2,400 gigawatts of generation and load requests currently sit in interconnection queues[1]. That figure exceeds the entire installed generation capacity of the European Union twice over. The scarcity is no longer capital or silicon; it is the physical impedance of legacy alternating-current networks designed around coal-fired radial turbines built between 1955 and 1978.',
          'In northern Chile’s Atacama plateau, where copper head grades at century-old open pits have declined below 0.58 percent, miners must now crush and float nearly twice the tonnage of rock to extract the same cathode weight as they did in 1998[2]. A single 500-megawatt hyperscale data center campus requires roughly 14,000 metric tons of refined copper across its busbars, step-down substations, and chilled-water loops.',
        ],
      },
      {
        heading: 'II. Sovereign HVDC Corridors as Statecraft',
        paragraphs: [
          'Compare two divergent models of grid sovereignty. Between 2014 and 2026, China’s State Grid Corporation commissioned thirty-eight Ultra-High-Voltage (UHV) direct and alternating current lines spanning up to 3,300 kilometers each, moving hydro and solar electrons from Sichuan and Xinjiang directly into the Yangtze River Delta with less than 6 percent line loss[3]. In Europe and North America, by contrast, trans-regional interconnectors routinely spend eleven years in environmental litigation before a single foundation caisson is poured.',
          'The countries that dominate the next three decades will treat high-voltage right-of-way and transformer metallurgy with the same strategic urgency that Victorian admiralties reserved for coaling stations. Sovereignty is no longer measured solely in barrels stored in salt caverns, but in megavolt-amperes ready on tap.',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'Combined interconnection queue backlog across PJM, ERCOT, CAISO, ENTSO-E, and National Grid ESO as of Q3 2026.',
        source: 'International Energy Agency & Lawrence Berkeley National Lab Grid Compendium (2026).',
      },
      {
        id: 2,
        text: 'Weighted average sulfide ore head grade across the top 15 Andean porphyry copper operations.',
        source: 'Cochilco Annual Statistical Yearbook, Santiago (2025–2026).',
      },
      {
        id: 3,
        text: '800kV and 1100kV UHVDC transmission efficiency benchmarks under 85% load factor.',
        source: 'ETH Zurich High Voltage Laboratory Monograph No. 19.',
      },
    ],
  },
  {
    id: 'nordic-timber-industrialism',
    number: 'ESSAY II · ARCHITECTURE & DESIGN',
    category: 'Architecture & Design',
    bureau: 'STOCKHOLM & BASEL',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'Post-Concrete Civicism: The Quiet Triumph of Precision Mass Timber in Northern Europe',
    subtitle:
      'From sixteen-storey port warehouses in Gothenburg to acoustic concert halls in Basel, robotic CNC joinery and cross-laminated spruce are replacing poured Portland cement.',
    author: {
      name: 'Clara Vonnegut-Senn',
      role: 'Architecture Critic',
      bureau: 'Basel Bureau',
      bio: 'Clara Vonnegut-Senn trained as a structural engineer at EPFL before joining The Meridian Review to cover European urbanism and material tectonic systems.',
    },
    readTime: '9 min read',
    audioDurationSec: 558,
    audioLabel: '09:18',
    narrator: 'Read by Clara Vonnegut-Senn',
    imageUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    imageCaption:
      'Fig 2.1 — Glulam and cross-laminated spruce structural bays milled to 0.3mm tolerance in Västerbotten.',
    pullQuote:
      'A modern timber building is not built on a muddy construction site; it is compiled in a forestry sawmill and assembled with torque wrenches in ten days.',
    keyStat: {
      value: '−64%',
      label: 'Embodied carbon reduction in structural frame versus C40 reinforced concrete',
      context: 'Verified across 18 Nordic municipal timber buildings (2023–2026)',
    },
    body: [
      {
        paragraphs: [
          'For nearly a century, civic seriousness in architecture was synonymous with grey shuttered concrete. Whether in post-war London council estates or Zurich university campuses, liquid stone signaled permanence. Yet concrete carries an awkward secret: it is mixed outdoors in variable weather, cured on congested urban plots, and accounts for roughly eight percent of global carbon dioxide emissions.',
          'In the forests of Västerbotten and Styria, a counter-revolution has matured from boutique pavilion experiments into heavy industrial standardization. Five-axis Hundegger CNC portals now mill thirty-meter glued-laminated spruce beams with mortise-and-tenon tolerances tighter than half a millimeter[1].',
        ],
      },
      {
        heading: 'I. The Sawmill as Semiconductor Fab',
        paragraphs: [
          'When components arrive at a building plot in Stockholm or Basel on flatbed trailers, every conduit chase, acoustic damper, and steel shear plate is already factory-installed. A crew of six carpenters with electric cranes erects an entire structural floor every seventy-two hours—reducing neighborhood construction noise by twenty decibels and eliminating seventy percent of heavy truck deliveries[2].',
          'Architecturally, the result is neither rustic chalet nor sterile glass box, but a warm, tectonic rationalism where the load path of the building remains legible to every citizen who walks through its colonnade.',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'EN 16351 structural tolerance standards for cross-laminated timber (CLT) elements.',
        source: 'Nordic Wood Industries Technical Bulletin, Stockholm (2026).',
      },
      {
        id: 2,
        text: 'Comparative site logistics audit of Sara Kulturhus (Skellefteå) and Hortus (Basel).',
        source: 'Swiss Federal Office of Energy Building Park Report (2025).',
      },
    ],
  },
  {
    id: 'atlantic-south-shipping',
    number: 'ESSAY III · GEOPOLITICS',
    category: 'Geopolitics',
    bureau: 'LAGOS & DAKAR',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'The Gulf of Guinea Deepwater Pivot: How West African Port Automation Is Redrawing Atlantic Trade',
    subtitle:
      'With Red Sea insurance premiums structurally elevated and Cape of Good Hope routing normalized, deep-draft terminals in Lekki, Tema, and Ndayane have become indispensable mid-Atlantic logistics hubs.',
    author: {
      name: 'Tunde Adebayo-Cole',
      role: 'West Africa Bureau Chief',
      bureau: 'Lagos Bureau',
      bio: 'Tunde Adebayo-Cole reports on maritime corridors, sovereign debt markets, and industrial zones across ECOWAS and the wider Atlantic basin.',
    },
    readTime: '11 min read',
    audioDurationSec: 675,
    audioLabel: '11:15',
    narrator: 'Read by Tunde Adebayo-Cole',
    imageUrl:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=85',
    imageCaption:
      'Fig 3.1 — Ship-to-shore post-Panamax gantry cranes operating at 16.5-meter draft along the Bight of Benin.',
    pullQuote:
      'Geography is only destiny when paired with a sixteen-meter dredged channel and automated customs clearance under four hours.',
    keyStat: {
      value: '24,000 TEU',
      label: 'Vessel class now berthing directly in West African deepwater terminals',
      context: 'Replacing feeder transshipment through Algeciras and Tangier Med',
    },
    body: [
      {
        paragraphs: [
          'Stand on the breakwater at Lekki Deep Sea Port sixty kilometers east of central Lagos at dawn, and the silhouettes on the horizon tell a story that maritime analysts in London and Geneva failed to model five years ago. Three 18,000-TEU container ships—vessels that once bypassed the Bight of Benin entirely because older river ports lacked draft deeper than eleven meters—are discharging cargo simultaneously under optical character recognition gantry cranes.',
          'The permanent repricing of war-risk insurance in the Bab el-Mandeb and the surge in South-South trade between Brazil, West Africa, and the Pearl River Delta have turned the Gulf of Guinea from a cul-de-sac of feeder barges into a primary mainline corridor[1].',
        ],
      },
      {
        heading: 'I. Rail Gauge and Hinterland Economics',
        paragraphs: [
          'A deepwater quay is only as productive as the standard-gauge rail line behind its customs gate. Across Senegal, Côte d’Ivoire, Ghana, and Nigeria, the decisive competition of the late 2020s is no longer coastal dredging—which private concessionaires have largely solved—but dry-port freight corridors reaching landlocked lithium, bauxite, and agricultural belts in the Sahel[2].',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'UNCTAD Review of Maritime Transport: South Atlantic Container Throughput Index (2026).',
        source: 'UNCTAD Geneva Maritime Division.',
      },
      {
        id: 2,
        text: 'Average dwell time reduction from 19.4 days (2019) to 3.8 days (2026) at automated Gulf of Guinea terminals.',
        source: 'West African Port Management Association Audit.',
      },
    ],
  },
  {
    id: 'sovereign-wealth-industrial-policy',
    number: 'ESSAY IV · MACROECONOMICS',
    category: 'Macroeconomics',
    bureau: 'LONDON & SINGAPORE',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'After the Passive Index: Why Sovereign Wealth Funds Are Buying Factories Instead of Equities',
    subtitle:
      'In a regime of persistent 4% real yields and fragmented supply chains, the world’s largest pools of patient capital are bypassing public equity indices to co-own power plants, subsea cables, and specialty chemical producers.',
    author: {
      name: 'Eleanor Vance-Sterling',
      role: 'Chief Macroeconomics Commentator',
      bureau: 'London Bureau',
      bio: 'Eleanor Vance-Sterling previously served on the Monetary Policy Research staff at the Bank of England and edits The Meridian Review’s quarterly Capital & State supplement.',
    },
    readTime: '12 min read',
    audioDurationSec: 730,
    audioLabel: '12:10',
    narrator: 'Read by Eleanor Vance-Sterling',
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    imageCaption:
      'Fig 4.1 — The City of London financial district at dusk, where long-horizon sovereign syndicates now structure bilateral industrial joint ventures.',
    pullQuote:
      'When inflation is structural and bottlenecks are physical, owning a claim on future cash flows is inferior to owning the bottleneck itself.',
    keyStat: {
      value: '$1.48T',
      label: 'Direct physical infrastructure & industrial co-investment by top 12 sovereign funds since 2023',
      context: 'A 310% increase over the preceding four-year cycle',
    },
    body: [
      {
        paragraphs: [
          'For the forty years between 1982 and 2022, institutional asset allocation rested on a seductively simple premise: secularly falling interest rates and frictionless global trade meant financial claims appreciated faster than physical replacement costs. Sovereign wealth funds from Oslo to Abu Dhabi and Singapore could harvest beta simply by holding a 60/40 portfolio of cap-weighted equities and sovereign bonds.',
          'That regime is dead. In an era defined by export controls on gallium, forty-month queues for gas turbines, and reshoring subsidies, financial liquidity cannot conjure scarce industrial capacity overnight[1]. Consequently, patient sovereign capital has pivoted from passive ownership of public securities to direct control of real physical throughput.',
        ],
      },
      {
        heading: 'I. The Return of the Chartered Industrial Syndicate',
        paragraphs: [
          'Look closely at the cap tables of Europe’s newest battery precursor refineries or Japan’s foundry expansions in Kumamoto and Hokkaido. Alongside domestic industrial ministries sit multi-decade bilateral tranches from Gulf and Asian sovereign allocators, structured not as ten-year private equity flips, but as thirty-year tolling agreements with guaranteed off-take rights[2].',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'Global Sovereign Asset Management Study: Allocation to Real Assets & Direct Industrial JVs.',
        source: 'IFSWF Annual Review (2026).',
      },
      {
        id: 2,
        text: 'Median holding period of sovereign direct infrastructure tranches increased from 8.5 years to 22 years.',
        source: 'Meridian Capital Intelligence Database.',
      },
    ],
  },
  {
    id: 'tokyo-rail-urbanism-yield',
    number: 'ESSAY V · ARCHITECTURE & DESIGN',
    category: 'Architecture & Design',
    bureau: 'TOKYO BUREAU',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'The Tokyu Principle: Why Private Railway Balance Sheets Build Better Cities Than Zoning Boards',
    subtitle:
      'How Japan’s integrated rail-and-real-estate conglomerates turned commuter transit from a municipal subsidy sinkhole into a self-financing engine of high-trust, mixed-use neighborhoods.',
    author: {
      name: 'Kenji Takahashi',
      role: 'East Asia Editor',
      bureau: 'Tokyo Bureau',
      bio: 'Kenji Takahashi writes on East Asian industrial policy, railway economics, and urban morphology from Shibuya, Tokyo.',
    },
    readTime: '10 min read',
    audioDurationSec: 612,
    audioLabel: '10:12',
    narrator: 'Read by Julian Vance',
    imageUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85',
    imageCaption:
      'Fig 5.1 — High-density, mixed-use transit-oriented fabric surrounding Shibuya and Daikanyama stations, Tokyo.',
    pullQuote:
      'American transit agencies treat the station as a concrete shelter where riders wait for a train; Japanese railway companies treat the train as an escalator into a neighborhood they curate.',
    keyStat: {
      value: '138%',
      label: 'Farebox and station-retail operating recovery ratio across Tokyo private rail operators',
      context: 'Compared with 32% average across North American metropolitan transit authorities',
    },
    body: [
      {
        paragraphs: [
          'Every weekday morning, 3.3 million passengers pass through Shinjuku Station with a clockwork serenity that borders on choreography. Even more remarkable than the ninety-second headways of the Yamanote and Tokyu Toyoko lines is the accounting ledger behind them: Tokyo’s private railway operators receive zero municipal operating subsidies, turn consistent annual profits, and maintain the most affordable housing-to-income ratio of any G7 megacity[1].',
          'The secret is land-value capture internalized within a single corporate balance sheet. When Kobayashi Ichizo pioneered the Hankyu model in Osaka a century ago, he realized a railway line is merely a loss-leading customer acquisition funnel for the neighborhoods, department stores, grocers, and apartments built above the tracks.',
        ],
      },
      {
        heading: 'I. By-Right Mixed-Use Zoning as Anti-Inflation Policy',
        paragraphs: [
          'Combined with Japan’s national twelve-tier inclusive zoning code—where nuisance levels rather than rigid single-use mandates govern construction—Tokyo permits over 140,000 new housing starts annually, more than all of England or the state of California[2].',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'Ministry of Land, Infrastructure, Transport and Tourism (MLIT) Railway Financial Yearbook 2026.',
        source: 'MLIT Tokyo.',
      },
      {
        id: 2,
        text: 'Tokyo Metropolitan Government Housing Starts vs Greater London Authority (2020–2025).',
        source: 'Meridian Urban Economics Desk.',
      },
    ],
  },
  {
    id: 'arctic-subsea-cables-svalbard',
    number: 'ESSAY VI · GEOPOLITICS',
    category: 'Geopolitics',
    bureau: 'TROMSØ & REYKJAVIK',
    dateline: 'OCTOBER 2026 · ISSUE 48',
    title: 'Dark Fiber Under Polar Ice: The Quiet Race to Route Europe-Asia Data Across the High North',
    subtitle:
      'Seeking to shave 60 milliseconds of latency between Frankfurt and Tokyo while avoiding fragile Red Sea seabed trenches, telecom consortiums are laying armored optical repeaters across the Arctic Circle.',
    author: {
      name: 'Henrik Lindqvist',
      role: 'Senior Infrastructure Editor',
      bureau: 'Zurich Bureau',
      bio: 'Henrik Lindqvist covers continental energy grids, metallurgical supply chains, and industrial policy from Zurich.',
    },
    readTime: '8 min read',
    audioDurationSec: 495,
    audioLabel: '08:15',
    narrator: 'Read by Julian Vance',
    imageUrl:
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=85',
    imageCaption:
      'Fig 6.1 — Polar cable-laying vessel staging in Tromsø fjord prior to summer ice-window deployment.',
    pullQuote:
      'Ninety-nine percent of intercontinental diplomacy, currency clearing, and cloud telemetry travels through glass fibers no thicker than a horsehair lying unguarded on the abyssal plain.',
    keyStat: {
      value: '−38 ms',
      label: 'Round-trip latency reduction between London and Tokyo via trans-Arctic routing',
      context: 'Bypassing the Suez-Malacca subsea bottleneck corridor',
    },
    body: [
      {
        paragraphs: [
          'Whenever geopolitical analysts sketch maps of global connectivity, they instinctively look toward the sky—toward low-earth-orbit satellite constellations. Yet satellites remain bandwidth-constrained annexes to the real nervous system of planet Earth: the 550 submarine fiber-optic cables resting on the ocean floor, carrying over $10 trillion in daily financial clearing.',
          'Today, more than seventeen cables squeeze through the shallow seabed of the Red Sea alongside anchor-dragging bulk carriers. In response, Nordic sovereign telecom funds and Japanese carriers have accelerated polar armored cable deployments linking northern Norway, Iceland, Alaska, and Hokkaido[1].',
        ],
      },
    ],
    footnotes: [
      {
        id: 1,
        text: 'TeleGeography Submarine Cable Map & Polar Fiber Consortium Engineering Dossier (2026).',
        source: 'Nordic Council Infrastructure Report.',
      },
    ],
  },
];

const INFRASTRUCTURE_REGIONS: RegionInfrastructureData[] = [
  {
    id: 'north-america',
    name: 'North America',
    bureauCode: 'NEW YORK · AUSTIN · MONTREAL',
    headline: 'Hyperscale Compute Demand Collides with Fragmented Regional Grid Queues',
    summary:
      'Driven by the CHIPS Act foundry wave in Arizona, Ohio, and New York alongside 45GW of new AI data center load commitments, North American capital expenditure has surged—yet inter-regional HVDC transfer capacity remains the primary constraint.',
    analystName: 'Eleanor Vance-Sterling & Henrik Lindqvist',
    analystTitle: 'Meridian Capital & Grid Desk',
    analystNote:
      'Watch PJM and ERCOT industrial behind-the-meter nuclear and natural gas co-location deals: utilities are bypassing public transmission queues via private substation interconnects.',
    cagr: '+18.4% CAGR',
    gridAdditionGw: '142 GW Added',
    semiFabShare: '24.8% Global Capex',
    primaryBottleneck: 'HV Transformer Lead Times (44 Mo)',
    yearlyData: [
      { year: '2020', gridCapex: 68, semiCapex: 24, gwAdded: 14 },
      { year: '2021', gridCapex: 74, semiCapex: 31, gwAdded: 17 },
      { year: '2022', gridCapex: 83, semiCapex: 42, gwAdded: 19 },
      { year: '2023', gridCapex: 96, semiCapex: 58, gwAdded: 22 },
      { year: '2024', gridCapex: 112, semiCapex: 74, gwAdded: 25 },
      { year: '2025', gridCapex: 131, semiCapex: 91, gwAdded: 28 },
      { year: '2026', gridCapex: 154, semiCapex: 108, gwAdded: 31 },
    ],
    takeaways: [
      'Private hyperscaler power purchase agreements now finance 38% of new US high-voltage substation upgrades.',
      'Leading-edge logic foundry construction in Phoenix and Columbus has tripled domestic ultrapure water and specialty gas pipeline investment.',
      'Cross-border hydro interconnects with Quebec and Manitoba provide the lowest-cost firm baseload in the hemisphere.',
    ],
  },
  {
    id: 'european-union',
    name: 'European Union & UK',
    bureauCode: 'ZURICH · FRANKFURT · LONDON',
    headline: 'North Sea HVDC Meshed Supergrids & Specialty Lithography Ecosystem',
    summary:
      'Europe’s industrial strategy centers on subsea North Sea wind-to-industrial-heartland interconnectors and maintaining a sovereign monopoly over extreme ultraviolet (EUV) optics, power electronics, and automated grid switchgear.',
    analystName: 'Henrik Lindqvist',
    analystTitle: 'Zurich Infrastructure Bureau',
    analystNote:
      'While energy-intensive chemical plants in the Rhine basin face structural margin pressure, Nordic and Iberian industrial zones enjoy Europe’s lowest industrial electricity tariffs.',
    cagr: '+14.2% CAGR',
    gridAdditionGw: '118 GW Added',
    semiFabShare: '16.2% Global Capex',
    primaryBottleneck: 'North-South AC Corridor Permitting',
    yearlyData: [
      { year: '2020', gridCapex: 54, semiCapex: 16, gwAdded: 12 },
      { year: '2021', gridCapex: 61, semiCapex: 21, gwAdded: 14 },
      { year: '2022', gridCapex: 72, semiCapex: 27, gwAdded: 16 },
      { year: '2023', gridCapex: 84, semiCapex: 34, gwAdded: 18 },
      { year: '2024', gridCapex: 95, semiCapex: 41, gwAdded: 20 },
      { year: '2025', gridCapex: 109, semiCapex: 48, gwAdded: 22 },
      { year: '2026', gridCapex: 124, semiCapex: 56, gwAdded: 25 },
    ],
    takeaways: [
      'Subsea HVDC cable order books at Prysmian, NKT, and Nexans are fully subscribed through late 2031.',
      'Dresden’s "Silicon Saxony" cluster now anchors 42% of European automotive and industrial power-semiconductor wafer output.',
      'Cross-Alpine pumped-storage hydro in Switzerland and Austria acts as the indispensable synchronous battery for continental grids.',
    ],
  },
  {
    id: 'east-asia',
    name: 'East Asia',
    bureauCode: 'TOKYO · TAIPEI · SEOUL',
    headline: 'Ultra-High-Voltage Backbone & The Unrivaled Advanced Packaging Foundry Core',
    summary:
      'East Asia remains the undisputed manufacturing floor of both sub-2nm silicon lithography and ultrahigh-voltage grid hardware, backed by coordinated state utility balance sheets and dense industrial clusters.',
    analystName: 'Kenji Takahashi',
    analystTitle: 'Tokyo Bureau Chief',
    analystNote:
      'Japan’s Kyushu and Hokkaido semiconductor renaissance is directly synchronized with nuclear reactor restarts and 500kV trunk line reinforcements.',
    cagr: '+21.6% CAGR',
    gridAdditionGw: '264 GW Added',
    semiFabShare: '54.5% Global Capex',
    primaryBottleneck: 'Coastal Industrial Water & LNG Baseload',
    yearlyData: [
      { year: '2020', gridCapex: 92, semiCapex: 64, gwAdded: 28 },
      { year: '2021', gridCapex: 104, semiCapex: 79, gwAdded: 32 },
      { year: '2022', gridCapex: 118, semiCapex: 94, gwAdded: 36 },
      { year: '2023', gridCapex: 136, semiCapex: 108, gwAdded: 40 },
      { year: '2024', gridCapex: 158, semiCapex: 129, gwAdded: 45 },
      { year: '2025', gridCapex: 182, semiCapex: 151, gwAdded: 50 },
      { year: '2026', gridCapex: 210, semiCapex: 176, gwAdded: 56 },
    ],
    takeaways: [
      'Over 54% of global semiconductor wafer fabrication and 78% of advanced CoWoS/HBM packaging capacity resides within a 1,400km East Asian arc.',
      'Commissioning speed for 500kV–1100kV transmission corridors averages 28 months—less than a third of Western OECD timelines.',
      'Domestic production of grain-oriented electrical steel (Nippon Steel, POSCO, Baowu) insulates local utilities from transformer import bottlenecks.',
    ],
  },
  {
    id: 'west-africa',
    name: 'West Africa',
    bureauCode: 'LAGOS · ACCRA · ABIDJAN',
    headline: 'Captive Industrial Microgrids, Subsea Cable Landings & Critical Mineral Processing',
    summary:
      'Bypassing legacy national utilities, West Africa’s industrial corridors are scaling private gas-and-solar captive microgrids alongside high-capacity Atlantic subsea fiber landings and bauxite/lithium beneficiation plants.',
    analystName: 'Tunde Adebayo-Cole',
    analystTitle: 'Lagos Bureau Chief',
    analystNote:
      ' Nigeria’s Electricity Act decentralization allowing state-level wholesale markets and private bilateral industrial grids is unlocking the fastest private generation buildout on the continent.',
    cagr: '+26.8% CAGR',
    gridAdditionGw: '29 GW Added',
    semiFabShare: '4.5% Critical Minerals & Edge',
    primaryBottleneck: 'Sovereign FX Liquidity & Distribution Losses',
    yearlyData: [
      { year: '2020', gridCapex: 9, semiCapex: 2, gwAdded: 2.1 },
      { year: '2021', gridCapex: 11, semiCapex: 3, gwAdded: 2.6 },
      { year: '2022', gridCapex: 14, semiCapex: 4, gwAdded: 3.3 },
      { year: '2023', gridCapex: 19, semiCapex: 6, gwAdded: 4.1 },
      { year: '2024', gridCapex: 25, semiCapex: 9, gwAdded: 5.0 },
      { year: '2025', gridCapex: 33, semiCapex: 13, gwAdded: 5.8 },
      { year: '2026', gridCapex: 44, semiCapex: 18, gwAdded: 6.9 },
    ],
    takeaways: [
      'Private industrial estates in Ogun, Lekki, and Tema operate at 99.4% uptime via ring-fenced combined-cycle gas and solar-storage microgrids.',
      '2Africa and Equiano subsea cable landings in Lagos and Accra have catalyzed a 4.2x expansion in Tier-III carrier-neutral data center capacity.',
      'Local value-addition mandates in Guinea, Ghana, and Nigeria are shifting exports from raw ore toward refined alumina and battery-grade lithium carbonate.',
    ],
  },
];

interface SubscriptionTier {
  id: string;
  name: string;
  badge?: string;
  price: string;
  cadence: string;
  billingNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'digital',
    name: 'Digital Access',
    price: '$12',
    cadence: '/ month',
    billingNote: 'Billed monthly or $120 annually',
    description:
      'Complete digital access to every dispatch, interactive infrastructure dataset, and 24/7 narrated audio essays.',
    features: [
      'Unlimited access to all web essays & Issue 01–48 archives',
      'Full Meridian Radio 24/7 narrated audio essay stream',
      'Weekly "Sunday Bureau Briefing" macroeconomic ledger',
      'Interactive Global Infrastructure & Capex Data Explorer',
    ],
    ctaLabel: 'Select Digital Access',
  },
  {
    id: 'print-digital',
    name: 'Print + Digital Quarterly',
    badge: 'MOST SUBSCRIBED · GLOBAL COURIER',
    price: '$29',
    cadence: '/ month',
    billingNote: 'Includes 4 sewn-spine print volumes per year',
    description:
      'Our flagship 240-page linen-bound quarterly journal printed in Zurich on 70gsm Munken Lynx paper, delivered worldwide.',
    features: [
      '4 collectable 240-page print editions shipped via tracked courier',
      'Fold-out cartographic infrastructure maps in every print issue',
      'Complete Digital Access + Meridian Radio lossless audio stream',
      'Complimentary guest passes to Zurich, London & Tokyo salon briefings',
    ],
    ctaLabel: 'Subscribe Print + Digital',
    highlighted: true,
  },
  {
    id: 'patron',
    name: 'Founding Patron',
    badge: 'INSTITUTIONAL & COLLECTOR EDITION',
    price: '$240',
    cadence: '/ year',
    billingNote: 'Numbered slipcase edition + research briefings',
    description:
      'For family offices, industrial strategists, and serious collectors supporting independent long-form field reporting.',
    features: [
      'Numbered clothbound slipcase print editions + archival slipcase',
      'Direct quarterly roundtable calls with Meridian Bureau Chiefs',
      'Downloadable raw CSV/JSON series from our Infrastructure Data Desk',
      '2 complimentary gift subscriptions for colleagues or students',
    ],
    ctaLabel: 'Become a Founding Patron',
  },
];

function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MeridianEditorialSite() {
  // Navigation & filter state
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Dispatches');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    'copper-meridian-grid',
    'sovereign-wealth-industrial-policy',
  ]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Full Article Reader Modal state
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readerTheme, setReaderTheme] = useState<'cream' | 'sepia' | 'night'>('cream');
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Persistent Audio Player state (Meridian Radio 24/7)
  const [currentAudioArticle, setCurrentAudioArticle] = useState<Article>(ARTICLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgressSec, setAudioProgressSec] = useState(148);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5>(1);

  // Interactive Global Infrastructure Data Essay state
  const [selectedRegionId, setSelectedRegionId] =
    useState<RegionInfrastructureData['id']>('north-america');
  const [chartMetricMode, setChartMetricMode] = useState<'capex' | 'gw'>('capex');

  // Subscription & Checkout Modal state
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS[1]);
  const [subscriberName, setSubscriberName] = useState('Dr. Alistair Finch');
  const [subscriberEmail, setSubscriberEmail] = useState('a.finch@zurich-macro.ch');
  const [subscriberCity, setSubscriberCity] = useState('Zurich / London');
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  // Audio player timer effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAudioProgressSec((prev) => {
        const next = prev + playbackSpeed;
        if (next >= currentAudioArticle.audioDurationSec) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentAudioArticle]);

  const handleListenArticle = (article: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentAudioArticle.id === article.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentAudioArticle(article);
      setAudioProgressSec(0);
      setIsPlaying(true);
    }
  };

  const handleSkipTrack = (direction: 'prev' | 'next') => {
    const idx = ARTICLES.findIndex((a) => a.id === currentAudioArticle.id);
    const nextIdx =
      direction === 'next'
        ? (idx + 1) % ARTICLES.length
        : (idx - 1 + ARTICLES.length) % ARTICLES.length;
    setCurrentAudioArticle(ARTICLES[nextIdx]);
    setAudioProgressSec(0);
    setIsPlaying(true);
  };

  const toggleCycleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1));
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All Dispatches' || article.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.subtitle.toLowerCase().includes(q) ||
        article.bureau.toLowerCase().includes(q) ||
        article.author.name.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q);
      const matchesSaved = !showSavedOnly || bookmarkedIds.includes(article.id);
      return matchesCategory && matchesQuery && matchesSaved;
    });
  }, [selectedCategory, searchQuery, showSavedOnly, bookmarkedIds]);

  const leadArticle = ARTICLES[0];
  const secondaryArticles = filteredArticles.filter((a) => a.id !== leadArticle.id);
  const activeRegion =
    INFRASTRUCTURE_REGIONS.find((r) => r.id === selectedRegionId) || INFRASTRUCTURE_REGIONS[0];

  const openSubscribeWithTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setSubscriptionConfirmed(false);
    setSubscribeModalOpen(true);
  };

  const handleCopyCitation = (article: Article) => {
    const citation = `${article.author.name}, "${article.title}," The Meridian Review, Issue No. 48 (Autumn/Winter 2026), ${article.bureau}.`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(citation).catch(() => {});
    }
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2600);
  };

  const categories: Category[] = [
    'All Dispatches',
    'Geopolitics',
    'Infrastructure',
    'Macroeconomics',
    'Architecture & Design',
  ];

  return (
    <div className="min-h-screen bg-[#F6F2E9] text-[#141311] selection:bg-[#C83E2B] selection:text-white font-sans antialiased">
      {/* 1. TOP GLOBAL BUREAU TELETYPE STRIP */}
      <div className="bg-[#141311] text-[#EAE4D7] border-b border-[#2C2A26] text-[11px] font-mono tracking-wider">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#C83E2B] text-white font-semibold uppercase tracking-widest text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              BUREAU WIRE
            </span>
            <span>
              LONDON 14°C · ZURICH 11°C · TOKYO 19°C · LAGOS 29°C · NEW YORK 16°C · ISSUE NO. 48 —
              AUTUMN/WINTER
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-[#B5AFA2]">
            <span>PRINT ISSN 2634-891X</span>
            <span>·</span>
            <button
              onClick={() => {
                setShowSavedOnly((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1.5 transition-colors ${
                showSavedOnly ? 'text-[#E86F5C] font-semibold' : 'hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>READING LIST ({bookmarkedIds.length})</span>
            </button>
            <span>·</span>
            <button
              onClick={() => openSubscribeWithTier(SUBSCRIPTION_TIERS[1])}
              className="text-[#EAE4D7] underline decoration-[#C83E2B] underline-offset-4 hover:text-white font-semibold"
            >
              PATRON & PRINT SUBSCRIPTIONS
            </button>
          </div>
        </div>
      </div>

      {/* 2. PERSISTENT MERIDIAN RADIO 24/7 AUDIO ESSAY BAR */}
      <div className="sticky top-0 z-40 bg-[#EFEADE]/95 backdrop-blur-md border-b border-[#141311]/20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Station Identity + Current Essay Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#141311] text-[#F6F2E9] text-[10px] font-mono uppercase tracking-widest shrink-0">
              <Headphones className="w-3.5 h-3.5 text-[#C83E2B]" />
              <span>MERIDIAN RADIO 24/7</span>
            </div>

            {/* Animated Waveform Bars */}
            <div className="hidden sm:flex items-end gap-0.5 h-4 px-1 shrink-0" aria-hidden="true">
              {[0.55, 0.9, 0.4, 0.8, 1, 0.6, 0.75, 0.45].map((height, i) => (
                <motion.span
                  key={i}
                  animate={
                    isPlaying
                      ? {
                          scaleY: [0.3, height, 0.45, 0.95, 0.35],
                        }
                      : { scaleY: 0.25 }
                  }
                  transition={
                    isPlaying
                      ? {
                          repeat: Infinity,
                          duration: 0.9 + (i % 3) * 0.2,
                          ease: 'easeInOut',
                        }
                      : { duration: 0.2 }
                  }
                  className="w-0.5 h-4 bg-[#C83E2B] origin-bottom block"
                />
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#5B564E] truncate">
                <span className="uppercase font-semibold text-[#C83E2B]">
                  {isPlaying ? 'NOW NARRATING' : 'AUDIO ESSAY QUEUED'}
                </span>
                <span>·</span>
                <span className="truncate">{currentAudioArticle.narrator}</span>
              </div>
              <button
                onClick={() => setActiveArticle(currentAudioArticle)}
                className="text-left text-xs sm:text-sm font-serif font-medium text-[#141311] hover:text-[#C83E2B] truncate block max-w-xl transition-colors"
              >
                {currentAudioArticle.title}
              </button>
            </div>
          </div>

          {/* Right: Transport Controls, Scrub Bar & Speed Toggle */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSkipTrack('prev')}
                title="Previous Audio Essay"
                className="p-1.5 text-[#141311]/70 hover:text-[#141311] hover:bg-[#141311]/5 rounded transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-[#141311] text-[#F6F2E9] hover:bg-[#C83E2B] flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pause essay audio' : 'Play essay audio'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={() => handleSkipTrack('next')}
                title="Next Audio Essay"
                className="p-1.5 text-[#141311]/70 hover:text-[#141311] hover:bg-[#141311]/5 rounded transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Scrub Bar */}
            <div className="flex items-center gap-2.5 flex-1 sm:w-60">
              <span className="text-[11px] font-mono tabular-nums text-[#5B564E] w-10 text-right">
                {formatSeconds(audioProgressSec)}
              </span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickRatio = Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width)
                  );
                  setAudioProgressSec(Math.floor(clickRatio * currentAudioArticle.audioDurationSec));
                }}
                className="relative h-2 flex-1 bg-[#141311]/15 cursor-pointer group rounded-full overflow-hidden"
                title="Click anywhere to scrub audio essay"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#C83E2B] transition-all duration-200"
                  style={{
                    width: `${Math.min(
                      100,
                      (audioProgressSec / currentAudioArticle.audioDurationSec) * 100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[#5B564E] w-10">
                {formatSeconds(currentAudioArticle.audioDurationSec)}
              </span>
            </div>

            <button
              onClick={toggleCycleSpeed}
              className="px-2 py-1 border border-[#141311]/25 text-[11px] font-mono font-semibold text-[#141311] hover:border-[#141311] transition-colors shrink-0"
              title="Toggle Narration Speed"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* 3. NEWSPAPER / MAGAZINE MASTHEAD HEADER */}
      <header className="border-b-2 border-[#141311] bg-[#F6F2E9]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8 pb-6">
          {/* Top Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pb-6 border-b border-[#141311]/15">
            {/* Left Editorial Ear */}
            <div className="hidden md:flex items-center gap-3.5">
              <div className="w-11 h-11 border border-[#141311]/30 flex items-center justify-center bg-[#EFEADE] shrink-0">
                <Globe className="w-5 h-5 text-[#C83E2B]" />
              </div>
              <div className="text-xs leading-snug">
                <p className="font-mono uppercase tracking-widest text-[10px] text-[#5B564E]">
                  QUARTERLY PRINT & DIGITAL JOURNAL
                </p>
                <p className="font-serif italic text-[#141311]">
                  Geopolitics, Industrial Architecture & The Material Economy
                </p>
              </div>
            </div>

            {/* Center Masthead Emblem */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#5B564E] mb-1.5">
                <span>EST. MMXVIII</span>
                <span>·</span>
                <span>ZURICH · LONDON · TOKYO · LAGOS</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] font-normal tracking-tight text-[#141311] leading-none">
                THE MERIDIAN REVIEW
              </h1>
            </div>

            {/* Right Subscription Ear */}
            <div className="flex items-center justify-center md:justify-end gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#C83E2B] font-semibold">
                  VOLUME XII · ISSUE 48
                </p>
                <p className="text-xs text-[#5B564E]">240 Pages · Uncoated Archival Print</p>
              </div>
              <button
                onClick={() => openSubscribeWithTier(SUBSCRIPTION_TIERS[1])}
                className="px-4 py-2.5 bg-[#141311] text-[#F6F2E9] hover:bg-[#C83E2B] text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0"
              >
                <span>Subscribe</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Section Filter Navigation + Live Search Bar */}
          <div className="pt-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <nav
              aria-label="Editorial Sections"
              className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0"
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat && !showSavedOnly;
                const count =
                  cat === 'All Dispatches'
                    ? ARTICLES.length
                    : ARTICLES.filter((a) => a.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowSavedOnly(false);
                    }}
                    className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#141311] text-[#F6F2E9] font-semibold'
                        : 'text-[#3C3934] hover:bg-[#141311]/10'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] ${
                        active ? 'text-[#C83E2B]' : 'text-[#7A7469]'
                      }`}
                    >
                      [{count}]
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowSavedOnly((prev) => !prev)}
                className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  showSavedOnly
                    ? 'bg-[#C83E2B] text-white font-semibold'
                    : 'text-[#3C3934] hover:bg-[#141311]/10'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({bookmarkedIds.length})</span>
              </button>
            </nav>

            {/* Live Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-[#5B564E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search essays, bureaus, authors..."
                className="w-full pl-10 pr-8 py-2 bg-[#EFEADE] border border-[#141311]/25 text-xs font-mono text-[#141311] placeholder:text-[#7A7469] focus:outline-none focus:border-[#141311]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B564E] hover:text-[#141311]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 4. MAIN EDITORIAL FRONT PAGE */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        {/* LEAD COVER ESSAY (Displayed when on All Dispatches or matching filter) */}
        {(selectedCategory === 'All Dispatches' ||
          selectedCategory === leadArticle.category) &&
          !showSavedOnly &&
          !searchQuery && (
            <section className="pb-12 mb-12 border-b-2 border-[#141311]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left Column: Cover Essay Typography & Pull Data (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                      <span className="px-2.5 py-1 bg-[#C83E2B] text-white font-mono text-[10px] uppercase tracking-widest font-semibold">
                        {leadArticle.number}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest text-[#5B564E]">
                        {leadArticle.bureau}
                      </span>
                      <span className="text-[#5B564E]">·</span>
                      <span className="font-mono text-xs text-[#5B564E]">{leadArticle.readTime}</span>
                    </div>

                    <h2
                      onClick={() => setActiveArticle(leadArticle)}
                      className="font-serif text-3xl sm:text-5xl lg:text-[52px] leading-[1.08] tracking-tight text-[#141311] hover:text-[#C83E2B] transition-colors cursor-pointer mb-5"
                    >
                      {leadArticle.title}
                    </h2>

                    <p className="font-serif text-lg sm:text-xl leading-relaxed text-[#383530] mb-6">
                      {leadArticle.subtitle}
                    </p>

                    {/* First paragraph preview with classic editorial drop-cap */}
                    <p className="text-sm sm:text-base leading-relaxed text-[#2C2A26] mb-6 line-clamp-4 font-serif">
                      <span className="float-left font-serif text-5xl leading-none pr-3 pt-1 text-[#C83E2B] font-semibold">
                        W
                      </span>
                      {leadArticle.body[0].paragraphs[0].slice(1)}
                    </p>
                  </div>

                  {/* Author & Interactive Actions Bar */}
                  <div className="pt-5 border-t border-[#141311]/15 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-[#141311] font-semibold">
                        BY {leadArticle.author.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-[#5B564E]">{leadArticle.author.role}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => setActiveArticle(leadArticle)}
                        className="px-4 py-2.5 bg-[#141311] text-[#F6F2E9] hover:bg-[#C83E2B] text-xs font-mono uppercase tracking-widest transition-colors inline-flex items-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Full Essay</span>
                      </button>

                      <button
                        onClick={(e) => handleListenArticle(leadArticle, e)}
                        className={`px-3.5 py-2.5 border text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-2 ${
                          currentAudioArticle.id === leadArticle.id && isPlaying
                            ? 'bg-[#C83E2B] text-white border-[#C83E2B]'
                            : 'border-[#141311]/30 text-[#141311] hover:border-[#141311] bg-[#EFEADE]'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>
                          {currentAudioArticle.id === leadArticle.id && isPlaying
                            ? 'Playing Audio'
                            : `Listen (${leadArticle.audioLabel})`}
                        </span>
                      </button>

                      <button
                        onClick={(e) => toggleBookmark(leadArticle.id, e)}
                        className="p-2.5 border border-[#141311]/25 hover:border-[#141311] text-[#141311] transition-colors"
                        title="Save to Reading List"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            bookmarkedIds.includes(leadArticle.id)
                              ? 'fill-[#C83E2B] text-[#C83E2B]'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Lead Visual + Key Metric Callout (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    onClick={() => setActiveArticle(leadArticle)}
                    className="group relative overflow-hidden border border-[#141311]/25 bg-[#141311] cursor-pointer"
                  >
                    <img
                      src={leadArticle.imageUrl}
                      alt={leadArticle.title}
                      className="w-full h-[340px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#141311]/85 backdrop-blur-sm text-[#F6F2E9] font-mono text-[10px] uppercase tracking-widest">
                      CLICK TO OPEN READER
                    </div>
                  </div>
                  <p className="text-xs font-mono text-[#5B564E] leading-relaxed border-l-2 border-[#C83E2B] pl-3">
                    {leadArticle.imageCaption}
                  </p>

                  {/* Editorial Key Stat Box */}
                  <div className="p-5 bg-[#EFEADE] border border-[#141311]/20">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#C83E2B] font-semibold">
                        KEY DISPATCH METRIC
                      </span>
                      <span className="font-mono text-[10px] text-[#5B564E]">FIG. 1.2</span>
                    </div>
                    <p className="font-serif text-3xl font-semibold text-[#141311] mb-1">
                      {leadArticle.keyStat.value}
                    </p>
                    <p className="text-xs font-medium text-[#2C2A26] mb-1">
                      {leadArticle.keyStat.label}
                    </p>
                    <p className="text-[11px] font-mono text-[#5B564E]">
                      {leadArticle.keyStat.context}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* 5. DISPATCHES GRID (All 6 Detailed Essays accessible & filterable) */}
        <section className="mb-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-3 border-b border-[#141311]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C83E2B] font-semibold mb-1">
                ISSUE NO. 48 · TABLE OF CONTENTS
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#141311]">
                {showSavedOnly
                  ? 'Saved Reading List'
                  : selectedCategory === 'All Dispatches'
                  ? 'Current Bureau Dispatches & Long-Form Essays'
                  : `${selectedCategory} Dispatches`}
              </h3>
            </div>
            <p className="font-mono text-xs text-[#5B564E]">
              Showing {filteredArticles.length} of {ARTICLES.length} essays · Click any dispatch to
              read full text
            </p>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center bg-[#EFEADE] border border-[#141311]/20">
              <p className="font-serif text-xl text-[#141311] mb-2">
                No dispatches match your current filter.
              </p>
              <p className="text-xs font-mono text-[#5B564E] mb-4">
                Try clearing your search query or switching back to All Dispatches.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All Dispatches');
                  setSearchQuery('');
                  setShowSavedOnly(false);
                }}
                className="px-4 py-2 bg-[#141311] text-[#F6F2E9] text-xs font-mono uppercase tracking-widest"
              >
                Reset Archive Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery || showSavedOnly || selectedCategory !== 'All Dispatches'
                ? filteredArticles
                : secondaryArticles.concat([leadArticle])
              ).map((article) => {
                const isAudioActive = currentAudioArticle.id === article.id && isPlaying;
                const isSaved = bookmarkedIds.includes(article.id);
                return (
                  <article
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="group bg-[#FAF7F0] border border-[#141311]/20 hover:border-[#141311] transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Image + Category Tag */}
                      <div className="relative h-52 overflow-hidden border-b border-[#141311]/15 bg-[#141311]">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141311]/90 text-[#F6F2E9] font-mono text-[10px] uppercase tracking-widest">
                          {article.category}
                        </div>
                        <button
                          onClick={(e) => toggleBookmark(article.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 bg-[#FAF7F0]/90 hover:bg-white flex items-center justify-center border border-[#141311]/20 transition-colors"
                          title="Bookmark essay"
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isSaved ? 'fill-[#C83E2B] text-[#C83E2B]' : 'text-[#141311]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Essay Metadata & Headline */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-[#5B564E] mb-2">
                          <span>{article.bureau}</span>
                          <span>{article.readTime}</span>
                        </div>

                        <h4 className="font-serif text-xl sm:text-2xl leading-snug text-[#141311] group-hover:text-[#C83E2B] transition-colors mb-3">
                          {article.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-[#3C3934] leading-relaxed line-clamp-3 mb-4">
                          {article.subtitle}
                        </p>

                        {/* Pull Quote Snippet */}
                        <blockquote className="border-l-2 border-[#C83E2B] pl-3 py-1 my-3 text-xs font-serif italic text-[#4A4640]">
                          “{article.pullQuote}”
                        </blockquote>
                      </div>
                    </div>

                    {/* Card Footer with Author + Read & Listen Triggers */}
                    <div className="px-6 py-4 bg-[#EFEADE]/70 border-t border-[#141311]/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] font-semibold text-[#141311] truncate">
                          {article.author.name}
                        </p>
                        <p className="font-mono text-[10px] text-[#5B564E] truncate">
                          {article.author.bureau}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleListenArticle(article, e)}
                          className={`px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider border transition-colors inline-flex items-center gap-1.5 ${
                            isAudioActive
                              ? 'bg-[#C83E2B] text-white border-[#C83E2B]'
                              : 'border-[#141311]/25 text-[#141311] hover:border-[#141311] bg-[#FAF7F0]'
                          }`}
                        >
                          <Headphones className="w-3 h-3" />
                          <span>{isAudioActive ? 'Playing' : 'Listen'}</span>
                        </button>

                        <span className="px-2.5 py-1.5 bg-[#141311] text-[#F6F2E9] group-hover:bg-[#C83E2B] text-[11px] font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1">
                          <span>Read</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. INTERACTIVE GLOBAL INFRASTRUCTURE DATA ESSAY (2020–2026) */}
        <section className="mb-16 border-2 border-[#141311] bg-[#EFEADE]">
          {/* Section Banner */}
          <div className="bg-[#141311] text-[#F6F2E9] px-6 sm:px-10 py-6 border-b border-[#141311] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#E86F5C] mb-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>INTERACTIVE DATA DISPATCH · MERIDIAN ECONOMETRICS DESK</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl text-white">
                The Sovereign Capex Ledger: Grid & Semiconductor Investment (2020–2026)
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setChartMetricMode('capex')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                  chartMetricMode === 'capex'
                    ? 'bg-[#C83E2B] border-[#C83E2B] text-white font-semibold'
                    : 'border-white/25 text-[#EAE4D7] hover:border-white'
                }`}
              >
                Capex ($ Billions)
              </button>
              <button
                onClick={() => setChartMetricMode('gw')}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors ${
                  chartMetricMode === 'gw'
                    ? 'bg-[#C83E2B] border-[#C83E2B] text-white font-semibold'
                    : 'border-white/25 text-[#EAE4D7] hover:border-white'
                }`}
              >
                Grid Capacity Added (GW)
              </button>
            </div>
          </div>

          {/* Region Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#141311]/20 bg-[#F6F2E9]">
            {INFRASTRUCTURE_REGIONS.map((region) => {
              const isSelected = region.id === activeRegion.id;
              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`p-4 sm:p-5 text-left border-r border-b lg:border-b-0 border-[#141311]/15 transition-all ${
                    isSelected
                      ? 'bg-[#EFEADE] border-t-4 border-t-[#C83E2B]'
                      : 'hover:bg-[#EFEADE]/50'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#5B564E] mb-1">
                    {region.bureauCode}
                  </p>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-lg sm:text-xl font-medium text-[#141311]">
                      {region.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#C83E2B]">
                      {region.cagr}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Chart & Analyst Commentary Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 7 Columns: Animated Bar Chart (2020–2026) & Summary KPIs */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#C83E2B] font-semibold mb-1">
                  REGIONAL FOCUS: {activeRegion.name.toUpperCase()}
                </p>
                <h4 className="font-serif text-2xl sm:text-3xl text-[#141311] mb-2">
                  {activeRegion.headline}
                </h4>
                <p className="text-sm text-[#383530] leading-relaxed">{activeRegion.summary}</p>
              </div>

              {/* 4 KPI Strip Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#FAF7F0] border border-[#141311]/20">
                  <p className="font-mono text-[10px] uppercase text-[#5B564E]">2020–26 GROWTH</p>
                  <p className="font-serif text-xl font-semibold text-[#141311] mt-0.5">
                    {activeRegion.cagr}
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F0] border border-[#141311]/20">
                  <p className="font-mono text-[10px] uppercase text-[#5B564E]">CUMULATIVE GRID</p>
                  <p className="font-serif text-xl font-semibold text-[#141311] mt-0.5">
                    {activeRegion.gridAdditionGw}
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F0] border border-[#141311]/20">
                  <p className="font-mono text-[10px] uppercase text-[#5B564E]">SEMI CAPEX SHARE</p>
                  <p className="font-serif text-xl font-semibold text-[#141311] mt-0.5">
                    {activeRegion.semiFabShare}
                  </p>
                </div>
                <div className="p-3.5 bg-[#FAF7F0] border border-[#141311]/20">
                  <p className="font-mono text-[10px] uppercase text-[#C83E2B] font-semibold">
                    PRIMARY CONSTRAINT
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#141311] mt-1 leading-tight">
                    {activeRegion.primaryBottleneck}
                  </p>
                </div>
              </div>

              {/* Bar Chart Canvas */}
              <div className="p-6 bg-[#FAF7F0] border border-[#141311]/25">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="font-mono text-xs uppercase tracking-wider text-[#141311] font-semibold">
                    {chartMetricMode === 'capex'
                      ? 'Annual Capital Expenditure ($ Billions USD)'
                      : 'Annual Transmission & Generation Capacity Added (GW)'}
                  </div>
                  {chartMetricMode === 'capex' ? (
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#141311] inline-block" />
                        <span>HV Grid & Transmission ($B)</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#C83E2B] inline-block" />
                        <span>Semiconductor Fabs ($B)</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 h-3 bg-[#A67C37] inline-block" />
                      <span>New Interconnected Gigawatts (GW)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-60 pt-8 pb-2 border-b border-[#141311]/20">
                  {activeRegion.yearlyData.map((item) => {
                    const totalCapex = item.gridCapex + item.semiCapex;
                    // Max scale across regions: East Asia 2026 totalCapex is 386; max GW is 60
                    const maxCapexScale = 400;
                    const maxGwScale = 60;

                    const gridHeightPct = Math.round((item.gridCapex / maxCapexScale) * 100);
                    const semiHeightPct = Math.round((item.semiCapex / maxCapexScale) * 100);
                    const gwHeightPct = Math.round((item.gwAdded / maxGwScale) * 100);

                    return (
                      <div
                        key={item.year}
                        className="flex flex-col items-center h-full justify-end group"
                      >
                        <div className="text-[10px] font-mono font-semibold text-[#141311] mb-1.5 tabular-nums">
                          {chartMetricMode === 'capex' ? `$${totalCapex}B` : `${item.gwAdded}GW`}
                        </div>

                        <div className="w-full max-w-[44px] h-44 flex flex-col justify-end bg-[#141311]/5 overflow-hidden">
                          {chartMetricMode === 'capex' ? (
                            <>
                              <motion.div
                                key={`${activeRegion.id}-${item.year}-semi`}
                                initial={{ height: 0 }}
                                animate={{ height: `${semiHeightPct}%` }}
                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                className="w-full bg-[#C83E2B] border-b border-white/20"
                                title={`Semiconductor Capex: $${item.semiCapex}B`}
                              />
                              <motion.div
                                key={`${activeRegion.id}-${item.year}-grid`}
                                initial={{ height: 0 }}
                                animate={{ height: `${gridHeightPct}%` }}
                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                className="w-full bg-[#141311]"
                                title={`Grid Capex: $${item.gridCapex}B`}
                              />
                            </>
                          ) : (
                            <motion.div
                              key={`${activeRegion.id}-${item.year}-gw`}
                              initial={{ height: 0 }}
                              animate={{ height: `${gwHeightPct}%` }}
                              transition={{ duration: 0.45, ease: 'easeOut' }}
                              className="w-full bg-[#A67C37]"
                              title={`Grid Capacity Added: ${item.gwAdded} GW`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Year Axis Labels */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-2.5 text-center">
                  {activeRegion.yearlyData.map((item) => (
                    <div key={item.year} className="font-mono text-xs text-[#5B564E]">
                      {item.year}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Senior Analyst Briefing & Key Takeaways */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-[#FAF7F0] border border-[#141311]/25">
                <div className="flex items-center justify-between border-b border-[#141311]/15 pb-3 mb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#C83E2B] font-semibold">
                      BUREAU ANALYST DISPATCH
                    </p>
                    <p className="font-serif text-lg font-medium text-[#141311]">
                      {activeRegion.analystName}
                    </p>
                    <p className="font-mono text-[11px] text-[#5B564E]">
                      {activeRegion.analystTitle}
                    </p>
                  </div>
                  <SlidersHorizontal className="w-5 h-5 text-[#141311]/50" />
                </div>

                <blockquote className="font-serif italic text-base text-[#141311] leading-relaxed mb-5 bg-[#EFEADE] p-4 border-l-2 border-[#C83E2B]">
                  “{activeRegion.analystNote}”
                </blockquote>

                <h5 className="font-mono text-xs uppercase tracking-wider text-[#141311] font-semibold mb-3">
                  STRUCTURAL TAKEAWAYS (2026 FIELD AUDIT)
                </h5>
                <ul className="space-y-3">
                  {activeRegion.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2C2A26] leading-relaxed">
                      <span className="font-mono text-[11px] font-bold text-[#C83E2B] mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Editorial Callout to Read Full Infrastructure Essay */}
              <div className="p-5 bg-[#141311] text-[#F6F2E9] flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#E86F5C]">
                    COMPANION COVER ESSAY
                  </p>
                  <p className="font-serif text-base text-white mt-0.5">
                    Read Henrik Lindqvist’s full 14-minute investigation on HVDC transformers
                  </p>
                </div>
                <button
                  onClick={() => setActiveArticle(ARTICLES[0])}
                  className="px-3.5 py-2 bg-[#C83E2B] hover:bg-[#b23422] text-white font-mono text-xs uppercase tracking-wider shrink-0 transition-colors"
                >
                  Open Essay
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PRINT + DIGITAL SUBSCRIPTION TIERS SECTION */}
        <section id="meridian-subscribe" className="mb-16 pt-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#C83E2B] font-semibold mb-2">
              INDEPENDENT · READER-FINANCED · ZERO ALGORITHMIC ADS
            </p>
            <h3 className="font-serif text-3xl sm:text-5xl text-[#141311] mb-3">
              Subscribe to The Meridian Review
            </h3>
            <p className="font-serif text-base sm:text-lg text-[#4A4640]">
              Choose between instant digital access with 24/7 narrated audio essays, or our
              collectable 240-page linen-bound quarterly print journal shipped from Zurich.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`flex flex-col justify-between p-7 sm:p-8 border transition-all ${
                  tier.highlighted
                    ? 'bg-[#141311] text-[#F6F2E9] border-[#141311] shadow-xl relative'
                    : 'bg-[#FAF7F0] text-[#141311] border-[#141311]/25'
                }`}
              >
                <div>
                  {tier.badge && (
                    <div
                      className={`inline-block px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest font-semibold mb-4 ${
                        tier.highlighted
                          ? 'bg-[#C83E2B] text-white'
                          : 'bg-[#EFEADE] text-[#141311] border border-[#141311]/20'
                      }`}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <h4 className="font-serif text-2xl sm:text-3xl mb-2">{tier.name}</h4>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-serif text-4xl sm:text-5xl font-semibold">
                      {tier.price}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        tier.highlighted ? 'text-[#B5AFA2]' : 'text-[#5B564E]'
                      }`}
                    >
                      {tier.cadence}
                    </span>
                  </div>
                  <p
                    className={`font-mono text-[11px] mb-5 ${
                      tier.highlighted ? 'text-[#E86F5C]' : 'text-[#5B564E]'
                    }`}
                  >
                    {tier.billingNote}
                  </p>

                  <p
                    className={`text-sm leading-relaxed mb-6 pb-6 border-b ${
                      tier.highlighted
                        ? 'text-[#D6D0C4] border-white/15'
                        : 'text-[#3C3934] border-[#141311]/15'
                    }`}
                  >
                    {tier.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.highlighted ? 'text-[#E86F5C]' : 'text-[#C83E2B]'
                          }`}
                        />
                        <span className={tier.highlighted ? 'text-[#EAE4D7]' : 'text-[#2C2A26]'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => openSubscribeWithTier(tier)}
                  className={`w-full py-3.5 px-5 font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? 'bg-[#C83E2B] hover:bg-[#b23422] text-white'
                      : 'bg-[#141311] hover:bg-[#C83E2B] text-[#F6F2E9]'
                  }`}
                >
                  <span>{tier.ctaLabel}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 8. FULL EDITORIAL MASTHEAD FOOTER */}
      <footer className="bg-[#141311] text-[#EAE4D7] border-t-2 border-[#141311]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            {/* Col 1: Masthead Identity & Colophon (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#E86F5C]">
                THE MERIDIAN REVIEW · ISSN 2634-891X
              </p>
              <h4 className="font-serif text-3xl text-white">THE MERIDIAN REVIEW</h4>
              <p className="text-xs sm:text-sm text-[#B5AFA2] leading-relaxed">
                Published quarterly in Zurich, London, Tokyo, and Lagos. Printed on 70gsm Munken
                Lynx uncoated archival stock by Offizin Parnassia AG, Switzerland.
              </p>
              <div className="pt-2 font-mono text-[11px] text-[#8E887C]">
                EDITOR-IN-CHIEF: DR. MARCUS V. HOFSTETTER
                <br />
                MANAGING EDITOR: ELEANOR VANCE-STERLING
              </div>
            </div>

            {/* Col 2: Global Bureaus (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h5 className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
                GLOBAL EDITORIAL BUREAUS
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs text-[#B5AFA2]">
                <div>
                  <p className="font-mono text-[11px] text-white font-semibold">ZURICH HEADQUARTERS</p>
                  <p>Talstrasse 82, 8001 Zürich</p>
                  <p className="font-mono text-[10px] text-[#8E887C] mt-0.5">zurich@meridianreview.org</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-white font-semibold">LONDON BUREAU</p>
                  <p>14 Clerkenwell Green, EC1R</p>
                  <p className="font-mono text-[10px] text-[#8E887C] mt-0.5">london@meridianreview.org</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-white font-semibold">TOKYO BUREAU</p>
                  <p>Kamiyamacho, Shibuya-ku</p>
                  <p className="font-mono text-[10px] text-[#8E887C] mt-0.5">tokyo@meridianreview.org</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] text-white font-semibold">LAGOS BUREAU</p>
                  <p>Victoria Island, Lagos</p>
                  <p className="font-mono text-[10px] text-[#8E887C] mt-0.5">lagos@meridianreview.org</p>
                </div>
              </div>
            </div>

            {/* Col 3: Sunday Bureau Briefing Dispatch Signup (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h5 className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
                THE SUNDAY BUREAU BRIEFING
              </h5>
              <p className="text-xs text-[#B5AFA2] leading-relaxed">
                Receive our weekly 1,200-word dispatch on sovereign debt, grid bottlenecks, and
                industrial architecture every Sunday at 06:00 UTC.
              </p>
              {newsletterJoined ? (
                <div className="p-3.5 bg-[#1F1D1A] border border-[#C83E2B] text-xs font-mono text-[#EAE4D7] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#E86F5C]" />
                  <span>DISPATCH REGISTERED FOR {newsletterEmail.toUpperCase()}</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail.trim()) setNewsletterJoined(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Institutional or personal email..."
                    className="flex-1 px-3.5 py-2.5 bg-[#1F1D1A] border border-white/20 text-xs font-mono text-white placeholder:text-[#7A7469] focus:outline-none focus:border-[#C83E2B]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#C83E2B] hover:bg-[#b23422] text-white font-mono text-xs uppercase tracking-wider shrink-0 transition-colors"
                  >
                    Join Wire
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#8E887C]">
            <p>© MMXVIII–MMXXVI THE MERIDIAN REVIEW AG (ZURICH & LONDON). ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveArticle(ARTICLES[0])}
                className="hover:text-white transition-colors"
              >
                COVER ESSAY
              </button>
              <button
                onClick={() => openSubscribeWithTier(SUBSCRIPTION_TIERS[1])}
                className="hover:text-white transition-colors"
              >
                PRINT ARCHIVE
              </button>
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="hover:text-white transition-colors"
              >
                MERIDIAN RADIO 24/7
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 9. INTERACTIVE LONG-FORM ARTICLE READER MODAL */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex justify-center p-0 sm:p-6"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl my-auto border border-[#141311]/30 shadow-2xl overflow-hidden transition-colors ${
                readerTheme === 'cream'
                  ? 'bg-[#FAF7F0] text-[#141311]'
                  : readerTheme === 'sepia'
                  ? 'bg-[#EFE4CE] text-[#231D16]'
                  : 'bg-[#141311] text-[#EAE4D7]'
              }`}
            >
              {/* Reader Sticky Top Control Bar */}
              <div
                className={`sticky top-0 z-10 px-5 sm:px-8 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                  readerTheme === 'night'
                    ? 'bg-[#141311]/95 border-white/15'
                    : 'bg-[#EFEADE]/95 border-[#141311]/20'
                } backdrop-blur-md`}
              >
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                  <span className="px-2 py-0.5 bg-[#C83E2B] text-white font-semibold">
                    {activeArticle.category}
                  </span>
                  <span className="hidden sm:inline opacity-75">· {activeArticle.bureau}</span>
                </div>

                {/* Typography Size, Theme, Audio & Share Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Font Size Toggle */}
                  <div className="flex items-center border border-current/20 text-xs font-mono">
                    {(['sm', 'md', 'lg'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setReaderFontSize(sz)}
                        className={`px-2 py-1 uppercase ${
                          readerFontSize === sz
                            ? 'bg-[#C83E2B] text-white font-semibold'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={`Text size: ${sz}`}
                      >
                        {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
                      </button>
                    ))}
                  </div>

                  {/* Theme Switcher */}
                  <div className="hidden sm:flex items-center border border-current/20 text-[10px] font-mono uppercase">
                    {(['cream', 'sepia', 'night'] as const).map((th) => (
                      <button
                        key={th}
                        onClick={() => setReaderTheme(th)}
                        className={`px-2 py-1 ${
                          readerTheme === th
                            ? 'bg-[#141311] text-[#F6F2E9] font-semibold'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleListenArticle(activeArticle)}
                    className="px-2.5 py-1 bg-[#C83E2B] text-white font-mono text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>
                      {currentAudioArticle.id === activeArticle.id && isPlaying
                        ? 'Pause Audio'
                        : `Listen (${activeArticle.audioLabel})`}
                    </span>
                  </button>

                  <button
                    onClick={() => handleCopyCitation(activeArticle)}
                    className="p-1.5 border border-current/25 hover:border-current transition-colors"
                    title="Copy Academic/Press Citation"
                  >
                    {copiedCitation ? (
                      <Check className="w-4 h-4 text-[#C83E2B]" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveArticle(null)}
                    className="p-1.5 border border-current/25 hover:bg-[#C83E2B] hover:text-white transition-colors"
                    aria-label="Close Reader"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Long-Form Essay Content */}
              <div className="px-6 sm:px-14 py-10 max-h-[82vh] overflow-y-auto">
                <div className="font-mono text-xs uppercase tracking-widest text-[#C83E2B] font-semibold mb-2">
                  {activeArticle.number} · {activeArticle.dateline}
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl leading-[1.1] tracking-tight mb-4">
                  {activeArticle.title}
                </h2>

                <p className="font-serif text-lg sm:text-xl opacity-85 leading-relaxed mb-6">
                  {activeArticle.subtitle}
                </p>

                {/* Author Bio Header Strip */}
                <div className="py-4 px-5 mb-8 border-y border-current/15 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-mono uppercase tracking-wider font-semibold">
                      BY {activeArticle.author.name} · {activeArticle.author.role}
                    </p>
                    <p className="opacity-75 mt-0.5">{activeArticle.author.bio}</p>
                  </div>
                  <div className="font-mono text-[11px] opacity-75 shrink-0">
                    EST. READING TIME: {activeArticle.readTime.toUpperCase()}
                  </div>
                </div>

                {/* Essay Lead Photograph */}
                <figure className="mb-8">
                  <img
                    src={activeArticle.imageUrl}
                    alt={activeArticle.title}
                    className="w-full h-72 sm:h-96 object-cover border border-current/20"
                  />
                  <figcaption className="mt-2 font-mono text-xs opacity-75 border-l-2 border-[#C83E2B] pl-3">
                    {activeArticle.imageCaption}
                  </figcaption>
                </figure>

                {/* Essay Body Sections */}
                <div
                  className={`font-serif leading-relaxed space-y-6 ${
                    readerFontSize === 'sm'
                      ? 'text-base'
                      : readerFontSize === 'md'
                      ? 'text-lg'
                      : 'text-xl'
                  }`}
                >
                  {activeArticle.body.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-5">
                      {section.heading && (
                        <h3 className="font-serif text-2xl sm:text-3xl font-semibold pt-4 border-t border-current/15">
                          {section.heading}
                        </h3>
                      )}
                      {section.paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="leading-[1.8]">
                          {sIdx === 0 && pIdx === 0 ? (
                            <>
                              <span className="float-left font-serif text-5xl leading-none pr-3 pt-1 text-[#C83E2B] font-semibold">
                                {para.charAt(0)}
                              </span>
                              {para.slice(1)}
                            </>
                          ) : (
                            para
                          )}
                        </p>
                      ))}

                      {/* Insert Editorial Pull Quote + Key Stat Box after first section */}
                      {sIdx === 0 && (
                        <div className="my-8 p-6 border-l-4 border-[#C83E2B] bg-current/5">
                          <Quote className="w-6 h-6 text-[#C83E2B] mb-2" />
                          <p className="font-serif italic text-xl sm:text-2xl leading-snug mb-3">
                            “{activeArticle.pullQuote}”
                          </p>
                          <div className="pt-3 border-t border-current/15 flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
                            <span className="text-[#C83E2B] font-bold">
                              METRIC BENCHMARK: {activeArticle.keyStat.value}
                            </span>
                            <span className="opacity-75">{activeArticle.keyStat.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Numbered Archival Footnotes */}
                <div className="mt-12 pt-6 border-t-2 border-current/25">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-[#C83E2B] font-semibold mb-4">
                    NOTES, CITATIONS & ARCHIVAL SOURCES
                  </h4>
                  <ol className="space-y-3 text-xs font-mono">
                    {activeArticle.footnotes.map((fn) => (
                      <li key={fn.id} className="leading-relaxed">
                        <span className="font-bold text-[#C83E2B]">[{fn.id}]</span> {fn.text}{' '}
                        <span className="italic opacity-75">— {fn.source}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. SUBSCRIPTION CHECKOUT MODAL */}
      <AnimatePresence>
        {subscribeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSubscribeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#FAF7F0] text-[#141311] border-2 border-[#141311] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#141311] text-[#F6F2E9] flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#E86F5C]">
                    MERIDIAN CIRCULATION DESK · ZURICH & LONDON
                  </p>
                  <h4 className="font-serif text-xl text-white">
                    {subscriptionConfirmed
                      ? 'Subscription Credential Issued'
                      : `Enroll: ${selectedTier.name}`}
                  </h4>
                </div>
                <button
                  onClick={() => setSubscribeModalOpen(false)}
                  className="p-1 text-[#EAE4D7] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {subscriptionConfirmed ? (
                  <div className="space-y-5">
                    <div className="p-5 bg-[#EFEADE] border-l-4 border-[#C83E2B]">
                      <div className="flex items-center gap-2 text-[#C83E2B] font-mono text-xs uppercase font-semibold mb-1">
                        <Check className="w-4 h-4" />
                        <span>CREDENTIAL ACTIVE · ISSUE NO. 48 DISPATCHED</span>
                      </div>
                      <p className="font-serif text-2xl text-[#141311]">{subscriberName}</p>
                      <p className="font-mono text-xs text-[#5B564E] mt-1">
                        TIER: {selectedTier.name.toUpperCase()} ({selectedTier.price}{' '}
                        {selectedTier.cadence}) · BUREAU: {subscriberCity.toUpperCase()}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#383530] leading-relaxed">
                      Your digital archive key and Meridian Radio lossless feed have been sent to{' '}
                      <span className="font-mono font-semibold">{subscriberEmail}</span>. Print
                      editions ship from Zurich within 48 hours via DHL Express Carbon-Neutral.
                    </p>

                    <button
                      onClick={() => setSubscribeModalOpen(false)}
                      className="w-full py-3 bg-[#141311] text-[#F6F2E9] font-mono text-xs uppercase tracking-widest hover:bg-[#C83E2B] transition-colors"
                    >
                      Return to Issue No. 48
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubscriptionConfirmed(true);
                    }}
                    className="space-y-4"
                  >
                    {/* Tier Switcher Pills inside Modal */}
                    <div className="grid grid-cols-3 gap-2">
                      {SUBSCRIPTION_TIERS.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setSelectedTier(t)}
                          className={`p-2.5 text-left border transition-colors ${
                            selectedTier.id === t.id
                              ? 'bg-[#141311] text-[#F6F2E9] border-[#141311]'
                              : 'bg-[#EFEADE] text-[#141311] border-[#141311]/20'
                          }`}
                        >
                          <p className="font-mono text-[10px] uppercase truncate">{t.name}</p>
                          <p className="font-serif text-lg font-semibold">
                            {t.price}
                            <span className="text-[10px] font-mono font-normal">{t.cadence}</span>
                          </p>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5B564E] mb-1">
                        Subscriber Full Name or Institution
                      </label>
                      <input
                        type="text"
                        required
                        value={subscriberName}
                        onChange={(e) => setSubscriberName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#141311]/30 text-sm font-serif focus:outline-none focus:border-[#141311]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5B564E] mb-1">
                          Email for Digital & Audio Key
                        </label>
                        <input
                          type="email"
                          required
                          value={subscriberEmail}
                          onChange={(e) => setSubscriberEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#141311]/30 text-xs font-mono focus:outline-none focus:border-[#141311]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] uppercase tracking-wider text-[#5B564E] mb-1">
                          Delivery City / Bureau
                        </label>
                        <input
                          type="text"
                          required
                          value={subscriberCity}
                          onChange={(e) => setSubscriberCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#141311]/30 text-xs font-mono focus:outline-none focus:border-[#141311]"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#EFEADE] border border-[#141311]/20 flex items-center justify-between text-xs font-mono">
                      <span>TOTAL DUE TODAY ({selectedTier.name.toUpperCase()})</span>
                      <span className="text-base font-bold text-[#C83E2B]">
                        {selectedTier.price} {selectedTier.cadence}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#C83E2B] hover:bg-[#b23422] text-white font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
                    >
                      Confirm Subscription & Issue Credential
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
export default MeridianEditorialSite;
