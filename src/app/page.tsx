import Link from 'next/link'
import { Vote, Award, ShieldCheck, CheckCircle2, ArrowRight, Lock, Users, BarChart3, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60 // Revalidate every minute

export default async function HomePage() {
  let activeElections: any[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('elections')
      .select('id, title, academic_year, status, start_time, end_time')
      .in('status', ['open', 'scheduled', 'declared'])
      .order('start_time', { ascending: false })
      .limit(6)
    
    if (data) {
      activeElections = data
    }
  } catch (e) {
    console.error('Error loading active elections:', e)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                DESAG E-Voting
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-blue-400 font-semibold">
                Official Electoral Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="/" className="text-white font-semibold transition-colors hover:text-blue-400">
              Home
            </Link>
            <Link href="/vote" className="transition-colors hover:text-blue-400">
              Vote Portal
            </Link>
            <Link href="/results" className="transition-colors hover:text-blue-400">
              Public Results
            </Link>
            <Link href="/agent/login" className="transition-colors hover:text-blue-400">
              Agent Portal
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/vote"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <Vote className="w-4 h-4" />
              Cast Vote
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-medium transition-all"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Distance Education Students&apos; Association of Ghana</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Secure, Transparent &amp; Verifiable <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Digital Elections Platform
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Empowering every student to cast their vote securely. Built with cryptographic verification, live audit logging, and certified by Returning Officers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/vote"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 group"
            >
              <span>Go to Voting Portal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/results"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>View Official Results</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-center">
              <div className="text-3xl font-extrabold text-blue-400">100%</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Secret Ballot</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-center">
              <div className="text-3xl font-extrabold text-emerald-400">SMS PIN</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Authentication</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-center">
              <div className="text-3xl font-extrabold text-indigo-400">Immutable</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Audit Trail</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm text-center">
              <div className="text-3xl font-extrabold text-purple-400">Real-Time</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Agent Verification</div>
            </div>
          </div>
        </section>

        {/* Elections Status Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Elections Directory
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Current and upcoming DESAG electoral processes
              </p>
            </div>
            <Link
              href="/results"
              className="mt-4 md:mt-0 text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              Browse all election records <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeElections.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map((election) => (
                <div
                  key={election.id}
                  className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {election.academic_year}
                      </span>
                      {election.status === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Voting Open
                        </span>
                      ) : election.status === 'declared' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Declared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Scheduled
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-2">{election.title}</h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    {election.status === 'open' ? (
                      <Link
                        href="/vote"
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs text-center transition-colors shadow-md shadow-blue-600/20"
                      >
                        Enter Ballot Box
                      </Link>
                    ) : (
                      <Link
                        href={`/results/${election.id}`}
                        className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium text-xs text-center transition-colors"
                      >
                        View Election Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center max-w-xl mx-auto">
              <Vote className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Live Elections Right Now</h3>
              <p className="text-slate-400 text-sm mt-2">
                When an election opens, it will automatically appear here. If you have been issued voting credentials, proceed to the Vote Portal.
              </p>
              <Link
                href="/vote"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                Access Vote Portal
              </Link>
            </div>
          )}
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Electoral Integrity &amp; Transparency Standard
            </h2>
            <p className="text-slate-400 text-base mt-3">
              Designed from the ground up to prevent voter impersonation, ballot tampering, and unauthorized tally modifications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cryptographic Ballot Privacy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Voter identity is entirely decoupled from submitted vote tokens. Database records store zero links between index numbers and cast choices.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Candidate Agent Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Official candidate polling agents can inspect vote totals live, review digital audit trails, and log formal objections before declaration.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 relative group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Returning Officer Sign-Off</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Results remain confidential until certified and digitally signed by the Returning Officer, guaranteeing official procedural compliance.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 relative z-10 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              D
            </div>
            <span className="font-semibold text-slate-200">
              DESAG Electoral Commission &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <Link href="/vote" className="hover:text-white transition-colors">Voter Portal</Link>
            <Link href="/results" className="hover:text-white transition-colors">Public Results</Link>
            <Link href="/agent/login" className="hover:text-white transition-colors">Candidate Agents</Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">Electoral Commission Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
