import type { ApiKeyRecord } from "../../../types/ApiKeyRecord";

interface DeleteModalProps {
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  setCurrentKey: (key: ApiKeyRecord | null) => void;
  currentKey: ApiKeyRecord | null;
  handleDeleteKey: () => Promise<void>;
  showing: boolean; // Optional prop to control visibility
}

export default function DeleteModal({
  setIsDeleteModalOpen,
  setCurrentKey,
  currentKey,
  handleDeleteKey,
  showing,
}: DeleteModalProps) {
  return (
    <div
      className={`${
        showing
          ? "bg-black/50 bg-opacity-50 backdrop-blur-xs opacity-100"
          : "backdrop-blur-none opacity-0 invisible"
      }  inset-0 flex justify-center items-center transition-opacity duration-300 fixed`}
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4">確認刪除</h3>
        <p className="mb-6">
          您確定要刪除金鑰 <span className="font-mono">{currentKey?.name}</span>{" "}
          嗎？此操作無法復原。
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setCurrentKey(null);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleDeleteKey}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}
