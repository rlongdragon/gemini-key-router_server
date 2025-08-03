import { NextFunction, Request, Response } from 'express';
import { systemSettingsService } from '../services/system-settings.service';

export class SystemSettingsController {
  static async updateActiveGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.body;
      if (!groupId) {
        return res.status(400).json({ message: 'groupId is required' });
      }
      await systemSettingsService.updateActiveGroup(groupId);
      res.json({ message: 'Active group updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}