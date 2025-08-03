import { EventEmitter } from 'events';

export type KeyStatus = 'available' | 'pending' | 'exhausted';

/**
 * Manages and broadcasts the real-time status of API keys in memory.
 * This service is implemented as a singleton to ensure a single source of truth.
 */
export class KeyStatusService extends EventEmitter {
    private static instance: KeyStatusService;
    private statusMap: Map<string, KeyStatus> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): KeyStatusService {
        if (!KeyStatusService.instance) {
            KeyStatusService.instance = new KeyStatusService();
        }
        return KeyStatusService.instance;
    }

    /**
     * Updates the status of a specific API key and emits an event.
     * @param keyId The ID of the key to update.
     * @param status The new status of the key.
     */
    public updateKeyStatus(keyId: string, status: KeyStatus): void {
        this.statusMap.set(keyId, status);
        this.emit('key_status_update', { keyId, status });
    }

    /**
     * Retrieves the current status of a specific API key.
     * @param keyId The ID of the key to retrieve the status for.
     * @returns The current status of the key.
     */
    public getKeyStatus(keyId: string): KeyStatus | undefined {
        return this.statusMap.get(keyId);
    }

    /**
     * Retrieves a snapshot of all key statuses.
     * @returns An object mapping key IDs to their statuses.
     */
    public getAllStatuses(): Record<string, KeyStatus> {
        return Object.fromEntries(this.statusMap);
    }
}

export const keyStatusService = KeyStatusService.getInstance();