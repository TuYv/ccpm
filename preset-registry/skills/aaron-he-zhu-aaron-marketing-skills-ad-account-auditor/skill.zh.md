---
name: ad-account-auditor
slug: aaron-ad-account-auditor
displayName: "Ad Account Auditor · 付费广告账户审计"
summary: "付费广告账户审计/ROAS评分"
description: 'Use when auditing a paid ad account for incremental contribution, wasted spend, or measurement integrity before scaling; runs a typed 20-item ROAS profile with verified vetoes and a SHIP/FIX/BLOCK/UNDECIDED gate on own exported data. Not for campaign structure design — use campaign-architect; not for creative production — use ad-creative-builder. 付费广告账户审计/ROAS评分'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when checking whether a paid account or portfolio is safe to launch or scale. Requires normalized own-data outcomes, attribution windows, currency, conversion lag, and business constraints."
argument-hint: "<campaign + outcome exports> <currency/window/lag> [profile]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "ad", "phase": "activate", "geo-relevance": "medium", "hermes": {"tags": ["marketing", "ad", "activate"], "category": "ad"}, "openclaw": {"emoji": "🎯", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 广告账户审计器

在已声明的约束条件下，审计一个付费媒体账户或账户组合的增量贡献和运营质量。平台报告的 ROAS 只是输入之一，绝不能单独作为目标或事实依据。

## 必须触发此技能的情形

- 在启动广告、显著增加支出或更改高风险的出价/定向策略之前。
- 当跟踪、归因膨胀、不安全的广告展示位置、宣称或支出浪费存在疑问时。
- 当用户要求根据其导出数据进行 ROAS/RQS 账户审计时。

## 快速开始

```text
Audit this USD account for direct response using 7-day click, 3-day lag, and $120 CAC ceiling.
Run the incremental-profit profile against the holdout and order-ID exports.
```

## 技能契约

**读取：**一个标准化的账户/账户组合证据集。**写入：**仅写入获准的 v3 制品。**完成条件：**所需上下文和全部 20 个状态均已明确，否决项使用经过验证的证据，并且报告评分器输出，但不执行支出变更。

此技能负责判断。`conversion-signal-qa`、`attribution-reconciler`、`campaign-architect`、`ad-creative-builder` 和 `budget-pacing-monitor` 负责构建/修复输入。若未获得单独的明确批准，绝不得启用广告系列、更改出价、上传受众或扩展预算。

对于发布前的账户审计请求，应在此关卡之前立即使用窄路径 `conversion-signal-qa`。不要在信号 QA 和审计之间自动插入 `placement-exclusion-manager` 或 `conversion-value-mapper`；缺失的展示位置或价值证据在本次运行中仍为 Unknown，并且仅当用户提出请求，或完成的关卡识别出相应问题时，这些同级构建器才会成为单独的修复措施。

## 数据源

| 需求 | 首选证据 |
|---|---|
| 投放/支出 | 广告系列、查询、展示位置、受众和变更历史导出数据 |
| 结果事实 | 来自电商、分析平台或 CRM 的已去重订单/潜在客户 ID |
| 经济性 | 币种、利润率/贡献利润、CAC/回收期约束 |
| 归因 | 平台数据 + 自有数据的时间戳/ID，以及标准化的归因窗口和延迟 |
| 安全性/宣称 | 展示位置报告、渲染后的广告/落地页，以及来自 [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md)（付费宣称的 SSOT）的已批准宣称/披露状态 |
| 增量性 | 留出组/地域拆分/因果测试，否则明确标记为代理指标 |

## 说明

### 运行时读取

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/roas-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### 运行时与设置

读取 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`roas-benchmark.md` 和 ROAS 目录条目。独立安装使用内置的不可变 `references/auditor-runtime.md`；绝不要获取可变的 `main`。在进行确定性调用之前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求评分器、验证器和类型化目录可用。如果不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，且不提供关卡裁决或持久化制品。

声明配置（`direct-response|prospecting|incremental-profit`）、目标、货币、归因窗口、转化延迟、业务约束、目的和观察日期。如果缺少任何必要上下文，返回 `NEEDS_INPUT/UNDECIDED`。

### 证据与评分

