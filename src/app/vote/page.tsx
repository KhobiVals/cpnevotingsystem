'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Vote, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react'

export default function VoterLoginPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [credential, setCredential] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/vote/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, credential }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      router.push(`/vote/${data.electionId}/ballot`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full fixed top-0 left-0"></div>

      <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-amber-400/40">
            <Vote className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-blue-950 tracking-tight">DESAG Voter Login</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">Official Distance Education Electoral Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              Student ID / Index Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 202410987"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              SMS Voting Passcode / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="Sent via SMS"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 group border-b-4 border-blue-950 mt-2"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Access Official Ballot</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/" className="text-xs text-slate-600 hover:text-blue-900 font-bold transition-colors">
            &larr; Return to Home Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
