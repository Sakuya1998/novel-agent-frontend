# 仓库指南

## AI 开发规则（主入口）

本文件是本仓库 AI 开发规则的主入口；`.agents/rules/` 下的主题规则是本文件的细化说明，二者冲突时以本文件和用户明确要求为准。所有新增文档和 AI 回复默认使用简体中文，命令、路径、API 字段名和代码标识符保持原样。

AI 修改代码前必须先阅读相关目录、测试和配置，说明影响范围后再编辑；优先做最小、可回滚的改动，不顺手重构无关代码。涉及删除、批量覆盖、依赖升级、API 契约或安全配置时，先确认影响并保留验证依据。不得提交密钥、真实凭据、本地后端仓库或测试产物。

每次改动都要补充或更新相邻测试，并至少运行与变更匹配的检查；准备交付前运行 `pnpm run check`，报告实际命令和结果，不得用“应该通过”代替验证。生成文件只能通过源文件重新生成，禁止手工修改 `src/api/generated/`。

主题规则：

- `.agents/rules/00-ai-workflow.md`：协作流程、风险边界和交付要求。
- `.agents/rules/10-architecture.md`：目录职责、模块边界和状态管理。
- `.agents/rules/20-page-and-api.md`：页面、路由、接口和错误处理。
- `.agents/rules/30-types-and-utils.md`：类型定义、工具函数和测试要求。
- `.agents/rules/40-scripts-and-build.md`：pnpm 脚本、Vite、CI 和环境变量。
- `.agents/rules/50-format-and-lint.md`：Prettier、ESLint、命名和代码格式。

## 项目结构与模块组织

这是一个基于 Vite、React 和 TypeScript 的前端项目。应用入口位于 `src/main.tsx` 和 `src/App.tsx`。可复用界面组件放在 `src/components/`；路由页面放在 `src/pages/`；领域逻辑按职责组织在 `src/features/`、`src/auth/`、`src/workspaces/` 和 `src/permissions/`。API 客户端及生成的 OpenAPI 类型位于 `src/api/`；后端变更时请同步更新源契约 `openapi/novel-agent-v1.json`。单元测试与源文件同目录，命名为 `*.test.ts` 或 `*.test.tsx`；浏览器场景测试位于 `e2e/`。脚本统一放在 `scripts/`。

## 构建、测试与开发命令

运行 `pnpm install` 安装锁定的依赖，运行 `pnpm run dev` 在 5173 端口启动 Vite。使用 `pnpm run check` 执行完整本地检查（OpenAPI 生成校验、格式检查、Lint、严格类型检查、Vitest 和生产构建）。也可单独运行 `pnpm run typecheck`、`pnpm test` 和 `pnpm run build`；开发过程中使用 `pnpm run test:watch`。修改 OpenAPI 契约后运行 `pnpm run generate:api`，或运行 `pnpm run check:api` 校验生成结果。运行 `pnpm run test:e2e` 执行 Playwright 测试；测试依赖后端流程时，将 `NOVEL_AGENT_API_ROOT` 设置为兼容的后端仓库路径。

## 编码风格与命名约定

使用严格 TypeScript，并遵循现有的两空格缩进、分号和双引号导入风格。优先使用函数式 React 组件和 Hooks；组件文件名使用 `PascalCase`，函数和变量使用 `camelCase`，领域名称应清晰具体。特性专属样式应尽量与对应特性放在一起；共享样式位于 `src/styles.css` 和 `src/workspace.css`。不要手动编辑 `src/api/generated/` 下的文件，应从 OpenAPI 契约重新生成。

## 测试指南

Vitest 在 `jsdom` 环境中运行，并发现 `src/**/*.test.{ts,tsx}`。修改代码时，应在相邻目录补充聚焦的单元测试或组件测试，并以被测模块命名。Playwright 在桌面版和移动版 Chromium 中覆盖认证与备份流程；失败时会将截图和追踪文件保存在 `test-results/`。

## 提交与合并请求指南

提交信息应遵循项目历史中的 Conventional Commits 格式，例如 `feat: add ...`、`fix: correct ...` 或 `chore: ...`；内容应简洁并使用祈使语气。合并请求应说明用户可见的行为变化，关联对应 issue 或任务，列出验证命令（优先使用 `pnpm run check`），并为界面变更附上截图或录屏。请明确说明 API 契约变更及生成文件更新。

## 配置与安全

复制 `.env.example` 配置本地环境。Vite 会将 `/api`、`/healthz` 和 `/readyz` 代理到 `VITE_API_PROXY_TARGET`（默认值为 `http://127.0.0.1:8000`）；生产环境 API 地址使用 `VITE_API_BASE`。严禁提交密钥、本地后端仓库或生成的测试产物。
