import React, { useState, useEffect, useCallback } from "react";
import type { ApiKeyRecord } from "../../types/ApiKeyRecord";
import type { KeyGroupRecord } from "../../types/KeyGroupRecord";
import { useApi } from "../../hooks/useApi";
import KeyController from "./components/KeyController";
import AddModal from "./components/AddModal";
import DeleteModal from "./components/DeleteModal";
import TransferModal from "./components/TransferModal";

function Management() {
  const [activeGroup, setActiveGroup] = useState<KeyGroupRecord | null>(null);
  const [allGroups, setAllGroups] = useState<KeyGroupRecord[]>([]);
  const [keysInGroup, setKeysInGroup] = useState<ApiKeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const { request } = useApi();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [targetGroupId, setTargetGroupId] = useState<string>("");
  const [currentKey, setCurrentKey] = useState<ApiKeyRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeGroupData, allGroupsData] = await Promise.all([
        request("/api/v1/admin/groups/active") as Promise<KeyGroupRecord>,
        request("/api/v1/admin/groups") as Promise<KeyGroupRecord[]>,
      ]);

      setActiveGroup(activeGroupData);
      setAllGroups(allGroupsData);

      if (activeGroupData) {
        const keysData = (await request(
          `/api/v1/admin/groups/${activeGroupData.id}/keys`
        )) as ApiKeyRecord[];
        setKeysInGroup(keysData);
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadInitialData();
  }, [refreshTrigger, loadInitialData]);
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteKey = async () => {
    if (!currentKey) return;

    try {
      await request(`/api/v1/admin/keys/${currentKey.id}`, {
        method: "DELETE",
      });

      setIsDeleteModalOpen(false);
      setCurrentKey(null);
      setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
    } catch (error) {
      console.error("刪除金鑰失敗:", error);
      alert(
        `刪除金鑰失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  };

  const handleTransferKey = async () => {
    if (!currentKey || !targetGroupId) {
      alert("請選擇要轉移的目標群組");
      return;
    }

    try {
      await request(`/api/v1/admin/keys/${currentKey.id}`, {
        method: "PUT",
        body: {
          group_id: targetGroupId,
        },
      });

      setIsTransferModalOpen(false);
      setCurrentKey(null);
      setTargetGroupId("");
      setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
    } catch (error) {
      console.error("轉移金鑰失敗:", error);
      alert(
        `轉移金鑰失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  };

  const handleGroupChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const groupId = event.target.value;
    if (!groupId) return;

    setIsSwitching(true);
    try {
      // Update active group on the server
      await request("/api/v1/admin/groups/active", {
        method: "PUT",
        body: { id: groupId },
      });

      // Find the new active group from allGroups
      const newActiveGroup = allGroups.find((group) => group.id === groupId);
      if (newActiveGroup) {
        setActiveGroup(newActiveGroup);
        // Fetch keys for the new active group
        const keysData = (await request(
          `/api/v1/admin/groups/${newActiveGroup.id}/keys`
        )) as ApiKeyRecord[];
        setKeysInGroup(keysData);
      }
    } catch (error) {
      console.error("Failed to switch group", error);
      alert("切換群組失敗");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-black mb-4">金鑰管理</h1>
      <h2 className="text-xl font-bold mb-4">
        當前作用中群組：{activeGroup ? activeGroup.name : "載入中..."}
      </h2>
      {/* Group Selector */}
      <div className="mb-4">
        <label htmlFor="group-select" className="mr-2">
          切換群組:
        </label>
        <select
          id="group-select"
          className="bg-gray-700 text-white p-2 rounded"
          value={activeGroup?.id || ""}
          onChange={handleGroupChange}
          disabled={isSwitching}
        >
          {allGroups?.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {/* Key List Table */}
      <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black">金鑰列表</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={!activeGroup}
          >
            新增金鑰
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                名稱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                金鑰
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  Loading keys...
                </td>
              </tr>
            ) : (
              keysInGroup.map((key) => (
                <KeyController
                  key={key.id}
                  keyData={key}
                  setCurrentKey={setCurrentKey}
                  setIsTransferModalOpen={setIsTransferModalOpen}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Key Modal */}
      <AddModal
        setIsAddModalOpen={setIsAddModalOpen}
        refreshData={refreshData}
        showing={isAddModalOpen}
        activeGroupId={activeGroup?.id || null}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setCurrentKey={setCurrentKey}
        currentKey={currentKey}
        handleDeleteKey={handleDeleteKey}
        showing={isDeleteModalOpen}
      />

      {/* Transfer Key Modal */}
      <TransferModal
        currentKey={currentKey}
        targetGroupId={targetGroupId}
        setIsTransferModalOpen={setIsTransferModalOpen}
        setCurrentKey={setCurrentKey}
        setTargetGroupId={setTargetGroupId}
        groups={allGroups || []}
        selectedGroupId={activeGroup?.id || ""}
        handleTransferKey={handleTransferKey}
        showing={isTransferModalOpen}
      />
    </div>
  );
}

export default Management;
