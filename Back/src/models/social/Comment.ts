export interface Comment {
  id: string; // uuid PK
  post_id: string; // uuid FK → posts.id
  user_id: string; // uuid FK → users.id
  /** nullable — para replies anidados */
  parent_id: string | null; // uuid FK → comments.id
  body: string;
  created_at: string; // timestamptz
}
