import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useSse } from "../../hooks/useSse";
import styles from "./Dashboard.module.css";

interface Stats {
  totalKeys: number;
  totalUsage: number;
  totalLimit: number;
}

interface ApiKey {
  id: number;
  name: string;
  api_key: string; // Changed from 'key' to 'api_key'
  is_enabled: boolean; // Added is_enabled
}

interface OverviewUnitData {
  title: string;
  classname: string;
  value: number;
  unit: string;
}

function OverviewUnit(data: OverviewUnitData) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-[4em]/15 font-mono ${data.classname} mb-0`}>
        {data.value}
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
  statusCode: 200 | 400 | 429 | 500 | null;
  inputToken: number | null;
  outputToken: number | null;
  useTime: number | null;
  lastUsed: Date | null;
  quota: {
    rpm: number | null;
    rpd: number | null;
    tpm: number | null;
  };
  pendingKeyIds: Set<number>;
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
      className={`hover:bg-gray-700 ${
        data.status === "disabled" ? "opacity-50" : ""
      } ${data.pendingKeyIds.has(parseInt(data.keyId)) ? styles.pendingGlow : ""}`}
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
            {data.inputToken !== null ? `${data.inputToken}M` : "N/A"}
          </span>
          <span>
            O:
            {data.outputToken !== null ? `${data.outputToken}k` : "N/A"}
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

interface TimestampDisplayProps {
  date: Date;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000)
  );

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour(s) ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day(s) ago`;
  }

  const months = Math.floor(days / 30); // Approximate months
  if (months < 12) {
    return `${months} month(s) ago`;
  }

  const years = Math.floor(days / 365); // Approximate years
  return `${years} year(s) ago`;
};

const TimestampDisplay: React.FC<TimestampDisplayProps> = ({ date }) => {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setDisplayTime(formatTimeAgo(date));
      const timer = setInterval(() => {
        setDisplayTime(formatTimeAgo(date));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setDisplayTime('Invalid date');
    }
  }, [date]);

  return <span>{displayTime}</span>;
};

function Dashboard() {
  const { data: stats, loading: statsLoading, request: fetchStats } = useApi<Stats>();
  const { data: initialKeys, loading: keysLoading, error: keysError, request: fetchKeys } = useApi<ApiKey[]>();
  const eventSource = useSse("/api/v1/admin/status-stream");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [pendingKeyIds, setPendingKeyIds] = useState(new Set<number>());

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
    if (eventSource) {
      const handleKeyUsageStart = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        setPendingKeyIds((prev) => new Set(prev).add(data.keyId));
      };

      const handleKeyUsageEnd = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        setPendingKeyIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.keyId);
          return newSet;
        });
      };

      eventSource.addEventListener('key_usage_start', handleKeyUsageStart);
      eventSource.addEventListener('key_usage_end', handleKeyUsageEnd);

      return () => {
        eventSource.removeEventListener('key_usage_start', handleKeyUsageStart);
        eventSource.removeEventListener('key_usage_end', handleKeyUsageEnd);
      };
    }
  }, [eventSource]);

  useEffect(() => {
    console.log(stats);
  }, [statsLoading]);

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-black">Dashboard</h1>
      </div>
      <div>
        <div className="flex my-4 gap-10">
          <OverviewUnit
            classname={"text-blue-400"}
            title={"total request"}
            value={360}
            unit={""}
          />
          <OverviewUnit
            classname={"text-red-400"}
            title={"total input token"}
            value={140}
            unit={"M"}
          />
          <OverviewUnit
            classname={"text-yellow-400"}
            title={"total output token"}
            value={2000}
            unit={"k"}
          />
        </div>
      </div>
      <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-black">Key Status</h2>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
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
                Last Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quota
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
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
                    statusCode={null} // 這裡需要從後端獲取實際的狀態碼，目前暫時設為 null
                    inputToken={null} // 這裡需要從後端獲取實際的 inputToken
                    outputToken={null} // 這裡需要從後端獲取實際的 outputToken
                    useTime={null} // 這裡需要從後端獲取實際的 useTime
                    lastUsed={null} // 這裡需要從後端獲取實際的 lastUsed
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
