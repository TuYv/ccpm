---
name: fractal
description: Hierarchical agent loops with recursive self-organization.
argument-hint: '[directive]'
disable-model-invocation: true
---
# Fractal

Fractal 是由自主代理循环组成的树，每个循环都位于各自的 git worktree 中。一个节点会不断迭代以实现目标，并可以生成子节点，让它们并行处理子任务。

此 skill 会先使用用户配置一个节点，然后在 tmux 中启动它；从那之后，节点会自主运行——按需迭代、提交并生成子节点。

你的职责不会在启动时结束。用户（根）节点没有自己的循环——**你就是它。** 节点运行后，你就是它的*操作员*：你需要观察这棵树、引导它，并代表它在节点与用户之间传递信息。参见下方的 **Operator**。

## Directive

`$ARGUMENTS` 是一条描述此 fractal 应执行内容的自然语言指令。请对其进行解释：提炼节点的目标，并将用户明确指定的内容（名称、预算、模型、限制等）映射到下方的参数中；每个参数都会成为对应的 `fractal node init` 标志。`/fractal` skill 会将所有配置路由到 `fractal node init`，并且只会将 `--continue`/`--clean`/`--drain`（当指令要求继续一个现有节点时）传递给 `fractal node start`——此外，如果继续操作同时指定了 `--max-cost`，也会一并传递（继续操作会在启动时重新启用上限，而不是在 init 时启用）。

**参数** — 所有配置项。由 `fractal node init` 设置，写入 `config.json`，并可在启动前在那里编辑：

- **`name`**：节点名称（必填；只能包含字母、数字和 `_`，不能包含 `-`）
- **`path`**：项目根目录、仓库根目录或 monorepo 子项目（默认：`.`）
- **`title`**：人类可读的显示名称（默认：将节点名称去除 slug 格式）
- **`scope`**：将提交限制在 worktree 内的子目录中（逗号分隔，例如 `parent/child,tests`）
- **`base`**：要从其开始的分支（默认：当前分支）
- **`meta`**：用于元配置的目标节点分支
- **`inherit`**：从父节点而不是 package seed 中继承 surfaces
  （逗号分隔：`steps`、`scripts`、`skills`、`config` 或 `all`）；agent 配置始终会继承。顶层生成操作的父节点是用户节点，而用户节点不包含 steps、scripts 或 skills——此参数用于已配置的节点生成子节点的场景
- **`steps`**：包含带 `NN-` 前缀的步骤文件（`*.md`）的目录，用于向 `steps/` 提供 seed，而不是使用 package seed；与 `inherit=steps` 互斥
- **`profile`**：`.fractal/profiles/<name>/` 下的命名 seed bundle——其中的 `steps/` 会提供步骤列表，其 `NODE.md` 是可直接部署的 charter（在 init 时经过 fill-sheet 验证）；与 `steps` 和 `inherit=steps` 互斥
- **`pin`**：commission pin（一个 commit sha）：必须能够解析，并且 profile charter 中的每一行 `pin:` 都必须与其匹配
- **`agent`**：agent 命令；省略时继承用户节点的默认值
- **`provider`**：agent 的 provider 路由（例如 `openrouter`）；省略时继承用户节点的默认值
- **`model`**：模型覆盖值；省略时，agent 使用其自身的默认模型
- **`effort`**：推理工作量覆盖值；省略时，每个 agent seed 自身固定的级别生效，而不是供应商默认值
- **`max-iters`**：每次运行的迭代上限
- **`max-depth`**：子节点嵌套的最大深度
- **`max-children`**：直接子节点的最大数量
- **`max-descendants`**：后代节点总数上限
- **`timeout`**：每次运行的时间限制（例如 `30m`、`1.5h`）
- **`iter-timeout`**：每次迭代的时间限制（例如 `30m`、`1.5h`）
- **`step-timeout`**：每个步骤的时间限制（例如 `30s`、`10m`）；限制每个步骤的执行时间
- **`step-retries`**：失败步骤的重试次数（默认：`1`；`0` 表示禁用）
- **`step-retry-backoff`**：每次步骤重试前的延迟（默认：`10s`）
- **`interval`**：固定的迭代计划（例如 `1h`）
- **`sleep`**：迭代之间的延迟（例如 `10s`）
- **`wait`**：approval-wait 同步调用之间的休眠时间（默认：`1m`）
- **`max-cost`**：每次运行的 USD 成本上限——每次运行彼此隔离，因此每次启动都会重新启用该上限；在一次因预算耗尽而结束的运行之后，`node start --continue` 若未明确指定 `--max-cost` 将拒绝执行
- **`max-iter-cost`**：每次迭代的 USD 成本上限
- **`max-step-cost`**：每个步骤的 USD 成本上限（无法强制执行时仅发出警告）
- **`reserve-budget`**：为清理工作预留的预算；可以使用 USD 数值或 `max-cost` 的 N%（默认：10%）
- **`sync`**：启用（默认）或禁用每个步骤前的 radio sync
- **`detached`**：将每个步骤作为独立的 agent 会话运行（默认：使用一个连续会话）
- **`local`**：每次提交后跳过推送到远程仓库
- **`blind`**：不订阅任何 radio 频道（父节点仍会读取此节点）
- **`sealed`**：封存节点的 mailbox——在操作员或父节点通过 `config set sealed=false` 解封之前，该节点自己的 seat 无法读取托管消息（被封存的 seat 无法解除自身的封存状态）

