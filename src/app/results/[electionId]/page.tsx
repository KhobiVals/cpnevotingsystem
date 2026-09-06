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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full"></div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/results"
            className="text-slate-600 hover:text-blue-900 transition-colors text-xs font-bold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results Archive
          </Link>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Certified &amp; Declared
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Election Header Card */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 mb-10 shadow-md relative overflow-hidden border-t-8 border-t-blue-700">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Academic Year {election.academic_year}
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Declared on {formatDate(election.declared_at)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">{election.title}</h1>

          {election.declaration_statement && (
            <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-slate-800 text-sm italic">
              <span className="font-bold text-amber-900 not-italic block mb-1">Official Returning Officer Statement:</span>
              &quot;{election.declaration_statement}&quot;
            </div>
          )}

          {/* Turnout Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Eligible Voters</div>
              <div className="text-xl font-extrabold text-blue-950 mt-1">{election.total_voters_registered}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Votes Cast</div>
              <div className="text-xl font-extrabold text-blue-950 mt-1">{election.total_votes_cast}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Voter Turnout</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">{turnoutPct}%</div>
            </div>
          </div>
        </div>

        {/* Positional Results */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-blue-950 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-700" /> Breakdown by Executive Position
          </h2>

          {resultData.map(({ position, candidates, totalVotes }) => (
            <div key={position.id} className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-blue-950">{position.title}</h3>
                  {position.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{position.description}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-blue-900 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full">
                  {totalVotes} Votes Recorded
                </span>
              </div>

              <div className="space-y-4">
                {candidates.map((cand) => (
                  <div
                    key={cand.candidateId}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      cand.isWinner
                        ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-sm">
                          {cand.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cand.photoUrl} alt={cand.candidateName} className="w-full h-full object-cover" />
                          ) : (
                            cand.candidateName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-blue-950 text-base">{cand.candidateName}</span>
                            {cand.isWinner && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md bg-amber-500 text-blue-950 shadow-xs">
                                <Award className="w-3.5 h-3.5" /> Winner Declared
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-blue-950">{cand.voteCount}</span>
                        <span className="text-xs text-slate-500 font-bold block">{cand.percentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-3">
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
