---
name: caveman-discover
description: >
  Find and label every LLM workflow in the repository so Caveman Cloud groups
  spend by workflow instead of one bucket. Use for "discover workflows" or
  breaking LLM spend down by workflow.
---
你正在为 Caveman Cloud 标注此仓库的 LLM 工作流。*工作流* 是代码执行的一项任务——“回答支持工单”、“构建每日摘要”、“运行评估套件”——而不是某种技术。每个网关请求都可以携带一个工作流标签；未标记的流量都会归入一个 `unlabeled-workflow` bucket。你的任务是：找出工作流，为它们命名，接入标签，并验证没有任何内容被破坏。

这会修改代码，因此需要经过用户正常的审查流程：**先提出表格，用户同意后再应用。** 对已经完成标记的仓库重新运行时不得产生任何更改（幂等）。

此技能由操作员调用。`unlabeled-traffic` Cave Plan observation 仅供审查，不会创建 advisory 文件、proposal 或 Draft PR。不要推断遥测数据选择了某个调用点，也不要推断其授权了编辑。请独立盘点仓库，展示标记表，并在修改代码前等待用户批准。

## 第 1 步 — 盘点工作流

从仓库的入口点开始遍历，而不是从导入关系开始：

- 调用 LLM 的 HTTP/RPC 处理器（直接调用或通过多层封装调用）
- 定时任务：调用 LLM 代码的 cron 定义、队列消费者、worker、GitHub Actions
- CLI 命令和脚本（`scripts/`、`bin/`、package.json scripts）
- 会消耗真实 token 的评估 / 测试 harness
- 框架中的不同 agent 或 chain（每个 LangGraph graph、每个 crew、每个 agent definition 通常都是独立的工作流）

一个工作流 = 一项人类会单独命名的任务。同一个请求处理器中的十个调用点属于一个工作流；三个任务共用的 `llm.ts` helper 则属于三个工作流（在调用方添加标签，绝不要在共享 helper 上添加）。

## 第 2 步 — 命名

Slug 语法（网关会强制执行）：小写 `[a-z0-9_-]`，长度为 1–96 个字符。命名应针对任务，而不是技术：

- 好例子：`support-reply`、`nightly-digest`、`pr-review`、`eval-suite`、`onboarding-email`
- 反例：`openai-calls`（技术）、`main`（没有表达任何含义）、`SupportReply`（无效）、`johns-test-3`（无法长期适用）

名称具有近乎永久的性质——之后重命名会拆分支出历史。当无法从代码中明确判断任务目的时，请根据文件名推导 slug，并在表格中将其标记为 `review`，不要凭空臆造任务目的。

## 第 3 步 — 提出方案，然后应用

展示下表并询问是否继续：

```
| workflow | job | where | how it gets labeled |
|---|---|---|---|
| support-reply | answers inbound tickets | src/bot/reply.ts:41 | defaultHeaders on the reply client |
| nightly-digest | 02:00 summary job | jobs/digest.ts:12 | header on the digest client |
| eval-suite (review) | scripts/eval.ts:8 — purpose inferred from filename | scripts/eval.ts:8 | env override at invocation |
```

然后在每个调用点使用可用的最轻量机制接入相应标签：

- **@caveman-ai/sdk / caveman_cloud SDK**：使用每条 trace 的 `workflow` 选项，或在单一任务服务构造的 client 上设置 `defaultWorkflow`。
- **原始 provider SDK**（OpenAI/Anthropic/LangChain/LiteLLM/Vercel）：在已经携带 `x-cave-api-key` 的同一个 `defaultHeaders` / `default_headers` / `extra_headers` 块中添加 `"x-cave-workflow": "<slug>"`。多个任务共用的 client → 按调用传递 header（以上每个 SDK 都支持按请求覆盖 header），或者为每个任务提供一个轻量 client。
- **封装的 coding agent**（`caveman wrap`）：在调用位置（cron 行、CI 步骤）使用 `--workflow <slug>` flag 或 `CAVE_WORKFLOW=<slug>` env。
- **原始 HTTP**：向请求添加 `x-cave-workflow` header。

标记调用方，使差异保持最小，并遵循仓库的风格。如果某个调用点完全没有通过 Caveman 网关路由，就不要为其添加标记——将其列在报告的“未接入”下（标签只会通过网关流转；接线是 caveman-setup skill 的职责）。

## 步骤 4 — 验证

运行仓库现有的、用于执行一条已标记路径的方式（测试、开发脚本或一次 curl）。然后确认：请求仍然成功（网关会以 400 `cave_invalid_request_header` 拒绝无效标签——如果出现这种情况，请修正 slug）。当每个工作流下次运行时，带标签的支出会显示在 `/activity?tab=workflows` 的仪表板上；按计划运行的任务会在计划触发时显示，这一点应在报告中明确说明，而不要假装它们是实时的。

## 步骤 5 — 报告

```
## Workflows labeled

| workflow | job | where |
|---|---|---|
| support-reply | answers inbound tickets | src/bot/reply.ts:41 |
| nightly-digest | 02:00 summary job | jobs/digest.ts:12 |

Verified: <the labeled path you actually exercised, and what you observed>
Lands at: <DASHBOARD>/activity?tab=workflows — each row appears as that workflow
next runs. Anything still unlabeled shows as `unlabeled-workflow`.
Not wired (no gateway routing, so no label): <list or "none">
Marked review: <slugs whose purpose was inferred from filenames, or "none">
```

如果完全没有找到 LLM 入口：请准确说明这一点，并指向设置 skill（`<docs origin>/docs/agent-setup.md`），不要凭空编造表格。