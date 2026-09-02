---
name: ad-account-auditor
slug: aaron-ad-account-auditor
displayName: "Ad Account Auditor · 付费广告账户审计"
summary: "付费广告账户审计/ROAS评分"
description: 'Use when auditing a paid ad account for incremental contribution, wasted spend, or measurement integrity before scaling; runs a typed 20-item ROAS profile with verified vetoes and a SHIP/FIX/BLOCK/UNDECIDED gate on own exported data. Not for campaign structure design — use campaign-architect; not for creative production — use ad-creative-builder. 付费广告账户审计/ROAS评分'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when checking whether a paid account or portfolio is safe to launch or scale. Requires normalized own-data outcomes, attribution windows, currency, conversion lag, and business constraints."
argument-hint: "<campaign + outcome exports> <currency/window/lag> [profile]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "ad", "phase": "activate", "geo-relevance": "medium", "hermes": {"tags": ["marketing", "ad", "activate"], "category": "ad"}, "openclaw": {"emoji": "🎯", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 广告账户审计员

在已声明的约束条件下，审计一个付费媒体账户或账户组合的增量贡献和运营质量。平台报告的 ROAS 是一个输入，但绝不是目标，也不能单独作为事实依据。

## 必须触发的场景

- 在启动投放、大幅增加花费或更改高风险出价/定向策略之前。
- 当对追踪、归因膨胀、不安全版位、宣传声明或浪费性花费存疑时。
- 当用户要求根据其导出数据进行 ROAS/RQS 账户审计时。

## 快速开始

```text
Audit this USD account for direct response using 7-day click, 3-day lag, and $120 CAC ceiling.
Run the incremental-profit profile against the holdout and order-ID exports.
```

## 技能契约

**读取：** 一份标准化的账户/账户组合证据集。**写入：** 仅写入获得许可的 v3 artifact。**完成条件：** 所需上下文和全部 20 种状态均已明确，否决结论使用经过验证的证据，并且在不执行花费变更的情况下报告评分器输出。

此技能负责判断。`conversion-signal-qa`、`attribution-reconciler`、`campaign-architect`、`ad-creative-builder` 和 `budget-pacing-monitor` 负责构建或修复输入。未经单独明确批准，绝不得启用广告系列、修改出价、上传受众或扩大预算。

对于投放前账户审计请求，应在此关卡之前立即使用窄路径 `conversion-signal-qa`。不要在信号 QA 与审计之间自动插入 `placement-exclusion-manager` 或 `conversion-value-mapper`；缺失的版位或价值证据在本次运行中仍保持为 Unknown，而这些同级构建器只有在用户提出请求，或已完成的关卡识别出相应问题时，才作为单独的修复措施执行。

## 数据源

| 需求 | 首选证据 |
|---|---|
| 投放/花费 | 广告系列、查询、版位、受众和变更历史导出数据 |
| 结果事实 | 来自电商平台、分析工具或 CRM 的去重订单/潜在客户 ID |
| 经济指标 | 货币、利润率/贡献值、CAC/回本约束 |
| 归因 | 平台数据与自有数据中的时间戳/ID、标准化窗口和延迟 |
| 安全/声明 | 版位报告、已渲染的广告/落地页，以及来自 [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md)（付费声明 SSOT）的已批准声明/披露状态 |
| 增量性 | 对照组/地域拆分/因果测试；否则必须明确标记为代理指标 |

## 指令

### 运行时读取

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/roas-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### 运行时与设置

读取 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`roas-benchmark.md` 和 ROAS catalog entry。独立安装使用随附且不可变的 `references/auditor-runtime.md`；绝不要获取可变的 `main`。在确定性调用之前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求 scorer、validator 和 typed catalogs 可用。如果不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，且不返回 gate verdict 或持久化 artifact。

声明 profile（`direct-response|prospecting|incremental-profit`）、target、currency、attribution window、conversion lag、business constraint、goal 和 observation date。若缺少任何必需上下文，返回 `NEEDS_INPUT/UNDECIDED`。

### 证据与评分

