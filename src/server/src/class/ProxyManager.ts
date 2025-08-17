import { Request } from 'express';
import { randomUUID } from 'crypto';
import ApiKeysManager from "./ApiKeysManager";
import { dbService } from '../services/DatabaseService';
import { keyStatusService } from '../services/KeyStatusService';
import { UsageRecord } from '../types/database';

export default class ProxyManager {
  private apiKeys: ApiKeysManager;

  private constructor(apiKeysManager: ApiKeysManager) {
    this.apiKeys = apiKeysManager;
  }

  public static async createInstance(): Promise<ProxyManager> {
    const apiKeysManager = new ApiKeysManager();
    await apiKeysManager.loadKeysFromDb();
    return new ProxyManager(apiKeysManager);
  }

  public async proxy(req: Request) {
    const requestId = randomUUID();
    const startTime = Date.now();
    const modelId = (req.params as any).modelId;
    const isStreaming = req.path.includes(':streamGenerateContent');
    const groupId = this.apiKeys.curentGroupId;

    if (!groupId) {
      throw new Error('No active key group loaded.');
    }

    const apiKey = this.apiKeys.getNextAvailableKey(groupId);

    if (!apiKey) {
      throw new Error('No available API keys in the active group.');
    }

    keyStatusService.updateKeyStatus(apiKey.id, 'pending');

    try {
      const result = await apiKey.sendRequest(modelId, req.body, isStreaming);
      const latency = Date.now() - startTime;

      // console.log(result);

      let usageMetadata = result.usageMetadata || {};

      if (isStreaming) {
        const finalResponse = await result.response;
        usageMetadata = finalResponse.usageMetadata;
      } 
      
      const { promptTokenCount, candidatesTokenCount, totalTokenCount } =
        usageMetadata || {
          promptTokenCount: null,
          candidatesTokenCount: null,
          totalTokenCount: null,
        };

      keyStatusService.updateKeyStatus(apiKey.id, 'available');
      const record: UsageRecord = {
        requestId,
        apiKeyId: apiKey.id,
        keyGroupId: groupId,
        clientIdentifier: req.ip || null,
        modelId,
        status: 'success',
        latency,
        promptTokens: promptTokenCount,
        completionTokens: candidatesTokenCount,
        totalTokens: totalTokenCount,
        estimatedCost: 0, // Placeholder
        timestamp: new Date(startTime).toISOString(),
        errorCode: null,
        errorMessage: null,
      };
      await dbService.addUsageRecord(record);

      return result;
    } catch (error: any) {
      if (error.statusCode === 429) {
        keyStatusService.updateKeyStatus(apiKey.id, 'exhausted');
      } else {
        keyStatusService.updateKeyStatus(apiKey.id, 'available');
      }
      const latency = Date.now() - startTime;
      const record: UsageRecord = {
        requestId,
        apiKeyId: apiKey.id,
        keyGroupId: groupId,
        clientIdentifier: req.ip || null,
        modelId,
        status: 'failure',
        latency,
        promptTokens: null,
        completionTokens: null,
        totalTokens: null,
        estimatedCost: 0,
        timestamp: new Date(startTime).toISOString(),
        errorCode: String(error.statusCode) || null,
        errorMessage: error.message || 'An unknown error occurred',
      };
      await dbService.addUsageRecord(record);
      throw error;
    }
  }
}