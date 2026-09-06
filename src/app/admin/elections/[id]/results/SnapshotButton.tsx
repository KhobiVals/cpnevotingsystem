'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function SnapshotButton({ electionId }: { electionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSnapshot() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/elections/${electionId}/results/snapshot`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Snapshot failed')
      } else {
        router.refresh()
      }
    } catch (e: any) {
      alert(e.message || 'Snapshot error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSnapshot}
      disabled={loading}
      className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'Calculating...' : 'Take Live Snapshot'}</span>
    </button>
  )
}
