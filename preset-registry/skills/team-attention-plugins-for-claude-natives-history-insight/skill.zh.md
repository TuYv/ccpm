---
name: history-insight
description: This skill should be used when user wants to access, capture, or reference Claude Code session history. Trigger when user says "capture session", "save session history", or references past/current conversation as a source - whether for saving, extracting, summarizing, or reviewing. This includes any mention of "what we discussed", "today's work", "session history", or when user treats the conversation itself as source material (e.g., "from our conversation").
version: 1.1.0
user-invocable: true
---
# History Insight

分析 Claude Code 会话历史并提取洞察。

---

## 数据位置

```
~/.claude/projects/<encoded-cwd>/*.jsonl
```

**路径编码：** `/Users/foo/project` → `-Users-foo-project`

> 详细文件格式：`${baseDir}/references/session-file-format.md`

---

## 执行算法

### 步骤 1：询问范围 [必须]

**确定范围：**

1. **已明确指定时**（可跳过 AskUserQuestion）：
   - “仅当前项目” / “此项目” → `current_project`
   - “所有会话” / “全部” → `all_sessions`

2. **未明确指定时** — 调用 AskUserQuestion：
   ```
   question: "세션 검색 범위를 선택하세요"
   options:
     - "현재 프로젝트만" → ~/.claude/projects/<encoded-cwd>/*.jsonl
     - "모든 Claude Code 세션" → ~/.claude/projects/**/*.jsonl
   ```

---

### 步骤 2：查找会话文件

```bash
# Current project only
find ~/.claude/projects/<encoded-cwd> -name "*.jsonl" -type f

# All sessions (모든 프로젝트)
find ~/.claude/projects -name "*.jsonl" -type f
```

**日期过滤**：检查文件的 mtime（修改时间）后进行过滤。不同操作系统的 `stat` 选项各不相同：
- macOS: `stat -f "%Sm" -t "%Y-%m-%d" <file>`
- Linux: `stat -c "%y" <file>`

---

### 步骤 3：处理会话

#### 决策树

```
Session files found?
├─ No → Error: "No sessions found"
└─ Yes → How many files?
    ├─ 1-3 files → Direct Read + parse
    └─ 4+ files → Batch Extract Pipeline
```

#### 1-3 个文件

直接用 Read 解析 JSONL。如果文件较大（≥5000 tokens），则使用 `extract-session.sh`：
```bash
${baseDir}/scripts/extract-session.sh <session.jsonl>
```

#### 4 个及以上文件：批量提取流水线

1. 创建缓存目录（`/tmp/cc-cache/<analysis-name>/`）
2. 保存会话列表（`sessions.txt`）
3. 用 jq 批量提取消息（`user_messages.txt`）
4. 用 Task(opus) 进行综合分析

#### 文件过大时：并行批量分析

当 `clean_messages.txt` 过大导致 Read 失败时：

1. **分割文件**：
   ```bash
   split -l 2000 clean_messages.txt /tmp/cc-cache/<name>/batch_
   ```

2. **并行调用 Task(opus)**：
   ```
   Task(subagent_type="general-purpose", model="opus", run_in_background=true)
   prompt: "batch_XX 파일을 읽고 주제/패턴 요약해줘"
   ```

3. **合并结果**：用 Task(opus) 进行综合

---

### 步骤 4：报告结果

```markdown
## Session Capture Complete

- **Sessions:** N files processed
- **Messages:** X total, Y after filter

### Extracted Insights
[분석 결과]
```

---

## 错误处理

| 场景 | 响应 |
|----------|----------|
| 未找到会话文件 | “未找到该项目的会话文件。” |
| 文件过大 | 使用 extract-session.sh 自动预处理 |
| 未安装 jq | “错误：需要 jq。安装方式：brew install jq” |
| Task 失败 | “警告：无法处理 [file]。已跳过。” |
| 0 个相关会话 | “没有符合条件的会话。” |

---

## 安全注意事项

- 禁止在输出中暴露完整路径（使用 `~` 前缀）

---

## 相关资源

- **`${baseDir}/scripts/extract-session.sh`** - JSONL 压缩（去除 thinking、tool_use）
- **`${baseDir}/references/session-file-format.md`** - JSONL 结构与解析
