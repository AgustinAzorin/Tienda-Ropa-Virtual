import { db } from '@/db/client';
import { consents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type ConsentType = 'marketing' | 'analytics' | 'biometric' | 'terms';

export interface RecordConsentDto {
  userId:      string;
  consentType: ConsentType;
  version:     string;
  accepted:    boolean;
  ipAddress?:  string;
  userAgent?:  string;
}

export class PrivacyService {

  /** Records a specific consent action with full audit trail. */
  async recordConsent(dto: RecordConsentDto): Promise<void> {
    await db.insert(consents).values({
      user_id:      dto.userId,
      consent_type: dto.consentType,
      version:      dto.version,
      accepted:     dto.accepted,
      ip_address:   dto.ipAddress ?? null,
      user_agent:   dto.userAgent ?? null,
    });
  }

  /** Returns the latest consent record for each type. */
  async getConsentStatus(userId: string): Promise<Record<ConsentType, { accepted: boolean; version: string } | null>> {
    const rows = await db.select().from(consents)
      .where(eq(consents.user_id, userId))
      .orderBy(desc(consents.accepted_at));

    const result: Record<string, { accepted: boolean; version: string } | null> = {
      marketing: null, analytics: null, biometric: null, terms: null,
    };
    for (const row of rows) {
      if (!result[row.consent_type]) {
        result[row.consent_type] = { accepted: row.accepted, version: row.version };
      }
    }
    return result as Record<string, { accepted: boolean; version: string }>;
  }

  /** Full account + data deletion — "Right to be Forgotten" (GDPR art. 17). */
  async requestDataDeletion(userId: string): Promise<void> {
    // Anonymize profile data instead of hard delete where referential integrity requires it
    const { profileService } = await import('@/modules/profile/profile.service');
    await profileService.deleteAccount(userId);
    // Body profile already deleted cascaded from auth.users
    // Log deletion request for GDPR audit
    await db.insert(consents).values({
      user_id:      userId,
      consent_type: 'terms',
      version:      'deletion-request',
      accepted:     false,
      ip_address:   null,
      user_agent:   null,
    });
  }

  /** Returns full consent audit log for a user. */
  async getAuditLog(userId: string) {
    return db.select().from(consents)
      .where(eq(consents.user_id, userId))
      .orderBy(desc(consents.accepted_at));
  }
}

export const privacyService = new PrivacyService();
