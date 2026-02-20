export interface Profile {
  id: string; // uuid PK FK → users.id
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
  /** Desnormalizado para performance */
  follower_count: number;
  /** Desnormalizado para performance */
  following_count: number;
  created_at: string; // timestamptz
}
