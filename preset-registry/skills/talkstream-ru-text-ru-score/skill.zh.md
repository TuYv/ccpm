---
name: ru-score
description: >
  Score Russian text 0.0–10.0 across five dimensions: typography, clean language, grammar,
  structure, precision for the reader. Triggers: оцени текст, ru-score, оценка качества
  текста, насколько хорош текст, балл за текст. Use when the user wants a number rather than
  a list of findings. Never edits a file.
allowed-tools: Read, Grep, Glob
disallowed-tools: Write, Edit, NotebookEdit, Bash, PowerShell, Monitor
context: fork
user-invocable: true
---
# 俄语文本质量评分

使用 ru-text 评分标准对 $ARGUMENTS 中提供的文本（若无参数，则对最近一次输出的俄语文本）进行评分。

## 操作步骤

## 参考文件的位置

本技能读取随 **ru-text** 技能一同附带的语料库，该技能与本技能一同安装。先定位一次该文件夹，然后从中读取指定的文件：

- 查找一个名为 `references` 的目录，其父目录名为 `ru-text`，且其中包含 `info-style.md`。下面提到的每个文件都位于该文件夹中。
- **使用文件工具搜索，绝不使用 shell。** 用 `Glob` 匹配类似 `**/ru-text/references/info-style.md` 的模式，或使用宿主环境提供的任何文件搜索功能，然后用 `Read` 读取。本命令用不着命令行：`Bash` 在其 `disallowed-tools` 列表中，而且即使宿主环境未实现该字段也会拒绝它——于 12.08.2026 在 Claude Cowork 中实测：开头的 `ls` 返回了红色的 «Permission to use Bash has been denied»，而搜索随后照样找到了语料库。这次调用一无所获，却让读者受了一惊。
- 在 Claude Code 中还可以直接访问插件根目录，从而省去搜索。
- **不要猜测路径。** 如果找不到该文件夹，请如实说明并停止——基于记住的规则而非语料库运行的检查并不是本命令，而把一个报告成另一个，正是整个产品要防止的失败。

1. **加载评分标准** — 阅读 `scoring.md`，其中包含带锚点的完整评分标准。

2. **确定领域** — 判断文本属于 UI/界面、商务邮件、文章还是通用文本：
   - UI 文本 → 还需为「读者精确度」维度加载 `ux-writing.md`
   - 商务邮件 → 还需为「读者精确度」维度加载 `business-writing.md`
   - 通用 → 仅使用 `info-style.md`

3. **分别评估每个维度** — 按以下顺序评分：
   - **T — Типографика**（权重 0.15）：引号、破折号、空格、特殊字符，依据 `typography.md`
   - **Ч — Чистота языка**（权重 0.25）：停用词、官僚式语言、陈词滥调、被动语态，依据 `info-style.md` + `anti-patterns.md`
   - **Г — Грамотность**（权重 0.20）：标点、一致关系、同义反复，依据 `editorial-grammar.md` + `editorial-punctuation.md`
   - **С — Структура**（权重 0.20）：逻辑连贯、段落、过渡、标题的使用，依据 `info-style.md` 的结构章节 + `addenda.md`
   - **Ц — Точность для читателя**（权重 0.20）：事实、证据、读者收益、可操作性，依据领域规则

4. **对每个维度** — 使用 scoring.md 中的评分锚点给出分数（0.0–10.0）。列出 1–3 个具体问题，并引用有问题的文本片段。

5. **应用非补偿性规则：**
   - 任一维度 < 3.0 → 总分上限为 5.0
   - 排版 < 4.0 → 总分上限为 7.0
   - 语法 < 4.0 → 总分上限为 7.0
   - 多个条件同时触发时，采用最严格的上限

6. **计算综合得分：**
   ```
   S = round₁(T × 0.15 + Ч × 0.25 + Г × 0.20 + С × 0.20 + Ц × 0.20)
   ```

7. **短文本警告** — 如果文本不足 50 个词，需在前面附上可靠性说明。

## 分数标签

| 分数 | 标签 |
|---|---|
| 9.0–10.0 | Эталонный |
| 7.0–8.9 | Хороший |
| 5.0–6.9 | Средний |
| 3.0–4.9 | Слабый |
| 0.0–2.9 | Критический |

## 输出格式

**只读——请勿修改源文件。** `ru-score` 报告分数与问题；它不得写入、编辑或覆盖被分析的文件。

在 Claude Code 中，这一点由 `disallowed-tools` 加以强化，该机制会在命令处于活动状态时移除列出的工具——已在 2.1.220 上验证。该列表移除了直接的文件写入工具 `Write`、`Edit` 和 `NotebookEdit`，以及我们识别并测试过的命令执行工具：`Bash`、`PowerShell` 和 `Monitor`。它列出的是我们已封堵的路径，而非存在的所有路径。`allowed-tools` 用于预先批准工具；它并不限制工具。

四点限制，在此明说。已连接的 MCP 服务器可能会暴露按工具拒绝列表所无法知晓的写入工具。某个
