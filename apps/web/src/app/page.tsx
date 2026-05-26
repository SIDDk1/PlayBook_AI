'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogIn,
  UserPlus,
  Play,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Activity,
  Bot,
  ShieldCheck,
  Send,
  Workflow,
  Library,
  Briefcase,
  Terminal,
} from 'lucide-react';

const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4';

// ----------------- DYNAMIC REACT FADE-IN WRAPPER -----------------
function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-out ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ----------------- CHARACTER-BY-CHARACTER ENTRANCE HEADING -----------------
function AnimatedHeading({
  text,
  delay = 200,
  charDelay = 30,
  duration = 500,
  className = '',
  style = {},
}: {
  text: string;
  delay?: number;
  charDelay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const lines = text.split('\n');

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIndex) => {
        const chars = Array.from(line);
        const lineLength = line.length;

        return (
          <span key={lineIndex} className="block">
            {chars.map((char, charIndex) => {
              // Stagger delay calculation: (lineIndex * lineLength * charDelay) + (charIndex * charDelay)
              const currentDelay = lineIndex * lineLength * charDelay + charIndex * charDelay;
              const charToRender = char === ' ' ? '\u00A0' : char;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all ease-out"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateX(0)' : 'translateX(-18px)',
                    transitionDuration: `${duration}ms`,
                    transitionDelay: `${currentDelay}ms`,
                  }}
                >
                  {charToRender}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

const featureCards = [
  {
    icon: Bot,
    title: 'AI Scenario Detection',
    description: 'Continuously watches rates, volatility, liquidity, and sector stress signals to trigger the right response.',
    metric: '24/7',
    label: 'signal watch',
  },
  {
    icon: ShieldCheck,
    title: 'Portfolio Impact & Risk Checks',
    description: 'Maps exposures, drawdown thresholds, client restrictions, and suitability guardrails before execution.',
    metric: '-38%',
    label: 'risk drift',
  },
  {
    icon: Send,
    title: 'Automated Client Communication',
    description: 'Generates advisor-approved messages, briefings, and next-best-actions for each client segment.',
    metric: '4.2x',
    label: 'faster outreach',
  },
  {
    icon: Workflow,
    title: 'Approval Workflows & Guardrails',
    description: 'Routes every response through compliance, investment committee checks, and auditable playbook states.',
    metric: '100%',
    label: 'review trail',
  },
];

const libraryItems = [
  {
    title: 'Liquidity Stress',
    status: 'Live monitor',
    detail: 'Cash buffers, redemption gates, client prioritization',
  },
  {
    title: 'Earnings Volatility',
    status: 'Ready',
    detail: 'Sector dispersion, concentration limits, advisor notes',
  },
  {
    title: 'Client Panic-Selling',
    status: 'Approval',
    detail: 'Behavioral prompts, rebalancing rules, outreach cadence',
  },
];

function ParallaxScrollStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = sectionRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalHeight = rect.height;
      const scrolled = -rect.top;
      const ratio = Math.max(0, Math.min(1, scrolled / (totalHeight - viewportHeight)));
      setScrollRatio(ratio);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Compute scroll outputs for the pure CSS / style mappings
  const skyY = scrollRatio * 16 - 8;
  const dataY = 14 - scrollRatio * 32;
  const ridgeY = 18 - scrollRatio * 32;
  const panelY = 26 - scrollRatio * 46;

  let titleOpacity = 0;
  if (scrollRatio > 0.08 && scrollRatio < 0.24) {
    titleOpacity = (scrollRatio - 0.08) / 0.16;
  } else if (scrollRatio >= 0.24 && scrollRatio <= 0.72) {
    titleOpacity = 1;
  } else if (scrollRatio > 0.72 && scrollRatio < 0.9) {
    titleOpacity = 1 - (scrollRatio - 0.72) / 0.18;
  } else if (scrollRatio >= 0.9) {
    titleOpacity = 0;
  }

  return (
    <section id="parallax" ref={sectionRef} className="relative h-[240vh] w-full bg-black border-y border-white/10">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-black">
        {/* Parallax layered grid decoration */}
        <div
          style={{ transform: `translateY(${skyY}%)` }}
          className="absolute inset-0 opacity-[0.08] transition-transform duration-300 ease-out"
        >
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:96px_96px]" />
          {[12, 28, 46, 68, 84].map((left, index) => (
            <span
              key={left}
              className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
              style={{ left: `${left}%`, top: `${18 + index * 11}%` }}
            />
          ))}
        </div>

        {/* SVG graph wave drawn in white */}
        <div style={{ transform: `translateY(${dataY}%)` }} className="absolute inset-x-0 top-[16%] mx-auto h-72 max-w-6xl px-5 transition-transform duration-300 ease-out">
          <svg viewBox="0 0 1100 260" className="h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="parallax-line-white" x1="0" x2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
              <filter id="parallax-glow-white">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M0 174 C120 122 190 218 290 162 S470 52 590 116 S775 222 892 110 S1034 80 1100 52"
              fill="none"
              stroke="url(#parallax-line-white)"
              strokeWidth="4"
              filter="url(#parallax-glow-white)"
            />
            {[70, 145, 235, 350, 455, 570, 692, 826, 960].map((x, index) => (
              <g key={x} opacity="0.45">
                <line x1={x} y1={72 + (index % 3) * 24} x2={x} y2={206 - (index % 2) * 22} stroke="#ffffff" strokeOpacity="0.1" />
                <rect
                  x={x - 5}
                  y={112 + (index % 4) * 12}
                  width="10"
                  height={46 + (index % 3) * 20}
                  rx="2.5"
                  fill="#ffffff"
                  opacity="0.3"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Silhouette overlay rows in black */}
        <div style={{ transform: `translateY(${ridgeY}%)` }} className="absolute inset-x-0 bottom-0 h-[42vh] pointer-events-none transition-transform duration-300 ease-out">
          <div className="absolute bottom-0 h-[70%] w-full bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.03)_100%)] [clip-path:polygon(0_72%,10%_56%,22%_64%,34%_28%,48%_48%,61%_18%,77%_52%,90%_30%,100%_48%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 h-[58%] w-full bg-[#050505] [clip-path:polygon(0_45%,12%_24%,25%_48%,38%_18%,50%_42%,62%_22%,74%_54%,88%_26%,100%_46%,100%_100%,0_100%)] border-t border-white/5" />
          <div className="absolute bottom-0 h-[38%] w-full bg-black [clip-path:polygon(0_38%,16%_22%,28%_44%,42%_12%,58%_46%,72%_18%,86%_40%,100%_20%,100%_100%,0_100%)] border-t border-white/10" />
        </div>

        {/* Scroll text container */}
        <div
          style={{ opacity: titleOpacity }}
          className="absolute inset-x-0 top-[18%] z-10 mx-auto max-w-4xl px-5 text-center transition-opacity duration-200 ease-out"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white">Scroll-driven market journey</p>
          <h2 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight tracking-tight text-white">
            Watch signals, stress, and safeguards move in layers.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-300">
            The parallax flow turns raw market motion into a governed path: detect the event, quantify exposure,
            route approvals, and communicate before uncertainty compounds.
          </p>
        </div>

        {/* Steps panels styled in VEX liquid-glass */}
        <div style={{ transform: `translateY(${panelY}%)` }} className="pointer-events-none absolute inset-x-0 bottom-[6%] z-20 mx-auto grid max-w-5xl gap-4 px-5 sm:grid-cols-3 transition-transform duration-300 ease-out">
          {[
            ['01', 'Signal enters', 'Rate shock, liquidity stress, or sector correction detected.'],
            ['02', 'Risk layers rise', 'Portfolio exposure, suitability, and guardrail checks separate.'],
            ['03', 'Playbook lands', 'Approved actions and client communications move into execution.'],
          ].map(([step, title, body]) => (
            <div
              key={title}
              className="rounded-xl border border-white/20 liquid-glass p-5 shadow-none"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">{step}</p>
              <h3 className="mt-2 text-base font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-300">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = ['Story', 'Investing', 'Building', 'Advisory'];

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* ----------------- FULLSCREEN HERO SECTION ----------------- */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Fullscreen cover raw video (NO overlay, NO gradient, NO dimming) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover w-full h-full select-none z-0"
          src={BG_VIDEO}
        />

        {/* ----------------- NAVBAR ----------------- */}
        <nav className="relative z-30 w-full px-6 md:px-12 lg:px-16 pt-6">
          <div className="liquid-glass border border-white/20 rounded-xl px-4 py-2 flex items-center justify-between">
            {/* Left: Sentinel Logo */}
            <Link href="/" className="flex items-center gap-2 text-white transition hover:opacity-90">
              <span className="text-2xl font-semibold tracking-tight">Sentinel</span>
            </Link>

            {/* Center links (hidden on mobile, visible md+) */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-white hover:text-gray-300 transition-colors duration-150"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Right: Start a Chat Action (Redirects to /login) */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-block bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-150"
              >
                Start a Chat
              </Link>
              {/* CSS-Only Menu Toggle Button */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-lg text-white transition-all duration-300 hover:bg-white/10"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <Menu
                  className={`w-5 h-5 absolute transition-all duration-300 ${
                    menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X
                  className={`w-5 h-5 absolute transition-all duration-300 ${
                    menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`}
                />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu backdrop blur overlay */}
        <div
          className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>

        {/* Mobile menu drawer using pure CSS transitions */}
        <div
          className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-8 pb-8 justify-between">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className={`text-2xl font-semibold text-white py-4 border-b border-white/10 transition-all duration-500 ${
                    menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
                >
                  {link}
                </a>
              ))}
            </div>

            <div
              className={`flex flex-col gap-4 pt-6 border-t border-white/10 transition-all duration-500 ${
                menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
              style={{ transitionDelay: menuOpen ? '450ms' : '0ms' }}
            >
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center bg-white text-black py-3.5 rounded-lg font-medium hover:bg-gray-100 transition active:scale-[0.98]"
              >
                Start a Chat
              </Link>
            </div>
          </div>
        </div>

        {/* ----------------- HERO GRID CONTAINER (Bottom of Viewport) ----------------- */}
        <div className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16 select-text">
          <div className="w-full lg:grid lg:grid-cols-2 lg:items-end gap-12">
            {/* Left Column - Main Content */}
            <div className="max-w-[620px] text-left">
              {/* Staggered character entrance heading */}
              <AnimatedHeading
                text={`Shaping tomorrow\nwith vision and action.`}
                delay={200}
                charDelay={30}
                duration={500}
                className="text-white font-normal mb-4 text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ letterSpacing: '-0.04em' }}
              />

              {/* Subheading */}
              <FadeIn delay={800} duration={1000} className="mb-5">
                <p className="text-base md:text-lg text-gray-300">
                  We back visionaries and craft ventures that define what comes next.
                </p>
              </FadeIn>

              {/* Actions row (CTAs Redirect to /login) */}
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-150 inline-block"
                  >
                    Start a Chat
                  </Link>
                  <Link
                    href="/login"
                    className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition duration-300 inline-block"
                  >
                    Explore Now
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right Column - Tag Glass Card */}
            <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light text-white leading-none whitespace-nowrap">
                    Investing. Building. Advisory.
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- METRICS STATS BANNER ----------------- */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 mt-12">
        <div className="overflow-hidden rounded-2xl border border-white/20 liquid-glass p-5 shadow-none flex flex-col sm:flex-row justify-between gap-6">
          {[
            ['3,842', 'Scenario rules'],
            ['91 sec', 'Draft to review'],
            ['SOC2', 'Audit-ready'],
          ].map(([value, label]) => (
            <div key={label} className="text-left flex-1 sm:border-r border-white/10 pr-4 last:border-r-0 last:pr-0">
              <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-300 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- PARALLAX STORY SECTION ----------------- */}
      <ParallaxScrollStory />

      {/* ----------------- PLAYBOOK LIFE CYCLE FEATURE SECTION (STORY) ----------------- */}
      <section id="story" className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-24 z-10 relative bg-black">
        <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white">Playbook lifecycle</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-normal tracking-tight text-white sm:text-4xl">
              From market signal to governed action in one glass-clear workflow.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-gray-300">
            Every stage is designed for investment teams that need speed, auditability, and client confidence when
            the market starts moving.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="group rounded-2xl border border-white/20 liquid-glass p-6 hover:bg-white/5 hover:-translate-y-1.5 transition-all duration-300 shadow-none"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white shadow-none">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/35">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-2.5 min-h-[96px] text-xs sm:text-sm leading-relaxed text-gray-300">{card.description}</p>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
                  <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{card.metric}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold">{card.label}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ----------------- LIBRARY SHOWCASE SECTION (INVESTING) ----------------- */}
      <section id="investing" className="mx-auto grid w-full max-w-[1280px] gap-12 px-5 sm:px-8 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center relative z-10 bg-black">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white">Library showcase</p>
          <h2 className="mt-3 text-3xl font-normal tracking-tight text-white sm:text-4xl">
            Stack institutional responses before the next headline hits.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-300">
            Reusable playbooks pair scenario logic, portfolio diagnostics, stakeholder approvals, and communication
            packs inside a living library your team can keep improving.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {['Rate shock', 'Geopolitical event', 'Sector correction'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 liquid-glass px-4 py-2 text-xs font-semibold text-white shadow-none"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Overlapping Stacks */}
        <div className="relative min-h-[440px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-[2rem] bg-white/5 blur-3xl pointer-events-none" />
          {libraryItems.map((item, index) => (
            <div
              key={item.title}
              className="absolute left-0 right-0 rounded-2xl border border-white/20 liquid-glass p-6 hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer shadow-none"
              style={{
                top: `${index * 112}px`,
                marginLeft: `${index * 28}px`,
              }}
            >
              <div className="flex items-start justify-between gap-5">
                <div className="text-left">
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{item.status}</p>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-300">{item.detail}</p>
                </div>
                {/* Visual Chart Bars in monochrome */}
                <div className="hidden h-16 w-28 items-end gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2.5 sm:flex">
                  {[42, 64, 48, 78, 58, 88].map((height, barIndex) => (
                    <span
                      key={barIndex}
                      className="w-full rounded-t-sm bg-gradient-to-t from-white/20 to-white/80"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2.5 text-xs text-white font-semibold">
                <CheckCircle2 className="h-4 w-4 text-white" />
                Impact model, compliance gate, and client brief attached
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- BUILDING SECTION (NEW) ----------------- */}
      <section id="building" className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-24 z-10 relative bg-black">
        <div className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-12 shadow-none grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white mb-6">
              <Terminal className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white mb-2">Rule Engine Developer Hub</p>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-4">
              Building automated rules & custom API workflows.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-300">
              Sentinel empowers quantitative analysts, developers, and compliance headers to build customized playbook triggers, trigger complex state machines, and sync secure JSON streams. 
              Our developer suite provides instant sandboxing, SOC2-audited verification, and deep integration with your current risk registers.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              ['Automated API Integrations', 'Connect real-time rates trackers, sector stress monitors, and vol feeds directly to the rules manager.'],
              ['Immutable SOC2 Logs', 'All edits, validation runs, and compliance checklist updates are tracked in a secure, immutable audit trail.'],
              ['Boolean Trigger Engine', 'Construct complex Boolean formulas linking exposure indexes, redeeming volumes, and suitability gates.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-white/10 rounded-xl bg-white/5 p-5 text-left">
                <h4 className="text-base font-bold text-white mb-1">{title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- ADVISORY SECTION (NEW) ----------------- */}
      <section id="advisory" className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-24 z-10 relative bg-black">
        <div className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-12 shadow-none flex flex-col md:flex-row gap-8 md:items-center">
          <div className="md:w-1/2 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white mb-6">
              <Briefcase className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white mb-2">Advisor Outreach Hub</p>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-4">
              Client Suitability & RM Advisory Delivery.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-gray-300">
              Sentinel connects client portfolios to automated next-best-actions, sending tailored briefings and compliance-reviewed outreach letters directly to Segment Relationship Managers. 
              Keep your client base assured, suitability guardrails locked, and panic-selling triggers resolved immediately with zero operational friction.
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Client briefs', 'Instantly pre-draft outreach Cadences synced to CRM records.'],
              ['Suitability check', 'Pre-trade suitability checks automated in 91 seconds flat.'],
              ['Redemption gates', 'Dynamic redemption gated limits monitored and prioritized.'],
              ['Behavioral prompts', 'AI behavioral outreach prompts deployed to calm volatility.'],
            ].map(([title, desc]) => (
              <div key={title} className="border border-white/10 rounded-xl bg-white/5 p-5 text-left">
                <h4 className="text-base font-bold text-white mb-1">{title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8 pt-16 pb-8 border-t border-white/10 flex flex-col gap-4 text-xs sm:text-sm text-gray-300 md:flex-row md:items-center md:justify-between bg-black">
        <p className="font-semibold text-white/80">Enterprise AI playbook generation for market response teams.</p>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-white hover:opacity-85 font-bold transition-opacity">
          Start Building
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </main>
  );
}
