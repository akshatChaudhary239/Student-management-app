import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import * as importService from './import.service';

export const importStudentsData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file uploaded' });
      return;
    }

    const result = await importService.importStudents(organizationId, req.file.buffer);
    
    res.status(200).json({
      status: 'success',
      message: `Import complete. Imported: ${result.imported}, Failed: ${result.failed}`,
      data: result,
    });
  } catch (error: any) {
    console.error('Import Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error processing import' });
  }
};
