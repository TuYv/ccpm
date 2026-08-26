---
name: analyse
description: Auto-selects best Kaizen method (Gemba Walk, Value Stream, or Muda) for target
---
# 智能分析

根据分析对象，智能选择并应用最合适的 Kaizen 分析技术。

## 描述
分析上下文并选择最佳方法：Gemba Walk（现场走访，用于代码探索）、Value Stream Mapping（价值流图，用于工作流/流程）或 Muda Analysis（浪费分析，用于识别浪费）。引导你完成所选技术的分析。

## 用法
`/analyse [target_description]`

示例：
- `/analyse authentication implementation`
- `/analyse deployment workflow`
- `/analyse codebase for inefficiencies`

## 变量
- TARGET：要分析的对象（默认：提示输入）
- METHOD：覆盖自动选择（gemba、vsm、muda）

## 方法选择逻辑

**Gemba Walk** → 分析以下内容时使用：
- 代码实现（功能实际如何工作）
- 文档与实际情况之间的差距
- 理解陌生代码库区域
- 实际架构与假定架构的差异

**Value Stream Mapping** → 分析以下内容时使用：
- 工作流和流程（CI/CD、部署、开发）
- 多阶段流水线中的瓶颈
- 团队/系统之间的交接
- 每个流程阶段所花费的时间

**Muda（浪费分析）** → 分析以下内容时使用：
- 代码质量和效率
- 技术债务
- 过度设计或重复
- 资源利用率

## 步骤
1. 理解要分析的内容
2. 确定最佳方法（或使用指定的方法）
3. 解释为什么该方法适用
4. 引导完成分析
5. 展示包含可执行洞察的分析结果

---

## 方法 1：Gemba Walk

“亲自去看”实际代码，以理解现实情况与假设之间的差异。

### 使用时机
- 理解功能实际如何工作
- 代码考古（遗留系统）
- 找出文档与实现之间的差距
- 在进行修改前探索陌生区域

### 流程
1. **定义范围**：要探索的代码区域
2. **陈述假设**：你认为它的工作方式
3. **观察现实**：阅读实际代码
4. **记录发现**：
   - 入口点
   - 实际数据流
   - 意外情况（与假设不同之处）
   - 隐藏依赖
   - 未记录的行为
5. **识别差距**：文档与现实之间的差异
6. **提出建议**：更新文档、重构或接受现状

### 示例：身份验证系统 Gemba Walk

```
SCOPE: User authentication flow

ASSUMPTIONS (Before):
• JWT tokens stored in localStorage
• Single sign-on via OAuth only
• Session expires after 1 hour
• Password reset via email link

GEMBA OBSERVATIONS (Actual Code):

Entry Point: /api/auth/login (routes/auth.ts:45)
├─> AuthService.authenticate() (services/auth.ts:120)
├─> UserRepository.findByEmail() (db/users.ts:67)
├─> bcrypt.compare() (services/auth.ts:145)
└─> TokenService.generate() (services/token.ts:34)

Actual Flow:
1. Login credentials → POST /api/auth/login
2. Password hashed with bcrypt (10 rounds)
3. JWT generated with 24hr expiry (NOT 1 hour!)
4. Token stored in httpOnly cookie (NOT localStorage)
5. Refresh token in separate cookie (15 days)
6. Session data in Redis (30 days TTL)

SURPRISES:
✗ OAuth not implemented (commented out code found)
✗ Password reset is manual (admin intervention)
✗ Three different session storage mechanisms:
  - Redis for session data
  - Database for "remember me"
  - Cookies for tokens
✗ Legacy endpoint /auth/legacy still active (no auth!)
✗ Admin users bypass rate limiting (security issue)

GAPS:
• Documentation says OAuth, code doesn't have it
• Session expiry inconsistent (docs: 1hr, code: 24hr)
• Legacy endpoint not documented (security risk)
• No mention of "remember me" in docs

RECOMMENDATIONS:
1. HIGH: Secure or remove /auth/legacy endpoint
2. HIGH: Document actual session expiry (24hr)
3. MEDIUM: Clean up or implement OAuth
4. MEDIUM: Consolidate session storage (choose one)
5. LOW: Add rate limiting for admin users
```

