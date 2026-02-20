import { resizeAndUpload, deleteFile } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { ProfileRepository } from './profile.repository';
import type { IProfileService } from './interfaces/IProfileService';
import type { Profile } from '@/models/users/Profile';
import type { CreateProfileDto, UpdateProfileDto } from './interfaces/IProfileRepository';

export class ProfileService implements IProfileService {
  constructor(private readonly repo = new ProfileRepository()) {}

  async getById(id: string): Promise<Profile> {
    const profile = await this.repo.findById(id);
    if (!profile) throw new NotFoundError('Perfil');
    return profile;
  }

  async getByUsername(username: string): Promise<Profile> {
    const profile = await this.repo.findByUsername(username);
    if (!profile) throw new NotFoundError('Perfil');
    return profile;
  }

  async create(dto: CreateProfileDto): Promise<Profile> {
    const existing = await this.repo.findByUsername(dto.username);
    if (existing) throw new ConflictError('El nombre de usuario ya está en uso');
    return this.repo.create(dto);
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    return this.repo.update(userId, dto);
  }

  async uploadAvatar(userId: string, file: ArrayBuffer, _filename: string): Promise<Profile> {
    const path     = `${userId}/${Date.now()}-avatar.webp`;
    const url      = await resizeAndUpload(file, 'avatars', path, 400, 90);
    await this.repo.updateAvatarUrl(userId, url);
    return this.getById(userId);
  }

  async deleteAccount(userId: string): Promise<void> {
    // Delete avatar from storage (best-effort)
    try { await deleteFile('avatars', `${userId}`); } catch {}
    await this.repo.delete(userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
  }
}

export const profileService = new ProfileService();
