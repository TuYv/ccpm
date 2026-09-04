---
name: dual-axis-skill-reviewer
description: "Review skills in any project using a dual-axis method: (1) deterministic code-based checks (structure, scripts, tests, execution safety) and (2) LLM deep review findings. Use when you need reproducible quality scoring for `skills/*/SKILL.md`, want to gate merges with a score threshold (for example 90+), or need concrete improvement items for low-scoring skills. Works across projects via --project-root."
---
# 双轴技能审查器

运行双轴审查脚本，并将报告保存到 `reports/`。

该脚本支持：
- 随机或固定选择技能
- 自动轴评分，可选执行测试
- LLM 提示词生成
- 合并 LLM JSON 审查结果并计算加权最终得分
- 通过 `--project-root` 进行跨项目审查
- 非计分式展示 `skills-index.yaml` 中的生产验证声明

## 何时使用

- 需要对 `skills/*/SKILL.md` 中的某个技能获得可复现的评分。
- 需要在最终得分低于 90 时获取改进项。
- 需要确定性检查与定性 LLM 代码/内容审查兼顾。
- 需要从命令行审查**另一个项目**中的技能。

## 前置条件

- Python 3.9+
- `uv`（推荐 —— 通过内联元数据自动解析 `pyyaml` 依赖）
- 运行测试所需：在目标项目中执行 `uv sync --extra dev` 或等效命令
- 合并 LLM 轴所需：符合 LLM 审查模式（schema）的 JSON 文件（参见资源部分）

## 工作流程

根据你的使用场景确定正确的脚本路径：

- **同一项目**：`skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py`
- **全局安装**：`~/.claude/skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py`

以下示例使用 `REVIEWER` 作为占位符。只需设置一次：

```bash
# If reviewing from the same project:
REVIEWER=skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py

# If reviewing another project (global install):
REVIEWER=~/.claude/skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py
```

### 步骤 1：运行自动轴 + 生成 LLM 提示词

```bash
uv run "$REVIEWER" \
  --project-root . \
  --emit-llm-prompt \
  --output-dir reports/
```

审查其他项目时，将 `--project-root` 指向该目标项目：

```bash
uv run "$REVIEWER" \
  --project-root /path/to/other/project \
  --emit-llm-prompt \
  --output-dir reports/
```

### 步骤 2：执行 LLM 审查
- 使用生成于 `reports/skill_review_prompt_<skill>_<timestamp>.md` 的提示词文件。
- 要求 LLM 返回严格的 JSON 输出。
- 在 Claude Code 中运行时，让 Claude 充当编排者：读取生成的提示词，产出 LLM 审查 JSON，并保存以供合并步骤使用。

### 步骤 3：合并自动轴与 LLM 轴

```bash
uv run "$REVIEWER" \
  --project-root . \
  --skill <skill-name> \
  --llm-review-json <path-to-llm-review.json> \
  --auto-weight 0.5 \
  --llm-weight 0.5 \
  --output-dir reports/
```

### 步骤 4：可选控制项
- 固定选择以实现可复现：`--skill <name>` 或 `--seed <int>`
- 一次性审查全部技能：`--all`
- 跳过测试以便快速分诊：`--skip-tests`
- 更改报告位置：`--output-dir <dir>`
- 若需更严格的确定性把关，可提高 `--auto-weight`。
- 若优先考虑定性/代码审查深度，可提高 `--llm-weight`。

## 输出

- `reports/skill_review_<skill>_<timestamp>.json`
- `reports/skill_review_<skill>_<timestamp>.md`
- `reports/skill_review_prompt_<skill>_<timestamp>.md`（启用 `--emit-llm-prompt` 时生成）

当目标项目的 `skills-index.yaml` 中存在带有完整 `verification` 块的条目时，JSON 和 Markdown 报告还会展示其声明的各轴、`not_verified` 缺口、不适用的轴以及 `all_applicable_axes_passed`。该部分仅供参考，不计入自动/LLM/最终得分，也不能替代针对高严重性问题的实时检查。

## 安装（全局）

若要在任何项目中使用此技能，请将其符号链接到 `~/.claude/skills/`：

```bash
ln -sfn /path/to/claude-trading-skills/skills/dual-axis-skill-reviewer \
  ~/.claude/skills/dual-axis-skill-reviewer
```

此后，Claude Code 将在所有项目中识别该技能，且脚本可通过 `~/.claude/skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py` 访问。

## 资源

- 自动轴对元数据、工作流覆盖度、执行安全性、制品存在情况以及测试健康度进行评分。
- 自动轴会检测 `knowledge_only` 技能并调整脚本/测试预期，以避免不公平的扣分。
- LLM 轴对深度内容质量进行评分（正确性、风险、缺失逻辑、可维护性）。
- 最终得分为加权平均值。
- 若最终得分低于 90，则需要改进项，并列于 markdown 报告中。
- 脚本：`skills/dual-axis-skill-reviewer/scripts/run_dual_axis_review.py`
- LLM 模式：`references/llm_review_schema.md`
- 评分细则：`references/scoring_rubric.md`
