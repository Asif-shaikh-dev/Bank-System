import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Landmark,
  Home,
  ShieldCheck,
  Send,
  CreditCard,
  Users2,
  Building2,
  TrendingUp,
  Star,
} from "lucide-react";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import { useAuth } from "../../../store/AuthContext";
import { formatCurrency } from "../../../utils/formatCurrency";

// NOTE: this page no longer shows the signed-in customer's balance,
// account numbers or transaction history — it's the bank's home /
// promotions surface. Real account data lives on /accounts instead.

// Rotating hero offers — swap for a real GET /api/promotions later.
const HERO_SLIDES = [
  {
    eyebrow: "Home Loans",
    headline: "Own your home at 8.35% interest, starting today",
    body: "Balance-transfer an existing loan or start fresh — approval in as little as 3 working days.",
    cta: "Check eligibility",
    to: "/loans/home-loan",
  },
  {
    eyebrow: "Personal Loans",
    headline: `Up to ${formatCurrency(2500000)}, in your account within 48 hours`,
    body: "No collateral, no guarantor — just your salary slip and a few minutes online.",
    cta: "Apply now",
    to: "/loans/personal-loan",
  },
  {
    eyebrow: "Health Insurance",
    headline: "Cover your whole family from ₹499 a month",
    body: "Cashless treatment at 12,000+ hospitals across India, no medical test under 45.",
    cta: "Get a quote",
    to: "/insurance",
  },
  {
    eyebrow: "Savings Account",
    headline: "A savings account that doesn't nickel-and-dime you",
    body: "Zero balance requirement, a free debit card, and 4% interest from day one.",
    cta: "Open an account",
    to: "/open-account",
  },
];

const QUICK_ACTIONS = [
  { icon: Home, label: "Home Loan", to: "/loans/home-loan" },
  { icon: Send, label: "Personal Loan", to: "/loans/personal-loan" },
  { icon: ShieldCheck, label: "Insurance", to: "/insurance" },
  { icon: Landmark, label: "Fixed Deposit", to: "/accounts" },
  // { icon: CreditCard, label: "Open Account", to: "/open-account" },
];

const OFFER_CARDS = [
  {
    tag: "Limited period",
    title: "Festive home loan offer",
    body: "Zero processing fee and a free property valuation on every home loan sanctioned this month.",
    cta: "Know more",
    to: "/loans/home-loan",
  },
  {
    tag: "Instant approval",
    title: "Pre-approved personal loans",
    body: "Existing customers can check a pre-approved offer and get funds the same day, paperwork-free.",
    cta: "Check my offer",
    to: "/loans/personal-loan",
  },
  {
    tag: "New",
    title: "Family floater health cover",
    body: "One policy for up to 6 family members, with a no-claim bonus that grows every renewal.",
    cta: "Get covered",
    to: "/insurance",
  },
];

