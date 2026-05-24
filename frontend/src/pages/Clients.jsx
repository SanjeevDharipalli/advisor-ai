import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsAPI } from '../services/api'
import { Search, ChevronRight, AlertCircle } from 'lucide-react'

const RISK_COLOR = { Conservative: 'var(--blue)', Moderate: 'var(--amber)', Aggressive: 'var(--red)' }
const SEG_COLOR = { UHNW: '#a855f7', HNI: 'var(--green)', Mass: 'var(--blue)', Retail: 'var(--text3)' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('')
  const [risk, setRisk] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    clientsAPI.list({ search: search || undefined, segment: segment || undefined, risk_profile: risk || undefined })
      .then(r => setClients(r.data.clients))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, segment, risk])

  const fmtAum = (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : `$${(v/1e3).toFixed(0)}K`

  const parseEvents = (s) => { try { return JSON.parse(s || '[]') } catch { return [] } }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 4 }}>Clients</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{clients.length} clients in your book</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        {[['segment', ['', 'UHNW', 'HNI', 'Mass', 'Retail'], segment, setSegment],
          ['risk', ['', 'Conservative', 'Moderate', 'Aggressive'], risk, setRisk]].map(([label, opts, val, setter]) => (
          <select key={label} value={val} onChange={e => setter(e.target.value)}
            style={{ padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: val ? 'var(--text)' : 'var(--text3)', fontSize: 13, outline: 'none' }}>
            {opts.map(o => <option key={o} value={o}>{o || `All ${label === 'risk' ? 'risk profiles' : 'segments'}`}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Client', 'Segment', 'AUM', 'Risk Profile', 'Life Events', 'Review Due', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading clients...</td></tr>
            ) : clients.map(c => {
              const events = parseEvents(c.life_events)
              const overdue = c.next_review_date && new Date(c.next_review_date) < new Date()
              return (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>
                        {c.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Age {c.age}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: 'var(--bg4)', color: SEG_COLOR[c.segment] || 'var(--text2)', fontWeight: 500 }}>{c.segment}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>{fmtAum(c.aum)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, color: RISK_COLOR[c.risk_profile] || 'var(--text2)' }}>{c.risk_profile}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {events.length > 0
                      ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {events.slice(0,2).map(ev => (
                            <span key={ev} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'rgba(239,159,39,0.15)', color: 'var(--amber)', fontWeight: 500 }}>
                              {ev.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: overdue ? 'var(--red)' : 'var(--text2)' }}>
                    {overdue && <AlertCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                    {c.next_review_date || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}><ChevronRight size={15} color="var(--text3)" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
