---
name: foundation-lean-canvas
description: Produces a one-page lean canvas across nine interlocking blocks (problem, customer, UVP, solution, channels, revenue, cost, metrics, unfair advantage) with optional inline HTML and SVG visual rendering. Use when framing a new product thesis, stress-testing an existing strategy, comparing strategic options side-by-side, or aligning a team on business-model assumptions. Works as a strategic hub that cross-links to deeper PM skills without duplicating them.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.1.0"
  updated: 2026-07-05
  category: problem-framing
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 精益画布

精益画布是一份单页业务论点，它将你对问题、客户、解决方案和可行性的假设明确化并使其可验证。它由 Ash Maurya 基于 Alex Osterwalder 的商业模式画布开发，专门针对在不确定性下运作的初创企业和产品团队进行了调整。九个相互关联的模块迫使你一次性阐明整体图景，从而使一个模块假设的变化显现出对其他模块的连锁影响。

这项技能是一个战略中枢，而非专业工具。它生成整合后的单页产物，并在需要深入分析单个模块时，链接到更深入的 PM 技能（`define-problem-statement`、`foundation-persona`、`define-jtbd-canvas`、`develop-solution-brief`、`discover-competitive-analysis`、`measure-experiment-design`）。

## 支持的模式

- `content`（默认）将九模块画布生成为结构化 markdown。
- `visual` 生成 markdown 画布，并使用 `references/html-template.html` 作为布局脚手架，将一个自包含且美观的 `.html` 文件写入磁盘。HTML 采用经过精致排版的 Maurya 经典九模块布局，为每列添加细微的颜色强调，为每个模块添加置信度徽章，并采用适合打印的 A3 横向样式。不依赖外部资源或 CDN：即使没有网络连接，文件也能在浏览器中正确打开。

如果省略模式，则默认使用 `content`，并明确说明这一回退行为。

## 使用时机

- 在一页中构建新产品、功能或业务论点
- 通过明确隐含假设，对现有业务进行压力测试
- 并排比较两个或更多战略选项（每个选项运行一次该技能，然后进行差异对比）
- 通过单一产物帮助新团队成员了解战略论点
- 阶段中期进行现实检验：鉴于我们已经学到的内容，该论点是否仍然成立？
- 与 `measure-experiment-design` 搭配使用，确定应首先测试哪些模块假设

## 不应使用的时机

- 你需要对单个模块进行深入研究（用户画像详情、问题界定、竞争格局）。请改用专业技能（`foundation-persona`、`define-problem-statement`、`discover-competitive-analysis`）。
- 你正在起草 PRD、用户故事或验收标准。请使用 `deliver-prd`、`deliver-user-stories`、`deliver-acceptance-criteria`；精益画布关注的是战略，而不是规格说明。
- 你希望在没有客户问题锚点的情况下头脑风暴解决方案。请从 `define-problem-statement` 或 `define-jtbd-canvas` 开始，待问题界定清楚后再回到精益画布。
- 你需要为客户和渠道都已明确的成熟企业制作商业模式画布。Maurya 专门为高不确定性的早期企业设计了精益画布；对于稳态分析，BMC 更为合适。
- 你想孤立地测试某一个具体假设，而不是对整个业务模型进行压力测试。请使用 `define-hypothesis`，然后使用 `measure-experiment-design`；精益画布用于构建完整论点，而假设则用于测试其中的一项主张。

## Instructions

当被要求创建精益画布时，请遵循以下步骤：

1. **确定模式和意图**
   判断请求属于 `content` 还是 `visual`。如果未指定模式，则默认为 `content`，并说明这一回退选择。
   明确目标：新的产品论点、对现有业务的压力测试，还是对多个选项进行并排比较。如果不明确，请在继续之前询问一次。

2. **收集背景和证据**
   优先使用用户提供的背景信息：产品名称、市场、目标客户、已经完成的任何研究、用户目前正在采用的现有替代方案，以及已知约束。
   如果证据不足，继续生成，但要在 Evidence & Confidence 部分标记缺口，并相应调整各区块的置信度。
   对于现有业务，要明确区分当前假设与已验证数据。

