import { db } from '@/db/client';
import { brands } from '@/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(brands)
      .where(and(eq(brands.is_active, true)))
      .orderBy(asc(brands.name));

    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}
