import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Server Client
 * Dùng trong: Server Components, Route Handlers, Server Actions
 * Import: import { createServerClient } from '@/lib/supabase-server'
 * 
 * PHẢI gọi với await vì cookies() là async trong Next.js 15+
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
            // setAll được gọi từ Server Component — không thể set cookies
            // Middleware sẽ refresh session thay thế
          }
        },
      },
    }
  )
}
