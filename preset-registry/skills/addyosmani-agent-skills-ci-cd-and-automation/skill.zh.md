---
name: ci-cd-and-automation
description: Automates CI/CD pipeline setup. Use when setting up or modifying build and deployment pipelines. Use when you need to automate quality gates, configure test runners in CI, or establish deployment strategies.
---
# CI/CD 与自动化

## 概述

自动化质量门禁，确保任何变更在通过测试、代码检查、类型检查和构建之前都无法进入生产环境。CI/CD 是其他所有技能的强制执行机制——它能发现人类和智能体遗漏的问题，并对每一次变更始终如一地执行检查。

**左移：** 尽可能在流水线的早期发现问题。在代码检查阶段发现一个错误只需花费几分钟；同一个错误到了生产环境才被发现则要花费数小时。将检查前移——先进行静态分析，再进行测试；先测试，再进入预发布环境；先经过预发布环境，再进入生产环境。

**越快越安全：** 更小的变更批次和更频繁的发布会降低风险，而不是增加风险。包含 3 项变更的部署比包含 30 项变更的部署更容易调试。频繁发布能够增强对发布流程本身的信心。

## 何时使用

- 为新项目设置 CI 流水线
- 添加或修改自动化检查
- 配置部署流水线
- 当某项变更应触发自动验证时
- 调试 CI 失败

## 质量门禁流水线

每项变更在合并前都要经过以下门禁：

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

**任何门禁都不能跳过。** 如果代码检查失败，就修复代码检查问题——不要禁用规则。如果测试失败，就修复代码——不要跳过测试。

## GitHub Actions 配置

### 基础 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### 包含数据库集成测试

```yaml
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: ci_user
          POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **注意：** 即使是仅用于 CI 的测试数据库，也应使用 GitHub Secrets 存储凭据，而不是将值硬编码。这有助于养成良好习惯，并防止测试凭据意外在其他场景中被重复使用。

### E2E 测试

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build
        run: npm run build
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 将 CI 失败反馈给智能体

将 CI 与 AI 智能体结合使用的强大之处在于反馈循环。当 CI 失败时：

```
CI fails
    │
    ▼
Copy the failure output
    │
    ▼
Feed it to the agent:
"The CI pipeline failed with this error:
[paste specific error]
Fix the issue and verify locally before pushing again."
    │
    ▼
Agent fixes → pushes → CI runs again
```

**关键模式：**

```
Lint failure → Agent runs `npm run lint --fix` and commits
Type error  → Agent reads the error location and fixes the type
Test failure → Agent follows debugging-and-error-recovery skill
Build error → Agent checks config and dependencies
```

## 部署策略

### 预览部署

每个 PR 都会获得一个预览部署，以便进行手动测试：

```yaml
# Deploy preview on PR (Vercel/Netlify/etc.)
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy preview
      run: npx vercel --token=${{ secrets.VERCEL_TOKEN }}
```

### 功能标志

功能标志将部署与发布解耦。将未完成或有风险的功能置于标志之后进行部署，这样你就可以：

- **发布代码而不启用它。** 尽早合并到 main，准备就绪后再启用。
- **无需重新部署即可回滚。** 禁用标志，而不是还原代码。
- **对新功能进行金丝雀发布。** 先为 1% 的用户启用，然后是 10%，最后是 100%。
- **运行 A/B 测试。** 比较启用和未启用该功能时的行为。

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**标志生命周期：** 创建 → 启用以进行测试 → 金丝雀发布 → 全量发布 → 移除标志和无用代码。长期存在的标志会成为技术债务——创建标志时就应设定清理日期。

### 分阶段发布

```
PR merged to main
    │
    ▼
  Staging deployment (auto)
    │ Manual verification
    ▼
  Production deployment (manual trigger or auto after staging)
    │
    ▼
  Monitor for errors (15-minute window)
    │
    ├── Errors detected → Rollback
    └── Clean → Done
```

### 回滚计划

每次部署都应该是可逆的：

```yaml
# Manual rollback workflow
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          # Deploy the specified previous version
          npx vercel rollback ${{ inputs.version }}
```

## 环境管理

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI 绝不应包含生产环境密钥。应为 CI 测试使用单独的密钥。

## CI 之外的自动化

### Dependabot / Renovate

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### 构建值守角色

指定专人负责维持 CI 正常运行。当构建失败时，构建值守人员的职责是修复或回滚，而不是由导致构建失败的变更提交者负责。这样可以避免失败的构建不断累积，而每个人都以为会有其他人来修复。

### PR 检查

- **必需的审查：** 合并前至少获得 1 个批准
- **必需的状态检查：** 合并前 CI 必须通过
- **分支保护：** 禁止向 main 强制推送
- **自动合并：** 如果所有检查均通过且已获批准，则自动合并

## CI 优化

当流水线执行时间超过 10 分钟时，按影响程度从高到低依次采用以下策略：

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use actions/cache or setup-node cache option for node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Use path filters to skip unrelated jobs (e.g., skip e2e for docs-only PRs)
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimize the test suite
│   └── Remove slow tests from the critical path, run them on a schedule instead
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**示例：缓存与并行执行**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “CI 太慢了” | 优化流水线（参见下方的 CI 优化），不要跳过它。5 分钟的流水线可以避免数小时的调试。 |
| “这项变更很简单，跳过 CI 吧” | 简单的变更也会破坏构建。无论如何，CI 对简单变更的执行速度也很快。 |
| “这个测试不稳定，重新运行就行了” | 不稳定的测试会掩盖真正的缺陷，并浪费所有人的时间。应修复其不稳定性。 |
| “我们之后再添加 CI” | 没有 CI 的项目会不断积累损坏状态。应在第一天就完成配置。 |
| “手动测试已经足够了” | 手动测试无法扩展，也不可重复。尽可能将测试自动化。 |

## 危险信号

- 项目中没有 CI 流水线
- CI 失败被忽略或静默处理
- 为使流水线通过而在 CI 中禁用测试
- 未经预发布环境验证便部署到生产环境
- 没有回滚机制
- 密钥存储在代码或 CI 配置文件中（而不是密钥管理器中）
- CI 耗时过长且未采取任何优化措施

## 验证

设置或修改 CI 后：

- [ ] 已设置所有质量门禁（代码检查、类型检查、测试、构建、审计）
- [ ] 每次 PR 和推送到 main 时都会运行流水线
- [ ] 失败会阻止合并（已配置分支保护）
- [ ] CI 结果会反馈到开发循环中
- [ ] 密钥存储在密钥管理器中，而不是代码中
- [ ] 部署具备回滚机制
- [ ] 测试套件的流水线运行时间不超过 10 分钟