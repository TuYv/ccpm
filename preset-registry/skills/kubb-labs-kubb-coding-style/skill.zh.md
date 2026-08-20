---
name: coding-style
description: Coding style, testing, and PR guidelines. Use when writing or reviewing code.
---
# 代码风格与测试技能

## 何时使用

- 创建或审查涉及代码变更的 PR 时
- 向 monorepo 添加新软件包或功能时
- 更新 CI、代码检查或格式化配置时
- 帮助新贡献者上手并分享仓库规范时

## 功能说明

此技能记录了仓库的编码规范、测试指南和 PR 检查清单，以便贡献者和自动化工具能够产出一致且高质量的变更。

- 定义格式化、代码检查和 TypeScript 规范
- 说明测试工作流和 CI 预期
- 概述 PR 要求、变更日志更新和发布相关步骤
- 提供常见的故障排查和恢复命令

## 使用方法

在提交代码或创建 PR 之前，先在本地运行基础的开发检查和修复：

```bash
# Format code and attempt autofixes
pnpm run format

# Lint the repository
pnpm run lint

# Run unit tests
pnpm test

# Create a changeset for versioning
pnpm changeset

# Typecheck whole repo
pnpm typecheck
```

遵循 PR 检查清单，并按相同顺序运行上述命令：**格式化 ? 代码检查 ? 类型检查 ? 测试 ? 创建变更集**。

## 仓库信息

- **Monorepo**：由 pnpm workspaces 和 Turborepo 管理
- **模块系统**：仅使用 ESM（整个仓库均设置 `type: "module"`）
- **Node 版本**：20
- **测试库**：Vitest
- **版本管理**：使用 Changesets 进行版本管理和发布
- **CI/CD**：GitHub Actions

## 编码风格指南

### 基本规则

- **引号**：使用单引号，不使用分号
- **模式**：优先采用函数式模式
- **三元运算符**：为提高可读性，三元运算符的嵌套深度应保持为一层。对于嵌套条件，请使用 if/else 语句或提取为辅助函数。

### 命名规范

| 元素 / 上下文           | 命名规范          |
| ----------------------: | :---------------- |
| 文件 / 目录名称          | `camelCase`       |
| 变量 / 函数              | `camelCase`       |
| 类型 / 接口              | `PascalCase`      |
| React 组件              | `PascalCase`      |

### TypeScript 规范

- **模块解析**：`"bundler"`；仅使用 ESM
- **严格类型**：绝不使用 `any` 类型或 `as any` 类型断言。始终使用正确的类型、泛型，或在适当情况下使用 `unknown`/`never`。
- **文件**：库使用 `.ts`，React 组件使用 `.tsx`，Vue 组件使用 `.vue`
- **DTS 输出**：由 `tsdown` 管理
- **导入**：始终在模块级别使用正确的 import 语句，而不是内联类型导入
- **导出**：根据需要使用 `"exports"` 映射和 `typesVersions`。保持公共 API 稳定
- **根级别类型**：在文件的根级别定义类型，而不是在函数内部定义
- **对象中的函数语法**：在对象方法中使用函数语法（而非箭头函数），以便使用 `this` 关键字

## 测试

- **测试位置**：`src` 文件夹中的 `*.test.ts` 或 `*.test.tsx`
- **聚焦特定测试**：`pnpm test "<test name>"`
- **始终为代码变更添加或更新测试**，并在需要时使用 `-u` 标志更新快照
- **修复所有测试和类型错误，直至整个测试套件通过**
- **移动文件或更改导入后**：运行 `pnpm lint && pnpm typecheck`

### 编写约定

- **聚焦**：一次只测试一项内容
- **隔离**：不要依赖其他测试
- **可重复**：每次都获得相同的结果
- **快速**：确保测试快速完成
- **清晰**：易于理解正在测试的内容

## PR 说明

创建 PR 时，请遵循以下步骤：

1. 确保以下命令在本地运行通过：
  - `pnpm format && pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
2. 创建 git 提交，**标题格式**为：`[<plugin-name>] <Title>`
3. 推送你的分支，并创建一个以 `main` 为目标分支的 PR
4. 完整填写 PR 模板
5. 使用 `pnpm changeset` 添加 changeset
6. 请求相关维护者进行审查
7. 处理反馈并进行任何要求的更改
8. 获得批准后，等待 CI 通过并合并 PR

## 相关技能

| 技能                                   | 用途             |
|-----------------------------------------|---------------------|
| **[../changelog/SKILL.md](../changelog/SKILL.md)** | 更新变更日志，**对于所有包含代码更改的 PR 均为必需** |