import { Link } from 'react-router-dom'
import {
  Shield, Globe, MessageSquare, TrendingDown,
  ArrowRight, Play, Zap, BarChart3, Check,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Globe,
    title: 'Real-Time Risk Detection',
    description:
      'Monitor 65,000+ global news sources, satellite feeds, and geopolitical signals to spot supply-chain threats the moment they emerge.',
    gradient: 'from-blue-500 to-blue-700',
    glow: 'shadow-blue-500/25',
  },
  {
    icon: TrendingDown,
    title: 'Cost Impact Analysis',
    description:
      'Instantly quantify financial exposure from any disruption. Know exactly how a port closure in Shanghai affects your bottom line today.',
    gradient: 'from-violet-500 to-violet-700',
    glow: 'shadow-violet-500/25',
  },
  {
    icon: MessageSquare,
    title: 'JARVIS AI Chat',
    description:
      'Ask your supply chain AI anything and get instant, actionable intelligence in plain English — no dashboards required.',
    gradient: 'from-emerald-500 to-emerald-700',
    glow: 'shadow-emerald-500/25',
  },
]

const STATS = [
  { value: '65K+', label: 'News Sources' },
  { value: '180+', label: 'Countries Monitored' },
  { value: '99.7%', label: 'Uptime SLA' },
  { value: '<30s', label: 'Alert Latency' },
]

const RISK_DOTS = [
  { x: '71%', y: '34%', color: 'bg-red-500',    size: 'w-3 h-3',   ping: 'w-6 h-6 -m-1.5'  },
  { x: '74%', y: '41%', color: 'bg-red-500',    size: 'w-2.5 h-2.5', ping: 'w-5 h-5 -m-1'  },
  { x: '68%', y: '53%', color: 'bg-yellow-500', size: 'w-2.5 h-2.5', ping: 'w-5 h-5 -m-1'  },
  { x: '13%', y: '37%', color: 'bg-yellow-500', size: 'w-2 h-2',   ping: 'w-4 h-4 -m-1'    },
  { x: '47%', y: '28%', color: 'bg-green-500',  size: 'w-2 h-2',   ping: 'w-4 h-4 -m-1'    },
  { x: '61%', y: '46%', color: 'bg-yellow-500', size: 'w-2 h-2',   ping: 'w-4 h-4 -m-1'    },
  { x: '74%', y: '57%', color: 'bg-red-500',    size: 'w-2 h-2',   ping: 'w-4 h-4 -m-1'    },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Foresight</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            {['Features', 'Pricing', 'Documentation', 'About'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-150">{l}</a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hidden sm:block px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors duration-150 shadow-md shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 left-1/3  w-[350px] h-[350px] bg-indigo-700/8  rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Monitoring 180+ countries in real-time
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              See threats{' '}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                before
              </span>
              <br />they happen.
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Foresight is an AI-powered supply chain risk intelligence platform that monitors global
              events, predicts disruptions, and protects your business — before the crisis hits.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5">
                <div className="w-6 h-6 rounded-full bg-slate-700/80 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>
          </div>

          {/* ── Dashboard preview card ── */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            {/* Fade-out at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#0a0f1e] z-10 pointer-events-none rounded-b-2xl" />

            <div className="rounded-2xl border border-blue-900/40 bg-[#0d1530] overflow-hidden shadow-2xl shadow-blue-900/30">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-900/30 bg-[#080d1a]">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-4 flex-1 max-w-xs bg-[#0d1530] rounded-md px-3 py-1 text-xs text-slate-600 font-mono">
                  app.foresight.ai/dashboard
                </div>
              </div>

              {/* Mini risk map */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: '260px',
                  backgroundImage:
                    'radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)',
                  backgroundSize: '26px 26px',
                  backgroundColor: '#080d1a',
                }}
              >
                {RISK_DOTS.map((dot, i) => (
                  <div key={i} className="absolute" style={{ left: dot.x, top: dot.y }}>
                    <div className={`absolute ${dot.ping} rounded-full ${dot.color} opacity-25 animate-ping`} />
                    <div className={`relative ${dot.size} rounded-full ${dot.color} z-10`}
                      style={{ boxShadow: `0 0 8px currentColor` }} />
                  </div>
                ))}

                {/* Mini KPI chips */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {[
                    { label: '127 Events', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                    { label: '8 Suppliers at Risk', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                  ].map(chip => (
                    <div key={chip.label} className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${chip.color}`}>
                      {chip.label}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 text-[10px] text-blue-400/60 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  LIVE RISK MAP · Updated just now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-14 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-medium mb-5">
              <Zap className="w-3 h-3" /> Core Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Everything you need to<br />
              <span className="text-slate-500">stay ahead of disruption</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(feat => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="group relative p-8 rounded-2xl border border-blue-900/30 bg-[#0d1530] hover:border-blue-700/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent pointer-events-none" />

                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} items-center justify-center mb-6 shadow-xl ${feat.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>

                  <div className="mt-6 flex items-center gap-1.5 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Trust / Checklist section ── */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
              Built for enterprise.<br />
              <span className="text-slate-500">Ready in minutes.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Foresight connects to your existing supplier database and starts delivering risk intelligence
              from day one — no complex integrations required.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-600/20"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              'Real-time alerts via Slack, email & webhooks',
              'Supplier risk scoring with historical trends',
              'AI-generated mitigation recommendations',
              'Custom risk thresholds per supplier tier',
              'SOC 2 Type II certified infrastructure',
              'JARVIS AI trained on supply-chain domain data',
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-blue-800/8 to-blue-900/15 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Protect your supply chain<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              starting today.
            </span>
          </h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Join leading enterprises that trust Foresight to monitor, predict, and respond to
            supply chain disruptions at global scale.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-xl shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Foresight</span>
          </div>
          <p className="text-xs text-slate-600">© 2025 Foresight AI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            {['Privacy', 'Terms', 'Security', 'Status'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
