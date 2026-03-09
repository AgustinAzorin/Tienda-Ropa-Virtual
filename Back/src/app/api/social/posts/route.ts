import { type NextRequest } from 'next/server';
import { postService } from '@/modules/social/posts/posts.service';
import { requireUserId } from '@/lib/auth-helpers';
import { created } from '@/lib/response';
import { handleError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const fd     = await request.formData();
    const body   = JSON.parse(fd.get('data') as string);
    const files  = fd.getAll('images') as File[];
    const productTags = ((body.productTags ?? []) as Array<{
      product_id: string;
      x_position: string | number;
      y_position: string | number;
    }>).map((t) => ({
      product_id: t.product_id,
      x_position: Number(t.x_position),
      y_position: Number(t.y_position),
    }));
    const images = await Promise.all(files.map(async (f) => ({
      buffer: await f.arrayBuffer(),
      filename: f.name,
    })));
    const post   = await postService.createPost({ userId, ...body }, images, productTags);
    return created(post);
  } catch (err) {
    return handleError(err);
  }
}
