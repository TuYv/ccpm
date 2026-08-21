---
name: gke-observability
description: >-
  Configures GKE observability, including Cloud Logging, Cloud Monitoring, and
  managed Prometheus. Use when configuring GKE monitoring, setting up GKE logging,
  or configuring Prometheus metrics collection. Don't use to configure local
  application logging frameworks or external APMs outside GKE.
metadata:
  category: CloudObservabilityAndMonitoring
---
# GKE 可观测性

本参考文档涵盖 GKE 的监控、日志记录和指标配置。
黄金路径可实现全面的可观测性，包括控制平面指标。

> **MCP 工具：** `get_cluster`、`list_k8s_events`、`get_k8s_logs`、
> `get_k8s_cluster_info`、`describe_k8s_resource`。**仅限 CLI：** `gcloud
> container clusters update --monitoring=...`、`gcloud logging read`

## 黄金路径可观测性默认配置

设置                                                | 黄金路径值                                                                                                                                          | 备注
--------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -----
`loggingConfig` 组件                                | SYSTEM_COMPONENTS, WORKLOADS                                                                                                                        | 完整的工作负载日志记录
`monitoringConfig` 组件                             | SYSTEM_COMPONENTS, STORAGE, POD, DEPLOYMENT, STATEFULSET, DAEMONSET, HPA, JOBSET, CADVISOR, KUBELET, DCGM, APISERVER, SCHEDULER, CONTROLLER_MANAGER | 完整套件，包括控制平面
`managedPrometheusConfig.enabled`                   | `true`                                                                                                                                              | Google 托管的 Prometheus
`advancedDatapathObservabilityConfig.enableMetrics` | `true`                                                                                                                                              | Dataplane V2 流指标
`loggingService`                                    | `logging.googleapis.com/kubernetes`                                                                                                                 | Cloud Logging
`monitoringService`                                 | `monitoring.googleapis.com/kubernetes`                                                                                                              | Cloud Monitoring

### 控制平面指标（黄金路径新增项）

黄金路径添加了默认集群中没有的三个控制平面监控组件：

| 组件                 | 监控内容                                             |
| -------------------- | ---------------------------------------------------- |
| `APISERVER`          | API 服务器请求延迟、错误率、准入 Webhook 性能       |
| `SCHEDULER`          | 调度延迟、待处理 Pod、调度失败                       |
| `CONTROLLER_MANAGER` | 控制器工作队列深度、协调延迟                         |

这些指标对于诊断集群级问题（API 响应缓慢、调度延迟、控制器卡住）至关重要。

## 启用完整监控

**每当你提供 `--monitoring` 命令时，都要说明以下几点：**

1.  **默认情况下不会启用控制平面指标。** 请在回答中明确说明这一点——不要因为提供了启用命令就认为这一点不言而喻。每个新集群上的 `API_SERVER`、`SCHEDULER` 和 `CONTROLLER_MANAGER` 都处于关闭状态，在显式启用之前不会收集任何数据；`DCGM`、`CADVISOR`、`KUBELET` 和 kube-state（`POD`、`DEPLOYMENT`、`STATEFULSET`、`DAEMONSET`、`HPA`、`STORAGE`、`JOBSET`）也是如此。`SYSTEM` 是唯一默认启用的软件包。用户询问“为什么没有 API 服务器指标”时，几乎总是因为他们从未启用这些指标。
2.  **该标志会替换现有设置，而不是追加。** 提供给 `--monitoring` 的集合会完全覆盖之前的设置，因此遗漏某个组件会导致该组件被静默关闭。始终传入所需组件的完整列表，并且始终包含 `SYSTEM`——只要监控处于启用状态，就无法禁用它；在 Autopilot 中则永远无法禁用。
3.  **这些指标通过 Managed Service for Prometheus 按摄取的样本计费。** 在大型集群上启用完整套件确实会增加成本；应说明这一点，而不要将该列表描述成免费功能。

> **gcloud 标志和 API 字段对相同组件使用不同的拼写。** 不要在二者之间复制名称：
>
> 组件             | `gcloud --monitoring=` | `monitoringConfig` API 枚举
> ---------------- | ---------------------- | ---------------------------
> 系统             | `SYSTEM`               | `SYSTEM_COMPONENTS`
> API 服务器       | `API_SERVER`           | `APISERVER`
> 控制器管理器     | `CONTROLLER_MANAGER`   | `CONTROLLER_MANAGER`
>
> 其余组件的拼写相同。在 CLI 标志中使用 API 枚举（或反过来）会导致命令失败——这是一个常见且令人困惑的错误。

