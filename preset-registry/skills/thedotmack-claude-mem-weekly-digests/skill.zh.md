---
name: weekly-digests
description: Generate a serial week-by-week narrative digest of a project's full claude-mem timeline. Splits the timeline into per-ISO-week files, then runs one consecutive subagent per week — each receiving the prior week's carry-forward block — to produce one chapter per ISO week of data. Use when asked for "weekly digests", "week-by-week story", "serial timeline", or "narrative chapters" of a project's history.
---
# 每周摘要

生成一个项目完整 `claude-mem` 历史的连载式多章节叙事摘要。与 `timeline-report`（一篇长报告）不同——它按 ISO 周生成每周一份摘要，并且每个子代理都会读取上周的 `carry-forward` 块，以保持故事连贯。

**章节数量等于时间线覆盖的 ISO 周数。** 有 2 周数据的项目会生成 2 章；有 30 周数据的项目会生成 30 章。没有固定长度——先统计周数，再按该数量驱动流水线。

## 何时使用

当用户要求以下内容时触发：

- "Weekly digests"
- "Week-by-week story"
- "Serial timeline"
- "Story chapters of [project]"
- "Run a digest for each week"
- "Continue the story week by week"

如果用户想要单篇总览报告，请改用 `timeline-report`。该技能适用于连载章节格式。

## 前置条件

- `claude-mem` worker 正在运行
- 项目至少有一个 ISO 周的观测数据（流水线可优雅退化——即便 N=1 也可工作）
- 一个用户愿意写入的干净输出目录

**解析 worker 端口**（只需一次，复用 `$WORKER_PORT`）：

```bash
WORKER_PORT="${CLAUDE_MEM_WORKER_PORT:-$(node -e "const fs=require('fs'),p=require('path'),os=require('os');const uid=(typeof process.getuid==='function'?process.getuid():77);const fallback=String(37700+(uid%100));try{const s=JSON.parse(fs.readFileSync(p.join(os.homedir(),'.claude-mem','settings.json'),'utf-8'));process.stdout.write(String(s.CLAUDE_MEM_WORKER_PORT||fallback));}catch{process.stdout.write(fallback);}" 2>/dev/null)}"
```

## 工作流

### 第 1 步：确定项目名称

与 `timeline-report` 使用相同的工作树检测模式。在工作树中，数据源为**父项目**：

```bash
git_dir=$(git rev-parse --git-dir 2>/dev/null)
git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null)
if [ "$git_dir" != "$git_common_dir" ]; then
  parent_project=$(basename "$(dirname "$git_common_dir")")
else
  parent_project=$(basename "$PWD")
fi
echo "$parent_project"
```

### 第 2 步：拉取完整时间线并保存

```bash
mkdir -p .scratch
curl -s "http://localhost:${WORKER_PORT}/api/context/inject?project=PROJECT_NAME&full=true" \
  > .scratch/cm-timeline.md
wc -l .scratch/cm-timeline.md
```

健康检查：确认文件非空且结构符合预期（前置说明段，然后是像 `### Mon DD, YYYY` 这样的日期标题，再是数值观测行 `<id> <time> <emoji> <title>`，以及 `S<n> <prompt> (Mon DD at HH:MMpm)` 这样的会话边界行）。

### 第 3 步：按 ISO 周拆分时间线文件

将 Python 脚本写入 `.scratch/split-timeline.py`：

1. 解析日期标题（`### Mon DD, YYYY`）。
2. 使用 `date.isocalendar()`（以周一为起点）将日期分组到 ISO 周。
3. 输出每周一个文件到 `docs/timeline-weeks/<YYYY>-W<NN>-<MonDD>-to-<MonDD>.md`，逐字保留每一天的分段。
4. 执行双轮健康检查：分发出的观测总数必须等于源文件中的计数。

输出结构（文件名示例）：

```
docs/timeline-weeks/
  README.md                       # weekly index table
  YYYY-W<NN>-MonDD-to-MonDD.md    # one per ISO week the timeline covers
  ...
```

每个周文件都应逐字保留原始日常分段。此阶段不要改写——摘要代理需要原始准确性。

**在启动流水线前统计生成的文件数。** 该计数即为 `TOTAL`，并驱动后续所有步骤。空周（活跃周之间观测为零）应跳过——流水线只处理有内容的周。

### 第 4 步：生成每周索引 `README`

编写 `docs/timeline-weeks/README.md`，使用 Markdown 表格：Week | Dates | Observations | Sessions | File。这将成为操作者的路线图，并帮助代理理解节奏（高峰周与低谷周）。

### 第 5 步：运行连续子代理流水线

**关键：子代理必须顺序执行，而非并行。** 每个代理都会接收前一位代理的 `carry-forward` 块。这是该技能的核心——没有它你会得到 N 个彼此独立的摘要；有了它，你会得到 N 章连贯叙事。

