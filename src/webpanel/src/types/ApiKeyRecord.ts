interface ApiKeyRecord {
  id: string;
  name: string;
  api_key: string;
  group_id: string;
  created_at: string;
  lastUsed?: string;
  lastStatus?: 'success' | 'failure';
  lastPromptTokens?: number;
  lastCompletionTokens?: number;
  lastTotalTokens?: number;
  lastErrorCode?: string;
}

export type { ApiKeyRecord };