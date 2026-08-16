---
name: gke-ai-troubleshooting-tpu-vbar-oom
description: >-
  Diagnoses and prevents vbar_control_agent segfaults, out-of-memory (OOM) errors,
  and TPU device initialization failures on TPU v6e nodes in GKE caused by race
  conditions during TPU device resets or high-frequency metrics polling. Use when
  troubleshooting vbar_control_agent crashes, memory cgroup OOMs in serial console
  logs, tpu-device-plugin metrics checksum corruption errors, or custom TPU metrics
  collection conflicts on GKE TPU v6e nodes. Don't use for general non-TPU container
  OOM troubleshooting or standard GKE node lifecycle operations.
metadata:
  category: CloudObservabilityAndMonitoring
---
# TPU 连接失败和 VBAR OOM 故障排查

使用此技能系统地诊断和预防 TPU v6e 节点上的 `vbar_control_agent`
段错误和内存不足（OOM）错误。

## ⚠️ 前提条件

-   必须为项目启用 Cloud Logging。
-   可通过 `gcloud` 或同等工具访问项目和集群。

## 🔍 诊断工作流

### 步骤 0：获取上下文并定义时间窗口

使用可用的 GCP/GKE 工具独立收集所需上下文，或使用提供的
`{variable}` 占位符：

-   `{project_id}`：GCP 项目 ID（例如 `customer-ai-project-123`）。
-   `{cluster_name}`：GKE 集群名称（例如 `tpu-cluster-prod`）。
-   `{node_name}`：节点名称或实例 ID（例如 `tpu-node-1`）。
-   `{workload_name}`：工作负载名称 / JobSet 名称（例如
    `my-training-job-456`）。
-   `{namespace}`：工作负载命名空间。
-   `{issue_time}`：问题发生时间戳（例如 `2026-04-14T20:00:00Z`）。

#### 时间处理与执行规则

1.  **窗口计算**：如果提供了问题时间戳 `{issue_time}`，
    则将查询时间窗口计算为从 `[{issue_time} - 30m]` 到
    `[{issue_time} + 30m]`。
    -   令 `{start_time}` = `{issue_time} - 30m`
    -   令 `{end_time}` = `{issue_time} + 30m`
2.  **信息说明与实时执行**：如果用户请求属于信息咨询
    或查询构建（例如“How can I check...”“How do I determine...”），
    或者当前无法主动定位实时 GCP 项目资源，则直接
    输出计算后的时间窗口、日志名称和 Cloud Logging 过滤器
    模板，而不尝试执行实时日志命令。

### 步骤 1：检查 `vbar_control_agent` OOM

在串行控制台日志（`serialconsole.googleapis.com%2fserial_port_1_output`）中
查找来自 `vbar_control_agent` 的特定 `out of memory` 消息。

-   **使用的工具**：`query_logs`（用于实时诊断）
-   **过滤器模板**：

**串行控制台日志（OOM）：**

```sql
logName="projects/{project_id}/logs/serialconsole.googleapis.com%2fserial_port_1_output"
AND labels."compute.googleapis.com/resource_name"="{node_name}"
AND SEARCH(text_payload, "Memory cgroup out of memory: Killed process .* (vbar_control_ag)")
AND timestamp >= "{start_time}"
AND timestamp <= "{end_time}"
```

-   **判断逻辑**：是否存在与
    `vbar_control_agent` 相关的 `Memory cgroup out of memory` 消息。指向
    `libtpu::tpunetd::VBARControlHelper::MetricsReadFromVBAR` 的堆栈跟踪是一个强有力的
    指标。
-   **自动化**：报告发现后自动继续下一步。
-   **参考资料**：有关日志模式示例，请参阅 `references/failure_signatures.md`。

### 步骤 2：调查 `tpu-device-plugin` 指标获取失败 [低风险]

检查 `tpu-device-plugin` 是否报告指标获取失败。

-   **使用的工具**：`query_logs`
-   **过滤器模板**：

```sql
resource.type="k8s_container"
AND resource.labels.project_id="{project_id}"
AND resource.labels.cluster_name="{cluster_name}"
AND resource.labels.container_name="tpu-device-plugin"
AND severity=ERROR
AND textPayload:"metrics fetch failed for .* deviceID and .* device path with error: checksum didn't match with the metrics data. Corrupt data found"
AND timestamp >= "{start_time}"
AND timestamp <= "{end_time}"
```

-   **逻辑**：出现包含 "metrics fetch failed" 和 "checksum didn't
    match" 的错误，表明 vBAR 内存已损坏。
-   **自动化**：报告发现后，自动进入下一步。

### 第 3 步：检查是否使用自定义指标收集 [低风险]

检查集群配置、工作负载或容器规范，以确定是否部署了自定义 TPU 指标收集机制。

-   **操作**：检查是否部署了自定义脚本或代理（例如使用
    `libtpu.sdk.tpumonitoring`），并频繁从 `vBAR Control Agent` 查询
    `GetHostMetrics`。
-   **验证命令**：

    -   **Kubectl 搜索（检查工作负载环境变量/规范）**：

    ```bash
    kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"/"}{.metadata.name}{"\t"}{.spec.containers[*].image}{"\n"}{end}'
    ```

    -   **日志搜索过滤条件（`query_logs`）**：

    ```sql
    resource.type="k8s_container"
    AND resource.labels.project_id="{project_id}"
    AND resource.labels.cluster_name="{cluster_name}"
    AND textPayload:"libtpu.sdk.tpumonitoring"
    AND timestamp >= "{start_time}"
    AND timestamp <= "{end_time}"
    ```

-   **逻辑**：确认使用了自定义指标收集机制，有助于验证竞态条件这一假设。

## 🛠️ 解决工作流

### 解决方案 1：暂时禁用自定义指标收集 [高风险]

如果发现自定义指标收集代理，建议将其禁用。

-   **操作**：建议禁用自定义指标收集器。
-   **理由**：防止在设备重置期间读取 vBAR，从而避免崩溃和 OOM。

### 解决方案 2：等待 `vbar_control_agent` 弹性更新 [低风险]

说明永久修复将在未来的 GKE 版本中提供。

-   **操作**：建议在修复可用后升级 GKE。
-   **理由**：更新后的代理将能够抵御内存损坏，并妥善处理从未绑定的 vBAR 进行的读取。

## 📋 复制粘贴检查清单

-   [ ] 获取上下文并计算 `[{start_time}, {end_time}]` 时间窗口。
-   [ ] 使用 `query_logs` 检查 `vbar_control_agent` 段错误和 OOM。
-   [ ] 使用 `query_logs` 调查 `tpu-device-plugin` 故障。
-   [ ] 检查是否使用了自定义指标收集机制。
-   [ ] 如果适用，建议禁用自定义指标收集。
-   [ ] 建议等待弹性更新。