创建输出目录：

```bash
mkdir -p docs/timeline-weeks/digests
```

按时间顺序为每周分发一个 Task 子代理（通用用途），并使用以下提示模板。**每次都要等待该代理完成后再启动下一个。** 从结果中提取 `carry-forward` 块，并作为 `STORY_SO_FAR` 注入下一个提示中。

#### 子代理提示词模板

```
You are writing chapter {N} of {TOTAL} in a serial week-by-week digest of the {PROJECT} project's development history. Chapters 1 through {N-1} are written. {SPECIAL_NOTE: e.g. "This is the LARGEST week", "This is the TROUGH", "This is the FINAL chapter", "This is the ONLY chapter — both first AND final week"}.

**Source file (read in full):**
{ABSOLUTE_PATH_TO_WEEK_FILE}

**Output digest file (write):**
{ABSOLUTE_PATH_TO_DIGEST_FILE}

**Format key for the source file:**
- Numeric lines like `1 7:59p 🔵 Save hook file is empty` are observations (ID, time, type-emoji, title)
- `S##` lines are session boundaries (the user prompt that started the session)
- Emoji legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note 🤫sensitive

**Story so far (carry-forward from Week {N-1}):**

{STORY_SO_FAR_BLOCK_OR_EMPTY_FOR_WEEK_1}

**Your digest must include:**
1. **Title line** — `# Week {N} ({WEEK_LABEL}): {DATE_RANGE} — [your chosen subtitle]`
2. **One-line tagline** — what this week is about, in plain English
3. **Narrative section** ({BUDGET}) — tell the story. Resolve threads from prior weeks where the data shows resolution. Introduce new arcs. Use specific observation details.
4. **Threads continued / opened / resolved** sections
5. **Cliffhanger / What's next**
6. **Carry-forward block** at the very bottom, fenced as ```carry-forward ... ``` — structured handoff for the next week's agent.

**CARRY-FORWARD DISCIPLINE:**
- Cap at ~350 words.
- AGGRESSIVELY PRUNE: drop arcs that didn't surface this week unless they're actively unresolved cliffhangers.
- Drop cast members absent 2+ weeks unless load-bearing for the long arc.
- Quality over completeness. The next agent inherits what you mention; mention judiciously.

Required carry-forward sub-sections:
- **Active arcs** — ongoing themes/projects the next agent should watch for
- **Cast** — notable named systems/people/tools (continuing + new)
- **Unresolved** — open questions or unfinished work
- **Tone notes** — how the story is being told (voice, perspective, register evolution)

**Tone rules:**
- Third-person narrator, sharp, observational. Not twee.
- AI is "Claude"; human is "{USER_FIRST_NAME}".
- Treat codebase components as characters — whatever the project's recurring named systems are (e.g. a worker, a queue, a process manager, a recurring bug, a flaky migration). Don't import names from another project; use what shows up in this project's observations.
- Don't manufacture drama. Name what's there.
- Track the user's prompt-register evolution week by week (frustration markers, escalation language, shifts in tone).
- Note meta-recursion if the project is reflexive about its own behavior (e.g. a tool that documents its own work, an AI agent debugging itself, a system that catches its own regressions).
- Watch for new villains or co-stars and name them.
- For trough/silent weeks: silence IS the story. Don't pad. Name what didn't happen.
- For surge weeks (>2,000 obs): pick 4-7 spine arcs and tell them well. Don't catalog.

**Important:** Do NOT speculate beyond what's in the source file.

After writing the file, return:
1. Path of the file you wrote
2. The carry-forward block verbatim
3. One-sentence summary of the week
```

#### 按观测数分配叙事篇幅

将叙事长度按周内数据量按比例缩放：

| Obs count | Narrative section budget |
| --- | --- |
| < 100 | 200–400 words |
| 100–500 | 300–600 words |
| 500–1,500 | 500–900 words |
| 1,500–3,000 | 700–1,100 words |
| 3,000+ | 800–1,300 words |

将这些内容填入每周提示词的 `{BUDGET}` 槽位。

#### 第一周

第1周时，传入一个空的 `STORY_SO_FAR_BLOCK`，并附带一条说明这是起始章节的指令——代理应为之后的内容建立最初的角色阵容、基调与角色弧线。

#### 最后一周

最后一周有不同的结尾：**不使用 carry-forward 块**。而是要求代理写一个 `## Where We Are` 小节（约250词），列出当前时刻仍未解决的事项。告知代理项目仍在进行中——摘要结束了，故事没有结束。不要给故事一个虚假的结局。

#### 当 N = 1（单周项目）时

对同一章节同时应用这两种处理：空的 `STORY_SO_FAR_BLOCK`，并使用 `## Where We Are`，而不是 carry-forward 块。代理在一次执行中同时写下起始和收束。不要引用不存在的前后章节。

### 第6步：重命名文件以便排序

