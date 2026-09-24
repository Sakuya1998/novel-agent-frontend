# 项目工程规范与 pnpm 迁移实施计划

> **面向代理开发者：** 按任务逐项执行；每项完成后运行对应验证命令。规则主入口为 `AGENTS.md`，主题规则位于 `.agents/rules/`。

**目标：** 建立统一的 AI 开发规则、项目架构规范、代码质量工具链和 VS Code 工作区配置，并将项目从 npm 迁移到 pnpm。

**架构：** `AGENTS.md` 负责规则优先级、执行流程和主题索引；`.agents/rules/` 按职责拆分 AI 工作流、架构、页面与接口、类型与工具、脚本、格式化和 Lint 规范。Prettier 负责格式化，ESLint Flat Config 负责静态检查，`package.json` 脚本和 CI 使用 pnpm 作为唯一包管理入口。

**技术栈：** Node.js 24、系统全局 pnpm 12、React 19、TypeScript 5、Vite 8、Vitest 4、Playwright、Prettier、ESLint Flat Config。

## 全局约束

- 所有新增规则和开发说明使用简体中文；命令、路径、API 字段和代码标识符保持原样。
- 不改变现有运行时功能；生成的 API 文件仍只能通过 `openapi/novel-agent-v1.json` 派生。
- `AGENTS.md` 是 AI 规则主文件；`.agents/rules/` 不得与其冲突。
- 删除 `package-lock.json`，提交 `pnpm-lock.yaml`，仓库脚本和 CI 不再调用 npm。

## 任务 1：建立 AI 规则与工程规范

**文件：**

- 修改：`AGENTS.md`
- 新建：`.agents/rules/00-ai-workflow.md`
- 新建：`.agents/rules/10-architecture.md`
- 新建：`.agents/rules/20-page-and-api.md`
- 新建：`.agents/rules/30-types-and-utils.md`
- 新建：`.agents/rules/40-scripts-and-build.md`
- 新建：`.agents/rules/50-format-and-lint.md`

- [x] 在主文件中加入规则优先级、变更流程、验证要求和主题索引。
- [x] 在主题文件中分别写明项目架构、页面/接口、类型/工具函数、脚本/构建工具、代码格式/Lint 规范。
- [x] 检查规则与当前目录结构、`package.json` 脚本及 API 生成流程一致。

## 任务 2：接入 Prettier 与 ESLint

**文件：**

- 修改：`package.json`
- 新建：`eslint.config.js`
- 新建：`.prettierrc.json`
- 新建：`.prettierignore`
- 新建：`.editorconfig`

- [x] 添加 Prettier、ESLint、TypeScript、React Hooks 和 Prettier 兼容配置依赖。
- [x] 配置严格 TypeScript 检查、React Hooks 规则、React Refresh 规则和生成/构建产物忽略项。
- [x] 增加 `format`、`format:check`、`lint`、`lint:fix` 脚本，并让统一检查调用格式检查和 Lint。
- [x] 使用 pnpm 安装依赖并生成锁文件。

## 任务 3：迁移 pnpm 与 CI 文档

**文件：**

- 修改：`package.json`、`README.md`、`.github/workflows/ci.yml`、`.github/workflows/release.yml`、`Dockerfile`
- 删除：`package-lock.json`
- 新建：`pnpm-lock.yaml`

- [x] 声明系统 pnpm 12 兼容范围及 Node 版本要求。
- [x] 将 CI、Release、Docker 和 README 中的安装、检查、审计命令改为 pnpm。
- [x] 使用 pnpm 的 GitHub Actions 缓存配置，确保锁文件作为缓存依据。
- [x] 检查仓库中不再残留 npm 安装或运行命令（审计命令除外时也统一为 pnpm 等价命令）。

## 任务 4：统一 VS Code 工作区体验

**文件：**

- 新建：`.vscode/settings.json`
- 新建：`.vscode/extensions.json`
- 新建：`.vscode/tasks.json`

- [x] 配置两空格缩进、LF、保存时格式化、ESLint 修复、行尾空白清理和工作区 TypeScript。
- [x] 排除 `node_modules`、`dist`、覆盖率、Playwright 报告和测试结果。
- [x] 推荐 Prettier、ESLint 和 Playwright 扩展。
- [x] 提供开发服务器、统一检查、单元测试、E2E 测试和 API 类型检查任务。

## 任务 5：验证与交付

- [x] 运行 `pnpm install --frozen-lockfile`。
- [x] 运行 `pnpm format:check`、`pnpm lint`、`pnpm typecheck`、`pnpm check:api`、`pnpm test` 和 `pnpm build`。
- [x] 使用 JSON 解析检查 VS Code 和 ESLint 配置，使用 `git diff --check` 检查空白问题。
- [x] 汇总变更文件、规则入口、包管理迁移影响和验证结果。