**启动** — `fractal node start` 只负责启动；所有运行参数都来自
`config.json`。如果在 `config.json` 中设置了 `max_cost`，其值必须为正数；缺少
`max_cost` 时将不设上限地启动，并发出醒目警告。它唯一的参数是：

- **`--continue`**：继续运行已停止/已退出的节点 — 启动时会恢复
  worktree，因此如果存在未提交的项目文件，不带 `--clean` 将拒绝启动
- **`--clean`**：与 `--continue` 一起使用时，丢弃未提交的项目文件
- **`--drain`**：与 `--continue` 一起使用时，将新一轮运行作为 drain 运行 —
  harness 禁止从该运行中生成新的 seat，并禁止从该运行重新启用，同时告知每个
  seat 它正在 drain
  (`_DRAIN`)
- **`--max-cost`**：与 `--continue` 一起使用时，为新一轮运行重新启用成本上限；
  如果上一轮运行因预算耗尽而结束，则必须指定此参数

读取 directive 后，按以下顺序输出：

1. **建议的 NODE.md 指令** — 根据 directive 提炼出的 `## Instructions`
   部分草案；如果无法推断出目标，则跳过。
2. **建议的 NODE.md 完成要求** — 包含具体、可验证条件的
   `## Completion Requirements` 部分草案；如果无法推断出任何条件，则跳过
   （对于没有自然停止点的开放式工作，应改为注明该部分保持为空，并应使用
   `max-iters` 限制运行）。
3. **解读后的参数** — 始终输出：为上方 **Parameters** 中的每个条目各列一行的
   表格，顺序保持不变，并填入从 directive 中读取的值；如果 directive 没有提及，
   则将值留空（使用默认值）。

最后说明无法推断出的内容 — 这是你最后要说的内容。如果缺少 **name** 或
**path**，询问：这个 fractal 应该叫什么名字，以及应该放在哪里？如果当前目录
是一个看起来就是相关项目的 git 仓库，则将当前目录作为 **path**；如果不是 git
仓库，或其看起来并非自然对应的项目，则询问 **path**。然后，最后再询问被跳过的
草案：这个 fractal 应该做什么，以及它的完成要求是什么？无论是推断出的内容还是
询问得到的内容，都要与用户再次逐项确认 — 最后输出完整表格，才能让用户在创建
任何内容之前发现被误解的参数。

即使 directive 已经十分详尽，也要提出能够进一步完善 seed 的后续问题 — 更严格
的完成条件、范围、上限 — 而不是仅凭 directive 继续执行；第 2 步的对话就是确定
这些内容的地方。

初始化后要更改设置，直接编辑 `<node_dir>/config.json`（节点会在启动时读取该文件），
或使用 `fractal node config set <key>=<value>`。运行 `fractal node init --help`
查看完整列表。（`--reset` 也会重新配置，但它会将节点清空为一个标准的空节点 —
见下面的 Reset 情况 — 因此它是重量级选项，而不是用于调整设置的选项。）

成本上限是**软上限**：节点会跟踪支出（包括自身支出及其子节点的支出，也包括
sync），但在达到 `--max-cost` 时不会被*强制*停止 — 它会在预留额度内逐步收尾，
并且循环会在该迭代的边界结束本轮运行。完整的预算规则 — 预留额度定价、
`cost remaining` 语义、每个 agent 在步骤内的执行限制，以及预算耗尽的运行如何
报告 — 以节点中 `skills/fractal/SKILL.md` 的 Cost 部分为准；在向用户提供建议或
读取受限节点的状态时，应在那里查看。

节点在设计上会以提升后的权限运行其代理（Claude
`bypassPermissions`、Codex `danger-full-access`、Grok `always-approve`、opencode
`"permission": "allow"` 加上 `--auto`、omp `approvalMode: yolo` 加上 `--yolo`），
因此它们可以在无人值守的情况下工作——仅启动你信任其自主运行任务的节点。

## 激活

继续之前，先解析以下内容：

- **`path`**：解释后的路径参数，解析为绝对路径。

