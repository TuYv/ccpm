---
name: enhance-docs
description: "Use when improving documentation structure, accuracy, and RAG readiness."
version: 5.1.0
argument-hint: "[path] [--fix] [--ai]"
---
# enhance-docs

分析文档的可读性、结构和 RAG 优化情况。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const targetPath = args.find(a => !a.startsWith('--')) || '.';
const fix = args.includes('--fix');
const aiMode = args.includes('--ai');
```

## 文档位置

| 类型 | 位置 | 用途 |
|------|----------|---------|
| 用户文档 | `docs/*.md`, `README.md` | 供人类阅读的指南 |
| 代理文档 | `agent-docs/*.md` | AI 参考资料 |
| 项目记忆 | `CLAUDE.md`, `AGENTS.md` | AI 上下文/指令 |

## 优化模式

### 仅 AI 模式（`--ai`）
适用于代理文档和针对 RAG 优化的文档：
- 大幅减少 token
- 高密度信息组织
- 各章节内容自包含，便于检索
- 优化分块边界

### 双重模式（`--both`，默认）
适用于面向用户的文档：
- 平衡可读性与 AI 友好性
- 为人类读者和检索器提供清晰的结构

## 工作流程

1. **发现** - 查找所有 .md 文件
2. **解析** - 提取结构和内容
3. **检查** - 根据模式运行模式检查
4. **报告** - 生成 Markdown 输出
5. **修复** - 如果指定 --fix，则应用自动修复

## 检测模式

### 1. 链接验证（高）

- 损坏的锚点链接（`[text](#missing-anchor)`）
- 指向不存在文件的链接
- 格式错误的链接语法

### 2. 结构验证（高）

**标题层级：**
- 不允许跳级（H1 → H3，中间没有 H2）
- 每篇文档仅包含一个 H1
- 代码块应带有语言标签

**位置感知内容**（基于“中间信息遗失”研究）：
- 关键信息放在文档的开头或结尾
- 补充细节放在中间
- 标记埋藏在中间章节的重要内容

**推荐结构：**
```
1. Overview/Purpose (START - high attention)
2. Quick Start / TL;DR
3. Detailed Content
4. Reference / API
5. Summary / Key Points (END - high attention)
```

### 3. Token 效率（高 - AI 模式）

**Token 估算：** `characters / 4` 或 `words * 1.3`

**不必要的行文：**
- “在本文档中……”
- “如你所见……”
- “让我们来探索……”
- “需要特别注意的是……”

**冗长短语：**
| 冗长 | 简洁 |
|---------|---------|
| “为了” | “以” |
| “由于这一事实” | “因为” |
| “具备……的能力” | “可以” |
| “在当前这个时间点” | “现在” |
| “出于……的目的” | “为” |
| “在……发生的情况下” | “如果” |

**目标：** 项目记忆文件约为 1500 个 token，参考文档可灵活调整。

### 4. RAG 优化（中 - AI 模式）

**分块大小指南：**
| 大小 | 问题 |
|------|-------|
| >1000 个 token | 过长，应拆分为多个子主题 |
| <50 个 token | 过短，应与相关内容合并 |
| 200-500 个 token | 最适合检索 |

**语义边界：**
- 每个章节只包含一个主题
- 章节内容自包含（避免在章节开头使用“它”“这”）
- 使用能够描述内容的清晰章节标题

**上下文锚点：**
```markdown
# Bad - ambiguous start
## Configuration
It requires several settings...

# Good - self-contained
## Configuration
The plugin configuration requires several settings...
```

### 5. 信息密度（中等 - AI 模式）

**优先使用表格而非散文：**
```markdown
# Bad - verbose
The function accepts a path parameter which is required,
a limit parameter which defaults to 10, and an optional
format parameter.

# Good - dense
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| path | Yes | - | File path |
| limit | No | 10 | Max results |
| format | No | json | Output format |
```

对于有先后顺序的项目，**优先使用列表而非段落**。

示例、命令和配置应**使用代码块**。

### 6. 交叉引用质量（中等）

- 内部链接应使用相对路径
- 外部链接应保持稳定（避免使用提交哈希）
- 参考章节应指向权威来源

### 7. 平衡性建议（中等 - 双模式）

- 长篇内容中缺少章节标题（超过 500 词而没有标题）
- 重要信息埋藏在文档靠后的位置
- 长篇文档缺少 TL;DR 或摘要

## 自动修复

| 问题 | 修复 |
|-------|-----|
| 标题层级不一致 | H1 → H3 修正为 H1 → H2 |
| 冗长短语 | 替换为简洁的表达 |
| 缺少代码语言 | 根据内容检测结果添加 |

## 输出格式

```markdown
## Documentation Analysis: {name}

**File**: {path}
**Mode**: {AI-only | Both}
**Tokens**: ~{count}

| Certainty | Count |
|-----------|-------|
| HIGH | {n} |
| MEDIUM | {n} |

### Link Issues
| Line | Issue | Fix | Certainty |

### Structure Issues
| Line | Issue | Fix | Certainty |

### Efficiency Issues [AI mode]
| Line | Issue | Fix | Certainty |

### RAG Issues [AI mode]
| Line | Issue | Fix | Certainty |
```

## 模式统计

| 类别 | 模式数 | 模式 | 确定性 |
|----------|----------|------|-----------|
| 链接 | 3 | 共享 | 高 |
| 结构 | 4 | 共享 | 高 |
| Token 效率 | 3 | ai | 高 |
| RAG 优化 | 3 | ai | 中等 |
| 信息密度 | 2 | ai | 中等 |
| 交叉引用 | 2 | 共享 | 中等 |
| 平衡性 | 3 | both | 中等 |
| **总计** | **20** | - | - |

<examples>
### 冗长短语
<bad_example>
```markdown
In order to configure the plugin, you need to...
```
</bad_example>
<good_example>
```markdown
To configure the plugin...
```
</good_example>

### RAG 分块
<bad_example>
```markdown
## Installation
[2000+ tokens of mixed content covering install, config, and usage]
```
</bad_example>
<good_example>
```markdown
## Installation
[400 tokens - installation only]

## Configuration
[300 tokens - config only]

## Usage
[400 tokens - usage only]
```
</good_example>

### 位置感知内容
<bad_example>
```markdown
## Introduction
[Long background...]

## History
[More context...]

## Critical Setup Steps
[Important info buried in middle]
```
</bad_example>
<good_example>
```markdown
## Quick Start (Critical)
[Important setup steps at START]

## Background
[Supporting context in middle]

## Reference
[Details...]

## Key Reminders
[Critical points repeated at END]
```
</good_example>

### 表格与散文对比
<bad_example>
```markdown
The API accepts three parameters. The first is `query` which is required.
The second is `limit` which defaults to 10. The third is `format`.
```
</bad_example>
<good_example>
```markdown
| Param | Required | Default |
|-------|----------|---------|
| query | Yes | - |
| limit | No | 10 |
| format | No | json |
```
</good_example>
</examples>

## 参考资料

- `agent-docs/CONTEXT-OPTIMIZATION-REFERENCE.md` - Token 预算、位置感知、分块
- `agent-docs/PROMPT-ENGINEERING-REFERENCE.md` - 结构、信息密度

## 约束条件

- 仅自动修复确定性为 HIGH 的问题
- 保留原始语气和风格
- 平衡 AI 优化与人类可读性（默认模式）
- 不要删除内容，仅进行重构或精简