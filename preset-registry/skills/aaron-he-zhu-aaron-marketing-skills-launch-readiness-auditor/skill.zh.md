---
name: launch-readiness-auditor
slug: aaron-launch-readiness-auditor
displayName: "Launch Readiness Auditor · 发布就绪审计"
summary: "发布就绪审计/RAMP分阶段评估/发布前放行"
description: 'Use when the user asks to "audit our launch plan", "are we ready to launch", or evaluate launch execution/outcomes; runs one typed RAMP preflight, execution, or outcome profile without mixing time horizons. Not for recording launch state — use launch-registry; not for running launch day — use launch-day-conductor. 发布就绪审计/RAMP分阶段评估/发布前放行'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use for launch-eve readiness, an observed launch-window execution audit, or a post-lag outcome review. Each run uses one lifecycle profile and never averages plans, execution, and outcomes."
argument-hint: "<launch slug/plan/evidence> [preflight|execution|outcome]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "launch", "phase": "mobilize", "geo-relevance": "low", "hermes": {"tags": ["marketing", "launch", "mobilize"], "category": "launch"}, "openclaw": {"emoji": "🚀", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 发布准备度审计

在一个生命周期读取点审计一次发布。发布前检查评估准备度/资产，以及计划中的政策和埋点红线；执行检查评估发布窗口内观察到的运行情况；结果检查评估滞后期结束后的证明。不存在跨时间的综合评估。

## 必须触发的时机

- 在已确定的发布/公告之前，需要作出 go/no-go 决策证据时。
- 在发布窗口期间或之后，需要评估执行质量时。
- 在声明的滞后期结束后，复盘实际结果和经验时。

## 快速开始

```text
Run RAMP preflight for launch alpha against the registry stage, canon, claims, rules, and event QA.
Run the outcome profile at day 30; keep it separate from the preflight result.
```

## 技能契约

**读取：**一次发布、一个生命周期读取点、注册表/规范/声明状态，以及特定配置文件的证据。**写入：**仅写入经过权限许可的 v3 工件。**完成条件：**所选配置文件已完成，或已报告其确切的 Unknowns，且没有执行发布或修改注册表。

`launch-registry` 负责阶段/日期/禁运事实。`launch-day-conductor` 执行运行手册。本审计器只评判已冻结的证据。

## 数据来源

| 需求 | 首选证据 |
|---|---|
| 阶段/访问权限 | 预计发布记录，加上直接访问/资格检查 |
| 叙事/声明 | 规范版本、声明投影、渲染后的资产 |
| 运营/规则 | 发布计划、承诺、注明日期的官方平台规则 |
| 埋点 | 已验证的事件/UTM，以及目标页面真实情况检查 |
| 执行 | 带时间戳的操作/事件/响应证据 |
| 结果 | 声明的滞后期结束后，自有分析/CRM/商店真实数据 |

## 说明

### 运行时读取

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/ramp-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### 运行时与设置

读取 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`ramp-benchmark.md` 和 RAMP 目录条目。独立安装使用捆绑的不可变 `references/auditor-runtime.md`；绝不要获取可变的 `main`。在确定性调用之前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求评分器、验证器和类型化目录可用。如果不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，不提供任何门禁判定或持久化工件。

声明配置文件/生命周期读取点（`preflight|execution|outcome`）、目标发布、发布类型、市场、访问模型、观察日期和证据窗口。

### 配置文件流程

- **发布前检查：**对 R1–R10、A1–A10、计划中的 M1 和 P1 进行评分。只有在声明的访问模型承诺公开付费可用时，才要求提供公开定价页面。
- **执行：**对观察到的 M1–M10 进行评分；不得用计划中的运行手册质量替代实际执行情况。
- **结果：**在声明的滞后期结束后对 P2–P10 进行评分；不得将预测目标回填为实际值。

每个观测状态都需要来源/日期/类型/置信度。缺失的适用证据为 Unknown；目录授权的条件性项目可以标记为 N/A，但必须说明原因。在选定的 typed profile 上运行 `python3 "$AARON_SKILLS_ROOT/scripts/rubric-score.py" score <run.json>`。

