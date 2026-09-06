'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Vote, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react'

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
        throw new Error(data.error || 'Login failed. Please check your Index Number and Passcode.')
      }

      router.push(`/vote/${data.electionId}/ballot`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4 font-sans relative">
      {/* Top School Ribbon Accent: Red, Yellow, Blue */}
      <div className="h-2.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full fixed top-0 left-0 z-20"></div>

      <div className="w-full max-w-md bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-xl relative z-10 my-8 border-t-8 border-t-blue-700">
        {/* Cute Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-amber-400/50">
            <Vote className="w-10 h-10 text-amber-300" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Official Voting Portal
          </span>
          <h1 className="text-2xl font-black text-blue-950 tracking-tight">CPN E-VOTE SYSTEM</h1>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            Distance Education Electoral Commission
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              Index Number / Student ID
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-blue-700 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 202410987"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:bg-white transition-all font-mono shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              SMS Voting Passcode / PIN
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-blue-700 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="Enter 6-digit SMS PIN"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:bg-white transition-all font-mono shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 group border-b-4 border-blue-950 mt-4 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Voter...</span>
            ) : (
              <>
                <span>Enter Voting Portal</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
          <Link href="/admin/login" className="hover:text-blue-900 transition-colors">
            Commission Admin &rarr;
          </Link>
          <Link href="/agent/login" className="hover:text-blue-900 transition-colors">
            Polling Agents &rarr;
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 font-bold mt-4">
        CPN Electoral Commission &copy; {new Date().getFullYear()} — All Rights Reserved
      </footer>
    </div>
  )
}
