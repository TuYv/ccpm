---
name: measure-experiment-design
description: Designs an A/B test or experiment with variants, success metrics, sample size, and duration for an existing hypothesis. Use when planning an experiment to validate a product change or test an assumption you have already framed. To articulate the hypothesis itself first, use define-hypothesis.
license: Apache-2.0
metadata:
  phase: measure
  version: "2.1.0"
  updated: 2026-06-10
  category: validation
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 实验设计

实验设计文档定义了运行严谨 A/B 测试或对照实验所需的全部参数。它确保团队就测试内容、成功衡量方式以及在得出结论前测试应持续多长时间达成一致。良好的实验设计可以避免常见问题：测试统计功效不足、成功标准不明确，以及根据噪声而非信号做出决策。

## 适用场景

- 在发布产品变更以进行验证性 A/B 测试之前
- 测试需要定量验证的假设时
- 方案设计完成后，在全面发布前验证假设时
- 利益相关者希望获得数据驱动的决策证据时
- 建立实验与学习文化时

## 不适用场景

- 假设本身尚未明确 -> 请先使用 `define-hypothesis`；此技能用于为已有主张设计测试
- 你正在分析已经完成的实验 -> 请使用 `measure-experiment-results`
- 你需要用于衡量实验的事件跟踪方案 -> 请使用 `measure-instrumentation-spec`
- 你是在收集意见，而不是运行对照测试 -> 请使用 `measure-survey-analysis`

## 指令

当被要求设计实验时，请遵循以下步骤：

1. **阐述假设**
   按照以下格式写出清晰、可测试的假设：“我们相信，对[用户]实施[变更]将带来[结果]，其衡量指标为[指标]。”每个实验只设置一个假设——如果要测试多个事项，请运行多个实验。

2. **定义实验变体**
   充分描述对照组（当前体验）和处理组（新体验）。加入截图、模型图或精确描述，确保任何人都能理解用户将看到的内容。

3. **选择主要指标和次要指标**
   选择一个决定成败的主要指标。再添加 2-3 个次要指标，以了解更广泛的影响。加入护栏指标，以发现意料之外的负面影响。

4. **计算样本量**
   确定每个变体所需的用户数量，以便在具有统计显著性的情况下检测最小可检测效果（MDE）。明确指定显著性水平（通常为 0.05）和统计功效（通常为 0.80）。

5. **估算实验时长**
   根据样本量和可用流量，计算实验需要运行多长时间。考虑每周模式——如果用户行为因星期几而异，请避免在一周中间结束实验。

6. **定义目标用户与流量分配**
   指定哪些用户符合实验参与条件，以及流量如何在各变体之间分配。记录所有排除项（例如员工、特定用户群体）。

7. **设定成功标准**
   预先定义什么情况属于成功、失败或结果不明确。这可以防止事后合理化和不断改变目标。

8. **记录风险与缓解措施**
   识别可能出现的问题，以及如何发现和处理这些问题。包括监控计划和回滚标准。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整的设计应填写模板中的每个部分：概述；假设；背景；变体；指标；样本量与持续时间；受众定位；成功标准；风险与缓解措施；实施说明；以及参考资料。

## 质量检查清单

完成前，请确认：

- [ ] 假设可证伪且具体
- [ ] 只定义一个主要指标
- [ ] 已记录样本量计算及其假设
- [ ] 持续时间考虑了流量模式和统计要求
- [ ] 在实验开始前已定义成功标准
- [ ] 防护指标能够避免意外伤害

## 示例

请参阅 `references/EXAMPLE.md` 中的完整示例。