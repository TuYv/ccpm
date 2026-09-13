---
name: quality-engineering-flaky-triage
description: Quarantines an intermittently failing test behind a ticket with an owner and expiry, assigns a root-cause bucket from isolated reruns, and defines when the test leaves quarantine. Use when a test is a QUARANTINE_CANDIDATE or fails without a code change; not for deterministic failures.
guardrail: true
metadata:
  triggers:
    files:
      - "**/quarantine.json"
      - "**/.flaky-tests*"
    keywords:
      - flaky test
      - flake triage
      - quarantine test
      - intermittent failure
      - unquarantine
      - retry budget
      - passes on rerun
---
# 质量工程：不稳定测试分诊

## **优先级：P0（严重）**

## 进入条件

只有 `QUARANTINE_CANDIDATE` 判定结果才能进入分诊：测试在隔离重跑中间歇性失败，且各次运行之间没有代码变更。确定性失败属于 `REAL_BUG_DO_NOT_HEAL`，应进入 `dev-fix`，绝不能进入此处。

## 隔离合约

- 隔离意味着测试仍会运行、仍会报告结果，并且不会阻塞合并；绝不意味着 `test.skip`。
- 每个被隔离的测试都必须关联一个包含负责人和不超过 14 天到期时间的工单。没有工单，就不能隔离。
- 到期时：修复并取消隔离，或附带书面理由延长一次到期时间，或删除测试并在覆盖率报告中记录覆盖缺口。禁止静默到期。
- 在 `flake_quarantine[]` 中将每条记录为 `{test, ticket, expiry, bucket}`，以便 `test-loop` 在交接信息中携带这些记录。

## 根因分类

`ORDER_DEPENDENCE` · `SHARED_STATE` · `TIMING` · `ENVIRONMENT` · `DATA` · `PRODUCT_NONDETERMINISM`。根据 [根因分类](references/root-cause-buckets.md) 中的证据准确分配一个分类；只有在说明已尝试的重跑方式时，才允许使用 `UNKNOWN`。

## 必需证据

在前台单独连续运行该测试 10 次。记录通过次数、失败运行的构件，以及在全新环境中失败是否会复现。少于 10 次隔离运行不能作为证据；普通 CI 重跑通过也不能作为证据。

## 取消隔离

只有在根因修复后，并且修复后连续 10 次隔离运行均成功，测试才能退出隔离。重试、更长的超时时间或更宽松的匹配器都不是修复；它们只是在掩盖分类。

## 可靠性影响

每个不稳定测试在其根因修复之前，都会计入 `quality-engineering-automation-health` 中的 `suite_reliability_pct`；隔离会将其失败从合并门禁中移除，但不会将其从报告中移除。在 `release_confidence` 旁注明隔离数量和最早的到期时间。

## 红旗

“只需添加重试：3” · “先跳过，之后再处理” · “它在本地能通过” · “再延长一次到期时间”——这些做法都会掩盖分类，而不是为其命名。停下来，执行 10 次隔离重跑，并分配分类。

## 反模式

- **不得使用跳过作为隔离**：被跳过的测试不会报告任何内容；隔离的测试仍会运行并报告。
- **不得进行无工单隔离**：没有负责人和到期时间的隔离，本质上是伪装成其他形式的永久跳过。
- **不得将重试作为修复**：`retries: N` 不是修复；它只会提高通过率，却让分类仍然没有明确。
- **不得因单次成功而取消隔离**：修复后必须连续 10 次隔离运行成功，否则就保持隔离。

## 参考资料

- [隔离工单模板](references/quarantine-ticket-template.md)
- [根因分类](references/root-cause-buckets.md)
- [可靠性计算](references/reliability-math.md)