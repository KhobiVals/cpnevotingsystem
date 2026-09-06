import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, BarChart3, RefreshCw, Award, CheckCircle2, ShieldAlert } from 'lucide-react'
import SnapshotButton from './SnapshotButton'

export const revalidate = 0

export default async function AdminResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: election } = await supabase.from('elections').select('*').eq('id', id).single()

  if (!election) notFound()

  // Positions
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .eq('election_id', id)
    .order('sort_order', { ascending: true })

  // Latest Snapshots
  const { data: snapshots } = await supabase
    .from('result_snapshots')
    .select('*')
    .eq('election_id', id)

  const resultData = (positions || []).map((pos) => {
    const posSnapshots = (snapshots || []).filter((s) => s.position_id === pos.id)
    const totalPosVotes = posSnapshots.reduce((acc, curr) => acc + (curr.vote_count || 0), 0)

    posSnapshots.sort((a, b) => b.vote_count - a.vote_count)

    return {
      position: pos,
      candidates: posSnapshots,
      totalVotes: totalPosVotes,
    }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link
          href={`/admin/elections/${id}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Election Overview
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Live Results &amp; Snapshot Control
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time vote tallies, snapshot generation &amp; declaration readiness
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SnapshotButton electionId={id} />
            <Link
              href={`/returning-officer/declare/${id}`}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Award className="w-4 h-4" /> Returning Officer Declaration
            </Link>
          </div>
        </div>
      </div>

      {/* Positional Live Tally */}
      <div className="space-y-6">
        {resultData.map(({ position, candidates, totalVotes }) => (
          <div key={position.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white">{position.title}</h2>
              <span className="text-xs text-slate-400 font-medium">{totalVotes} Total Votes</span>
            </div>

            {candidates.length > 0 ? (
              <div className="space-y-3">
                {candidates.map((cand) => {
                  const pct = totalVotes > 0 ? ((cand.vote_count / totalVotes) * 100).toFixed(1) : '0.0'
                  return (
                    <div
                      key={cand.candidate_id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="font-bold text-white">{cand.candidate_name}</span>
                        <span className="font-mono text-slate-300">
                          {cand.vote_count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No snapshot calculated yet. Click &quot;Take Live Snapshot&quot; above.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
