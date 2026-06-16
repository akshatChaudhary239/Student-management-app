import cron from 'node-cron';
import prisma from '../config/db';
import { createNotification } from '../modules/notifications/notification.service';

const NICHE_MEMBER_MAP: Record<string, string> = {
  LIBRARY: 'Student',
  GYM: 'Member',
  COACHING: 'Student',
  TUITION: 'Student',
  DANCE: 'Student',
  YOGA: 'Member',
  TRAINING: 'Trainee',
  STUDY: 'Student'
};

export const startCronJobs = () => {
  // Run every day at 12:00 AM
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily membership expiration check...');
    try {
      const today = new Date();
      
      // 1. Mark as expired
      const expiredMemberships = await prisma.membership.findMany({
        where: {
          endDate: { lt: today },
          member: { status: 'ACTIVE' }
        },
        include: { member: { include: { organization: true } } }
      });

      for (const membership of expiredMemberships) {
        const orgId = membership.member.organizationId;
        const nicheType = membership.member.organization.nicheType;
        const term = NICHE_MEMBER_MAP[nicheType] || 'Member';

        // Update member status
        await prisma.member.update({
          where: { id: membership.memberId },
          data: { status: 'EXPIRED' }
        });

        // Notify
        await createNotification(
          orgId,
          `${term} Membership Expired`,
          `${membership.member.name}'s membership has expired on ${membership.endDate.toDateString()}.`,
          'EXPIRY_ALERT'
        );
      }

      // 2. Warn upcoming expirations (3 days from now)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const expiringSoon = await prisma.membership.findMany({
        where: {
          endDate: { 
            gte: today,
            lte: threeDaysFromNow
          },
          member: { status: 'ACTIVE' }
        },
        include: { member: { include: { organization: true } } }
      });

      for (const membership of expiringSoon) {
        const orgId = membership.member.organizationId;
        const nicheType = membership.member.organization.nicheType;
        const term = NICHE_MEMBER_MAP[nicheType] || 'Member';

        await createNotification(
          orgId,
          `${term} Expiring Soon`,
          `${membership.member.name}'s membership will expire on ${membership.endDate.toDateString()}.`,
          'EXPIRY_WARNING'
        );
      }

      console.log(`[CRON] Processed ${expiredMemberships.length} expirations and ${expiringSoon.length} warnings.`);
    } catch (error) {
      console.error('[CRON] Error running background jobs:', error);
    }
  });
};
