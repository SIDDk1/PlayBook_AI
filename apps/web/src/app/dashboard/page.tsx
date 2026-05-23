'use client'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { scenarioApi, portfolioApi, approvalApi, playbookApi } from '@/services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

const SEVERITY_COLORS = { Critical: '#f43f5e', Warning: '#f59e0b', Info: '#06b6d4' }

const riskTrendData = [
  { time: '09:00', risk: 42, exposure: 35 },
  { time: '10:00', risk: 55, exposure: 48 },
  { time: '11:00', risk: 71, exposure: 62 },
  { time: '12:00', risk: 65, exposure: 58 },
  { time: '13:00', risk: 78, exposure: 70 },
  { time: '14:00', risk: 83, exposure: 75 },
  { time: '15:00', risk: 69, exposure: 65 },
  { time: '16:00', risk: 72, exposure: 68 },
]

const assetAllocationData = [
  { name: 'Equity', value: 42, color: '#06b6d4' },
  { name: 'Fixed Income', value: 28, color: '#3b82f6' },
  { name: 'Alternatives', value: 18, color: '#8b5cf6' },
  { name: 'Cash', value: 12, color: '#10b981' },
]

function StatCard({ label, value, subtext, icon, accentColor, trend }: any) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem', fontWeight: 600 }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: accentColor || '#e2e8f0', lineHeight: 1 }}>
            {value}
          </div>
        </div>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `rgba(${accentColor === '#f43f5e' ? '244,63,94' : accentColor === '#f59e0b' ? '245,158,11' : accentColor === '#10b981' ? '16,185,129' : '6,182,212'},0.15)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>
          {icon}
        </div>
      </div>
      {subtext && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>}
      {trend && (
        <div style={{
          fontSize: '11px',
          color: trend > 0 ? '#f43f5e' : '#34d399',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          fontWeight: 600,
        }}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last hour
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAlertModal, setShowAlertModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [sc, po, ap, pl] = await Promise.allSettled([
          scenarioApi.list(),
          portfolioApi.list(),
          approvalApi.pending(),
          playbookApi.list(),
        ])
        if (sc.status === 'fulfilled') setScenarios(sc.value.data)
        if (po.status === 'fulfilled') setPortfolios(po.value.data)
        if (ap.status === 'fulfilled') setApprovals(ap.value.data)
        if (pl.status === 'fulfilled') setPlaybooks(pl.value.data)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const criticalScenarios = scenarios.filter(s => s.severity === 'Critical')
  const totalAUM = portfolios.reduce((s, p) => s + (p.total_value || 0), 0)
  const breachedCount = portfolios.filter(p => {
    const techWeight = (p.assets || []).filter((a: any) => a.asset_class === 'Equity').reduce((s: number, a: any) => s + (a.weight || 0), 0)
    return techWeight > 0.35
  }).length

  const severityData = [
    { name: 'Critical', count: scenarios.filter(s => s.severity === 'Critical').length },
    { name: 'Warning', count: scenarios.filter(s => s.severity === 'Warning').length },
    { name: 'Info', count: scenarios.filter(s => s.severity === 'Info').length },
  ]

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1400px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Market Intelligence Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Real-time scenario monitoring · Playbook recommendations · Risk exposure
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {criticalScenarios.length > 0 && (
              <div
                className="badge badge-critical"
                onClick={() => setShowAlertModal(true)}
                style={{
                  animation: 'pulse 2s ease-in-out infinite',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Click to view critical alerts details"
              >
                🔴 {criticalScenarios.length} Critical Alert{criticalScenarios.length > 1 ? 's' : ''}
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date().toLocaleTimeString()} · Auto-refresh 30s
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard
            label="Total AUM"
            value={`$${(totalAUM / 1_000_000).toFixed(1)}M`}
            icon="💰"
            accentColor="#06b6d4"
            subtext={`${portfolios.length} active portfolios`}
          />
          <StatCard
            label="Active Scenarios"
            value={scenarios.filter(s => s.status === 'Active').length}
            icon="⚡"
            accentColor="#f59e0b"
            subtext="Monitoring market events"
            trend={scenarios.length > 0 ? 12 : 0}
          />
          <StatCard
            label="Breached Portfolios"
            value={breachedCount}
            icon="⚠️"
            accentColor="#f43f5e"
            subtext="Concentration limit violations"
            trend={breachedCount > 0 ? 8 : 0}
          />
          <StatCard
            label="Pending Approvals"
            value={approvals.length}
            icon="✅"
            accentColor="#10b981"
            subtext={`${playbooks.length} playbooks loaded`}
          />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Risk trend chart */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Portfolio Risk Trend</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Aggregate risk score & equity exposure (today)</div>
              </div>
              <div className="badge badge-warning">Live</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.08)" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(99,179,237,0.2)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} fill="url(#riskGrad)" name="Risk Score" />
                <Area type="monotone" dataKey="exposure" stroke="#06b6d4" strokeWidth={2} fill="url(#expGrad)" name="Equity Exposure %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Asset allocation pie */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '0.5rem' }}>Asset Allocation</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem' }}>Aggregate portfolio mix</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={assetAllocationData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {assetAllocationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.97)',
                    border: '1px solid rgba(99,179,237,0.25)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '8px 12px',
                  }}
                  itemStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '2px' }}
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {assetAllocationData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Scenarios + Approvals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Active Scenarios */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Active Market Scenarios</div>
              <a href="/scenarios" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>View all →</a>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
            ) : scenarios.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2rem',
                color: 'var(--text-muted)', fontSize: '13px',
                border: '1px dashed var(--border-color)', borderRadius: '8px',
              }}>
                No active scenarios. <a href="/scenarios" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>Trigger one →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {scenarios.slice(0, 4).map((s: any) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    background: 'rgba(15,23,42,0.5)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: (SEVERITY_COLORS as any)[s.severity] || '#94a3b8',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                    <span className={`badge badge-${s.severity.toLowerCase()}`}>{s.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Approvals */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Pending Approvals</div>
              <a href="/approvals" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>Manage →</a>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner" /></div>
            ) : approvals.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2rem',
                color: 'var(--text-muted)', fontSize: '13px',
                border: '1px dashed var(--border-color)', borderRadius: '8px',
              }}>
                ✅ No pending approvals for your role
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {approvals.slice(0, 4).map((a: any) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    background: 'rgba(139,92,246,0.06)',
                    borderRadius: '8px',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}>
                    <span style={{ fontSize: '16px' }}>📋</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Workflow #{a.workflow_id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Role: {a.approver_role}</div>
                    </div>
                    <a href="/approvals" className="badge badge-pending">Review</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gorgeous Critical Alert Modal popover */}
        {showAlertModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999999,
          }}>
            <div style={{
              width: '90%',
              maxWidth: '600px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #f43f5e',
              borderTop: '5px solid #f43f5e',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(244,63,94,0.3)',
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '24px' }}>🚨</span>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Active Critical Scenarios</h3>
                    <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 600 }}>Action Required by Wealth Officers</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlertModal(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              {/* Scenarios List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                {criticalScenarios.map((s: any) => (
                  <div key={s.id} style={{
                    background: 'rgba(244, 63, 94, 0.05)',
                    border: '1px solid rgba(244, 63, 94, 0.15)',
                    borderRadius: '12px',
                    padding: '1rem',
                    fontSize: '13px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '14px', textTransform: 'capitalize' }}>
                        {s.type.replace(/_/g, ' ')}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                      {s.description || 'Institutional wealth boundary warning: stress conditions detected.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                      <span>ID: #{s.id}</span>
                      <span>Triggered: {new Date(s.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Links */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowAlertModal(false); window.location.href = '/scenarios'; }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  View Scenarios Panel
                </button>
                <button
                  onClick={() => { setShowAlertModal(false); window.location.href = '/playbooks'; }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(244,63,94,0.25)'
                  }}
                >
                  Generate Response Playbook
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}