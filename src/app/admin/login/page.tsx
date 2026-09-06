'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Vote, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react'
import { loginAdmin } from './actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await loginAdmin(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 font-sans relative">
      <div className="h-2.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full fixed top-0 left-0 z-20"></div>

      <div className="w-full max-w-md bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-xl relative z-10 my-8 border-t-8 border-t-blue-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-amber-400/50">
            <Vote className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-blue-950 tracking-tight">CPN E-VOTE SYSTEM</h1>
          <p className="text-xs text-slate-500 mt-1 font-bold">
            Electoral Administration Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-blue-700 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@cpnevote.org"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wider mb-2">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-blue-700 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-slate-900 font-extrabold placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:bg-white transition-all shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 group border-b-4 border-blue-950 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-amber-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/vote" className="text-xs text-slate-500 hover:text-blue-950 font-bold transition-colors">
            &larr; Back to Voter Login
          </Link>
        </div>
      </div>
    </div>
  )
}
