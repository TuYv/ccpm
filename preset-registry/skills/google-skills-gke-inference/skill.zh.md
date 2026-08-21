---
name: gke-inference
description: >-
  Deploys and optimizes AI/ML inference workloads on GKE, using GPUs, TPUs, and
  model servers. Use when deploying GKE inference servers, configuring GKE GPU
  resources for inference, or deploying LLMs on GKE. Don't use for generic
  batch jobs or HPC task queues (use gke-batch-hpc instead).
metadata:
  category: Containers
---
# GKE AI/ML 推理

本参考文档介绍如何使用 Google 的推理快速入门（GIQ）在 GKE 上部署 AI/ML 推理工作负载，以及 LLM 服务的最佳实践。

> **MCP 工具：** `apply_k8s_manifest`、`get_k8s_resource`、`get_k8s_logs`、
> `get_k8s_rollout_status`、`describe_k8s_resource`、`list_k8s_events`。
> **仅限 CLI：** `gcloud container ai profiles *`

## 何时使用

-   将 AI 模型（Llama、Gemma、Mistral 等）部署到 GKE
-   为推理生成经过优化的 Kubernetes 清单
-   为模型服务选择 GPU/TPU 加速器
-   为 LLM 推理配置自动扩缩容

## 前提条件

-   黄金路径 GKE Autopilot 集群（通过 ComputeClasses 和 NAP 支持 GPU 工作负载）
-   已通过身份验证的 `gcloud` CLI
-   目标区域具有充足的 GPU/TPU 配额

## 工作流程

### 1. 探索：查找模型和硬件

```bash
# List all supported models
gcloud container ai profiles models list --quiet

# Find valid accelerator/server combinations for a model
gcloud container ai profiles list --model=<MODEL_NAME> --quiet

# Example: what can run Gemma 2 9B?
gcloud container ai profiles list --model=gemma-2-9b-it --quiet
```

### 2. 生成清单

```bash
gcloud container ai profiles manifests create \
  --model=<MODEL_NAME> \
  --model-server=<SERVER> \
  --accelerator-type=<ACCELERATOR> \
  --target-ntpot-milliseconds=<NTPOT> --quiet > inference.yaml
```

**参数：**

-   `--model`：模型 ID（例如 `gemma-2-9b-it`、`llama-3-8b`）
-   `--model-server`：推理服务器（`vllm`、`tgi`、`triton`、`tensorrt-llm`）
-   `--accelerator-type`：GPU/TPU 类型（`nvidia-l4`、`nvidia-tesla-a100`、
    `nvidia-h100-80gb`）
-   `--target-ntpot-milliseconds`：目标归一化单输出词元时间
    （可选，用于延迟优化）

**示例：**

```bash
gcloud container ai profiles manifests create \
  --model=gemma-2-9b-it \
  --model-server=vllm \
  --accelerator-type=nvidia-l4 \
  --target-ntpot-milliseconds=50 --quiet > inference.yaml
```

### 3. 审查并部署

```bash
# Review for placeholders (HF tokens, PVCs)
cat inference.yaml

# Deploy
kubectl apply -f inference.yaml

# Monitor
kubectl get pods -w
kubectl logs -f <POD_NAME>
```

> 某些模型需要 Hugging Face 令牌。请创建 Kubernetes Secret，并在清单中引用它。

## 用于推理的 GPU ComputeClass

对于 Autopilot 集群，创建 ComputeClass 以指定 GPU 节点：

```yaml
apiVersion: cloud.google.com/v1
kind: ComputeClass
metadata:
  name: l4-inference
spec:
  priorities:
  - machineFamily: g2
    gpu:
      type: nvidia-l4
      count: 1
    minCores: 4
    minMemoryGb: 16
```

## 加速器选择指南

| 加速器              | 最适合                   | 内存        | 相对成本 |
| ------------------- | ------------------------ | ----------- | ------------- |
| NVIDIA T4           | 经济型推理、             | 16 GB       | 最低        |
:                     : 轻量级旧版             :             :               :
:                     : 模型                   :             :               :
| NVIDIA L4 (G2)      | 中小型模型               | 24 GB       | 低           |
:                     : 推理、视频、           :             :               :
:                     : 图形                   :             :               :
| NVIDIA RTX PRO 6000 | 多模态 AI、              | 96 GB       | 中等        |
: (G4)                : 高保真 3D、            :             :               :
:                     : 微调                   :             :               :
| Cloud TPU v5e       | 高性价比                 | 不定        | 中等        |
:                     : Transformer 推理       :             :               :
| Cloud TPU v5p       | 高性能                   | 不定        | 高          |
:                     : 训练                   :             :               :
| Cloud TPU v6e       | 高效的新一代             | 32 GB/芯片  | 中高        |
: (Trillium)          : 训练与服务             :             :               :
| Cloud TPU v7x       | 超大规模推理与           | 192 GB/芯片 | 高          |
: (Ironwood)          : 智能体工作流           :             :               :
| NVIDIA A100         | 大型模型推理、           | 40/80 GB    | 高          |
:                     : 企业级 ML              :             :               :
| NVIDIA H100 / H200  | 前沿模型训练、           | 80/141 GB   | 最高        |
:                     : 高吞吐量               :             :               :
| NVIDIA B200 (A4)    | Blackwell 规模的         | 192 GB      | 最高        |
:                     : 训练、FP4 精度          :             :               :
| NVIDIA GB200 (A4X)  | 机架级 AI（Grace         | 海量        | 最高        |
:                     : Blackwell 超级芯片）    :             :               :

## LLM 推理自动扩缩容

### 基于 GPU 的自动扩缩容

使用自定义指标监控 GPU 利用率：

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-server
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: gpu_duty_cycle
      target:
        type: AverageValue
        averageValue: "80"
```

### 推理自动扩缩容最佳实践

1.  **使用 DCGM 指标**：黄金路径启用 DCGM 监控，以获取 GPU
    利用率指标
2.  **设置适当的 minReplicas**：对于始终在线的服务，至少设置为 1；对于
    批处理/按需服务，设置为 0
3.  **调整缩容延迟**：LLM 模型加载速度较慢；使用更长的
    稳定窗口
4.  **考虑队列深度**：对于延迟敏感型工作负载，根据待处理请求数进行扩缩容，而不是仅依据 GPU
    利用率

## 优化技巧

-   **量化**：使用量化模型（GPTQ、AWQ）来减少 GPU 内存占用并
    提高吞吐量
-   **批处理**：配置模型服务器的批次大小，以权衡吞吐量和延迟
-   **张量并行**：在一个节点内将大型模型拆分到多个 GPU 上
-   **KV 缓存优化**：在 vLLM 中调整 `--gpu-memory-utilization`，以优化 KV
    缓存分配

## 故障排除

| 问题               | 原因                     | 解决方法                    |
| ------------------ | ------------------------ | --------------------------- |
| 无效的             | 不受支持的元组           | 重新运行 `gcloud container ai |
: 模型/加速器组合    :                          : profiles list               :
:                    :                          : --model=<MODEL>`            :
| GPU 配额已超出     | 区域配额限制             | 请求提高配额或              |
:                    :                          : 尝试其他区域                :
| GPU 内存不足       | 模型对于加速器而言       | 使用更大的 GPU、启用        |
:                    : 过大                     : 量化或使用张量              :
:                    :                          : 并行                        :
| 冷启动缓慢         | 从模型注册表加载大型模型 | 使用本地 SSD 缓存模型；     |
:                    :                          : 预拉取镜像                  :