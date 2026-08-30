---
name: claude-code-hooks
description: >-
  How to write, test, register, and debug Claude Code hooks — PreToolUse /
  PostToolUse / SessionStart / Stop Bash guards that enforce a rule the model
  would otherwise talk itself past. Use whenever the user wants to create a
  hook, block/intercept a tool call, turn a repeatedly-violated rule into a
  hard gate, add a guard rail, debug a hook that misfires or "poisons the
  session", register a hook across profiles, or mentions hooks /
  PreToolUse / Stop hook / 拦截 / 守卫 / 钩子 / 拦下. Bakes in the hard-won
  pitfalls: UserPromptSubmit only ever sees user input, never Claude's own
  text — a rule about Claude's own output belongs on Stop instead;
  token-level shlex matching (never awk splitting); bash -n + real-JSON
  end-to-end testing BEFORE registering (a corrupted PreToolUse hook poisons
  every Bash call); SSOT + symlink so a ~/.claude reinstall can't lose it;
  multi-profile convergence; and human-confirmation release gates. Reach for
  this even for "make it stop doing X" — a durable stop is a hook, not a
  reminder.
---
# Claude Code Hooks

Claude Code 会在工具调用边界触发 **hooks**。hook 是一个从 stdin 接收 JSON 事件的 shell 命令；对于阻塞型 hook，它通过 **退出码** 决定工具调用是否继续。这是唯一能够*从结构上*阻止某种行为的机制——CLAUDE.md 中的文字规则只是建议，可能会被完成驱动覆盖；而 hook 是一道墙。

## 什么时候应该使用 hook（以及什么时候不该使用）

当**某条规则即使已经写下来，却仍然不断被违反**时，就应当编写 hook。判断信号是：你添加了文字规则，规则表述清晰，但相关行为仍然再次发生——因为在采取行动的那一刻，注意力 100% 集中在“把事情做完”上，提醒就失效了。这种重复发生就是信号：应将规则从文字（建议）转移到 hook（强制执行）。治理规则经验法则：*Tier-0 不可逆操作 + 只有文字规则、没有 hook → 它应该成为 hook。*
（这里的 **Tier-0** = 其造成的损害无法在会话内部撤销的操作：销毁未提交的工作、将机密推送到远程端、删除文件、向外发布某些内容。判断标准是可逆性，而不是严重程度。）

以下情况**不要急于使用 hook**：规则实际上从未重复发生（不要为假设性的错误预先构建防护——没有经过验证的收益，却要付出成本）；或者所谓的“规则”属于没有机械特征的判断（hook 只能匹配 token/模式，无法判断设计是否良好）。

如果症状是“它一直在审查 / 等待 / 重试”，不要假设答案是再加一个 hook。先完成规则 7 中的 **Loop Contract**，并阅读[pitfall #36](references/hook_pitfalls.md#36-a-self-applied-review-rule-can-loop-without-any-hook)。循环可能完全是由 agent 反复应用一条文字规则造成的。

## Hook 类型及退出码的含义

| Type | Fires | Exit 0 | Exit 2 | Other |
|---|---|---|---|---|
| **PreToolUse** | 工具运行前 | 允许 | **阻止**调用（stderr → 作为指导展示给模型） | 任何其他退出码 = “非阻塞错误” → **调用继续执行**——但前提是 stdout 不包含有效 JSON。Claude Code 会在**每个**退出码下读取 JSON 输出，而有效 JSON 会完全覆盖退出码的作用。这里的 skeletons 不会向 stdout 打印任何内容，因此它们的 fail-open 推理成立；一旦添加 `permissionDecision` payload，退出码就不再决定结果 |
| **PostToolUse** | 工具运行后 | 保持静默，**除非它在 stdout 上打印 `hookSpecificOutput` JSON——这就是注入上下文的方式，并且会在退出码为 0 时发生** | 向模型提供反馈（无法撤销工具操作） | — |
| **SessionStart** | 会话开始时 | 继续 | **无法阻止**——stderr 会向用户显示 hook-error 通知，Claude 永远看不到该通知，但会话仍然启动 | **无论如何都应使用 exit 0**：不是因为非零退出码会阻止启动（它无法阻止），而是因为任何非零退出码都会在每次会话开始时，将 `<hook> hook error` 放入用户的 transcript 中。根据*会话的启动方式*接收 `matcher`——`startup`、`resume`、`clear`、`compact`、`fork` |
| **Stop**（+ `SubagentStop`） | 模型即将结束响应时 | 允许其停止 | **阻止停止**——强制模型继续执行（stderr → 作为原因反馈） | 循环安全：hook 会检查 `stop_hook_active`（必要，**但并不充分——见规则 7**）。harness 的连续阻塞上限（默认为 8）**不是**通用的后备保护——其计数器会在任何执行了工具的继续操作中重置，因此对于补救措施涉及工具调用的 hook（而这类 hook 占大多数）来说，该上限永远不会触发（#27）。请自行设置上限。某个事件的所有 Stop hook 都会**并行**运行——一轮阻塞可能携带多个 hook 的反馈 |

- **PreToolUse** 是阻止*工具调用*的主力——此表中的四种类型是本文件讲解的类型，并不是所有可阻止事件的完整集合；而**官方** hooks 参考（docs.claude.com / code.claude.com，而不是此 bundle 中的 `references/` 文件——后者只涵盖上述四种类型）现在列出了更多可阻止事件，包括 `UserPromptSubmit`、`PreCompact`、`TeammateIdle`，以及任务和配置事件。如果你需要设门禁的不是工具调用，应先去那里查看，而不是强行套用到 PreToolUse 上。
  `matcher` 选择工具（`Bash`、`Agent`、`WebFetch`，……）——**而它的匹配方式取决于你使用的字符**：只包含字母、数字、`_`、`-`、空格、`,` 和 `|` 的 matcher 会作为**精确字符串**进行比较（或作为由 `|`/`,` 分隔的精确字符串列表）；其他任何形式都会被视为**非锚定的 JavaScript 正则表达式**。两个方向都会悄无声息地造成问题——`Edit.*` 也会匹配 `NotebookEdit`（应将其锚定为 `^Edit$`），而 `mcp__memory` **什么也匹配不到**，因为它全部由精确匹配字符组成，且没有任何工具的名称恰好是它（你需要的是 `mcp__memory__.*`）。匹配区分大小写。退出码 2 会阻止操作，而 hook 的 **stderr** 会成为模型看到的消息——所以应在那里写明*原因*和*正确的替代方案*，而不只是写“blocked”。
- **PostToolUse** 无法撤销操作，但可以**注入权威上下文**，让之后的幻觉无法成立（例如在提交后重新读取真实的 git HEAD 并将其展示出来——面对注入的事实，模型无法“相信自己已经提交”）。
- **SessionStart** 用于对**防护机制本身进行健康检查**——健康时保持静默，发生故障时发出警告，并始终退出 0。注意其中的**原因**：并不是因为非零退出会阻止会话（它做不到），而是因为它会在每次会话启动时打印 hook-error 通知，直到有人修复它——一个在启动时频繁误报的检查，最终会让人学会直接略过所有检查结果。
- **`set -euo pipefail` 与 `set -uo pipefail`——应根据契约选择，并且要知道有两种方式可以维持始终退出 0 的契约。** 可能阻止操作的 hook（PreToolUse）需要 `-e`：意外故障导致脚本中止是可以承受的，因为调用方会将非 0/2 退出视为“继续”。契约要求**始终退出 0** 的 hook（PostToolUse 注入器、SessionStart 检查）有两种合理写法：(a) **去掉 `-e`**，并对每条有风险的命令使用 `||` 保护——启用 `-e` 时，一次确实没有找到内容的 `grep` 就会让 hook 中途终止，而 CLI 会显示一条裸的 `Failed with non-blocking status code`（陷阱 #8，Pattern E 的写法）；或者 (b) **保留 `-e` 并添加 `trap 'exit 0' ERR`**，这样任何故障仍会被转换为退出 0，同时 `-e` 继续保护管道逻辑（`git-commit-headcheck` 的生产写法，Pattern D）。两种方式都正确；不能做的是只使用 `-e`，既没有 trap，也没有 `||` 保护。经验法则：**对于做出决策的 hook 使用 `-e`；对于进行报告的 hook，去掉 `-e` 或为它添加 trap**（陷阱 #8）。
- **Stop 是个特例，也是最常被误用的类型**：它是唯一能够对模型**刚刚自行生成的内容**（模型自己的回复文本）做出反应的 hook 类型。其他所有 hook 类型——包括听起来很适合用来监管“说了什么”的 `UserPromptSubmit`——看到的都只有**用户**的输入；从结构上说，它无法看到模型在**当前轮次**自行生成的输出（这一点是成立的——这仍然是将此类规则交给 Stop 的正确理由）。不过，这一保证并不延伸到证明 `.prompt` 字段总是源自一次键盘输入：后台任务通知自身的报告文本也可能填入该字段，而 stdin JSON 中没有任何标记可以区分两者——#30。像“模型不得为尚未验证的事物臆造简称”这样的规则应放在 Stop 上；如果改放到
  `UserPromptSubmit`，它将 (a) 一次都抓不到它原本要处理的内容，因为该文本从不会经过该事件；并且 (b) 每当用户自己的无关输入碰巧包含触发模式时，错误地阻止用户输入。这是类别错误，而不是调参问题——在错误事件上进行多少正则表达式调整都无法修复它。完整契约（`last_assistant_message` 与 `transcript_path`、反循环检查）见 [references/hook_patterns.md](references/hook_patterns.md) 中的 Pattern E。
- **Stop 有两个阻止通道，且循环保护完全相同——应根据意图选择，并让第一次（也是唯一一次）阻止携带全部信息。** `decision: "block"` + `reason`，或直接退出 2 + stderr，会显示为 hook *error*——适用于硬性门禁（“这件事绝不能成立”）。`hookSpecificOutput.additionalContext` 会以中性的“Stop hook feedback”显示，且不会发出错误通知——适用于模型应当权衡的指导和提醒，而不是硬性门禁。两者都会计入上表所述的连续阻止上限，因此选择的是语气，而不是安全性。对消息设计而言，这意味着：被阻止后的重试轮次（`stop_hook_active: true`）会**连同仍然存在的所有违规一起**放行——因此 Stop guard 只有**一次充分知情的阻止机会**。（只有当你的补救方式是“重写回复”时，上限才会进一步强化这一点；如果补救方式涉及工具调用，计数器会重置，上限永远不会触发——#27。无论哪种情况，一次机会的结论都成立，因为它依赖的是锁存状态，而不是上限。）在这一次阻止中报告**所有**发现的问题（只打印第一个问题的 guard 会永久丢失其余问题——陷阱 #17），并将消息写成一份逃生手册，明确指出完全可接受的修复方式，而不是给出判决——模型要么在一轮内收敛，要么就在猜测中耗尽上限。v2.1.145+ 的输入 `background_tasks` / `session_crons` 让阻止型 hook 能够区分“会话已结束”和“会话只是暂停、正在等待后台工作”——阻止暂停会迫使模型进行无意义的后续操作，并浪费同一个上限。

完整可运行的骨架：[references/hook_patterns.md](references/hook_patterns.md)。

## 骨架（PreToolUse Bash guard）

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS= read -rd '' INPUT || true                 # builtin; NOT $(cat) — see below
# 0-fork fast path: a builtin `case` on the raw JSON, BEFORE paying for python3.
# Your guard runs on EVERY matching tool call, so the irrelevant path is the one
# that has to be cheap. Keep this filter BROADER than what you actually block and
# never flag-level — it answers "is this even about X", nothing finer (#22).
case "$INPUT" in *TRIGGER*) ;; *) exit 0 ;; esac
TOOL=$(printf '%s' "$INPUT" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null||echo "")
[ "$TOOL" != "Bash" ] && exit 0                # only guard the tool you mean to
CMD=$(printf '%s' "$INPUT" | python3 -c "import sys,json;print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null||echo "")
[ -z "$CMD" ] && exit 0
printf '%s' "$CMD" | grep -qw 'TRIGGER' || exit 0   # precise relevance check
# ... precise detection here ...
if <command actually does the banned thing>; then
  echo "BLOCKED: ... WHY ... USE INSTEAD: ..." >&2   # stderr = the guidance shown
  exit 2
fi
exit 0
```

**前两行不是风格问题。** `INPUT=$(cat)` 加上每个
`printf … | python3 -c …`，会在此 hook 匹配的每次调用中创建进程，**包括那些它无话可说的调用**。由大约 13 个 Bash-matcher hook × 并行会话 × 每秒多次的工具调用组成的集群，使其产生了持续每秒 40–200 个纯粹用于 guard 开销的进程，并让 Gatekeeper 在全天 CPU 排名中位居首位；期间没有任何失控进程——集群本身没有问题；有问题的是*无关路径*的单次调用开销（#22，其中包含逐 guard 的转换方案及其测得的下限）。

在你将 `case` 行复制到其他地方之前，先注意以下三个事项——第一项决定了它是快速路径还是绕过手段：

- **粗粒度过滤器必须是你所阻止内容的超集，而原始子字符串测试并不是。** `TRIG''GER -x` 执行的是 `TRIGGER`——bash 会在执行前拼接掉引号——但原始事件文本中不包含 `TRIGGER` 子字符串，因此单独的 `case "$INPUT" in *TRIGGER*)` 会退出 0，guard 根本看不到它。**实测**：将这一整行放入已发布的 Pattern A 后，`TRIG''GER -x` 会从退出 2 变为退出 0，形成完整绕过——而 `scripts/test_hook.sh` 仍然报告 21 pass / 0 fail，因为没有任何行带有经过拼接的 trigger。Pattern A 已经包含了修复及其原因（“去拼接——去除引号和反斜杠——然后再次检查；误报漏检会导致完整绕过”）；放在该去拼接之前的粗粒度过滤器会使这段逻辑无法到达。有两种安全形式，按优先级排序：**过滤无法被拼接影响的内容**——JSON 键或工具名称（`case "$INPUT" in *'"tool_name":"Bash"'*)`），因为引号拼接发生在*命令*文本中，无法改写事件本身的结构；或者**在过滤器内部进行去拼接**，先从输入副本中去除 `"`, `'` 和 `\`，再进行匹配。优先选择第一种：它不需要处理复杂的转义，而一个必须正确处理自身引号的过滤器，就是一个可能在不知不觉中出错的过滤器。上述骨架按原样使用是安全的，**仅仅因为**它自身的检测同样是简单的单词匹配；一旦过滤器下方的 guard 比过滤器更智能，决定权就落在过滤器上。

