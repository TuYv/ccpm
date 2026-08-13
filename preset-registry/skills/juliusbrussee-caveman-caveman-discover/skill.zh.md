---
name: caveman-discover
description: >
  Find every LLM workflow in the current repository and label it, so Caveman
  Cloud groups spend by what the code actually does (support-reply,
  nightly-digest) instead of one anonymous bucket. Use when the user pastes
  the Caveman discovery prompt, says "discover workflows", or asks to break
  LLM spend down by workflow. The repo should already route through the
  Caveman gateway (the caveman-setup skill does that part).
---
你正在为 Caveman Cloud 标注该仓库的 LLM 工作流。*workflow* 是代码实际执行的一项工作——例如“回复工单”、 “生成夜间摘要”、 “运行评测套件”——而不是某种技术。每个网关请求都可以携带工作流标签；未标注的流量全部落入 `unlabeled-workflow` 分组。你的任务是：找出工作流、为其取好名字、接入标签，并验证没有破坏任何东西。

这会修改代码，因此会经过用户的常规审核流程：**先给出提案表，待用户同意后再应用**。对一个已标注的仓库重复执行时必须不产生变化（幂等）。

该技能由操作员触发。`unlabeled-traffic` 的 Cave Plan 观测仅用于审核，不会创建 advisory 文件、提案或 Draft PR。不要据此推断遥测已选定某个调用点或授权了编辑。应独立清点仓库、提交标注表，并在修改代码前等待用户批准。

## 第 1 步 — 盘点工作流

从入口点遍历仓库，而不是从 import：

- 调用 LLM 的 HTTP/RPC 处理器（直接调用或经多层封装）
- 定时任务：cron 定义、队列消费者、worker、调用 LLM 代码的 GitHub Actions
- CLI 命令与脚本（`scripts/`、`bin/`、`package.json` 脚本）
- 消耗真实 token 的评测 / 测试框架
- 框架内的独立代理或链路（每个 LangGraph 图、每个 crew、每个代理定义通常各自是一个工作流）

一个工作流 = 一个人会命名的任务。十个调用点在同一个请求处理器内仍属于同一个工作流；一个供三项任务共用的 `llm.ts` helper 也对应三个工作流（应在调用者处打标，而不是在共享 helper 处）。

## 第 2 步 — 命名

Slug 规则（网关强制）：小写 `[a-z0-9_-]`，1–96 个字符。  
命名要按工作内容，而非按技术：

- 合法：`support-reply`、`nightly-digest`、`pr-review`、`eval-suite`、`onboarding-email`
- 不合法：`openai-calls`（按技术）、`main`（含义不明）、`SupportReply`（非法）、`johns-test-3`（不具可持续性）

名称具有近似永久性——后续重命名会导致消耗记录被拆分。当代码无法清晰反映任务目的时，按文件名推导 slug，并在表中标记为 `review`，不要凭空编造用途。

## 第 3 步 — 先提案，再应用

先给出此表并询问是否继续：

```
| workflow | job | where | how it gets labeled |
|---|---|---|---|
| support-reply | answers inbound tickets | src/bot/reply.ts:41 | defaultHeaders on the reply client |
| nightly-digest | 02:00 summary job | jobs/digest.ts:12 | header on the digest client |
| eval-suite (review) | scripts/eval.ts:8 — purpose inferred from filename | scripts/eval.ts:8 | env override at invocation |
```

然后按调用点采用最轻量的方式接入各标签：

- **@caveman-ai/sdk / caveman_cloud SDK**：在每条 trace 上使用 `workflow` 选项，或在单一作业服务构建的客户端上使用 `defaultWorkflow`。
- **原始服务商 SDK**（OpenAI/Anthropic/LangChain/LiteLLM/Vercel）：在已携带 `x-cave-api-key` 的同一 `defaultHeaders` / `default_headers` / `extra_headers` 区块中新增 `"x-cave-workflow": "<slug>"`。若是多个工作流共用同一客户端，则按调用逐条传入头部（上述每个 SDK 都支持按请求覆盖头部），或为每个工作流提供各自的轻量客户端。
- **封装的编码代理**（`caveman wrap`）：在调用处（cron 行、CI 步骤）使用 `--workflow <slug>` 参数或 `CAVE_WORKFLOW=<slug>` 环境变量。
- **原始 HTTP**：向请求中添加 `x-cave-workflow` 头。

对调用者打标，保持最小改动并贴合仓库风格。如果某调用点没有经过 Caveman 网关，不要打标——在报告中列为“未接入”；标签只会随网关流量传递，是否接入由 caveman-setup 技能负责。

## 第 4 步 — 验证

运行仓库已有流程中的任一已标记路径（测试、开发脚本、一次 curl）进行验证。然后确认：请求仍能成功（网关对无效标签会以 400 `cave_invalid_request_header` 拒绝——若出现则修正 slug）。已标记的消耗会在 `/activity?tab=workflows` 仪表盘中，随着每次工作流运行显示；定时任务会在其触发时出现，这一点请在报告中如实说明，而不要声称它们是“持续在线”的。

## 第 5 步 — 报告

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

若你完全没有发现 LLM 入口点：请准确说明这一点，并指向设置技能（`<docs origin>/docs/agent-setup.md`），不要编造表格。
