---
name: workthreads
description: SpecStory Workthreads - a weekly work-thread rollup across a team's repos from SpecStory coding histories (any agent - Claude Code, Codex, Cursor, Gemini, and more). It groups the window's sessions into threads of work per project and labels each new / open / recently closed, so a lead sees what shipped, what is still an open loop, and what was just started. Use when someone asks "what happened this week", "what is still open", "what did the team finish", "give me the weekly rollup", or wants a status report over a .specstory/history corpus.
argument-hint: "Enter = guided setup · or plain English, e.g. 'last 7 days, just the open loops'"
allowed-tools: Bash, Read, Write, AskUserQuestion
license: Apache-2.0
metadata:
  author: Greg Ceccarelli
  version: "1.0.0"
---
# Workthreads

团队负责人需要一份覆盖团队所有仓库的每周答案：本周发生了哪些工作、哪些已经完成、哪些仍然悬而未决并需要下一步动作。**Workthreads** 从 SpecStory 历史记录中产出这份**汇总（rollup）** - 也就是你的编码代理本来就会写入的 `.specstory/history` 会话记录。它报告**各条工作线及其生命周期**（new / open / recently closed）。

一个确定性引擎（`scripts/workthreads.mjs threads`）负责检索、聚类和分类；**综合则由你完成** - 你要把它的证据转化成负责人的每周报告。不要尝试自己去读原始会话记录；它们可能有几十万行。运行引擎，然后根据其输出撰写汇总。

该技能是**可跨 harness 移植的**（agentskills.io 格式）。凡是它点名某个具体工具的地方（例如 `AskUserQuestion`），都应理解为“使用你所在 harness 的等价工具；否则退回普通对话”。

## 引擎如何划分工作

- 引擎把时间窗口内的活动记录（beats）**按项目**分组，并将它们聚类成**工作线（threads）**（一条可以横跨多个会话的工作线）。它为每条工作线指派一个相对于今天的生命周期**状态**：
  - **new** - 最近 7 天内首次出现活动。
  - **open** - 未解决、仍在活跃（即未闭环事项）。
  - **closed** - 最近一次结果为成功且该工作线已归于沉寂；当某条 beat 执行过回滚命令（`git revert` / `git reset --hard` / `git checkout -- ...`）时，会打上 **reverted** 标记。
- 输出是确定性的（稳定排序、正文中不含墙上时钟时间戳），因此对同一语料库的两次运行在字节层面完全一致。

## 默认流程：每周汇总

1. **对语料库建立索引**，存入 workthreads 自己的数据库。指向团队的各个仓库并构建/更新该数据库：
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/workthreads.mjs" index --projects <parent-of-repos> --db <db>
   # or a single tree:  --scan <root>     or a single history dir:  --dir <dir>
   ```

2. **跨项目运行 `threads`，覆盖最近 7 天**，并捕获证据：
   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/workthreads.mjs" threads --db <db> --days 7            # human digest
   node "${CLAUDE_SKILL_DIR}/scripts/workthreads.mjs" threads --db <db> --days 7 --json     # machine-readable
   ```
   摘要会按项目依次打印三个区块 - **New**、**Open**、**Recently closed** - 每条工作线都附有证据引用（`path:line`）、最近活动日期、状态以及 `reverted` 标记。`--json` 会输出一个工作线数组（包含 `project`、`status`、`reverted`、涉及的文件、最近活动日期）。

3. 依据这些证据**撰写汇总**，采用负责人期望的结构：
   - (a) 一个总体结果：窗口期内的会话数量和活跃项目；
   - (b) 各项目已完成工作的**亮点**（即 `closed` 工作线）；
   - (c) **未闭环事项** - 即 `open` 工作线，尚未解决或需要验证，每条附一个建议的下一步；
   - (d) 值得注意的**回滚 / 被放弃的工作**（`reverted` 工作线）；
   - (e) 引用证据参考（`path:line`），使每个结论都可核查。
   补充一条注意事项：**本周可能仍在进行中**，因此 `open` 和 `new` 工作线只是快照，并非最终结果。

4. **将汇总保存到带日期的文件**，使其可持久留存、逐周可对比：
   ```
   .specstory/workthreads/<YYYY>-W<week>.md
   ```
   （ISO 周号，例如 `.specstory/workthreads/2026-W25.md`）。也可以提供 `threads --out <file>`，把原始摘要存放在你撰写的总结旁边。

## 引导式启动

如果用户只是在没有任何具体说明的情况下调用该技能，先问三个简短的问题（使用 `AskUserQuestion` 或普通对话），然后根据答案运行默认流程：

- **范围** - 哪些仓库 / 哪个父目录存放着团队的 `.specstory/history` 语料库？
- **窗口** - 往前回溯多少天？（每周汇总默认 **7** 天；用 `--days N` 扩大范围。）
- **目标** - 是要完整的**汇总**、只要**未闭环事项**、只要**最近关闭**的工作，还是一条快速的**状态**行？根据答案来调整你着重呈现哪些部分。

## 约定

仅限 Node ESM，零依赖，Node >= 22.5。任何地方都不使用长破折号（改用 " - "）。引擎的执行路径绝不调用 LLM，也不访问网络；所有判断（成文叙述、建议的下一步、强调的重点）都由你来做。
