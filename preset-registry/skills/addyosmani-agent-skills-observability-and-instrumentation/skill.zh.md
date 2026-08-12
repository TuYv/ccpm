---
name: observability-and-instrumentation
description: Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing, or alerting. Use when shipping any feature that runs in production and you need evidence it works. Use when production issues are reported but you can't tell what happened from the available data.
---
# 可观测性与插桩

## 概述

无法观测的代码，就是无法运维的代码。可观测性是指利用代码发出的遥测数据，从外部回答“系统正在做什么，为什么？”的能力。插桩不是上线后再添加的附加项——它应当与功能同时编写，就像测试一样。如果一个功能上线时没有遥测，那么用户报告的第一个错误就会让问题排查变成考古，而不是一次查询。

## 何时使用

- 构建任何将在生产环境中运行的功能
- 添加新的服务、端点、后台任务或外部集成
- 某次生产事故的诊断耗时过长（“我们无法判断发生了什么”）
- 设置或审查告警规则
- 审查添加了 I/O、重试、队列或跨服务调用的 PR

**不适用于：**
- 诊断当前正在发生的故障——请使用 `debugging-and-error-recovery` 技能（可观测性可以让下次使用该技能时更快地完成诊断）
- 分析并优化已经测量到的性能缓慢问题——请使用 `performance-optimization` 技能
- 上线当天的监控清单和回滚触发条件——请参阅 `shipping-and-launch` 技能；本技能涵盖为这些工作提供数据的插桩

## 流程

### 1. 在插桩之前定义“正常运行”

没有问题导向的遥测就是噪声。在添加任何插桩之前，写下值班工程师会针对该功能提出的 2–4 个问题：

```
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

如果你无法明确这些问题，就还没有准备好进行插桩——你会记录所有内容，却什么也学不到。

### 2. 为每个问题选择正确的信号

| 信号 | 回答的问题 | 成本特征 | 示例 |
|---|---|---|---|
| **结构化日志** | “这个具体案例中发生了什么？” | 按事件计费；随流量增长 | 带有提供商错误代码的 `payment_failed` |
| **指标** | “从整体来看，发生频率多高／速度多快？” | 每个序列的成本固定；查询成本低 | 提供商调用延迟的 p99 |
| **追踪** | “跨服务调用的时间都花在了哪里？” | 按请求计费；通常会进行采样 | 一次缓慢的结账请求，按调用链路逐段拆解 |

经验法则：指标告诉你某件事**发生了**异常，追踪告诉你异常发生在**哪里**，日志告诉你**为什么**会发生异常。

### 3. 结构化日志记录

记录事件，而不是散文。每一行日志都是一个 JSON 对象，其中包含稳定的事件名称和机器可读字段：

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

**日志级别——请始终保持一致地使用：**

| 级别 | 含义 | 值班人员操作 |
|---|---|---|
| `error` | 不变量被破坏；可能需要有人采取行动 | 调查 |
| `warn` | 服务降级但已处理（重试成功、使用了回退方案） | 关注趋势 |
| `info` | 重要的业务事件（订单已创建、任务已完成） | 无 |
| `debug` | 诊断详情 | 默认在生产环境中关闭 |

**关联 ID 是强制要求。** 在系统边界生成（或接收）请求 ID，并将其附加到每一行日志、每个 span 和每次出站调用中。没有它，你就无法从交错的日志中还原单个请求：

```typescript
// Express: child logger per request, ID propagated downstream
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**绝不要记录密钥、令牌、密码或完整的个人身份信息（PII）。** 这是 `security-and-hardening` skill 中的一条硬性规则——遥测管道是典型的数据泄露途径。应使用字段允许列表；不要记录完整的请求体。

### 4. 指标

对于请求驱动的服务，应在每个端点和每个外部依赖上检测 **RED**：**R**ate（速率，即请求数/秒）、**E**rrors（错误，即失败率）、**D**uration（持续时间，即延迟直方图，而非平均值）。对于资源（队列、池、主机），使用 **USE**：**U**tilization（利用率）、**S**aturation（饱和度）、**E**rrors（错误）。

与追踪一样，厂商中立的实现路径是 OpenTelemetry 指标 API（与第 5 步使用相同的 SDK 和上下文）。以下示例使用 Prometheus 的 `prom-client`——这是一种常见的后端选择，但不是唯一选择；无论采用哪种方式，RED/USE 和基数规则都相同。

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'],  // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**基数是主要的故障模式。** 每个唯一的标签组合都是一个独立的时间序列。标签必须来自规模较小的固定集合（路由模板、状态类别、提供商名称）。绝不要将用户 ID、原始 URL、错误消息或其他无界值用作标签——这些内容应放在日志和追踪中。

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

绝不要追踪平均值，始终追踪百分位数：平均值会掩盖那 1% 体验极差的用户。使用直方图，并查看 p50/p95/p99。

