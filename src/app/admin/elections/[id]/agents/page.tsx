'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserCheck, ShieldCheck, Plus } from 'lucide-react'

export default function AgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [agents, setAgents] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [aRes, cRes] = await Promise.all([
        fetch(`/api/admin/elections/${id}/agents`),
        fetch(`/api/admin/elections/${id}/candidates`),
      ])

      const [aData, cData] = await Promise.all([aRes.json(), cRes.json()])
      if (Array.isArray(aData)) setAgents(aData)
      if (Array.isArray(cData)) setCandidates(cData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href={`/admin/elections/${id}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Election Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidate Polling Agents</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor designated candidate polling agents, review statuses, and filed objections
        </p>
      </div>

      {/* Agents Roster */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Designated Agents</h2>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading agents roster...</p>
        ) : agents.length > 0 ? (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {agent.profiles?.full_name || agent.profiles?.email || 'Agent User'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Representing: <span className="text-blue-400 font-semibold">{agent.candidates?.full_name}</span>
                    </div>
                  </div>
                </div>

                <span className="capitalize text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Review: {agent.review_status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No candidate agents assigned yet.</p>
        )}
      </div>
    </div>
  )
}
