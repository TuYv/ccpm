---
name: domain-ml
description: "Use when building ML/AI apps in Rust. Keywords: machine learning, ML, AI, tensor, model, inference, neural network, deep learning, training, prediction, ndarray, tch-rs, burn, candle, 机器学习, 人工智能, 模型推理"
user-invocable: false
---
# 机器学习领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 大规模数据 | 高效的内存使用 | 零拷贝、流式处理 |
| GPU 加速 | 支持 CUDA/Metal | candle、tch-rs |
| 模型可移植性 | 标准格式 | ONNX |
| 批处理 | 吞吐量优先于延迟 | 批量推理 |
| 数值精度 | 浮点数处理 | ndarray、谨慎使用 f32/f64 |
| 可复现性 | 确定性 | 设置随机种子、版本管理 |

---

## 关键约束

### 内存效率

```
RULE: Avoid copying large tensors
WHY: Memory bandwidth is bottleneck
RUST: References, views, in-place ops
```

### GPU 利用率

```
RULE: Batch operations for GPU efficiency
WHY: GPU overhead per kernel launch
RUST: Batch sizes, async data loading
```

### 模型可移植性

```
RULE: Use standard model formats
WHY: Train in Python, deploy in Rust
RUST: ONNX via tract or candle
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need efficient data pipelines"
    ↓ m10-performance: Streaming, batching
    ↓ polars: Lazy evaluation

"Need GPU inference"
    ↓ m07-concurrency: Async data loading
    ↓ candle/tch-rs: CUDA backend

"Need model loading"
    ↓ m12-lifecycle: Lazy init, caching
    ↓ tract: ONNX runtime
```

---

## 用例 → 框架

| 用例 | 推荐方案 | 原因 |
|----------|-------------|-----|
| 仅推理 | tract（ONNX） | 轻量、可移植 |
| 训练 + 推理 | candle、burn | 纯 Rust、支持 GPU |
| PyTorch 模型 | tch-rs | 直接绑定 |
| 数据管道 | polars | 快速、惰性求值 |

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| 张量 | ndarray |
| ONNX 推理 | tract |
| 机器学习框架 | candle、burn |
| PyTorch 绑定 | tch-rs |
| 数据处理 | polars |
| 嵌入 | fastembed |

## 设计模式

| 模式 | 目的 | 实现 |
|---------|---------|----------------|
| 模型加载 | 加载一次，重复使用 | `OnceLock<Model>` |
| 批处理 | 提高吞吐量 | 收集后处理 |
| 流式处理 | 处理大规模数据 | 基于迭代器 |
| GPU 异步处理 | 并行性 | 数据加载与计算并行进行 |

## 代码模式：推理服务器

```rust
use std::sync::OnceLock;
use tract_onnx::prelude::*;

static MODEL: OnceLock<SimplePlan<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>> = OnceLock::new();

fn get_model() -> &'static SimplePlan<...> {
    MODEL.get_or_init(|| {
        tract_onnx::onnx()
            .model_for_path("model.onnx")
            .unwrap()
            .into_optimized()
            .unwrap()
            .into_runnable()
            .unwrap()
    })
}

async fn predict(input: Vec<f32>) -> anyhow::Result<Vec<f32>> {
    let model = get_model();
    let input = tract_ndarray::arr1(&input).into_shape((1, input.len()))?;
    let result = model.run(tvec!(input.into()))?;
    Ok(result[0].to_array_view::<f32>()?.iter().copied().collect())
}
```

## 代码模式：批量推理

```rust
async fn batch_predict(inputs: Vec<Vec<f32>>, batch_size: usize) -> Vec<Vec<f32>> {
    let mut results = Vec::with_capacity(inputs.len());

    for batch in inputs.chunks(batch_size) {
        // Stack inputs into batch tensor
        let batch_tensor = stack_inputs(batch);

        // Run inference on batch
        let batch_output = model.run(batch_tensor).await;

        // Unstack results
        results.extend(unstack_outputs(batch_output));
    }

    results
}
```

---

## 常见错误

| 错误 | 违反的领域原则 | 修复方法 |
|---------|-----------------|-----|
| 克隆张量 | 浪费内存 | 使用视图 |
| 单次推理 | GPU 利用率不足 | 批处理 |
| 每次请求都加载模型 | 速度慢 | 单例模式 |
| 同步加载数据 | GPU 空闲 | 异步流水线 |

---

## 追溯至第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 内存效率 | 零拷贝 | ndarray 视图 |
| 模型单例 | 延迟初始化 | OnceLock<Model> |
| 批处理 | 分块迭代 | chunks() + 并行 |
| GPU 异步 | 并发加载 | tokio::spawn + GPU |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 性能 | m10-performance |
| 延迟初始化 | m12-lifecycle |
| 异步模式 | m07-concurrency |
| 内存效率 | m01-ownership |