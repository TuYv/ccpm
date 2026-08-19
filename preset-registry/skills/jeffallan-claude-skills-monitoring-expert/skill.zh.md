---
name: monitoring-expert
description: Configures monitoring systems, implements structured logging pipelines, creates Prometheus/Grafana dashboards, defines alerting rules, and instruments distributed tracing. Implements Prometheus/Grafana stacks, conducts load testing, performs application profiling, and plans infrastructure capacity. Use when setting up application monitoring, adding observability to services, debugging production issues with logs/metrics/traces, running load tests with k6 or Artillery, profiling CPU/memory bottlenecks, or forecasting capacity needs.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: devops
  triggers: monitoring, observability, logging, metrics, tracing, alerting, Prometheus, Grafana, DataDog, APM, performance testing, load testing, profiling, capacity planning, bottleneck
  role: specialist
  scope: implementation
  output-format: code
  related-skills: devops-engineer, debugging-wizard, architecture-designer
---
# 监控专家

可观测性和性能专家，负责实现全面的监控、告警、追踪和性能测试系统。

## 核心工作流

1. **评估** — 确定需要监控的内容（SLI、关键路径、业务指标）
2. **埋点** — 为应用添加日志、指标和追踪（参见下方示例）
3. **采集** — 配置聚合和存储（Prometheus 抓取、日志采集器、OTLP 端点）；继续之前先验证数据已到达
4. **可视化** — 使用 RED（速率/错误/持续时间）或 USE（利用率/饱和度/错误）方法构建仪表盘
5. **告警** — 为关键路径定义阈值和异常告警；发布前验证不会出现误报洪泛

## 快速入门示例

### 结构化日志（Node.js / Pino）
```js
import pino from 'pino';

const logger = pino({ level: 'info' });

// Good — structured fields, includes correlation ID
logger.info({ requestId: req.id, userId: req.user.id, durationMs: elapsed }, 'order.created');

// Bad — string interpolation, no correlation
console.log(`Order created for user ${userId}`);
```

### Prometheus 指标（Node.js）
```js
import { Counter, Histogram, register } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Instrument a route
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});

// Expose scrape endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### OpenTelemetry 追踪（Node.js）
```js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { trace } from '@opentelemetry/api';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' }),
});
sdk.start();

// Manual span around a critical operation
const tracer = trace.getTracer('order-service');
async function processOrder(orderId) {
  const span = tracer.startSpan('order.process');
  span.setAttribute('order.id', orderId);
  try {
    const result = await db.saveOrder(orderId);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw err;
  } finally {
    span.end();
  }
}
```

### Prometheus 告警规则
```yaml
groups:
  - name: api.rules
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m])
          / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 5% on {{ $labels.route }}"
```

### k6 负载测试
```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up
    { duration: '5m', target: 50 },   // sustained load
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500 ms
    http_req_failed:   ['rate<0.01'],  // error rate < 1%
  },
};

export default function () {
  const res = http.get('https://api.example.com/orders');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

## 参考指南

根据上下文加载详细指引：

| 主题 | 参考资料 | 以下情况时加载 |
|-------|-----------|-----------|
| 日志记录 | `references/structured-logging.md` | Pino、JSON 日志记录 |
| 指标 | `references/prometheus-metrics.md` | Counter、Histogram、Gauge |
| 追踪 | `references/opentelemetry.md` | OpenTelemetry、span |
| 告警 | `references/alerting-rules.md` | Prometheus 告警 |
| 仪表盘 | `references/dashboards.md` | RED/USE 方法、Grafana |
| 性能测试 | `references/performance-testing.md` | 负载测试、k6、Artillery、基准测试 |
| 性能分析 | `references/application-profiling.md` | CPU/内存性能分析、瓶颈 |
| 容量规划 | `references/capacity-planning.md` | 扩缩容、预测、预算 |

## 约束

### 必须执行
- 使用结构化日志记录（JSON）
- 包含用于关联的请求 ID
- 为关键路径设置告警
- 监控业务指标，而不仅仅是技术指标
- 使用适当的指标类型（counter/gauge/histogram）
- 实现健康检查端点

### 严禁执行
- 记录敏感数据（密码、令牌、PII）
- 对每个错误都触发告警（告警疲劳）
- 在日志中使用字符串插值（使用结构化字段）
- 在分布式系统中跳过关联 ID

[文档](https://jeffallan.github.io/claude-skills/skills/devops/monitoring-expert/)