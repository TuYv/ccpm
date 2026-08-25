---
name: workflow-guide
description: Reference for typed triggers, durable steps, replay-safe data flow, and idempotent Workflow effects.
user-invocable: false
---
# 工作流指南

每个直接位于 `src/workflows/*.ts` 中的文件都必须默认导出 `createWorkflow(...)`。
文件名将成为其 Workflow key。

对于每个可能发生变化的结果以及每个外部影响，都应使用一个 step。
这包括网络和 Notion API 调用、可变状态读取、时间戳、随机值、生成的 ID、消息、创建操作和更新操作。
对事件以及已完成 step 的结果进行的确定性转换，应放在 step 外部。

已完成的 step 可以重放已保存的结果。
不要依赖 step 内存中的变更。
返回后续代码所需的值。
保持调用顺序稳定，并为每个 step 指定稳定且唯一的名称。

如果外部影响在 step 结果保存之前成功，重试可能会重复该外部影响。
将回调 `id` 作为幂等键传入。
使用稳定的外部 ID、upsert，或者在服务不提供原生支持时执行重复检查。

返回可序列化为 JSON 的值。
请求失败或缺少必需配置时抛出异常。
不要记录密钥或私有 payload。