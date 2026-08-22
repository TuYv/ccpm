---
name: lead-magnet-generator
description: Creates viral lead magnet posts that drive comments and DMs. Produces 2 versions - a quick punchy format and a detailed format with bullet points. Use when user needs social media posts to give away a lead magnet in exchange for engagement.
---
# 潜在客户磁铁生成器

## 目的
生成 2 篇病毒式潜在客户磁铁帖子，引导你的受众通过评论触发词来换取免费资源，从而最大限度地提升互动量和私信订阅量。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"lead-magnet-generator 已加载，请继续提供其他指令"

然后等待用户在下一条消息中提供需求。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行环节（跳过“已加载”消息）。

---

## 任务执行

当用户需求可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取所有参考文件：

```
Read: ./references/lead-magnet-patterns.md
Read: ../viral-hook-creator/references/hook-patterns.md
Read: ../viral-hook-creator/references/trigger_words.md
```

**你将找到以下内容：**
- **lead-magnet-patterns.md**：潜在客户磁铁帖子的结构、价值塑造技巧和 CTA 模式
- **hook-patterns.md**：18 种经过验证的病毒式钩子模式，包括模板和心理学原理（来自 viral-hook-creator）
- **trigger_words.md**：四类病毒式触发词（来自 viral-hook-creator）

在读取完全部三个文件并将其中的模式加载到上下文之前，**不得继续**执行第 2 步。

### 2. 检查业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：**读取该文件，并使用其中的业务背景对输出进行个性化定制（行业术语、受众、品牌语调、权威性指标）。
- **如果不存在：**使用“默认值与假设”部分中的默认设置继续执行。

### 3. 分析输入
从用户需求中提取：
- **潜在客户磁铁：**他们要赠送什么？（框架、模板、清单、课程等）
- **可信度钩子：**有哪些投入或研究作为支撑？（花费 X 小时研究、投入 X 个月构建、拥有 X 年经验）
- **内部内容：**该潜在客户磁铁包含什么？（用于详细版本）
- **价值锚点：**用于锚定价值的价格点（$99、$199 等）或稀缺性（将在 Y 天后收费 X）
- **触发词：**希望人们评论什么词？（默认：使用全大写的相关关键词）
- **平台：**Twitter/X 或 LinkedIn

对于任何缺失的信息，应用**默认值与假设**中的默认设置，或向用户询问。

### 4. 生成潜在客户磁铁帖子

**步骤 4a：首先生成开场钩子**
使用 viral-hook-creator 中的钩子模式和触发词（已在第 1 步读取），生成恰好 2 个开场钩子选项：

1. 从 hook-patterns.md 中选择 2 种适合该潜在客户磁铁主题的不同模式
2. 在每个钩子中融入 trigger_words.md 中的 1-2 个触发词
3. 每个钩子应为 1-2 行，用于激发受众对该潜在客户磁铁的好奇心

这些钩子将作为两个帖子版本的开场内容。

**步骤 4b：构建完整帖子**
使用 4a 中最出色的钩子，创建恰好 2 个版本：

**版本 1：快速格式**
结构：
```
[Opening hook from Step 4a]

[What you created from it]

[Value anchor - could charge $X / will charge $X soon]

Comment "[WORD]" and I'll send it to you for free (must be following)
```

**版本 2：详细格式**
结构：
```
[Opening hook from Step 4a]

[What you built from it]

Inside you'll find:

→ [Benefit/content 1]
→ [Benefit/content 2]
→ [Benefit/content 3]
→ [Benefit/content 4]

Want the full [playbook/framework/guide]?

Comment "[WORD]" and I'll send it to you.

(Must be following)
```

**平台适配：**
- **Twitter/X：**使用上面的标准 CTA 结尾
- **LinkedIn：**将 CTA 结尾替换为：
```
1. Connect with me
2. Comment "[WORD]"

I'll send it straight to your DMs.

P.S. Repost for priority in the queue
```

### 5. 格式化并验证
- 根据**输出格式**部分组织输出
- 在展示输出前，完成**质量检查清单**自检

---

