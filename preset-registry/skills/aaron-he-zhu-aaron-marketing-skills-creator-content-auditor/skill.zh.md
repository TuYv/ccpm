---
name: creator-content-auditor
slug: creator-content-auditor
displayName: "Creator Content Auditor · 创作者内容审计"
summary: "STAR 门：适配/信任/吸引力/回报四维的门控判定，判 FTC 披露与声明真实否决，输出 SQS 与创作者修改反馈"
description: 'Use when the user asks to "review this influencer content" or "check if this post meets brand guidelines"; runs the typed STAR pre-publish gate, scores Trust and Appeal on the deliverable, folds in the creator Suitability read, computes the profile-weighted SQS, checks the disclosure/claim/brand-safety and fraud/fake-engagement vetoes, and writes constructive revision feedback. Not for drafting the brief — use brief-generator; not for partnership terms — use contract-helper. 达人内容审核/发布前质检'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Activate when an influencer content submission needs a pre-publish gate against the brief, approved claims, disclosure obligations, platform requirements, and the STAR criteria — and a go/no-go SQS."
argument-hint: "<content submission or link> <platform> <campaign goal>"
class: auditor
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 创作者内容审核员

使用 **STAR** 框架审核一项创作者交付物（或一组定义明确的资产），并返回按画像加权的 **SQS**（Star Quality Score，明星质量评分）以及可直接提供给创作者的反馈。这是 STAR 体系唯一的评分权威：它直接读取内容以评估**信任度（T）**和**吸引力（A）**，纳入从 `fit-scorer` 读取的**适配度（S）**，根据 `assessment_time` 对**回报（R）**进行评分（发布前使用预测值），并执行所有 STAR 否决条件。

## 必须触发的场景

- 创作者提交的内容需要在发布、扩大传播或付款里程碑前获得批准。
- 用户询问品牌契合度、声明准确性、披露、创意质量、平台规格或是否通过。
- 修订后的资产需要针对相同的 brief/canon 版本进行可追溯的重新审核。

## 快速开始

```text
Review this sponsored video and caption against campaign brief v4 for conversion.
Run the STAR gate; show claim/disclosure blockers, the SQS, and write the creator revision note.
```

## 技能契约

**读取：** 一份冻结的提交内容及其不透明的资产/证据引用；稳定的 `creator_ref`、`reviewer_ref` 和 `brief_ref`；brief/canon 版本；已批准的声明/披露（来自 `offer-claims-registry` 的佐证状态）；平台要求；`fit-scorer` 的适配度读取结果；以及 `creator-registry` 档案（支撑 `STAR-S2`/`S6` 的受众真实性事实）；并且（对于 `actual` 重读）读取 `roi-calculator` 的回报证据。创作者/审核员的原始姓名、账号、画像/内容 URL、brief URL、电子邮件地址及其他交付定位信息，只能为当前审核或经过独立授权的发送而临时解析。**写入：** 默认以内联方式提供用户报告；只有在获得针对已验证目标的明确授权后，才写入 v3 工件。在每个可持久化的模板/工件/交接内容中，创作者、审核员和 brief 的身份只能由 `creator_ref`、`reviewer_ref` 和 `brief_ref` 表示；绝不得持久化对应的原始身份或定位信息。面向创作者的文案属于临时渲染内容，绝不成为持久化审核工件的一部分。工件批准不授权执行 HOT、注册表、内容、反馈发送或任何其他外部变更。**完成条件：** 每一项适用的 STAR 条目都已明确，保留带类型的 SQS 结果，反馈将每项请求的修改映射到证据，并且任何持久化输出都符合仅使用引用表示身份的边界。

只有此审核关卡会计算按画像加权的 SQS；其他每项创作者技能各自负责一个杠杆并进行交接：`fit-scorer` 提供适配度，`roi-calculator` 提供已测量的回报，`contract-helper` 负责条款。本关卡不裁决声明或权利问题。

## 数据来源

