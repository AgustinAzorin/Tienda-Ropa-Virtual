import { type NextRequest } from 'next/server';
import { interactionsService } from '@/modules/social/interactions/interactions.service';
import { InteractionsRepository } from '@/modules/social/interactions/interactions.repository';
import { requireUserId } from '@/lib/auth-helpers';
import { ok, created } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new InteractionsRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }    = await params;
    const parentId  = request.nextUrl.searchParams.get('parentId') ?? undefined;
    const cursor    = request.nextUrl.searchParams.get('cursor') ?? undefined;
    const comments  = await repo.listComments(id, parentId, { cursor });
    return ok(comments);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    const body   = await request.json();
    const comment = await interactionsService.comment(userId, id, body.content, body.parentId);
    return created(comment);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  _params?: { params: Promise<{ id: string }> },
) {
  try {
    const userId    = await requireUserId(request);
    const commentId = request.nextUrl.searchParams.get('commentId')!;
    await interactionsService.deleteComment(commentId, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
