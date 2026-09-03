---
name: thinking-jobs-to-be-done
description: Deciding what to build or why adoption fails. Recover the progress users hire a solution for under a circumstance, then rank by outcome and competing workarounds.
disable-model-invocation: true
---
# 待完成的任务（Jobs to Be Done）

核心规则：用户雇用解决方案，是为了在特定情境中取得进展。应优先关注任务、作用力、结果以及与之竞争的变通做法——而不是功能清单。

## 何时使用

- 在用户需求不清晰时，决定构建什么、砍掉什么或如何排序
- 解释已上线功能采用率偏低的原因
- 分析超越同类产品范畴的竞争（电子邮件、电子表格、手工操作、非消费）
- 在所追求的进展存在争议时进行定位或研究

需要至少一个证据来源：PRD/规格文档、工单、客服/销售记录、分析数据/日志，或当前产品行为。如果这些都不存在，请指出研究缺口；不要编造引述。

## 何时不使用

- 任务已明确后的纯执行工作（bug 修复、schema、CI、性能）——直接实现，不要重新发现任务
- 为已被锁定的决策做事后合理化——那只是框架表演
- 不涉及终端用户进展决策的基础设施/内部工作
- 当悬而未决的问题仅是*如何*实现一项已确定的任务时

## 流程

1. **指明执行者与情境。** 谁雇用了解决方案、在何种触发情境下、频率如何、利害多大。相比偶尔出现的次要执行者，优先选择每天承担高利害任务的主要执行者。
2. **陈述任务，而非解决方案。** 句式：`When [circumstance], I want to [progress], so I can [outcome]`。拒绝方案形态的表述（"使用 Slack"、"添加一个仪表盘"）。仅在证据支持时才纳入功能性、情感性与社会性维度。
3. **梳理作用力与转换。** 基于现有材料：是什么推力使旧方式失效、新进展提供了什么拉力、什么焦虑阻碍转换、什么习惯维持现状。列出他们如今雇用的东西——包括非软件方案和非消费。
4. **定义“完成”与结果指标。** 执行者如何判断任务已完结。列出需要最小化与最大化的结果（取得进展的时间、返工、信心、意外）。优先选择高频但服务不足的任务，而非低频且已有充分变通方案的任务。
5. **以任务为准为候选项打分。** 对每个功能/优先级：它服务于哪个任务步骤、执行者占比、频率、替代方案的质量。提升高频且未被充分满足的维度；降低面向已获充分服务或低利害任务的精细打磨工作。
6. **最强反例。** 陈述“所定任务有误”的最有力论据（执行者搞错了、虚荣指标、流程本身即任务、竞争实为非消费）。若反例与证据更吻合，应在建议构建之前先修订任务。
7. **停止。** 当一条主要任务陈述、竞争集合和结果指标获得足以改变构建/定位决策的证据支撑时，即告停止——或者当现有材料无法回答、研究是唯一的下一步时。

## 输出

产出一份 JTBD 决策产物：

```text
Job statement: When …, I want to …, so I can …
Performers: primary / secondary (frequency, stakes)
Forces: push / pull / anxiety / habit
Competition: direct | indirect | non-consumption
Outcomes: minimize […] ; maximize […]
Priority implication: build / cut / reposition — because job gap is …
Countercase checked: …
Evidence used / gaps: …
```

## 验证

- **证伪：** 若把任务陈述替换为功能名称后建议并无变化，说明你从未离开方案空间——请从情境与进展出发重写任务。
- **停止：** 一旦排序决策稳定，就不要继续映射任务步骤。
- **过度套用防范：** 对纯实现类任务和已知任务应跳过此框架。绝不为填补缺失证据而编造用户引述或用户画像。
