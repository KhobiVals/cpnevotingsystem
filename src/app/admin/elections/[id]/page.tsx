import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  FileCheck2,
  Users,
  Award,
  Vote,
  Settings,
  ShieldCheck,
  BarChart3,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import StatusTransitionButtons from './StatusTransitionButtons'

export const revalidate = 0

export default async function AdminElectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: election } = await supabase.from('elections').select('*').eq('id', id).single()

  if (!election) {
    notFound()
  }

  // Counts
  const [{ count: positionsCount }, { count: candidatesCount }, { count: votersCount }] =
    await Promise.all([
      supabase.from('positions').select('*', { count: 'exact', head: true }).eq('election_id', id),
      supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('election_id', id),
      supabase.from('voters').select('*', { count: 'exact', head: true }).eq('election_id', id),
    ])

  const turnoutPct =
    election.total_voters_registered > 0
      ? ((election.total_votes_cast / election.total_voters_registered) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          href="/admin/elections"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Elections List
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                {election.academic_year}
              </span>
              <span className="capitalize text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Status: {election.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{election.title}</h1>
            <p className="text-slate-400 text-xs mt-1">{election.description || 'No description'}</p>
          </div>

          <StatusTransitionButtons electionId={election.id} currentStatus={election.status} />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <Link
          href={`/admin/elections/${id}`}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs transition-colors shrink-0"
        >
          Overview
        </Link>
        <Link
          href={`/admin/elections/${id}/positions`}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0"
        >
          Positions ({positionsCount || 0})
        </Link>
        <Link
          href={`/admin/elections/${id}/candidates`}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0"
        >
          Candidates ({candidatesCount || 0})
        </Link>
        <Link
          href={`/admin/elections/${id}/voters`}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0"
        >
          Voters Register ({votersCount || 0})
        </Link>
        <Link
          href={`/admin/elections/${id}/agents`}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0"
        >
          Candidate Agents
        </Link>
        <Link
          href={`/admin/elections/${id}/results`}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0"
        >
          Live Results Dashboard
        </Link>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-2xl font-extrabold text-blue-400">{positionsCount || 0}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Positions</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-2xl font-extrabold text-indigo-400">{candidatesCount || 0}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Candidates</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-2xl font-extrabold text-purple-400">{votersCount || 0}</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Registered Voters</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-400">{turnoutPct}%</div>
          <div className="text-xs text-slate-400 font-medium uppercase mt-1">Voter Turnout</div>
        </div>
      </div>

      {/* Schedule & Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Voting Schedule
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium">Start Time:</span>
              <span className="font-bold text-white">{formatDate(election.start_time)}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium">End Time:</span>
              <span className="font-bold text-white">{formatDate(election.end_time)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Settings
          </h2>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium">Authentication Mode:</span>
              <span className="font-bold text-white uppercase">{election.credential_mode}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium">Ballot Anonymity:</span>
              <span className="font-bold text-emerald-400">Decoupled Hash Token</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
