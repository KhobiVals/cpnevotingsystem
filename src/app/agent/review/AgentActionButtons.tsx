'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react'

export default function AgentActionButtons({
  agentId,
  currentStatus,
}: {
  agentId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showObjectionForm, setShowObjectionForm] = useState(false)
  const [category, setCategory] = useState('tally_discrepancy')
  const [reason, setReason] = useState('')

  async function handleAccept() {
    if (!confirm('Are you sure you want to formally ACCEPT these election results?')) return

    setLoading(true)
    try {
      const res = await fetch('/api/agent/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action: 'accept' }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Action failed')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleObjectionSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/agent/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action: 'object', category, reason }),
      })

      if (res.ok) {
        setShowObjectionForm(false)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Objection failed')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
      <h2 className="text-base font-bold text-white">Agent Verification Decision</h2>

      {currentStatus === 'accepted' ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> You have accepted and verified these election results.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Accept &amp; Endorse Results
            </button>

            <button
              onClick={() => setShowObjectionForm(!showObjectionForm)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <AlertTriangle className="w-4 h-4" /> File Formal Objection
            </button>
          </div>

          {showObjectionForm && (
            <form onSubmit={handleObjectionSubmit} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Objection Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="tally_discrepancy">Tally / Vote Count Discrepancy</option>
                  <option value="voter_impersonation">Suspected Impersonation</option>
                  <option value="procedural_violation">Procedural Violation</option>
                  <option value="system_glitch">Technical / System Anomaly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Explanation / Evidence</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide specific details regarding your objection..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Objection
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
