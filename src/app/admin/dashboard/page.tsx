import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  FileCheck2,
  Users,
  Vote,
  Plus,
  BarChart3,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch metrics
  const [{ count: totalElections }, { count: openElections }, { count: totalVoters }] =
    await Promise.all([
      supabase.from('elections').select('*', { count: 'exact', head: true }),
      supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('voters').select('*', { count: 'exact', head: true }),
    ])

  // Fetch recent elections
  const { data: recentElections } = await supabase
    .from('elections')
    .select('id, title, academic_year, status, total_voters_registered, total_votes_cast, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, user_email, created_at')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 block mb-1">
            DESAG Electoral Commission
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            System Dashboard &amp; Control Center
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Real-time election system monitoring &amp; administration hub
          </p>
        </div>

        <Link
          href="/admin/elections/new"
          className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm transition-all shadow-md shadow-blue-700/20 flex items-center gap-2 self-start border-b-4 border-blue-950"
        >
          <Plus className="w-4 h-4 text-amber-300" /> Create Election
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm border-t-4 border-t-blue-700">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Elections
            </div>
            <div className="text-2xl font-black text-blue-950 mt-0.5">{totalElections || 0}</div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm border-t-4 border-t-emerald-600">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active / Open Elections
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{openElections || 0}</div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white flex items-center gap-4 shadow-sm border-t-4 border-t-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registered Voters
            </div>
            <div className="text-2xl font-black text-blue-950 mt-0.5">{totalVoters || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Elections Table */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-700" /> Recent Elections
          </h2>
          <Link
            href="/admin/elections"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentElections && recentElections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentElections.map((elec) => (
                  <tr key={elec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-blue-950">{elec.title}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{elec.academic_year}</td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {elec.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/elections/${elec.id}`}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-all inline-flex items-center gap-1"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6 font-medium">No elections created yet.</p>
        )}
      </div>

      {/* System Audit Logs */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-red-600" /> Security &amp; System Audit Log
        </h2>

        {auditLogs && auditLogs.length > 0 ? (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <div>
                    <span className="font-bold text-blue-950 capitalize">{log.action.replace('_', ' ')}</span>
                    <span className="text-slate-500 ml-2">by {log.user_email || 'System'}</span>
                  </div>
                </div>
                <span className="text-slate-500 font-medium">{formatDate(log.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4 font-medium">No audit events logged yet.</p>
        )}
      </div>
    </div>
  )
}
