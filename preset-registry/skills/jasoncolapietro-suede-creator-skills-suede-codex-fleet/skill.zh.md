---
name: suede-codex-fleet
description: "Claude-directed parallel OpenAI Codex CLI worker fleet for bulk generation. Use when a job is high-volume, well-specified, and splits into independent worker-sized tasks (content batches, test generation, bulk refactors) and Codex CLI is installed and logged in. Claude decomposes, briefs, spawns codex exec runs in parallel, and review-gates every output. Workers are always codex exec processes billed to the user's OpenAI subscription — never substitute Claude subagent fan-out on any model, and halt rather than fall back if Codex CLI is unavailable. NOT FOR: multi-lane Claude agents coordinating one complex change (use suede-agent-teams); low-volume, judgment-dense copy Claude should write itself (use suede-copy or johnny-suede-write)."
---
# Suede Fable Fleet

Suede Fable Fleet：高端 Claude 模型担任舰队司令，负责拆解、简报和审查；并行 OpenAI Codex CLI 工作进程构成舰队。不要为匹配该品牌而重命名文件夹或 frontmatter 的 `name`。

## 工作进程是 Codex 进程，绝不能是 Claude 模型

**这是该 Skill 的经济性核心。** Codex 工作进程的费用计入用户的 OpenAI/ChatGPT 订阅。Claude 子代理的费用计入其 Anthropic 限额。请求 codex 舰队的人是在刻意将工作量*从* Anthropic 额度中转移出去，使用 Claude 模型满足该请求会颠倒成本模型，并消耗他们正试图保护的那部分预算。

因此，`codex exec` 是此处运行工作进程的唯一方式。绝不能以 `Agent`、`Task`、`Workflow`、子代理扇出或任何其他内部编排方式替代工作进程，无论是使用 `fable`、`opus` 还是任何模型，也不能“仅针对这一个批次”这样做。Claude 只能担任舰队司令：拆解、简报、审查、整合。如果你即将启动的不是 `codex exec` 进程，就说明你已经偏离了此 Skill，请停止并重新阅读下方的路由表。

**预检失败意味着停止，而不是回退。** 如果 Codex CLI 缺失、未登录或不在 `PATH` 中，请说明哪项检查失败，并询问是否要改用 Claude 模型继续，同时粗略估算该扇出会消耗多少资源。绝不能静默回退。

**弄错的代价**（实测，2026-07-27）：Claude 模型舰队替代了明确请求的 codex 舰队运行，产生了 3,258 个轮次、约 12.9 亿 token，其中 97% 是缓存读取，因为每个工作进程在每轮都携带约 50 万 token 的上下文。API 等价支出约为 $1,843，占一次每周配额的 23%，而这项工作本应在该账户上不产生任何费用。

## 何时应使用此 Skill 而非相关 Skill

- **suede-codex-fleet**（此 Skill）：将高工作量、规格明确的生成任务卸载给 Codex CLI 工作进程；Claude 负责规划、简报和审查
- **suede-agent-teams**：多路 Claude 代理通过关卡和交接协同完成一项复杂代码变更
- **suede-copy / johnny-suede-write**：Claude 自行撰写文案；当工作量较低而判断密度较高时，这是正确选择

**核心原则：** Claude token 用于购买判断力，Codex token 用于购买工作量。清晰规格加高工作量交给 Codex。规格模糊或出错代价高的任务留给 Claude。任何内容都不能未经审查就交付。

## 预检（在首次启动前执行）

1. `which codex && codex --version` — CLI 已安装（已针对 codex-cli 0.138.0 验证）。
2. `codex login status` — 必须显示已登录（你的 ChatGPT 订阅将支付本次运行费用）。

   检查 1 和 2 是成本边界。若任一项失败，**停止并报告具体是哪一项**，不要为了让任务继续推进而改用 Claude 工作进程。
3. 工作区根目录中存在 `AGENTS.md`。Codex 会自动加载它；其中包含语气、上下文、硬性禁令和输出约定，从而使简报保持简短。若不存在，请先编写它，这才是系统中杠杆率最高的文件。
4. 工作区中存在 `briefs/` 和 `out/` 目录（按需创建）。

## 循环

1. **分解。** 将工作拆分为相互独立、适合单个工作器处理的任务。独立意味着：没有任何工作器需要其他工作器的输出。
2. **编写简报。** 每个任务在 `briefs/` 中对应一个 Markdown 文件。Codex 永远看不到 Claude 对话，因此每份简报都必须自包含：工作内容、输入（文件路径）、确切交付物、它必须自行检查的验收标准，以及 `out/` 中确切的输出路径。
3. **启动。** 每份简报对应一个 `codex exec`，并行地在后台运行：

