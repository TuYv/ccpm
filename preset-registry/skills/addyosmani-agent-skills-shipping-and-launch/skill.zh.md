---
name: shipping-and-launch
description: Prepares production launches. Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
---
# 发布与上线

## 概述

充满信心地发布。目标不只是部署，而是安全地部署：监控已就绪，回滚计划已备妥，并且清楚地了解成功的标准。每次上线都应当是可逆、可观测且渐进的。

## 何时使用

- 首次将功能部署到生产环境
- 向用户发布重大变更
- 迁移数据或基础设施
- 开放 Beta 或抢先体验计划
- 任何存在风险的部署（所有部署都有风险）

## 上线前检查清单

### 代码质量

- [ ] 所有测试均通过（单元测试、集成测试、端到端测试）
- [ ] 构建成功且无警告
- [ ] 代码检查和类型检查均通过
- [ ] 代码已审查并获批准
- [ ] 不存在应在上线前解决的 TODO 注释
- [ ] 生产代码中不存在 `console.log` 调试语句
- [ ] 错误处理涵盖预期的故障模式

### 安全性

- [ ] 代码或版本控制系统中不存在密钥
- [ ] 生态系统的依赖项审计（`npm audit`、`pip-audit`、`cargo audit`、……）未发现严重或高危漏洞
- [ ] 所有面向用户的端点均进行输入验证
- [ ] 已实施身份验证和授权检查
- [ ] 已配置安全响应头（CSP、HSTS 等）
- [ ] 身份验证端点已实施速率限制
- [ ] CORS 已配置为特定来源（而非通配符）

### 性能

- [ ] Core Web Vitals 处于“良好”阈值内
- [ ] 关键路径中不存在 N+1 查询
- [ ] 图片已优化（压缩、响应式尺寸、延迟加载）
- [ ] Bundle 大小未超出预算
- [ ] 数据库查询具有适当的索引
- [ ] 已为静态资源和重复查询配置缓存

### 无障碍性

- [ ] 所有交互元素均支持键盘导航
- [ ] 屏幕阅读器能够传达页面内容和结构
- [ ] 颜色对比度符合 WCAG 2.1 AA 标准（文本为 4.5:1）
- [ ] 模态框和动态内容的焦点管理正确
- [ ] 错误消息描述清晰，并与表单字段相关联
- [ ] axe-core 或 Lighthouse 中不存在无障碍警告

### 基础设施

- [ ] 已在生产环境中设置环境变量
- [ ] 数据库迁移已应用（或已准备好应用）
- [ ] DNS 和 SSL 已配置
- [ ] 已为静态资源配置 CDN
- [ ] 已配置日志记录和错误报告
- [ ] 健康检查端点已存在且能够响应

### 文档

- [ ] README 已更新，包含所有新的设置要求
- [ ] API 文档为最新版本
- [ ] 已为所有架构决策编写 ADR
- [ ] 变更日志已更新
- [ ] 面向用户的文档已更新（如适用）

## 功能开关策略

在功能开关之后发布，以将部署与发布解耦：

```typescript
// Feature flag check
const flags = await getFeatureFlags(userId);

if (flags.taskSharing) {
  // New feature: task sharing
  return <TaskSharingPanel task={task} />;
}

// Default: existing behavior
return null;
```

**功能开关生命周期：**

```
1. DEPLOY with flag OFF     → Code is in production but inactive
2. ENABLE for team/beta     → Internal testing in production environment
3. GRADUAL ROLLOUT          → 5% → 25% → 50% → 100% of users
4. MONITOR at each stage    → Watch error rates, performance, user feedback
5. CLEAN UP                 → Remove flag and dead code path after full rollout
```

**规则：**
- 每个功能标志都必须有负责人和到期日期
- 在全面发布后的 2 周内清理功能标志
- 不要嵌套功能标志（这会产生指数级的组合）
- 在 CI 中测试功能标志的两种状态（开启和关闭）

## 分阶段发布

### 发布顺序

```
1. DEPLOY to staging
   └── Full test suite in staging environment
   └── Manual smoke test of critical flows

2. DEPLOY to production (feature flag OFF)
   └── Verify deployment succeeded (health check)
   └── Check error monitoring (no new errors)

3. ENABLE for team (flag ON for internal users)
   └── Team uses the feature in production
   └── 24-hour monitoring window

4. CANARY rollout (flag ON for 5% of users)
   └── Monitor error rates, latency, user behavior
   └── Compare metrics: canary vs. baseline
   └── 24-48 hour monitoring window
   └── Advance only if all thresholds pass (see table below)

5. GRADUAL increase (25% -> 50% -> 100%)
   └── Same monitoring at each step
   └── Ability to roll back to previous percentage at any point

6. FULL rollout (flag ON for all users)
   └── Monitor for 1 week
   └── Clean up feature flag
```

