import React from "react";

import { useApi } from "../../../hooks/useApi";
import type { ApiKeyRecord } from "../../../types/ApiKeyRecord";
import ToggleSwitch from "./ToggleSwitch";

interface KeyControllerProps {
  setCurrentKey: React.Dispatch<React.SetStateAction<ApiKeyRecord | null>>;
  setIsTransferModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  keyData: ApiKeyRecord;
  refreshData: () => void;
}

export default function KeyController({
  setCurrentKey,
  setIsTransferModalOpen,
  setIsDeleteModalOpen,
  keyData: key,
  refreshData,
}: KeyControllerProps) {
  const { request } = useApi();
  const handleToggle = async () => {
    try {
      await request(`/api/v1/admin/keys/${key.id}`, {
        method: "PUT",
        body: {
          is_enabled: !key.is_enabled,
        },
      });
      refreshData();
    } catch (error) {
      console.error("Failed to toggle key status", error);
      alert("更新金鑰狀態失敗");
    }
  };

  return (
    <tr key={key.id}>
      <td className="px-6 py-4 whitespace-nowrap">{key.name}</td>
      <td className="px-6 py-4 whitespace-nowrap font-mono">
        {key.api_key
          ? `${key.api_key.substring(0, 4)}...${key.api_key.substring(
              key.api_key.length - 4
            )}`
          : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ToggleSwitch checked={key.is_enabled} onChange={handleToggle} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap space-x-2">
        <button
          onClick={() => {
            setCurrentKey(key);
            setIsTransferModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
        >
          轉移
        </button>
        <button
          onClick={() => {
            setCurrentKey(key);
            setIsDeleteModalOpen(true);
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
        >
          刪除
        </button>
      </td>
    </tr>
  );
}
