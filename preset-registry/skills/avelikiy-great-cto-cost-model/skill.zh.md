---
name: cost-model
description: Standardized cost-estimation framework for great_cto plans. Forces explicit LLM cost, infra cost, human-supervision time, and the (defensible) human-equivalent comparison. Output format is parsable by the board's /api/cost path — must follow exactly.
when_to_use: |
  Apply when:
  - pm is writing PLAN-*.md and the Cost section is required
  - architect is forecasting LLM burn for a new feature (gate:cost for AI archetypes)
  - any report claims a savings ratio — must show methodology
effort: low
allowed-tools: Read, Write
paths:
  - "docs/plans/**"
  - "docs/architecture/**"
---
# 成本模型——确保成本声明经得起核查

great_cto 会在看板上报告成本数字。这些数字必须可审计，因为一个错误的“7,638×”声明曾严重损害可信度（参见 docs/blog/cost-dashboard-rebuild.md）。本技能定义了相应格式。

## 4 行成本部分

每个 PLAN-*.md 和 ARCH-*.md 的成本部分都遵循以下确切模板：

```markdown
## Cost estimate

**LLM**: $<low>–<high> (<N> calls × $<per-call avg>)
**Human equiv**: $<low>–<high> (<hours> × $<rate>/h)
**Infra delta**: $<low>–<high>/month
**Time to ship**: <hours> agent-time, <hours> wall-clock

> Methodology: <one-sentence rationale for each range>
```

### 为什么必须采用这一确切格式？

看板的 `getCostHistory()` 解析器会锚定**行首**的“LLM”和“Human”标签。为防止 $240-trap 回归问题，行中间的引用会被忽略。请严格遵循该模板。

## 如何估算每一行

### LLM 成本

对于流水线中的每个智能体，估算：
- **提示词 token 数** =（系统提示词大小）+（智能体接收的上下文）
- **补全 token 数** =（该类型智能体的典型输出）

Sonnet 4 的快速参考（输入 $3/M，输出 $15/M）：

| 智能体 | 典型提示词 | 典型输出 | 单次调用成本 |
|---|---|---|---|
| architect | 14k | 1.5k | ~$0.06 |
| pm | 6k | 0.6k | ~$0.03 |
| senior-dev | 8k | 0.8k | ~$0.04 |
| qa-engineer | 11k | 0.5k | ~$0.04 |
| reviewer（平均） | 8-12k | 0.6k | ~$0.04 |
| security-officer | 12k | 1k | ~$0.05 |
| devops | 9k | 0.8k | ~$0.04 |

对于 Haiku（$0.80/M / $4/M），除以约 4。对于 Opus 4（$15/M / $75/M），乘以约 5。

将流水线中实际触发的各阶段成本相加（使用 archetypes.ts 中的 `gatesFor()` 和 `reviewersFor()` 来确定数量）。

### 人工等效成本

在不使用智能体的情况下，由人工完成**相同**工作的成本。也就是：“如果我聘请一名高级工程师，这项任务需要多长时间，按什么费率计算？”

- 高级工程师：$120-180/小时（美国/欧洲中端市场）
- Staff 工程师/专业人员：$200-300/小时
- 领域专家（安全、合规）：$250-400/小时

请保守估算工时。LLM 用 15 分钟完成的一个“小功能”，人工可能需要 2-4 小时（工作绝不只是敲代码）。

### 基础设施增量

只计算**新增**的部分。如果该功能新增了一个 Redis 实例，就计入 Redis。如果它每月只增加 10MB 的 S3 存储，那可以忽略——不要列出。

### 交付时间

需要提供两个数字——两者都有用：
- **智能体时间**：LLM 调用的实际运行时间（通常为 5-30 分钟）
- **实际历时**：包含人工关卡在内的实际经过时间（通常为数小时到数天）

## 编写前的合理性检查

在将该部分提交到计划之前，请验证：

```
ratio = human_equiv / llm_cost
```

如果 `ratio > 1000`，则说明存在问题。常见错误包括：

| 错误 | 如何检测 | 修复方法 |
|---|---|---|
| 单位错误（$ 与 ¢） | LLM 成本以 /M tokens 而不是 $ 结尾 | 换算：tokens / 1M × price |
| 计算的是节省额而非支出 | 写的是“节省的人工时间”，而非“人工成本” | 使用完成工作的成本，而不是省略工作的价值 |
| 行中标签污染 | 计划在同一行包含“$X LLM \| $Y human” | 使用模板中的多行格式 |
| 预测值与实际值混合 | LLM 预测值被计入 total_llm | 如有需要，请单独设置预测部分 |

## 成本门禁

对于 AI 原型（`mlops`、`ai-system`、`agent-product`），流水线会在架构师完成预测后开启 `gate:cost`。在 senior-dev 开始工作前，CTO 必须批准预计的月度支出。

使用 GATE 模板：

```markdown
## Gate:cost forecast

| Production volume | Monthly LLM cost |
|---|---|
| 1K req/day | $X |
| 10K req/day | $Y |
| 100K req/day | $Z |

Recommended monthly cap: $<cap>
Triggers above cap: <what alerts fire, who gets paged>
```

## 反模式

❌ **整数表演。** “$0.50 LLM | $7,500 human”——看起来很可疑。应使用现实的范围：“$0.50–1.20 | $225–360”。

❌ **单点估算。** 始终提供一个范围。单个数字会掩盖不确定性。

❌ **没有方法论说明。** 只有数字而没有依据，无法验证。

❌ **含糊带过基础设施成本。** “一些托管成本”并不是一个数字。要么给出具体的 $ 金额，要么说明“infra: no change.”

## 示例——良好

```markdown
## Cost estimate

**LLM**: $0.75–1.85 (3 tasks × $0.25–0.62 per Sonnet call)
**Human equiv**: $225–300 (1.5–2h × $150/h, mid-market senior)
**Infra delta**: $0/month (uses existing Express + Postgres)
**Time to ship**: ~15min agent-time, ~3h wall-clock (1 human gate)

> Methodology: tasks sized by line-count estimate; per-call cost from
> historical Sonnet 4 averages on this archetype's plans.
```

比率 = 300/1.85 = **162×**。合理。经得起推敲。