1. 在比较指标之前，对货币、窗口、ID、延迟和组合范围进行标准化。
2. 对基准中的全部 20 项 `R1..S5` 标准进行评分，并注明来源/日期/类型/置信度。
3. 对缺失的自有数据真值、版位导出数据或对账数据使用 Unknown。无数据并不构成否决，也不能仅仅因为获取不便而标记为 N/A。
4. 核实否决项：
   - `ROAS-R1`：检测体系被证实无法满足指定的自有数据真值集。
   - `ROAS-R2`：已证实存在重大的重复计数/数据虚高。
   - `ROAS-O1`：对照 `offer-claims-registry` 的已批准状态，存在重大的声明/披露不合规问题。
   - `ROAS-O2`：违反适用的平台规则/受限类别规则。
   - `ROAS-A1`：版位证据表明存在重大的安全违规。
5. 运行类型化评分器。将估算的/代理性的增量效果如实标明；不要将平台归因称为因果关系。

## §2 ROAS 完整示例

- 完整的直接响应配置，原始分数 78，无否决项/失败项：`DONE/SHIP`，最终分数 78。
- 完整配置，原始分数 78，一项经核实的 R1 失败：`DONE_WITH_CONCERNS/FIX`，最终分数 59。
- 完整配置，经核实的 R1 和 R2 失败：`DONE/BLOCK`，保留原始分数，无最终分数。
- 缺少版位报告：A1 为 Unknown，`NEEDS_INPUT/UNDECIDED`，无总分。

## §3 ROAS 防护规则

- 较高的报告 ROAS 可能反映投入不足、品牌需求截流或归因虚高。
- 学习阶段中断属于 S2 发现，并非自动否决项。
- ATT/建模数据可能降低置信度；它不会自动导致 R1 失败。
- 频次、创意疲劳和受众饱和需要分别提供证据。
- 在对货币/窗口/延迟进行标准化并对结果去重之前，绝不能比较跨平台回报。

## §5 ROAS 表述转换

首先说明业务影响和证据。如果要求提供追踪信息，应使用 `ROAS-R1/R2/O1/O2/A1` 这些限定标识；不要暴露会与 RAMP/ECHO/TALE 冲突的裸 ID。

## 报告与裁决

以 auditor-runbook 中完全一致的类型化会话标头开头。绝不能使用自然语言替换 `status`、`verdict` 或 `score_state`；在调查发现之前，将每个明确缺失的限定项分别列为 ``ID: `unknown```。

展示裁决、配置/上下文、分数或覆盖率/区间、置信度、R/O/A/S 明细、对账表、经核实的关键控制项、Unknown 证据，以及按优先级排列的修复项/负责人/重新运行条件。状态/裁决以及 59 分上限由评分器决定。

## 验证检查点

- 范围/货币/窗口/延迟/约束/目标均已明确说明。
- 自有数据的结果真值与平台自报数据相互分离。
- 全部 20 个项目均具有有效状态和来源信息；Unknown 不会被重新归一化。
- 否决项失败均已得到正向核实。
- 未经单独批准，不得变更支出/账户。

## 持久化

仅在获得明确授权后持久化到 `memory/audits/ad/YYYY-MM-DD-<topic>.md`。针对预期的 `--relative-path` 组装完整的 v3 草稿，并使用 `validate-audit-artifact.py` 进行验证；只能通过一次包含完整内容的 Write 执行持久化，然后按照 auditor runbook 的要求重新验证目标。不支持通过 Edit/shell/MCP 修改保留的接收位置。不得自主写入热缓存、声明、候选项或账户状态。

## 参考资料

- [ROAS 基准](../../../references/roas-benchmark.md)
- [衡量协议](../../../references/measurement-protocol.md)
- [审核员操作手册](../../../references/auditor-runbook.md)
- [评分语义](../../../references/scoring-semantics.md)

## 后续最佳技能

- **跟踪：** [conversion-signal-qa](../conversion-signal-qa/SKILL.md)
- **声明/披露：** [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md) — `ROAS-O1` 背后已获批准的声明/披露状态
- **归因：** [attribution-reconciler](../../scale/attribution-reconciler/SKILL.md)
- **结构/受众：** [campaign-architect](../../research/campaign-architect/SKILL.md)
- **预算进度：** [budget-pacing-monitor](../../scale/budget-pacing-monitor/SKILL.md)