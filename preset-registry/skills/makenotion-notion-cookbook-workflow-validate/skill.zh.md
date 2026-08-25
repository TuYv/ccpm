---
name: workflow-validate
description: Review Notion Worker Workflows for trigger typing and retry safety.
user-invocable: true
disable-model-invocation: true
---
# 工作流验证

检查 `src/workflows/` 中的每个文件及其调用的任何模块。报告每个发现的问题，包括其文件、行号、影响和修复方法。

将以下情况视为错误：

1. Workflow 不是直接文件，或未默认导出 `createWorkflow`。
2. 使用了特定于触发器的事件字段，但未进行类型收窄。
3. 非确定性工作发生在等待中的 step 之外。
4. 重试之间的 step 顺序或名称可能发生变化。
5. step 结果不是 JSON 可序列化的，或后续代码需要依赖内存中的变更。
6. 对重试敏感的写入缺少幂等键或重复防护。
7. 忽略了外部故障，或凭据被硬编码或记录到日志中。

在依赖已安装的情况下，运行 `npm run check` 和 `npm run build`。