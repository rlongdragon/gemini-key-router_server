-- 創建 usage_history 資料表
CREATE TABLE IF NOT EXISTS usage_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId TEXT NOT NULL UNIQUE,
    apiKeyId TEXT NOT NULL,
    keyGroupId TEXT,
    clientIdentifier TEXT,
    modelId TEXT NOT NULL,
    status TEXT NOT NULL,
    errorCode TEXT,
    errorMessage TEXT,
    latency INTEGER NOT NULL,
    promptTokens INTEGER,
    completionTokens INTEGER,
    totalTokens INTEGER,
    estimatedCost REAL,
    timestamp TEXT NOT NULL
);

-- 為常用查詢欄位建立索引以優化效能
CREATE INDEX IF NOT EXISTS idx_apikey_timestamp ON usage_history (apiKeyId, timestamp);