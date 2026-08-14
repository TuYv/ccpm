---
name: adversarial-review
description: Cross-vendor adversarial code review of the current branch. Two different model families (Claude + Codex/GPT) review the diff independently, then try to refute each other's findings; survivors are reported by confidence. Runs from either Claude Code or Codex. Use when the user asks for an adversarial review, a cross-model / second-opinion review, or wants high-confidence findings before merging. Report-only — never auto-applies fixes.
license: MIT
---
# 对抗式代码审查

来自**不同模型家族**的两名审查者——**Claude** 和 **Codex/GPT**——分别独立审查同一个差异，然后各自尝试**反驳**对方的发现。一个发现的置信度取决于它能否经受住这种交叉质询。这消除了单独使用 LLM 审查时的两种失败模式：自我确认（模型不会批评自己的工作）和自信的误报。

## 你是协调者，也是两名审查者之一

此技能可以从 **Claude Code** 或 **Codex** 运行。首先，**确定你属于哪个模型家族**（Claude 或 Codex/GPT）。然后：

- **你**是审查者 #1。你在本会话中使用自己的工具进行**原生**审查。
- **另一个模型家族**是审查者 #2。你通过**子进程 CLI** 调用它进行独立审查：一个全新的进程，不共享上下文——这种独立性正是关键所在。

用于调用“另一个模型”的 CLI：

| 如果你是…… | 通过以下方式调用另一个模型…… |
|-------------|------------------------|
| **Claude**  | `codex exec`（GPT）     |
| **Codex**   | `claude -p`（Claude）   |

流程中的其他一切都是对称的。请相对于**此技能自身的目录**（即此 SKILL.md 所在的位置）解析下文中的 `prompts/` 和 `schemas/` 路径。

## 输入

两个相互独立的可选输入：

- `BASE`——作为差异比较基准的 ref。默认为 `main`。
- `SCOPE`——用于缩小审查范围的 pathspec（例如 `src/basic_memory`）。默认值：无（整个差异）。

二者彼此独立：ref 和 pathspec 不可互换。在预检阶段一次性构建**规范差异命令**，并在下文所有位置复用它——绝不要在各处重新拼写差异命令（之前的问题正是由这种分散且不一致的拼写方式导致的）。将其构建为 **argv 数组**，而不是字符串，这样即使 `$SCOPE` 包含空格或 glob 字符，也能保持完整：

```bash
BASE="${BASE:-main}"
DIFF=(git diff "$BASE...HEAD")          # argv array — never a scalar string
[ -n "$SCOPE" ] && DIFF+=(-- "$SCOPE")  # pathspec stays one argument even with spaces
DIFF_STR=$(printf '%q ' "${DIFF[@]}")   # shell-quoted rendering, for embedding in a prompt
```

要**运行**它，请使用 `"${DIFF[@]}"`（带引号，不进行分词）。要将它作为文本**嵌入**子进程提示词中，请使用 `$DIFF_STR`。

## 预检

0. 将 `SKILL_DIR` 设置为此 SKILL.md 所在的目录。规范位置为 `.agents/skills/adversarial-review`（共享的 agent-skills 存储区）；Claude Code 通过 `.claude/skills/adversarial-review` 符号链接访问它，Codex 则通过自己的技能路径访问。在所有情况下，`prompts/` 和 `schemas/` 子目录都与此文件位于同一级。
1. 确认*另一个*模型的 CLI 位于 PATH 中（如果你是 Claude，则检查 `codex`；如果你是 Codex，则检查 `claude`）。如果缺失，请告知用户审查面板将回退为单模型模式（这会失去跨供应商的优势），并询问是继续还是停止。
2. 运行 `"${DIFF[@]}"`。如果没有输出，请报告“没有相对于 $BASE 的可审查内容”（如果设置了 `$SCOPE`，也要提及它），然后停止。
3. `RUN=$(mktemp -d)`——用于存放另一个模型输出的临时目录。仅临时使用，绝不提交。不保留任何持久化产物，也不创建状态文件。

## 阶段 0 — 确定性关卡（在模型之前）

模型在统计意义上无法识别否定表达（“绝不要做 X”）。应使用工具而非提示词来强制执行机械式的内部规则，
并将命中项视为高置信度事实（与模型发现的问题分开报告）：

