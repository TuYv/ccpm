---
name: lambda-labs-gpu-cloud
description: Reserved and on-demand GPU cloud instances for ML training and inference. Use when you need dedicated GPU instances with simple SSH access, persistent filesystems, or high-performance multi-node clusters for large-scale training.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Infrastructure, GPU Cloud, Training, Inference, Lambda Labs]
dependencies: [lambda-cloud-client>=1.0.0]
---
# Lambda Labs GPU 云

在 Lambda Labs GPU 云上使用按需实例和 1-Click Clusters 运行机器学习工作负载的综合指南。

## 何时使用 Lambda Labs

**适合使用 Lambda Labs 的场景：**
- 需要具有完整 SSH 访问权限的专用 GPU 实例
- 运行长时间训练任务（数小时到数天）
- 希望采用简单定价且不收取数据传出费用
- 需要在不同会话之间保留持久化存储
- 需要高性能多节点集群（16-512 个 GPU）
- 希望使用预安装的机器学习软件栈（包含 PyTorch、CUDA、NCCL 的 Lambda Stack）

**主要功能：**
- **多种 GPU**：B200、H100、GH200、A100、A10、A6000、V100
- **Lambda Stack**：预安装 PyTorch、TensorFlow、CUDA、cuDNN、NCCL
- **持久化文件系统**：实例重启后仍可保留数据
- **1-Click Clusters**：配备 InfiniBand 的 16-512 GPU Slurm 集群
- **简单定价**：按分钟付费，不收取数据传出费用
- **全球区域**：全球 12 个以上区域

**以下情况可改用其他方案：**
- **Modal**：适用于无服务器、自动扩缩容工作负载
- **SkyPilot**：适用于多云编排和成本优化
- **RunPod**：适用于价格更低的竞价实例和无服务器端点
- **Vast.ai**：适用于追求最低价格的 GPU 市场

## 快速开始

### 账户设置

1. 在 https://lambda.ai 创建账户
2. 添加付款方式
3. 从控制面板生成 API 密钥
4. 添加 SSH 密钥（启动实例前必须完成）

### 通过控制台启动

1. 前往 https://cloud.lambda.ai/instances
2. 点击“Launch instance”
3. 选择 GPU 类型和区域
4. 选择 SSH 密钥
5. 可选择挂载文件系统
6. 启动并等待 3-15 分钟

### 通过 SSH 连接

```bash
# Get instance IP from console
ssh ubuntu@<INSTANCE-IP>

# Or with specific key
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE-IP>
```

## GPU 实例

### 可用 GPU

| GPU | 显存 | 每个 GPU 每小时价格 | 最适合 |
|-----|------|--------------|----------|
| B200 SXM6 | 180 GB | $4.99 | 最大规模的模型、最快的训练 |
| H100 SXM | 80 GB | $2.99-3.29 | 大模型训练 |
| H100 PCIe | 80 GB | $2.49 | 高性价比 H100 |
| GH200 | 96 GB | $1.49 | 单 GPU 大模型 |
| A100 80GB | 80 GB | $1.79 | 生产环境训练 |
| A100 40GB | 40 GB | $1.29 | 标准训练 |
| A10 | 24 GB | $0.75 | 推理、微调 |
| A6000 | 48 GB | $0.80 | 良好的显存/价格比 |
| V100 | 16 GB | $0.55 | 低成本训练 |

### 实例配置

```
8x GPU: Best for distributed training (DDP, FSDP)
4x GPU: Large models, multi-GPU training
2x GPU: Medium workloads
1x GPU: Fine-tuning, inference, development
```

### 启动时间

- 单 GPU：3-5 分钟
- 多 GPU：10-15 分钟

## Lambda Stack

所有实例均预安装 Lambda Stack：

```bash
# Included software
- Ubuntu 22.04 LTS
- NVIDIA drivers (latest)
- CUDA 12.x
- cuDNN 8.x
- NCCL (for multi-GPU)
- PyTorch (latest)
- TensorFlow (latest)
- JAX
- JupyterLab
```

### 验证安装

```bash
# Check GPU
nvidia-smi

# Check PyTorch
python -c "import torch; print(torch.cuda.is_available())"

# Check CUDA version
nvcc --version
```

## Python API

### 安装

```bash
pip install lambda-cloud-client
```

### 身份验证

```python
import os
import lambda_cloud_client

# Configure with API key
configuration = lambda_cloud_client.Configuration(
    host="https://cloud.lambdalabs.com/api/v1",
    access_token=os.environ["LAMBDA_API_KEY"]
)
```

### 列出可用实例

