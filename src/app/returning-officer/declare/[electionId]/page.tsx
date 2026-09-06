import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Award, CheckCircle2, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react'
import DeclareForm from './DeclareForm'

export const revalidate = 0

export default async function ReturningOfficerDeclarePage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: election } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single()

  if (!election) notFound()

  // Fetch pending objections
  const { count: openObjectionsCount } = await supabase
    .from('objections')
    .select('*', { count: 'exact', head: true })
    .eq('election_id', electionId)
    .eq('status', 'open')

  // Fetch agent count vs accepted count
  const [{ count: totalAgents }, { count: acceptedAgents }] = await Promise.all([
    supabase
      .from('candidate_agents')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId),
    supabase
      .from('candidate_agents')
      .select('*', { count: 'exact', head: true })
      .eq('election_id', electionId)
      .eq('review_status', 'accepted'),
  ])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={`/admin/elections/${electionId}/results`}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Results Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            <Award className="w-4 h-4" /> Returning Officer Certification
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
            <Award className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official Results Declaration Wizard
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {election.title} ({election.academic_year})
          </p>
        </div>

        {/* Pre-declaration Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Pre-Declaration Audit Checklist
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span>Candidate Agents Endorsement:</span>
              <span className="font-bold text-white">
                {acceptedAgents || 0} / {totalAgents || 0} Agents Accepted
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span>Pending Unresolved Objections:</span>
              {openObjectionsCount === 0 ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 Open Objections
                </span>
              ) : (
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {openObjectionsCount} Open Objections
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Declaration Form */}
        <DeclareForm electionId={electionId} isAlreadyDeclared={election.status === 'declared'} />
      </main>
    </div>
  )
}
