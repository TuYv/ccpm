---
name: skypilot-multi-cloud-orchestration
description: Multi-cloud orchestration for ML workloads with automatic cost optimization. Use when you need to run training or batch jobs across multiple clouds, leverage spot instances with auto-recovery, or optimize GPU costs across providers.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Infrastructure, Multi-Cloud, Orchestration, GPU, Cost Optimization, SkyPilot]
dependencies: [skypilot>=0.7.0]
---
# SkyPilot 多云编排

使用 SkyPilot 跨云运行 ML 工作负载，并自动优化成本的综合指南。

## 何时使用 SkyPilot

**在以下情况下使用 SkyPilot：**
- 在多个云平台（AWS、GCP、Azure 等）上运行 ML 工作负载
- 需要通过自动选择云平台/区域来优化成本
- 在 Spot 实例上运行长时间任务，并实现自动恢复
- 管理分布式多节点训练
- 希望使用统一接口管理 20 多家云服务提供商
- 需要避免供应商锁定

**主要功能：**
- **多云**：AWS、GCP、Azure、Kubernetes、Lambda、RunPod 以及 20 多家提供商
- **成本优化**：自动选择价格最低的云平台/区域
- **Spot 实例**：通过自动恢复节省 3-6 倍成本
- **分布式训练**：支持 gang scheduling 的多节点任务
- **托管任务**：自动恢复、检查点和容错
- **Sky Serve**：支持自动扩缩容的模型服务

**改用以下替代方案：**
- **Modal**：适用于通过 Python 原生 API 使用更简单的无服务器 GPU
- **RunPod**：适用于单云平台的持久化 Pod
- **Kubernetes**：适用于已有的 K8s 基础设施
- **Ray**：适用于纯 Ray 的编排

## 快速开始

### 安装

```bash
pip install "skypilot[aws,gcp,azure,kubernetes]"

# Verify cloud credentials
sky check
```

### Hello World

创建 `hello.yaml`：
```yaml
resources:
  accelerators: T4:1

run: |
  nvidia-smi
  echo "Hello from SkyPilot!"
```

启动：
```bash
sky launch -c hello hello.yaml

# SSH to cluster
ssh hello

# Terminate
sky down hello
```

## 核心概念

### 任务 YAML 结构

```yaml
# Task name (optional)
name: my-task

# Resource requirements
resources:
  cloud: aws              # Optional: auto-select if omitted
  region: us-west-2       # Optional: auto-select if omitted
  accelerators: A100:4    # GPU type and count
  cpus: 8+                # Minimum CPUs
  memory: 32+             # Minimum memory (GB)
  use_spot: true          # Use spot instances
  disk_size: 256          # Disk size (GB)

# Number of nodes for distributed training
num_nodes: 2

# Working directory (synced to ~/sky_workdir)
workdir: .

# Setup commands (run once)
setup: |
  pip install -r requirements.txt

# Run commands
run: |
  python train.py
```

### 主要命令

| 命令 | 用途 |
|---------|---------|
| `sky launch` | 启动集群并运行任务 |
| `sky exec` | 在现有集群上运行任务 |
| `sky status` | 显示集群状态 |
| `sky stop` | 停止集群（保留状态） |
| `sky down` | 终止集群 |
| `sky logs` | 查看任务日志 |
| `sky queue` | 显示任务队列 |
| `sky jobs launch` | 启动托管任务 |
| `sky serve up` | 部署服务端点 |

## GPU 配置

### 可用加速器

```yaml
# NVIDIA GPUs
accelerators: T4:1
accelerators: L4:1
accelerators: A10G:1
accelerators: L40S:1
accelerators: A100:4
accelerators: A100-80GB:8
accelerators: H100:8

# Cloud-specific
accelerators: V100:4         # AWS/GCP
accelerators: TPU-v4-8       # GCP TPUs
```

### GPU 回退方案

```yaml
resources:
  accelerators:
    H100: 8
    A100-80GB: 8
    A100: 8
  any_of:
    - cloud: gcp
    - cloud: aws
    - cloud: azure
```

### Spot 实例

```yaml
resources:
  accelerators: A100:8
  use_spot: true
  spot_recovery: FAILOVER  # Auto-recover on preemption
```

## 集群管理

### 启动并执行

```bash
# Launch new cluster
sky launch -c mycluster task.yaml

# Run on existing cluster (skip setup)
sky exec mycluster another_task.yaml

# Interactive SSH
ssh mycluster

# Stream logs
sky logs mycluster
```

### 自动停止

```yaml
resources:
  accelerators: A100:4
  autostop:
    idle_minutes: 30
    down: true  # Terminate instead of stop
```

```bash
# Set autostop via CLI
sky autostop mycluster -i 30 --down
```

### 集群状态

```bash
# All clusters
sky status

# Detailed view
sky status -a
```

## 分布式训练

### 多节点设置

```yaml
resources:
  accelerators: A100:8

num_nodes: 4  # 4 nodes × 8 GPUs = 32 GPUs total

setup: |
  pip install torch torchvision

run: |
  torchrun \
    --nnodes=$SKYPILOT_NUM_NODES \
    --nproc_per_node=$SKYPILOT_NUM_GPUS_PER_NODE \
    --node_rank=$SKYPILOT_NODE_RANK \
    --master_addr=$(echo "$SKYPILOT_NODE_IPS" | head -n1) \
    --master_port=12355 \
    train.py
```

### 环境变量

