---
name: workflow
description: Scaffold a Notion Worker Workflow with typed triggers and replay-safe durable steps.
user-invocable: true
disable-model-invocation: true
---
# 工作流

使用此技能向此模板添加一个工作流。

1. 阅读 `AGENTS.md` 以及 `src/workflows/` 中的现有文件。
2. 检查已安装的工作流和触发器声明。
3. 选择触发器、结果、步骤边界以及所需配置。
4. 在 `src/workflows/` 中直接创建一个 camelCase 文件。
5. 默认导出 `createWorkflow(...)`，并使用类型化的触发器创建器。
6. 将所有非确定性工作放入带 `await` 的 `context.step(...)` 调用中。
7. 为每个步骤指定唯一且稳定的名称，并返回可安全转换为 JSON 的后续输入。
8. 在支持的情况下，使用步骤 `id` 作为幂等键。
9. 运行 `npm run check` 和 `npm run build`。

不要写入凭据。如果需要配置，只向 `.env.example` 添加环境变量名称和安全的占位符。