### 步骤 0：安装 CLI

如果 `fractal` 尚未位于你的 `PATH` 中，请从 PyPI 安装 fractal CLI。
fractal 会调用 `wiki` 命令，因此需要同时安装两者：

```bash
pipx install plasma-fractal
pipx install plasma-wiki
```

（`uv tool install plasma-fractal --with-executables-from plasma-wiki` 可通过一条命令完成相同操作。）

用户可以使用任意管理器安装（uv tool、pipx、pyenv、项目虚拟环境、系统
pip），因此在安装之前，请通过**运行**以下命令检查现有安装，而不要仅通过名称解析来检查：
`fractal --version && wiki --version`——未激活环境中的 pyenv shim 虽然可以在 `PATH`
中解析出来，但执行时会失败。如果一个可正常工作的安装位于 `PATH` 之外，请在本次会话的其余部分中，
凡是本技能要求使用 `fractal` 或 `wiki` 的地方，都使用其绝对路径。只有你自己的 shell
需要注意这一点——fractal 会从其自身的安装中解析辅助 CLI，因此节点侧命令无论如何都能正常工作。

### 步骤 1：初始化

节点的 `<node_dir>/skills/fractal/SKILL.md` 详细记录了生成机制、子节点管理、配置、通信机制以及完整的
CLI；如需进一步了解上下文，请阅读该文件。

确定节点的状态，并据此继续：

1. **指令要求继续**——节点已经存在。从 `fractal node list --path=<path>` 中解析其
   worktree 和节点目录，然后跳过本步骤的其余部分（仓库和节点已经设置好——无需初始化或提交）。

2. **没有继续意图，但该路径和名称下已经存在节点**
   （检查 `fractal node list --path=<path>`）——**询问用户**要如何处理：

   - **继续**——按情况 1 处理（保留状态并继续）。
   - **重置**——清除并重新创建：按情况 3 处理，并在
     `fractal node init` 中添加 `--reset`。`--reset` 会返回一个**初始的空节点**——内存、
     计划、步骤、技能和配置都会全部清除——因此之后需要从头重新编写 NODE.md、步骤和技能
     （从步骤 2 开始）。
   - **取消**——中止。

3. **否则，创建节点。** 自主提交 fractal 自身的产物，无需询问（此处每条命令都是幂等的，因此可以安全地重复运行）：

   1. `fractal init <path> --agent=<agent>`——写入根节点数据
      （`.fractal/`）和项目 wiki（`wiki/`）；如果根目录已经存在则不执行任何操作
      （重新运行可更新已存储的 `--agent`）。对于单仓库中的子项目 `<path>`，这些内容会嵌套在其下方
      （`<path>/.fractal/`、`<path>/wiki/`），而不是位于仓库根目录。`--agent` 设置生成节点所继承的默认代理；
      如果用户没有指定，则当你是 Claude 时默认使用 `--agent=claude`，当你是 Codex 时使用
      `--agent=codex`，当你是 Grok 时使用 `--agent=grok`，当你是 opencode 时使用
      `--agent=opencode`，或者当你是 Oh My Pi 时使用 `--agent=omp`。`--provider` 以相同方式设置默认提供商路由
      （例如，`openrouter` 会通过 `OPENROUTER_API_KEY` 将 claude 或 codex 路由到 OpenRouter；
      没有路由的代理会忽略该选项，省略它则使用各代理自己的端点）。需要了解的路由机制：
      每个节点都可以通过 `fractal node config set provider=null` 清除继承的路由；
      密钥会在启动时被捕获到节点的 tmux 会话中（tmux >= 3.2），因此轮换密钥需要重启节点；
      路由产生的支出会在 OpenRouter 控制面板中审计（账本记录本地估算值）。
   2. `fractal commit "configure <current_branch>" --init`——在用户的基础分支上提交项目 wiki，
      以便节点 worktree 从一个*已提交*的树创建分支（未提交的 wiki 对
      `fractal node init` 不可见）。
   3. `fractal node init <name> ...`（对于情况 2 的“重置”，添加 `--reset`）——创建 worktree 和节点目录。
      `--agent` 是可选的：省略时，节点会自动继承用户节点的默认代理（在步骤 1 中设置的代理）。
      传入从指令中解析出的参数；如果打算传入其他选项，请先与用户确认。如果失败，请停止并报告错误。

