export type PostType = 'outfit' | 'review' | 'lookbook';
export type PostVisibility = 'public' | 'followers' | 'private';

/** Post del feed (UGC) */
export interface Post {
  id: string; // uuid PK
  user_id: string; // uuid FK → users.id
  caption: string | null;
  type: PostType;
  visibility: PostVisibility;
  /** Desnormalizado para performance */
  like_count: number;
  /** Desnormalizado para performance */
  comment_count: number;
  created_at: string; // timestamptz
}
