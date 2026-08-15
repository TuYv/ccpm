---
name: gemini-history-analyzer
description: Analyze Google Takeout exports of Gemini conversation history. Use when the user mentions Gemini takeout, Gemini export, Gemini history, Gemini conversation analysis, Google Takeout zip analysis, or drags a takeout zip into the project. Also use when the user asks to "analyze my Gemini data", "what did I talk to Gemini about", or wants to extract insights from Gemini chat logs.
argument-hint: "[takeout-zip-path]"
---
# Gemini 历史记录分析器

提取、分类和分析通过 Google Takeout 导出的 Gemini Apps 活动 ZIP 文件。该技能可处理：
- 文件提取（支持中文/Unicode 文件名）
- 内容分类和主题分析
- 根据对话模式提取用户画像
- 特定领域关键词搜索及上下文验证
- PII/敏感内容检测
- 生成结构化报告，并可选择创建记忆文件

## 快速判断：会议转录与提示词-响应

在进行完整分析之前，抽样查看 3-5 个文件，以确定**对话类型**：

| 信号 | 会议转录 | 提示词-响应 |
|--------|-------------------|-----------------|
| 说话者标签 | "张三:"、"李四:"、"Speaker 1:" | "User:"、"Assistant:"、"You:" |
| 内容模式 | 讨论流程、轮流发言、闲聊 | 问答、指令→输出 |
| 长度分布 | 长短不一，包含大量简短发言 | 助手响应较长 |
| 文件命名 | 通常为中文、会议风格的标题 | 英文、基于主题的标题 |

分析方法因类型而异：
- **会议转录** → 主题分类、说话者分析、决策跟踪、用户画像提取
- **提示词-响应** → 使用模式分析、能力评估、兴趣领域映射

## 第 1 步：提取 ZIP 文件

Google Takeout 文件包含中文/Unicode 文件名。**macOS 的 `unzip` 会导致这些文件名乱码——请始终使用 `unar`。**

```bash
# Install unar if missing
brew install unar 2>/dev/null || true

# Extract to a target directory
unar -o <output-dir> -q "<takeout-zip-path>"
```

标准目录结构：
```
Takeout/
└── My Activity/
    └── Gemini Apps/
        ├── *.txt          # Conversation transcripts
        ├── *.html         # Web-format backups (rare)
        ├── *.png/jpg      # Images from conversations
        ├── *.mp3/mp4/wav  # Audio/video attachments
        ├── *.pdf          # Uploaded/shared documents
        ├── *.xlsx/docx    # Office documents
        └── *.zip          # Nested archives (animation frames, etc.)
```

## 第 2 步：清点和分类

在读取任何单个文件之前，先进行完整清点：

```bash
# Count by extension
find <extract-dir> -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# List all txt files (these are the primary content)
find <extract-dir> -name "*.txt" -type f | sort

# Get total size per type
find <extract-dir> -type f -exec du -sh {} \; | sort -rh | head -30
```

创建一个包含以下内容的表格：
- 文件总数、总大小
- 按文件类型细分（txt 数量/大小、媒体文件数量/大小等）
- 如果文件时间戳有意义，则记录日期范围

## 第 3 步：抽样和分类

从整个文件列表中分散选取 3-5 个 txt 文件进行读取（不要只读取最前面的几个——时间戳/文件大小可能会按类型聚集）。对于每个文件：

1. 读取前约 100 行以确定对话类型
2. 识别语言（中文/英文/混合）
3. 对主题领域进行高层级分类
4. 记录说话者数量和发言模式

使用该样本决定其余文件的分析策略。

## 第 4 步：完整内容分析

对于每个 txt 文件，读取并提取：

### 4a. 元数据
- 标题（文件名去除哈希后缀）
- 大致时长（根据转录时间戳）
- 发言者人数及身份
- 语言占比（中文 % / 英文 %）

### 4b. 主题分类
指定主要主题和次要主题。默认类别如下（根据实际内容调整）：
- 软件开发
- AI/LLM 工具与工作流
- 基础设施/云/DevOps
- 商业/战略
- 产品/设计
- 团队/人力资源/人员
- 金融/投资（这通常是分析的目标）
- 法律/合规
- 个人/其他

### 4c. 每个文件的关键发现
对于每个文件，记录：
- 主要讨论要点（3-5 个要点）
- 已做出的决定或行动项
- 值得注意的原话引用（逐字引用，并提供上下文）
- 提到的关系（人物、公司、项目）

## 第 5 步：特定领域关键词搜索

查找特定领域（金融、法律等）的内容时：

