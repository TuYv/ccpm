---
name: why
description: Iterative Five Whys root cause analysis drilling from symptoms to fundamentals
argument-hint: Optional issue or symptom description
---
# 五问分析法

应用五问根因分析法，通过反复追问“为什么”，从表面症状深入探究根本原因。

## 说明

通过反复追问“为什么”，从表面症状逐步追溯到根本原因。识别系统性问题，而不是寻求权宜之计。

## 用法

`/why [issue_description]`

## 变量

- ISSUE：要分析的问题或症状（默认：提示输入）
- DEPTH：“为什么”的追问次数（默认：5，可根据需要调整）

## 步骤

1. 清晰陈述问题
2. 询问“为什么会发生这种情况？”并记录答案
3. 针对该答案再次追问“为什么？”
4. 持续追问，直到找到根本原因（通常需要 5 次）
5. 通过反向推导进行验证：根本原因 → 症状
6. 如果发现多个原因，则探索不同分支
7. 提出解决根本原因而非表面症状的方案

## 示例

### 示例 1：生产环境缺陷

```
Problem: Users see 500 error on checkout
Why 1: Payment service throws exception
Why 2: Request timeout after 30 seconds
Why 3: Database query takes 45 seconds
Why 4: Missing index on transactions table
Why 5: Index creation wasn't in migration scripts
Root Cause: Migration review process doesn't check query performance

Solution: Add query performance checks to migration PR template
```

### 示例 2：CI/CD 流水线故障

```
Problem: E2E tests fail intermittently
Why 1: Race condition in async test setup
Why 2: Test doesn't wait for database seed completion
Why 3: Seed function doesn't return promise
Why 4: TypeScript didn't catch missing return type
Why 5: strict mode not enabled in test config
Root Cause: Inconsistent TypeScript config between src and tests

Solution: Unify TypeScript config, enable strict mode everywhere
```

### 示例 3：多分支分析

```
Problem: Feature deployment takes 2 hours

Branch A (Build):
Why 1: Docker build takes 90 minutes
Why 2: No layer caching
Why 3: Dependencies reinstalled every time
Why 4: Cache invalidated by timestamp in Dockerfile
Root Cause A: Dockerfile uses current timestamp for versioning

Branch B (Tests):
Why 1: Test suite takes 30 minutes
Why 2: Integration tests run sequentially
Why 3: Test runner config has maxWorkers: 1
Why 4: Previous developer disabled parallelism due to flaky tests
Root Cause B: Flaky tests masked by disabling parallelism

Solutions: 
A) Remove timestamp from Dockerfile, use git SHA
B) Fix flaky tests, re-enable parallel test execution
```

## 注意事项

- 不要停留在表面症状；应持续深入探究系统性问题
- 可能存在多个根本原因——应探索不同分支
- 记录每一次“为什么”，以供日后参考
- 同时考虑技术原因和流程相关原因
- 关键并不在于必须恰好追问 5 次——找到真正的根本原因后即可停止
- 应在触及系统性或流程性问题时停止，而不是停留在技术细节上
- 存在多个根本原因很常见——应分别探索各个分支
- 如果出现“人为错误”，应继续深入追问：为什么这种错误有可能发生？
- 记录每一次“为什么”，以供日后参考
- 根本原因通常涉及：缺少验证、缺少文档、流程不明确或缺少自动化
- 测试解决方案：实施 → 验证症状已解决 → 监控问题是否复发