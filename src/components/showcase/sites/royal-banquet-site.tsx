'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  Music,
  Users,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Download,
  Share2,
  X,
  Plus,
  Minus,
  Crown,
  ChefHat,
  Shirt,
  Volume2,
  VolumeX,
} from 'lucide-react'

// Ticket Pass Types
interface TicketTier {
  id: string
  name: string
  priceGbp: number
  badge?: string
  description: string
  perks: string[]
  remaining: number
}

const TICKET_TIERS: TicketTier[] = [
  {
    id: 'royal-guest',
    name: 'Royal Guest Pass',
    priceGbp: 65,
    badge: 'Limited',
    description: 'Full access to the summer banquet, red carpet arrival, and evening concert.',
    perks: [
      'Red Carpet entry & photo-call at 4:00 PM',
      'Welcome glass of champagne or mocktail',
      'Unlimited access to luxury gourmet buffet',
      'Live headline performances by Blackface & DJ LATCOM',
      'Entry into singing competition & royal party games',
    ],
    remaining: 38,
  },
  {
    id: 'vip-table',
    name: 'VIP Gold Table Pass',
    priceGbp: 120,
    badge: 'Most Desired',
    description: 'Preferred seating with dedicated banquet table service and premium amenities.',
    perks: [
      'All Royal Guest Pass privileges',
      'Priority red carpet fast-track entry',
      'Reserved prime table seating near stage',
      'Complimentary bottle of prosecco or premium wine per pair',
      'Chef-curated amuse-bouche from Golden Spoon',
      'Commemorative luxury gift box',
    ],
    remaining: 14,
  },
  {
    id: 'patron-imperial',
    name: 'Imperial Patron Suite',
    priceGbp: 250,
    badge: 'Exclusive',
    description: 'Ultra-exclusive private experience for sponsors and distinguished benefactors.',
    perks: [
      'All VIP Gold Table privileges',
      'Backstage greenroom lounge access',
      'Private meet & greet with Blackface & host Moyosoluwa Benson',
      'Dedicated personal table butler throughout the evening',
      'Moët & Chandon Imperial Brut champagne service',
      'Brand / name recognition in commemorative banquet program',
    ],
    remaining: 6,
  },
]

// Kitchen Menu Data
interface MenuItem {
  title: string
  subtitle: string
  description: string
  dietary: string[]
  chefNote: string
}

const AFRI_AROMA_MENU: MenuItem[] = [
  {
    title: 'Heritage Jollof Royale',
    subtitle: 'Smoked firewood reduction with tiger prawns & plantain',
    description:
      'Long-grain rice slow-cooked in a reduced plum tomato, red bell pepper, and habanero base, infused with aromatic bay leaves and served with sweet caramelized plantain flowers.',
    dietary: ['Gluten-Free', 'Halal-Certified'],
    chefNote: 'Afri Aroma Signature Recipe passed down through three generations.',
  },
  {
    title: 'Slow-Braised Asun & Goat Medallions',
    subtitle: 'Charred onion reduction & native spices',
    description:
      'Tender diced goat meat wood-fired and tossed in a vibrant blend of crushed scotch bonnets, sweet bell peppers, and fragrant native herbs.',
    dietary: ['Gluten-Free', 'Dairy-Free'],
    chefNote: 'Wood-smoked for 4 hours to ensure delicate melt-in-mouth texture.',
  },
  {
    title: 'Gourmet Beef Suya Skewers',
    subtitle: 'Yaji-dusted ribeye with red onion petals & lime',
    description:
      'Prime aged beef thinly ribboned and flash-grilled over glowing coals with authentic Northern Nigerian yaji ground peanut spice and ginger reduction.',
    dietary: ['Contains Peanuts', 'Halal-Certified'],
    chefNote: 'Seasoned with hand-ground spices flown in directly for the banquet.',
  },
  {
    title: 'Golden Fried Yam & Plantain Blossoms',
    subtitle: 'Accompanied by sweet pepper tomato coulis',
    description:
      'Crisp-crusted white yam batons paired with sweet ripe plantain rounds, served with an aromatic dipping sauce of roasted red peppers and wild thyme.',
    dietary: ['Vegetarian', 'Vegan'],
    chefNote: 'Crisped to golden perfection in cold-pressed groundnut oil.',
  },
]

