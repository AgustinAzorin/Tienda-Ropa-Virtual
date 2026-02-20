import { db } from '@/db/client';
import { notifications, restockSubscriptions } from '@/db/schema';
import { eq, and, sql, type SQL } from 'drizzle-orm';
import type { Notification } from '@/models/notifications/Notification';

export interface CreateNotificationDto {
  userId:         string;
  type:           Notification['type'];
  actorId?:       string;
  referenceId?:   string;
  referenceType?: Notification['reference_type'];
}

export class NotificationRepository {

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const [row] = await db.insert(notifications).values({
      user_id:        dto.userId,
      type:           dto.type,
      actor_id:       dto.actorId ?? null,
      reference_id:   dto.referenceId ?? null,
      reference_type: dto.referenceType ?? null,
    }).returning();
    return row as unknown as Notification;
  }

  async listForUser(userId: string, onlyUnread = false): Promise<Notification[]> {
    const conditions: SQL<unknown>[] = [eq(notifications.user_id, userId)];
    if (onlyUnread) conditions.push(eq(notifications.is_read, false));
    return db.select().from(notifications)
      .where(and(...conditions))
      .orderBy(sql`${notifications.created_at} DESC`) as Promise<Notification[]>;
  }

  async markRead(id: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ is_read: true })
      .where(and(eq(notifications.id, id), eq(notifications.user_id, userId)));
  }

  async markAllRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ is_read: true })
      .where(eq(notifications.user_id, userId));
  }

  async subscribeToRestock(userId: string, variantId: string): Promise<void> {
    await db.insert(restockSubscriptions)
      .values({ user_id: userId, variant_id: variantId })
      .onConflictDoNothing();
  }

  /** Called when a variant's stock goes from 0 → >0. */
  async notifyRestock(variantId: string): Promise<void> {
    const subs = await db.select({ user_id: restockSubscriptions.user_id })
      .from(restockSubscriptions)
      .where(eq(restockSubscriptions.variant_id, variantId));

    if (!subs.length) return;

    await db.insert(notifications).values(
      subs.map((s) => ({
        user_id:        s.user_id,
        type:           'restock' as const,
        reference_id:   variantId,
        reference_type: 'product' as const,
      }))
    );
  }
}

export class NotificationService {
  constructor(private readonly repo = new NotificationRepository()) {}

  async send(dto: CreateNotificationDto): Promise<Notification> {
    return this.repo.create(dto);
  }

  async list(userId: string): Promise<Notification[]> {
    return this.repo.listForUser(userId);
  }

  async markRead(id: string, userId: string): Promise<void> {
    return this.repo.markRead(id, userId);
  }

  async markAllRead(userId: string): Promise<void> {
    return this.repo.markAllRead(userId);
  }

  async subscribeRestock(userId: string, variantId: string): Promise<void> {
    return this.repo.subscribeToRestock(userId, variantId);
  }

  async triggerRestock(variantId: string): Promise<void> {
    return this.repo.notifyRestock(variantId);
  }
}

export const notificationService = new NotificationService();
