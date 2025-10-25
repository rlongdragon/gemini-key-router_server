# Gemini Key Router

這是一個 Gemini API 金鑰代理和管理伺服器。

## 環境需求
- Node.js v18 或以上

## 如何使用
1. 克隆此專案到本地：
    ```bash
    git clone https://github.com/rlongdragon/gemini-key-router_server.git
    ```
2. 編譯專案：
    ```bash
    cd gemini-key-router_server
    npm i 
    npm run build
    ```
3. 啟動伺服器：
    ```bash
    npm start
    ```

服務將會在 `http://0.0.0.0:5000` 運行。

狀態面板 `http://0.0.0.0:5000/` 用於監控 API 使用與呼叫

管理面板 `http://0.0.0.0:5000/management` 用於管理 API 金鑰與群組

你可以在你的 AI agent 或應用程式中，將 API 請求指向此伺服器，以使用 Gemini API。

> 目前 API end point 雖然在 webpanel 有預留位置，但目前需使用 node.js 環境變數設定 `GOOGLE_API_BASE_URL` 來指定 API 的 base URL，未指定預設為 Google AI studio 。


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
    或者你也可以分別執行
    ```bash
    npm run dev:server
    ```
    和
    ```bash
    npm run dev:webpanel
    ```
    來分別啟動後端和前端伺服器。

## 專案結構
- `src/server/`：後端 API 伺服器程式碼。
- `src/webpanel/`：前端管理面板程式碼。
- `/data/`：儲存 API 金鑰與使用紀錄的資料夾。