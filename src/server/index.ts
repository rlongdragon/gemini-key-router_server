import express, { Request, Response, NextFunction } from "express";
import { GenerateContentRequest } from "@google/generative-ai";
import ProxyManager from "./src/class/ProxyManager";
import adminRouter from './src/api/routes/admin.routes';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

async function startServer() {
  // 初始化 ProxyManager
  const proxyManager = await ProxyManager.createInstance();

  // 使用 express.json() 中介軟體來解析 JSON 請求主體
  app.use(express.json());
  app.use(cors());

  // 核心代理路由，同時處理串流和非串流請求
  app.post(
    /^\/v1beta\/models\/(?<modelId>[^/]+):(generateContent|streamGenerateContent)$/,
    async (req: Request, res: Response) => {
      const isStreaming = req.path.includes(':streamGenerateContent');
      console.log(`#6JSY Received request for model: ${req.params.modelId}, streaming: ${isStreaming}`);
      try {
        const result = await proxyManager.proxy(req);

        if (isStreaming) {
          // 1. 將 Content-Type 改為 text/event-stream 並設定相關標頭
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          for await (const chunk of result.stream) {
            const data = JSON.stringify(chunk);
            // 2. 將每個 chunk 格式化為 SSE 事件
            res.write(`data: ${data}\n\n`);
          }
          res.end();
        } else {
          res.json(result.response);
        }
      } catch (error: any) {
        if (error.message.includes('No available API keys')) {
          res.status(503).json({ error: error.message });
        } else {
          console.error(error);
          res.status(500).json({ error: 'Failed to proxy request', errorMessage: error.message });
        }
      }
    }
  );

  // 掛載管理 API 路由
  app.use('/api/v1/admin', adminRouter);

  app.listen(port, () => {
    console.log(`代理伺服器正在 http://localhost:${port} 上運行`);
  });


  // if have ../webpanel folder, serve it as static files
  const path = require('path');
  const fs = require('fs');
  const webpanelPath = path.join(__dirname, "..", "webpanel");
  console.log("Checking for webpanel at:", webpanelPath);
  if (fs.existsSync(webpanelPath)) {
    app.use(express.static(webpanelPath));
    const indexFile = path.join(webpanelPath, "index.html");
    const managementFile = path.join(webpanelPath, "management.html");

    app.get("/", (req: Request, res: Response) => {
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("index.html not found");
      }
    });

    app.get("/management", (req: Request, res: Response) => {
      if (fs.existsSync(managementFile)) {
        res.sendFile(managementFile);
      } else {
        res.status(404).send("management.html not found");
      }
    });
    console.log('Web panel is being served from /webpanel');
  }
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
