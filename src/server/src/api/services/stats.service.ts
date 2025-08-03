import { dbService } from "../../services/DatabaseService";

class StatsService {
  async getGlobalStats() {
    const allKeys = dbService.getAllKeys();
    const totalUsageToday = dbService.getTotalUsageToday();

    const totalRpd = allKeys.reduce((sum, key) => sum + (key.rpd || 0), 0);
    const remainingQuota = totalRpd - totalUsageToday;

    return {
      totalRpd,
      totalUsageToday,
      remainingQuota,
    };
  }
}

export const statsService = new StatsService();