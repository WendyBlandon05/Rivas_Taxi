import { createClient } from '@supabase/supabase-js'
import { assertSupabaseAdminEnv } from './env'

/**
 * Admin client with service_role key for privileged operations.
 * ONLY use this on the server side in API routes.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const env = assertSupabaseAdminEnv()

  return createClient(env.url!, env.serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
