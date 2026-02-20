import { type NextRequest } from 'next/server';
import { catalogService } from '@/modules/catalog/catalog.service';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }   = await params;
    const related  = await catalogService.getRelated(id);
    return ok(related);
  } catch (err) {
    return handleError(err);
  }
}
