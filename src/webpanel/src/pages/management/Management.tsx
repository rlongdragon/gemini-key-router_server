import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import type { ApiKeyRecord } from "../../types/ApiKeyRecord";
import type { KeyGroupRecord } from "../../types/KeyGroupRecord";
import KeyController from "./components/KeyController";
import AddModal from "./components/AddModal";
import DeleteModal from "./components/DeleteModal";
import TransferModal from "./components/TransferModal";

function Management() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [targetGroupId, setTargetGroupId] = useState<string>("");
  const [currentKey, setCurrentKey] = useState<ApiKeyRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch groups
  const { data: groups, loading: groupsLoading } = useApi<KeyGroupRecord[]>(
    "/api/v1/admin/groups"
  );

  // Fetch keys when a group is selected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: keys,
    loading: keysLoading,
    error: keysError,
  } = useApi<ApiKeyRecord[]>(
    selectedGroupId ? `/api/v1/admin/groups/${selectedGroupId}/keys` : null,
    [refreshTrigger, selectedGroupId]
  );

  // useEffect(() => {
  //   console.log('Selected Group ID:', selectedGroupId);
  //   console.log('Keys:', keys);
  // }, [selectedGroupId, keys]);

  const handleAddNewKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const key = formData.get("key") as string;

    if (!name || !key || !selectedGroupId) {
      alert("請填寫所有欄位");
      return;
    }

    try {
      const response = await fetch("/api/v1/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          api_key: key,
          group_id: selectedGroupId,
          rpd: 500,
        }),
      });

      if (!response.ok) {
        throw new Error("無法新增金鑰");
      }

      setIsAddModalOpen(false);
      setRefreshTrigger((prev) => prev + 1); // Trigger re-fetch
    } catch (error) {
      console.error("新增金鑰失敗:", error);
      alert(
        `新增金鑰失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  };

  const handleDeleteKey = async () => {
    if (!currentKey) return;

    try {
      const response = await fetch(`/api/v1/admin/keys/${currentKey.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("無法刪除金鑰");
      }

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
      const response = await fetch(`/api/v1/admin/keys/${currentKey.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: targetGroupId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "無法轉移金鑰");
      }

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

  useEffect(() => {
    // Select the first group by default
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-black mb-4">金鑰與分組管理</h1>

      {/* Group Selector */}
      <div className="mb-4">
        <label htmlFor="group-select" className="mr-2">
          選擇群組:
        </label>
        <select
          id="group-select"
          className="bg-gray-700 text-white p-2 rounded"
          value={selectedGroupId || ""}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          disabled={groupsLoading}
        >
          {groups?.map((group) => (
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
            disabled={!selectedGroupId}
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
            {keysLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  Loading keys...
                </td>
              </tr>
            ) : keysError ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-red-400">
                  Error: {keysError.message}
                </td>
              </tr>
            ) : (
              (() => {
                // console.log('Keys:', keys)
                return keys?.map((key) => {
                  return (
                    <KeyController
                      key={key.id}
                      keyData={key as ApiKeyRecord}
                      setCurrentKey={setCurrentKey}
                      setIsTransferModalOpen={setIsTransferModalOpen}
                      setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                  );
                });
              })()
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Key Modal */}
      <AddModal
        setIsAddModalOpen={setIsAddModalOpen}
        handleAddNewKey={handleAddNewKey}
        showing={isAddModalOpen}
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
        groups={groups || []}
        selectedGroupId={selectedGroupId || ""}
        handleTransferKey={handleTransferKey}
        showing={isTransferModalOpen}
      />
    </div>
  );
}

export default Management;
