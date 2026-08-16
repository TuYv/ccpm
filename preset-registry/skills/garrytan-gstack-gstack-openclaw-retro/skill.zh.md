---
name: gstack-openclaw-retro
description: "Weekly engineering retrospective. Analyzes commit history, work patterns, and code quality metrics with persistent history and trend tracking. Team-aware with per-person contributions, praise, and growth areas. Use when asked for weekly retro, what shipped this week, or engineering retrospective."
---
# 每周工程回顾

生成一份全面的工程回顾，分析提交历史、工作模式和代码质量指标。具备团队感知能力：识别运行命令的用户，然后分析每位贡献者，并针对每个人给出表扬和成长机会。

## 参数

- 默认：过去 7 天
- `24h`：过去 24 小时
- `14d`：过去 14 天
- `30d`：过去 30 天
- `compare`：将当前时间窗口与之前相同长度的时间窗口进行比较

## 说明

解析参数以确定时间窗口。默认为 7 天。所有时间均应以用户的**本地时区**报告。

**与午夜对齐的时间窗口：** 对于以天为单位的时间窗口，计算从本地时间午夜开始的绝对日期。例如，如果今天是 2026-03-18，时间窗口为 7 天，则开始日期为 2026-03-11。在 git 日志查询中使用 `--since="2026-03-11T00:00:00"`。对于以小时为单位的时间窗口，使用 `--since="N hours ago"`。

---

### 第 1 步：收集原始数据

首先，获取 origin 并识别当前用户：

```bash
git fetch origin main --quiet
git config user.name
git config user.email
```

`git config user.name` 返回的姓名就是**“你”**……也就是阅读这份回顾的人。所有其他作者都是队友。

运行以下所有 git 命令（它们彼此独立）：

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
git ls-files 2>/dev/null | grep -E '(\.test\.|\.spec\.|_test\.|_spec\.)' | wc -l

# Test files changed in window
git log origin/main --since="<window>" --format="" --name-only | grep -E '\.(test|spec)\.' | sort -u | wc -l
```

---

### 第 2 步：计算指标

计算以下指标并在摘要中呈现：

- **提交到 main 的次数：** N
- **贡献者：** N
- **已合并的 PR：** N
- **总插入行数：** N
- **总删除行数：** N
- **净新增代码行数：** N
- **测试代码行数（插入）：** N
- **测试代码行数占比：** N%
- **版本范围：** vX.Y.Z → vX.Y.Z
- **活跃天数：** N
- **检测到的会话数：** N
- **平均每会话小时代码行数：** N

然后立即在下方显示**按作者划分的排行榜**：

```
Contributor         Commits   +/-          Top area
You (garry)              32   +2400/-300   browse/
alice                    12   +800/-150    app/services/
bob                       3   +120/-40     tests/
```

按提交数降序排列。当前用户始终显示在第一位，并标记为“你（姓名）”。

---

### 步骤 3：提交时间分布

以本地时间显示每小时直方图：

```
Hour  Commits  ████████████████
 00:    4      ████
 07:    5      █████
 ...
```

识别：
- 高峰时段
- 空白时段
- 双峰模式（早晨/晚间）还是连续模式
- 深夜编码集中时段（晚上 10 点以后）

---

### 步骤 4：工作会话检测

使用连续提交之间 **45 分钟的间隔**作为阈值来检测会话。

会话分类：
- **深度会话**（50 分钟以上）
- **中等会话**（20-50 分钟）
- **微型会话**（少于 20 分钟，单次提交）

计算：
- 总活跃编码时间
- 平均会话时长
- 每小时活跃时间的 LOC

---

### 步骤 5：提交类型明细

按约定式提交前缀（feat/fix/refactor/test/chore/docs）分类。以百分比条形图显示：

```
feat:     20  (40%)  ████████████████████
fix:      27  (54%)  ███████████████████████████
refactor:  2  ( 4%)  ██
```

如果 fix 比例超过 50%，则进行标记……这表示一种“快速发布、快速修复”的模式，可能意味着代码审查存在缺口。

---

### 步骤 6：热点分析

显示变更次数最多的前 10 个文件。标记：
- 变更 5 次以上的文件（变更热点）
- 热点列表中的测试文件与生产文件
- VERSION/CHANGELOG 的变更频率

---

### 步骤 7：PR 规模分布

估算 PR 规模并进行分档：
- **小型**（少于 100 LOC）
- **中型**（100-500 LOC）
- **大型**（500-1500 LOC）
- **超大型**（1500 LOC 以上）

---

### 步骤 8：专注度评分 + 本周最佳交付

**专注度评分：** 涉及变更次数最多的单个顶层目录的提交占比。越高表示工作越深入、越专注；越低表示上下文切换越分散。

**本周最佳交付：** 时间窗口内 LOC 最高的单个 PR。突出显示 PR 编号、LOC 变更量及其重要性。

---

### 步骤 9：团队成员分析

针对每位贡献者（包括当前用户），计算：

1. **提交数和 LOC**……提交总数、插入行数、删除行数、LOC 净变化
2. **关注领域**……他们变更最多的目录/文件（前 3 个）
3. **提交类型构成**……他们个人的 feat/fix/refactor/test 分布
4. **会话模式**……他们何时编码（高峰时段）、会话数量
5. **测试纪律**……他们个人的测试 LOC 比例
6. **最大交付**……他们影响力最高的单次提交或 PR

**对于当前用户（“你”）：** 进行最深入的分析。包括完整的会话分析、时间模式和专注度评分。使用第一人称表述。

**对于每位队友：** 用 2-3 句话概述他们交付的内容及其工作模式。然后：

- **表扬**（1-2 个具体方面）：以实际提交为依据。不要只说“做得很好”……要准确说明好在哪里。
- **成长机会**（1 个具体方面）：将其表述为能力提升，而非批评。以实际数据为依据。

**如果是单人仓库：** 跳过团队明细。

**AI 协作：** 如果提交包含 `Co-Authored-By` AI 尾注，则将“AI 辅助提交”作为单独指标进行跟踪。

---

### 步骤 10：逐周趋势（如果时间窗口不少于 14 天）

按周拆分并显示趋势：
- 每周提交数（总数及每位作者的提交数）
- 每周 LOC
- 每周测试比例
- 每周 fix 比例
- 每周会话数

---

### 步骤 11：连续提交天数追踪

从今天开始向前统计至少有 1 次提交的连续天数：

```bash
# Team streak
git log origin/main --format="%ad" --date=format:"%Y-%m-%d" | sort -u

