import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, MessageCircle, Users, BarChart3, Shield, LogOut, Brain, TrendingUp } from 'lucide-react'

const nav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',       icon: MessageCircle,   label: 'AI Concierge' },
  { to: '/clients',    icon: Users,           label: 'Clients' },
  { to: '/portfolio',  icon: BarChart3,       label: 'Portfolio' },
  { to: '/compliance', icon: Shield,          label: 'Compliance' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.3px' }}>Advisor AI</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Intelligent Agent</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: isActive ? 500 : 400,
              color: isActive ? 'white' : 'var(--text2)',
              background: isActive ? 'var(--green2)' : 'transparent',
              transition: 'all 0.15s'
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', flexShrink: 0 }}>
              {user?.full_name?.split(' ').map(w => w[0]).join('').slice(0,2)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            borderRadius: 'var(--radius-sm)', width: '100%', color: 'var(--text3)',
            fontSize: 13, transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
