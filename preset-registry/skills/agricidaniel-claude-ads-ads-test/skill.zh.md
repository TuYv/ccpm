---
name: ads-test
description: "Design and evaluate paid-ad experiments with hypotheses, randomization units, sample-size and duration assumptions, guardrails, platform experiment tools, analysis, and decision rules. Use for A/B test, split test, experiment design, hypothesis, statistical significance, sample size, test duration, or experiment readout."
---
# 付费媒体实验

1. 明确决策、因果假设、处理组、对照组、随机化单位、
   人群、主要指标、护栏指标、最小效应和停止规则。
2. 检查平台限制、重叠实验、转化延迟、季节性、
   干扰和测量质量。
3. 根据声明的假设计算样本量和持续时间；披露近似处理。
4. 除非设计明确估计交互效应，否则只更改一个决策面。
5. 预先注册排除标准、质量检查、分析方法和决策阈值。
6. 在解读结果时，先验证分配完整性和数据完整性，再估计
   效应和不确定性。
7. 以带版本的 JSON 返回设置或解读结果，并附上通俗易懂的决策说明。

不要反复查看结果并在出现有利结果时停止实验，不要将统计功效不足的噪声称为
胜出结果，也不要将结论泛化到测试人群之外。