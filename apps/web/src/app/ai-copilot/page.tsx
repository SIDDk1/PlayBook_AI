'use client'
import { useState, useRef, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { scenarioApi, playbookApi } from '@/services/api'

const SCENARIO_PRESETS = [
  {
    label: 'Equity Market Crash',
    type: 'market_crash',
    severity: 'Critical',
    market_data: { index_drop: -0.15, vix: 42, affected_sectors: ['Technology', 'Financials'], sp500_change: -12.5 },
  },
  {
    label: 'Interest Rate Spike',
    type: 'interest_rate_change',
    severity: 'Warning',
    market_data: { rate_hike_basis_points: 75, fed_target: 5.75, bond_yield_10yr: 5.2 },
  },
  {
    label: 'Tech Sector Correction',
    type: 'portfolio_concentration_breach',
    severity: 'Warning',
    market_data: { sector: 'Technology', breach_pct: 42, limit_pct: 35, index_drop: -0.08 },
  },
  {
    label: 'Client Panic Event',
    type: 'client_panic',
    severity: 'Info',
    market_data: { sentiment: 'Very Negative', news_triggers: ['Recession fears', 'Fed hawkish'], client_calls: 28 },
  },
]

const AGENT_STEPS = [
  { name: 'Market Agent', icon: '📡', color: '#06b6d4', desc: 'Classifying market scenario and impacted asset classes...' },
  { name: 'Risk Agent', icon: '⚡', color: '#f59e0b', desc: 'Evaluating portfolio exposure and concentration limits...' },
  { name: 'Playbook Agent', icon: '📋', color: '#3b82f6', desc: 'RAG search: matching scenario to response playbooks...' },
  { name: 'Compliance Agent', icon: '🛡️', color: '#8b5cf6', desc: 'Verifying regulatory constraints and escalation flags...' },
  { name: 'Communication Agent', icon: '✉️', color: '#10b981', desc: 'Drafting advisory client communication...' },
  { name: 'Escalation Agent', icon: '🔔', color: '#f43f5e', desc: 'Determining approval hierarchy...' },
]

export default function AICopilotPage() {
  const [selected, setSelected] = useState<typeof SCENARIO_PRESETS[0] | null>(null)
  const [customType, setCustomType] = useState('')
  const [customSeverity, setCustomSeverity] = useState('Warning')
  const [isRunning, setIsRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const traceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    playbookApi.list().then(r => setPlaybooks(r.data)).catch(() => {})
  }, [])

  const runScenario = async () => {
    const scenarioData = selected
      ? { type: selected.type, severity: selected.severity, market_data: selected.market_data, status: 'Active' }
      : { type: customType || 'custom_event', severity: customSeverity, market_data: {}, status: 'Active' }

    setIsRunning(true)
    setResult(null)
    setError('')
    setActiveStep(0)

    try {
      // Animate through agent steps
      for (let i = 0; i < AGENT_STEPS.length; i++) {
        setActiveStep(i)
        await new Promise(r => setTimeout(r, 600))
      }
      const { data } = await scenarioApi.trigger(scenarioData)
      setResult(data)
      setActiveStep(AGENT_STEPS.length)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run scenario. Ensure you are logged in as RelationshipManager or RiskOfficer.')
      setActiveStep(-1)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1400px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>AI Copilot</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Trigger market scenarios and watch the six-agent pipeline analyze, recommend, and generate playbook responses in real-time
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Left: Scenario launcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>🎯 Scenario Presets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    onClick={() => { setSelected(preset); setCustomType('') }}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      border: selected?.type === preset.type
                        ? '1px solid rgba(6,182,212,0.5)'
                        : '1px solid var(--border-color)',
                      background: selected?.type === preset.type
                        ? 'rgba(6,182,212,0.1)'
                        : 'rgba(15,23,42,0.5)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      color: '#e2e8f0',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '0.25rem' }}>{preset.label}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge badge-${preset.severity.toLowerCase()}`}>{preset.severity}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>⚙️ Custom Scenario</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Event Type</label>
                  <input
                    className="input-field"
                    placeholder="e.g. geopolitical_crisis"
                    value={customType}
                    onChange={e => { setCustomType(e.target.value); setSelected(null) }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Severity</label>
                  <select
                    className="input-field"
                    value={customSeverity}
                    onChange={e => setCustomSeverity(e.target.value)}
                  >
                    <option value="Info">Info</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={runScenario}
              disabled={isRunning || (!selected && !customType)}
              style={{ justifyContent: 'center', padding: '0.875rem', fontSize: '14px' }}
            >
              {isRunning ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : '🚀'}
              {isRunning ? 'Running AI Pipeline...' : 'Run Scenario Analysis'}
            </button>

            {error && (
              <div style={{
                padding: '0.75rem', background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px',
                color: '#fb7185', fontSize: '12px', lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Right: Agent trace + results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Agent pipeline trace */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>🤖 Agent Pipeline Trace</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }} ref={traceRef}>
                {AGENT_STEPS.map((step, i) => {
                  const isActive = i === activeStep && isRunning
                  const isDone = activeStep > i || (!isRunning && activeStep === AGENT_STEPS.length && i < AGENT_STEPS.length)
                  const isPending = activeStep < i

                  return (
                    <div key={step.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      background: isActive ? `rgba(${step.color === '#06b6d4' ? '6,182,212' : step.color === '#f59e0b' ? '245,158,11' : '59,130,246'},0.08)` : isDone ? 'rgba(16,185,129,0.06)' : 'rgba(15,23,42,0.4)',
                      border: `1px solid ${isActive ? step.color + '40' : isDone ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
                      transition: 'all 0.3s ease',
                      opacity: isPending ? 0.4 : 1,
                    }}>
                      <div style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>
                        {isDone ? '✅' : isActive ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : step.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: isActive ? step.color : isDone ? '#34d399' : 'var(--text-secondary)' }}>
                          {step.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {isDone ? 'Completed' : isActive ? step.desc : 'Waiting...'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Results */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeSlideIn 0.4s ease' }}>
                {/* Scenario created badge */}
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.2rem' }}>Scenario Processed Successfully</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Scenario ID #{result.id} · Type: {result.type} · Severity: {result.severity}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '0.75rem' }}>📊 Analysis Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Scenario Type', value: result.type?.replace(/_/g, ' ') },
                      { label: 'Severity', value: result.severity },
                      { label: 'Status', value: result.status },
                      { label: 'Created At', value: new Date(result.created_at).toLocaleTimeString() },
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: '0.625rem',
                        background: 'rgba(15,23,42,0.5)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0' }}>{item.value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What happens next */}
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '0.75rem' }}>🔄 What Happened Next</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { icon: '📋', text: 'AI matched best playbook via RAG vector search', color: '#06b6d4' },
                      { icon: '⚡', text: 'Risk agent evaluated portfolio concentration breaches', color: '#f59e0b' },
                      { icon: '🛡️', text: 'Compliance agent validated regulatory constraints', color: '#8b5cf6' },
                      { icon: '✉️', text: 'Client communication draft auto-generated', color: '#10b981' },
                      { icon: '🔔', text: 'Approval chain created and assigned to your role queue', color: '#f43f5e' },
                    ].map((item) => (
                      <div key={item.text} style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(15,23,42,0.5)',
                        borderRadius: '8px',
                      }}>
                        <span style={{ fontSize: '15px' }}>{item.icon}</span>
                        <span style={{ fontSize: '13px', color: item.color }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                    <a href="/approvals" className="btn-primary" style={{ textDecoration: 'none' }}>Review Approvals →</a>
                    <a href="/scenarios" className="btn-secondary" style={{ textDecoration: 'none' }}>View All Scenarios →</a>
                  </div>
                </div>
              </div>
            )}

            {/* Playbook library */}
            {!result && playbooks.length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '1rem' }}>📚 Available Playbooks ({playbooks.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {playbooks.map((p: any) => (
                    <div key={p.id} style={{
                      padding: '0.625rem 0.875rem',
                      background: 'rgba(15,23,42,0.5)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '0.25rem' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                        Trigger: <code style={{ fontFamily: 'JetBrains Mono, monospace', color: '#06b6d4' }}>{p.trigger_conditions?.type || '—'}</code> ·
                        Steps: {p.actions?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
