'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

export default function Home() {
  const router = useRouter()
  const { user, initialize } = useAuthStore()

  useEffect(() => {
    initialize().then(() => {
      const u = useAuthStore.getState().user
      if (u) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    })
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>🛡️</div>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Initializing Sentinel AI...</p>
    </div>
  )
}