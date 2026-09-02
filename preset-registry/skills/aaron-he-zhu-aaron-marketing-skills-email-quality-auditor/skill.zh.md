---
name: email-quality-auditor
slug: aaron-email-quality-auditor
displayName: "Email Quality Auditor · 邮件质量审计"
summary: "邮件质量审计/EQS评分/发送前放行"
description: 'Use when the user asks to "audit an email program" or "is this campaign safe to send"; runs a typed 20-item SEND profile with authentication, consent, opt-out, and claim veto checks on own evidence. Not for building deliverability setup — use deliverability-qa; not for designing lifecycle flows — use email-sequence-designer. 邮件质量审计/EQS评分/发送前放行'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when checking an email program or send before release, or when authentication, consent, suppression, engagement quality, lifecycle fit, claims, or outcome attribution are in doubt."
argument-hint: "<ESP/DMARC/outcome evidence> [promotional|retention|cold-outbound|newsletter]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "email", "phase": "deliver", "geo-relevance": "low", "hermes": {"tags": ["marketing", "email", "deliver"], "category": "email"}, "openclaw": {"emoji": "✉️", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# Email Quality Auditor

使用 SEND 审计一个电子邮件项目/配置文件和观察窗口。打开率是对 MPP 敏感的代理证据；直接行动和项目声明的结果真值集决定结果判读。

## When This Must Trigger

- 在渠道安全性不确定时，于重要的广播/序列发布前触发。
- 当需要对身份验证、同意、抑制、投诉、频率、声明或归因进行门禁检查时触发。
- 当用户请求 EQS/SEND 基线或重新运行时触发。

## Quick Start

```text
使用过去 90 天、提供商拆分、MPP 占比和订阅真值集审计这份新闻简报。
根据 DMARC、同意事件、实时抑制、声明和订单 ID 检查这次促销发送。
```

## Skill Contract

**读取：** 一个项目/配置文件、规范化窗口、提供商证据、实时同意/抑制状态、已渲染消息和结果真值。**写入：** 仅写入经过授权的 v3 工件。**完成条件：** 明确所有预期的 SEND 状态，并报告评分器结果；不得发送电子邮件或更改提供商设置。

使用 `deliverability-qa` 修复身份验证，使用 `consent-registry` 获取合法依据/抑制事实，使用 `email-sequence-designer` 设计旅程，使用 `send-experiment-designer` 设计预注册测试。

## Data Sources

| 需求 | 首选证据 |
|---|---|
| 身份验证 | DNS、消息标头、DMARC 汇总证据 |
| 同意/抑制 | 追加写入式同意事件以及当前实时投影 |
| 投递位置/信誉 | 提供商/种子面板以及注明日期的 ESP/提供商报告 |
| 参与度 | 按队列/提供商/MPP 分段的 ESP 导出 |
| 生命周期 | 触发器/流程配置和事件导出 |
| 结果 | 电商、CRM、订阅、赞助或指定的等效真值集 |
| 内容 | 已渲染的消息/目标页面以及已批准的声明/披露状态 |

## Instructions

### Runtime Reads

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/send-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### Runtime and Setup

阅读 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`send-benchmark.md` 以及 SEND 目录条目。独立安装使用捆绑且不可变的 `references/auditor-runtime.md`；绝不获取可变的 `main`。在确定性调用前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求评分器、验证器和类型化目录可用。如果不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，且不返回门禁判定或持久化工件。

声明配置文件（`promotional|retention|cold-outbound|newsletter`）、目标/项目、提供商、市场、规范化窗口、列表存续时间、MPP 占比和观察日期。

### Evidence and Scoring

1. 冻结证据，并在比较比率前协调提供商队列和时间窗口。
2. 对全部 20 个 `S1..D5` 标准进行评分。每个观察到的状态都必须包含来源/日期/类型/置信度。
3. 当不使用打开和 CTOR 时，`E2` 为 N/A，并说明原因。`N3/N5` 根据项目设计确定是否适用。缺少记录或导出数据时应标记为 Unknown，而不是 N/A。
4. 验证否决条件：
   - `SEND-S1`：所需的身份验证被明确证明已损坏/未对齐。
   - `SEND-S2`：已核实列表为购买、抓取或非法获取；缺少来源证明时为 Unknown。
   - `SEND-N1`：退出订阅机制损坏/缺失，或未遵守已记录的抑制要求。
   - `SEND-D1`：重要声明/披露/优惠条款未通过已批准的证据验证。
