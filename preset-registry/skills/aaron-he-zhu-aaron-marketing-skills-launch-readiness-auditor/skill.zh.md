---
name: launch-readiness-auditor
slug: aaron-launch-readiness-auditor
displayName: "Launch Readiness Auditor · 发布就绪审计"
summary: "发布就绪审计/RAMP分阶段评估/发布前放行"
description: 'Use when the user asks to "audit our launch plan", "are we ready to launch", or evaluate launch execution/outcomes; runs one typed RAMP preflight, execution, or outcome profile without mixing time horizons. Not for recording launch state — use launch-registry; not for running launch day — use launch-day-conductor. 发布就绪审计/RAMP分阶段评估/发布前放行'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use for launch-eve readiness, an observed launch-window execution audit, or a post-lag outcome review. Each run uses one lifecycle profile and never averages plans, execution, and outcomes."
argument-hint: "<launch slug/plan/evidence> [preflight|execution|outcome]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "launch", "phase": "mobilize", "geo-relevance": "low", "hermes": {"tags": ["marketing", "launch", "mobilize"], "category": "launch"}, "openclaw": {"emoji": "🚀", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 发布就绪审计器

针对一次发布执行单一生命周期阶段的审计。预检评估就绪情况/资产，以及规划中的政策与插桩红线；执行评估发布窗口期间观测到的运营情况；结果评估滞后期结束后的实际证据。不存在跨时间的综合评估。

## 必须触发此技能的情形

- 在已确定的发布/公告之前，需要获取上线/不上线决策证据时。
- 在发布窗口期间或之后，需要评估执行质量时。
- 在声明的滞后期结束后，需要审查实际结果与经验教训时。

## 快速开始

```text
Run RAMP preflight for launch alpha against the registry stage, canon, claims, rules, and event QA.
Run the outcome profile at day 30; keep it separate from the preflight result.
```

## 技能契约

**读取：**一次发布、单一生命周期阶段、注册表/规范/声明状态，以及特定于评估配置的证据。**写入：**仅写入获得授权的 v3 工件。**完成条件：**所选评估配置已完整完成，或已报告其确切的未知项，且未执行发布操作或修改注册表。

`launch-registry` 负责维护阶段/日期/禁运事实。`launch-day-conductor` 负责执行运行手册。此审计器仅评判已冻结的证据。

## 数据源

| 需求 | 首选证据 |
|---|---|
| 阶段/访问权限 | 预计的发布记录以及直接访问权限/资格检查 |
| 叙事/声明 | 规范版本、声明投影、渲染后的资产 |
| 运营/规则 | 发布计划、承诺、注明日期的官方平台规则 |
| 插桩 | 已验证的事件/UTM，以及目标地址真实性检查 |
| 执行 | 带时间戳的操作/事件/响应证据 |
| 结果 | 声明的滞后期结束后，自有分析系统/CRM/商店中的真实数据 |

## 指令

### 运行时读取

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/ramp-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### 运行时与设置

读取 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`ramp-benchmark.md` 和 RAMP 目录条目。独立安装使用捆绑的不可变 `references/auditor-runtime.md`；切勿获取可变的 `main`。在执行确定性调用之前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求评分器、验证器和类型化目录可用。如果这些内容不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，且不提供门禁判定或持久化工件。

声明评估配置/生命周期阶段（`preflight|execution|outcome`）、目标发布、发布类型、市场、访问模式、观察日期和证据窗口。

### 评估配置流程

- **预检：**对 R1–R10、A1–A10、规划中的 M1 和 P1 进行评分。仅当声明的访问模式承诺公开付费可用时，才要求提供公开定价页面。
- **执行：**对观测到的 M1–M10 进行评分；不得以规划中的运行手册质量替代实际执行情况。
- **结果：**在声明的滞后期结束后对 P2–P10 进行评分；不得将预测目标回填为实际结果。

每个观测状态都需要注明来源/日期/类型/置信度。缺少适用证据时应标记为 Unknown；目录授权的条件性项目可标记为 N/A，但须说明原因。对选定的类型化配置文件运行 `python3 "$AARON_SKILLS_ROOT/scripts/rubric-score.py" score <run.json>`。