3. **按推荐顺序填写九个区块**
   按以下顺序填写，因为每个区块的答案都会约束下一个区块。不要跳过顺序。

   a. **Problem** - 按痛苦程度和发生频率排序的三大问题。包括 Existing Alternatives（客户目前采取的做法，包括变通方案和不消费，而不仅仅是直接竞争对手）。
   b. **Customer Segments** - 谁最强烈地面临这些问题？将 Early Adopters 作为一个独立子集明确列出，并优先触达。与更广泛的细分市场相比，Early Adopters 面临的问题更严重、更容易触达，也更愿意尝试新解决方案。
   c. **Unique Value Proposition (UVP)** - 用一句话提出清晰、可测试的承诺。包括一个 High-Level Concept（“X for Y”类比），帮助忙碌的读者更快理解。
   d. **Solution** - 解决三大问题的三项主要功能。与 Problem 区块进行一一对应。保持具体但不要过度设计；这是一个假设，而不是规格说明。
   e. **Channels** - 面向 Early Adopters 的免费和付费路径。区分可复利的渠道（内容、SEO、社区）与能够证明增长势头的渠道（外呼、付费广告）。
   f. **Revenue Streams** - 商业模式（订阅、交易、免费增值、服务）、价格点、预期规模和 LTV。展示计算过程，使收入论点可供检查。
   g. **Cost Structure** - CAC、固定成本与可变成本，以及决定增长曲线形态的成本驱动因素。
   h. **Key Metrics** - 用于判断模型是否有效的 3 至 5 个领先指标。AARRR（Acquisition、Activation、Retention、Revenue、Referral）是一个实用的默认框架。
   i. **Unfair Advantage** - 无法轻易复制或购买的优势。如果明确将其作为一个开放问题，留空也是可以接受的；绝不要捏造护城河。

4. **应用证据和置信度政策**
   为每个区块标注 `High`、`Medium` 或 `Low` 置信度，并附上一行理由。
   填写 Evidence & Confidence 部分：`Validated`（带有明确来源的假设）、`Assumed`（尚无数据）、`Open Questions`（需要了解哪些信息才能提高置信度）、`Governance`（由谁负责画布，以及何时重新审视）。
   标记为“High”的区块必须写明具体证据来源，不能使用笼统的说法。

5. **渲染并写入可视化文件（仅可视化模式）**
   读取 `references/html-template.html`。这是一个完整、自包含的 HTML5 文档，使用 CSS Grid 表示标准的 Maurya 九宫格布局，并包含按列设置的颜色强调、置信度徽章以及 A3 横向打印样式。
   使用 markdown 画布中的内容填充模板中的每个 `{{PLACEHOLDER}}` 标记：
   - 使用画布标题中的内容填充 `{{PRODUCT_NAME}}`、`{{CREATED_DATE}}`、`{{PURPOSE}}`、`{{OVERALL_CONFIDENCE}}`。
   - 使用相应区块中的内容填充 `{{PROBLEM_CONTENT}}`、`{{EXISTING_ALTERNATIVES}}`、`{{SOLUTION_CONTENT}}`、`{{UVP_CONTENT}}`、`{{HIGH_LEVEL_CONCEPT}}`、`{{ADVANTAGE_CONTENT}}`、`{{CUSTOMER_CONTENT}}`、`{{EARLY_ADOPTERS}}`、`{{METRICS_CONTENT}}`、`{{CHANNELS_CONTENT}}`、`{{COST_CONTENT}}`、`{{REVENUE_CONTENT}}`。对于包含多个项目的区块，使用 `<ul><li>` 列表；保持单元格内容简洁（使用单行摘要，而不是完整的 markdown 细节），以便可视化内容易于快速浏览。
   - 使用与各区块置信度标签匹配的单个字母 `H`、`M` 或 `L` 填充 `{{CONF_PROBLEM}}`、`{{CONF_SOLUTION}}`、`{{CONF_UVP}}`、`{{CONF_ADVANTAGE}}`、`{{CONF_CUSTOMER}}`、`{{CONF_METRICS}}`、`{{CONF_CHANNELS}}`、`{{CONF_COST}}`、`{{CONF_REVENUE}}`。每个标记在模板中出现两次（一次位于用于样式设置的 class 属性中，一次作为可见文本）。
   - 在页脚证据条中填充 `{{VALIDATED_COUNT}}`、`{{ASSUMED_COUNT}}`、`{{OPEN_QUESTIONS_COUNT}}`、`{{OWNER}}`、`{{NEXT_REVIEW}}`。
   将填充完成的文档写入用户指定的路径；如果用户未指定，则写入当前工作目录中的 `./lean-canvas-{slug}.html`，其中 `{slug}` 是产品名称转换为小写，并将非字母数字字符替换为连字符后的结果。
   不要引入外部字体或 CSS 链接；该模板特意设计为自包含。
   在内容模式下，完全跳过此步骤。

