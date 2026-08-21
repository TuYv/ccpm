---
name: moai-domain-copywriting
description: >
  Brand-aligned copywriting specialist for marketing and product text.
  Enforces brand voice, anti-AI-slop rules, concrete numbers, and JSON section
  structure for downstream agent consumption. Covers hero, features,
  social_proof, cta, and footer sections with A/B variant output.
license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-04-20"
  tags: "copywriting, brand, marketing, voice, cta, headline, anti-slop"
  related-skills: "moai-domain-brand-design, moai-workflow-gan-loop"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000

# MoAI Extension: Triggers
triggers:
  keywords: ["copy", "copywriting", "headline", "cta", "marketing", "microcopy", "tagline", "landing page copy", "value proposition", "brand voice"]
  agents: ["expert-frontend"]
  phases: ["run"]
---
# moai-domain-copywriting

用于营销和产品网站、符合品牌调性的文案写作技能。吸收自 agency-copywriting (v3.2.0)。强制执行反 AI 劣质内容规则，要求提供品牌语调上下文，并按版块输出结构化 JSON。

---

## 快速参考

### 进入条件

生成文案前，确认以下三个条件均已满足：

1. 已加载品牌语调上下文：`.moai/project/brand/brand-voice.md` 存在或已以内联方式提供。
2. 已明确说明目标页面或版块的范围（落地页、关于页面、定价页面等）。
3. 已启用反 AI 劣质内容检查清单（见下文）。

如果 `brand-voice.md` 不存在，请停止并指示用户通过 `/moai design` 或 `manager-spec` 运行品牌访谈。

### 输出格式

所有文案输出均采用结构化 JSON，并包含以下顶层版块：

```
{
  "page_type": "<landing|about|services|pricing|contact>",
  "sections": {
    "hero": { "primary": {...}, "variant_a": {...} },
    "problem": { "primary": {...}, "variant_a": {...} },
    "solution": { "primary": {...}, "variant_a": {...} },
    "features": { "primary": {...}, "variant_a": {...} },
    "cta": { "primary": {...}, "variant_a": {...} },
    "pricing": { "primary": {...}, "variant_a": {...} }
  },
  "metadata": {
    "tone_profile": "<string>",
    "word_count": <number>,
    "reading_level": "<string>"
  }
}
```

每个版块必须至少包含一个 A/B 变体（`variant_a`）。`primary` 字段为推荐的默认版本。

---

## 实施指南

### 版块结构

**hero**：首个可见区块。主体必须是读者能够获得的成果，而不是公司名称。
- `headline`：最多 12 个单词。使用现在时。以成果为先。
- `subheadline`：一个句子。展开说明标题中的实现机制。最多 25 个单词。
- `cta_primary`：动词 + 名词。最多 5 个单词。（“开始免费试用”“了解运作方式”）
- `cta_secondary`：可选。语气更柔和的替代选项。（“了解更多”“观看演示”）

**problem**：在提出解决方案之前，先承认读者的痛点。
- `headline`：描述维持现状的代价。具体而非抽象。
- `body`：2-3 个句子。使用第二人称（“你”“你的团队”）。

**solution**：将你的产品或服务作为解决方案引入。
- `headline`：包含实现机制的直接主张。（“我们将 X 自动化，让你能够 Y。”）
- `body`：3-4 个句子。说明它是什么、如何运作，以及一个具体成果。

**features**：便于快速浏览的功能列表。
- 每项功能：`title`（最多 5 个单词）+ `description`（最多 2 个句子）+ 可选的 `metric`。
- 每个版块最多包含 6 项功能。

**cta**：最终的转化提示。
- `headline`：体现紧迫感或明确性，但不操纵用户。避免使用“限时”之类的陈词滥调。
- `button_text`：规则与 hero 的 `cta_primary` 相同。
- `supporting_text`：信任信号（退款保证、无需信用卡等）。

**pricing**：仅当范围中明确要求时才包含。
- `headline`：用于定调的陈述。（“定价简单，没有意外费用。”）
- 套餐数组：`name`、`price`、`billing_period`、`highlights`（最多 5 个项目符号字符串）。

---

### 反 AI 垃圾内容检查清单

每一段生成的文案都必须在交付前通过此检查清单：

