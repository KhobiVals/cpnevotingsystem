import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import AgentActionButtons from './AgentActionButtons'

export const revalidate = 0

export default async function AgentReviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/agent/login')

  // Fetch candidate agent record
  const { data: agent } = await supabase
    .from('candidate_agents')
    .select('*, candidates(full_name, position_id, positions(title)), elections(*)')
    .eq('user_id', user.id)
    .single()

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">No Agent Assignment Found</h1>
          <p className="text-xs text-slate-400">
            Your user account is not currently assigned as a candidate agent for any active election. Contact the Electoral Commission.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch snapshots for candidate's position
  const candidatePositionId = agent.candidates?.position_id
  const { data: positionSnapshots } = await supabase
    .from('result_snapshots')
    .select('*')
    .eq('election_id', agent.election_id)
    .eq('position_id', candidatePositionId)

  // Fetch objections filed by this agent
  const { data: objections } = await supabase
    .from('objections')
    .select('*')
    .eq('agent_id', agent.id)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Polling Agent Workspace</span>
              <span className="text-[10px] text-indigo-400 font-semibold block uppercase">
                {agent.candidates?.full_name} ({agent.candidates?.positions?.title})
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Review Status: {agent.review_status.replace('_', ' ')}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Election Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
            Contested Election
          </span>
          <h1 className="text-2xl font-bold text-white">{agent.elections?.title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Status: <span className="text-emerald-400 font-semibold">{agent.elections?.status}</span>
          </p>
        </div>

        {/* Results for Position */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-base font-bold text-white">
            Tally Results: {agent.candidates?.positions?.title}
          </h2>

          {positionSnapshots && positionSnapshots.length > 0 ? (
            <div className="space-y-3">
              {positionSnapshots.map((snap) => (
                <div
                  key={snap.id}
                  className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                    snap.candidate_id === agent.candidate_id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white text-sm">{snap.candidate_name}</span>
                    {snap.candidate_id === agent.candidate_id && (
                      <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-semibold">
                        Your Candidate
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {snap.vote_count} votes ({snap.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No results snapshot has been computed for your position yet.
            </p>
          )}
        </div>

        {/* Action Controls (Accept or File Objection) */}
        <AgentActionButtons agentId={agent.id} currentStatus={agent.review_status} />

        {/* Filed Objections List */}
        {objections && objections.length > 0 && (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Filed Objections
            </h2>
            <div className="space-y-3">
              {objections.map((obj) => (
                <div key={obj.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-400 capitalize">{obj.category} Objection</span>
                    <span className="capitalize font-semibold text-slate-400">{obj.status}</span>
                  </div>
                  <p className="text-slate-300">{obj.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
