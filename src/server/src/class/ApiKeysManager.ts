import ApiKey from "./ApiKey";
import { GenerateContentRequest } from "@google/generative-ai";
import { dbService } from '../services/DatabaseService';
import { ApiKeyRecord } from '../types/database';

class ApiKeyGroup {
  private apiKeys: ApiKey[];
  private currentIndex: number = 0;

  public id: string;
  public name: string;

  constructor(id: string, name: string = "") {
    this.id = id;
    this.name = name;
    this.apiKeys = [];
  }

  addApiKey(apiKey: ApiKey) {
    this.apiKeys.push(apiKey);
  }

  getApiKey(id: string): ApiKey | undefined {
    return this.apiKeys.find(key => key.id === id);
  }

  public getNextAvailableKey(): ApiKey | undefined {
    if (this.apiKeys.length === 0) {
      return undefined;
    }

    const initialIndex = this.currentIndex;
    do {
      const apiKey = this.apiKeys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;

      const usageCount = dbService.getUsageCountToday(apiKey.id);
      if (usageCount < apiKey.rpd) {
        return apiKey;
      }
    } while (this.currentIndex !== initialIndex);

    return undefined;
  }
}

class ApiKeysManager {
  public curentGroupId: string | null = null;
  private apiKeyGroups: Map<string, ApiKeyGroup>;

  constructor() {
    this.apiKeyGroups = new Map();
  }

  public async loadKeysFromDb(): Promise<void> {
    const activeGroupId = await dbService.getSetting('active_key_group_id') || 'default';
    this.curentGroupId = activeGroupId;

    const keysFromDb: ApiKeyRecord[] = await dbService.getKeysByGroup(activeGroupId);

    this.apiKeyGroups.clear();

    const group = new ApiKeyGroup(activeGroupId);
    this.apiKeyGroups.set(activeGroupId, group);

    keysFromDb.forEach(item => {
      if (item.is_enabled) {
        const apiKey = new ApiKey(item.id, item.api_key, item.rpd || 1000);
        group.addApiKey(apiKey);
      }
    });
  }

  addApiKey(apiKey: ApiKey, groupId: string) {
    if (!this.apiKeyGroups.has(groupId)) {
      this.apiKeyGroups.set(groupId, new ApiKeyGroup(groupId));
    }
    this.apiKeyGroups.get(groupId)?.addApiKey(apiKey);
  }

  getApiKey(id: string): ApiKey | undefined {
    for (const group of this.apiKeyGroups.values()) {
      const apiKey = group.getApiKey(id);
      if (apiKey) {
        return apiKey;
      }
    }
    return undefined;
  }

  public getNextAvailableKey(groupId: string): ApiKey | undefined {
    const group = this.apiKeyGroups.get(groupId);
    if (group) {
      return group.getNextAvailableKey();
    }
    return undefined;
  }

  removeApiKey(id: string): boolean {
    // This method needs to be adapted to the new data structure.
    // For now, it will not work as expected.
    return false;
  }

  listApiKeys(): ApiKey[] {
    let allKeys: ApiKey[] = [];
    for (const group of this.apiKeyGroups.values()) {
      // This assumes ApiKeyGroup has a method to get all its keys
      // allKeys = allKeys.concat(group.listApiKeys());
    }
    return allKeys;
  }
}

export default ApiKeysManager;
