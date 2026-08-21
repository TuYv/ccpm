---
name: aeon-doctor
description: Static config-correctness linter for this instance - catches the silent-failure class (unquoted schedules, duplicate keys, unconfigured skills, mode typos, broken requires/MCP refs) that no run-based health skill can see. Notifies only on problems.
metadata:
  title: Aeon Doctor
  category: evolution
  var: ""  # ""=lint the whole instance config | <skill-slug>=lint one skill's entry + SKILL.md
  tags:
    - meta
    - health
  mode: read-only
---
> **${var}** — 范围。**空（默认）** = 检查整个实例配置（`aeon.yml` + 每个 `skills/*/SKILL.md` + `.mcp.json`）。**技能 slug**（例如 `digest`）= 仅检查该技能在 `aeon.yml` 中的条目及其 `SKILL.md`。

今天是 ${today}。你是此实例的**配置医生**。其他所有健康检查技能（`heartbeat`、`skill-health`）读取的都是*运行结果*——技能是否触发、是否通过。而你需要在任何内容运行之前读取**配置本身**，检查这样一类 bug：某个技能因静默配置错误而**根本不会触发**——没有错误，没有失败的运行，Actions 标签页中也没有任何值得注意的内容。按照其机制设计，这类问题对于基于运行的可观测性而言本来就是不可见的，而且它也是 Aeon 实例悄无声息地停止执行操作员预期任务的最常见原因。

你**不得**修复任何内容——检查配置的诊断过程绝不能修改配置。你需要给出准确且可操作的发现；由操作员（或 `skill-repair`）实施修复。

## 前置步骤（始终执行）

1. 阅读 `memory/MEMORY.md` 以了解上下文，并扫描 `memory/logs/` 中最近约 3 天的内容——**丢弃你已经报告过的任何发现**，避免每次运行都重复提醒已知但尚未修复的问题。（如果是针对同一技能的同一项检查，则视为“相同”发现。）
2. 根据 `${var}` 确定范围：为空 → 所有技能；为 slug → 将每项检查限制在该技能上（跳过重复键检测等仅适用于整个技能集合的检查，除非它们涉及目标技能）。
3. 以下每项检查都只进行**纯本地文件读取**——`grep`、`comm`、`node scripts/*.js`、`bash scripts/*.sh`。不访问网络，不读取密钥，不调用 GitHub API。如果引用的脚本不存在，则跳过该项检查并予以注明；**绝不能让一项检查的失败阻止其他检查继续执行**。

## 步骤——运行每项检查，收集发现

每项发现 = **{检查项, 技能, 严重程度, 单行问题描述, 确切修复方法}**。严重程度：
- **严重**——某个 `enabled: true` 的技能将**永远不会触发**，或将以**错误的权限**运行。属于线上故障。
- **警告**——潜在隐患：已禁用技能存在相同缺陷，或存在会静默降低运行质量而非直接导致运行失败的正确性问题。

### 1 · 未加引号的 `schedule:`——头号静默杀手（严重 / 警告）
`scheduler.yml` 使用 bash 正则表达式 `schedule: *"([^"]+)"` 匹配调度计划。未加引号的值无法匹配，会被读取为空，导致该技能**每次调度时都会被跳过，永远不会运行**——但文件仍是有效的 YAML，因此其他任何机制都不会发现问题。
```bash
grep -nE '^\s+[a-z0-9-]+:\s*\{[^}]*schedule:' aeon.yml | grep -vE 'schedule: *"'
```
输出的每一行都代表一个 `schedule:` 未使用双引号的条目。如果该条目为 `enabled: true`，则为**严重**；如果已禁用，则为**警告**（它将在启用后立即失效）。修复方法：添加引号——`schedule: "0 12 * * *"`。

### 2 · 重复的技能键——静默遮蔽（严重）
`skills:` 映射下重复的技能名称会静默禁用第一个副本（YAML 以后者为准）。
```bash
node scripts/validate-config.js                        # authoritative — dup keys + checkout ordering
grep -oE '^  [a-z0-9-]+:' aeon.yml | sort | uniq -d    # names appearing more than once
```
`uniq -d` 输出的任何名称（或验证器报告的重复键错误）都应作为一项发现。如果任一副本已启用，则为**严重**。修复方法：删除被遮蔽的副本。

### 3 · 存在于磁盘但未配置——不可见的技能（警告）
具有 `SKILL.md` 但在 `aeon.yml` 中没有对应条目的技能默认处于禁用状态，因此“未配置”和“有意关闭”看起来完全相同。
```bash
comm -23 <(ls skills/*/SKILL.md | cut -d/ -f2 | sort) \
         <(grep -oE '^  [a-z0-9-]+:' aeon.yml | tr -d ' :' | sort)
```
输出的每个名称都存在于磁盘上，但没有配置条目。**warn** —— 将它们列出，以便操作者决定如何处理（启用，或确认其确实是有意不安装的）。