| 变量 | 描述 |
|----------|-------------|
| `SKYPILOT_NODE_RANK` | 节点索引（0 到 num_nodes-1） |
| `SKYPILOT_NODE_IPS` | 以换行符分隔的 IP 地址 |
| `SKYPILOT_NUM_NODES` | 节点总数 |
| `SKYPILOT_NUM_GPUS_PER_NODE` | 每个节点的 GPU 数量 |

### 仅在头节点上执行

```bash
run: |
  if [ "${SKYPILOT_NODE_RANK}" == "0" ]; then
    python orchestrate.py
  fi
```

## 托管作业

### Spot 恢复

```bash
# Launch managed job with spot recovery
sky jobs launch -n my-job train.yaml
```

### 检查点

```yaml
name: training-job

file_mounts:
  /checkpoints:
    name: my-checkpoints
    store: s3
    mode: MOUNT

resources:
  accelerators: A100:8
  use_spot: true

run: |
  python train.py \
    --checkpoint-dir /checkpoints \
    --resume-from-latest
```

### 作业管理

```bash
# List jobs
sky jobs queue

# View logs
sky jobs logs my-job

# Cancel job
sky jobs cancel my-job
```

## 文件挂载和存储

### 本地文件同步

```yaml
workdir: ./my-project  # Synced to ~/sky_workdir

file_mounts:
  /data/config.yaml: ./config.yaml
  ~/.vimrc: ~/.vimrc
```

### 云存储

```yaml
file_mounts:
  # Mount S3 bucket
  /datasets:
    source: s3://my-bucket/datasets
    mode: MOUNT  # Stream from S3

  # Copy GCS bucket
  /models:
    source: gs://my-bucket/models
    mode: COPY  # Pre-fetch to disk

  # Cached mount (fast writes)
  /outputs:
    name: my-outputs
    store: s3
    mode: MOUNT_CACHED
```

### 存储模式

| 模式 | 描述 | 最适合 |
|------|-------------|----------|
| `MOUNT` | 从云端流式传输 | 大型数据集、以读取为主 |
| `COPY` | 预先获取到磁盘 | 小文件、随机访问 |
| `MOUNT_CACHED` | 使用异步上传进行缓存 | 检查点、输出 |

## Sky Serve（模型服务）

### 基础服务

```yaml
# service.yaml
service:
  readiness_probe: /health
  replica_policy:
    min_replicas: 1
    max_replicas: 10
    target_qps_per_replica: 2.0

resources:
  accelerators: A100:1

run: |
  python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-2-7b-chat-hf \
    --port 8000
```

```bash
# Deploy
sky serve up -n my-service service.yaml

# Check status
sky serve status

# Get endpoint
sky serve status my-service
```

### 自动扩缩容策略

```yaml
service:
  replica_policy:
    min_replicas: 1
    max_replicas: 10
    target_qps_per_replica: 2.0
    upscale_delay_seconds: 60
    downscale_delay_seconds: 300
  load_balancing_policy: round_robin
```

## 成本优化

### 自动选择云平台

```yaml
# SkyPilot finds cheapest option
resources:
  accelerators: A100:8
  # No cloud specified - auto-select cheapest
```

```bash
# Show optimizer decision
sky launch task.yaml --dryrun
```

### 云平台偏好

```yaml
resources:
  accelerators: A100:8
  any_of:
    - cloud: gcp
      region: us-central1
    - cloud: aws
      region: us-east-1
    - cloud: azure
```

### 环境变量

```yaml
envs:
  HF_TOKEN: $HF_TOKEN  # Inherited from local env
  WANDB_API_KEY: $WANDB_API_KEY

# Or use secrets
secrets:
  - HF_TOKEN
  - WANDB_API_KEY
```

## 常见工作流

### 工作流 1：使用检查点进行微调

```yaml
name: llm-finetune

file_mounts:
  /checkpoints:
    name: finetune-checkpoints
    store: s3
    mode: MOUNT_CACHED

resources:
  accelerators: A100:8
  use_spot: true

setup: |
  pip install transformers accelerate

run: |
  python train.py \
    --checkpoint-dir /checkpoints \
    --resume
```

### 工作流 2：超参数搜索

```yaml
name: hp-sweep-${RUN_ID}

envs:
  RUN_ID: 0
  LEARNING_RATE: 1e-4
  BATCH_SIZE: 32

resources:
  accelerators: A100:1
  use_spot: true

run: |
  python train.py \
    --lr $LEARNING_RATE \
    --batch-size $BATCH_SIZE \
    --run-id $RUN_ID
```

```bash
# Launch multiple jobs
for i in {1..10}; do
  sky jobs launch sweep.yaml \
    --env RUN_ID=$i \
    --env LEARNING_RATE=$(python -c "import random; print(10**random.uniform(-5,-3))")
done
```

## 调试

```bash
# SSH to cluster
ssh mycluster

# View logs
sky logs mycluster

# Check job queue
sky queue mycluster

# View managed job logs
sky jobs logs my-job
```

## 常见问题

| 问题 | 解决方案 |
|-------|----------|
| 配额超出 | 申请提高配额，尝试其他区域 |
| Spot 实例被抢占 | 使用 `sky jobs launch` 进行自动恢复 |
| 文件同步缓慢 | 对输出使用 `MOUNT_CACHED` 模式 |
| GPU 不可用 | 使用 `any_of` 作为备用云平台 |

## 参考资料

- **[高级用法](references/advanced-usage.md)** - 多云、优化、生产模式
- **[故障排除](references/troubleshooting.md)** - 常见问题及解决方案

## 资源

- **文档**：https://docs.skypilot.co
- **GitHub**：https://github.com/skypilot-org/skypilot
- **Slack**：https://slack.skypilot.co
- **示例**：https://github.com/skypilot-org/skypilot/tree/master/examples