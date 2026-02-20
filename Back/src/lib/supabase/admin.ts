import { createClient } from '@supabase/supabase-js';

/**
 * Admin client that bypasses RLS.
 * MUST only be used in Route Handlers / Server Actions — never exposed to the client.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
