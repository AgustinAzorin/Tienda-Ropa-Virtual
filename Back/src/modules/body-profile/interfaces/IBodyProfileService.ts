import type { BodyProfile } from '@/models/users/BodyProfile';
import type { UpsertBodyProfileDto } from './IBodyProfileRepository';

export interface SuggestedSize {
  size:       string;
  confidence: 'exact' | 'approximate';
  note?:      string;
}

export interface IBodyProfileService {
  getByUserId(userId: string): Promise<BodyProfile>;
  upsert(userId: string, dto: UpsertBodyProfileDto): Promise<BodyProfile>;
  suggestSize(userId: string, productId: string): Promise<SuggestedSize>;
  /** Snapshot of current measurements for a try-on session. */
  snapshot(userId: string): Promise<UpsertBodyProfileDto>;
  delete(userId: string): Promise<void>;
}
