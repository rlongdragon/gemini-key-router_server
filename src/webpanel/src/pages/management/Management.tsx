import React, { useState, useEffect, useCallback } from "react";
import type { KeyGroupRecord } from "../../types/KeyGroupRecord";
import { useApi } from "../../hooks/useApi";
import GroupSelector from "./components/GroupSelector";
import KeyManagement from "./components/KeyManagement";
import SystemSettings from "./components/SystemSettings";

type ManagementPage = "group-selection" | "key-management" | "system-settings";

function Management() {
  const [activeGroup, setActiveGroup] = useState<KeyGroupRecord | null>(null);
  const [allGroups, setAllGroups] = useState<KeyGroupRecord[]>([]);
  const [currentPage, setCurrentPage] =
    useState<ManagementPage>("group-selection");
  const { request } = useApi();

  const loadInitialActiveGroup = useCallback(async () => {
    try {
      const activeGroupData = (await request(
        "/api/v1/admin/groups/active"
      )) as KeyGroupRecord;
      setActiveGroup(activeGroupData);
    } catch (error) {
      console.error("Failed to fetch initial active group", error);
    }
  }, [request]);

  useEffect(() => {
    loadInitialActiveGroup();
  }, [loadInitialActiveGroup]);

  const handleGroupSelect = async (newActiveGroup: KeyGroupRecord | null) => {
    setActiveGroup(newActiveGroup);
    if (newActiveGroup) {
      try {
        await request("/api/v1/admin/groups/active", {
          method: "PUT",
          body: { groupId: newActiveGroup.id },
        });
      } catch (error) {
        console.error("Failed to switch group", error);
        alert("切換群組失敗");
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "group-selection":
        return (
          <GroupSelector
            onGroupSelect={handleGroupSelect}
            activeGroup={activeGroup}
            onGroupsLoaded={setAllGroups}
          />
        );
      case "key-management":
        return (
          <KeyManagement activeGroup={activeGroup} allGroups={allGroups} />
        );
      case "system-settings":
        return <SystemSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-6 shadow-lg">
        <h1 className="text-2xl font-black mb-6">管理頁面</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <button
                onClick={() => setCurrentPage("group-selection")}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  currentPage === "group-selection"
                    ? "bg-blue-700 hover:bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                選擇群組
              </button>
            </li>
            <li className="mb-4">
              <button
                onClick={() => setCurrentPage("key-management")}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  currentPage === "key-management"
                    ? "bg-blue-700 hover:bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                管理群組金鑰
              </button>
            </li>
            <li className="mb-4">
              <button
                onClick={() => setCurrentPage("system-settings")}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  currentPage === "system-settings"
                    ? "bg-blue-700 hover:bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                設定其他資訊
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold mb-4">
            當前作用中群組：{activeGroup ? activeGroup.name : "載入中..."}
          </h2>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default Management;
