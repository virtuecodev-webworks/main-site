'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  X,
  Plus,
  Minus,
  Check,
  Sparkles,
  Globe,
  ShieldCheck,
  Truck,
  Scissors,
  Award,
  ArrowRight,
  SlidersHorizontal,
  Eye,
  CreditCard,
  CheckCircle2,
  Ruler,
  MapPin,
} from 'lucide-react';

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'NGN';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'USD $' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR €' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP £' },
  NGN: { code: 'NGN', symbol: '₦', rate: 1620, label: 'NGN ₦' },
};

interface ProductColor {
  name: string;
  hex: string;
}

interface LuxuryProduct {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: 'Outerwear' | 'Leather Goods' | 'Timepieces' | 'Footwear';
  priceUsd: number;
  badge?: string;
  image: string;
  secondaryImage: string;
  colors: ProductColor[];
  sizes: string[];
  composition: string;
  origin: string;
  care: string;
  fitNotes: string;
}

interface CartItem {
  product: LuxuryProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

const PRODUCTS: LuxuryProduct[] = [
  {
    id: 'mf-01',
    code: 'AW26-OW-014',
    name: 'Double-Faced Cashmere Belted Trench',
    subtitle: 'Hand-finished Loro Piana storm-system cashmere',
    category: 'Outerwear',
    priceUsd: 3450,
    badge: 'RUNWAY PIECE',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Espresso Wool', hex: '#2B211B' },
      { name: 'Vicuna Camel', hex: '#B5895A' },
      { name: 'Obsidian Noir', hex: '#121212' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    composition: '100% Virgin Inner Mongolian Cashmere (620 GSM)',
    origin: 'Hand-tailored in Biella & Milan, Italy',
    care: 'Specialist dry clean only. Store on sculpted cedar hanger.',
    fitNotes: 'Architectural relaxed shoulder with detachable horn-buckled waist belt.',
  },
  {
    id: 'mf-02',
    code: 'AW26-LG-008',
    name: 'Le Trapèze Box-Calfskin Weekender',
    subtitle: 'Full-grain French box calfskin & brushed palladium hardware',
    category: 'Leather Goods',
    priceUsd: 2890,
    badge: 'ATELIER LIMITED',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Saddle Cognac', hex: '#6E3B1F' },
      { name: 'Noir Matte', hex: '#151515' },
      { name: 'Taupe Craie', hex: '#9C8F82' },
    ],
    sizes: ['ONE SIZE'],
    composition: '100% French Box Calfskin; Lambskin suede interior lining',
    origin: 'Saddle-stitched by hand in Paris, 3rd Arrondissement',
    care: 'Condition biannually with neutral beeswax balm. Includes linen dust bag.',
    fitNotes: 'Cabin-approved dimensions: 48cm × 29cm × 22cm. Detachable shoulder strap.',
  },
  {
    id: 'mf-03',
    code: 'AW26-TP-002',
    name: 'Chronographe Calibre MF-09 Rose Gold',
    subtitle: 'Ultra-thin 7.8mm mechanical automatic movement',
    category: 'Timepieces',
    priceUsd: 12400,
    badge: 'NUMBERED EDITION',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: '18K Rose Gold / Slate', hex: '#C89D7C' },
      { name: 'Platinum / Guilloché Ivory', hex: '#D9D7D2' },
    ],
    sizes: ['38MM', '41MM'],
    composition: '18k 5N Rose Gold case, Sapphire crystal back, Alligator strap',
    origin: 'Manufactured & regulated in Geneva, Switzerland',
    care: 'Water resistant to 5 ATM. 5-year international movement warranty.',
    fitNotes: '72-hour power reserve with Côtes de Genève bridges.',
  },
  {
    id: 'mf-04',
    code: 'AW26-OW-019',
    name: 'Sculpted Bouclé Wool Opera Coat',
    subtitle: 'Collarless architectural cocoon silhouette',
    category: 'Outerwear',
    priceUsd: 2680,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Alabaster Chalk', hex: '#EDEAE2' },
      { name: 'Charcoal Anthracite', hex: '#2E3033' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    composition: '88% Virgin Merino Wool, 12% Mulberry Silk lining',
    origin: 'Crafted in Milan, Italy',
    care: 'Dry clean only.',
    fitNotes: 'Oversized drape; choose one size down for a closer fit.',
  },
  {
    id: 'mf-05',
    code: 'AW26-FW-011',
    name: 'Goodyear-Welted Cordovan Chelsea Boot',
    subtitle: 'Single-piece Horween shell cordovan with stacked leather heel',
    category: 'Footwear',
    priceUsd: 1390,
    badge: 'BESTSELLER',
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Oxblood Bordeaux', hex: '#4A181D' },
      { name: 'Obsidian Black', hex: '#141414' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    composition: '100% Vegetable-tanned Shell CordovanLeather',
    origin: 'Hand-lasted in Northampton & Florence',
    care: 'Includes custom cedar shoe trees and horsehair polishing brush.',
    fitNotes: 'XS (EU 38-39), S (EU 40-41), M (EU 42-43), L (EU 44-45).',
  },
  {
    id: 'mf-06',
    code: 'AW26-LG-015',
    name: 'L’Architecte Mini Crossbody Tote',
    subtitle: 'Origami-folded grain calfskin with gold vermeil clasp',
    category: 'Leather Goods',
    priceUsd: 1850,
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Warm Parchment', hex: '#E6DEC8' },
      { name: 'Olive Véronèse', hex: '#4A5240' },
      { name: 'Noir', hex: '#141414' },
    ],
    sizes: ['ONE SIZE'],
    composition: '100% Grained Italian Calfskin, 24k Gold-plated brass clasp',
    origin: 'Florence, Italy',
    care: 'Wipe with soft dry cloth.',
    fitNotes: 'Holds smartphone, passport portfolio, and sunglasses case.',
  },
  {
    id: 'mf-07',
    code: 'AW26-TP-007',
    name: 'Tank Rectangulaire Onyx Mécanique',
    subtitle: 'Art-Deco stepped case with natural black onyx dial',
    category: 'Timepieces',
    priceUsd: 6950,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Yellow Gold / Onyx', hex: '#D4AF37' },
      { name: 'Steel / Lapis Lazuli', hex: '#283C66' },
    ],
    sizes: ['S', 'M'],
    composition: '18k Yellow Gold vermeil, cabochon spinel crown, French calf strap',
    origin: 'La Chaux-de-Fonds, Switzerland',
    care: 'Manual-wind mechanical calibre. 45-hour power reserve.',
    fitNotes: 'S (23mm × 31mm classic), M (27mm × 36mm large).',
  },
  {
    id: 'mf-08',
    code: 'AW26-FW-024',
    name: 'Slingback Sculpted Kitten Heel Pump',
    subtitle: 'Brushed nappa lambskin with architectural brass heel',
    category: 'Footwear',
    priceUsd: 1120,
    image:
      'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: '/work/finery-hero.jpg',
    colors: [
      { name: 'Espresso Glaze', hex: '#36231A' },
      { name: 'Ivory Silk', hex: '#F2EFE9' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    composition: '100% Nappa Lambskin, Cuoio leather sole',
    origin: 'Parabiago, Milan, Italy',
    care: 'Protect from moisture.',
    fitNotes: '55mm sculpted architectural heel for all-day gallery comfort.',
  },
];

export function MaisonFinerySite() {
  // Currency, Category & Sort State
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Pieces');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Product Selection State (per product ID)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<string[]>(['mf-01']);

  // Quick-View & Lookbook Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<LuxuryProduct | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);

  // Shopping Bag & Checkout State
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      selectedSize: 'M',
      selectedColor: PRODUCTS[0].colors[0].name,
      quantity: 1,
    },
  ]);
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Apple Pay' | 'Stripe' | 'Paystack'>('Apple Pay');
  const [orderCompleted, setOrderCompleted] = useState<{
    orderId: string;
    dhlWaybill: string;
    totalFormatted: string;
    method: string;
  } | null>(null);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const activeCurrency = CURRENCIES[currency];

  const formatPrice = (usdAmount: number) => {
    const converted = Math.round(usdAmount * activeCurrency.rate);
    return `${activeCurrency.symbol}${converted.toLocaleString('en-US')}`;
  };

  const filteredProducts = useMemo(() => {
    const list =
      selectedCategory === 'All Pieces' || selectedCategory === 'Editorial'
        ? [...PRODUCTS]
        : PRODUCTS.filter((p) => p.category === selectedCategory);

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceUsd - b.priceUsd);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceUsd - a.priceUsd);
    }
    return list;
  }, [selectedCategory, sortBy]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToBag = (product: LuxuryProduct) => {
    const chosenSize = selectedSizes[product.id] || product.sizes[0];
    const chosenColor = selectedColors[product.id] || product.colors[0].name;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === chosenSize &&
          item.selectedColor === chosenColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity: 1,
        },
      ];
    });
    setOrderCompleted(null);
    setIsBagOpen(true);
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === 'FINERY10') {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoError('Invalid atelier code. Try FINERY10 for 10% private client privilege.');
    }
  };

  const bagCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalUsd = cart.reduce(
    (acc, item) => acc + item.product.priceUsd * item.quantity,
    0
  );
  const discountUsd = promoApplied ? Math.round(subtotalUsd * 0.1) : 0;
  const finalTotalUsd = Math.max(0, subtotalUsd - discountUsd);
  const freeShippingThresholdUsd = 1500;
  const shippingProgress = Math.min(100, (subtotalUsd / freeShippingThresholdUsd) * 100);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const randomOrder = `MF-${Math.floor(840000 + Math.random() * 99999)}`;
    const randomWaybill = `DHL-EXP-${Math.floor(491020030 + Math.random() * 8999999)}`;
    setOrderCompleted({
      orderId: randomOrder,
      dhlWaybill: randomWaybill,
      totalFormatted: formatPrice(finalTotalUsd),
      method: paymentMethod,
    });
    setCart([]);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141312] font-sans selection:bg-[#141312] selection:text-[#FAF8F5]">
      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#141312] text-[#F3EFEA] px-4 py-2.5 text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-center font-medium flex items-center justify-center gap-4">
        <span>
          COMPLIMENTARY DHL EXPRESS COURIER WORLDWIDE · AUTUMN/WINTER COLLECTION NOW LIVE
        </span>
        <span className="hidden md:inline text-[#C5A880]">•</span>
        <span className="hidden md:inline text-[#C5A880]">
          PRIVATE CLIENT CODE: FINERY10 (10% PRIVILEGE)
        </span>
      </div>

      {/* STICKY LUXURY HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Category Links (Desktop Left) */}
          <nav className="hidden xl:flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-[#5A554E]">
            {['All Pieces', 'Outerwear', 'Leather Goods', 'Timepieces', 'Footwear', 'Editorial'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (cat === 'Editorial') {
                      scrollToSection('finery-atelier');
                    } else {
                      scrollToSection('finery-collection');
                    }
                  }}
                  className={`py-1 transition border-b cursor-pointer ${
                    selectedCategory === cat
                      ? 'text-[#141312] font-semibold border-[#141312]'
                      : 'border-transparent hover:text-[#141312]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </nav>

          {/* Center Wordmark */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Pieces');
              scrollToSection('finery-hero');
            }}
            className="text-left xl:text-center cursor-pointer group"
          >
            <div className="text-xl sm:text-2xl font-serif tracking-[0.28em] text-[#141312] font-normal">
              MAISON FINERY
            </div>
            <div className="text-[9px] tracking-[0.38em] uppercase text-[#787168] mt-0.5">
              PARIS · MILAN · GENEVA
            </div>
          </button>

          {/* Right Actions: Multi-Currency Converter, Wishlist, Shopping Bag */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Multi-Currency Selector */}
            <div className="flex items-center bg-[#EFECE6] rounded-full p-0.5 border border-[#DFD9CE]">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] tracking-wider font-medium transition cursor-pointer ${
                    currency === code
                      ? 'bg-[#141312] text-[#FAF8F5]'
                      : 'text-[#5A554E] hover:text-[#141312]'
                  }`}
                >
                  {CURRENCIES[code].label}
                </button>
              ))}
            </div>

            {/* Wishlist Counter */}
            <button
              type="button"
              onClick={() => scrollToSection('finery-collection')}
              className="relative p-2 text-[#141312] hover:opacity-70 transition cursor-pointer"
              title="Saved Wishlist Pieces"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#8C6D46] text-white text-[10px] flex items-center justify-center font-medium">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsBagOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#141312] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] hover:bg-[#2B2927] transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#C5A880] text-[#141312] font-semibold text-[11px]">
                {bagCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Category Strip */}
        <div className="xl:hidden flex items-center gap-4 overflow-x-auto px-4 py-2.5 border-t border-[#E5E0D8] text-[11px] uppercase tracking-[0.15em] whitespace-nowrap">
          {['All Pieces', 'Outerwear', 'Leather Goods', 'Timepieces', 'Footwear', 'Editorial'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat === 'Editorial') {
                    scrollToSection('finery-atelier');
                  } else {
                    scrollToSection('finery-collection');
                  }
                }}
                className={`px-3 py-1 rounded-full cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#141312] text-[#FAF8F5]'
                    : 'text-[#5A554E] bg-[#EFECE6]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </header>

      {/* FULL-BLEED EDITORIAL HERO */}
      <section id="finery-hero" className="relative overflow-hidden bg-[#141312] text-[#FAF8F5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Left Editorial Typography */}
          <div className="lg:col-span-6 p-8 sm:p-14 lg:p-20 flex flex-col justify-between z-10 bg-gradient-to-b from-[#181615] to-[#11100F]">
            <div className="space-y-2">
              <span className="inline-block text-[11px] uppercase tracking-[0.32em] text-[#C5A880]">
                SILHOUETTE N° 04 — AUTUMN / WINTER ARCHIVE
              </span>
              <div className="w-12 h-[1px] bg-[#C5A880]" />
            </div>

            <div className="my-10">
              <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight leading-[1.08] text-[#FAF8F5] mb-6">
                Architectural Quietude &amp; Pure Materiality.
              </h1>
              <p className="text-sm sm:text-base text-[#B8B2A8] leading-relaxed max-w-xl mb-10">
                Crafted in small numbered editions across our Milanese outerwear atelier, Parisian
                maroquinerie workshop, and Geneva horology salon. Every price dynamically converts in{' '}
                <strong className="text-white">{activeCurrency.label}</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToSection('finery-collection')}
                  className="px-7 py-4 bg-[#FAF8F5] text-[#141312] text-xs uppercase tracking-[0.22em] font-semibold hover:bg-[#E5DEC9] transition flex items-center gap-3 cursor-pointer"
                >
                  <span>Shop the Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('finery-atelier')}
                  className="px-7 py-4 border border-white/25 text-[#FAF8F5] text-xs uppercase tracking-[0.22em] hover:bg-white/10 transition cursor-pointer"
                >
                  View Lookbook
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 text-xs">
              <div>
                <div className="text-[#C5A880] font-serif text-lg">100%</div>
                <div className="text-[#9E978E] text-[11px] uppercase tracking-wider">
                  Traceable Loro Piana Wool
                </div>
              </div>
              <div>
                <div className="text-[#C5A880] font-serif text-lg">48 Hours</div>
                <div className="text-[#9E978E] text-[11px] uppercase tracking-wider">
                  Global DHL Express Air
                </div>
              </div>
              <div>
                <div className="text-[#C5A880] font-serif text-lg">NFC</div>
                <div className="text-[#9E978E] text-[11px] uppercase tracking-wider">
                  Digital Provenance Seal
                </div>
              </div>
            </div>
          </div>

          {/* Right High-Fashion Hero Imagery */}
          <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-full bg-[#1E1C1A] overflow-hidden">
            <img
              src="/work/finery-hero.jpg"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85';
              }}
              alt="Maison Finery Autumn Winter Campaign"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/55 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-[0.24em] text-[#C5A880] block">
                  FEATURED LOOK 01
                </span>
                <span className="font-serif text-base text-white">
                  Double-Faced Cashmere Belted Trench
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickViewProduct(PRODUCTS[0])}
                className="px-4 py-2 bg-white text-black text-[11px] uppercase tracking-widest font-medium hover:bg-[#C5A880] transition cursor-pointer"
              >
                Inspect Piece ({formatPrice(PRODUCTS[0].priceUsd)})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8-PRODUCT LUXURY COLLECTION GRID */}
      <section id="finery-collection" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Filter & Sort Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-10 border-b border-[#E5E0D8] gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.26em] text-[#8C6D46] block mb-2">
              READY-TO-WEAR · MAROQUINERIE · HOROLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#141312]">
              {selectedCategory === 'All Pieces' || selectedCategory === 'Editorial'
                ? 'The Complete Autumn/Winter Collection'
                : selectedCategory}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['All Pieces', 'Outerwear', 'Leather Goods', 'Timepieces', 'Footwear'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs uppercase tracking-[0.14em] transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#141312] text-[#FAF8F5] font-medium'
                      : 'bg-[#EFECE6] text-[#5A554E] hover:text-[#141312]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#EFECE6] px-3.5 py-2 border border-[#DFD9CE]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A554E]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
                }
                className="bg-transparent text-xs uppercase tracking-wider text-[#141312] focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 8 Luxury Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => {
            const activeSize = selectedSizes[product.id] || product.sizes[0];
            const activeColor = selectedColors[product.id] || product.colors[0].name;
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div key={product.id} className="group flex flex-col justify-between">
                <div>
                  {/* Image Card */}
                  <div className="relative aspect-[3/4] bg-[#EBE6DD] overflow-hidden mb-4">
                    <img
                      src={product.image}
                      onError={(e) => {
                        e.currentTarget.src = '/work/finery-hero.jpg';
                      }}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Top Left Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#141312] text-[#FAF8F5] text-[10px] uppercase tracking-[0.2em]">
                        {product.badge}
                      </span>
                    )}

                    {/* Top Right Wishlist Heart */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#141312] hover:scale-110 transition cursor-pointer"
                      title="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted ? 'fill-[#8C6D46] text-[#8C6D46]' : ''
                        }`}
                      />
                    </button>

                    {/* Quick-View Overlay Trigger */}
                    <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        className="w-full py-2.5 bg-[#FAF8F5]/95 backdrop-blur-md text-[#141312] text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-2 hover:bg-[#141312] hover:text-white transition cursor-pointer shadow-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View &amp; Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Meta */}
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#787168] mb-1">
                    <span>{product.category}</span>
                    <span>{product.code}</span>
                  </div>

                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    className="font-serif text-lg text-[#141312] leading-snug mb-1 hover:underline cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6E675F] mb-3 line-clamp-1">{product.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E0D8]">
                  {/* Price in Active Currency */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-medium text-[#141312]">
                      {formatPrice(product.priceUsd)}
                    </span>
                    <span className="text-[11px] text-[#787168]">{activeColor}</span>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-2 mb-3">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() =>
                          setSelectedColors((prev) => ({ ...prev, [product.id]: c.name }))
                        }
                        title={c.name}
                        className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                          activeColor === c.name
                            ? 'ring-2 ring-offset-2 ring-[#141312] border-black'
                            : 'border-black/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>

                  {/* Size Pills */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          setSelectedSizes((prev) => ({ ...prev, [product.id]: sz }))
                        }
                        className={`flex-1 py-1 text-[10px] uppercase tracking-wider border transition cursor-pointer ${
                          activeSize === sz
                            ? 'bg-[#141312] text-[#FAF8F5] border-[#141312] font-semibold'
                            : 'bg-transparent text-[#5A554E] border-[#D8D1C5] hover:border-[#141312]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    onClick={() => addToBag(product)}
                    className="w-full py-3 bg-[#141312] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2E2B28] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ATELIER CRAFTSMANSHIP & RUNWAY CAMPAIGN SECTION */}
      <section id="finery-atelier" className="py-24 px-4 sm:px-8 bg-[#141312] text-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A880] block">
                SAVOIR-FAIRE · MILAN &amp; PARIS ATELIERS
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-normal leading-tight">
                38 Hours of Hand-Work in Every Coat.
              </h2>
              <p className="text-sm text-[#B8B2A8] leading-relaxed">
                Each Maison Finery garment is cut from single-estate Inner Mongolian cashmere and
                French box calfskin. Our master tailors split the double-faced wool edges by hand,
                folding and invisible-stitching 140 stitches per meter so no lining or raw seam is
                ever visible.
              </p>

              <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-start gap-3">
                  <span className="text-[#C5A880] font-mono">01.</span>
                  <div>
                    <strong className="text-white uppercase tracking-wider block">
                      Biella Storm-System Cashmere
                    </strong>
                    <span className="text-[#9E978E]">
                      Naturally water-repellent membrane bonded to pure virgin cashmere.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C5A880] font-mono">02.</span>
                  <div>
                    <strong className="text-white uppercase tracking-wider block">
                      Geneva Mechanical Horology
                    </strong>
                    <span className="text-[#9E978E]">
                      In-house regulated calibres adjusted in five positions with 5-year warranty.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="aspect-[4/5] bg-[#1F1D1B] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85"
                  onError={(e) => {
                    e.currentTarget.src = '/work/finery-hero.jpg';
                  }}
                  alt="Runway Silhouette"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/65 backdrop-blur-sm p-3 text-xs">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block">
                    PALAIS DE TOKYO RUNWAY
                  </span>
                  <span className="font-serif text-white">Look 09 — Sculpted Wool Opera Coat</span>
                </div>
              </div>
              <div className="aspect-[4/5] bg-[#1F1D1B] overflow-hidden relative sm:mt-10">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85"
                  onError={(e) => {
                    e.currentTarget.src = '/work/finery-hero.jpg';
                  }}
                  alt="Atelier Craft"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/65 backdrop-blur-sm p-3 text-xs">
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block">
                    VIA MONTENAPOLEONE SALON
                  </span>
                  <span className="font-serif text-white">Private Bespoke Fittings by Appointment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT SERVICES STRIP */}
      <section className="py-16 px-4 sm:px-8 border-y border-[#E5E0D8] bg-[#F4F0E8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Scissors,
              title: 'Complimentary Tailoring',
              desc: 'Bespoke sleeve and hem alterations at any Maison Finery flagship or partner atelier.',
            },
            {
              icon: Truck,
              title: 'Global Returns & Courier',
              desc: 'Complimentary insured DHL Express delivery and 30-day effortless home pickup.',
            },
            {
              icon: Sparkles,
              title: 'Private Stylist Concierge',
              desc: 'Direct WhatsApp & video appointments with our Paris and Milan wardrobe directors.',
            },
            {
              icon: Award,
              title: 'Authenticity Certificate',
              desc: 'Encrypted NFC provenance tag woven into every garment and timepiece.',
            },
          ].map((srv) => {
            const IconComp = srv.icon;
            return (
              <div key={srv.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#141312] text-[#FAF8F5] flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#141312] mb-1">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#6E675F] leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LUXURY FASHION HOUSE FOOTER */}
      <footer className="bg-[#FAF8F5] pt-20 pb-14 px-4 sm:px-8 text-xs text-[#5A554E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#E5E0D8]">
            {/* Newsletter Signup */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xl font-serif tracking-[0.26em] text-[#141312]">
                MAISON FINERY
              </div>
              <p className="text-xs text-[#6E675F] max-w-sm leading-relaxed">
                Receive private invitations to runway presentations in Paris and Milan, plus early
                access to numbered capsule releases.
              </p>
              {newsletterSubscribed ? (
                <div className="p-3 bg-[#EFECE6] text-[#141312] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8C6D46]" />
                  <span>Welcome to the Maison Finery Private Client Register.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  className="flex gap-2 max-w-md"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-white border border-[#D8D1C5] text-xs text-[#141312] focus:outline-none focus:border-[#141312]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#141312] text-[#FAF8F5] text-[11px] uppercase tracking-[0.2em] cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141312]">
                  Flagship Boutiques
                </div>
                <ul className="space-y-2">
                  <li>24 Rue du Faubourg Saint-Honoré, Paris</li>
                  <li>Via Montenapoleone 18, Milan</li>
                  <li>Rue du Rhône 42, Geneva</li>
                  <li>Mount Street, Mayfair, London</li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141312]">
                  Client Care
                </div>
                <ul className="space-y-2">
                  <li>DHL Express Worldwide Shipping</li>
                  <li>Complimentary Returns &amp; Exchanges</li>
                  <li>Size &amp; Architectural Fit Guide</li>
                  <li>Horology Care &amp; Servicing</li>
                </ul>
              </div>
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141312]">
                  The House
                </div>
                <ul className="space-y-2">
                  <li>Savoir-Faire &amp; Traceability</li>
                  <li>Loro Piana &amp; Biella Mills</li>
                  <li>Press &amp; Runway Archive</li>
                  <li>Sustainability Ledger</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#787168]">
            <span>© {new Date().getFullYear()} Maison Finery SAS Paris. All rights reserved.</span>
            <span>Active Currency: {activeCurrency.label} (Live Conversion Active)</span>
          </div>
        </div>
      </footer>

      {/* QUICK-VIEW PRODUCT MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#FAF8F5] border border-[#D8D1C5] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-[#EBE6DD] relative min-h-[340px]">
                <img
                  src={quickViewProduct.image}
                  onError={(e) => {
                    e.currentTarget.src = '/work/finery-hero.jpg';
                  }}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#141312] text-white text-[10px] uppercase tracking-widest">
                  {quickViewProduct.code}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C6D46]">
                        {quickViewProduct.category}
                      </span>
                      <h3 className="text-2xl font-serif text-[#141312] mt-1">
                        {quickViewProduct.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      className="p-1.5 text-[#5A554E] hover:text-black cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xl font-medium text-[#141312] mb-4">
                    {formatPrice(quickViewProduct.priceUsd)}
                  </div>

                  <p className="text-xs text-[#5A554E] leading-relaxed mb-5">
                    {quickViewProduct.fitNotes}
                  </p>

                  {/* Fabric Composition, Origin & Care */}
                  <div className="space-y-2.5 py-4 border-y border-[#E5E0D8] text-xs mb-5">
                    <div>
                      <strong className="uppercase tracking-wider text-[10px] text-[#787168] block">
                        Material Composition
                      </strong>
                      <span className="text-[#141312]">{quickViewProduct.composition}</span>
                    </div>
                    <div>
                      <strong className="uppercase tracking-wider text-[10px] text-[#787168] block">
                        Atelier Provenance
                      </strong>
                      <span className="text-[#141312]">{quickViewProduct.origin}</span>
                    </div>
                    <div>
                      <strong className="uppercase tracking-wider text-[10px] text-[#787168] block">
                        Care Instructions &amp; Delivery
                      </strong>
                      <span className="text-[#141312]">
                        {quickViewProduct.care} Complimentary DHL Express (2–3 business days).
                      </span>
                    </div>
                  </div>

                  {/* Size Guide Toggle */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="uppercase tracking-wider text-[11px] font-medium">
                        Select Size
                      </span>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen((prev) => !prev)}
                        className="text-[11px] underline text-[#8C6D46] flex items-center gap-1 cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>{sizeGuideOpen ? 'Hide Size Guide' : 'Atelier Size Guide'}</span>
                      </button>
                    </div>

                    {sizeGuideOpen && (
                      <div className="p-3 mb-3 bg-[#EFECE6] text-[11px] text-[#5A554E] space-y-1">
                        <div>XS: IT 44 / FR 36 • Chest 88cm • Shoulder 41cm</div>
                        <div>S: IT 46 / FR 38 • Chest 94cm • Shoulder 43cm</div>
                        <div>M: IT 48 / FR 40 • Chest 100cm • Shoulder 45cm</div>
                        <div>L: IT 50 / FR 42 • Chest 106cm • Shoulder 47cm</div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {quickViewProduct.sizes.map((sz) => {
                        const activeSz =
                          (selectedSizes[quickViewProduct.id] || quickViewProduct.sizes[0]) === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() =>
                              setSelectedSizes((prev) => ({
                                ...prev,
                                [quickViewProduct.id]: sz,
                              }))
                            }
                            className={`flex-1 py-2 text-xs uppercase tracking-wider border cursor-pointer ${
                              activeSz
                                ? 'bg-[#141312] text-white border-[#141312]'
                                : 'border-[#D8D1C5] text-[#141312]'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToBag(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-4 bg-[#141312] text-[#FAF8F5] text-xs uppercase tracking-[0.22em] font-semibold hover:bg-[#2E2B28] transition cursor-pointer"
                >
                  Add to Shopping Bag — {formatPrice(quickViewProduct.priceUsd)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OUT SHOPPING BAG & EXPRESS CHECKOUT DRAWER */}
      <AnimatePresence>
        {isBagOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBagOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[#8C6D46] block">
                    MAISON FINERY PRIVATE BAG
                  </span>
                  <h3 className="text-lg font-serif text-[#141312]">
                    Shopping Bag ({bagCount} {bagCount === 1 ? 'Piece' : 'Pieces'})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBagOpen(false)}
                  className="p-2 text-[#5A554E] hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free DHL Express Progress Bar */}
              <div className="px-6 py-3 bg-[#F2EDE4] border-b border-[#E5E0D8] text-xs">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="uppercase tracking-wider text-[#5A554E]">
                    {subtotalUsd >= freeShippingThresholdUsd
                      ? 'Complimentary Insured DHL Express Courier Unlocked'
                      : `Add ${formatPrice(
                          freeShippingThresholdUsd - subtotalUsd
                        )} for Complimentary DHL Express`}
                  </span>
                  <span className="font-mono text-[#141312]">{Math.round(shippingProgress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#DFD9CE] overflow-hidden">
                  <div
                    className="h-full bg-[#141312] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Bag Body / Order Confirmation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {orderCompleted ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#141312] text-[#C5A880] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.26em] text-[#8C6D46] block">
                      ATELIER DISPATCH CONFIRMED
                    </span>
                    <h4 className="text-2xl font-serif text-[#141312]">
                      Merci. Your Order is Reserved.
                    </h4>
                    <p className="text-xs text-[#5A554E] leading-relaxed">
                      Our Milanese &amp; Parisian artisans are preparing your garments for insured air
                      dispatch.
                    </p>
                    <div className="p-4 bg-[#EFECE6] border border-[#DFD9CE] text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#787168]">Order Reference</span>
                        <span className="font-mono font-semibold text-[#141312]">
                          {orderCompleted.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#787168]">DHL Express Waybill</span>
                        <span className="font-mono text-[#8C6D46]">
                          {orderCompleted.dhlWaybill}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#787168]">Settlement Method</span>
                        <span className="font-medium text-[#141312]">{orderCompleted.method}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#DFD9CE]">
                        <span className="text-[#141312] font-medium">Total Charged</span>
                        <span className="font-semibold text-[#141312]">
                          {orderCompleted.totalFormatted}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderCompleted(null);
                        setIsBagOpen(false);
                      }}
                      className="w-full py-3.5 bg-[#141312] text-white text-xs uppercase tracking-[0.2em] cursor-pointer"
                    >
                      Continue Exploring Archive
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="w-8 h-8 text-[#9E978E] mx-auto stroke-1" />
                    <p className="font-serif text-lg text-[#141312]">Your Shopping Bag is Empty</p>
                    <p className="text-xs text-[#787168]">
                      Explore our Autumn/Winter outerwear, leather goods, and Geneva timepieces.
                    </p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 pb-5 border-b border-[#E5E0D8]"
                    >
                      <img
                        src={item.product.image}
                        onError={(e) => {
                          e.currentTarget.src = '/work/finery-hero.jpg';
                        }}
                        alt={item.product.name}
                        className="w-20 h-28 object-cover bg-[#EBE6DD] shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-serif text-sm text-[#141312] leading-snug">
                              {item.product.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => updateCartQty(idx, -item.quantity)}
                              className="text-[#787168] hover:text-black text-xs cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#787168] mt-1">
                            Color: {item.selectedColor} · Size: {item.selectedSize}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#D8D1C5]">
                            <button
                              type="button"
                              onClick={() => updateCartQty(idx, -1)}
                              className="p-1.5 text-[#5A554E] hover:text-black cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(idx, 1)}
                              className="p-1.5 text-[#5A554E] hover:text-black cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-[#141312]">
                            {formatPrice(item.product.priceUsd * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer: Promo Code & Express Checkout */}
              {!orderCompleted && cart.length > 0 && (
                <div className="p-6 bg-[#F4F0E8] border-t border-[#E5E0D8] space-y-4">
                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Privilege Code (Try FINERY10)"
                      className="flex-1 px-3 py-2 bg-white border border-[#D8D1C5] text-xs uppercase tracking-wider focus:outline-none focus:border-[#141312]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#141312] text-white text-[11px] uppercase tracking-widest cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {promoApplied && (
                    <div className="text-[11px] text-[#8C6D46] flex items-center justify-between">
                      <span>✓ Private Client Privilege FINERY10 (10% Off)</span>
                      <span>-{formatPrice(discountUsd)}</span>
                    </div>
                  )}
                  {promoError && <div className="text-[11px] text-rose-700">{promoError}</div>}

                  {/* Totals */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-[#DFD9CE]">
                    <div className="flex justify-between text-[#5A554E]">
                      <span>DHL Express Air Courier</span>
                      <span>Complimentary</span>
                    </div>
                    <div className="flex justify-between text-base font-serif text-[#141312] pt-1">
                      <span>Total ({activeCurrency.code})</span>
                      <span className="font-sans font-semibold">{formatPrice(finalTotalUsd)}</span>
                    </div>
                  </div>

                  {/* Payment Rail Selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Apple Pay', 'Stripe', 'Paystack'] as const).map((rail) => (
                      <button
                        key={rail}
                        type="button"
                        onClick={() => setPaymentMethod(rail)}
                        className={`py-2 text-[11px] uppercase tracking-wider border transition cursor-pointer ${
                          paymentMethod === rail
                            ? 'bg-[#141312] text-white border-[#141312] font-medium'
                            : 'bg-white text-[#5A554E] border-[#D8D1C5]'
                        }`}
                      >
                        {rail}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[#141312] text-[#FAF8F5] text-xs uppercase tracking-[0.22em] font-semibold hover:bg-[#2B2825] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#C5A880]" />
                    <span>
                      Complete Order ({paymentMethod}) — {formatPrice(finalTotalUsd)}
                    </span>
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
export default MaisonFinerySite;
