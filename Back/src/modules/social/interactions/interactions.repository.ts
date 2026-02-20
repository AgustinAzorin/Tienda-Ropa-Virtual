import { db } from '@/db/client';
import { likes, comments, saves, posts } from '@/db/schema';
import { eq, and, sql, type SQL } from 'drizzle-orm';
import type { Comment } from '@/models/social/Comment';
import type { Save } from '@/models/social/Save';

export class InteractionsRepository {

  // ── Likes ─────────────────────────────────────────────────
  async like(userId: string, postId: string): Promise<void> {
    await db.insert(likes).values({ user_id: userId, post_id: postId }).onConflictDoNothing();
    await db.update(posts).set({ like_count: sql`${posts.like_count} + 1` }).where(eq(posts.id, postId));
  }

  async unlike(userId: string, postId: string): Promise<void> {
    const result = await db.delete(likes)
      .where(and(eq(likes.user_id, userId), eq(likes.post_id, postId)));
    if ((result.rowCount ?? 0) > 0) {
      await db.update(posts).set({ like_count: sql`GREATEST(${posts.like_count} - 1, 0)` }).where(eq(posts.id, postId));
    }
  }

  // ── Comments ──────────────────────────────────────────────
  async createComment(userId: string, postId: string, body: string, parentId?: string): Promise<Comment> {
    const [row] = await db.insert(comments).values({
      user_id: userId, post_id: postId, body, parent_id: parentId ?? null,
    }).returning();
    await db.update(posts).set({ comment_count: sql`${posts.comment_count} + 1` }).where(eq(posts.id, postId));
    return row as Comment;
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    const [row] = await db.select({ post_id: comments.post_id, user_id: comments.user_id })
      .from(comments).where(eq(comments.id, id)).limit(1);
    if (!row || row.user_id !== userId) throw new Error('No autorizado');
    await db.delete(comments).where(eq(comments.id, id));
    await db.update(posts).set({ comment_count: sql`GREATEST(${posts.comment_count} - 1, 0)` })
      .where(eq(posts.id, row.post_id));
  }

  async listComments(postId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.post_id, postId))
      .orderBy(sql`${comments.created_at} ASC`) as Promise<Comment[]>;
  }

  // ── Saves ─────────────────────────────────────────────────
  async save(userId: string, productId?: string, postId?: string, collectionName = 'Guardados'): Promise<Save> {
    const [row] = await db.insert(saves).values({
      user_id: userId,
      product_id: productId ?? null,
      post_id: postId ?? null,
      collection_name: collectionName,
    }).returning();
    return row as Save;
  }

  async unsave(id: string, userId: string): Promise<void> {
    await db.delete(saves).where(and(eq(saves.id, id), eq(saves.user_id, userId)));
  }

  async listSaves(userId: string, collectionName?: string): Promise<Save[]> {
    const conditions: SQL<unknown>[] = [eq(saves.user_id, userId)];
    if (collectionName) conditions.push(eq(saves.collection_name, collectionName));
    return db.select().from(saves).where(and(...conditions)) as Promise<Save[]>;
  }
}

export const interactionsRepository = new InteractionsRepository();