// Mirrors the scheme names already used in Navbar's NAV_DATA, so the
// homepage and the mega-menu never disagree on what a product is called.
const PRODUCT_CATALOG = {
  accounts: {
    label: "Accounts",
    icon: Landmark,
    blurb: "NexusBank offers a range of account types built around how you actually bank — pick the one that fits your goals.",
    subTabs: [
      {
        id: "savings",
        label: "Saving Accounts",
        items: [
          { name: "Super Savings Account", desc: "Our everyday account — no-frills, easy to open, and free of hidden charges.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Masterstroke Saving Bank Account", desc: "Higher interest tiers and a free debit card upgrade above ₹25,000.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Women Sapphire Savings Account", desc: "Preferential rates on loans and lockers for women account holders.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Senior Citizen Vishesh Samman SB", desc: "Extra interest and priority service for retirement-age banking.", applyTo: "/open-account", knowMoreTo: "/accounts" },
        ],
      },
      {
        id: "current",
        label: "Current Accounts",
        items: [
          { name: "Regular Current Account", desc: "Everyday transaction banking for individuals and small businesses.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Business Current Account", desc: "Higher transaction limits and relationship support as you grow.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Startup Current Account", desc: "Zero-balance current account for newly incorporated startups.", applyTo: "/open-account", knowMoreTo: "/accounts" },
        ],
      },
      {
        id: "fixed-deposit",
        label: "Fixed Deposit",
        items: [
          { name: "Regular Fixed Deposit", desc: "Lock in today's rate for tenures from 7 days to 10 years.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Tax Saving Fixed Deposit", desc: "5-year lock-in FD that qualifies for deduction under Section 80C.", applyTo: "/open-account", knowMoreTo: "/accounts" },
          { name: "Senior Citizen FD", desc: "An extra 0.5% interest on every tenure, for customers 60 and above.", applyTo: "/open-account", knowMoreTo: "/accounts" },
        ],
      },
    ],
  },
  loans: {
    label: "Loans",
    icon: Home,
    blurb: "Whatever you're financing, there's a NexusBank loan built around a straightforward approval process.",
    subTabs: [
      {
        id: "home-loan",
        label: "Home Loan",
        items: [
          { name: "Regular Home Loan", desc: "Finance up to 90% of your property value at competitive floating rates.", applyTo: "/loans/home-loan/apply", knowMoreTo: "/loans/home-loan" },
          { name: "Home Loan Top-Up", desc: "Borrow more against an existing home loan, no fresh collateral needed.", applyTo: "/loans/home-loan/apply", knowMoreTo: "/loans/home-loan" },
          { name: "NRI Home Loan", desc: "Buy property back home with a loan structured for NRI income.", applyTo: "/loans/home-loan/apply", knowMoreTo: "/loans/home-loan" },
        ],
      },
      {
        id: "personal-loan",
        label: "Personal Loan",
        items: [
          { name: "Regular Personal Loan", desc: "Unsecured funding for any purpose, disbursed in as little as 48 hours.", applyTo: "/loans/personal-loan/apply", knowMoreTo: "/loans/personal-loan" },
          { name: "Pre-Approved Personal Loan", desc: "Instant, paperless disbursal if you have a pre-approved offer.", applyTo: "/loans/personal-loan/apply", knowMoreTo: "/loans/personal-loan" },
          { name: "Personal Loan for Pensioners", desc: "Designed around pension income, with a longer repayment window.", applyTo: "/loans/personal-loan/apply", knowMoreTo: "/loans/personal-loan" },
        ],
      },
      {
        id: "car-loan",
        label: "Car Loan",
        items: [
          { name: "New Car Loan", desc: "Up to 100% on-road funding, with tenures stretching to 7 years.", applyTo: "/loans/car-loan/apply", knowMoreTo: "/loans/car-loan" },
          { name: "Used Car Loan", desc: "Finance a pre-owned car up to 8 years old at attractive rates.", applyTo: "/loans/car-loan/apply", knowMoreTo: "/loans/car-loan" },
          { name: "Car Loan Balance Transfer", desc: "Move an existing car loan to NexusBank for a lower rate.", applyTo: "/loans/car-loan/apply", knowMoreTo: "/loans/car-loan" },
        ],
      },
    ],
  },
  insurance: {
    label: "Insurance",
    icon: ShieldCheck,
    blurb: "Cover the things that matter — life, health and vehicle — bundled with your banking relationship.",
    subTabs: [
      {
        id: "term",
        label: "Term Life",
        items: [
          { name: "Term Life Cover", desc: "Pure protection starting at ₹499/month for a ₹1 Cr sum assured.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
          { name: "Term Life Cover Plus", desc: "Adds critical illness and accidental death riders to your base cover.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
        ],
      },
      {
        id: "health",
        label: "Health",
        items: [
          { name: "Family Floater Health Plan", desc: "One policy for your whole family, with cashless hospital access.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
          { name: "Individual Health Plan", desc: "Standalone cover with a no-claim bonus that grows every year.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
        ],
      },
      {
        id: "motor",
        label: "Motor",
        items: [
          { name: "Car Insurance", desc: "Comprehensive cover with a zero-depreciation add-on available.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
          { name: "Two-Wheeler Insurance", desc: "Third-party and comprehensive plans, renewed in under 2 minutes.", applyTo: "/insurance/apply", knowMoreTo: "/insurance" },
        ],
      },
    ],
  },
};

const RATE_TABLE = [
  { product: "Home Loan", rate: "8.35% p.a. onwards", tenure: "Up to 30 years" },
  { product: "Personal Loan", rate: "10.75% p.a. onwards", tenure: "Up to 5 years" },
  { product: "Car Loan", rate: "8.70% p.a. onwards", tenure: "Up to 7 years" },
  { product: "Fixed Deposit", rate: "7.25% p.a. (5-yr)", tenure: "7 days – 10 years" },
];

const STATS = [
  { icon: Users2, value: "2.4 Cr+", label: "Customers across India" },
  { icon: Building2, value: "15,000+", label: "Branches & ATMs" },
  { icon: TrendingUp, value: "₹18L Cr+", label: "Assets under management" },
  { icon: Star, value: "4.6", label: "Average app rating" },
];

const TESTIMONIALS = [
  { quote: "Got my home loan approved in four days flat, no branch visits needed.", name: "Ananya R.", role: "Home Loan customer, Pune" },
  { quote: "Switched my salary account here for the zero-fee savings account alone.", name: "Rohit M.", role: "Savings customer, Bengaluru" },
  { quote: "Claim settlement for my father's hospitalisation took under a week.", name: "Priya S.", role: "Health Insurance customer, Mumbai" },
];

const FAQ_DATA = [
  { q: "How long does personal loan approval take?", a: "Pre-approved customers usually see funds within 48 hours of applying; others typically hear back within 2–3 working days after document verification." },
  { q: "Can I prepay my home loan without penalty?", a: "Yes — floating-rate home loans can be prepaid or foreclosed anytime with no prepayment charges." },
  { q: "Do I need a medical test for health insurance?", a: "Applicants under 45 with no declared pre-existing conditions can usually skip the medical test." },
  { q: "Is there a minimum balance on the savings account?", a: "No. The Super Savings Account has no minimum balance requirement." },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function DashBoard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  const [activeCategory, setActiveCategory] = useState("accounts");
  const [activeSubTab, setActiveSubTab] = useState(PRODUCT_CATALOG.accounts.subTabs[0].id);
  const [heroIndex, setHeroIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Auto-advance the hero offer slider.
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  const displayName = user?.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const catalog = PRODUCT_CATALOG[activeCategory];
  const CategoryIcon = catalog.icon;
  const currentSubTab = catalog.subTabs.find((t) => t.id === activeSubTab) ?? catalog.subTabs[0];

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setActiveSubTab(PRODUCT_CATALOG[catId].subTabs[0].id);
    carouselRef.current?.scrollTo({ left: 0 });
  };

  const scrollCarousel = (dir) => {
    carouselRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  const prevHero = () => setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextHero = () => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
  const toggleFaq = (i) => setOpenFaq((cur) => (cur === i ? null : i));

  return (
    <div className="db-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

        .db-shell, .db-shell * { box-sizing: border-box; }
        .db-shell {
          --ink: #142850;
          --ink-2: #0D1B38;
          --coral: #F58220;
          --coral-dark: #E4600D;
          --paper: #F5F6F8;
          --ink-text: #16233D;
          --muted: #6B7280;
          --border: #E7E9EE;
          font-family: 'Inter', sans-serif;
          background: var(--paper);
          min-height: 100vh;
        }

        .db-container { max-width: 1152px; margin: 0 auto; padding: 36px 24px 64px; }

        .db-welcome { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 6px; }
        .db-welcome h1 { margin: 0; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.6rem; color: var(--ink-text); }
        .db-welcome .db-date { font-size: 12.5px; color: var(--muted); }

        .db-section-header { display: flex; align-items: center; justify-content: space-between; margin: 40px 0 14px; }
        .db-section-header h2 { margin: 0; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.3rem; color: var(--ink-text); }

        /* ---- Hero offer slider ---- */
        .hero-slider { position: relative; border-radius: 20px; overflow: hidden; }
        .hero-slider-track { display: flex; transition: transform 500ms ease; }
        .hero-slide {
          position: relative; flex: 0 0 100%; overflow: hidden;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%); color: #fff;
          padding: 40px 40px 34px; min-height: 220px; display: flex; flex-direction: column; justify-content: center;
        }
        .hero-slide-blob {
          position: absolute; width: 340px; height: 340px; right: -110px; top: -130px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(245,130,32,0.55), rgba(255,196,155,0.15) 55%, transparent 70%);
          filter: blur(46px);
        }
        .hero-slide-eyebrow { position: relative; z-index: 1; margin: 0 0 10px; font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .hero-slide-headline { position: relative; z-index: 1; margin: 0 0 10px; max-width: 520px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.7rem; line-height: 1.25; }
        .hero-slide-body { position: relative; z-index: 1; margin: 0 0 20px; max-width: 460px; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.75); }
        .hero-slide-cta {
          position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; width: fit-content;
          padding: 10px 20px; border-radius: 999px; background: linear-gradient(135deg, var(--coral), var(--coral-dark));
          color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; transition: transform 150ms ease;
        }
        .hero-slide-cta:hover { transform: translateY(-1px); }

        .hero-slider-controls { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 14px 0 0; }
        .hero-slider-controls > button {
          width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border); background: #fff;
          display: flex; align-items: center; justify-content: center; color: var(--ink-text); cursor: pointer; transition: all 160ms ease;
        }
        .hero-slider-controls > button:hover { border-color: var(--coral-dark); color: var(--coral-dark); }
        .hero-slider-dots { display: flex; gap: 6px; }
        .hero-dot { width: 7px; height: 7px; border-radius: 50%; border: none; background: var(--border); cursor: pointer; padding: 0; }
        .hero-dot.is-active { width: 20px; border-radius: 999px; background: var(--coral-dark); }

        /* ---- Quick actions ---- */
        .quick-actions { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 20px; }
        .quick-action {
          display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px;
          background: #fff; border: 1px solid var(--border); border-radius: 14px; text-decoration: none;
          color: var(--ink-text); font-size: 12px; font-weight: 600; text-align: center; transition: border-color 160ms ease, transform 160ms ease;
        }
        .quick-action:hover { border-color: var(--coral); transform: translateY(-2px); }
        .quick-action-icon {
          width: 38px; height: 38px; border-radius: 50%; background: rgba(245,130,32,0.1); color: var(--coral-dark);
          display: flex; align-items: center; justify-content: center;
        }

        /* ---- Offer cards ---- */
        .offer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .offer-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 22px; }
        .offer-card-tag {
          display: inline-block; margin-bottom: 12px; padding: 4px 10px; border-radius: 999px;
          background: rgba(20,40,80,0.06); color: var(--ink); font-size: 11px; font-weight: 600;
        }
        .offer-card h3 { margin: 0 0 8px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.05rem; color: var(--ink-text); }
        .offer-card p { margin: 0 0 16px; font-size: 13px; color: var(--muted); line-height: 1.55; min-height: 62px; }
        .offer-card-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 700; color: var(--coral-dark); text-decoration: none; }

        /* ---- BoB-style product browser ---- */
        .products-section { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 26px 28px; }
        .products-pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; }
        .products-pill {
          padding: 8px 18px; border-radius: 999px; border: 1px solid var(--border); background: #F7F8FA;
          font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; transition: all 160ms ease;
        }
        .products-pill.is-active { background: rgba(245,130,32,0.12); border-color: var(--coral); color: var(--coral-dark); }

        .products-intro { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
        .products-intro-icon {
          width: 52px; height: 52px; border-radius: 12px; background: rgba(245,130,32,0.1); color: var(--coral-dark);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .products-intro h3 { margin: 0 0 4px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.2rem; color: var(--ink-text); }
        .products-intro p { margin: 0; font-size: 13px; color: var(--muted); max-width: 560px; line-height: 1.5; }

        .products-subtabs { display: flex; gap: 22px; border-bottom: 1px solid var(--border); margin-bottom: 20px; flex-wrap: wrap; }
        .products-subtab {
          padding: 0 0 10px; border: none; background: transparent; font-size: 13.5px; font-weight: 600;
          color: var(--muted); cursor: pointer; position: relative;
        }
        .products-subtab.is-active { color: var(--ink-text); }
        .products-subtab.is-active::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--coral-dark);
        }

        .products-carousel {
          display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .products-carousel::-webkit-scrollbar { display: none; }
        .product-card {
          flex: 0 0 260px; scroll-snap-align: start; background: #FBFBFC; border: 1px solid var(--border);
          border-radius: 14px; padding: 20px;
        }
        .product-card h4 { margin: 0 0 10px; font-size: 14.5px; font-weight: 700; color: var(--ink-text); }
        .product-card p { margin: 0 0 18px; font-size: 12.5px; color: var(--muted); line-height: 1.5; min-height: 55px; }
        .product-card-links { display: flex; gap: 16px; }
        .product-card-links a { font-size: 12.5px; font-weight: 700; color: var(--ink-text); text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
        .product-card-links a:last-child { color: var(--coral-dark); }

        .products-carousel-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
        .products-viewall { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: var(--ink-text); text-decoration: none; }
        .products-arrows { display: flex; gap: 8px; }
        .products-arrows button {
          width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: #fff;
          display: flex; align-items: center; justify-content: center; color: var(--ink-text); cursor: pointer; transition: all 160ms ease;
        }
        .products-arrows button:hover { border-color: var(--coral-dark); color: var(--coral-dark); }

        /* ---- Rate table ---- */
        .rate-table { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .rate-table-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr; padding: 14px 22px; border-bottom: 1px solid var(--border); }
        .rate-table-row:last-child { border-bottom: none; }
        .rate-table-row span { font-size: 13px; color: var(--ink-text); }
        .rate-table-head { background: var(--paper); }
        .rate-table-head span { font-weight: 700; color: var(--muted); font-size: 11.5px; }
        .rate-table-row:not(.rate-table-head) span:first-child { font-weight: 600; }

        /* ---- Stats strip ---- */
        .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .stats-item { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 20px 18px; color: var(--coral-dark); }
        .stats-value { margin: 10px 0 2px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.5rem; color: var(--ink-text); }
        .stats-label { margin: 0; font-size: 12px; color: var(--muted); }

        /* ---- Testimonials ---- */
        .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .testimonial-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 22px; }
        .testimonial-stars { display: flex; gap: 2px; color: var(--coral); margin-bottom: 12px; }
        .testimonial-quote { margin: 0 0 16px; font-size: 13.5px; color: var(--ink-text); line-height: 1.6; }
        .testimonial-name { margin: 0; font-size: 13px; font-weight: 700; color: var(--ink-text); }
        .testimonial-role { margin: 2px 0 0; font-size: 12px; color: var(--muted); }

        /* ---- FAQ ---- */
        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item { background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 4px 20px; }
        .faq-question {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 16px 0; border: none; background: transparent; text-align: left; cursor: pointer;
          font-size: 13.5px; font-weight: 600; color: var(--ink-text);
        }
        .faq-chevron { color: var(--muted); transition: transform 160ms ease; flex-shrink: 0; }
        .faq-chevron.is-open { transform: rotate(180deg); color: var(--coral-dark); }
        .faq-answer { margin: 0; padding: 0 0 18px; font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* ---- Final CTA ---- */
        .final-cta {
          margin-top: 40px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
          background: linear-gradient(160deg, var(--ink) 0%, var(--ink-2) 100%); color: #fff;
          border-radius: 20px; padding: 32px 36px;
        }
        .final-cta h2 { margin: 0 0 6px; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 1.4rem; }
        .final-cta p { margin: 0; font-size: 13.5px; color: rgba(255,255,255,0.75); }
        .final-cta-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 999px;
          background: linear-gradient(135deg, var(--coral), var(--coral-dark)); color: #fff;
          font-size: 13.5px; font-weight: 700; text-decoration: none; flex-shrink: 0; transition: transform 150ms ease;
        }
        .final-cta-btn:hover { transform: translateY(-1px); }

        @media (max-width: 900px) {
          .offer-grid, .testimonial-grid { grid-template-columns: 1fr; }
          .quick-actions { grid-template-columns: repeat(3, 1fr); }
          .stats-strip { grid-template-columns: repeat(2, 1fr); }
          .rate-table-row { grid-template-columns: 1.2fr 1fr 1fr; padding: 12px 16px; }
        }
        @media (max-width: 720px) {
          .product-card { flex-basis: 220px; }
          .hero-slide { padding: 30px 24px 26px; }
          .hero-slide-headline { font-size: 1.35rem; }
          .quick-actions { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <Navbar />

      <div className="db-container">
        <div className="db-welcome">
          <h1>{getGreeting()}, {displayName}</h1>
          <span className="db-date">{today}</span>
        </div>

        <section className="hero-slider" aria-label="Featured offers">
          <div className="hero-slider-track" style={{ transform: `translateX(-${heroIndex * 100}%)` }}>
            {HERO_SLIDES.map((slide) => (
              <div className="hero-slide" key={slide.headline}>
                <div className="hero-slide-blob" />
                <p className="hero-slide-eyebrow">{slide.eyebrow}</p>
                <h2 className="hero-slide-headline">{slide.headline}</h2>
                <p className="hero-slide-body">{slide.body}</p>
                <Link to={slide.to} className="hero-slide-cta">
                  {slide.cta} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
          <div className="hero-slider-controls">
            <button type="button" onClick={prevHero} aria-label="Previous offer">
              <ChevronLeft size={16} />
            </button>
            <div className="hero-slider-dots">
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.headline}
                  type="button"
                  className={`hero-dot ${i === heroIndex ? "is-active" : ""}`}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Go to offer ${i + 1}`}
                />
              ))}
            </div>
            <button type="button" onClick={nextHero} aria-label="Next offer">
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <div className="quick-actions">
          {QUICK_ACTIONS.map((qa) => (
            <Link to={qa.to} className="quick-action" key={qa.label}>
              <span className="quick-action-icon">
                <qa.icon size={20} />
              </span>
              <span>{qa.label}</span>
            </Link>
          ))}
        </div>

        <div className="db-section-header">
          <h2>Offers for you</h2>
        </div>
        <div className="offer-grid">
          {OFFER_CARDS.map((card) => (
            <div className="offer-card" key={card.title}>
              <span className="offer-card-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <Link to={card.to} className="offer-card-link">
                {card.cta} <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>

        <div className="db-section-header">
          <h2>Explore our products</h2>
        </div>
        <div className="products-section">
          <div className="products-pill-row">
            {Object.entries(PRODUCT_CATALOG).map(([id, cat]) => (
              <button
                key={id}
                type="button"
                className={`products-pill ${activeCategory === id ? "is-active" : ""}`}
                onClick={() => handleCategoryChange(id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="products-intro">
            <span className="products-intro-icon"><CategoryIcon size={22} /></span>
            <div>
              <h3>{catalog.label}</h3>
              <p>{catalog.blurb}</p>
            </div>
          </div>

          <div className="products-subtabs">
            {catalog.subTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`products-subtab ${activeSubTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveSubTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="products-carousel" ref={carouselRef}>
            {currentSubTab.items.map((item) => (
              <div className="product-card" key={item.name}>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <div className="product-card-links">
                  <Link to={item.applyTo}>Apply Online</Link>
                  <Link to={item.knowMoreTo}>
                    Know More <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="products-carousel-nav">
            <Link to={`/${activeCategory}`} className="products-viewall">
              View All <ArrowRight size={13} />
            </Link>
            <div className="products-arrows">
              <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Previous">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => scrollCarousel(1)} aria-label="Next">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="db-section-header">
          <h2>Today's rates</h2>
        </div>
        <div className="rate-table">
          <div className="rate-table-row rate-table-head">
            <span>Product</span>
            <span>Rate</span>
            <span>Tenure</span>
          </div>
          {RATE_TABLE.map((r) => (
            <div className="rate-table-row" key={r.product}>
              <span>{r.product}</span>
              <span>{r.rate}</span>
              <span>{r.tenure}</span>
            </div>
          ))}
        </div>

        <div className="db-section-header">
          <h2>NexusBank in numbers</h2>
        </div>
        <div className="stats-strip">
          {STATS.map((s) => (
            <div className="stats-item" key={s.label}>
              <s.icon size={20} />
              <p className="stats-value">{s.value}</p>
              <p className="stats-label">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="db-section-header">
          <h2>What customers say</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <p className="testimonial-name">{t.name}</p>
              <p className="testimonial-role">{t.role}</p>
            </div>
          ))}
        </div>

        <div className="db-section-header">
          <h2>Common questions</h2>
        </div>
        <div className="faq-list">
          {FAQ_DATA.map((item, i) => (
            <div className="faq-item" key={item.q}>
              <button type="button" className="faq-question" onClick={() => toggleFaq(i)}>
                <span>{item.q}</span>
                <ChevronDown size={16} className={`faq-chevron ${openFaq === i ? "is-open" : ""}`} />
              </button>
              {openFaq === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>

        <div className="final-cta">
          <div>
            <h2>Ready to get started?</h2>
            <p>Open an account, apply for a loan, or get insured — all from one place.</p>
          </div>
          <Link to="/open-account" className="final-cta-btn">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}