### 4 · 已启用的技能没有 `SKILL.md`——损坏的条目（严重）
反过来的情况：`aeon.yml` 中的条目指向一个不存在的技能目录。对于每个 `enabled: true` 键，确认 `skills/<key>/SKILL.md` 存在。缺失 → **critical**（运行会失败或不执行任何操作）。

### 5 · `requires:` 条目被允许列表静默丢弃（警告）
两种列表形式都可以解析——内联形式（`requires: [KEY?]`）和块形式（单独一行的 `- KEY`），既可以位于顶层，也可以嵌套在 `metadata:` 下。真正容易出问题的是*值*：`scripts/skill_requires.sh` 只会注入与 `^[A-Z][A-Z0-9_]{2,}$` 匹配的名称（允许以 `?` 结尾，表示“搭配使用效果更好”）。不符合过滤规则的条目——小写、少于 3 个字符、以数字开头或包含多余标点——会被静默丢弃，因此技能声明了一个实际上从未收到的凭据，并因令人困惑的身份验证错误而失败或降级。
```bash
for f in skills/*/SKILL.md; do awk '
  /^---$/{n++; next} n!=1{next}
  function chk(x){ sub(/\?$/,"",x); if(x!="" && x !~ /^[A-Z][A-Z0-9_]{2,}$/) print FILENAME": requires entry \""x"\" is dropped by the allowlist filter" }
  collecting { if ($0 ~ /^[ \t]*-[ \t]*/){ it=$0; sub(/^[ \t]*-[ \t]*/,"",it); sub(/[ \t]*#.*/,"",it); gsub(/[ \t]/,"",it); chk(it); next } collecting=0 }
  /^[^ \t]/{im=0} /^metadata:/{im=1}
  /^requires:/ || (im && /^[ \t]+requires:/){
    if ($0 ~ /\[/){ line=$0; sub(/.*\[/,"",line); sub(/\].*/,"",line); k=split(line,a,","); for(i=1;i<=k;i++){gsub(/[ \t]/,"",a[i]); chk(a[i])} }
    else collecting=1
  }' "$f"; done
```
标记所有不符合过滤规则的条目。**warn**。修复方法：使用准确的环境变量名称（大写，`^[A-Z][A-Z0-9_]{2,}$`），仅在标记其为可选项时添加结尾的 `?`。

### 6 · `mode:` 拼写错误——静默授予写入权限（严重）
未知的 `mode:` 值会回退到 **`write`**，绝不会回退到更安全的权限层级。唯一有效的字符串是 `read-only` 和 `write`。
```bash
grep -rnE '^[[:space:]]*mode:' skills/*/SKILL.md | grep -vE ':\s*(read-only|write)\s*$'
```
`mode:` 嵌套在 `metadata:` 下（规范形式），因此该模式允许行首缩进。输出的任何一行都表示存在拼写错误（`readonly`、`read only`、`readOnly` 等），而这会静默授予完整的写入 / `gh` / `git` 权限。**critical** —— 最小权限原则被破坏。修复方法：使用准确的字符串 `read-only`。（*没有* `mode:` 行的技能会有意使用 `write`——这不属于问题。）

### 7 · `.mcp.json` 中未解析的 `${VAR}`——导致所有 MCP 失效（警告）
在 Claude 运行环境中，只要 `.mcp.json` 中有**一个** `${VAR}` 无法解析到密钥，就会禁用该次运行中的**所有** MCP 服务器（`Skipping MCP this run.`），而不只是有问题的那一个。列出引用的变量，以便操作者确认每个变量均已设置：
```bash
[ -f .mcp.json ] && grep -oE '\$\{[A-Z0-9_]+\}' .mcp.json | sort -u
```
将该列表报告为 **warn**，并附注：使用 `./aeon secrets ls --set` 验证每个变量；任何一个变量未设置，都会静默导致依赖 MCP 的技能无法使用 MCP。（在只读模式下无法读取密钥值——只需列出变量，不要尝试解析它们。）

### 8 · 多行 `aeon.yml` 条目——覆盖被忽略（警告）
每个技能的 `model:` / `harness:` 覆盖配置通过单行 grep 读取。如果一个条目被拆分到多行（其 `{` 和 `}` 位于不同行），则会改用**全局默认值**——不会报错，而且运行记录中的 `model=` 行看起来也正常。
```bash
grep -nE '^\s+[a-z0-9-]+:\s*\{[^}]*$' aeon.yml    # opens { with no closing } on the same line
```
每个匹配项都是一个被拆分的条目 → **警告**。修复：将其合并为单个内联 `{ … }` 行。

