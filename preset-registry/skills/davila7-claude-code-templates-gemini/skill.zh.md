---
name: gemini
description: Use when the user asks to run Gemini CLI for code review, plan review, or big context (>200k) processing. Ideal for comprehensive analysis requiring large context windows. Uses Gemini 3 Pro by default for state-of-the-art reasoning and coding.
---
# Gemini Skill 指南

## 何时使用 Gemini
- 当被要求启用时
- **代码审查**：对多个文件进行全面的代码审查
- **计划审查**：分析架构计划、技术规范或项目路线图
- **大上下文处理**：需要超过 200k token 上下文的任务（整个代码库、文档集）
- **多文件分析**：理解多个文件之间的关系和模式

## ⚠️ 关键：后台/非交互模式警告

**切勿在后台或非交互式 shell 中使用 `--approval-mode default`**（例如 Claude Code 工具调用）。它会无限期挂起，等待无法提供的批准提示。

**对于自动化/后台审查：**
- ✅ 使用 `--approval-mode yolo` 进行完全自动化执行
- ✅ 或者使用超时命令包装：`timeout 300 gemini ...`
- ❌ 在没有交互式终端的情况下，切勿使用 `--approval-mode default`

**Gemini 挂起的症状：**
- 进程运行超过 20 分钟，但 CPU 使用率为 0%
- 没有网络活动
- 进程状态显示为 'S'（休眠）

**修复挂起的进程：**
```bash
# Check if hung
ps aux | grep gemini | grep -v grep

# Kill if necessary
pkill -9 -f "gemini.*gemini-3-pro-preview"
```

## 运行任务

1. 通过 `AskUserQuestion` 在**单个提示**中询问用户要使用哪个模型。可用模型：
   - `gemini-3-pro-preview` ⭐（旗舰模型，最适合编码和复杂推理，软件工程能力比 2.5 Pro 高 35%）
   - `gemini-3-flash`（亚秒级延迟，由 3 Pro 蒸馏而来，最适合对速度要求严格的任务）
   - `gemini-2.5-pro`（旧版选项，综合性能强劲）
   - `gemini-2.5-flash`（旧版选项，经济高效且具备思考能力）
   - `gemini-2.5-flash-lite`（旧版选项，处理速度最快）

2. 根据任务选择批准模式：
   - `default`：提示进行批准（⚠️ 仅适用于交互式终端会话）
   - `auto_edit`：仅自动批准编辑工具（适用于提供建议的代码审查）
   - `yolo`：自动批准所有工具（✅ 后台/自动化任务必须使用）

3. 使用适当的选项组装命令：
   - `-m, --model <MODEL>` - 选择模型
   - `--approval-mode <default|auto_edit|yolo>` - 控制工具批准
   - `-y, --yolo` - `--approval-mode yolo` 的替代方式
   - `-i, --prompt-interactive "prompt"` - 执行提示并继续进行交互
   - `--include-directories <DIR>` - 要包含在工作区中的其他目录
   - `-s, --sandbox` - 在沙箱模式下运行以实现隔离

4. **对于后台/自动化任务，始终使用 `--approval-mode yolo`**，或添加超时包装。切勿在非交互式 shell 中使用 `default`。

5. 运行命令并捕获输出。对于后台/自动化模式：
   ```bash
   # Recommended: Use yolo for background tasks
   gemini -m gemini-3-pro-preview --approval-mode yolo "Review this codebase for security issues"

   # Or with timeout (5 min limit)
   timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo "Review this codebase"
   ```

6. 对于带有初始提示词的交互式会话：
   ```bash
   gemini -m gemini-3-pro-preview -i "Review the authentication system" --approval-mode auto_edit
   ```

7. **Gemini 完成后**，告知用户：“Gemini 分析已完成。你可以启动新的 Gemini 会话进行后续分析，也可以继续探究分析结果。”

### 快速参考

| 使用场景 | 审批模式 | 关键标志 |
| --- | --- | --- |
| 后台代码审查 | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| 后台分析 | `yolo` ✅ | `-m gemini-3-pro-preview --approval-mode yolo` |
| 带超时限制的后台任务 | `yolo` ✅ | `timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo` |
| 交互式代码审查 | `default` | `-m gemini-3-pro-preview --approval-mode default`（仅限交互式终端） |
| 支持自动编辑的代码审查 | `auto_edit` | `-m gemini-3-pro-preview --approval-mode auto_edit` |
| 自动化重构 | `yolo` | `-m gemini-3-pro-preview --approval-mode yolo` |
| 速度优先的后台任务 | `yolo` ✅ | `-m gemini-3-flash --approval-mode yolo` |
| 成本优化的后台任务 | `yolo` ✅ | `-m gemini-2.5-flash --approval-mode yolo` |
| 多目录分析 | `yolo`（如果在后台运行） | `--include-directories <DIR1> --include-directories <DIR2>` |
| 带提示词的交互式会话 | `auto_edit` 或 `default` | `-i "prompt" --approval-mode <mode>` |

### 模型选择指南