5. 运行类型化评分器。在可用时，使用点击/回复/下游行动作为主要参与度证据；打开率/CTOR 仍应作为带限定说明的代理证据。

对于缺少足够程序证据的仅发送审查，请报告已验证的红线检查结果和确切缺口，但返回 `NOT_SCORED/UNDECIDED`；“在所提供的证据中未观察到阻断项”不构成完整的 SEND SHIP 结论。

## §2 SEND 工作示例

- 完整的 newsletter profile，原始分数为 81，无否决项/失败项：`DONE/SHIP`，最终得分为 81。
- 完整的 promotional profile，原始分数为 76，已验证存在一个 S1 失败项：`DONE_WITH_CONCERNS/FIX`，最终得分为 59。
- 完整的 profile，已验证存在 S2 和 N1 失败项：`DONE/BLOCK`，不提供最终得分。
- Consent provenance 缺失：S2 为 Unknown，`NEEDS_INPUT/UNDECIDED`，不提供分数。

## §3 SEND 防护规则

- 在 SPF/DKIM 对齐且启用主动监控的情况下，DMARC `p=none` 不会自动构成 S1 失败项。
- 必须分别说明 provider one-click-unsubscribe policy 和法定义务。
- Opens 和 CTOR 需要注明 MPP 分群/代理服务器的限制；它们不能单独证明人类注意力。
- newsletter 不需要具备 cart/post-purchase flows；仅对其声明的 program 中适用的 journeys 进行评分。
- 发送频率过高是严重的 E4/E5 发现，但不是自动否决项。

## §5 SEND 翻译

用通俗易懂的语言解释渠道和收件人风险。收到 trace request 时，说明 `SEND-S1/S2/N1/D1` 的限定条件，并展示底层的 DNS/event/rendered evidence。

## 报告和结论

以 auditor-runbook 的精确 typed conversation header 开头。绝不要用 prose 替换 `status`、`verdict` 或 `score_state`；在 findings 之前，将每个明确缺失的 qualified item 列为 ``ID: `unknown```。

展示 verdict、profile/context、score 或 coverage/interval、confidence、S/E/N/D detail、outcome truth set、verified critical controls、Unknown inputs 和 fix owners。不要仅根据 DNS 声称 deliverability/inbox placement，也不要执行发送。

## 验证检查点

- 已声明 program/profile/provider/window/list age/market/MPP share。
- 已通过 replay 验证 live suppression state，而不是使用陈旧的 projection 或待处理的 proposal。
- 全部 20 个状态均有效；conditional N/A 具有原因。
- Provider metrics 与 reconciled outcome truth 已分开。
- 未在单独获得明确批准的情况下修改 email/provider。

## 持久化

仅在获得明确授权后，持久化到 `memory/audits/email/YYYY-MM-DD-<topic>.md`。保留 scorer 的正交 `status` 和 `verdict`；使用 `validate-audit-artifact.py`，针对预期的 `--relative-path` 验证完整的 v3 draft，仅通过一次完整内容的 Write 进行持久化，并按照 auditor runbook 对目标重新验证。对 reserved sink 的 Edit/shell/MCP mutation 不受支持。不得自主修改 consent、claims、provider settings 或 hot cache。

## 参考资料

- [SEND 基准](../../../references/send-benchmark.md)
- [测量协议](../../../references/measurement-protocol.md)
- [审计员运行手册](../../../references/auditor-runbook.md)
- [评分语义](../../../references/scoring-semantics.md)

## 下一项最佳技能

- **Authentication/placement：** [deliverability-qa](../../setup/deliverability-qa/SKILL.md)
- **Consent/suppression：** [consent-registry](../../../protocol/consent-registry/SKILL.md)
- **Lifecycle：** [email-sequence-designer](../../nurture/email-sequence-designer/SKILL.md)
- **Experiment：** [send-experiment-designer](../send-experiment-designer/SKILL.md)