1. 在比较指标之前，先规范化 currency、windows、IDs、lag 和 portfolio scope。
2. 从 benchmark 中对全部 20 个 `R1..S5` 标准进行评分，并附上 source/date/type/confidence。
3. 对缺失的 own-data truth、placement exports 或 reconciliation 使用 Unknown。没有数据不构成 veto，也不能仅因为访问不便而记为 N/A。
4. 核验 veto：
   - `ROAS-R1`：instrumentation 可证明地未能满足所命名的 own-data truth set。
   - `ROAS-R2`：已证明存在有实质影响的 double-counting/inflation。
   - `ROAS-O1`：相对于 `offer-claims-registry` approved state，存在有实质影响的 claim/disclosure failure。
   - `ROAS-O2`：存在适用的平台/restricted-category 违规。
   - `ROAS-A1`：placement evidence 证明存在有实质影响的安全性 breach。
5. 运行 typed scorer。将 estimated/proxy incrementality 明确标注为此类；不要把 platform attribution 称为 causal。

## §2 ROAS 示例

- 完整 direct-response profile，原始 78，无 veto/fail：`DONE/SHIP`，最终 78。
- 完整 profile，原始 78，验证过的 1 个 R1 failure：`DONE_WITH_CONCERNS/FIX`，最终 59。
- 完整 profile，验证过的 R1 和 R2 failures：`DONE/BLOCK`，保留 raw，不给出最终分数。
- 缺少 placement report：A1 Unknown，`NEEDS_INPUT/UNDECIDED`，不输出整体分数。

## §3 ROAS 约束

- 很高的 reported ROAS 可能反映的是 under-spend、branded-demand capture 或 attribution inflation。
- Learning-phase disruption 是一项 S2 发现，不会自动构成 veto。
- ATT/modeled data 可能降低 confidence；它不会自动使 R1 失败。
- Frequency、creative fatigue 和 audience saturation 需要单独证据。
- 在未先对 currency/window/lag 进行规范化并去重 outcomes 之前，绝不要跨平台比较 returns。

## §5 ROAS 翻译

先写业务影响和证据。若请求 trace，只能限定说明 `ROAS-R1/R2/O1/O2/A1`；不要暴露与 RAMP/ECHO/TALE 冲突的裸 ID。

## 报告与判定

以 auditor-runbook 的精确 typed conversation header 开头。不要用 prose 替代 `status`、`verdict` 或 `score_state`；将每个显式缺失的 qualified item 先列为 ``ID: `unknown```，再列 findings。

展示 verdict、profile/context、score 或 coverage/interval、confidence、R/O/A/S 明细、reconciliation table、已验证的 critical controls、Unknown evidence，以及按优先级排序的 fix/owner/rerun condition。scorer 负责 status/verdict 和 59 上限。

## 验证检查点

- scope/currency/window/lag/constraint/goal 都是显式的。
- own-data outcome truth 与 platform self-report 是分开的。
- 所有 20 项都有有效状态和 provenance；Unknown 不重新归一化。
- veto failures 已被正向验证。
- 未经单独批准，不得发生 spend/account mutation。

## 持久化

仅在明确授权后持久化到 `memory/audits/ad/YYYY-MM-DD-<topic>.md`。使用 `validate-audit-artifact.py` 按该 intended `--relative-path` 组装并验证完整 v3 草稿，只通过一次完整内容 Write 进行持久化，然后按 auditor runbook 的要求重新验证目标。对 reserved sink 的 Edit/shell/MCP mutations 不受支持。不要自主写入 hot cache、claims、candidates 或 account state。

## 参考材料

- [ROAS benchmark](../../../references/roas-benchmark.md)
- [Measurement protocol](../../../references/measurement-protocol.md)
- [Auditor runbook](../../../references/auditor-runbook.md)
- [Scoring semantics](../../../references/scoring-semantics.md)

## 下一个最佳 Skill

- **Tracking:** [conversion-signal-qa](../conversion-signal-qa/SKILL.md)
- **Claims/disclosures:** [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md) — `ROAS-O1` 背后已批准的 claim/disclosure 状态
- **Attribution:** [attribution-reconciler](../../scale/attribution-reconciler/SKILL.md)
- **Structure/audience:** [campaign-architect](../../research/campaign-architect/SKILL.md)
- **Pacing:** [budget-pacing-monitor](../../scale/budget-pacing-monitor/SKILL.md)