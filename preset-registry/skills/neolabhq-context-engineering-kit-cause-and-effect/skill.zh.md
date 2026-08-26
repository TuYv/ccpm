---
name: cause-and-effect
description: Systematic Fishbone analysis exploring problem causes across six categories
---
# 原因与结果分析

应用鱼骨图（石川图）分析，系统地从多个类别探索问题的所有潜在原因。

## 描述
系统地检查六个类别中的潜在原因：人员、流程、技术、环境、方法和材料。创建结构化的“鱼骨图”视图，识别促成问题的因素。

## 用法
`/cause-and-effect [problem_description]`

## 变量
- PROBLEM：要分析的问题（默认：提示输入）
- CATEGORIES：要探索的类别（默认：全部六个类别）

## 步骤
1. 清晰地陈述问题（鱼头）
2. 针对每个类别，头脑风暴潜在原因：
   - **人员**：技能、培训、沟通、团队协作
   - **流程**：工作流、规程、标准、评审
   - **技术**：工具、基础设施、依赖项、配置
   - **环境**：工作空间、部署目标、外部因素
   - **方法**：方法、模式、架构、实践
   - **材料**：数据、依赖项、第三方服务、资源
3. 针对每个潜在原因，询问“为什么”以进一步深入
4. 识别哪些原因是促成原因，哪些是根本原因
5. 按影响和可能性对原因进行优先级排序
6. 针对优先级最高的原因提出解决方案

## 示例

### 示例 1：API 响应延迟

```
Problem: API responses take 3+ seconds (target: <500ms)

PEOPLE
├─ Team unfamiliar with performance optimization
├─ No one owns performance monitoring
└─ Frontend team doesn't understand backend constraints

PROCESS
├─ No performance testing in CI/CD
├─ No SLA defined for response times
└─ Performance regression not caught in code review

TECHNOLOGY
├─ Database queries not optimized
│  └─ Why: No query analysis tools in place
├─ N+1 queries in ORM
│  └─ Why: Eager loading not configured
├─ No caching layer
│  └─ Why: Redis not in tech stack
└─ Synchronous external API calls
   └─ Why: No async architecture in place

ENVIRONMENT
├─ Production uses smaller database instance than needed
├─ No CDN for static assets
└─ Single region deployment (high latency for distant users)

METHODS
├─ REST API design requires multiple round trips
├─ No pagination on large datasets
└─ Full object serialization instead of selective fields

MATERIALS
├─ Large JSON payloads (unnecessary data)
├─ Uncompressed responses
└─ Third-party API (payment gateway) is slow
   └─ Why: Free tier with rate limiting

ROOT CAUSES:
- No performance requirements defined (Process)
- Missing performance monitoring tooling (Technology)
- Architecture doesn't support caching/async (Methods)

SOLUTIONS (Priority Order):
1. Add database indexes (quick win, high impact)
2. Implement Redis caching layer (medium effort, high impact)
3. Make external API calls async with webhooks (high effort, high impact)
4. Define and monitor performance SLAs (low effort, prevents regression)
```

### 示例 2：不稳定的测试套件

```
Problem: 15% of test runs fail, passing on retry

PEOPLE
├─ Test-writing skills vary across team
├─ New developers copy existing flaky patterns
└─ No one assigned to fix flaky tests

PROCESS
├─ Flaky tests marked as "known issue" and ignored
├─ No policy against merging with flaky tests
└─ Test failures don't block deployments

TECHNOLOGY
├─ Race conditions in async test setup
├─ Tests share global state
├─ Test database not isolated per test
├─ setTimeout used instead of proper waiting
└─ CI environment inconsistent (different CPU/memory)

ENVIRONMENT
├─ CI runner under heavy load
├─ Network timing varies (external API mocks flaky)
└─ Timezone differences between local and CI

METHODS
├─ Integration tests not properly isolated
├─ No retry logic for legitimate timing issues
└─ Tests depend on execution order

MATERIALS
├─ Test data fixtures overlap
├─ Shared test database polluted
└─ Mock data doesn't match production patterns

ROOT CAUSES:
- No test isolation strategy (Methods + Technology)
- Process accepts flaky tests (Process)
- Async timing not handled properly (Technology)

SOLUTIONS:
1. Implement per-test database isolation (high impact)
2. Replace setTimeout with proper async/await patterns (medium impact)
3. Add pre-commit hook blocking flaky test patterns (prevents new issues)
4. Enforce policy: flaky test = block merge (process change)
```

### 示例 3：功能耗时 3 个月，而不是 3 周

```
Problem: Simple CRUD feature took 12 weeks vs. 3 week estimate

PEOPLE
├─ Developer unfamiliar with codebase
├─ Key architect on vacation during critical phase
└─ Designer changed requirements mid-development

PROCESS
├─ Requirements not finalized before starting
├─ No code review for first 6 weeks (large diff)
├─ Multiple rounds of design revision
└─ QA started late (found issues in week 10)

TECHNOLOGY
├─ Codebase has high coupling (change ripple effects)
├─ No automated tests (manual testing slow)
├─ Legacy code required refactoring first
└─ Development environment setup took 2 weeks

ENVIRONMENT
├─ Staging environment broken for 3 weeks
├─ Production data needed for testing (compliance delay)
└─ Dependencies blocked by another team

METHODS
├─ No incremental delivery (big bang approach)
├─ Over-engineering (added future features "while we're at it")
└─ No design doc (discovered issues during implementation)

MATERIALS
├─ Third-party API changed during development
├─ Production data model different than staging
└─ Missing design assets (waited for designer)

ROOT CAUSES:
- No requirements lock-down before start (Process)
- Architecture prevents incremental changes (Technology)
- Big bang approach vs. iterative (Methods)
- Development environment not automated (Technology)

SOLUTIONS:
1. Require design doc + finalized requirements before starting (Process)
2. Implement feature flags for incremental delivery (Methods)
3. Automate dev environment setup (Technology)
4. Refactor high-coupling areas (Technology, long-term)
```

## 注意事项
- 鱼骨图揭示跨领域的系统性问题
- 多个原因往往会结合起来造成问题
- 不要在每个类别中找到第一个原因后就停止——继续深入挖掘
- 有些原因横跨多个类别（请标记出来）
- 根本原因通常存在于流程或方法中（而不只是技术中）
- 与 `/why` 命令结合使用，以深入分析具体原因
- 按以下标准确定解决方案的优先级：影响 × 可行性 ÷ 工作量
- 解决根本原因，而不只是症状