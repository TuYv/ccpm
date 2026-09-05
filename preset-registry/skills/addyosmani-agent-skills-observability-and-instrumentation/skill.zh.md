---
name: observability-and-instrumentation
description: Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing, or alerting. Use when shipping any feature that runs in production and you need evidence it works. Use when production issues are reported but you can't tell what happened from the available data.
---
# 可观测性与检测

## 概述

无法观测的代码就无法运维。可观测性是指从外部利用代码发出的遥测数据，回答“系统正在做什么，以及为什么这样做？”的能力。检测不是上线后的附加工作，而是与功能一起编写，就像测试一样。如果功能发布时没有遥测数据，那么用户首次报告的 bug 就会变成考古，而不是查询。

## 适用场景

- 构建任何将在生产环境运行的功能
- 添加新的服务、端点、后台任务或外部集成
- 生产事故花费了过长时间才完成诊断（“我们无法判断发生了什么”）
- 设置或审查告警规则
- 审查包含 I/O、重试、队列或跨服务调用的 PR

**不适用于：**
- 诊断当前正在发生的故障 —— 使用 `debugging-and-error-recovery` skill（可观测性能够让该 skill 在下次更快发挥作用）
- 分析和优化已经测得的性能缓慢问题 —— 使用 `performance-optimization` skill
- 发布当天的监控清单和回滚触发条件 —— 参见 `shipping-and-launch` skill；本 skill 涵盖为这些内容提供数据的检测

## 流程

### 1. 在检测前定义“正常工作”

没有问题作为目标的遥测数据就是噪声。在添加任何检测之前，写下值班工程师会针对该功能提出的 2–4 个问题：

```text
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

如果你无法说出这些问题，就还没准备好进行检测 —— 你会记录所有内容，却什么也了解不了。

### 2. 为每个问题选择合适的信号

| 信号 | 回答的问题 | 成本特征 | 示例 |
|---|---|---|---|
| **结构化日志** | “这个具体案例发生了什么？” | 每个事件产生成本；随流量增长 | 包含 provider error code 的 `payment_failed` |
| **指标** | “总体上发生得多频繁 / 速度有多快？” | 每个序列的成本固定；查询成本低 | provider 调用的 p99 延迟 |
| **追踪** | “跨服务调用中时间花在哪里？” | 每个请求产生成本；通常会采样 | 一个按调用链路逐跳拆解的慢速 checkout |

经验法则：指标告诉你**出了问题**，追踪告诉你**问题在哪里**，日志告诉你**问题为什么发生**。

### 3. 结构化日志

记录事件，而不是散文式文本。每一行日志都是一个包含稳定事件名称和机器可读字段的 JSON 对象：

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

**日志级别 —— 保持一致地使用：**

| 级别 | 含义 | 值班响应 |
|---|---|---|
| `error` | 不变量被破坏；可能需要有人采取行动 | 调查 |
| `warn` | 已处理但出现降级（重试成功、使用了回退方案） | 关注趋势 |
| `info` | 重要的业务事件（订单已下单、任务已完成） | 无 |
| `debug` | 诊断细节 | 默认在生产环境中关闭 |

**Correlation IDs 是强制要求。** 在系统边界生成（或接受）一个请求 ID，并将其附加到每一条日志、每个 span 以及每次出站调用中。没有它，就无法从交错的日志中还原出单个请求：

```typescript
// Express: child logger per request, ID propagated downstream
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**当多个入口向同一个日志写入时，要标明入口。** 关联 ID 可以标识一次运行，但无法说明是哪条代码路径启动了它。同一个作业可能由调度器、重放端点或手动 CLI 运行触发，并在同一个日志接收端产生无法区分的日志行；要归属某一行，只能通过排除法，再去交叉查阅调度器历史记录、进程表、部署日志等外部记录，而这个判断只有在这些外部记录恰好仍然存在时才成立。在运行开始时，将入口标记在关联 ID 旁边，并以相同方式传播这两个字段：

```typescript
// One helper for every entry point: the run's own logger carries both fields.
// `entryPoint`, not `source` — ECS reserves `source.*` for network fields.
export const runLog = (entryPoint: 'scheduler' | 'replay_endpoint' | 'cli', runId: string) =>
  logger.child({ entryPoint, requestId: runId });

// scheduler tick        -> runLog('scheduler', crypto.randomUUID())
// POST /jobs/:id/replay -> runLog('replay_endpoint', req.id)
// CLI invocation        -> runLog('cli', process.env.RUN_ID ?? crypto.randomUUID())
```

这两个字段必须像关联 ID 一样跨越相同的边界，例如队列元数据和 HTTP 标头；否则 worker 会重新推断入口并进行猜测。一个仅仅与入口相关联的字段只是提示，而不是归属依据：任何能够调用该作业的对象都可以复现它。

**绝不要记录机密、令牌、密码或完整的 PII。** 这是 `security-and-hardening` skill 中的一条硬性规则：遥测管道是典型的数据泄露路径。只允许记录明确列入白名单的字段；不要记录完整的请求正文。

### 4. 指标

对于请求驱动的服务，要在每个端点和每个外部依赖上采集 **RED** 指标：**R**ate（请求速率，每秒请求数）、**E**rrors（错误率）、**D**uration（时延直方图，而不是平均值）。对于资源（队列、池、主机），使用 **USE**：**U**tilization（利用率）、**S**aturation（饱和度）、**E**rrors（错误）。

