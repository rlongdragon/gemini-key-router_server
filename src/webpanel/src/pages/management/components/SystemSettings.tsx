import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../../hooks/useApi";
import { useToast } from "../../../components/Toast/useToast";

function SystemSettings() {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { request } = useApi();
  const { showToast } = useToast();

  const fetchBaseUrl = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = (await request(
        "/api/v1/admin/system-settings/base-url"
      )) as { baseUrl: string };
      setBaseUrl(response.baseUrl);
    } catch (error) {
      console.error("Failed to fetch base URL:", error);
      showToast("Failed to fetch Base URL", "error");
    } finally {
      setIsLoading(false);
    }
  }, [request, showToast]);

  useEffect(() => {
    fetchBaseUrl();
  }, [fetchBaseUrl]);

  const handleSaveBaseUrl = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await request("/api/v1/admin/system-settings/base-url", {
        method: "PUT",
        body: { baseUrl },
      });
      showToast("Base URL updated successfully", "success");
    } catch (error) {
      console.error("Failed to update base URL:", error);
      showToast("Failed to update Base URL", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border-gray-700 border-1 p-6 rounded-lg shadow-lg mt-4">
      <h2 className="text-xl font-black mb-4">設定其他資訊</h2>
      <form onSubmit={handleSaveBaseUrl}>
        <div className="mb-4">
          <label
            htmlFor="baseUrl"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Base URL:
          </label>
          <input
            type="text"
            id="baseUrl"
            className="block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "儲存中..." : "儲存"}
        </button>
      </form>
    </div>
  );
}

export default SystemSettings;