import { interactionsRepository } from './interactions.repository';
import type { Comment } from '@/models/social/Comment';
import type { Save } from '@/models/social/Save';

export class InteractionsService {

  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean }> {
    // Check current state (simplified — real impl should check likes table)
    try {
      await interactionsRepository.like(userId, postId);
      return { liked: true };
    } catch {
      await interactionsRepository.unlike(userId, postId);
      return { liked: false };
    }
  }

  async comment(userId: string, postId: string, body: string, parentId?: string): Promise<Comment> {
    return interactionsRepository.createComment(userId, postId, body, parentId);
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    return interactionsRepository.deleteComment(id, userId);
  }

  async listComments(postId: string): Promise<Comment[]> {
    return interactionsRepository.listComments(postId);
  }

  async saveItem(userId: string, productId?: string, postId?: string, collection?: string): Promise<Save> {
    return interactionsRepository.save(userId, productId, postId, collection);
  }

  async unsaveItem(id: string, userId: string): Promise<void> {
    return interactionsRepository.unsave(id, userId);
  }

  async listSaves(userId: string, collection?: string): Promise<Save[]> {
    return interactionsRepository.listSaves(userId, collection);
  }
}

export const interactionsService = new InteractionsService();