| 模型 | 最适合 | 上下文窗口 | 主要特性 |
| --- | --- | --- | --- |
| `gemini-3-pro-preview` ⭐ | **旗舰模型**：复杂推理、编码、智能体任务 | 100 万输入 / 6.4 万输出 | 氛围编码、SWE-bench 得分 76.2%、每百万输入 2–4 美元 |
| `gemini-3-flash` | 亚秒级延迟、速度优先的应用 | 100 万输入 / 6.4 万输出 | 由 3 Pro 蒸馏而来，针对 TPU 优化 |
| `gemini-2.5-pro` | 旧版：强大的全能性能 | 100 万输入 / 6.5 万输出 | 思考模式、成熟稳定 |
| `gemini-2.5-flash` | 旧版：经济高效、高负载任务 | 100 万输入 / 6.5 万输出 | 最优价格（每百万 0.15 美元）、思考模式 |
| `gemini-2.5-flash-lite` | 旧版：最快处理速度、高吞吐量 | 100 万输入 / 6.5 万输出 | 速度最快、延迟最低 |

**Gemini 3 的优势**：软件工程准确率提高 35%，在 SWE-bench（76.2%）、GPQA Diamond（91.9%）和 WebDev Arena（1487 Elo）上达到业界领先水平。知识截止日期：2025 年 1 月。

**即将推出**：用于超复杂推理、具备增强思考能力的 `gemini-3-deep-think`。

## 常见使用场景

### 代码审查（后台/自动化）
```bash
# For background execution (Claude Code, CI/CD, etc.)
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Perform a comprehensive code review focusing on:
   1. Security vulnerabilities
   2. Performance issues
   3. Code quality and maintainability
   4. Best practices violations"

# With timeout safety (5 minutes)
timeout 300 gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Perform a comprehensive code review..."
```

### 计划审查（后台/自动化）
```bash
# For background execution
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Review this architectural plan for:
   1. Scalability concerns
   2. Missing components
   3. Integration challenges
   4. Alternative approaches"
```

### 大上下文分析（后台/自动化）
```bash
# For background execution
gemini -m gemini-3-pro-preview --approval-mode yolo \
  "Analyze the entire codebase to understand:
   1. Overall architecture
   2. Key patterns and conventions
   3. Potential technical debt
   4. Refactoring opportunities"
```

### 交互式代码审查（仅限终端）
```bash
# ONLY use default mode in interactive terminal
gemini -m gemini-3-pro-preview --approval-mode default \
  "Review the authentication flow for security issues"
```

## 后续跟进

- Gemini CLI 会话通常是一次性的或交互式的。与 Codex 不同，它没有内置的恢复功能。
- 如需进行后续分析，请启动新的 Gemini 会话，并提供之前分析结果中的上下文。
- 提议后续操作时，请重申所选择的模型和审批模式。
- 每条 Gemini 命令执行后，使用 `AskUserQuestion` 确认后续步骤或收集澄清信息。

## 错误处理

- 每当 `gemini --version` 或 Gemini 命令以非零状态退出时，停止操作并报告失败。
- 在重试失败的命令之前，请求用户指示。
- 使用高影响标志（`--approval-mode yolo`、`-y`、`--sandbox`）之前，除非已经获得许可，否则请使用 `AskUserQuestion` 请求用户授权。
- 当输出中包含警告或部分结果时，对其进行总结，并使用 `AskUserQuestion` 询问应如何调整。

## Gemini 进程挂起问题排查

### 检测
```bash
# Check for hung processes
ps aux | grep -E "gemini.*gemini-3" | grep -v grep

# Look for these symptoms:
# - Process running 20+ minutes
# - CPU usage at 0%
# - Process state 'S' (sleeping)
# - No network connections
```

### 诊断
```bash
# Get detailed process info
ps -o pid,etime,pcpu,stat,command -p <PID>

# Check network activity
lsof -p <PID> 2>/dev/null | grep -E "(TCP|ESTABLISHED)" | wc -l
# If result is 0, process is hung
```

### 解决
```bash
# Kill hung Gemini processes
pkill -9 -f "gemini.*gemini-3-pro-preview"

# Or kill specific PID
kill -9 <PID>

# Verify cleanup
ps aux | grep gemini | grep -v grep
```

### 预防
- **对于后台/自动化任务，始终使用 `--approval-mode yolo`**
- 添加超时封装以确保安全：`timeout 300 gemini ...`
- 切勿在非交互式 shell 中使用 `--approval-mode default`
- 使用 `ps` 监控首次运行，以确保进程顺利完成

## 大上下文处理技巧

1. **具体明确**：针对要分析的内容提供清晰、结构化的提示词
2. **使用 include-directories**：明确指定所有相关目录
3. **选择合适的模型**：
   - 对于复杂推理、编码任务和最高分析质量，使用 `gemini-3-pro-preview`（推荐的默认选项）
   - 对于需要亚秒级响应的速度敏感型任务，使用 `gemini-3-flash`
   - 对于注重成本优化的高吞吐量处理，使用 `gemini-2.5-flash`
4. **发挥 Gemini 3 的优势**：软件工程任务能力提升 35%，尤其擅长智能体工作流和氛围编程
5. **拆解复杂任务**：即使具备大上下文能力，结构化分析仍然更加有效
6. **保存分析结果**：要求 Gemini 输出可保存以供参考的结构化报告

## CLI 版本

需要 Gemini CLI v0.16.0 或更高版本才能支持 Gemini 3 模型。检查版本：`gemini --version`