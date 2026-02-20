import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { Profile } from '@/models/users/Profile';
import type { IProfileRepository, CreateProfileDto, UpdateProfileDto } from './interfaces/IProfileRepository';

export class ProfileRepository implements IProfileRepository {

  async findById(id: string): Promise<Profile | null> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return (row as Profile) ?? null;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const [row] = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
    return (row as Profile) ?? null;
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const [row] = await db.insert(profiles).values({
      id:           dto.userId,
      username:     dto.username,
      display_name: dto.displayName ?? null,
    }).returning();
    return row as Profile;
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    const [row] = await db.update(profiles).set(dto).where(eq(profiles.id, id)).returning();
    if (!row) throw new NotFoundError('Perfil');
    return row as Profile;
  }

  async updateAvatarUrl(id: string, url: string): Promise<void> {
    await db.update(profiles).set({ avatar_url: url }).where(eq(profiles.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }
}
