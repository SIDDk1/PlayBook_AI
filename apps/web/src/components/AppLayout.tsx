'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard', desc: 'Overview & alerts' },
  { href: '/ai-copilot', icon: '🤖', label: 'AI Copilot', desc: 'Agent reasoning' },
  { href: '/scenarios', icon: '⚡', label: 'Scenarios', desc: 'Trigger market events' },
  { href: '/playbooks', icon: '📋', label: 'Playbooks', desc: 'Response templates' },
  { href: '/approvals', icon: '✅', label: 'Approvals', desc: 'Pending actions' },
  { href: '/clients', icon: '👤', label: 'Clients', desc: 'Portfolio risk' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, initialize } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initialize().then(() => {
      const u = useAuthStore.getState().user
      if (!u) router.push('/login')
      setReady(true)
    })
  }, [])

  if (!ready) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-primary)',
    }}>
      <div className="spinner" />
    </div>
  )

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const roleColor = {
    RelationshipManager: '#06b6d4',
    RiskOfficer: '#f59e0b',
    ComplianceHead: '#8b5cf6',
  }[user?.role?.name || ''] || '#94a3b8'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1rem 1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#e2e8f0' }}>Sentinel AI</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>PLAYBOOK PLATFORM</div>
            </div>
          </Link>
        </div>

        {/* Live market indicator */}
        <div style={{
          margin: '0 0.75rem 1rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <div className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>LIVE MONITORING</span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  background: isActive ? 'rgba(6,182,212,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                  color: isActive ? '#22d3ee' : 'var(--text-secondary)',
                }}
              >
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: isActive ? 'rgba(34,211,238,0.6)' : 'var(--text-muted)', lineHeight: 1.2 }}>{item.desc}</div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div style={{
          padding: '1rem 0.75rem 0',
          borderTop: '1px solid var(--border-color)',
          marginTop: '0.5rem',
        }}>
          <div style={{
            padding: '0.625rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(15,23,42,0.6)',
            marginBottom: '0.5rem',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
            <div style={{
              display: 'inline-flex',
              fontSize: '10px',
              fontWeight: 700,
              color: roleColor,
              padding: '1px 6px',
              background: `rgba(${roleColor === '#06b6d4' ? '6,182,212' : roleColor === '#f59e0b' ? '245,158,11' : '139,92,246'},0.15)`,
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}>
              {user?.role?.name || 'Unknown'}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '0.5rem',
            background: 'transparent',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '8px',
            color: '#fb7185',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
