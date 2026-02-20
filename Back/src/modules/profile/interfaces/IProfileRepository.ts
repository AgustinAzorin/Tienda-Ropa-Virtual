import type { Profile } from '@/models/users/Profile';

export interface CreateProfileDto {
  userId:      string;
  username:    string;
  displayName?: string;
}

export interface UpdateProfileDto {
  display_name?: string;
  bio?:          string;
  location?:     string;
}

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUsername(username: string): Promise<Profile | null>;
  create(dto: CreateProfileDto): Promise<Profile>;
  update(id: string, dto: UpdateProfileDto): Promise<Profile>;
  updateAvatarUrl(id: string, url: string): Promise<void>;
  delete(id: string): Promise<void>;
}
