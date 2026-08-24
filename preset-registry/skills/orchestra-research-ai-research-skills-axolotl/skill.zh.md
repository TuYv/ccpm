---
name: axolotl
description: Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Fine-Tuning, Axolotl, LLM, LoRA, QLoRA, DPO, KTO, ORPO, GRPO, YAML, HuggingFace, DeepSpeed, Multimodal]
dependencies: [axolotl, torch, transformers, datasets, peft, accelerate, deepspeed]
---
# Axolotl Skill

基于官方文档生成的全面 axolotl 开发辅助。

## 何时使用此 Skill

此 Skill 应在以下情况下触发：
- 使用 axolotl
- 询问 axolotl 的功能或 API
- 实现 axolotl 解决方案
- 调试 axolotl 代码
- 学习 axolotl 最佳实践

## 快速参考

### 常见模式

**模式 1：** 要验证训练任务是否具备可接受的数据传输速度，运行 NCCL Tests 可以帮助定位瓶颈，例如：

```
./build/all_reduce_perf -b 8 -e 128M -f 2 -g 3
```

**模式 2：** 在 Axolotl yaml 中配置模型以使用 FSDP。例如：

```
fsdp_version: 2
fsdp_config:
  offload_params: true
  state_dict_type: FULL_STATE_DICT
  auto_wrap_policy: TRANSFORMER_BASED_WRAP
  transformer_layer_cls_to_wrap: LlamaDecoderLayer
  reshard_after_forward: true
```

**模式 3：** context_parallel_size 应是 GPU 总数的约数。例如：

```
context_parallel_size
```

**模式 4：** 例如：- 使用 8 个 GPU 且不采用序列并行时：每一步处理 8 个不同的批次 - 使用 8 个 GPU 且 context_parallel_size=4 时：每一步仅处理 2 个不同的批次（每个批次拆分到 4 个 GPU 上）- 如果每个 GPU 的 micro_batch_size 为 2，则全局批次大小将从 16 减少到 4

```
context_parallel_size=4
```

**模式 5：** 在配置中设置 save_compressed: true 可启用以压缩格式保存模型，这会：- 将磁盘空间占用减少约 40% - 保持与 vLLM 的兼容性，以实现加速推理 - 保持与 llmcompressor 的兼容性，以便进一步优化（例如：量化）

```
save_compressed: true
```

**模式 6：** 注意：无需将集成放在 integrations 文件夹中。它可以位于任何位置，只要它已通过软件包安装到你的 python 环境中即可。示例请参阅此仓库：https://github.com/axolotl-ai-cloud/diff-transformer

```
integrations
```

**模式 7：** 同时处理单样本数据和批量数据。- 单样本：sample[‘input_ids’] 是 list[int] - 批量数据：sample[‘input_ids’] 是 list[list[int]]

```
utils.trainer.drop_long_seq(sample, sequence_len=2048, min_sequence_len=2)
```

### 示例代码模式

**示例 1**（python）：
```python
cli.cloud.modal_.ModalCloud(config, app=None)
```

**示例 2**（python）：
```python
cli.cloud.modal_.run_cmd(cmd, run_folder, volumes=None)
```

**示例 3**（python）：
```python
core.trainers.base.AxolotlTrainer(
    *_args,
    bench_data_collator=None,
    eval_data_collator=None,
    dataset_tags=None,
    **kwargs,
)
```

**示例 4**（python）：
```python
core.trainers.base.AxolotlTrainer.log(logs, start_time=None)
```

**示例 5**（python）：
```python
prompt_strategies.input_output.RawInputOutputPrompter()
```

## 参考文件

此 Skill 在 `references/` 中包含完整文档：

- **api.md** - API 文档
- **dataset-formats.md** - 数据集格式文档
- **other.md** - 其他文档

需要详细信息时，请使用 `view` 读取特定的参考文件。

## 使用此 Skill

### 对于初学者
请从 getting_started 或 tutorials 参考文件开始，了解基础概念。

### 对于特定功能
请使用相应类别的参考文件（api、guides 等）获取详细信息。

### 对于代码示例
上面的快速参考部分包含从官方文档中提取的常用模式。

## 资源

### references/
从官方来源提取并整理的文档。这些文件包含：
- 详细说明
- 带有语言标注的代码示例
- 原始文档链接
- 用于快速导航的目录

### scripts/
在此处添加辅助脚本，用于执行常见的自动化任务。

### assets/
在此处添加模板、样板代码或示例项目。

## 注意事项

- 此 Skill 根据官方文档自动生成
- 参考文件保留了源文档的结构和示例
- 代码示例包含语言检测，以提供更好的语法高亮
- 快速参考模式提取自文档中的常见用法示例

## 更新

要使用更新后的文档刷新此 Skill：
1. 使用相同的配置重新运行抓取工具
2. 此 Skill 将使用最新信息重新构建