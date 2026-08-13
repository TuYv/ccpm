---
name: caveman-evidence-review
description: >
  Review Caveman Cloud evidence read-only: costs, Cave Score, Cave Plan,
  workflows, traces, latency, errors, compression, routing, and verified
  savings. Use when the user asks what Caveman found, where LLM spend goes,
  why cost or quality changed, which workflows need attention, or asks for a
  trace or analytics review. Prefer Caveman MCP tools; fall back to CLI JSON.
---
# Caveman 证据审查

以只读操作员身份行事。基于当前 Caveman 数据得出结论，而不是基于仓库猜测。不要从该技能中发起、批准、取消或回滚实验。

## 硬规则

1. 保持这些分桶独立：
   - 已测量的 provider-complete 列表价成本；
   - `inferred` 每日可推断空余；
   - `verified` 账本节省；
   - 证据成本。  
   不要添加或重命名它们。
2. 除非用户明确要求载荷审查，否则不要获取 prompt、completion、tool 或 artifact 载荷。元数据、span、时间、模型、token 计数、状态和优化器归因就足以进行默认审阅。
3. 将每次读取范围限定为 Caveman 上下文所选项目。切勿提供组织 ID。
4. 空结果意味着没有当前信号，而不是零成本或零风险。
5. 引用使用的 trace id 和精确时间窗口。不要仅凭聚合结果断言因果关系。

## 步骤 1 — 加载上下文

优先使用 MCP：

```text
caveman_context {}
```

CLI 回退：

```bash
caveman cloud whoami
caveman cloud projects list
```

若登录或项目选择缺失则停止。要求用户运行 `caveman login` 或选择项目；不要猜测。

## 步骤 2 — 建立基线

使用 `caveman_report` 获取：

- `overview`
- `costs`
- `score`
- `workflows`
- `verified_savings`

然后使用 `caveman_plan` 获取按优先级排序的每日头部空间。若问题范围较窄，请跳过无关报告。读取能够回答问题的最短集合。

CLI 回退：

```bash
caveman cloud costs
caveman cloud score
caveman cloud plan --json
```

在解读方向前先说明报告窗口和依据。

## 步骤 3 — 用追踪验证主导解释

使用 `caveman_trace_search`。选择一个有界窗口和封闭过滤器：  
workflow、agent、model、provider、error code、runtime mode、cache status、optimization id、status class、token/cost/latency 范围、compression 或 monitor verdict。

有用的分组方式：

- `workflow` — 找出推动成本或失败的作业；
- `model` — 比较模型组合；
- `session` — 隔离重试或循环行为；
- ungrouped — 识别具体 trace。

将疑似人群与对照人群或更早的有界窗口进行比较。不要从单个高成本 trace 推断因果关系。

CLI 回退：

```bash
caveman cloud traces search \
  --workflow <slug> \
  --from <RFC3339> \
  --to <RFC3339> \
  --sort total_cost_usd \
  --dir desc \
  --limit 25
```

## 步骤 4 — 检查代表性 traces

对少量高信号 trace id 调用 `caveman_trace_get`。检查 request 和 span 元数据、延迟、状态、token 计数、缓存状态、应用的优化器以及模型路由。保持载荷检索关闭。

CLI 回退：

```bash
caveman cloud traces show <trace-id> --spans
```

## 步骤 5 — 报告

使用以下格式：

```text
## Caveman evidence review

Scope: <project> · <from> to <to>
Measured cost: <value and basis>
Verified savings: <ledger value, kept separate>
Inferred headroom: <per-day band, kept separate>

Findings:
1. <finding> — <aggregate evidence> — traces <ids>
2. <finding> — <aggregate evidence> — traces <ids>

Unproven:
- <plausible explanation lacking a control, trace, or eval>

Next read-only check:
- <one bounded query>

Possible action:
- <proposal only; use caveman-manage for read-only lifecycle review and safety gate>
```

若数据缺失，请注明缺失的信号，并停留在最有力的支持性结论上。切勿将目录小计当作发票或将实验结果当作验证过的节省。
