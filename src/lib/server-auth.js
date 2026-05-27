import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'
import { isAppRole } from '@/lib/auth-roles'

export async function getAuthContext() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
      role: null,
      profileError: null,
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    supabase,
    user,
    profile: profile || null,
    role: isAppRole(profile?.role) ? profile.role : null,
    profileError,
  }
}

export async function requireRole(requiredRole) {
  const context = await getAuthContext()

  if (!context.user) {
    return {
      ...context,
      error: 'Unauthorized',
      status: 401,
    }
  }

  if (context.profileError) {
    return {
      ...context,
      error: 'Unable to verify account role',
      status: 500,
    }
  }

  if (context.role !== requiredRole) {
    return {
      ...context,
      error: context.role ? 'Forbidden' : 'Invalid account role',
      status: 403,
    }
  }

  return context
}

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role is not configured on the server.')
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