6. **完成直接使用前的处理**
   从最终产物中删除所有模板指导性引用块（`>` 注释）。
   验证 UVP 能够改变决策且可测试，而不是营销空话。
   确认 Early Adopters 是一个明确的子集，而不是对 Customer Segments 的重复表述。
   确认 Solution 区块中的项目与 Problem 区块中的项目逐一对应。

## 输出契约（v1.0.0）

- 按标准顺序完整包含九个区块（问题、客户细分、UVP、解决方案、渠道、收入来源、成本结构、关键指标、不公平优势）
- 每个区块都包含内容、置信度标签（`High|Medium|Low`）以及一行说明理由
- 必须包含 Evidence & Confidence 部分，并填充 `Validated`、`Assumed`、`Open Questions` 和 `Governance` 子部分（即使某个子部分有意留空，也要标记为 "None"，而不是删除该子部分）
- 内容模式：markdown 画布是唯一输出。
- 可视化模式：除 markdown 画布外，还要将自包含的 HTML 文件写入 `./lean-canvas-{slug}.html`（或用户指定的路径）。HTML 基于 `references/html-template.html` 生成，所有占位符均已填充且不包含外部依赖。写入后，向用户报告文件路径。
- Foundation 分类：frontmatter 中不得包含 `phase:` 字段；使用 `classification: foundation`

## 质量检查清单

完成前，请验证：

- [ ] 所有九个模块均已存在且顺序正确（问题、客户细分、独特价值主张、解决方案、渠道、收入来源、成本结构、关键指标、不公平优势）
- [ ] “问题”列出了排名前 3 的问题，并且包含“现有替代方案”子部分
- [ ] “客户细分”将早期采用者列为一个独立子集，而不是对客户细分的重复表述
- [ ] “独特价值主张”只有一个句子，并且包含高层次概念类比（“面向 Y 的 X”）
- [ ] “解决方案”与“问题”模块一一对应（针对排名前 3 的问题，列出排名前 3 的功能）
- [ ] “渠道”区分了复利式增长路径和证明市场 traction 的路径
- [ ] “收入来源”展示了计算方式（模式、价格、数量、LTV）
- [ ] “成本结构”列出了 CAC，并确定了成本驱动因素
- [ ] “关键指标”列出了 3 至 5 个先导指标
- [ ] “不公平优势”要么具体明确，要么明确标记为待解决问题
- [ ] 每个模块都有一个置信度标签（`High|Medium|Low`）以及一行说明理由
- [ ] “证据与置信度”部分的四个子部分均已填写
- [ ] 最终产物中已移除模板指导性引用块
- [ ] 可视化模式：生成的 `.html` 文件可在无网络访问的情况下于浏览器中成功打开；所有 `{{PLACEHOLDER}}` 均已被替换；置信度徽章以正确颜色呈现；标准的 Maurya 九模块布局可见；A3 横向打印预览时画布可在一页内完整显示；存在 `role="img"` 和 `aria-label`；已将文件路径反馈给用户
- [ ] 内容模式：不会写入 `.html` 文件，Markdown 中也不会出现可视化部分

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了一个内容模式下已完成的精益画布示例，场景为真实的 B2B SaaS。可视化模式的 HTML 模板脚手架位于 `references/html-template.html`。