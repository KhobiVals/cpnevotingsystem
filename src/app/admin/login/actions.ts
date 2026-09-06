'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: error?.message || 'Invalid login credentials.' }
  }

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single()

  const allowedRoles = ['super_admin', 'election_admin', 'returning_officer']
  if (!profile || !allowedRoles.includes(profile.role)) {
    await supabase.auth.signOut()
    return { error: 'Access denied. Account is not authorized for administrative access.' }
  }

  await logAudit({
    action: 'admin_login',
    entityType: 'profile',
    entityId: data.user.id,
    userId: data.user.id,
    userEmail: email,
    userRole: profile.role,
    details: { name: profile.full_name },
  })

  redirect('/admin/dashboard')
}

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
