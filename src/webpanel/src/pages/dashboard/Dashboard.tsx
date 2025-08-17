import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useSse } from "../../hooks/useSse";

interface Stats {
  totalKeys: number;
  totalUsage: number;
  totalLimit: number;
}

interface ApiKey {
  id: number;
  name: string;
  key: string;
  status: string;
}

interface KeyStatusUpdate {
  id: number;
  status: string;
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
      }`}
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
  // test is date is a valid Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return <span>Invalid date</span>;
  }

  const [displayTime, setDisplayTime] = useState(formatTimeAgo(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(formatTimeAgo(date));
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return <span>{displayTime}</span>;
};

function Dashboard() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useApi<Stats>("/api/v1/admin/stats");
  const {
    data: initialKeys,
    loading: keysLoading,
    error: keysError,
  } = useApi<ApiKey[]>("/api/v1/admin/keys");
  const sseData = useSse<KeyStatusUpdate>("/api/v1/admin/status-stream");
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    if (initialKeys) {
      setKeys(initialKeys);
    }
  }, [initialKeys]);

  useEffect(() => {
    if (sseData) {
      setKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === sseData.id ? { ...key, status: sseData.status } : key
        )
      );
    }
  }, [sseData]);

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
                <Key
                  apiKey={"AIza*******************************mFzM"}
                  keyId={"uab3xcz"}
                  status={"avaliable"}
                  statusCode={200}
                  inputToken={47.5}
                  outputToken={10}
                  useTime={1450}
                  lastUsed={new Date(new Date() - 1000 * 50)}
                  quota={{ rpm: 20, rpd: 20, tpm: 60 }}
                />
                <Key
                  apiKey={"AIza*******************************mFzM"}
                  keyId={"uab3xcz"}
                  status={"avaliable"}
                  statusCode={200}
                  inputToken={47.5}
                  outputToken={10}
                  useTime={1450}
                  lastUsed={new Date(new Date() - 1000 * 30)}
                  quota={{ rpm: 40, rpd: 30, tpm: 20 }}
                />
                <Key
                  apiKey={"AIza*******************************mFzM"}
                  keyId={"uab3xcz"}
                  status={"avaliable"}
                  statusCode={200}
                  inputToken={47.5}
                  outputToken={10}
                  useTime={1450}
                  lastUsed={new Date(new Date() - 1000 * 20)}
                  quota={{ rpm: 80, rpd: 60, tpm: 90 }}
                />
                <Key
                  apiKey={"AIza*******************************mFzM"}
                  keyId={"uab3xcz"}
                  status={"faild"}
                  statusCode={429}
                  inputToken={0}
                  outputToken={0}
                  useTime={0}
                  lastUsed={new Date(1754198775000)}
                  quota={{ rpm: 0, rpd: 100, tpm: 0 }}
                />
                <Key
                  apiKey={"AIza*******************************mFzM"}
                  keyId={"uab3xcz"}
                  status={"avaliable"}
                  statusCode={200}
                  inputToken={47.5}
                  outputToken={10}
                  useTime={1450}
                  lastUsed={new Date(new Date())}
                  quota={{ rpm: 20, rpd: 10, tpm: 30 }}
                />
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