### 示例：CI/CD 流水线现地现物观察

```
SCOPE: Build and deployment pipeline

ASSUMPTIONS:
• Automated tests run on every commit
• Deploy to staging automatic
• Production deploy requires approval

GEMBA OBSERVATIONS:

Actual Pipeline (.github/workflows/main.yml):
1. On push to main:
   ├─> Lint (2 min)
   ├─> Unit tests (5 min) [SKIPPED if "[skip-tests]" in commit]
   ├─> Build Docker image (15 min)
   └─> Deploy to staging (3 min)

2. Manual trigger for production:
   ├─> Run integration tests (20 min) [ONLY for production!]
   ├─> Security scan (10 min)
   └─> Deploy to production (5 min)

SURPRISES:
✗ Unit tests can be skipped with commit message flag
✗ Integration tests ONLY run for production deploy
✗ Staging deployed without integration tests
✗ No rollback mechanism (manual kubectl commands)
✗ Secrets loaded from .env file (not secrets manager)
✗ Old "hotfix" branch bypasses all checks

GAPS:
• Staging and production have different test coverage
• Documentation doesn't mention test skip flag
• Rollback process not documented or automated
• Security scan results not enforced (warning only)

RECOMMENDATIONS:
1. CRITICAL: Remove test skip flag capability
2. CRITICAL: Migrate secrets to secrets manager
3. HIGH: Run integration tests on staging too
4. HIGH: Delete or secure hotfix branch
5. MEDIUM: Add automated rollback capability
6. MEDIUM: Make security scan blocking
```

---

## 方法 2：价值流图

绘制工作流阶段，衡量时间/浪费，识别瓶颈。

### 使用时机
- 流程优化（CI/CD、部署、代码审查）
- 理解多阶段工作流
- 查找延迟和交接
- 改善周期时间

### 流程
1. **确定起点和终点**：流程从哪里开始、在哪里结束
2. **绘制所有步骤**：包括等待/交接时间
3. **衡量每个步骤**：
   - 处理时间（实际开展工作的时间）
   - 等待时间（空闲、受阻）
   - 由谁/什么执行该步骤
4. **计算指标**：
   - 总交付周期
   - 增值时间与浪费时间
   - 效率百分比（增值时间 / 总时间）
5. **识别瓶颈**：耗时最长的步骤、等待最多的环节
6. **设计未来状态**：优化后的流程
7. **规划改进措施**：如何实现未来状态

### 示例：功能开发价值流图

```
CURRENT STATE: Feature request → Production

Step 1: Requirements Gathering
├─ Processing: 2 days (meetings, writing spec)
├─ Waiting: 3 days (stakeholder review)
└─ Owner: Product Manager

Step 2: Design
├─ Processing: 1 day (mockups, architecture)
├─ Waiting: 2 days (design review, feedback)
└─ Owner: Designer + Architect

Step 3: Development
├─ Processing: 5 days (coding)
├─ Waiting: 2 days (PR review queue)
└─ Owner: Developer

Step 4: Code Review
├─ Processing: 0.5 days (review)
├─ Waiting: 1 day (back-and-forth changes)
└─ Owner: Senior Developer

Step 5: QA Testing
├─ Processing: 2 days (manual testing)
├─ Waiting: 1 day (bug fixes, retest)
└─ Owner: QA Engineer

Step 6: Staging Deployment
├─ Processing: 0.5 days (deploy, smoke test)
├─ Waiting: 2 days (stakeholder UAT)
└─ Owner: DevOps

Step 7: Production Deployment
├─ Processing: 0.5 days (deploy, monitor)
├─ Waiting: 0 days
└─ Owner: DevOps

───────────────────────────────────────
METRICS:
Total Lead Time: 22.5 days
Value-Add Time: 11.5 days (work)
Waste Time: 11 days (waiting)
Efficiency: 51%

BOTTLENECKS:
1. Requirements review wait (3 days)
2. Development time (5 days)
3. Stakeholder UAT wait (2 days)
4. PR review queue (2 days)

WASTE ANALYSIS:
• Waiting for reviews/approvals: 9 days (82% of waste)
• Rework due to unclear requirements: ~1 day
• Manual testing time: 2 days

FUTURE STATE DESIGN:

Changes:
1. Async requirements approval (stakeholders have 24hr SLA)
2. Split large features into smaller increments
3. Automated testing replaces manual QA
4. PR review SLA: 4 hours max
5. Continuous deployment to staging (no approval)
6. Feature flags for production rollout (no wait)

Projected Future State:
Total Lead Time: 9 days (60% reduction)
Value-Add Time: 8 days
Waste Time: 1 day
Efficiency: 89%

IMPLEMENTATION PLAN:
Week 1: Set review SLAs, add feature flags
Week 2: Automate test suite
Week 3: Enable continuous staging deployment
Week 4: Train team on incremental delivery
```

