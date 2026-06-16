import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as studentService from './member.service';

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const member = await studentService.createStudent(organizationId, req.body);
    res.status(201).json({ status: 'success', data: member });
  } catch (error: any) {
    if (error.message.includes('already exists') || error.message.includes('already occupied')) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Create Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await studentService.getStudents(organizationId, page, limit, search);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Get Members Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const member = await studentService.getStudentById(organizationId, req.params.id as string);
    res.status(200).json({ status: 'success', data: member });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Get Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const member = await studentService.updateStudent(organizationId, req.params.id as string, req.body);
    res.status(200).json({ status: 'success', data: member });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Update Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const renewStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const member = await studentService.renewStudent(organizationId, req.params.id as string, req.body);
    res.status(200).json({ status: 'success', data: member });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Renew Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const cancelStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const member = await studentService.cancelStudent(organizationId, req.params.id as string);
    res.status(200).json({ status: 'success', data: member });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Cancel Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    await studentService.deleteStudent(organizationId, req.params.id as string);
    res.status(200).json({ status: 'success', message: 'Member removed successfully' });
  } catch (error: any) {
    if (error.message === 'Member not found') {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Delete Member Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
