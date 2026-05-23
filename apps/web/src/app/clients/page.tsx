'use client'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { clientApi, portfolioApi } from '@/services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

function RiskMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100))
  const color = score >= 8 ? '#f43f5e' : score >= 6 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '28px' }}>{score.toFixed(1)}</span>
    </div>
  )
}

function ConcentrationBar({ assets }: { assets: any[] }) {
  const equityPct = assets.filter(a => a.asset_class === 'Equity').reduce((s, a) => s + (a.weight || 0), 0) * 100
  const fixedPct = assets.filter(a => a.asset_class === 'Fixed Income').reduce((s, a) => s + (a.weight || 0), 0) * 100
  const altPct = assets.filter(a => !['Equity', 'Fixed Income'].includes(a.asset_class)).reduce((s, a) => s + (a.weight || 0), 0) * 100
  const isBreach = equityPct > 35

  return (
    <div>
      <div style={{ display: 'flex', height: '6px', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.3rem' }}>
        <div style={{ width: `${equityPct}%`, background: isBreach ? '#f43f5e' : '#06b6d4' }} title={`Equity ${equityPct.toFixed(0)}%`} />
        <div style={{ width: `${fixedPct}%`, background: '#3b82f6' }} title={`Fixed Income ${fixedPct.toFixed(0)}%`} />
        <div style={{ width: `${altPct}%`, background: '#10b981' }} title={`Other ${altPct.toFixed(0)}%`} />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span style={{ color: isBreach ? '#f43f5e' : '#06b6d4' }}>EQ {equityPct.toFixed(0)}%{isBreach ? ' ⚠️' : ''}</span>
        <span style={{ color: '#3b82f6' }}>FI {fixedPct.toFixed(0)}%</span>
        <span style={{ color: '#10b981' }}>Alt {altPct.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', risk_profile: 'Moderate', segment: 'HNW' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [cl, po] = await Promise.all([clientApi.list(), portfolioApi.list()])
      setClients(cl.data)
      setPortfolios(po.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      await clientApi.create(form)
      setMsg({ type: 'success', text: 'Client created successfully!' })
      setShowCreate(false)
      setForm({ name: '', email: '', risk_profile: 'Moderate', segment: 'HNW' })
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Failed to create client. Check permissions (RelationshipManager required).' })
    } finally {
      setSaving(false)
    }
  }

  const RISK_PROFILE_COLORS: Record<string, string> = {
    Conservative: '#10b981',
    Moderate: '#f59e0b',
    Aggressive: '#f43f5e',
  }

  const SEGMENT_COLORS: Record<string, string> = {
    'Ultra-HNW': '#8b5cf6',
    HNW: '#3b82f6',
    Institutional: '#06b6d4',
    Retail: '#94a3b8',
  }

  const riskDistribution = ['Conservative', 'Moderate', 'Aggressive'].map(r => ({
    name: r,
    count: clients.filter(c => c.risk_profile === r).length,
    color: RISK_PROFILE_COLORS[r],
  }))

  const clientPortfolios = selected ? portfolios.filter(p => p.client_id === selected.id) : []

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Clients & Risk Engine</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Client portfolio overview, risk profiling, and concentration breach detection
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? '✕ Cancel' : '+ New Client'}
          </button>
        </div>

        {msg.text && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px',
            background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
            color: msg.type === 'success' ? '#34d399' : '#fb7185',
          }}>
            {msg.text}
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Clients', value: clients.length, icon: '👤', color: '#06b6d4' },
            { label: 'Portfolios', value: portfolios.length, icon: '💼', color: '#3b82f6' },
            { label: 'Total AUM', value: `$${(portfolios.reduce((s, p) => s + (p.total_value || 0), 0) / 1_000_000).toFixed(1)}M`, icon: '💰', color: '#10b981' },
            {
              label: 'Concentration Breaches',
              value: portfolios.filter(p => {
                const eq = (p.assets || []).filter((a: any) => a.asset_class === 'Equity').reduce((s: number, a: any) => s + (a.weight || 0), 0)
                return eq > 0.35
              }).length,
              icon: '⚠️',
              color: '#f43f5e',
            },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ fontSize: '24px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="card" style={{ marginBottom: '1.25rem', border: '1px solid rgba(6,182,212,0.25)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>👤 New Client</div>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.875rem', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                <input className="input-field" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Email *</label>
                <input className="input-field" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Risk Profile</label>
                <select className="input-field" value={form.risk_profile} onChange={e => setForm(f => ({ ...f, risk_profile: e.target.value }))}>
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Segment</label>
                <select className="input-field" value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))}>
                  <option>Retail</option>
                  <option>HNW</option>
                  <option>Ultra-HNW</option>
                  <option>Institutional</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '+ Add Client'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Client table */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>Client Portfolio Overview</div>
              {/* Risk distribution inline chart */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {riskDistribution.filter(r => r.count > 0).map(r => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: r.color }} />
                    <span style={{ color: 'var(--text-muted)' }}>{r.name} ({r.count})</span>
                  </div>
                ))}
              </div>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
            ) : clients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                No clients found. The database seeder adds a demo client automatically.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Segment</th>
                      <th>Risk Profile</th>
                      <th>Portfolios</th>
                      <th>Total AUM</th>
                      <th>Risk Score</th>
                      <th>Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c: any) => {
                      const cPortfolios = portfolios.filter(p => p.client_id === c.id)
                      const totalAUM = cPortfolios.reduce((s, p) => s + (p.total_value || 0), 0)
                      const avgRisk = cPortfolios.length > 0 ? cPortfolios.reduce((s, p) => s + (p.risk_score || 0), 0) / cPortfolios.length : 0
                      const allAssets = cPortfolios.flatMap(p => p.assets || [])
                      const rpColor = RISK_PROFILE_COLORS[c.risk_profile] || '#94a3b8'
                      const segColor = SEGMENT_COLORS[c.segment] || '#94a3b8'

                      return (
                        <tr
                          key={c.id}
                          onClick={() => setSelected(selected?.id === c.id ? null : c)}
                          style={{ cursor: 'pointer', background: selected?.id === c.id ? 'rgba(6,182,212,0.04)' : undefined }}
                        >
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</div>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px',
                              background: `${segColor}20`, color: segColor, border: `1px solid ${segColor}40`,
                            }}>{c.segment}</span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px',
                              background: `${rpColor}20`, color: rpColor, border: `1px solid ${rpColor}40`,
                            }}>{c.risk_profile}</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{cPortfolios.length}</td>
                          <td style={{ fontWeight: 600, color: '#22d3ee' }}>
                            ${(totalAUM / 1_000_000).toFixed(2)}M
                          </td>
                          <td style={{ width: '120px' }}>
                            {avgRisk > 0 ? <RiskMeter score={avgRisk} /> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}
                          </td>
                          <td style={{ minWidth: '120px' }}>
                            {allAssets.length > 0 ? <ConcentrationBar assets={allAssets} /> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No assets</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Client detail panel */}
          {selected && (
            <div className="card" style={{ position: 'sticky', top: '1.5rem', border: '1px solid rgba(6,182,212,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{selected.name}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '1rem' }}>{selected.email}</div>

              {/* Portfolio cards */}
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '0.75rem' }}>Portfolios ({clientPortfolios.length})</div>
              {clientPortfolios.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No portfolios found for this client.</div>
              ) : (
                clientPortfolios.map((p: any) => {
                  const eqPct = ((p.assets || []).filter((a: any) => a.asset_class === 'Equity').reduce((s: number, a: any) => s + (a.weight || 0), 0) * 100)
                  const isBreach = eqPct > 35
                  return (
                    <div key={p.id} style={{
                      padding: '0.875rem',
                      background: isBreach ? 'rgba(244,63,94,0.06)' : 'rgba(15,23,42,0.5)',
                      border: `1px solid ${isBreach ? 'rgba(244,63,94,0.3)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      marginBottom: '0.625rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                        {isBreach && <span className="badge badge-critical">⚠️ Breach</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.625rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>AUM: <strong style={{ color: '#22d3ee' }}>${(p.total_value / 1_000_000).toFixed(2)}M</strong></span>
                        <span>Risk: <strong style={{ color: p.risk_score >= 7 ? '#f43f5e' : '#f59e0b' }}>{p.risk_score}</strong></span>
                      </div>
                      <ConcentrationBar assets={p.assets || []} />
                      <div style={{ marginTop: '0.625rem' }}>
                        {(p.assets || []).map((a: any) => (
                          <div key={a.ticker} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{a.ticker}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{a.asset_class}</span>
                            <span style={{ color: '#22d3ee' }}>{((a.weight || 0) * 100).toFixed(0)}%</span>
                            <span style={{ color: '#10b981' }}>${((a.value || 0) / 1000).toFixed(0)}K</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
