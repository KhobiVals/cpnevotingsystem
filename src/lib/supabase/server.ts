import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getValidSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : 'https://placeholder.supabase.co'

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-')
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-')
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : anonKey

  return { url, anonKey, serviceKey }
}

// Server-side Supabase client (uses anon key + cookies for session)
export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getValidSupabaseConfig()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component
        }
      },
    },
  })
}

// Admin client — bypasses RLS using the service role key.
export async function createAdminClient() {
  const cookieStore = await cookies()
  const { url, serviceKey } = getValidSupabaseConfig()

  return createServerClient(url, serviceKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component
        }
      },
    },
  })
}
