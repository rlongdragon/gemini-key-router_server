import { NextFunction, Request, Response } from 'express';
import { groupManagementService } from '../services/group-management.service';

export class GroupController {
  static async getAllGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupManagementService.getAllGroups();
      res.json(groups);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupManagementService.getActiveGroup();
      if (group) {
        res.json(group);
      } else {
        res.status(404).json({ message: 'No active group found' });
      }
    } catch (error) {
      next(error);
    }
  }

  static async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const newGroup = await groupManagementService.createGroup({ name });
      res.status(201).json(newGroup);
    } catch (error) {
      next(error);
    }
  }

  static async setActiveGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      await groupManagementService.setActiveGroup(id);
      res.status(200).json({ message: 'Active group set successfully' });
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