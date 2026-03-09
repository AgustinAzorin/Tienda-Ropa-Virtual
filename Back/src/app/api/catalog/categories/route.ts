import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

interface CategoryNode {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  children: CategoryNode[];
}

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.sort_order), asc(categories.name));

    const byParent = new Map<string | null, CategoryNode[]>();

    for (const row of rows) {
      const key = row.parent_id ?? null;
      const existing = byParent.get(key) ?? [];
      existing.push({ ...row, parent_id: row.parent_id ?? null, image_url: row.image_url ?? null, children: [] });
      byParent.set(key, existing);
    }

    const buildTree = (parentId: string | null): CategoryNode[] => {
      const children = byParent.get(parentId) ?? [];
      return children.map((child) => ({
        ...child,
        children: buildTree(child.id),
      }));
    };

    return ok(buildTree(null));
  } catch (err) {
    return handleError(err);
  }
}
