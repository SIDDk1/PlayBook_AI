'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'
import { ArrowLeft, ArrowRight, Home, LogIn, LayoutDashboard, ChevronUp, UserCheck, Shield, Zap, Lock, Move } from 'lucide-react'
import { useEffect, useState } from 'react'

const DEMO_PERSONAS = [
  { role: 'RelationshipManager', email: 'rm@sentinel.ai', password: 'Sentinel2026!', label: 'Relationship Manager', color: '#06b6d4', icon: ChevronUp },
  { role: 'RiskOfficer', email: 'risk@sentinel.ai', password: 'Sentinel2026!', label: 'Risk Officer', color: '#f59e0b', icon: ChevronUp },
  { role: 'ComplianceHead', email: 'compliance@sentinel.ai', password: 'Sentinel2026!', label: 'Compliance Head', color: '#8b5cf6', icon: ChevronUp },
]

type DockPosition = 'bottom-center' | 'top-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const DOCK_POSITION_STYLES: Record<DockPosition, React.CSSProperties> = {
  'bottom-center': {
    bottom: '1.25rem',
    top: 'auto',
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
  },
  'top-center': {
    top: '1.25rem',
    bottom: 'auto',
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
  },
  'top-left': {
    top: '1.25rem',
    bottom: 'auto',
    left: '1.25rem',
    right: 'auto',
    transform: 'none',
  },
  'top-right': {
    top: '1.25rem',
    bottom: 'auto',
    right: '1.25rem',
    left: 'auto',
    transform: 'none',
  },
  'bottom-left': {
    bottom: '1.25rem',
    top: 'auto',
    left: '1.25rem',
    right: 'auto',
    transform: 'none',
  },
  'bottom-right': {
    bottom: '1.25rem',
    top: 'auto',
    right: '1.25rem',
    left: 'auto',
    transform: 'none',
  },
}

export default function GlobalNavigationDock() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, login } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPositionMenu, setShowPositionMenu] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [dockPosition, setDockPosition] = useState<DockPosition>('bottom-center')

  // Avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('dockPosition') as DockPosition
    if (saved && DOCK_POSITION_STYLES[saved]) {
      setDockPosition(saved)
    }
  }, [])

  // Close dropdowns on click outside
  useEffect(() => {
    if (!showDropdown && !showPositionMenu) return
    const handleClick = () => {
      setShowDropdown(false)
      setShowPositionMenu(false)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [showDropdown, showPositionMenu])

  if (!mounted) return null

  const changeDockPosition = (pos: DockPosition) => {
    setDockPosition(pos)
    localStorage.setItem('dockPosition', pos)
  }

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
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...DOCK_POSITION_STYLES[dockPosition],
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

      {/* 3. Dock Position Picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPositionMenu(!showPositionMenu)}
          title="Reposition Navigation Dock"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: showPositionMenu ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: showPositionMenu ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            color: showPositionMenu ? '#22d3ee' : '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!showPositionMenu) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.color = '#ffffff'
            }
          }}
          onMouseLeave={(e) => {
            if (!showPositionMenu) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.color = '#cbd5e1'
            }
          }}
        >
          <Move size={15} />
        </button>

        {showPositionMenu && (
          <div style={{
            position: 'absolute',
            bottom: dockPosition.startsWith('top') ? 'auto' : '2.5rem',
            top: dockPosition.startsWith('top') ? '2.5rem' : 'auto',
            right: dockPosition === 'top-left' || dockPosition === 'bottom-left' ? 'auto' : 0,
            left: dockPosition === 'top-left' || dockPosition === 'bottom-left' ? 0 : 'auto',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            minWidth: '160px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
            transformOrigin: dockPosition.startsWith('top') ? 'top right' : 'bottom right',
            animation: 'fadeInUp 0.15s ease-out',
            zIndex: 9999999,
          }}>
            <div style={{ padding: '0.2rem 0.4rem 0.2rem', fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.35rem' }}>
              📍 Dock Position
            </div>
            
            {/* Visual Viewport Positioning Grid */}
            <div style={{
              width: '120px',
              height: '76px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.4)',
              position: 'relative',
              margin: '0.25rem auto 0.5rem auto',
            }}>
              {([
                { id: 'top-left', t: '6px', l: '6px', r: 'auto', b: 'auto', tr: 'none' },
                { id: 'top-center', t: '6px', l: '50%', r: 'auto', b: 'auto', tr: 'translateX(-50%)' },
                { id: 'top-right', t: '6px', r: '6px', l: 'auto', b: 'auto', tr: 'none' },
                { id: 'bottom-left', b: '6px', l: '6px', r: 'auto', t: 'auto', tr: 'none' },
                { id: 'bottom-center', b: '6px', l: '50%', r: 'auto', t: 'auto', tr: 'translateX(-50%)' },
                { id: 'bottom-right', b: '6px', r: '6px', l: 'auto', t: 'auto', tr: 'none' },
              ] as const).map((pos) => {
                const isActive = dockPosition === pos.id
                return (
                  <button
                    key={pos.id}
                    onClick={() => changeDockPosition(pos.id)}
                    title={pos.id.replace('-', ' ')}
                    style={{
                      position: 'absolute',
                      top: pos.t,
                      bottom: pos.b,
                      left: pos.l,
                      right: pos.r,
                      transform: pos.tr,
                      width: '14px',
                      height: '14px',
                      borderRadius: '4px',
                      background: isActive ? '#06b6d4' : 'rgba(255,255,255,0.15)',
                      border: isActive ? '1px solid #22d3ee' : '1px solid transparent',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 0 8px #06b6d4' : 'none',
                      transition: 'all 0.15s ease',
                      padding: 0,
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    }}
                  />
                )
              })}
            </div>
            
            {/* Direct labels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.2rem' }}>
              {([
                { id: 'bottom-center', label: 'Bottom Center' },
                { id: 'top-center', label: 'Top Center' },
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-right', label: 'Top Right' },
              ] as const).map((pos) => {
                const isActive = dockPosition === pos.id
                return (
                  <button
                    key={pos.id}
                    onClick={() => changeDockPosition(pos.id)}
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                      border: 'none',
                      color: isActive ? '#22d3ee' : '#cbd5e1',
                      fontSize: '10px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                        e.currentTarget.style.color = '#ffffff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#cbd5e1'
                      }
                    }}
                  >
                    {pos.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Vertical Divider */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)' }} />

      {/* 4. Status Badge & Quick Switcher Dropdown */}
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
            bottom: dockPosition.startsWith('top') ? 'auto' : '2.5rem',
            top: dockPosition.startsWith('top') ? '2.5rem' : 'auto',
            right: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '220px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
            transformOrigin: dockPosition.startsWith('top') ? 'top right' : 'bottom right',
            animation: 'fadeInUp 0.15s ease-out',
          }}>
            <div style={{ padding: '0.35rem 0.5rem 0.2rem', fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.25rem' }}>
              Switch Demo Persona
            </div>
            
            {DEMO_PERSONAS.map((persona) => {
              const isSelected = user?.role?.name === persona.role
              
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
