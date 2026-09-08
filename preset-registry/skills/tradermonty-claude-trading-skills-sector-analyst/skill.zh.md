---
name: sector-analyst
description: This skill should be used when analyzing sector and industry performance charts to assess market positioning and rotation patterns. Use this skill when the user provides performance chart images (1-week or 1-month timeframes) for sectors or industries and requests market cycle assessment, sector rotation analysis, or strategic positioning recommendations based on performance data. All analysis and output are conducted in English.
---
# 行业分析师

## 概述

本技能可对行业板块与产业的业绩表现图表进行全面分析，以识别市场周期定位并预测可能的轮动情景。该分析将观测到的业绩数据与既定的行业轮动原理相结合，提供客观的市场评估以及基于概率的情景预测。

## 何时使用本技能

在以下情况下使用本技能：
- 用户提供了行业板块表现图表（通常为 1 周和 1 个月时间框架）
- 用户提供了展示相对表现数据的产业表现图表
- 用户请求分析当前的市场周期定位
- 用户要求进行行业轮动评估或预测
- 用户需要用于市场配置的概率加权情景

用户请求示例：
- “分析这些行业板块表现图表，告诉我我们目前处于市场周期的哪个阶段”
- “基于这些表现图表，接下来哪些板块可能会跑赢？”
- “根据这些数据，防御型轮动的概率是多少？”
- “审阅这些行业板块和产业图表并提供情景分析”

## 分析工作流

在分析行业板块/产业表现图表时，请遵循以下结构化工作流：

### 第一步：数据收集与观察

首先，仔细检查所有提供的图表图像，提取以下信息：
- **板块层面表现**：识别哪些板块（科技、金融、可选消费等）正在跑赢/跑输
- **产业层面表现**：记录显示出强势或弱势的具体产业
- **时间框架对比**：比较 1 周与 1 个月的表现，以识别趋势的一致性或背离
- **变动幅度**：评估相对表现差异的大小
- **变动广度**：判断表现是集中的还是广泛分布的

在分析图表时用英文思考。记录关键板块和产业的具体业绩数值。

### 第二步：市场周期评估

加载行业轮动知识库以支撑分析：
- 阅读 `references/sector_rotation.md` 以获取市场周期与行业轮动框架
- 将观测到的表现模式与各周期阶段的预期模式进行对比：
  - 周期早期复苏
  - 周期中期扩张
  - 周期晚期
  - 衰退

通过以下方式判断哪个周期阶段与当前观测最为匹配：
- 将跑赢的板块映射到典型的周期领涨板块
- 将跑输的板块映射到典型的周期滞涨板块
- 评估多个板块之间的一致性
- 评估与防御型板块对比周期型板块表现的一致程度

### 第三步：当前形势分析

将各项观察综合为客观评估：
- 指出当前表现最接近于哪个市场周期阶段
- 突出支持性证据（哪些板块/产业印证这一观点）
- 记录任何矛盾信号或异常模式
- 根据信号的一致性评估置信水平

使用数据驱动的语言，并具体引用业绩数据。

### 第四步：情景推演

基于行业轮动原理和当前定位，为下一阶段推演 2-4 个潜在情景：

对于每个情景：
- 描述市场周期的转换
- 指出哪些板块可能会跑赢
- 指出哪些板块可能会跑输
- 说明能够确认该情景的催化剂或条件
- 赋予一个概率（参见 sector_rotation.md 中的概率评估框架）

情景应涵盖从最可能（概率最高）到备选/逆向情景的范围。

### 第五步：输出生成

创建一个包含以下章节的结构化 Markdown 文档：

**必备章节：**
1. **执行摘要**：2-3 句概述关键发现
2. **当前形势**：对当前表现模式和市场周期定位的详细分析
3. **支持性证据**：支持周期评估的具体板块与产业业绩数据
4. **情景分析**：2-4 个情景及其描述和概率分配
5. **建议配置**：基于情景概率的战略性与战术性配置建议
6. **关键风险**：需要关注的显著风险或矛盾信号

## 输出格式

将分析结果保存为 Markdown 文件，命名规范为：`sector_analysis_YYYY-MM-DD.md`

使用以下结构：

```markdown
# Sector Performance Analysis - [Date]

## Executive Summary

[2-3 sentences summarizing key findings]

## Current Situation

### Market Cycle Assessment
[Which cycle phase and why]

### Performance Patterns Observed

#### 1-Week Performance
[Analysis of recent performance]

#### 1-Month Performance
[Analysis of medium-term trends]

#### Sector-Level Analysis
[Detailed breakdown by sector]

#### Industry-Level Analysis
[Notable industry-specific observations]

## Supporting Evidence

### Confirming Signals
- [List data points supporting cycle assessment]

### Contradictory Signals
- [List any conflicting indicators]

## Scenario Analysis

### Scenario 1: [Name] (Probability: XX%)
**Description**: [What happens]
**Outperformers**: [Sectors/industries]
**Underperformers**: [Sectors/industries]
**Catalysts**: [What would confirm this scenario]

### Scenario 2: [Name] (Probability: XX%)
[Repeat structure]

[Additional scenarios as appropriate]

## Recommended Positioning

### Strategic Positioning (Medium-term)
[Sector allocation recommendations]

### Tactical Positioning (Short-term)
[Specific adjustments or opportunities]

## Key Risks and Monitoring Points

[What to watch that could invalidate the analysis]

---
*Analysis Date: [Date]*
*Data Period: [Timeframe of charts analyzed]*
```

## 关键分析原则

在进行分析时：

1. **客观性优先**：让数据引导结论，而非先入之见
2. **概率化思维**：通过概率区间表达不确定性
3. **多时间框架**：比较 1 周和 1 个月数据以确认趋势
4. **相对表现**：关注相对强弱，而非绝对收益
5. **广度至关重要**：广泛分布的变动比孤立的运动更有意义
6. **不做绝对判断**：市场很少完全按照教科书模式运行
7. **历史背景**：参考典型的轮动模式，但承认其独特性

## 概率指南

根据证据强度应用以下概率区间：

- **70-85%**：证据充分，在多个板块和时间框架上都有多个确认信号
- **50-70%**：证据中等，有一些确认信号但指标表现不一
- **30-50%**：证据较弱，信号有限或相互矛盾
- **15-30%**：推测性情景，与当前指标相悖但有可能发生

所有情景的概率总和应接近 100%。

## 资源

### references/
- `sector_rotation.md` - 综合知识库，涵盖市场周期阶段、典型行业板块表现模式以及概率评估框架

### assets/
展示预期输入格式的示例图表：
- `sector_performance.jpeg` - 板块层面表现图表示例（1 周和 1 个月）
- `industory_performance_1.jpeg` - 产业表现图表示例（跑赢者）
- `industory_performance_2.jpeg` - 产业表现图表示例（跑输者）

这些示例展示了本技能所分析的视觉数据类型。用户提供的图表在格式上可能有所不同，但应包含类似的相对表现信息。

## 重要说明

- 所有分析思考应以英文进行
- 输出的 Markdown 文件必须为英文
- 每次分析都应参考行业轮动知识库
- 保持客观，避免确认偏误
- 在有新数据可用时更新概率评估
- 图表通常展示 1 周和 1 个月期间的表现
