---
name: quality-engineering-test-healing
description: Failure taxonomy and allowed/forbidden repairs for a failing E2E test. Use when a Playwright/Maestro/Detox/XCUITest/Espresso/Appium test fails and you must decide whether to repair the test or route to a real bug.
metadata:
  triggers:
    files:
      - "test-results/**"
      - "playwright-report/**"
    keywords:
      - heal test
      - failing e2e
      - selector repair
      - test healer
      - fix the test
      - timed out waiting for
---
# 质量工程：测试自愈

## **优先级：P0（严重）**

## 失败类别

`SELECTOR_DRIFT`（ID/定位器发生变化） · `TIMING_SYNC`（竞态/等待问题，无状态变化） · `DATA_ENV`（fixture/seed/env 过时） · `INFRA`（网络/运行器/不稳定因素） · `REAL_REGRESSION`（产品行为实际发生变化）。

根据证据进行分类：trace/截图/DOM diff 支持漂移/时序/数据解释，或产品 diff 显示行为发生了有意变更（REAL_REGRESSION）。

## 允许的修复

沿选择器阶梯向上移动定位器（例如 ID 发生变化时使用 `getByRole`）；将 sleep 替换为显式状态等待；修复过时的 fixture/seed；仅针对 `INFRA` 进行重试。

## 禁止的修复

绝不得弱化断言。绝不得添加 `test.skip`/`fixme`；必须停止阻断的测试应根据 `quality-engineering-flaky-triage` 转入隔离，并附带 ticket + expiry，且继续运行。绝不得扩大 matcher 范围。超时不得增加超过原值的 2 倍。绝不得盲目使用 `--update-snapshots`。绝不得捕获错误后继续执行。绝不得修改生产代码——这属于 `REAL_REGRESSION`，而不是自愈。

## 判定

`HEALED`（修复经连续 3 次成功重跑验证，ASSERTION_DELTA：无） · `REAL_BUG_DO_NOT_HEAL`（转交开发修复） · `QUARANTINE_CANDIDATE`（不稳定，转交 flaky-triage） · `BLOCKED`（没有证据工件，或没有稳定的定位器目标：转交 `specialist-testid-inserter`）。

## 红旗信号

“反正这个断言本来就太严格了” · “产品变了，所以更新预期值” · “直接加重试让它通过”——不要用这些理由进行自愈。三者都伪装成 `REAL_BUG_DO_NOT_HEAL` 或 `QUARANTINE_CANDIDATE`，绝不能判定为 `HEALED`。

## 参考资料

- [失败分类信号](references/failure-taxonomy.md)
- [修复目录](references/repair-catalog.md)
- [禁止的修复](references/forbidden-repairs.md)
- [判定契约](references/verdict-contract.md)
- [不稳定测试分类处理](../quality-engineering-flaky-triage/SKILL.md) — `QUARANTINE_CANDIDATE` 的隔离契约
- [视觉基线](../quality-engineering-visual-baseline/SKILL.md) — 在判定 `REAL_REGRESSION` 之前处理截图失败