```python
with lambda_cloud_client.ApiClient(configuration) as api_client:
    api = lambda_cloud_client.DefaultApi(api_client)

    # Get available instance types
    types = api.instance_types()
    for name, info in types.data.items():
        print(f"{name}: {info.instance_type.description}")
```

### 启动实例

```python
from lambda_cloud_client.models import LaunchInstanceRequest

request = LaunchInstanceRequest(
    region_name="us-west-1",
    instance_type_name="gpu_1x_h100_sxm5",
    ssh_key_names=["my-ssh-key"],
    file_system_names=["my-filesystem"],  # Optional
    name="training-job"
)

response = api.launch_instance(request)
instance_id = response.data.instance_ids[0]
print(f"Launched: {instance_id}")
```

### 列出正在运行的实例

```python
instances = api.list_instances()
for instance in instances.data:
    print(f"{instance.name}: {instance.ip} ({instance.status})")
```

### 终止实例

```python
from lambda_cloud_client.models import TerminateInstanceRequest

request = TerminateInstanceRequest(
    instance_ids=[instance_id]
)
api.terminate_instance(request)
```

### SSH 密钥管理

```python
from lambda_cloud_client.models import AddSshKeyRequest

# Add SSH key
request = AddSshKeyRequest(
    name="my-key",
    public_key="ssh-rsa AAAA..."
)
api.add_ssh_key(request)

# List keys
keys = api.list_ssh_keys()

# Delete key
api.delete_ssh_key(key_id)
```

## 使用 curl 的 CLI

### 列出实例类型

```bash
curl -u $LAMBDA_API_KEY: \
  https://cloud.lambdalabs.com/api/v1/instance-types | jq
```

### 启动实例

```bash
curl -u $LAMBDA_API_KEY: \
  -X POST https://cloud.lambdalabs.com/api/v1/instance-operations/launch \
  -H "Content-Type: application/json" \
  -d '{
    "region_name": "us-west-1",
    "instance_type_name": "gpu_1x_h100_sxm5",
    "ssh_key_names": ["my-key"]
  }' | jq
```

### 终止实例

```bash
curl -u $LAMBDA_API_KEY: \
  -X POST https://cloud.lambdalabs.com/api/v1/instance-operations/terminate \
  -H "Content-Type: application/json" \
  -d '{"instance_ids": ["<INSTANCE-ID>"]}' | jq
```

## 持久化存储

### 文件系统

文件系统可在实例重启后继续保留数据：

```bash
# Mount location
/lambda/nfs/<FILESYSTEM_NAME>

# Example: save checkpoints
python train.py --checkpoint-dir /lambda/nfs/my-storage/checkpoints
```

### 创建文件系统

1. 前往 Lambda 控制台中的 Storage
2. 点击“Create filesystem”
3. 选择区域（必须与实例所在区域一致）
4. 命名并创建

### 挂载到实例

文件系统必须在实例启动时挂载：
- 通过控制台：启动时选择文件系统
- 通过 API：在启动请求中包含 `file_system_names`

### 最佳实践

```bash
# Store on filesystem (persists)
/lambda/nfs/storage/
  ├── datasets/
  ├── checkpoints/
  ├── models/
  └── outputs/

# Local SSD (faster, ephemeral)
/home/ubuntu/
  └── working/  # Temporary files
```

## SSH 配置

### 添加 SSH 密钥

```bash
# Generate key locally
ssh-keygen -t ed25519 -f ~/.ssh/lambda_key

# Add public key to Lambda console
# Or via API
```

### 多个密钥

```bash
# On instance, add more keys
echo 'ssh-rsa AAAA...' >> ~/.ssh/authorized_keys
```

### 从 GitHub 导入

```bash
# On instance
ssh-import-id gh:username
```

### SSH 隧道

```bash
# Forward Jupyter
ssh -L 8888:localhost:8888 ubuntu@<IP>

# Forward TensorBoard
ssh -L 6006:localhost:6006 ubuntu@<IP>

# Multiple ports
ssh -L 8888:localhost:8888 -L 6006:localhost:6006 ubuntu@<IP>
```

## JupyterLab

### 从控制台启动

1. 前往实例页面
2. 点击云 IDE 列中的“启动”
3. JupyterLab 将在浏览器中打开

### 手动访问

```bash
# On instance
jupyter lab --ip=0.0.0.0 --port=8888

# From local machine with tunnel
ssh -L 8888:localhost:8888 ubuntu@<IP>
# Open http://localhost:8888
```

## 训练工作流

### 单 GPU 训练

```bash
# SSH to instance
ssh ubuntu@<IP>

# Clone repo
git clone https://github.com/user/project
cd project

# Install dependencies
pip install -r requirements.txt

# Train
python train.py --epochs 100 --checkpoint-dir /lambda/nfs/storage/checkpoints
```

