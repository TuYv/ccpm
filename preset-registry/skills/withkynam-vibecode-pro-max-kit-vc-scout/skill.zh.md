---
name: vc-scout
description: "Fast codebase scouting using shell search and optional parallel research agents. Use for file discovery, task context gathering, and quick scoped searches across directories."
argument-hint: "[search-target] [ext]"
trigger_keywords: find files, where is, search codebase
layer: helper
metadata:
  author: claudekit
  version: "1.0.0"
---
# Scout

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 先给答案、语言平实、不使用未加解释的行话，长回复提供 TL;DR。

使用并行 agent 快速、节省 token 地侦察代码库，找到任务所需的文件。

## 参数
- 默认：使用本地 shell 搜索进行侦察，可选地并行委派 `research-agent`（`./references/internal-scouting.md`）
- `ext`：并行使用外部 Gemini/OpenCode CLI 工具进行侦察（`./references/external-scouting.md`）

## 适用场景

- 开始涉及跨多个目录的功能开发
- 用户提到需要“find”、“locate”或“search for”文件
- 开始需要理解文件间关系的调试会话
- 用户询问项目结构或功能所在位置
- 在进行可能影响代码库多个部分的改动之前

## 快速开始

1. 分析用户提示，确定搜索目标
2. 使用多种多样的 Grep 和 Glob 模式查找相关文件并估算代码库规模
3. 先使用本地 shell 搜索，当搜索空间较大时，可选择生成并行的 `research-agent` 工作进程，各自负责划分好的目录
4. 将结果汇总为简明报告

## 配置

从 `.claude/.vc.json` 读取（如存在则回退到旧版 `.claude/.ck.json`）：
- `gemini.model` - Gemini 模型（默认：`gemini-3-flash-preview`）

## 工作流程

### 1. 分析任务
- 解析用户提示以确定搜索目标
- 识别关键目录、模式、文件类型、代码行数
- 确定要生成的子 agent 的最优 SCALE 值

### 2. 分而治之
- 按 agent 将代码库切分为逻辑分段
- 为每个 agent 分配特定的目录或模式
- 确保无重叠、最大化覆盖

### 3. 注册 Scout 任务
- 并行任务注册与外部编排模式是可选的，在本仓库中进行常规侦察时并不需要
- 仅在有意协调更大规模并行侦察工作流时，才参阅 `references/task-management-scouting.md`

### 4. 生成并行 agent
根据决策树加载相应的参考文档：
- **内部（默认）：** `references/internal-scouting.md`（shell 搜索加可选的 `research-agent` 并行）
- **外部：** `references/external-scouting.md`（Gemini/OpenCode）

**注意：**
- 在为某个任务生成其 agent 之前，先通过 `TaskUpdate` 将该任务置为 `in_progress`（若 Task 工具不可用则跳过）
- 为每个子 agent 给出详细的指令提示，明确其应读取的确切目录或文件
- 切记每个子 agent 的上下文窗口不足 200K token
- 要生成的子 agent 数量取决于当前可用的系统资源以及待扫描的文件数量
- 每个子 agent 必须向主 agent 返回详细的摘要报告

### 5. 收集结果

- 超时：每个 agent 3 分钟（跳过未响应者）
- 对已完成的任务执行 `TaskUpdate`；在报告中记录超时的 agent（若 Task 工具不可用则跳过）
- 将各 agent 的发现汇总为单一报告
- 在末尾列出未解决的问题

## 报告格式

```markdown
# Scout Report

## Relevant Files
- `path/to/file.ts` - Brief description
- ...

## Unresolved Questions
- Any gaps in findings
```

## 参考资料

- `references/internal-scouting.md` - 使用 shell 搜索与可选的并行 `research-agent` 工作
- `references/external-scouting.md` - 使用 Gemini/OpenCode CLI
- `references/task-management-scouting.md` - 用于更大规模侦察协调的可选任务注册模式
