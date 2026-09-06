'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Send, Users, CheckCircle2, AlertCircle } from 'lucide-react'

export default function VotersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [voters, setVoters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadVoters() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/elections/${id}/voters`)
      const data = await res.json()
      if (Array.isArray(data)) setVoters(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVoters()
  }, [id])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMsg(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/admin/elections/${id}/voters`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Import failed' })
      } else {
        setMsg({
          type: 'success',
          text: `Successfully imported ${data.importedCount} voters!`,
        })
        loadVoters()
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'File upload error' })
    } finally {
      setUploading(false)
    }
  }

  async function handleDispatchCredentials() {
    if (!confirm('Are you sure you want to generate and SMS credentials to ALL registered voters?')) {
      return
    }

    setDispatching(true)
    setMsg(null)

    try {
      const res = await fetch(`/api/admin/elections/${id}/voters/credentials`, {
        method: 'POST',
      })

      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Dispatch failed' })
      } else {
        setMsg({
          type: 'success',
          text: `Successfully dispatched credentials to ${data.count} voters via SMS!`,
        })
        loadVoters()
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Dispatch error' })
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link
          href={`/admin/elections/${id}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Election Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Voter Register &amp; Credentials</h1>
        <p className="text-xs text-slate-400 mt-1">
          Import voter rosters from Excel/CSV and dispatch voting PINs via Vistal SMS
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Register Actions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Bulk upload voters or trigger SMS dispatch</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{uploading ? 'Importing...' : 'Upload Excel / CSV'}</span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            onClick={handleDispatchCredentials}
            disabled={dispatching || voters.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{dispatching ? 'Sending SMS...' : 'Dispatch Credentials via SMS'}</span>
          </button>
        </div>
      </div>

      {/* Voters Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Voter Roster</h2>
          <span className="text-xs text-slate-400">{voters.length} Voters Listed</span>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Loading voters register...</p>
        ) : voters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Voting Status</th>
                  <th className="px-4 py-3 text-right">Credentials Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {voters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white">{voter.student_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{voter.full_name}</td>
                    <td className="px-4 py-3 font-mono">{voter.phone}</td>
                    <td className="px-4 py-3 text-slate-400">{voter.programme || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {voter.has_voted ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Voted
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                          Not Voted
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {voter.credentials_sent_at ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No voters imported for this election yet.</p>
        )}
      </div>
    </div>
  )
}
