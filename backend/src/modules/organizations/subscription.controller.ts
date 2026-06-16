import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as subscriptionService from './subscription.service';
import prisma from '../../config/db';

export const getCurrentSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const subscription = await subscriptionService.getCurrentSubscription(organizationId);
    
    // Also fetch current usage
    const currentStudentCount = await prisma.member.count({
      where: { organizationId },
    });

    res.status(200).json({ 
      status: 'success', 
      data: {
        ...subscription,
        usage: {
          currentStudents: currentStudentCount,
          maxStudents: subscription.plan.maxStudents,
          remaining: subscription.plan.maxStudents - currentStudentCount,
        }
      } 
    });
  } catch (error: any) {
    if (error.message.includes('No active subscription')) {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Get Subscription Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
