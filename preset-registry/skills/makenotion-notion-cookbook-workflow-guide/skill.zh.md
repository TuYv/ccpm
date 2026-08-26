---
name: workflow-guide
description: Reference for typed triggers, durable steps, replay-safe data flow, and idempotent Workflow effects.
user-invocable: false
---
# 工作流指南

每个直接位于 `src/workflows/*.ts` 中的文件都必须默认导出 `createWorkflow(...)`。  
文件名将成为其工作流键。

对于每个可能发生变化的结果以及每个外部作用，都应使用一个步骤。这包括网络调用和 Notion API 调用、可变状态读取、时间戳、随机值、生成的 ID、消息、创建操作和更新操作。对事件以及已完成步骤结果进行的确定性转换，应放在步骤之外。

已完成的步骤可以重放已保存的结果。不要依赖步骤内部的内存变更。返回后续代码所需的值。保持调用顺序稳定，并为每个步骤指定稳定的显示名称。默认情况下，该名称同时也是重放键。对于重复步骤，不要将项目 ID 或循环索引插入名称；而应传入一个稳定的组合键：

```ts
await context.step(
  "Process page",
  { key: ["process-page", page.id] },
  async ({ id }) => processPage(page, { idempotencyKey: id })
)
```

键必须在重试期间保持稳定，并且在一次工作流运行中保持唯一。

如果外部作用在步骤结果保存之前已成功，重试可能会再次执行该外部作用。将回调的 `id` 作为幂等键传入。当服务不支持原生幂等时，请使用稳定的外部 ID、upsert 或重复检查。

返回可序列化为 JSON 的值。请求失败或缺少必需配置时应抛出异常。不要记录机密信息或私有 payload。