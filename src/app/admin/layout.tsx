import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Vote,
  LayoutDashboard,
  FileCheck2,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserCheck,
  Settings,
  History,
} from 'lucide-react'
import { logoutAdmin } from './login/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['super_admin', 'election_admin', 'returning_officer']
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-blue-900 bg-blue-950 text-white flex flex-col justify-between p-4 shrink-0 shadow-lg">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-blue-900/60 pb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-md ring-2 ring-amber-400/40">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-base text-white block leading-tight">DESAG Admin</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Electoral System
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-100 hover:text-white hover:bg-blue-900/80 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/elections"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-100 hover:text-white hover:bg-blue-900/80 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-blue-300" />
              <span>Elections Directory</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-blue-300 hover:text-white hover:bg-blue-900/40 transition-all mt-4 border-t border-blue-900/60 pt-4"
            >
              <ChevronRight className="w-4 h-4 text-amber-400" />
              <span>Public Portal</span>
            </Link>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-blue-900/80">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-800 border border-blue-700 flex items-center justify-center text-xs font-black text-amber-300">
              {profile.full_name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{profile.full_name || 'Admin'}</div>
              <div className="text-[10px] text-blue-300 capitalize font-semibold">
                {profile.role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
