'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import { ArrowLeft, ArrowRight, Home, LogIn, LayoutDashboard, ChevronUp, UserCheck, Shield, Zap, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

const DEMO_PERSONAS = [
  { role: 'RelationshipManager', email: 'rm@sentinel.ai', password: 'Sentinel2026!', label: 'Relationship Manager', color: '#06b6d4', icon: ChevronUp },
  { role: 'RiskOfficer', email: 'risk@sentinel.ai', password: 'Sentinel2026!', label: 'Risk Officer', color: '#f59e0b', icon: ChevronUp },
  { role: 'ComplianceHead', email: 'compliance@sentinel.ai', password: 'Sentinel2026!', label: 'Compliance Head', color: '#8b5cf6', icon: ChevronUp },
]

export default function GlobalNavigationDock() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, login } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  // Avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    if (!showDropdown) return
    const handleClick = () => setShowDropdown(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [showDropdown])

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
    if (isSwitching) return 'Switching...'
    if (!user) return 'Public Guest'
    switch (user.role?.name) {
      case 'RelationshipManager': return 'RM (Console)'
      case 'RiskOfficer': return 'Risk (Console)'
      case 'ComplianceHead': return 'Compliance'
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

  const handleQuickSwitch = async (persona: typeof DEMO_PERSONAS[0]) => {
    setIsSwitching(true)
    setShowDropdown(false)
    try {
      // Try to register first in case this is a clean backend database reset
      try {
        await authApi.signup({
          email: persona.email,
          password: persona.password,
          role_name: persona.role,
        })
      } catch (_) {
        // User already exists
      }
      
      // Log in
      await login(persona.email, persona.password)
      
      // Perform clean redirect/reload to Console to reload session context completely
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Persona switch error:', err)
      setIsSwitching(false)
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
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '0.5rem 1.25rem',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
    }}
      className="floating-dock-shadow"
      onClick={(e) => e.stopPropagation()} // Prevent closing dropdown
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
          <span>Landing</span>
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

      {/* 3. Status Badge & Quick Switcher Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => !isSwitching && setShowDropdown(!showDropdown)}
          disabled={isSwitching}
          title="Quick Switch Workspace Persona"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: isSwitching ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.borderColor = getRoleColor()
              e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'
            }
          }}
        >
          {isSwitching ? (
            <div className="spinner" style={{ width: '8px', height: '8px', borderWidth: '1.5px', borderColor: '#06b6d4 transparent transparent transparent' }} />
          ) : (
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
          )}
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: getRoleColor(),
          }}>
            {getRoleLabel()}
          </span>
          {!isSwitching && <ChevronUp size={10} style={{ color: '#64748b', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />}
        </button>

        {/* Floating Switcher Popover */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            right: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '220px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
            transformOrigin: 'bottom right',
            animation: 'fadeInUp 0.15s ease-out',
          }}>
            <div style={{ padding: '0.35rem 0.5rem 0.2rem', fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.25rem' }}>
              Switch Demo Persona
            </div>
            
            {DEMO_PERSONAS.map((persona) => {
              const isSelected = user?.role?.name === persona.role
              const PersonaIcon = isSelected ? UserCheck : (persona.role === 'RelationshipManager' ? UserCheck : persona.role === 'RiskOfficer' ? Zap : Shield)
              
              return (
                <button
                  key={persona.role}
                  onClick={() => handleQuickSwitch(persona)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: 'none',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                    e.currentTarget.style.color = persona.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? 'rgba(255,255,255,0.03)' : 'transparent'
                    e.currentTarget.style.color = isSelected ? '#ffffff' : '#cbd5e1'
                  }}
                >
                  {persona.role === 'RelationshipManager' && <UserCheck size={12} style={{ color: isSelected ? '#06b6d4' : '#64748b' }} />}
                  {persona.role === 'RiskOfficer' && <Zap size={12} style={{ color: isSelected ? '#f59e0b' : '#64748b' }} />}
                  {persona.role === 'ComplianceHead' && <Shield size={12} style={{ color: isSelected ? '#8b5cf6' : '#64748b' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: isSelected ? persona.color : 'inherit', fontWeight: isSelected ? 700 : 600 }}>{persona.label}</div>
                  </div>
                  {isSelected && <span style={{ fontSize: '9px', color: persona.color, fontWeight: 800 }}>ACTIVE</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
