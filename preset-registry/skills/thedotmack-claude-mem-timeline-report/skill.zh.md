---
name: timeline-report
description: Generate a "Journey Into [Project]" narrative report analyzing a project's entire development history from claude-mem's timeline. Use when asked for a timeline report, project history analysis, development journey, or full project report.
---
# 时间线报告

使用 claude-mem 的持久记忆时间线，生成对项目完整开发历史的全面叙事分析。

## 何时使用

当用户提出以下要求时使用：

- “编写时间线报告”
- “深入探索 [project]”
- “分析我的项目历史”
- “完整项目报告”
- “总结整个开发历史”
- “这个项目的故事是什么？”

## 前置条件

claude-mem worker 必须正在运行。项目必须已有记录的 claude-mem observations。

**解析 worker 端口**（在开始时执行一次，并在下方每次 curl 调用中复用 `$WORKER_PORT`）：

```bash
WORKER_PORT="${CLAUDE_MEM_WORKER_PORT:-$(node -e "const fs=require('fs'),p=require('path'),os=require('os');const uid=(typeof process.getuid==='function'?process.getuid():77);const fallback=String(37700+(uid%100));try{const s=JSON.parse(fs.readFileSync(p.join(os.homedir(),'.claude-mem','settings.json'),'utf-8'));process.stdout.write(String(s.CLAUDE_MEM_WORKER_PORT||fallback));}catch{process.stdout.write(fallback);}" 2>/dev/null)}"
```

此逻辑会优先使用 `CLAUDE_MEM_WORKER_PORT` 环境变量，其次是 `~/.claude-mem/settings.json`，最后回退到按 UID 计算的默认值 `37700 + (uid % 100)`——与 worker 自身选择端口的方式一致。多账号环境（#2101）以及任何已覆盖默认端口的用户（#2103）都需要此步骤。

## 工作流程

### 第 1 步：确定项目名称

如果上下文中不明显，询问用户要分析哪个项目。项目名称通常是项目目录的名称（例如 "tokyo"、"my-app"）。如果用户说“这个项目”，使用当前工作目录的 basename。

**Worktree 检测：** 在使用目录 basename 之前，检查当前目录是否是 git worktree。在 worktree 中，数据源是**父项目**，而不是 worktree 目录本身。运行：

```bash
git_dir=$(git rev-parse --git-dir 2>/dev/null)
git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null)
if [ "$git_dir" != "$git_common_dir" ]; then
  # We're in a worktree — resolve the parent project name
  parent_project=$(basename "$(dirname "$git_common_dir")")
  echo "Worktree detected. Parent project: $parent_project"
else
  parent_project=$(basename "$PWD")
fi
echo "$parent_project"
```

如果检测到 worktree，则在所有 API 调用中使用 `$parent_project`（父仓库的 basename）作为项目名称。告知用户：“检测到 git worktree。将使用父项目 ‘[name]’ 作为数据源。”

### 第 2 步：获取完整时间线

使用 Bash 从 claude-mem worker API 获取完整时间线：

```bash
curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=PROJECT_NAME&full=true"
```

这会返回整个压缩后的时间线——包含项目完整历史中的每一条 observation、会话边界和摘要。该响应是已格式化的 Markdown，专门为 LLM 消费优化。

**Token 估算：** 完整时间线的大小取决于项目历史：
- 小型项目（少于 1,000 条 observations）：约 20-50K tokens
- 中型项目（1,000-10,000 条 observations）：约 50-300K tokens
- 大型项目（10,000-35,000 条 observations）：约 300-750K tokens

如果响应为空或返回错误，worker 可能没有运行，或项目名称可能不正确。可尝试 `curl -s "http://localhost:${WORKER_PORT}/api/search?query=*&limit=1"` 来验证 worker 是否健康。

### 第 3 步：估算 Token 数量

在继续之前，估算所获取时间线的 token 数量（大约每 4 个字符 1 个 token）。向用户报告：

```
Timeline fetched: ~X observations, estimated ~Yk tokens.
This analysis will consume approximately Yk input tokens + ~5-10k output tokens.
Proceed? (y/n)
```

