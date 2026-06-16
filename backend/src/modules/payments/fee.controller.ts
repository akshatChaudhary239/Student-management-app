import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as feeService from './fee.service';

export const recordFee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const result = await feeService.recordFee(organizationId, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Record Fee Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getStudentFeeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const memberId = req.params.memberId as string;
    const history = await feeService.getStudentFeeHistory(organizationId, memberId);
    
    res.status(200).json({ status: 'success', data: history });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Get Member Fee History Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAllFees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await feeService.getAllFees(organizationId, page, limit);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Get All Fees Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
