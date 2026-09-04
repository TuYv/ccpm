---
name: sentencepiece
description: Language-independent tokenizer treating text as raw Unicode. Supports BPE and Unigram algorithms. Fast (50k sentences/sec), lightweight (6MB memory), deterministic vocabulary. Used by T5, ALBERT, XLNet, mBART. Train on raw text without pre-tokenization. Use when you need multilingual support, CJK languages, or reproducible tokenization.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Tokenization, SentencePiece, Language-Independent, BPE, Unigram, Multilingual, CJK Languages, Unicode, Deterministic, Google]
dependencies: [sentencepiece, transformers]
---
# SentencePiece - 语言无关的分词

无监督分词器，可直接处理原始文本，无需针对特定语言的预处理。

## 何时使用 SentencePiece

**在以下情况下使用 SentencePiece：**
- 构建多语言模型（无特定语言规则）
- 处理 CJK 语言（中文、日语、韩语）
- 需要可复现的分词（确定性的词表）
- 想直接在原始文本上训练（无需预分词）
- 需要轻量级部署（6MB 内存，50,000 句/秒）

**性能**：
- **速度**：50,000 句/秒
- **内存**：模型加载后约 6MB
- **语言**：所有语言（语言无关）

**可改用以下替代方案**：
- **HuggingFace Tokenizers**：训练更快，灵活性更高
- **tiktoken**：OpenAI 模型（GPT-3.5/4）
- **BERT WordPiece**：以英语为中心的任务

## 快速开始

### 安装

```bash
# Python
pip install sentencepiece

# C++ (requires CMake)
git clone https://github.com/google/sentencepiece.git
cd sentencepiece
mkdir build && cd build
cmake .. && make -j $(nproc)
sudo make install
```

### 训练模型

```bash
# Command-line (BPE with 8000 vocab)
spm_train --input=data.txt --model_prefix=m --vocab_size=8000 --model_type=bpe

# Python API
import sentencepiece as spm

spm.SentencePieceTrainer.train(
    input='data.txt',
    model_prefix='m',
    vocab_size=8000,
    model_type='bpe'
)
```

**训练时间**：100MB 语料约需 1-2 分钟

### 编码与解码

```python
import sentencepiece as spm

# Load model
sp = spm.SentencePieceProcessor(model_file='m.model')

# Encode to pieces
pieces = sp.encode('This is a test', out_type=str)
print(pieces)  # ['▁This', '▁is', '▁a', '▁test']

# Encode to IDs
ids = sp.encode('This is a test', out_type=int)
print(ids)  # [284, 47, 11, 1243]

# Decode
text = sp.decode(ids)
print(text)  # "This is a test"
```

## 语言无关的设计

### 空格作为符号（▁）

```python
text = "Hello world"
pieces = sp.encode(text, out_type=str)
print(pieces)  # ['▁Hello', '▁world']

# Decode preserves spaces
decoded = sp.decode_pieces(pieces)
print(decoded)  # "Hello world"
```

**核心原则**：将文本视为原始 Unicode，空格 = ▁（元符号）

## 分词算法

### BPE（字节对编码）

```python
spm.SentencePieceTrainer.train(
    input='data.txt',
    model_prefix='bpe_model',
    vocab_size=16000,
    model_type='bpe'
)
```

**使用者**：mBART

### Unigram（默认）

```python
spm.SentencePieceTrainer.train(
    input='data.txt',
    model_prefix='unigram_model',
    vocab_size=8000,
    model_type='unigram'
)
```

**使用者**：T5、ALBERT、XLNet

## 训练配置

### 关键参数

```python
spm.SentencePieceTrainer.train(
    input='corpus.txt',
    model_prefix='m',
    vocab_size=32000,
    model_type='unigram',
    character_coverage=0.9995,  # 1.0 for CJK
    user_defined_symbols=['[SEP]', '[CLS]'],
    unk_piece='<unk>',
    num_threads=16
)
```

### 字符覆盖率

| 语言类型 | 覆盖率 | 原因 |
|---------------|----------|-----------|
| 英语       | 0.9995   | 覆盖最常见的字符 |
| CJK（中文） | 1.0      | 需要所有字符 |
| 多语言  | 0.9995   | 平衡取舍 |

## 编码选项

### 子词正则化

```python
# Sample different tokenizations
for _ in range(3):
    pieces = sp.encode('tokenization', out_type=str, enable_sampling=True, alpha=0.1)
    print(pieces)

# Output (different each time):
# ['▁token', 'ization']
# ['▁tok', 'en', 'ization']
```

**用例**：用于提升鲁棒性的数据增强。

## 常见模式

### T5 风格的训练

```python
spm.SentencePieceTrainer.train(
    input='c4_corpus.txt',
    model_prefix='t5',
    vocab_size=32000,
    model_type='unigram',
    user_defined_symbols=[f'<extra_id_{i}>' for i in range(100)],
    unk_id=2,
    eos_id=1,
    pad_id=0
)
```

### 与 transformers 集成

```python
from transformers import T5Tokenizer

# T5 uses SentencePiece internally
tokenizer = T5Tokenizer.from_pretrained('t5-base')
inputs = tokenizer('translate English to French: Hello', return_tensors='pt')
```

## 性能基准

### 训练速度

| 语料 | BPE (16k) | Unigram (8k) |
|--------|-----------|--------------|
| 100 MB | 1-2 分钟   | 3-4 分钟      |
| 1 GB   | 10-15 分钟 | 30-40 分钟    |

### 分词速度

- **SentencePiece**：50,000 句/秒
- **HF Tokenizers**：200,000 句/秒（快 4 倍）

## 支持的模型

**T5 系列**：`t5-base`、`t5-large`（32k 词表，Unigram）
**ALBERT**：`albert-base-v2`（30k 词表，Unigram）
**XLNet**：`xlnet-base-cased`（32k 词表，Unigram）
**mBART**：`facebook/mbart-large-50`（250k 词表，BPE）

## 参考资料

- **[训练指南](references/training.md)** - 详细选项、语料准备
- **[算法指南](references/algorithms.md)** - BPE 与 Unigram 对比、子词正则化

## 资源

- **GitHub**：https://github.com/google/sentencepiece ⭐ 10,000+
- **论文**：https://arxiv.org/abs/1808.06226 (EMNLP 2018)
- **版本**：0.2.0+