项目 `wiki/` 受 **git 跟踪**（node-branch 种子也是如此）——绝不要将其添加到 `.gitignore`。根节点自身的 `.fractal/` 默认在**顶层分支**上被 **git 忽略**，从而将其排除在主历史之外；运行 `fractal track` 也会将其提交到该分支，运行 `fractal untrack` 则可恢复——这两个命令只切换忽略设置并打印后续的 git 命令，绝不会触碰暂存区。Fractal 会自动管理这些内容：其运行时产物（工作树、中央数据库、状态、代理日志）都写入仓库本地的 `.git/info/exclude`，而顶层的 `.fractal/<branch>/` 则通过自身的忽略文件隐藏——绝不会修改已提交的 `.gitignore`。请确保你自己的忽略模式带有锚点（`/artifacts/`，而不是 `artifacts/`），否则它们也会匹配并静默隐藏任意深度处同名的子树，例如节点可提交的 `.fractal/<node>/artifacts/`。

`fractal init` 还会配置 wiki 合并驱动：已提交的 `.gitattributes` 会为生成的 wiki `_index.md` 文件指定 `merge=wiki`，而驱动本身存储在仓库本地的 git 配置中，因此，携带 wiki 页面分支的合并会自动解析生成的索引部分。本地配置不会随克隆保留——在全新克隆中，属性存在但驱动不存在，`_index.md` 的合并会回退到 git 的默认行为，并且可能在生成内容上产生冲突；运行 `wiki config --path=wiki`（对于子项目则使用 `--path=<path>/wiki`）来注册它（使用 `git config --get merge.wiki.driver` 验证）——只有在创建 wiki 时，`fractal init` 才会配置该驱动。

输出中包含项目目录（工作树根目录）和节点数据目录。请从输出中读取这些路径，以便在后续步骤中使用（例如 `<node_dir>/NODE.md`）。

如果输出包含 Obsidian 插件说明，请转告用户——在项目 wiki（`wiki/`）或记忆 wiki（`<node_dir>/memory`）中安装列出的插件并运行 `wiki config --path=<path>`，即可在 Obsidian 中浏览（可选）。

### 步骤 2：定义节点

如果要继续使用现有节点，它已经根据上一次运行的内容完成定义。询问用户是否要保持现有定义不变（继续下一步），还是要更新定义——在重新启动之前，重新讨论下面的相关主题，以调整目标、完成要求、规则、预算或步骤。

与用户对话，定义此节点应执行的任务。按顺序逐一讨论下面的每个主题。自然地提问——不要一次性抛出所有主题。在进入下一个主题前，等待用户对当前主题的回复。

**a) 目标和说明。** 从读取指令时打印的建议说明开始（如果没有打印草案，则从用户对结束问题的回答开始），并询问用户希望完善哪些内容。引导用户明确具体细节：代码库的哪个领域、要开展哪类工作，以及有哪些约束或偏好。节点配置是最具杠杆作用的工作——配置完善的节点可以自主运行数小时；模糊的配置则会浪费预算。推动用户提出具体、可验证的目标，而不是照抄宽泛的陈述。将结果写入 `<node_dir>/NODE.md` 的 `## Instructions` 部分。

**b) 完成要求。** 从读取指令时打印的建议完成要求开始（如果没有打印草稿，则从用户对结束问题的回答开始），询问用户将如何判断该节点已完成。帮助他们阐明具体且可验证的条件。如果工作是开放式的，没有自然的停止点，建议将此部分留空，并使用 `--max-iters` 限制运行次数。将结果写入 `<node_dir>/NODE.md` 的 `## Completion Requirements` 部分。

**c) 规则和约束。** 询问是否有默认规则之外的其他规则——需要避免的文件或目录、需要遵循的模式、需要使用或跳过的工具、样式偏好。如果用户有补充内容，将其追加到 `## Rules` 部分。如果没有，则继续下一步。

**d) 分解。** 始终询问用户希望在多大程度上鼓励该节点进行分解——包括宽度和深度。宽度由 `--max-children` 和 `--max-descendants` 控制（可并行运行的子任务数量）；深度由 `--max-depth` 控制（该节点以下的管理层级数）。这三个选项默认均不受限制，设置为 `0` 可禁用生成子节点。将用户的回答映射为这些上限，并将这一鼓励内容写入 `<node_dir>/NODE.md` 的 `## Instructions` 部分：种子的 Delegation 规则已经规定，具有非零上限的节点应在子任务可分离时生成子任务，因此这里只记录相对于该默认行为的偏离——更积极地进行分解，或者除非子任务明确独立，否则暂缓分解并独自完成工作。

**e) 预算和范围。** 询问成本限制（`--max-cost` 限制每次运行——各次运行彼此隔离；`--max-iter-cost` 限制每次迭代的成本）。`--max-cost` 是可选的，但强烈建议设置：如果不设置，节点将以**不设上限**的方式运行——启动时会发出警告，仅受 `--max-iters`/`--timeout` 限制——因此应确定一个上限，除非用户明确希望不设上限，并明确确认：在启动任何不设上限的节点之前，先询问“确定吗”，并获得肯定答复（用户在本次对话中明确提出不设上限的请求也算作确认）——绝不能默认采用不设上限的方式运行。还建议设置 `--max-iter-cost`。如果节点只能修改特定文件或目录，询问是否需要设置 `--scope`（限制节点可以提交的内容）。对于没有完成要求的开放式工作，建议使用 `--max-iters` 限制迭代次数。

