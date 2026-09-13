---
name: quality-engineering-automation-health
description: Measures whether an automation suite builds release confidence via feedback-loop length, suite reliability, release cadence, and production escape rate, and emits a release_confidence verdict. Use when judging suite value, ROI, or pre-release trust; not for writing or healing tests.
metadata:
  triggers:
    keywords:
      - automation health
      - release confidence
      - suite reliability
      - flaky rate
      - feedback loop
      - escape rate
      - automation roi
      - suite value
---
# 质量工程：自动化健康度

## **优先级：P1（高）**

## 使命

自动化的存在是为了减少发布时的不确定性，而不是捕获每一个 bug。发现 bug 是测试的职责；建立信心是自动化的职责。评判一个测试套件的标准，是团队能否在周五下午部署而不感到担忧。

## 三个问题

高价值的测试套件需要用证据回答以下三个问题：

1. **核心工作流是否完好**：那些创造收入和用户价值的流程，是否仍能端到端运行。
2. **是否没有严重回归**：最新变更是否破坏了原本稳定的功能。
3. **反馈是否快速**：开发者能否在几分钟而不是几小时内了解到自己破坏了什么。

## 四项指标

| 指标 | Key | 它回答的问题 |
| --- | --- | --- |
| 反馈周期 | `feedback_loop_minutes` | 从推送到获得可信的通过或失败结果需要多长时间？ |
| 测试套件可靠性 | `suite_reliability_pct` | 当一次运行失败时，团队会进行调查，还是只会重新运行？ |
| 发布频率 | `release_cadence` | 自动化是否让团队能够在不增加生产风险的情况下更频繁地发布？ |
| 生产逃逸率 | `prod_escape_rate` | 有多少严重缺陷通过了整个流水线并到达真实用户？ |

各 CI provider 的公式和数据源位于 [指标定义](references/metrics-definitions.md)。

## 结论

`release_confidence: high | medium | low`

- `high`：三个问题都有证据证明答案为是；可靠性达到或高于团队阈值；逃逸率低于或等于基线；反馈周期在目标范围内。
- `medium`：有一个问题缺少证据，或可靠性或反馈周期未达到目标，但逃逸率仍处于基线水平。
- `low`：任意一个问题的答案为否、一次失败的运行不可信，或逃逸率在上次发布后上升。

使用 [信心报告模板](references/confidence-report-template.md) 进行报告；将 `release_confidence` 传递给 `test-loop`、`uat-signoff` 和 `deploy-release` 交接流程。

## 反模式

- **不要按 bug 数量排名**：一个在 CI 上捕获很少 bug 的测试套件，通常意味着开发者已在本地提前发现了这些 bug；这是成功，而不是浪费。
- **不要删除从未失败的测试**：一个从未失败的测试是安全网，而不是无用负担。正是它让工程师能够重构、升级依赖和修改配置，而不会造成无声破坏。
- **不要把覆盖率百分比作为目标**：覆盖率衡量的是被触及的代码行数，而不是获得的信心。
- **不要把通过率当作健康度**：一个拥有不可信失败结果的 99% 通过率，比团队信任的 95% 通过率更糟糕。

## 红旗信号

“这个测试从来不会失败，删掉它” · “重新运行就行了，可能只是 flaky” · “我们一个 bug 都没发现，所以自动化没有带来收益” · “覆盖率有 90%，我们安全了”。这些说法都把信心问题替换成了虚荣数字；在采取行动前，使用三个问题重新审视。

## 参考资料

- [指标定义](references/metrics-definitions.md)
- [信心报告模板](references/confidence-report-template.md)