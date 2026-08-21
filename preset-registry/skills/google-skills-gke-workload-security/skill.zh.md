---
name: gke-workload-security
description: >-
  Audits, configures, and hardens workload-level security controls for Google
  Kubernetes Engine (GKE) applications and namespaces. Covers running cluster security
  audits (`audit_cluster.sh`), configuring Workload Identity Federation (impersonation,
  KSA/GSA binding, and pod setup), enforcing Network Policies (default-deny and Dataplane
  V2 logging), isolating high-risk pods inside GKE Sandbox (`gVisor`), enforcing Pod
  Security Standards (`restricted` labeling), and mounting Secret Manager secrets via
  CSI (`SecretProviderClass`). Use when auditing cluster security posture, isolating
  namespaces, applying pod security standards, setting up Workload Identity, or
  configuring network policies and secret volume mounts. Don't use for cluster-wide
  control plane security, RBAC hardening, Binary Authorization, Shielded Nodes,
  or enabling platform-level GKE add-ons (use gke-platform-security instead).
metadata:
  category: Security
---
# GKE 工作负载安全

此技能提供用于保护 GKE 工作负载的工作流和最佳实践。内容涵盖安全审计、身份和访问权限管理（Workload Identity）、网络安全（网络政策）和节点安全。

## 工作流

### 1. 安全审计

使用提供的审计脚本评估集群当前的安全状况。

**前提条件：**

-   `gcloud` CLI 已完成身份验证。
-   已安装 `jq` 命令行 JSON 处理器。

**功能：**

-   检查 Workload Identity。
-   验证是否已启用网络政策。
-   检查是否已启用 Shielded Nodes。
-   检查是否已启用 Binary Authorization。
-   检查 Private Cluster 配置。

**命令：**

```bash
scripts/audit_cluster.sh <cluster-name> <region> <project-id>
```

### 2. 配置 Workload Identity

Workload Identity 允许 Kubernetes Service Accounts（KSA）模拟 Google Service Accounts（GSA）。这是工作负载访问 Google Cloud API 的推荐方式。

**步骤：**

1.  **创建命名空间和 KSA：**

    ```bash
    kubectl create namespace workload-identity-test-ns
    kubectl create serviceaccount <ksa-name> \
        --namespace workload-identity-test-ns
    ```

2.  **将 KSA 绑定到 GSA：**

    ```bash
    gcloud iam service-accounts add-iam-policy-binding <gsa-name>@<project-id>.iam.gserviceaccount.com \
        --role roles/iam.workloadIdentityUser \
        --member "serviceAccount:<project-id>.svc.id.goog[workload-identity-test-ns/<ksa-name>]"
    ```

3.  **为 KSA 添加注解：**

    ```bash
    kubectl annotate serviceaccount <ksa-name> \
        --namespace workload-identity-test-ns \
        iam.gke.io/gcp-service-account=<gsa-name>@<project-id>.iam.gserviceaccount.com
    ```

4.  **验证示例 Pod：** 使用现有资源
    `assets/workload-identity-pod.yaml` 测试配置。请先更新文件中的
    `<ksa-name>`。

    ```bash
    kubectl apply -f assets/workload-identity-pod.yaml -n workload-identity-test-ns
    ```

### 3. 实施网络政策

使用网络政策控制 Pod 之间的流量。默认情况下，允许所有流量。

**启用网络政策强制执行：**

```bash
gcloud container clusters update <cluster-name> \
    --update-addons=NetworkPolicy=ENABLED \
    --region <region>
```

> [!NOTE] 如果集群使用 Dataplane V2（`--enable-dataplane-v2`），则网络
> 政策强制执行功能已内置，无需执行此步骤（且执行可能会失败）。

**应用默认拒绝政策：** 默认拒绝所有入站和出站流量，以隔离命名空间。

**将 `<target-namespace>` 替换为要隔离的命名空间。**

