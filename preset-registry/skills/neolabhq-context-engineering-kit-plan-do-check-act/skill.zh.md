---
name: plan-do-check-act
description: Iterative PDCA cycle for systematic experimentation and continuous improvement
---
# 计划-执行-检查-处理（PDCA）

应用 PDCA 循环，通过迭代式问题解决和流程优化实现持续改进。

## 描述

四阶段迭代循环：计划（识别和分析）、执行（实施变更）、检查（衡量结果）、处理（标准化或调整）。支持系统化的实验与改进。

## 用法

`/plan-do-check-act [improvement_goal]`

## 变量

- GOAL：要改进的目标或要解决的问题（默认：提示输入）
- CYCLE_NUMBER：PDCA 迭代次数（默认：1）

## 步骤

### 阶段 1：计划（PLAN）

1. 定义问题或改进目标
2. 分析当前状态（基线指标）
3. 识别根本原因（使用 `/why` 或 `/cause-and-effect`）
4. 制定假设：“如果我们改变 X，Y 就会改善”
5. 设计实验：要改变什么、如何衡量成功
6. 设定成功标准（可衡量的目标）

### 阶段 2：执行（DO）

1. 实施计划中的变更（先从小规模开始）
2. 记录实际完成的工作
3. 记录与计划的任何偏差
4. 在实施过程中持续收集数据
5. 记录意外观察结果

### 阶段 3：检查（CHECK）

1. 根据成功标准衡量结果
2. 与基线进行比较（变更前与变更后）
3. 分析数据：假设是否成立？
4. 识别哪些措施有效、哪些无效
5. 记录经验与洞察

### 阶段 4：处理（ACT）

1. **如果成功**：将变更标准化
   - 更新文档
   - 培训团队
   - 创建清单/自动化
   - 监控回归问题
2. **如果不成功**：吸取经验并进行调整
   - 了解失败原因
   - 完善假设
   - 使用调整后的计划开始新的 PDCA 循环
3. **如果部分成功**：
   - 将有效部分标准化
   - 针对剩余问题规划下一轮循环

## 示例

### 示例 1：缩短构建时间

```
CYCLE 1
───────
PLAN:
  Problem: Docker build takes 45 minutes
  Current State: Full rebuild every time, no layer caching
  Root Cause: Package manager cache not preserved between builds
  Hypothesis: Caching dependencies will reduce build to <10 minutes
  Change: Add layer caching for package.json + node_modules
  Success Criteria: Build time <10 minutes on unchanged dependencies

DO:
  - Restructured Dockerfile: COPY package*.json before src files
  - Added .dockerignore for node_modules
  - Configured CI cache for Docker layers
  - Tested on 3 builds

CHECK:
  Results:
    - Unchanged dependencies: 8 minutes ✓ (was 45)
    - Changed dependencies: 12 minutes (was 45)
    - Fresh builds: 45 minutes (same, expected)
  Analysis: 82% reduction on cached builds, hypothesis confirmed

ACT:
  Standardize:
    ✓ Merged Dockerfile changes
    ✓ Updated CI pipeline config
    ✓ Documented in README
    ✓ Added build time monitoring
  
  New Problem: 12 minutes still slow when deps change
  → Start CYCLE 2


CYCLE 2
───────
PLAN:
  Problem: Build still 12 min when dependencies change
  Current State: npm install rebuilds all packages
  Root Cause: Some packages compile from source
  Hypothesis: Pre-built binaries will reduce to <5 minutes
  Change: Use npm ci instead of install, configure binary mirrors
  Success Criteria: Build <5 minutes on dependency changes

DO:
  - Changed to npm ci (uses package-lock.json)
  - Added .npmrc with binary mirror configs
  - Tested across 5 dependency updates

CHECK:
  Results:
    - Dependency changes: 4.5 minutes ✓ (was 12)
    - Compilation errors reduced to 0 (was 3)
  Analysis: npm ci faster + more reliable, hypothesis confirmed

ACT:
  Standardize:
    ✓ Use npm ci everywhere (local + CI)
    ✓ Committed .npmrc
    ✓ Updated developer onboarding docs
  
  Total improvement: 45min → 4.5min (90% reduction)
  ✓ PDCA complete, monitor for 2 weeks
```

