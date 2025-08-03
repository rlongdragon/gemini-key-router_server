import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import { UsageRecord } from '../types/database';

let db: Database.Database;
let serviceInstance: DatabaseService;

beforeAll(() => {
  db = new Database(':memory:');

  const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
  const migrationSql = fs.readFileSync(
    path.join(migrationsDir, '001_initial_schema.sql'),
    'utf-8',
  );
  db.exec(migrationSql);

  serviceInstance = Object.create(DatabaseService.prototype);
  serviceInstance['db'] = db;
});

afterAll(() => {
  db.close();
});

describe('DatabaseService', () => {
  beforeEach(() => {
    db.exec('DELETE FROM usage_history');
  });

  it('should add and retrieve a usage record', () => {
    const record: UsageRecord = {
      requestId: 'test-request-1',
      apiKeyId: '1',
      model: 'test-model',
      status: 'success',
      latency: 100,
      requestTokens: 100,
      responseTokens: 200,
      cost: 0.001,
    };

    serviceInstance.addUsageRecord(record);

    const stmt = db.prepare('SELECT * FROM usage_history WHERE apiKeyId = ?');
    const retrieved = stmt.get('1') as any;

    expect(retrieved).toBeDefined();
    expect(Number(retrieved.apiKeyId)).toBe(record.apiKeyId);
    expect(retrieved.modelId).toBe(record.model);
    expect(retrieved.promptTokens).toBe(record.requestTokens);
    expect(retrieved.completionTokens).toBe(record.responseTokens);
    expect(retrieved.estimatedCost).toBe(record.cost);
  });

  it('should correctly count usage records for today in PST', () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const record1: UsageRecord = { requestId: 'test-request-2', apiKeyId: '1', model: 'm1', status: 'success', latency: 100, requestTokens: 1, responseTokens: 1, cost: 1 };
    const record2: UsageRecord = { requestId: 'test-request-3', apiKeyId: '1', model: 'm2', status: 'success', latency: 100, requestTokens: 2, responseTokens: 2, cost: 2 };
    const record3: UsageRecord = { requestId: 'test-request-4', apiKeyId: '1', model: 'm3', status: 'success', latency: 100, requestTokens: 3, responseTokens: 3, cost: 3 };

    const insertStmt = db.prepare(
      `INSERT INTO usage_history (requestId, apiKeyId, modelId, status, latency, promptTokens, completionTokens, estimatedCost, timestamp)
       VALUES (@requestId, @apiKeyId, @model, @status, @latency, @requestTokens, @responseTokens, @cost, @timestamp)`,
    );

    insertStmt.run({ ...record1, timestamp: today.toISOString() });
    insertStmt.run({ ...record2, timestamp: today.toISOString() });
    insertStmt.run({ ...record3, timestamp: yesterday.toISOString() });
    
    // We need to mock the getStartOfTodayInPST to control the time for the test
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    jest.spyOn(serviceInstance as any, 'getStartOfTodayInPST').mockReturnValue(startOfToday.toISOString());

    const count = serviceInstance.getUsageCountToday('1');
    expect(count).toBe(2);

    const countForOtherKey = serviceInstance.getUsageCountToday('999');
    expect(countForOtherKey).toBe(0);
  });
});