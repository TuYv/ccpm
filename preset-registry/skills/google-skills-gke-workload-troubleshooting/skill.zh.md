---
name: gke-workload-troubleshooting
metadata:
  category: Containers
description: >-
  Diagnoses GKE workload failures (CrashLoopBackOff, OOMKilled, ImagePullBackOff, Pending, etc.) via logs and events. Use when pods fail to start or crash repeatedly. Don't use for GKE cluster infrastructure provisioning, node pool creation, or non-Kubernetes Google Cloud services.
---
# GKE 工作负载故障排查技能

使用此技能系统性地诊断和解决部署在 GKE 集群中的应用程序工作负载故障。此技能以非交互方式运行，并在提出清单或配置修正方案之前，强制遵守只读诊断边界。

## 🔍 诊断工作流

### 步骤 0：非交互式上下文发现与时间窗口定义

1.  **参数提取**：以非交互方式从用户提示、当前 `SETTINGS.md` 或当前环境默认值中提取所需上下文（`project_id`、`cluster_name`、`cluster_location`、`workload_name`、`workload_namespace`）：

    -   如果省略了 `workload_namespace`，则默认设为 `default`。
    -   从当前环境中推断缺失的集群参数（`kubectl
        config current-context` 或 `gcloud config get-value project`）。
    -   优先从提示和环境默认值中进行非交互式上下文发现，以确保自主执行流程。

2.  **集群凭据与回退模式**：

    -   尝试获取凭据：`gcloud container clusters get-credentials
        {cluster_name} --region/--zone {cluster_location}`
    -   **回退/试运行模式**：如果集群无法访问、不存在或实时命令执行失败（例如在沙盒评估、试运行模式或离线分析中）：
        -   限制重试次数，避免在集群无法访问的场景中耗尽资源和造成上下文溢出。
        -   立即提供供人工操作人员运行的完整 `kubectl` 诊断命令序列。
        -   根据报告的症状综合分析根本原因，并输出建议的 GitOps 清单修复方案。

3.  **时间处理与回退方案**：

    -   **确定问题时间戳 ({issue_time})**：
        -   **提供了具体时间**：如果用户提供了具体时间戳，则将其用作 `{issue_time}`。
        -   **提供了相对时间（例如，"5 minutes ago"）**：根据当前系统时间动态计算对应的 UTC 时间戳，并将其用作 `{issue_time}`。
        -   **未提供时间（默认）**：使用当前系统时间作为 `{issue_time}`。
    -   **窗口计算**：以 `{issue_time}` 为中心设置一个 1 小时的查询窗口（`start_time` = `{issue_time} - 30m`，`end_time` = `{issue_time} + 30m`）。

--------------------------------------------------------------------------------

### 步骤 1：分析 Pod 状态和状况

检查工作负载的活动 Pod 状态和控制器状态。

**诊断命令：**

```bash
# 1. Inspect the deployment's actual selector labels:
kubectl get deployment {workload_name} -n {workload_namespace} -o jsonpath='{.spec.selector.matchLabels}'
# 2. Query the pods using the returned labels, for example:
kubectl get pods -l {selector_labels} -n {workload_namespace}
kubectl get deploy/{workload_name} -n {workload_namespace} -o yaml
```

#### 诊断决策树：

-   **阶段：Pending**：
    -   Pod 无法调度到任何节点。直接进入 **步骤 2（查询命名空间事件）**。
-   **状态：CrashLoopBackOff / Error**：

    -   容器正在启动，但反复退出。使用以下命令检查终止状态：

    ```bash
    kubectl get pod {pod_name} -n {workload_namespace} -o jsonpath='{.status.containerStatuses[*].lastState.terminated}'
    ```

    -   **ExitCode: 137 (OOMKilled)**：已达到内存限制。进入 **步骤 3
        （检查日志）**，并检查容器启动命令，以区分应用层内存泄漏/循环与基础设施
        容量限制不匹配，然后进入 **步骤 5** 提出修复方案。
    -   **ExitCode: 1 或其他非零代码**：应用程序代码崩溃。
        直接进入 **步骤 3（检查日志）**。

-   **状态：ContainerCreating**：

    -   容器在卷挂载、网络设置或镜像拉取期间被阻塞。
        直接进入 **步骤 2（查询命名空间事件）**。

--------------------------------------------------------------------------------

### 步骤 2：查询命名空间事件

在 GKE 中查找基础设施、卷、镜像或调度警报。

**诊断命令：**

```bash
kubectl get events -n {workload_namespace} --sort-by='.metadata.creationTimestamp'
# Or query Cloud Logging for historical GKE events within the time window:
gcloud logging read "resource.type=\"k8s_cluster\" AND logName=\"projects/{project_id}/logs/events\" AND jsonPayload.involvedObject.namespace=\"{workload_namespace}\"" --start-time="{start_time}" --end-time="{end_time}" --project="{project_id}"
```

*注意：获取已排序的事件列表，并手动检查事件时间戳
（CreationTimestamp/LastSeen），以识别在
`{start_time}` 和 `{end_time}` 时间窗口内发生的故障。*

