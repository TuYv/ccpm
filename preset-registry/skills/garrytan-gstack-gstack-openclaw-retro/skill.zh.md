---
name: gstack-openclaw-retro
description: "Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware with per-person contributions, praise, and growth areas. Use when asked for weekly retro, what shipped this week, or engineering retrospective."
---
# 每周工程复盘

生成一份全面的工程复盘，分析提交历史、工作模式和代码质量指标。具有团队意识：识别运行命令的用户，并分析每位贡献者的个人优点与成长机会。

## 参数

- 默认值：最近 7 天
- `24h`：最近 24 小时
- `14d`：最近 14 天
- `30d`：最近 30 天
- `compare`：对比当前时间窗口与前一个等长窗口

## 说明

解析参数以确定时间窗口。默认使用 7 天。所有时间都应按用户的**本地时区**报告。

**午夜对齐窗口：** 对于按天单位，按本地午夜计算绝对起始日期。例如，如果今天是 2026-03-18 且窗口为 7 天，则起始日期为 2026-03-11。`git log` 查询请使用 `--since="2026-03-11T00:00:00"`。对于小时单位，使用 `--since="N hours ago"`。

---

### 步骤 1：收集原始数据

首先，先拉取 origin 并识别当前用户：

```bash
git fetch origin main --quiet
git config user.name
git config user.email
```

`git config user.name` 返回的名称即为**“你”**……即正在阅读本次复盘的人。所有其他作者都算队友。

运行以下全部 `git` 命令（它们彼此独立）：

```bash
# All commits with timestamps, subject, hash, author, files changed
git log origin/main --since="<window>" --format="%H|%aN|%ae|%ai|%s" --shortstat

# Per-commit test vs total LOC breakdown with author
git log origin/main --since="<window>" --format="COMMIT:%H|%aN" --numstat

# Commit timestamps for session detection and hourly distribution
git log origin/main --since="<window>" --format="%at|%aN|%ai|%s" | sort -n

# Files most frequently changed (hotspot analysis)
git log origin/main --since="<window>" --format="" --name-only | grep -v '^$' | sort | uniq -c | sort -rn

# PR numbers from commit messages
git log origin/main --since="<window>" --format="%s" | grep -oE '[#!][0-9]+' | sort -t'#' -k1 | uniq

# Per-author file hotspots
git log origin/main --since="<window>" --format="AUTHOR:%aN" --name-only

# Per-author commit counts
git shortlog origin/main --since="<window>" -sn --no-merges

# Test file count
find . -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name '*_spec.*' 2>/dev/null | grep -v node_modules | wc -l

# Test files changed in window
git log origin/main --since="<window>" --format="" --name-only | grep -E '\.(test|spec)\.' | sort -u | wc -l
```

---

### 步骤 2：计算指标

计算并在摘要中展示以下指标：

- **Commits to main:** N
- **Contributors:** N
- **PRs merged:** N
- **Total insertions:** N
- **Total deletions:** N
- **Net LOC added:** N
- **Test LOC (insertions):** N
- **Test LOC ratio:** N%
- **Version range:** vX.Y.Z → vX.Y.Z
- **Active days:** N
- **Detected sessions:** N
- **Avg LOC/session-hour:** N

然后立即在下方显示**按作者排行榜**：

```
Contributor         Commits   +/-          Top area
You (garry)              32   +2400/-300   browse/
alice                    12   +800/-150    app/services/
bob                       3   +120/-40     tests/
```

按提交数降序排序。当前用户始终排在第一位，标签为“You (name)”。

---

### 步骤 3：提交时间分布

按本地时间显示每小时柱状图：

```
Hour  Commits  ████████████████
 00:    4      ████
 07:    5      █████
 ...
```

识别：
- 峰值时段
- 空档时段
- 双峰模式（早晨/傍晚）还是连续模式
- 深夜编码聚类（晚于晚上10点）

---

### 步骤 4：工作会话检测

使用相邻提交之间**45 分钟间隔**阈值检测会话。

会话分类：
- **深度会话**（50 分钟以上）
- **中等会话**（20-50 分钟）
- **微会话**（小于20分钟，单次提交）

计算：
- 总活跃编码时间
- 平均会话时长
- 每小时活跃时间的 LOC

---

### 步骤 5：提交类型分解

按约定式提交前缀（feat/fix/refactor/test/chore/docs）分类，并以百分比条显示：

```
feat:     20  (40%)  ████████████████████
fix:      27  (54%)  ███████████████████████████
refactor:  2  ( 4%)  ██
```

若 fix 比例超过 50%，标记为“`ship fast, fix fast`”模式，可能说明存在评审缺口。

---

### 步骤 6：热点分析

显示变更最多的前 10 个文件。标记：
- 变更 5 次及以上的文件（高 churn 热点）
- 热点列表中的测试文件与生产文件
- VERSION/CHANGELOG 的频次

---

### 步骤 7：PR 大小分布

估算 PR 大小并分桶：
- **Small**（小于 100 LOC）
- **Medium**（100-500 LOC）
- **Large**（500-1500 LOC）
- **XL**（1500+ LOC）

