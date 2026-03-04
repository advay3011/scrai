import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Globe, LayoutDashboard, Bell, BarChart3,
  Settings, Search, ChevronDown, AlertTriangle,
  CheckCircle, Flame, Wind, Anchor, Users,
  TrendingDown, Activity, AlertCircle,
} from 'lucide-react'
import JarvisChat from '../components/JarvisChat'

// ─── Placeholder data ─────────────────────────────────────────────────────────

const SUPPLIERS = [
  {
    id: 1,
    name: 'TSMC',
    location: 'Hsinchu, Taiwan',
    category: 'Semiconductor',
    riskScore: 78,
    delta: '+12',
    deltaUp: true,
    alerts: 3,
  },
  {
    id: 2,
    name: 'Samsung Electronics',
    location: 'Suwon, South Korea',
    category: 'Electronics',
    riskScore: 45,
    delta: '-3',
    deltaUp: false,
    alerts: 1,
  },
  {
    id: 3,
    name: 'Foxconn',
    location: 'Shenzhen, China',
    category: 'Manufacturing',
    riskScore: 22,
    delta: '-7',
    deltaUp: false,
    alerts: 0,
  },
]

const ALERTS = [
  {
    id: 1,
    Icon: Flame,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
    title: 'Factory fire at Shenzhen industrial zone — output halted',
    severity: 'critical',
    time: '2 min ago',
  },
  {
    id: 2,
    Icon: Anchor,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
    title: 'Port of Shanghai congestion — 3-day delay on all outbound cargo',
    severity: 'critical',
    time: '18 min ago',
  },
  {
    id: 3,
    Icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    title: 'Political unrest reported near Kuala Lumpur export zone',
    severity: 'warning',
    time: '1 hr ago',
  },
  {
    id: 4,
    Icon: Wind,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    title: 'Typhoon Haikui (Cat. 2) approaching Philippines — ETA 48 hrs',
    severity: 'warning',
    time: '2 hrs ago',
  },
  {
    id: 5,
    Icon: CheckCircle,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
    title: 'Taiwan Strait shipping lanes cleared — normal ops resumed',
    severity: 'resolved',
    time: '4 hrs ago',
  },
]

const RISK_POINTS = [
  { x: '71%', y: '34%', label: 'Shanghai',     risk: 85, color: 'red'    },
  { x: '74%', y: '41%', label: 'Taiwan',       risk: 78, color: 'red'    },
  { x: '68%', y: '54%', label: 'Kuala Lumpur', risk: 48, color: 'yellow' },
  { x: '13%', y: '37%', label: 'Los Angeles',  risk: 35, color: 'yellow' },
  { x: '47%', y: '28%', label: 'Rotterdam',    risk: 22, color: 'green'  },
  { x: '61%', y: '46%', label: 'Mumbai',       risk: 55, color: 'yellow' },
  { x: '74%', y: '57%', label: 'Manila',       risk: 62, color: 'red'    },
]

const RISK_DIST = [
  { label: 'Critical (61–100)', count: 23, pct: 18, bar: 'bg-red-500'    },
  { label: 'Moderate (31–60)',  count: 68, pct: 54, bar: 'bg-yellow-500' },
  { label: 'Low (0–30)',        count: 36, pct: 28, bar: 'bg-green-500'  },
]

const NAV_ITEMS = [
  { id: 'dashboard',  Icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'map',        Icon: Globe,           label: 'Risk Map'  },
  { id: 'alerts',     Icon: Bell,            label: 'Alerts'    },
  { id: 'analytics',  Icon: BarChart3,       label: 'Analytics' },
  { id: 'suppliers',  Icon: Users,           label: 'Suppliers' },
]

