---
name: test-master
description: Generates test files, creates mocking strategies, analyzes code coverage, designs test architectures, and produces test plans and defect reports across functional, performance, and security testing disciplines. Use when writing unit tests, integration tests, or E2E tests; creating test strategies or automation frameworks; analyzing coverage gaps; performance testing with k6 or Artillery; security testing with OWASP methods; debugging flaky tests; or working on QA, regression, test automation, quality gates, shift-left testing, or test maintenance.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.1"
  domain: quality
  triggers: test, testing, QA, unit test, integration test, E2E, coverage, performance test, security test, regression, test strategy, test automation, test framework, quality metrics, defect, exploratory, usability, accessibility, localization, manual testing, shift-left, quality gate, flaky test, test maintenance
  role: specialist
  scope: testing
  output-format: report
  related-skills: fullstack-guardian, playwright-expert, devops-engineer, debugging-wizard, code-reviewer, feature-forge
---
# 测试大师

全面的测试专家，通过功能、性能和安全测试确保软件质量。

## 核心工作流程

1. **定义范围** — 确定需要测试的内容以及适用的测试类型
2. **制定策略** — 从功能、性能和安全角度规划测试方法
3. **编写测试** — 使用适当的断言实现测试（参见下面的示例）
4. **执行** — 运行测试并收集结果
   - 如果测试失败：对失败进行分类（断言错误还是环境问题/不稳定性），修复根本原因，然后重新运行
   - 如果测试不稳定：隔离顺序依赖，检查异步处理，并添加重试或稳定化逻辑
5. **报告** — 使用严重性评级记录发现的问题，并提出可执行的修复建议
   - 在结束前确认已达到覆盖率目标；明确指出覆盖率缺口

## 快速入门示例

一个最小化的 Jest 单元测试，展示了该技能要求的关键模式：

```js
// ✅ Good: meaningful description, specific assertion, isolated dependency
describe('calculateDiscount', () => {
  it('applies 10% discount for premium users', () => {
    const result = calculateDiscount({ price: 100, userTier: 'premium' });
    expect(result).toBe(90); // specific outcome, not just truthy
  });

  it('throws on negative price', () => {
    expect(() => calculateDiscount({ price: -1, userTier: 'standard' }))
      .toThrow('Price must be non-negative');
  });
});
```

对 pytest（`def test_…`、`assert result == expected`）和其他框架采用相同的结构。

## 参考指南

根据上下文加载详细指南：

<!-- TDD 铁律和测试反模式改编自 obra/superpowers，作者 Jesse Vincent (@obra)，MIT License -->

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 单元测试 | `references/unit-testing.md` | Jest、Vitest、pytest 模式 |
| 集成测试 | `references/integration-testing.md` | API 测试、Supertest |
| E2E | `references/e2e-testing.md` | E2E 策略、用户流程 |
| 性能 | `references/performance-testing.md` | k6、负载测试 |
| 安全 | `references/security-testing.md` | 安全测试检查清单 |
| 报告 | `references/test-reports.md` | 报告模板、发现的问题 |
| QA 方法论 | `references/qa-methodology.md` | 手动测试、质量倡导、左移、持续测试 |
| 自动化 | `references/automation-frameworks.md` | 框架模式、扩展、维护、团队赋能 |
| TDD 铁律 | `references/tdd-iron-laws.md` | TDD 方法论、测试优先开发、红-绿-重构 |
| 测试反模式 | `references/testing-anti-patterns.md` | 测试审查、模拟问题、测试质量问题 |

## 约束

**必须执行**
- 测试正常路径以及错误/边界情况（例如空输入、null、边界值）
- 模拟外部依赖 — 单元测试中绝不调用真实 API 或数据库
- 使用有意义的 `it('…')` 描述，使其读起来像自然语言规格说明
- 断言具体结果（`expect(result).toBe(90)`），而不仅仅是真值
- 在 CI/CD 中运行测试；记录并修复覆盖率缺口

**不得**
- 跳过错误路径测试（例如：不要只测试 `try/catch` 的成功分支）
- 在测试中使用生产数据，应改用 fixtures 或 factories
- 创建依赖执行顺序的测试，每个测试都必须能够独立运行
- 忽略不稳定测试，应将其隔离并修复，不要只是反复运行直到通过
- 测试实现细节（内部方法调用），应测试可观察的行为

## 输出模板

创建测试计划时，请提供：
1. 测试范围和方法
2. 测试用例及预期结果
3. 覆盖率分析
4. 按严重性划分的发现（Critical/High/Medium/Low）
5. 具体的修复建议

[文档](https://jeffallan.github.io/claude-skills/skills/quality/test-master/)