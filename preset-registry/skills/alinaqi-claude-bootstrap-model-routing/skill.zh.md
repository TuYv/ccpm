# 模型路由系统

## 路由决策的制定方式

每条用户提示词在由任何 AI 模型处理之前，都会经过一个 9 层分类管线。该系统会回答三个问题：

1. **应该由哪个模型处理此任务？** — 9 层成本/复杂度分类
2. **分类器本身是否正常工作？** — 级联回退（qwen3 → kimi → deepseek → 缓存）
3. **我们能否验证结果？** — 工具级回退 + 自动评估

### 管线

```
User types prompt
    ↓
UserPromptSubmit hook fires (~/.claude/hooks/route-task-hook)
    ↓
Classifier: qwen3 (local, free) classifies into tier
    ↓  (fails?)
Classifier: kimi (local, free) retries
    ↓  (fails?)
Classifier: deepseek-flash (~$0.0001) retries
    ↓  (fails?)
Classifier: cached tier from last success
    ↓
Hook injects routing decision into Claude's context
    ↓
Claude delegates to the right model or handles directly
```

## 9 层路由表

| 层级 | 模型 | 输入（每百万 token） | 输出（每百万 token） | 处理范围 |
|------|-------|---------------|----------------|---------|
| 0 | **Qwen3**（本地） | $0 | $0 | grep、find、shell、语法、日志读取 |
| 1 | **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | 批量提取、分类、CIG 管线 |
| 2 | **DeepSeek V4 Flash** | $0.14 | $0.28 | 简单代码、CRUD、测试编写、小型修复 |
| 3 | **DeepSeek V4 Pro** | $0.44 | $0.87 | 多文件功能、重构、调试（约 80% 的工作） |
| 4 | **Gemini 2.5 Flash** | $0.15 | $0.60 | 多模态（图像、视频、音频）、品牌分析 |
| 5 | **Kimi K2.6** | $0.60 | $2.50 | 代码审查、提交信息、差异摘要 |
| 6 | **Gemini 3.1 Pro + Search** | $1.25 | $10.00 | 深度研究、Google 依据支撑、2M 上下文 |
| 7 | **Codex** | 视情况而定 | 视情况而定 | 批量生成、代码审查 |
| 8 | **Claude Sonnet/Opus** | $3-5 | $15-25 | 架构、安全、质量关键型任务 |

## 委派命令

当钩子提示“委派给 X”时，运行对应的命令并返回其输出：

```bash
# Tier 0 — Qwen3
~/bin/qwen3 "prompt"

# Tier 1 — Gemini Flash-Lite
~/bin/gemini --flash-lite "prompt"

# Tier 2 — DeepSeek Flash
~/bin/deepseek --flash "prompt"

# Tier 3 — DeepSeek Pro
~/bin/deepseek --pro "prompt"

# Tier 4 — Gemini Flash
~/bin/gemini --flash "prompt"

# Tier 5 — Kimi
~/bin/kimi --quiet -p "prompt"

# Tier 6 — Gemini Pro Search
~/bin/gemini --pro-search "prompt"

# Tier 7 — Codex
codex exec "prompt"

# Tier 8 — Claude
# Handle directly (no delegation)
```

## 委派脚本约定

每个 `~/bin/` 脚本都遵循相同的模式：

1. **接受提示词作为参数**：`script "what is 2+2"`
2. **模型标志**：`--flash`、`--pro`、`--flash-lite`、`--pro-search`
3. **静默模式**：`--quiet`（如适用）
4. **输出**：将响应写入 stdout，将错误写入 stderr
5. **退出代码**：成功时为 0，失败时为非零值

### 可用脚本

```
~/bin/
├── qwen3       # Shell: curl to local Ollama API
├── kimi        # Shell: execs Kimi CLI binary
├── deepseek    # Python: httpx to DeepSeek Anthropic-compat API
├── gemini      # Python: httpx to Gemini OpenAI-compat API
├── research    # Python: multi-backend research with auto-evaluation
└── route-task  # Shell: qwen3-powered task classification
```

## 分类器回退链

分类器本身也可能失败。发生这种情况时，会触发级联回退：

| 层级 | 分类器 | 成本 | 阈值 |
|-------|-----------|------|-----------|
| 1 | **qwen3**（Ollama） | $0 | 连接 2 秒，分类 8 秒 |
| 2 | **kimi** CLI | $0 | 本地进程 |
| 3 | **deepseek-flash** | ~$0.0001 | API 调用 |
| 4 | **缓存层级** | $0 | 来自 `~/.claude/routing-cache.json` |

缓存（`~/.claude/routing-cache.json`）会保存最近一次成功使用的层级及其时间戳。压缩后，Ollama 可能会短暂无法访问，此时缓存可确保路由继续运行，而不会默认降级到 CLAUDE。

## 工具回退协议

当 Claude 的内置工具失败时，外部后端会接管：

| 失败的工具 | 回退方案 1 | 回退方案 2 |
|-------------|------------|------------|
| **WebSearch** / **WebFetch** | `~/bin/research "query"` | `~/bin/deepseek --pro "query"` |
| **Read** / 文件访问 | 通过 Bash 执行 `cat` | — |
| **Grep** | 通过 Bash 执行 `grep -r` | — |

### 研究工具（`~/bin/research`）

支持自动评估的多后端研究工具：
- 按顺序尝试 **deepseek-flash → deepseek-pro**
- 根据内容质量、结构和长度对结果进行 0-10 分评分
- 根据评估分数自动调整首选后端
- 查看统计信息：`~/bin/research --eval`
- 评分日志：`~/.claude/research-eval.jsonl`

## Maggy 集成

Maggy 的 `model_router.py` 在 `DEFAULT_TIERS` 中采用相同的 9 层级结构。`PiAdapter` 使用相同的委派脚本来执行任务。`routing_rules_defaults.py` 中的任务类型覆盖规则可确保：

- `research`、`competitor` → **Gemini Pro Search**（Google grounding）
- `bulk` → **Gemini Flash-Lite**（成本最低）
- `security`、`architecture`、`planning` → **Claude**（质量至关重要）
- `docs`、`tests` → **DeepSeek Pro**（成本效益高）
- `review` → **Claude**（具备安全性和架构方面的深度）

## 环境

```bash
# Required for delegation scripts (in ~/.zshrc)
export DEEPSEEK_API_KEY="sk-..."
export GEMINI_API_KEY="..."       # For gemini delegator
export OPENAI_API_KEY="sk-..."    # For codex CLI

# Ollama must be running locally for qwen3
ollama serve  # or launch at startup
```

## 可观测性

- **路由日志**：`~/.claude/routing-log.jsonl` — 记录每次分类的层级、所用分类器和节省的 token 数量
- **路由缓存**：`~/.claude/routing-cache.json` — 用于压缩后恢复的最近层级
- **研究评估**：`~/.claude/research-eval.jsonl` — 针对每次查询的后端评分
- **Maggy 路由热力图**：Dashboard → Models 选项卡 → 每个模型的奖励分数