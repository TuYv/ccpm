---
name: ml-training-recipes
description: Battle-tested PyTorch training recipes for all domains — LLMs, vision, diffusion, medical imaging, protein/drug discovery, spatial omics, genomics. Covers training loops, optimizer selection (AdamW, Muon), LR scheduling, mixed precision, debugging, and systematic experimentation. Use when training or fine-tuning neural networks, debugging loss spikes or OOM, choosing architectures, or optimizing GPU throughput.
version: 1.0.0
author: dailycafi
license: MIT
tags: [PyTorch, Training, Optimization, LLM, Vision, Diffusion, Biomedical, Muon, AdamW, Debugging]
dependencies: [torch>=2.0.0]
---
# ML 训练方案

经过实战检验、适用于不同领域的 PyTorch 训练模式。内容源自生产级代码库
（Karpathy 的 autoresearch/nanochat、torchvision、HuggingFace）以及现代训练实践。

## 参考文件（按需阅读）

- `references/architecture.md` — Transformer/LLM 架构代码模式、权重初始化
- `references/optimizers.md` — Muon、AdamW 混合优化、分组学习率、编译优化器步骤
- `references/domain-specific.md` — 视觉、扩散、对比学习、分布式训练、检查点、数据加载
- `references/scaling-and-selection.md` — 缩放定律、计算预算表、决策树、DGX Spark
- `references/biomedical.md` — 药物发现、蛋白质模型、医学影像、基因组学、临床 NLP
- `references/experiment-loop.md` — 自主实验循环（autoresearch 的保留/丢弃/回滚）

---

## 架构选择

根据**数据类型**和**数据规模**选择合适的模型：

| 数据类型 | < 10K 个样本 | 10K-100K | > 100K |
|-----------|--------------|----------|--------|
| **图像** | 预训练 CNN + 微调 | 微调 ViT 或 CNN | 从头训练 ViT |
| **文本（生成）** | 少样本提示 | 微调 GPT/LLaMA（LoRA） | 从头预训练 |
| **表格数据** | XGBoost/LightGBM | 仍然使用 XGBoost | 神经网络可行 |
| **音频** | 预训练 Whisper | 微调 AST | 从头训练 |
| **分子** | 预训练 GNN | 微调分子语言模型 | 从头训练 GNN |
| **蛋白质** | ESM-2 嵌入 + 预测头 | 微调 ESM-2 | 训练蛋白质语言模型 |
| **医学影像** | 预训练 CNN | nnU-Net（自动配置） | Swin-UNETR / MedSAM |

**关键原则**：在计算量相同的情况下，训练方案比架构更重要。经过良好调优的
ResNet 胜过调优不佳的 ViT（参考："ResNet Strikes Back"，Wightman，2021）。

有关生物医学领域的内容，请参阅 `references/biomedical.md`。
有关序列模型选择和计算规划的内容，请参阅 `references/scaling-and-selection.md`。

---

## 缩放定律

### Chinchilla 法则（Hoffmann 等，2022）

计算最优训练：**每个参数约对应 20 个 token**。

| 模型大小 | 计算最优 | 推理最优（100×） |
|-----------|----------------|--------------------------|
| 125M | 2.5B 个 token | 12.5B 个 token |
| 1B | 20B 个 token | 100B 个 token |
| 7B | 140B 个 token | 700B 个 token |

**FLOPs ≈ 6 × N × D**（N=参数量，D=token 数）。数据重复上限：约 4 个 epoch，之后收益开始递减。

---

## 训练循环

```python
import gc, time, torch

torch.manual_seed(42)
torch.set_float32_matmul_precision("high")  # TF32 on Ampere+
autocast_ctx = torch.amp.autocast(device_type="cuda", dtype=torch.bfloat16)

grad_accum_steps = total_batch_size // (batch_size * seq_len)
step = 0

while not done:
    t0 = time.time()
    for micro_step in range(grad_accum_steps):
        with autocast_ctx:
            loss = model(x, y)
        (loss / grad_accum_steps).backward()
        x, y = next(train_loader)

    update_lr(optimizer, progress)
    optimizer.step()
    model.zero_grad(set_to_none=True)  # frees memory vs zeroing

    if loss.item() > 100:  # fast-fail on divergence
        print("FAIL: loss exploded"); exit(1)

    torch.cuda.synchronize()
    if step == 0:
        gc.collect(); gc.freeze(); gc.disable()  # avoid ~500ms GC stalls
    step += 1
```

