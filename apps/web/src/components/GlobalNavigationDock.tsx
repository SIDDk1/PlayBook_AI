'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft, ArrowRight, Home, LogIn, LayoutDashboard, Compass } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function GlobalNavigationDock() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Helper to determine active route class
  const getActiveStyle = (path: string) => {
    const isActive = pathname === path || (path !== '/' && path !== '/login' && pathname.startsWith(path))
    return {
      background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
      border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
      color: isActive ? '#22d3ee' : '#94a3b8',
      textShadow: isActive ? '0 0 10px rgba(34, 211, 238, 0.3)' : 'none',
      boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.15)' : 'none',
    }
  }

  // Determine user role label
  const getRoleLabel = () => {
    if (!user) return 'Public Guest'
    switch (user.role?.name) {
      case 'RelationshipManager': return 'RM (RM Panel)'
      case 'RiskOfficer': return 'Risk (Officer Panel)'
      case 'ComplianceHead': return 'Compliance (Head)'
      default: return user.role?.name || 'Authorized'
    }
  }

  const getRoleColor = () => {
    if (!user) return '#64748b'
    switch (user.role?.name) {
      case 'RelationshipManager': return '#06b6d4'
      case 'RiskOfficer': return '#f59e0b'
      case 'ComplianceHead': return '#8b5cf6'
      default: return '#10b981'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: 'rgba(11, 19, 36, 0.72)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '0.5rem 1.25rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
    }}
      className="floating-dock-shadow"
    >
      {/* 1. History Controls */}
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        <button
          onClick={() => router.back()}
          title="Navigate Back"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'scale(1.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={() => router.forward()}
          title="Navigate Forward"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'scale(1.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)' }} />

      {/* 2. Direct Navigation Quick Links */}
      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
        <button
          onClick={() => router.push('/')}
          title="Go to Landing Page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ...getActiveStyle('/'),
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#f8fafc'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/') {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }
          }}
        >
          <Home size={14} />
          <span style={{ display: 'inline-block' }}>Landing</span>
        </button>

        <button
          onClick={() => router.push('/login')}
          title="Go to Login Page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ...getActiveStyle('/login'),
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/login') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#f8fafc'
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/login') {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }
          }}
        >
          <LogIn size={14} />
          <span>Login</span>
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          title="Go to Main Project Dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ...getActiveStyle('/dashboard'),
          }}
          onMouseEnter={(e) => {
            const isDash = pathname !== '/' && pathname !== '/login'
            if (!isDash) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              e.currentTarget.style.color = '#f8fafc'
            }
          }}
          onMouseLeave={(e) => {
            const isDash = pathname !== '/' && pathname !== '/login'
            if (!isDash) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94a3b8'
            }
          }}
        >
          <LayoutDashboard size={14} />
          <span>Console</span>
        </button>
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)' }} />

      {/* 3. Status Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getRoleColor(),
            boxShadow: `0 0 10px ${getRoleColor()}`,
          }}
          className="pulse-dot"
        />
        <span style={{
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: getRoleColor(),
        }}>
          {getRoleLabel()}
        </span>
      </div>
    </div>
  )
}
