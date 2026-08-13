---
name: test-strategy
description: Coverage-design method for qa-engineer — pyramid ratios per archetype, equivalence/boundary/property case selection, mutation score as the real coverage signal, and a flake-quarantine policy. Turns "coverage is 90%" (a number with no method) into a defensible test plan. Emits TEST-STRATEGY-{slug}.md, which the QA gate checks exists.
when_to_use: |
  Apply when:
  - qa-engineer is planning tests for a medium/large feature (>1 file, real behaviour risk)
  - a coverage % is being reported and you need to know whether it MEANS anything
  - deciding what to test (not just measuring what's covered)
  Do NOT apply to:
  - nano / tiny changes (typo, rename) — overhead exceeds value
  - pure docs changes
effort: medium
allowed-tools: Read, Write, Grep, Glob, Bash
paths:
  - "tests/**"
  - "docs/qa-reports/**"
---
# test-strategy

覆盖率只是一个没有方法论支撑的数字。此 Skill 让 QA 计划有据可辩：
测试**什么**、**为什么**选择这组测试，以及证明测试真正有效的**真实**信号。

qa-engineer 会生成 `docs/qa-reports/TEST-STRATEGY-{slug}.md`，记录以下四项
决策；对于中型/大型功能，QA 门禁会检查该文件是否存在。

## 1. 金字塔比例——按原型选择（而非凭惯性）

正确的单元测试:集成测试:e2e 配比取决于风险所在。

| 原型 | 单元测试 | 集成测试 | e2e | 原因 |
|-----------|------|-------------|-----|-----|
| 库 / 开发工具 / cli | 80% | 15% | 5% | 逻辑密集，I/O 接缝较少 |
| Web 应用 / SaaS | 60% | 30% | 10% | 请求→数据库→渲染的接缝占主导 |
| 电商 / 金融科技 / 市场平台 | 50% | 35% | 15% | 资金路径需要跨组件验证 |
| 数据平台 / 流处理 | 45% | 45% | 10% | 正确性存在于流水线中，而非单元中 |
| AI 系统 / Agent 产品 | 50% | 20% | 10% + **评估 20%** | 行为即契约 → 评估集（参见 [[decision-eval]]） |

在 TEST-STRATEGY 中说明所选比例，并为任何偏离提供理由。

## 2. 用例选择——等价类 / 边界 / 属性

不要枚举输入；要对其进行**划分**。
- **等价类**——每类行为选择一个代表（有效、无效、空值、最大值）。测试 5 个有效 id ≠ 测试 5 个类别。
- **边界**——缺陷往往存在于边缘：0、1、n-1、n、n+1、差一错误、空值、溢出、阈值本身。
- **基于属性**——对于纯逻辑/转换逻辑，应针对生成的输入断言不变量（往返 `decode(encode(x))===x`、幂等性、有序性），而不是使用人工挑选的用例。在逻辑适用时使用 fast-check / Hypothesis。

## 3. 变异分数——唯一能够证明测试真正有效的覆盖率

行/分支覆盖率只能证明代码*运行过*，不能证明代码出错时测试会*失败*。
**变异测试**（Stryker / mutmut / cargo-mutants）会翻转运算符/条件，
并检查是否有测试能够捕获它。一个“覆盖率达到 90%”但变异分数只有 30% 的模块，
其测试没有有效断言。目标：变更后的逻辑密集型文件变异分数 ≥ 60%；
当变更以逻辑为主时，在 TEST-STRATEGY 中报告该分数。覆盖率是廉价的
替代指标；变异分数才是真相。

## 4. 不稳定测试隔离——不稳定测试比没有测试更糟

一个近似随机失败的测试会让团队逐渐习惯忽略红灯。策略：
- 非确定性失败的测试应被**隔离**（跳过，并在 Beads 缺陷中跟踪），而不是任由其腐蚀测试信号。
- 隔离必须有时限：对应缺陷要有负责人和截止日期，而不是永远使用 `it.skip`。
- 重新启用前应先找出根本原因（共享状态、时序、真实网络、顺序）。
- 评估运行器也需要遵循同样的纪律（参见
  `tests/eval/runner.mjs` 中的评估 `flaky` 标志——标准差 > 0.1 是不稳定信号）。

## 输出：TEST-STRATEGY-{slug}.md

```
# TEST-STRATEGY-{slug}
- Archetype + chosen pyramid ratio (+ justification for any deviation)
- Equivalence classes & boundaries enumerated per changed unit
- Property-based candidates (which logic, which invariants)
- Mutation-score target + result (for logic-dense changes)
- Quarantine list (flaky tests + their tracking bug)
```

完成标准 = 该计划回答了“为什么是这一组测试”，而不只是“覆盖了多少内容”。