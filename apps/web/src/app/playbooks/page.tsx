'use client'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { playbookApi } from '@/services/api'

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  market_crash: { icon: '📉', color: '#f43f5e', label: 'Market Crash' },
  sector_correction: { icon: '📊', color: '#f59e0b', label: 'Sector Correction' },
  interest_rate_change: { icon: '📈', color: '#3b82f6', label: 'Interest Rate' },
  liquidity_stress: { icon: '💧', color: '#06b6d4', label: 'Liquidity Stress' },
  earnings_volatility: { icon: '📋', color: '#8b5cf6', label: 'Earnings Volatility' },
  geopolitical_event: { icon: '🌍', color: '#ef4444', label: 'Geopolitical Event' },
  credit_downgrade: { icon: '💳', color: '#ec4899', label: 'Credit Downgrade' },
  client_panic_selling: { icon: '😰', color: '#f97316', label: 'Panic Selling' },
  portfolio_concentration_breach: { icon: '⚠️', color: '#eab308', label: 'Concentration Breach' },
}

// Reusable Collapsible JSON Viewer for Professional Auditing
function CollapsibleJsonViewer({ data, title, color = '#64748b' }: { data: any; title: string; color?: string }) {
  const [open, setOpen] = useState(false)
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          color: color,
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: 0,
          opacity: 0.7,
          transition: 'opacity 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <span>{open ? '▼' : '▶'}</span>
        <span>{open ? `Hide Raw ${title} Code` : `Show Raw ${title} Code`}</span>
      </button>
      {open && (
        <pre style={{
          marginTop: '0.5rem',
          margin: '0.5rem 0 0 0',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '0.75rem',
          borderRadius: '6px',
          color: '#cbd5e1',
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {jsonString}
        </pre>
      )}
    </div>
  )
}

// Gorgeous Visual Renderers instead of code blocks
function renderGuardrails(guardrails: any) {
  if (!guardrails) return null
  let parsed = guardrails
  if (typeof guardrails === 'string') {
    try {
      parsed = JSON.parse(guardrails)
    } catch {
      return <pre style={{ fontSize: '11px', color: '#fde68a', margin: 0 }}>{guardrails}</pre>
    }
  }

  const maxSingleTrade = parsed.max_single_trade_pct !== undefined ? parsed.max_single_trade_pct : null
  const restrictedAssets = Array.isArray(parsed.restricted_asset_classes) ? parsed.restricted_asset_classes : []
  const minCashBuffer = parsed.min_cash_buffer_pct !== undefined ? parsed.min_cash_buffer_pct : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: '8px' }}>
      {maxSingleTrade !== null && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '0.25rem' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Max Single Trade Allocation</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{(maxSingleTrade * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${maxSingleTrade * 100}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '9999px' }} />
          </div>
        </div>
      )}

      {minCashBuffer !== null && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '0.25rem' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Minimum Required Cash Buffer</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{(minCashBuffer * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${minCashBuffer * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)', borderRadius: '9999px' }} />
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Restricted Asset Classes</div>
        {restrictedAssets.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {restrictedAssets.map((asset: string, idx: number) => (
              <span key={idx} style={{ fontSize: '10px', fontWeight: 700, color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                🚫 {asset}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No restricted asset classes.</div>
        )}
      </div>
      <CollapsibleJsonViewer data={parsed} title="Guardrails" color="#fbbf24" />
    </div>
  )
}

function renderTriggerConditions(triggerConditions: any) {
  if (!triggerConditions) return null
  let parsed = triggerConditions
  if (typeof triggerConditions === 'string') {
    try {
      parsed = JSON.parse(triggerConditions)
    } catch {
      return <pre style={{ fontSize: '11px', color: '#a5f3fc', margin: 0 }}>{triggerConditions}</pre>
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: '8px' }}>
      {Object.entries(parsed).map(([key, val]: [string, any], idx) => {
        let label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        let valStr = ''
        if (typeof val === 'number') {
          if (key.includes('pct') || key.includes('threshold') && val > -1 && val < 1 && val !== 0) {
            valStr = `${(val * 100).toFixed(0)}%`
          } else {
            valStr = val.toString()
          }
        } else if (Array.isArray(val)) {
          valStr = val.join(', ')
        } else {
          valStr = String(val)
        }

        return (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
            <span style={{ color: '#22d3ee', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{valStr}</span>
          </div>
        )
      })}
      <CollapsibleJsonViewer data={parsed} title="Trigger" color="#06b6d4" />
    </div>
  )
}

function renderImpactedScope(scope: any) {
  if (!scope) return null
  let parsed = scope
  if (typeof scope === 'string') {
    try {
      parsed = JSON.parse(scope)
    } catch {
      return <pre style={{ fontSize: '11px', color: '#818cf8', margin: 0 }}>{scope}</pre>
    }
  }

  const riskProfiles = Array.isArray(parsed.risk_profiles) ? parsed.risk_profiles : []
  const segments = Array.isArray(parsed.segments) ? parsed.segments : []
  const assetClasses = Array.isArray(parsed.asset_classes) ? parsed.asset_classes : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: '8px', fontSize: '11px' }}>
      {riskProfiles.length > 0 && (
        <div>
          <div style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Profiles</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {riskProfiles.map((p: string, idx: number) => (
              <span key={idx} style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {segments.length > 0 && (
        <div>
          <div style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Client Segments</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {segments.map((s: string, idx: number) => (
              <span key={idx} style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {assetClasses.length > 0 && (
        <div>
          <div style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Asset Classes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {assetClasses.map((ac: string, idx: number) => (
              <span key={idx} style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                {ac}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function renderActionParams(params: any) {
  if (!params) return null
  let parsed = params
  if (typeof params === 'string') {
    try {
      parsed = JSON.parse(params)
    } catch {
      return <pre style={{ margin: 0, color: '#94a3b8', fontSize: '10px' }}>{params}</pre>
    }
  }

  const { sell, buy, amount_pct } = parsed

  if (sell || buy) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {sell && (
            <span>
              Sell <strong style={{ color: '#f43f5e' }}>{sell}</strong>
            </span>
          )}
          {buy && (
            <span>
              and Buy <strong style={{ color: '#10b981' }}>{buy}</strong>
            </span>
          )}
          {amount_pct !== undefined && (
            <span style={{ color: '#64748b' }}>
              (Allocation: <strong style={{ color: '#fbbf24' }}>{(amount_pct * 100).toFixed(0)}%</strong>)
            </span>
          )}
        </div>
        <CollapsibleJsonViewer data={parsed} title="Parameters" color="#94a3b8" />
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {Object.entries(parsed).map(([key, val]: [string, any], idx) => (
          <span key={idx} style={{ borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '0.5rem', marginRight: '0.25rem' }}>
            <strong>{key.replace(/_/g, ' ')}:</strong> {typeof val === 'number' && val > -1 && val < 1 && val !== 0 ? `${(val * 100).toFixed(0)}%` : String(val)}
          </span>
        ))}
      </div>
      <CollapsibleJsonViewer data={parsed} title="Parameters" color="#94a3b8" />
    </div>
  )
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAIGen, setShowAIGen] = useState(false)
  
  // AI Generator States
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [generatedPlaybook, setGeneratedPlaybook] = useState<any>(null)
  const [aiPreviewTab, setAiPreviewTab] = useState<'overview' | 'risk' | 'actions' | 'communication' | 'workflow'>('overview')
  const [detailTab, setDetailTab] = useState<'triggers' | 'risk' | 'actions' | 'communication' | 'workflow'>('triggers')
  
  // Filter category state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'market_crash',
    trigger_conditions: '{\n  "type": "market_crash",\n  "index_drop_threshold": -0.10,\n  "vix_threshold": 35\n}',
    actions: '[\n  {\n    "step": 1,\n    "action_type": "rebalance",\n    "params": {\n      "sell": "Tech Equity",\n      "buy": "US Treasuries",\n      "amount_pct": 0.20\n    }\n  }\n]',
    compliance_rules: '{\n  "requires_escalation": true,\n  "restricted_asset_classes": ["Cryptocurrency"]\n}',
    impacted_portfolios_clients: '{\n  "risk_profiles": ["Aggressive", "Moderate"],\n  "segments": ["HNW", "Ultra-HNW"],\n  "asset_classes": ["Equity"]\n}',
    risk_checks: '[\n  {\n    "check": "equity_exposure_limit",\n    "threshold": 0.60,\n    "action": "flag"\n  }\n]',
    client_communication_templates: '{\n  "subject": "Portfolio Strategy Alert",\n  "body": "Dear {client_name}, in response to market volatility we have defensive allocations active.",\n  "tone": "Reassuring and professional"\n}',
    guardrails: '{\n  "max_single_trade_pct": 0.25,\n  "restricted_asset_classes": ["Cryptocurrency"],\n  "min_cash_buffer_pct": 0.05\n}',
    escalation_rules: '{\n  "severity_threshold": "Critical",\n  "auto_escalate_roles": ["RiskOfficer"]\n}',
    approval_workflow: '["RelationshipManager", "RiskOfficer"]',
    post_action_review_metrics: '[\n  {\n    "metric": "portfolio_recovery_rate",\n    "target": 0.85,\n    "window_days": 30\n  }\n]'
  })
  
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await playbookApi.list()
      setPlaybooks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Dynamic Statistics
  const totalCount = playbooks.length
  const uniqueCategories = new Set(playbooks.filter(p => p.category).map(p => p.category)).size
  const avgActions = totalCount > 0 
    ? Math.round(playbooks.reduce((acc, curr) => acc + (curr.actions?.length || 0), 0) / totalCount) 
    : 0

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return
    setAiGenerating(true)
    setGeneratedPlaybook(null)
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
    
    // Simulate animated steps
    setGenStep(1) // Analyzing parameters
    await sleep(650)
    setGenStep(2) // Identifying impacted
    await sleep(650)
    setGenStep(3) // Constructing risk
    await sleep(650)
    setGenStep(4) // Drafting comms
    await sleep(650)
    setGenStep(5) // Finalizing structure
    await sleep(650)

    try {
      const { data } = await playbookApi.generate(aiPrompt)
      setGeneratedPlaybook(data)
      setAiPreviewTab('overview')
      setMsg({ type: 'success', text: 'AI Playbook architected successfully! Review preview below.' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'AI generation failed. Fallback to mock playbook.' })
    } finally {
      setAiGenerating(false)
      setGenStep(0)
    }
  }

  const handleSaveAIGenerated = async () => {
    if (!generatedPlaybook) return
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      await playbookApi.create(generatedPlaybook)
      setMsg({ type: 'success', text: `Playbook "${generatedPlaybook.name}" successfully added to library!` })
      setGeneratedPlaybook(null)
      setAiPrompt('')
      setShowAIGen(false)
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Failed to save generated playbook.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg({ type: '', text: '' })
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        trigger_conditions: JSON.parse(form.trigger_conditions),
        actions: JSON.parse(form.actions),
        compliance_rules: JSON.parse(form.compliance_rules),
        impacted_portfolios_clients: JSON.parse(form.impacted_portfolios_clients),
        risk_checks: JSON.parse(form.risk_checks),
        client_communication_templates: JSON.parse(form.client_communication_templates),
        guardrails: JSON.parse(form.guardrails),
        escalation_rules: JSON.parse(form.escalation_rules),
        approval_workflow: JSON.parse(form.approval_workflow),
        post_action_review_metrics: JSON.parse(form.post_action_review_metrics)
      }
      await playbookApi.create(payload)
      setMsg({ type: 'success', text: 'Playbook created successfully!' })
      setShowCreate(false)
      setForm({
        name: '',
        description: '',
        category: 'market_crash',
        trigger_conditions: '{}',
        actions: '[]',
        compliance_rules: '{}',
        impacted_portfolios_clients: '{}',
        risk_checks: '[]',
        client_communication_templates: '{}',
        guardrails: '{}',
        escalation_rules: '{}',
        approval_workflow: '[]',
        post_action_review_metrics: '[]'
      })
      await load()
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        setMsg({ type: 'error', text: `Syntax Error: Please verify all JSON fields are properly formatted. ${e.message}` })
      } else {
        setMsg({ type: 'error', text: e.response?.data?.detail || 'Failed to create playbook. Verify RiskOfficer / ComplianceHead permissions.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this playbook? This cannot be undone.')) return
    try {
      await playbookApi.delete(id)
      setSelected(null)
      setMsg({ type: 'success', text: 'Playbook deleted successfully!' })
      await load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Delete failed. Check role permissions.' })
    }
  }

  // Filter playbooks
  const filteredPlaybooks = activeCategoryFilter === 'all'
    ? playbooks
    : playbooks.filter(p => p.category === activeCategoryFilter)

  return (
    <AppLayout>
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', color: '#f8fafc' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.5rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem'
            }}>
              Playbook Studio
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
              Define, maintain, and execute structured Response Playbooks for different market volatility environments
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                setShowAIGen(!showAIGen)
                setShowCreate(false)
              }} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                background: showAIGen ? 'rgba(6, 182, 212, 0.2)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: showAIGen ? '1px solid #06b6d4' : '1px solid rgba(6, 182, 212, 0.3)',
                color: '#22d3ee',
                boxShadow: showAIGen ? '0 0 15px rgba(6, 182, 212, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🤖</span> AI Generate
            </button>
            <button 
              onClick={() => {
                setShowCreate(!showCreate)
                setShowAIGen(false)
              }} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                background: showCreate ? '#f43f5e' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              {showCreate ? '✕ Cancel' : '＋ New Playbook'}
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.25rem', 
          marginBottom: '2rem' 
        }}>
          {[
            { label: 'Total Structured Playbooks', value: totalCount, icon: '🛡️', color: '#3b82f6' },
            { label: 'Active Market Categories', value: uniqueCategories, icon: '📊', color: '#10b981' },
            { label: 'Avg Recommended Actions', value: `${avgActions} Steps`, icon: '⚡', color: '#8b5cf6' }
          ].map((stat, i) => (
            <div 
              key={i} 
              style={{
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginTop: '0.25rem' }}>
                  {stat.value}
                </div>
              </div>
              <div style={{
                fontSize: '24px',
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: `${stat.color}15`,
                border: `1px solid ${stat.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Global Notifications */}
        {msg.text && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
            color: msg.type === 'success' ? '#34d399' : '#fb7185',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{msg.text}</span>
            </div>
            <button 
              onClick={() => setMsg({ type: '', text: '' })} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* AI Generator Panel */}
        {showAIGen && (
          <div style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.45) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            borderTop: '3px solid #06b6d4',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>AI Playbook Generator</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '1.25rem' }}>
              Describe a custom macroeconomic scenario, asset correction trigger, or client event, and the AI agent will architect a complete institutional playbook.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., China-Taiwan trade escalation impacting semiconductor supply chain and chip manufacturing stocks, triggering severe tech drawdowns..."
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
                
                <button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  style={{
                    marginTop: '0.75rem',
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: aiPrompt.trim() ? 'pointer' : 'not-allowed',
                    opacity: aiPrompt.trim() && !aiGenerating ? 1 : 0.5,
                    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {aiGenerating ? '🤖 Orchestrating AI Architect...' : '🚀 Generate Playbook'}
                </button>
              </div>

              {/* Generating Loader */}
              {aiGenerating && (
                <div style={{
                  flex: 1,
                  minWidth: '300px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  justifyContent: 'center',
                  minHeight: '170px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#06b6d4' }}>Structuring Playbook</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[
                      { step: 1, label: 'Analyzing scenario parameters...' },
                      { step: 2, label: 'Identifying impacted asset classes...' },
                      { step: 3, label: 'Constructing risk checks & guardrails...' },
                      { step: 4, label: 'Drafting communication templates...' },
                      { step: 5, label: 'Finalizing playbook structure...' }
                    ].map((s) => (
                      <div key={s.step} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '11px',
                        color: genStep >= s.step ? '#34d399' : genStep === s.step - 1 ? '#06b6d4' : '#64748b',
                        fontWeight: genStep >= s.step ? 600 : 400,
                        transition: 'color 0.2s ease'
                      }}>
                        <span>{genStep >= s.step ? '●' : genStep === s.step - 1 ? '○' : '·'}</span>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Playbook Preview */}
              {generatedPlaybook && (
                <div style={{
                  flex: 1.5,
                  minWidth: '350px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}>
                  {/* Tabs */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {([
                      { id: 'overview', label: 'Overview' },
                      { id: 'risk', label: 'Risk & Guardrails' },
                      { id: 'actions', label: 'Actions' },
                      { id: 'communication', label: 'Communication' },
                      { id: 'workflow', label: 'Workflow' }
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setAiPreviewTab(tab.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: aiPreviewTab === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
                          color: aiPreviewTab === tab.id ? '#22d3ee' : '#94a3b8',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div style={{ padding: '1.25rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {aiPreviewTab === 'overview' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '20px' }}>
                            {CATEGORY_CONFIG[generatedPlaybook.category]?.icon || '📋'}
                          </span>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9' }}>{generatedPlaybook.name}</div>
                            <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem' }}>
                              {generatedPlaybook.category}
                            </div>
                          </div>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, marginBottom: '1rem' }}>
                          {generatedPlaybook.description}
                        </p>
                        
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Trigger Conditions</div>
                          {renderTriggerConditions(generatedPlaybook.trigger_conditions)}
                        </div>
                      </div>
                    )}

                    {aiPreviewTab === 'risk' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Risk Checks</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#64748b' }}>
                                <th style={{ paddingBottom: '0.4rem' }}>Audit Check</th>
                                <th style={{ paddingBottom: '0.4rem' }}>Threshold</th>
                                <th style={{ paddingBottom: '0.4rem' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(generatedPlaybook.risk_checks || []).map((rc: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '0.4rem 0', color: '#e2e8f0', fontWeight: 600 }}>{rc.check}</td>
                                  <td style={{ padding: '0.4rem 0', color: '#fb7185', fontFamily: 'JetBrains Mono' }}>{rc.threshold}</td>
                                  <td style={{ padding: '0.4rem 0' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                                      {rc.action}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Compliance Guardrails</div>
                          {renderGuardrails(generatedPlaybook.guardrails)}
                        </div>
                      </div>
                    )}

                    {aiPreviewTab === 'actions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Recommended Advisor Actions</div>
                        {(generatedPlaybook.actions || []).map((act: any, idx: number) => (
                          <div key={idx} style={{
                            background: 'rgba(139,92,246,0.05)',
                            border: '1px solid rgba(139,92,246,0.15)',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '11px'
                          }}>
                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>Step {act.step}: <span style={{ color: '#c084fc' }}>{act.action_type}</span></div>
                            {act.params && renderActionParams(act.params)}
                          </div>
                        ))}
                      </div>
                    )}

                    {aiPreviewTab === 'communication' && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#ec4899', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Client Outreach Template</div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px' }}>
                          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>
                            Subject: <span style={{ fontWeight: 400, color: '#f472b6' }}>{generatedPlaybook.client_communication_templates?.subject}</span>
                          </div>
                          <div style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                            {generatedPlaybook.client_communication_templates?.body}
                          </div>
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: '#94a3b8' }}>Tone:</span>
                            <span style={{ fontWeight: 700, color: '#f472b6' }}>{generatedPlaybook.client_communication_templates?.tone}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {aiPreviewTab === 'workflow' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Approval Workflow Hierarchy</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {(generatedPlaybook.approval_workflow || []).map((role: string, idx: number) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                  {role}
                                </span>
                                {idx < (generatedPlaybook.approval_workflow?.length - 1) && <span style={{ color: '#64748b' }}>➔</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Post-Action KPIs</div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#64748b' }}>
                                <th style={{ paddingBottom: '0.4rem' }}>Metric</th>
                                <th style={{ paddingBottom: '0.4rem' }}>Target</th>
                                <th style={{ paddingBottom: '0.4rem' }}>Window</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(generatedPlaybook.post_action_review_metrics || []).map((met: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '0.4rem 0', color: '#e2e8f0' }}>{met.metric}</td>
                                  <td style={{ padding: '0.4rem 0', color: '#10b981', fontWeight: 700 }}>{met.target}</td>
                                  <td style={{ padding: '0.4rem 0', color: '#94a3b8' }}>{met.window_days} Days</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(15, 23, 42, 0.8)',
                    padding: '0.75rem 1.25rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    justifyContent: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => setGeneratedPlaybook(null)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSaveAIGenerated}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(16,185,129,0.25)'
                      }}
                    >
                      💾 Save to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Create Form */}
        {showCreate && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              📝 Create New Playbook Manually
            </h3>
            
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Name *</label>
                <input className="input-field" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Severe Sovereign Credit Downgrade" />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Category *</label>
                <select 
                  className="input-field" 
                  value={form.category} 
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ background: 'rgba(15,23,42,0.8)', color: '#f8fafc', width: '100%', padding: '0.45rem' }}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Description</label>
                <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary of the playbook scenario scope..." />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Trigger Conditions (JSON)</label>
                <textarea className="input-field" rows={5} value={form.trigger_conditions} onChange={e => setForm(f => ({ ...f, trigger_conditions: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Impacted Portfolios & Clients (JSON)</label>
                <textarea className="input-field" rows={5} value={form.impacted_portfolios_clients} onChange={e => setForm(f => ({ ...f, impacted_portfolios_clients: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Risk Checks (JSON Array)</label>
                <textarea className="input-field" rows={5} value={form.risk_checks} onChange={e => setForm(f => ({ ...f, risk_checks: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Recommended Advisor Actions (JSON Array)</label>
                <textarea className="input-field" rows={5} value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Client Communication Templates (JSON)</label>
                <textarea className="input-field" rows={5} value={form.client_communication_templates} onChange={e => setForm(f => ({ ...f, client_communication_templates: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Compliance Guardrails (JSON)</label>
                <textarea className="input-field" rows={5} value={form.guardrails} onChange={e => setForm(f => ({ ...f, guardrails: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Escalation Rules (JSON)</label>
                <textarea className="input-field" rows={4} value={form.escalation_rules} onChange={e => setForm(f => ({ ...f, escalation_rules: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Approval Workflow (JSON Array)</label>
                <textarea className="input-field" rows={4} value={form.approval_workflow} onChange={e => setForm(f => ({ ...f, approval_workflow: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Post Action Review Metrics (JSON Array)</label>
                <textarea className="input-field" rows={4} value={form.post_action_review_metrics} onChange={e => setForm(f => ({ ...f, post_action_review_metrics: e.target.value }))} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', resize: 'vertical' }} />
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', border: 'none' }}>
                  {saving ? 'Creating...' : '💾 Save Playbook'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Grid Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Category Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeCategoryFilter === 'all' ? '#06b6d4' : 'rgba(15,23,42,0.4)',
                border: activeCategoryFilter === 'all' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.06)',
                color: activeCategoryFilter === 'all' ? '#ffffff' : '#94a3b8',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              All Scenarios
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setActiveCategoryFilter(k)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeCategoryFilter === k ? v.color : 'rgba(15,23,42,0.4)',
                  border: activeCategoryFilter === k ? `1px solid ${v.color}` : '1px solid rgba(255,255,255,0.06)',
                  color: activeCategoryFilter === k ? '#ffffff' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 480px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Library Grid */}
            <div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px' }} />
                </div>
              ) : filteredPlaybooks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '5rem 2rem', 
                  color: '#64748b', 
                  border: '1px dashed rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  background: 'rgba(15,23,42,0.2)'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🛡️</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>No Playbooks Seeding This Category</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '0.25rem' }}>Create one manually or let AI architect a fresh playbook.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {filteredPlaybooks.map((p: any) => {
                    const cfg = CATEGORY_CONFIG[p.category] || { icon: '📋', color: '#64748b', label: 'Custom' }
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelected(selected?.id === p.id ? null : p)
                          setDetailTab('triggers')
                        }}
                        style={{
                          cursor: 'pointer',
                          background: selected?.id === p.id ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.3)',
                          border: selected?.id === p.id ? `1px solid ${cfg.color}` : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          boxShadow: selected?.id === p.id ? `0 0 20px ${cfg.color}15` : '0 4px 15px rgba(0,0,0,0.1)',
                          transform: selected?.id === p.id ? 'translateY(-2px)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '24px' }}>{cfg.icon}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>#{p.id}</span>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                          {p.name}
                        </h4>
                        
                        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem', minHeight: '45px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                          {p.description || 'No description provided.'}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            color: cfg.color, 
                            background: `${cfg.color}10`, 
                            border: `1px solid ${cfg.color}25`,
                            padding: '0.2rem 0.45rem', 
                            borderRadius: '4px' 
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: 700, 
                            color: '#a78bfa', 
                            background: 'rgba(167,139,250,0.1)', 
                            border: '1px solid rgba(167,139,250,0.2)',
                            padding: '0.2rem 0.45rem', 
                            borderRadius: '4px' 
                          }}>
                            {(p.actions || []).length} Actions
                          </span>
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: 700, 
                            color: '#38bdf8', 
                            background: 'rgba(56,189,248,0.1)', 
                            border: '1px solid rgba(56,189,248,0.2)',
                            padding: '0.2rem 0.45rem', 
                            borderRadius: '4px' 
                          }}>
                            {(p.risk_checks || []).length} Checks
                          </span>
                          {p.compliance_rules?.requires_escalation && (
                            <span style={{ 
                              fontSize: '9px', 
                              fontWeight: 700, 
                              color: '#fbbf24', 
                              background: 'rgba(251,191,36,0.1)', 
                              border: '1px solid rgba(251,191,36,0.2)',
                              padding: '0.2rem 0.45rem', 
                              borderRadius: '4px' 
                            }}>
                              Escalation Required
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Playbook Detail Panel Drawer */}
            {selected && (() => {
              const cfg = CATEGORY_CONFIG[selected.category] || { icon: '📋', color: '#64748b', label: 'Custom' }
              return (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderTop: `3px solid ${cfg.color}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                  position: 'sticky',
                  top: '1.5rem',
                  overflow: 'hidden'
                }}>
                  {/* Drawer Header */}
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '24px' }}>{cfg.icon}</span>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Playbook Inspector</h4>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelected(null)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#64748b', 
                        cursor: 'pointer', 
                        fontSize: '18px',
                        padding: '0.25rem',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', lineHeight: 1.3 }}>{selected.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, marginBottom: '1.25rem' }}>{selected.description || 'No description provided.'}</p>
                  </div>

                  {/* Tabs */}
                  <div style={{ 
                    display: 'flex', 
                    background: 'rgba(0,0,0,0.15)', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '0 0.5rem'
                  }}>
                    {([
                      { id: 'triggers', label: '⚡ Triggers' },
                      { id: 'risk', label: '🛡️ Risk & Limits' },
                      { id: 'actions', label: '📝 Actions' },
                      { id: 'communication', label: '✉️ Client Notice' },
                      { id: 'workflow', label: '🔔 Workflow' }
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setDetailTab(tab.id)}
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.25rem',
                          background: 'none',
                          border: 'none',
                          borderBottom: detailTab === tab.id ? `2px solid ${cfg.color}` : '2px solid transparent',
                          color: detailTab === tab.id ? '#ffffff' : '#64748b',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Detailed Tab Context */}
                  <div style={{ padding: '1.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                    {detailTab === 'triggers' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Trigger Conditions Rules</div>
                          {renderTriggerConditions(selected.trigger_conditions)}
                        </div>
                        
                        {selected.impacted_portfolios_clients && (
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Impacted Portfolios Target Scope</div>
                            {renderImpactedScope(selected.impacted_portfolios_clients)}
                          </div>
                        )}
                      </div>
                    )}

                    {detailTab === 'risk' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Risk Checks</div>
                          {selected.risk_checks && selected.risk_checks.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#64748b' }}>
                                  <th style={{ paddingBottom: '0.5rem' }}>Check Name</th>
                                  <th style={{ paddingBottom: '0.5rem' }}>Limit Threshold</th>
                                  <th style={{ paddingBottom: '0.5rem' }}>Action Response</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selected.risk_checks.map((rc: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.5rem 0', color: '#e2e8f0', fontWeight: 600 }}>{rc.check}</td>
                                    <td style={{ padding: '0.5rem 0', color: '#fb7185', fontFamily: 'JetBrains Mono' }}>{rc.threshold}</td>
                                    <td style={{ padding: '0.5rem 0' }}>
                                      <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                                        {rc.action}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No custom risk checks defined.</div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Compliance Guardrails & Limits</div>
                          {renderGuardrails(selected.guardrails)}
                        </div>
                      </div>
                    )}

                    {detailTab === 'actions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Step-by-Step Actions</div>
                        {(selected.actions || []).map((action: any, i: number) => (
                          <div key={i} style={{ 
                            padding: '0.75rem', 
                            background: 'rgba(15,23,42,0.3)', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(255,255,255,0.06)', 
                            fontSize: '12px' 
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#ffffff' }}>
                              Step {action.step}: <span style={{ color: cfg.color }}>{action.action_type}</span>
                            </div>
                            {action.params && renderActionParams(action.params)}
                          </div>
                        ))}
                      </div>
                    )}

                    {detailTab === 'communication' && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Client Communication Alert Draft</div>
                        {selected.client_communication_templates && selected.client_communication_templates.body ? (
                          <div style={{ 
                            background: 'rgba(15,23,42,0.3)', 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(255,255,255,0.06)', 
                            fontSize: '11px' 
                          }}>
                            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
                              Subject: <span style={{ fontWeight: 400, color: '#f472b6' }}>{selected.client_communication_templates.subject}</span>
                            </div>
                            <div style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                              {selected.client_communication_templates.body}
                            </div>
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>Tonal Guidance:</span>
                              <span style={{ 
                                fontSize: '9px', 
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                color: '#ec4899', 
                                background: 'rgba(236,72,153,0.1)', 
                                padding: '0.15rem 0.35rem', 
                                borderRadius: '4px' 
                              }}>
                                {selected.client_communication_templates.tone || 'Professional'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No communication template drafted for this playbook.</div>
                        )}
                      </div>
                    )}

                    {detailTab === 'workflow' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Escalation & Approvals Hierarchy</div>
                          {selected.approval_workflow && selected.approval_workflow.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {selected.approval_workflow.map((role: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ 
                                    fontSize: '10px', 
                                    fontWeight: 700, 
                                    background: 'rgba(16,185,129,0.1)', 
                                    border: '1px solid rgba(16,185,129,0.2)', 
                                    color: '#34d399', 
                                    padding: '0.25rem 0.6rem', 
                                    borderRadius: '6px' 
                                  }}>
                                    {role}
                                  </span>
                                  {idx < (selected.approval_workflow.length - 1) && <span style={{ color: '#64748b', fontSize: '12px' }}>➔</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No approval hierarchy defined. Standard levels apply.</div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Post-Action Review Metrics (KPIs)</div>
                          {selected.post_action_review_metrics && selected.post_action_review_metrics.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: '#64748b' }}>
                                  <th style={{ paddingBottom: '0.5rem' }}>Metric KPI</th>
                                  <th style={{ paddingBottom: '0.5rem' }}>Target</th>
                                  <th style={{ paddingBottom: '0.5rem' }}>Window</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selected.post_action_review_metrics.map((met: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '0.5rem 0', color: '#e2e8f0' }}>{met.metric}</td>
                                    <td style={{ padding: '0.5rem 0', color: '#10b981', fontWeight: 700 }}>{met.target}</td>
                                    <td style={{ padding: '0.5rem 0', color: '#94a3b8' }}>{met.window_days} Days</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No post-action metrics defined.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer Actions */}
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'rgba(0,0,0,0.15)',
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <button 
                      onClick={() => handleDelete(selected.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        color: '#fb7185',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f43f5e'
                        e.currentTarget.style.color = '#ffffff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244,63,94,0.1)'
                        e.currentTarget.style.color = '#fb7185'
                      }}
                    >
                      🗑️ Delete Playbook
                    </button>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>ID: {selected.id}</span>
                  </div>
                </div>
              )
            })()}

          </div>
        </div>

      </div>
    </AppLayout>
  )
}
