'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'

const DEMO_ACCOUNTS = [
  { role: 'RelationshipManager', email: 'rm@sentinel.ai', password: 'Sentinel2026!', color: '#06b6d4', icon: '👤' },
  { role: 'RiskOfficer', email: 'risk@sentinel.ai', password: 'Sentinel2026!', color: '#f59e0b', icon: '⚡' },
  { role: 'ComplianceHead', email: 'compliance@sentinel.ai', password: 'Sentinel2026!', color: '#8b5cf6', icon: '🛡️' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Allow explicit returns to the login page for changing roles during demos.
  // The user is only redirected automatically when they initiate a login action.
  // useEffect(() => {
  //   if (user) router.push('/dashboard')
  // }, [user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoginError('')
    // Try to register first (in case this is a fresh DB)
    try {
      await authApi.signup({
        email: account.email,
        password: account.password,
        role_name: account.role,
      })
    } catch (_) {
      // User already exists, that's fine
    }
    try {
      await login(account.email, account.password)
      router.push('/dashboard')
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-200px',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-100px',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left branding panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        borderRight: '1px solid var(--border-color)',
      }} className="hidden md:flex">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: '12px',
            marginBottom: '2.5rem',
          }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#e2e8f0' }}>Sentinel AI</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Playbook Platform</div>
            </div>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#e2e8f0',
            marginBottom: '1rem',
          }}>
            Institutional<br />
            <span className="gradient-text-cyan">AI Playbooks</span><br />
            for Every Crisis
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.7, fontSize: '15px' }}>
            Detect market scenarios, classify financial risk events, and execute structured response playbooks — powered by a six-agent AI recommendation engine.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { icon: '🤖', label: 'Six-Agent AI Pipeline', desc: 'Market → Risk → Playbook → Compliance → Communication → Escalation' },
            { icon: '📊', label: 'Real-time Portfolio Risk', desc: 'Live concentration breach detection across all client portfolios' },
            { icon: '✅', label: 'Multi-step Approval Chains', desc: 'Role-gated approval workflows with automatic escalation logic' },
          ].map((feat) => (
            <div key={feat.label} style={{
              display: 'flex',
              gap: '0.875rem',
              padding: '0.875rem',
              borderRadius: '10px',
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '20px' }}>{feat.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '0.2rem' }}>{feat.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 2.5rem',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sign in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Access your Sentinel AI workspace</p>
        </div>

        {/* Demo login buttons */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Demo Login</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 1rem',
                  background: 'rgba(15,23,42,0.8)',
                  border: `1px solid rgba(${account.color === '#06b6d4' ? '6,182,212' : account.color === '#f59e0b' ? '245,158,11' : '139,92,246'},0.2)`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  color: '#e2e8f0',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '18px' }}>{account.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: account.color }}>{account.role}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{account.email}</div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or enter manually</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Manual login form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="advisor@firm.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {(loginError || error) && (
            <div style={{
              padding: '0.625rem 0.875rem',
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '8px',
              color: '#fb7185',
              fontSize: '13px',
            }}>
              {loginError || error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ justifyContent: 'center', padding: '0.75rem' }}>
            {isLoading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(6,182,212,0.05)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.15)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            💡 <strong style={{ color: 'var(--accent-cyan)' }}>Demo tip:</strong> Click any role button above. Accounts are auto-created on first login.
            Default password: <code style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa' }}>Sentinel2026!</code>
          </p>
        </div>
      </div>
    </div>
  )
}
