---
name: cloud-run-alert-configuration
metadata:
  category: Serverless
description: >-
  Configures best-practice, high-signal alerting policies for Google Cloud Run
  resources (services, jobs, and worker pools) based on seasoned SRE practices. Use
  when analyzing, recommending, writing, or deploying Terraform PromQL alerting
  policies to monitor Cloud Run error rates (4xx/5xx), request latency, container instance
  saturation (warning/critical), container CPU/memory utilization and allocation, billable
  instance time, job execution status, and worker pool queue backlog. Don't use for
  GKE workloads (use gke-alert-configuration) or Compute Engine VMs.
allowed-tools:
  - terraform
  - gcloud
---
# Cloud Run 告警配置

基于 Terraform 和 PromQL（Cloud Monitoring）的 Google Cloud Run 生产级可观测性。该能力基于 SRE 最佳实践，严格聚焦于可执行的用户影响和扩缩容边界。

--------------------------------------------------------------------------------

## 关键规则

*   **Gcloud SDK 先决条件**：在本技能中与此相关以及任何其他 `gcloud` 相关任务（例如资源发现、参数检查或指标范围集中化），请确保已安装 Google Cloud SDK（`gcloud`），并已完成身份验证且已配置目标项目（例如通过
    `gcloud auth print-access-token` 和 `gcloud config get-value project`）。如果
    `gcloud` 缺失或未配置，请指导用户配置 SDK，或回退到解析本地工作区 `.tf` 文件。
*   **自主发现（配置优先，CLI 其次）**：若可发现则绝不再询问名称、区域或上限。
    *   **配置优先**：优先解析工作区中的本地 `.tf` 文件。
        查找 `google_cloud_run_v2_service`、`google_cloud_run_service`、
        `google_cloud_run_v2_job`、`max_instance_count` 以及 Knative `maxScale`
        注解（`autoscaling.knative.dev/maxScale` 或 `run.googleapis.com/maxScale`）。
    *   **CLI 次之（gcloud 回退）**：若通过配置无法发现，请先验证 `gcloud` SDK 已安装且已配置有效项目
        （`gcloud config get-value project`）。然后执行 `gcloud run services list --format="json"`、
        `gcloud run jobs list --format="json"`，或 `gcloud monitoring metrics-scopes list`。
*   **工作负载路由**：始终先识别工作负载目标，并遵循其对应参考指南：
    *   HTTP 服务请参阅 [services.md](references/services.md)
    *   Cloud Run Jobs 请参阅 [jobs.md](references/jobs.md)
    *   Worker Pools 请参阅 [worker_pools.md](references/worker_pools.md)
*   **显式默认值与用户覆盖**：
    *   始终使用目标工作负载参考文件中指定的所有常量的显式默认值（SLO 目标、延迟阈值、SLA、饱和度上限）。
    *   在最终摘要输出中说明正在应用的默认值，并明确告知用户可通过 Terraform 变量或提示输入对任何默认常量进行自定义或覆盖。
*   **指标范围集中化**：运行 `gcloud beta monitoring metrics-scopes
    list projects/[PROJECT_ID]`。如果存在范围项目
    （`locations/global/metricsScopes/[SCOPING_PROJECT_ID]`），则在 Terraform 资源中设置
    `project = "[SCOPING_PROJECT_ID]"`。
*   **PromQL `duration`（复测窗口）规则**：
    *   **回溯窗口 $\le$ 25h**：将 `duration = "300s"`（5m 缓冲）设置为
        以吸收瞬时波动和扩缩容延迟（即时作业失败告警除外，此类告警使用
        `duration = "0s"`）。
    *   **回溯窗口 $> 25$h**（例如 3d/7d 慢燃烧）：**完全省略 `duration`**
       （或设置为 `0s`）。Cloud Monitoring 会拒绝在回溯窗口超过 25h 时带有
        `duration` 的 PromQL 查询（`INVALID_ARGUMENT`）。

*   **Terraform 标准**：使用 `google_monitoring_alert_policy` 和 `condition_prometheus_query_language` 输出整洁的 `.tf` 配置。  
    包含 `alert_strategy { auto_close = "604800s" }` 并将
    `notification_channels = var.notification_channels` 参数化。

## 工作流程步骤

### 1. 发现与目标识别（先配置，后 CLI）

*   **配置优先**：扫描工作区 `.tf` 文件，查找
    `google_cloud_run_v2_service`、`google_cloud_run_service`、`google_cloud_run_v2_job`
    以及 worker pool 资源。
*   **CLI 次之**：若配置中未发现上述资源，则确认 `gcloud` 已安装且已配置有效项目
    （`gcloud config get-value project`），然后执行 `gcloud` 发现命令。
*   按工作负载类型对目标进行分组：HTTP 服务、作业或 Worker Pools。
*   使用 `gcloud monitoring metrics-scopes` 确定作用域项目。

### 2. 配置警报

*   按相应指南生成警报策略：
    *   **HTTP 服务**：打开 [services.md](references/services.md)。应用涵盖可用性 SLO（5xx）、请求延迟（P95/P99）、客户端错误（4xx）、容器实例饱和度、容器 CPU/内存使用率、流量异常，以及可计费实例时间的完整警报套件。
    *   **批处理作业**：打开 [jobs.md](references/jobs.md)。应用即时作业执行失败警报。
    *   **Worker Pools**：打开 [worker_pools.md](references/worker_pools.md)。
        应用 4 项标准套件（Task Success SLO 快/慢燃、Backlog ETD、Message Age SLA）。

### 3. Terraform 生成与复核

*   将 HCL 配置写入 `.tf` 文件，并显式参数化默认值。
*   列出已应用的默认值，并提醒用户可以覆盖任何常量。
*   提供一份清晰的通俗说明，拆解 PromQL 逻辑与触发阈值。

--------------------------------------------------------------------------------

## 附加资源

*   [Google Cloud Run 文档](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run.md.txt)
*   [Google Cloud Monitoring PromQL 文档](https://docs.cloud.google.com/monitoring/promql/promql-in-monitoring.md.txt)
*   [Terraform 中的 Google Cloud 警报策略](https://docs.cloud.google.com/monitoring/alerts/terraform.md.txt)
*   [Google SRE Workbook：基于 SLO 的警报](https://sre.google/workbook/alerting-on-slos/)