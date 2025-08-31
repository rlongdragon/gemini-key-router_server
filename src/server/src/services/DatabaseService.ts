import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import {
  ApiKeyRecord,
  KeyGroupRecord,
  UsageRecord,
  UsageHistoryRecord,
} from "../types/database";
import crypto from "crypto";

// Define the structure of the config file
interface Config {
  database: {
    path: string;
    retentionHours: number;
  };
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor() {
    console.log("#1SAL Initializing DatabaseService...");

    // Load configuration
    const configPath = path.join(
      __dirname,
      "..",
      "..",
      "config",
      "config.json"
    );
    const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    // Ensure the database directory exists
    const dbPath = path.dirname(config.database.path);
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // Connect to the database
    this.db = new Database(config.database.path);
    const absoluteDbPath = path.resolve(config.database.path);
    // console.log(`#C1NS Connected to database at ${absoluteDbPath}`);

    // Initialize the database
    this.runMigrations();
    // Run cleanup once on startup
    this.cleanupOldRecords();
    // Schedule cleanup to run every hour
    setInterval(() => this.cleanupOldRecords(), 60 * 60 * 1000);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private runMigrations(): void {
    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY
      );
    `);

    // Get executed migrations
    const executedMigrations = this.db
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row: any) => row.version);

    // Read migration files
    const migrationsDir = path.join(__dirname, "..", "db", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Execute new migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        const migrationSql = fs.readFileSync(
          path.join(migrationsDir, file),
          "utf-8"
        );
        this.db.exec(migrationSql);
        this.db
          .prepare("INSERT INTO schema_migrations (version) VALUES (?)")
          .run(file);
        console.log(`Migration executed: ${file}`);
      }
    }
  }

  private cleanupOldRecords(): void {
    const configPath = path.join(
      __dirname,
      "..",
      "..",
      "config",
      "config.json"
    );
    const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const retentionHours = config.database.retentionHours;

    if (retentionHours > 0) {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - retentionHours);
      const isoString = cutoffDate.toISOString();

      const stmt = this.db.prepare(`
        DELETE FROM usage_history
        WHERE timestamp < ?
          AND id NOT IN (
            SELECT id
            FROM (
              SELECT id, ROW_NUMBER() OVER(PARTITION BY apiKeyId ORDER BY timestamp DESC) as rn
              FROM usage_history
            )
            WHERE rn = 1
          )
      `);
      const result = stmt.run(isoString);
      console.log(`Cleaned up ${result.changes} old records, keeping the last known state for each key.`);
    }
  }

  /**
   * Adds a new usage record to the database.
   * (Implementation to be added in a future task)
   * @param record - The usage record to add.
   */
  public addUsageRecord(record: UsageRecord): void {
    console.log("Adding usage record:", record);
    const stmt = this.db.prepare(
      `INSERT INTO usage_history (
        requestId, apiKeyId, keyGroupId, clientIdentifier, modelId,
        status, latency, promptTokens, completionTokens, totalTokens,
        estimatedCost, timestamp, errorCode, errorMessage
      ) VALUES (
        @requestId, @apiKeyId, @keyGroupId, @clientIdentifier, @modelId,
        @status, @latency, @promptTokens, @completionTokens, @totalTokens,
        @estimatedCost, @timestamp, @errorCode, @errorMessage
      )`
    );
    stmt.run(record);

    console.log(`Usage record added with requestId: ${record.requestId}`);
  }

  /**
   * Gets the number of times an API key has been used today.
   * (Implementation to be added in a future task)
   * @param apiKeyId - The ID of the API key.
   * @returns The number of uses today.
   */
  public getUsageCountToday(apiKeyId: string): number {
    const startOfToday = this.getStartOfTodayInPST();
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM usage_history WHERE apiKeyId = ? AND timestamp >= ?"
    );
    const result = stmt.get(apiKeyId, startOfToday) as { count: number };
    return result.count;
  }

  public getTotalUsageToday(): number {
    const startOfToday = this.getStartOfTodayInPST();
    const stmt = this.db.prepare(
      "SELECT COUNT(*) as count FROM usage_history WHERE timestamp >= ?"
    );
    const result = stmt.get(startOfToday) as { count: number };
    return result.count;
  }

  private getStartOfTodayInPST(): string {
    const losAngelesDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    losAngelesDate.setHours(0, 0, 0, 0);
    return losAngelesDate.toISOString();
  }

  public getUsageHistory(limit = 100): UsageRecord[] {
    const stmt = this.db.prepare(
      "SELECT * FROM usage_history ORDER BY timestamp DESC LIMIT ?"
    );
    return stmt.all(limit) as UsageRecord[];
  }

  public getTokenUsageStats(): { totalRequests: number; totalInputTokens: number; totalOutputTokens: number } {
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();
    const stmt = this.db.prepare(
      `SELECT
        COUNT(*) as totalRequests,
        SUM(promptTokens) as totalInputTokens,
        SUM(completionTokens) as totalOutputTokens
      FROM usage_history
      WHERE timestamp >= ?`
    );
    const result = stmt.get(twentyFourHoursAgo) as { totalRequests: number; totalInputTokens: number | null; totalOutputTokens: number | null };
    return {
      totalRequests: result?.totalRequests || 0,
      totalInputTokens: result?.totalInputTokens || 0,
      totalOutputTokens: result?.totalOutputTokens || 0,
    };
  }

  public createUsageHistory(
    usage: Omit<UsageHistoryRecord, "id" | "timestamp">
  ): UsageHistoryRecord {
    const stmt = this.db.prepare(
      "INSERT INTO usage_history (api_key_id, status, error_message) VALUES (?, ?, ?)"
    );
    const result = stmt.run(
      usage.api_key_id,
      usage.status,
      usage.error_message
    );
    const newUsage = this.db
      .prepare("SELECT * FROM usage_history WHERE id = ?")
      .get(result.lastInsertRowid);
    return newUsage as UsageHistoryRecord;
  }

  // --- API Key Management ---

  public createKey(key: Omit<ApiKeyRecord, "id" | "created_at">): void {
    console.log("Creating new API key:", key);
    const stmt = this.db.prepare(
      `INSERT INTO api_keys (id, name, api_key, group_id, rpd, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      crypto.randomUUID(),
      key.name,
      key.api_key,
      key.group_id,
      key.rpd,
      key.is_enabled ? 1 : 0
    );

    console.log(`API key created with ID: ${result.lastInsertRowid}`);
  }

