# 项目脚本与构建工具规范

## 包管理与脚本

仓库统一使用系统全局 pnpm 12，提交 `pnpm-lock.yaml`，禁止新增或更新 `package-lock.json`。依赖变更使用 `pnpm add`、`pnpm remove` 或 `pnpm install`，不要手工编辑锁文件。常用脚本通过 `pnpm run <script>` 执行。

脚本名称使用动词或动作加冒号分组，例如 `test:e2e`、`check:api`、`format:check`。脚本应可在干净 checkout 中运行，避免依赖全局 CLI、交互式输入或未记录的本地服务。

## 构建与环境

Vite 负责开发服务器和生产构建，TypeScript 负责类型检查；不要在 Vite 配置中加入业务逻辑。API 代理使用 `VITE_API_PROXY_TARGET`，生产 origin 使用 `VITE_API_BASE`。敏感配置只通过环境变量提供，不写入源码或提交文件。

CI 至少执行 API 生成校验、格式检查、Lint、类型检查、单元测试和生产构建；发布镜像必须复用同一锁文件和检查命令。
