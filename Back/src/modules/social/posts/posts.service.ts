import { postRepository, type CreatePostDto, type FeedItem } from './posts.repository';
import { resizeAndUpload } from '@/lib/storage';
import { NotFoundError, ForbiddenError } from '@/lib/errors';
import type { Post } from '@/models/social/Post';
import type { PostProductTag } from '@/models/social/PostProductTag';

export class PostService {

  async createPost(
    dto: CreatePostDto,
    images: Array<{ buffer: ArrayBuffer; filename: string }>,
    productTags: Omit<PostProductTag, 'id' | 'post_id'>[],
  ): Promise<Post> {
    const post = await postRepository.create(dto);

    // Upload images in parallel
    const urls = await Promise.all(
      images.map((img, i) =>
        resizeAndUpload(img.buffer, 'posts', `${dto.userId}/${post.id}/${i}.webp`)
      )
    );

    await postRepository.addImages(post.id, urls);
    await postRepository.addProductTags(post.id, productTags);
    return post;
  }

  async updatePost(
    postId: string,
    userId: string,
    updates: Partial<Pick<Post, 'caption' | 'visibility'>>,
  ): Promise<Post> {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post');
    if (post.user_id !== userId) throw new ForbiddenError();
    return postRepository.update(postId, updates);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await postRepository.findById(postId);
    if (!post) throw new NotFoundError('Post');
    if (post.user_id !== userId) throw new ForbiddenError();
    await postRepository.delete(postId);
  }

  async getPersonalizedFeed(userId: string, cursor?: string): Promise<FeedItem[]> {
    return postRepository.getFeedForUser(userId, cursor);
  }

  async getDiscoveryFeed(): Promise<Post[]> {
    return postRepository.getDiscoveryFeed();
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return postRepository.listByUser(userId);
  }
}

export const postService = new PostService();
