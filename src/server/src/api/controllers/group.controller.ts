import { NextFunction, Request, Response } from 'express';
import { groupManagementService } from '../services/group-management.service';

export class GroupController {
  static async getGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupManagementService.getGroups();
      res.json(groups);
    } catch (error) {
      next(error);
    }
  }

  static async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'name is required' });
      }
      await groupManagementService.createGroup({ name });
      res.status(201).json({ message: 'Group created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'name is required' });
      }
      await groupManagementService.updateGroup(groupId, { name });
      res.json({ message: 'Group updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      await groupManagementService.deleteGroup(groupId);
      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}