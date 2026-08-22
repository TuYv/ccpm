---
name: cro-optimization
description: Analyzes landing pages and provides detailed CRO (Conversion Rate Optimization) recommendations. Use when user provides a landing page URL or HTML/CSS code and needs optimization advice to maximize conversions, signups, or sales. Extracts page elements, audits against proven CRO principles, and delivers actionable recommendations in report format.
---
# CRO 优化

## 目的
分析落地页并提供全面的 CRO 审计，以及具体、可执行的建议，从而最大限度地提高转化率。

---

## 执行逻辑

**首先检查 $ARGUMENTS 以确定执行模式：**

### 如果 $ARGUMENTS 为空或未提供：
回复：
"cro-optimization 已加载，请提供你的落地页 URL 或粘贴 HTML/CSS 代码"

然后等待用户在下一条消息中提供其落地页。

### 如果 $ARGUMENTS 包含内容：
立即进入任务执行（跳过“已加载”消息）。

---

## 任务执行

当落地页可用时（来自初始 $ARGUMENTS 或后续消息）：

### 1. 强制要求：首先读取参考文件
**阻塞性要求——不得跳过此步骤**

在执行任何其他操作之前，你必须使用 Read 工具读取全部三个参考文件：

```
Read: ./references/cro_principles.md
Read: ./references/landing_page_patterns.md
Read: ./references/element_audit_framework.md
```

**你将从中了解到：**
- **cro_principles.md**：13 项核心 CRO 原则，以及检测标准和修复模式
- **landing_page_patterns.md**：按类别整理的高转化页面（ClickUp、Notion、Stripe、Apple 等）的真实模式
- **element_audit_framework.md**：用于审计 HTML 元素、CTA、表单和视觉层级的系统化框架

在读取所有文件，并将这些原则、模式和审计框架加载到上下文中之前，**不得继续**执行第 2 步。

### 2. 检查业务背景
检查项目根目录中是否存在 `FOUNDER_CONTEXT.md`。
- **如果存在：**读取该文件，并使用其中的业务背景来提供个性化建议（行业、目标受众、产品类型、竞争对手）。
- **如果不存在：**仅根据页面内容继续分析。

### 3. 获取并提取落地页
如果用户提供了 URL：
- 使用 WebFetch 获取落地页内容
- 提取关键元素并进行分类记录（参见下方的元素提取）

如果用户直接提供了 HTML/CSS：
- 直接分析所提供的代码
- 记录任何缺失的上下文（实时样式、图片等）

### 4. 元素提取
从页面中提取以下元素并进行分类记录：

**排版：**
- H1（应当有且仅有一个）
- H2（各部分标题）
- 正文文本示例
- CTA 按钮文案

**视觉结构：**
- 首屏内容
- 各部分顺序
- 图片/视觉元素的位置
- 配色方案和对比度

**转化元素：**
- 主要 CTA（文案、位置、设计）
- 次要 CTA
- 表单（字段数量、标签）
- 信任信号（徽标、用户评价、徽章）
- 社会认同（指标、评论、案例研究）

**技术方面：**
- 移动端响应式设计指标
- 加载速度问题（大型图片等）

### 5. 根据 CRO 原则进行审计
针对 cro_principles.md 中的 13 项原则，逐项执行以下操作：
1. 检查页面是否违反该原则
2. 记录具体违规情况及证据
3. 确定严重程度（高/中/低）
4. 起草具体建议

**按影响程度确定优先级：**
- 高：首屏清晰度、CTA 有效性、重大信任缺口
- 中：异议处理、视觉层级、可扫读性
- 低：细微的文案调整、锦上添花的补充内容

### 6. 与高转化率模式进行比较
使用 landing_page_patterns.md：
1. 确定最相关的类别（B2B SaaS、电子商务等）
2. 将页面结构与经过验证的模式进行比较
3. 指出高转化表现页面包含但当前页面缺失的元素
4. 识别可采用成功模式的机会

### 7. 生成建议
针对发现的每个问题，提供：
1. **要更改什么** — 具体元素和操作
2. **为什么重要** — 违反的原则及预期影响
3. **如何实施** — 具体示例或改写方案
4. **优先级** — 高/中/低，并说明理由

### 8. 设置格式并验证
- 按照**输出格式**部分组织输出
- 完成**质量检查清单**自我验证
- 确保建议具体且可执行（而非泛泛而谈）

---

## 写作规则
硬性约束。不得自行解读。

### 核心规则
- 每条建议都必须具体且可执行
- 对文案更改提供修改前/修改后的示例
- 引用所违反的具体原则
- 根据对转化率的影响确定优先级，而不是根据实施难易度
- 尽可能将更改表述为可检验的假设
- 绝不在未解释“为什么”的情况下提出更改建议

### 分析规则
- 系统性地进行审查——不得跳过任何原则
- 不仅要指出问题，还要说明哪些方面做得好
- 考虑页面的潜在目标受众
- 考虑可能的流量来源
- 区分关键问题与优化项

