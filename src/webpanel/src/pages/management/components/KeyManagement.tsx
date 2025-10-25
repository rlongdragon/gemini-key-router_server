import React, { useState, useEffect, useCallback } from "react";
import type { ApiKeyRecord } from "../../../types/ApiKeyRecord";
import type { KeyGroupRecord } from "../../../types/KeyGroupRecord";
import { useApi } from "../../../hooks/useApi";
import KeyController from "./KeyController";
import AddModal from "./AddModal";
import DeleteModal from "./DeleteModal";
import TransferModal from "./TransferModal";

interface KeyManagementProps {
  activeGroup: KeyGroupRecord | null;
  allGroups: KeyGroupRecord[];
}

function KeyManagement({ activeGroup, allGroups }: KeyManagementProps) {
  const [keysInGroup, setKeysInGroup] = useState<ApiKeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { request } = useApi();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [targetGroupId, setTargetGroupId] = useState<string>("");
  const [currentKey, setCurrentKey] = useState<ApiKeyRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const loadKeysInGroup = useCallback(async () => {
    if (!activeGroup) {
      setKeysInGroup([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const keysData = (await request(
        `/api/v1/admin/groups/${activeGroup.id}/keys`
      )) as ApiKeyRecord[];
      setKeysInGroup(keysData);
    } catch (error) {
      console.error("Failed to fetch keys in group", error);
    } finally {
      setIsLoading(false);
    }
  }, [request, activeGroup]);

  useEffect(() => {
    loadKeysInGroup();
  }, [refreshTrigger, loadKeysInGroup]);

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
      refreshData(); // Trigger re-fetch
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
      refreshData(); // Trigger re-fetch
    } catch (error) {
      console.error("轉移金鑰失敗:", error);
      alert(
        `轉移金鑰失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  };

  return (
    <div className="w-full max-w-6xl bg-gray-900 border-gray-700 border-1 p-6 rounded-lg shadow-lg mt-4">
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
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              名稱
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              金鑰
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              狀態
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
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
                refreshData={refreshData}
              />
            ))
          )}
        </tbody>
      </table>

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

export default KeyManagement;