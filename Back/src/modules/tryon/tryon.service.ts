import { TryonRepository } from './tryon.repository';
import { bodyProfileService } from '@/modules/body-profile/body-profile.service';
import type { ITryonService } from './interfaces/ITryonService';
import type { TryonSession } from '@/models/tryon/TryonSession';
import type { CreateTryonSessionDto } from './interfaces/ITryonRepository';

export class TryonService implements ITryonService {
  constructor(private readonly repo = new TryonRepository()) {}

  async startSession(dto: CreateTryonSessionDto): Promise<TryonSession> {
    // Automatically attach body profile snapshot if user is authenticated
    let snapshot = dto.bodyProfileSnapshot;
    if (!snapshot && dto.userId) {
      try {
        snapshot = await bodyProfileService.snapshot(dto.userId) as unknown;
      } catch { /* guest or no body profile */ }
    }
    return this.repo.create({ ...dto, bodyProfileSnapshot: snapshot });
  }

  async endSession(sessionId: string, durationSeconds: number): Promise<TryonSession> {
    return this.repo.update(sessionId, { duration_seconds: durationSeconds });
  }

  async markConvertedToCart(sessionId: string): Promise<TryonSession> {
    return this.repo.update(sessionId, { converted_to_cart: true });
  }

  async markConvertedToPurchase(sessionId: string): Promise<TryonSession> {
    return this.repo.update(sessionId, { converted_to_purchase: true });
  }

  async getSessionsByUser(userId: string): Promise<TryonSession[]> {
    return this.repo.listByUser(userId);
  }

  async getConversionStats(daysPast = 30) {
    const since = new Date(Date.now() - daysPast * 24 * 60 * 60 * 1000);
    return this.repo.conversionStats(since);
  }
}

export const tryonService = new TryonService();
