---
name: book-sft-pipeline
description: "This skill should be used for book-to-SFT pipelines: ePub extraction, literary segmentation, author-voice dataset construction, style-transfer training, LoRA workflows, and model evaluation for voice replication."
version: 2.0.0
---
# 图书 SFT 流水线

一套完整的系统，用于将图书转换为 SFT 数据集并训练风格迁移模型。此技能介绍从原始 ePub 到能够以任意作者笔调进行写作的模型这一完整流程。

## 何时启用

在以下情况下启用此技能：
- 根据文学作品构建微调数据集
- 创建作者笔调或风格迁移模型
- 为 Tinker 或类似的 SFT 平台准备训练数据
- 为长篇内容设计文本分段流水线
- 使用有限数据训练小型模型（8B 或更小）

## 核心概念

### 图书 SFT 的三大支柱

**1. 智能分段**
文本块必须在语义上保持连贯。在句子中间断开会使模型学会生成支离破碎的输出。目标：每个文本块包含 150-400 个单词，并且始终在自然边界处分段。

**2. 多样化指令生成**
使用多种提示词模板和系统提示词来防止过拟合。单一的提示词风格会导致记忆。应使用 15 个以上的提示词模板和 5 个以上的系统提示词。

**3. 风格优先于内容**
目标是学习作者的节奏和词汇模式，而不是记忆情节。合成指令描述发生的事情，但不引用原文。

## 流水线架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│  Coordinates pipeline phases, manages state, handles failures   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  EXTRACTION  │ │ SEGMENTATION │ │  INSTRUCTION │ │   DATASET    │
│    AGENT     │ │    AGENT     │ │    AGENT     │ │   BUILDER    │
│ ePub → Text  │ │ Text → Chunks│ │ Chunks →     │ │ Pairs →      │
│              │ │ 150-400 words│ │ Prompts      │ │ JSONL        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐               ┌──────────────┐
│   TRAINING   │               │  VALIDATION  │
│    AGENT     │               │    AGENT     │
│ LoRA on      │               │ AI detector  │
│ Tinker       │               │ Originality  │
└──────────────┘               └──────────────┘
```

## 阶段 1：文本提取

### 关键规则
1. **始终优先使用 ePub 而非 PDF** - OCR 错误会成为模型学到的模式
2. **使用段落级提取** - 从 `<p>` 标签中提取，以保留分段
3. **移除正文前后的附加内容** - 版权信息和目录会污染数据集

```python
# Extract text from ePub paragraphs
from epub2 import EPub
from bs4 import BeautifulSoup

def extract_epub(path):
    book = EPub(path)
    chapters = []
    for item in book.flow:
        html = book.get_chapter(item.id)
        soup = BeautifulSoup(html, 'html.parser')
        paragraphs = [p.get_text().strip() for p in soup.find_all('p')]
        chapters.append('\n\n'.join(p for p in paragraphs if p))
    return '\n\n'.join(chapters)
```

## 阶段 2：智能分段

### 更小的文本块 + 重叠

与较大的文本块（250-650 词）相比，更小的文本块（150-400 词）可以生成更多训练样本，并实现更好的风格迁移。

```python
def segment(text, min_words=150, max_words=400):
    paragraphs = text.split('\n\n')
    chunks, buffer, buffer_words = [], [], 0
    
    for para in paragraphs:
        words = len(para.split())
        if buffer_words + words > max_words and buffer_words >= min_words:
            chunks.append('\n\n'.join(buffer))
            # Keep last paragraph for overlap
            buffer = [buffer[-1], para] if buffer else [para]
            buffer_words = sum(len(p.split()) for p in buffer)
        else:
            buffer.append(para)
            buffer_words += words
    
    if buffer:
        chunks.append('\n\n'.join(buffer))
    return chunks
```

### 预期结果

对于一本 86,000 词的书：
- 旧方法（250-650 词）：约 150 个文本块
- 新方法（150-400 词 + 重叠）：约 300 个文本块
- 每个文本块生成 2 个变体：600 多个训练样本

## 阶段 3：生成多样化指令

### 关键洞见

使用单一提示词模板会导致记忆。多样化模板能够教授其底层风格。

```python
SYSTEM_PROMPTS = [
    "You are an expert creative writer capable of emulating specific literary styles.",
    "You are a literary writer with deep knowledge of classic prose styles.",
    "You are a creative writer skilled at emulating distinctive authorial voices.",
    "You write prose that captures the essence of modernist literature.",
    "You are a talented writer who can channel classic American authors.",
]

