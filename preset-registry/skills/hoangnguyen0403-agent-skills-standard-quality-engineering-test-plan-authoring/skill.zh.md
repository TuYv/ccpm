---
name: quality-engineering-test-plan-authoring
description: Turn acceptance criteria into an executable test plan (scenarios, seed, selector gaps) before generating E2E code. Use when ACs exist but no runnable test plan does yet.
guardrail: true
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

来自已批准 PRD/SRS 的 `AC-*` ID 和 SRS 测试泳道（unit/integration/E2E-web/E2E-mobile/API）。永远不要通过阅读代码来推导场景，因为代码体现的是已有实现，而不是验收标准所要求的内容。

## 输出

`docs/srs/test-plan-[slug].md`（目标仓库初始化 Playwright Test Agents 后，还需生成 `specs/[slug].md`）。每个场景块必须包含：`Steps`、`Expected`、`@AC-n` 标签、`priority`，以及且只能包含一个 `lane`（web|ios|android|api）。每个场景覆盖一个 AC 条件，不要将多个条件合并到一个场景中。

## 种子

`tests/seed.spec.ts`（或平台对应文件）仅包含共享前置条件：身份验证以及导航到起始屏幕。不包含断言。

## 必需章节

`Selector Gaps`（计划所需但目前没有稳定 ID 的元素，将提供给 `specialist-testid-inserter`）和 `Data & Reset`（所需 fixture，以及场景之间如何重置状态）。缺口必须遵循 `quality-engineering-selector-stability` 中定义的 `<screen>-<element>-<role>` 命名约定。

## 场景类别

每个 AC 条件都要扩展为 `P`（正向）、`N`（负向：违反某个已声明条件）和 `E`（边界：某个已声明条件的边界）场景。类别之间必须通过前置条件或输入产生差异，不能只改变措辞。每个 `Expected` 都必须引用其 AC 或业务规则，或者标记为 `ASSUMED`，并在 `Assumed Results` 标题下列出。触发 HALT 条件（AC 过短、没有预期行为、AC 捆绑、存在矛盾、状态未定义）时，停止并提问；在自主模式下返回 `HALT: <trigger>`。

## 与 Zephyr 的关系

手动 Zephyr TC 仍是业务签核的系统记录（`quality-engineering-zephyr-test-generation`）；本技能中的场景在存在对应 TC 时必须携带双向 TC key 引用，并且这些场景是增量补充，而不是替代方案。

## 反模式

- 不包含 `Expected` 结果的场景。
- 从源代码而不是 `AC-*` 推导出的计划。
- 在 E2E 场景中重复单元级覆盖。
- 跨越多个 `lane` 的场景。
- 没有 seed 引用的计划。
- 仅仅改写正向场景的负向场景。
- 无法追溯到 AC 且未标记为 `ASSUMED` 的预期结果。

## 参考资料

- [测试计划模板](references/test-plan-template.md)
- [Playwright Agents 产物](references/playwright-agents-artifacts.md)
- [AC 到场景的映射](references/ac-scenario-mapping.md)
- [移动端泳道矩阵](references/mobile-lane-matrix.md)
- [场景扩展：P/N/E、ASSUMED、HALT](references/scenario-expansion.md)
- [黄金需求 fixture](references/golden-requirements.md)