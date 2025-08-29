export interface UsageRecord {
  requestId: string;
  apiKeyId: string;
  keyGroupId: string | null;
  clientIdentifier: string | null;
  modelId: string;
  status: 'success' | 'failure';
  latency: number;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  estimatedCost: number | null;
  timestamp: string;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface ApiKeyRecord {
  id: string;
  name: string | null;
  api_key: string;
  group_id: string;
  rpd: number;
  is_enabled: 1 | 0;
  created_at: string;
}

export interface KeyGroupRecord {
  id: string;
  name: string;
  created_at: string;
}

export interface UsageHistoryRecord {
 id: number;
 timestamp: string;
 api_key_id: string;
 status: 'success' | 'error';
 error_message: string | null;
}