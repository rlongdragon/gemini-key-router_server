interface ApiKeyRecord {
  id: string;
  name: string;
  api_key: string;
  group_id: string;
  is_enabled: boolean;
  created_at: string;
}

export type { ApiKeyRecord };