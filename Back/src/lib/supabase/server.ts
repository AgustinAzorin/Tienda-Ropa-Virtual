import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client that reads/writes the session cookie.
 * Used only for Google OAuth callback (Supabase auth kept in parallel).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(toSet: { name: string; value: string; options?: CookieOptions }[]) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}

/** Returns the authenticated Supabase user (used only for OAuth flow). */
export async function getAuthUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

