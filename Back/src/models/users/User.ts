export interface User {
  id: string; // uuid — managed by Supabase Auth
  email: string;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}
