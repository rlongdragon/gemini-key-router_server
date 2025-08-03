import { NextFunction, Request, Response } from 'express';
import { keyManagementService } from '../services/key-management.service';

export class KeyController {
  static async getKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const keys = await keyManagementService.getKeys();
      res.json(keys);
    } catch (error) {
      next(error);
    }
  }

  static async createKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, api_key, group_id, rpd, is_enabled } = req.body;
      if (!api_key || !group_id) {
        return res.status(400).json({ message: 'api_key and group_id are required' });
      }
      await keyManagementService.createKey({ name, api_key, group_id, rpd, is_enabled });
      res.status(201).json({ message: 'Key created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyId } = req.params;
      const { name, api_key, group_id, rpd, is_enabled } = req.body;
      await keyManagementService.updateKey(keyId, { name, api_key, group_id, rpd, is_enabled });
      res.json({ message: 'Key updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyId } = req.params;
      await keyManagementService.deleteKey(keyId);
      res.json({ message: 'Key deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}