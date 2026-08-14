---
name: analyzing-projects
description: Analyzes codebases to understand structure, tech stack, patterns, and conventions. Use when onboarding to a new project, exploring unfamiliar code, or when asked "how does this work?" or "what's the architecture?"
---
# 分析项目

### 何时加载

- **触发条件**：开始接手新项目、遇到“这是如何工作的”类问题、探索代码库、理解不熟悉的代码
- **跳过条件**：已经熟悉项目结构和模式

## 项目分析工作流

复制此检查清单并跟踪进度：

```
Project Analysis Progress:
- [ ] Step 1: Quick overview (README, root files)
- [ ] Step 2: Detect tech stack
- [ ] Step 3: Map project structure
- [ ] Step 4: Identify key patterns
- [ ] Step 5: Find development workflow
- [ ] Step 6: Generate summary report
```

## 第 1 步：快速概览

```bash
# Check for common project markers
ls -la
cat README.md 2>/dev/null | head -50
```

## 第 2 步：技术栈检测

### 包管理器与依赖项

- `package.json` → Node.js/JavaScript/TypeScript
- `requirements.txt` / `pyproject.toml` / `setup.py` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` / `build.gradle` → Java
- `Gemfile` → Ruby

### 框架（根据依赖项判断）

- React、Vue、Angular、Next.js、Nuxt
- Express、FastAPI、Django、Flask、Rails
- Spring Boot、Gin、Echo

### 基础设施

- `Dockerfile`、`docker-compose.yml` → 容器化
- `kubernetes/`、`k8s/` → Kubernetes
- `terraform/`、`.tf` 文件 → 基础设施即代码
- `serverless.yml` → Serverless Framework
- `.github/workflows/` → GitHub Actions

## 第 3 步：项目结构分析

以带注释的树状结构呈现：

```
project/
├── src/              # Source code
│   ├── components/   # UI components (React/Vue)
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   └── utils/        # Shared utilities
├── tests/            # Test files
├── docs/             # Documentation
└── config/           # Configuration
```

## 第 4 步：识别关键模式

查找并报告：

- **架构**：单体、微服务、无服务器、单体仓库
- **API 风格**：REST、GraphQL、gRPC、tRPC
- **状态管理**：Redux、Zustand、MobX、Context
- **数据库**：SQL、NoSQL、使用的 ORM
- **身份验证**：JWT、OAuth、会话
- **测试**：Jest、Pytest、Go test 等

## 第 5 步：开发工作流

检查：

- `.eslintrc`、`.prettierrc` → 代码检查/格式化
- `.husky/` → Git 钩子
- `Makefile` → 构建命令
- package.json 中的 `scripts/` → NPM 脚本

## 第 6 步：输出格式

使用以下模板生成摘要：

```markdown
# Project: [Name]

## Overview

[1-2 sentence description]

## Tech Stack

| Category  | Technology |
| --------- | ---------- |
| Language  | TypeScript |
| Framework | Next.js 14 |
| Database  | PostgreSQL |
| ...       | ...        |

## Architecture

[Description with simple ASCII diagram if helpful]

## Key Directories

- `src/` - [purpose]
- `lib/` - [purpose]

## Entry Points

- Main: `src/index.ts`
- API: `src/api/`
- Tests: `npm test`

## Conventions

- [Naming conventions]
- [File organization patterns]
- [Code style preferences]

## Quick Commands

| Action  | Command         |
| ------- | --------------- |
| Install | `npm install`   |
| Dev     | `npm run dev`   |
| Test    | `npm test`      |
| Build   | `npm run build` |
```

## 分析验证

完成分析后，请验证：

```
Analysis Validation:
- [ ] All major directories explained
- [ ] Tech stack accurately identified
- [ ] Entry points documented
- [ ] Development commands verified working
- [ ] No assumptions made without evidence
```

如果有任何项目无法验证，请在报告中将其标注为“需要澄清”。