> [!WARNING]
> 将较低的 `--max-cost` 与成本高昂的 `--model` 搭配使用，是最有可能导致预算按百分比大幅超出的组合。运行级别的上限是**软限制**，只会在步骤之间检查，因此单个步骤可能花费整个预算的很大一部分，甚至超过整个预算，直到下一次检查运行时才会超出；`claude` 会使用硬性的单步预算限制每个步骤（从而限制超出额度，但当预算很小时也会截断工作）；`codex` 没有单步上限，因此其超出额度仅受 `--step-timeout` 限制。对于较小的预算，优先选择成本更低的 `--model` 并设置 `--max-iter-cost`；仅当预算足够大、使单个步骤只占其中较小部分时，才使用成本高昂的模型。预算设置的下限：绝不要将 `--max-cost`（或剩余授权额度）设置在模型单轮成本约 2 倍以内——在这一范围内设置上限时，单轮就可能超出预算的很大一部分；这种超出是有记录且被接受的预期行为：不会有任何机制吸收这部分超出。

在节点技能的 Cost 部分会介绍预算下的模型选择经济性——在相同美元上限下，何时选择更便宜的模型才是正确做法，以及哪些角色仍使用前沿模型。

对于输出将被*比较*的运行（A/B 分组、基准测试变体），应从一个固定的 tip 分叉，并在每次运行的配置提交中声明其初始基准：tip sha，以及比较所依据的基线数据。比较应依据所声明的基线，而不是过时的轮次数据。

**f) 远程推送。** 默认情况下，节点在每次提交后都会将其分支推送到 `origin`；`--local` 会让提交保留在本地。应优先使用 `--local`：除非用户明确表示希望将提交推送到远程，否则都应传入该参数。如果没有远程仓库，推送会自动跳过，因此继续即可。

**g) 迭代步骤。** 简要说明每次迭代的工作方式：每个编号步骤开始前都会自动运行同步，以处理无线电通信（收件箱、信息流、父节点指令），然后执行该步骤本身。默认步骤为 prepare、plan、execute、review 和 commit——但可以通过编辑 `<node_dir>/steps/` 添加、删除或替换步骤。询问用户是否希望修改这些步骤。大多数用户会保留默认设置。**同步本身也是一个计费步骤**——每个编号步骤都会运行一次（其提示词来自 `modes/SYNC.md`，该文件**不**列在 `steps/` 中），因此包含 N 个步骤文件的迭代实际上会运行约 2N 次 agent 调用，而仅通过统计 `steps/` 来计算预算会造成低估（每次迭代大致还要额外计算同步成本 × N）。对于轻量级叶节点，可以使用 `--no-sync` 禁用同步。步骤可以携带 YAML frontmatter：`agent: <command>` 会让该步骤使用不同的 agent 运行（每个 agent 会在使用它的各个步骤之间保留自己的 woven session），`provider: <route>` 会覆盖 provider 路由（没有路由的 agents 会忽略该设置），`model: <name>` 会覆盖该步骤使用的模型，`effort: <level>` 会覆盖推理强度，`timeout: <duration>` 会仅为该步骤覆盖节点全局的 `step_timeout`，`detached: true` 会在持续运行的节点中将单个步骤隔离到其自己的 session 中，而 `requires_approval: true` 会在步骤完成后暂停循环，直到操作员批准（`fractal node pending`/`approve`）。

**h) 环境设置。** 询问项目是否需要准备环境（虚拟环境、依赖项、容器、构建步骤）。如果需要，则编辑 `<node_dir>/scripts/setup.sh`。该脚本会在每次迭代开始时自动运行，并且必须具备幂等性。

**i) 验证和测试。** 说明 `<node_dir>/scripts/lint.sh` 会在每次提交前运行，而 `<node_dir>/scripts/test.sh` 会由 agent 在执行期间调用。询问用户是否希望配置其中任意一个。

**j) 审查。** 定义完所有部分后，打印 `<node_dir>/NODE.md` 的最终内容，供用户审查。询问是否需要调整。持续迭代，直到用户满意。

### 步骤 3：启动

打印你即将运行的确切命令，然后**让用户选择**：

- **Launch** — 提交种子并启动节点。
- **Revise** — 先调整节点的定义或选项，然后重新确认。
- **Cancel** — 不要启动。

仅当明确选择 **Launch** 时才继续。

