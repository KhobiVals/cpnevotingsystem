import Link from 'next/link'
import { Award, BarChart3, CheckCircle2, ChevronRight, Vote, ShieldCheck } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-amber-400/40">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-blue-950">DESAG E-Voting</span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-600 font-bold">
                Certified Results Archive
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Home
            </Link>
            <Link href="/vote" className="hover:text-blue-700 transition-colors">
              Vote Portal
            </Link>
            <Link href="/results" className="text-blue-700 font-bold">
              Results Archive
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold mb-4">
            <Award className="w-4 h-4 text-amber-600" /> Official Declarations
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight">
            Certified Election Results
          </h1>
          <p className="text-slate-600 mt-3 text-base">
            Repository of officially declared DESAG election outcomes. Each result set contains Returning Officer certification statements and complete positional breakdowns.
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
                  className="rounded-2xl border-2 border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-blue-400 transition-all shadow-sm hover:shadow-md border-t-4 border-t-blue-700"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Academic Year {election.academic_year}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified &amp; Declared
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-blue-950 mb-2">{election.title}</h2>

                    {election.declaration_statement && (
                      <p className="text-xs text-slate-600 italic line-clamp-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        &quot;{election.declaration_statement}&quot;
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Registered</div>
                        <div className="text-sm font-extrabold text-blue-950 mt-0.5">{election.total_voters_registered || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Votes Cast</div>
                        <div className="text-sm font-extrabold text-blue-950 mt-0.5">{election.total_votes_cast || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Turnout</div>
                        <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{turnoutPct}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Declared: {formatDate(election.declared_at)}
                    </span>

                    <Link
                      href={`/results/${election.id}`}
                      className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-700/20"
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
          <div className="p-12 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center max-w-xl mx-auto my-12">
            <BarChart3 className="w-12 h-12 text-blue-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-blue-950">No Declared Results Available Yet</h3>
            <p className="text-slate-600 text-sm mt-2">
              Results will be published here automatically as soon as the Returning Officer certifies and officially declares an election.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-blue-950 py-8 text-center text-xs text-blue-200 font-medium">
        DESAG Electoral Commission &copy; {new Date().getFullYear()} — Public Certified Results System
      </footer>
    </div>
  )
}
