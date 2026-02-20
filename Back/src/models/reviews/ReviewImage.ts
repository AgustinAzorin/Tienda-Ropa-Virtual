export interface ReviewImage {
  id: string; // uuid PK
  review_id: string; // uuid FK → reviews.id
  url: string;
}
