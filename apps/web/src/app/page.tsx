'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CandlestickChart,
  CheckCircle2,
  FileText,
  Library,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'

const featureCards = [
  {
    icon: Bot,
    title: 'AI Scenario Detection',
    description: 'Continuously watches rates, volatility, liquidity, and sector stress signals to trigger the right response.',
    metric: '24/7',
    label: 'signal watch',
    glow: 'rgba(34, 211, 238, 0.28)',
  },
  {
    icon: ShieldCheck,
    title: 'Portfolio Impact & Risk Checks',
    description: 'Maps exposures, drawdown thresholds, client restrictions, and suitability guardrails before execution.',
    metric: '-38%',
    label: 'risk drift',
    glow: 'rgba(59, 130, 246, 0.32)',
  },
  {
    icon: Send,
    title: 'Automated Client Communication',
    description: 'Generates advisor-approved messages, briefings, and next-best-actions for each client segment.',
    metric: '4.2x',
    label: 'faster outreach',
    glow: 'rgba(16, 185, 129, 0.28)',
  },
  {
    icon: Workflow,
    title: 'Approval Workflows & Guardrails',
    description: 'Routes every response through compliance, investment committee checks, and auditable playbook states.',
    metric: '100%',
    label: 'review trail',
    glow: 'rgba(125, 211, 252, 0.24)',
  },
]

const libraryItems = [
  {
    title: 'Liquidity Stress',
    status: 'Live monitor',
    detail: 'Cash buffers, redemption gates, client prioritization',
    accent: '#22d3ee',
  },
  {
    title: 'Earnings Volatility',
    status: 'Ready',
    detail: 'Sector dispersion, concentration limits, advisor notes',
    accent: '#10b981',
  },
  {
    title: 'Client Panic-Selling',
    status: 'Approval',
    detail: 'Behavioral prompts, rebalancing rules, outreach cadence',
    accent: '#60a5fa',
  },
]

const floatingProps = [
  {
    icon: ShieldCheck,
    title: 'Risk shield',
    className: 'left-[7%] top-[20%]',
    color: '#38bdf8',
    delay: 0.2,
  },
  {
    icon: FileText,
    title: 'AI document',
    className: 'right-[12%] top-[17%]',
    color: '#34d399',
    delay: 0.45,
  },
  {
    icon: CandlestickChart,
    title: 'Market correction',
    className: 'left-[13%] bottom-[19%]',
    color: '#60a5fa',
    delay: 0.65,
  },
  {
    icon: BrainCircuit,
    title: 'Scenario network',
    className: 'right-[8%] bottom-[24%]',
    color: '#22d3ee',
    delay: 0.85,
  },
]

function ParallaxScrollStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const skyY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const dataY = useTransform(scrollYProgress, [0, 1], ['16%', '-22%'])
  const ridgeY = useTransform(scrollYProgress, [0, 1], ['22%', '-18%'])
  const panelY = useTransform(scrollYProgress, [0, 1], ['32%', '-26%'])
  const glowScale = useTransform(scrollYProgress, [0, 0.45, 1], [0.8, 1.18, 0.9])
  const titleOpacity = useTransform(scrollYProgress, [0.08, 0.24, 0.72, 0.9], [0, 1, 1, 0])

  return (
    <section id="parallax" ref={sectionRef} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden border-y border-white/10 bg-black">
        <motion.div
          style={{ y: skyY }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(34,211,238,0.24),transparent_20%),radial-gradient(circle_at_65%_72%,rgba(16,185,129,0.15),transparent_28%),linear-gradient(180deg,#020617_0%,#000_58%,#050505_100%)]"
        />
        <motion.div
          style={{ scale: glowScale }}
          className="absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <motion.div style={{ y: skyY }} className="absolute inset-0 opacity-25">
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(125,211,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.16)_1px,transparent_1px)] [background-size:96px_96px]" />
          {[12, 28, 46, 68, 84].map((left, index) => (
            <span
              key={left}
              className="absolute h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,0.9)]"
              style={{ left: `${left}%`, top: `${18 + index * 11}%` }}
            />
          ))}
        </motion.div>

        <motion.div style={{ y: dataY }} className="absolute inset-x-0 top-[16%] mx-auto h-72 max-w-6xl px-5">
          <svg viewBox="0 0 1100 260" className="h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="parallax-line" x1="0" x2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.05" />
                <stop offset="45%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id="parallax-glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M0 174 C120 122 190 218 290 162 S470 52 590 116 S775 222 892 110 S1034 80 1100 52"
              fill="none"
              stroke="url(#parallax-line)"
              strokeWidth="4"
              filter="url(#parallax-glow)"
            />
            {[70, 145, 235, 350, 455, 570, 692, 826, 960].map((x, index) => (
              <g key={x} opacity="0.86">
                <line x1={x} y1={72 + (index % 3) * 24} x2={x} y2={206 - (index % 2) * 22} stroke="#94a3b8" strokeOpacity="0.22" />
                <rect
                  x={x - 8}
                  y={112 + (index % 4) * 12}
                  width="16"
                  height={46 + (index % 3) * 20}
                  rx="4"
                  fill={index % 3 === 0 ? '#22d3ee' : index % 3 === 1 ? '#60a5fa' : '#34d399'}
                  opacity="0.65"
                />
              </g>
            ))}
          </svg>
        </motion.div>

        <motion.div style={{ y: ridgeY }} className="absolute inset-x-0 bottom-0 h-[42vh]">
          <div className="absolute bottom-0 h-[70%] w-full bg-[linear-gradient(135deg,transparent_0%,rgba(34,211,238,0.08)_40%,rgba(16,185,129,0.1)_100%)] [clip-path:polygon(0_72%,10%_56%,22%_64%,34%_28%,48%_48%,61%_18%,77%_52%,90%_30%,100%_48%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 h-[58%] w-full bg-[linear-gradient(135deg,#020617_0%,#07111f_52%,#03130d_100%)] [clip-path:polygon(0_45%,12%_24%,25%_48%,38%_18%,50%_42%,62%_22%,74%_54%,88%_26%,100%_46%,100%_100%,0_100%)]" />
          <div className="absolute bottom-0 h-[38%] w-full bg-black [clip-path:polygon(0_38%,16%_22%,28%_44%,42%_12%,58%_46%,72%_18%,86%_40%,100%_20%,100%_100%,0_100%)]" />
        </motion.div>

        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute inset-x-0 top-[18%] z-10 mx-auto max-w-4xl px-5 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Scroll-driven market journey</p>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-normal text-white lg:text-5xl xl:text-6xl">
            Watch signals, stress, and safeguards move in layers.
          </h2>
          <p className="mx-auto mt-5 hidden max-w-2xl text-base leading-7 text-slate-300 lg:block lg:text-lg">
            The parallax flow turns raw market motion into a governed path: detect the event, quantify exposure,
            route approvals, and communicate before uncertainty compounds.
          </p>
        </motion.div>

        <motion.div style={{ y: panelY }} className="pointer-events-none absolute inset-x-0 bottom-[6%] z-20 mx-auto grid max-w-5xl gap-4 px-5 md:grid-cols-3">
          {[
            ['01', 'Signal enters', 'Rate shock, liquidity stress, or sector correction detected.'],
            ['02', 'Risk layers rise', 'Portfolio exposure, suitability, and guardrail checks separate.'],
            ['03', 'Playbook lands', 'Approved actions and client communications move into execution.'],
          ].map(([step, title, body]) => (
            <div
              key={title}
              className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{step}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_78%_14%,rgba(16,185,129,0.1),transparent_26%),linear-gradient(180deg,#000000_0%,#050505_54%,#0a0a0a_100%)]" />
      <div className="fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="fixed inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.05)_46%,transparent_68%)] opacity-40" />

      <div className="relative z-10">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="landing-reveal flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-white/10 shadow-[0_0_30px_rgba(34,211,238,0.24)] backdrop-blur-xl">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-white">SENTINEL AI</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Financial Playbooks</p>
            </div>
          </motion.div>

          <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#parallax" className="transition hover:text-white">Parallax</a>
            <a href="#lifecycle" className="transition hover:text-white">Lifecycle</a>
            <a href="#library" className="transition hover:text-white">Library</a>
            <a href="#guardrails" className="transition hover:text-white">Guardrails</a>
          </div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="landing-reveal reveal-delay-100"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg border border-cyan-200/40 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-50 shadow-[0_0_26px_rgba(34,211,238,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-cyan-300/20 hover:shadow-[0_0_38px_rgba(34,211,238,0.44)]"
            >
              <LockKeyhole className="h-4 w-4" />
              Login
            </Link>
          </motion.div>
        </nav>

        <section className="relative mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-7xl items-center px-5 pb-16 pt-10 sm:px-8 lg:pt-0">
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {floatingProps.map((prop) => {
              const Icon = prop.icon

              return (
                <motion.div
                  key={prop.title}
                  initial={false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: prop.delay, ease: 'easeOut' }}
                  whileHover={{
                    scale: 1.1,
                    y: -12,
                    filter: `drop-shadow(0 0 34px ${prop.color})`,
                  }}
                  className={`landing-reveal pointer-events-auto absolute ${prop.className}`}
                  style={{ filter: `drop-shadow(0 0 18px ${prop.color}55)` }}
                >
                  <motion.div
                    animate={{ y: [0, -14, 0], rotate: [-2, 3, -2] }}
                    transition={{ duration: 5.5 + prop.delay, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl"
                  >
                    <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
                    <Icon className="relative h-11 w-11" style={{ color: prop.color }} />
                    {prop.title === 'AI document' && (
                      <Sparkles className="absolute right-5 top-5 h-4 w-4 text-emerald-200" />
                    )}
                    {prop.title === 'Scenario network' && (
                      <>
                        <span className="absolute left-7 top-6 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_16px_#67e8f9]" />
                        <span className="absolute bottom-7 right-7 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_#6ee7b7]" />
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="landing-reveal mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.13)] backdrop-blur-xl"
            >
              <Activity className="h-4 w-4 text-emerald-300" />
              AI-Assisted Financial Playbook Generator
            </motion.div>

            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="landing-reveal reveal-delay-100 text-balance text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl"
            >
              Navigate Market Chaos with{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-emerald-200 bg-clip-text text-transparent">
                AI-Driven Playbooks.
              </span>
            </motion.h1>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="landing-reveal reveal-delay-200 mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl"
            >
              Define, execute, and automate structured responses for market crashes, rate changes, and geopolitical
              events. Keep your portfolios secure and clients informed.
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="landing-reveal reveal-delay-300 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/login"
                className="group inline-flex min-h-14 items-center gap-3 rounded-lg border border-cyan-200/50 bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 text-base font-semibold text-white shadow-[0_0_42px_rgba(34,211,238,0.38)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_56px_rgba(34,211,238,0.56)]"
              >
                <Library className="h-5 w-5" />
                Enter the Library
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#lifecycle"
                className="inline-flex min-h-14 items-center rounded-lg border border-white/15 bg-white/[0.06] px-7 py-4 text-base font-semibold text-slate-100 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-200/40 hover:bg-emerald-300/10 hover:text-white"
              >
                View Lifecycle
              </a>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.45, ease: 'easeOut' }}
              id="guardrails"
              className="landing-reveal reveal-delay-500 mx-auto mt-14 grid max-w-3xl grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] text-left shadow-[0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              {[
                ['3,842', 'Scenario rules'],
                ['91 sec', 'Draft to review'],
                ['SOC2', 'Audit-ready'],
              ].map(([value, label]) => (
                <div key={label} className="border-r border-white/10 p-5 last:border-r-0">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <ParallaxScrollStory />

        <section id="lifecycle" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-200">Playbook lifecycle</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                From market signal to governed action in one glass-clear workflow.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              Every stage is designed for investment teams that need speed, auditability, and client confidence when
              the market starts moving.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.article
                  key={card.title}
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -8, boxShadow: `0 0 44px ${card.glow}` }}
                  className="group rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl transition"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 min-h-24 text-sm leading-6 text-slate-400">{card.description}</p>
                  <div className="mt-7 rounded-lg border border-white/10 bg-black/30 p-4">
                    <p className="text-2xl font-semibold text-white">{card.metric}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="library" className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-emerald-200">Library showcase</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
              Stack institutional responses before the next headline hits.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-400">
              Reusable playbooks pair scenario logic, portfolio diagnostics, stakeholder approvals, and communication
              packs inside a living library your team can keep improving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Rate shock', 'Geopolitical event', 'Sector correction'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300 backdrop-blur-xl"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-[440px]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-300/10 via-transparent to-emerald-300/10 blur-2xl" />
            {libraryItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={false}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: 'easeOut' }}
                whileHover={{ scale: 1.02, y: -6 }}
                className="absolute left-0 right-0 rounded-lg border border-white/10 bg-black/55 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
                style={{
                  top: `${index * 112}px`,
                  marginLeft: `${index * 28}px`,
                  boxShadow: `0 26px 90px rgba(0,0,0,0.56), 0 0 34px ${item.accent}20`,
                }}
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full shadow-[0_0_18px_currentColor]"
                        style={{ backgroundColor: item.accent, color: item.accent }}
                      />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.status}</p>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                  </div>
                  <div className="hidden h-20 w-32 items-end gap-2 rounded-lg border border-white/10 bg-white/[0.05] p-3 sm:flex">
                    {[42, 64, 48, 78, 58, 88].map((height, barIndex) => (
                      <span
                        key={barIndex}
                        className="w-full rounded-t-sm bg-gradient-to-t from-cyan-400/60 to-emerald-300"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Impact model, compliance gate, and client brief attached
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-white/10 px-5 py-8 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>Enterprise AI playbook generation for market response teams.</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-cyan-100 transition hover:text-white">
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </main>
  )
}
