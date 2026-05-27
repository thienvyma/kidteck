import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getDashboardPathForRole, isAppRole } from '@/lib/auth-roles'

/**
 * Proxy - route protection and Supabase session refresh.
 *
 * Logic:
 * 1. Refresh Supabase auth session via cookies.
 * 2. Redirect signed-out visitors from protected routes to `/login`.
 * 3. Query `profiles.role` for protected/auth requests.
 * 4. Redirect users away from surfaces their role cannot access.
 */
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/student')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = isAppRole(profile?.role) ? profile.role : null

  if (!role) {
    const url = request.nextUrl.clone()
    url.pathname = '/account-error'
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' || pathname === '/register') {
    const url = request.nextUrl.clone()
    url.pathname = getDashboardPathForRole(role)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/student'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/student') && role === 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/login', '/register'],
}
