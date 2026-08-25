---
name: foundation-stakeholder-briefings
description: "Turns any source artifact (spec, discovery, research, GTM plan, experiment results, retro, or raw notes) into one canonical master document plus a set of audience-tailored briefings, each re-pitched to a stakeholder lens (executive, board, engineering, UX, PMM, sales, CS, legal, data, or a custom audience). Every briefing is a traceable projection of the master, so the versions never disagree. Use when one piece of work must reach several audiences who each need a different framing, decision, and level of detail."
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.0.1"
  updated: 2026-07-04
  category: communication
  frameworks: [stakeholder-comms]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 利益相关者简报

利益相关者简报产物以一个来源（一份 PRD、发现综合报告、研究报告、GTM 或发布计划、实验结果、复盘或事故总结，或原始笔记）为输入，并生成一个可保存的单一文件，其中包含：

1. 一个 **主文档**：对工作内容的规范性、受众中立的综合说明（内容与原因、决策、状态、风险与待解决问题、请求、时间线），其中每项主张都带有编号（`M1`、`M2`，……）；以及
2. 一组 **受众简报**：针对每位选定利益相关者，对相同内容重新组织表述；每位受众对应一个独立、可直接复制粘贴的内容块。

该技能按 **先主文档、后投射** 的方式运行。主文档是唯一事实来源；每份简报都是它的一种投射。简报可以省略、重新排序和翻译主文档中的内容，但绝不能提出主文档中不存在的主张。正是这一投射规则，避免了面向高管的版本和面向工程团队的版本在不知不觉中产生分歧；这也是该技能与要求模型将同一内容“改写成六种版本”之间的区别。

这不同于 `foundation-stakeholder-update`（针对单一受众、与会议绑定的一次异步会议结果更新）、`discover-stakeholder-summary`（关于利益相关者及其影响力/关注度的图谱），以及 `foundation-persona`（用于设计或营销时参考的客户/买方视角）。

## 适用场景

- 一项工作需要传达给多个受众，而每个受众都需要不同的表达框架、决策信息和详细程度（例如一份规范需要同时发送给工程、设计、数据团队和出资方）。
- 你正准备手动将同一份更新改写成三到五个版本，每个受众一个版本。
- 某项决策或结果需要跨职能传播，同时避免不同版本逐渐产生偏差。
- 单一受众需要从非会议来源获得定制化简报（支持 N=1；多路分发是其典型用途，而不是最低要求）。

## 不适用场景

- 针对利益相关者的 **会议** 结果进行一次异步更新。使用 `foundation-stakeholder-update`（它与会议绑定；这就是它的适用范围）。
- 了解或梳理利益相关者（影响力、关注度、沟通计划）。使用 `discover-stakeholder-summary`。
- 用于设计或营销参考的用户画像。使用 `foundation-persona`。
- 目前还没有来源内容。该技能用于投射已有产物；它不负责开展底层分析。

## Instructions

当被要求创建利益相关者简报时，请遵循以下步骤：

1. **摄取并分类来源。** 阅读所提供的产物。对其类型进行分类（规范/PRD、发现/研究、GTM/发布、战略/路线图、实验/指标、事故/复盘、合规/隐私/安全，或原始/含义不明确）。如果来源内容单薄，继续处理，但将 `input_quality: low` 设为低质量，并指出缺失之处。

2. **构建主文档。** 编写一份受众中立的规范性文档，包含以下章节：内容与原因、决策、状态、风险与待解决问题、请求、时间线。**为每项承载核心信息的主张编号**，并使用稳定 ID（`M1`、`M2`，……）。主文档不得带有任何特定受众的倾向性表述；它是共享基础。

3. **提出受众建议。** 根据源类型，使用 `references/source-type-map.md` 提出相关受众子集（例如，规范建议 Engineering、UX/Design、Data/BI、Executive；GTM 计划建议 PMM、Sales、CS/Support、Executive）。展示该建议，并接受 `go`（生成建议的集合）、编辑指令（`drop X, add Y`），或 `all`（全部九类受众）。如果使用 `--go` 调用，则跳过提示并生成建议。任何受众都不会被排除在外。

