import { useState, useEffect, useRef } from 'react'

const API = 'https://web-production-6c2cd.up.railway.app'
const REFRESH_INTERVAL = 5000 // 5 seconds

// ── Provider colours ───────────────────────────────────────────────────────
const PROVIDER_COLORS = {
  jazzcash:  { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30',    label: 'JazzCash'  },
  easypaisa: { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30',  label: 'EasyPaisa' },
  sadapay:   { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'SadaPay'   },
  nayapay:   { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30',   label: 'NayaPay'   },
  upaisa:    { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'UPaisa'    },
}

const BANK_COLORS = {
  hbl: 'bg-emerald-600', mcb: 'bg-red-600', ubl: 'bg-blue-700',
  meezan: 'bg-green-700', allied: 'bg-orange-600', alfalah: 'bg-cyan-700',
  faysal: 'bg-indigo-600', habibmetro: 'bg-pink-700', js: 'bg-violet-600',
  scb: 'bg-sky-700',
}

const RISK_COLORS = {
  low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400',
}

// ── Small reusable components ──────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:   'from-blue-600/20 to-blue-900/10 border-blue-500/20',
    green:  'from-green-600/20 to-green-900/10 border-green-500/20',
    purple: 'from-purple-600/20 to-purple-900/10 border-purple-500/20',
    orange: 'from-orange-600/20 to-orange-900/10 border-orange-500/20',
    red:    'from-red-600/20 to-red-900/10 border-red-500/20',
    cyan:   'from-cyan-600/20 to-cyan-900/10 border-cyan-500/20',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  )
}

function SectionHeader({ title, count, icon }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {count !== undefined && (
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
          {count}
        </span>
      )}
    </div>
  )
}

function ProviderBadge({ provider }) {
  const c = PROVIDER_COLORS[provider] || { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', label: provider }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  )
}

function BankBadge({ bankCode }) {
  const bg = BANK_COLORS[bankCode] || 'bg-slate-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white ${bg} uppercase`}>
      {bankCode}
    </span>
  )
}

function ChangedValue({ value, prevValue, prefix = '', suffix = '' }) {
  const changed = prevValue !== undefined && prevValue !== value
  return (
    <span className={`font-mono font-semibold transition-colors duration-700 ${changed ? 'text-yellow-300' : 'text-white'}`}>
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-PK') : value}{suffix}
    </span>
  )
}

