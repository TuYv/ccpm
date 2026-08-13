---
name: wiki-fold
description: "Rollup of wiki log entries into meta-pages. Reads the last 2^k entries from wiki/log.md, writes a structurally-idempotent fold page to wiki/folds/ that links back to children. Extractive summarization (no invention). Dry-run by default, stdout-only; commit mode writes and accepts that the PostToolUse hook auto-commits. Triggers on: fold the log, run a fold, run wiki-fold, log rollup, roll up log entries."
---
# wiki-fold：提取式日志汇总

实现 [[DragonScale Memory]] 中机制 1 的一个有界子集：对原始 `wiki/log.md` 条目进行扁平折叠。折叠的折叠（分层级别堆叠）**不在此技能的范围内**；请参阅下文的“范围边界”。

折叠具有**加法性**：子日志条目及其引用的页面绝不会被修改、移动或删除。折叠具有**提取性**：输出中的每项结果和主题都必须可追溯到特定的子日志条目。不得虚构事实，不得进行超出子条目支持范围的综合。

---

## 范围边界（明确）

此技能**不**实现：
- 折叠的折叠／分层级别堆叠（DragonScale 规范要求此功能；推迟到未来的技能中实现）。
- 自动触发（在阶段 1 中，折叠始终由人工调用）。
- 语义平铺去重（机制 3；由单独的技能实现）。

它**确实**实现：
- 以选定的批次指数 `k` 对原始 log.md 条目进行扁平折叠。
- 通过确定性折叠 ID 实现结构幂等性。
- 带计数检查的提取式摘要。

在 frontmatter 中引用级别时，请使用 `batch_exponent: k`（而不是 `level: k`），因为此技能不会生成分层级别。

---

## 模式

| 模式 | 是否写入？ | 调用方式 |
|---|---|---|
| **dry-run（默认）** | **不调用 Write 工具。** 仅通过 Bash `cat`/`heredoc` 将折叠内容输出到 stdout。 | `fold the log, dry-run k=3` |
| **commit** | 使用 Write/Edit 工具。每次 Write 都会触发仓库的 PostToolUse 钩子，该钩子会自动提交 wiki 更改。接受这一行为。先编写完整内容，然后依次执行写入。 | `fold the log, commit k=3`（仅在干净的 dry-run 之后） |

**为何 dry-run 仅使用 stdout**：仓库的 `hooks/hooks.json` PostToolUse 钩子会在任何 `Write|Edit` 操作时触发，并运行 `git add wiki/ .raw/`。写入 `/tmp` 不会暂存 /tmp，但仍会触发该钩子，而该钩子会以通用提交消息提交 wiki 下的*任何待处理更改*。dry-run 必须不留下任何残留。Bash stdout 不会触发该钩子。

---

## 并发（v1.7+）

在 commit 模式下写入折叠页面之前，必须先执行 `wiki-lock acquire`：

```bash
FOLD_PATH="wiki/folds/${FOLD_ID}.md"
bash scripts/wiki-lock.sh acquire "$FOLD_PATH" || {
  echo "FAIL: another writer holds $FOLD_PATH; aborting fold."; exit 75
}
# … write the fold via Write/Edit (which fires the PostToolUse hook) …
bash scripts/wiki-lock.sh release "$FOLD_PATH"
```

折叠页面使用确定性命名（`fold-k{K}-from-{DATE}-to-{DATE}-n{COUNT}.md`），因此两个具有相同参数的并行折叠会以相同路径为目标。如果没有锁，它们可能会互相覆盖对方的输出。此技能内部的重复检测检查（已在下文记录）在技能层面处理“折叠已存在”的情况；锁则在操作系统层面处理写入进行中的竞态。

dry-run 模式不会获取锁（因为不会发生写入）。

有关完整的锁语义，请参阅 `skills/wiki-ingest/SKILL.md` 中的 §Concurrency。

---

## 确定性折叠 ID

每个折叠都有一个根据其输入派生的 ID：

```
fold-k{K}-from-{EARLIEST-DATE}-to-{LATEST-DATE}-n{COUNT}
```

示例：`fold-k3-from-2026-04-10-to-2026-04-23-n8`。

提交模式下的文件名为 `wiki/folds/{FOLD-ID}.md`。文件名中不包含创建日期。标题中不包含时间戳。

