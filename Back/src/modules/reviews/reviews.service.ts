import { db } from '@/db/client';
import { reviews, reviewImages, orderItems } from '@/db/schema';
import { eq, and, desc, type SQL } from 'drizzle-orm';
import { resizeAndUpload } from '@/lib/storage';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import type { Review } from '@/models/reviews/Review';

export interface CreateReviewDto {
  productId:    string;
  userId:       string;
  orderItemId:  string;
  rating:       1 | 2 | 3 | 4 | 5;
  title?:       string;
  body?:        string;
  fitRating?:   Review['fit_rating'];
  used3dTryon:  boolean;
}

export interface ReviewFilterParams {
  rating?:    number;
  fitRating?: string;
  page?:      number;
  per_page?:  number;
}

export class ReviewRepository {

  async create(dto: CreateReviewDto): Promise<Review> {
    // Verify the order item belongs to the user
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, dto.orderItemId)).limit(1);
    if (!item) throw new NotFoundError('Item de orden');

    const [row] = await db.insert(reviews).values({
      product_id:    dto.productId,
      user_id:       dto.userId,
      order_item_id: dto.orderItemId,
      rating:        dto.rating,
      title:         dto.title ?? null,
      body:          dto.body ?? null,
      fit_rating:    dto.fitRating ?? null,
      used_3d_tryon: dto.used3dTryon,
    }).returning();
    return row as unknown as Review;
  }

  async addImages(reviewId: string, files: Array<{ buffer: ArrayBuffer; reviewId: string }>): Promise<void> {
    const urls = await Promise.all(
      files.map((f, i) => resizeAndUpload(f.buffer, 'reviews', `${reviewId}/${i}.webp`))
    );
    if (urls.length) {
      await db.insert(reviewImages).values(urls.map((url) => ({ review_id: reviewId, url })));
    }
  }

  async listByProduct(productId: string, params: ReviewFilterParams) {
    const conditions: SQL<unknown>[] = [eq(reviews.product_id, productId)];
    if (params.rating)    conditions.push(eq(reviews.rating, params.rating));
    if (params.fitRating) conditions.push(eq(reviews.fit_rating, params.fitRating));

    const page     = params.page ?? 1;
    const per_page = params.per_page ?? 20;

    return db.select().from(reviews)
      .where(and(...conditions))
      .orderBy(desc(reviews.helpful_count))
      .limit(per_page)
      .offset((page - 1) * per_page) as Promise<Review[]>;
  }

  async markHelpful(id: string): Promise<void> {
    await db.update(reviews)
      .set({ helpful_count: sql`${reviews.helpful_count} + 1` })
      .where(eq(reviews.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }
}

export class ReviewService {
  constructor(private readonly repo = new ReviewRepository()) {}

  async createReview(
    dto: CreateReviewDto,
    images: Array<{ buffer: ArrayBuffer }> = [],
  ): Promise<Review> {
    // Verify order item belongs to this user
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, dto.orderItemId)).limit(1);
    if (!item) throw new NotFoundError('Item de orden');

    const review = await this.repo.create(dto);
    if (images.length) {
      await this.repo.addImages(review.id, images.map((img) => ({ ...img, reviewId: review.id })));
    }
    return review;
  }

  async listProductReviews(productId: string, params: ReviewFilterParams): Promise<Review[]> {
    return this.repo.listByProduct(productId, params);
  }

  async markHelpful(id: string): Promise<void> {
    return this.repo.markHelpful(id);
  }

  async deleteReview(id: string, userId: string, isAdmin = false): Promise<void> {
    const [review] = await db.select({ user_id: reviews.user_id }).from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!review) throw new NotFoundError('Reseña');
    if (!isAdmin && review.user_id !== userId) throw new ForbiddenError();
    return this.repo.delete(id);
  }
}

export const reviewService = new ReviewService();
