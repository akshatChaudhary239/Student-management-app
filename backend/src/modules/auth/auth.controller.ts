import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.registerOwner(req.body);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Owner with this email or mobile already exists') {
      res.status(409).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Registration Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginOwner(req.body);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password' || error.message === 'No organization found for this owner') {
      res.status(401).json({ status: 'error', message: error.message });
      return;
    }
    console.error('Login Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