### 关键原则

- **梯度裁剪**：`clip_grad_norm_(params, 1.0)`——对 Transformer 几乎普遍适用。
  例外：Muon 优化器通过正交化对更新进行归一化，因此裁剪是可选的。
- **Tensor Core 对齐**：批大小、隐藏维度应为 8（bf16）或 64（A100）的倍数。
- **基于时间的预算**使实验在不同硬件上具有可比性。
- 对固定尺寸的视觉输入使用 **`cudnn.benchmark = True`**。

---

## 优化器配置

现代 LLM 训练会为不同参数组使用不同的优化器：

| 参数类型 | 优化器 | LR（基础值） | 权重衰减 |
|---------------|-----------|-----------|--------------|
| 二维权重矩阵 | Muon | 0.04 | 0.2 |
| Token 嵌入 | AdamW | 0.6 × scale | 0.0 |
| 反嵌入（lm_head） | AdamW | 0.004 × scale | 0.0 |
| 每层标量 | AdamW | 0.005 × scale | 0.0 |

**按维度缩放 LR**：`lr * (d_model / 768)^(-0.5)`——在不同模型规模下保持训练动态稳定。

### 经验法则

- 嵌入需要更高的 LR（更新稀疏）。切勿对嵌入应用权重衰减。
- 权重衰减调度：在训练过程中将 WD 线性衰减至 0。
- AdamW 默认值：β1=0.9、β2=0.95、eps=1e-10（而非默认的 1e-8——可防止 bf16 中的陈旧更新）。

有关 Muon 的详细信息（Polar Express 正交化、NorMuon），请参阅 `references/optimizers.md`。

---

## 学习率调度

### 基于时间（autoresearch 风格）

```python
def get_lr_multiplier(progress):  # progress = elapsed_time / time_budget
    if progress < warmup_ratio:
        return progress / warmup_ratio
    elif progress < 1.0 - warmdown_ratio:
        return 1.0
    else:
        cooldown = (1.0 - progress) / warmdown_ratio
        return cooldown + (1 - cooldown) * final_lr_frac
```

### 余弦衰减

```python
def get_lr(step, total_steps, max_lr, min_lr, warmup_steps):
    if step < warmup_steps:
        return max_lr * step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * progress))
```

**WSD（预热-稳定-衰减）**：正日益流行——更容易在训练运行中途恢复训练。

### 指导建议

- **预热**：占训练过程的 1-5%。使用 Muon 时可以不进行预热（autoresearch 使用 `WARMUP_RATIO=0.0`）。
- **降温**：在训练过程的 30-50% 中进行 LR 衰减。对最终质量的影响比预热更大。
- **最终 LR**：0 或峰值的约 10%。设为 0 更简单。

---

## 混合精度与编译

```python
import os
os.environ["PYTORCH_ALLOC_CONF"] = "expandable_segments:True"  # before torch import

import torch
torch.set_float32_matmul_precision("high")
autocast_ctx = torch.amp.autocast(device_type="cuda", dtype=torch.bfloat16)
model = torch.compile(model, dynamic=False)
```

- **bf16**（Ampere+）：与 fp32 具有相同的指数范围，无需损失缩放。优先于 fp16。
- **fp16**：需要 GradScaler。仅在 V100 或更旧的硬件上使用。
- `dynamic=False` 可启用最大程度的优化。如果没有计算图中断，请添加 `fullgraph=True`。
- 最初几个步骤会较慢（JIT）——计时时应将其排除。

---

## 内存与性能

### Meta 设备初始化（大型模型）

```python
with torch.device("meta"):
    model = GPT(config)          # zero memory
model.to_empty(device="cuda")
model.init_weights()
```

### MFU（模型 FLOPs 利用率）

```python
achieved_flops = model_flops_per_token * batch_tokens / step_time
mfu = achieved_flops / gpu_peak_flops
# H100 SXM: 989.5 TFLOPS | A100: 312 | RTX 4090: 165
```

理想目标：>30% 尚可，>40% 良好，>50% 优秀（单 GPU）。

### OOM 解决方案（按顺序）

1. 减小 `DEVICE_BATCH_SIZE`，增大 `grad_accum_steps`
2. `PYTORCH_ALLOC_CONF=expandable_segments:True`
3. `model.zero_grad(set_to_none=True)`
4. Meta 设备初始化 → `to_empty`
5. 激活检查点：`torch.utils.checkpoint.checkpoint()`
6. 8 位优化器（bitsandbytes）：优化器状态可节省约 30% 的内存

