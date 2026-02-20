import type { Profile } from '@/models/users/Profile';
import type { CreateProfileDto, UpdateProfileDto } from './IProfileRepository';

export interface IProfileService {
  getById(id: string): Promise<Profile>;
  getByUsername(username: string): Promise<Profile>;
  create(dto: CreateProfileDto): Promise<Profile>;
  update(userId: string, dto: UpdateProfileDto): Promise<Profile>;
  uploadAvatar(userId: string, file: ArrayBuffer, filename: string): Promise<Profile>;
  deleteAccount(userId: string): Promise<void>;
}
