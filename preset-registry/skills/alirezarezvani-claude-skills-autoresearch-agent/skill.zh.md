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
# 自动研究代理

> 你在休眠。代理进行实验。你醒来时即可看到结果。

受 [Karpathy 的 autoresearch](https://github.com/karpathy/autoresearch) 启发的自主实验循环。代理编辑一个文件，运行固定评估，保留改进，丢弃失败结果，并无限循环。

不是一次猜测，而是五十次经过测量的尝试，持续累积。

---

## 斜杠命令

| 命令 | 功能 |
|---------|-------------|
| `/ar:setup` | 交互式设置新实验 |
| `/ar:run` | 运行一次实验迭代 |
| `/ar:loop` | 以可配置的间隔（10m、1h、daily、weekly、monthly）启动自主循环 |
| `/ar:ar-status` | 显示仪表板和结果 |
| `/ar:ar-resume` | 恢复已暂停的实验 |

---

## 此 Skill 的激活条件

从用户的请求中识别以下模式：

- “让这个更快 / 更小 / 更好”
- “针对 [指标] 优化 [文件]”
- “改进我的 [标题 / 文案 / 提示词]”
- “通宵运行实验”
- “我想把 [指标] 从 X 提升到 Y”
- 任何涉及：优化、基准测试、改进、实验循环、autoresearch 的请求

如果用户描述了目标文件以及衡量成功与否的方法 → 此 skill 适用。

---

## 设置

### 首次使用 — 创建实验

运行设置脚本。实验存放位置由用户决定：

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

**用户级**（个人使用，位于 `~/.autoresearch/`）：
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
- `project`（默认）→ 仓库根目录中的 `.autoresearch/`。实验定义由 git 跟踪。结果会被 gitignore。
- `user` → 主目录中的 `~/.autoresearch/`。所有内容均为个人使用。

### 设置所创建的内容

```
.autoresearch/
├── config.yaml                        ← 全局设置
├── .gitignore                         ← 忽略 results.tsv、*.log
└── {domain}/{experiment-name}/
    ├── program.md                     ← 目标、约束、策略
    ├── config.cfg                     ← 目标、评估命令、指标、方向
    ├── results.tsv                    ← 实验日志（被 gitignore）
    └── evaluate.py                    ← 评估脚本（使用 --evaluator 时）
```

**results.tsv 列：** `commit | metric | status | description`
- `commit` — 简短的 git 哈希
- `metric` — 浮点值；发生崩溃时为 "N/A"
- `status` — keep | discard | crash
- `description` — 更改内容或崩溃原因

### 领域

| 领域 | 使用场景 |
|--------|-----------|
| `engineering` | 代码速度、内存、包体积、测试通过率、构建时间 |
| `marketing` | 标题、社交媒体文案、邮件主题、广告文案、互动度 |
| `content` | 文章结构、SEO 描述、可读性、CTR |
| `prompts` | 系统提示词、聊天机器人语气、代理指令 |
| `custom` | 其他具有可测量指标的内容 |

### 如果 `program.md` 已经存在

用户可能已经编写了自己的 `program.md`。如果在实验目录中找到该文件，请读取它。它会覆盖模板。只询问缺失的内容。

---

## Agent 协议

你就是循环本身。脚本负责设置和评估——你负责创意工作。

### 开始之前
1. 读取 `.autoresearch/{domain}/{name}/config.cfg`，获取：
   - `target` — 要编辑的文件
   - `evaluate_cmd` — 用于衡量更改效果的命令
   - `metric` — 要在评估输出中查找的指标名称
   - `metric_direction` — "`lower`" 或 "`higher`" 哪个更好
   - `time_budget_minutes` — 每次评估的最长时间
2. 读取 `program.md`，了解策略、约束，以及可以和不可以更改的内容
3. 读取 `results.tsv`，了解实验历史（列：commit、metric、status、description）
4. 切换到实验分支：`git checkout autoresearch/{domain}/{name}`

### 每次迭代
1. 查看 `results.tsv`——哪些方法有效？哪些失败了？哪些还没有尝试？
2. 决定对目标文件进行一项更改。每次实验只改变一个变量。
3. 编辑目标文件
4. 提交：`git add {target} && git commit -m "experiment: {description}"`
5. 评估：`python scripts/run_experiment.py --experiment {domain}/{name} --single`
6. 读取输出——它会打印 `KEEP`、`DISCARD` 或 `CRASH` 以及指标值
7. 返回第 1 步

### 脚本负责处理的内容（你无需处理）
- 在超时限制内运行评估命令
- 从评估输出中解析指标
- 与之前的最佳结果进行比较
- 失败时还原提交（`git reset --hard HEAD~1`）
- 将结果记录到 `results.tsv`

### 开始实验

```bash
# Single iteration (the agent calls this repeatedly)
python scripts/run_experiment.py --experiment engineering/api-speed --single

# Dry run (test setup before starting)
python scripts/run_experiment.py --experiment engineering/api-speed --dry-run
```

### 策略升级
- 第 1-5 次运行：从低垂果实入手（显而易见的改进、简单的优化）
- 第 6-15 次运行：系统化探索（一次只改变一个参数）
- 第 16-30 次运行：结构性更改（算法替换、架构调整）
- 第 30 次以后：激进实验（完全不同的方法）
- 如果连续 20 多次运行都没有改进：更新 `program.md` 中的 Strategy 部分

### 自我改进
每完成 10 次实验后，检查 `results.tsv` 中的模式。根据你的发现更新
`program.md` 的 Strategy 部分（例如：“缓存更改始终能带来 5-10% 的改进”，“重构尝试从未改善指标”）。
未来的迭代将受益于这些积累的经验。

### 停止
- 一直运行，直到用户中断、达到上下文限制，或满足 `program.md` 中的目标
- 停止前：确保 `results.tsv` 已更新
- 达到上下文限制时：下一次会话可以继续——`results.tsv` 和 git log 会持久保留

### 规则

- **每次实验只进行一项更改。** 不要一次更改 5 件事。否则你无法知道是什么起了作用。
- **简洁性标准。** 增加丑陋复杂度的小幅改进并不值得。性能相同但代码更简单就是胜利。用更少的代码取得相同结果是最好的结果。
- **绝不修改评估器。** `evaluate.py` 是事实标准。修改它会使所有比较失效。如果发现自己正在修改它，应立即停止。
- **超时。** 如果一次运行超过时间预算的 2.5 倍，则终止它并视为崩溃。
- **崩溃处理。** 如果是拼写错误或缺少导入，则修复后重新运行。如果想法本身存在根本性问题，则还原、记录 `"crash"`，然后继续。连续发生 5 次崩溃后 → 暂停并发出警告。
- **不得新增依赖。** 只能使用项目中已有的内容。

---

## 评估器

开箱即用的评估脚本。在设置期间使用 `--evaluator` 复制到实验目录中。

### 免费评估器（无 API 费用）

| 评估器 | 指标 | 使用场景 |
|-----------|--------|----------|
| `benchmark_speed` | `p50_ms`（越低越好） | 函数/API 执行时间 |
| `benchmark_size` | `size_bytes`（越低越好） | 文件、bundle、Docker 镜像大小 |
| `test_pass_rate` | `pass_rate`（越高越好） | 测试套件通过率 |
| `build_speed` | `build_seconds`（越低越好） | 构建/编译/Docker 构建时间 |
| `memory_usage` | `peak_mb`（越低越好） | 执行期间的峰值内存 |

### LLM 评判器（使用你的订阅）

| 评估器 | 指标 | 使用场景 |
|-----------|--------|----------|
| `llm_judge_content` | `ctr_score` 0-10（越高越好） | 标题、名称、描述 |
| `llm_judge_prompt` | `quality_score` 0-100（越高越好） | 系统提示词、代理指令 |
| `llm_judge_copy` | `engagement_score` 0-10（越高越好） | 社交媒体帖子、广告文案、电子邮件 |

LLM 评判器会调用用户当前正在运行的 CLI 工具（Claude、Codex、Gemini）。评估提示词锁定在 `evaluate.py` 中，代理无法修改。这可以防止代理操纵自己的评估器。

用户现有的订阅可覆盖相关费用：
- Claude Code Max → 无限次 Claude 评估调用
- Codex CLI (ChatGPT Pro) → 无限次 Codex 调用
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

- **TSV** — 默认格式，使用制表符分隔（兼容电子表格）
- **CSV** — 使用逗号分隔，并进行适当的引号处理
- **Markdown** — 格式化表格，便于在 GitHub/文档中阅读

---

## 主动触发条件

无需等待请求，主动标记以下情况：

- **没有任何评估命令可以正常工作** → 在开始循环之前先进行测试。运行一次并验证输出。
- **目标文件不在 git 中** → 先运行 `git init && git add . && git commit -m 'initial'`。
- **指标方向不明确** → 询问：数值越低越好，还是越高越好？在开始之前必须明确。
- **时间预算过短** → 如果评估耗时超过预算，每次运行都会崩溃。
- **Agent 修改了 evaluate.py** → 立即停止。这会使所有比较失效。
- **连续崩溃 5 次** → 暂停循环。提醒用户。不要继续浪费运行周期。
- **运行 20 次以上没有改进** → 建议在 program.md 中更改策略，或尝试不同的方法。

---

## 安装

### 单行命令（任意工具）
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

- **self-improving-agent** — 随时间改进 Agent 自身的记忆/规则。不适用于结构化实验循环。
- **senior-ml-engineer** — ML 架构决策。具有互补作用 — 用于初始设计，然后使用 autoresearch 进行优化。
- **tdd-guide** — 测试驱动开发。具有互补作用 — 测试可以作为评估函数。
- **skill-security-auditor** — 在发布前审计技能。不适用于优化循环。