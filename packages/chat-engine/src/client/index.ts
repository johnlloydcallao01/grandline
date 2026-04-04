import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClientConfig } from '../types/index.js'

// ============================================================================
// Supabase Client Factory
// ============================================================================

export function createSupabaseClient(config: SupabaseClientConfig): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseKey, {
    realtime: {
      timeout: config.options?.realtime?.timeout ?? 20000,
      heartbeatIntervalMs: config.options?.realtime?.heartbeatIntervalMs ?? 15000,
    },
  })
}

// ============================================================================
// Environment-based Client Creation
// ============================================================================

export function createClientFromEnv(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createSupabaseClient({
    supabaseUrl: url,
    supabaseKey: key,
  })
}

// ============================================================================
// Client Singleton (for client-side apps)
// ============================================================================

let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseClient() should only be called on the client side. ' +
      'For server-side, use createClientFromEnv() or createSupabaseClient()'
    )
  }

  if (!clientInstance) {
    clientInstance = createClientFromEnv()
  }

  return clientInstance
}

export function resetSupabaseClient(): void {
  clientInstance = null
}