#### 特征标识符：

-   **`FailedScheduling`**：节点资源耗尽。查找类似
    `0/3 nodes are available: 3 Insufficient memory.` 的消息，或检查是否缺少节点亲和性
    容忍配置（例如 Spot VM 污点）。
-   **`FailedMount`**：
    -   缺少 PersistentVolumeClaim（`PVC`）。
    -   缺少 Secret（`Secret "{secret_name}" not found`）。
    -   缺少 ConfigMap（`ConfigMap "{configmap_name}" not found`）。
-   **`Failed` / `BackOff`（镜像拉取）**：
    -   镜像标签错误，或缺少镜像仓库身份验证（例如
        ImagePullBackOff）。
    -   **镜像标签错误的解决步骤**：
    *   确定拉取失败的容器镜像名称和无效标签。
    *   检查 Git 仓库历史记录，查找此工作负载最后一个已知可用的镜像标签。
        运行 `git log -p -S "{image_name}" --
        {manifest_file_path}`（或对包含清单的文件夹使用 `git log`），以确定 Git 中之前可用的标签。
    *   如果无效标签是 git 历史记录中的近期变更，请将其与
        最近一次成功提交中的标签进行比较。
    *   建议将镜像标签还原为最后一个可用版本，或
        修正清单补丁中的标签版本。

--------------------------------------------------------------------------------

### 步骤 3：检查应用程序日志

从应用程序运行时中提取异常和堆栈跟踪。

**诊断命令：**

```bash
# Check current active log stream (handles multi-container pods)
kubectl logs {pod_name} -n {workload_namespace} --all-containers --tail=100

# Check logs from previously terminated container instances (handles multi-container pods)
kubectl logs {pod_name} -n {workload_namespace} --all-containers -p --tail=100
```

#### 特征标识：

-   **内存不足（OOM）分析**：检查容器日志和启动命令
    （`spec.containers[*].command`）。区分**应用程序代码泄漏/循环**
    （无限制地向数组追加数据、内存泄漏特征）与**基础设施容量上限不匹配**
    （合理的工作负载需求超出限制）。
-   **堆栈跟踪/未处理异常**：查找特定于语言的堆栈跟踪
    （例如 `panic:`、`NullPointerException`、`Traceback (most recent
    call)`）。这表示存在应用程序缺陷。
-   **出站网络超时**：查找连接超时（例如 `Connection
    timed out`、`dial tcp: i/o timeout`）。继续执行**步骤 4（验证
    连接性）**。
-   **权限错误（ReadOnlyRootFilesystem）**：查找写入错误（例如，
    写入 `/tmp` 或 `/var/log` 时出现 `Read-only file system`、
    `Permission denied`）。建议在清单中为该目录添加 `emptyDir`
    卷挂载。

--------------------------------------------------------------------------------

### 步骤 4：验证服务连接性和网络策略

排查与其他服务的连接中断问题。

**诊断命令：**

```bash
# Verify target endpoint is active
kubectl get endpoints {target_service_name} -n {target_namespace}

# Query network policies inside namespace
kubectl get networkpolicies -n {workload_namespace} -o yaml
```

#### 逻辑与试运行回退方案：

1.  **实时集群模式**：

    -   如果 `kubectl get endpoints` 返回空列表，则目标微服务本身
        无法完成调度或启动（排查目标服务）。
    -   如果端点存在，但日志显示超时，请分析 `NetworkPolicy`
        出站流量阻止规则，以验证是否允许流向目标服务 IP/端口的出站流量。

2.  **沙盒/试运行模式**：

    -   如果实时 `kubectl` 查询失败或集群连接不可用，请勿
        重试访问实时集群或反复尝试连接。
    -   立即检查应用程序源代码（例如 `worker.py`、
        `app.go`、数据库连接字符串）或 Deployment 清单，以确定
        目标服务主机名（例如 `account-db`）和目标端口（例如
        `5432`）。
    -   向用户提供确切的 `kubectl get endpoints` 和 `kubectl get
        networkpolicies` 命令，并生成所需的 `NetworkPolicy`
        出站流量补丁，以允许流量访问目标服务和端口。

--------------------------------------------------------------------------------

### 步骤 5：提出 GitOps 修正方案

遵循 GitOps 边界，**不要直接将补丁应用到集群**。

1.  为人工操作员汇总根因分析（例如：
    *“payment-api 因退出代码 137 而失败，因为其内存限制设置为
    256Mi，而实际使用量激增至 270Mi”*）。
2.  生成修正后的 YAML 清单补丁（例如，提高内存限制、添加缺失的
    Secret 挂载，或为 Spot 节点添加容忍度）。
3.  检查是否已存在针对此工作负载/故障的分支或拉取请求（PR）。
    如果存在，则更新现有分支/PR 或通知用户，而不是创建重复项。
    否则，创建分支、提交更改、在 GitHub 上创建拉取请求（PR），
    然后结束工作流（不要等待人工合并）。