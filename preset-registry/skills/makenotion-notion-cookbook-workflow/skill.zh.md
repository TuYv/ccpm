---
name: workflow
description: Scaffold a Notion Worker Workflow with typed triggers and replay-safe durable steps.
user-invocable: true
disable-model-invocation: true
---
# 工作流

使用此技能向此模板添加工作流。

1. 阅读 `AGENTS.md` 以及 `src/workflows/` 中的现有文件。
2. 检查已安装的工作流和触发器声明。
3. 选择触发器、结果、步骤边界以及所需配置。
4. 在 `src/workflows/` 中直接创建一个 camelCase 文件。
5. 默认导出 `createWorkflow(...)`，并使用类型化的触发器创建器。
6. 将所有非确定性工作放入已等待的 `context.step(...)` 调用中。
7. 为每个步骤设置稳定的显示名称。对于重复步骤，保持名称不变，并传入稳定且唯一的复合 `key`，例如
   `{ key: ["process-page", page.id] }`。
8. 返回后续步骤所需的 JSON 安全值。
9. 在支持的情况下，使用步骤 `id` 作为幂等键。
10. 运行 `npm run check` 和 `npm run build`。

不要写入凭据。如果需要配置，只向 `.env.example` 添加环境变量名称和安全的占位符。