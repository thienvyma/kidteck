import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}

/**
 * Supabase Server Client
 * Used in Server Components, Route Handlers, and Server Actions.
 * Import: import { createServerClient } from '@/lib/supabase-server'
 *
 * Must be awaited because cookies() is async in modern Next.js.
 */
export async function createServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
            // Server Components cannot set cookies; proxy refreshes the session instead.
          }
        },
      },
    }
  )
}