如果时间线超过 100K tokens，等待用户确认后再继续。

### 第 4 步：使用子代理分析

部署一个 Agent（使用 Task 工具），并向其提供完整时间线以及以下分析提示词。将完整时间线作为上下文传递给该代理。还应指示代理查询位于 `~/.claude-mem/claude-mem.db` 的 SQLite 数据库，以完成 Token Economics 部分。

**Agent 提示词：**

```
You are a technical historian analyzing a software project's complete development timeline from claude-mem's persistent memory system. The timeline below contains every observation, session boundary, and summary recorded across the project's entire history.

You also have access to the claude-mem SQLite database at ~/.claude-mem/claude-mem.db. Use it to run queries for the Token Economics & Memory ROI section. The database has an "observations" table with columns: id, memory_session_id, project, text, type, title, subtitle, facts, narrative, concepts, files_read, files_modified, prompt_number, discovery_tokens, created_at, created_at_epoch, source_tool, source_input_summary.

Write a comprehensive narrative report titled "Journey Into [PROJECT_NAME]" that covers:

## Required Sections

1. **Project Genesis** -- When and how the project started. What were the first commits, the initial vision, the founding technical decisions? What problem was being solved?

2. **Architectural Evolution** -- How did the architecture change over time? What were the major pivots? Why did they happen? Trace the evolution from initial design through each significant restructuring.

3. **Key Breakthroughs** -- Identify the "aha" moments: when a difficult problem was finally solved, when a new approach unlocked progress, when a prototype first worked. These are the observations where the tone shifts from investigation to resolution.

4. **Work Patterns** -- Analyze the rhythm of development. Identify debugging cycles (clusters of bug fixes), feature sprints (rapid observation sequences), refactoring phases (architectural changes without new features), and exploration phases (many discoveries without changes).

5. **Technical Debt** -- Track where shortcuts were taken and when they were paid back. Identify patterns of accumulation (rapid feature work) and resolution (dedicated refactoring sessions).

6. **Challenges and Debugging Sagas** -- The hardest problems encountered. Multi-session debugging efforts, architectural dead-ends that required backtracking, platform-specific issues that took days to resolve.

7. **Memory and Continuity** -- How did persistent memory (claude-mem itself, if applicable) affect the development process? Were there moments where recalled context from prior sessions saved significant time or prevented repeated mistakes?

8. **Token Economics & Memory ROI** -- Quantitative analysis of how memory recall saved work:
   - Query the database directly for these metrics using `sqlite3 ~/.claude-mem/claude-mem.db`
   - Count total discovery_tokens across all observations (the original cost of all work)
   - Count sessions that had context injection available (sessions after the first)
   - Calculate the compression ratio: average discovery_tokens vs average read_tokens per observation
   - Identify the highest-value observations (highest discovery_tokens -- these are the most expensive decisions, bugs, and discoveries that memory prevents re-doing)
   - Identify explicit recall events (observations where source_tool contains "search", "smart_search", "get_observations", "timeline", or where narrative mentions "recalled", "from memory", "previous session")
   - Estimate passive recall savings: each session with context injection receives ~50 observations. Use a 30% relevance factor (conservative estimate that 30% of injected context prevents re-work). Savings = sessions_with_context × avg_discovery_value_of_50_obs_window × 0.30
   - Estimate explicit recall savings: ~10K tokens per explicit recall query
   - Calculate net ROI: total_savings / total_read_tokens_invested
   - Present as a table with monthly breakdown
   - Highlight the top 5 most expensive observations by discovery_tokens -- these represent the highest-value memories in the system (architecture decisions, hard bugs, implementation plans that cost 100K+ tokens to produce originally)

   Use these SQL queries as a starting point:
   ```sql
   -- Total discovery tokens
   SELECT SUM(discovery_tokens) FROM observations WHERE project = 'PROJECT_NAME';

