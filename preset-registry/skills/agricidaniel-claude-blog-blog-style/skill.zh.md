---
name: blog-style
description: Learn author writing style from 5 to 10 existing blog posts and generate a voice profile for /blog style learn, VOICE.md, blog-persona, and blog-write when users ask to infer tone, analyze author voice, learn style, or build a writing baseline.
argument-hint: "learn <paths>"
user-invokable: true
license: MIT
---
# 博客风格 - 写作风格学习

从现有文章中学习作者的声音画像，然后将其作为 VOICE.md、blog-persona 和 blog-write 的基准。该画像会捕捉可衡量的风格信号，以便未来的草稿能够保留作者的节奏、用词和语气。

## 命令

| 命令 | 用途 |
|---------|---------|
| `/blog style learn <paths>` | 分析示例文章并生成声音画像 |

## 学习工作流

使用来自同一作者、品牌或编辑风格的 5 到 10 篇代表性文章。支持单个 markdown 文件、MDX 文件、文本文件，或包含文章的目录。

运行本地学习器：

```bash
python3 scripts/style_learn.py <paths> --format markdown
```

如需机器可读的输出：

```bash
python3 scripts/style_learn.py <paths> --format json --output voice-profile.json
```

如需可直接用于 VOICE.md 的内容块：

```bash
python3 scripts/style_learn.py <paths> --format markdown --output VOICE.md
```

如果提供的样本数少于要求的最小数量，则发出警告并继续。默认最小数量为 5 篇文章。

## 画像字段

学习器会汇总现有博客分析器针对每篇示例文章生成的结果：

- 句子长度的平均值和中位数
- 以语料库方差表示的句子长度突发性
- 以类型-词例比表示的词汇丰富度
- 包含过渡词的句子比例
- 被动语态句子比例
- 每 1,000 词中的 AI 触发词数量，作为需要保留或避免的基准
- 段落长度分布
- 第一人称使用比例
- 以问题形式呈现的标题比例
- 从移除停用词后的高频 2-gram 和 3-gram 内容短语中提取的标志性短语
- 根据测量指标得出的语气描述

## 使用画像

当目标是提供持久的项目上下文时，将 markdown 内容块放入项目的 `VOICE.md`。Blog-write 可以将这些风格基准作为草稿撰写目标：

- 使平均句子长度接近学习到的平均值。
- 除非用户要求更紧凑或更松散的节奏，否则应与学习到的句子变化程度保持一致。
- 仅在标志性短语能自然契合主题时保留它们。
- 当作者很少使用这些词语时，将 AI 触发词基准视为上限。
- 使用第一人称比例和问题式标题比例，决定草稿应呈现多强的个人色彩，以及应在多大程度上以问题引导。

当需要创建或更新结构化角色画像时，将 JSON 输出提供给 blog-persona。将学习到的值映射到角色画像的句子长度、被动语态、可读性、词汇和语气设置。

## 错误处理

- **文章过少**：继续执行，并警告画像的稳定性可能较低。
- **路径缺失**：跳过缺失的路径，并在画像中包含警告。
- **不支持的文件**：跳过不支持的文件类型，并包含警告。
- **空样本**：返回归零后的指标，而不是崩溃。