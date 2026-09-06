import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ============================================================
  // ROUTE PROTECTION
  // ============================================================

  // Admin routes require authenticated admin/officer users
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }

    // Check profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      !profile.is_active ||
      !['super_admin', 'election_admin', 'returning_officer'].includes(
        profile.role
      )
    ) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      return NextResponse.redirect(loginUrl)
    }

    // Returning officer declaration — only returning_officer or super_admin
    if (
      pathname.startsWith('/returning-officer') &&
      !['super_admin', 'returning_officer'].includes(profile.role)
    ) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Engine room requires admin or agent
  if (pathname.startsWith('/engine-room')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      !profile.is_active ||
      !['super_admin', 'election_admin', 'returning_officer', 'candidate_agent'].includes(
        profile.role
      )
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Agent routes
  if (pathname.startsWith('/agent')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (
      !profile ||
      !profile.is_active ||
      !['super_admin', 'election_admin', 'candidate_agent'].includes(profile.role)
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Voter routes — handled separately via voter session (custom JWT or session cookie)
  // /vote/* routes check voter session via API

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
