import { NextFunction, Request, Response } from 'express';
import { statsService } from '../services/stats.service';

export class StatsController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getGlobalStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getUsageHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const history = await statsService.getUsageHistory();
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}