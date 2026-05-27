import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cleanEnvValue } from '@/lib/env'

export function createPublicSupabaseClient() {
  const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase public client is not configured.')
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
