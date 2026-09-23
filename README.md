# Novel Agent Frontend

独立的 React + TypeScript 工作台源码。开发时需另行启动兼容 API 服务：

```powershell
npm ci
npm run dev
```

Vite 默认将 `/api`、`/healthz` 和 `/readyz` 代理到 `http://127.0.0.1:8000`。如需更换目标，设置 `VITE_API_PROXY_TARGET`；生产构建可通过 `VITE_API_BASE` 指定 API origin，留空时使用同源 Nginx 代理。

常用检查：

```powershell
npm run check
npm run test:e2e
```

`openapi/novel-agent-v1.json` 是前端仓库使用的 API 契约基线。后端变更需更新该 artifact 并运行 `npm run generate:api`，CI 会校验 job operation 和派生类型。
