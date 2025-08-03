import { dbService } from '../../services/DatabaseService';
import { KeyGroupRecord } from '../../types/database';

export class GroupManagementService {
  public async getGroups(): Promise<KeyGroupRecord[]> {
    return dbService.getAllGroups();
  }

  public async createGroup(
    group: Omit<KeyGroupRecord, 'id' | 'created_at'>,
  ): Promise<void> {
    return dbService.createGroup(group);
  }

  public async updateGroup(
    id: string,
    data: Partial<Omit<KeyGroupRecord, 'id' | 'created_at'>>,
  ): Promise<void> {
    return dbService.updateGroup(id, data);
  }

  public async deleteGroup(id: string): Promise<void> {
    return dbService.deleteGroup(id);
  }
}

export const groupManagementService = new GroupManagementService();