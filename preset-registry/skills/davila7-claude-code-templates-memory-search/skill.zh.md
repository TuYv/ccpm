---
name: memory-search
description: Search conversation history and semantic memory to recall previous discussions, decisions, and context. Use when the user asks to "search memory", "what did we discuss", "remember when", "find previous conversation", "check history", or before starting work to recall prior decisions.
---
# AI Maestro 记忆搜索

使用语义、关键词和符号匹配来搜索你的对话历史记录。回顾跨会话的过往决策、讨论和上下文。属于 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 前置条件

需要在本地运行 [AI Maestro](https://github.com/23blocks-OS/ai-maestro)。记忆索引使用 CozoDB 进行向量搜索。

```bash
# Install memory tools
git clone https://github.com/23blocks-OS/ai-maestro-plugins.git
cd ai-maestro-plugins && ./install-memory-tools.sh
```

## 核心行为

在开始任何任务之前，搜索记忆以获取相关上下文：

```
Receive instruction -> Search memory -> Then proceed
```

## 命令

| 命令 | 描述 |
|---------|-------------|
| `memory-search.sh "<query>"` | 混合搜索（推荐） |
| `memory-search.sh "<query>" --mode semantic` | 查找概念相关的内容 |
| `memory-search.sh "<query>" --mode term` | 精确文本匹配 |
| `memory-search.sh "<query>" --mode symbol` | 代码符号匹配 |
| `memory-search.sh "<query>" --role user` | 仅搜索用户消息 |
| `memory-search.sh "<query>" --role assistant` | 仅搜索助手消息 |

## 搜索模式

| 模式 | 最适合 |
|------|----------|
| `hybrid`（默认） | 常规搜索，适用于大多数情况 |
| `semantic` | 相关概念、不同措辞 |
| `term` | 精确的函数/类名 |
| `symbol` | 跨上下文的代码标识符 |

## 使用示例

```bash
# User asks to continue previous work
memory-search.sh "authentication"

# Find a specific component discussion
memory-search.sh "PaymentService" --mode term

# Find related design discussions
memory-search.sh "error handling patterns" --mode semantic

# Find code symbol references
memory-search.sh "processPayment" --mode symbol
```

## 与其他技能结合使用

为了获得完整上下文，请与 docs-search 和 graph-query 搭配使用：
```bash
memory-search.sh "feature"       # What did we discuss?
docs-search.sh "feature"         # What do docs say?
graph-describe.sh ComponentName  # What is the structure?
```

## 完整的 AI Maestro 体验

此技能是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台的一部分。该平台提供用于 AI 智能体编排的 **6 项技能**：消息传递、记忆、文档、图谱、规划和智能体管理。