## 写作规则
硬性约束。不做任何变通解释。

### 核心规则
- 以可信度钩子开头（投入、时间、研究、经验）
- 使用具体数字：写“73 小时”，而不是“很多小时”；写“3 个月”，而不是“很长时间”
- 价值锚点必须真实可信且有充分依据
- 触发词应与内容相关且易于记忆（通常使用全大写的引流赠品类型）
- Twitter/X 必须包含“Must be following”（以便发送私信）
- 保持对话感，不要有强烈的推销意味
- 不使用表情符号
- 正文中不使用话题标签

### 格式特定规则
- **快速格式：**最多 4-5 个短段落。简洁有力。快速进入 CTA。
- **详细格式：**列表始终使用箭头（→）。包含 3-5 个要点。每个要点都是具体的收益或内容项。

### 平台特定规则
- **Twitter/X：**
  - 不受字符数限制（这是帖文串的首帖或长帖）
  - 结尾使用：`Comment "[WORD]" and I'll send it to you for free (must be following)`
  - 或：`Like + Comment "[WORD]" and it's yours for free. (Must be following so I can DM you)`

- **LinkedIn：**
  - 保持专业，同时依然直接
  - 使用编号 CTA 格式结尾：
    ```
    1. Connect with me
    2. Comment "[WORD]"

    I'll send it straight to your DMs.

    P.S. Repost for priority in the queue
    ```

### 开场钩子规则
- 开场钩子必须使用 viral-hook-creator 的 hook-patterns.md 中的模式
- 融入 trigger_words.md 中的 1-2 个触发词
- 每个钩子都应在 1-2 行内激发好奇心并建立可信度
- 对引流赠品非常有效的常见模式：权威可信度、数据驱动洞察、时间投入

### 价值锚点模式
- “完全可以为此收费 $X。”
- “Y 天后将收费 $X。”
- “如果找顾问来做，这需要花费 $X。”
- “通常售价 $X。接下来 48 小时内免费。”

---

## 输出格式

```markdown
## Lead Magnet Brief
**Lead magnet:** [What they're giving away]
**Credibility:** [The effort/research/experience behind it]
**Value anchor:** [$X or scarcity framing]
**Trigger word:** [WORD]
**Platform:** [Twitter/X or LinkedIn]

---

## Opening Hook Options
(Generated using viral-hook-creator patterns)

### Hook 1: [Pattern Name]
[Hook text - 1-2 lines]

### Hook 2: [Pattern Name]
[Hook text - 1-2 lines]

---

## Version 1: Quick Format

[Full post using Hook 1 or 2 as opener]

---

## Version 2: Detailed Format

[Full post using Hook 1 or 2 as opener]
```

**示例（Twitter/X）：**

```markdown
## Lead Magnet Brief
**Lead magnet:** Product Hunt launch checklist (Claude Skill)
**Credibility:** 3 months studying every #1 Product Hunt launch
**Value anchor:** Could charge $99
**Trigger word:** SKILL
**Platform:** Twitter/X

---

## Opening Hook Options
(Generated using viral-hook-creator patterns)

### Hook 1: Authority Credibility
I spent 3 months studying every #1 Product Hunt launch.

### Hook 2: Data-Driven Insight
I analyzed 247 Product Hunt launches that hit #1. Here's what they all had in common.

---

## Version 1: Quick Format

I spent 3 months studying every #1 Product Hunt launch.

Then I built a Claude Skill that gives you a personalized launch checklist based on YOUR product.

Could easily charge $99 for this.

Comment "SKILL" and I'll send it to you for free (must be following)

---

## Version 2: Detailed Format

I spent 3 months studying every #1 Product Hunt launch.

Then I built a Claude Skill that creates a personalized launch checklist based on YOUR product.

Inside you'll find:

→ Pre-launch timeline with exact tasks for each day
→ Hunter outreach templates that actually get responses
→ Community building tactics the top launches used
→ Launch day hour-by-hour checklist

Want the full playbook?

Comment "SKILL" and I'll send it to you.

(Must be following)
```

**示例（LinkedIn）：**

