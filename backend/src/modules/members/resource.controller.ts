import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as seatService from './resource.service';

export const getSeats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const result = await seatService.getSeats(organizationId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Get Resources Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const assignSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { memberId, resourceName } = req.body;
    const result = await seatService.assignSeat(organizationId, memberId, resourceName);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('already occupied') || error.message.includes('inactive')) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Assign Resource Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const unassignSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { memberId } = req.body;
    const result = await seatService.unassignSeat(organizationId, memberId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('not have a resource')) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Unassign Resource Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
