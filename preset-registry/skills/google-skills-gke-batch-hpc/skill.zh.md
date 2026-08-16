---
name: gke-batch-hpc
description: >-
  Runs batch and HPC workloads on GKE, utilizing job queues and parallel
  processing. Use when running GKE batch jobs, configuring GKE HPC, or setting
  up GKE job queues. Don't use for standard web application deployments (use
  gke-app-onboarding instead).
metadata:
  category: Containers
---
# GKE 批处理与 HPC 工作负载

本参考文档介绍如何在 GKE 上运行批处理和高性能计算
（HPC）工作负载。

> **MCP 工具：** `apply_k8s_manifest`、`get_k8s_resource`、
> `describe_k8s_resource`、`get_k8s_logs`、`delete_k8s_resource`、
> `list_k8s_events`

## 适用场景

-   运行批量数据处理流水线
-   HPC 模拟（CFD、分子动力学、金融建模）
-   大规模并行计算（MPI、MapReduce）
-   ML 训练作业
-   CI/CD 构建集群

## GKE 上的批处理

### Kubernetes Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-job
spec:
  parallelism: 10
  completions: 100
  backoffLimit: 3
  template:
    spec:
      containers:
      - name: worker
        image: <IMAGE>
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
      restartPolicy: Never
```

### JobSet（用于复杂的多作业工作流）

标准路径启用了 JobSet 监控（monitoringConfig 中的 `JOBSET`）。

```yaml
apiVersion: jobset.x-k8s.io/v1alpha2
kind: JobSet
metadata:
  name: training-job
spec:
  replicatedJobs:
  - name: workers
    replicas: 4
    template:
      spec:
        parallelism: 1
        completions: 1
        template:
          spec:
            containers:
            - name: worker
              image: <IMAGE>
              resources:
                requests:
                  cpu: "4"
                  memory: "8Gi"
```

### Kueue（作业排队）

Kueue 管理批处理工作负载的作业调度和资源分配：

```bash
# Install Kueue
kubectl apply --server-side -f https://github.com/kubernetes-sigs/kueue/releases/latest/download/manifests.yaml
```

```yaml
# Define a ClusterQueue
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata:
  name: batch-queue
spec:
  namespaceSelector: {}
  resourceGroups:
  - coveredResources: ["cpu", "memory"]
    flavors:
    - name: default
      resources:
      - name: "cpu"
        nominalQuota: 100
      - name: "memory"
        nominalQuota: "200Gi"
---
# Allow a namespace to use the queue
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata:
  name: batch-local
  namespace: batch-jobs
spec:
  clusterQueue: batch-queue
```

## GKE 上的 HPC

### 紧凑放置（低延迟网络）

适用于需要低延迟节点间通信的紧密耦合型 HPC
工作负载：

```bash
# Standard clusters: create node pool with compact placement
gcloud container node-pools create hpc-pool \
  --cluster <CLUSTER_NAME> --region <REGION> \
  --machine-type c3-standard-44 \
  --placement-type COMPACT \
  --num-nodes 8 \
  --enable-autoscaling --min-nodes 0 --max-nodes 16 \
  --quiet
```

### MPI 工作负载

对基于 MPI 的 HPC 应用程序使用 MPI Operator：

```bash
# Install MPI Operator
kubectl apply -f https://raw.githubusercontent.com/kubeflow/mpi-operator/master/deploy/v2beta1/mpi-operator.yaml
```

```yaml
apiVersion: kubeflow.org/v2beta1
kind: MPIJob
metadata:
  name: hpc-simulation
spec:
  slotsPerWorker: 4
  mpiReplicaSpecs:
    Launcher:
      replicas: 1
      template:
        spec:
          containers:
          - name: launcher
            image: <MPI_IMAGE>
            command: ["mpirun", "-np", "32", "./simulation"]
            resources:
              requests:
                cpu: "1"
                memory: "2Gi"
              limits:
                cpu: "2"
                memory: "4Gi"
    Worker:
      replicas: 8
      template:
        spec:
          containers:
          - name: worker
            image: <MPI_IMAGE>
            resources:
              requests:
                cpu: "4"
                memory: "8Gi"
              limits:
                cpu: "8"
                memory: "16Gi"
```

## 批处理/HPC 的成本优化

### 用于批处理的 Spot 虚拟机

批处理工作负载是 Spot 虚拟机的理想候选工作负载（可中断，并且可以创建检查点）。
使用以 Spot 为第一优先级并启用 `activeMigration` 的 ComputeClass，以便在 Spot
可用时迁回 Spot。有关支持回退的 Spot 模式，请参阅 `gke-compute-classes`
技能。

### 缩容至零

对于批处理集群，允许节点池在没有作业运行时缩容至零：

-   Autopilot（推荐路径）：自动执行，当没有 Pod 被调度时，节点缩容至零
-   Standard：在批处理节点池上设置 `--min-nodes 0`

## 最佳实践和生产环境指南

-   **资源配额**：始终为所有批处理/HPC 清单指定资源请求和限制（CPU、
    内存，以及可选的 GPU/TPU）。这对于 Kueue 准入、自动扩缩容以及防止集群中
    出现资源匮乏至关重要。
-   **TPU/Spot 集群维护**：对于在 Spot 虚拟机/TPU 上运行的长时间 AI 训练，
    建议使用 **GKE 维护排除项**，在有效训练时段内阻止自动集群升级/重启，
    以尽量减少不必要的抢占。
-   **MPI 工作负载**：使用 **Kubeflow Training Operator**，通过 `MPIJob`
    自定义资源编排分布式 MPI 应用。
-   **Kueue 和 JobSet**：使用 **Kueue** 实现多租户作业排队和公平共享；
    使用 **JobSet** 处理包含多个组件且紧密耦合的工作负载。
-   **弹性**：始终在 Job 上设置 `backoffLimit`，并实现应用级检查点机制
    （例如，使用 Orbax 或 PyTorch 检查点机制），以应对 Spot 虚拟机抢占。