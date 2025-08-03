-- 金鑰分組表
CREATE TABLE key_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- API 金鑰表
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    name TEXT,
    api_key TEXT NOT NULL UNIQUE,
    group_id TEXT NOT NULL,
    rpd INTEGER NOT NULL DEFAULT 1000, -- Rate Per Day
    is_enabled INTEGER NOT NULL DEFAULT 1, -- Boolean (0 or 1)
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES key_groups(id) ON DELETE CASCADE
);

-- 系統設定表
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- 插入預設的啟用中金鑰組設定
INSERT INTO system_settings (key, value) VALUES ('active_key_group_id', 'default');
-- 插入一個預設的分組
INSERT INTO key_groups (id, name) VALUES ('default', 'Default Group');