启动获批准后，提交已配置的种子，并从工作树启动节点——fractal 命令会作用于当前目录中的节点，因此无需指定路径：

```bash
cd <worktree>  # .worktrees/<branch>
fractal commit "configure <name>" --init
fractal node start
```

当项目运行 markdown 格式化钩子时，请注意：如果该钩子对种子文件进行了任何重写，`fractal commit --init`
可能会拒绝执行——种子页面受到逐字节保护，只有 wiki 页面会进行保留结构的自动重试；
请按照错误信息中的修复方法操作。切勿自行对 `.fractal/`
种子文件运行项目格式化钩子：步骤 frontmatter（`requires_approval:`、`agent:`
、`timeout:` 等）是承载功能的，通用的 mdformat 会破坏它；此外，`pre-commit run --files`
即使在重写未跟踪文件时也会报告成功。

所有运行参数都已在初始化时设置（位于 `config.json` 中）；`start` 不接受配置参数——在继续一个已停止/已退出的节点时，只能使用
`--continue`（以及用于丢弃未提交项目文件的 `--clean`、用于将新运行作为 drain 运行的 `--drain`，还有用于在因预算结束的运行后重新启用上限的 `--max-cost`）。如果用户想先调整设置，请编辑 `<node_dir>/config.json`，然后再启动。节点会在一个分离的 tmux 会话中启动。

### 第 4 步：启动后简报

节点运行后，简要说明如何与其交互：

- **Steering：** 直接编辑 `<node_dir>/NODE.md`，以调整目标、规则或指令。节点会在每一步重新读取该文件。使用
  `fractal node update` 调整上限——它会同时更新注册表行和子节点的 `config.json`；运行中的循环会在下一次迭代边界拾取这一更改（直接编辑配置也会在同一边界生效，但在循环修复注册表之前，注册表会保持过时）。

- **Monitoring：** 从节点的工作树（`cd <worktree>`）中执行命令时，命令会直接作用于该节点——`fractal node status`、`fractal node cost spent` 以及
  `fractal node attach`（查看实时输出——请使用此命令，而不是原始的 `tmux -t`，后者的前缀匹配可能会连接到错误的会话）。`fractal node list` 会显示该节点的子树（从叶节点工作树运行时，只显示其自身的后代）——从仓库根目录运行它可查看完整树；它只列出正在运行的节点（`--all`
  包含已退休的节点，`--retired` 仅包含已退休的节点）。读取 `<node_dir>/memory/`
  （知识）或 `<node_dir>/plans/`（计划）。一个在 `--max-iters` 后以 `completed` 结束的运行，仅表示迭代预算已耗尽，并不表示目标已经达成——`fractal node status` 会说明具体原因：达到上限时，它会打印
  `completed (run exhausted: Reached max iterations (N))`；而目标达成时的结束状态则保持原样（从父节点或仓库根目录运行 `fractal node list` 时，其
  `detail` 列中也会带有相同的限定信息，并在 `end_reason` 中将其标记为 `run_exhausted`，而不是 `goal_met`）；使用
  `fractal node activity` 查看每次迭代的结果。不同命令的范围有意不同：`cost spent` 读取整个运行的子树（包括子节点），而 `activity` 的
  `cost` 列只汇总该节点自身步骤的成本——并且二者都是按单次运行计算，不提供生命周期汇总。

- **TUI：** 如需实时查看整个树——节点、运行、成本和输出——
  建议用户使用 `fractal open` 打开仪表盘（可在仓库中的任意位置运行；添加节点分支即可打开并聚焦于该节点，或添加树的根分支即可在根节点打开）。

- **停止：** 在 worktree 中，有三个升级级别：

  - `fractal node finish` — 当前迭代结束后停止
  - `fractal node stop` — 当前步骤结束后停止（等待正在执行的步骤完成；绝不会强行中断）
  - `fractal node kill` — 立即终止

  这三个命令都会作用于该节点整个子树中的所有活动后代节点，且按子节点优先的顺序执行——停止一个管理器会停止其下的每个 lane。

