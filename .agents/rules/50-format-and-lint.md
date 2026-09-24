# 代码格式与 Lint 规范

Prettier 是唯一格式化工具，ESLint Flat Config 是唯一静态检查入口。提交前运行 `pnpm run format:check` 和 `pnpm run lint`；不要在编辑器中启用与仓库冲突的第二套格式化器。

使用两空格缩进、LF 换行、分号、双引号和尾随逗号。组件文件和组件名使用 `PascalCase`，函数、变量和 Hook 使用 `camelCase`，常量使用描述性大写命名，类型使用 `PascalCase`。导入顺序和 JSX 格式交给 Prettier/ESLint，不手工制造无意义差异。

ESLint 错误必须修复；警告只有在有明确理由时保留，并在代码或合并请求中说明。生成的 API 文件、构建目录、测试报告和依赖目录不参与格式化或 Lint。
