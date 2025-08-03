# Gemini Key Router

這是一個 Gemini API 金鑰代理和管理伺服器。

## 開發環境啟動指南

本專案採用 Monorepo 架構，前後端共享同一個 `package.json`。

1.  **安裝依賴**：
    在專案根目錄下執行：
    ```bash
    npm install
    ```

2.  **啟動開發伺服器**：
    在專案根目錄下執行：
    ```bash
    npm run dev
    ```
    此命令將會使用 `concurrently` 同時啟動後端 API 伺服器 (使用 `nodemon` 監聽變更) 和前端 Vite 開發伺服器。