-- Sessions with context available (not the first session)
   SELECT COUNT(DISTINCT memory_session_id) FROM observations WHERE project = 'PROJECT_NAME';

   -- Average tokens per observation
   SELECT AVG(discovery_tokens) as avg_discovery, AVG(LENGTH(title || COALESCE(subtitle,'') || COALESCE(narrative,'') || COALESCE(facts,'')) / 4) as avg_read FROM observations WHERE project = 'PROJECT_NAME' AND discovery_tokens > 0;

   -- Top 5 most expensive observations (highest-value memories)
   SELECT id, title, discovery_tokens FROM observations WHERE project = 'PROJECT_NAME' ORDER BY discovery_tokens DESC LIMIT 5;

   -- Monthly breakdown
   SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as obs, SUM(discovery_tokens) as total_discovery, COUNT(DISTINCT memory_session_id) as sessions FROM observations WHERE project = 'PROJECT_NAME' GROUP BY month ORDER BY month;

   -- Explicit recall events
   SELECT COUNT(*) FROM observations WHERE project = 'PROJECT_NAME' AND (source_tool LIKE '%search%' OR source_tool LIKE '%timeline%' OR source_tool LIKE '%get_observations%' OR narrative LIKE '%recalled%' OR narrative LIKE '%from memory%' OR narrative LIKE '%previous session%');
   ```

9. **时间线统计** -- 定量摘要：
   - 日期范围（从第一条观察到最后一条）
   - 总观察数和会话数
   - 按观察类型细分（功能、缺陷修复、发现、决策、变更）
   - 最活跃的天/周
   - 最长的调试会话

10. **经验与元观察** -- 从完整历史中浮现出哪些模式？新开发者阅读时间线后会对这个代码库有哪些了解？有哪些反复出现的主题或原则指导了开发？

## 写作风格

- 以技术叙事的形式撰写，而不是项目符号列表
- 引用事件时使用具体的观察 ID 和时间戳（例如：“在 12 月 14 日（#26766），根本原因终于被识别……”）
- 跨时间连接事件——展示早期决策如何产生后续影响
- 如实记录挣扎和死胡同，而不仅是成功
- 根据项目规模，目标字数为 3,000-6,000 个词
- 适当使用 Markdown 格式，包括标题、强调和代码引用

## 重要

- 按时间顺序分析整个时间线——不要跳过早期历史
- 寻找叙事弧线：问题 -> 调查 -> 解决方案
- 识别项目方向发生根本变化的转折点
- 注意对开发过程本身的观察（工具、工作流、协作模式）

以下是完整的项目时间线：

[TIMELINE CONTENT GOES HERE]
```

### 第 5 步：保存报告

将代理的输出保存为 Markdown 文件。默认位置：

```
./journey-into-PROJECT_NAME.md
```

或者，如果用户指定了不同的输出路径，则使用该路径。

### 第 6 步：报告完成

告诉用户：
- 报告保存到了哪里
- 大致 token 成本（输入时间线 + 输出报告）
- 覆盖的日期范围
- 分析的观察数量

## 错误处理

- **空时间线：** “未找到项目 ‘X’ 的观察。请使用以下命令检查项目名称：`curl -s \"http://localhost:${WORKER_PORT}/api/search?query=*&limit=1\"`”
- **Worker 未运行：** “claude-mem worker 未在端口 ${WORKER_PORT} 上响应。请使用你通常的方法启动它，或检查 `ps aux | grep worker-service`。”
- **时间线过大：** 对于有 50,000+ 条观察的项目，时间线可能超出上下文限制。建议使用日期范围过滤：`curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=X&full=true"` —— 当前端点会返回所有观察；对于极其庞大的项目，用户可能需要按时间窗口分段分析。

## 示例

用户：“为 tokyo 项目撰写一份旅程报告”

1. 获取：`curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=tokyo&full=true"`
2. 估算：“已获取时间线：约 34,722 条观察，预计约 718K token。是否继续？”
3. 用户确认
4. 使用完整时间线部署分析代理
5. 保存到 `./journey-into-tokyo.md`
6. 报告：“报告已保存。分析了 34,722 条观察，时间范围为 2025 年 10 月至 2026 年 3 月（约 718K 输入 token，约 8K 输出 token）。”
