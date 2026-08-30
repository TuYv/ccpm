---
name: caveman-evidence-review
description: >
  Read-only review of Caveman Cloud evidence: cost, Cave Score, workflows,
  traces, latency, errors, routing, savings. Use when asked what Caveman found
  or where LLM spend goes.
---
# 审查 Caveman 证据

作为只读操作员。基于当前的 Caveman 数据得出结论，而不是基于对仓库的猜测。绝不要通过此 skill 启动、批准、取消或回滚实验。

## 硬性规则

1. 将以下类别分开：
   - 已测量的提供商完整列表价成本；
   - `inferred` 每日余量；
   - `verified` 账本节省；
   - 证据成本。
   绝不要将它们相加或重新标记。
2. 除非用户明确要求审查 payload，否则不要获取 prompt、completion、tool 或 artifact payload。对于默认审查，元数据、span、计时、模型、token 数量、状态和优化器归因已经足够。
3. 将每次读取限定在 Caveman 上下文所选的项目内。绝不要提供 organization id。
4. 空结果表示当前没有信号，而不是零成本或零风险。
5. 引用所使用的 trace id 和确切时间窗口。不要仅根据聚合结果声称某个原因。

## 第 1 步 — 加载上下文

优先使用 MCP：

```text
caveman_context {}
```

CLI 备用方案：

```bash
caveman cloud whoami
caveman cloud projects list
```

如果缺少登录或项目选择，则停止。要求用户运行
`caveman login` 或选择一个项目；绝不要猜测。

## 第 2 步 — 建立基线

使用 `caveman_report` 获取：

- `overview`
- `costs`
- `score`
- `workflows`
- `verified_savings`

然后使用 `caveman_plan` 获取按排名排列的每日余量。如果问题范围较窄，则跳过无关报告。读取能够回答问题的最短报告集合。

CLI 备用方案：

```bash
caveman cloud costs
caveman cloud score
caveman cloud plan --json
```

在解读趋势之前，说明报告窗口和依据。

## 第 3 步 — 使用 traces 验证主要解释

使用 `caveman_trace_search`。选择一个有界窗口和封闭过滤条件：workflow、agent、model、provider、error code、runtime mode、cache status、
optimization id、status class、token/cost/latency bounds、compression 或
monitor verdict。

有用的分组方式：

- `workflow` — 找出推高成本或失败的作业；
- `model` — 比较模型构成；
- `session` — 定位重试或循环行为；
- 不分组 — 识别确切的 traces。

将可疑 cohort 与控制 cohort 或更早的有界窗口进行比较。不要根据单个高成本 trace 推断因果关系。

CLI 备用方案：

```bash
caveman cloud traces search \
  --workflow <slug> \
  --from <RFC3339> \
  --to <RFC3339> \
  --sort total_cost_usd \
  --dir desc \
  --limit 25
```

## 第 4 步 — 检查代表性 traces

针对少量高信号 trace ids 调用 `caveman_trace_get`。检查 request 和 span 元数据、延迟、状态、token 数量、缓存状态、已应用的优化器以及模型路由。保持 payload 获取关闭。

CLI 备用方案：

```bash
caveman cloud traces show <trace-id> --spans
```

## 第 5 步 — 报告

使用以下结构：

```text
## Caveman 证据审查

范围：<project> · <from> 到 <to>
已测量成本：<value and basis>
已验证节省：<ledger value, kept separate>
推断余量：<per-day band, kept separate>

发现：
1. <finding> — <aggregate evidence> — traces <ids>
2. <finding> — <aggregate evidence> — traces <ids>

尚未证实：
- <plausible explanation lacking a control, trace, or eval>

下一项只读检查：
- <one bounded query>

可能的操作：
- <proposal only; use caveman-manage for read-only lifecycle review and safety gate>
```

如果数据缺失，请指出缺失的信号，并将表述停留在证据能够支持的最强结论上。绝不要把目录小计当成发票，也不要把实验结果当成经验证实的节省额。