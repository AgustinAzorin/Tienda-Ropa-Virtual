import { type NextRequest } from 'next/server';
import { postService } from '@/modules/social/posts/posts.service';
import { PostRepository } from '@/modules/social/posts/posts.repository';
import { requireUserId } from '@/lib/auth-helpers';
import { ok } from '@/lib/response';
import { handleError } from '@/lib/errors';

const repo = new PostRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post   = await repo.findById(id);
    return ok(post);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    const body   = await request.json();
    const post   = await postService.updatePost(id, userId, body);
    return ok(post);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId(request);
    await postService.deletePost(id, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
