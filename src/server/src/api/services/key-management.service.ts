import { dbService } from '../../services/DatabaseService';
import { ApiKeyRecord } from '../../types/database';

export class KeyManagementService {
  public async getKeys(): Promise<ApiKeyRecord[]> {
    return dbService.getAllKeys();
  }

  public async createKey(
    key: Omit<ApiKeyRecord, 'id' | 'created_at'>,
  ): Promise<void> {
    return dbService.createKey(key);
  }

  public async updateKey(
    id: string,
    data: Partial<Omit<ApiKeyRecord, 'id' | 'created_at'>>,
  ): Promise<void> {
    return dbService.updateKey(id, data);
  }

  public async deleteKey(id: string): Promise<void> {
    return dbService.deleteKey(id);
  }

  public async getKeyById(id: string): Promise<ApiKeyRecord> {
    return dbService.getKey(id);
  }

  public async getKeyIds(): Promise<{ [key: string]: string[] }> {
    const keys = await dbService.getAllKeys();
    const groupedKeys: { [key: string]: string[] } = {};

    for (const key of keys) {
      if (!groupedKeys[key.group_id]) {
        groupedKeys[key.group_id] = [];
      }
      groupedKeys[key.group_id].push(key.id);
    }

    return groupedKeys;
  }

  public async getKeysByGroupId(groupId: string): Promise<ApiKeyRecord[]> {
    return dbService.getKeysByGroupId(groupId);
  }
}

export const keyManagementService = new KeyManagementService();