import { db } from '@/db/client';
import { tryonSessions } from '@/db/schema';
import { eq, gte, sql } from 'drizzle-orm';
import type { TryonSession } from '@/models/tryon/TryonSession';
import type { ITryonRepository, CreateTryonSessionDto, UpdateTryonSessionDto } from './interfaces/ITryonRepository';

export class TryonRepository implements ITryonRepository {

  async create(dto: CreateTryonSessionDto): Promise<TryonSession> {
    const [row] = await db.insert(tryonSessions).values({
      user_id:               dto.userId ?? null,
      product_id:            dto.productId,
      variant_id:            dto.variantId,
      body_profile_snapshot: dto.bodyProfileSnapshot ?? null,
    }).returning();
    return row as unknown as TryonSession;
  }

  async update(id: string, dto: UpdateTryonSessionDto): Promise<TryonSession> {
    const [row] = await db.update(tryonSessions).set(dto).where(eq(tryonSessions.id, id)).returning();
    return row as unknown as TryonSession;
  }

  async listByUser(userId: string): Promise<TryonSession[]> {
    const rows = await db.select().from(tryonSessions)
      .where(eq(tryonSessions.user_id, userId))
      .orderBy(sql`${tryonSessions.created_at} DESC`);
    return rows as unknown as TryonSession[];
  }

  async conversionStats(since: Date) {
    const [row] = await db.select({
      total_sessions:  sql<number>`count(*)`,
      purchases:       sql<number>`sum(${tryonSessions.converted_to_purchase}::int)`,
      conversion_rate: sql<number>`round(avg(${tryonSessions.converted_to_purchase}::int) * 100, 2)`,
    })
    .from(tryonSessions)
    .where(gte(tryonSessions.created_at, since));
    return {
      total_sessions:  Number(row?.total_sessions ?? 0),
      purchases:       Number(row?.purchases ?? 0),
      conversion_rate: Number(row?.conversion_rate ?? 0),
    };
  }
}
