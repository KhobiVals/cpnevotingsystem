import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, CheckCircle2, ArrowLeft, ShieldCheck, Users, BarChart2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function PublicElectionResultDetailPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const supabase = await createClient()

  // Fetch declared election
  const { data: election } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .eq('status', 'declared')
    .single()

  if (!election) {
    notFound()
  }

  // Fetch positions for this election
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .eq('election_id', electionId)
    .order('sort_order', { ascending: true })

  // Fetch latest snapshot results for this election
  const { data: snapshots } = await supabase
    .from('result_snapshots')
    .select('*')
    .eq('election_id', electionId)

  // Build structured breakdown per position
  const resultData = (positions || []).map((pos) => {
    const posSnapshots = (snapshots || []).filter((s) => s.position_id === pos.id)
    const totalPosVotes = posSnapshots.reduce((acc, curr) => acc + (curr.vote_count || 0), 0)

    const candidates = posSnapshots.map((snap) => {
      const pct = totalPosVotes > 0 ? ((snap.vote_count / totalPosVotes) * 100).toFixed(1) : '0.0'
      return {
        candidateId: snap.candidate_id,
        candidateName: snap.candidate_name,
        photoUrl: snap.candidate_photo_url,
        voteCount: snap.vote_count,
        percentage: parseFloat(pct),
        isWinner: snap.is_winner,
      }
    })

    // Sort candidates by highest vote count
    candidates.sort((a, b) => b.voteCount - a.voteCount)

    return {
      position: pos,
      candidates,
      totalVotes: totalPosVotes,
    }
  })

  const turnoutPct =
    election.total_voters_registered > 0
      ? ((election.total_votes_cast / election.total_voters_registered) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/results"
            className="text-slate-400 hover:text-white transition-colors text-xs font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results Archive
          </Link>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Certified &amp; Declared
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Election Header Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              Academic Year {election.academic_year}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Declared on {formatDate(election.declared_at)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{election.title}</h1>

          {election.declaration_statement && (
            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 text-sm italic">
              <span className="font-semibold text-slate-400 not-italic block mb-1">Official Declaration Statement:</span>
              &quot;{election.declaration_statement}&quot;
            </div>
          )}

          {/* Turnout Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase">Total Eligible Voters</div>
              <div className="text-xl font-bold text-white mt-1">{election.total_voters_registered}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase">Total Votes Cast</div>
              <div className="text-xl font-bold text-white mt-1">{election.total_votes_cast}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase">Voter Turnout</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{turnoutPct}%</div>
            </div>
          </div>
        </div>

        {/* Positional Results */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" /> Breakdown by Executive Position
          </h2>

          {resultData.map(({ position, candidates, totalVotes }) => (
            <div key={position.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{position.title}</h3>
                  {position.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{position.description}</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  {totalVotes} Votes Recorded
                </span>
              </div>

              <div className="space-y-4">
                {candidates.map((cand) => (
                  <div
                    key={cand.candidateId}
                    className={`p-4 rounded-xl border transition-all ${
                      cand.isWinner
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-sm">
                          {cand.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cand.photoUrl} alt={cand.candidateName} className="w-full h-full object-cover" />
                          ) : (
                            cand.candidateName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{cand.candidateName}</span>
                            {cand.isWinner && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                                <Award className="w-3 h-3" /> Winner Declared
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-extrabold text-white">{cand.voteCount}</span>
                        <span className="text-xs text-slate-400 block">{cand.percentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cand.isWinner
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${cand.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
