import Link from 'next/link'
import { Award, BarChart3, CheckCircle2, ArrowRight, ShieldCheck, ChevronRight, Vote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export default async function PublicResultsListPage() {
  let declaredElections: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('elections')
      .select('id, title, academic_year, status, declared_at, declaration_statement, total_voters_registered, total_votes_cast')
      .eq('status', 'declared')
      .order('declared_at', { ascending: false })

    if (data) {
      declaredElections = data
    }
  } catch (err) {
    console.error('Failed to load declared elections:', err)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">DESAG E-Voting</span>
              <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-semibold">
                Certified Results Archive
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/vote" className="text-slate-400 hover:text-white transition-colors">
              Vote
            </Link>
            <Link href="/results" className="text-white font-semibold">
              Results Archive
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
            <Award className="w-4 h-4" /> Official Declarations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Certified Election Results
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            Below is the repository of officially declared DESAG election outcomes. Each result set contains Returning Officer certification signatures and complete positional breakdowns.
          </p>
        </div>

        {declaredElections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {declaredElections.map((election) => {
              const turnoutPct =
                election.total_voters_registered > 0
                  ? ((election.total_votes_cast / election.total_voters_registered) * 100).toFixed(1)
                  : '0.0'

              return (
                <div
                  key={election.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {election.academic_year}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified &amp; Declared
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">{election.title}</h2>
                    
                    {election.declaration_statement && (
                      <p className="text-xs text-slate-400 italic line-clamp-2 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        &quot;{election.declaration_statement}&quot;
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-medium">Registered</div>
                        <div className="text-sm font-bold text-white mt-0.5">{election.total_voters_registered || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-medium">Votes Cast</div>
                        <div className="text-sm font-bold text-white mt-0.5">{election.total_votes_cast || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-medium">Turnout</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">{turnoutPct}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Declared: {formatDate(election.declared_at)}
                    </span>

                    <Link
                      href={`/results/${election.id}`}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <span>View Breakdown</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center max-w-xl mx-auto my-12">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Declared Results Available Yet</h3>
            <p className="text-slate-400 text-sm mt-2">
              Results will be published here automatically as soon as the Returning Officer certifies and officially declares an election.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
        DESAG Electoral Commission &copy; {new Date().getFullYear()} — Public Results System
      </footer>
    </div>
  )
}
