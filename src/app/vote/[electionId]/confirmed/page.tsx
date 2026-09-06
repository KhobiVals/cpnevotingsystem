import Link from 'next/link'
import { CheckCircle2, ShieldCheck, ArrowRight, BarChart3 } from 'lucide-react'

export default async function VoteConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const { ref } = await searchParams
  const refCode = ref || 'DESAG-VOTE-CONFIRMED'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Ballot Successfully Cast!</h1>
          <p className="text-xs text-slate-400 mt-1">
            Your vote has been cryptographically recorded into the election database.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
            Official Submission Reference Code
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400 select-all">{refCode}</span>
        </div>

        <div className="text-xs text-slate-400 bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            Your identity has been decoupled from your ballot selections to maintain complete voter privacy and secret ballot integrity.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/results"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Declared Results</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
