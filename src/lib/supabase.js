import { createBrowserClient } from '@supabase/ssr'

let browserClient

/**
 * Supabase Browser Client
 * Dùng trong: Client Components ("use client")
 * Import: import { createClient } from '@/lib/supabase'
 */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  return browserClient
}
