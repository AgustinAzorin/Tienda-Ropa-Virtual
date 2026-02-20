import { db } from '@/db/client';
import { bodyProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { BodyProfile } from '@/models/users/BodyProfile';
import type { IBodyProfileRepository, UpsertBodyProfileDto } from './interfaces/IBodyProfileRepository';

export class BodyProfileRepository implements IBodyProfileRepository {

  async findByUserId(userId: string): Promise<BodyProfile | null> {
    const [row] = await db.select().from(bodyProfiles).where(eq(bodyProfiles.user_id, userId)).limit(1);
    return (row as unknown as BodyProfile) ?? null;
  }

  async upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile> {
    const [row] = await db.insert(bodyProfiles)
      .values({ user_id: userId, ...dto, updated_at: new Date() })
      .onConflictDoUpdate({
        target: bodyProfiles.user_id,
        set: { ...dto, updated_at: new Date() },
      })
      .returning();
    return row as unknown as BodyProfile;
  }

  async updateAvatarModelUrl(userId: string, url: string): Promise<void> {
    await db.update(bodyProfiles)
      .set({ avatar_model_url: url, updated_at: new Date() })
      .where(eq(bodyProfiles.user_id, userId));
  }

  async delete(userId: string): Promise<void> {
    await db.delete(bodyProfiles).where(eq(bodyProfiles.user_id, userId));
  }
}
