---
name: observability-and-instrumentation
description: Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing, or alerting. Use when shipping any feature that runs in production and you need evidence it works. Use when production issues are reported but you can't tell what happened from the available data.
---
# 可观测性与插桩

## 概述

无法观测的代码就无法运维。可观测性是指通过代码发出的遥测数据，从外部回答“系统正在做什么，以及为什么这样做？”的能力。插桩不是上线后的附加工作，而是与功能一起编写的内容，就像测试一样。如果功能发布时没有遥测数据，那么第一个由用户报告的 bug 就会变成考古工作，而不是一次查询。

## 使用时机

- 构建任何将在生产环境运行的功能
- 添加新服务、端点、后台任务或外部集成
- 生产事故耗时过长，难以诊断（“我们无法判断发生了什么”）
- 设置或审查告警规则
- 审查涉及 I/O、重试、队列或跨服务调用的 PR

**不适用场景：**
- 诊断当前正在发生的故障：使用 `debugging-and-error-recovery` skill（可观测性会让这个 skill 下次执行得更快）
- 分析和优化已经测量出的性能问题：使用 `performance-optimization` skill
- 发布日监控清单和回滚触发条件：参见 `shipping-and-launch` skill；本 skill 涵盖为这些内容提供数据的插桩

## 流程

### 1. 在插桩前定义“正常工作”

没有问题作为目标的遥测数据就是噪声。在添加任何插桩之前，先写下值班工程师会针对该功能提出的 2–4 个问题：

``` 
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

如果你无法列出这些问题，就还没准备好进行插桩：你会记录一切，却什么也了解不到。

### 2. 为每个问题选择合适的信号

| 信号 | 可回答的问题 | 成本特征 | 示例 |
|---|---|---|---|
| **结构化日志** | “这个具体案例发生了什么？” | 按事件计费；随流量增长 | 包含 provider error code 的 `payment_failed` |
| **指标** | “总体上发生得有多频繁/有多快？” | 每个序列的成本固定；查询成本低 | provider 调用的 p99 延迟 |
| **追踪** | “跨服务调用中时间花在哪里？” | 按请求计费；通常会采样 | 一个按 hop 拆解的慢速 checkout |

经验法则：指标告诉你**出了什么问题**，追踪告诉你**问题在哪里**，日志告诉你**为什么会出问题**。

### 3. 结构化日志

记录事件，而不是散文。每一行日志都是一个 JSON 对象，包含稳定的事件名称和机器可读字段：

```typescript
// BAD: string interpolation — unqueryable, inconsistent
logger.info(`Payment ${id} failed for user ${userId} after ${n} retries`);

// GOOD: stable event name + structured fields
logger.warn({
  event: 'payment_failed',
  paymentId: id,
  provider: 'stripe',
  errorCode: err.code,
  attempt: n,
}, 'payment failed');
```

**日志级别：保持一致地使用：**

| 级别 | 含义 | 值班响应 |
|---|---|---|
| `error` | 不变量被破坏；可能需要有人采取行动 | 调查 |
| `warn` | 已处理但发生降级（重试成功、使用了回退方案） | 观察趋势 |
| `info` | 重要的业务事件（订单已下单、任务已完成） | 无 |
| `debug` | 诊断细节 | 默认在生产环境关闭 |

**关联 ID 是强制要求。** 在系统边界生成（或接受）一个请求 ID，并将其附加到每一行日志、每个 span 以及每个出站调用中。没有它，就无法从交错的日志中还原出单个请求：

```typescript
// Express: child logger per request, ID propagated downstream
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**当多个入口将日志写入同一个日志流时，请标明入口。** 关联 ID 能标识一次运行，但无法说明是哪条代码路径启动了它。同一个任务可能由调度器、重放端点或手动 CLI 运行触发，并在同一个日志目标中产生无法区分的日志行；此时要确定某一行的归属，只能通过排除法：交叉查看调度器历史记录、进程列表、部署日志等，而这种判断只能维持到这些外部记录仍然存在为止。在运行开始时、紧邻关联 ID 的位置记录入口，并以相同方式传播这两个字段：