```markdown
## Version 1: Quick Format

I spent 3 months studying every #1 Product Hunt launch.

Then I built a tool that gives you a personalized launch checklist based on YOUR product.

Could easily charge $99 for this.

1. Connect with me
2. Comment "SKILL"

I'll send it straight to your DMs.

P.S. Repost for priority in the queue

---

## Version 2: Detailed Format

I spent 3 months studying every #1 Product Hunt launch.

Then I built a tool that creates a personalized launch checklist based on YOUR product.

Inside you'll find:

→ Pre-launch timeline with exact tasks for each day
→ Hunter outreach templates that actually get responses
→ Community building tactics the top launches used
→ Launch day hour-by-hour checklist

Want the full playbook?

1. Connect with me
2. Comment "SKILL"

I'll send it straight to your DMs.

P.S. Repost for priority in the queue
```

---

## 参考资料

**生成帖子之前，必须使用 Read 工具读取以下文件（参见步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/lead-magnet-patterns.md` | 价值锚点、CTA 模式、帖子结构和示例 |
| `../viral-hook-creator/references/hook-patterns.md` | 18 种经过验证的病毒式开场钩子模式 |
| `../viral-hook-creator/references/trigger_words.md` | 可融入开场钩子的病毒式触发词 |

**为什么这很重要：**引流赠品帖子需要具备两点：(1) 一个能让用户停止滚动的病毒式开场钩子；(2) 一个清晰的「价值到行动」结构。开场钩子模式可以激发最初的好奇心。引流赠品模式则能将这种注意力转化为评论。

---

## 质量检查清单（自我验证）

在最终确定输出之前，请核对以下**所有**事项：

### 执行前检查
- [ ] 我在生成帖子前阅读了 `./references/lead-magnet-patterns.md`
- [ ] 我在生成钩子前阅读了 `../viral-hook-creator/references/hook-patterns.md`
- [ ] 我在生成钩子前阅读了 `../viral-hook-creator/references/trigger_words.md`
- [ ] 上下文中已包含钩子模式、触发词、价值锚点和 CTA 格式

### 开场钩子检查
- [ ] 恰好生成了 2 个开场钩子选项
- [ ] 每个钩子使用 hook-patterns.md 中的不同模式
- [ ] 每个钩子包含 trigger_words.md 中的 1-2 个触发词
- [ ] 钩子为 1-2 行，并能激发好奇心

### 内容检查
- [ ] 开场钩子使用了具体数字（小时、月、年）
- [ ] 价值锚点真实可信且有充分依据
- [ ] 触发词与内容相关并采用全大写形式
- [ ] 简短格式有冲击力（最多 4-5 个短段落）
- [ ] 详细格式使用箭头（→）列出内容
- [ ] 详细格式包含 3-5 个具体要点

### CTA 检查
- [ ] Twitter/X 帖子以正确的“评论 + 必须关注”CTA 结尾
- [ ] LinkedIn 帖子以编号式 CTA + “附言：转发”行结尾
- [ ] CTA 中的触发词保持一致

### 写作检查
- [ ] 不使用表情符号
- [ ] 正文中不使用话题标签
- [ ] 语气自然对话化，不带推销感
- [ ] 全文使用主动语态

### 输出检查
- [ ] 两个版本都完整
- [ ] 简介准确概括输入内容
- [ ] 使用了适合对应平台的 CTA

**如果有任何一项检查未通过 → 在展示前修改。**

---

## 默认设置与假设

除非用户另有要求，否则使用以下设置：

- **平台：** Twitter/X（最常用于赠送获客资料）
- **触发词：** 使用全大写形式的获客资料类型（例如 `"FRAMEWORK"`、`"CHECKLIST"`、`"TEMPLATE"`）
- **价值锚点：** “这份资料轻松就能卖到 99 美元”（安全的默认选项）
- **可信度形式：** 基于时间（“我花了 X 小时/月……”）
- **要点数量：** 详细格式包含 4 项
- **语气：** 自信、直接、慷慨

如果用户没有提供获客资料中包含的内容，请先询问 3-5 项核心收益或内容，再生成详细版本。

---