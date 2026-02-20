/** PK compuesta: (follower_id, following_id) */
export interface Follow {
  follower_id: string; // uuid FK → users.id
  following_id: string; // uuid FK → users.id
  created_at: string; // timestamptz
}
