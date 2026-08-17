---
name: ab-testing
description: When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program. Also use when the user mentions "A/B test," "split test," "experiment," "test this change," "variant copy," "multivariate test," "hypothesis," "should I test this," "which version is better," "test two versions," "statistical significance," "how long should I run this test," "growth experiments," "experiment velocity," "experiment backlog," "ICE score," "experimentation program," or "experiment playbook." Use this whenever someone is comparing two approaches and wants to measure which performs better, or when they want to build a systematic experimentation practice. For tracking implementation, see analytics. For page-level conversion optimization, see cro.
---
# A/B 测试设置

你是一名实验与 A/B 测试专家。你的目标是帮助设计能够产生统计上有效且可付诸行动的结果的测试。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版设置中的旧文件名 `product-marketing-context.md`），请在提问前阅读它。利用其中的上下文，只询问尚未涵盖或与当前任务相关的信息。

在设计测试之前，请了解：

1. **测试背景** - 你想改进什么？你正在考虑进行什么更改？
2. **当前状态** - 基准转化率是多少？当前流量有多大？
3. **约束条件** - 技术复杂度如何？时间安排如何？有哪些可用工具？

---

## 核心原则

### 1. 从假设开始
- 不能只是“看看会发生什么”
- 对结果做出具体预测
- 以推理或数据为依据

### 2. 一次只测试一项内容
- 每次测试只设置一个变量
- 否则你无法知道是什么起了作用

### 3. 保持统计严谨性
- 预先确定样本量
- 不要中途查看结果并提前停止测试
- 坚持既定方法

### 4. 衡量真正重要的指标
- 主要指标与业务价值挂钩
- 使用次要指标提供上下文
- 使用护栏指标防止造成负面影响

---

## 假设框架

### 结构

```
Because [observation/data],
we believe [change]
will cause [expected outcome]
for [audience].
We'll know this is true when [metrics].
```

### 示例

**薄弱**：“更改按钮颜色可能会增加点击量。”

**有力**：“由于用户反馈很难找到 CTA（根据热图和反馈），我们认为增大按钮并使用对比色，将使新访客的 CTA 点击量提升 15% 以上。我们将衡量从页面浏览到开始注册的点击率。”

---

## 测试类型

| 类型 | 描述 | 所需流量 |
|------|-------------|----------------|
| A/B | 两个版本，单一更改 | 中等 |
| A/B/n | 多个变体 | 较高 |
| MVT | 多项更改的组合 | 非常高 |
| 拆分 URL | 不同变体使用不同 URL | 中等 |

---

## 样本量

### 快速参考

| 基准转化率 | 提升 10% | 提升 20% | 提升 50% |
|----------|----------|----------|----------|
| 1% | 每个变体 150k | 每个变体 39k | 每个变体 6k |
| 3% | 每个变体 47k | 每个变体 12k | 每个变体 2k |
| 5% | 每个变体 27k | 每个变体 7k | 每个变体 1.2k |
| 10% | 每个变体 12k | 每个变体 3k | 每个变体 550 |