  public getKey(id: string): ApiKeyRecord {
    const stmt = this.db.prepare("SELECT * FROM api_keys WHERE id = ?");
    return stmt.get(id) as ApiKeyRecord;
  }

  // public getKeysByGroupId(groupId: string): ApiKeyRecord[] {
  //   const stmt = this.db.prepare("SELECT * FROM api_keys WHERE group_id = ?");
  //   console.log(`#HS55 Fetching keys for group:${groupId}`);
  //   console.log(stmt.all(groupId));
  //   return stmt.all(groupId) as ApiKeyRecord[];
  // }

  public getAllKeys(): ApiKeyRecord[] {
    const stmt = this.db.prepare("SELECT * FROM api_keys");
    return stmt.all() as ApiKeyRecord[];
  }

  public updateKey(
    id: string,
    data: Partial<Omit<ApiKeyRecord, "id" | "created_at">>
  ): void {
    const updateData = { ...data };

    if ("is_enabled" in updateData && typeof updateData.is_enabled === "boolean") {
      updateData.is_enabled = updateData.is_enabled ? 1 : 0;
    }

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return;
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const stmt = this.db.prepare(
      `UPDATE api_keys SET ${setClause} WHERE id = ?`
    );
    stmt.run(...values, id);
  }

  public getKeysByGroupId(groupId: string): ApiKeyRecord[] {
    const stmt = this.db.prepare(`
      SELECT
        k.*,
        uh.timestamp as lastUsed,
        uh.status as lastStatus,
        uh.promptTokens as lastPromptTokens,
        uh.completionTokens as lastCompletionTokens,
        uh.totalTokens as lastTotalTokens,
        uh.errorCode as lastErrorCode
      FROM api_keys k
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY apiKeyId ORDER BY timestamp DESC) as rn
        FROM usage_history
      ) uh ON k.id = uh.apiKeyId AND uh.rn = 1
      WHERE k.group_id = ?
    `);
    return stmt.all(groupId) as ApiKeyRecord[];
  }

  public deleteKey(id: string): void {
    const stmt = this.db.prepare("DELETE FROM api_keys WHERE id = ?");
    stmt.run(id);
  }

  // --- Key Group Management ---

  public createGroup(
    group: Omit<KeyGroupRecord, "id" | "created_at" | "is_active">
  ): KeyGroupRecord {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(
      "INSERT INTO key_groups (id, name) VALUES (?, ?)"
    );
    stmt.run(id, group.name);
    return this.getGroup(id)!;
  }

  public getGroup(id: string): KeyGroupRecord | null {
    const stmt = this.db.prepare("SELECT * FROM key_groups WHERE id = ?");
    return stmt.get(id) as KeyGroupRecord | null;
  }

  public getGroupByName(name: string): KeyGroupRecord | null {
    const stmt = this.db.prepare("SELECT * FROM key_groups WHERE name = ?");
    return stmt.get(name) as KeyGroupRecord | null;
  }

  public getAllGroups(): KeyGroupRecord[] {
    const stmt = this.db.prepare("SELECT * FROM key_groups");
    return stmt.all() as KeyGroupRecord[];
  }

  public updateGroup(
    id: string,
    data: Partial<Omit<KeyGroupRecord, "id" | "created_at">>
  ): void {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return;
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const stmt = this.db.prepare(
      `UPDATE key_groups SET ${setClause} WHERE id = ?`
    );
    stmt.run(...values, id);
  }

  public deleteGroup(id: string): void {
    const stmt = this.db.prepare("DELETE FROM key_groups WHERE id = ?");
    stmt.run(id);
  }
  // --- System Settings ---

  public getSetting(key: string): string | null {
    const stmt = this.db.prepare(
      "SELECT value FROM system_settings WHERE key = ?"
    );
    const result = stmt.get(key) as { value: string } | undefined;
    return result ? result.value : null;
  }

  public setSetting(key: string, value: string): void {
    const stmt = this.db.prepare(
      "INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    stmt.run(key, value);
  }

  public getActiveGroup(): KeyGroupRecord | null {
    const activeGroupId = this.getSetting("active_group_id");
    console.log("#FAK7", activeGroupId);
    if (activeGroupId) {
      return this.getGroup(activeGroupId);
    }
    return null;
  }

  public setActiveGroup(groupId: string): void {
    this.setSetting("active_group_id", groupId);
  }
}

export const dbService = DatabaseService.getInstance();
