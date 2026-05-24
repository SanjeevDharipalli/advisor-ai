import { useState, useEffect } from 'react'
import { portfolioAPI, clientsAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export default function Portfolio() {
  const [summary, setSummary] = useState(null)
  const [opps, setOpps] = useState(null)

  useEffect(() => {
    portfolioAPI.getSummary().then(r => setSummary(r.data))
    clientsAPI.revenueOpportunities().then(r => setOpps(r.data))
  }, [])

  const fmtAum = v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`

  const alphaData = summary?.asset_allocation.map(a => ({
    name: a.asset_class,
    'Portfolio': parseFloat(a.avg_ytd_return.toFixed(2)),
    'Benchmark': parseFloat(a.avg_benchmark_return.toFixed(2)),
    'Alpha': parseFloat(a.alpha.toFixed(2))
  }))

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 4 }}>Portfolio Intelligence</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Real-time performance, risk exposure and rebalancing signals</p>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Book AUM', val: summary ? fmtAum(summary.total_aum) : '—', up: true, delta: '+2.3% MTD' },
          { label: 'Rebalancing Needed', val: summary ? `${summary.rebalance_needed.length} clients` : '—', up: false, delta: 'Review required' },
          { label: 'Avg Book Alpha', val: summary ? `+${summary.asset_allocation.reduce((s,a) => s + a.alpha, 0).toFixed(1)}%` : '—', up: true, delta: 'vs benchmark' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: k.up ? 'var(--green)' : 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {k.up ? <TrendingUp size={12} /> : <RefreshCw size={12} />} {k.delta}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Alpha chart */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>Portfolio vs Benchmark (YTD %)</h2>
          {alphaData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={alphaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v}%`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Portfolio" fill="var(--green)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Benchmark" fill="var(--text3)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13, padding: 40, textAlign: 'center' }}>Loading...</div>}
        </div>

        {/* Rebalancing needed */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Rebalancing Queue</h2>
          {summary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.rebalance_needed.map(c => (
                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,159,39,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--amber)' }}>
                      {c.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={11} /> Rebalance
                  </div>
                </div>
              ))}
              {summary.rebalance_needed.length === 0 && <div style={{ fontSize: 13, color: 'var(--green)', textAlign: 'center', padding: 20 }}>✓ All portfolios balanced</div>}
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
        </div>
      </div>

      {/* Revenue opps */}
      {opps && opps.opportunities.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Revenue Opportunities Identified by AI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {opps.opportunities.flatMap(o => o.opportunities.map(opp => ({ ...opp, client: o.client }))).slice(0, 6).map((opp, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '3px solid var(--green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{opp.client}</div>
                  {opp.est_value > 0 && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>+{fmtAum(opp.est_value)}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{opp.product}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{opp.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
