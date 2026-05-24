import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('arjun.sharma')
  const [password, setPassword] = useState('advisor123')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(username, password)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Brain size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 6 }}>Advisor AI</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Intelligent Agent for Financial Advisors</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 32
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>Sign in to your workspace</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg3)',
                  border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)', fontSize: 14, outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 40px 10px 14px', background: 'var(--bg3)',
                    border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text)', fontSize: 14, outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text3)'
                }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
                borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: 13
              }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '11px', background: 'var(--green)', color: 'white',
              borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 500,
              opacity: loading ? 0.7 : 1, marginTop: 4, transition: 'all 0.15s'
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{
            marginTop: 20, padding: '12px 14px', background: 'var(--bg3)',
            borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text3)'
          }}>
            <strong style={{ color: 'var(--text2)' }}>Demo credentials:</strong><br />
            Username: <code style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>arjun.sharma</code> · 
            Password: <code style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>advisor123</code>
          </div>
        </div>
      </div>
    </div>
  )
}
