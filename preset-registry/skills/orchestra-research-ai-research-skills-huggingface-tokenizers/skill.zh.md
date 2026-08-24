---
name: huggingface-tokenizers
description: Fast tokenizers optimized for research and production. Rust-based implementation tokenizes 1GB in <20 seconds. Supports BPE, WordPiece, and Unigram algorithms. Train custom vocabularies, track alignments, handle padding/truncation. Integrates seamlessly with transformers. Use when you need high-performance tokenization or custom tokenizer training.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Tokenization, HuggingFace, BPE, WordPiece, Unigram, Fast Tokenization, Rust, Custom Tokenizer, Alignment Tracking, Production]
dependencies: [tokenizers, transformers, datasets]
---
# HuggingFace Tokenizers - 面向 NLP 的快速分词

兼具 Rust 的性能与 Python 的易用性，可用于生产环境的高速分词器。

## 何时使用 HuggingFace Tokenizers

**在以下情况下使用 HuggingFace Tokenizers：**
- 需要极快的分词速度（每 GB 文本耗时 <20 秒）
- 从头训练自定义分词器
- 需要跟踪对齐关系（词元 → 原始文本位置）
- 构建生产级 NLP 流水线
- 需要高效地对大型语料库进行分词

**性能**：
- **速度**：在 CPU 上对 1GB 文本进行分词耗时不到 20 秒
- **实现**：Rust 核心，提供 Python/Node.js 绑定
- **效率**：比纯 Python 实现快 10-100 倍

**以下情况改用其他方案**：
- **SentencePiece**：与语言无关，由 T5/ALBERT 使用
- **tiktoken**：OpenAI 为 GPT 模型开发的 BPE 分词器
- **transformers AutoTokenizer**：仅加载预训练分词器（内部使用此库）

## 快速开始

### 安装

```bash
# Install tokenizers
pip install tokenizers

# With transformers integration
pip install tokenizers transformers
```

### 加载预训练分词器

```python
from tokenizers import Tokenizer

# Load from HuggingFace Hub
tokenizer = Tokenizer.from_pretrained("bert-base-uncased")

# Encode text
output = tokenizer.encode("Hello, how are you?")
print(output.tokens)  # ['hello', ',', 'how', 'are', 'you', '?']
print(output.ids)     # [7592, 1010, 2129, 2024, 2017, 1029]

# Decode back
text = tokenizer.decode(output.ids)
print(text)  # "hello, how are you?"
```

### 训练自定义 BPE 分词器

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

# Initialize tokenizer with BPE model
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# Configure trainer
trainer = BpeTrainer(
    vocab_size=30000,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    min_frequency=2
)

# Train on files
files = ["train.txt", "validation.txt"]
tokenizer.train(files, trainer)

# Save
tokenizer.save("my-tokenizer.json")
```

**训练时间**：100MB 语料库约需 1-2 分钟，1GB 语料库约需 10-20 分钟

### 使用填充进行批量编码

```python
# Enable padding
tokenizer.enable_padding(pad_id=3, pad_token="[PAD]")

# Encode batch
texts = ["Hello world", "This is a longer sentence"]
encodings = tokenizer.encode_batch(texts)

for encoding in encodings:
    print(encoding.ids)
# [101, 7592, 2088, 102, 3, 3, 3]
# [101, 2023, 2003, 1037, 2936, 6251, 102]
```

## 分词算法

### BPE（字节对编码）

**工作原理**：
1. 从字符级词表开始
2. 找出最频繁的字符对
3. 将其合并为新词元，并添加到词表
4. 重复上述过程，直到达到目标词表大小

**使用者**：GPT-2、GPT-3、RoBERTa、BART、DeBERTa

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import ByteLevel

tokenizer = Tokenizer(BPE(unk_token="<|endoftext|>"))
tokenizer.pre_tokenizer = ByteLevel()

trainer = BpeTrainer(
    vocab_size=50257,
    special_tokens=["<|endoftext|>"],
    min_frequency=2
)

tokenizer.train(files=["data.txt"], trainer=trainer)
```

**优点**：
- 能很好地处理 OOV 词（将其拆分为子词）
- 词表大小灵活
- 适用于形态丰富的语言

**权衡**：
- 分词结果取决于合并顺序
- 可能会意外拆分常用词

### WordPiece

**工作原理**：
1. 从字符词表开始
2. 计算合并对的得分：`frequency(pair) / (frequency(first) × frequency(second))`
3. 合并得分最高的字符对
4. 重复操作，直到达到目标词表大小

**使用者**：BERT、DistilBERT、MobileBERT

```python
from tokenizers import Tokenizer
from tokenizers.models import WordPiece
from tokenizers.trainers import WordPieceTrainer
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.normalizers import BertNormalizer

tokenizer = Tokenizer(WordPiece(unk_token="[UNK]"))
tokenizer.normalizer = BertNormalizer(lowercase=True)
tokenizer.pre_tokenizer = Whitespace()

trainer = WordPieceTrainer(
    vocab_size=30522,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    continuing_subword_prefix="##"
)

tokenizer.train(files=["corpus.txt"], trainer=trainer)
```

