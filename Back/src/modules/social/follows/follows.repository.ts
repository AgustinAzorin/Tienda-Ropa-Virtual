import { db } from '@/db/client';
import { follows, profiles } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AppError } from '@/lib/errors';
import type { Profile } from '@/models/users/Profile';

export class FollowRepository {
  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) throw new AppError('SELF_FOLLOW', 'No podés seguirte a vos mismo', 400);
    await db.insert(follows).values({ follower_id: followerId, following_id: followingId })
      .onConflictDoNothing();
    // Update denormalized counters
    await db.update(profiles).set({ following_count: sql`${profiles.following_count} + 1` }).where(eq(profiles.id, followerId));
    await db.update(profiles).set({ follower_count:  sql`${profiles.follower_count}  + 1` }).where(eq(profiles.id, followingId));
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const result = await db.delete(follows)
      .where(and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId)));
    if ((result.rowCount ?? 0) > 0) {
      await db.update(profiles).set({ following_count: sql`GREATEST(${profiles.following_count} - 1, 0)` }).where(eq(profiles.id, followerId));
      await db.update(profiles).set({ follower_count:  sql`GREATEST(${profiles.follower_count}  - 1, 0)` }).where(eq(profiles.id, followingId));
    }
  }

  async listFollowers(userId: string): Promise<Profile[]> {
    const rows = await db.select({ profile: profiles })
      .from(follows)
      .innerJoin(profiles, eq(profiles.id, follows.follower_id))
      .where(eq(follows.following_id, userId));
    return rows.map((r) => r.profile as Profile);
  }

  async listFollowing(userId: string): Promise<Profile[]> {
    const rows = await db.select({ profile: profiles })
      .from(follows)
      .innerJoin(profiles, eq(profiles.id, follows.following_id))
      .where(eq(follows.follower_id, userId));
    return rows.map((r) => r.profile as Profile);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [row] = await db.select().from(follows)
      .where(and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId))).limit(1);
    return !!row;
  }
}

export const followRepository = new FollowRepository();
