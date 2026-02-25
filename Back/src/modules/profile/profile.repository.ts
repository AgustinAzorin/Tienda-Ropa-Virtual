import { db } from '@/db/client';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { Profile } from '@/models/users/Profile';
import type {
  IProfileRepository,
  CreateProfileDto,
  UpdateProfileDto,
} from './interfaces/IProfileRepository';

export class ProfileRepository implements IProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    if (!row) return null;
    return {
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } as unknown as Profile;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    if (!row) return null;
    return {
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } as unknown as Profile;
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const [row] = await db
      .insert(profiles)
      .values({
        id: dto.userId,
        username: dto.username,
        display_name: dto.displayName ?? null,
      })
      .returning();

    if (!row) throw new Error('No se pudo crear el perfil');
    return {
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } as unknown as Profile;
  }

  async update(id: string, dto: UpdateProfileDto): Promise<Profile> {
    // Solo pasa las propiedades que existen en la tabla y en el DTO
    const updateData: any = {};
    if (dto.display_name !== undefined) updateData.display_name = dto.display_name;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.location !== undefined) updateData.location = dto.location;

    let [row] = await db.update(profiles).set(updateData).where(eq(profiles.id, id)).returning();

    if (!row) {
      const fallbackUsername =
        dto.display_name
          ?.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '') || `user_${id.slice(0, 8)}`;

      [row] = await db
        .insert(profiles)
        .values({
          id,
          username: fallbackUsername,
          display_name: dto.display_name ?? null,
          bio: dto.bio ?? null,
          location: dto.location ?? null,
        })
        .returning();
    }

    if (!row) throw new Error('No se pudo actualizar ni crear el perfil');
    return {
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    } as unknown as Profile;
  }

  async updateAvatarUrl(id: string, url: string): Promise<void> {
    const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    if (!row) throw new NotFoundError('Perfil');
    await db.update(profiles).set({ avatar_url: url }).where(eq(profiles.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }
}

export const profileRepository = new ProfileRepository();
