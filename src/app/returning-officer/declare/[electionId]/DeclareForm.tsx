'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, CheckCircle2, Send } from 'lucide-react'

export default function DeclareForm({
  electionId,
  isAlreadyDeclared,
}: {
  electionId: string
  isAlreadyDeclared: boolean
}) {
  const router = useRouter()
  const [statement, setStatement] = useState(
    'I hereby certify and officially declare the results of this election to be valid, accurate, and final under the authority of the DESAG Electoral Commission.'
  )
  const [officerName, setOfficerName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (
      !confirm(
        'CRITICAL ACTION: Are you sure you want to officially DECLARE this election? This will publish the final certified results to the public portal.'
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/returning-officer/declare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId,
          declarationStatement: statement,
          officerName,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Declaration failed')
      } else {
        router.push(`/results/${electionId}`)
      }
    } catch (err: any) {
      alert(err.message || 'Error executing declaration')
    } finally {
      setLoading(false)
    }
  }

  if (isAlreadyDeclared) {
    return (
      <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
        <h3 className="text-lg font-bold">This Election Has Been Officially Declared</h3>
        <p className="text-xs text-slate-300">
          The certified results are publicly accessible on the Results Archive portal.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
        Official Declaration Certificate
      </h2>

      <div>
        <label className="block text-xs text-slate-300 font-semibold mb-1">Returning Officer Full Name *</label>
        <input
          type="text"
          required
          value={officerName}
          onChange={(e) => setOfficerName(e.target.value)}
          placeholder="e.g. Dr. Kwaku Bediako"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-300 font-semibold mb-1">Official Declaration Statement *</label>
        <textarea
          rows={4}
          required
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
      >
        <Award className="w-4 h-4" />
        <span>{loading ? 'Signing & Publishing...' : 'Sign Certificate & Officially Declare Election'}</span>
      </button>
    </form>
  )
}