### 建议规则
- 优先列出影响最大的更改
- 将相关建议归为一组
- 提供具体的文案改写，而不只是说“表达得更清晰”
- 不仅要提供内容建议，还要提供位置建议
- 单独考虑移动端体验

---

## 输出格式

```markdown
# CRO Audit Report: [Page Name/URL]

## Executive Summary
[2-3 sentences: Overall assessment, biggest opportunities, expected impact]

---

## What's Working Well
[Bullet list of 3-5 elements that follow CRO best practices]

---

## Critical Issues (Fix First)

### Issue 1: [Specific Problem]
**Principle Violated:** [Principle name and number]
**Current State:** [What exists now]
**Problem:** [Why this hurts conversions]
**Recommendation:** [Specific fix]
**Example:**
```
BEFORE: [Current copy/element]
AFTER: [Recommended copy/element]
```
**Expected Impact:** [What improvement to expect]

### Issue 2: [Specific Problem]
[Same structure]

---

## High-Impact Optimizations

### Optimization 1: [Improvement Area]
**Current State:** [What exists]
**Opportunity:** [What could be better]
**Recommendation:** [Specific change]
**Example:**
```
BEFORE: [Current]
AFTER: [Recommended]
```
**Priority:** [High/Medium] — [Reasoning]

[Continue for each optimization]

---

## Section-by-Section Analysis

### Above the Fold
- **H1:** [Assessment and recommendation if needed]
- **Subheadline:** [Assessment and recommendation if needed]
- **CTA:** [Assessment and recommendation if needed]
- **Trust signals:** [Assessment and recommendation if needed]

### [Section Name]
[Analysis and recommendations]

[Continue for each major section]

---

## Quick Wins (Easy Implementations)
1. [Simple change with good impact]
2. [Simple change with good impact]
3. [Simple change with good impact]

---

## Testing Roadmap
1. **Test First:** [Highest impact hypothesis]
2. **Test Second:** [Next priority]
3. **Test Third:** [Following priority]

---

## Benchmark Comparison
**Compared to:** [Relevant high-converting examples from patterns file]
**Missing elements:** [What top performers have that this page lacks]
**Adoption opportunities:** [Specific patterns to consider implementing]
```

---

## 参考资料

**在分析之前，必须使用 Read 工具读取全部三个文件（参见步骤 1）：**

| 文件 | 用途 |
|------|---------|
| `./references/cro_principles.md` | 13 条 CRO 原则，包含检测标准、修复模式和违规表现 |
| `./references/landing_page_patterns.md` | 按类别整理的 ClickUp、Notion、Stripe、Apple、Shopify 等真实案例模式 |
| `./references/element_audit_framework.md` | 用于审核 H1、CTA、表单、社会认同和视觉层级的系统化框架 |

**为什么这三个文件都很重要：**原则告诉你问题出在哪里。模式展示优秀实践是什么样的。审核框架可确保你系统地检查所有内容。三者结合，能够产出具体、有证据支持的建议，而非泛泛的 CRO 建议。

---

## 质量检查清单（自我验证）

在最终确定输出内容之前，请验证以下所有事项：

### 分析前检查
- [ ] 我在分析前已读取 `./references/cro_principles.md`
- [ ] 我在分析前已读取 `./references/landing_page_patterns.md`
- [ ] 我在分析前已读取 `./references/element_audit_framework.md`
- [ ] 我已将全部 13 条原则、分类模式和审核标准纳入上下文

### 提取检查
- [ ] 我已识别 H1 并评估其清晰度
- [ ] 我已整理所有 CTA 及其文案
- [ ] 我已记录社会认同元素及其位置
- [ ] 我已评估首屏内容
- [ ] 我已评估各区块的排列顺序

### 分析检查
- [ ] 我已根据页面逐条评估每项原则
- [ ] 各项问题均引用了具体违反的原则
- [ ] 建议中包含修改前后的示例
- [ ] 已根据对转化的影响确定优先级
- [ ] 我已与相关的高转化模式进行比较

### 输出检查
- [ ] 执行摘要涵盖关键发现
- [ ] 严重问题优先列出
- [ ] 每项建议都具体且可执行
- [ ] 测试路线图提供明确的后续步骤
- [ ] 包含“做得好的方面”部分

**如果任何一项检查未通过 → 请在呈现之前进行修改。**

---

## 默认值与假设

除非上下文另有说明，否则使用以下设置：

- **页面类型：**SaaS 落地页（最常见）
- **流量温度：**混合（从冷流量到温流量）
- **主要目标：**注册或演示申请
- **受众：**企业决策者
- **设备占比：**60% 桌面端，40% 移动端
- **转化定义：**主要 CTA 点击

如果页面类型明显不同（电子商务、内容网站等），请相应调整分析。

在执行摘要中记录所做的任何假设。

---