### 示例：事件响应价值流图

```
CURRENT STATE: Incident detected → Resolution

Step 1: Detection
├─ Processing: 0 min (automated alert)
├─ Waiting: 15 min (until someone sees alert)
└─ System: Monitoring tool

Step 2: Triage
├─ Processing: 10 min (assess severity)
├─ Waiting: 20 min (find right person)
└─ Owner: On-call engineer

Step 3: Investigation
├─ Processing: 45 min (logs, debugging)
├─ Waiting: 30 min (access to production, gather context)
└─ Owner: Engineer + SRE

Step 4: Fix Development
├─ Processing: 60 min (write fix)
├─ Waiting: 15 min (code review)
└─ Owner: Engineer

Step 5: Deployment
├─ Processing: 10 min (hotfix deploy)
├─ Waiting: 5 min (verification)
└─ Owner: SRE

Step 6: Post-Incident
├─ Processing: 20 min (update status, notify)
├─ Waiting: 0 min
└─ Owner: Engineer

───────────────────────────────────────
METRICS:
Total Lead Time: 230 min (3h 50min)
Value-Add Time: 145 min
Waste Time: 85 min (37%)

BOTTLENECKS:
1. Finding right person (20 min)
2. Gaining production access (30 min)
3. Investigation time (45 min)

IMPROVEMENTS:
1. Slack integration for alerts (reduce detection wait)
2. Auto-assign by service owner (no hunt for person)
3. Pre-approved prod access for on-call (reduce wait)
4. Runbooks for common incidents (faster investigation)
5. Automated rollback for deployment incidents

Projected improvement: 230min → 120min (48% faster)
```

---

## 方法 3：Muda（浪费分析）

识别代码和开发流程中的七种浪费。

### 使用时机
- 代码质量审计
- 技术债务评估
- 流程效率改进
- 识别过度工程

### 7 种浪费（应用于软件）

**1. 过量生产**：构建超出需求的内容
- 没有人使用的功能
- 过于复杂的解决方案
- 过早优化
- 不必要的抽象

**2. 等待**：空闲时间
- 构建/测试/部署时间
- 代码审查延迟
- 等待依赖项
- 被其他团队阻塞

**3. 搬运**：移动事物
- 不必要的数据转换
- 没有增加价值的 API 层
- 在系统之间复制数据
- 重复序列化/反序列化

**4. 过度处理**：做超出必要范围的工作
- 过度日志记录
- 冗余验证
- 过度规范化的数据库
- 不必要的计算

**5. 库存**：进行中的工作
- 未合并的分支
- 进行到一半的功能
- 尚未分类的 Bug
- 尚未部署的代码

**6. 动作**：不必要的移动
- 上下文切换
- 没有目的的会议
- 手动部署
- 重复性任务

**7. 缺陷**：返工和 Bug
- 生产环境 Bug
- 技术债务
- 不稳定的测试
- 未完成的功能

