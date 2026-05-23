'use client'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { scenarioApi } from '@/services/api'

const SEVERITY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'rgba(244,63,94,0.1)', text: '#fb7185', border: 'rgba(244,63,94,0.3)' },
  Warning: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  Info: { bg: 'rgba(6,182,212,0.1)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
}

const QUICK_SCENARIOS = [
  { label: 'Market Crash', type: 'market_crash', severity: 'Critical', icon: '📉', market_data: { index_drop: -0.15, vix: 42, sp500_change: -12.5 } },
  { label: 'Rate Hike', type: 'interest_rate_change', severity: 'Warning', icon: '📈', market_data: { rate_hike_basis_points: 75 } },
  { label: 'Concentration Breach', type: 'portfolio_concentration_breach', severity: 'Warning', icon: '⚠️', market_data: { sector: 'Technology', breach_pct: 42 } },
  { label: 'Credit Event', type: 'credit_event', severity: 'Critical', icon: '💳', market_data: { default_probability: 0.35, rating_downgrade: 'AA to BBB' } },
  { label: 'Liquidity Crisis', type: 'liquidity_crisis', severity: 'Critical', icon: '💧', market_data: { bid_ask_spread: 8.5, daily_volume: -0.65 } },
  { label: 'FX Volatility', type: 'fx_volatility', severity: 'Info', icon: '💱', market_data: { eur_usd_change: -0.04, gbp_usd_change: -0.028 } },
]

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Custom scenario form
  const [form, setForm] = useState({ type: '', severity: 'Warning', market_data: '{}' })

  const load = async () => {
    try {
      const { data } = await scenarioApi.list()
      setScenarios(data)
    } catch {
      // silently fail - user might not have permission
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const triggerQuick = async (preset: typeof QUICK_SCENARIOS[0]) => {
    setTriggering(preset.type)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      await scenarioApi.trigger({
        type: preset.type,
        severity: preset.severity,
        market_data: preset.market_data,
        status: 'Active',
      })
      setSuccessMsg(`✅ ${preset.label} scenario triggered! AI pipeline is processing...`)
      await load()
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Failed to trigger scenario. Check your role permissions.')
    } finally {
      setTriggering(null)
    }
  }

  const triggerCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    let parsedData = {}
    try { parsedData = JSON.parse(form.market_data) } catch { parsedData = {} }
    try {
      await scenarioApi.trigger({ type: form.type, severity: form.severity, market_data: parsedData, status: 'Active' })
      setSuccessMsg('✅ Custom scenario triggered successfully!')
      setForm({ type: '', severity: 'Warning', market_data: '{}' })
      await load()
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Failed to trigger scenario.')
    }
  }

  const resolveScenario = async (id: number) => {
    try {
      await scenarioApi.update(id, { status: 'Resolved' })
      await load()
    } catch {}
  }

  const filtered = filterSeverity === 'All' ? scenarios : scenarios.filter(s => s.severity === filterSeverity)

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1400px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Market Scenarios</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Trigger market events and watch the AI pipeline respond with playbook recommendations
          </p>
        </div>

        {successMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#34d399', marginBottom: '1rem', fontSize: '13px' }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: '#fb7185', marginBottom: '1rem', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left: scenarios list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Quick triggers */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>⚡ Quick Trigger Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                {QUICK_SCENARIOS.map((preset) => {
                  const sty = SEVERITY_STYLE[preset.severity]
                  return (
                    <button
                      key={preset.type}
                      onClick={() => triggerQuick(preset)}
                      disabled={triggering !== null}
                      style={{
                        padding: '0.875rem',
                        borderRadius: '10px',
                        background: sty.bg,
                        border: `1px solid ${sty.border}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        color: '#e2e8f0',
                        opacity: triggering && triggering !== preset.type ? 0.5 : 1,
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '0.375rem' }}>
                        {triggering === preset.type ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderTopColor: sty.text, borderColor: 'rgba(255,255,255,0.1)' }} /> : preset.icon}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '0.2rem' }}>{preset.label}</div>
                      <div style={{ fontSize: '11px', color: sty.text, fontWeight: 600 }}>{preset.severity}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active scenarios table */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Scenario History ({scenarios.length})</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['All', 'Critical', 'Warning', 'Info'].map((sv) => (
                    <button
                      key={sv}
                      onClick={() => setFilterSeverity(sv)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        border: filterSeverity === sv ? '1px solid rgba(6,182,212,0.4)' : '1px solid var(--border-color)',
                        background: filterSeverity === sv ? 'rgba(6,182,212,0.1)' : 'transparent',
                        color: filterSeverity === sv ? '#22d3ee' : 'var(--text-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sv}
                    </button>
                  ))}
                  <button onClick={load} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No scenarios yet. Use the presets or custom form to trigger one.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Triggered At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s: any) => {
                        const sty = SEVERITY_STYLE[s.severity]
                        return (
                          <tr key={s.id}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>#{s.id}</td>
                            <td style={{ fontWeight: 600 }}>{s.type.replace(/_/g, ' ')}</td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                background: sty.bg,
                                color: sty.text,
                                border: `1px solid ${sty.border}`,
                                fontSize: '11px',
                                fontWeight: 700,
                              }}>
                                {s.severity}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                fontSize: '12px',
                                color: s.status === 'Active' ? '#34d399' : 'var(--text-muted)',
                              }}>
                                {s.status === 'Active' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />}
                                {s.status}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {new Date(s.created_at).toLocaleString()}
                            </td>
                            <td>
                              {s.status === 'Active' && (
                                <button
                                  onClick={() => resolveScenario(s.id)}
                                  style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    background: 'rgba(16,185,129,0.08)',
                                    color: '#34d399',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: custom form */}
          <div className="card" style={{ position: 'sticky', top: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>🔧 Custom Scenario</div>
            <form onSubmit={triggerCustom} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Event Type *</label>
                <input
                  className="input-field"
                  placeholder="e.g. geopolitical_crisis"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Severity</label>
                <select
                  className="input-field"
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Market Data (JSON)</label>
                <textarea
                  className="input-field"
                  placeholder='{"index_drop": -0.12, "vix": 35}'
                  value={form.market_data}
                  onChange={e => setForm(f => ({ ...f, market_data: e.target.value }))}
                  style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                ⚡ Trigger Scenario
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(6,182,212,0.06)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.15)' }}>
              <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '0.5rem', color: '#22d3ee' }}>How it works</div>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {['Scenario data submitted to API', 'AI agents classify & analyze', 'Best playbook matched via RAG', 'Approval chain auto-created', 'Client communication drafted'].map((step, i) => (
                  <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
