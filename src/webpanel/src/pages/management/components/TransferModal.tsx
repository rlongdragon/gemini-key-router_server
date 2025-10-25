import type { ApiKeyRecord } from "../../../types/ApiKeyRecord";

interface TransferModalProps {
  currentKey: ApiKeyRecord | null;
  targetGroupId: string;
  setIsTransferModalOpen: (isOpen: boolean) => void;
  setCurrentKey: (key: ApiKeyRecord | null) => void;
  setTargetGroupId: (groupId: string) => void;
  groups: { id: string; name: string }[];
  selectedGroupId: string;
  handleTransferKey: () => Promise<void>;
  showing: boolean; // Optional prop to control visibility
}

export default function TransferModal({
  currentKey,
  targetGroupId,
  setIsTransferModalOpen,
  setCurrentKey,
  setTargetGroupId,
  groups,
  selectedGroupId,
  handleTransferKey,
  showing,
}: TransferModalProps) {
  return (
    <div
      className={`${
        showing
          ? "bg-black/50 bg-opacity-50 backdrop-blur-xs opacity-100"
          : "backdrop-blur-none opacity-0 invisible"
      }  inset-0 flex justify-center items-center transition-opacity duration-300 fixed`}
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4">轉移金鑰</h3>
        <p className="mb-4">
          將金鑰 <span className="font-mono">{currentKey?.name}</span>{" "}
          轉移至另一個群組。
        </p>
        <div className="mb-6">
          <label
            htmlFor="target-group-select"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            目標群組
          </label>
          <select
            id="target-group-select"
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            value={targetGroupId}
            onChange={(e) => setTargetGroupId(e.target.value)}
            required
          >
            <option value="" disabled>
              請選擇一個群組
            </option>
            {groups
              ?.filter((group) => group.id !== selectedGroupId)
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setIsTransferModalOpen(false);
              setCurrentKey(null);
              setTargetGroupId("");
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleTransferKey}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={!targetGroupId}
          >
            確認轉移
          </button>
        </div>
      </div>
    </div>
  );
}