### 流程
1. **定义范围**：代码库区域或流程
2. **检查每一种浪费类型**
3. **量化影响**（时间、复杂度、成本）
4. **按影响排序**
5. **提出消除策略**

### 示例：API 代码库浪费分析

```
SCOPE: REST API backend (50K LOC)

1. OVERPRODUCTION
   Found:
   • 15 API endpoints with zero usage (last 90 days)
   • Generic "framework" built for "future flexibility" (unused)
   • Premature microservices split (2 services, could be 1)
   • Feature flags for 12 features (10 fully rolled out, flags kept)
   
   Impact: 8K LOC maintained for no reason
   Recommendation: Delete unused endpoints, remove stale flags

2. WAITING
   Found:
   • CI pipeline: 45 min (slow Docker builds)
   • PR review time: avg 2 days
   • Deployment to staging: manual, takes 1 hour
   
   Impact: 2.5 days wasted per feature
   Recommendation: Cache Docker layers, PR review SLA, automate staging

3. TRANSPORTATION
   Found:
   • Data transformed 4 times between DB and API response:
     DB → ORM → Service → DTO → Serializer
   • Request/response logged 3 times (middleware, handler, service)
   • Files uploaded → S3 → CloudFront → Local cache (unnecessary)
   
   Impact: 200ms avg response time overhead
   Recommendation: Reduce transformation layers, consolidate logging

4. OVER-PROCESSING
   Found:
   • Every request validates auth token (even cached)
   • Database queries fetch all columns (SELECT *)
   • JSON responses include full object graphs (nested 5 levels)
   • Logs every database query in production (verbose)
   
   Impact: 40% higher database load, 3x log storage
   Recommendation: Cache auth checks, selective fields, trim responses

5. INVENTORY
   Found:
   • 23 open PRs (8 abandoned, 6+ months old)
   • 5 feature branches unmerged (completed but not deployed)
   • 147 open bugs (42 duplicates, 60 not reproducible)
   • 12 hotfix commits not backported to main
   
   Impact: Context overhead, merge conflicts, lost work
   Recommendation: Close stale PRs, bug triage, deploy pending features

6. MOTION
   Found:
   • Developers switch between 4 tools for one deployment
   • Manual database migrations (error-prone, slow)
   • Environment config spread across 6 files
   • Copy-paste secrets to .env files
   
   Impact: 30min per deployment, frequent mistakes
   Recommendation: Unified deployment tool, automate migrations

7. DEFECTS
   Found:
   • 12 production bugs per month
   • 15% flaky test rate (wasted retry time)
   • Technical debt in auth module (refactor needed)
   • Incomplete error handling (crashes instead of graceful)
   
   Impact: Customer complaints, rework, downtime
   Recommendation: Stabilize tests, refactor auth, add error boundaries

───────────────────────────────────────
SUMMARY

Total Waste Identified:
• Code: 8K LOC doing nothing
• Time: 2.5 days per feature
• Performance: 200ms overhead per request
• Effort: 30min per deployment

Priority Fixes (by impact):
1. HIGH: Automate deployments (reduces Motion + Waiting)
2. HIGH: Fix flaky tests (reduces Defects)
3. MEDIUM: Remove unused code (reduces Overproduction)
4. MEDIUM: Optimize data transformations (reduces Transportation)
5. LOW: Triage bug backlog (reduces Inventory)

Estimated Recovery:
• 20% faster feature delivery
• 50% fewer production issues
• 30% less operational overhead
```

---

## 注意事项
- 方法选择取决于具体情境——选择最合适的方法
- 可以结合使用多种方法（Gemba Walk → Muda Analysis）
- 不熟悉某个区域时，从 Gemba Walk 开始
- 使用 VSM 进行流程优化
- 使用 Muda 提升效率并进行清理
- 所有方法都应带来可执行的改进
- 记录调查结果，以促进组织学习
- 考虑使用 `/analyse-problem`（A3）对调查结果进行全面记录