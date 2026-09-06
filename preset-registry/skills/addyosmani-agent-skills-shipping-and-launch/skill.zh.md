---
name: shipping-and-launch
description: Prepares production launches. Use when preparing to deploy to production. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
---
# 发布与上线

## 概述

满怀信心地发布。目标不仅是部署，更是安全地部署，确保监控到位、回滚方案就绪，并清楚了解成功的标准。每次上线都应当可逆、可观测且渐进进行。

## 使用时机

- 首次将功能部署到生产环境
- 向用户发布重大变更
- 迁移数据或基础设施
- 开启 beta 或早期访问计划
- 任何具有风险的部署（所有部署都有风险）

## 发布前检查清单

### 代码质量

- [ ] 所有测试通过（单元测试、集成测试、e2e 测试）
- [ ] 构建成功且没有警告
- [ ] Lint 和类型检查通过
- [ ] 代码已完成审查并获批准
- [ ] 没有应在上线前解决的 TODO 注释
- [ ] 生产代码中没有 `console.log` 调试语句
- [ ] 错误处理覆盖预期的失败场景

### 安全性

- [ ] 代码或版本控制中没有密钥
- [ ] 生态系统的依赖审计（`npm audit`、`pip-audit`、`cargo audit`、...）未发现严重或高危漏洞
- [ ] 所有面向用户的端点都进行了输入验证
- [ ] 已设置身份验证和授权检查
- [ ] 已配置安全标头（CSP、HSTS 等）
- [ ] 身份验证端点已配置速率限制
- [ ] CORS 已配置为指定来源（而不是通配符）

### 性能

- [ ] Core Web Vitals 达到“良好”阈值
- [ ] 关键路径中没有 N+1 查询
- [ ] 图片已优化（压缩、响应式尺寸、延迟加载）
- [ ] 包体积在预算范围内
- [ ] 数据库查询具有适当的索引
- [ ] 已为静态资源和重复查询配置缓存

### 可访问性

- [ ] 所有交互元素均可通过键盘导航
- [ ] 屏幕阅读器能够传达页面内容和结构
- [ ] 颜色对比度符合 WCAG 2.1 AA（文本为 4.5:1）
- [ ] 模态框和动态内容的焦点管理正确
- [ ] 错误消息描述清晰，并与表单字段关联
- [ ] axe-core 或 Lighthouse 没有可访问性警告

### 基础设施

- [ ] 已在生产环境中设置环境变量
- [ ] 数据库迁移已应用（或已准备好应用）
- [ ] DNS 和 SSL 已配置
- [ ] 已为静态资源配置 CDN
- [ ] 已配置日志记录和错误报告
- [ ] 健康检查端点存在且能够响应

### 文档

- [ ] README 已更新所有新增的设置要求
- [ ] API 文档为最新版本
- [ ] 已为架构决策编写 ADR
- [ ] 更新了变更日志
- [ ] 已更新面向用户的文档（如适用）

## 功能标记策略

通过功能标记发布，从而将部署与发布解耦：

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

**功能标记生命周期：**

```
1. DEPLOY with flag OFF     → Code is in production but inactive
2. ENABLE for team/beta     → Internal testing in production environment
3. GRADUAL ROLLOUT          → 5% → 25% → 50% → 100% of users
4. MONITOR at each stage    → Watch error rates, performance, user feedback
5. CLEAN UP                 → Remove flag and dead code path after full rollout
```

**规则：**
- 每个功能标志都有负责人和过期日期
- 在完全发布后的 2 周内清理功能标志
- 不要嵌套功能标志（会产生指数级组合）
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

使用以下阈值决定在每个阶段推进、暂停还是回滚：

| 指标 | 推进（绿色） | 暂停并调查（黄色） | 回滚（红色） |
|--------|-----------------|-------------------------------|-----------------|
| 错误率 | 在基线的 10% 范围内 | 高于基线 10-100% | >2x 基线 |
| P95 延迟 | 在基线的 20% 范围内 | 高于基线 20-50% | 高于基线 >50% |
| 客户端 JS 错误 | 没有新的错误类型 | 新错误占会话数 <0.1% | 新错误占会话数 >0.1% |
| 业务指标 | 持平或上升 | 下降 <5%（可能是噪声） | 下降 >5% |

### 何时回滚

出现以下情况时立即回滚：
- 错误率增加超过基线的 2 倍
- P95 延迟增加超过 50%
- 用户反馈的问题激增
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

## 错误预算发布门禁

服务的错误预算，即 SLO 允许失败的请求或时间所占的比例，决定了当前是否适合发布。将其作为客观门禁，而不是协商事项：

```
Budget remaining > 20%  →  Ship normally; monitor closely
Budget remaining 0–20%  →  Slow rollouts only; no high-risk changes
Budget exhausted        →  Freeze feature work; focus entirely on reliability
Budget resets           →  Resume normal pace; bake in the fix that recovered it
```

金丝雀发布期间较高的消耗速率（消耗预算的速度快于基准速率）是上方发布阈值表中的 **暂停** 信号，应将其视为错误率升高来处理。

## 回滚策略

每次部署在执行前都需要制定回滚计划：

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

- 关于每项变更在通过此清单前必须满足的项目级完成定义，请参阅 `../../references/definition-of-done.md`
- 关于发布前的安全检查，请参阅 `../../references/security-checklist.md`
- 关于发布前的性能检查清单，请参阅 `../../references/performance-checklist.md`
- 关于发布前的无障碍验证，请参阅 `../../references/accessibility-checklist.md`
- 关于告警规则和与 SLO 关联的阈值，请参阅 `observability-and-instrumentation`

## 常见的自我合理化

| 合理化说法 | 事实 |
|---|---|
| "It works in staging, it'll work in production" | 生产环境有不同的数据、流量模式和边缘情况。部署后要进行监控。 |
| "We don't need feature flags for this" | 每项功能都受益于一个关闭开关。即使是“简单”的变更也可能造成问题。 |
| "Monitoring is overhead" | 没有监控意味着你会从用户投诉中发现问题，而不是从仪表板中发现问题。 |
| "We'll add monitoring later" | 在发布前添加监控。无法观测到的问题无法调试。 |
| "Rolling back is admitting failure" | 回滚是负责任的工程实践。发布损坏的功能才是失败。 |
| "The error rate looks fine, let's keep shipping" | 检查消耗速率，而不只是当前错误率。即使各项单独的阈值都显示为绿色，只要消耗预算的速度快于基准速率，就应视为暂停信号。 |

## 危险信号

- 部署时没有回滚计划
- 生产环境中没有监控或错误报告
- 一次性大爆发式发布（所有内容同时发布，没有分阶段）
- Feature flag 没有设置过期时间或负责人
- 没有人在部署后的第一个小时监控部署情况
- 生产环境配置依赖记忆完成，而不是通过代码管理
- “今天是周五下午，我们把它发布吧”
- 错误预算已经耗尽，但功能开发仍未作任何调整

## 验证

部署前：

- [ ] 发布前检查清单已完成（所有部分均为绿色）
- [ ] Feature flag 已配置（如适用）
- [ ] 回滚计划已记录
- [ ] 监控面板已设置
- [ ] 团队已收到部署通知

部署后：

- [ ] 健康检查返回 200
- [ ] 错误率正常
- [ ] 延迟正常
- [ ] 关键用户流程运行正常
- [ ] 日志正在正常流入
- [ ] 已测试回滚，或已确认回滚准备就绪

对于每个已发布的服务：

- [ ] 已制定错误预算策略：明确预算降至 20% 以下以及预算耗尽时应采取的措施