const KPI_CARDS = [
  { label: 'Active Events',     value: '127',   delta: '+14',   up: true,  Icon: Activity    },
  { label: 'Avg Risk Score',    value: '48.2',  delta: '+3.1',  up: true,  Icon: AlertCircle },
  { label: 'Suppliers at Risk', value: '8',     delta: '-2',    up: false, Icon: Users       },
  { label: 'Est. Cost Exposure',value: '$2.4M', delta: '+$340K',up: true,  Icon: TrendingDown},
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function riskColors(score) {
  if (score >= 61) return { text: 'text-red-400',    border: 'border-red-500/20',    badge: 'bg-red-500',    label: 'HIGH'   }
  if (score >= 31) return { text: 'text-yellow-400', border: 'border-yellow-500/20', badge: 'bg-yellow-500', label: 'MEDIUM' }
  return               { text: 'text-green-400',  border: 'border-green-500/20',  badge: 'bg-green-500',  label: 'LOW'    }
}

function mapColor(c) {
  return {
    red:    { dot: 'bg-red-500',    shadow: '0 0 10px rgba(239,68,68,0.9)',    ping: 'bg-red-500'    },
    yellow: { dot: 'bg-yellow-500', shadow: '0 0 10px rgba(234,179,8,0.9)',   ping: 'bg-yellow-500' },
    green:  { dot: 'bg-green-500',  shadow: '0 0 10px rgba(34,197,94,0.9)',   ping: 'bg-green-500'  },
  }[c]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('dashboard')

  return (
    <div className="min-h-screen bg-[#080d1a] text-white flex flex-col overflow-hidden">

      {/* ── Top navbar ── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-white/5 bg-[#0a0f1e] z-30">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/30">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold tracking-tight">Foresight</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 font-semibold border border-blue-600/20 ml-0.5">
            LIVE
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-white/5 w-72 text-sm text-slate-600 cursor-text">
          <Search className="w-3.5 h-3.5" />
          <span>Search suppliers, events…</span>
          <kbd className="ml-auto text-[10px] bg-[#0d1530] px-1.5 py-0.5 rounded border border-white/5 text-slate-600">⌘K</kbd>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-white/5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold select-none">
              A
            </div>
            <span className="hidden md:block text-sm text-slate-300">Advay</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar (icon rail) ── */}
        <aside className="w-14 flex-shrink-0 flex flex-col items-center py-4 gap-1.5 border-r border-white/5 bg-[#0a0f1e]">
          {NAV_ITEMS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              title={label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150
                ${activeNav === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-600 hover:bg-white/5 hover:text-slate-300'
                }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
          <div className="mt-auto">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white/5 hover:text-slate-300 transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6 min-w-0">

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold">Supply Chain Overview</h1>
              <p className="text-xs text-slate-500 mt-0.5">Last updated: just now · 127 active events</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs rounded-lg border border-white/8 text-slate-400 hover:border-blue-700/40 hover:text-white transition-all">
                Last 7 days
              </button>
              <button className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {KPI_CARDS.map(({ label, value, delta, up, Icon }) => (
              <div key={label} className="bg-[#0d1530] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <div className="text-2xl font-black mb-1">{value}</div>
                <div className={`text-[11px] font-semibold ${up ? 'text-red-400' : 'text-green-400'}`}>
                  {delta} vs yesterday
                </div>
              </div>
            ))}
          </div>

          {/* Live Risk Map */}
          <div
            className="relative rounded-xl border border-white/5 overflow-hidden mb-6"
            style={{
              height: '300px',
              backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.06) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#080d1a',
            }}
          >
            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 z-10 bg-gradient-to-b from-[#080d1a]/90 to-transparent">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                LIVE RISK MAP
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-0.5" />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Low (0–30)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" />Medium (31–60)</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />High (61–100)</span>
              </div>
            </div>

            {/* Risk points */}
            {RISK_POINTS.map(pt => {
              const mc = mapColor(pt.color)
              const isHigh = pt.risk >= 61
              return (
                <div
                  key={pt.label}
                  className="absolute group cursor-pointer"
                  style={{ left: pt.x, top: pt.y, transform: 'translate(-50%,-50%)' }}
                >
                  {/* Ping ring */}
                  <div
                    className={`absolute rounded-full ${mc.ping} opacity-30 animate-ping`}
                    style={{
                      width:  isHigh ? '22px' : '16px',
                      height: isHigh ? '22px' : '16px',
                      margin: isHigh ? '-8px' : '-5px',
                    }}
                  />
                  {/* Core dot */}
                  <div
                    className={`relative rounded-full z-10 ${mc.dot}`}
                    style={{ width: isHigh ? '11px' : '9px', height: isHigh ? '11px' : '9px', boxShadow: mc.shadow }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block z-20 whitespace-nowrap pointer-events-none">
                    <div className="bg-[#0d1530] border border-blue-900/50 rounded-xl px-3 py-2 text-xs shadow-2xl">
                      <div className="font-semibold text-white">{pt.label}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${pt.color === 'red' ? 'text-red-400' : pt.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                        Risk score: {pt.risk} / 100
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Bottom label */}
            <div className="absolute bottom-3 left-4 text-[10px] text-slate-700 font-mono">
              {RISK_POINTS.length} locations monitored · refreshes every 30s
            </div>
          </div>

          {/* Supplier risk cards */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Supplier Risk Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUPPLIERS.map(s => {
                const c = riskColors(s.riskScore)
                const arc = (s.riskScore / 100) * 87.96
                const strokeColor = s.riskScore >= 61 ? '#ef4444' : s.riskScore >= 31 ? '#eab308' : '#22c55e'
                return (
                  <div
                    key={s.id}
                    className={`bg-[#0d1530] rounded-xl p-5 border ${c.border} hover:brightness-110 transition-all duration-200 cursor-pointer group`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-semibold text-sm">{s.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.location}</div>
                      </div>
                      {/* Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${c.text} bg-white/5`}>
                        <span className={`w-1 h-1 rounded-full ${c.badge}`} />
                        {c.label}
                      </span>
                    </div>

                    {/* Score ring + meta */}
                    <div className="flex items-center gap-4">
                      {/* SVG ring */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#1a2744" strokeWidth="3.5" />
                          <circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            strokeDasharray={`${arc} 87.96`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-xl font-black ${c.text}`}>{s.riskScore}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-slate-500 mb-1">{s.category}</div>
                        <div className={`text-xs font-semibold ${s.deltaUp ? 'text-red-400' : 'text-green-400'}`}>
                          {s.delta} pts this week
                        </div>
                        {s.alerts > 0 && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/15">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {s.alerts} active alert{s.alerts > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* ── Right sidebar ── */}
        <aside className="w-76 flex-shrink-0 border-l border-white/5 bg-[#0a0f1e] overflow-y-auto" style={{ width: '304px' }}>
          <div className="p-4">

            {/* Alerts header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-sm font-semibold">Live Alerts</span>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
                2 Critical
              </span>
            </div>

            {/* Alert feed */}
            <div className="space-y-2">
              {ALERTS.map(({ id, Icon, iconColor, iconBg, title, severity, time }) => (
                <div
                  key={id}
                  className="p-3 rounded-xl bg-[#0d1530] border border-white/5 hover:border-blue-800/30 transition-all cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-300 leading-snug group-hover:text-white transition-colors">
                        {title}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[10px] font-semibold
                          ${severity === 'critical' ? 'text-red-400'
                            : severity === 'warning' ? 'text-yellow-400'
                            : 'text-green-400'}`}
                        >
                          {severity.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-600">{time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-3 py-2 text-xs text-slate-600 hover:text-blue-400 border border-white/5 hover:border-blue-800/30 rounded-xl transition-all">
              View all 127 events →
            </button>

            {/* Risk distribution */}
            <div className="mt-6">
              <h3 className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3">
                Risk Distribution
              </h3>
              <div className="space-y-3">
                {RISK_DIST.map(({ label, count, pct, bar }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>{label}</span>
                      <span>{count} events</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a2744] overflow-hidden">
                      <div className={`h-full rounded-full ${bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top risk summary */}
            <div className="mt-6 p-3.5 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Top Risk Right Now</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Shanghai Port congestion + Shenzhen factory fire are creating a compounded disruption
                affecting <span className="text-white font-semibold">4 tier-1 suppliers</span>.
                Estimated impact: <span className="text-red-400 font-semibold">$1.2M/day</span>.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* JARVIS floating chat */}
      <JarvisChat />
    </div>
  )
}