---

### 步骤 8：专注度评分 + 本周亮点

**专注度评分：** 单个变更最频繁的顶层目录所占提交比例。分数越高，代表聚焦度越深；分数越低则说明上下文切换更分散。

**本周亮点：** 窗口内单个 LOC 变更量最高的 PR。突出显示 PR 号、LOC 变更量以及为何重要。

---

### 步骤 9：团队成员分析

对每位贡献者（包括当前用户）计算：

1. **提交与 LOC**……总提交数、插入行数、删除行数、净 LOC
2. **关注领域**……他们触及最多的目录/文件（前 3 个）
3. **提交类型构成**……他们个人的 feat/fix/refactor/test 比例
4. **会话模式**……编码时段（峰值时间）、会话数量
5. **测试纪律**……个人测试 LOC 占比
6. **最大交付**……他们单次影响最大的提交或 PR

**对当前用户（“你”）：** 深度分析。包含所有会话分析、时间模式、专注度评分。采用第一人称表述。

**对每位队友：** 用 2-3 句话概括其交付内容及工作模式。然后写：

- **赞扬**（1-2 条具体内容）：基于真实提交进行支撑。不要写“做得很好”这类泛泛赞美……要精确说明具体做得好的点。
- **成长机会**（1 条具体内容）：以“提升/进阶”口吻而非批评。基于真实数据支撑。

**若为单人仓库：** 跳过团队拆解。

**AI 协作：** 若提交包含 `Co-Authored-By` 的 AI 尾注，则将“AI-assisted commits”作为单独指标追踪。

---

### 步骤 10：同比变化（窗口 >= 14d）

按周拆分并展示趋势：
- 每周提交数（总计与按作者）
- 每周 LOC
- 每周测试比例
- 每周 fix 比例
- 每周会话数量

---

### 步骤 11：连胜统计

统计从今天起倒推的连续有提交天数：

```bash
# Team streak
git log origin/main --format="%ad" --date=format:"%Y-%m-%d" | sort -u

# Personal streak
git log origin/main --author="<user_name>" --format="%ad" --date=format:"%Y-%m-%d" | sort -u
```

同时展示：
- “Team shipping streak: 47 consecutive days”
- “Your shipping streak: 32 consecutive days”

---

### 步骤 12：加载历史并对比

检查 `memory/` 中是否有先前的复盘历史：

如果存在历史复盘，加载最近一份并计算差值：

```                      
                    Last        Now         Delta
Test ratio:         22%    →    41%         ↑19pp
Sessions:           10     →    14          ↑4
LOC/hour:           200    →    350         ↑75%
Fix ratio:          54%    →    30%         ↓24pp (improving)
```

如果不存在历史复盘，则注明“First retro recorded, run again next week to see trends.”

---

### 步骤 13：保存复盘历史

将 JSON 快照保存到 `memory/retro-YYYY-MM-DD.json`，包含指标、作者、版本范围、连胜次数以及可发布到社交的摘要。

---

### 步骤 14：撰写叙述

**Format for Telegram**（列表、加粗，最终输出中不使用 Markdown 表格）。

结构：

**Tweetable summary**（首行）：
> Week of Mar 1: 47 commits (3 contributors), 3.2k LOC, 38% tests, 12 PRs, peak: 10pm | Streak: 47d

Then sections:

- **Summary** ... key metrics
- **Trends vs Last Retro** ... deltas (skip if first retro)
- **Time & Session Patterns** ... when the team codes, session lengths, deep vs micro
- **Shipping Velocity** ... commit types, PR sizes, fix-chain detection
- **Code Quality Signals** ... test ratio, hotspots, churn
- **Focus & Highlights** ... focus score, ship of the week
- **Your Week** ... personal deep-dive for the current user
- **Team Breakdown** ... per-teammate analysis with praise + growth (skip if solo)
- **Top 3 Team Wins** ... highest-impact things shipped
- **3 Things to Improve** ... specific, actionable, anchored in commits
- **3 Habits for Next Week** ... small, practical, realistic (<5 min to adopt)

---
## 比较模式

当用户说“compare”：
- 对当前窗口运行 `retro`
- 对前一个同样时长的窗口运行 `retro`
- 展示并列指标，并用箭头显示改进/回退
- 对最大变更给出简要说明

---

## 重要规则

- **所有时间均为本地时区。** 切勿设置 `TZ`。
- **面向 Telegram 的格式。** 使用列表和加粗。避免在最终输出中使用 Markdown 表格。
- **表扬要有提交依据。** 不要说“great work”而不点名具体做得好的地方。
- **成长建议要有数据依据。** 不要在没有证据的情况下批评。
- **保存历史。** 每次 retro 都会保存到 `memory/` 以进行趋势追踪。
- **完成状态：**
  - DONE ... retro 已生成，历史已保存
  - DONE_WITH_CONCERNS ... 已生成但缺少数据（例如，没有用于比较的 prior retros）
  - BLOCKED ... 不在 git 仓库中或窗口内无提交
