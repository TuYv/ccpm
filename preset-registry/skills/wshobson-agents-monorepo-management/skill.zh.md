---
name: monorepo-management
description: Master monorepo management with Turborepo, Nx, and pnpm workspaces to build efficient, scalable multi-package repositories with optimized builds and dependency management. Use when setting up monorepos, optimizing builds, or managing shared dependencies.
---
# Monorepo 管理

构建高效、可扩展的 monorepo，实现跨多个包和应用程序的代码共享、统一的工具链以及原子化变更。

## 何时使用此技能

- 搭建新的 monorepo 项目
- 从多仓库迁移到 monorepo
- 优化构建与测试性能
- 管理共享依赖
- 实现代码共享策略
- 为 monorepo 搭建 CI/CD
- 包的版本管理与发布
- 调试 monorepo 特有的问题

## 核心概念

### 1. 为什么选择 Monorepo？

**优势：**

- 共享代码和依赖
- 跨项目的原子化提交
- 统一的工具链和规范
- 更容易进行重构
- 简化的依赖管理
- 更好的代码可见性

**挑战：**

- 大规模下的构建性能
- CI/CD 的复杂性
- 访问控制
- Git 仓库体积庞大

### 2. Monorepo 工具

**包管理器：**

- pnpm workspaces（推荐）
- npm workspaces
- Yarn workspaces

**构建系统：**

- Turborepo（大多数场景下的推荐选择）
- Nx（功能丰富，较复杂）
- Lerna（较老，处于维护模式）

## Turborepo 设置

### 初始设置

```bash
# Create new monorepo
npx create-turbo@latest my-monorepo
cd my-monorepo

# Structure:
# apps/
#   web/          - Next.js app
#   docs/         - Documentation site
# packages/
#   ui/           - Shared UI components
#   config/       - Shared configurations
#   tsconfig/     - Shared TypeScript configs
# turbo.json      - Turborepo configuration
# package.json    - Root package.json
```

### 配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

```json
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

### 包结构

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./button": {
      "import": "./dist/button.js",
      "types": "./dist/button.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "tsup": "^7.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

## 详细模式与实战示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

1. **版本统一**：在整个工作区中锁定依赖版本
2. **共享配置**：集中管理 ESLint、TypeScript、Prettier 配置
3. **依赖关系图**：保持无环，避免循环依赖
4. **有效缓存**：正确配置输入/输出
5. **类型安全**：在前端/后端之间共享类型
6. **测试策略**：包中使用单元测试，应用中使用端到端（E2E）测试
7. **文档**：每个包中提供 README
8. **发布策略**：使用 changesets 进行版本管理

## 常见陷阱

- **循环依赖**：A 依赖 B，B 又依赖 A
- **幽灵依赖**：使用了未在 package.json 中声明的依赖
- **错误的缓存输入**：Turborepo 的输入中遗漏了文件
- **过度共享**：共享了本应相互独立的代码
- **共享不足**：在各包之间重复编写代码
- **大型 Monorepo**：缺少合适的工具链时，构建会变慢

## 发布包

```bash
# Using Changesets
pnpm add -Dw @changesets/cli
pnpm changeset init

# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish
pnpm changeset publish
```

```yaml
# .github/workflows/release.yml
- name: Create Release Pull Request or Publish
  uses: changesets/action@v1
  with:
    publish: pnpm release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
