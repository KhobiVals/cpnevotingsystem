'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, UserCheck, Award } from 'lucide-react'

export default function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [candidates, setCandidates] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [positionId, setPositionId] = useState('')
  const [fullName, setFullName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [slogan, setSlogan] = useState('')
  const [manifesto, setManifesto] = useState('')

  async function loadData() {
    setLoading(true)
    try {
      const [cRes, pRes] = await Promise.all([
        fetch(`/api/admin/elections/${id}/candidates`),
        fetch(`/api/admin/elections/${id}/positions`),
      ])

      const [cData, pData] = await Promise.all([cRes.json(), pRes.json()])
      if (Array.isArray(cData)) setCandidates(cData)
      if (Array.isArray(pData)) {
        setPositions(pData)
        if (pData.length > 0 && !positionId) {
          setPositionId(pData[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!positionId || !fullName.trim()) return

    setCreating(true)
    try {
      const res = await fetch(`/api/admin/elections/${id}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: positionId,
          full_name: fullName,
          photo_url: photoUrl,
          slogan,
          manifesto_summary: manifesto,
        }),
      })

      if (res.ok) {
        setFullName('')
        setPhotoUrl('')
        setSlogan('')
        setManifesto('')
        loadData()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href={`/admin/elections/${id}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Election Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Candidate Nomination</h1>
        <p className="text-xs text-slate-400 mt-1">Register candidates for contested executive offices</p>
      </div>

      {/* Add Candidate Form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nominate Candidate</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Executive Position *</label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Candidate Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John K. Mensah"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Campaign Slogan / Motto</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder='e.g. "Integrity & Progress for All"'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Photo Image URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/candidate-photo.jpg"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Manifesto Summary</label>
          <textarea
            rows={2}
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
            placeholder="Key campaign promises..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </form>

      {/* Candidates List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Registered Candidates</h2>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading candidates...</p>
        ) : candidates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 text-sm shrink-0">
                  {cand.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cand.photo_url} alt={cand.full_name} className="w-full h-full object-cover" />
                  ) : (
                    cand.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-400">
                    {cand.positions?.title || 'Position'}
                  </div>
                  <div className="font-bold text-white text-sm">{cand.full_name}</div>
                  {cand.slogan && <div className="text-xs text-slate-400 italic">&quot;{cand.slogan}&quot;</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No candidates nominated yet.</p>
        )}
      </div>
    </div>
  )
}
