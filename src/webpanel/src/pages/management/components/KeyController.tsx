import React from "react";

import type { ApiKeyRecord } from "../../../types/ApiKeyRecord";

interface KeyControllerProps {
  setCurrentKey: React.Dispatch<React.SetStateAction<ApiKeyRecord | null>>;
  setIsTransferModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  keyData: ApiKeyRecord;
}

export default function KeyController({
  setCurrentKey,
  setIsTransferModalOpen,
  setIsDeleteModalOpen,
  keyData: key,
}: KeyControllerProps) {
  console.log("Rendering key:", key);
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
