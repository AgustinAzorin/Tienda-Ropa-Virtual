import type { TryonSession } from '@/models/tryon/TryonSession';
import type { CreateTryonSessionDto } from './ITryonRepository';

export interface ITryonService {
  startSession(dto: CreateTryonSessionDto): Promise<TryonSession>;
  endSession(sessionId: string, durationSeconds: number): Promise<TryonSession>;
  markConvertedToCart(sessionId: string): Promise<TryonSession>;
  markConvertedToPurchase(sessionId: string): Promise<TryonSession>;
  getSessionsByUser(userId: string): Promise<TryonSession[]>;
  getConversionStats(daysPast?: number): Promise<{
    total_sessions:  number;
    purchases:       number;
    conversion_rate: number;
  }>;
}