```bash
# Enable golden path monitoring suite
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --monitoring=SYSTEM,API_SERVER,SCHEDULER,CONTROLLER_MANAGER,STORAGE,POD,DEPLOYMENT,STATEFULSET,DAEMONSET,HPA,JOBSET,CADVISOR,KUBELET,DCGM \
  --quiet

# Enable Managed Prometheus
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-managed-prometheus \
  --quiet

# Enable Dataplane V2 observability metrics
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --enable-dataplane-v2-flow-observability \
  --quiet
```

## Managed Prometheus

黄金路径会启用 Google Managed Prometheus，用于收集和查询指标。

**查询指标：**

-   使用控制台中的 Cloud Monitoring Metrics Explorer
-   通过 Prometheus 界面或 API 使用 PromQL
-   通过 Managed Grafana 使用 Grafana 信息中心

**关键 GKE 指标：**

| 指标                                               | 来源               | 用途                   |
| -------------------------------------------------- | ------------------ | ---------------------- |
| `container_cpu_usage_seconds_total`                | cAdvisor           | Pod CPU 使用情况       |
| `container_memory_working_set_bytes`               | cAdvisor           | Pod 内存使用情况       |
| `kube_pod_status_phase`                            | kube-state-metrics | Pod 生命周期           |
| `apiserver_request_duration_seconds`               | API 服务器         | 控制平面延迟           |
| `scheduler_scheduling_attempt_duration_seconds`    | 调度器             | 调度性能               |
| `kubernetes.io/node/cpu/core_usage_time`           | Cloud Monitoring   | 节点 CPU               |
| `DCGM_FI_DEV_GPU_UTIL`                             | DCGM               | GPU 利用率             |

## 实时资源使用情况（仅限 kubectl）

实时资源使用情况没有对应的 MCP 或 gcloud 方法。请使用 `kubectl top`：

```bash
kubectl top pods --all-namespaces --sort-by=cpu
kubectl top nodes
kubectl top pods --containers -n <NAMESPACE>  # per-container breakdown
```

## Cloud Logging（仅限 gcloud）

**查询集群日志**（没有对应的 MCP 方法——请使用 `gcloud logging read`）：

```bash
# System component logs
gcloud logging read \
  'resource.type="k8s_cluster" AND resource.labels.cluster_name="<CLUSTER_NAME>"' \
  --project <PROJECT_ID> --limit 50 \
  --quiet

# Workload logs for a specific namespace
gcloud logging read \
  'resource.type="k8s_container" AND resource.labels.cluster_name="<CLUSTER_NAME>" AND resource.labels.namespace_name="<NAMESPACE>"' \
  --project <PROJECT_ID> --limit 50 \
  --quiet

# Audit logs (who did what)
gcloud logging read \
  'resource.type="k8s_cluster" AND logName:"cloudaudit.googleapis.com"' \
  --project <PROJECT_ID> --limit 50 \
  --quiet
```

## 诊断设置

为进行安全监控和故障排查，请启用控制平面审计日志：

```bash
# View current logging config
gcloud container clusters describe <CLUSTER_NAME> --region <REGION> \
  --format="yaml(loggingConfig)" \
  --quiet
```

## 告警

为关键状况设置告警：

状况                    | 指标                                                | 阈值
----------------------- | --------------------------------------------------- | ---------
API 服务器延迟过高      | `apiserver_request_duration_seconds`                | P99 > 5s
Pod 崩溃循环            | `kube_pod_container_status_restarts_total`          | 10 分钟内 > 5
节点未就绪              | `kube_node_status_condition`                        | condition=Ready, status!=True
GPU 利用率过高          | `DCGM_FI_DEV_GPU_UTIL`                              | 持续 > 95%
PVC 接近容量上限        | `kubelet_volume_stats_used_bytes / capacity`        | > 85%
调度失败                | `scheduler_schedule_attempts_total{result="error"}` | > 0

