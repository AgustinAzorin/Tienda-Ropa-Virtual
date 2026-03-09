import { type NextRequest } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { addresses } from '@/db/schema';
import { requireUserId } from '@/lib/auth-helpers';
import { created, ok } from '@/lib/response';
import { handleError, ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const rows = await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, userId))
      .orderBy(desc(addresses.is_default), desc(addresses.created_at));

    return ok(rows);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = await request.json();

    const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
    const streetLine1 = typeof body?.street_line1 === 'string' ? body.street_line1.trim() : '';
    const city = typeof body?.city === 'string' ? body.city.trim() : '';
    const country = typeof body?.country === 'string' ? body.country.trim() : 'AR';
    const isDefault = Boolean(body?.is_default);

    if (!fullName || !streetLine1 || !city) {
      throw new ValidationError('full_name, street_line1 y city son requeridos');
    }

    if (isDefault) {
      await db
        .update(addresses)
        .set({ is_default: false })
        .where(and(eq(addresses.user_id, userId), eq(addresses.is_default, true)));
    }

    const [row] = await db
      .insert(addresses)
      .values({
        user_id: userId,
        full_name: fullName,
        phone: typeof body?.phone === 'string' ? body.phone : null,
        street_line1: streetLine1,
        street_line2: typeof body?.street_line2 === 'string' ? body.street_line2 : null,
        city,
        state: typeof body?.state === 'string' ? body.state : null,
        postal_code: typeof body?.postal_code === 'string' ? body.postal_code : null,
        country,
        is_default: isDefault,
      })
      .returning();

    return created(row);
  } catch (err) {
    return handleError(err);
  }
}
