---
name: email-quality-auditor
slug: aaron-email-quality-auditor
displayName: "Email Quality Auditor · 邮件质量审计"
summary: "邮件质量审计/EQS评分/发送前放行"
description: 'Use when the user asks to "audit an email program" or "is this campaign safe to send"; runs a typed 20-item SEND profile with authentication, consent, opt-out, and claim veto checks on own evidence. Not for building deliverability setup — use deliverability-qa; not for designing lifecycle flows — use email-sequence-designer. 邮件质量审计/EQS评分/发送前放行'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when checking an email program or send before release, or when authentication, consent, suppression, engagement quality, lifecycle fit, claims, or outcome attribution are in doubt."
argument-hint: "<ESP/DMARC/outcome evidence> [promotional|retention|cold-outbound|newsletter]"
allowed-tools: WebFetch
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "email", "phase": "deliver", "geo-relevance": "low", "hermes": {"tags": ["marketing", "email", "deliver"], "category": "email"}, "openclaw": {"emoji": "✉️", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 电子邮件质量审计器

使用 SEND 审计一个电子邮件项目/配置文件及其观察窗口。打开率是对 MPP 敏感的代理证据；直接行动以及该项目声明的结果事实集才是结果判读的依据。

## 必须触发此技能的情况

- 在渠道安全性不确定时，进行重要的群发/序列发布之前。
- 当身份验证、同意、抑制、投诉、频率、声明或归因需要设置门禁时。
- 当用户请求 EQS/SEND 基线评估或重新运行时。

## 快速开始

```text
Audit this newsletter using the last 90 days, provider split, MPP share, and subscription truth set.
Check this promotional send against DMARC, consent events, live suppressions, claims, and order IDs.
```

## 技能契约

**读取：**一个项目/配置文件、标准化窗口、提供商证据、实时同意/抑制状态、渲染后的邮件以及结果事实。**写入：**仅写入经许可的 v3 工件。**完成条件：**明确列出所有预期的 SEND 状态并报告评分器结果，且不发送电子邮件或更改提供商设置。

使用 `deliverability-qa` 修复身份验证问题，使用 `consent-registry` 获取合法依据/抑制事实，使用 `email-sequence-designer` 设计旅程，并使用 `send-experiment-designer` 设计预注册测试。

## 数据源

| 需求 | 首选证据 |
|---|---|
| 身份验证 | DNS、邮件标头、DMARC 汇总证据 |
| 同意/抑制 | 仅追加的同意事件以及当前实时投影 |
| 投递位置/信誉 | 提供商/种子面板以及注明日期的 ESP/提供商报告 |
| 互动 | 按群组/提供商/MPP 分段的 ESP 导出数据 |
| 生命周期 | 触发器/流程配置和事件导出数据 |
| 结果 | 电商、CRM、订阅、赞助或已命名的等效事实集 |
| 内容 | 渲染后的邮件/目标页面以及已批准的声明/披露状态 |

## 说明

### 运行时读取

- `../../../references/auditor-runbook.md`
- `../../../references/scoring-semantics.md`
- `../../../references/send-benchmark.md`
- `../../../references/runtime-invocation.md`
- `references/auditor-runtime.md`

### 运行时与设置

读取 `../../../references/auditor-runbook.md`、`scoring-semantics.md`、`send-benchmark.md` 以及 SEND 目录条目。独立安装使用捆绑的不可变 `references/auditor-runtime.md`；绝不获取可变的 `main`。在进行确定性调用之前，遵循 [`runtime-invocation.md`](../../../references/runtime-invocation.md)，解析 `AARON_SKILLS_ROOT="${CLAUDE_PLUGIN_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"`，并要求评分器、验证器和类型化目录可用。如果不可用，则返回 `score_state: NOT_SCORED` / `score_confidence: not_scored`，且不提供门禁结论或持久化工件。

声明配置文件类型（`promotional|retention|cold-outbound|newsletter`）、目标/项目、提供商、市场、标准化窗口、列表存续时间、MPP 占比和观察日期。

### 证据与评分

1. 在比较比率之前，冻结证据并核对提供商群组/窗口。
2. 对全部 20 项 `S1..D5` 标准进行评分。每个观察到的状态都必须包含来源/日期/类型/置信度。
3. 不使用打开率/CTOR 时，`E2` 为 N/A，并说明原因。`N3/N5` 是否适用取决于项目设计。缺失记录或导出数据属于 Unknown，而不是 N/A。
4. 验证否决项：
   - `SEND-S1`：所需的身份验证已被明确证实存在故障/未对齐。
   - `SEND-S2`：已确认使用购买的/抓取的/非法的列表；缺少来源信息属于 Unknown。
   - `SEND-N1`：退订功能故障/缺失，或已记录的抑制未得到执行。
   - `SEND-D1`：重要声明/披露/优惠条款不符合已批准的证据。
5. 运行类型化评分器。在可用的情况下，将点击/回复/下游行动用作主要互动证据；打开率/CTOR 仍是需要附带限定说明的代理证据。

对于仅评审发送环节且缺乏足够项目证据的情况，应报告已验证的红线检查项和确切缺口，但返回 `NOT_SCORED/UNDECIDED`；“在所提供的证据中未发现阻断项”并不等同于完整的 SEND SHIP 结论。

## §2 SEND 示例

- 完整的新闻简报画像，原始分数 81，无否决项/失败项：`DONE/SHIP`，最终分数 81。
- 完整的推广型画像，原始分数 76，存在一项已验证的 S1 失败：`DONE_WITH_CONCERNS/FIX`，最终分数 59。
- 完整画像，存在已验证的 S2 和 N1 失败：`DONE/BLOCK`，无最终分数。
- 缺少同意来源：S2 为 Unknown，`NEEDS_INPUT/UNDECIDED`，无分数。

## §3 SEND 防护规则

- 在 SPF/DKIM 对齐且主动监控已启用的情况下，DMARC `p=none` 不会自动构成 S1 失败。
- 必须分别说明服务提供商的一键退订政策和法定义务。
- 打开率和 CTOR 需要进行 MPP 分群分析/注明代理指标注意事项；它们无法单独证明真人关注。
- 新闻简报不一定需要购物车/购买后流程；仅对适用于其已声明项目的旅程进行评分。
- 发送频率过高是严重的 E4/E5 发现项，但不会自动触发否决。

## §5 SEND 转述

使用通俗语言解释渠道和收件人风险。收到追溯请求时，标注 `SEND-S1/S2/N1/D1`，并展示底层 DNS/事件/渲染证据。

## 报告与结论

以审计员运行手册中完全一致的类型化对话标头开头。绝不能用自然语言替换 `status`、`verdict` 或 `score_state`；在发现项之前，将每个明确缺失的限定项列为 ``ID: `unknown```。

展示结论、画像/上下文、分数或覆盖率/区间、置信度、S/E/N/D 明细、结果真值集、已验证的关键控制项、Unknown 输入以及修复负责人。不得仅根据 DNS 就声称可送达性/收件箱投递情况，也不得执行发送。

## 验证检查点

- 已声明项目/画像/服务提供商/时间窗口/名单年龄/市场/MPP 占比。
- 已通过回放验证实时抑制状态，而不是使用过时的推算结果或待处理的提案。
- 所有 20 个状态均有效；条件性 N/A 附有原因。
- 服务提供商指标与经过核对的结果真值相互分离。
- 未经单独明确批准，不得对电子邮件/服务提供商进行任何变更。

## 持久化

仅在获得明确授权后持久化到 `memory/audits/email/YYYY-MM-DD-<topic>.md`。保留评分器中相互独立的 `status` 和 `verdict`；依据预期的 `--relative-path`，使用 `validate-audit-artifact.py` 验证完整的 v3 草稿，仅通过一次包含完整内容的 Write 进行持久化，并按照审计员运行手册重新验证目标。保留接收位置不支持通过 Edit/shell/MCP 进行变更。不得自主修改同意状态、声明、服务提供商设置或热缓存。

## 参考资料

- [SEND 基准](../../../references/send-benchmark.md)
- [衡量协议](../../../references/measurement-protocol.md)
- [审计员运行手册](../../../references/auditor-runbook.md)
- [评分语义](../../../references/scoring-semantics.md)

## 后续最佳 Skill

- **身份验证/投递位置：**[deliverability-qa](../../setup/deliverability-qa/SKILL.md)
- **同意/抑制：**[consent-registry](../../../protocol/consent-registry/SKILL.md)
- **生命周期：**[email-sequence-designer](../../nurture/email-sequence-designer/SKILL.md)
- **实验：**[send-experiment-designer](../send-experiment-designer/SKILL.md)