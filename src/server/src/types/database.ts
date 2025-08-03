export interface UsageRecord {
  requestId: string;
  apiKeyId: string;
  model: string; // Corresponds to modelId in the schema
  status: string;
  latency: number;
  requestTokens: number; // Corresponds to promptTokens
  responseTokens: number; // Corresponds to completionTokens
  cost: number; // Corresponds to estimatedCost
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