- **暂停：** `fractal node pause` 会将子树冻结在当前位置——它会中止每个正在执行的 agent 回合，并让每个循环停留在运行保持打开的状态——而 `fractal node resume` 会从原处准确地重新启动它（预算相同、迭代次数相同；被中断步骤的会话会在可能的情况下继续）。树范围的 `fractal pause` / `fractal resume`（可在仓库中的任意位置运行）会暂停和恢复整个树；暂停还会锁定所有新的 `node init`/`start`——包括新的顶层节点——直到 `fractal resume` 解除暂停（在暂停的祖先节点下执行子树的 `fractal node resume`，或执行树范围的恢复命令，都会被拒绝——暂停锁定会一直持续到 `fractal resume`）。暂停状态是持久的：重启系统，或将仓库复制到另一台机器上的文件系统，都不会丢失该状态。暂停的节点会占用其 spawn 槽位，并阻塞其父节点的 finish-drain；只有 `resume`、`kill` 和 `chat` 会对其生效（可以询问暂停的节点正在做什么——`chat --current` 会派生出被中断的 claude、grok、opencode 或 omp 会话，而 TUI 中的 chat 默认也会这样做；codex 节点则会获得一个全新的会话）。注意区分：`resume` 会在原处继续一个*已暂停*的运行，而 `start --continue` 会在一个已停止/已退出的节点上打开一个*全新的*运行（worktree 会被恢复——未提交的项目文件需要使用 `--clean`，而因预算耗尽的运行若没有明确指定 `--max-cost` 则会被拒绝）。

- **Worktree：** 节点会在
  `<repo>/.worktrees/<branch>/` 中的 git worktree 内运行。用户的仓库不会受到影响。完成后，从仓库根目录运行 `fractal node merge <branch>` 进行合并。如果合并发生冲突，目标 worktree 会准确恢复到原状，解决冲突的工作由你负责：在该处手动重新执行 squash（`git merge --squash <branch>`），解决并暂存冲突，然后使用
  `fractal node merge <branch> --continue` 完成，而不要自行提交——continue 会执行手动完成时容易遗漏的其余合并步骤（移除 seed、刷新 wiki 索引、提交、推进 merge-base），并列出每个解决结果保留了目标内容而非节点内容的文件——节点在这些位置仍保留着自己的版本，因此应将解决结果应用到节点上（或将其退役），否则之后重新合并时会悄悄再次暂存这些版本。之后使用 `fractal node delete <branch>` 删除节点是可选的清理操作，绝不会自动执行——已合并的分支仍具有审计价值（delete 必须在 worktree 外运行）。向 `merge` 传入 `--delete`，即可在一个命令中串联执行这两个操作：每个删除拒绝和确认提示 `[y/N]` 都会在 squash 之前完成预检查，因此无法完成的串联操作不会启动。**Delete 具有破坏性：**它会递归执行——移除节点的整个子树——并强制移除每个 worktree，且**无论分支是否已合并，都会强制删除相应的分支**，因此任何已提交但尚未合并的工作都会丢失。务必先确认 `merge` 已成功（检查其输出）。如果想保留节点的分支而将其隐藏，请改为将其退役。无论是串联执行还是单独执行，Delete 都会提示确认 `[y/N]`；传入 `--force`/`-f` 可跳过提示。

- **重置：** `fractal reset`（可在仓库中的任意位置运行）会一次性拆除树中的所有节点工作树、分支和注册信息；项目、wiki 以及中央数据库中的全部历史记录都会保留，因此可以立即生成新的节点。只要仍有任意节点在运行，它就会拒绝执行；暂停的节点会作为拆除过程的一部分被终止，而确认提示 `[y/N]` 用于授权此操作（`--force`/`-f` 可跳过确认）。

- **树的范围：** 一个仓库可以承载多棵树——每棵树对应一个运行过 `fractal init` 的分支，并拥有各自的用户节点、数据库和历史记录。树范围动词（`pause`、`resume`、`reset`、`track`、`untrack`、`open`）将树的根分支作为可选的第一个参数；如果未提供，则从你自己的分支推断：节点工作树会标识其所属的树，仓库根目录则标识其检出内容。当存在多棵树，而当前检出内容不属于其中任何一棵时，它们会拒绝猜测——请明确指定树。`open` 和 `node list` 也接受节点分支作为该位置的参数，此时范围限定为该节点，而不是整棵树。`destroy` 使用相同的名称参数，但从不进行推断：单独执行 `fractal destroy` 无法判断你是要销毁当前树还是全部内容，因此请指定一棵树或传入 `--all`；后者是唯一的仓库范围动词。

- **通信：** 节点通过 `fractal radio` 命令进行通信。`radio send` 会在至少提供一个路由维度（`--node`/`--parent` 或 `--channel`）的情况下，写入频道权限所允许的内容——完全不带参数的 send 会拒绝执行；`radio post` 是面向公开可读频道（outbox、public）的静默报告动词，不带参数的 post 会发布到你自己的 `outbox`。列表命令（`messages`/`feed`）会显示元数据，但绝不会修改读取状态；`radio read` 会输出完整正文，并写入你的已读回执。回复会路由到对方的收件箱——feed（outbox）中的帖子无法在原处直接回复。运行 `fractal radio --help` 以进一步了解。

可以帮助用户编辑 `NODE.md`、检查进度或读取计划文件。

## 操作者