```typescript
// One helper for every entry point: the run's own logger carries both fields.
// `entryPoint`, not `source` — ECS reserves `source.*` for network fields.
export const runLog = (entryPoint: 'scheduler' | 'replay_endpoint' | 'cli', runId: string) =>
  logger.child({ entryPoint, requestId: runId });

// scheduler tick        -> runLog('scheduler', crypto.randomUUID())
// POST /jobs/:id/replay -> runLog('replay_endpoint', req.id)
// CLI invocation        -> runLog('cli', process.env.RUN_ID ?? crypto.randomUUID())
```

这两个字段必须与关联 ID 经过相同的边界传播，例如队列元数据、HTTP 标头；否则 worker 就只能重新推断入口并进行猜测。一个仅仅与入口相关的字段只是提示，而不是归属信息：任何能够调用该任务的对象都可以复现它。

**绝不要记录机密、令牌、密码或完整的 PII。** 这是 `security-and-hardening` skill 中的一项硬性规则，遥测管道是典型的数据泄露路径。只允许记录明确列出的字段；不要记录完整的请求正文。

### 4. 指标

对于请求驱动的服务，应在每个端点和每个外部依赖上采集 **RED** 指标：**R**ate（请求速率，每秒请求数）、**E**rrors（失败率）、**D**uration（持续时间，使用延迟直方图，而不是平均值）。对于资源（队列、连接池、主机），应使用 **USE**：**U**tilization（利用率）、**S**aturation（饱和度）、**E**rrors（错误）。

与追踪一样，与供应商无关的实现路径是 OpenTelemetry metrics API（使用与第 5 步相同的 SDK 和上下文）。下面的示例使用 Prometheus 的 `prom-client`，这是一个常见的后端选择，但不是唯一选择；无论使用哪种实现，RED/USE 和基数规则都相同。

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'],  // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**基数是故障模式。** 每种唯一的标签组合都是一个独立的时间序列。标签必须来自规模较小且固定的集合（路由模板、状态类别、提供商名称）。绝不要使用用户 ID、原始 URL、错误消息或其他无界值作为标签，这些内容应归入日志和追踪。

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

永远不要只追踪平均值，始终使用百分位数：平均值会掩盖那 1% 体验极差的用户。使用直方图，并读取 p50/p95/p99。

### 5. 分布式追踪

使用 OpenTelemetry，这是与厂商无关的标准，并且自动检测几乎无需编写代码即可覆盖 HTTP、gRPC 和常见的数据库客户端：

```typescript
// tracing.ts — must be imported before anything else
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'checkout-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

仅在有意义的内部工作单元周围添加手动 span（例如 `applyDiscounts`、`chargeProvider`），并附加值班人员会用来筛选的属性。跨越每个异步边界传播上下文，包括 HTTP 标头和队列消息元数据，否则追踪会在缺口处中断。默认以较低比例进行基于头部的采样；如果后端支持基于尾部的采样，则保留 100% 的错误。

### 6. 告警

针对**用户能感受到的症状**进行告警，而不是针对原因：

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

基于原因的告警会在实际没有问题时触发，并且会漏掉你没有预料到的故障。基于症状的告警会在用户确实受到影响时准确触发，无论原因是什么。

你创建的每条告警都必须遵循以下规则：

1. **必须可采取行动。** 如果响应是“忽略它，它会自行恢复”，就删除这条告警。
2. **必须链接到运行手册**，哪怕只有三行：它意味着什么、首先运行哪个查询、升级路径是什么。
3. **必须有阈值和持续时间**，并且依据 SLO 或历史数据，而不是猜测。
4. 只使用两种严重级别：**页面告警**（面向用户的问题，需要立即处理）和**工单**（服务降级，本周内处理）。第三个级别会变成噪声，使人们逐渐忽略所有告警。

#### 编写运行手册

上面的规则 2 要求每条告警都链接到运行手册。运行手册的职责是回答三个问题，而且不应要求读者自行思考：发生了什么、首先检查什么、如果问题没有解决应联系谁。将其存储在 `docs/runbooks/` 中，并以告警名称命名。

**最小可用运行手册（三行）：**

```markdown
# Runbook: High Error Rate on /api/tasks
**Means:** DB connection pool likely exhausted, or a bad deploy.
**First check:** `SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'client backend';`
  — if count > pool limit, see Step 2. (Swap in the equivalent for your database.)
