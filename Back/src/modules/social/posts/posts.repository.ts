import { db } from '@/db/client';
import { posts, follows, profiles, postImages, postProductTags } from '@/db/schema';
import { eq, lt, and, sql, desc } from 'drizzle-orm';
import type { Post } from '@/models/social/Post';
import type { PostImage } from '@/models/social/PostImage';
import type { PostProductTag } from '@/models/social/PostProductTag';

export interface CreatePostDto {
  userId:     string;
  caption?:   string;
  type:       Post['type'];
  visibility: Post['visibility'];
}

export interface PostWithDetails extends Post {
  images:      PostImage[];
  productTags: PostProductTag[];
}

export interface FeedItem extends PostWithDetails {
  author: { username: string; avatar_url: string | null };
}

export class PostRepository {
  async create(dto: CreatePostDto): Promise<Post> {
    const [row] = await db.insert(posts).values({
      user_id:    dto.userId,
      caption:    dto.caption ?? null,
      type:       dto.type,
      visibility: dto.visibility,
    }).returning();
    return row as Post;
  }

  async addImages(postId: string, urls: string[]): Promise<PostImage[]> {
    if (!urls.length) return [];
    const rows = await db.insert(postImages).values(
      urls.map((url, i) => ({ post_id: postId, url, sort_order: i }))
    ).returning();
    return rows as PostImage[];
  }

  async addProductTags(postId: string, tags: Omit<PostProductTag, 'id' | 'post_id'>[]): Promise<void> {
    if (!tags.length) return;
    await db.insert(postProductTags).values(
      tags.map((t) => ({ post_id: postId, ...t }))
    );
  }

  async findById(id: string): Promise<Post | null> {
    const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return (row as Post) ?? null;
  }

  async update(id: string, updates: Partial<Pick<Post, 'caption' | 'visibility'>>): Promise<Post> {
    const [row] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return row as Post;
  }

  async delete(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  /** Personalized feed: posts from followed users, cursor-based pagination. */
  async getPersonalizedFeed(userId: string, params: { cursor?: string } = {}): Promise<FeedItem[]> {
    const conditions = [eq(follows.follower_id, userId)];
    if (params.cursor) conditions.push(lt(posts.created_at, new Date(params.cursor)));

    const rows = await db.select({
      post:       posts,
      username:   profiles.username,
      avatar_url: profiles.avatar_url,
    })
    .from(posts)
    .innerJoin(follows,  eq(follows.following_id, posts.user_id))
    .innerJoin(profiles, eq(profiles.id, posts.user_id))
    .where(and(...conditions))
    .orderBy(sql`${posts.created_at} DESC`)
    .limit(20);

    return rows.map((r) => ({
      ...(r.post as Post),
      images:      [],
      productTags: [],
      author:      { username: r.username, avatar_url: r.avatar_url },
    }));
  }

  async listByUser(userId: string): Promise<Post[]> {
    return db.select().from(posts)
      .where(eq(posts.user_id, userId))
      .orderBy(desc(posts.created_at)) as Promise<Post[]>;
  }

  async getDiscoveryFeed(params: { cursor?: string } = {}): Promise<Post[]> {
    const conditions = [eq(posts.visibility, 'public')];
    if (params.cursor) conditions.push(lt(posts.created_at, new Date(params.cursor)));

    return db.select().from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.like_count))
      .limit(20) as Promise<Post[]>;
  }
}

export const postRepository = new PostRepository();
