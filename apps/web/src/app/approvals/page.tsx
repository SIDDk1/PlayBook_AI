'use client'
import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import { approvalApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export default function ApprovalsPage() {
  const { user } = useAuthStore()
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [comment, setComment] = useState<Record<number, string>>({})
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [filter, setFilter] = useState('Pending')

  const load = async () => {
    try {
      const { data } = await approvalApi.pending()
      setApprovals(data)
    } catch (e: any) {
      // User may have no pending approvals
      setApprovals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const doAction = async (id: number, action: 'Approved' | 'Rejected') => {
    setActionId(id)
    setMsg({ type: '', text: '' })
    try {
      await approvalApi.action(id, action, comment[id])
      setMsg({ type: 'success', text: `Workflow ${action === 'Approved' ? '✅ approved' : '❌ rejected'} successfully.` })
      setApprovals(prev => prev.filter(a => a.id !== id))
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Action failed. Ensure you have the correct role.' })
    } finally {
      setActionId(null)
    }
  }

  const roleInfo: Record<string, { icon: string; color: string; desc: string }> = {
    RelationshipManager: { icon: '👤', color: '#06b6d4', desc: 'Client-facing final action' },
    RiskOfficer: { icon: '⚡', color: '#f59e0b', desc: 'Risk & exposure review' },
    ComplianceHead: { icon: '🛡️', color: '#8b5cf6', desc: 'Regulatory clearance' },
  }

  const currentRoleInfo = roleInfo[user?.role?.name || '']

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Approvals Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Review and action pending workflow approvals for your role
            </p>
          </div>
          <button onClick={load} className="btn-secondary">↻ Refresh</button>
        </div>

        {/* Role context */}
        {currentRoleInfo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '0.875rem 1.25rem',
            background: `rgba(${currentRoleInfo.color === '#06b6d4' ? '6,182,212' : currentRoleInfo.color === '#f59e0b' ? '245,158,11' : '139,92,246'},0.08)`,
            border: `1px solid ${currentRoleInfo.color}30`,
            borderRadius: '10px',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: '24px' }}>{currentRoleInfo.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: currentRoleInfo.color }}>{user?.role?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Approvals assigned to your role: {currentRoleInfo.desc}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.375rem 0.875rem',
                background: `rgba(${currentRoleInfo.color === '#06b6d4' ? '6,182,212' : currentRoleInfo.color === '#f59e0b' ? '245,158,11' : '139,92,246'},0.15)`,
                borderRadius: '999px',
                fontSize: '14px', fontWeight: 800, color: currentRoleInfo.color,
              }}>
                {approvals.length} pending
              </div>
            </div>
          </div>
        )}

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

        {/* Workflow approval process diagram */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Approval Chain</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { role: 'RelationshipManager', icon: '👤', color: '#06b6d4' },
              { label: '→', isArrow: true },
              { role: 'RiskOfficer', icon: '⚡', color: '#f59e0b' },
              { label: '→', isArrow: true },
              { role: 'ComplianceHead', icon: '🛡️', color: '#8b5cf6' },
              { label: '→', isArrow: true },
              { role: 'Execution', icon: '✅', color: '#10b981' },
            ].map((item: any, i) => (
              item.isArrow ? (
                <span key={i} style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
              ) : (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '8px',
                  background: user?.role?.name === item.role ? `rgba(${item.color === '#06b6d4' ? '6,182,212' : item.color === '#f59e0b' ? '245,158,11' : item.color === '#8b5cf6' ? '139,92,246' : '16,185,129'},0.12)` : 'rgba(15,23,42,0.5)',
                  border: `1px solid ${user?.role?.name === item.role ? item.color + '40' : 'var(--border-color)'}`,
                  fontSize: '13px',
                  fontWeight: user?.role?.name === item.role ? 700 : 500,
                  color: user?.role?.name === item.role ? item.color : 'var(--text-secondary)',
                }}>
                  <span>{item.icon}</span> {item.role}
                  {user?.role?.name === item.role && <span style={{ fontSize: '10px', fontWeight: 700, color: item.color }}>← YOU</span>}
                </div>
              )
            ))}
          </div>
        </div>

        {/* Pending approvals */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : approvals.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '0.5rem' }}>All Clear!</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              No pending approvals for your role ({user?.role?.name}).
              <br />Trigger a scenario from the <a href="/ai-copilot" style={{ color: 'var(--accent-cyan)' }}>AI Copilot</a> to generate approval workflows.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {approvals.map((a: any) => (
              <div key={a.id} className="card" style={{
                borderLeft: '3px solid rgba(139,92,246,0.5)',
                background: 'rgba(139,92,246,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge badge-pending">Pending</span>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>Workflow #{a.workflow_id}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Requires approval from: <strong style={{ color: '#a78bfa' }}>{a.approver_role}</strong>
                    </div>
                    {a.actioned_at && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Submitted: {new Date(a.actioned_at).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '280px' }}>
                    <textarea
                      className="input-field"
                      placeholder="Add a comment (optional)..."
                      value={comment[a.id] || ''}
                      onChange={e => setComment(c => ({ ...c, [a.id]: e.target.value }))}
                      style={{ minHeight: '60px', resize: 'none', fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-success"
                        onClick={() => doAction(a.id, 'Approved')}
                        disabled={actionId === a.id}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {actionId === a.id ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '✅'} Approve
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => doAction(a.id, 'Rejected')}
                        disabled={actionId === a.id}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        {actionId === a.id ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '❌'} Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="card" style={{ marginTop: '1.5rem', background: 'rgba(15,23,42,0.5)' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '0.75rem', color: '#22d3ee' }}>📖 How approvals work</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { icon: '⚡', title: 'Scenario Triggered', desc: 'A market event is submitted and the AI pipeline runs analysis' },
              { icon: '🤖', title: 'AI Recommends', desc: 'The Escalation Agent determines which roles must approve the playbook execution' },
              { icon: '✅', title: 'Chain Approval', desc: 'Each role in sequence approves. Final approval triggers communication sending' },
            ].map(item => (
              <div key={item.title} style={{ padding: '0.875rem', background: 'rgba(6,182,212,0.05)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.12)' }}>
                <div style={{ fontSize: '20px', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