### 发布决策阈值

使用以下阈值决定在每个阶段是继续推进、暂停并调查，还是回滚：

| 指标 | 推进（绿色） | 暂停并调查（黄色） | 回滚（红色） |
|--------|-----------------|-------------------------------|-----------------|
| 错误率 | 与基线相比波动不超过 10% | 比基线高 10-100% | 超过基线的 2 倍 |
| P95 延迟 | 与基线相比波动不超过 20% | 比基线高 20-50% | 比基线高出 50% 以上 |
| 客户端 JS 错误 | 没有新的错误类型 | 新错误出现在不到 0.1% 的会话中 | 新错误出现在超过 0.1% 的会话中 |
| 业务指标 | 持平或改善 | 下降不到 5%（可能是噪声） | 下降超过 5% |

### 何时回滚

如果出现以下情况，请立即回滚：
- 错误率增加到基线的 2 倍以上
- P95 延迟增加超过 50%
- 用户报告的问题激增
- 检测到数据完整性问题
- 发现安全漏洞

## 监控与可观测性

### 监控内容

```
Application metrics:
├── Error rate (total and by endpoint)
├── Response time (p50, p95, p99)
├── Request volume
├── Active users
└── Key business metrics (conversion, engagement)

Infrastructure metrics:
├── CPU and memory utilization
├── Database connection pool usage
├── Disk space
├── Network latency
└── Queue depth (if applicable)

Client metrics:
├── Core Web Vitals (LCP, INP, CLS)
├── JavaScript errors
├── API error rates from client perspective
└── Page load time
```

### 错误报告

```typescript
// Set up error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Report to error tracking service
    reportError(error, {
      componentStack: info.componentStack,
      userId: getCurrentUser()?.id,
      page: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// Server-side error reporting
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  reportError(err, {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
  });

  // Don't expose internals to users
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
```

### 发布后验证

发布后的第一个小时内：

```
1. Check health endpoint returns 200
2. Check error monitoring dashboard (no new error types)
3. Check latency dashboard (no regression)
4. Test the critical user flow manually
5. Verify logs are flowing and readable
6. Confirm rollback mechanism works (dry run if possible)
```

## 回滚策略

每次部署都需要在执行前制定回滚计划：

```markdown
## Rollback Plan for [Feature/Release]

### Trigger Conditions
- Error rate > 2x baseline
- P95 latency > [X]ms
- User reports of [specific issue]

### Rollback Steps
1. Disable feature flag (if applicable)
   OR
1. Deploy previous version: `git revert <commit> && git push`
2. Verify rollback: health check, error monitoring
3. Communicate: notify team of rollback

### Database Considerations
- Migration [X] has a rollback: `npx prisma migrate rollback`
- Data inserted by new feature: [preserved / cleaned up]

### Time to Rollback
- Feature flag: < 1 minute
- Redeploy previous version: < 5 minutes
- Database rollback: < 15 minutes
```
## 另请参阅

- 有关每项变更在执行此检查清单前都必须满足的项目级完成定义，请参阅 `../../references/definition-of-done.md`
- 有关发布前的安全检查，请参阅 `../../references/security-checklist.md`
- 有关发布前的性能检查清单，请参阅 `../../references/performance-checklist.md`
- 有关发布前的无障碍验证，请参阅 `../../references/accessibility-checklist.md`

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “它在预发布环境中可以正常运行，在生产环境中也会正常运行” | 生产环境具有不同的数据、流量模式和边界情况。部署后应进行监控。 |
| “这个功能不需要功能开关” | 每项功能都能从终止开关中受益。即使是“简单”的变更也可能导致故障。 |
| “监控是一种负担” | 没有监控意味着你只能通过用户投诉发现问题，而不是通过仪表板。 |
| “我们稍后再添加监控” | 应在发布前添加。你无法调试看不见的问题。 |
| “回滚就是承认失败” | 回滚是负责任的工程实践。发布有缺陷的功能才是失败。 |

## 危险信号

- 在没有回滚计划的情况下部署
- 生产环境中没有监控或错误报告
- 大爆炸式发布（一次性发布所有内容，没有分阶段部署）
- 功能开关没有到期时间或负责人
- 发布后的第一个小时内无人监控部署情况
- 凭记忆而非代码配置生产环境
- “今天是周五下午，我们发布吧”

## 验证

部署前：

- [ ] 已完成发布前检查清单（所有部分均为绿色）
- [ ] 已配置功能开关（如适用）
- [ ] 已记录回滚计划
- [ ] 已设置监控仪表板
- [ ] 已通知团队部署事宜

部署后：

- [ ] 健康检查返回 200
- [ ] 错误率正常
- [ ] 延迟正常
- [ ] 关键用户流程运行正常
- [ ] 日志正常流入
- [ ] 已测试回滚或确认回滚已准备就绪