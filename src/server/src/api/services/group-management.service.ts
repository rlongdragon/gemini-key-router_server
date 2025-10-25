import { dbService } from '../../services/DatabaseService';
import { KeyGroupRecord } from '../../types/database';

export class GroupManagementService {
  public async getAllGroups(): Promise<KeyGroupRecord[]> {
    return dbService.getAllGroups();
  }

  public async getActiveGroup(): Promise<KeyGroupRecord | null> {
    console.log("#QJXE active group", dbService.getActiveGroup());
    return dbService.getActiveGroup();
  }

  public async createGroup(
    group: Omit<KeyGroupRecord, 'id' | 'created_at' | 'is_active'>,
  ): Promise<KeyGroupRecord> {
    if (!group.name || group.name.trim() === '') {
      throw { status: 400, message: 'Group name cannot be empty' };
    }
    const existingGroup = await dbService.getGroupByName(group.name);
    if (existingGroup) {
      throw { status: 400, message: `Group with name "${group.name}" already exists` };
    }
    return dbService.createGroup(group);
  }

  public async setActiveGroup(id: string): Promise<void> {
    const group = await dbService.getGroup(id);
    if (!group) {
      throw { status: 404, message: `Group with id "${id}" not found` };
    }
    return dbService.setActiveGroup(id);
  }

  public async updateGroup(
    id: string,
    data: Partial<Omit<KeyGroupRecord, 'id' | 'created_at'>>,
  ): Promise<void> {
    return dbService.updateGroup(id, data);
  }

  public async deleteGroup(id: string): Promise<void> {
    return dbService.deleteGroup(id);
  }
}

export const groupManagementService = new GroupManagementService();