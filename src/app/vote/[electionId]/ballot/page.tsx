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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-slate-400">Loading Official Ballot...</p>
        </div>
      </div>
    )
  }

  const selectedCount = Object.keys(selections).length
  const totalPositions = positions.length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Sticky Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">{electionTitle || 'DESAG Election'}</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Anonymous Secret Ballot
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Selections: <span className="font-bold text-white">{selectedCount}</span> / {totalPositions}
          </div>
        </div>
      </header>

      {/* Main Ballot Body */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-10">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {positions.map((pos) => {
          const posCandidates = candidates.filter((c) => c.position_id === pos.id)
          const selectedCandId = selections[pos.id]

          return (
            <div key={pos.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">{pos.title}</h2>
                {pos.description && <p className="text-xs text-slate-400 mt-1">{pos.description}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {posCandidates.map((cand) => {
                  const isSelected = selectedCandId === cand.id
                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleSelect(pos.id, cand.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 text-sm shrink-0">
                        {cand.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cand.photo_url} alt={cand.full_name} className="w-full h-full object-cover" />
                        ) : (
                          cand.full_name.charAt(0)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-sm">{cand.full_name}</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                              isSelected
                                ? 'border-blue-500 bg-blue-600 text-white'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {cand.slogan && (
                          <div className="text-xs text-slate-400 italic mt-1">&quot;{cand.slogan}&quot;</div>
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

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md py-4 px-4 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Review choices carefully before final submission.
          </span>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={selectedCount === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Cast &amp; Lock Ballot</span>
          </button>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
              <Vote className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white text-center">Confirm Ballot Submission</h3>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              You are about to permanently cast your choices for {selectedCount} office(s). Once submitted, your vote cannot be altered or undone.
            </p>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="w-1/2 py-3 rounded-xl border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Review Ballot
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="w-1/2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
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
