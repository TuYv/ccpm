---
name: foundation-persona
description: Generates an evidence-calibrated product or marketing persona using the canonical v2.5 output contract. Use when shaping artifact perspective, stress-testing decisions, or framing product and GTM strategy.
license: Apache-2.0
metadata:
  classification: foundation
  version: "2.6.1"
  updated: 2026-06-10
  category: research
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# Persona Builder

此技能根据一套规范模板包生成可用于决策的用户画像。

## 支持的模式

- `product`
- `marketing`
- `buyer` 作为 `marketing` 的输入别名（输出仍标记为 `Marketing`）

生成 `agent` 模式不在 `v2.5.0` 的范围内。  
如果用户请求 `agent`，请让其选择 `product` 或 `marketing`。

## 使用时机

- 在起草需要清晰用户画像视角的 PM 或 GTM 产物之前
- 当团队在优先级上存在分歧，需要以行为为依据来框定权衡时
- 当决策评审需要明确假设和置信度时
- 当需要针对特定用户或买方画像定制后续工作（PRD、stories、launch、messaging、enablement）时

## 不使用时机

- 你需要的是工作情境，而不是人物本身 -> 使用 `define-jtbd-canvas`；该画布记录客户雇用产品来完成什么，而用户画像记录他们是谁
- 你正在梳理内部利益相关者，而不是客户 -> 使用 `discover-stakeholder-summary`
- 你需要先综合原始访谈 -> 使用 `discover-interview-synthesis`；基于未经综合的笔记构建的用户画像会继承其中的噪声
- 完全没有任何证据，且真实决策取决于该用户画像：先开展研究；此技能会如实标注假设，但无法替代证据

## 指令

当被要求生成用户画像时，请遵循以下步骤：

1. **确定模式和意图**
   确定请求属于 `product` 还是 `marketing`（允许使用 `buyer` 别名）。
   如果未指定模式，请要求选择模式。
   如果必须在没有回复的情况下继续执行，则默认使用 `product`，并明确说明这一回退选择。

2. **收集上下文和证据**
   优先使用用户提供的上下文（目标、受众、领域、约束、来源）。
   如果证据不足，继续生成，但要标注缺口并校准置信度。

3. **准确选择一个模板**
   使用 `references/TEMPLATE.md`，并从以下选项中准确选择一个：
   - `Product Persona Template`
   - `Marketing Persona Template`

4. **生成完整产物**
   从头到尾填写所选模板：
   - 标题 + 一句话核心现实陈述
   - 元数据表格
   - `Persona Card`
   - `1` 至 `11` 部分
   - `Evidence & Confidence`

5. **遵守模式边界**
   - Product 模式：聚焦工作流行为、决策模式、摩擦、质量标准和产品权衡。
   - Marketing 模式：聚焦购买触发因素、评估标准、委员会动态、异议、消息传递和 GTM 影响。

6. **应用证据和置信度政策**
   - 使用 `High|Medium|Low` 置信度，并说明理由。
   - 区分经过验证的证据和假设。
   - 陈述开放问题和治理跟进事项。

7. **完成最终定稿以便直接使用**
   从最终输出中移除模板指导性引用块（`>` 注释）。
   确保叙述性条目具体且能够改变决策，而不是占位符式的项目符号。

## 输出契约（v2.5.0）

- 每次输出只能使用一种模式（`Product` 或 `Marketing`）。
- 保留所选模板的章节编号和标题。
- 保留证据表，以及已验证/假设/待解决问题/治理区块。

## 质量检查清单

最终确定前，请验证：

- [ ] 只使用一种模式，并明确标注
- [ ] 将 `buyer` 输入规范化为 `Marketing`
- [ ] 标题、核心现实陈述、元数据表和 `Persona Card` 均已提供
- [ ] 所选模板中的全部 `1` 至 `11` 章节均已提供且完整
- [ ] 元数据和叙述中均明确说明包含范围/不适用边界
- [ ] 证据表已填入具体来源
- [ ] 置信度为 `High`、`Medium` 或 `Low`，并附有理由
- [ ] 已提供 `Validated`、`Assumed`、`Open questions` 和 `Governance` 区块
- [ ] 已移除模板编写说明（`>` 指导行）

## 示例

请参阅 `references/EXAMPLE.md`，其中包含一份完整的示例输出。