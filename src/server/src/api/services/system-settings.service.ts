import { dbService } from '../../services/DatabaseService';

export class SystemSettingsService {
  public async updateActiveGroup(groupId: string): Promise<void> {
    return dbService.setSetting('active_group', groupId);
  }
}

export const systemSettingsService = new SystemSettingsService();