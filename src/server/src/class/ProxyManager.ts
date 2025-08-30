
import { Request } from 'express';
import { randomUUID } from 'crypto';
import ApiKeysManager from "./ApiKeysManager";
import { dbService } from '../services/DatabaseService';
import { UsageRecord } from '../types/database';
import { broadcastSseEvent } from '../api/controllers/sse.controller';
import { statsService } from '../api/services/stats.service';
import { LanguageModelUsage } from 'ai';

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

    broadcastSseEvent('key_usage_start', { keyId: apiKey.id });

    try {
      const result = await apiKey.sendRequest(modelId, req.body, isStreaming);
      const latency = Date.now() - startTime;

      if (isStreaming) {
        result.usage
          .then(async (usage: LanguageModelUsage) => {
            const record: UsageRecord = {
              requestId,
              apiKeyId: apiKey.id,
              keyGroupId: groupId,
              clientIdentifier: req.ip || null,
              modelId,
              status: "success",
              latency,
              promptTokens: usage.inputTokens ?? null,
              completionTokens: usage.outputTokens ?? null,
              totalTokens: usage.totalTokens ?? null,
              estimatedCost: 0, // Placeholder
              timestamp: new Date(startTime).toISOString(),
              errorCode: null,
              errorMessage: null,
            };
            await dbService.addUsageRecord(record);
            broadcastSseEvent('key_usage_end', record);
            await statsService.broadcastStatsUpdate();
          })
          .catch((error: any) => {
            console.error(
              `[${requestId}] Failed to record usage for streaming request:`,
              error
            );
          });
      } else {
        const usage = result.usage as LanguageModelUsage;
        const record: UsageRecord = {
          requestId,
          apiKeyId: apiKey.id,
          keyGroupId: groupId,
          clientIdentifier: req.ip || null,
          modelId,
          status: "success",
          latency,
          promptTokens: usage.inputTokens ?? null,
          completionTokens: usage.outputTokens ?? null,
          totalTokens: usage.totalTokens ?? null,
          estimatedCost: 0, // Placeholder
          timestamp: new Date(startTime).toISOString(),
          errorCode: null,
          errorMessage: null,
        };
        await dbService.addUsageRecord(record);
        broadcastSseEvent('key_usage_end', record);
        await statsService.broadcastStatsUpdate();
      }

      return result;
    } catch (error: any) {
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
      broadcastSseEvent('key_usage_end', record);
      await statsService.broadcastStatsUpdate();
      throw error;
    }
  }
}