**优点**：
- 优先进行有意义的合并（高分表示语义相关）
- 已成功应用于 BERT（取得了最先进的结果）

**权衡**：
- 如果没有匹配的子词，未知词会变为 `[UNK]`
- 保存词表而非合并规则（文件更大）

### Unigram

**工作原理**：
1. 从大型词表（所有子字符串）开始
2. 使用当前词表计算语料库的损失
3. 移除对损失影响最小的词元
4. 重复操作，直到达到目标词表大小

**使用者**：ALBERT、T5、mBART、XLNet（通过 SentencePiece）

```python
from tokenizers import Tokenizer
from tokenizers.models import Unigram
from tokenizers.trainers import UnigramTrainer

tokenizer = Tokenizer(Unigram())

trainer = UnigramTrainer(
    vocab_size=8000,
    special_tokens=["<unk>", "<s>", "</s>"],
    unk_token="<unk>"
)

tokenizer.train(files=["data.txt"], trainer=trainer)
```

**优点**：
- 基于概率（寻找最可能的分词方式）
- 非常适合没有单词边界的语言
- 能够处理多样化的语言上下文

**权衡**：
- 训练的计算成本较高
- 需要调优的超参数更多

## 分词流水线

完整流水线：**规范化 → 预分词 → 模型 → 后处理**

### 规范化

清理文本并将其标准化：

```python
from tokenizers.normalizers import NFD, StripAccents, Lowercase, Sequence

tokenizer.normalizer = Sequence([
    NFD(),           # Unicode normalization (decompose)
    Lowercase(),     # Convert to lowercase
    StripAccents()   # Remove accents
])

# Input: "Héllo WORLD"
# After normalization: "hello world"
```

**常用规范化器**：
- `NFD`、`NFC`、`NFKD`、`NFKC` - Unicode 规范化形式
- `Lowercase()` - 转换为小写
- `StripAccents()` - 移除变音符号（é → e）
- `Strip()` - 移除空白字符
- `Replace(pattern, content)` - 正则表达式替换

### 预分词

将文本拆分为类似单词的单元：

```python
from tokenizers.pre_tokenizers import Whitespace, Punctuation, Sequence, ByteLevel

# Split on whitespace and punctuation
tokenizer.pre_tokenizer = Sequence([
    Whitespace(),
    Punctuation()
])

# Input: "Hello, world!"
# After pre-tokenization: ["Hello", ",", "world", "!"]
```

**常见的预分词器**：
- `Whitespace()` - 按空格、制表符和换行符拆分
- `ByteLevel()` - GPT-2 风格的字节级拆分
- `Punctuation()` - 单独分离标点符号
- `Digits(individual_digits=True)` - 逐个拆分数字
- `Metaspace()` - 将空格替换为 ▁（SentencePiece 风格）

### 后处理

为模型输入添加特殊词元：

```python
from tokenizers.processors import TemplateProcessing

# BERT-style: [CLS] sentence [SEP]
tokenizer.post_processor = TemplateProcessing(
    single="[CLS] $A [SEP]",
    pair="[CLS] $A [SEP] $B [SEP]",
    special_tokens=[
        ("[CLS]", 1),
        ("[SEP]", 2),
    ],
)
```

**常见模式**：
```python
# GPT-2: sentence <|endoftext|>
TemplateProcessing(
    single="$A <|endoftext|>",
    special_tokens=[("<|endoftext|>", 50256)]
)

# RoBERTa: <s> sentence </s>
TemplateProcessing(
    single="<s> $A </s>",
    pair="<s> $A </s> </s> $B </s>",
    special_tokens=[("<s>", 0), ("</s>", 2)]
)
```

## 对齐跟踪

跟踪词元在原始文本中的位置：

```python
output = tokenizer.encode("Hello, world!")

# Get token offsets
for token, offset in zip(output.tokens, output.offsets):
    start, end = offset
    print(f"{token:10} → [{start:2}, {end:2}): {text[start:end]!r}")

# Output:
# hello      → [ 0,  5): 'Hello'
# ,          → [ 5,  6): ','
# world      → [ 7, 12): 'world'
# !          → [12, 13): '!'
```

**使用场景**：
- 命名实体识别（将预测结果映射回文本）
- 问答（提取答案文本跨度）
- 词元分类（将标签与原始位置对齐）

## 与 transformers 集成

### 使用 AutoTokenizer 加载

```python
from transformers import AutoTokenizer

# AutoTokenizer automatically uses fast tokenizers
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Check if using fast tokenizer
print(tokenizer.is_fast)  # True

# Access underlying tokenizers.Tokenizer
fast_tokenizer = tokenizer.backend_tokenizer
print(type(fast_tokenizer))  # <class 'tokenizers.Tokenizer'>
```

### 将自定义分词器转换为 transformers 分词器

