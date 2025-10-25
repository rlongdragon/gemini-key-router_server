import React, { useState, useEffect, useCallback } from 'react';
import type { KeyGroupRecord } from '../../../types/KeyGroupRecord'; // 使用 import type
import { useApi } from '../../../hooks/useApi';

interface GroupSelectorProps {
  onGroupSelect: (group: KeyGroupRecord | null) => void;
  activeGroup: KeyGroupRecord | null;
  onGroupsLoaded: (groups: KeyGroupRecord[]) => void; // 新增：用於將所有群組傳遞給父組件
}

/**
 * GroupSelector 組件用於顯示和選擇金鑰群組。
 * 它將從 Management.tsx 接收必要的 props，並處理群組選擇的邏輯。
 */
function GroupSelector({ onGroupSelect, activeGroup, onGroupsLoaded }: GroupSelectorProps) {
  const [allGroups, setAllGroups] = useState<KeyGroupRecord[]>([]);
  const { request } = useApi(); // 將 get 替換為 request

  const loadGroups = useCallback(async () => {
    try {
      const groupsData = (await request('/api/v1/admin/groups')) as KeyGroupRecord[]; // 直接獲取數據
      setAllGroups(groupsData);
      onGroupsLoaded(groupsData); // 將所有群組傳遞給父組件
      // 如果沒有選中的群組，預設選擇第一個群組
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  }, [request, activeGroup, onGroupSelect, onGroupsLoaded]); // 更新依賴項

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGroupId = event.target.value;
    const selectedGroup = allGroups.find(group => group.id === selectedGroupId);
    onGroupSelect(selectedGroup || null);
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">選擇群組</h2>
      <div className="mb-4">
        <label htmlFor="group-select" className="block text-sm font-medium text-gray-300 mb-2">
          選擇一個群組:
        </label>
        <select
          id="group-select"
          className="block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={activeGroup?.id || ''}
          onChange={handleGroupChange}
        >
          <option value="">-- 請選擇群組 --</option>
          {allGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} {/* 將 group_name 替換為 name */}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default GroupSelector;