**重复检测（必需）**：在生成任何输出之前，检查 `wiki/folds/{FOLD-ID}.md` 是否已存在。如果存在，则报告“Fold 已存在于 wiki/folds/{FOLD-ID}.md。使用 --force 覆盖，或选择其他范围。”并停止。这是空操作幂等性保证；不保证内容按字节完全相同（LLM 生成的文字会有变化），但文件名和范围是一致的。

---

## 参数

- `k`（默认值为 4）：批次指数。批次大小 = `2^k`。典型值：k=3（8）、k=4（16）、k=5（32）。
- `range`（可选）：显式条目范围 `entries 1-16`。优先于 k。
- `--force`：覆盖具有相同 ID 的现有 Fold。默认不覆盖。
- `--commit`：写入 wiki/。不使用该参数时，仅以试运行方式输出到 stdout。

如果日志条目少于 `2^k`，报告缺少的数量并停止。不要在不作说明的情况下折叠不完整的批次。

---

## 流程

### 1. 解析日志条目

```
grep -n "^## \[" wiki/log.md | head -{2^k}
```

记录每个条目的行号、日期、操作、标题，以及其后直到下一个 `## [` 或该节末尾的项目符号行。

### 2. 提取子页面标识符

从每个条目的项目符号列表中提取：
- `Location: wiki/path/to/page.md`（主页面）
- 行内 `[[Wikilinks]]`
- `Pages created:` 和 `Pages updated:` 列表

构建结构化的子条目列表：
```yaml
children:
  - date: "2026-04-23"
    op: "save"
    title: "DragonScale Memory v0.2 — post-adversarial-review"
    page: "[[DragonScale Memory]]"
  - ...
```

每个日志条目对应一条记录。不要按页面去重：如果两个条目都指向 `[[DragonScale Memory]]`，则两条记录都要保留，并可通过日期和标题加以区分。

### 3. 读取引用的页面（有界）

仅阅读那些内容尚未完整包含在日志条目项目符号中的页面。预算：读取 0-10 个页面。硬性上限：15 个。如果某个条目引用的页面缺失，记录 `page_missing: true` 并继续。

### 4. 带数量检查的抽取式摘要

按照 `references/fold-template.md` 编写 Fold 正文。**规则**：

- **仅限抽取。** 每条成果项目和主题项目都必须引用特定的子条目（例如，`(from 2026-04-14 session)`）或该条目中的引文。不要引入子条目中不存在的事件、数量或解释。
- **日志条目是主要来源。** 如果日志条目的项目符号与引用的元页面对某项事实（例如某个数量）的描述不一致，优先采用日志条目的项目符号，并将不一致标记为“来源不一致：日志中为 X，元页面中为 Y。”
- **数量检查。** 如果写到“N 个概念页面”或“更新了 M 个仓库”，请在源条目中 grep 该数字并进行核实。数字不一致会阻止试运行。
- **未经指明不得跨条目合并。** 跨越多个条目的主题必须在行内逐一指明每个相关条目。
- **不确定性是一项特性。** 如果某个条目含义模糊，请注明“来源含义模糊：[[Entry]]”，而不是选择其中一种解释。

### 5. 输出前自检

在打印输出之前，请验证：
- `children:` frontmatter 中的每个子项都恰好在 Child Entries 表中出现一次。
- 表中的每个条目都出现在 `children:` frontmatter 中。
- Key Outcomes 中的每个数值声明都可以通过 grep 子条目进行验证。
- fold ID 是确定性的，并且文件尚不存在（或者设置了 `--force`）。

如果任何检查失败，则中止操作并报告具体的失败原因。

### 6. 输出

**试运行**：使用 Bash `cat <<'EOF' ... EOF` 输出到 stdout。不要使用 Write。打印 fold ID，并用一行概述提交步骤将执行的操作。

**提交**（仅在用户说出 "commit the fold" 后）：
1. 使用 `Write` 将 fold 页面写入 `wiki/folds/{FOLD-ID}.md`。（PostToolUse hook 将自动提交此更改。）
2. 使用 `Edit` 编辑 `wiki/index.md`，在 `## Folds` 章节下添加 fold 链接（如果缺少该章节，则创建它）。（Hook 会自动提交。）
3. 使用 `Edit` 编辑 `wiki/log.md`，在文件开头添加一个条目：
   ```
   ## [YYYY-MM-DD] fold | batch-exponent-k{K} rollup of N entries
   - Location: wiki/folds/{FOLD-ID}.md
   - Range: {EARLIEST-DATE} to {LATEST-DATE}
   - Children: N log entries
   ```
   （Hook 会自动提交。）