4. **分别生成每份简报。** 对于每个选定的视角（参见 `references/audience-lenses.md`），生成一个由 `--- BEGIN: <lens> ---` / `--- END ---` 分隔的自包含区块，其中包含：
   - `Draws on:`：该简报所投射的主张 ID（必需）。
   - `Primary ask:`：针对该受众的恰好一个决策或行动（必需）。
   - 一行标题、“这对你意味着什么”的引导，以及按照该视角的篇幅、词汇和语气撰写的正文。
   每一行承载关键信息的内容都必须能够追溯到一个主张。不得引入主文档中不存在的主张。

5. **标记转译内容。** 保留一份 translations-applied 日志（内部使用，位于可分享边界以下），记录每一处技术内容到业务内容的转译或推断出的重新表述，以便用户核验其表达是否准确。此部分绝不属于可分享的简报。

6. **定稿前自检不变量：**
   - **追溯引用可解析**（确定性、可检查）：每个简报中的 `Draws on:` ID 都能解析到一个真实的主张。
   - **单一 CTA**（确定性、可检查）：每个区块中恰好有一个 `Primary ask:`。
   - **不存在未追溯的主张**（审阅）：根据每个区块的 `Draws on:` 集合重新阅读该区块，确认正文没有引入任何不在这些主张中的内容。这是审阅步骤，而非自动化步骤。
   - **中立主文档**（审阅）：主文档不得带有面向特定受众的倾向性表述。列出任何不符合之处。

7. **渲染产物。** 主文档（包含主张 ID） -> 由分隔符界定的简报区块 -> 边界标记 -> translations-applied 日志 -> Sources and References。移除最终输出中的所有指导性引用块。

## 受众视角

九种一级视角，每种视角都由其负责的决策定义；此外还有一个 Custom 插槽，其视角会根据受众名称和源文档推断，并要求确认。完整定义、每种视角的“在何种情况下不应使用此视角”边界，以及重叠矩阵（Exec 与 Board、PMM 与 Sales、Engineering 与 Data、Legal 与 Exec）位于 `references/audience-lenses.md` 中。

## 输出格式

- 单个产物（文件名为 `YYYY-MM-DD_HH-MMtz_<title>_stakeholder-briefings.md`），根据 `references/TEMPLATE.md` 构建。
- 每个简报区块都是自包含且可直接发送的（包含 BEGIN/END 截止线），因此无需编辑即可单独复制。
- 未来的 `--split` 模式（将每个区块写入单独文件）暂缓；v1 为单个产物。

## 质量检查清单

- [ ] 主文档存在，并包含编号的主张 ID（`M1`、`M2`、……），且不带有面向特定受众的倾向性表述。
- [ ] 每个简报区块都有一行 `Draws on:`，其中的所有 ID 都能解析到主文档中的主张。
- [ ] 每个简报区块恰好有一个 `Primary ask:`。
- [ ] 没有任何简报陈述主文档中不存在的主张（投射规则）。
- [ ] 受众集合符合源类型建议或用户的编辑要求；即使 N=1 也必须遵守，不得拒绝。
- [ ] 在发生任何转译时，存在 translations-applied 日志（内部使用）；边界标记将可分享区块与内部部分分隔开。
- [ ] 每份简报都符合其视角的篇幅和语气（董事会区块的内容读起来不能像工程区块）。
- [ ] 已从最终产物中移除指导性引用块。

## 另请参阅

- [`references/TEMPLATE.md`](references/TEMPLATE.md) - 主模板 + 简报块脚手架。
- [`references/audience-lenses.md`](references/audience-lenses.md) - 九种视角、边界和重叠矩阵。
- [`references/source-type-map.md`](references/source-type-map.md) - 来源类型到受众的提案。
- [`foundation-stakeholder-update`](../foundation-stakeholder-update/SKILL.md) - 面向一个受众的一次会议更新（不同）。
- [`discover-stakeholder-summary`](../discover-stakeholder-summary/SKILL.md) - 映射利益相关者（不同）。