### 示例 2：减少生产环境 Bug

```
CYCLE 1
───────
PLAN:
  Problem: 8 production bugs per month
  Current State: Manual testing only, no automated tests
  Root Cause: Regressions not caught before release
  Hypothesis: Adding integration tests will reduce bugs by 50%
  Change: Implement integration test suite for critical paths
  Success Criteria: <4 bugs per month after 1 month

DO:
  Week 1-2: Wrote integration tests for:
    - User authentication flow
    - Payment processing
    - Data export
  Week 3: Set up CI to run tests
  Week 4: Team training on test writing
  Coverage: 3 critical paths (was 0)

CHECK:
  Results after 1 month:
    - Production bugs: 6 (was 8)
    - Bugs caught in CI: 4
    - Test failures (false positives): 2
  Analysis: 25% reduction, not 50% target
  Insight: Bugs are in areas without tests yet

ACT:
  Partially successful:
    ✓ Keep existing tests (prevented 4 bugs)
    ✓ Fix flaky tests
  
  Adjust for CYCLE 2:
    - Expand test coverage to all user flows
    - Add tests for bug-prone areas
    → Start CYCLE 2


CYCLE 2
───────
PLAN:
  Problem: Still 6 bugs/month, need <4
  Current State: 3 critical paths tested, 12 paths total
  Root Cause: UI interaction bugs not covered by integration tests
  Hypothesis: E2E tests for all user flows will reach <4 bugs
  Change: Add E2E tests for remaining 9 flows
  Success Criteria: <4 bugs per month, 80% coverage

DO:
  Week 1-3: Added E2E tests for all user flows
  Week 4: Set up visual regression testing
  Coverage: 12/12 user flows (was 3/12)

CHECK:
  Results after 1 month:
    - Production bugs: 3 ✓ (was 6)
    - Bugs caught in CI: 8 (was 4)
    - Test maintenance time: 3 hours/week
  Analysis: Target achieved! 62% reduction from baseline

ACT:
  Standardize:
    ✓ Made tests required for all PRs
    ✓ Added test checklist to PR template
    ✓ Scheduled weekly test review
    ✓ Created runbook for test maintenance
  
  Monitor: Track bug rate and test effectiveness monthly
  ✓ PDCA complete
```

### 示例 3：提高代码审查速度

```
PLAN:
  Problem: PRs take 3 days average to merge
  Current State: Manual review, no automation
  Root Cause: Reviewers wait to see if CI passes before reviewing
  Hypothesis: Auto-review + faster CI will reduce to <1 day
  Change: Add automated checks + split long CI jobs
  Success Criteria: Average time to merge <1 day (8 hours)

DO:
  - Set up automated linter checks (fail fast)
  - Split test suite into parallel jobs
  - Added PR template with self-review checklist
  - CI time: 45min → 15min
  - Tracked PR merge time for 2 weeks

CHECK:
  Results:
    - Average time to merge: 1.5 days (was 3)
    - Time waiting for CI: 15min (was 45min)
    - Time waiting for review: 1.3 days (was 2+ days)
  Analysis: CI faster, but review still bottleneck

ACT:
  Partially successful:
    ✓ Keep fast CI improvements
  
  Insight: Real bottleneck is reviewer availability, not CI
  Adjust for new PDCA:
    - Focus on reviewer availability/notification
    - Consider rotating review assignments
  → Start new PDCA cycle with different hypothesis
```

## 注意事项

- 从小而可衡量的改动开始（不要进行大规模改造）
- PDCA 是迭代式的——进行多个周期很正常
- 失败的实验也是学习机会
- 记录所有内容：这样更容易发现不同周期之间的模式
- 成功标准必须是可衡量的（而不是主观的）
- 第 4 阶段“Act”决定进入下一个周期还是完成改进
- 如果 3 个周期后仍然陷入困境，请重新审视根因分析
- PDCA 适用于技术改进和流程改进
- 使用 `/analyse-problem`（A3）进行完整的文档记录