代理会生成类似 `YYYY-W<NN>-digest.md` 的摘要文件名。这些文件名已按 ISO 周次（直到项目在一个项目名内跨越年度）按时间顺序排列，但**请添加零填充的数字前缀**，以便人在目录中浏览或对目录做脚本处理时顺序无歧义：

```bash
cd docs/timeline-weeks/digests
total=$(ls *.md | wc -l | tr -d ' ')
width=${#total}                  # 1 for N<10, 2 for N<100, 3 for N<1000
[ "$width" -lt 2 ] && width=2    # always pad to at least 2 for readability
i=0
for f in *.md; do
  printf -v prefix "%0${width}d" $i
  mv "$f" "${prefix}-$f"
  i=$((i+1))
done
```

N=30 时结果为：`00-...md` 到 `29-...md`。N=4 时为：`00-...md` 到 `03-...md`。N=120 时为：`000-...md` 到 `119-...md`。**始终零填充**——`1-...md` 与 `10-...md` 不加零时排序会出错。

不要在每个文件内部也给 digest 标题行加上顺序号。文件名前缀仅用于排序，标题保持简洁：`# Week N (W##): Date — Subtitle`。

### 第7步：汇报完成情况

告知用户：
- 已处理周数（N）
- 输出目录路径
- 涵盖的日期范围
- 任何需要标注的静默/低谷周
- 一句总结弧线的收束陈述——由最终章代理撰写，或由操作员根据最终代理的 `## Where We Are` 小节整理。

## Pipeline Discipline

这些规则来自对流水线端到端执行的实践总结。每次都应落实：

1. **顺序执行，不并行。** 关键在于 carry-forward 链条。并行会破坏这一点。
2. **Carry-forward 需受限。** 它会因缺少主动剪枝而膨胀。告诉每个代理：控制在约350词，剔除沉睡的弧线，剔除缺席的角色。
3. **明确追踪登记簿演变。** 用户每周的提示语风格本身就是一段故事弧线。挫败感标记会随时间变化（以该项目数据中的具体标记为准）。要指出这些变化。
4. **把组件视为角色。** 在观测中反复出现的命名系统就是这个项目的反派与共演角色。跨周维持稳定角色有助于叙事连贯。
5. **尊重沉默。** 低谷周（10–100 条观测）是真正的章节。要说明未发生什么，不要硬填内容。
6. **不要杜撰戏剧性。** 只做数据观察。如果项目本身是递归的，那么递归本身就是戏剧，不必再添戏剧。
7. **最后一周：不写假结尾。** 摘要结束，项目未完。写 `## Where We Are`，而不是“THE END”。

## 错误处理

- **时间线为空**：项目名错误，或 worker 未运行。可用 `curl -s "http://localhost:${WORKER_PORT}/api/search?query=*&limit=1"` 验证。
- **Worker 未运行**：按常用方式启动，或检查 `ps aux | grep worker-service`。
- **子代理返回格式错误的 carry-forward**：按正则抽取 carry-forward 块（` ```carry-forward ... ``` `）并原文传递。若缺失，请要求代理重试，并给出明确指令：“你的回复必须在末尾包含一个用 ```carry-forward ...``` 围栏包裹的 carry-forward 块”。
- **一个代理中途失败**：用同一 carry-forward 重试该周。不得跳过——链条不能中断。
- **Carry-forward 超过约500词**：在后续提示中收紧约束，明确要求剪枝。

## 示例

### 长周期项目（约30周）

用户：`Make weekly digests for [project] from beginning to end`

1. 解析 worker 端口，确认项目名。
2. 拉取完整时间线 → `.scratch/cm-timeline.md`。
3. 运行 `.scratch/split-timeline.py` → 在 `docs/timeline-weeks/` 中生成 N 个周文件（例如 30 个）。
4. 生成 `docs/timeline-weeks/README.md` 索引。
5. 连续启动 N 个子代理，每周一个，且每个都接收上一周的 carry-forward。第一章使用空的 carry-forward；最后一章写 `## Where We Are` 而不是 carry-forward 块。
6. 用零填充顺序前缀重命名摘要（`00-...md` 到 `29-...md`）。
7. 汇报总章节数、日期范围、低谷/高峰，并报告最终代理产出的单行收束总结。

### 短期项目（约3周）

流程相同，只是规模更小。N=3，因此：
- 第1章：空 carry-forward，建立角色/基调/弧线。
- 第2章：接收第1章的 carry-forward，在其基础上延展。
- 第3章：接收第2章的 carry-forward，但改为最终章节处理（`## Where We Are` 取代 carry-forward 块）。
- 文件名：`00-...md`、`01-...md`、`02-...md`。

### 单周项目（N=1）

对唯一一章同时应用首尾两类处理：空 carry-forward、`## Where We Are` 收束，不引用不存在的前后章节。文件名：`00-...md`。
