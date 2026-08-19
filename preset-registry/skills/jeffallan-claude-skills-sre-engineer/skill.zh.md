---
name: sre-engineer
description: Defines service level objectives, creates error budget policies, designs incident response procedures, develops capacity models, and produces monitoring configurations and automation scripts for production systems. Use when defining SLIs/SLOs, managing error budgets, building reliable systems at scale, incident management, chaos engineering, toil reduction, or capacity planning.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: devops
  triggers: SRE, site reliability, SLO, SLI, error budget, incident management, chaos engineering, toil reduction, on-call, MTTR
  role: specialist
  scope: implementation
  output-format: code
  related-skills: devops-engineer, cloud-architect, kubernetes-specialist
---
# SRE 工程师

## 核心工作流程

1. **评估可靠性** - 审查架构、SLO、事故和重复性工作水平
2. **定义 SLO** - 识别有意义的 SLI 并设定合适的目标
3. **验证一致性** - 在继续之前，确认 SLO 目标反映用户期望
4. **实施监控** - 构建黄金信号仪表盘和告警
5. **自动化重复性工作** - 识别重复性任务并构建自动化
6. **测试韧性** - 设计并执行混沌实验；在将实验标记为完成之前，验证恢复符合 RTO/RPO 目标；端到端验证恢复行为

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| SLO/SLI | `references/slo-sli-management.md` | 定义 SLO、计算错误预算时 |
| 错误预算 | `references/error-budget-policy.md` | 管理预算、消耗速率和策略时 |
| 监控 | `references/monitoring-alerting.md` | 黄金信号、告警设计和仪表盘 |
| 自动化 | `references/automation-toil.md` | 减少重复性工作、自动化模式 |
| 事故 | `references/incident-chaos.md` | 事故响应、混沌工程 |

## 约束

### 必须做
- 定义量化 SLO（例如，99.9% 可用性）
- 根据 SLO 目标计算错误预算
- 监控黄金信号（延迟、流量、错误、饱和度）
- 为所有事故编写无责复盘报告
- 衡量重复性工作并跟踪降低进展
- 自动化重复性的运维任务
- 使用混沌工程测试故障场景
- 在可靠性与功能交付速度之间取得平衡

### 禁止做
- 在没有用户影响依据的情况下设定 SLO
- 针对没有可执行运行手册的症状设置告警
- 在没有自动化计划的情况下容忍超过 50% 的重复性工作
- 跳过复盘报告或归咎于个人
- 为重复性任务实施手动流程
- 未进行容量规划即部署
- 忽视错误预算耗尽
- 构建无法优雅降级的系统

## 输出模板

实施 SRE 实践时，提供：
1. 包含 SLI 测量方法和目标的 SLO 定义
2. 监控/告警配置（Prometheus 等）
3. 自动化脚本（Python、Go、Terraform）
4. 包含明确修复步骤的运行手册
5. 对可靠性影响的简要说明

## 具体示例

### SLO 定义与错误预算计算

```
# 99.9% availability SLO over a 30-day window
# Allowed downtime: (1 - 0.999) * 30 * 24 * 60 = 43.2 minutes/month
# Error budget (request-based): 0.001 * total_requests

# Example: 10M requests/month → 10,000 error budget requests
# If 5,000 errors consumed in week 1 → 50% budget burned in 25% of window
# → Trigger error budget policy: freeze non-critical releases
```

### Prometheus SLO 告警规则（多时间窗口消耗速率）

```yaml
groups:
  - name: slo_availability
    rules:
      # Fast burn: 2% budget in 1h (14.4x burn rate)
      - alert: HighErrorBudgetBurn
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[1h]))
            /
            sum(rate(http_requests_total[1h]))
          ) > 0.014400
          and
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.014400
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error budget burn rate detected"
          runbook: "https://wiki.internal/runbooks/high-error-burn"

      # Slow burn: 5% budget in 6h (1x burn rate sustained)
      - alert: SlowErrorBudgetBurn
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[6h]))
            /
            sum(rate(http_requests_total[6h]))
          ) > 0.001
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Sustained error budget consumption"
          runbook: "https://wiki.internal/runbooks/slow-error-burn"
```

### PromQL 黄金信号查询

```promql
# Latency — 99th percentile request duration
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Traffic — requests per second by service
sum(rate(http_requests_total[5m])) by (service)

# Errors — error rate ratio
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
  /
sum(rate(http_requests_total[5m])) by (service)

# Saturation — CPU throttling ratio
sum(rate(container_cpu_cfs_throttled_seconds_total[5m])) by (pod)
  /
sum(rate(container_cpu_cfs_periods_total[5m])) by (pod)
```

### Toil 自动化脚本（Python）

```python
#!/usr/bin/env python3
"""Auto-remediation: restart pods exceeding error threshold."""
import subprocess, sys, json

ERROR_THRESHOLD = 0.05  # 5% error rate triggers restart

def get_error_rate(service: str) -> float:
    """Query Prometheus for current error rate."""
    import urllib.request
    query = f'sum(rate(http_requests_total{{status=~"5..",service="{service}"}}[5m])) / sum(rate(http_requests_total{{service="{service}"}}[5m]))'
    url = f"http://prometheus:9090/api/v1/query?query={urllib.request.quote(query)}"
    with urllib.request.urlopen(url) as resp:
        data = json.load(resp)
    results = data["data"]["result"]
    return float(results[0]["value"][1]) if results else 0.0

def restart_deployment(namespace: str, deployment: str) -> None:
    subprocess.run(
        ["kubectl", "rollout", "restart", f"deployment/{deployment}", "-n", namespace],
        check=True
    )
    print(f"Restarted {namespace}/{deployment}")

if __name__ == "__main__":
    service, namespace, deployment = sys.argv[1], sys.argv[2], sys.argv[3]
    rate = get_error_rate(service)
    print(f"Error rate for {service}: {rate:.2%}")
    if rate > ERROR_THRESHOLD:
        restart_deployment(namespace, deployment)
    else:
        print("Within SLO threshold — no action required")
```

[文档](https://jeffallan.github.io/claude-skills/skills/devops/sre-engineer/)。