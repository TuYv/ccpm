---
name: nx-workspace-patterns
description: Configure and optimize Nx monorepo workspaces. Use when setting up Nx, configuring project boundaries, optimizing build caching, or implementing affected commands.
---
# Nx 工作区模式

用于 Nx monorepo 管理的生产级模式。

## 何时使用此技能

- 搭建新的 Nx 工作区
- 配置项目边界
- 使用 affected 命令优化 CI
- 实现远程缓存
- 管理项目之间的依赖
- 迁移到 Nx

## 核心概念

### 1. Nx 架构

```
workspace/
├── apps/              # Deployable applications
│   ├── web/
│   └── api/
├── libs/              # Shared libraries
│   ├── shared/
│   │   ├── ui/
│   │   └── utils/
│   └── feature/
│       ├── auth/
│       └── dashboard/
├── tools/             # Custom executors/generators
├── nx.json            # Nx configuration
└── workspace.json     # Project configuration
```

### 2. 库类型

| 类型            | 用途                            | 示例                |
| --------------- | -------------------------------- | ------------------- |
| **feature**     | 智能组件、业务逻辑              | `feature-auth`      |
| **ui**          | 展示型组件                      | `ui-buttons`        |
| **data-access** | API 调用、状态管理              | `data-access-users` |
| **util**        | 纯函数、辅助函数                | `util-formatting`   |
| **shell**       | 应用启动引导                    | `shell-web`         |

## 模板与详细实操示例

完整的模板库和详细的实操示例位于 `references/details.md` 中。需要具体模板时，请阅读该文件。

## 最佳实践

### 应做事项

- **一致地使用标签** - 通过模块边界强制执行
- **尽早启用缓存** - 可显著节省 CI 开销
- **保持库职责聚焦** - 单一职责
- **使用生成器** - 确保一致性
- **为边界编写文档** - 帮助新开发者

### 避免事项

- **不要创建循环依赖** - 依赖图应保持无环
- **不要跳过 affected** - 只测试变更的部分
- **不要忽视边界** - 技术债会不断累积
- **不要过度细粒度拆分** - 平衡库的数量
