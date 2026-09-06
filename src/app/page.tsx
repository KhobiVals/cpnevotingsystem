import Link from 'next/link'
import { Vote, Award, ShieldCheck, CheckCircle2, ArrowRight, Lock, Users, BarChart3, Clock, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner Accent - Red & Gold subtle school strip */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-blue-700 w-full"></div>

      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center shadow-md shadow-blue-700/20 ring-2 ring-amber-400/40">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-blue-900">
                DESAG <span className="text-blue-600">E-Voting</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-600 font-bold">
                Distance Education Students&apos; Association
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link href="/" className="text-blue-700 font-bold transition-colors hover:text-blue-600">
              Home
            </Link>
            <Link href="/vote" className="transition-colors hover:text-blue-700">
              Voting Portal
            </Link>
            <Link href="/results" className="transition-colors hover:text-blue-700">
              Certified Results
            </Link>
            <Link href="/agent/login" className="transition-colors hover:text-blue-700">
              Candidate Agents
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/vote"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-all shadow-md shadow-blue-700/20 flex items-center gap-2"
            >
              <Vote className="w-4 h-4 text-amber-300" />
              Cast Vote
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-slate-100 text-xs font-bold transition-all border border-slate-200"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Subtle School Color Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-100/60 via-blue-50/30 to-transparent -z-10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-bold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-amber-700 font-extrabold">DESAG</span>
            <span className="text-slate-400">|</span>
            <span>Official Electoral Commission Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-blue-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Empowering Democratic Choice with <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-amber-600 bg-clip-text text-transparent">
              Integrity &amp; Absolute Privacy
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Cast your official vote securely using SMS authentication. Built with secret ballot encryption, real-time agent verification, and Returning Officer sign-off.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/vote"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base transition-all shadow-xl shadow-blue-700/25 flex items-center justify-center gap-3 group border-b-4 border-blue-900"
            >
              <span>Access Voting Portal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-amber-300" />
            </Link>
            <Link
              href="/results"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-blue-900 font-bold text-base transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span>View Official Results</span>
            </Link>
          </div>

          {/* Quick School Metrics Cards */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-sm hover:border-blue-300 transition-all">
              <div className="text-3xl font-black text-blue-700">100%</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Secret Ballot</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-sm hover:border-blue-300 transition-all">
              <div className="text-3xl font-black text-amber-600">SMS PIN</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Instant Delivery</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-sm hover:border-blue-300 transition-all">
              <div className="text-3xl font-black text-red-600">Verified</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Audit Trail</div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white text-center shadow-sm hover:border-blue-300 transition-all">
              <div className="text-3xl font-black text-blue-900">Real-Time</div>
              <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Agent Monitoring</div>
            </div>
          </div>
        </section>

        {/* Elections Directory Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 block mb-1">
                Official Electoral Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
                Active &amp; Certified Elections
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Official election processes conducted under DESAG Electoral Commission regulations
              </p>
            </div>
            <Link
              href="/results"
              className="mt-4 md:mt-0 text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5"
            >
              Browse complete results archive &rarr;
            </Link>
          </div>

          {activeElections.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map((election) => (
                <div
                  key={election.id}
                  className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:border-blue-400 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {election.academic_year}
                      </span>
                      {election.status === 'open' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          Voting Open
                        </span>
                      ) : election.status === 'declared' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <Award className="w-3.5 h-3.5 text-amber-600" /> Declared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                          <Clock className="w-3 h-3" /> Scheduled
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-blue-950 line-clamp-2">{election.title}</h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    {election.status === 'open' ? (
                      <Link
                        href="/vote"
                        className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs text-center transition-all shadow-md shadow-blue-700/20"
                      >
                        Enter Ballot Box
                      </Link>
                    ) : (
                      <Link
                        href={`/results/${election.id}`}
                        className="w-full py-2.5 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 font-bold text-xs text-center transition-colors"
                      >
                        View Official Breakdown
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center max-w-xl mx-auto">
              <Vote className="w-12 h-12 text-blue-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-blue-950">No Active Voting Sessions Right Now</h3>
              <p className="text-slate-600 text-sm mt-2">
                When an election opens, it will automatically appear here. If you received SMS voting credentials, proceed to the Vote Portal.
              </p>
              <Link
                href="/vote"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition-colors shadow-md shadow-blue-700/20"
              >
                Access Vote Portal
              </Link>
            </div>
          )}
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight">
              Electoral Standards &amp; Principles
            </h2>
            <p className="text-slate-600 text-base mt-3">
              Designed according to DESAG Constitution standards to guarantee accurate, secret, and transparent results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-blue-700">
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">1. Decoupled Secret Ballot</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Voter identity records are strictly separated from submitted vote tokens in the database, preventing any tracking of choice back to index numbers.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-amber-500">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">2. Candidate Agent Verification</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Nominated polling agents receive live access to inspect vote totals, review audit trails, and file formal objections prior to declaration.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all border-t-4 border-t-red-600">
              <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-3">3. Returning Officer Sign-Off</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Final election outcomes require official digital certification by the Returning Officer before results are published to the public archive.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-blue-950 text-white py-12 relative z-10 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-blue-950 font-black text-sm">
              D
            </div>
            <div>
              <span className="font-extrabold text-white text-base block">DESAG Electoral Commission</span>
              <span className="text-xs text-blue-300">Distance Education Students&apos; Association of Ghana</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200 font-medium">
            <Link href="/vote" className="hover:text-amber-400 transition-colors">Voter Portal</Link>
            <Link href="/results" className="hover:text-amber-400 transition-colors">Certified Results</Link>
            <Link href="/agent/login" className="hover:text-amber-400 transition-colors">Candidate Agents</Link>
            <Link href="/admin/login" className="hover:text-amber-400 transition-colors">Commission Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
