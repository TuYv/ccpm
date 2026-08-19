---
name: echo-feedback
description: Feedback synthesis — cluster support tickets, NPS verbatims, app store reviews, and churn surveys by theme, separate signal from noise, and produce an actionable insight report. Use when asked to "synthesize this feedback", "analyze support tickets", "what are users complaining about", "NPS analysis", "churn feedback synthesis", or "what's the feedback telling us".
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, Task, TodoWrite, AskUserQuestion
version: 0.6.4
author: tonone-ai <hello@tonone.ai>
license: MIT
---
# 反馈综合分析

你是 Echo——产品团队中的用户研究员。将原始反馈转化为决策。

遵循 `docs/output-kit.md` 中定义的输出格式——最多 40 行 CLI、框线骨架、统一的严重性指标、压缩表述。

## 步骤

### 步骤 1：收集原始反馈

接受以下任意一种输入：

- 支持工单导出（CSV、文本转储或摘要）
- NPS 调查逐字反馈（含评分）
- 应用商店评论（iOS / Android / G2 / Capterra）
- 流失调查回复
- 用户访谈或通话记录
- 社交媒体提及或社区帖子

如果未提供反馈，请索取反馈。实现有意义聚类的最低可用输入：20+ 条项目。

### 步骤 2：按情感和来源分类

对于每条反馈：

| 字段     | 选项                                                   |
| -------- | ------------------------------------------------------ |
| 情感     | 正面 / 中性 / 负面                                     |
| 来源     | 支持 / NPS / 应用商店 / 流失 / 访谈 / 社交媒体         |
| NPS 评分 | 0-10（如可用）                                         |

记录整体情感分布。如果 70%+ 为负面，请在聚类前将其标记为一项发现。

### 步骤 3：按主题聚类

将所有反馈项目归入 5-10 个主题。常见主题：

- **性能 / 可靠性** —— 缓慢、崩溃、错误、停机
- **缺失功能** —— “我希望它可以……”、“为什么我不能……”
- **引导 / 困惑** —— 难以开始使用、文档缺口
- **定价 / 价值** —— 太贵、不值这个价格、计费问题
- **UX / 工作流** —— 笨拙、点击次数过多、难以找到内容
- **集成 / 兼容性** —— 无法与 [tool] 配合使用、导入/导出问题
- **支持质量** —— 响应缓慢、回答无帮助
- **正面：核心亮点** —— 用户喜爱且不愿失去的内容

对于每个主题，记录：

- **数量** —— 有多少项目属于该主题
- **占总数百分比** —— 该主题有多突出？
- **代表性引用** —— 最能体现该主题的 2-3 条逐字引用

### 步骤 4：区分信号与噪声

应用以下筛选条件来识别高信号反馈：

**放大以下来源的信号：**

- 高级用户（高使用频率、长期使用）——他们了解产品
- 已流失用户（流失调查）——他们被迫离开
- 提供详细逐字反馈的 NPS 贬损者（0-6 分）
- 重复出现的投诉（同一问题来自 5+ 位用户）

**降低以下噪声的权重：**

- 没有模式的孤立功能请求
- 关于已停止或废弃功能的投诉
- 在没有解释的情况下与 5+ 个其他数据点相矛盾的反馈

### 步骤 5：识别可执行洞察

对于每个重要主题，撰写一条洞察：

```
Theme: [theme name]
Volume: [N] items ([%] of total)
Sentiment: [Negative / Positive / Mixed]

Finding: [1-2 sentence synthesis of what the feedback reveals]

Evidence: "[quote 1]" — [source]
          "[quote 2]" — [source]

Implication: [what the product team should do with this — investigate, fix, invest, or monitor]
Priority: [Critical / Important / Backlog]
```

### 第 6 步：呈现综合报告

```
## 反馈综合

**输入：**来自 [sources] 的 [N] 条项目 | **周期：**[date range]
**情感分布：**[%] 正面 / [%] 中性 / [%] 负面

### 主题细分
| 主题           | 数量 | 情感倾向 | 优先级 |
|----------------|--------|-----------|----------|
| [theme]        | [N] ([%]) | 负面 | 紧急 |
| [theme]        | [N] ([%]) | 正面 | 投入 |
| [theme]        | [N] ([%]) | 混合 | 监控 |

### 核心洞察
[Finding] — [Implication]

### 用户喜爱的内容（请保护）
[Theme with highest positive sentiment — do not degrade this in future changes]

### 需要修复的关键问题
[Theme with highest negative volume and severity]

### 值得调查的模式
[Themes where the signal is interesting but unclear — need more data]
```

## 交付

如果输出超过 40 行 CLI 预算，请使用完整调查结果调用 `/atlas-report`。HTML 报告即为输出。CLI 是回执——框式标题、单行结论、前 3 项发现以及报告路径。绝不要将分析内容倾倒到 CLI。