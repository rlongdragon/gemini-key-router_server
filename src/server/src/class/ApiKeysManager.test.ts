import ApiKeysManager from './ApiKeysManager';
import { dbService } from '../services/DatabaseService';
import { ApiKeyRecord } from '../types/database';
import ApiKey from './ApiKey';

// Mock the entire DatabaseService module
jest.mock('../services/DatabaseService');

// Type assertion for the mocked service
const mockedDbService = dbService as jest.Mocked<typeof dbService>;

describe('ApiKeysManager', () => {
  let manager: ApiKeysManager;

  beforeEach(() => {
    // Reset mocks before each test
    (mockedDbService.getSetting as jest.Mock).mockClear();
    (mockedDbService.getKeysByGroup as jest.Mock).mockClear();
    (mockedDbService.getUsageCountToday as jest.Mock).mockClear();
    manager = new ApiKeysManager();
  });

  test('should load keys from DB and set the active group', async () => {
    const mockKeys: ApiKeyRecord[] = [
      { id: 'key1', api_key: 'key-value-1', group_id: 'default', rpd: 100, is_enabled: 1, name: 'Key 1', created_at: '' },
      { id: 'key2', api_key: 'key-value-2', group_id: 'default', rpd: 100, is_enabled: 1, name: 'Key 2', created_at: '' },
      { id: 'key3', api_key: 'key-value-3', group_id: 'default', rpd: 100, is_enabled: 0, name: 'Key 3', created_at: '' },
    ];

    (mockedDbService.getSetting as jest.Mock).mockResolvedValue('default');
    (mockedDbService.getKeysByGroup as jest.Mock).mockResolvedValue(mockKeys);

    await manager.loadKeysFromDb();

    expect(mockedDbService.getSetting).toHaveBeenCalledWith('active_key_group_id');
    expect(mockedDbService.getKeysByGroup).toHaveBeenCalledWith('default');
    expect(manager.curentGroupId).toBe('default');
    expect(manager.getApiKey('key1')).toBeInstanceOf(ApiKey);
    expect(manager.getApiKey('key2')).toBeInstanceOf(ApiKey);
    expect(manager.getApiKey('key3')).toBeUndefined(); // Should not be loaded as it's disabled
  });

  test('getNextAvailableKey should rotate through available keys', async () => {
    const mockKeys: ApiKeyRecord[] = [
        { id: 'key1', api_key: 'key-value-1', group_id: 'default', rpd: 100, is_enabled: 1, name: 'Key 1', created_at: '' },
        { id: 'key2', api_key: 'key-value-2', group_id: 'default', rpd: 100, is_enabled: 1, name: 'Key 2', created_at: '' },
    ];
    (mockedDbService.getSetting as jest.Mock).mockResolvedValue('default');
    (mockedDbService.getKeysByGroup as jest.Mock).mockResolvedValue(mockKeys);
    (mockedDbService.getUsageCountToday as jest.Mock).mockReturnValue(0);

    await manager.loadKeysFromDb();

    const key1 = manager.getNextAvailableKey('default');
    const key2 = manager.getNextAvailableKey('default');
    const key3 = manager.getNextAvailableKey('default');

    expect(key1?.id).toBe('key1');
    expect(key2?.id).toBe('key2');
    expect(key3?.id).toBe('key1'); // Should loop back to the first key
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledTimes(3);
  });

  test('getNextAvailableKey should skip keys that have exceeded their usage limit', async () => {
    const mockKeys: ApiKeyRecord[] = [
        { id: 'key1', api_key: 'key-value-1', group_id: 'default', rpd: 1, is_enabled: 1, name: 'Key 1', created_at: '' },
        { id: 'key2', api_key: 'key-value-2', group_id: 'default', rpd: 1, is_enabled: 1, name: 'Key 2', created_at: '' },
        { id: 'key3', api_key: 'key-value-3', group_id: 'default', rpd: 1, is_enabled: 1, name: 'Key 3', created_at: '' },
    ];
    (mockedDbService.getSetting as jest.Mock).mockResolvedValue('default');
    (mockedDbService.getKeysByGroup as jest.Mock).mockResolvedValue(mockKeys);
    
    // Mock usage counts
    (mockedDbService.getUsageCountToday as jest.Mock).mockImplementation((keyId: string) => {
        if (keyId === 'key1' || keyId === 'key3') {
            return 2; // Exceeded limit
        }
        return 0; // Available
    });

    await manager.loadKeysFromDb();

    const availableKey = manager.getNextAvailableKey('default');
    
    expect(availableKey?.id).toBe('key2');
    // It should check key1, then key2. key2 is available, so it returns it.
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledWith('key1');
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledWith('key2');
    // It should not have checked key3 yet.
    expect(mockedDbService.getUsageCountToday).not.toHaveBeenCalledWith('key3');
  });

  test('getNextAvailableKey should return undefined if all keys have exceeded their usage limit', async () => {
    const mockKeys: ApiKeyRecord[] = [
        { id: 'key1', api_key: 'key-value-1', group_id: 'default', rpd: 1, is_enabled: 1, name: 'Key 1', created_at: '' },
        { id: 'key2', api_key: 'key-value-2', group_id: 'default', rpd: 1, is_enabled: 1, name: 'Key 2', created_at: '' },
    ];
    (mockedDbService.getSetting as jest.Mock).mockResolvedValue('default');
    (mockedDbService.getKeysByGroup as jest.Mock).mockResolvedValue(mockKeys);
    (mockedDbService.getUsageCountToday as jest.Mock).mockReturnValue(2); // All keys exceeded limit

    await manager.loadKeysFromDb();

    const availableKey = manager.getNextAvailableKey('default');

    expect(availableKey).toBeUndefined();
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledWith('key1');
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledWith('key2');
    expect(mockedDbService.getUsageCountToday).toHaveBeenCalledTimes(2);
  });
});