**禁止模式** — 拒绝任何包含以下内容的文案：
- 每个区块中使用超过一次感叹号
- 以“在当今快节奏的世界中”或同类表述开头
- “尖端的”“最先进的”“革命性的”“颠覆性的”
- 将“Leverage”用作动词（替换为“use”“apply”“deploy”）
- 在没有量化证据的情况下使用“无缝的”“零阻力的”“同类最佳的”
- 在主动语态与其语法效果相同时使用被动语态
- 填充性从句：“归根结底”“事实的真相是”
- 没有具体机制的泛泛收益描述（“帮助你取得成功”）
- 在首屏区块中使用第三人称自指（“我们公司相信……”）

**必要模式** — 每个区块都必须包含：
- 至少一个具体数字、百分比或时间参考
- 以读者为中心的表述方式（主语是“你”或读者成果，而不是“我们”）
- 所有能力声明均使用主动语态
- 具体性：将“发展你的业务”替换为可衡量的成果

**语气校准** — 从 `brand-voice.md` 加载：
- 遵循定义的语气范围（例如，“活泼”与“权威”）
- 匹配词汇偏好（如果 `jargon_level: low`，则避免使用术语）
- 完全保留已定义的品牌专用术语

---

### A/B 变体规则

每个区块必须包含一个替代版本（`variant_a`），且在以下方面有所不同：
- 标题的切入角度（问题优先与解决方案优先）
- CTA 动词选择
- 语体风格（略微更正式或更不正式）

除非范围明确要求，否则不得生成超过两个变体。

---

### 品牌语调集成

加载 `.moai/project/brand/brand-voice.md` 并应用：

1. `tone`：整体语体。如果缺失，则默认使用“自信且直接”。
2. `vocabulary_preferences`：首选和避免使用的术语。严格执行。
3. `audience_familiarity`：决定预设的知识水平。相应调整术语使用。
4. `example_phrases`：用作风格锚点。模仿句子节奏，而非内容。

如果 `brand-voice.md` 中存在任何 `_TBD_` 标记，请停止并要求先补充完整，再继续执行。

---

### 与 moai-domain-brand-design 集成

当文案和设计工作均在范围内时（`/moai design` 的路径 B）：

1. 先完成文案区块并输出结构化 JSON。
2. 将 JSON 文案输出传递给 `moai-domain-brand-design`，作为内容契约。
3. 设计令牌和布局必须适应文案长度约束（标题字符数、CTA 按钮文本长度）。

---

## 高级模式

### 阅读水平定位

根据目标受众的阅读水平调整文案复杂度：

- 技术受众（B2B SaaS 开发者）：10-12 年级。允许使用领域术语。
- 商业受众（中小企业主）：8-10 年级。避免使用未展开说明的缩写。
- 消费者受众（普通公众）：6-8 年级。使用短句和具体意象。

使用 Flesch-Kincaid 年级水平量表，将计算出的阅读水平包含在输出元数据的 `reading_level` 字段中。

### 微文案指南

表单标签、错误消息和 UI 字符串须遵循更严格的规则：
- 标签：名词短语，1-3 个词，不使用标点符号
- 占位符：使用示例值，而非操作指示（使用 "jane@company.com"，而非“输入邮箱”）
- 错误消息：说明出了什么问题以及如何修复，不使用指责性语言
- 成功消息：确认操作已完成，并说明下一步

### 社会认同整合

当品牌上下文中有客户评价或案例研究数据时：
- 准确引用，不要改写客户原话
- 包含公司名称、职位和指标（在允许的情况下）
- 放在问题部分之后（再次印证痛点）或功能部分之后（再次印证解决方案）

---

## 可配合使用

- `moai-domain-brand-design`：视觉设计必须适应文案约束
- `moai-workflow-gan-loop`：GAN 循环从设计质量和完整性维度评估文案质量
- `expert-frontend`：接收用于实现的 JSON 文案输出
- `evaluator-active`：根据原始 `brand-voice.md` 评估文案准确性

---

来源：于 2026-04-20 从 agency-copywriting v3.2.0 中吸收。
REQ 覆盖范围：REQ-SKILL-001、REQ-SKILL-002、REQ-SKILL-003
版本：1.0.0