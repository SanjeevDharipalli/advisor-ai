import { useState, useEffect } from 'react'
import { complianceAPI, clientsAPI } from '../services/api'
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const SEV_COLOR = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' }
const SEV_BG = { high: 'rgba(226,75,74,0.1)', medium: 'rgba(239,159,39,0.1)', low: 'rgba(29,158,117,0.1)' }

export default function Compliance() {
  const [data, setData] = useState(null)
  const [pretradeClient, setPretradeClient] = useState('')
  const [pretradeAmount, setPretradeAmount] = useState('')
  const [pretradeResult, setPretradeResult] = useState(null)
  const [clients, setClients] = useState([])

  useEffect(() => {
    load()
    clientsAPI.list().then(r => setClients(r.data.clients))
  }, [])

  const load = () => {
    complianceAPI.getAlerts().then(r => setData(r.data))
  }

  const resolve = async (id) => {
    await complianceAPI.resolveAlert(id)
    load()
  }

  const runPretradeCheck = async () => {
    if (!pretradeClient || !pretradeAmount) return
    const res = await complianceAPI.pretradeCheck(pretradeClient, parseFloat(pretradeAmount))
    setPretradeResult(res.data)
  }

  const allActive = data ? [...data.alerts.high, ...data.alerts.medium, ...data.alerts.low].filter(a => a.status === 'active') : []
  const allResolved = data ? [...data.alerts.high, ...data.alerts.medium, ...data.alerts.low].filter(a => a.status === 'resolved') : []

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 4 }}>Compliance & Supervision</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Real-time alerts, pre-trade checks, and audit-ready outputs</p>
      </div>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Compliance Score', val: data ? `${data.compliance_score}%` : '—', icon: Shield, color: 'var(--green)' },
          { label: 'Active Alerts', val: data?.active_alerts ?? '—', icon: AlertTriangle, color: 'var(--red)' },
          { label: 'Resolved', val: data?.resolved_alerts ?? '—', icon: CheckCircle, color: 'var(--green)' },
          { label: 'Total Monitored', val: data?.total_alerts ?? '—', icon: Clock, color: 'var(--text2)' },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{k.label}</span>
              <k.icon size={15} color={k.color} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Active Alerts */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Active Alerts</h2>
          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allActive.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8, padding: 20 }}>
                  <CheckCircle size={15} /> All clear — no active compliance alerts
                </div>
              )}
              {allActive.map(a => (
                <div key={a.id} style={{
                  padding: '12px 14px', background: SEV_BG[a.severity],
                  borderRadius: 8, borderLeft: `3px solid ${SEV_COLOR[a.severity]}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: SEV_COLOR[a.severity], textTransform: 'uppercase' }}>{a.severity}</span>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{a.client_name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{a.description}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        {a.alert_type.replace(/_/g, ' ')} · {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button onClick={() => resolve(a.id)} style={{
                      padding: '5px 12px', background: 'var(--green2)', color: 'white',
                      borderRadius: 6, fontSize: 11, fontWeight: 500, flexShrink: 0
                    }}>Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}

          {/* Resolved */}
          {allResolved.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recently Resolved</h3>
              {allResolved.map(a => (
                <div key={a.id} style={{ padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 6, opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text2)' }}>{a.client_name} — {a.alert_type.replace(/_/g, ' ')}</span>
                    <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={11} /> Resolved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pre-trade Checker */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Pre-Trade Compliance Check</h2>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Run a compliance check before executing a trade</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 5, fontWeight: 500 }}>Select Client</label>
              <select value={pretradeClient} onChange={e => { setPretradeClient(e.target.value); setPretradeResult(null) }}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: pretradeClient ? 'var(--text)' : 'var(--text3)', fontSize: 13, outline: 'none' }}>
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} (${(c.aum/1e6).toFixed(1)}M)</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text2)', marginBottom: 5, fontWeight: 500 }}>Trade Amount ($)</label>
              <input type="number" value={pretradeAmount} onChange={e => { setPretradeAmount(e.target.value); setPretradeResult(null) }}
                placeholder="e.g. 750000"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button onClick={runPretradeCheck} disabled={!pretradeClient || !pretradeAmount} style={{
              padding: '10px', background: 'var(--green)', color: 'white', borderRadius: 8,
              fontSize: 13, fontWeight: 500, opacity: (!pretradeClient || !pretradeAmount) ? 0.5 : 1
            }}>Run Check</button>
          </div>

          {pretradeResult && (
            <div style={{
              marginTop: 16, padding: '14px', borderRadius: 8,
              background: pretradeResult.passed ? 'rgba(29,158,117,0.1)' : 'rgba(226,75,74,0.1)',
              border: `1px solid ${pretradeResult.passed ? 'var(--green)' : 'var(--red)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {pretradeResult.passed
                  ? <><CheckCircle size={16} color="var(--green)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Trade Approved</span></>
                  : <><AlertTriangle size={16} color="var(--red)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>Manual Review Required</span></>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                {pretradeResult.client} · ${parseFloat(pretradeResult.trade_amount).toLocaleString()}
              </div>
              {pretradeResult.flags.map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text2)', padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: SEV_COLOR[f.severity] }}>{f.rule}:</span> {f.detail}
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                SEC/FINRA rules applied · Audit log generated
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