### 5. 分布式追踪

使用 OpenTelemetry——它是厂商中立的标准，并且自动插桩几乎无需编写代码即可覆盖 HTTP、gRPC 和常见的数据库客户端：

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

仅在有意义的内部工作单元（例如 `applyDiscounts`、`chargeProvider`）周围添加手动 span，并附加值班人员会用于筛选的属性。在每个异步边界——HTTP 标头、队列消息元数据——之间传播上下文，否则追踪链路会在缺口处中断。默认以较低比率进行头部采样；如果后端支持尾部采样，则保留 100% 的错误。

### 6. 告警

针对**用户能感受到的症状**发出告警，而不是针对原因：

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

基于原因的告警会在一切正常时触发，却可能漏掉你未曾预料的故障。基于症状的告警只会在用户确实受到影响时触发，无论原因是什么。

你创建的每条告警都应遵循以下规则：

1. **必须是可操作的。** 如果响应方式是“忽略它，它会自行恢复”，就删除这条告警。
2. **必须链接到运行手册**——哪怕只有三行：它意味着什么、首先要运行的查询、升级路径。
3. **必须有阈值和持续时间**，并以 SLO 或历史数据为依据，而不是靠猜测。
4. 只使用两种严重级别：**page**（影响用户，立即处理）和 **ticket**（服务退化，本周内处理）。第三个级别只会制造噪声，让人们逐渐养成忽略所有告警的习惯。

### 7. 验证遥测本身

插桩也是代码；它也可能出错。在宣布工作完成之前，触发相应路径并检查实际输出：

- 在预发布环境中强制触发错误 → 通过 `requestId` 在日志中找到它，确认字段采用结构化格式（而不是 `[object Object]`）
- 发送测试流量 → 确认指标序列带有预期的标签和合理的值
- 在追踪 UI 中跟踪一个跨服务请求 → 确认没有断裂的 span
- 让每条新告警触发一次（临时降低阈值）→ 确认它会发送到正确的频道，并且运行手册链接有效

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “功能正常运行后我会添加日志” | “之后”会变成“第一次事故之后”，而那正是发现自己一无所知代价最高昂的时刻。边构建边插桩。 |
| “日志越多 = 可观测性越强” | 非结构化噪声会让事故处理变慢，而不是变快。三个可查询的事件胜过三百行描述性文本。 |
| “暂时用 console.log 就够了” | 非结构化输出无法进行筛选、关联或告警。使用结构化日志记录器只需一次性多花五分钟。 |
| “出问题时直接看仪表板就行” | 在没有明确问题的情况下构建的仪表板，除了答案之外什么都能展示。先从值班人员要回答的问题入手。 |
| “对所有重要事项发出告警，之后再调优” | 嘈杂的寻呼系统会让人养成忽略它的习惯。调优永远不会发生，真正的告警却会因此被错过。 |
| “把用户 ID 用作指标标签更便于调试” | 这也会让你的指标后端崩溃。高基数查询应放在日志和追踪中。 |
| “我们的两个服务没必要使用追踪” | 两个服务已经会产生日志无法回答的跨服务延迟问题。自动插桩使其成本微不足道。 |

## 危险信号

- 包含重试、队列或外部调用的功能 PR，却没有添加任何新的遥测
- 通过字符串插值而不是结构化字段构建日志行
- 没有关联 ID/请求 ID——每条日志都是孤立的
- 指标使用用户 ID、原始 URL 或错误消息文本作为标签（基数炸弹）
- 只用平均值跟踪延迟，没有百分位数
- 告警每天都会触发，却只被确认而不采取行动
- 基于原因（CPU、内存）的告警不断呼叫人工处理，而面向用户的错误率却未受监控
- 日志中出现密钥、令牌或完整的请求正文
- 将“在我的机器上可以运行”作为生产功能运行状况良好的唯一证据

## 验证

完成功能的可观测性埋点后，请确认：

- [ ] 已记录该功能的值班问题，并且每个信号都对应其中一个问题
- [ ] 所有日志输出均为结构化格式（JSON），事件名称保持稳定，并且每一行都包含关联 ID
- [ ] 任何日志行中均不包含密钥、令牌或未经脱敏的个人身份信息（抽查实际输出）
- [ ] 每个新端点和每个外部依赖都有 RED 指标，且标签集规模有界
- [ ] 延迟使用直方图；可查询 p95/p99
- [ ] 可以在追踪 UI 中端到端跟踪单个请求，且不存在中断的 span
- [ ] 每个新告警都基于症状，包含运行手册链接，并且已测试触发过一次
- [ ] 在预发布环境中人为引入的故障，无需阅读源代码，仅通过遥测数据即可定位

如需查看此列表的一览版本（包括发布前的可观测性埋点门禁），请参阅 `../../references/observability-checklist.md`。