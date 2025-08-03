import React from 'react';

function Management() {
  return (
    <div>
      <h1>金鑰與分組管理</h1>
      <button>新增金鑰</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名稱</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>key-1</td>
            <td>Personal Key</td>
            <td>
              <button>編輯</button>
              <button>刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Management;