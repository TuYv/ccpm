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
# 质量工程：测试修复（Test Healing）

## **优先级：P0（关键）**

## 失败类别

`SELECTOR_DRIFT`（id/定位器变更） · `TIMING_SYNC`（竞态/等待问题，无状态变化） · `DATA_ENV`（fixture/种子数据/环境过期） · `INFRA`（网络/执行器/偶发抖动） · `REAL_REGRESSION`（产品行为确实发生了变化）。

依据证据进行分类：trace/截图/DOM diff 支持漂移/时序/数据方面的解释，或产品 diff 表明存在有意的行为变更（REAL_REGRESSION）。

## 允许的修复

将定位器沿选择器阶梯上移（例如，ID 变更时改用 `getByRole`）；用显式状态等待替换 sleep；修复过期的 fixture/种子数据；仅针对 `INFRA` 才进行重试。

## 禁止的修复

绝不削弱断言。绝不在没有工单 + 期限的情况下添加 `test.skip`/`fixme`；缺少这些就绝不跳过。绝不放宽匹配器。绝不让超时膨胀超过 2 倍。绝不盲目执行 `--update-snapshots`。绝不捕获异常后继续执行。绝不修改生产代码——那属于 `REAL_REGRESSION`，不是修复。

## 判定结论

`HEALED`（修复经 3 次连续重跑全绿验证，ASSERTION_DELTA：无） · `REAL_BUG_DO_NOT_HEAL`（转交开发修复） · `QUARANTINE_CANDIDATE`（偶发抖动，转交抖动分类处理） · `BLOCKED`（无证据产物）。

## 危险信号

“这个断言本来就太严格了” · “产品变了所以更新预期值吧” · “加点重试让它变绿就行”——不要基于这些说辞进行修复。这三者要么是 `REAL_BUG_DO_NOT_HEAL`，要么是 `QUARANTINE_CANDIDATE` 的伪装，绝不可能是 `HEALED`。

## 参考资料

- [失败分类信号](references/failure-taxonomy.md)
- [修复目录](references/repair-catalog.md)
- [禁止的修复](references/forbidden-repairs.md)
- [判定契约](references/verdict-contract.md)