PROMPT_TEMPLATES = [
    "Write a passage in the style of {author}: {desc}",
    "Channel {author}'s voice to write about: {desc}",
    "In {author}'s distinctive prose style, describe: {desc}",
    "Write this scene as {author} would have: {desc}",
    "Using {author}'s repetitive technique, describe: {desc}",
    "Capture the rhythm of {author} in this passage: {desc}",
    "Write like {author}: {desc}",
    "In the voice of {author}, write: {desc}",
    "This is a literary exercise. Write like {author}: {desc}",
    "Can you write in {author}'s style? {desc}",
]
```

### 指令生成

```python
INSTRUCTION_PROMPT = """Describe what is happening in this excerpt in 2-3 sentences.
Focus on: characters present, actions, emotions, setting.
Do NOT quote the text directly.

Excerpt:
{text}
"""

# Use a fast, cheap LLM (e.g., Gemini Flash)
instruction = llm_call(INSTRUCTION_PROMPT.format(text=chunk))
```

## 阶段 4：数据集构建

### 消息格式

```json
{
    "messages": [
        {"role": "system", "content": "You are an expert creative writer..."},
        {"role": "user", "content": "Write in the style of Author: Scene description..."},
        {"role": "assistant", "content": "The actual book text from chunk..."}
    ]
}
```

### 每个文本块生成多个变体

```python
def build_examples(chunk, instruction, author, variants=2):
    examples = []
    for i in range(variants):
        system = SYSTEM_PROMPTS[i % len(SYSTEM_PROMPTS)]
        template = PROMPT_TEMPLATES[(chunk.id + i) % len(PROMPT_TEMPLATES)]
        user = template.format(author=author, desc=instruction)
        examples.append({"messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
            {"role": "assistant", "content": chunk.text}
        ]})
    return examples
```

## 阶段 5：在 Tinker 上进行 LoRA 训练

### 配置

```python
CONFIG = {
    "model_name": "Qwen/Qwen3-8B-Base",  # Base, not instruct
    "lora_rank": 32,                      # 352MB adapter
    "learning_rate": 5e-4,                # Higher for LoRA
    "batch_size": 4,
    "epochs": 3,
}
```

### 为什么使用基础模型？

使用**基础**（预训练）模型，而非指令微调版本：
- 基础模型对于学习新风格的可塑性更强
- 指令模型已有的模式更难被覆盖
- 风格是一种底层模式，基础模型能更好地捕捉它

### 训练循环

```python
import tinker
from tinker import types

training_client = await service_client.create_lora_training_client_async(
    base_model="Qwen/Qwen3-8B-Base",
    rank=32
)

for epoch in range(3):
    for batch in batches:
        await training_client.forward_backward_async(batch, loss_fn="cross_entropy")
        await training_client.optim_step_async(types.AdamParams(learning_rate=5e-4))