const GOLDEN_SPOON_MENU: MenuItem[] = [
  {
    title: 'Pan-Seared Scottish Sea Bass',
    subtitle: 'Champagne saffron velouté & samphire',
    description:
      'Wild-caught sea bass fillet with crisp skin, resting upon a velvety saffron-infused French champagne emulsion and buttered seaside greens.',
    dietary: ['Pescatarian', 'Gluten-Free'],
    chefNote: 'Golden Spoon banquet centerpiece balancing contemporary UK coastlines.',
  },
  {
    title: 'Slow-Roasted Crown of Lamb',
    subtitle: 'Minted pea puree & rosemary redcurrant jus',
    description:
      'Locally sourced Durham lamb rack roasted with garlic and garden rosemary, sliced into cutlets over sweet minted garden pea cream.',
    dietary: ['Halal-Option Available'],
    chefNote: 'Prepared under French classical banquet standards.',
  },
  {
    title: 'Royal Charcuterie & Artisan Cheese Board',
    subtitle: 'Truffle honeycomb, figs, and seeded crackers',
    description:
      'A banquet board featuring mature British stiltons, vintage cheddars, cured bresaola, and prosciutto di Parma with sun-ripened orchard fruits.',
    dietary: ['Vegetarian Selections Available'],
    chefNote: 'Curated to pair harmoniously with royal champagne toasts.',
  },
  {
    title: 'Gold-Leaf Belgian Chocolate Ganache Tart',
    subtitle: 'Passionfruit gel & Madagascar vanilla bean chantilly',
    description:
      'Rich 70% dark Belgian chocolate ganache nestled in a crisp butter sable shell, adorned with genuine 24-karat edible gold flakes.',
    dietary: ['Vegetarian'],
    chefNote: 'Hand-decorated to match the banquet’s Blue & Gold dress code.',
  },
]