**Escalate to:** #db-oncall or engineering on-call rotation.
```

**何时扩展到三行以上：**仅当第一项检查不足以做出判断时再增加步骤。一份涵盖三个最常见原因的五步运行手册，优于一份试图覆盖所有边缘情况、结果只会被草草浏览的二十步文档。

**保持运行手册为最新状态。** 每次处理完使用过该手册的事故时，都要更新运行手册；过时的运行手册会造成虚假的信心。如果某个步骤有误或缺失，请在将事故标记为已解决之前修正它。

### 7. 验证遥测本身

监测埋点也是代码；它可能出错。在宣布工作完成之前，触发相关路径并查看实际输出：

- 在预发布环境强制触发错误 → 通过 `requestId` 在日志中找到它，确认字段是结构化的（而不是 `[object Object]`）
- 发送测试流量 → 确认指标时间序列以预期标签和合理数值出现
- 在追踪 UI 中跟随一个请求跨越各服务 → 没有中断的 span
- 分别触发一次每个新告警（暂时降低阈值）→ 确认它到达正确的频道，并且运行手册链接可用

## 常见的自我辩解

| 自我辩解 | 现实 |
|---|---|
| “等功能跑通后我再加日志” | “之后”会变成“第一次事故之后”，而那是发现自己毫无可见性时成本最高的时刻。应在构建时就进行埋点。 |
| “更多日志 = 更好的可观测性” | 非结构化噪声会让事故处理更慢，而不是更快。三个可查询事件胜过三百行散文式日志。 |
| “`console.log` 暂时够用了” | 非结构化输出无法被过滤、关联或设置告警。使用结构化日志记录器一次只需额外五分钟。 |
| “出问题时我们直接看仪表盘就行” | 没有明确问题定义就构建的仪表盘，会展示除了答案之外的一切。应从值班问题出发。 |
| “所有重要事项都设告警，之后再调优” | 嘈杂的寻呼会训练人们忽略它。调优永远不会发生；真正的重要告警反而会被漏掉。 |
| “把用户 ID 作为指标标签能让调试更容易” | 它同样会让你的指标后端崩溃。高基数查询应放在日志和追踪中。 |
| “对于我们两个服务来说，追踪太大材小用了” | 两个服务已经意味着存在日志无法回答的跨服务延迟问题。自动埋点让成本微不足道。 |

## 危险信号

- 一个包含重试、队列或外部调用的功能 PR，却没有任何新增遥测
- 通过字符串插值构造的日志行，而不是结构化字段
- 没有关联 ID/请求 ID；每条日志行都是孤儿
- 一个日志流同时由调度器、webhook 和手动运行写入，却没有字段标明是哪一种产生了该日志行
- 指标使用用户 ID、原始 URL 或错误消息文本作为标签（基数炸弹）
- 延迟仅以平均值追踪，没有百分位数
- 每天触发且无需采取行动就被确认的告警
- 针对原因（CPU、内存）的告警会呼叫人工，但未监控面向用户的错误率
- 日志中出现密钥、令牌或完整请求体
- “在我的机器上可以运行”是生产功能健康的唯一证据

## 验证

在为某项功能添加可观测性后，确认：

- [ ] 已记录该功能的值班问题，并且每个信号都映射到其中一个问题
- [ ] 所有日志输出均为结构化格式（JSON），具有稳定的事件名称，并且每一行都有关联 ID
- [ ] 每个由多个入口点写入的日志接收端都包含入口点字段；该字段在运行开始时设置，并与关联 ID 一同传播，而非在下游推断
- [ ] 任何日志行中均不包含密钥、令牌或未经脱敏的 PII（抽查实际输出）
- [ ] 每个新端点和每个外部依赖均具有 RED 指标，且标签集合有界
- [ ] 延迟使用直方图；可查询 p95/p99
- [ ] 可以在追踪 UI 中端到端跟踪单个请求，且不存在断裂的 span
- [ ] 每个新告警均基于症状，包含运行手册链接，并且已测试触发一次
- [ ] 在预发布环境中注入的故障可仅通过遥测数据定位，无需阅读源代码

如需查看此清单的一览版本（包括发布前可观测性准入门槛），请参阅 `../../references/observability-checklist.md`。