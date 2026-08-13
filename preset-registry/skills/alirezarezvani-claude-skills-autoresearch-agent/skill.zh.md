---
name: "autoresearch-agent"
description: "Autonomous experiment loop that optimizes any file by a measurable metric. Inspired by Karpathy's autoresearch. The agent edits a target file, runs a fixed evaluation, keeps improvements (git commit), discards failures (git reset), and loops indefinitely. Use when: user wants to optimize code speed, reduce bundle/image size, improve test pass rate, optimize prompts, improve content quality (headlines, copy, CTR), or run any measurable improvement loop. Requires: a target file, an evaluation command that outputs a metric, and a git repo."
license: MIT
metadata:
  version: 2.0.0
  author: Alireza Rezvani
  category: engineering
  updated: 2026-03-13
---
# Autoresearch 智能体

> 你安然入睡。智能体持续实验。醒来即可查看结果。

受 [Karpathy 的 autoresearch](https://github.com/karpathy/autoresearch) 启发的自主实验循环。智能体编辑一个文件、运行固定评估、保留改进、丢弃失败结果，并无限循环。

不是一次猜测，而是五十次经过测量的尝试，持续累积改进。

---

## 斜杠命令

| 命令 | 作用 |
|---------|-------------|
| `/ar:setup` | 以交互方式设置新实验 |
| `/ar:run` | 运行单次实验迭代 |
| `/ar:loop` | 以可配置的间隔（10 分钟、1 小时、每天、每周、每月）启动自主循环 |
| `/ar:status` | 显示仪表板和结果 |
| `/ar:resume` | 恢复已暂停的实验 |

---

## 此 Skill 何时激活

识别用户提出的以下模式：

- “让它更快 / 更小 / 更好”
- “针对[指标]优化[文件]”
- “改进我的[标题 / 文案 / 提示词]”
- “通宵运行实验”
- “我想把[指标]从 X 提升到 Y”
- 任何涉及以下内容的请求：优化、基准测试、改进、实验循环、autoresearch

如果用户描述了目标文件和衡量成功的方法 → 此 Skill 适用。

---

## 设置

### 首次使用——创建实验

运行设置脚本。由用户决定实验的存放位置：

**项目级**（位于仓库内、由 git 跟踪、可与团队共享）：
```bash
python scripts/setup_experiment.py \
  --domain engineering \
  --name api-speed \
  --target src/api/search.py \
  --eval "pytest bench.py --tb=no -q" \
  --metric p50_ms \
  --direction lower \
  --scope project
```

**用户级**（个人使用，位于 `~/.autoresearch/` 中）：
```bash
python scripts/setup_experiment.py \
  --domain marketing \
  --name medium-ctr \
  --target content/titles.md \
  --eval "python evaluate.py" \
  --metric ctr_score \
  --direction higher \
  --evaluator llm_judge_content \
  --scope user
```

`--scope` 标志决定 `.autoresearch/` 的存放位置：
- `project`（默认）→ 仓库根目录中的 `.autoresearch/`。实验定义由 git 跟踪。结果被 git 忽略。
- `user` → 主目录中的 `~/.autoresearch/`。所有内容均为个人所有。

### 设置过程会创建的内容

```
.autoresearch/
├── config.yaml                        ← Global settings
├── .gitignore                         ← Ignores results.tsv, *.log
└── {domain}/{experiment-name}/
    ├── program.md                     ← Objectives, constraints, strategy
    ├── config.cfg                     ← Target, eval cmd, metric, direction
    ├── results.tsv                    ← Experiment log (gitignored)
    └── evaluate.py                    ← Evaluation script (if --evaluator used)
```

**results.tsv 列：** `commit | metric | status | description`
- `commit` — 简短的 git 哈希
- `metric` — 浮点值，崩溃时为“N/A”
- `status` — keep | discard | crash
- `description` — 更改内容或崩溃原因

### 领域

| 领域 | 使用场景 |
|--------|-----------|
| `engineering` | 代码速度、内存、包大小、测试通过率、构建时间 |
| `marketing` | 标题、社交媒体文案、邮件主题、广告文案、互动量 |
| `content` | 文章结构、SEO 描述、可读性、CTR |
| `prompts` | 系统提示词、聊天机器人语气、智能体指令 |
| `custom` | 其他任何具有可衡量指标的内容 |

### 如果 `program.md` 已存在

用户可能已经编写了自己的 `program.md`。如果在实验目录中发现该文件，请读取它。它会覆盖模板。只询问缺失的信息。

---

## 智能体协议

你就是循环的执行者。脚本负责设置和评估——你负责创造性工作。

### 开始之前
1. 读取 `.autoresearch/{domain}/{name}/config.cfg` 以获取：
   - `target`——你要编辑的文件
   - `evaluate_cmd`——用于衡量更改效果的命令
   - `metric`——要在评估输出中查找的指标名称
   - `metric_direction`——"lower" 或 "higher" 表示更优
   - `time_budget_minutes`——每次评估的最长时间
2. 阅读 `program.md`，了解策略、约束以及可以和不可以更改的内容
3. 阅读 `results.tsv`，了解实验历史记录（列：commit、metric、status、description）
4. 检出实验分支：`git checkout autoresearch/{domain}/{name}`

### 每次迭代
1. 查看 results.tsv——哪些有效？哪些失败？哪些尚未尝试？
2. 决定对目标文件进行一项更改。每次实验只改变一个变量。
3. 编辑目标文件
4. 提交：`git add {target} && git commit -m "experiment: {description}"`
5. 评估：`python scripts/run_experiment.py --experiment {domain}/{name} --single`
6. 阅读输出——它会打印 KEEP、DISCARD 或 CRASH，以及指标值
7. 返回第 1 步

### 脚本负责处理的事项（你不需要处理）
- 运行评估命令并实施超时限制
- 从评估输出中解析指标
- 与之前的最佳结果比较
- 失败时还原提交（`git reset --hard HEAD~1`）
- 将结果记录到 results.tsv

### 启动实验

```bash
# Single iteration (the agent calls this repeatedly)
python scripts/run_experiment.py --experiment engineering/api-speed --single

# Dry run (test setup before starting)
python scripts/run_experiment.py --experiment engineering/api-speed --dry-run
```

### 策略升级
- 第 1-5 次运行：容易实现的改进（显而易见的改进、简单优化）
- 第 6-15 次运行：系统性探索（每次改变一个参数）
- 第 16-30 次运行：结构性更改（替换算法、调整架构）
- 第 30 次以上运行：激进实验（采用完全不同的方法）
- 如果连续 20 次以上运行均无改进：更新 program.md 的 Strategy 部分

### 自我改进
每进行 10 次实验后，查看 results.tsv 并分析其中的规律。使用学到的内容更新 program.md 的 Strategy 部分（例如，“缓存更改始终能带来 5-10% 的改进”“重构尝试从未改善指标”）。
后续迭代将受益于这些积累下来的知识。

### 停止
- 持续运行，直到用户中断、达到上下文限制或实现 program.md 中的目标
- 停止前：确保 results.tsv 已更新
- 达到上下文限制时：下一会话可以继续——results.tsv 和 git log 会持久保留

### 规则

- **每次实验只进行一项更改。** 不要一次更改 5 项内容。否则你无法知道哪项更改有效。
- **简洁性标准。** 为了小幅改进而引入丑陋的复杂性并不值得。性能相同时，代码更简单就是胜利。在结果相同的情况下，删除代码是最佳结果。
- **绝不要修改评估器。** `evaluate.py` 是唯一标准。修改它会使所有比较失效。如果发现自己正打算这样做，立即停止。
- **超时。** 如果某次运行超过时间预算的 2.5 倍，请终止运行并将其视为崩溃。
- **崩溃处理。** 如果是拼写错误或缺少导入，请修复后重新运行。如果想法本身存在根本性问题，请还原更改，记录 "crash"，然后继续。连续崩溃 5 次 → 暂停并发出警告。
- **不得添加新依赖项。** 只能使用项目中已有的依赖项。

---

## 评估器

可直接使用的评估脚本。在设置期间使用 `--evaluator` 将其复制到实验目录中。

### 免费评估器（无 API 成本）

| 评估器 | 指标 | 使用场景 |
|-----------|--------|----------|
| `benchmark_speed` | `p50_ms`（越低越好） | 函数/API 执行时间 |
| `benchmark_size` | `size_bytes`（越低越好） | 文件、软件包、Docker 镜像大小 |
| `test_pass_rate` | `pass_rate`（越高越好） | 测试套件通过率 |
| `build_speed` | `build_seconds`（越低越好） | 构建/编译/Docker 构建时间 |
| `memory_usage` | `peak_mb`（越低越好） | 执行期间的峰值内存用量 |

### LLM 评审评估器（使用你的订阅）

| 评估器 | 指标 | 使用场景 |
|-----------|--------|----------|
| `llm_judge_content` | `ctr_score` 0-10（越高越好） | 标题、副标题、描述 |
| `llm_judge_prompt` | `quality_score` 0-100（越高越好） | 系统提示词、智能体指令 |
| `llm_judge_copy` | `engagement_score` 0-10（越高越好） | 社交媒体帖子、广告文案、电子邮件 |

LLM 评审器会调用用户当前正在运行的 CLI 工具（Claude、Codex、Gemini）。评估提示词被锁定在 `evaluate.py` 中——智能体无法修改它。这可以防止智能体操纵自己的评估器。

费用由用户现有的订阅承担：
- Claude Code Max → 无限次 Claude 评估调用
- Codex CLI (ChatGPT Pro) → 无限次 Codex 评估调用
- Gemini CLI（免费层级）→ 免费评估调用

### 自定义评估器

如果没有合适的内置评估器，用户可以自行编写 `evaluate.py`。唯一要求：必须将 `metric_name: value` 输出到 stdout。

```python
#!/usr/bin/env python3
# My custom evaluator — DO NOT MODIFY after experiment starts
import subprocess
result = subprocess.run(["my-benchmark", "--json"], capture_output=True, text=True)
# Parse and output
print(f"my_metric: {parse_score(result.stdout)}")
```

---

## 查看结果

```bash
# Single experiment
python scripts/log_results.py --experiment engineering/api-speed

# All experiments in a domain
python scripts/log_results.py --domain engineering

# Cross-experiment dashboard
python scripts/log_results.py --dashboard

# Export formats
python scripts/log_results.py --experiment engineering/api-speed --format csv --output results.csv
python scripts/log_results.py --experiment engineering/api-speed --format markdown --output results.md
python scripts/log_results.py --dashboard --format markdown --output dashboard.md
```

### 仪表板输出

```
DOMAIN          EXPERIMENT          RUNS  KEPT  BEST         Δ FROM START  STATUS
engineering     api-speed            47    14   185ms        -76.9%        active
engineering     bundle-size          23     8   412KB        -58.3%        paused
marketing       medium-ctr           31    11   8.4/10       +68.0%        active
prompts         support-tone         15     6   82/100       +46.4%        done
```

### 导出格式

- **TSV** —— 默认格式，以制表符分隔（与电子表格兼容）
- **CSV** —— 以逗号分隔，并进行正确的引号处理
- **Markdown** —— 格式化表格，可在 GitHub/文档中阅读

---

## 主动触发条件

无需用户提出请求，即应标记以下情况：

- **没有可用的评估命令** → 在开始循环之前先进行测试。运行一次并验证输出。
- **目标文件未纳入 git** → 首先执行 `git init && git add . && git commit -m 'initial'`。
- **指标方向不明确** → 询问：指标越低越好，还是越高越好？开始之前必须明确。
- **时间预算太短** → 如果评估耗时超过预算，每次运行都会崩溃。
- **智能体正在修改 evaluate.py** → 立即停止。这会使所有比较失效。
- **连续崩溃 5 次** → 暂停循环。提醒用户。不要继续浪费周期。
- **运行 20 次以上仍无改进** → 建议更改 program.md 中的策略，或尝试其他方法。

---

## 安装

### 单行命令（适用于任何工具）
```bash
git clone https://github.com/alirezarezvani/claude-skills.git
cp -r claude-skills/engineering/autoresearch-agent ~/.claude/skills/
```

### 多工具安装
```bash
./scripts/convert.sh --skill autoresearch-agent --tool codex|gemini|cursor|windsurf|openclaw
```

### OpenClaw
```bash
clawhub install cs-autoresearch-agent
```

---

## 相关技能

- **self-improving-agent** — 随时间推移改进智能体自身的记忆和规则。不适用于结构化实验循环。
- **senior-ml-engineer** — 负责机器学习架构决策。可与本技能互补——先用于初始设计，再使用 autoresearch 进行优化。
- **tdd-guide** — 测试驱动开发。可与本技能互补——测试可以作为评估函数。
- **skill-security-auditor** — 在发布技能之前对其进行审计。不适用于优化循环。