### 多 GPU 训练（单节点）

```python
# train_ddp.py
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def main():
    dist.init_process_group("nccl")
    rank = dist.get_rank()
    device = rank % torch.cuda.device_count()

    model = MyModel().to(device)
    model = DDP(model, device_ids=[device])

    # Training loop...

if __name__ == "__main__":
    main()
```

```bash
# Launch with torchrun (8 GPUs)
torchrun --nproc_per_node=8 train_ddp.py
```

### 将检查点保存到文件系统

```python
import os

checkpoint_dir = "/lambda/nfs/my-storage/checkpoints"
os.makedirs(checkpoint_dir, exist_ok=True)

# Save checkpoint
torch.save({
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}, f"{checkpoint_dir}/checkpoint_{epoch}.pt")
```

## 一键集群

### 概述

高性能 Slurm 集群，配备：
- 16-512 个 NVIDIA H100 或 B200 GPU
- NVIDIA Quantum-2 400 Gb/s InfiniBand
- 速率达 3200 Gb/s 的 GPUDirect RDMA
- 预安装的分布式机器学习技术栈

### 随附软件

- Ubuntu 22.04 LTS + Lambda Stack
- NCCL、Open MPI
- 支持 DDP 和 FSDP 的 PyTorch
- TensorFlow
- OFED 驱动程序

### 存储

- 每个计算节点配备 24 TB NVMe（临时存储）
- 用于持久化数据的 Lambda 文件系统

### 多节点训练

```bash
# On Slurm cluster
srun --nodes=4 --ntasks-per-node=8 --gpus-per-node=8 \
  torchrun --nnodes=4 --nproc_per_node=8 \
  --rdzv_backend=c10d --rdzv_endpoint=$MASTER_ADDR:29500 \
  train.py
```

## 网络

### 带宽

- 实例间（同一区域）：最高 200 Gbps
- 互联网出站：最高 20 Gbps

### 防火墙

- 默认：仅开放端口 22（SSH）
- 在 Lambda 控制台中配置其他端口
- 默认允许 ICMP 流量

### 私有 IP

```bash
# Find private IP
ip addr show | grep 'inet '
```

## 常见工作流

### 工作流 1：微调 LLM

```bash
# 1. Launch 8x H100 instance with filesystem

# 2. SSH and setup
ssh ubuntu@<IP>
pip install transformers accelerate peft

# 3. Download model to filesystem
python -c "
from transformers import AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-2-7b-hf')
model.save_pretrained('/lambda/nfs/storage/models/llama-2-7b')
"

# 4. Fine-tune with checkpoints on filesystem
accelerate launch --num_processes 8 train.py \
  --model_path /lambda/nfs/storage/models/llama-2-7b \
  --output_dir /lambda/nfs/storage/outputs \
  --checkpoint_dir /lambda/nfs/storage/checkpoints
```

### 工作流 2：批量推理

```bash
# 1. Launch A10 instance (cost-effective for inference)

# 2. Run inference
python inference.py \
  --model /lambda/nfs/storage/models/fine-tuned \
  --input /lambda/nfs/storage/data/inputs.jsonl \
  --output /lambda/nfs/storage/data/outputs.jsonl
```

## 成本优化

### 选择合适的 GPU

| 任务 | 推荐的 GPU |
|------|-----------------|
| LLM 微调（7B） | A100 40GB |
| LLM 微调（70B） | 8x H100 |
| 推理 | A10, A6000 |
| 开发 | V100, A10 |
| 最高性能 | B200 |

### 降低成本

1. **使用文件系统**：避免重复下载数据
2. **频繁保存检查点**：恢复中断的训练
3. **合理配置规模**：不要过度配置 GPU
4. **终止空闲实例**：不会自动停止，需要手动终止

### 监控使用情况

- 仪表板显示实时 GPU 利用率
- 使用 API 进行程序化监控

## 常见问题

| 问题 | 解决方案 |
|-------|----------|
| 实例无法启动 | 检查区域可用性，尝试其他 GPU |
| SSH 连接被拒绝 | 等待实例初始化（3-15 分钟） |
| 实例终止后数据丢失 | 使用持久化文件系统 |
| 数据传输缓慢 | 使用同一区域的文件系统 |
| 未检测到 GPU | 重启实例，检查驱动程序 |

## 参考资料

- **[高级用法](references/advanced-usage.md)** - 多节点训练、API 自动化
- **[故障排除](references/troubleshooting.md)** - 常见问题及解决方案

## 资源

- **文档**：https://docs.lambda.ai
- **控制台**：https://cloud.lambda.ai
- **定价**：https://lambda.ai/instances
- **支持**：https://support.lambdalabs.com
- **博客**：https://lambda.ai/blog