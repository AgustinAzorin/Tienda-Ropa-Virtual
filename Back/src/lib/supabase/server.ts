import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client that reads/writes the session cookie.
 * Use this in Route Handlers to get the authenticated user.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()         { return cookieStore.getAll(); },
        setAll(toSet)    { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
}

/** Returns the authenticated user or null from the current request cookies. */
export async function getAuthUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}
