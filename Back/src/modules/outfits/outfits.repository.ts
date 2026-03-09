import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { outfitItems, outfits } from '@/db/schema';
import { NotFoundError } from '@/lib/errors';
import type { Outfit, OutfitItem } from '@/models/social';
import type {
  CreateOutfitDto,
  IOutfitsRepository,
  OutfitWithItems,
  UpdateOutfitDto,
} from './interfaces/IOutfitsRepository';

export class OutfitsRepository implements IOutfitsRepository {
  async create(dto: CreateOutfitDto): Promise<OutfitWithItems> {
    const [outfit] = await db.insert(outfits).values({
      user_id: dto.userId,
      name: dto.name,
      is_public: dto.is_public ?? false,
    }).returning();

    let items: OutfitItem[] = [];
    if (dto.items.length > 0) {
      const rows = await db.insert(outfitItems).values(
        dto.items.map((item, index) => ({
          outfit_id: outfit.id,
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
          sort_order: item.sort_order ?? index,
        })),
      ).returning();
      items = rows as OutfitItem[];
    }

    return {
      outfit: outfit as Outfit,
      items,
    };
  }

  async listByUser(userId: string): Promise<OutfitWithItems[]> {
    const outfitRows = await db.select().from(outfits)
      .where(eq(outfits.user_id, userId))
      .orderBy(desc(outfits.created_at));

    if (outfitRows.length === 0) return [];

    const result: OutfitWithItems[] = [];
    for (const outfit of outfitRows) {
      const items = await db.select().from(outfitItems)
        .where(eq(outfitItems.outfit_id, outfit.id))
        .orderBy(asc(outfitItems.sort_order));

      result.push({
        outfit: outfit as Outfit,
        items: items as OutfitItem[],
      });
    }

    return result;
  }

  async update(outfitId: string, userId: string, dto: UpdateOutfitDto): Promise<OutfitWithItems> {
    const [existing] = await db.select().from(outfits)
      .where(and(eq(outfits.id, outfitId), eq(outfits.user_id, userId)))
      .limit(1);

    if (!existing) throw new NotFoundError('Outfit');

    const patch: { name?: string; is_public?: boolean } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.is_public !== undefined) patch.is_public = dto.is_public;

    const [updated] = await db.update(outfits)
      .set(patch)
      .where(eq(outfits.id, outfitId))
      .returning();

    if (dto.items) {
      await db.delete(outfitItems).where(eq(outfitItems.outfit_id, outfitId));
      if (dto.items.length > 0) {
        await db.insert(outfitItems).values(
          dto.items.map((item, index) => ({
            outfit_id: outfitId,
            product_id: item.product_id,
            variant_id: item.variant_id ?? null,
            sort_order: item.sort_order ?? index,
          })),
        );
      }
    }

    const items = await db.select().from(outfitItems)
      .where(eq(outfitItems.outfit_id, outfitId))
      .orderBy(asc(outfitItems.sort_order));

    return {
      outfit: updated as Outfit,
      items: items as OutfitItem[],
    };
  }

  async remove(outfitId: string, userId: string): Promise<void> {
    const deleted = await db.delete(outfits)
      .where(and(eq(outfits.id, outfitId), eq(outfits.user_id, userId)))
      .returning({ id: outfits.id });

    if (deleted.length === 0) throw new NotFoundError('Outfit');
  }
}

export const outfitsRepository = new OutfitsRepository();
