import { dbService } from '../../services/DatabaseService';
import { EventEmitter } from 'events';
import { broadcastSseEvent } from '../controllers/sse.controller';
import { UsageHistoryRecord } from '../../types/database';

class StatsService extends EventEmitter {
  async getGlobalStats() {
    const allKeys = await dbService.getAllKeys();
    const totalUsageToday = await dbService.getTotalUsageToday();

    const totalRpd = allKeys.reduce((sum, key) => sum + (key.rpd || 0), 0);
    const remainingQuota = totalRpd - totalUsageToday;

    return {
      totalRpd,
      totalUsageToday,
      remainingQuota,
    };
  }

  async getUsageHistory() {
    return dbService.getUsageHistory();
  }

  async logUsage(
    usage: Omit<UsageHistoryRecord, 'id' | 'timestamp'>,
  ): Promise<void> {
    const newUsage = await dbService.createUsageHistory(usage);
    this.emit('new_usage', newUsage);
  }

  public async broadcastStatsUpdate(): Promise<void> {
    const stats = await this.getGlobalStats();
    broadcastSseEvent('stats_update', stats);
  }
}

export const statsService = new StatsService();