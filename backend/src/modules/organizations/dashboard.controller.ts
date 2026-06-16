import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as dashboardService from './dashboard.service';

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized: No organization context' });
      return;
    }

    const metrics = await dashboardService.getDashboardMetrics(organizationId);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalStudents: metrics.members.total,
        activeStudents: metrics.members.active,
        availableSeats: metrics.resources.available,
        expiringSoon: metrics.fees.dueThisWeek, // Using this as expiring soon representation
        overdueFees: metrics.members.overdue, // Simplified mapping
      },
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
