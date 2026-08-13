---
name: timeline-report
description: Generate a "Journey Into [Project]" narrative report analyzing a project's entire development history from claude-mem's timeline. Use when asked for a timeline report, project history analysis, development journey, or full project report.
---
# 时间线报告

使用 claude-mem 的持久化记忆时间线生成项目整个开发历史的综合叙事分析。

## 何时使用

在用户提出以下需求时使用：

- “编写时间线报告”
- “Journey into [项目]”
- “分析我的项目历史”
- “完整项目报告”
- “总结整个开发历史”
- “这个项目的故事是什么？”

## 前置条件

claude-mem worker 必须正在运行。项目必须有记录的 claude-mem 观察数据。

**解析 worker 端口**（在开始时执行一次，并在下面所有 `curl` 调用中复用 `$WORKER_PORT`）：

```bash
WORKER_PORT="${CLAUDE_MEM_WORKER_PORT:-$(node -e "const fs=require('fs'),p=require('path'),os=require('os');const uid=(typeof process.getuid==='function'?process.getuid():77);const fallback=String(37700+(uid%100));try{const s=JSON.parse(fs.readFileSync(p.join(os.homedir(),'.claude-mem','settings.json'),'utf-8'));process.stdout.write(String(s.CLAUDE_MEM_WORKER_PORT||fallback));}catch{process.stdout.write(fallback);}" 2>/dev/null)}"
```

这会优先使用 `CLAUDE_MEM_WORKER_PORT` 环境变量，然后读取 `~/.claude-mem/settings.json`，最后回退到每用户默认值 `37700 + (uid % 100)`——与 worker 本身选择端口的方式一致。多账号环境（#2101）以及任何覆盖默认端口的用户（#2103）都需要此设置。

## 工作流

### 第 1 步：确定项目名称

如果上下文不够明确，请向用户询问要分析的项目。项目名称通常是项目的目录名（例如 `"tokyo"`、`"my-app"`）。如果用户说“这个项目”，则使用当前工作目录的基名。

**工作树检测：** 在使用目录基名之前，先检查当前目录是否为 git worktree。在 worktree 中，数据源是**父项目**，而不是 worktree 目录本身。执行：

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

如果检测到 worktree，请在所有 API 调用中使用 `$parent_project`（父仓库的基名）作为项目名。向用户说明：`Detected git worktree. Using parent project '[name]' as the data source.`

### 第 2 步：抓取完整时间线

使用 Bash 从 claude-mem worker API 获取完整时间线：

```bash
curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=PROJECT_NAME&full=true"
```

这会返回完整的压缩时间线——项目完整历史中的每一条观察、会话边界和摘要。返回内容是为 LLM 消费优化的预格式化 Markdown。

**Token 预估：** 时间线大小取决于项目历史规模：
- 小型项目（少于 1,000 条观察）：约 20-50K token
- 中型项目（1,000-10,000 条观察）：约 50-300K token
- 大型项目（10,000-35,000 条观察）：约 300-750K token

如果响应为空或返回错误，worker 可能未运行，或项目名错误。尝试执行 `curl -s "http://localhost:${WORKER_PORT}/api/search?query=*&limit=1"` 来确认 worker 是否健康。

### 第 3 步：估算 Token 数

在继续之前，先估算已抓取时间线的 token 数（约每 4 个字符算 1 个 token），并将结果报告给用户：

```
Timeline fetched: ~X observations, estimated ~Yk tokens.
This analysis will consume approximately Yk input tokens + ~5-10k output tokens.
Proceed? (y/n)
```

如果时间线超过 100K token，请在继续前等待用户确认。

### 第 4 步：使用子代理分析

使用 Task 工具部署一个 Agent，并提供完整时间线与以下分析提示。将整条时间线全部作为上下文传入 agent。该 agent 还应被指示查询 `~/.claude-mem/claude-mem.db` 中的 SQLite 数据库，用于“Token Economics”部分。

**Agent 提示词：**

```md
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

`$loadout-manager` 已确认需要先配置。请先告诉我当前任务要启用哪些具体 skill 或 plugin 组（可选：`agent-reach`、`baoyu-skills`、`delegate`、`lark`、`ljg-skills`、`local-tools`、`matt-pocock-skills`、`openspec`、`product-workflow`、`skill-creator`、`skills-ecosystem`，或回答“全部默认”）。确认后我再直接给你逐字对应的中文译文。