function StatusBadge({ paid }) {
  return paid
    ? <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-0.5 rounded-full font-medium">✓ Paid</span>
    : <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-medium">⏳ Pending</span>
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData]         = useState(null)
  const [prevData, setPrevData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [activeTab, setActiveTab] = useState('wallets')
  const prevDataRef = useRef(null)

  async function fetchData() {
    try {
      const res = await fetch(`${API}/mock/dashboard/all`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPrevData(prevDataRef.current)
      prevDataRef.current = json
      setData(json)
      setLastUpdated(new Date())
      setRefreshCount(c => c + 1)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Connecting to SahulatPay backend...</p>
      </div>
    </div>
  )

  const tabs = [
    { id: 'wallets',   label: '💳 Wallets',      count: data?.wallets?.length },
    { id: 'banks',     label: '🏦 Banks',         count: data?.banks?.length },
    { id: 'bills',     label: '📋 Bills',          count: data?.bills?.length },
    { id: 'challans',  label: '🏛️ Challans',       count: data?.challans?.length },
    { id: 'stocks',    label: '📈 Stocks',          count: data?.stocks?.length },
    { id: 'funds',     label: '💰 Mutual Funds',    count: data?.mutual_funds?.length },
    { id: 'insurance', label: '🛡️ Insurance',       count: data?.insurance?.length },
    { id: 'intl',      label: '🌍 International',   count: data?.international_transfers?.length },
  ]

  const s = data?.summary || {}

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg">
              💸
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">SahulatPay</h1>
              <p className="text-slate-400 text-xs">Live Mock Database Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {error ? (
              <span className="flex items-center gap-2 text-red-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Connection error: {error}
              </span>
            ) : (
              <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <span className="pulse-dot w-2 h-2 rounded-full bg-green-400" />
                Live — refreshes every 5s
              </span>
            )}
            {lastUpdated && (
              <span className="text-slate-500 text-xs">
                Updated: {lastUpdated.toLocaleTimeString()} &nbsp;|&nbsp; #{refreshCount}
              </span>
            )}
            <a
              href={`${API}/docs`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 text-xs border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              API Docs ↗
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard icon="💳" label="Wallet Accounts"   value={s.total_wallets || 0}  sub={`PKR ${(s.wallet_balance_total || 0).toLocaleString()} total`} color="blue" />
          <StatCard icon="🏦" label="Bank Accounts"     value={s.total_banks || 0}    sub={`PKR ${(s.bank_balance_total || 0).toLocaleString()} total`}   color="green" />
          <StatCard icon="📋" label="Bills Pending"     value={s.bills_pending || 0}  sub={`${s.bills_paid || 0} paid`}            color="orange" />
          <StatCard icon="🏛️" label="Challans Pending"  value={(s.total_challans || 0) - (s.challans_paid || 0)} sub={`${s.challans_paid || 0} paid`} color="purple" />
          <StatCard icon="📈" label="PSX Stocks"        value={s.total_stocks || 0}   sub="Mock PSX data"                     color="cyan" />
          <StatCard icon="💰" label="Mutual Funds"      value={s.total_funds || 0}    sub="Mock fund data"                    color="red" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── WALLETS TAB ── */}
        {activeTab === 'wallets' && data?.wallets && (
          <div className="fade-in">
            <SectionHeader title="External Wallet Accounts (Mock SQLite)" count={data.wallets.length} icon="💳" />
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Provider</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-right">Balance (PKR)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.wallets.map((w, i) => {
                    const prev = prevData?.wallets?.find(p => p.id === w.id)
                    return (
                      <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3"><ProviderBadge provider={w.provider} /></td>
                        <td className="px-4 py-3 text-slate-200 font-medium">{w.name}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{w.phone}</td>
                        <td className="px-4 py-3 text-right">
                          <ChangedValue value={w.balance} prevValue={prev?.balance} prefix="₨ " />
                          {prev && prev.balance !== w.balance && (
                            <span className={`ml-2 text-xs ${w.balance > prev.balance ? 'text-green-400' : 'text-red-400'}`}>
                              {w.balance > prev.balance ? '▲' : '▼'} {Math.abs(w.balance - prev.balance).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                            {w.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs mt-3">
              💡 When you send money to JazzCash/EasyPaisa via <code className="bg-slate-800 px-1 rounded">POST /api/v1/external/wallet/send</code>, the balance above updates in real-time within 5 seconds.
            </p>
          </div>
        )}

        {/* ── BANKS TAB ── */}
        {activeTab === 'banks' && data?.banks && (
          <div className="fade-in">
            <SectionHeader title="Mock Bank Accounts (IBFT / Raast)" count={data.banks.length} icon="🏦" />
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Bank</th>
                    <th className="px-4 py-3 text-left">Account Title</th>
                    <th className="px-4 py-3 text-left">Account No.</th>
                    <th className="px-4 py-3 text-left">IBAN</th>
                    <th className="px-4 py-3 text-right">Balance (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.banks.map((b, i) => (
                    <tr key={b.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3"><BankBadge bankCode={b.bank_code} /></td>
                      <td className="px-4 py-3 text-slate-200 font-medium">{b.account_title}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{b.account_number}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{b.iban}</td>
                      <td className="px-4 py-3 text-right text-white font-mono font-semibold">
                        ₨ {b.balance.toLocaleString('en-PK')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs mt-3">
              💡 Verify any account with <code className="bg-slate-800 px-1 rounded">POST /api/v1/external/bank/lookup</code> then transfer via IBFT or Raast.
            </p>
          </div>
        )}

        {/* ── BILLS TAB ── */}
        {activeTab === 'bills' && data?.bills && (
          <div className="fade-in">
            <SectionHeader title="Utility Bills (SSGC, LESCO, PTCL etc.)" count={data.bills.length} icon="📋" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.bills.map(b => (
                <div key={b.id} className={`bg-slate-900 border rounded-xl p-4 ${b.is_paid ? 'border-green-500/20' : 'border-slate-800'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded uppercase font-bold">{b.company}</span>
                    <StatusBadge paid={b.is_paid} />
                  </div>
                  <p className="text-white font-medium mt-2">{b.customer_name}</p>
                  <p className="text-slate-400 text-xs">ID: {b.consumer_id}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <p className="text-slate-400 text-xs">Amount Due</p>
                      <p className="text-white font-mono font-bold">₨ {b.amount_due.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">Due Date</p>
                      <p className={`text-xs font-medium ${b.is_paid ? 'text-green-400' : 'text-amber-400'}`}>{b.due_date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-3">
              💡 Pay any bill via <code className="bg-slate-800 px-1 rounded">POST /api/v1/external/bills/pay</code> — the status updates to Paid instantly.
            </p>
          </div>
        )}

        {/* ── CHALLANS TAB ── */}
        {activeTab === 'challans' && data?.challans && (
          <div className="fade-in">
            <SectionHeader title="Government Challans (FBR, Traffic, NADRA)" count={data.challans.length} icon="🏛️" />
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">PSID</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Due</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.challans.map(c => (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-medium">{c.department}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.psid}</td>
                      <td className="px-4 py-3 text-slate-200 text-xs">{c.description}</td>
                      <td className="px-4 py-3 text-right text-white font-mono font-semibold">₨ {c.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-slate-400 text-xs">{c.due_date}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge paid={c.is_paid} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STOCKS TAB ── */}
        {activeTab === 'stocks' && data?.stocks && (
          <div className="fade-in">
            <SectionHeader title="PSX Stocks (Mock Data)" count={data.stocks.length} icon="📈" />
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Sector</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Change</th>
                    <th className="px-4 py-3 text-right">Volume</th>
                    <th className="px-4 py-3 text-right">Mkt Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stocks.map(s => (
                    <tr key={s.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-mono font-bold text-sm">{s.symbol}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 text-xs">{s.company_name}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded">{s.sector}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-mono font-semibold">₨ {s.price.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-mono text-sm font-semibold ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)} ({s.change_percent.toFixed(2)}%)
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">{(s.volume / 1000).toFixed(0)}K</td>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs">{(s.market_cap / 1e9).toFixed(1)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MUTUAL FUNDS TAB ── */}
        {activeTab === 'funds' && data?.mutual_funds && (
          <div className="fade-in">
            <SectionHeader title="Mutual Funds (Mock Data)" count={data.mutual_funds.length} icon="💰" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.mutual_funds.map(f => (
                <div key={f.fund_code} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded font-mono font-bold">{f.fund_code}</span>
                    <span className={`text-xs font-medium ${RISK_COLORS[f.risk_level] || 'text-slate-400'}`}>
                      {f.risk_level?.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm leading-tight">{f.fund_name}</p>
                  <p className="text-slate-400 text-xs mt-1">{f.provider} · {f.category}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <p className="text-slate-400 text-xs">NAV</p>
                      <p className="text-white font-mono font-bold">₨ {f.nav}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">YTD Return</p>
                      <p className="text-green-400 font-semibold">+{f.ytd_return}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSURANCE TAB ── */}
        {activeTab === 'insurance' && data?.insurance && (
          <div className="fade-in">
            <SectionHeader title="Insurance Policies (Mock Data)" count={data.insurance.length} icon="🛡️" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.insurance.map(p => (
                <div key={p.policy_number} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs px-2 py-0.5 rounded font-medium uppercase">{p.policy_type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-white font-medium mt-2">{p.customer_name}</p>
                  <p className="text-slate-400 text-xs">{p.provider} · {p.policy_number}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <p className="text-slate-400 text-xs">Premium</p>
                      <p className="text-white font-mono font-bold text-sm">₨ {p.premium_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Coverage</p>
                      <p className="text-green-400 font-mono font-bold text-sm">₨ {p.coverage_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">Next due: {p.next_due_date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INTERNATIONAL TRANSFERS TAB ── */}
        {activeTab === 'intl' && (
          <div className="fade-in">
            <SectionHeader title="International Transfers Log" count={data?.international_transfers?.length} icon="🌍" />
            {data?.international_transfers?.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                <p className="text-5xl mb-4">🌍</p>
                <p className="text-slate-300 font-medium">No transfers yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Trigger one via <code className="bg-slate-800 px-1 rounded">POST /api/v1/external/international/send</code>
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Provider</th>
                      <th className="px-4 py-3 text-left">Receiver</th>
                      <th className="px-4 py-3 text-left">Country</th>
                      <th className="px-4 py-3 text-right">PKR Amount</th>
                      <th className="px-4 py-3 text-right">FX Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.international_transfers.map(t => (
                      <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded capitalize">{t.provider?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-200">{t.receiver_name}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{t.country}</td>
                        <td className="px-4 py-3 text-right text-white font-mono">₨ {t.amount_pkr?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-400 font-mono">{t.currency} {t.amount_fx?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{t.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between text-slate-600 text-xs">
          <p>SahulatPay Mock Dashboard — All data is from in-memory SQLite mock server</p>
          <p>Backend: <a href={API} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{API}</a></p>
        </footer>
      </main>
    </div>
  )
}
