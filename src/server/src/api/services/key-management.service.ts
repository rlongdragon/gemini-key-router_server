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
}

export const keyManagementService = new KeyManagementService();