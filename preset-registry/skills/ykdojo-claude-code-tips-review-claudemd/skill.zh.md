---
name: review-claudemd
description: Review recent conversations to find improvements for CLAUDE.md files.
---
# 从会话历史中复盘 CLAUDE.md

分析最近的会话，以同时改进全局（~/.claude/CLAUDE.md）和本地（项目）CLAUDE.md 文件。

## 步骤 1：查找会话历史

项目的会话历史位于 `~/.claude/projects/` 中。文件夹名称是项目路径中的斜杠被替换为连字符后的形式。

```bash
# Find the project folder (replace / with -)
PROJECT_PATH=$(pwd | sed 's|/|-|g' | sed 's|^-||')
CONVO_DIR=~/.claude/projects/-${PROJECT_PATH}
ls -lt "$CONVO_DIR"/*.jsonl | head -20
```

## 步骤 2：提取最近的会话

将最近的 15-20 个会话（排除当前会话）提取到临时目录：

```bash
SCRATCH=/tmp/claudemd-review-$(date +%s)
mkdir -p "$SCRATCH"

for f in $(ls -t "$CONVO_DIR"/*.jsonl | head -20); do
  basename=$(basename "$f" .jsonl)
  # Skip current conversation if known
  cat "$f" | jq -r '
    if .type == "user" then
      "USER: " + (.message.content // "")
    elif .type == "assistant" then
      "ASSISTANT: " + ((.message.content // []) | map(select(.type == "text") | .text) | join("\n"))
    else
      empty
    end
  ' 2>/dev/null | grep -v "^ASSISTANT: $" > "$SCRATCH/${basename}.txt"
done

ls -lhS "$SCRATCH"
```

## 步骤 3：启动子代理

启动并行的子代理来分析会话。每个代理应阅读：
- 全局 CLAUDE.md：`~/.claude/CLAUDE.md`
- 本地 CLAUDE.md：`./CLAUDE.md`（如果存在）
- 一批会话文件

为每个代理提供以下提示词模板：

```
Read:
1. Global CLAUDE.md: ~/.claude/CLAUDE.md
2. Local CLAUDE.md: [project]/CLAUDE.md
3. Conversations: [list of files]

Analyze the conversations against BOTH CLAUDE.md files. Find:
1. Instructions that exist but were violated (need reinforcement or rewording)
2. Patterns that should be added to LOCAL CLAUDE.md (project-specific)
3. Patterns that should be added to GLOBAL CLAUDE.md (applies everywhere)
4. Anything in either file that seems outdated or unnecessary

Be specific. Output bullet points only.
```

按大小对会话分批：
- 大（>100KB）：每个代理 1-2 个
- 中（10-100KB）：每个代理 3-5 个
- 小（<10KB）：每个代理 5-10 个

## 步骤 4：汇总发现

将所有代理的结果合并为一份包含以下部分的总结：

1. **被违反的指令** - 已存在但未被遵守的规则（需要更有力的措辞）
2. **建议新增 - 本地** - 项目特有的模式
3. **建议新增 - 全局** - 普遍适用的模式
4. **可能已过时** - 可能不再相关的条目

以表格或项目符号列表的形式呈现。询问用户是否希望起草修改内容。
