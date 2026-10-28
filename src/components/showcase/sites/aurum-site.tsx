'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Lock,
  Globe,
  CreditCard,
  Landmark,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  FileText,
  ChevronRight,
  Snowflake,
  Flame,
  RefreshCw,
  Building2,
  KeyRound,
  AlertCircle,
  X,
  Download,
  TrendingUp,
  Wallet,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Transaction {
  id: string;
  counterparty: string;
  category: string;
  method: string;
  date: string;
  amount: number;
  currency: string;
  status: 'Settled' | 'Instant' | 'Processing';
  type: 'credit' | 'debit';
}

interface CorporateCard {
  id: string;
  name: string;
  holder: string;
  role: string;
  last4: string;
  expiry: string;
  cvv: string;
  tier: 'Founder Metal' | 'Cloud Infrastructure' | 'Travel & Events';
  type: 'Physical Titanium' | 'Virtual Multi-Use' | 'Virtual T&E';
  spent: number;
  limit: number;
  frozen: boolean;
  colorClass: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-99482',
    counterparty: 'US Treasury Bill Maturity (CUSIP 912797)',
    category: 'Yield Distribution',
    method: 'Fedwire Custody Sweep',
    date: 'Today, 14:22 UTC',
    amount: 21450.8,
    currency: 'USD',
    status: 'Settled',
    type: 'credit',
  },
  {
    id: 'TX-99479',
    counterparty: 'Amazon Web Services EMEA SARL',
    category: 'Cloud Infrastructure',
    method: 'Card •••• 8842',
    date: 'Today, 11:05 UTC',
    amount: -18420.0,
    currency: 'USD',
    status: 'Settled',
    type: 'debit',
  },
  {
    id: 'TX-99475',
    counterparty: 'Stripe Global Payouts — UK/EU',
    category: 'Merchant Settlement',
    method: 'SEPA Instant',
    date: 'Yesterday, 19:40 UTC',
    amount: 164900.0,
    currency: 'EUR',
    status: 'Settled',
    type: 'credit',
  },
  {
    id: 'TX-99471',
    counterparty: 'Lombard Odier Zurich Custody',
    category: 'FX Liquidity Rebalance',
    method: 'SWIFT gpi Direct',
    date: 'Oct 25, 09:14 UTC',
    amount: -125000.0,
    currency: 'CHF',
    status: 'Settled',
    type: 'debit',
  },
  {
    id: 'TX-99466',
    counterparty: 'Paystack Nigeria Settlement Pool',
    category: 'Regional Treasury',
    method: 'NIP Instant Rail',
    date: 'Oct 24, 16:50 UTC',
    amount: 48500.0,
    currency: 'USD',
    status: 'Settled',
    type: 'credit',
  },
];

const INITIAL_CARDS: CorporateCard[] = [
  {
    id: 'card-metal',
    name: 'Founder Metal Infinite',
    holder: 'DR. A. BANKOLE',
    role: 'Managing Partner',
    last4: '4091',
    expiry: '09/29',
    cvv: '892',
    tier: 'Founder Metal',
    type: 'Physical Titanium',
    spent: 24800,
    limit: 75000,
    frozen: false,
    colorClass: 'from-[#1D1E22] via-[#121316] to-[#090A0C] border-[#D4AF37]/40',
  },
  {
    id: 'card-cloud',
    name: 'Cloud & AI Compute Cluster',
    holder: 'INFRASTRUCTURE OPS',
    role: 'Automated Billing',
    last4: '8842',
    expiry: '12/28',
    cvv: '417',
    tier: 'Cloud Infrastructure',
    type: 'Virtual Multi-Use',
    spent: 42150,
    limit: 60000,
    frozen: false,
    colorClass: 'from-[#0F172A] via-[#0B1120] to-[#060911] border-emerald-500/40',
  },
  {
    id: 'card-travel',
    name: 'Global Executive Aviation & Stays',
    holder: 'EXECUTIVE CONCIERGE',
    role: 'Diplomatic & Diplomatic Travel',
    last4: '5519',
    expiry: '04/28',
    cvv: '604',
    tier: 'Travel & Events',
    type: 'Virtual T&E',
    spent: 11200,
    limit: 35000,
    frozen: false,
    colorClass: 'from-[#1C1917] via-[#131110] to-[#0C0A09] border-amber-400/30',
  },
];

