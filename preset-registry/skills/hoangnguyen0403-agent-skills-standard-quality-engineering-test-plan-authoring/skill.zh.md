---
name: quality-engineering-test-plan-authoring
description: Turn acceptance criteria into an executable test plan (scenarios, seed, selector gaps) before generating E2E code. Use when ACs exist but no runnable test plan does yet.
metadata:
  triggers:
    files:
      - "specs/**/*.md"
      - "tests/seed.spec.*"
    keywords:
      - test plan
      - executable test plan
      - seed spec
      - scenario matrix
      - ac to scenario
      - planner
---
# 质量工程：测试计划编写

## **优先级：P1（高）**

## 输入

来自已批准的 PRD/SRS 的 `AC-*` ID 和 SRS 泳道（unit/integration/E2E-web/E2E-mobile/API）。绝不通过阅读代码来推导场景——代码展示的是当前存在的实现，而非验收标准的要求。

## 输出

`docs/srs/test-plan-[slug].md`（以及在目标仓库上初始化 Playwright Test Agents 之后的 `specs/[slug].md`）。每个场景块包含：`Steps`、`Expected`、`@AC-n` 标签、`priority`，以及恰好一个 `lane`（web|ios|android|api）。一个场景只覆盖一个 AC 条件——不要将多个条件合并进一个场景。

## 种子

`tests/seed.spec.ts`（或各平台等价文件）仅承载共享的前置条件：认证以及导航到起始屏幕。不包含任何断言。

## 必需章节

`Selector Gaps`（计划所需但尚无稳定 id 的元素——供 `specialist-testid-inserter` 使用，P1 阶段，尚未实现）和 `Data & Reset`（所需的 fixtures、场景之间状态如何重置）。Gap 必须遵循 `quality-engineering-selector-stability` 中定义的 `<screen>-<element>-<role>` 命名规范。

## 与 Zephyr 的关系

手动编写的 Zephyr TC 仍然是业务签核的权威记录系统（`quality-engineering-zephyr-test-generation`）；本技能的场景在已有 TC-key 的情况下会携带双向的 TC-key 引用，它们是补充性的，而非替代品。

## 反模式

- 缺少 `Expected` 结果的场景。
- 从源代码而非 `AC-*` 推导出的计划。
- 在 E2E 场景中重复单元级覆盖。
- 跨越多个 `lane` 的场景。
- 未引用种子（seed）的计划。

## 参考资料

- [测试计划模板](references/test-plan-template.md)
- [Playwright Agents 产物](references/playwright-agents-artifacts.md)
- [AC 到场景的映射](references/ac-scenario-mapping.md)
- [移动端泳道矩阵](references/mobile-lane-matrix.md)
