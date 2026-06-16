import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as notificationService from './notification.service';

export const saveToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.ownerId;
    if (!ownerId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { pushToken } = req.body;
    const result = await notificationService.saveOwnerPushToken(ownerId, pushToken);
    
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message === 'Invalid Expo push token') {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Save Push Token Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getNotifications(organizationId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const notificationId = req.params.id as string;
    const result = await notificationService.markAsRead(organizationId, notificationId);
    
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const result = await notificationService.markAllAsRead(organizationId);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