验证与配置文件相关的否决项：`RAMP-R1` 阶段/访问权限矛盾、`RAMP-A1` 实质性声明/披露失败、`RAMP-M1` 计划中或已观测到的操纵/禁运/平台违规，以及 `RAMP-P1` 参与界面上已证实失效的检测埋点。

## §2 RAMP 完整示例

- 预检完整，原始分数 80，无否决/失败：`DONE/SHIP`，最终分数 80。
- 预检完整，原始分数 76，一个已验证的 A1 失败：`DONE_WITH_CONCERNS/FIX`，最终分数 59。
- 预检完整，已验证 R1 和 M1 失败：`DONE/BLOCK`，无最终分数。
- 在转化延迟期结束前读取结果，或没有自有数据的实际值：`NEEDS_INPUT/UNDECIDED`，无分数。

## §3 RAMP 防护规则

- 阶段事实以承诺的访问权限/资格为准；定价页面并非全面上市的普遍证据。
- 真诚的反馈请求不属于拉票。
- 受隐私限制的建模测量可为 Partial；必需的检测埋点失效则为 P1 Fail。
- 发布堆叠/容量属于 M10 发现项，并不会自动触发否决。
- 切勿对预检、执行和结果配置文件取平均值，也不要将它们的分数作为同一构念进行比较。

## §5 RAMP 转译

每次输出结果时都应同时说明状态生命周期。在请求追踪时，明确限定 `RAMP-R1/A1/M1/P1`，尤其要与发生冲突的 ROAS ID 加以区分。

## 报告和裁决

首先使用 auditor-runbook 中精确的类型化对话标头。切勿用自然语言替代 `status`、`verdict` 或 `score_state`；在列出发现项之前，将每个明确缺失的限定项目逐一列为 ``ID: `unknown```。逐字使用稳定的目录 ID（例如 `RAMP-R1`）；切勿用证据子检查标签替代，也不要合成带后缀的 ID，例如 `RAMP-R1d`。

开头应列出特定于生命周期的裁决、目标/上下文/日期、分数或覆盖率/区间、置信度、配置文件详情、关联的先前读取结果、关键证据、Unknown 项，以及修复/重新运行的负责人。预检 SHIP 本身并不授权执行任何外部发布操作；仍然需要明确的执行批准。

## 验证检查点

- 已声明一个发布和一个生命周期配置文件。
- 未混用计划、执行和结果证据。
- 仅对预期项目评分；Unknown/N/A 语义正确。
- 已正向验证阶段/访问权限、政策、声明和检测埋点否决项。
- 未发生任何发布、提交、注册表或营销活动副作用。

## 持久化

仅在获得明确授权后持久化到 `memory/audits/launch/YYYY-MM-DD-<topic>.md`。保留评分器中相互正交的 `status` 和 `verdict`；根据预期相对路径，使用 `validate-audit-artifact.py` 验证完整的 v3 草稿，仅通过一次包含完整内容的 Write 执行持久化，并按照 auditor runbook 重新验证目标。保留接收位置不支持通过 Edit/shell/MCP 进行修改。针对不同的生命周期读取结果创建单独文件，并通过发布 ID 将其关联，而不要覆盖。

## 参考资料

- [RAMP 基准](../../../references/ramp-benchmark.md)
- [审核员操作手册](../../../references/auditor-runbook.md)
- [评分语义](../../../references/scoring-semantics.md)
- [测量协议](../../../references/measurement-protocol.md)

## 下一项最佳技能

- **阶段/承诺事实：** [launch-registry](../../../protocol/launch-registry/SKILL.md)
- **资产/技术修复：** [launch-asset-packager](../../assemble/launch-asset-packager/SKILL.md)
- **执行已批准的计划：** [launch-day-conductor](../launch-day-conductor/SKILL.md)
- **结果监控：** [launch-monitor](../../prove/launch-monitor/SKILL.md)