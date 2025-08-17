interface AddModalProps {
  handleAddNewKey: (event: React.FormEvent<HTMLFormElement>) => void;
  setIsAddModalOpen: (isOpen: boolean) => void;
  showing: boolean; // Optional prop to control visibility
}

export default function AddModal({
  showing,
  handleAddNewKey,
  setIsAddModalOpen,
}: AddModalProps) {
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
        <h3 className="text-2xl font-bold mb-4">新增金鑰</h3>
        <form onSubmit={handleAddNewKey}>
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
              type="text"
              id="key-value"
              name="key"
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
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