```bash
kubectl apply -f assets/default-deny-netpol.yaml -n <target-namespace>
```

### 4. GKE Sandbox（gVisor）Pod 隔离

在沙箱中运行不受信任的工作负载，以提供额外的内核隔离。*（注意：
在集群控制平面级别启用 Shielded Nodes（`--enable-shielded-nodes`）和 GKE Sandbox
（`--enable-gke-sandbox`）属于平台级操作，已在 `gke-platform-security` 技能中介绍。）*

**运行沙箱化 Pod：** 将 `runtimeClassName: gvisor` 添加到 Pod 规范中：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sandboxed-pod
spec:
  runtimeClassName: gvisor
  containers:
  - name: app
    image: nginx
```

### 5. Pod 安全标准

使用标签对命名空间实施安全策略。

**实施受限配置文件：**

```bash
kubectl label --overwrite ns <namespace> \
    pod-security.kubernetes.io/enforce=restricted \
    pod-security.kubernetes.io/enforce-version=latest
```

> [!NOTE] 使用 `latest` 可确保使用与集群当前版本相对应的策略。
> 你可以将其固定为特定版本（例如 `v1.30`），以将命名空间锁定到特定版本的策略。

### 6. Secret Manager 集成（CSI 驱动程序）

将 Google Cloud Secret Manager 中的 Secret 作为卷直接挂载到 Pod 中。

**前提条件**：必须在集群上启用 Secret Manager CSI 驱动程序。

**SecretProviderClass 示例：**

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: my-secret-provider
spec:
  provider: gcp
  parameters:
    secrets: |
      - resourceName: "projects/<project-id>/secrets/my-secret/versions/latest"
        fileName: "my-secret-file"
```

**Pod 规范片段示例：**

```yaml
spec:
  containers:
    - name: my-app
      volumeMounts:
        - name: secrets-store-inline
          mountPath: "/mnt/secrets"
          readOnly: true
  volumes:
    - name: secrets-store-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "my-secret-provider"
```

### 7. 启用网络策略日志记录

如果使用 GKE Dataplane V2，则可以记录允许和拒绝的连接。

**步骤：**

1.  配置 `NetworkLogging` 自定义资源。

**NetworkLogging 清单示例：**

```yaml
apiVersion: networking.gke.io/v1alpha1
kind: NetworkLogging
metadata:
  name: default
spec:
  cluster:
    allow:
      log: true
      delegate: true
    deny:
      log: true
      delegate: true
```

这会将连接详细信息记录到 Cloud Logging。

## 最佳实践

1.  **最小权限：** 始终使用 Workload Identity，并授予最少的 IAM 角色。
    避免使用节点默认服务账号。
2.  **网络隔离：** 使用网络策略限制 Pod 之间的通信。
    启用网络策略日志记录以提高可观测性。
3.  **镜像安全：** 使用 Binary Authorization 确保仅部署可信镜像。
4.  **Secret 管理**：使用 Secret Manager CSI 驱动程序，而非默认的
    Kubernetes Secret 来存储敏感数据。
5.  **Pod 安全**：在所有非系统命名空间上实施 `baseline` 或 `restricted` Pod 安全标准。
6.  **策略实施**：考虑使用 **Policy Controller**（Gatekeeper）在整个集群中
    实施自定义安全与合规策略。

## 资源

-   [GKE 的 Workload Identity Federation](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)
-   [GKE 网络策略](https://cloud.google.com/kubernetes-engine/docs/how-to/network-policy)
-   [GKE 中的 Pod 安全标准](https://cloud.google.com/kubernetes-engine/docs/how-to/pod-security-standards)
-   [Google Secret Manager CSI 驱动程序](https://cloud.google.com/kubernetes-engine/docs/how-to/secret-manager)
-   [GKE Dataplane V2 网络日志记录](https://cloud.google.com/kubernetes-engine/docs/how-to/network-policy-logging)