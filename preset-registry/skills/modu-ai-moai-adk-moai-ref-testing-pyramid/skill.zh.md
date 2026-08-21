---
name: moai-ref-testing-pyramid
description: >
  Test pyramid strategy, coverage targets, test patterns, and quality metrics
  reference. Agent-extending skill that amplifies manager-develop test-creation and
  quality-validation work with production-grade testing patterns.
  NOT for: production code implementation, architecture design, DevOps, security audits.

when_to_use: >
  Use for test-pyramid strategy reference: coverage targets,
  unit/integration/e2e test patterns, and quality metrics. Amplifies
  manager-develop test-creation and quality-validation work with
  production-grade testing patterns.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-03-30"
  tags: "testing, pyramid, coverage, tdd, patterns, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# 测试金字塔参考

## 目标智能体

- `manager-develop` - 主要：在创建测试和分析覆盖率时应用相关模式
- `manager-develop` - 次要：在红-绿-重构循环期间应用相关模式

## 测试金字塔比例

```
       /  E2E  \        10% — Critical user journeys only
      /----------\
     / Integration \    20% — API endpoints, DB queries, service boundaries
    /----------------\
   /    Unit Tests    \  70% — Functions, hooks, utilities, pure logic
  /--------------------\
```

| 层级 | 速度 | 可靠性 | 维护成本 | 覆盖率目标 |
|-------|-------|-------------|-------------|-----------------|
| 单元测试 | 快（<100ms） | 高 | 低 | 占测试总数的 70% |
| 集成测试 | 中等（1-5s） | 中等 | 中等 | 占测试总数的 20% |
| E2E | 慢（10-60s） | 较低 | 高 | 占测试总数的 10% |

## 不同场景下的覆盖率目标

| 场景 | 目标 | 理由 |
|---------|--------|-----------|
| 关键业务逻辑 | 95%+ | 影响营收/安全 |
| API 端点 | 90%+ | 确保契约合规 |
| 工具函数 | 85%+ | 确保复用可靠性 |
| UI 组件 | 80%+ | 确保渲染正确性 |
| 配置/胶水代码 | 60%+ | 复杂度低 |
| 生成的代码 | 0% | 不要测试生成的代码 |

## 测试模式：AAA（准备-执行-断言）

```
// Arrange: Set up test data and preconditions
input := CreateTestUser("test@example.com")

// Act: Execute the function under test
result, err := service.CreateUser(ctx, input)

// Assert: Verify the outcome
assert.NoError(t, err)
assert.Equal(t, "test@example.com", result.Email)
```

## 单元测试模式

| 模式 | 适用场景 | 示例 |
|---------|------|---------|
| 表驱动 | 多种输入/输出组合 | Go：`tests := []struct{...}` |
| Mock/Stub | 外部依赖（数据库、API） | 接口注入、Mock 框架 |
| 快照 | 复杂输出比较 | Jest 快照、黄金文件 |
| 基于属性 | 数学属性 | quickcheck、hypothesis |
| 边界值 | 边界情况 | 0、-1、MAX_INT、空字符串、nil |

## 集成测试模式

| 模式 | 适用场景 | 示例 |
|---------|------|---------|
| Testcontainers | 需要真实数据库 | 基于 Docker 的 PostgreSQL 测试环境 |
| HTTP 测试服务器 | API 端点测试 | httptest.NewServer（Go）、supertest（Node） |
| 内存数据库 | 快速数据库测试 | 用于开发的 SQLite |
| 加载夹具 | 一致的测试数据 | 工厂函数、种子文件 |

## 应该测试什么与不应该测试什么

### 始终测试
- 业务逻辑和计算
- 输入验证和错误处理
- 身份验证和授权流程
- 数据转换和映射
- 边界情况和边界条件
- 竞态条件（在 Go 中使用 `-race` 标志）

### 绝不测试
- 框架内部机制（React 渲染、Express 路由）
- 第三方库行为
- 不含逻辑的简单 getter/setter
- 直接测试私有方法（应通过公共 API 进行测试）
- 生成的代码（protobuf、swagger）
- CSS 样式和布局（改用视觉回归工具）

## 测试质量指标

| 指标 | 目标 | 工具 |
|--------|--------|------|
| 行覆盖率 | 85%+ | go test -cover, istanbul, coverage.py |
| 分支覆盖率 | 75%+ | go test -covermode=count |
| 变异测试得分 | 70%+ | go-mutesting, Stryker |
| 测试执行时间 | <2 分钟（单元测试），<10 分钟（全部测试） | CI 计时器 |
| 不稳定测试率 | <1% | CI 历史分析 |

## 测试文件约定

| 语言 | 测试文件 | 位置 |
|----------|-----------|----------|
| Go | `*_test.go` | 同一包 |
| TypeScript | `*.test.ts` / `*.spec.ts` | `__tests__/` 或与源文件位于同一位置 |
| Python | `test_*.py` | `tests/` 目录 |
| Java | `*Test.java` | `src/test/` 镜像目录 |
| Rust | `#[cfg(test)] mod tests` | 同一文件或 `tests/` |

## TDD RED-GREEN-REFACTOR 快速参考

```
RED:     Write a failing test that defines expected behavior
GREEN:   Write minimal code to make the test pass
REFACTOR: Clean up while keeping tests green
```

规则：
- 如果没有失败的测试，绝不编写生产代码
- 编写能够失败的最小测试
- 编写能够通过测试的最简单代码
- 仅在所有测试均为绿色时进行重构
- 每个测试只包含一个断言（在可行的情况下）

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “E2E 测试覆盖了一切，单元测试是多余的” | E2E 测试速度慢且不稳定。单元测试能够提供快速、精确的反馈。测试金字塔之所以存在，是因为每一层都有不同的用途。 |
| “集成测试比单元测试更贴近真实情况” | 真实性是以速度和隔离性为代价的。均衡的测试金字塔既能提供快速反馈，也能实现贴近真实情况的验证。 |
| “100% 的代码覆盖率意味着代码得到了充分测试” | 覆盖率衡量的是代码是否执行，而非代码是否正确。如果测试只是执行代码，却没有有意义的断言，那么它毫无价值。 |
| “模拟是不好的，我更喜欢真实依赖” | 真实依赖会使测试变慢且具有不确定性。在边界处进行模拟，并以隔离方式测试业务逻辑。 |
| “这个测试不稳定，但有时确实能发现真正的缺陷” | 不稳定测试会削弱对整个测试套件的信任。修复其不稳定性，或将该测试隔离并创建跟踪问题。 |

**DAMP 优于 DRY**：测试代码应当具有描述性且自包含。读者无需阅读共享夹具或辅助方法，就应该能够理解测试。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 测试金字塔倒置：E2E 测试多于单元测试
- 单元测试依赖外部服务（数据库、API、文件系统）
- 测试断言检查实现细节而非行为
- 单元测试层与 E2E 测试层之间没有集成测试
- 存在未添加隔离标签或跟踪问题的不稳定测试

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 测试分布遵循金字塔结构：单元测试 > 集成测试 > E2E 测试（显示每个类别的测试数量）
- [ ] 所有单元测试的总运行时间不超过 30 秒
- [ ] 集成测试在边界处模拟外部依赖
- [ ] 活跃测试套件中没有不稳定测试（运行 3 次以验证稳定性）
- [ ] 测试名称描述行为而非实现（审查命名约定）
- [ ] 覆盖率报告体现有意义的断言，而不只是代码行执行情况

<!-- moai:evolvable-end -->