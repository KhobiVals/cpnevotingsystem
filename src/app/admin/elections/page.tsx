import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, FileCheck2, Calendar, Clock, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const revalidate = 0

export default async function AdminElectionsListPage() {
  const supabase = await createClient()

  const { data: elections } = await supabase
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Elections Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage all DESAG electoral processes and status transitions
          </p>
        </div>

        <Link
          href="/admin/elections/new"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create New Election
        </Link>
      </div>

      {elections && elections.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elections.map((election) => (
            <div
              key={election.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                    {election.academic_year}
                  </span>
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {election.status.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mb-2">{election.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {election.description || 'No description provided.'}
                </p>

                <div className="text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Start:</span>
                    <span className="text-slate-200 font-medium">{formatDate(election.start_time)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>End:</span>
                    <span className="text-slate-200 font-medium">{formatDate(election.end_time)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href={`/admin/elections/${election.id}`}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs text-center transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <span>Manage Election &amp; Setup</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center max-w-xl mx-auto my-12">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Elections Configured Yet</h3>
          <p className="text-slate-400 text-sm mt-2 mb-6">
            Get started by creating your first election process.
          </p>
          <Link
            href="/admin/elections/new"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Election
          </Link>
        </div>
      )}
    </div>
  )
}
