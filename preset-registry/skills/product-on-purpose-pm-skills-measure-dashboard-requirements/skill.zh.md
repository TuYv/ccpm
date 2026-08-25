---
name: measure-dashboard-requirements
description: Specifies what questions a dashboard must answer and the metrics, visualizations, filters, and data sources it needs, so data teams build something that informs decisions rather than displaying numbers. Use when requesting a dashboard or formalizing ad-hoc reporting. For the event tracking that feeds the dashboard, use measure-instrumentation-spec instead; instrument first, visualize second.
license: Apache-2.0
metadata:
  phase: measure
  version: "2.2.0"
  updated: 2026-07-04
  category: validation
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 仪表板需求

仪表板需求文档规定仪表板应回答哪些问题、展示哪些指标，以及应如何将数据可视化。清晰的需求有助于数据团队构建真正能够为决策提供信息的仪表板，而不仅仅是展示数字。

## 适用场景

- 向数据/分析团队请求新建仪表板时
- 为产品、功能或团队定义 KPI 跟踪时
- 将临时报表正式转化为持久化仪表板时
- 季度规划前，用于明确你需要哪些可见性时
- 为需要自助分析的利益相关者提供入职引导时

## 不适用场景

- 你需要为仪表板提供数据的事件跟踪 -> 使用 `measure-instrumentation-spec`；先完成埋点，再进行可视化
- 你正在设计实验结果汇报，而不是常设仪表板 -> 使用 `measure-experiment-design` 和 `measure-experiment-results`
- 你希望在周期结束时对 OKR 进度进行评分 -> 使用 `measure-okr-grader`
- 尚未就仪表板应回答的问题达成一致 -> 先使用 `foundation-okr-writer` 或 `define-problem-statement` 明确成果

## 说明

当被要求明确仪表板需求时，请遵循以下步骤：

1. **明确目的**
   从仪表板应回答的问题开始，而不是从它应展示的图表开始。这个仪表板将为哪些决策提供信息？缺乏明确目的的仪表板最终会变成虚荣指标展示。

2. **确定受众**
   明确谁会使用这个仪表板、使用频率如何，以及在什么场景下使用。高管每周评审与团队每日站会看板的需求不同。

3. **明确关键指标**
   对于每项指标，记录：名称、业务定义（使用通俗语言）、计算公式、数据源，以及基线/目标值。含义模糊的指标会导致仪表板目标不一致。

4. **设计可视化**
   根据数据需要传达的信息推荐图表类型。时间趋势需要折线图；比较需要条形图；构成关系需要饼图/树状图。包括维度拆分。

5. **定义筛选器和细分**
   明确用户需要哪些下钻方式：日期范围、用户细分、产品领域、地理区域。预判用户会提出的“切片和切块”问题。

6. **记录数据源**
   确定数据来源以及已知的数据质量问题。记录延迟要求。仪表板是否需要实时数据，还是每日刷新就足够？

7. **设置权限和访问控制**
   确定谁可以查看哪些内容。某些指标可能需要限制访问。同时考虑安全要求和组织内部的政治因素。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的规格说明应填写模板中的每个部分：概览；目的和问题；受众；关键指标；可视化规范；筛选器和细分；数据源；访问和权限；警报和阈值；验收标准；待解决问题；以及附录。

## 质量检查清单

定稿前，请确认：

- [ ] 目的表述为需要回答的问题，而不是需要构建的图表
- [ ] 所有指标都有明确的定义和计算公式
- [ ] 已确定数据源，并且可以访问
- [ ] 可视化选择与所需洞察的类型相匹配
- [ ] 筛选器支持用户所需的下钻分析
- [ ] 刷新频率与决策节奏相匹配

## 示例

请参阅 `references/EXAMPLE.md` 获取完整示例。