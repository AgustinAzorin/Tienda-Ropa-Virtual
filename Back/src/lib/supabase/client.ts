import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser / server-component safe client (uses the anon key).
 * For mutations that require the user's JWT, pass the token via the
 * Authorization header or use createServerClient from @supabase/ssr instead.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon);