验证与 profile 相关的否决项：`RAMP-R1` 阶段/访问权限矛盾、`RAMP-A1` 重要声明/披露失败、`RAMP-M1` 计划中或已观测到的操纵/禁运/平台违规，以及参与界面上确实损坏的检测工具 `RAMP-P1`。

## §2 RAMP 工作示例

- 完成 preflight，原始分数为 80，无否决项/失败：`DONE/SHIP`，最终分数为 80。
- 完成 preflight，原始分数为 76，已验证存在一个 A1 失败：`DONE_WITH_CONCERNS/FIX`，最终分数为 59。
- 完成 preflight，已验证存在 R1 和 M1 失败：`DONE/BLOCK`，无最终分数。
- 在 conversion lag 之前读取结果，或没有自有数据的实际值：`NEEDS_INPUT/UNDECIDED`，无分数。

## §3 RAMP 防护栏

- 阶段真实性取决于承诺的访问权限/资格；定价页面不能作为 GA 的普遍证据。
- 真诚的反馈请求不等于拉票。
- 受隐私限制的建模测量可以是 Partial；必要检测工具损坏则为 P1 Fail。
- 发布堆叠/容量是 M10 发现项，不会自动构成否决。
- 绝不要对 preflight、execution 和 outcome profiles 求平均，也不要将它们的分数作为同一构念进行比较。

## §5 RAMP 翻译

每次结果都要读取状态生命周期。在收到 trace 请求时，注明 `RAMP-R1/A1/M1/P1` 的限定条件，尤其要针对相互冲突的 ROAS ID。

## 报告与裁决

以 auditor-runbook 的精确 typed conversation header 开始。绝不要用自然语言替换 `status`、`verdict` 或 `score_state`；在 findings 之前，明确列出每个缺失的合格项目，格式为 ``ID: `unknown```。逐字使用稳定的目录 ID（例如 `RAMP-R1`）；绝不要替换为 evidence-subcheck 标签，也不要合成带后缀的 ID，例如 `RAMP-R1d`。

开头应列出特定于生命周期的裁决、目标/上下文/日期、分数或覆盖率/区间、置信度、profile 详情、关联的既有读取结果、关键证据、Unknown 项，以及修复/重新运行负责人。preflight SHIP 本身不授权任何外部发布操作；仍然需要明确的 execution approval。

## 验证检查点

- 已声明一个 launch profile 和一个 lifecycle profile。
- 未混用计划、执行和结果证据。
- 仅对预期项目评分；Unknown/N/A 语义正确。
- 已积极验证阶段/访问权限、政策、声明和检测工具否决项。
- 未发生任何 launch、submission、registry 或 campaign 副作用。

## 持久化

仅在获得明确授权后持久化到 `memory/audits/launch/YYYY-MM-DD-<topic>.md`。保留评分器相互独立的 `status` 和 `verdict`；使用 `validate-audit-artifact.py` 针对预期的相对路径验证完整的 v3 草稿，仅通过一次完整内容的 Write 进行持久化，并按照 auditor runbook 对目标重新验证。不支持对保留 sink 进行 Edit/shell/MCP 变更。不同的生命周期读取结果应创建不同文件，并通过 launch ID 关联，而不是覆盖原文件。

## 参考资料

- [RAMP 基准测试](../../../references/ramp-benchmark.md)
- [审计员运行手册](../../../references/auditor-runbook.md)
- [评分语义](../../../references/scoring-semantics.md)
- [测量协议](../../../references/measurement-protocol.md)

## 下一项最佳技能

- **阶段/承诺事实：** [launch-registry](../../../protocol/launch-registry/SKILL.md)
- **资产/技术修复：** [launch-asset-packager](../../assemble/launch-asset-packager/SKILL.md)
- **执行已批准的计划：** [launch-day-conductor](../launch-day-conductor/SKILL.md)
- **结果监控：** [launch-monitor](../../prove/launch-monitor/SKILL.md)