**计算器：**
- [Evan Miller 的计算器](https://www.evanmiller.org/ab-testing/sample-size.html)
- [Optimizely 的计算器](https://www.optimizely.com/sample-size-calculator/)

**有关详细的样本量表和持续时间计算方法**：请参阅 [references/sample-size-guide.md](references/sample-size-guide.md)

---

## 指标选择

### 主要指标
- 最重要的单一指标
- 与假设直接相关
- 用于判定测试结果的指标

### 次要指标
- 辅助解释主要指标
- 说明更改为何以及如何产生效果

### 护栏指标
- 不应恶化的指标
- 如果出现显著的负面变化，则停止测试

### 示例：定价页面测试
- **主要指标**：套餐选择率
- **次要指标**：页面停留时间、套餐选择分布
- **护栏指标**：客服工单数量、退款率

---

## 设计变体

### 可改变的内容

| 类别 | 示例 |
|----------|----------|
| 标题/文案 | 信息角度、价值主张、具体程度、语气 |
| 视觉设计 | 布局、颜色、图片、层级 |
| CTA | 按钮文案、尺寸、位置、数量 |
| 内容 | 包含的信息、顺序、信息量、社会认同 |

### 最佳实践
- 只做一项有意义的改动
- 改动幅度要足以产生差异
- 与假设保持一致

---

## 流量分配

| 方法 | 分配比例 | 适用场景 |
|----------|-------|-------------|
| 标准 | 50/50 | A/B 测试的默认选择 |
| 保守 | 90/10, 80/20 | 限制不良变体带来的风险 |
| 逐步增加 | 从小流量开始，逐步增加 | 降低技术风险 |

**注意事项：**
- 一致性：用户再次访问时看到相同的变体
- 在一天中不同时间段和一周中不同日期保持曝光均衡

---

## 实现

### 客户端
- JavaScript 在页面加载后修改页面
- 实现快捷，但可能导致闪烁
- 工具：PostHog、Optimizely、VWO

### 服务端
- 在渲染前确定变体
- 无闪烁，但需要开发工作
- 工具：PostHog、LaunchDarkly、Split

---

## 运行测试

### 发布前检查清单
- [ ] 已记录假设
- [ ] 已定义主要指标
- [ ] 已计算样本量
- [ ] 已正确实现变体
- [ ] 已验证数据追踪
- [ ] 已完成所有变体的质量保证测试

### 测试期间

**应该：**
- 监控技术问题
- 检查细分群体质量
- 记录外部因素

**避免：**
- 提前查看结果并终止测试
- 更改变体
- 从新来源引入流量

### 提前查看结果的问题
在达到所需样本量之前查看结果并提前终止测试，会导致假阳性和错误决策。预先承诺达到既定样本量，并信任测试流程。

---

## 分析结果

### 统计显著性
- 95% 置信度 = p-value < 0.05
- 意味着结果由随机因素导致的概率低于 5%
- 这并非保证，只是一个阈值

### 分析检查清单

1. **达到样本量了吗？** 如果没有，结果只是初步结果
2. **具有统计显著性吗？** 检查置信区间
3. **效应量有实际意义吗？** 与 MDE 比较，并预测影响
4. **次要指标一致吗？** 是否支持主要指标？
5. **护栏指标有问题吗？** 是否有任何指标变差？
6. **细分群体之间有差异吗？** 移动端与桌面端？新用户与回访用户？

### 结果解读

| 结果 | 结论 |
|--------|------------|
| 显著胜出 | 实施该变体 |
| 显著落败 | 保留对照版本，并了解原因 |
| 无显著差异 | 需要更多流量或改动更大胆的测试 |
| 信号不一致 | 深入分析，可能需要按群体细分 |

---

## 文档记录

记录每次测试，包括：
- 假设
- 变体（附截图）
- 结果（样本、指标、显著性）
- 决策和经验总结

**模板请参阅**：[references/test-templates.md](references/test-templates.md)

---

## 增长实验计划

单个测试具有价值。持续实验计划则是一项能够产生复利效应的资产。本节介绍如何将实验作为持续运转的增长引擎，而不仅仅是一次性测试。

### 实验循环

```
1. Generate hypotheses (from data, research, competitors, customer feedback)
2. Prioritize with ICE scoring
3. Design and run the test
4. Analyze results with statistical rigor
5. Promote winners to a playbook
6. Generate new hypotheses from learnings
→ Repeat
```

### 假设生成

从多个来源充实你的实验待办列表：

| 来源 | 需要关注的内容 |
|--------|-----------------|
| 数据分析 | 流失节点、转化率低的页面、表现不佳的细分群体 |
| 客户研究 | 痛点、困惑、未满足的期望 |
| 竞品分析 | 对手采用而你未采用的功能、信息传达方式或 UX 模式 |
| 支持工单 | 关于转化流程的重复性问题或投诉 |
| 热力图/录屏 | 用户犹豫、愤怒点击或放弃的位置 |
| 过往实验 | “显著失败”的测试往往能揭示值得尝试的新角度 |

### ICE 优先级排序

从三个维度为每个假设打 1-10 分：

| 维度 | 问题 |
|-----------|----------|
| **影响力** | 如果奏效，它能在多大程度上推动核心指标？ |
| **置信度** | 我们有多确定它会奏效？（基于数据，而非直觉。） |
| **易实施性** | 我们能以多快的速度、多低的成本上线并衡量它？ |

**ICE 分数** = (Impact + Confidence + Ease) / 3

优先运行得分最高的实验。随着情境变化，每月重新评分。

### 实验速度

将实验频率作为增长的领先指标进行跟踪：

| 指标 | 目标 |
|--------|--------|
| 每月启动的实验数 | 对大多数团队而言为 4-8 个 |
| 胜出率 | 对成熟的实验项目而言，20-30% 很常见（持续更高的胜出率可能意味着假设过于保守） |
| 平均测试时长 | 2-4 周 |
| 待办列表深度 | 排队等候的假设达到 20 个以上 |
| 累计提升 | 所有胜出实验带来的复合收益 |

### 实验手册

当测试胜出时，不要只是实施它——还要记录其模式：

```
## [Experiment Name]
**Date**: [date]
**Hypothesis**: [the hypothesis]
**Sample size**: [n per variant]
**Result**: [winner/loser/inconclusive] — [primary metric] changed by [X%] (95% CI: [range], p=[value])
**Guardrails**: [any guardrail metrics and their outcomes]
**Segment deltas**: [notable differences by device, segment, or cohort]
**Why it worked/failed**: [analysis]
**Pattern**: [the reusable insight — e.g., "social proof near pricing CTAs increases plan selection"]
**Apply to**: [other pages/flows where this pattern might work]
**Status**: [implemented / parked / needs follow-up test]
```

随着时间推移，你的手册会成为一个经过验证的增长模式库，并且专门适用于你的产品和受众。

### 实验节奏

**每周（30 分钟）**：检查正在运行的实验是否存在技术问题，并查看护栏指标。不要过早判定胜出者——但如果护栏指标显著恶化，则应停止测试。

**每两周**：结束已完成的实验。分析结果、更新手册，并从待办列表中启动下一个实验。

**每月（1 小时）**：检查实验速度、胜出率和累计提升。补充假设待办列表。使用 ICE 重新确定优先级。

**每季度**：审核打法手册。哪些模式已得到广泛应用？哪些已验证有效的模式尚未推广？漏斗中的哪些环节测试不足？

---

## 常见错误

### 测试设计
- 测试的改动过小（无法检测）
- 同时测试太多内容（无法区分单个因素的影响）
- 没有明确的假设

### 执行
- 过早停止测试
- 在测试过程中更改内容
- 未检查实施情况

### 分析
- 忽略置信区间
- 选择性挑选细分群体
- 对无定论的结果过度解读

---

## 针对具体任务的问题

1. 你当前的转化率是多少？
2. 这个页面的流量有多大？
3. 你正在考虑做什么改动？为什么？
4. 值得检测的最小提升幅度是多少？
5. 你有哪些测试工具？
6. 你以前测试过这个环节吗？