import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as activityService from './activity.service';

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const actionFilter = req.query.action as string | undefined;

    const result = await activityService.getActivities(organizationId, page, limit, actionFilter);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