---

## 超参数搜索

### 优先级顺序（先调优 → 后调优）

1. **学习率** — 影响最大。始终优先调优。
2. **批量大小** — 使用能容纳的最大值。它是速度调节项，而非质量调节项。
3. **权重衰减** — AdamW 使用 0.01-0.1。
4. **预热步数** — 占训练总步数的 1-5%。

### 2025 年默认方案

| 设置 | 值 |
|---------|-------|
| 优化器 | AdamW (β1=0.9, β2=0.95, eps=1e-10) |
| 权重衰减 | 0.1 |
| 学习率调度 | 余弦衰减或 WSD |
| 峰值学习率 | 3e-4（模型越大，数值应越低） |
| 精度 | bf16 |
| 梯度裁剪 | max_norm=1.0 |
| 归一化 | RMSNorm（前置归一化） |
| 激活函数 | SwiGLU |
| 位置编码 | RoPE |
| 注意力 | Flash Attention，可选用 GQA |

---

## 调试检查清单

### Karpathy 的方法（仍是经典准则）

1. **与数据融为一体** — 进行可视化、检查分布、验证标签
2. **先让端到端流程运行起来** — 在简单案例上进行验证
3. **对单个批次过拟合** — 如果做不到，说明存在 bug
4. **然后再进行正则化** — 仅在能够成功过拟合后添加正则化
5. **调优超参数** — 从已知的默认值开始

### 损失爆炸 / NaN

1. 降低学习率（缩小 3-10 倍）
2. 添加梯度裁剪：`clip_grad_norm_(params, 1.0)`
3. 检查输入中是否存在 inf/nan
4. 添加 logit 软上限：`softcap * tanh(logits / softcap)`
5. 在注意力中添加 QK-norm
6. 验证权重初始化（输出投影是否进行零初始化？）
7. 检查梯度累积时的损失缩放（`loss / grad_accum_steps`）

### 训练缓慢 / MFU 较低

1. 验证 `torch.compile` 是否已启用
2. 检查 `torch.set_float32_matmul_precision("high")`
3. 使用固定内存 + 非阻塞传输
4. 使用 `torch.profiler` 进行性能分析
5. 是否存在 GC 停顿？`gc.freeze(); gc.disable()`
6. Tensor Core 对齐：维度为 8/64 的倍数

### 损失停滞 / 收敛缓慢

1. 学习率过低 — 尝试增大 2-5 倍
2. 预热时间过长
3. 权重衰减过高
4. 验证学习率调度是否实际生效（每一步都打印）
5. 模型对于任务而言过小

### 静默失败

1. 训练集/验证集之间存在**数据泄漏**
2. **推理时预处理错误** — 数据增强不匹配
3. **标签错误** — 使用 cleanlab 检测
4. **数据打乱 bug** — 批次之间存在相关性
5. 预训练模型存在**分词器不匹配**

### 监控内容

- **梯度范数** — 梯度范数飙升通常先于损失飙升
- **逐层激活统计信息** — 可揭示梯度爆炸/消失问题
- **死亡神经元** — 超过 50% 的 ReLU 输出为零 = ReLU 死亡问题
- **学习率** — 验证调度是否已应用（常见的静默错误）

---

## 实验管理

使用 TSV 跟踪实验，以便轻松比较：

```
commit  val_bpb  memory_gb  status   description
a1b2c3d 0.9979   44.0       keep     baseline
b2c3d4e 0.9932   44.2       keep     increase matrix LR to 0.04
c3d4e5f 1.0050   44.0       discard  switch to GeLU (worse)
```

**简单性准则**：在其他条件相同的情况下，越简单越好。移除某项内容后仍获得相同
结果，就是很好的成果。有关系统化的智能体驱动实验，请参阅 `references/experiment-loop.md`。

### 按领域划分的评估指标

| 领域 | 主要指标 | 备注 |
|--------|---------------|-------|
| LLM | BPB（每字节比特数） | 不受词表大小影响 |
| 分类 | 准确率 / F1 | 对不平衡数据使用宏平均 F1 |
| 分割 | mIoU / Dice | 逐类别 IoU 可揭示薄弱之处 |
| 生成 | FID | 需要超过 10k 个样本 |
| 回归 | RMSE / MAE | 对偏斜的目标值进行对数变换 |