import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useSse } from '../../hooks/useSse';

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

function Dashboard() {
  const { data: stats, loading: statsLoading, error: statsError } = useApi<Stats>('/api/v1/admin/stats');
  const { data: initialKeys, loading: keysLoading, error: keysError } = useApi<ApiKey[]>('/api/v1/admin/keys');
  const sseData = useSse<KeyStatusUpdate>('/api/v1/admin/status-stream');
  const [keys, setKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    if (initialKeys) {
      setKeys(initialKeys);
    }
  }, [initialKeys]);

  useEffect(() => {
    if (sseData) {
      setKeys(prevKeys =>
        prevKeys.map(key =>
          key.id === sseData.id ? { ...key, status: sseData.status } : key
        )
      );
    }
  }, [sseData]);

  return (
    <div>
      <h1>儀表板</h1>
      <div>
        <h2>總覽</h2>
        {statsLoading && <p>載入中...</p>}
        {statsError && <p>錯誤: {statsError.message}</p>}
        {stats && (
          <>
            <p>總金鑰數: {stats.totalKeys}</p>
            <p>今日總用量: {stats.totalUsage} / {stats.totalLimit}</p>
          </>
        )}
      </div>
      <div>
        <h2>金鑰狀態</h2>
        {keysLoading && <p>載入中...</p>}
        {keysError && <p>錯誤: {keysError.message}</p>}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名稱</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(key => (
              <tr key={key.id}>
                <td>{key.key}</td>
                <td>{key.name}</td>
                <td style={{ color: key.status === 'active' ? 'green' : 'red' }}>
                  {key.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
