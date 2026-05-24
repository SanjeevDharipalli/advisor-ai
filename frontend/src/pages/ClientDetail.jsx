import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI, complianceAPI } from '../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowLeft, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

const COLORS = ['#1D9E75', '#378ADD', '#EF9F27', '#8b90a0']

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    clientsAPI.get(id).then(r => setData(r.data)).catch(() => navigate('/clients'))
  }, [id])

  if (!data) return <div style={{ padding: 40, color: 'var(--text2)', fontSize: 13 }}>Loading client...</div>

  const { client, portfolio, compliance_alerts } = data
  const fmtAum = v => v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(0)}K`

  const resolveAlert = async (alertId) => {
    await complianceAPI.resolveAlert(alertId)
    const r = await clientsAPI.get(id)
    setData(r.data)
  }

  return (
    <div style={{ padding: 28, maxWidth: 1000 }}>
      <button onClick={() => navigate('/clients')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to clients
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 28, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'white', flexShrink: 0 }}>
          {client.name.split(' ').map(w => w[0]).join('').slice(0,2)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{client.name}</h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text2)', flexWrap: 'wrap' }}>
            <span>Age {client.age}</span>
            <span>·</span>
            <span>{client.risk_profile} risk</span>
            <span>·</span>
            <span>{client.segment} segment</span>
            <span>·</span>
            <span>{client.email}</span>
          </div>
          {client.life_events?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {client.life_events.map(ev => (
                <span key={ev} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: 'rgba(239,159,39,0.15)', color: 'var(--amber)', fontWeight: 500 }}>
                  {ev.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>{fmtAum(client.aum)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>Total AUM</div>
          <div style={{ fontSize: 13, marginTop: 4, color: portfolio.avg_ytd_return >= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            {portfolio.avg_ytd_return >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {portfolio.avg_ytd_return >= 0 ? '+' : ''}{portfolio.avg_ytd_return}% YTD
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Portfolio breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Portfolio Breakdown</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={portfolio.breakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="current_value" paddingAngle={3}>
                  {portfolio.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`$${(v/1000).toFixed(0)}K`]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {portfolio.breakdown.map((p, i) => (
                <div key={p.asset_class} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{p.asset_class}</span>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{p.allocation_pct}%</span>
                    <span style={{ fontSize: 11, color: p.ytd_return >= 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6 }}>
                      {p.ytd_return >= 0 ? '+' : ''}{(p.ytd_return * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next best actions */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Next Best Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {client.life_events?.includes('retirement_planning') && (
              <div style={{ padding: '10px 12px', background: 'rgba(29,158,117,0.1)', borderRadius: 8, borderLeft: '3px solid var(--green)', fontSize: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>💡 Discuss annuity options</div>
                <div style={{ color: 'var(--text2)' }}>Retirement event detected. High suitability for income products.</div>
              </div>
            )}
            {client.life_events?.includes('bond_maturity') && (
              <div style={{ padding: '10px 12px', background: 'rgba(239,159,39,0.1)', borderRadius: 8, borderLeft: '3px solid var(--amber)', fontSize: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>📅 Bond maturity action required</div>
                <div style={{ color: 'var(--text2)' }}>Review reinvestment options before maturity date.</div>
              </div>
            )}
            {portfolio.avg_ytd_return < 2 && (
              <div style={{ padding: '10px 12px', background: 'rgba(55,138,221,0.1)', borderRadius: 8, borderLeft: '3px solid var(--blue)', fontSize: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>📊 Portfolio review needed</div>
                <div style={{ color: 'var(--text2)' }}>Below-average returns. Consider rebalancing strategy.</div>
              </div>
            )}
            <div style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '3px solid var(--text3)', fontSize: 12 }}>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>📞 Schedule Q2 review call</div>
              <div style={{ color: 'var(--text2)' }}>Next review due: {client.next_review_date || 'Not scheduled'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Compliance Alerts</h2>
        {compliance_alerts.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={15} /> No compliance issues for this client</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {compliance_alerts.map(a => (
                <div key={a.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
                  borderLeft: `3px solid ${a.severity === 'high' ? 'var(--red)' : a.severity === 'medium' ? 'var(--amber)' : 'var(--green)'}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{a.alert_type.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{a.description}</div>
                  </div>
                  {a.status === 'active' && (
                    <button onClick={() => resolveAlert(a.id)} style={{
                      marginLeft: 12, padding: '5px 12px', background: 'var(--green2)', color: 'white',
                      borderRadius: 6, fontSize: 11, fontWeight: 500
                    }}>Resolve</button>
                  )}
                  {a.status === 'resolved' && <span style={{ fontSize: 11, color: 'var(--green)', marginLeft: 12 }}>✓ Resolved</span>}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