result = await training_client.save_weights_for_sampler_async(name="final")
```

## 阶段 6：验证

### 现代场景测试

使用原著中不可能存在的场景进行测试：

```python
TEST_PROMPTS = [
    "Write about a barista making lattes",
    "Describe lovers communicating through text messages",
    "Write about someone anxious about climate change",
]
```

如果模型能将风格标记应用于现代场景，说明它学到的是**风格**，而非**内容**。

### 原创性验证

```bash
# Search training data for output phrases
grep "specific phrase from output" dataset.jsonl
# Should return: No matches
```

### AI 检测器测试

使用 GPTZero、Pangram 或 ZeroGPT 测试输出。

## 已知问题及解决方案

### 角色姓名泄露

**症状**：模型在新场景中使用原著角色的姓名。
**原因**：仅使用一本书，姓名多样性有限。
**解决方案**：使用多本书进行训练，或添加合成示例。

### 模型照搬原句

**症状**：输出中包含训练数据里的完整原句。
**原因**：提示词变体太少或训练轮数太多。
**解决方案**：使用 15 个以上的模板，并将训练限制为 3 轮。

### 输出支离破碎

**症状**：句子给人未完成的感觉。
**原因**：分段不当，在语意中途截断。
**解决方案**：始终在段落边界处进行切分。

## 准则

1. **始终优先使用 ePub 而非 PDF** - OCR 错误会成为模型学到的模式
2. **绝不在句子中间切分** - 边界处的语法结构必须完整
3. **使用多样化的提示词** - 15 个以上的模板，5 个以上的系统提示词
4. **使用基础模型** - 不要使用指令微调版本
5. **使用更小的文本块** - 每块 150-400 词，以获得更多示例
6. **预留测试集** - 至少 50 个示例
7. **使用现代场景进行测试** - 证明是风格迁移而非记忆
8. **验证原创性** - 使用 Grep 在训练数据中搜索输出短语

## 预期结果

| 指标 | 数值 |
|--------|-------|
| 训练示例 | 每本书 500-1000 个 |
| 模型 | Qwen/Qwen3-8B-Base |
| LoRA 秩 | 32 |
| 适配器大小 | ~350 MB |
| 训练时间 | ~15 分钟 |
| 损失下降 | 90%+ |
| 风格迁移成功率 | ~50% 完美 |

## 成本估算

| 组成部分 | 成本 |
|-----------|------|
| LLM（指令生成） | ~$0.50 |
| Tinker 训练（15 分钟） | ~$1.50 |
| **总计** | **~$2.00** |

## 与上下文工程技能的集成

本示例应用了 Agent Skills for Context Engineering 集合中的多项技能：

### project-development
该流水线遵循分阶段、幂等的架构模式：
- **获取**：从 ePub 中提取文本
- **准备**：切分为训练文本块
- **处理**：生成合成指令
- **解析**：构建消息格式
- **渲染**：输出与 Tinker 兼容的 JSONL
- **训练**：LoRA 微调
- **验证**：现代场景测试

每个阶段都可恢复执行，并会生成用于调试的中间产物。

### context-compression
文本切分是训练中的一种上下文压缩形式。context-compression 的核心洞见同样适用：信息密度比信息数量更重要。较小且语义连贯的文本块（150-400 词）比较大且信息稀释的文本块能产生更好的风格迁移效果。

双层策略与上下文压缩评估相呼应：
- 第 1 层：快速、确定性的压缩
- 第 2 层：针对边缘情况由 LLM 辅助处理

### multi-agent-patterns
该流水线使用**监督者/编排器**模式：
- 编排器协调各个阶段并管理状态
- 专用智能体（提取、切分、指令、构建）拥有相互隔离的上下文
- 每个智能体仅接收完成其任务所需的信息

这符合以下原则：子智能体的主要作用是隔离上下文，而不是模拟角色。

### evaluation
验证遵循**终态评估**模式：
- 功能测试：输出是否符合预期的风格标记？
- 原创性验证：内容是否确实为生成所得？
- 外部验证：AI 检测器评分

“现代场景”测试是一种分布外评估，用于证明泛化能力。

### context-fundamentals
提示词的多样性可以防止注意力集中在单一模式上。使用相同的提示词结构进行训练时，模型会记忆指令与响应之间的映射。多样化的模板会迫使注意力分布到风格模式本身。

## 参考资料

内部参考资料：
- [切分策略](./references/segmentation-strategies.md) - 文本分块模式
- [Tinker 格式规范](./references/tinker-format.md) - Datum 结构
- [Tinker API 文档](./references/tinker.txt) - 完整的 API 参考资料

Agent Skills for Context Engineering 中的相关技能：
- project-development - 流水线架构模式
- context-compression - 压缩策略  
- multi-agent-patterns - 智能体协调
- evaluation - 评估框架
- context-fundamentals - 注意力与信息密度

外部资源：
- [研究论文](https://arxiv.org/pdf/2510.13939) - Chakrabarty 等，2025
- [Hugging Face 上的数据集](https://huggingface.co/datasets/MuratcanKoylan/gertrude-stein-style-sft)
- [Gertrude Stein 案例研究](./examples/gertrude-stein/) - 完整的可运行示例

---

## Skill 元数据

**创建日期**：2025-12-26
**最后更新**：2025-12-28
**作者**：Muratcan Koylan
**版本**：2.0.0
**可独立使用**：是（独立于主要的上下文工程合集）