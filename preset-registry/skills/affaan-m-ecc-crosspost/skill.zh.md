---
name: crosspost
description: Multi-platform content distribution across X, LinkedIn, Threads, and Bluesky. Adapts content per platform using content-engine patterns. Never posts identical content cross-platform. Use when the user wants to distribute content across social platforms.
---
# 跨平台发布

将内容分发到多个平台，而不是把同一篇虚假的帖子换四套外衣。

## 何时启用

- 用户希望在多个平台发布基于同一核心想法的内容
- 需要为一次发布、更新、版本发布或文章制作适配不同平台的版本
- 用户说“crosspost”“post this everywhere”或“adapt this for X and LinkedIn”

## 核心规则

1. 不要在不同平台发布完全相同的文案。
2. 在不同平台保留作者的声音。
3. 根据平台限制进行调整，而不是迎合刻板印象。
4. 一篇帖子仍然应该只讲一件事。
5. 如果原始内容没有充分铺垫，就不要凭空添加行动号召、问题或寓意。

## 工作流程

### 第 1 步：从主版本开始

首先选择最有力的源版本：
- 原始 X 帖子
- 原始文章
- 发布说明
- 帖子串
- 备忘录或变更日志

如果源内容仍需塑造表达风格，请先使用 `content-engine`。

### 第 2 步：提取声音指纹

如果当前会话中尚未提取源内容的声音，请先运行 `brand-voice`。

直接复用生成的 `VOICE PROFILE`。
除非用户明确要求为本次活动全新设置覆盖规则，否则不要在这里再临时创建第二份声音检查清单。

### 第 3 步：根据平台限制进行调整

### X

- 保持精炼
- 以最有力的主张或成果开篇
- 只有在单篇帖子无法完整承载论点时才使用帖子串
- 避免使用话题标签和空泛的填充内容

### LinkedIn

- 只补充圈外读者理解内容所必需的背景
- 不要把内容改成虚假的创始人反思帖
- 不要仅仅因为平台是 LinkedIn 就在结尾添加问题
- 如果作者的自然表达本就更犀利，不要强行套用精致的“专业语气”

### Threads

- 保持易读、直接
- 不要编写虚假的、过度随意的创作者文案
- 不要直接粘贴 LinkedIn 版本后再将其缩短

### Bluesky

- 保持简洁
- 保留作者的行文节奏
- 不要依赖话题标签或迎合信息流算法的措辞

## 发布顺序

默认：
1. 首先发布最有力的原生版本
2. 针对其他次要平台进行调整
3. 只有在用户需要发布时序方面的帮助时才错开发布时间

除非确有帮助，否则不要添加跨平台引用。大多数情况下，帖子应该能够独立成立。

## 禁用模式

删除并重写以下任何表达：
- “Excited to share”
- “Here's what I learned”
- “What do you think?”
- “link in bio”，除非实际情况确实如此
- 原始内容中不存在的、泛泛而谈的“专业启示”段落

## 输出格式

返回：
- 主平台版本
- 针对用户所要求的各个平台调整后的版本
- 关于改动内容及原因的简短说明
- 用户仍需解决的任何发布限制

## 质量检查

交付前：
- 每个版本读起来都应像同一位作者在不同限制条件下创作的内容
- 任何平台的版本都不应显得注水或被刻意弱化
- 不同平台之间不得逐字复制文案
- 为 LinkedIn 或新闻简报用途添加的任何额外背景都必须确有必要

## 相关技能

- `brand-voice`：用于从源内容中提取可复用的声音
- `content-engine`：用于声音提取和源内容塑造
- `x-api`：用于 X 发布工作流