export function RoyalBanquetSite() {
  const [activeMenuTab, setActiveMenuTab] = React.useState<'afri' | 'golden'>('afri')
  const [selectedTier, setSelectedTier] = React.useState<TicketTier>(TICKET_TIERS[0])
  const [ticketQuantity, setTicketQuantity] = React.useState(2)
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false)
  const [guestName, setGuestName] = React.useState('')
  const [guestEmail, setGuestEmail] = React.useState('')
  const [guestPhone, setGuestPhone] = React.useState('')
  const [confirmedPass, setConfirmedPass] = React.useState<{
    reference: string
    name: string
    email: string
    tier: string
    quantity: number
    totalGbp: number
  } | null>(null)

  const [soundPlaying, setSoundPlaying] = React.useState(false)

  const totalPrice = selectedTier.priceGbp * ticketQuantity

  function handleCompleteBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!guestName || !guestEmail) return

    const ref = `TRB-${Math.floor(1000 + Math.random() * 9000)}-UK`
    setConfirmedPass({
      reference: ref,
      name: guestName,
      email: guestEmail,
      tier: selectedTier.name,
      quantity: ticketQuantity,
      totalGbp: totalPrice,
    })
  }

  function handleResetBooking() {
    setConfirmedPass(null)
    setBookingModalOpen(false)
    setGuestName('')
    setGuestEmail('')
    setGuestPhone('')
  }

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#f5f4f0] font-sans selection:bg-[#dcaa28] selection:text-[#07090e] overflow-x-hidden">
      {/* Dynamic Gold Shimmer Ambient Overlays */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#dcaa28]/15 via-[#1e3a8a]/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-96 h-96 bg-[#1e3a8a]/20 rounded-full blur-3xl" />
        <div className="absolute top-[65%] -right-48 w-96 h-96 bg-[#dcaa28]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Banner & Header */}
      <header className="relative z-20 border-b border-[#f5f4f0]/10 bg-[#07090e]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#dcaa28] to-[#b38318] p-0.5 flex items-center justify-center shadow-lg shadow-[#dcaa28]/20">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <Crown className="size-5 text-[#dcaa28]" />
              </div>
            </div>
            <div>
              <p className="font-serif text-lg font-bold tracking-wide text-[#f5f4f0] leading-none">
                The Royal Banquet
              </p>
              <p className="text-[10px] font-mono tracking-widest text-[#dcaa28] uppercase mt-1">
                Summer Party 001 · Darlington, UK
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-[#f5f4f0]/70">
            <a href="#about" className="hover:text-[#dcaa28] transition-colors">
              The Experience
            </a>
            <a href="#culinary" className="hover:text-[#dcaa28] transition-colors">
              Kitchens
            </a>
            <a href="#lineup" className="hover:text-[#dcaa28] transition-colors">
              Lineup
            </a>
            <a href="#etiquette" className="hover:text-[#dcaa28] transition-colors">
              Dress Code
            </a>
            <a href="#tickets" className="hover:text-[#dcaa28] transition-colors">
              Passes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:07493101936"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#f5f4f0]/15 text-[11px] font-mono text-[#f5f4f0]/80 hover:text-white hover:border-[#dcaa28]/50 transition-colors"
            >
              <Phone className="size-3 text-[#dcaa28]" />
              <span>074-9310-1936</span>
            </a>

            <button
              onClick={() => {
                setSelectedTier(TICKET_TIERS[0])
                setBookingModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#dcaa28] via-[#e5b93d] to-[#dcaa28] text-[#07090e] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#dcaa28]/25 hover:opacity-95 active:scale-95 transition-all"
            >
              Reserve Pass
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#dcaa28]/30 bg-[#dcaa28]/10 text-xs font-mono text-[#dcaa28] mb-6 backdrop-blur-sm">
          <Sparkles className="size-3.5" />
          <span>Grace Empire &amp; Golden Spoon Food Ltd Present</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f5f4f0] max-w-5xl mx-auto leading-[1.1] text-balance">
          The Royal Banquet
          <span className="block font-sans text-xl sm:text-2xl lg:text-3xl font-light text-[#dcaa28] tracking-widest uppercase mt-3">
            Summer Party 001 · Darlington, UK
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-[#f5f4f0]/75 leading-relaxed font-light">
          A transcendent evening of regal hospitality, live African entertainment, and haute cuisine.
          Strictly limited to <strong>100 exclusive guests</strong> in the historic city of Darlington Durham.
        </p>

        {/* 4 Feature Badges */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl border border-[#f5f4f0]/10 bg-[#0a0d14]/80 backdrop-blur-md text-left">
            <Users className="size-4 text-[#dcaa28] mb-2" />
            <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Exclusivity</p>
            <p className="text-sm font-semibold text-[#f5f4f0] mt-0.5">100 Royal Guests</p>
          </div>
          <div className="p-4 rounded-2xl border border-[#f5f4f0]/10 bg-[#0a0d14]/80 backdrop-blur-md text-left">
            <Clock className="size-4 text-[#dcaa28] mb-2" />
            <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Schedule</p>
            <p className="text-sm font-semibold text-[#f5f4f0] mt-0.5">4:00 PM – 11:00 PM</p>
          </div>
          <div className="p-4 rounded-2xl border border-[#f5f4f0]/10 bg-[#0a0d14]/80 backdrop-blur-md text-left">
            <Shirt className="size-4 text-[#dcaa28] mb-2" />
            <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Dress Code</p>
            <p className="text-sm font-semibold text-[#f5f4f0] mt-0.5">Elegant Blue &amp; Gold</p>
          </div>
          <div className="p-4 rounded-2xl border border-[#f5f4f0]/10 bg-[#0a0d14]/80 backdrop-blur-md text-left">
            <MapPin className="size-4 text-[#dcaa28] mb-2" />
            <p className="text-[11px] font-mono uppercase text-[#f5f4f0]/60">Location</p>
            <p className="text-sm font-semibold text-[#f5f4f0] mt-0.5">Darlington Durham, UK</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#tickets"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#dcaa28] via-[#e5b93d] to-[#dcaa28] text-[#07090e] font-bold text-sm tracking-wider uppercase shadow-xl shadow-[#dcaa28]/25 hover:shadow-[#dcaa28]/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <Ticket className="size-4" />
            <span>Lock In Your Ticket</span>
          </a>

          <a
            href="#culinary"
            className="px-8 py-3.5 rounded-2xl border border-[#f5f4f0]/20 bg-[#f5f4f0]/5 text-[#f5f4f0] font-semibold text-sm tracking-wider uppercase hover:bg-[#f5f4f0]/10 hover:border-[#dcaa28]/50 active:scale-95 transition-all flex items-center gap-2"
          >
            <UtensilsCrossed className="size-4 text-[#dcaa28]" />
            <span>Explore Royal Menus</span>
          </a>
        </div>
      </section>

      {/* About The Royal Banquet */}
      <section id="about" className="relative z-10 py-20 border-t border-[#f5f4f0]/10 bg-[#090c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="label-mono-xs text-[#dcaa28] uppercase">The Vision &amp; Host</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f4f0] leading-tight">
                Curated exclusively for 100 royal dignitaries.
              </h2>
              <p className="text-sm text-[#f5f4f0]/75 leading-relaxed font-light">
                Your host, <strong>Moyosoluwa Benson</strong>, cordially invites you to step into an unprecedented
                celebration in the heart of Darlington. The Royal Banquet is not merely an event; it is an
                intimate sanctuary where luxury dining, rich heritage, and joyous festivities converge.
              </p>
              <div className="p-4 rounded-xl border border-[#dcaa28]/20 bg-[#dcaa28]/5 space-y-2">
                <p className="text-xs font-semibold text-[#dcaa28] uppercase tracking-wider font-mono">
                  Royal Evening Itinerary
                </p>
                <ul className="text-xs space-y-1.5 text-[#f5f4f0]/80">
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">16:00</span>
                    <span>Red Carpet Arrival &amp; Luxury Photo Call</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">16:30</span>
                    <span>Welcome Champagne &amp; Host Address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">17:30</span>
                    <span>Gourmet Buffet by Afri Aroma &amp; Golden Spoon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">19:30</span>
                    <span>Singing Competitions &amp; Royal Party Games</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">20:30</span>
                    <span>Headline Performance by Blackface</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#dcaa28] font-bold">21:30–23:00</span>
                    <span>&quot;Party Party!!!&quot; Grand Finale by DJ LATCOM</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl border border-[#f5f4f0]/10 bg-[#0f1422] space-y-4">
                <div className="size-10 rounded-xl bg-[#dcaa28]/15 flex items-center justify-center text-[#dcaa28]">
                  <Music className="size-5" />
                </div>
                <h3 className="text-base font-bold text-[#f5f4f0]">Headline Performance: Blackface</h3>
                <p className="text-xs text-[#f5f4f0]/70 leading-relaxed font-light">
                  A headline showcase by world-renowned artist <strong>Blackface</strong>, bringing timeless hits,
                  irresistible energy, and soul-stirring melodies directly to our banquet stage.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-[#f5f4f0]/10 bg-[#0f1422] space-y-4">
                <div className="size-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-base font-bold text-[#f5f4f0]">MC Ferrari &amp; Laugh Pattern</h3>
                <p className="text-xs text-[#f5f4f0]/70 leading-relaxed font-light">
                  Commanding the room with high-energy charisma, infectious humor, and interactive singing
                  competitions that elevate the banquet atmosphere from the first toast to the last dance.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-[#f5f4f0]/10 bg-[#0f1422] space-y-4 sm:col-span-2">
                <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="text-base font-bold text-[#f5f4f0]">Strict Capacity: 100 Exclusive Guests</h3>
                <p className="text-xs text-[#f5f4f0]/70 leading-relaxed font-light">
                  To ensure impeccable service, spacious table allocations, and an intimate royal ambiance, ticket
                  sales are strictly capped. Every attendee receives personalized entry verification upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Section (Dual Kitchens) */}
      <section id="culinary" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="label-mono-xs text-[#dcaa28] uppercase">The Royal Dining Hall</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#f5f4f0] mt-2">
            Two Master Kitchens. One Unrivaled Buffet.
          </h2>
          <p className="text-sm text-[#f5f4f0]/75 mt-4 font-light leading-relaxed">
            Every bite is crafted with purpose and prestige. Savor the rich, authentic soul of African heritage
            with <strong>Afri Aroma</strong> alongside contemporary European banquet mastery by{' '}
            <strong>Golden Spoon Food Ltd</strong>.
          </p>

          {/* Kitchen Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-[#f5f4f0]/15 bg-[#0a0d14]">
            <button
              onClick={() => setActiveMenuTab('afri')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeMenuTab === 'afri'
                  ? 'bg-[#dcaa28] text-[#07090e] shadow-md'
                  : 'text-[#f5f4f0]/60 hover:text-white'
              }`}
            >
              <ChefHat className="size-4" />
              <span>Afri Aroma (Heritage Soul)</span>
            </button>
            <button
              onClick={() => setActiveMenuTab('golden')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeMenuTab === 'golden'
                  ? 'bg-[#dcaa28] text-[#07090e] shadow-md'
                  : 'text-[#f5f4f0]/60 hover:text-white'
              }`}
            >
              <Crown className="size-4" />
              <span>Golden Spoon Food Ltd</span>
            </button>
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeMenuTab === 'afri' ? AFRI_AROMA_MENU : GOLDEN_SPOON_MENU).map((dish, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-[#f5f4f0]/10 bg-[#0c101b] hover:border-[#dcaa28]/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#f5f4f0]">{dish.title}</h3>
                  <p className="text-xs text-[#dcaa28] font-mono mt-0.5">{dish.subtitle}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {dish.dietary.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#f5f4f0]/10 text-[#f5f4f0]/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#f5f4f0]/70 font-light leading-relaxed">{dish.description}</p>

              <div className="pt-2 border-t border-[#f5f4f0]/10 flex items-center gap-2 text-[11px] text-[#f5f4f0]/50 italic">
                <ChefHat className="size-3.5 text-[#dcaa28]" />
                <span>{dish.chefNote}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dress Code & Etiquette */}
      <section id="etiquette" className="relative z-10 py-20 border-t border-[#f5f4f0]/10 bg-[#090c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="label-mono-xs text-[#dcaa28] uppercase">The Banquet Aesthetic</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#f5f4f0]">
                Strict Dress Code: Elegant Blue &amp; Gold
              </h2>
              <p className="text-sm text-[#f5f4f0]/75 font-light leading-relaxed">
                To create a unified visual tapestry worthy of royalty, all guests are requested to adorn
                themselves in shades of <strong>Deep Royal Blue, Midnight Navy, and Polished Gold</strong>.
              </p>

              {/* Color Swatches */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs">
                  <span className="size-4 rounded-full bg-[#1e3a8a] border border-white/20" />
                  <span className="font-mono text-[11px]">Royal Navy #1E3A8A</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs">
                  <span className="size-4 rounded-full bg-[#dcaa28] border border-white/20" />
                  <span className="font-mono text-[11px]">Imperial Gold #DCAA28</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#f5f4f0]/10 bg-[#0f1422] space-y-2">
                <p className="text-xs font-mono uppercase text-[#dcaa28]">Gentlemen</p>
                <p className="text-xs text-[#f5f4f0]/80 font-light leading-relaxed">
                  Tailored royal blue tuxedos, bespoke dinner suits with gold silk lapels or accessories, or authentic
                  traditional African royal agbada in royal blue with gold thread embroidery.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#f5f4f0]/10 bg-[#0f1422] space-y-2">
                <p className="text-xs font-mono uppercase text-[#dcaa28]">Ladies</p>
                <p className="text-xs text-[#f5f4f0]/80 font-light leading-relaxed">
                  Floor-length evening gowns in royal blue or shimmering gold, elegant cocktail dresses, or luxury
                  African lace couture accessorized with gold jewelry and matching gele.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Passes & Pricing */}
      <section id="tickets" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="label-mono-xs text-[#dcaa28] uppercase">Secure Your Place</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#f5f4f0] mt-2">
            Royal Passes &amp; Table Reservations
          </h2>
          <p className="text-sm text-[#f5f4f0]/75 mt-3 font-light">
            With only 100 places available, passes are allocated on a first-confirmed basis. Select your preferred tier
            below to receive your instant digital QR pass.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TICKET_TIERS.map((tier) => {
            const isSelected = selectedTier.id === tier.id
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`relative p-8 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#dcaa28] bg-gradient-to-b from-[#121829] to-[#0c101b] shadow-2xl shadow-[#dcaa28]/15 scale-[1.02]'
                    : 'border-[#f5f4f0]/10 bg-[#0a0d14] hover:border-[#f5f4f0]/20'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-gradient-to-r from-[#dcaa28] to-[#b38318] text-[#07090e]">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#f5f4f0]">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-bold text-[#f5f4f0]">£{tier.priceGbp}</span>
                    <span className="text-xs text-[#f5f4f0]/50 uppercase font-mono">/ guest</span>
                  </div>
                  <p className="text-xs text-[#f5f4f0]/70 font-light mt-3 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-[#f5f4f0]/10 space-y-2.5">
                    <p className="text-[11px] font-mono uppercase text-[#dcaa28] tracking-wider font-semibold">
                      Included Privileges
                    </p>
                    {tier.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#f5f4f0]/80">
                        <CheckCircle2 className="size-3.5 text-[#dcaa28] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#f5f4f0]/10">
                  <div className="flex items-center justify-between text-xs text-[#f5f4f0]/60 mb-3">
                    <span>Remaining capacity</span>
                    <span className="font-mono text-[#dcaa28] font-semibold">{tier.remaining} passes left</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTier(tier)
                      setBookingModalOpen(true)
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isSelected
                        ? 'bg-[#dcaa28] text-[#07090e] shadow-lg shadow-[#dcaa28]/25 hover:opacity-95'
                        : 'border border-[#f5f4f0]/20 bg-[#f5f4f0]/5 text-[#f5f4f0] hover:bg-[#f5f4f0]/10'
                    }`}
                  >
                    Select &amp; Book Pass
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sponsorship & VIP Hotline Banner */}
        <div className="mt-16 p-8 rounded-3xl border border-[#dcaa28]/30 bg-gradient-to-r from-[#121829] via-[#101422] to-[#121829] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl font-bold text-[#f5f4f0]">
              Corporate Table Sponsorships &amp; Group Bookings
            </h3>
            <p className="text-xs text-[#f5f4f0]/75 font-light">
              For branded table placements, headline sponsor packages, or bespoke arrangements, reach our concierge.
            </p>
          </div>
          <a
            href="tel:07493101936"
            className="px-6 py-3 rounded-xl border border-[#dcaa28] bg-[#dcaa28]/10 text-[#dcaa28] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#dcaa28] hover:text-[#07090e] transition-all flex items-center gap-2 shrink-0"
          >
            <Phone className="size-4" />
            <span>Call Hotline: 074-9310-1936</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f5f4f0]/10 py-12 bg-[#05070a] text-center text-xs text-[#f5f4f0]/50 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Crown className="size-4 text-[#dcaa28]" />
          <span className="font-serif text-sm font-semibold text-[#f5f4f0]">The Royal Banquet</span>
        </div>
        <p className="text-[11px] font-light max-w-md mx-auto">
          © 2026 Grace Empire by Golden Spoon Food Ltd. All rights reserved. Darlington, Durham, United Kingdom.
        </p>
        <p className="text-[10px] font-mono text-[#dcaa28]/70">
          Engineered &amp; Modernized by Virtue &amp; Co. Webworks (Next.js 16 Showcase)
        </p>
      </footer>

      {/* Booking & Pass Generation Modal */}
      <AnimatePresence>
        {bookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl rounded-3xl border border-[#dcaa28]/40 bg-[#0b0e18] text-[#f5f4f0] p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={handleResetBooking}
                className="absolute top-5 right-5 p-2 rounded-xl text-[#f5f4f0]/60 hover:text-white hover:bg-white/10"
              >
                <X className="size-5" />
              </button>

              {!confirmedPass ? (
                <form onSubmit={handleCompleteBooking} className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Crown className="size-5 text-[#dcaa28]" />
                    <h3 className="font-serif text-2xl font-bold text-[#f5f4f0]">Reserve Royal Pass</h3>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#f5f4f0]/10 bg-white/[0.03] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground uppercase tracking-wider font-mono">Selected Tier</span>
                      <span className="font-bold text-[#dcaa28]">{selectedTier.name} (£{selectedTier.priceGbp}/guest)</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-muted-foreground">Number of Guests</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                          className="size-7 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="font-mono font-bold text-sm">{ticketQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setTicketQuantity((q) => Math.min(10, q + 1))}
                          className="size-7 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/10"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-muted-foreground">Total Investment</span>
                      <span className="font-mono text-base font-bold text-[#f5f4f0]">£{totalPrice} GBP</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#f5f4f0]/60 mb-1">
                        Full Name of Primary Royal Guest
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Lady Amanda Sterling"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dcaa28]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#f5f4f0]/60 mb-1">
                        VIP Delivery Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@luxuryestate.co.uk"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dcaa28]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#f5f4f0]/60 mb-1">
                        Contact Telephone / WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+44 7911 123456"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#dcaa28]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#dcaa28] via-[#e5b93d] to-[#dcaa28] text-[#07090e] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#dcaa28]/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="size-4" />
                      <span>Confirm &amp; Generate Royal Pass</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 text-center">
                  <div className="inline-flex size-14 rounded-2xl bg-[#dcaa28]/15 border border-[#dcaa28]/30 items-center justify-center text-[#dcaa28] mx-auto">
                    <CheckCircle2 className="size-7" />
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#f5f4f0]">Royal Pass Confirmed</h3>
                    <p className="text-xs text-[#f5f4f0]/70 mt-1">
                      Your invitation has been dispatched to <strong>{confirmedPass.email}</strong>.
                    </p>
                  </div>

                  {/* Holographic Royal Pass Badge */}
                  <div className="p-6 rounded-3xl border-2 border-[#dcaa28]/60 bg-gradient-to-b from-[#161d31] to-[#0a0d17] text-left relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#dcaa28]/10 rounded-full blur-2xl" />

                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <p className="font-serif text-lg font-bold text-[#f5f4f0]">The Royal Banquet</p>
                        <p className="text-[10px] font-mono text-[#dcaa28] uppercase">Summer Party 001 · Darlington</p>
                      </div>
                      <Crown className="size-6 text-[#dcaa28]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-mono">Dignitary</p>
                        <p className="font-bold text-[#f5f4f0] mt-0.5">{confirmedPass.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-mono">Pass Tier</p>
                        <p className="font-bold text-[#dcaa28] mt-0.5">{confirmedPass.tier}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-mono">Party Size</p>
                        <p className="font-bold text-[#f5f4f0] mt-0.5">{confirmedPass.quantity} Guests</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-mono">Pass Reference</p>
                        <p className="font-mono font-bold text-emerald-400 mt-0.5">{confirmedPass.reference}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px] text-white/60">
                        <QrCode className="size-8 text-[#dcaa28]" />
                        <span>Present QR badge at Red Carpet arrival</span>
                      </div>
                      <span className="font-mono font-bold text-white text-sm">£{confirmedPass.totalGbp} PAID</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert(`Royal Pass ${confirmedPass.reference} saved to your device wallet!`)}
                      className="flex-1 py-3 rounded-xl bg-[#dcaa28] text-[#07090e] font-bold text-xs uppercase tracking-wider hover:opacity-95 flex items-center justify-center gap-2"
                    >
                      <Download className="size-4" />
                      <span>Save to Wallet / Print</span>
                    </button>
                    <button
                      onClick={handleResetBooking}
                      className="px-4 py-3 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/10"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
