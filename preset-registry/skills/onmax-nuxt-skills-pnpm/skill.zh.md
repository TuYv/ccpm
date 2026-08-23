---
name: pnpm
description: Use when managing Node.js dependencies with pnpm - install packages, configure monorepo workspaces, set up pnpm catalogs, resolve dependency conflicts with overrides, patch third-party packages, and configure CI pipelines for pnpm projects
license: MIT
---
# pnpm

内容寻址存储、严格依赖、workspace 协议、catalog。

## 使用场景

- 安装/管理 npm 包
- 使用 catalog 设置 monorepo workspace
- 覆盖传递依赖
- 修补第三方包
- 为 pnpm 项目配置 CI/CD
- 加强供应链安全

## 快速开始

```bash
pnpm install                      # Install deps
pnpm add <pkg>                    # Add dep
pnpm add -D <pkg>                 # Dev dep
pnpm -r run build                 # Run in all packages
pnpm --filter @myorg/app build    # Run in specific package
```

## Workspace 设置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

# Catalogs for centralized version management
catalog:
  react: ^18.2.0
  typescript: ~5.3.0
```

```json
// package.json - Use workspace protocol and catalogs
{
  "packageManager": "pnpm@10.28.2",
  "dependencies": {
    "@myorg/utils": "workspace:^",
    "react": "catalog:"
  }
}
```

## 参考文件

| 任务                             | 文件                                      |
| -------------------------------- | ----------------------------------------- |
| 命令、脚本、筛选                 | [cli.md](references/cli.md)               |
| Workspace、catalog、配置         | [workspaces.md](references/workspaces.md) |
| 覆盖、补丁、钩子、存储          | [features.md](references/features.md)     |
| CI/CD、Docker、迁移              | [ci.md](references/ci.md)                 |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/cli.md](references/cli.md) - 如果使用 pnpm 命令、脚本或筛选功能
- [ ] [references/workspaces.md](references/workspaces.md) - 如果设置 monorepo、catalog 或 workspace 配置
- [ ] [references/features.md](references/features.md) - 如果使用覆盖、补丁、钩子或管理存储
- [ ] [references/ci.md](references/ci.md) - 如果配置 CI/CD、Docker，或从 npm/yarn 迁移

**不要一次性加载所有文件。** 只加载与你当前任务相关的文件。

## 验证设置

配置 workspace 后，验证其是否正常工作：

```bash
pnpm install          # Install all deps
pnpm ls --depth 0     # Verify workspace links
pnpm -r run build     # Build all packages
```

## 跨 Skill 参考

- **TypeScript 库** → 使用 `ts-library` skill 了解库模式
- **构建工具** → 使用 `tsdown` 或 `vite` skill