- **这个骨架在无关输入上是 fail-open**（`grep -qw … || exit 0`），因此，在它前面加一个粗粒度过滤器改变的是成本，而不是语义。**fail-closed guard 则不同**：一个裸的子串过滤器会悄无声息地把其契约从阻止未知输入改成允许未知输入（已测量——`'not json'` 直接穿过了该修复的第一道筛选），而单独使用 `*tool_name*` 标记又会从另一侧重新打开同一个漏洞。在为一个本应对格式错误输入执行阻止的 guard 配置快速路径之前，先阅读 #22 的 gate 要求。
- **脚本之上还有更便宜的一层。** hook handler 可以在其注册中携带一个 `if` 字段——例如 `"Bash(git *)"` 这样的 permission-rule 语法——当它不匹配时，hook command **根本不会运行**：因为没有进程，所以零次 fork。它按设计就是 best-effort（文档说明，当 Bash command 无法解析时，它会 fail *open*，仍然运行你的 hook），因此应将其视为成本优化，**绝不能把它当作 gate**——脚本内的检查仍然负责最终决策。这里有三个容易踩坑的地方：它只支持一条规则（不支持 `&&`/`||`），只会在 tool events 上进行求值，而且在非 tool event 上设置了 `if` 的 hook **永远不会运行**。

## 区分正常工作的 guard 与污染 session 的 guard 的规则

这不是风格偏好——每一条都对应我们实际发布过、并追溯到根因的具体故障。

### 1. 使用 shlex 在**token 层级进行匹配**，绝不要对原始字符串使用 awk 分割

一个**错误阻止正常 command 的 guard 比漏报的 guard 更糟**——必须绕过的 guard 会被人下意识地绕过，最终便什么也保护不了（核心原则：*误杀健康输入比漏报更糟*）。反复出现的错误阻止，其原因都是匹配原始 command 字符串。


