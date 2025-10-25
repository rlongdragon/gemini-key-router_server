import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useSse } from '../../hooks/useSse';

// 根據 development_plan.md 的 API 回應定義型別
interface UsageRecord {
  timestamp: string;
  apiKey: string;
  status: 'success' | 'error' | 'rate_limited';
  error: string | null;
}

const History: React.FC = () => {
  const [historyRecords, setHistoryRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { request } = useApi();
  const sse = useSse('/api/v1/adminsse/updates');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await request('/api/v1/adminhistory');
        setHistoryRecords(response as UsageRecord[]);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [request]);

  useEffect(() => {
    if (!sse) return;

    const handleNewUsage = (event: MessageEvent) => {
      const newRecord = JSON.parse(event.data) as UsageRecord;
      setHistoryRecords(prevRecords => [newRecord, ...prevRecords]);
    };

    sse.addEventListener('new_usage', handleNewUsage);

    return () => {
      sse.removeEventListener('new_usage', handleNewUsage);
    };
  }, [sse]);

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) {
      return '****';
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  };

  return (
    <div>
      <h1>即時使用紀錄</h1>
      {isLoading ? (
        <p>載入中...</p>
      ) : historyRecords.length === 0 ? (
        <p>尚無紀錄</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>時間戳</th>
              <th>API 金鑰</th>
              <th>狀態</th>
              <th>錯誤訊息</th>
            </tr>
          </thead>
          <tbody>
            {historyRecords.map((record, index) => (
              <tr key={index}>
                <td>{new Date(record.timestamp).toLocaleString()}</td>
                <td>{maskApiKey(record.apiKey)}</td>
                <td>{record.status}</td>
                <td>{record.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;