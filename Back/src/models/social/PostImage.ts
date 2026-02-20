export interface PostImage {
  id: string; // uuid PK
  post_id: string; // uuid FK → posts.id
  url: string;
  sort_order: number;
}