| 需求 | 首选证据 |
|---|---|
| 提交内容 | 正在审核的准确文件/渲染结果/说明文字/版本 |
| 意图 | 已批准的活动 brief 以及受众/目标 |
| 适配度 | `fit-scorer` 针对该创作者的适配度（S）读取结果 |
| 声明 | 当前声明投影及引用的佐证 |
| 披露 | 实质性关联事实、市场规则、平台标签/文案 |
| 技术 | 带日期的官方平台规格 |
| 回报 | 活动计划（预测）或已测量的 `roi-calculator` 结果（实际） |
| 权利 | 资产使用属于范围内时的合同/使用权记录 |

我先把运行约束和参考文件读齐，确认这是哪种审计流程，再看工作区里有没有待评估的提交。我在并行读取参考文档，同时找可用的目录线索，避免先假设目标对象。{"tool":"multi_tool_use.parallel","calls":[{"tool":"shell","args":["-lc","pwd && printf '\\n---\\n' && rg --files -g 'auditor-runbook.md' -g 'scoring-semantics.md' -g 'star-benchmark.md' -g 'runtime-invocation.md' -g 'auditor-runtime.md' -g 'quality-review-aids.md' -g 'STAR*' -g '*catalog*' ."]},{"tool":"shell","args":["-lc","sed -n '1,220p' ../../../references/auditor-runbook.md"]},{"tool":"shell","args":["-lc","sed -n '1,240p' ../../../references/scoring-semantics.md"]},{"tool":"shell","args":["-lc","sed -n '1,240p' ../../../references/star-benchmark.md"]},{"tool":"shell","args":["-lc","sed -n '1,220p' ../../../references/runtime-invocation.md"]},{"tool":"shell","args":["-lc","sed -n '1,260p' references/auditor-runtime.md"]}]}我已经拿到基础参考，接下来确认目录里是否存在具体的 STAR 目标或输入文件。{"tool":"multi_tool_use.parallel","calls":[{"tool":"shell","args":["-lc","sed -n '1,220p' ../../../references/auditor-runbook.md"],"timeout":120000},{"tool":"shell","args":["-lc","sed -n '1,260p' ../../../references/scoring-semantics.md"],"timeout":120000},{"tool":"shell","args":["-lc","sed -n '1,260p' ../../../references/star-benchmark.md"],"timeout":120000},{"tool":"shell","args":["-lc","sed -n '1,220p' ../../../references/runtime-invocation.md"],"timeout":120000},{"tool":"shell","args":["-lc","sed -n '1,260p' references/auditor-runtime.md"],"timeout":120000},{"tool":"shell","args":["-lc","rg --files . | rg '(catalog|STAR|audit|submission|brief|campaign|run\\.json|typed)'"],"timeout":120000}]}我需要把环境里是否有目标文件弄清楚；如果没有输入实体，就不能生成有意义的审计结果。{"tool":"shell","args":["-lc","pwd && rg --files . | head -n 200"],"timeout":120000}我还缺少要审计的具体对象。请提供目标/版本、平台、市场、目标（`awareness|engagement|conversion|brand-building`）、`assessment_time`，以及要评分的提交内容或 `run.json`。有了这些，我才能按该 STAR 流程输出结果。

### 创作者反馈

开始审核结果时，使用 auditor-runbook 的精确原样对话标题。不要把 `status`、`verdict` 或 `score_state` 替换为面向创作者的翻译；在反馈前，将每个明确缺失的合格项单独列为 ``ID: `unknown```。

对于每项变更，说明精确的位置/时间码、观察到的问题、所需修正、可接受示例、负责人，以及重新提交条件。语气要直接且建设性。不要把推荐语语言改写成创作者未作出的主张，也不要隐瞒赞助关系。

仅保留带有 `creator_ref`、`reviewer_ref`、`brief_ref` 和不透明 asset/evidence refs 的证据约束变更摘要。问候语、创作者/审核者显示名、回复路径，以及完整的面向创作者消息，只能临时渲染。请求审核、保存、批准或生成反馈，并不等于允许发送它。任何 email/DM 交付都必须把最终的临时渲染交给 [outreach-manager](../outreach-manager/SKILL.md)，并通过其精确的单次发送门控：`recipient_ref`、channel、最终消息，以及（如有排期）一个具体的 ISO-8601 `dispatch_at` 加时区，必须分别获批，然后紧接着在调用提供方之前运行实时抑制和资格检查。对收件人、channel、消息或排期的任何更改都会使该批准失效。

