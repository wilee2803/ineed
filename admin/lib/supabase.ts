import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser-Client (für Client Components)
export const supabase = createBrowserClient<Database>(URL, ANON)

// Service-Role-Client (für Server Actions — niemals im Browser verwenden)
export const supabaseAdmin = createClient<Database>(URL, SRK, {
  auth: { autoRefreshToken: false, persistSession: false },
})