# Personal streak
git log origin/main --author="<user_name>" --format="%ad" --date=format:"%Y-%m-%d" | sort -u
```

同时显示：
- “团队连续交付：47 天”
- “你的连续交付：32 天”

---

### 步骤 12：加载历史记录并比较

检查 `memory/` 中是否存在以往的复盘历史记录：

如果存在以往的复盘，则加载最近一次并计算变化量：

```
                    Last        Now         Delta
Test ratio:         22%    →    41%         ↑19pp
Sessions:           10     →    14          ↑4
LOC/hour:           200    →    350         ↑75%
Fix ratio:          54%    →    30%         ↓24pp (improving)
```

如果不存在以往的复盘，则注明“首次记录复盘，下周再次运行即可查看趋势。”

---

### 步骤 13：保存复盘历史记录

将包含指标、作者、版本范围、连续提交天数和适合发推的摘要的 JSON 快照保存到 `memory/retro-YYYY-MM-DD.json`。

---

### 步骤 14：撰写叙述

**Telegram 格式**（使用项目符号、粗体，最终输出中不要使用 Markdown 表格）。

结构：

**适合发推的摘要**（第一行）：
> 3 月 1 日当周：47 次提交（3 位贡献者）、3.2k 行代码、38% 测试、12 个 PR，高峰时段：晚上 10 点 | 连续交付：47 天

然后包含以下部分：

- **摘要**……关键指标
- **与上次复盘相比的趋势**……变化量（如果是首次复盘则跳过）
- **时间与会话模式**……团队何时编码、会话时长、深度会话与微型会话
- **交付速度**……提交类型、PR 大小、修复链检测
- **代码质量信号**……测试占比、热点、代码变动率
- **专注度与亮点**……专注度评分、本周最佳交付
- **你的一周**……对当前用户的个人深度分析
- **团队明细**……对每位团队成员进行分析，包括表扬和成长建议（如果是单人则跳过）
- **团队三大成果**……交付的影响力最高的内容
- **3 个改进事项**……具体、可执行，并以提交为依据
- **下周的 3 个习惯**……微小、实用、切合实际（采用所需时间少于 5 分钟）

---

## 比较模式

当用户说“比较”时：
- 对当前时间窗口运行复盘
- 对此前相同长度的时间窗口运行复盘
- 并排展示指标，并使用箭头表示改进或退步
- 简要说明最大的变化

---

## 重要规则

- **所有时间均使用本地时区。** 切勿设置 `TZ`。
- **采用 Telegram 格式。** 使用项目符号和粗体。最终输出中避免使用 Markdown 表格。
- **表扬必须以提交为依据。** 绝不能只说“做得很好”而不点明具体好在哪里。
- **成长建议必须以数据为依据。** 绝不能在没有证据的情况下批评。
- **保存历史记录。** 每次复盘都要保存到 `memory/`，用于追踪趋势。
- **完成状态：**
  - DONE……已生成复盘并保存历史记录
  - DONE_WITH_CONCERNS……已生成，但缺少数据（例如，没有用于比较的以往复盘）
  - BLOCKED……当前目录不是 Git 仓库，或时间窗口内没有提交