- **错误**：使用 `awk '{gsub(/&&|\|\||;|\|/,"\n")}'` 来分割 segment——awk 不理解 shell 引号，因此 `grep -E "a|TRIGGER|b"` 会在*引号内的 regex*中的 `|` 处分割，`TRIGGER` 变成一个虚假的 command，guard 随之阻止一条普通的 grep。（发布于 2026-07-21；这个 guard 第一次真正使用时，就错误阻止了我自己的 grep。）
- **正确**：使用 **`shlex.shlex` class** 对整个 command 进行 token 化，而不是使用 `shlex.split()` function——`split()` 只有在 `| ; & < >` 两侧有空格时才会将其视为分隔符，因此 `ls|TRIGGER x` 会被 token 化为 `['ls|TRIGGER', 'x']`，你的 command-position 检查根本看不到 `TRIGGER`（已测量；启用 `punctuation_chars=True` 的 class 会得到 `['ls', '|', 'TRIGGER', 'x']`）。不要随手使用 one-liner，而应原样复制已经发布的 walker——但**要复制通过 `scripts/test_hook.sh` 的那个**，也就是 **Pattern A 的版本**。[walker section](references/hook_patterns.md#the-shlex-command-position-walker) 是一种*紧凑*形式，并且明确说明了这一点：它省略了每个 wrapper 的带值 flag 表，因此会漏掉搭载在**带值 flag 的 wrapper**上的 target——已测量，对于 `timeout 5 TRIGGER`、`sudo -u root TRIGGER` 和 `nice -n 10 TRIGGER`，它都会返回“not in command position”，而 Pattern A 的版本能捕获这三种情况。（裸的 `sudo TRIGGER` 在两者中都没问题——问题在于 wrapper 自身的 flag 接收了一个 compact table 不知道如何跳过的参数。）已发布 harness 中只有其中一种形式，因此你实际看到的运行结果是，在 `wrapper-timeout` 上 **20 pass / 1 fail**，而 Pattern A 的版本是 21/0；另外两种形式则会静默失败，因为没有对应的 row。带引号的 `"a|TRIGGER|b"` 会保持为**一个 token**，因此 regex 参数绝不会被误认为是 command。然后检查 target 是否处于**command position**（`token[0]`，或紧跟在 `;`/`&&`/`||`/`|` 分隔符之后，同时跳过 `VAR=val` 环境变量赋值前缀）。见 [references/hook_patterns.md](references/hook_patterns.md) 中的 Command-position walker。
- 推论：`echo "…TRIGGER…" `、`grep TRIGGER`、`# TRIGGER`、`man TRIGGER` 都必须通过。你的测试集**必须**包含这些“提及但未执行”的情况。
- **推论——在它们到达 walker 之前，先豁免 `git` 写入 segment。** commit message 是任意数据，整个 message 文本都会以伪 command-text 的形式进入你的 command-position walk——`git commit -F - <<EOF` 若其 body 中引用了 `foo|TRIGGER`，就会把 `TRIGGER` 放在 command position，导致 guard 阻止它自己的修复 commit（pitfall #7 正是这个问题，且已经发布）。任何检查 command 字符串的 Bash guard 都必须跳过 head 为 `git` 加上 `commit`/`rebase`/`tag`/`am`/`cherry-pick` 的 segment——并且要在整个 command 层级执行，早于任何按行分割（Pattern A 展示了该顺序；生产版本使用的是 `lib-git-commit-detect` 的 adjacency check）。
- **推论——walker 之所以分成两阶段是有原因的。** `whitespace_split=True` 会把换行视为普通空白，因此多行 block（`cd /x\ngit add\nTRIGGER -y`）会被合并为一个以 `cd` 为 head 的 segment，trigger 永远不会处于 command position——在真实 transcript 中重放的 trigger 率为 0（pitfall #11）。应先以 shell-aware 的方式分割成多行（遵守 quote state 和反斜杠续行，因此带引号的多行字符串不会被拆碎），再对每一行使用 shlex-walk——Pattern A 和 walker section 都提供了这个 splitter（`split_shell_lines`，已在 qlmanage-guard 中经过生产验证）。即便如此，它也无法解析 heredoc body（那不是 quote syntax）；何时接受这一残余问题，是 #11 的决定。
- **但 shlex 不是银弹，而且你检测的*内容*会决定 fail-open 是否安全。** `shlex.split()` 本身会在引号不平衡时抛出 `ValueError`——多行的 `git commit -m "…` message 中带有 `#` 或未闭合引号，就是典型触发场景。此时 `except ValueError: cmd.split()` 的 fallback 会*允许*通过；当你检测的是**被禁止的 modifier**时，这是正确的（是否携带 `--no-verify`？——漏掉它反而是安全的，符合 Rule 1 的方向），但当你检测的是 command **是否就是你的 target**时，这就很危险（这是 `git commit` 吗？——这里的 ValueError 意味着 guard 永远识别不出该 commit，因而静默地不触发；一次真实的跨域 commit 就曾以这种方式在没有确认对话框的情况下发布）。对于“**这是不是该 command**”这一决策，优先使用一种不会因多行引号断裂而失效的窄范围 **regex**（`git` 和 `commit` 作为独立单词，中间可以有任意 flag token）；将 shlex walker 保留给 *command-position / modifier* 检查，在这些检查中 fail-open 的方向是安全的。（边界是：当 predicate 是“这是否就是某个特定的常见 command”——`git commit`、`git push`——而其自身的 message/arguments 正是破坏 token 化的原因时，使用 regex；当 predicate 是“command position 中是否存在某个*被禁止的* command 或 modifier”时，使用 walker——此时被禁止的内容很少见，ValueError 导致的 fail-open 是安全的，符合 Rule 1 的方向。）

### 2. 在注册之前，使用 **bash -n + 真实 JSON 事件进行端到端测试**

**损坏或逻辑错误的 PreToolUse hook 会污染*整个*会话** —
之后的每一次 Bash 调用都会被截断 / 重复 / 错误地判定失败 / 看起来像是幻觉式执行，而你会把责任归咎于“环境”，殊不知问题出在你刚刚安装的 hook 上。（2026-07-05：一次编辑导致 `[^;&|]` 正则表达式损坏，`;&` 变成了 bash case-fallthrough token，直到 `bash -n` 发现问题之前，污染了半个会话。）“部署时测试通过”还不够 — 文件可能会在*后续*编辑中损坏。

在注册任何 hook 之前进行以下检查：
```bash
bash -n hook.sh                                # syntax
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"<trigger case>"}}'    | ./hook.sh; echo "exit=$?"  # want 2
printf '%s' '{"tool_name":"Bash","tool_input":{"command":"<healthy lookalike>"}}'| ./hook.sh; echo "exit=$?"  # want 0
```
将测试工具一并保存：[scripts/test_hook.sh](scripts/test_hook.sh) 会运行一整套触发/允许用例。**自阻塞陷阱：**一旦 hook 在会话中生效，你就不能把触发字符串放进你*自己的* Bash 命令中来测试它 — 生效中的 hook 会阻止你的测试命令。将这些用例放进一个**脚本文件**，然后运行 `bash test_hook.sh`；外层命令不包含触发字符串，因此不会被自身阻塞。

**一旦 hook 导致过一次真实事故（误阻止或静默漏检），仅靠独自重新阅读代码是不够的** — 某个 Stop-hook guard 的当日重写在作者修复第一个 bug 时又被自己重新弄坏了两次（Python 注释中的引号在重新阅读时不可见，只有运行实际失败的 JSON 用例才暴露出来）。此时应升级为多视角 agent-team 审查：每一个发现都必须通过对 live script 执行真实 payload 来复现，而不能只是阅读代码后表示认同 — 这就是通用的 Counter Review 方法论（skill-creator 的 `skill-development-methodology` 参考文档，Phase 6），只是将其应用于 hook，而不是 skill。在其中一次审查中，3 个视角（匹配逻辑 / shell 嵌入安全性 / 事件契约健壮性）发现了 13 个经确认且独立复现的 bug，以及 1 个其所引用证据最终被证明是虚构文档引文的发现 — 只有因为验证者被要求 curl 原始源文件并 grep 精确字符串，而不是相信引用，该问题才得以发现。

### 3. 使用 SSOT + 符号链接，避免重新安装时静默解除防护

真实脚本位于版本控制目录中，**通过符号链接**放入 Claude 读取的 hooks 目录：
```
~/scripts/claude-hooks/<name>.sh      # SSOT (this setup: a private git repo)
~/.claude/hooks/<name>.sh             # symlink → SSOT

# install / recover:
ln -s ~/scripts/claude-hooks/<name>.sh ~/.claude/hooks/<name>.sh
```
重新安装 `~/.claude` 会清除 hooks 目录；符号链接目标仍会保留，恢复操作只需执行一次 `ln -s`。悬空符号链接会在**零信号**的情况下禁用 Tier-0 guard — 这正是存在 SessionStart health check 的原因（规则 4；可运行的骨架见 [references/hook_patterns.md](references/hook_patterns.md) 中的 Pattern C）。

### 4. 注册按配置文件分别进行——让所有配置文件趋于一致，通过**人工**门控发布

- **注册有两个入口，而健康检查可能只关注其中一个。** 除了下面的配置文件设置外，仓库自身的 `.claude/settings.json`（以及 `settings.local.json`）也会为该仓库中的会话注册 hooks。它们位于 `~/.claude/hooks/` 之外，因此遍历该目录的防护检查完全覆盖不到它们——语法、路径、`--selftest`，什么都检查不到。两个静默故障就曾通过这样的文件发布，并在一个本来就是为了防止此类问题而构建的 SessionStart 健康检查下存活了两个月（#38、#39）。请使用**绝对**路径注册项目 hooks——相对路径会依据会话 cwd 解析，而某人第一次从子目录启动 `claude` 时就会失效——并扩展健康检查，使其从事件的 cwd 向上遍历项目设置。
- 如果*活动配置文件的* `settings.json` 没有调用 `~/.claude/hooks/` 中的 hook，那么其中的 hook **什么也保护不了**。多配置文件用户在所有配置文件完成统一之前，曾一直处于零防护状态。请在**主**配置文件的设置中注册（在此设置中为 `~/.claude/settings.json`；[references/hook_patterns.md](references/hook_patterns.md) 的 Registration 部分提供了确切的 jsonc 结构）——PreToolUse → matcher `Bash` → 你的 hook——然后让其余配置文件趋于一致（此设置使用由 `claude-switch-models-setup` skill 负责的 `sync-profile-settings.py --all`）。SessionStart 健康检查会 grep 每个配置文件，查找 Tier-0 防护，以捕获偏差。CLI 的文件监视器会获取设置编辑（官方 hooks 文档），因此无需重启即可使注册生效——可以通过观察防护在安全探测上触发，或在下一次会话的健康检查行中确认。
- **如果防护需要释放阀门，请使用*人工*门控，而不是环境变量。** 静态的 `GUARD_OK=1` 逃生通道不算门控——模型可以自行设置该环境变量。请使用原生 macOS 对话框（`osascript`——模型无法点击）；拒绝/取消/超时 = 硬性 NO；将每次提示/绕过都记录到审计文件中。模式见 [references/hook_patterns.md](references/hook_patterns.md)。
  - ⚠️ **`/dev/tty` 不是第二通道——文档说明 hooks 无法打开它。**
    此文件过去规定在对话框之外，还要在 `/dev/tty` 上输入 `YES`。
    官方参考文档明确指出：hooks “在自己的会话中运行，**没有控制终端**”，并且“hook 进程及其任何子进程**无法打开 `/dev/tty`**”（`terminalSequence` 是文档中用于向其写入的替代方案）。因此，以这种方式构建的“双通道”门控实际上是一个通道加上一段死代码；而在没有 GUI 会话的机器上，该门控根本无法由任何人批准。
    这与本地观察结果一致，不过请仔细阅读其中的边界：在某个设置的共享审计日志中——共有 1,801 条记录，多个防护都向其中写入，其中三个实现了 tty 通道——**360 行**带有通道标签（236 次对话框确认、124 次拒绝或超时），但没有任何一行以任何形式提到 tty 通道。也就是说，tty 分支从未*进入*；在 macOS 上这正是你应当预测的结果，因为对话框会先得到响应并将其短路。因此，日志表明这里没有任何事情依赖 tty；确立 tty 完全无法工作这一点的是文档，而不是这次测量。
    保留对话框；如果你需要非 macOS 门控，就需要一种本文件尚未验证答案的通道。
  - ⚠️ **如果人工门控的存活时间超过 hook 超时，它就会以开放状态失败。** Hook `command` 超时默认为 600s（`UserPromptSubmit` 为 30s），而超时的 hook **不会阻止工具调用**——因此未响应的对话框不会变成“否”，而会变成允许。请将等待时间限制在远低于超时的范围内，并让无响应在 harness 替你处理之前，由你自己解析为阻止。
  - 文档还提供了一个 UI 内通道——PreToolUse `hookSpecificOutput` `permissionDecision: "ask"`，它会通过 Claude Code 自身的界面发出提示。值得了解，但**在 `bypassPermissions` / 自动接受模式下尚未在此处验证**，而这正是 Tier-0 门控必须能够经受的模式；之所以规定使用对话框，是因为它不依赖权限模式。
  - **在 Tier-0 以下、允许模型自行处理的逃生通道中，应让它成为正确的用法，而不是绕过标志。** 上面的规则对于 Tier-0 是绝对的，在此不作让步——这里讨论的是未达到该级别的正确性防护，它们仍然需要为检测器无法区分的合法情况提供退出方式。问题在于，你要让这种退出方式*具体是什么*。`SKIP=1` / `--force` 环境变量逃生方式正好会训练规则 1 所警告的那种条件反射，而且在截止期限下，它与绕过没有区别。请优先选择一种**本来就希望他们执行的操作**作为逃生方式，这样采取该方式会改进命令，而不是解除防护：`pipe-fallback-guard` 在命令提到 `pipefail` / `PIPESTATUS` / `pipestatus` 的瞬间退出并返回 0，因为写出其中任何一个的作者已经证明自己理解管道退出代码——防护已经没有什么可教给他们的了。应采用的测试是：*如果有人使用我的逃生通道，最终得到的命令会更好，还是仅仅不再受阻？* 如果诚实的答案是“仅仅不再受阻”，那么你拥有的就是一个换了更好听名字的绕过标志。Tier-0 情况下的同级原则是：覆盖机制存在的唯一目的只是测试门控时，**逃生通道只能让门控变得更严格**——参见 [references/hook_patterns.md](references/hook_patterns.md) 中关于 `GIT_GUARD_TEST` 的讨论。

### 5. 判断失败的**方向**，并测试*这一点*——不要只测试成功路径

规则 1 对*检测调优*错误进行了排序：在守卫已经运行的前提下，错误阻止一个正常命令，比漏掉一个罕见的恶意命令更糟，因为需要人们绕过的守卫最终会被条件反射式地绕过。**本规则讨论的是另一个维度——守卫的机制根本没有运行**——所以这里并没有反转“哪一种更糟”的结论；这两个排序从未相交。一次调优失误只让你损失一个案例；而这种错误会让守卫在所有具有该形态的输入上都悄无声息地失效。

失败情形是：守卫**无法获取它要据此进行判断的对象**——解析过程抛出异常、路径无法解析、依赖缺失、子进程超时——而那个防止钩子崩溃的 `2>/dev/null || true` 又悄悄地把“*我无法检查*”转换成了“*没有需要报告的内容*”。钩子退出码为 0。**这个输出与真正通过时完全相同**，所以这种问题可能数周都不会被发现。

因此，在钩子每一个*获取*某些内容的地方（解析命令、读取暂存文件、查询服务），都要明确决定：**如果这里返回空值，是意味着允许还是阻止？**——并把答案写在分支旁边。对于*修饰符*检查，失败开放通常是正确的（是否携带 `--no-verify`？漏掉它只会让你损失一个案例）。对于*这是否就是目标对象*的检查，失败关闭通常是正确的（这是否是一个跨域提交？空答案意味着守卫根本没有触发）。

**然后测试这种方向，而不是成功路径**：故意传入一个无法解析的路径或一条无法解析的命令，并断言它仍然按照你的决定执行。一个测试套件中每一行都通过，只是因为钩子悄悄地放行了所有内容，这与一个真正通过的测试套件无法区分。

**仔细读取这些结果——对于不同的守卫类别，同一个输入的正确答案可能完全相反。** 以 `cd ~/no-such-dir && TRIGGER` 为例：

| 守卫类别 | 判断依据 | 正确退出码 | 原因 |
|---|---|---|---|
| **令牌匹配器**（这是否是一种被禁止的命令形式？） | 仅命令文本 | **2，阻止** | `TRIGGER` 明明就在文本中；无法解析的 `cd` 并不会让它不再是一个触发条件，而且如果守卫在这里保持静默，那么对于 `cd ~/real-dir && TRIGGER` 它也会保持静默 |
| **状态推导器**（仓库的暂存集合是否跨越多个域？） | 从磁盘读取的状态 | **0，允许** | `cd` 失败，`&&` 短路，不会发生提交——没有需要守护的内容 |
| **终止状态读取器**（补救措施是否已经完成？） | 回执 / 计数器文件（规则 7） | **0，允许**——*当状态文件本身就是终止条件时* | 无法读取回执意味着钩子无法知道自己是否已经触发；在这里失败关闭会导致钩子永久阻塞，却没有任何可执行的补救措施，也没有人类可见的原因——这*就是*循环，而且这是唯一一种比漏掉一个案例更糟的失败。**相反的子情况——复制这一行之前请先阅读：**当状态只是叠加在独立谓词之上的**预算**时（完成相应工作后阻止条件仍然会消失），读取失败时允许会**悄悄禁用整个钩子**——一个不可写的目录就会让它对所有输入永久保持静默，这是最糟糕的失败形态。此时，应退回到*预算存在之前*的行为（继续评估谓词），而不是保持静默。**用一个问题区分这两者：如果状态消失，补救措施是否仍然可能完成？**否 → 回执情况，允许。是 → 预算情况，继续检查。为避免任何人需要重新推导，以下是已经验证过的答案：规则 7 的机制 2（回执）**以及**机制 3（每会话计数器）都属于**回执情况 → 允许**——机制 3 刻意不判断 R 是否发生，因此它的计数器就是唯一的退出条件，而让它保持静默会使本轮操作陷入困境。预算情况则是：计数器叠加在一个用户仍可独立满足的谓词之上 |

所以，请在写入该行**之前**决定你的 hook 属于哪一类，而 harness 的
`unresolvable path` 模板行期望的是 **2**，因为该模板针对的是 token-matcher 类。
弄反这一点，会让一个正确的 guard 被自信地判定为 FAIL。对于 state-deriving guard，
你要寻找的失败是：**命令实际上本应已经执行，而 guard 却没有看到它** — 不平衡的引号
会导致 tokenizing 抛出异常，fallback 允许通过，于是真正的跨域提交就会在没有对话框的情况下
发布（规则 1 的 `ValueError` 说明）。针对每一行允许通过的记录，都要问：*这个命令实际上会完成该操作吗？*
如果不会，那么允许通过就是正确的。

对一个真实的 state-deriving guard 运行这一完全相同的 probe 时，第一次运行返回了两个 allow：
其中一个是正确的（就是上面的短路情况），另一个是真正的 fail-open。**probe 能发现问题；但你仍然需要对它发现的问题进行分类** —
这正是为什么上面的分类表要放在这些行之前。

真实案例（2026-07-22）：一个 scope guard 通过 `git -C "$REPO_DIR"` 读取 staged 文件，
其中的 `REPO_DIR` 是从**命令文本**中解析出来的 — 因此 `cd ~/repo && git commit`
交给它的是字面量 `~/repo`，`git -C` 执行失败，staged 结果为空，于是 guard 得出结论：
“没有跨域文件，允许通过。”每一次跨仓库提交都绕过了 guard，而且始终没有任何迹象表明出了问题。
剖析 + 共享库转折点：陷阱 #10。

那个 parser 还有第二种失败方向，而且更加棘手。一旦你加入 fallback，使它不再 fail open，
fallback 会因为一个原因而正确，却因为另一个原因而错误 — 而两种情况打印出的都是同一行。
`git push`（没有显式目标）合理地 fallback 到事件的 `cwd`；`git -C "$R" push`
*指定了*一个 hook 无法解析的目标，fallback 到同一个 `cwd`，随后却针对另一个仓库渲染出一个自信的 ✅。
这两种情况渲染出的内容逐字节相同（经测量，MD5 相等），因此 hook 和读者都无法区分诚实的 verdict
与绑定错误的 verdict。**fallback 值必须携带选择它的原因**，只有“没有显式目标”才能得到 verdict。
完整剖析、confused-deputy 的论述，以及为什么包含字面量路径的 fixtures 永远捕获不到它：
陷阱 #28。

### 6. 根据世界能够回答的事实进行判断 — 永远不要依据你自己的渲染结果，也不要依据命名习惯

规则 1 和规则 5 讨论的是*如何*匹配以及失败时*采取哪种方式*。本规则讨论的是
**你所匹配的事物来自何处**，并且有两种都会悄无声息发生的失败形态：

- **永远不要依据你为人类格式化的字符串进行分支判断。** 如果 hook 构建了一份报告 —
  排序、拼接、截断到前 N 项并附加 `(+M more)` 尾部 — 然后又针对这份报告对自己的决策进行模式匹配，
  那么该分支就继承了渲染过程中的信息损失。截止位置之后的项目对它来说根本不存在，因此这个分支会在每个较小的 fixture
  中正常工作，却恰好在它原本要处理的较大 session 中停止触发。通过独立的通道输出机器事实
  （一行未截断的 `KINDS:a,b,c`），然后匹配该事实。渲染结果是输出，而不是数据源（陷阱 #12）。
- **优先选择可检查的事实，而不是命名约定。** 按路径形状
  (`/skills?/[^/]+/references/`) 进行分类，实际上编码了一种目录布局；任何采用其他布局的 repo 都会被分类为 `None` —
  悄无声息地永远如此。修复方法**不是**扩大模式范围，因为那会把一次悄无声息的遗漏换成整个机器范围的误报
  （规则 1 明确禁止这种交换）；而是去询问一个文件系统能够回答的问题 —
  *这个 `references/` 目录旁边是否有一个 `SKILL.md`？* 事实能够经受布局变化；约定则不能。
  （当候选对象**本身就是**一个 `SKILL.md` 时，就没有可供询问的 sibling — #13 解释了为什么这是规范定义的事实，
  而不是本规则所警告的命名习惯。）
  **可检查的事实仍然可能是错误的事实 — 要锚定问题并按类型筛选。** 下载目录中也可能满足
  `test -f SKILL.md`，而有一个沿祖先目录查找该文件的 guard 就曾吞掉整个 home 目录，
  然后告诉真实 session 加载一个以该目录命名的 skill — 这样的名称根本不可能存在（规则 9 的 incident）。
  应将查找锚定到某个**特定**目录的 sibling，或锚定到一个已知的安装路径；未锚定的祖先目录遍历，
  只是披着事实外衣的约定。

两者的共同特征是：某个分支在生产环境中一次都没有触发过，但其测试却是绿色的。打印未经格式化的原始分类结果，你就能看出自己属于哪一种。

### 7. 如果钩子**要求修复**，证明循环会终止

一个在 X 完成之前**阻塞**（退出码为 2）的钩子——尤其是 Stop 钩子，因为它们会在之后每次停止时重新触发——不是检查，而是一个**反馈循环**。
（一个仅仅*注入*要求并以 0 退出的钩子，根本不存在循环：没有任何东西会重新评估。这就是下面的机制 0，而且它往往比人们实际采用的方式更适合作为默认方案。）

```text
condition T is true → hook demands remediation R → model performs R → T checked again
```

**在第一个周期开始之前，先写好循环契约（既适用于由钩子强制执行的循环，也适用于由代理驱动的审查 / 等待 / 重试循环）：**

```text
LOOP KEY: immutable logical target / lineage + one failure axis
FIRE T: the condition that starts another cycle
REMEDIATION R: the exact action one cycle performs
VARIANT V: the well-founded quantity that strictly decreases for this key
BUDGET: maximum cycles, fixed before cycle 1
SUCCESS EXIT: the observable that proves the axis is clear
CAPPED EXIT: what is left blocked / unshipped / pending when the budget ends
```

没有完整的契约，就不允许使用阻塞式 Stop 钩子，也不允许重复的审查或轮询循环。必须在第 1 个周期开始之前冻结 key。修复快照、提交或审查者名称都必须留在同一条 lineage 中，不能据此创建新的预算。新的、无关的发现属于**新的 key**：单独记录；它不会重置本循环的预算。一个无法指出新的证伪实验或更小 V 的周期不会增加任何证据，应当停止。

对于**由代理驱动的独立审查循环**，默认预算是一次初始审查，加上实质性修复后进行一次范围严格限定的复审。第三位审查者不是自动安排的。如果复审仍然在同一故障轴上复现 BLOCKER 或 MAJOR，则不要注册钩子 / 不要发布产物，报告被阻塞状态，并要求一个由用户授权的新任务；该任务必须在第 1 个周期开始之前声明其循环契约和预算。代理自行声明的预算不能授权代理自己。在获得授权的任务中，明确说明此时停止会导致的具体安全或业务故障；可选的润色不符合条件。

完整的审查循环示例：

```text
LOOP KEY: <initial frozen commit>'s review lineage + termination-contract fidelity
FIRE T: fresh review reports a same-axis BLOCKER / MAJOR
REMEDIATION R: reproduce that finding, apply one bounded fix, run its narrow check
VARIANT V: 2 - completed review cycles
BUDGET: 2 cycles total (initial review + one re-review)
SUCCESS EXIT: no same-axis BLOCKER / MAJOR
CAPPED EXIT: artifact stays unregistered / unshipped; report remaining findings
```

初始冻结提交的每个修复后代都仍属于这个 key。当前快照会发生变化，以便审查者检查修复；但其 lineage 及剩余预算不会变化。

没有任何机制会强制执行这个无钩子预算——它只有在代理遵循 Skill 时才有效。正因为存在这一限制，封顶退出状态必须清晰可见，并且绝不能被报告为“已完成”。

**如果完成 R 能再次使 T 为真，则循环不会收敛。** 不会报错，不会崩溃；它会一轮又一轮地运行，直到人类中断——而这通常确实会发生，因为每一轮都是一次*完整的*修复周期（dispatch、wait、adopt、edit），而不是廉价的重试。**这同一特性也意味着 harness 的连续 8 个 block 上限救不了你：它的计数器会在每次执行了工具的 continuation 上重置，因此由工具调用组成的修复周期会让计数器永远停留在 1**（已测量 — #27）。即使它最终触发，这也只是针对失控会话的后备机制，而不是设计方案：该轮结束时，违规仍然存在，而 harness 会将该轮报告为 `reason:"completed"` — 这与真正完成无法区分。“它最终会停止”不是你所希望的任何意义上的终止，而在这里它甚至不会最终停止。`stop_hook_active` 在这里也**救不了你** — 该字段只涵盖**一层重新进入**（“我刚刚阻止的停止正在被重试”）。它对*跨轮次*的情况毫无说明：模型确实离开去执行 R（实际工作，调用许多工具），然后自然停止；这是一个全新的 Stop，此时字段为 `false`，hook 会基于同样的理由再次触发。

**这个测试借鉴自程序验证中的终止性证明** — 一个[循环变体 / 秩函数](https://en.wikipedia.org/wiki/Loop_variant)：写下一个映射到良基序（通常就是 ℕ）的量 **V**，并证明 **V 在每个 `trigger → remediate → re-check` 周期中都严格递减**。没有 V，就没有终止性证明 — 不要注册这个 hook。

**V 是设计阶段的义务，而不是代码** — 你永远不会在 hook 中计算它。实际交付的是*谓词*（下面介绍的机制）；V 则是证明该谓词会收敛的论证。将它放在下一位读者最容易踩坑的地方 — 脚本头部：

```bash
# TERMINATION: V = 1 - exists(<receipt path>)
# decreased by: R writes the receipt; nothing R does afterwards can remove it.
```

“证明它会递减”包含三个具体问题，答案应写入该注释中：

1. **R 会改变什么？** 指明确切的文件 / 字段 / 时间戳。
2. **该事物是否是 T 的操作数？** 如果是，并且 R 将其移回“触发”方向 → 就不存在 V。
3. **R 执行之后，使 T 再次为真的最小输入是什么？** 如果答案是“我刚刚触发时使用的同一个输入” → 就不存在 V。重新设计谓词；不要重新调整阈值。

**一个真实的反例。** 某个 Stop hook 要求在复合产物（规则文件、skills、其他 hooks）可以被推送之前，必须先完成独立审查：

- **T**（使 hook **触发**的条件） = “存在尚未被任何审查覆盖的编辑”，其实现方式是时间戳比较 `last_edit > last_review`（`last_edit` = 产物集合中最新的 mtime，`last_review` = 审查记录的 mtime — 两个单独的数字，这正是该比较让人觉得安全的原因）
- **R** = dispatch 一个独立审查者

但是，值得运行的审查**是有输出的**：其发现会被**同一个 agent 立即采纳，在它下一次尝试停止之前** → 这会产生新的编辑 → `last_edit` 超过 `last_review` → **T 再次为真**。（如果是人类稍后在外部采纳了这些发现，就不会形成循环——这个循环需要在同一个 agent 的回合中完成修复和重新检查，而这正是 Stop hook 所保证的。）不存在 V——修复不会减少某个量，而是*重置*它。唯一的退出方式是“审查，然后什么都不改”，而这恰恰说明调度审查器本来就是多余的。观察结果是：连续三个回合，每个回合都是完整的审查并采纳周期，最终都只有在用户说停止后才退出。

有两点使这个问题难以察觉。**单独看，这个比较完全合理**——“审查必须比上一次编辑更新”正是你会写出的条件。而且这句话是**通过**条件——T 是它的否定。把它原封不动地记在脑中，却不带上这个否定，那么接下来的整个分析中，你推理的就是错误的操作数；请始终将 T 定位为**触发**条件。（将*代码*写成提前退出的守卫子句——`… && exit 0`——是正常的 shell 风格，这不是这里讨论的重点；这里的纪律要求是明确你推理时所采用的方向。还要注意相等情况：同一秒的 mtime 会落在通过一侧，也就是 fail-open，这与本规则对下面状态读取的要求一致。）运行上面的检查清单，结论会机械地显现出来：R 会改变 `last_edit`（Q1）；`last_edit` 是 T 的一个操作数（Q2）；重新触发 T 所需的最小输入就是修复自身的输出（Q3）→ 不存在 V。

**第二种失败形式：谓词完全看不到修复（可观测性缺口）。** 上面的反例是一个会被修复*推动*的时间谓词。同一类问题中还有一种更隐蔽的失败：修复确实发生了，但谓词在此环境中读取的通道根本不存在。真实案例（2026-07-26，在一次全节点循环审计中发现）：某个 Stop hook 通过扫描 tool_results 中的 `agentId: <hex>` 并读取 `subagents/agent-<hex>.jsonl`，来检测“独立审查已经发生”——这在主配置中是正确的。Team-mode 会话使用完全不同的模式（生成回执为 `agent_id: <name>@session-<uuid>`，传递通过带有 `teammate_id` 的队友消息完成，文件为 `agent-a<name>-<hex>.jsonl`）——永远不会匹配，因此 `last_review` 永远保持为 `None`，每个 compounding-edit∧push 回合都会重新触发该要求：这是一个误报循环，在每个停止序列中最多触发一次，但跨回合则无界增长；而该会话中的“2/2 次触发”实际上都发生在已经完成完整审查的工作上。同一类问题，不同的处理方式：时间循环需要更好的*谓词*；可观测性循环需要更好的*通道*。请在检查清单中增加第四个问题——**Q4：在这个 hook 将运行的每一种环境中，该谓词都能实际看见 R 发生吗？** 对于读取会话记录的 hook，这意味着要从每种配置/模式中解析真实会话，而不是只对一种模式做夹具测试。（上面案例的修复方式：多模式检测，并排除队友传递消息对回合边界的影响，使其不会截断检测窗口——陷阱 #20。）

**先按轴选择，再按顺序选择——这不是同一事物的五种强度。**
0 决定*是否完全阻塞*；1 决定*挂在哪个事件上*；2–4 是
*谓词的形状*（选择了 1，仍然需要在 2–4 中选择一个）。0→4
的顺序表示“循环被移除得有多彻底”，而且它与“你能施加多少强制”
**成反比**——所以应当选择第一个仍能提供你实际需要的强制力的选项，而
不是简单地选择第一个。

0. **不要阻塞——注入。** 如果需求只是建议性的（你希望模型
   *考虑* R，而不是没有它就无法完成），就打印它并以 0 退出。
   没有任何东西会重新评估，因此也就没有需要证明会终止的循环。对于
   低于 Tier-0 的任何需求，这是正确的默认选项，其代价也必须如实说明：
   提醒可能会被忽略，所以应在标题中说明它是 fail-open——规则 4 的要点
   仍然成立：主题可以绕过去的门，就不是门。如果你需要的是*门禁*，就使用
   2，并为回执付出代价。注入通道：Pattern D。
   ⚠️ **此选项在 Stop 上不存在**——而规则 7 的主要主题*就是*
   Stop，所以在使用它之前请先读完这段。在 Stop 上，`exit 0` 的含义是
   “让本轮结束”，因此之后不会再有推理步骤来接收这段文本；而
   `hookSpecificOutput.additionalContext` 与 `exit 2` 计入同一个 8-block 上限
   （见 hook-types 部分），也就是说它同样是一种阻塞。Stop 恰好只有两种模式：
   门禁，或静默。因此，在 Stop 上选择机制 0，就意味着**更改事件**——将注入
   挂到生成该产物的工具调用上（PostToolUse、Pattern D）——或者承认你其实
   想要的是门禁，转而使用机制 2。
   ⚠️ **“没有循环”只有在 R 不是你自己的匹配器目标时才成立。** 一个作用于
   `Bash` 的注入器如果告诉模型运行 `git ls-remote`，就会在该命令本身再次触发，
   并重新注入。同样的形状，只是更柔和——模型可以忽略它，因此不存在强制迭代，
   但它是重复触发时广播，而不是什么都不发生。请检查你建议的 R 不是此 hook
   所匹配的操作。

1. **将检查移到操作边界。** 如果你想门禁的是一个*操作*——推送、发布、
   删除——就使用 PreToolUse 保护**该操作**，而不是使用 Stop 保护**本轮**。
   **Stop-hook 修复循环通常是挂错事件的操作门禁**，这正是 hook-types 部分
   “Stop 是那个与众不同的选项，也是最常被误用的选项”这一说法的具体情形。
   **请准确理解这能带来什么。** PreToolUse 只会在模型*主动重试受门禁的操作*
   时再次触发，而模型始终可以拒绝该操作并正常结束本轮。因此它保证的是
   **本轮会终止**——最坏情况从“本轮无法结束”降级为“该操作不会发生”。它
   **不会**让一个不收敛的谓词收敛：取上面的反例，将其原样移到 PreToolUse，
   循环仍会完整保留（push → blocked → review → findings adopted → new edits →
   retry → `last_edit` is ahead again → blocked）。该案例的问题出在它的
   **谓词**，而不是事件，因此你仍然需要从 2–4 中选择一种形状。还要注意，
   PreToolUse **没有** harness backstop——hook-types 表中的 8-block 上限仅适用于
   Stop——所以，将一个会自行重置的谓词移到这里，安全网反而更少，而不是更多。
   ⚠️ 有两种形状不适合使用这一机制：**R 必须使用你所门禁的同一个工具来完成**
   （一个作用于 `Edit` 的保护要求你先修复文件头——这会造成死锁，永远没有任何
   东西能够满足它），以及**一个操作会在同一会话中重复发生**（一个会话推送五个
   仓库，而你设置了 `git push` 门禁 = 五次完整要求；这就是下面战争故事中的
   密度问题，而机制 1 并不会让你免受它的影响）。

2. **将“已经修复”定义为一个存在性事实，而不是时间事实——并以需要修复的对象作为其键。** 让 R 生成一个产物，并测试*它是否存在*；关键就在于此：

   ```bash
   KEY=$(git rev-parse HEAD 2>/dev/null || printf 'nogit')   # or a hash of the
   RECEIPT="${TMPDIR:-/tmp}/my-guard.${KEY}.ok"              # reviewed content
   [ -f "$RECEIPT" ] && exit 0            # V = 1 - exists, for THIS key
   ```

   `V = 1 - exists` 是**按键计算的**：每个键只会恰好减少一次，并且对于*该键*，绝不可能再被推高。新工作会生成一个*新*键——那是新的需求，而不是重新武装。两种天真的键设计都会失败：一个全局路径会让钩子在每台机器上触发一次，随后永久沉寂且不再提供任何信号；而基于时间的键正是本规则要禁止的时间谓词。**时间谓词几乎总是错误的形态**，因为你要求执行的修复通常正是会改变你拿来比较的操作数的东西。
   这个内容 SHA 键对于一次性回执门禁是正确的。它**不会**重新定义 agent-review lineage：由该 lineage 的修复操作创建的提交，仍然使用其原始键和原始预算。
   ⚠️ 如果**模型**能够创建回执，那么这就是规则 4 中已废弃的 `GUARD_OK=1` 逃生舱，只是换了个伪装。让模型无法驱动的东西来写入它（例如 reviewer subagent 自己的输出文件、git note），或者接受该钩子只是建议性的，并在其标头中明确说明。

3. **对重复次数设置上限。** 每个会话、每个目标最多提醒 N 次——`session_id` 是这一用途唯一稳定的键（它存在于每个事件中；请参阅 Pattern references 中的 JSON contract）：

   ```bash
   SID=$(printf '%s' "$INPUT" | python3 -c "import sys,json;print(json.load(sys.stdin).get('session_id','nosid'))" 2>/dev/null || echo nosid)
   CNT="${TMPDIR:-/tmp}/my-guard.${SID}.count"
   N=$(cat "$CNT" 2>/dev/null || echo 0); N=$((N+1)); printf '%s' "$N" > "$CNT"
   if [ "$N" -gt 3 ]; then
     CAPPED_REASON='Loop budget exhausted; the blocked condition remains unresolved. Do not report completed.'
     python3 - "$CAPPED_REASON" <<'PY'
   import json, sys
   print(json.dumps({"continue": False, "stopReason": sys.argv[1]}))
   PY
     exit 0                              # explicit capped stop, not silent success
   fi
   ```

   这种做法很粗糙，而且有意不判断 R 是否真的执行过——但它是*有限的*，而这正是原本缺失的性质。不要用 `$$` 或 `$PPID` 替代：每次运行钩子时都是一个全新的进程，因此它们会在每次调用时发生变化，计数器永远不会累积。打印计数（“提醒 2 of 3”）——请参阅下面的 war story，了解为什么这种措辞值得保留。封顶输出使用文档化的通用 [`continue:false` / `stopReason` JSON fields](https://code.claude.com/docs/en/hooks#json-output)，因此用户看到的是一个达到上限的停止，而不是一个无法区分的成功 Stop。这会停止会话；但**不会**保护发布操作。如果封顶退出信息表明某个产物仍未发布，请在操作边界处通过 PreToolUse 单独强制执行这一点。

4. **滞回 / 冷却窗口**（控制理论中应对[告警抖动](https://utcc.utoronto.ca/~cks/space/blog/sysadmin/HysteresisMeaningAndAlerts)的方案）：
   触发后，在一段时间内禁止重新评估——一个时间戳文件，加上
   `[ $(( $(date +%s) - <stamp mtime> )) -lt 900 ] && exit 0`（在 BSD/macOS 上，mtime 是
   `stat -L -f %m`；在 GNU 上是 `stat -L -c %Y`——本文中的其他代码片段也是如此；**`-L` 至关重要**，因为规则 3 会在你将要执行 stat 的每个路径上放置符号链接；没有它，你读取的将是链接自身的 mtime，而不是 SSOT 的 mtime，并且编辑 SSOT 时时间戳不会更新——#41）。适用于在*阈值附近振荡*的条件；但对于补救措施会**重置**的条件则是**错误的**——那类条件需要使用 2 或 3。
   ⚠️ **滞回不提供 V——它是速率限制器，而不是终止证明。** 循环只有在条件自行缓解时才会结束，而届时让它结束的是外部世界，不是你的钩子。因此，它的 `# TERMINATION:` 行必须指明这一外部事实（“到时间戳过期时，X 已由 <whom> 解决”）。如果你无法诚实地写出这一行，那么你需要的是 2 或 3。（有一个值得注意的家族相似性：机制 0 是两者的极限情况——即上限设为 0 的机制 3，或窗口设为 ∞ 的机制 4。它们的区别在于强制执行方式，而不在于终止方式。）

**状态本身的失败方向：应用规则 5 的问题，不要根据字面匹配。** 如果状态无法读取或写入——不可写的 `TMPDIR`、沙箱、磁盘已满——则由规则 5 的守卫类表格作出决定，而它的判断依据是询问**“如果这个状态消失，补救措施是否仍然可能？”** 对于机制 2 和 3，答案都是**否**——回执是 R 已发生的唯一记录，而机制 3 则是有意不去判断 R 是否发生，因此其计数器是唯一的退出途径——**所以应允许停止**。一个无法读取自身状态、却仍然阻塞的终止机制，*就是*这个循环，只不过现在连人类可见的原因都没有了。

⚠️ **不要仅仅因为两者都说“计数器”，就把机制 3 归入规则 5 的“反向子情况”。** 该子情况适用于这样的计数器：它只是在用户仍可独立满足的谓词之上，*限制提醒次数*——在那里，计数器不可读取时停止提醒，只会让一个原本还有其他清除方式的钩子静默，因此你仍需继续评估该谓词。机制 3 没有这样的备用谓词。**实测结果如下，而这正是这种配对所产生的失败：**将机制 3 的代码片段粘贴到 Pattern E 的骨架中（根据 `-e`-vs-trap 条目，该骨架带有 `set -uo pipefail`），将 `TMPDIR` 指向一个不可写目录，连续五次运行都会返回退出码 2——`N` 永远无法持久化到大于 1 的值，上限永远无法达到，而一旦补救措施涉及工具调用，#27 已经排除了将 harness 上限作为后备方案的可能性。这里的失败方向完全由该代码片段未携带的一行 `set` 决定，因此**应将守卫放在实际失败的步骤——写入——上，而绝不要放在读取上**：

```bash
printf '%s' "$N" > "$CNT" 2>/dev/null || exit 0   # 无法持久化 ⇒ 无法终止
```

读取操作已经受到保护（`cat … 2>/dev/null || echo 0`），并且**必须保持这种方式**：计数器文件不存在是首次运行时的正常情况，因此在读取操作上使用 `|| exit 0` 会在完全健康的环境中让钩子永久静默。实测结果是，每个变体连续运行五次：在可写的 `TMPDIR` 上，为写入操作加保护得到 `2,2,2,0,0`，在不可写的 `TMPDIR` 上得到 `0,0,0,0,0`——两种情况下都正确；为读取操作加保护则在**两种**情况下都得到 `0,0,0,0,0`，也就是说，这个保护条件根本不会触发。

**需求文本中的文字说明不能替代一个会收敛的谓词。** 一个消息写着“如果你认为没有必要，就再次完成”的钩子，仍然会在每一轮产生完整的修复周期，因为一个被告知必须执行 X 的模型通常就会执行 X。逃生口必须位于**谓词**中，而不是建议中。

**测试要求，以及这里最容易跳过的事项：**自测试需要一个**“修复之后”**的用例——不仅要测试“应该触发时会触发”，还要测试**“R 完成后会停止触发”**。如果没有这一项，非终止在**结构上不可见**：每个 fixture 都只是某个孤立时间点上的判断，而非终止是关于**序列**的属性。只检查单个时间点的测试套件，无论有多少用例，都对收敛性没有任何覆盖——这正是钩子可以带着全绿的自测试交付，却在第一次真实遇到问题时仍然循环的原因。能够发现这一问题的行对（回执不存在 → 触发，回执存在 → 静默，以及普通 `run` 行无法表达的设置/清理操作）已经模板化放在 `scripts/test_hook.sh` 的 "AFTER-REMEDIATION ROWS" 下；症状 → 原因 → 修复对应陷阱 #16。

**已证明终止 ≠ 让人感觉已经终止（2026-07-25 事件）。** 一个 Stop 钩子在一次会话中触发了三次——每次触发都是来自不同已完成任务的、合法的**新**推送，机制完全按照设计工作——但用户的体验仍然是“为什么这东西卡在循环里？”（这与机制 2 的“R 所做的任何事情都无法将其再次推高”并不矛盾：**V 是按键区分的**——三个不同的键，三次独立的单向递减。当你无法判断自己处于哪种情况时，这同样是诊断依据：如果每次触发都带有一个**新**键，机制是正确的，问题在于密度；如果重复触发共享**同一个**键——或者谓词根本没有键，因为它比较的是时间戳——那么你遇到的就是上面的反例，需要替换谓词。）连续发生的三个独立修复周期，从外部看起来与循环无法区分。变体证明解决了机制问题；但它没有说明一次会话可能要求进行**多少次不同的修复**。如果你的领域会产生这种密度（这里的复合产物每天会发布好几次），可以考虑将机制 2（存在事实）与机制 3（会话范围的上限）结合起来，或者有意识地接受这种观感，并在钩子的输出中说明这一点——“最多 N 次中的第 2 次提醒”读起来像是在取得进展，而不加说明的重复读起来就像陷入了循环。**（2026-07-26 后续：同一个钩子看起来像是密度问题的那些触发，后来被证实 100% 都是假阳性——它的评审通道在团队模式下无法识别 schema；参见上面的可观测性表单。在接受“合法密度”这一判断之前，先确认这些触发是否确实有证据依据。）**

**终止与是否值得是两个独立的闸门。** V 证明循环会结束；循环契约的预算和封顶退出机制决定是否值得继续为另一个周期付出成本。暴露出这一区别的无 hook 评审循环故障，包括为什么范围漂移会悄无声息地铸造出无穷无尽的“新”工作，详见陷阱 #36。

### 8. 等待也需要同样的证明——通知只是提示，轮询必须携带预算

规则 7 涵盖了由 *hook* 创建的循环。同样的形态也会在没有 hook 参与时反复出现：**一个代理正在轮询异步结果**——子代理的报告、后台任务的完成通知、CI 状态。真实会话（2026-07-25）：子代理完成通知通过一个可能延迟或丢失的邮箱送达；三个独立的代理都已经完成工作，但通知一直未送达，等待中的代理在大约 40 分钟内反复执行了十几轮 `sleep 240` + 催促循环，直到人类询问它到底在做什么。过程中没有任何报错；这个循环只是没有变式。

规则 7 的机制可以照搬过来——前两项可以直接照搬；滞回没有对应物（等待不会振荡），而它的位置由一个等待特有的陷阱占据：

1. **轮询产物，而不是通知。** 如果你真正需要的是一个结果（文件、git 引用、API 状态、数据库中的一行），就等待这个结果，而不是等待“它是否说自己完成了”。通知是提示；产物才是事实。无论消息是否曾经到达，存在性检查都会在事实落地的瞬间终止。
2. **每次等待都必须携带预算，并在编写循环时确定。** 最大轮数 × 间隔（例如 3 × 4 分钟），以及一个在第一次休眠之前就已经存在的降级路径：自己完成、询问用户，或者将其标记为待处理并转去做其他工作。“无限等待，看看会怎样”不是降级路径——它就是这个循环。
3. **投递协议只是提示，而不是机制。** “完成后通过 SendMessage 报告——没有消息就算未完成”值得写下来，但它约束的是代理是否*发送*，而不是邮箱是否*投递*。在一次会话中，提示词里包含该协议的三个代理都悄无声息了。设计等待逻辑时，应假设通知可能永远不会到达——因为它确实可能不会到达。

两个相邻的陷阱，它们在同一会话中都付出了代价：**对一个实际正在工作、却被认为“卡住”的代理执行 TaskStopping**——邮箱延迟并不等于空闲；一名评审人员正在进行 20 分钟的实际语料库测试，却在即将交付结果前几分钟被当作“卡住”而终止。以及**对等待本身进行 `--dry-run` 风格的探测**：在断定另一方没有回应之前，先确认你自己的观察通道正常（在那次会话中，System Events 的窗口计数对一个显示在屏幕上的对话框返回了一个非常确定的 0——权限失败伪装成了证据）。

### 9. 固定样例无法告诉你误报率——在注册之前重放一组真实命令语料

规则 1 对哪种错误更糟进行了排序（误拦截比漏拦截更糟，因为人们必须绕过的防护会被条件反射式地绕过）。规则 2 要求你在注册之前进行测试。但二者都无法告诉你**实际的误拦截面有多大**——而测试表也无法做到这一点，因为*输入是由产生检测器的同一个思维模型编写的*。其中的用例包含了你想到的那些形态；你没想到的形态则按定义被排除在外。这不是可以通过增加行数来弥补的覆盖率缺口。

**测量时间：2026-08-06。** 一个 PreToolUse/Bash 守卫通过了一张包含 26 个案例的表格，并对其运行了 5 个变异，然后完成注册。随后，使用从最近 60 份会话记录中收集的 **11,903 条去重真实命令**进行重放：其中 143 条产生候选项，实时 hook 拦截了 46 条，逐一人工检查这 46 条后发现 **10 条错误——占其拦截总数的 21.7%**（其中两次边界情况被计为正确；若按另一种方式判断，则约为 30%）。在 39 分钟内，它拦截了 3 个真实会话，其中一个被告知要加载一个根本不存在的 skill——也就是下面列出的第三个缺陷，以指向虚无的修复指导形式暴露出来。它在同一小时内被移除。三个根本缺陷全部位于**解析**层：将续行标记读作分隔符、扫描片段时把 heredoc 主体和数据参数计作执行内容，以及不带类型过滤的路径分类器。

这个故事并不能支持两个结论。它**绝不是**“变异测试不起作用”：对同一套测试的后续审计发现，hook 的逻辑中有 **5 处代码可以删除，而 26 行仍然全部通过**；此外，作者标注为“已从装饰性修复”的其中一行仍然只是装饰——*“我运行了变异测试”不等于“变异测试是正确的”*，而重放同时暴露了这两点。它也**绝不是**“你不可能事先知道”：其中三个缺陷是对本文件已经提供的代码进行手工重写造成的（`split_shell_lines`、命令位置遍历，以及 `is_git_write` 对 `-C` 及其参数的处理）。规则 1 中的*原样使用遍历器*才是更便宜的修复，但它被跳过了；重放是最后一道防线，而不是第一道防线。

**方法——四个步骤，其中第 2 步最容易被跳过：**

1. **收集。** 会话记录位于
   `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`，以及注册在
   `~/.claude/history-sources.json` 中的任何归档文件。命令是 `.message.content[]` 条目，其中
   `type == "tool_use"` 且 `name == "Bash"`，位于字段 `.input.command` 中——**不是** hook
   事件的 `.tool_input.command`，后者是另一种结构。去重，并收集足够多的会话记录，使你自己最近的工作形态也包含其中（那次运行使用了 60 份）。
2. **使用随附的检测器进行预筛选，并逐字切出**——绝不要手写一个等价实现，否则你测量的只是你自己两个猜测之间的一致性。预筛选唯一的目的在于降低成本（11,903 → 143）；决定结果的是第 3 步。如果检测器不是一个可独立提取运行的代码块——无论是 shell 代码，还是拆分在被引入的库中的代码——就把它改造成这样；无法独立运行的检测器，同样无法进行单元测试。
3. **将每个候选项交给真实 hook，并提供它自己的真实会话记录和 `session_id`。**
   会读取会话状态的守卫，在伪造的上下文中会给出不同答案。事件契约见：`references/hook_patterns.md`。有两件事会造成问题——请在临时的
   `TMPDIR` 下运行，否则规则 7 的回执和按会话统计的计数器会写入真实会话，并在你自己的测量过程中途让守卫停止工作；如果 hook 有人工门控，则应通过模式 B 的强制拒绝路径驱动它，而不是回答 143 次对话框。
4. **人工检查每一次拦截——拦截列表就是误报测量结果。** 允许列表回答的是规则 5 的另一个问题（它是因为那里什么都没有而保持安静，还是因为它无法看到？）；而重放返回 **零次**拦截时，应怀疑测试工具，而不是将其视为结果清白——陷阱 #11 在触发不足的方向上规定了同样的检测手段。

**如何处理这个数字。** 修复指导错误或不可能执行的误报拦截 → 根本不要注册：这种形态正是规则 1 要防止的反射式绕过规则的制造过程。否则，就把拦截列表当作修复列表，然后重新回放。预计误报会集中在**你编写防护规则时正在做的事情**上——那次运行中有一半落在了 hook 开发文件上，因为其作者那周正在构建 hook。还要专门扫描拦截列表中的**运维操作**（对 hooks 目录下文件的编辑、对某个 hook 执行 `bash -n`、防护规则自身的 SSOT）：一个会拦截自身删除操作的防护规则，无法从会话内部关闭。最近记录的案例是 #25，其中防护规则拦截了**只读的** `git config core.hooksPath` 查询——这正是距离自我锁死还差一步的同一个盲点。一旦防护规则已经把你锁在外面，逃生路径在 **#3** 的列表中（使用 Edit/Write 工具编辑 `settings.json`，它永远不会触发 `Bash` matcher；或者使用不同的 `CLAUDE_CONFIG_DIR` 启动会话）。

这种聚集是一种倾向。对于检测器是**文本模式**的防护规则，其中有一类情况却是必然的：**记录反模式会重现它自身的触发条件。** 解释防护规则的提交消息、文档示例、你写入自己知识库的笔记——每一项都会原样携带被禁止的形态，作为数据进入语料库。在 2026-08-30 对 852 条命令进行的回放测量中，与防护规则标题形态匹配的 4 条命令里，**有 3 条是正常的**——一条关于该防护规则的提交消息、一条嵌入了该模式的文档写入命令，以及一条校准命令，它会在展示差异时故意将错误形式与正确形式放在一起运行。一个不加区分地接受该模式的检测器，**在其自身签名形态上就会有 75% 的判断错误**，而且每一次拦截都会发生在作者正在写防护规则说明、写到句子中途的时候。两个豁免条件可以消除这一类情况，而且都不是什么特殊情况：**数据接收端 heredoc 主体**（`references/hook_patterns.md`，位于命令位置遍历器的 heredoc 限制之下——也就是会区分接收端的剥离器），这覆盖了提交消息和文档写入；以及**同一条命令中存在正确形式**，这覆盖了校准命令——一个把修复写在 bug 旁边的作者是在演示它，而不是提交它。第二种方式与 pipe fallback 防护规则所使用的 `pipefail` 逃生舱具有相同的形态：命令携带了证据，表明其作者已经了解这一点，因此不要再与其争辩。其机制是再增加一次字面测试，在检测器之前运行并使其短路——对于 `pipe-fallback-guard`，就是子字符串集合 `pipefail`/`PIPESTATUS`/`pipestatus`（规则 4）；对于具有规范修复方式的检测器，则是该修复方式的独特片段。要保持窄化和字面化：针对正确形式的*模式*会重新打开整个猜测问题，而一个作者必须有意输入的固定字符串很难被意外命中，并且其失败方向是漏检。

规模控制：这样它读起来不会像一个研究项目：一次收集加一次循环，墙上时间以分钟计。

## 构建顺序（按顺序）

1. **确认这是真实的递归过程**，而不是假设出来的——否则不要构建。
   如果该 hook 会**要求修复**，而不只是阻止操作，那么在编写任何逻辑之前，先写出完整的 Loop Contract（key / axis / T / R / V / budget / two exits），并将 V 作为 `# TERMINATION:` 行放入脚本头部（规则 7）。首先检查你要限制的东西是否是一个*操作*；如果是，那么针对该操作设置 PreToolUse guard 可以消除循环，而不是驯服它。无法命名一个会在每次 `trigger → remediate → re-check` 循环中严格递减的量？该设计就是非终止的——修复设计，而不是正则表达式。
2. 在 SSOT 目录中编写脚本；`chmod +x`。
3. 使用 shlex 进行 token 级匹配来执行**检测**（规则 1），匹配依据应是世界能够回答的事实，而不是你自己的渲染结果或命名约定（规则 6）。
   - **首先检查 ShellCheck 是否已经能做出判断——然后记录答案，因为下一位作者还会问同一个问题。** 它是 shell 反模式的事实标准，因此审查者首先会问的就是“为什么不直接用 shellcheck”。在 **0.11.0** 上于 2026-08-15 测得：针对
     `find . -name x | head -5 || echo "no"`——这是一个已被证明永远不会触发的 fallback，因为 `||` 绑定到 pipeline 的**最后**一个阶段，而 `head` 在空输入时也会以 0 退出：**默认配置不报告任何内容，退出码为 0**。`--enable=all` 会报告 **SC2312**（`check-extra-masked-returns`），但对于 `cmd | jq . || echo bad` 也会触发；在后者中，最后一个阶段确实可能失败，因此 fallback 是有意义的。
     有三个理由使它不适合作为*门禁*——而且每一个理由都具有普遍性：它**默认关闭**（所以当前并没有保护任何人）；它无法区分失效的 fallback 和有效的 fallback（全部触发会导致规则 1 所说的错误阻断螺旋）；并且它自身建议的修复方式是“使用 `|| true` 来忽略”，这与目标完全相反。它还检查的是**文件**，而不是工具调用事件。
     这个问题的一般答案是：标准 linter 适合用来**检查**，但通常不适合委托它来执行阻断门禁，因为 linter 针对的是建议性广度，而门禁需要的是精确性。你的 hook 所贡献的正是这种精确性。已发布的示例：`pipe-fallback-guard`，其精确性来自一个小型列表，其中列出了确实会吞掉上游代码的最后阶段命令（`head`/`tail`/`wc`/`cat`/`sort`/……），并且有意排除了 `grep`/`jq`/`awk`/`sed`，因为这些命令确实会因真实错误而失败。
4. 使用触发案例和看起来正常的相似案例执行 **`bash -n` + `test_hook.sh`**（规则 2）——在测试通过前不要注册。包含携带未展开路径的形态（`cd ~/elsewhere && …`，规则 5）；如果 hook 有人工门禁，则加入一个强制拒绝行（Pattern B，“让门禁可测试”）；如果它要求修复，则加入**修复后的行对**——没有回执时触发，有回执时保持安静（模板见 `scripts/test_hook.sh`；规则 7——点时间 fixture 在结构上无法发现非终止）。
   - **为 hook 提供 `--selftest` 模式，并使其具备双向测试能力。** 然后让 SessionStart guard-rail health check（见上文“Hook types”——其全部职责就是检查 guards 本身的那个检查）对每个已安装且提供该模式的 hook 调用 `<hook> --selftest`。这是唯一能够捕获以下故障的自动检查，而 `bash -n` 以及下面第 4-7 步在结构上都无法捕获该故障：hook 已经**退化为永久 no-op**。这种故障在设计上就是不可见的——一个永远不触发的 guard，其输出与一个没有任何内容需要报告的 session 完全相同，这正是它可以持续数周的原因。两个 fixture 是*最低要求*，而不是目标：一个必须阻止的样本**和**一个必须通过的样本，这样它才能同时捕获“停止触发”和“开始错误阻断”——只具备其中一种样本无法覆盖另一种情况。
     **应按消灭的 mutant 数量来确定规模，而不是按 fixture 数量来确定**，并像校准测试套件一样进行校准：故意破坏 detector，确认 `--selftest` 以非零状态退出。一个从未被观察到失败的 selftest，与 `exit 0` 没有区别。
     在已发布的 `compounding-edit-review` 上测得：其**第一个版本的两个 fixture 只消灭了 14 个 mutant 中的 4 个**——它自身注释声明为承重行为的每一项都没有覆盖，其中包括一个会短路 anti-loop 检查、但 selftest 仍然打印 OK 的 mutation。现在它运行 58 个案例。
     真正的约束不是 fixture 数量，而是 **session start 时的墙上时间**，因为每个 session 都要支付这笔成本：这 58 个案例耗时约 **5.3 s**，而两探针存活性检查约为 **140 ms**。当消灭 mutant 使你超出该预算时，**应拆分，而不是缩减**——在 `--selftest` 上运行一个廉价的固定大小 liveness probe，在构建时通过 `test_hook.sh` 运行完整回归测试集。当 guard 已经失效时，继续缩减到 mutant-kill 线以下，只是换回一个仍然通过的 selftest。
     **为这次拆分提供一个触发机制，否则完整部分永远不会运行。** “在构建时”不是一种机制——一条写着*修改此项后运行完整测试集*的注释，正是本文件试图弥合的 prose-vs-enforcement gap，而且会以同样的方式失效。
     在 `shared-repo-head-drift` 上测得的方案可以弥合这一差距（21 个案例 / 冷启动 17.8 s，将 SessionStart 的 health check 压缩为 9 个断言的 probe / 2.2 s）：在 hook 中以 `--selftest` 和 `--selftest-full` 的形式保留两部分，让 health check 进行选择——如果文件自上次完整通过后发生过变化，就运行完整测试集；否则运行 probe。这样，成本会落在**编辑后的第一个 session**上，而这正是值得支付完整测试集成本的时候。
     ```bash
     sig=$(stat -L -f '%m %z' "$h" 2>/dev/null || true)   # -L or you stat the symlink — #41
     stamp="$STAMPS/$(printf '%s' "$h" | shasum | cut -c1-16).full"
     [ -n "$sig" ] && [ "$(cat "$stamp" 2>/dev/null || true)" = "$sig" ] || mode="--selftest-full"
     bash "$h" "$mode" >/dev/null 2>&1 </dev/null || return 1   # </dev/null: an
     # unknown flag drops into the main path and reads stdin — on SessionStart that
     # hangs every new session
     [ "$mode" = "--selftest-full" ] && printf '%s' "$sig" > "$stamp" 2>/dev/null
     ```
     失败方向应当是**转向完整测试集**：签名无法读取、不匹配，或 stamp 目录不可写，都会运行完整测试集。这里不存在修复循环（规则 7 不适用）——它只是在选择运行哪一层，因此慢总比盲目通过好。只在完整测试集**通过**时写入 stamp，这样失败会使下一个 session 仍然运行完整测试集。
     选择 probe 的案例时，不要采用“前 N 个”的方式：它需要一个必须触发的案例和一个必须保持安静的案例，否则两个退化方向无法同时覆盖。注意某个必须保持安静的案例可能实际上是空洞的——只提供建议的 hook 总是以 0 退出，因此一个 `run` 风格的退出码行无法证明其中不存在误报；断言必须采用 `says` 风格（#40、#14）。
5. **重放真实命令语料，并手动检查每一次阻断**（规则 9）——这一步测量的是误阻断面，而第 4 步中的 fixture 表在结构上无法测量这一点。将已发布的 detector 原样截取出来作为预过滤器；在 scratch `TMPDIR` 下，将每个候选项连同其自身的真实 transcript 和 `session_id` 一起交给真实 hook。
6. **Symlink** 到 `~/.claude/hooks/`（规则 3）。
7. 在主 `settings.json` 中**注册**，并使 profiles 收敛（规则 4）。
8. 对于 Tier-0/不可逆操作，添加**人工确认释放门禁**（规则 4）。
9. **持久化**：将 SSOT 提交到其私有 repo。也可以选择添加一行 CLAUDE.md（正文说明*原因*及替代方案；hook 负责强制执行）。

## 已知陷阱（调试失效的 hook 前请先阅读）

完整目录（症状 → 原因 → 修复）：[references/hook_pitfalls.md](references/hook_pitfalls.md)。
重点包括：`stdin` 被 `python3 - <<PY` heredoc 消耗（hook 会静默地放行所有内容）、awk 分割导致的错误阻断（规则 1）、损坏的 hook 污染整个会话（规则 2）、Python *注释*中的引号或反引号会在没有语法错误的情况下静默损坏 `python3 -c "…"` 代码块（陷阱 #9——应改用 Pattern E 中带引号的 heredoc 形式）、静态 env 逃生舱（规则 4）、多 profile 未完整注册、提交消息以伪命令文本的形式到达 walker，导致自己的修复提交被错误阻断，除非豁免 `git` 写入片段（#7），以及从命令文本解析出的路径保留了字面量 `~`，使防护器在**完全没有任何症状**的情况下默认放行（#10——你无法等到发现它，因为沉默就是它唯一的表现），某个分支读取了 hook 自己被截断的显示字符串（#12），或依赖了本仓库并不遵循的命名约定（#13）——当测试套件只断言退出码时，这两种问题都会隐形（#14）——仅仅**包含**重定向的命令文本被计为写入（#15），以及 hook 所**要求的修复操作会重新启用它自己**，在绿色自测中循环，因为基于时间点的 fixture 在结构上无法发现不终止的情况（#16，规则 7）。

**harness 才是隐藏变量——请使用 `scripts/test_hook.sh`，不要自行手写。** 下面每一种手写测试都会产生与干净通过相同的输出，因此看起来像是成功（2026-07-22，在修复 Stop hook 的白名单时，一次就遇到了三个）：

1. **事件形状错误。** Stop hook 读取的是 `last_assistant_message` /
   `transcript_path`，而不是 `tool_name`/`tool_input`。输入一个 PreToolUse 形状的事件后，它找不到任何文本 → 退出 0 → “没有错误阻断！”
2. **JSON 引号问题。** 单引号中的 `'{\"a\":1}'` 会输出包含字面量反斜杠-引号的内容；`json.loads` 抛出异常，而 hook 中的 `2>/dev/null || exit 0` 将其吞掉，于是每个用例都“通过”。
3. **测试用例恰好属于规则合法豁免的情况。** 基线字符串使用了一个规则**有意豁免**的字符串（该防护器会标记 `<name> Group` 形式的自造昵称，但豁免普通短语 `in the group` / `group chat`——而基线行恰好使用了其中一个）。原本用于证明防护器仍然生效的那一行没有真正触发防护，于是整个测试套件显示为绿色。

**如果 hook 的产物是它输出的消息，那么退出码就无法测试它。** 阻断型 hook 的契约主要是退出码，因此 `run` 行可以覆盖它。但如果 hook 存在的目的就是“说些什么”——例如 PreToolUse 对正确替代方案的解释，或 Stop 提醒——那么它还有一个代码永远看不到的第二输出通道：改坏措辞、反转条件段落、让 heredoc 吞掉一整节，而退出码仍然完全保持为 2，每一行测试也仍然通过。添加来自 `scripts/test_hook.sh` 的 `says <label> <event> <pattern> <yes|no>` 行，断言**两个 fixture 中的两种极性**（对于它所针对的输入，该内容应存在；对于它跳过的相似输入，该内容应不存在）——单独的 `want=no` 在 hook 完全不输出任何内容时也会因空满足而通过，因此它只有与 `want=yes` 行并列时才有意义，后者用于证明 hook 确实会输出内容。匹配**固定字符串**，不要使用正则表达式：值得断言的短语通常包含方括号，而在 BRE 中，`[skill]` 是一个字符类，会匹配包含 s、k、i 或 l 的任意文本。然后**通过变异来证明这些行确实能够失败**：复制 hook，注入每一行声称要捕获的确切 bug，并确认该行变红。在你观察到测试因正确原因失败之前，一个绿色的测试套件不携带任何信息——曾有两个真实 bug 在一个完全绿色的 24 用例测试套件中存活下来，因为每一行查看的都只有退出码（陷阱 #14）。

常见的形态是：**所有情况都通过是一种危险信号，而不是放行绿灯。** `test_hook.sh`
会从结构上捕获上面的第 1 和第 2 种形态——它会为每一行 `run` 断言一个明确的
`expected-exit`（而不是“它是否打印了什么”），并强制要求触发器行与看起来健康的
相似行同时存在，因此一个返回 0 的触发器行会明确失败，而不会混在其中。它
**无法**捕获第 3 种形态：某一行的内容是否意外落入豁免范围，取决于你实际写下的内容，
而任何测试框架都不知道你规则的意图。这一点只能通过习惯来捕获——先断言一个已知应当
触发的触发器；如果它没有触发，先怀疑这一行，而不是 hook。

## 参考资料

- [references/hook_patterns.md](references/hook_patterns.md) — 本文涵盖的每种 hook 类型的可运行骨架、shlex 命令位置遍历器，以及 JSON 事件契约。
- [references/hook_pitfalls.md](references/hook_pitfalls.md) — 每一种真实失败模式，以及对应的症状 → 原因 → 修复方法。
- [scripts/test_hook.sh](scripts/test_hook.sh) — 端到端测试框架；创建任何新 hook 时都将其复制到旁边。
- [scripts/test_hook.group-name-guard.sh](scripts/test_hook.group-name-guard.sh) — 一个针对真实 Stop guard 的完整测试框架实例：包含 Stop 事件形态，以及豁免行与触发行组成的测试集。它将 hook 路径作为 `$1` 传入（`bash test_hook.group-name-guard.sh ~/scripts/claude-hooks/<hook>.sh`）；直接运行时会打印 `HOOK not found: …/CHANGE-ME.sh`。**它不是本文件要求 Stop guard 实现的两项内容的示例**——其中没有 `says` 行，也没有 `stop_hook_active` 反循环行。关于这两项内容，应以 `scripts/test_hook.sh` 为参考。

## 维护——新增内容应放在哪里

新的事故回溯应放在本文件之外、已经存放同类内容的位置：新的陷阱或失败剖析 →
[references/hook_pitfalls.md](references/hook_pitfalls.md)；可复用的骨架或模式 →
[references/hook_patterns.md](references/hook_patterns.md)；一个完整的测试框架实例（测试脚本）→
`scripts/`。本文件只接收**契约级规则**：每个阻塞式 hook 都会使用的内容（新的 hook
类型、变更后的退出码契约、`## Rules that separate a working guard from a session-poisoning one`
系列中的新规则）。加载到触发器时的内容表面保持稳定，而知识库持续增长；深度内容只需再
沿指针访问一次。（上面的“Known pitfalls”标题列表只是重点摘要，而不是索引——自陷阱
#16 以来它们就没有扩展过；`hook_pitfalls.md` 中的编号目录才是 SSOT，并且新增陷阱无需
出现在标题列表中。）

之所以将这一点记录下来（2026-08-02），是因为事故回溯实际上一直都放在
references 中——让本文件在一周内从 10k→50k 字符增长的，是*规则*方面的正文
（规则 5–8 直接写入本文件），而本策略刻意将这些内容保留在这里。本策略的作用，是为
下一次接手新事故的会话明确默认做法，从而让未来的增长仅限于契约级规则。一次经过交叉
质询的四方面设计评审（成本 / SSOT / 架构 / 证据）选择了这一方案，而不是对当时已有的
八条规则进行结构拆分。下次有人提议拆分时，应满足的重启拆分标准是：有一项测量结果
（而不是凭感觉）表明主文件的大小正在降低规则遵从度；或者整个 skill 的变更趋于稳定
（连续 30 天内任何地方都没有新增规则或事故回溯）。