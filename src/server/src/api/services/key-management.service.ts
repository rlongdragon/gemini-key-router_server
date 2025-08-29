import { dbService } from '../../services/DatabaseService';
import { ApiKeyRecord } from '../../types/database';
import { keyStatusService } from '../../services/KeyStatusService';

const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length <= 8) {
    return '********'; // 或者其他預設遮罩
  }
  return `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}`;
};

export class KeyManagementService {
  public async getKeys(): Promise<ApiKeyRecord[]> {
    const keys = await dbService.getAllKeys();
    return keys.map(key => ({
      ...key,
      api_key: maskApiKey(key.api_key),
    }));
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
    await dbService.updateKey(id, data);
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