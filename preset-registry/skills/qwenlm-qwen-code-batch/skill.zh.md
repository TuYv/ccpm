---
name: batch
description: Execute batch operations on multiple files in parallel. Automatically discovers files, splits into chunks, and processes with parallel worker agents. Use `/batch` followed by operation and file pattern.
argument-hint: '<operation> <file-pattern>'
allowedTools:
  - task
  - glob
  - grep_search
  - read_file
  - edit
  - write_file
  - run_shell_command
  - ask_user_question
---
# /batch - 并行批量操作

你正在协调跨多个文件的批量操作。你的任务是：

1. 解析用户请求，了解目标文件和操作
2. 使用 glob 发现匹配的文件
3. 将文件拆分为多个分块，以便并行处理
4. 启动多个 worker agent，并发处理文件
5. 汇总结果并提供摘要

## 步骤 1：解析意图并发现文件

首先，解析用户请求以确定：

- **目标模式**：文件的 glob 模式（例如 `src/**/*.ts`、`**/*.js`）
- **操作**：要对每个文件执行的操作（例如“添加 JSDoc 注释”“转换为 TypeScript”）

如果用户未指定模式，请根据上下文推断，或请求用户澄清。

使用 `glob` 工具发现匹配的文件。

**如果没有文件匹配该模式**：

- 告知用户未找到符合给定模式的文件
- 建议检查模式或扩大搜索范围
- 不要使用空批次继续执行

自动应用以下常见排除项：

- `node_modules/**`
- `dist/**`
- `build/**`
- `.git/**`
- `**/*.test.ts`、`**/*.test.js`
- `**/*.spec.ts`、`**/*.spec.js`
- `**/__tests__/**`
- `**/test/**`、`**/tests/**`
- `**/package-lock.json`
- `**/yarn.lock`
- `**/*.min.js`
- 二进制文件（图像、字体等）
- 大于 500KB 的文件（如有需要，检查文件大小）

**重要**：如果匹配到的文件超过 50 个，告知用户准确的数量和文件列表，然后继续执行。用户可以使用 Ctrl+C 取消操作。如果数量超过 100 个，向用户发出警告，并建议使用更具体的模式，而不是继续执行。

## 步骤 2：将文件拆分为并行处理分块

根据以下规则拆分已发现的文件：

| 文件总数 | 分块数量 | 每个分块的文件数 |
| -------- | -------- | ---------------- |
| 1-5      | 1        | 所有文件         |
| 6-15     | 2        | 每个 3-8 个       |
| 16-30    | 3        | 约 10 个         |
| 31-50    | 4        | 约 10-12 个      |
| 51-75    | 5        | 约 10-15 个      |
| 76-100   | 5        | 约 15-20 个      |

**分块算法**：

- 最小分块大小：3 个文件（避免对小批次过度并行）
- 最大分块大小：15 个文件（确保每个 agent 承担合理的工作量）
- 最大并行 agent 数：5（考虑 API 速率限制）

示例：24 个文件 → 3 个分块，每个分块约 8 个文件

## 步骤 3：启动并行 worker agent

通过多次调用 `task` 工具（即 Agent 工具）来启动 worker agent，并行执行这些调用，且必须在**同一条消息**中完成。

**注意**：允许使用的工具中的 `task` 工具就是用于生成 worker agent 的 Agent 工具。

每个 worker agent 都应接收：

- 要处理的文件列表（完整路径）
- 要执行的操作
- 清晰的指示，要求按文件报告成功或失败

使用 `general-purpose` 子 agent 类型作为 worker。

**关键**：所有 Agent 工具调用**必须**放在同一个响应中，以启用并行执行。系统会自动并发运行多个 Agent 调用。

### Agent Prompt Template

对于每个分块，使用以下提示格式：

```text
You are a worker agent processing a batch of files.

**Operation**: [describe the operation, e.g., "Add JSDoc comments to all exported functions"]

**Files to process**:
- [file1.ts]
- [file2.ts]
- ...

**Instructions**:
1. Process each file independently
2. For each file, report one of:
   - SUCCESS: [file path] - [brief description of change]
   - FAILED: [file path] - [reason for failure]
   - SKIPPED: [file path] - [reason for skipping]
3. If a file fails or is skipped, continue with the next file - do not abort
4. At the end, provide a summary of what was done

**Constraints**:
- Do not modify test files unless explicitly requested
- Preserve existing code style and formatting
- Make minimal necessary changes to accomplish the operation
```

### 示例调用模式

在每次 worker 调用中将 `run_in_background: false`，以便所有结果以内联形式返回，供第 4 步汇总。

