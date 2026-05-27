import { createBrowserClient } from '@supabase/ssr'
import { cleanEnvValue } from '@/lib/env'

let browserClient

/**
 * Supabase Browser Client
 * Dùng trong: Client Components ("use client")
 * Import: import { createClient } from '@/lib/supabase'
 */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
      cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    )
  }

  return browserClient
}
