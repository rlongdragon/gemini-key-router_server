import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useSse } from "../../hooks/useSse";
import TimestampDisplay from "./components/TimestampDisplay";
import styles from "./Dashboard.module.css";

interface Stats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
}

interface UsageRecord {
  requestId: string;
  apiKeyId: string;
  status: number;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: string;
  errorCode: string | null;
  errorMessage: string | null;
}

interface GlobalStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  is_enabled: boolean;
  lastUsed?: string;
  inputToken?: number;
  outputToken?: number;
  statusCode?: number;
  lastStatus?: 'success' | 'failure';
  lastPromptTokens?: number;
  lastCompletionTokens?: number;
  lastErrorCode?: string;
  latency?: number;
}

interface OverviewUnitData {
  title: string;
  classname: string;
  value: number | string;
  unit: string;
}

function OverviewUnit(data: OverviewUnitData) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-[4em]/15 font-mono ${data.classname} mb-0`}>
        <span className="animate-fade-in">{data.value}</span>
        {data.unit}
      </div>
      <div>{data.title}</div>
    </div>
  );
}

interface KeyData {
  apiKey: string;
  keyId: string;
  status: "avaliable" | "disabled" | "using" | "faild";
  statusCode: number | null;
  inputToken: number | null;
  outputToken: number | null;
  useTime: number | null;
  latency: number | null;
  lastUsed: Date | null;
  quota: {
    rpm: number | null;
    rpd: number | null;
    tpm: number | null;
  };
  pendingKeyIds: Set<string>;
  className?: string;
}

function Key(data: KeyData) {
  function QuotaDisplay({ quota }: { quota: { rpm: number | null; tpm: number | null; rpd: number | null } }) {
    function ProgressBar({ value }: { value: number | null }) {
      if (value === null) {
        return (
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="h-full bg-gray-600 rounded-full"></div>
          </div>
        );
      }

      return (
        <div className="w-full h-1 flex gap-[2px]">
          <div className="w-1/4 bg-gray-700 rounded-l-full h-full overflow-hidden">
            <div
              className={`h-full  bg-blue-500`}
              style={{ width: `${value > 25 ? 100 : value * 4}%` }}
            ></div>
          </div>
          <div className="w-1/4 bg-gray-700 h-full overflow-hidden">
            {value > 25 ? (
              <div
                className={`h-full bg-blue-500`}
                style={{ width: `${value > 50 ? 100 : (value - 25) * 4}%` }}
              ></div>
            ) : (
              <></>
            )}
          </div>
          <div className="w-1/4 bg-gray-700 h-full overflow-hidden">
            {value > 50 ? (
              <div
                className={`h-full bg-blue-500`}
                style={{ width: `${value > 75 ? 100 : (value - 50) * 4}%` }}
              ></div>
            ) : (
              <></>
            )}
          </div>
          <div className="w-1/4 bg-gray-700 rounded-r-full h-full overflow-hidden">
            {value > 75 ? (
              <div
                className={`h-full bg-blue-500`}
                style={{ width: `${value > 100 ? 100 : (value - 75) * 4}%` }}
              ></div>
            ) : (
              <></>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <ProgressBar value={quota.rpm} />
        <ProgressBar value={quota.tpm} />
        <ProgressBar value={quota.rpd} />
      </div>
    );
  }

  return (
    <tr
      className={`hover:bg-gray-800 ${
        data.status === "disabled" ? "opacity-50" : ""
      } ${data.pendingKeyIds.has(data.keyId) ? styles.scanner : ""}`}
    >
      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-300 font-mono">
        {data.apiKey}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-400">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            data.status === "avaliable"
              ? "bg-green-200 text-green-800"
              : data.status === "faild"
              ? "bg-red-200 text-red-800"
              : data.status === "using"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {data.status}
        </span>
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-400">
        <div className=" h-full flex items-center gap-1">
          <div
            className={`${((data) => {
              if (data.statusCode === 200) return "text-green-500";
              if (data.statusCode === 400) return "text-red-500";
              if (data.statusCode === 429) return "text-yellow-500";
              if (data.statusCode === 500) return "text-gray-500";
              return "text-gray-500";
            })(data)}`}
          >
            ●
          </div>
          <div>{data.statusCode ? data.statusCode : "N/A"}</div>
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-400">
        <div className="flex flex-col text-xs/4 font-mono">
          <span>
            I:
            {data.inputToken !== null ? `${(data.inputToken/1000).toFixed(1)}k` : "N/A"}
          </span>
          <span>
            O:
            {data.outputToken !== null ? `${(data.outputToken/1000).toFixed(1)}k` : "N/A"}
          </span>
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-400">
        <div className="flex ㄉㄧflex-col text-xs/4 font-mono">
          <span>
            {data.latency !== null && data.latency !== undefined ? ((time)=>{
              if (time < 1000) return `${time}ms`;
              else if (time < 10000) return `${(time/1000).toFixed(1)}s`;
              else return `${Math.floor(time/1000)}s`;
            })(data.latency) : "N/A"}
          </span>
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-400">
        {data.lastUsed ? <TimestampDisplay date={data.lastUsed} /> : "Never"}
      </td>
      <td>
        <QuotaDisplay quota={data.quota} />
      </td>
    </tr>
  );
}

function Dashboard() {
  const { data: stats, loading: statsLoading, request: fetchStats } = useApi<Stats>();
  const { data: initialKeys, loading: keysLoading, error: keysError, request: fetchKeys } = useApi<ApiKey[]>();
  const eventSource = useSse("/api/v1/admin/status-stream");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [pendingKeyIds, setPendingKeyIds] = useState(new Set<string>());
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
  });
  const [justUpdatedKeyIds, setJustUpdatedKeyIds] = useState(new Set<string>());

  useEffect(() => {
    fetchStats("/api/v1/admin/stats");
    fetchKeys("/api/v1/admin/keys");
  }, [fetchStats, fetchKeys]);

  useEffect(() => {
    if (initialKeys) {
      setKeys(initialKeys);
    }
  }, [initialKeys]);

  useEffect(() => {
    if (!eventSource) return;

    const handleKeyUsageStart = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const keyId = data.keyId;
        console.log("Key usage started for keyId:", keyId);
        if (keyId) {
          setPendingKeyIds((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.add(keyId);
            return newSet;
          });
        }
      } catch (error) {
        console.error("Failed to parse key_usage_start event:", error);
      }
    };
    const handleKeyUsageEnd = (event: MessageEvent) => {
      try {
        const usageRecord: UsageRecord = JSON.parse(event.data);
        const { apiKeyId } = usageRecord;

        // Update the specific key's details
        setKeys((prevKeys) =>
          prevKeys.map((key) =>
            key.id === apiKeyId
              ? {
                  ...key,
                  statusCode: usageRecord.errorCode ? parseInt(usageRecord.errorCode) : 200,
                  inputToken: usageRecord.promptTokens,
                  outputToken: usageRecord.completionTokens,
                  lastUsed: usageRecord.timestamp,
                  latency: usageRecord.latency,
                }
              : key
          )
        );

        // Remove the keyId from the pending set
        setPendingKeyIds((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.delete(apiKeyId);
          return newSet;
        });

        setJustUpdatedKeyIds((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.add(apiKeyId);
          return newSet;
        });

        setTimeout(() => {
          setJustUpdatedKeyIds((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.delete(apiKeyId);
            return newSet;
          });
        }, 500);
      } catch (error) {
        console.error("Failed to parse key_usage_end event:", error);
      }
    };
    const handleStatsUpdate = (event: MessageEvent) => {
      try {
        const newStats: GlobalStats = JSON.parse(event.data);
        setGlobalStats(newStats);
      } catch (error) {
        console.error("Failed to parse stats_update event:", error);
      }
    };

    const handleGroupChange = () => {
      console.log('Active group changed, refetching keys...');
      fetchKeys("/api/v1/admin/keys");
    };

    eventSource.addEventListener('key_usage_start', handleKeyUsageStart);
    eventSource.addEventListener('key_usage_end', handleKeyUsageEnd);
    eventSource.addEventListener('stats_update', handleStatsUpdate);
    eventSource.addEventListener('active_group_changed', handleGroupChange);

    return () => {
      eventSource.removeEventListener('key_usage_start', handleKeyUsageStart);
      eventSource.removeEventListener('key_usage_end', handleKeyUsageEnd);
      eventSource.removeEventListener('stats_update', handleStatsUpdate);
      eventSource.removeEventListener('active_group_changed', handleGroupChange);
    };
  }, [eventSource, fetchKeys]);

  useEffect(() => {
    console.log(stats);
    if (statsLoading || !stats) return;
    setGlobalStats({
      ...stats
    });
  }, [statsLoading]);

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-black">Dashboard</h1>
      </div>
      <div>
        <div className="flex my-4 gap-10" key={globalStats.totalRequests}>
          <OverviewUnit
            classname={"text-blue-400"}
            title={"total request"}
            value={globalStats.totalRequests}
            unit={""}
          />
          <OverviewUnit
            classname={"text-red-400"}
            title={"total input token"}
            value={(globalStats.totalInputTokens/1000).toFixed(1)}
            unit={"M"}
          />
          <OverviewUnit
            classname={"text-yellow-400"}
            title={"total output token"}
            value={(globalStats.totalOutputTokens/100).toFixed(1)}
            unit={"k"}
          />
        </div>
      </div>
      <div className="w-full max-w-6xl bg-gray-900 border-gray-700 border-1 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-black">Key Status</h2>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Latency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quota
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {keysLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  Loading keys...
                </td>
              </tr>
            ) : keysError ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-red-400">
                  Error loading keys: {keysError.message}
                </td>
              </tr>
            ) : (
              <>
                {keys.map((key) => (
                  <Key
                    key={key.id}
                    apiKey={key.api_key}
                    keyId={key.id.toString()}
                    status={key.is_enabled ? "avaliable" : "disabled"} // 根據 is_enabled 判斷狀態
                    statusCode={key.statusCode ?? (key.lastErrorCode ? parseInt(key.lastErrorCode) : (key.lastStatus === 'success' ? 200 : null))}
                    className={justUpdatedKeyIds.has(key.id) ? "animate-fade-in" : ""}
                    inputToken={key.inputToken ?? key.lastPromptTokens ?? null}
                    outputToken={key.outputToken ?? key.lastCompletionTokens ?? null}
                    useTime={null}
                    latency={key.latency ?? null}
                    lastUsed={key.lastUsed ? new Date(key.lastUsed) : null}
                    quota={{ rpm: null, rpd: null, tpm: null }} // 這裡需要從後端獲取實際的 quota
                    pendingKeyIds={pendingKeyIds}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
