import { dbService } from '../../services/DatabaseService';

export class SystemSettingsService {
  public async updateActiveGroup(groupId: string): Promise<void> {
    return dbService.setSetting("active_key_group_id", groupId);
  }
}

export const systemSettingsService = new SystemSettingsService();