- 如果差异涉及 `src/`，运行 `just lint` 和 `just typecheck`。
- 在差异中 grep 可捕获的内部规则违规项：带默认值的 `getattr(.*,.*,`、裸
  `except:` / `except Exception: pass`、函数作用域内的导入。

## 阶段 1 — 独立审查（你与另一个模型并行执行）

两位审查者接收相同的任务说明：`prompts/review.md` + 仓库的 `CLAUDE.md` 内部规则，
审查来自 `"${DIFF[@]}"` 的差异。两者都输出符合 `schemas/findings.schema.json` 的发现。

**你的原生审查：**以你自己的身份，按照 `prompts/review.md` 进行审查。将你的发现
保留为该 JSON 结构。

**另一个模型的审查** — 从仓库根目录运行与你匹配的那一段：

始终将 `codex` 的 stdin 重定向自 `/dev/null` — 如果 stdin 是管道（例如调用被置于
后台运行），`codex exec` 会阻塞在“Reading additional input from stdin...”并失败。

```bash
# You are Claude → run Codex:
codex exec -s read-only \
  --output-schema "$SKILL_DIR/schemas/findings.schema.json" \
  -o "$RUN/other_findings.json" \
  "$(cat "$SKILL_DIR/prompts/review.md")

Review the diff: $DIFF_STR" </dev/null

# You are Codex → run Claude (read-only via plan mode; parse the JSON block it returns):
claude -p --permission-mode plan --output-format json \
  "$(cat "$SKILL_DIR/prompts/review.md")

Review the diff: $DIFF_STR
Return ONLY a JSON object matching this schema:
$(cat "$SKILL_DIR/schemas/findings.schema.json")" </dev/null > "$RUN/other_raw.json"
# claude --output-format json output shape varies by CLI version: it may be a JSON ARRAY
# of event objects, OR a single result object. Normalize before reading: if it's an array,
# take the element with type=='result'; otherwise use the object as-is. Then read its
# .result string, strip the ```json fence if present, and parse that.
# (Verified empirically: the CLI in this environment emits the array form.)
```

> Codex 编排时的运行时注意事项：`claude -p` 需要网络访问，而 Codex 的
> 默认沙箱会阻止网络访问。请从项目受信任且允许网络访问的 Codex 会话中运行它
> （或在出现提示时批准 `claude` 调用）。保持 Codex 自身的沙箱开启 — 不要仅仅
> 为了访问网络而绕过它。

为每个发现标注其来源（`claude` / `codex`）。

## 阶段 2 — 交叉反驳

每个模型都按照 `prompts/refute.md` 尝试反驳*另一个模型的*发现
（裁决符合 `schemas/verdicts.schema.json`）。

- **你**原生反驳另一个模型的发现。
- **另一个模型**反驳*你的*发现 — 以相同方式再次调用它（将
  `prompts/review.md` 替换为 `prompts/refute.md`，附加你的发现 JSON **以及 `$DIFF_STR`**，
  使其依据正确的基准和范围进行判断；对于 Codex，使用
  `--output-schema "$SKILL_DIR/schemas/verdicts.schema.json"`）。

通过 `id` 将裁决与发现匹配。

## 阶段 3 — 汇总并报告（不自动修复）

合并并去重（同一文件 + 行范围重叠 + 根本原因相同 = 一个发现），根据来源确定
置信度：

- **高** — 两个模型各自独立提出了该问题，或者一个模型提出、另一个模型确认了该问题。
- **中** — 一个模型提出了该问题；另一个模型无法反驳，但也未独立发现该问题。
- **低 / 有争议** — 一个模型提出了该问题，而另一个模型**反驳**了该问题。保留该问题，展示双方观点，
  由人工判断。绝不能悄悄删除有争议的发现。
- 确定性门禁命中的问题作为事实报告，与模型审议结果分开列出。

按 `severity × confidence` 排序。提供一个紧凑的表格：`severity | confidence | file:line
| claim | found-by / upheld-or-refuted-by`。展开高置信度的发现，说明 `why` 以及
任何建议的修复方案。

最后询问要修复哪些发现（如果有）。**在用户选择之前，不要编辑代码。**
模型之间达成一致并不代表结果正确——你的职责是提供一份经过交叉审查并按优先级排序的
问题列表，而不是宣称该分支没有问题。

## 有意不做的事项

- 不循环至两个模型达成一致（模型会因不再发言而趋于一致，而不是因为结论正确）。
- 不保留产物 / 状态机——临时目录使用后即丢弃。
- 不自动应用修复。