1. **使用 AND/OR 逻辑设计关键词列表**——例如金融：`stock OR investment OR fund OR portfolio OR 股票 OR 投资 OR 基金`，同时也要包括 `EPS`、`P/E`、`dividend`、`arbitrage` 等领域专用术语
2. **对每一批关键词在所有 txt 文件中执行 grep 搜索**
3. **阅读匹配项的上下文**（每个匹配项前后各 10 行）——仅依靠关键词匹配会产生大量误报。`Investment` 可能表示商业战略，`option` 可能表示 UI 选项，`fund` 可能表示保险功能
4. **对每个匹配项进行分类**：
   - 明确命中（对话确实涉及该领域）
   - 误报（同一个词，但含义不同）
   - 存疑（需要深入阅读）
5. **重新完整阅读明确命中和存疑匹配项所在的文件**

绝不能止步于 grep 输出——必须核实上下文。

## 第 6 步：生成报告

### 报告结构

```markdown
# Gemini History Analysis Report
**Source**: <zip filename>
**Date analyzed**: <today>
**Extraction size**: <N files, N MB>

## 1. Content Overview
- Total conversations: N
- Conversation type: [Meeting Transcripts | Prompt-Response | Mixed]
- Language distribution: X% Chinese, Y% English, Z% Mixed
- Date range: <earliest> to <latest>
- Media attachments: N images, N audio, N video

## 2. Topic Distribution
| Category | Count | % | Notes |
|----------|-------|---|-------|
| ... | | | |

## 3. Key Findings
(Bulleted, organized by significance)

## 4. Domain-Specific Analysis
(If user requested finance/legal/etc. keyword search)
- Matches found: N
- Confirmed relevant: N
- False positives: N (with examples of what caused them)

## 5. Notable Documents
Non-txt files worth attention: PDFs, spreadsheets, etc.

## 6. Valuable Quotes
Verbatim quotes that capture key insights

## 7. PII / Sensitive Content
(Flag if detected — do NOT include the actual PII in the report)
- File: <name>, Type: <resume/background-check/etc.>, Risk: <high/medium/low>
```

## 第 7 步：生成记忆文件（可选）

如果用户希望将分析结果作为项目记忆持久化（例如 `.claude/projects/<path>/memory/`）：

### 何时生成记忆文件
- 用户明确提出要求（“构建用户画像”“记住这个”）
- 分析揭示了有关用户偏好、工作流或约束的可复用见解
- 项目具有记忆系统（检查是否存在 `memory/MEMORY.md`）

### 可提供的记忆文件类型
1. **用户画像**（`user-profile.md`）— 如果对话揭示了用户的角色、偏好或个性
2. **反馈/工作流**（`feedback-*.md`）— 如果对话揭示了经过验证的工作流、应做事项/禁忌事项
3. **项目上下文**（`project-*.md`）— 如果对话揭示了持续进行的项目、决策或约束

### 记忆写入协议
- 遵循项目现有的记忆格式（检查其他记忆文件的 frontmatter 约定）
- 包含指向分析记录的 `originSessionId` 或来源标签
- 更新 `MEMORY.md` 索引，加入新条目
- 绝不要重复记忆中已有的内容——应改为更新现有文件

## 第 8 步：清理

```bash
# Remove extracted files after analysis complete (user confirms)
rm -rf <extract-dir>
```

## 关键陷阱（源于实际使用）

### 1. ZIP 解压：始终使用 `unar`
macOS `unzip` 会悄无声息地破坏中文文件名——文件路径会变成乱码，许多文件无法解压。`brew install unar` + `unar -o <dir> <zip>` 可以正确处理所有内容。

### 2. 关键词搜索：grep 是第一步，而不是答案
在一次真实分析中，匹配 "stock"、"investment"、"fund"、"option"、"portfolio"、"trading" 等关键词，会在 80% 以上的文件中产生匹配——**但每一个都是误报**。这些词在软件开发上下文中经常出现。对于每个匹配项，都必须阅读其周边上下文。

### 3. 弄清楚你正在阅读的内容
Gemini Takeout txt 文件并不是原始的 Gemini 提示词-回复对。它们可能是：
- 由飞书妙记导出的会议记录，随后被上传到 Gemini
- 手动复制粘贴到 Gemini 中的笔记
- 为进行分析而粘贴的 PDF/文章文本
在判断文件性质之前，先阅读每个文件的前约 100 行。

### 4. 其中很可能存在 PII
简历、背景调查表、联系人列表——这些内容经常出现在对话历史中。标记它们，但**不要**在报告中包含其具体内容。如果要创建记忆文件或 Wiki 页面，请确保只概述 PII，而不是原样复制。

### 5. 大文件需要先行筛选
一份 63KB 的文字记录相当于一场 2 小时的会议。除非它被标记为高度相关，否则不要阅读全文。阅读开头 10% 和结尾 10% 以了解大意；只有在关键词命中或主题相关性确有必要时，才阅读全文。

### 6. 通过并行读取扩展处理规模
对于 100 个以上的文件，启动多个并行子代理，分批读取和总结（每批 10–15 个文件），然后合并结果。让一个代理按顺序读取所有文件会耗尽上下文。