与追踪一样，与供应商无关的方式是使用 OpenTelemetry metrics API（使用与第 5 步相同的 SDK 和上下文）。下面的示例使用 Prometheus 的 `prom-client`，这是一种常见的后端选择，但不是唯一选择；无论采用哪种方式，RED/USE 和基数规则都相同。

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'],  // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**基数是故障模式。** 每种唯一的标签组合都是一个独立的时间序列。标签必须来自规模较小且固定的集合（路由模板、状态类别、提供商名称）。绝不要将用户 ID、原始 URL、错误消息或其他无界值用作标签，这些内容应放在日志和追踪中。

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

绝不要只跟踪平均值：始终使用百分位数。平均值会掩盖那 1% 体验糟糕的用户。使用直方图并读取 p50/p95/p99。

### 5. 分布式追踪

使用 OpenTelemetry，它是与供应商无关的标准，而自动插桩几乎无需编写代码即可覆盖 HTTP、gRPC 和常见的数据库客户端：

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

仅围绕有意义的内部工作单元添加手动 span（例如 `applyDiscounts`、`chargeProvider`），并附加值班人员会用来筛选的属性。跨越每个异步边界传播上下文，包括 HTTP 标头和队列消息元数据，否则追踪会在断点处中止。默认以较低速率进行基于头部的采样；如果后端支持基于尾部的采样，则保留 100% 的错误。

### 6. 告警

针对**用户能感受到的症状**发出告警，而不是针对原因：

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

基于原因的告警会在没有任何问题时触发，并漏掉你未预料到的故障。基于症状的告警会在用户确实受到影响时准确触发，无论原因是什么。

你创建的每条告警都必须遵循以下规则：

1. **必须可执行。** 如果响应是“忽略它，它会自动恢复”，就删除这条告警。
2. **必须链接到运行手册**，哪怕只有三行：它意味着什么、要运行的第一个查询、升级处理路径。
3. **必须有由 SLO 或历史数据所依据的阈值和持续时间**，不能凭猜测设定。
4. 只使用两种严重级别：**页面告警**（面向用户、立即处理）和**工单告警**（出现降级、本周处理）。第三个级别会变成噪音，让人逐渐学会忽略所有告警。

### 7. 验证遥测本身

插桩也是代码；它可能出错。在宣布工作完成之前，触发相关路径并查看实际输出：

- 在 staging 中强制触发错误 → 通过 `requestId` 在日志中找到它，确认字段是结构化的（而不是 `[object Object]`）
- 发送测试流量 → 确认指标序列以预期的标签出现，并且数值合理
- 在追踪 UI 中跟踪一个跨服务请求 → 确认没有断裂的 span
- 逐一触发每条新告警（临时降低阈值）→ 确认它到达正确的渠道，并且运行手册链接有效

## 常见的合理化借口

| 合理化借口 | 现实 |
|---|---|
| “等它能正常工作后再加日志” | “之后”会变成“第一次事故之后”，而那是发现自己毫无观测能力的代价最高的时刻。在构建时就加入监测。 |
| “日志越多，可观测性就越强” | 无结构的噪声会让事故处理变慢，而不是变快。三个可查询的事件胜过三百行散文式日志。 |
| “暂时用 `console.log` 就行” | 无结构的输出无法过滤、关联或触发告警。结构化日志记录器只需一次性多花五分钟。 |
| “出问题时直接看看仪表板就行” | 没有明确问题作为出发点构建的仪表板，会让你看到一切，唯独看不到答案。从值班人员需要回答的问题开始。 |
| “先对所有重要事项告警，之后再调整” | 嘈杂的寻呼系统会训练人们忽略它。调整永远不会发生，而真正的告警被漏掉时就晚了。 |
| “用用户 ID 作为指标标签能让调试更容易” | 这也会让你的指标后端崩溃。高基数查询应放在日志和追踪中。 |
| “我们只有两个服务，做追踪有点过度” | 两个服务已经意味着存在日志无法回答的跨服务延迟问题。自动插桩让成本变得微不足道。 |

## 红旗

- 一个包含重试、队列或外部调用的功能 PR，却完全没有新增遥测数据
- 通过字符串插值构建日志行，而不是使用结构化字段
- 没有 correlation/request ID，每条日志都是孤立的
- 一个日志流同时接收调度器、webhook 和手动运行产生的日志，却没有字段标明是哪一种入口产生了该日志
- 指标使用用户 ID、原始 URL 或错误消息文本作为标签（基数炸弹）
- 延迟只跟踪平均值，没有百分位数
- 告警每天触发，却只是被确认而没有采取行动
- 对原因（CPU、内存）进行告警并呼叫人工值班，却没有监控面向用户的错误率
- 日志中出现密钥、令牌或完整请求体
- “在我的机器上能运行”是证明生产功能健康的唯一依据

## 验证

为功能加入插桩后，确认：

- [ ] 已写下该功能对应的值班问题，并且每个信号都对应其中一个问题
- [ ] 所有日志输出都是结构化的（JSON），具有稳定的事件名称，并且每一行都有 correlation ID
- [ ] 每个由多个入口写入的日志接收端都带有入口字段；该字段在运行开始处设置，并随 correlation ID 传播，而不是在下游推断
- [ ] 任何日志行中都没有密钥、令牌或未脱敏的 PII（抽查实际输出）
- [ ] 每个新增端点和每个外部依赖都存在 RED 指标，并且标签集合有界
- [ ] 延迟使用直方图表示；可以查询 p95/p99
- [ ] 可以在追踪 UI 中端到端跟踪单个请求，且 span 没有断裂
- [ ] 每个新增告警都基于症状，包含运行手册链接，并且已经实际触发测试过一次
- [ ] 在预发布环境中诱发一次故障，仅通过遥测数据就能定位问题，无需阅读源代码

如需查看此列表的速查版本（包括发布前插桩门禁），请参阅 `../../references/observability-checklist.md`。