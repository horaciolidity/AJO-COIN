import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Tap Speed Validation Middleware
 * Fully unblocked to allow smooth, unrestricted tapping gameplay.
 */
export const validateTapSpeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Allow all tap speeds freely without blocking screen
  return next();
};
