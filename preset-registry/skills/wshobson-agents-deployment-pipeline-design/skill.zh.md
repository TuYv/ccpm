---
name: deployment-pipeline-design
description: Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. Use this skill when designing zero-downtime deployment pipelines, implementing canary rollout strategies, setting up multi-environment promotion workflows, or debugging failed deployment gates in CI/CD.
---
# 部署流水线设计

面向多阶段 CI/CD 流水线的架构模式，涵盖审批门禁、部署策略和环境晋升工作流。

## 目的

通过合理的阶段组织、自动化质量门禁和渐进式交付策略，设计稳健且安全的部署流水线，在速度与安全之间取得平衡。本技能既涵盖流水线架构的结构设计，也涵盖实现可靠生产部署的运维模式。

## 输入 / 输出

### 你需要提供的内容

- **应用类型**：语言/运行时、容器化还是裸机、单体还是微服务
- **部署目标**：Kubernetes、ECS、VM、serverless 或平台即服务
- **环境拓扑**：环境数量（dev/staging/prod）、区域布局、物理隔离要求
- **发布要求**：可接受的停机时间、回滚 SLA、流量切分需求、金丝雀还是蓝绿的偏好
- **门禁约束**：审批团队、必需的测试覆盖率阈值、合规扫描（SAST、DAST、SCA）
- **监控栈**：Prometheus、Datadog、CloudWatch 或其他用于自动化晋升决策的指标来源

### 本技能产出的内容

- **流水线配置**：阶段定义、作业依赖关系、并行度和缓存策略
- **部署策略**：选定的发布模式及带注释的配置（金丝雀权重、蓝绿切换、滚动更新参数）
- **健康检查设置**：浅层与深层就绪探针、部署后冒烟测试脚本
- **门禁定义**：自动化指标阈值和手动审批工作流
- **回滚计划**：自动化回滚触发条件和手动操作手册步骤

## 适用场景

- 为新服务或平台迁移设计 CI/CD 架构
- 在环境之间实施部署门禁
- 配置带强制安全扫描的多环境流水线
- 采用金丝雀或蓝绿策略建立渐进式交付
- 调试阶段均成功但生产行为异常的流水线
- 通过在指标劣化时自动回滚来缩短平均恢复时间

## 详细模式与实操示例

详细的模式文档位于 `references/details.md`。当上方的导航层级不足以满足需求时，请阅读该文件。

## 故障排查

### 流水线中健康检查通过，但生产环境中服务不健康

流水线的健康检查访问的是一个浅层的 `/ping` 端点，即使数据库不可达，该端点也会返回 200。请改用能验证实际依赖项的深层就绪检查（参见上文的“健康检查”一节）。

### 金丝雀部署始终无法晋升到 100%

Argo Rollouts 需要一个有效的 `AnalysisTemplate` 才能自动晋升。如果 Prometheus 查询没有返回数据（例如指标名称发生了变化），分析将一直处于不确定状态，晋升也会随之停滞。请添加 `inconclusiveLimit`，让发布快速失败，而不是无限期挂起：

```yaml
spec:
  metrics:
  - name: error-rate
    failureCondition: "result[0] > 0.05"
    inconclusiveLimit: 2   # fail after 2 inconclusive results, not hang indefinitely
    provider:
      prometheus:
        query: |
          sum(rate(http_requests_total{status=~"5.."}[2m]))
          / sum(rate(http_requests_total[2m]))
```

### 预发环境部署成功，但生产作业始终不启动

请检查生产环境的保护规则是否已配置——缺少审查者分配意味着审批门禁会无限期等待且不会发出任何通知。在 GitHub Actions 中，请确保在 **Settings → Environments → production** 中将 `Required reviewers` 设置为一个已存在的用户或团队。

### 每次运行 Docker 层缓存都失效，导致构建缓慢

如果 `COPY . .` 出现在依赖安装之前，那么任何源码文件的变更都会使依赖层失效。请调整顺序，先复制依赖清单文件：

```dockerfile
# Good: dependencies cached separately from source code
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### 回滚后数据库迁移仍作用于旧代码

只回滚服务而不回滚迁移会导致架构/代码不匹配错误。请始终确保迁移在至少一个发布周期内保持向后兼容（仅限增量变更），并将撤销脚本与迁移一起纳入版本管理：

```bash
# migrations/V20240315__add_nullable_column.sql       (forward)
# migrations/V20240315__add_nullable_column.undo.sql  (backward)
```

在旧代码版本从所有环境中完全下线之前，切勿执行破坏性迁移（DROP COLUMN、ALTER NOT NULL）。

## 高级主题

有关特定平台的流水线配置、多区域晋升工作流以及高级 Argo Rollouts 模式，请参阅：

- [`references/advanced-strategies.md`](references/advanced-strategies.md) — 扩展的 YAML 示例、特定平台配置（GitHub Actions、GitLab CI、Azure Pipelines）、多区域金丝雀模式以及数据库迁移回滚策略

## 相关技能

- `github-actions-templates` - 用于 GitHub Actions 实现模式和可复用工作流
- `gitlab-ci-patterns` - 用于 GitLab CI/CD 流水线实现
- `secrets-management` - 用于 CI/CD 流水线中的密钥处理
