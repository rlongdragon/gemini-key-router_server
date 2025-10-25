import { useState } from "react";
import { useApi } from "../../../hooks/useApi";

interface AddModalProps {
  activeGroupId: string | null;
  refreshData: () => void;
  setIsAddModalOpen: (isOpen: boolean) => void;
  showing: boolean;
}

export default function AddModal({
  showing,
  refreshData,
  setIsAddModalOpen,
  activeGroupId,
}: AddModalProps) {
  const { request } = useApi();
  const [modalMode, setModalMode] = useState<"key" | "group">("key");

  const handleModeChange = (mode: "key" | "group") => {
    setModalMode(mode);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    if (modalMode === "key") {
      const key = formData.get("key") as string;
      await request("/api/v1/admin/keys", {
        method: "POST",
        body: { name, api_key: key, group_id: activeGroupId },
      });
    } else {
      await request("/api/v1/admin/groups", {
        method: "POST",
        body: { name },
      });
    }

    refreshData();
    setIsAddModalOpen(false);
  };

  return (
    <div
      className={`${
        showing
          ? "bg-black/50 bg-opacity-50 backdrop-blur-xs opacity-100"
          : "backdrop-blur-none opacity-0 invisible"
      }  inset-0 flex justify-center items-center transition-opacity duration-300 fixed`}
    >
      <div className="none" style={{ display: "none" }}></div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-4 border-b border-gray-700">
          <button
            onClick={() => handleModeChange("key")}
            className={`px-4 py-2 text-lg font-medium ${
              modalMode === "key"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            新增金鑰
          </button>
          <button
            onClick={() => handleModeChange("group")}
            className={`px-4 py-2 text-lg font-medium ${
              modalMode === "group"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            新增群組
          </button>
        </div>
        <h3 className="text-2xl font-bold mb-4">
          {modalMode === "key" ? "新增金鑰" : "新增群組"}
        </h3>
        <form onSubmit={handleSubmit}>
          {modalMode === "key" ? (
            <>
              <div className="mb-4">
                <label
                  htmlFor="key-name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  名稱
                </label>
                <input
                  type="text"
                  id="key-name"
                  name="name"
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="key-value"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  金鑰
                </label>
                <input
                  type="password"
                  id="key-value"
                  name="key"
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label
                htmlFor="group-name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                群組名稱
              </label>
              <input
                type="text"
                id="group-name"
                name="name"
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
