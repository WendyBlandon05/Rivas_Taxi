export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured:
      Boolean(url) &&
      Boolean(anonKey) &&
      !url?.includes("your-project-ref") &&
      !anonKey?.includes("your-supabase-anon-key"),
    isAdminConfigured:
      Boolean(url) &&
      Boolean(serviceRoleKey) &&
      !url?.includes("your-project-ref") &&
      !serviceRoleKey?.includes("your-supabase-service-role-key"),
  }
}

export function assertSupabaseEnv() {
  const env = getSupabaseEnv()

  if (!env.isConfigured) {
    throw new Error(
      "Supabase no esta configurado. Edita .env.local y coloca NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY reales.",
    )
  }

  return env
}

export function assertSupabaseAdminEnv() {
  const env = getSupabaseEnv()

  if (!env.isAdminConfigured) {
    throw new Error(
      "Supabase admin no esta configurado. Edita .env.local y coloca NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY reales.",
    )
  }

  return env
}