```python
from tokenizers import Tokenizer
from transformers import PreTrainedTokenizerFast

# Train custom tokenizer
tokenizer = Tokenizer(BPE())
# ... train tokenizer ...
tokenizer.save("my-tokenizer.json")

# Wrap for transformers
transformers_tokenizer = PreTrainedTokenizerFast(
    tokenizer_file="my-tokenizer.json",
    unk_token="[UNK]",
    pad_token="[PAD]",
    cls_token="[CLS]",
    sep_token="[SEP]",
    mask_token="[MASK]"
)

# Use like any transformers tokenizer
outputs = transformers_tokenizer(
    "Hello world",
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt"
)
```

## 常见模式

### 从迭代器训练（大型数据集）

```python
from datasets import load_dataset

# Load dataset
dataset = load_dataset("wikitext", "wikitext-103-raw-v1", split="train")

# Create batch iterator
def batch_iterator(batch_size=1000):
    for i in range(0, len(dataset), batch_size):
        yield dataset[i:i + batch_size]["text"]

# Train tokenizer
tokenizer.train_from_iterator(
    batch_iterator(),
    trainer=trainer,
    length=len(dataset)  # For progress bar
)
```

**性能**：处理 1GB 数据约需 10-20 分钟

### 启用截断和填充

```python
# Enable truncation
tokenizer.enable_truncation(max_length=512)

# Enable padding
tokenizer.enable_padding(
    pad_id=tokenizer.token_to_id("[PAD]"),
    pad_token="[PAD]",
    length=512  # Fixed length, or None for batch max
)

# Encode with both
output = tokenizer.encode("This is a long sentence that will be truncated...")
print(len(output.ids))  # 512
```

### 多进程处理

```python
from tokenizers import Tokenizer
from multiprocessing import Pool

# Load tokenizer
tokenizer = Tokenizer.from_file("tokenizer.json")

def encode_batch(texts):
    return tokenizer.encode_batch(texts)

# Process large corpus in parallel
with Pool(8) as pool:
    # Split corpus into chunks
    chunk_size = 1000
    chunks = [corpus[i:i+chunk_size] for i in range(0, len(corpus), chunk_size)]

    # Encode in parallel
    results = pool.map(encode_batch, chunks)
```

**加速效果**：使用 8 核可提升 5-8 倍

## 性能基准测试

### 训练速度

| 语料库大小 | BPE（30k 词表） | WordPiece（30k） | Unigram（8k） |
|-------------|-----------------|-----------------|--------------|
| 10 MB       | 15 秒           | 18 秒           | 25 秒        |
| 100 MB      | 1.5 分钟        | 2 分钟          | 4 分钟       |
| 1 GB        | 15 分钟         | 20 分钟         | 40 分钟      |

**硬件**：16 核 CPU，基于英文维基百科测试

### 分词速度

| 实现方式 | 1 GB 语料库 | 吞吐量 |
|----------------|-------------|---------------|
| 纯 Python      | 约 20 分钟  | 约 50 MB/分钟 |
| HF Tokenizers  | 约 15 秒    | 约 4 GB/分钟  |
| **加速效果**   | **80 倍**   | **80 倍**     |

**测试条件**：英文文本，平均句长为 20 个单词

### 内存使用量

| 任务                    | 内存    |
|-------------------------|---------|
| 加载 tokenizer          | 约 10 MB  |
| 训练 BPE（30k 词表）    | 约 200 MB |
| 编码 100 万个句子       | 约 500 MB |

## 支持的模型

可通过 `from_pretrained()` 获取预训练 tokenizer：

**BERT 系列**：
- `bert-base-uncased`, `bert-large-cased`
- `distilbert-base-uncased`
- `roberta-base`, `roberta-large`

**GPT 系列**：
- `gpt2`, `gpt2-medium`, `gpt2-large`
- `distilgpt2`

**T5 系列**：
- `t5-small`, `t5-base`, `t5-large`
- `google/flan-t5-xxl`

**其他**：
- `facebook/bart-base`, `facebook/mbart-large-cc25`
- `albert-base-v2`, `albert-xlarge-v2`
- `xlm-roberta-base`, `xlm-roberta-large`

浏览全部模型：https://huggingface.co/models?library=tokenizers

## 参考资料

- **[训练指南](references/training.md)** - 训练自定义 tokenizer、配置 trainer 以及处理大型数据集
- **[算法深入解析](references/algorithms.md)** - 详细讲解 BPE、WordPiece 和 Unigram
- **[流水线组件](references/pipeline.md)** - normalizer、pre-tokenizer、post-processor 和 decoder
- **[Transformers 集成](references/integration.md)** - AutoTokenizer、PreTrainedTokenizerFast 和特殊 token

## 资源

- **文档**：https://huggingface.co/docs/tokenizers
- **GitHub**：https://github.com/huggingface/tokenizers ⭐ 9,000+
- **版本**：0.20.0+
- **课程**：https://huggingface.co/learn/nlp-course/chapter6/1
- **论文**：BPE（Sennrich 等，2016）、WordPiece（Schuster 和 Nakajima，2012）