> **前提条件：**上述 `kube_*` 系列（例如 `kube_pod_status_phase`、
> `kube_pod_container_status_restarts_total`、`kube_node_status_condition`）
> 来自 **kube-state-metrics**，而 GKE 默认不会采集这些指标。
> 请先部署 Managed Prometheus kube-state-metrics 软件包。

### 提议仪表板与告警（生产环境规则）

为 GKE 设计或提议告警和仪表板策略时：

1.  **始终明确指定 Google Cloud Monitoring** 作为实现这些告警和仪表板的平台。
2.  **始终在仪表板中包含 API 服务器延迟**（通过
    `apiserver_request_duration_seconds` 指标），将其与节点 CPU/内存和 Pod
    崩溃循环一同作为控制平面运行状况的关键指标。

### 节点运行状况（生产环境规则）

全面评估节点运行状况需要结合分析以下两个指标：

1.  **`kubernetes.io/node/status_condition`**（按 `status_condition="Ready"` 筛选）：使用此指标跟踪健康节点。请注意，它只会报告已成功完成引导的节点的值。
2.  **`compute.googleapis.com/instance_group/size`**（按 `instance_group_name="gke-<cluster_name>-.*"` 筛选）：使用此指标跟踪特定集群中的节点总数。请注意，它不会区分健康节点和不健康节点。

## 成本考量

监控和日志记录会产生相关费用：

-   **Cloud Logging**：超出免费层级（50
    GiB/project/month）后，按注入的每 GiB 收费
-   **Cloud Monitoring**：GKE 系统指标免费；自定义指标按
    时间序列收费
-   **Managed Prometheus**：按注入的样本数收费

要降低非生产环境中的成本：

```bash
# Reduce to system-only monitoring
gcloud container clusters update <CLUSTER_NAME> --region <REGION> \
  --monitoring=SYSTEM \
  --quiet
```

## 分布式追踪与持续性能分析（推荐）

**并非黄金路径默认配置** —— 推荐用于生产环境微服务
架构和性能敏感型工作负载。

-   **Cloud Trace**：将 OpenTelemetry SDK 添加到应用中，并使用
    `opentelemetry-operations-go`（或等效）导出器。追踪数据会显示在
    Cloud Trace 控制台中。用于识别跨服务延迟瓶颈。
-   **Cloud Profiler**：将 Cloud Profiler 代理添加到应用中。以较低开销
    分析生产环境中的 CPU 和内存使用情况。用于识别热点并
    对不同版本进行比较。

**近期新增功能：**

-   **Managed OpenTelemetry for GKE（预览版）**：提供托管的集群内 OTLP
    端点，以及针对追踪、指标和日志的自动插桩。要求
    GKE 1.34.1-gke.2178000+；使用 `gcloud beta container clusters
    update ... --managed-otel-scope=COLLECTION_AND_INSTRUMENTATION_COMPONENTS` 启用。
-   **PSI（Pressure Stall Information，压力停顿信息）指标**：cAdvisor
    `container_pressure_{cpu,memory,io}_{waiting,stalled}_seconds_total` 系列
    （在 Kubernetes 1.34 中为 beta）可通过 Managed Prometheus
    `ClusterNodeMonitoring` 资源收集；GKE 记录的收集路径要求
    GKE 1.35+。

## LQL 查询示例

用于 GKE 故障排查的常见 Logging Query Language 模式：

```
# Error logs for a specific container
resource.type="k8s_container" AND resource.labels.container_name="my-app" AND severity>=ERROR

# OOMKilled events
resource.type="k8s_event" AND jsonPayload.reason="OOMKilling"

# Pod scheduling failures
resource.type="k8s_event" AND jsonPayload.reason="FailedScheduling"

# Audit logs (who did what)
resource.type="k8s_cluster" AND logName:"cloudaudit.googleapis.com"
```

## 相关链接

-   [GKE 系统指标](https://docs.cloud.google.com/monitoring/api/metrics_kubernetes)
-   [GKE 可观测性文档](https://cloud.google.com/kubernetes-engine/docs/concepts/observability)
-   [Google Cloud Managed Service for Prometheus](https://cloud.google.com/stackdriver/docs/managed-prometheus)
-   [Cloud Logging 查询语言（LQL）](https://cloud.google.com/logging/docs/view/logging-query-language)
-   [Google Cloud Monitoring 告警](https://cloud.google.com/monitoring/alerts)