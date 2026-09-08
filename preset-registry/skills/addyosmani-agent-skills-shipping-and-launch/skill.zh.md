---
name: shipping-and-launch
description: Prepares production launches. Use when preparing to deploy to production, or when asking what needs to be in place before shipping. Use when you need a pre-launch checklist, when setting up monitoring, when planning a staged rollout, or when you need a rollback strategy.
---
# 发布与上线

## 概述

充满信心地发布。目标不只是部署，更是安全地部署：监控措施到位、回滚计划就绪，并且清楚了解成功的标准。每次上线都应具备可逆性、可观测性和渐进性。

## 何时使用

- 首次将功能部署到生产环境
- 向用户发布重大变更
- 迁移数据或基础设施
- 开放 Beta 或抢先体验计划
- 任何存在风险的部署（全部都是）

## 上线前检查清单

### 代码质量

- [ ] 所有测试通过（单元、集成、e2e）
- [ ] 构建成功且没有警告
- [ ] Lint 和类型检查通过
- [ ] 代码已审查并获批准
- [ ] 没有应在上线前解决的 TODO 注释
- [ ] 生产代码中没有 `console.log` 调试语句
- [ ] 错误处理覆盖预期的失败模式

### 安全性

- [ ] 代码或版本控制中没有密钥
- [ ] 生态系统的依赖审计（`npm audit`、`pip-audit`、`cargo audit`、...）未显示严重或高危漏洞
- [ ] 所有面向用户的端点均具备输入验证
- [ ] 已配置身份验证和授权检查
- [ ] 已配置安全标头（CSP、HSTS 等）
- [ ] 身份验证端点已设置速率限制
- [ ] CORS 已配置为特定来源（非通配符）

### 性能

- [ ] 核心网页指标处于“良好”阈值内
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
- [ ] 错误消息具有描述性，并与表单字段关联
- [ ] axe-core 或 Lighthouse 中没有可访问性警告

### 基础设施

- [ ] 已在生产环境中设置环境变量
- [ ] 数据库迁移已应用（或已准备好应用）
- [ ] DNS 和 SSL 已配置
- [ ] 已为静态资源配置 CDN
- [ ] 已配置日志记录和错误报告
- [ ] 健康检查端点存在且能够响应

### 文档

- [ ] README 已更新，包含所有新的设置要求
- [ ] API 文档为最新状态
- [ ] 已为所有架构决策编写 ADR
- [ ] 更新日志已更新
- [ ] 面向用户的文档已更新（如适用）

## 功能开关策略

通过功能开关发布，以解耦部署与发布：

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
- 每个功能开关都必须有负责人和过期日期
- 在完全发布后的 2 周内清理功能开关
- 不要嵌套功能开关（会产生指数级组合）
- 在 CI 中测试功能开关的两种状态（开启和关闭）

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

使用以下阈值决定在每个阶段是推进、暂停观察，还是回滚：

| 指标 | 推进（绿色） | 暂停并调查（黄色） | 回滚（红色） |
|--------|-----------------|-------------------------------|-----------------|
| 错误率 | 在基线的 10% 以内 | 高于基线 10-100% | >2x 基线 |
| P95 延迟 | 在基线的 20% 以内 | 高于基线 20-50% | 高于基线 >50% |
| 客户端 JS 错误 | 没有新的错误类型 | 新错误出现于 <0.1% 的会话中 | 新错误出现于 >0.1% 的会话中 |
| 业务指标 | 持平或积极 | 下降 <5%（可能是噪声） | 下降 >5% |

### 何时回滚

在以下情况下立即回滚：
- 错误率增加超过基线的 2 倍
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

## 错误预算发布门槛

服务的错误预算，即 SLO 允许失败的请求或时间所占比例，决定了是否可以安全发布。将其作为客观门槛，而不是协商事项：

```
Budget remaining > 20%  →  Ship normally; monitor closely
Budget remaining 0–20%  →  Slow rollouts only; no high-risk changes
Budget exhausted        →  Freeze feature work; focus entirely on reliability
Budget resets           →  Resume normal pace; bake in the fix that recovered it
```

金丝雀发布期间的高消耗率（以快于基线速度消耗预算）是上方发布阈值表中的**暂停**信号，应将其与错误率升高同等对待。

## 回滚策略

每次部署在执行前都需要有回滚计划：

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

- 有关每项变更在通过此清单前都必须满足的项目级完成定义，请参阅 `../../references/definition-of-done.md`
- 有关发布前安全检查，请参阅 `../../references/security-checklist.md`
- 有关发布前性能检查清单，请参阅 `../../references/performance-checklist.md`
- 有关发布前无障碍验证，请参阅 `../../references/accessibility-checklist.md`
- 有关告警规则和与 SLO 关联的阈值，请参阅 `observability-and-instrumentation`

## 常见托词

| 托词 | 事实 |
|---|---|
| “它在预发布环境中能运行，在生产环境中也能运行” | 生产环境具有不同的数据、流量模式和边缘情况。部署后请进行监控。 |
| “这不需要功能开关” | 每项功能都应有紧急关闭开关。即使是“简单”的变更也可能出问题。 |
| “监控是额外负担” | 没有监控意味着你将通过用户投诉而不是仪表板发现问题。 |
| “我们以后再加监控” | 在发布前添加。看不见的内容无法调试。 |
| “回滚等于承认失败” | 回滚是负责任的工程实践。发布损坏的功能才是失败。 |
| “错误率看起来没问题，继续发布吧” | 检查消耗率，而不只是当前错误率。即使各项单独阈值均为绿色，以快于基线的速度消耗预算也是暂停信号。 |

## 危险信号

- 没有回滚计划就部署
- 生产环境中没有监控或错误上报
- 一次性大规模发布（全部一起上线，没有分阶段）
- 功能标志没有过期时间或负责人
- 上线后的第一个小时没有人盯守
- 生产环境配置靠记忆完成，而不是通过代码
- “今天是周五下午，上吧”
- 错误预算已经耗尽，但特性开发仍然照常继续

## 验证

部署前：

- [ ] 预发布检查清单已完成（所有部分为绿色）
- [ ] 功能标志已配置（如适用）
- [ ] 回滚计划已记录
- [ ] 监控仪表盘已设置
- [ ] 团队已收到部署通知

部署后：

- [ ] 健康检查返回 200
- [ ] 错误率正常
- [ ] 延迟正常
- [ ] 关键用户流程可用
- [ ] 日志正在流入
- [ ] 已测试回滚，或已确认随时可用

对于每个已发布的服务：

- [ ] 已建立错误预算策略：清楚当预算降到 20% 以下时该采取什么行动，以及当预算耗尽时该采取什么行动