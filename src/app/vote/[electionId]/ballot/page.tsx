'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Vote, CheckCircle2, ShieldCheck, AlertTriangle, ArrowRight, Lock } from 'lucide-react'

export default function VoterBallotPage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = use(params)
  const router = useRouter()

  const [positions, setPositions] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [electionTitle, setElectionTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBallot() {
      try {
        const [pRes, cRes, eRes] = await Promise.all([
          fetch(`/api/admin/elections/${electionId}/positions`),
          fetch(`/api/admin/elections/${electionId}/candidates`),
          fetch(`/api/admin/elections/${electionId}`),
        ])

        const [pData, cData, eData] = await Promise.all([pRes.json(), cRes.json(), eRes.json()])

        if (Array.isArray(pData)) setPositions(pData)
        if (Array.isArray(cData)) setCandidates(cData)
        if (eData?.title) setElectionTitle(eData.title)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadBallot()
  }, [electionId])

  function handleSelect(positionId: string, candidateId: string) {
    setSelections((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }))
  }

  async function handleFinalSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/vote/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Vote submission failed')
      }

      router.push(`/vote/${electionId}/confirmed?ref=${encodeURIComponent(data.referenceCode)}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-700 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-blue-950">Loading Official Ballot...</p>
        </div>
      </div>
    )
  }

  const selectedCount = Object.keys(selections).length
  const totalPositions = positions.length

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans pb-28">
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full fixed top-0 left-0 z-30"></div>

      {/* Sticky Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm mt-1.5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Vote className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-blue-950 block">{electionTitle || 'DESAG Election'}</span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Secret Ballot Protected
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            Selections: <span className="font-extrabold text-blue-950">{selectedCount}</span> / {totalPositions}
          </div>
        </div>
      </header>

      {/* Main Ballot Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-10">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {positions.map((pos) => {
          const posCandidates = candidates.filter((c) => c.position_id === pos.id)
          const selectedCandId = selections[pos.id]

          return (
            <div key={pos.id} className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-6 shadow-sm border-t-4 border-t-blue-700">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-blue-950">{pos.title}</h2>
                {pos.description && <p className="text-xs text-slate-500 font-medium mt-1">{pos.description}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {posCandidates.map((cand) => {
                  const isSelected = selectedCandId === cand.id
                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleSelect(pos.id, cand.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/80 shadow-md ring-2 ring-blue-700/20'
                          : 'border-slate-200 bg-slate-50/50 hover:border-blue-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                        {cand.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cand.photo_url} alt={cand.full_name} className="w-full h-full object-cover" />
                        ) : (
                          cand.full_name.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-blue-950 text-sm">{cand.full_name}</span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                              isSelected
                                ? 'border-blue-700 bg-blue-700 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                          </div>
                        </div>

                        {cand.slogan && (
                          <div className="text-xs text-slate-600 font-medium italic mt-1">&quot;{cand.slogan}&quot;</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </main>

      {/* Action Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white py-4 px-4 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Review choices carefully before final submission.
          </span>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={selectedCount === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-700/25 flex items-center justify-center gap-2 border-b-4 border-blue-950"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>Cast &amp; Lock Ballot</span>
          </button>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto ring-4 ring-amber-400/40">
              <Vote className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-blue-950 text-center">Confirm Official Ballot Submission</h3>
            <p className="text-xs text-slate-600 text-center leading-relaxed font-medium">
              You are about to permanently cast your choices for {selectedCount} office(s). Once submitted, your vote cannot be altered or undone.
            </p>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="w-1/2 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Review Ballot
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="w-1/2 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Encrypting & Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
