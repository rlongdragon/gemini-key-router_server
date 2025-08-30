import { dbService } from '../../services/DatabaseService';
import { EventEmitter } from 'events';
import { broadcastSseEvent } from '../controllers/sse.controller';
import { UsageHistoryRecord } from '../../types/database';

class StatsService extends EventEmitter {
  async getGlobalStats() {
    return dbService.getTokenUsageStats();
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