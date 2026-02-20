/** PK compuesta: (user_id, post_id) */
export interface Like {
  user_id: string; // uuid FK → users.id
  post_id: string; // uuid FK → posts.id
  created_at: string; // timestamptz
}