```
<Agent tool call 1>
description: "Process batch chunk 1/3"
prompt: "You are a worker agent... [full prompt as above]"
subagent_type: "general-purpose"
run_in_background: false
</Agent tool call 1>

<Agent tool call 2>
description: "Process batch chunk 2/3"
prompt: "You are a worker agent... [full prompt as above]"
subagent_type: "general-purpose"
run_in_background: false
</Agent tool call 2>

<Agent tool call 3>
description: "Process batch chunk 3/3"
prompt: "You are a worker agent... [full prompt as above]"
subagent_type: "general-purpose"
run_in_background: false
</Agent tool call 3>
```

## 第 4 步：汇总结果

所有 worker agent 完成后，将其结果汇总为清晰的摘要。

### 输出格式

```markdown
### Batch Operation Complete

**Operation**: [description of what was done]
**Files discovered**: [total count]
**Chunks processed**: [number of parallel agents]
**Total time**: [duration if tracked]

| Status  | Count |
| ------- | ----- |
| Success | [N]   |
| Failed  | [N]   |
| Skipped | [N]   |

**Successful files**:

- [file1.ts] - [brief description]
- [file2.ts] - [brief description]
  ...

**Failed files** (if any):

- [file.ts]: [reason for failure]

**Skipped files** (if any):

- [file.ts]: [reason for skipping]
```

### 部分失败的处理

如果部分文件失败，但其他文件成功：

- 清楚报告哪些文件成功
- 列出失败及具体原因
- 如适用，建议后续操作

如果所有文件都失败：

- 报告共同的失败模式
- 建议可能的修复方案

## 第 5 步：错误处理

### 批处理期间

1. **单个文件失败**：不要中止批处理。worker agent 记录错误并继续处理。
2. **Agent 失败**：如果某个 worker agent 完全失败（超时、崩溃），将该分块记录为失败，并注明原因。
3. **用户取消**：如果用户发送 Ctrl+C，系统将正常取消所有待处理的 agent。

### 错误报告

对于每个失败的文件，包含：

- 文件路径
- 具体错误消息或原因
- 如果修复方案明显，则提供建议的修复方案

## 使用示例

### 示例 1：添加许可证头

```
/batch Add Apache 2.0 license header to all .ts files in src/
```

**流程**：

1. glob `src/**/*.ts` → 找到 45 个文件
2. 拆分为 4 个批次
3. 启动 4 个并行代理
4. 每个代理为分配到的文件添加许可证头
5. 汇总：已处理 45 个文件，45 个成功，0 个失败

### 示例 2：将 JavaScript 转换为 TypeScript

```
/batch Convert all .js files in utils/ to TypeScript
```

**流程**：

1. glob `utils/**/*.js` → 找到 12 个文件
2. 拆分为 2 个批次
3. 启动 2 个并行代理
4. 每个代理转换文件并将其重命名为 .ts
5. 汇总：已处理 12 个文件，10 个成功，2 个失败（复杂的动态模式）

### 示例 3：修复 Lint 错误

```
/batch Fix all @typescript-eslint/no-explicit-any errors in src/
```

**流程**：

1. 使用 `grep_search` 查找 `src/` 中包含 `: any` 模式的文件
2. 筛选出相关文件
3. 拆分为多个批次并启动并行代理
4. 每个代理修复特定的 lint 问题（将 `any` 替换为适当的类型）
5. 汇总：已修复 8 个文件

## 约束和限制

| 约束              | 值    | 原因                         |
| ----------------- | ----- | ---------------------------- |
| 每个批次的最大文件数 | 100   | 防止资源耗尽                 |
| 最大并行代理数     | 5     | 考虑 API 速率限制            |
| 每个代理的最少文件数 | 3     | 避免过度并行化               |
| 每个代理的最大文件数 | 15    | 确保有意义的工作量           |
| 文件大小限制       | 500KB | 避免上下文溢出               |

## Dry-Run 模式

如果用户希望预览将要进行的更改而不实际修改文件（例如“preview”、“show me what would change”、“dry run”）：

1. 发现并列出所有匹配的文件及数量
2. 显示每个文件的计划操作
3. 展示批次拆分策略
4. 询问用户是否要继续执行实际更改
5. 如果用户确认，则执行批量操作

**示例**：

```
/batch preview adding JSDoc comments to src/**/*.ts
```

**预期输出**：

```
### Dry-Run Preview

**Operation**: Add JSDoc comments to all .ts files in src/

**Files discovered**: 24 files

**Chunking plan**:
| Chunk | Files |
|-------|-------|
| 1     | src/utils/a.ts, b.ts, c.ts, ... (8 files) |
| 2     | src/components/x.ts, y.ts, ... (8 files) |
| 3     | src/services/m.ts, n.ts, ... (8 files) |

**Planned operation per file**:
- Add JSDoc comments to all exported functions
- Preserve existing code style

Proceed? (y/n)
```