import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase Browser Client
 * Dùng trong: Client Components ("use client")
 * Import: import { createClient } from '@/lib/supabase'
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
