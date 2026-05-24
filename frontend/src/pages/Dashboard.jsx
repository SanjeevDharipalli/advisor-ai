import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portfolioAPI, complianceAPI, clientsAPI } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Users, Shield, AlertTriangle, ChevronRight, ArrowUpRight } from 'lucide-react'

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#8b90a0']

function KPICard({ label, value, delta, deltaUp, icon: Icon }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <Icon size={15} color="var(--text3)" />
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: deltaUp ? 'var(--green)' : 'var(--red)' }}>
          {deltaUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const [opps, setOpps] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    portfolioAPI.getSummary().then(r => setPortfolio(r.data)).catch(console.error)
    complianceAPI.getAlerts().then(r => setCompliance(r.data)).catch(console.error)
    clientsAPI.revenueOpportunities().then(r => setOpps(r.data)).catch(console.error)
  }, [])

  const fmtAum = (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`

  return (
    <div style={{ padding: 28, maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 4 }}>Good morning, James 👋</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Here's your book overview for today.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <KPICard label="Total Book AUM" value={portfolio ? fmtAum(portfolio.total_aum) : '—'} delta="+2.3% MTD" deltaUp icon={TrendingUp} />
        <KPICard label="Total Clients" value={portfolio?.client_count ?? '—'} delta="3 new this month" deltaUp icon={Users} />
        <KPICard label="Compliance Score" value={compliance ? `${compliance.compliance_score}%` : '—'} delta={`${compliance?.active_alerts ?? 0} active alerts`} deltaUp={compliance?.active_alerts === 0} icon={Shield} />
        <KPICard label="Active Alerts" value={compliance?.active_alerts ?? '—'} delta="Needs review" deltaUp={false} icon={AlertTriangle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Asset Allocation Pie */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>Book Asset Allocation</h2>
          {portfolio ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={portfolio.asset_allocation} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="total_value" paddingAngle={3}>
                    {portfolio.asset_allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {portfolio.asset_allocation.map((a, i) => (
                  <div key={a.asset_class} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.asset_class}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {fmtAum(a.total_value)}
                        <span style={{ fontSize: 11, color: a.avg_ytd_return >= 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6 }}>
                          {a.avg_ytd_return >= 0 ? '+' : ''}{a.avg_ytd_return}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
        </div>

        {/* Top Performers */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 18 }}>Top Performers YTD</h2>
          {portfolio ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={portfolio.top_performers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={n => n.split(' ')[0]} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'YTD Return']}
                />
                <Bar dataKey="ytd_return" fill="var(--green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Compliance Alerts */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 500 }}>Compliance Alerts</h2>
            <button onClick={() => navigate('/compliance')} style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          {compliance ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...compliance.alerts.high, ...compliance.alerts.medium, ...compliance.alerts.low]
                .filter(a => a.status === 'active').slice(0, 4).map(a => (
                <div key={a.id} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px',
                  background: 'var(--bg3)', borderRadius: 8, borderLeft: `3px solid ${a.severity === 'high' ? 'var(--red)' : a.severity === 'medium' ? 'var(--amber)' : 'var(--green)'}`
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{a.client_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{a.description.slice(0, 80)}...</div>
                  </div>
                </div>
              ))}
              {compliance.active_alerts === 0 && <div style={{ fontSize: 13, color: 'var(--green)', textAlign: 'center', padding: 20 }}>✓ No active alerts</div>}
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
        </div>

        {/* Revenue Opportunities */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 500 }}>Revenue Opportunities</h2>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{opps?.total_clients_with_opps ?? 0} clients</span>
          </div>
          {opps ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {opps.opportunities.slice(0, 4).map(o => (
                <div key={o.client} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, cursor: 'pointer'
                }} onClick={() => navigate('/clients')}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{o.client}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{o.opportunities[0]?.product}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {o.opportunities[0]?.est_value > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
                        +{fmtAum(o.opportunities[0].est_value)}
                      </span>
                    )}
                    <ArrowUpRight size={14} color="var(--text3)" />
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
        </div>
      </div>
    </div>
  )
}