```bash
caffeinate -i codex exec -C <workspace> --sandbox workspace-write --skip-git-repo-check \
  -o <workspace>/out/<run-name>-final-message.txt \
  "Read AGENTS.md at the workspace root, then execute the brief at briefs/<brief>.md exactly. Write the deliverable to the output file the brief names, run the brief's acceptance-criteria self-check, and state pass/fail per criterion in your final message."
```

   - `-C` 设置工作器的根目录；在 Git 仓库之外必须使用 `--skip-git-repo-check`。
   - `caffeinate -i`（macOS）是每次启动时的标准配置：它会在工作器整个生命周期内阻止空闲休眠，并在退出时释放，因此机器会在任意工作器存活期间保持唤醒，并在整个工作器集群完成后恢复正常休眠。一台进入休眠的 Mac 会静默终止所有进行中的工作器。保持上盖打开——除非 Mac 处于合盖模式（外接显示器 + 电源），否则合盖休眠会覆盖 `caffeinate`。
   - `--sandbox workspace-write` 仅限此项。绝不使用 `danger-full-access`。工作器可以写入文件；不得推送、部署或接触密钥。
   - 除非明确要求通过 `-m` 覆盖，否则保持使用默认模型。
   - **每个工作器启动时，向 `out/fleet-ledger.md` 追加一行：**简报路径、会话 ID（启动时打印）、输出路径、启动时间，以及一个空的处置列。该文件是简报与会话映射关系的唯一持久记录——对话记录不会在压缩后保留；没有会话 ID，第 5 步将从一行增量修正退化为对每个进行中工作器进行完整重启。
4. **审查关卡（Claude，强制）。** 阅读每个 `out/` 文件。依据简报的验收标准和 AGENTS.md 中的硬性禁令进行检查。工作器的自检只是证据，不是裁决。如果输出未失败任何验收标准，但存在表面缺陷（拼写错误、格式问题、错误标签），Claude 应直接编辑文件；不要因为一个逗号而重新启动。将裁决写入该简报对应的台账行——`accepted`、`rejected` 或 `fix brief`——并附上当前修正次数。
5. **增量修正，不要重新生成。** 如果输出失败 1-2 项验收标准，发送一行修正指令：`codex exec resume <session-id> "<delta>"`（会话 ID 在启动时打印；在并行运行时使用 `resume --last` 存在歧义）。如果失败 3 项或更多标准，或者违反 AGENTS.md 的硬性禁令，则重新启动，并将增量修正附加到简报中。从头重新生成会浪费订阅额度，也会丢失已经正确的部分。每个输出的修正预算：最多三次真正不同的修正——每次尝试必须改变诊断或策略，绝不能重复上一次。若相同根本原因跨多次尝试重复出现，则提前停止；报告重复原因，并让用户选择下一步操作。
6. **交付。** Claude 将审查通过的结果整合为最终交付物。通过证明而非声称工作器集群已完成：从 `out/` 中的文件读取并返回逐输出的验收标准通过/失败表，并将 `out/fleet-ledger.md` 与已启动的简报进行核对——每份简报都有一行，每一行都带有终态处置。报告启动数量、通过数量、修正数量，以及任何没有已接受输出的简报。

## 简要模板

```markdown
# Brief <id> — <task name>

Read `AGENTS.md` in the workspace root first. This brief only adds the task.

## Job
<one paragraph: what and why>

## Inputs
<file paths the worker must read>

## Deliverable
<exact structure, counts, variants, labels>

## Acceptance criteria (self-check before finishing)
<numbered, mechanically checkable: limits, bans, required elements>

## Output
Write to `out/<file>.md`. <structure spec>
```

## Fleet 工作区

为每项重复性 fleet 任务（社交内容 fleet、测试生成 fleet、重构 fleet）保留一个持久工作区，而不是每次运行时重新构建上下文。工作区根目录存放 `AGENTS.md` 约定、`briefs/` 和 `out/`（包括跨运行持久保留的 `out/fleet-ledger.md`）。当某个 brief 产出通过审查且无需修改时，保留它，经过验证的 brief 就是下一次同类运行的模板。

## 硬性边界

- 工作进程始终是 `codex exec` 进程。不得在任何模型上使用 Claude 模型扇出（`Agent`、`Task`、`Workflow`、子代理）替代工作进程，品牌名称 “Fable Fleet” 不指代 `claude-fable-5`。
- 未经过 Claude 审查关卡，不得交付工作进程输出。
- 工作进程绝不运行 git push、部署或需要凭据的命令；仅在沙箱内执行内容和代码编辑任务。
- 密钥绝不进入 brief 或 AGENTS.md；工作进程获取的是文件路径，而不是令牌。
- 如果工作进程输出违反证据边界或硬性禁令，必须由 Claude 编辑或进行增量运行来修复，绝不能“差不多就行”。

## 故障排除

- `codex exec` 拒绝在仓库外启动：添加 `--skip-git-repo-check`。
- 所有工作进程都在运行中途退出，输出被截断或缺失且没有错误：机器进入了睡眠状态。使用 `caffeinate -i` 前缀启动，并保持屏幕打开（或使用合盖模式）。
- 未登录 / 用量错误：执行 `codex login status`，然后以交互方式运行 `codex login`。
- 工作进程未向 `out/` 写入任何内容：读取 `-o` 最终消息文件和任务输出日志；通常是沙箱拒绝，或 brief 指向了错误路径。
- 并行运行是相互独立的进程；分别使用各自的后台 shell 调用启动，并在完成后收集结果。

## 路由参考

- 多通道 Claude 代理协调，包含关卡和交接 -> suede-agent-teams
- 低产量、高判断密度的文案 -> suede-copy / johnny-suede-write
- 证明组装后的交付物符合规范 -> 私有 Suede Labs 配套工具，
  不在此包中：`suede-verify`
- 此文件的 Skill 编写或 estate-lint 问题 -> 私有 Suede
  Labs 配套工具，不在此包中：`suede-skill-forge`