const FX_RATES: Record<string, { rate: number; symbol: string; rail: string; speed: string; fee: number }> = {
  USD: { rate: 1.0, symbol: '$', rail: 'FedNow / Fedwire Direct', speed: 'Instant (~4 secs)', fee: 0 },
  EUR: { rate: 0.924, symbol: '€', rail: 'SEPA Instant RT1', speed: 'Instant (~6 secs)', fee: 0 },
  GBP: { rate: 0.786, symbol: '£', rail: 'UK Faster Payments', speed: 'Instant (~5 secs)', fee: 0 },
  CHF: { rate: 0.865, symbol: 'CHF ', rail: 'SIX SIC Swiss Interbank', speed: 'Real-Time (~8 secs)', fee: 0 },
  NGN: { rate: 1625.0, symbol: '₦', rail: 'NIBSS Direct Treasury Pool', speed: 'Instant (~12 secs)', fee: 0 },
};

const CASHFLOW_BARS = [
  58, 62, 54, 70, 68, 75, 72, 81, 79, 85, 83, 89, 84, 91, 88, 94, 92, 96, 91, 98, 95, 100, 97, 104,
];

export function AurumCapitalSite() {
  // Navigation & Modals
  const [activeNav, setActiveNav] = useState<string>('Treasury');
  const [modalMode, setModalMode] = useState<'signin' | 'open' | 'audit' | null>(null);

  // Dashboard Accounts & Ledger State
  const [totalLiquidity, setTotalLiquidity] = useState<number>(4820490.0);
  const [selectedAccountTab, setSelectedAccountTab] = useState<string>('Operating Checking');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Wire / FX Simulator State
  const [wireAmount, setWireAmount] = useState<string>('25000');
  const [wireCurrency, setWireCurrency] = useState<string>('EUR');
  const [wireRecipient, setWireRecipient] = useState<string>('Atelier Vacheron Geneva SA');
  const [wireReceiptToast, setWireReceiptToast] = useState<string | null>(null);

  // Corporate Cards State
  const [cards, setCards] = useState<CorporateCard[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>('card-metal');
  const [revealCardNumbers, setRevealCardNumbers] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Treasury Yield Calculator State
  const [idleBalance, setIdleBalance] = useState<number>(2500000); // $2.5M default
  const aurumApy = 0.0528;
  const legacyApy = 0.0045;

  // Onboarding Form State
  const [companyName, setCompanyName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Delaware C-Corp (United States)');
  const [workEmail, setWorkEmail] = useState('');
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) || cards[0],
    [cards, selectedCardId]
  );

  const accountBalances: Record<string, { balance: string; sub: string; apy: string; accountNo: string }> = {
    'Operating Checking': {
      balance: `$${(totalLiquidity * 0.24).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'BNY Mellon / Column N.A. • Zero Wire Fees',
      apy: '2.15% Operating Yield',
      accountNo: '•••• 4401 (ABA 021000021)',
    },
    'US T-Bill Vault 5.28%': {
      balance: `$${(totalLiquidity * 0.62).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: '100% Direct U.S. Sovereign T-Bills • T+0 Liquidity',
      apy: '5.28% Net APY',
      accountNo: 'CUSIP 912797KL0 Custody',
    },
    'EUR SEPA Account': {
      balance: `€${(totalLiquidity * 0.09 * 0.924).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Luxembourg IBAN • SEPA Instant RT1 Enabled',
      apy: '3.40% ECB Deposit Tier',
      accountNo: 'LU89 0141 •••• 9920',
    },
    'NGN Settlement': {
      balance: `₦${(totalLiquidity * 0.05 * 1625).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      sub: 'Lagos Institutional Settlement Pool • Instant NIP',
      apy: 'Multi-Currency Hedged',
      accountNo: 'NGN Pool •••• 7732',
    },
  };

  const scrollToSection = (sectionId: string, label: string) => {
    setActiveNav(label);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExecuteWire = (e: React.FormEvent) => {
    e.preventDefault();
    const numericUsd = parseFloat(wireAmount.replace(/,/g, '')) || 0;
    if (numericUsd <= 0 || numericUsd > totalLiquidity) return;

    const fx = FX_RATES[wireCurrency] || FX_RATES.USD;
    const converted = numericUsd * fx.rate;

    const newTx: Transaction = {
      id: `TX-${Math.floor(99500 + Math.random() * 499)}`,
      counterparty: wireRecipient.trim() || 'Global Settlement Partner',
      category: `FX Wire (${wireCurrency})`,
      method: fx.rail,
      date: 'Just now • Instant',
      amount: -numericUsd,
      currency: 'USD',
      status: 'Instant',
      type: 'debit',
    };

    setTransactions((prev) => [newTx, ...prev.slice(0, 6)]);
    setTotalLiquidity((prev) => Math.max(0, prev - numericUsd));
    setWireReceiptToast(
      `Dispatched ${fx.symbol}${converted.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })} (${wireCurrency}) to ${newTx.counterparty} via ${fx.rail}`
    );

    setTimeout(() => {
      setWireReceiptToast(null);
    }, 6000);
  };

  const toggleFreezeCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c))
    );
  };

  const updateCardLimit = (id: string, newLimit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, limit: newLimit } : c))
    );
  };

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const aurumAnnualYield = Math.round(idleBalance * aurumApy);
  const legacyAnnualYield = Math.round(idleBalance * legacyApy);
  const netExtraAnnual = aurumAnnualYield - legacyAnnualYield;
  const netExtraMonthly = Math.round(netExtraAnnual / 12);

  return (
    <div className="min-h-screen bg-[#07090D] text-[#F5F5F0] font-sans selection:bg-[#D4AF37]/30 selection:text-[#F5F5F0] overflow-x-hidden">
      {/* Top Institutional Status Bar */}
      <div className="border-b border-white/[0.06] bg-[#050609] px-4 sm:px-8 py-2 text-[11px] tracking-wider uppercase text-zinc-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FEDWIRE, SEPA RT1 &amp; SWIFT GPI: 100% OPERATIONAL
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">
            3-MONTH US TREASURY BENCHMARK: <strong className="text-[#D4AF37]">5.28% NET APY</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>ZURICH • NEW YORK • LONDON • LAGOS</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[#D4AF37] font-mono">CUSTODY: BNY MELLON N.A.</span>
        </div>
      </div>

      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090D]/85 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => scrollToSection('aurum-hero', 'Treasury')}
            className="flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#AA8220] to-[#5A420C] p-[1px] shadow-lg shadow-[#D4AF37]/10">
              <div className="h-full w-full bg-[#090B10] rounded-[11px] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M12 6.5L6.5 9.75V16.25L12 19.5L17.5 16.25V9.75L12 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeOpacity="0.6"
                  />
                  <circle cx="12" cy="13" r="2.2" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-[0.18em] text-white">AURUM</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  PRIVATE
                </span>
              </div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-zinc-500">
                Sovereign Corporate Treasury
              </p>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-full p-1">
            {[
              { label: 'Treasury', id: 'aurum-hero' },
              { label: 'Corporate Cards', id: 'aurum-cards' },
              { label: 'Global Wires', id: 'aurum-yield' },
              { label: 'Security', id: 'aurum-security' },
              { label: 'Pricing', id: 'aurum-pricing' },
            ].map((item) => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToSection(item.id, item.label)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#07090D] font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Triggers */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setApplicationSubmitted(false);
                setModalMode('signin');
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/20 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setApplicationSubmitted(false);
                setModalMode('open');
              }}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#D4AF37] to-[#E5C86B] text-[#07090D] hover:brightness-110 transition flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/15 cursor-pointer"
            >
              <span>Open Account</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH LIVE INTERACTIVE BANKING OS */}
      <section id="aurum-hero" className="relative pt-12 pb-24 px-4 sm:px-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[#D4AF37]/10 blur-[150px] rounded-full" />
        <div className="pointer-events-none absolute top-60 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[130px] rounded-full" />

        <div className="max-w-7xl mx-auto">
          {/* Editorial Fintech Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5.28% Net Treasury Yield • Direct U.S. T-Bill Custody</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08] mb-5">
              Private Treasury &amp; Global Liquidity for{' '}
              <span className="bg-gradient-to-r from-[#F5E6B3] via-[#D4AF37] to-[#9E7B1C] bg-clip-text text-transparent">
                Sovereign Founders.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-8">
              Operate across USD, EUR, GBP, CHF, and NGN from a single institutional command center.
              Automate overnight U.S. Treasury sweeps, issue titanium Visa Infinite corporate cards,
              and settle cross-border wires in seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setApplicationSubmitted(false);
                  setModalMode('open');
                }}
                className="px-6 py-3.5 rounded-xl bg-[#D4AF37] text-[#07090D] font-semibold text-sm hover:brightness-110 transition flex items-center gap-2 shadow-xl shadow-[#D4AF37]/15 cursor-pointer"
              >
                <span>Apply for Private Treasury</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('aurum-yield', 'Global Wires')}
                className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.1] font-medium text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#D4AF37]" />
                <span>Simulate Treasury Yield</span>
              </button>
            </div>
          </div>

          {/* LIVE INTERACTIVE BANKING OS WINDOW */}
          <div className="rounded-2xl border border-white/[0.12] bg-[#0B0E14]/95 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
            {/* OS Window Top Chrome */}
            <div className="px-4 sm:px-6 py-3.5 bg-[#080A0F] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/10">
                  AURUM OS v4.8 — ENTITY: VIRTUE HOLDINGS INTERNATIONAL LTD.
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  FDIC SWEEP: $5,000,000 ACTIVE
                </span>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-300 font-mono">
                  HARDWARE PASSKEY VERIFIED
                </span>
              </div>
            </div>

            {/* Toast Notification if Wire Executed */}
            <AnimatePresence>
              {wireReceiptToast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between text-xs text-emerald-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>INSTANT SETTLEMENT CONFIRMED:</strong> {wireReceiptToast}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWireReceiptToast(null)}
                    className="text-emerald-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left 8 Columns: Total Liquidity, Account Selector, Sparkline & Live Ledger */}
              <div className="lg:col-span-8 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-zinc-400 block mb-1">
                      Consolidated Total Liquidity (USD Equivalent)
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-5xl font-semibold tracking-tight font-mono text-white">
                        ${totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +$21,450.80 this month
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">
                      Accrued Unsettled Yield
                    </span>
                    <span className="text-lg font-mono font-semibold text-[#D4AF37]">
                      +$14,892.40
                    </span>
                    <span className="block text-[11px] text-zinc-500">Auto-compounds Nov 1</span>
                  </div>
                </div>

                {/* 30-Day Cashflow Bar Sparkline */}
                <div className="mb-7 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                    <span className="font-medium text-zinc-300">30-Day Treasury NAV &amp; Liquidity Trajectory</span>
                    <span className="font-mono text-emerald-400">+14.2% Net Inflow</span>
                  </div>
                  <div className="h-20 flex items-end gap-1.5">
                    {CASHFLOW_BARS.map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t transition-all duration-300 hover:bg-[#D4AF37] bg-gradient-to-t from-[#D4AF37]/25 to-[#D4AF37]/75"
                        style={{ height: `${val}%` }}
                        title={`Day ${idx + 1}: $${(4.1 + val * 0.007).toFixed(2)}M`}
                      />
                    ))}
                  </div>
                </div>

                {/* Account Sub-Vault Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-7">
                  {Object.keys(accountBalances).map((tabName) => {
                    const info = accountBalances[tabName];
                    const active = selectedAccountTab === tabName;
                    return (
                      <button
                        key={tabName}
                        type="button"
                        onClick={() => setSelectedAccountTab(tabName)}
                        className={`p-3.5 rounded-xl text-left transition border cursor-pointer ${
                          active
                            ? 'bg-[#D4AF37]/12 border-[#D4AF37]/50 shadow-sm'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'
                        }`}
                      >
                        <div className="text-[11px] text-zinc-400 truncate mb-1">{tabName}</div>
                        <div className="text-sm sm:text-base font-mono font-semibold text-white truncate">
                          {info.balance}
                        </div>
                        <div className="text-[10px] font-mono text-[#D4AF37] mt-1 truncate">
                          {info.apy}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Vault Detail Banner */}
                <div className="mb-6 px-4 py-3 rounded-xl bg-[#10141D] border border-white/[0.07] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-medium text-white">{selectedAccountTab}:</span>
                    <span className="text-zinc-400">{accountBalances[selectedAccountTab].sub}</span>
                  </div>
                  <span className="font-mono text-zinc-300">
                    {accountBalances[selectedAccountTab].accountNo}
                  </span>
                </div>

                {/* Live Transaction Ledger */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Real-Time Settlement Ledger
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      ISO-20022 Real-Time Audit Trail
                    </span>
                  </div>
                  <div className="divide-y divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-[#080A0F]">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.type === 'credit'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white/[0.04] text-zinc-300 border border-white/[0.08]'
                            }`}
                          >
                            {tx.type === 'credit' ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate">{tx.counterparty}</div>
                            <div className="text-[11px] text-zinc-500 truncate">
                              {tx.category} • {tx.method} • {tx.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-semibold ${
                              tx.type === 'credit' ? 'text-emerald-400' : 'text-white'
                            }`}
                          >
                            {tx.type === 'credit' ? '+' : '-'}$
                            {Math.abs(tx.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {tx.id} • <span className="text-emerald-400">{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 4 Columns: Interactive Send Wire & Multi-Currency FX Simulator */}
              <div className="lg:col-span-4 p-6 sm:p-8 bg-[#090C12] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className="text-sm font-semibold text-white">
                        Instant Global Wire &amp; FX Desk
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      0.00% FX Markup
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-6">
                    Test our live institutional settlement rail. Execute a simulated wire to see it
                    post immediately to the ledger.
                  </p>

                  <form onSubmit={handleExecuteWire} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                        Beneficiary Counterparty
                      </label>
                      <input
                        type="text"
                        value={wireRecipient}
                        onChange={(e) => setWireRecipient(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070B] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Recipient Entity Name"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                          Debit Amount (USD)
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="1000000"
                          step="100"
                          value={wireAmount}
                          onChange={(e) => setWireAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070B] border border-white/[0.1] text-sm font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                          Target FX
                        </label>
                        <select
                          value={wireCurrency}
                          onChange={(e) => setWireCurrency(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#05070B] border border-white/[0.1] text-sm font-mono text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                        >
                          {Object.keys(FX_RATES).map((curr) => (
                            <option key={curr} value={curr}>
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {['10000', '25000', '100000', '250000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWireAmount(preset)}
                          className="flex-1 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] text-[11px] font-mono text-zinc-300 cursor-pointer"
                        >
                          ${Number(preset).toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Live FX Quote Box */}
                    <div className="p-4 rounded-xl bg-[#05070B] border border-white/[0.08] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Interbank Mid-Market Rate</span>
                        <span className="font-mono text-white">
                          1 USD = {FX_RATES[wireCurrency].rate} {wireCurrency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Settlement Rail</span>
                        <span className="font-mono text-[#D4AF37]">
                          {FX_RATES[wireCurrency].rail}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Estimated Finality</span>
                        <span className="font-mono text-emerald-400">
                          {FX_RATES[wireCurrency].speed}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between">
                        <span className="text-zinc-300 font-medium">Recipient Receives</span>
                        <span className="text-base font-mono font-bold text-[#D4AF37]">
                          {FX_RATES[wireCurrency].symbol}
                          {(
                            (parseFloat(wireAmount) || 0) * FX_RATES[wireCurrency].rate
                          ).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C86B] text-[#07090D] font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Instant Transfer</span>
                    </button>
                  </form>
                </div>

                {/* Bottom Custody Footnote */}
                <div className="mt-6 pt-4 border-t border-white/[0.07] flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Cryptographic Multi-Sig Approval
                  </span>
                  <span className="font-mono text-zinc-400">SOC2 Type II</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CORPORATE CARDS SECTION */}
      <section id="aurum-cards" className="py-24 px-4 sm:px-8 border-t border-white/[0.07] bg-[#05070B]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">
                CORPORATE SPEND &amp; TITANIUM CARDS
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Precision-Engineered Visa Infinite Cards.
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Issue 22-gram laser-etched titanium cards for partners and unlimited virtual cards
              locked to specific cloud vendors, airlines, or monthly budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 5 Columns: Card Tier Selector + Interactive Visual Metal Card */}
            <div className="lg:col-span-6 space-y-6">
              {/* Card Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCardId(card.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-2 ${
                      selectedCardId === card.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{card.tier}</span>
                    {card.frozen && (
                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px]">
                        FROZEN
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Physical / Virtual Interactive Card Render */}
              <motion.div
                key={selectedCard.id}
                initial={{ opacity: 0.7, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative aspect-[1.586/1] max-w-lg rounded-2xl p-7 sm:p-8 bg-gradient-to-br ${selectedCard.colorClass} border shadow-2xl overflow-hidden flex flex-col justify-between`}
              >
                {/* Frozen Overlay */}
                {selectedCard.frozen && (
                  <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-sky-200">
                    <Snowflake className="w-10 h-10 text-sky-300 mb-2 animate-spin" />
                    <span className="text-xs font-mono uppercase tracking-widest font-semibold">
                      Card Temporarily Frozen
                    </span>
                    <span className="text-[11px] text-sky-300/80 mt-1">
                      All recurring &amp; POS authorizations paused
                    </span>
                  </div>
                )}

                {/* Subtle Metallic Sheen */}
                <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tracking-[0.22em] text-white">
                        AURUM
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.5 rounded">
                        {selectedCard.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">{selectedCard.name}</p>
                  </div>
                  {/* EMV Chip */}
                  <div className="w-11 h-8 rounded-md bg-gradient-to-br from-[#E6C762] to-[#9A7B1C] border border-white/20 opacity-90 flex items-center justify-center">
                    <div className="w-7 h-5 border border-black/30 rounded-sm" />
                  </div>
                </div>

                {/* Card Number */}
                <div className="my-4">
                  <div className="text-lg sm:text-2xl font-mono tracking-[0.2em] text-white">
                    {revealCardNumbers
                      ? `4929  8104  3392  ${selectedCard.last4}`
                      : `••••  ••••  ••••  ${selectedCard.last4}`}
                  </div>
                  <div className="flex items-center gap-6 mt-2 text-xs font-mono text-zinc-400">
                    <span>EXP {selectedCard.expiry}</span>
                    <span>CVV {revealCardNumbers ? selectedCard.cvv : '•••'}</span>
                    <span className="text-emerald-400">1.5% UNLIMITED CASHBACK</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Authorized Cardholder
                    </div>
                    <div className="text-xs sm:text-sm font-mono tracking-wider text-white font-medium">
                      {selectedCard.holder}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold italic tracking-wider text-white">
                      VISA
                    </span>
                    <span className="block text-[9px] uppercase tracking-widest text-[#D4AF37]">
                      Infinite Business
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right 6 Columns: Live Card Controls, Spend Limit Slider & Copy Actions */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
                <div>
                  <span className="text-xs font-mono text-[#D4AF37] uppercase">
                    {selectedCard.role}
                  </span>
                  <h3 className="text-xl font-semibold text-white mt-0.5">{selectedCard.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRevealCardNumbers((prev) => !prev)}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {revealCardNumbers ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Mask Details</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Reveal Details</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`492981043392${selectedCard.last4}`, selectedCard.id)
                    }
                    className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === selectedCard.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied PAN</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Spend Utilization Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-400">Current Monthly Utilization</span>
                  <span className="font-mono text-white">
                    <strong>${selectedCard.spent.toLocaleString()}</strong> / $
                    {selectedCard.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (selectedCard.spent / selectedCard.limit) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Interactive Monthly Spend Limit Slider */}
              <div className="p-4 rounded-xl bg-[#07090D] border border-white/[0.07]">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-medium text-zinc-300">
                    Adjust Programmable Monthly Spend Limit
                  </span>
                  <span className="text-sm font-mono font-bold text-[#D4AF37]">
                    ${selectedCard.limit.toLocaleString()} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={2500}
                  value={selectedCard.limit}
                  onChange={(e) => updateCardLimit(selectedCard.id, Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>$5,000</span>
                  <span>$50,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Freeze / Unfreeze & Guardrails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleFreezeCard(selectedCard.id)}
                  className={`py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                    selectedCard.frozen
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
                  }`}
                >
                  {selectedCard.frozen ? (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>Unfreeze Card Immediately</span>
                    </>
                  ) : (
                    <>
                      <Snowflake className="w-4 h-4" />
                      <span>Freeze Card Instantly</span>
                    </>
                  )}
                </button>

                <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Auto-Receipt OCR Match</span>
                  <span className="text-emerald-400 font-mono font-medium">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE TREASURY YIELD CALCULATOR SECTION */}
      <section id="aurum-yield" className="py-24 px-4 sm:px-8 border-t border-white/[0.07] relative">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">
              AUTOMATED U.S. TREASURY LIQUIDITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
              Turn Idle Operating Cash into Sovereign Yield.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Slide your company&apos;s average cash balance below to compare Aurum&apos;s automated
              U.S. Treasury Bill custody account (<strong className="text-white">5.28% Net APY</strong>)
              against legacy commercial bank checking (<strong className="text-zinc-300">0.45% APY</strong>).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Calculator Controls */}
            <div className="lg:col-span-7 p-6 sm:p-10 rounded-2xl bg-[#0B0E14] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <span className="text-xs uppercase tracking-wider text-zinc-400">
                    Idle Corporate Treasury Balance
                  </span>
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#D4AF37]">
                    ${idleBalance.toLocaleString('en-US')}
                  </span>
                </div>

                <input
                  type="range"
                  min={100000}
                  max={25000000}
                  step={100000}
                  value={idleBalance}
                  onChange={(e) => setIdleBalance(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] h-2 rounded-lg cursor-pointer mb-3"
                />
                <div className="flex justify-between text-xs font-mono text-zinc-500 mb-8">
                  <span>$100,000</span>
                  <span>$5,000,000</span>
                  <span>$12,500,000</span>
                  <span>$25,000,000</span>
                </div>

                {/* Comparison Bars */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        Aurum Sovereign Treasury Vault (5.28% Net APY)
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        +${aurumAnnualYield.toLocaleString('en-US')} / yr
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-600" />
                        Legacy Tier-1 Commercial Bank (0.45% APY Average)
                      </span>
                      <span className="font-mono text-zinc-400">
                        +${legacyAnnualYield.toLocaleString('en-US')} / yr
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-[9%] bg-zinc-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
                <span>State &amp; Local Tax Exempt (Direct U.S. Treasury Bills)</span>
                <span className="font-mono text-zinc-300">Same-Day Liquidity Sweep</span>
              </div>
            </div>

            {/* Yield Output Card */}
            <div className="lg:col-span-5 p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-[#16130B] via-[#0D0F14] to-[#080A0F] border border-[#D4AF37]/30 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-mono mb-4">
                  NET ANNUAL TREASURY ADVANTAGE
                </span>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-white mb-2">
                  +${netExtraAnnual.toLocaleString('en-US')}
                </div>
                <p className="text-xs text-zinc-400 mb-6">
                  Additional risk-free runway generated per year compared to standard commercial
                  checking accounts.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.07]">
                    <div className="text-[11px] text-zinc-400">Monthly Payout</div>
                    <div className="text-lg font-mono font-semibold text-[#D4AF37] mt-0.5">
                      +${Math.round(aurumAnnualYield / 12).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.07]">
                    <div className="text-[11px] text-zinc-400">Net Extra / Month</div>
                    <div className="text-lg font-mono font-semibold text-emerald-400 mt-0.5">
                      +${netExtraMonthly.toLocaleString('en-US')}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApplicationSubmitted(false);
                  setModalMode('open');
                }}
                className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-[#07090D] font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lock In 5.28% Treasury Vault</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY, CUSTODY & COMPLIANCE GRID */}
      <section id="aurum-security" className="py-24 px-4 sm:px-8 border-t border-white/[0.07] bg-[#05070B]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">
                CUSTODY, GOVERNANCE &amp; DEFENSE
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Fortress-Grade Institutional Custody.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setModalMode('audit')}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-medium text-[#D4AF37] flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Inspect SOC2 &amp; BNY Mellon Custody Attestation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Landmark,
                badge: 'BNY MELLON CUSTODY',
                title: 'Segregated Tier-1 Vaults',
                desc: 'Your Treasury bills are held in bankruptcy-remote, segregated custody accounts at BNY Mellon — never commingled or lent out.',
              },
              {
                icon: ShieldCheck,
                badge: '$5,000,000 FDIC SWEEP',
                title: '20x Standard FDIC Coverage',
                desc: 'Operating cash is automatically distributed across our 20-bank program network for up to $5M in FDIC insurance.',
              },
              {
                icon: KeyRound,
                badge: 'WEBAUTHN PASSKEYS',
                title: 'Hardware Biometric Quorum',
                desc: 'Enforce YubiKey / TouchID hardware passkeys and dual-officer multi-signature approvals for wires above custom thresholds.',
              },
              {
                icon: FileText,
                badge: 'SOC2 TYPE II & ISO-27001',
                title: 'Continuous Audit Telemetry',
                desc: 'Real-time cryptographic ledger verification with automated NetSuite, QuickBooks, and Xero ERP reconciliation.',
              },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#D4AF37]/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.07]">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                    <span>VERIFIED ACTIVE</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING TIERS SECTION */}
      <section id="aurum-pricing" className="py-24 px-4 sm:px-8 border-t border-white/[0.07]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37] block mb-2">
              TRANSPARENT INSTITUTIONAL MEMBERSHIP
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
              Aligned with Your Operating Scale.
            </h2>
            <p className="text-sm text-zinc-400">
              Zero domestic or international wire fees. Zero minimums on Standard Operating accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Tier */}
            <div className="p-8 rounded-2xl bg-[#0B0E14] border border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">Aurum Standard</span>
                  <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded bg-white/[0.04]">
                    VENTURE &amp; GROWTH
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-mono font-bold text-white">$0</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">
                  Complete multi-currency operating accounts and corporate cards for high-growth companies.
                </p>

                <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                  {[
                    'Multi-currency USD, EUR, GBP & NGN operating accounts',
                    'Unlimited virtual Visa Infinite cards + 1.5% cashback',
                    'Free domestic ACH, FedNow & SEPA Instant transfers',
                    'Up to $5M FDIC sweep protection across partner banks',
                    'Automated accounting sync (NetSuite, Xero, QuickBooks)',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApplicationSubmitted(false);
                  setModalMode('open');
                }}
                className="w-full py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Open Standard Account
              </button>
            </div>

            {/* Aurum Private Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#17140A] via-[#0B0E14] to-[#080A0F] border border-[#D4AF37]/50 shadow-2xl shadow-[#D4AF37]/5 flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#D4AF37]">Aurum Private Treasury</span>
                  <span className="text-[10px] font-mono text-[#07090D] bg-[#D4AF37] font-semibold px-2.5 py-1 rounded">
                    WAIVED ABOVE $500K BALANCE
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-mono font-bold text-white">$250</span>
                  <span className="text-xs text-zinc-400">/ month</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6">
                  Direct U.S. Treasury Bill custody, 0.00% FX interbank spreads, and dedicated Zurich/NYC relationship desk.
                </p>

                <ul className="space-y-3 text-xs text-zinc-200 mb-8">
                  {[
                    '5.28% Net APY direct U.S. Treasury Bill custody (BNY Mellon)',
                    'Up to 5 laser-etched 22g Founder Titanium Visa Infinite cards',
                    '0.00% interbank FX spreads across 38 global currencies',
                    'Dedicated Private Wealth & Treasury Strategist (24/7 Direct Slack/Signal)',
                    'Custom multi-signature cryptographic approval hierarchies',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApplicationSubmitted(false);
                  setModalMode('open');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C86B] text-[#07090D] font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition cursor-pointer"
              >
                Apply for Aurum Private
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORPORATE BANKING FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#040508] py-16 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-semibold tracking-[0.2em] text-white">
                  AURUM PRIVATE TREASURY
                </span>
              </div>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                Institutional operating accounts, sovereign U.S. Treasury yield vaults, and
                programmable corporate cards engineered for global founders and family offices.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-400 space-y-1">
                <div>ABA ROUTING: 021000021 • SWIFT BIC: AURUUS33XXX</div>
                <div>CUSTODIAN: BNY MELLON SECURITIES CORP (MEMBER FINRA/SIPC)</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Platform &amp; Products
              </div>
              <ul className="space-y-2 text-zinc-400">
                <li>U.S. Treasury Vaults (5.28% APY)</li>
                <li>Founder Metal Visa Infinite</li>
                <li>Multi-Currency SEPA / SWIFT Desk</li>
                <li>ERP &amp; NetSuite API Webhooks</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Governance &amp; Trust
              </div>
              <ul className="space-y-2 text-zinc-400">
                <li>SOC2 Type II Security Report</li>
                <li>$5M FDIC Sweep Program Banks</li>
                <li>SIPC Sovereign Custody Disclosure</li>
                <li>Hardware Passkey Policy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] text-[11px] text-zinc-500 leading-relaxed space-y-3">
            <p>
              Aurum Private Treasury Inc. is a financial technology company, not an FDIC-insured
              depository institution. Banking services are provided by Column N.A. and Evolve Bank &amp;
              Trust, Members FDIC. FDIC deposit insurance covers the failure of an insured
              depository institution up to $5,000,000 through our automated sweep network.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-zinc-400">
              <span>© {new Date().getFullYear()} Aurum Private Treasury Inc. All rights reserved.</span>
              <span className="text-emerald-400 font-mono">
                ● All Global Settlement Nodes Operational (99.999% SLA)
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS: SIGN IN / OPEN ACCOUNT / AUDIT REPORT */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setModalMode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0B0E14] border border-white/[0.12] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] block">
                    {modalMode === 'signin'
                      ? 'HARDWARE PASSKEY AUTHENTICATION'
                      : modalMode === 'open'
                      ? 'INSTITUTIONAL ONBOARDING'
                      : 'COMPLIANCE & CUSTODY ATTESTATION'}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-0.5">
                    {modalMode === 'signin'
                      ? 'Sign In to Aurum OS'
                      : modalMode === 'open'
                      ? 'Open Corporate Treasury Account'
                      : 'SOC2 Type II & BNY Mellon Custody'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalMode === 'audit' ? (
                <div className="space-y-4 text-xs text-zinc-300">
                  <div className="p-4 rounded-xl bg-[#07090D] border border-white/[0.08] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Independent Auditor</span>
                      <span className="font-mono text-white">Deloitte &amp; Touche LLP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Custodian Bank</span>
                      <span className="font-mono text-[#D4AF37]">BNY Mellon N.A.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Attestation Period</span>
                      <span className="font-mono text-emerald-400">Valid through Q4 2026</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    All customer Treasury holdings are held in segregated, bankruptcy-remote
                    accounts under CUSIP-level identification.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#07090D] font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Acknowledge &amp; Close
                  </button>
                </div>
              ) : applicationSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    {modalMode === 'signin'
                      ? 'Hardware Passkey Challenge Sent'
                      : 'Priority KYB Dossier Initialized'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {modalMode === 'signin'
                      ? 'Touch your YubiKey or approve the biometric prompt on your registered device.'
                      : `Our Zurich & New York private onboarding desk has reserved a 5.28% APY Treasury vault for ${
                          companyName || 'your entity'
                        }.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="w-full py-3 rounded-xl bg-white/[0.08] text-white text-xs font-semibold cursor-pointer"
                  >
                    Return to Live Demo
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setApplicationSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  {modalMode === 'open' && (
                    <>
                      <div>
                        <label className="block text-zinc-400 mb-1">Legal Entity Name</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Acme Sovereign Holdings Ltd."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090D] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1">Primary Jurisdiction</label>
                        <select
                          value={jurisdiction}
                          onChange={(e) => setJurisdiction(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090D] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option>Delaware C-Corp (United States)</option>
                          <option>United Kingdom Ltd.</option>
                          <option>Swiss AG / GmbH (Zurich / Zug)</option>
                          <option>Cayman Islands Exempted Company</option>
                          <option>Nigeria RC Holding Company</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-zinc-400 mb-1">Executive Work Email</label>
                    <input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="founder@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090D] border border-white/[0.1] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C86B] text-[#07090D] font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    {modalMode === 'signin'
                      ? 'Authenticate with Passkey'
                      : 'Request Same-Day KYB Approval'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AurumCapitalSite;