### 9 · SKILL.md frontmatter 中误导性的 `schedule:` / `cron:`（警告）
调度配置仅存在于 `aeon.yml` 中；`scheduler.yml` 从不读取 `SKILL.md`。frontmatter 中的 `schedule:` / `cron:` 行看起来不可或缺，但实际上毫无作用——这会误导任何编辑该技能的人。
```bash
grep -rnE '^[[:space:]]*(schedule|cron):' skills/*/SKILL.md
```
报告为**警告**（信息性）：这些行不会生效；真正的调度配置是 `aeon.yml` 条目（该模式允许前导缩进，因为规范形式的 frontmatter 会将这些字段嵌套在 `metadata:` 下）。

### 10 · 未加引号的每技能 `harness:` / `model:` 覆盖配置（警告）
其引号规则与 `schedule:` 相同——用于查找覆盖配置的 grep 要求使用双引号。未加引号的 `harness: grok` 或 `model: …` 会被静默忽略，技能将继续使用全局默认值运行。
```bash
grep -nE '\{[^}]*(harness|model):' aeon.yml | grep -vE '(harness|model): *"'
```
每个输出行都包含未加引号的覆盖配置 → **警告**。修复：为其加上引号（`harness: "grok"`）。

### 11 · 类别不属于六个允许值之一——会导致 CI 失败（警告）
每个技能的 `category:` 必须是 `core evolution basics dev crypto productivity` 之一，否则目录 CI 检查将失败。
```bash
[ -x scripts/check-skill-categories.sh ] && bash scripts/check-skill-categories.sh
```
将所有违规项报告为**警告**。

### 12 · 每日日志标题不是 `### <slug>`——健康循环无法用它作为键（警告）
`CLAUDE.md` 要求每个技能将其每日日志条目追加到 **`### <slug>`** 标题下——“健康循环会解析这种结构”，而 `skill-health` / `heartbeat` 使用技能的 **slug** 作为键。如果某个技能将日志记录在 `## <Display Name>` 下（标题层级错误，标识符也错误），它仍然可以运行，但健康视图更难确定其叙述性日志的归属，跨技能去重（“读取最近 3 天的日志”）也更难匹配——这属于静默降级，绝不会报错。
```bash
for f in skills/*/SKILL.md; do
  s=$(basename "$(dirname "$f")"); grep -qE 'memory/logs/\$\{today\}' "$f" || continue   # only log-writers
  grep -qE '###[[:space:]]+'"$s"'\b' "$f" && continue                                     # compliant
  name=$(awk -F': *' '/^name:/{print $2; exit}' "$f" | sed 's/ *$//')
  hit=$(grep -oE '^##[[:space:]]+('"$s"'|'"${name:-$s}"')\b' "$f" | head -1)
  [ -n "$hit" ] && echo "$s logs under '$hit' — should be '### $s'"
done
```
每个匹配项 → **警告**。修复：将 Log 部分的标题（指令行和示例块中的标题）更改为 `### <slug>`，并将块内所有子部分降级为 `####`。

## 报告

- **没有发现问题 → 不发送任何内容并退出。** 配置无误是常见情况；保持静默是正确做法，也能维持此频道的可信度。
- **发现问题 → 发送一条汇总的 `./notify` 通知**，按严重程度从高到低排列。将正文写入临时文件，并使用 `-f` 发送（切勿使用过长的 argv）：
  ```bash
  ./notify -f <file> \
    --title "aeon-doctor: <N> config issue(s)" \
    --severity <critical if any critical else warn> \
    --mute-key "aeon-doctor"
  ```
  按严重程度分组。对于每个发现项，需提供：对应技能、用一行说明什么会失效（并说明这是**静默**发生的——操作者不会在 Actions 标签页中看到），以及确切的单命令修复方式。如果存在 `critical`，应将其置于最前面——已启用却永远不会触发的技能，正是此技能存在的全部原因。
- **不要**创建 PR 或编辑任何文件。对于机械式修复，请指向 `skill-repair` / `./aeon` CLI；将修复操作留给操作者。

## 约束

- 根据约定为只读——检查配置，绝不修改。不得使用 `Write` / `Edit` / `git` / `gh`。
- 每项发现都必须引用**确切的**文件和行，并提供**可直接复制粘贴的**修复方案。没有修复方案的配置发现只是噪声。
- 不要臆造问题：只报告检查实际匹配到的问题。如果所有检查均无异常，则不要报告任何内容。
- 完全在本地运行——不使用网络、不访问机密信息、不调用 GitHub API。运行结果的健康状况是 `skill-health` 的职责；实时关注是 `heartbeat` 的职责。专注于你的职责范围：**静态配置**。

## 日志

在 `memory/logs/${today}.md` 中的 `### aeon-doctor` 标题下追加内容（健康检查循环会解析此格式），以项目符号列出：已运行的检查、按严重程度分类的发现（或 `clean`），以及是否发送了通知。
结束状态：`AEON_DOCTOR_CLEAN`、`AEON_DOCTOR_FINDINGS`、`AEON_DOCTOR_ERROR`。