这将产生三个自动提交。用户会在 git 日志中看到三个独立的 `wiki: auto-commit` 条目。这是预期行为；不要尝试禁用该 hook。

---

## 输出模式

有关规范的 frontmatter 和正文布局，请参阅 `references/fold-template.md`。

---

## 不变量

1. **结构幂等性**：相同范围 + 相同 k → 相同 fold ID → 重复检测可防止重复写入。LLM 生成的文字可能在不同运行之间有所变化；但*位置和范围*是固定的。
2. **仅追加**：绝不修改子项。
3. **读取有界**：每个 fold 读取 0-15 个子页面。
4. **抽取式**：不虚构任何事实。强制执行计数检查。
5. **禁止链式调用**：wiki-fold 不调用 wiki-lint、wiki-ingest、autoresearch 或 save。

---

## 禁止事项

- 试运行期间不要使用 Write/Edit。只能输出到 Bash stdout。
- 不要在 fold 文件名或标题中包含当前日期。使用子条目的日期范围。
- 不要根据页面标题静默去重子项。每个日志条目对应一条记录。
- 不要在未指明由哪些条目共同促成的情况下，撰写跨条目的“涌现主题”。
- 不要声称具有逐字节完全一致的幂等性。实际保证的是结构幂等性。
- 不要禁用或绕过 PostToolUse 自动提交 hook。
- 不要更新 `wiki/hot.md`。其所有权仍归 save/ingest skills。

---

## 回退

已提交 fold 的回退操作（三个提交，按以下顺序撤销）：
1. 删除 log.md 中的 fold 条目。
2. 删除 index.md 中的条目。
3. 删除 fold 页面文件。

或者：对这三个自动提交执行 `git revert`。无论采用哪种方式，子页面都不会受到影响。

---

## 试运行序列示例

用户："fold the log, dry-run k=3"

1. 解析 `wiki/log.md` 顶部的 8 个条目。
2. 构建结构化子项列表（8 条记录）。
3. 根据需要读取 0-10 个引用页面。
4. 生成 fold ID：`fold-k3-from-2026-04-10-to-2026-04-23-n8`。
5. 检查 `wiki/folds/fold-k3-from-2026-04-10-to-2026-04-23-n8.md` 是否不存在。
6. 按照模板编写 fold 正文。
7. 运行自检（frontmatter/表格一致性、计数验证）。
8. 通过 `cat <<'EOF' ... EOF` 输出到 stdout。
9. 报告："Dry-run complete. Fold ID: {FOLD-ID}. To commit: 'commit the fold'."

---

## 如何思考（10 原则映射）

使用此技能时，请应用 10 原则循环。规范框架请参阅 [`skills/think/SKILL.md`](../think/SKILL.md)。

| # | 原则 | 在此处的应用 |
|---|-----------|-------------------|
| 1 | 观察（外部） | 完整阅读最后 2^k 条日志记录。略读会破坏抽取式摘要的效果。 |
| 2 | 观察（内部） | 我是否想要综合出超出子条目所支持内容的信息？仅限抽取是约束性规则。 |
| 3 | 倾听 | 哪些主题从子条目中自然浮现？不要从子条目之外强加主题。 |
| 4 | 思考 | 仅限抽取。每项成果都必须能追溯到特定的子条目。最后进行数量检查。 |
| 5 | 连接（横向） | 跨条目的模式正是附加价值所在。单条目视角会遗漏这些模式。 |
| 6 | 连接（系统） | DragonScale 机制 1 + wiki-lock + 地址分配器。折叠是记忆架构的一部分。 |
| 7 | 感受 | 优秀的折叠能让未来的我在 5 分钟内浏览完一年的工作。以这种压缩程度为目标。 |
| 8 | 接受 | 先进行试运行。只有在自检通过后才提交。遵守有界范围约束（目前不进行折叠之折叠）。 |
| 9 | 创造 | 在 `wiki/folds/<fold-id>.md` 创建折叠页面，并链接到所有子条目。 |
| 10 | 成长 | 折叠之折叠（分层级别堆叠）属于 v_next 的范围——遇到时记录下来，不要擅自加入。 |