启动后，节点会自主运行——但用户（根）节点永远不会这样做：它是一个没有循环的被动数据库，是树根处人类的锚点（`"user": true`；永远不会被启动、合并或删除）。其他每个节点都会运行自己的循环；根节点没有循环，因此**你就是操作者。**树开始运行后，你就是*操作者*——你要为根节点做循环为每个节点所做的事情，只是你的父节点是用户，而你的任务是实现用户的意图。像循环一样运行：不要等待别人来要求你行动。先进行监控检查；在环境允许定期检查的情况下保持持续监视；代表用户完全自主地采取行动——引导、执行 `finish`/`stop`/`kill`、合并、生成节点——报告你已经做了什么，而不是先行询问。只有面对真正模糊或不可逆的决定时才暂停；当用户重新限定范围后，立即缩小行动范围。

通过 CLI 操作整棵树——从仓库根目录运行，或按位置参数指定分支。使用 `fractal node list`/`status`/`activity`/`cost` 进行监控，并使用 `chat <branch> "<q>" --current` 向正在运行的代理提问，而不会干扰其循环——`--current` 会派生出实时循环会话（claude、grok、opencode 或 omp）；对于 codex 节点，请通过新的聊天进行提问（省略 `--current`），或使用 `--session ... --resume` 在原会话中继续。根节点会自动订阅其子节点的 `outbox`，但没有自动同步功能，因此需要自行轮询其 radio——使用 `fractal radio read --channel=inbox --unread` 读取其收件箱，并使用 `read --feed --unread` 读取子节点（单跳）；`messages`/`feed` 列表会查看元数据而不会消耗未读状态，而你的读取会以你这个读取者的身份写入回执——向子节点的收件箱发送指令（`radio send <message> --node=<branch> ...`），并发送后继续执行（节点只有在下一次同步时才能看到你）。通过编辑 `NODE.md` 文件（每一步都重新读取）或使用 radio 来引导；批准门控（`node pending`/`approve`）、重新调整限制（`node update`），并合并已完成的子树（合并后删除是可选的整理工作，不是默认操作）。双向传达：向用户报告进度、阻塞事项和成本，并将用户的意图向下转化为编辑、指令和节点生成。可以随时向用户请求输入和反馈，但除非绝对关键，绝不要让问题阻塞行动——根据最佳判断继续，优先采取可逆操作，并记录这些操作。

### 委任

当子节点的启动值得在消耗预算之前进行审查时，应将 init 与
start 分开，并在两者之间设置会签。这个关卡属于社交流程——工具本身不会强制执行——
但它能在种子错误仍可免费修正时及时发现：

1. **委任** — 为子节点执行 init 并编写其种子（NODE.md、caps、steps），
   但不要启动它。
2. **固定种子** — 提交已配置的种子
   （在子节点的工作树中执行 `fractal commit "configure <name>" --init`），并
   记录固定信息：子节点分支的种子提交 sha，以及已审查内容的清单（NODE.md、caps、steps）。
3. **请求会签** — 通过 radio 将固定信息和清单发送给指定的审查者（祖先节点或指定的审查者节点），并等待回复。
4. **仅在获得会签后启动** — 只有在收到会签回复后才能启动子节点。如果子节点的分支已经超出固定的 sha，则视为过期：
   在启动前重新委任（重新审查、重新固定）。

## CLI 参考

运行 `fractal --help` 和 `fractal <command> --help` 可查看所有命令和
选项。默认情况下，命令作用于当前目录中的节点，因此应先 `cd`
进入工作树再对其进行操作；若要从仓库的其他位置操作另一个节点，则按位置参数指定其分支位置（例如 `fractal node status <branch>`）。会写入记录的 radio 动词（send、post、reply、react、unsend、save、unsave、sub、
unsub、channel create/delete）会优先作用于循环导出的 `_NODE`，然后才使用 cwd，因此无论从哪个目录执行，节点写入的记录都会归属于该节点；列表类命令（messages、
sent、relays、feed、thread、subs）也会解析同一个执行节点（优先使用 `_NODE`，
否则使用 cwd），这样节点读取的是自己的写入内容，并且每次都会在 stderr 上以
`as of <instant> (acting as <branch>)` 水印结尾，标明读取时所代表的节点；只有 `radio channel list` 仍限定于 cwd。`--path` 是从工作树外部运行时的备用方式。`fractal node init` 是例外：使用 `<name>` 加上通过 `--path` 指定的项目根目录。

节点会生成自己的子节点——运行中的循环会设置 `_NODE` 环境变量，使得 `fractal node init` 将子节点嵌套在调用节点之下（同一个导出变量也会为 radio 的写入动词命名执行身份）。如果在工作树内部手动运行，但没有该环境变量，则会将节点嵌套在仓库根目录的用户节点之下，因此操作员通常不会手动生成子节点。