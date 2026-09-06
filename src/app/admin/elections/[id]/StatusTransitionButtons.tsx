'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Square, CheckCircle2, Archive, RefreshCw } from 'lucide-react'

interface Props {
  electionId: string
  currentStatus: string
}

export default function StatusTransitionButtons({ electionId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(nextStatus: string) {
    if (!confirm(`Are you sure you want to transition election status to "${nextStatus.replace('_', ' ')}"?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/elections/${electionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to update status')
      } else {
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus === 'draft' && (
        <button
          onClick={() => handleStatusChange('scheduled')}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" /> Schedule Election
        </button>
      )}

      {(currentStatus === 'draft' || currentStatus === 'scheduled') && (
        <button
          onClick={() => handleStatusChange('open')}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" /> Open Voting Now
        </button>
      )}

      {currentStatus === 'open' && (
        <button
          onClick={() => handleStatusChange('closed')}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Square className="w-3.5 h-3.5" /> Close Voting
        </button>
      )}

      {currentStatus === 'closed' && (
        <button
          onClick={() => handleStatusChange('under_review')}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Begin Agent Review
        </button>
      )}

      {currentStatus === 'under_review' && (
        <button
          onClick={() => handleStatusChange('awaiting_declaration')}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Submit to Returning Officer
        </button>
      )}
    </div>
  )
}