## §2 STAR 已完成示例

- 完整转换档案、原始 SQS 84、无 veto/fail：`DONE/SHIP`，最终 84，创作者决定 **APPROVED**。
- 完整档案、原始 82、一个已验证披露 veto（`STAR-T1`）：`DONE_WITH_CONCERNS/FIX`，最终 59，**REVISIONS REQUIRED** 后才能发布。
- 完整档案，已验证的 `STAR-T1` 和 `STAR-T2` 失败：`DONE/BLOCK`，无最终分数，**REJECT/HOLD** 该版本。
- 缺少已批准主张证据来支持事实性断言：`NEEDS_INPUT/UNDECIDED`，无分数；不要猜测 `STAR-T2`。

## §3 STAR 约束

- 付费片段可以明显呈现赞助感，同时在创意上仍然出色；“自然”不应意味着隐藏广告。
- 披露（`STAR-T1`）仅在存在实质性关联且按市场/平台语境判断时适用。
- 技术规格需要渲染/文件证据；仅凭 caption 不能证明安全区、音频权利或时长。
- 已测量的 campaign conversion 属于 **Return**（`R4`–`R6`）在 `actual` 读取下的内容，而不是 **Appeal**；不要在发布前给它打分。
- 适配性 veto（`STAR-S2`/`STAR-S6`）依据 `fit-scorer` 审核证据；被拒绝的审核是 Unknown，绝不是通过。

## §5 STAR 翻译

仅将创作者面向的决定作为翻译使用：SHIP → Approved，FIX → Revisions Required，BLOCK → Reject/Hold，UNDECIDED → Needs Evidence。按请求显示合格的 `STAR-T1`/`STAR-T2`/`STAR-S2` ID 和来源——始终使用框架限定，因为 `T`/`S`/`A`/`R` 与其他基准会冲突。

## 验证检查点

- 精确的 asset/brief/canon/claims 版本和市场已锁定。
- 所有适用的 STAR 项目都有有效状态；Unknown 不会被转换为 Partial；预测 Return 项为 `na` 并附理由。
- 披露、主张、品牌安全和真实性失败都已验证、限定，并在可能时可修复。
- 已打字的 scorer 输出驱动 status/verdict/cap 和 SQS；修订映射到 `status: DONE_WITH_CONCERNS` 加上 `verdict: FIX`。
- 反馈必须基于位置，且不产生未经批准的主张。

## 持久化

在写入前先征求批准。在验证前，将每个 creator/reviewer/brief 名称、handle、email、profile/content URL、原始 brief URL、recipient locator，以及面向 creator 的消息，替换为 `creator_ref`、`reviewer_ref`、`brief_ref`，或所需的非公开 asset/evidence reference。获得批准后，使用 `validate-audit-artifact.py` 针对预定的 `memory/audits/influencer/YYYY-MM-DD-<topic>.md` 相对路径验证完整的 v3 草稿，仅通过一次完整内容 Write 进行持久化，并按照 auditor runbook 重新验证目标。对 reserved sink 的编辑/shell/MCP 变更不受支持。Audit 持久化不授权反馈投递。不要自主修改 claims、contracts、registry records、candidates 或 hot cache。

## 参考材料

- [STAR benchmark](../../../references/star-benchmark.md)
- [Auditor runbook](../../../references/auditor-runbook.md)
- [Scoring semantics](../../../references/scoring-semantics.md)
- [Humanizer controls](../../../references/humanizer-slop.md)
- [Review templates](references/review-templates.md) — 仅供参考的持久 review 字段，以及临时 creator-feedback render 和 send 边界。
- [Quality review aids](references/quality-review-aids.md) — 仅限 Appeal 的 slop evidence、完整 veto 覆盖，以及 typed-scorer result 边界。

## 下一个最佳技能

- **Brief mismatch:** [brief-generator](../../target/brief-generator/SKILL.md)
- **Claim fix:** [offer-claims-registry](../../../protocol/offer-claims-registry/SKILL.md)
- **Rights/terms:** [contract-helper](../contract-helper/SKILL.md)
- **Approved asset amplification:** [content-amplifier](../content-amplifier/SKILL.md)