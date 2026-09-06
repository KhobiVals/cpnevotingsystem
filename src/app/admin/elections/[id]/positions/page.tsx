'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Layers } from 'lucide-react'

export default function PositionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState(0)

  async function loadPositions() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/elections/${id}/positions`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPositions(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPositions()
  }, [id])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setCreating(true)
    try {
      const res = await fetch(`/api/admin/elections/${id}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          sort_order: sortOrder,
        }),
      })

      if (res.ok) {
        setTitle('')
        setDescription('')
        setSortOrder(positions.length + 1)
        loadPositions()
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Positions</h1>
        <p className="text-xs text-slate-400 mt-1">Configure position titles and order of appearance on ballot</p>
      </div>

      {/* Add Position Form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Add New Position</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. President, Vice President, General Secretary"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Display Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief instructions or eligibility criteria..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Position
          </button>
        </div>
      </form>

      {/* Positions List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Configured Positions</h2>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading positions...</p>
        ) : positions.length > 0 ? (
          <div className="space-y-3">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {pos.sort_order}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{pos.title}</div>
                    {pos.description && <div className="text-xs text-slate-400">{pos.description}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No positions configured yet.</p>
        )}
      </div>
    </div>
  )
}
