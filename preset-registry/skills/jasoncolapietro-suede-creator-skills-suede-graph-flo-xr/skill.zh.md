---
name: suede-graph-flo-xr
description: "Suede Thought Graph shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用随附的 `workflows/suede-graph-flo-xr.js` 工作流，为一次多文件仓库变更搜索竞争方案。它会在任何实施通道修改工作区之前，做出有证据支持的选择。

## 输入与预算门控

启动前，要求提供全部三个输入：

- **仓库** — 绝对仓库路径。相对路径和 `~` 均会闭合失败。
- **范围** — 请求的多文件变更，包括任何受保护路径或约束。
- **预算** — `light`、`standard` 或 `deep`。

还应在可用时检测并传递可选上下文：`deploys`（仓库是否具有部署面）、`liveUrl`（只读生产环境入口）和 `vault`（外部决策/交接上下文路径）。对于不部署的仓库，缺少这些内容不会阻止执行，但不要悄然丢弃已知值。

当用户为工作进程指定模型（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`）时，传递该值——此后每次工作进程调用均在该模型上运行，而编排仍使用会话模型。省略时，工作进程会静默继承会话模型；如果会话使用的是昂贵模型且用户未为工作进程选择模型，请在启动前说明，而不要让默认值自行决定。一次运行最多可花费 200 次工作进程调用，因此继承未经选择的模型是一项无人做出的成本决策。

如果缺少仓库或范围，则停止。用一行报告缺失的输入，提出可提供仓库路径、描述所需变更，或将单文件编辑转为直接实施，然后等待用户选择。

启动前说明所选范围和预计的最坏情况调用次数：`light` 预计并允许 **55** 次，`standard` 预计并允许 **110** 次，`deep` 预计并允许 **200** 次总代理调用。不要根据范围推断预算，也不要悄然提高上限。如果用户尚未选择预算，请询问并等待。

## 运行时前提条件

随附的 JavaScript 工作流是一个适用于 macOS 的 Claude Code 工作流。它需要 `sandbox-exec` 以及六个已注册的 `suede-graph-flo-xr-*` 代理配置文件。安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用此仓库的 `install.sh`，后者会将配置文件复制到 `~/.claude/agents`。

Claude Workflow 不提供 Node `process` 全局对象，因此该工作流无法推断其包命名空间。调用此技能的技能必须根据此技能的调用方式推导该值，并在每次启动时传递它。当调用名称带有插件前缀时，`agentNamespace` 就是该前缀原样——完整插件使用 `suede-skills`，聚焦编排插件使用 `suede-agent-workflows`。由 `install.sh` 安装或手动复制的无前缀裸调用名称，则使用空字符串。这是运行时上下文，不是用户选择。缺失或未知的值会在首次代理调用之前失败。

该工作流也无法定位自身随附的辅助脚本。请传递 `helperDir`：所调用技能的 `workflows/helpers` 目录的绝对路径（对于此安装，为 `<skill base directory>/workflows/helpers`）。受限制的 Bash 命令会运行这些 `.cjs` 辅助程序——每次生成的限制无法验证多行或长度约超过 400 个字符的规则，因此不能使用内联 `node -e` 负载。缺失或包含空白字符的路径会在首次代理调用之前失败；缺少辅助文件会以 Scout 设置失败的形式出现。携带负载的辅助程序调用通过固定前缀获准（辅助程序路径加上工作区、临时根目录或基础 SHA），而不是通过精确字符串；每个辅助程序都会验证其其余 `argv`，而差异证明——不是限制器——仍然是核实所应用内容与所选包匹配的依据。

所选补丁会以有界的 base64 分块形式到达应用器，并暂存到本次运行的私有临时根目录中，因为 clamp verifier 无法解析携带数千字节内联负载的命令。每次追加都会携带其偏移量和 FNV-1a 校验和，而 `--apply` 会在解码前验证总长度和负载校验和，因此输入错误的分块会快速失败并给出重试指令，而不会生成损坏的补丁。

仅安装 skill 文件夹、使用通用 skills-CLI 安装，以及 Codex 插件本身，都不会注册或执行 Claude Workflow agent profiles。在这些环境中，应将此文件视为编排契约，并将变更交由直接实现；不要声称捆绑的工作流已运行。要在手动复制单个 skill 后于 Claude Code 中启用它，还需要将 skill 自带的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，然后重启 Claude Code。

请求的 Scout 设置命令会将 `/usr/bin/sandbox-exec` 作为其第一个子进程进行探测，先于获取或创建 worktree。如果调用了该命令且探测失败，Scout 会在其设置变更之前报告失败。返回的 Scout 证据仍然是模型证明，而不是主机执行回执。对于之后报告的任何沙箱拒绝，Gate 也会保持阻断。绝不要在沙箱外重试 acceptance 命令来将该阻断变为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
})
```

工作流会按依赖顺序执行以下操作：

1. **Generate** 根据 Scout 和 research 证据生成彼此独立的实现计划。
2. **Score** 从覆盖范围、证据、可行性、安全性和效率方面为每个计划评分。
3. **KeepBestN** 确定性地裁剪评分后的候选束。
4. **Refute** 使用有证据支持的异议攻击保留下来的计划。
5. **Improve** 修复反驳并非致命的计划。
6. **Aggregate** 合并相互兼容的保留分支，但不合并相冲突的文件所有权。
7. **Select** 选择一个确定性的胜出者。

只有由 **Select** 选中的计划可以修改文件。被拒绝、被裁剪和未选中的思路仅作为证据保留；绝不要对它们进行推测性构建。

## 边界

当预算耗尽时，工作流会在下一次 agent 调用或整个变更批次之前停止；不会撤销之前已完成的变更。除非独立的只读验证器确认存在一个干净、已注册的 origin/main worktree，且该 worktree 位于单个直接的 `${REPO}.worktrees/ship-*` 子目录中，并具有相同的 Git common directory，候选文件也不是符号链接且其 realpath 仍位于该目录内，否则工作流会在任何变更之前停止。大小写折叠或 Unicode 规范化后的路径别名会在图搜索前直接失败关闭。对于已跟踪的 secret、活动中的目标 worktree、受保护 WIP 冲突、重复的文件所有者、溢出的安全清单或没有可选计划的情况，工作流也会停止。Scout 会解析 NUL 分隔的 Git porcelain，因此重命名的两侧都会受到保护；它会解析带有路径组件边界的 `lsof -Fn` CWD 字段，并且绝不会仅仅因为已提交的历史记录通过 cherry-landed 就丢弃新产生的 dirty 或 live 声明。选中的 Build 或 Fix 结果如果被阻塞、缺少上下文、失败，或报告没有变更路径，也会在下一次验证阶段之前停止；如果结果已完成但明确提出了疑虑，则继续执行，而这些疑虑会传递到 review 阶段和交接中。补丁作者会收到完整的 scope checklist 作为契约上下文，因此另一分支锁定的名称会被导入，而不是靠猜测。在停止时，用一行说明阻断原因，并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的 WIP、解决冲突、选择更高的预算，或提供缺失的上下文），然后等待。停止期间不要重新启动或进行变更。

### 读取搜索停止信息

空搜索过去无论以何种方式结束，都会报告 `no safe graph winner`，因此基础设施故障和真实的证据冲突会打印出同一行。现在，停止输出会标明具体发生了哪种情况，而 `haltDetail` 则会携带其背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 运行中从未有任何思路获得评分。问题出在基础设施，而不是证据 — 重新运行。 |
| `no candidate reached Select` | 搜索因其他原因在上游耗尽；读取 `graph.dropped`。 |
| `every finalist lost its score before Select` | 存在最终候选项，但它们因未获得评分而被裁剪。 |
| `every finalist was pruned before Select` | 最终候选项因非评分原因被裁剪。 |
| `every finalist carries a degraded or missing score` | 最终候选项到达 Select 时没有有效评分。 |
| `every finalist failed deterministic plan eligibility` | 真实拒绝。`haltDetail.eligibilityRejections` 列出了所有原因。 |
| `no safe graph winner` | 以上情况均不符合 — 读取图。 |

`haltDetail.infrastructureDegraded` 与原因彼此独立：两者可以同时为
true。读取原因，了解是什么阻止了 Select；读取该标志，了解为其提供候选池的部分发生了什么降级。

评分调用是只读且幂等的，因此传输层面的中断会被重试：
每次调用重试两次，全运行范围内最多占 agent 上限的 5%，并且一旦剩余预算降至预留下限（上限的 20%），就会完全拒绝重试。格式错误的评分绝不会重试 — schema 在工具层强制执行，因此无效评分是需要保留的判断，而不是需要重新拨号的连接。每次尝试以及每次被拒绝的重试都会写入 `graph.scoreRetries`，而 `scoreReliability` 会在每次运行的结果中返回，无论运行是否停止：即使一次故障导致两个最终候选项受损，也会降低一个继续执行并最终交付的运行的可靠性。

Claude 注册的 agent profiles 强制执行工具分离：本地读取器没有 shell、写入或 web 工具；公共 web 读取器没有本地文件或 shell 工具；补丁作者没有修改工具；而应用器/验证器只有 Bash 加结构化输出。补丁作者返回 unified diffs，由一个受限制的 applier 应用；一个单独预留预算且受限制的 verifier 会在每次 Build 或 Fix Apply 之后、任何 reader 或 Gate 调用之前立即比较精确的路径集合和 diff 摘要。补丁验证会在 Apply 之前拒绝符号链接、gitlinks、二进制补丁、重命名、复制和文件类型转换。Gate 运行只允许在 macOS `sandbox-exec` 下执行列入 allowlist 的本地验证
命令，不使用网络；主机读取范围限制为运行时/系统根目录、工作树、在精确的 Gate clamp 内再次推导出的 `.git` common directory，以及运行的私有临时根目录。模型报告的 common directory 绝不会被插入 sandbox 权限配置。写入范围限制为已知的生成产物和该私有临时根目录。allowlist 包含针对 Node、Python、Go、Rust、Make、Swift Package Manager 的有界项目本地检查、将派生数据置于私有临时根目录下的 Xcode simulator 构建，以及离线 Gradle 验证。嵌套模块的 `build` 根目录只能根据该模块 `src` 树下的所选文件推导；如果符号链接或 realpath 可能逃逸出工作树，则会被拒绝。Gate 之后还会运行第二次 diff 证明，对二进制 Git diff 以及每个报告文件的模式、大小和字节进行哈希处理，其中包括未跟踪的新增文件。

Gate 会移除类似凭据和解释器注入的环境变量，然后在接受命令启动前重定向主目录、临时目录和缓存路径。如果某项检查依赖于已移除的凭据，请将其报告为未经验证；绝不可仅为获得通过结果而在沙箱外重新运行它。

成功应用的阻断项补丁不视为已在语义上清除。原始阻断项仍保留在 `fixedBlockersPendingVerification` 中。Gate 尝试会记录其确切命令集和报告的输出，但它无法证明这些命令确实运行过，因为 Workflow API 不提供受信任的必需工具执行回执。因此，工作流会根据代理报告设置 `claimedPassed`，强制设为 `passed:false`，设为 `gateVerified:false`，并将裁决和交接状态保持为 `hold`。只有具备不可变执行回执的受信任外部运行器才能提升该证据。

这些控制具有明确的信任边界。`bashCommandClamp` 会在代理调用 Bash 命令时对其加以约束；Claude Workflow 不提供必需工具调用回执，因此结构化验证器响应仍然只是模型证明，而非 Bash 已运行的密码学证据。同样，`authority`、`allowedRepo`、`allowedFiles` 和 `allowedCommands` 是审计元数据，而非文件系统权限。本地读取工具与 Web 工具相互隔离，但不受 Workflow API 的路径沙箱限制。请在任何安全敏感的交接中报告这些事实，且不要将结果描述为已获主机认证。

生产环境检查为只读。此技能绝不部署、发布、推送、合并、更改凭据、删除或还原受保护的工作，或声称已完成线上验证。它不会选择用户的预算，也不会判定可跳过缺失的范围。其发布裁决是供用户参考的证据，而不是执行外部操作的授权。

## 交接与完成

读取工作流返回的 `runKey`，即其隔离工作树中已验证且唯一的 `ship-<UUID>` 叶节点。对于已完成的运行，使用返回的交接 markdown。对于 Scout 之后的暂停，请根据结构化结果和图追踪撰写事实性的暂停交接，而无需再消耗一次代理调用；应包含暂停前已完成的任何 Build 或 Fix 通道。如果 Scout 在 `runKey` 验证之前返回无效路径，请报告暂停，但不要写入以运行键为名的交接。否则，将其保存到目标仓库根目录的 `.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证其存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、所选计划（如有）、Gate 结果、变更文件、运行的命令以及明确的注意事项。已完成的本地图并不能证明已部署。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自 ETH Zurich 的 Graph of Thoughts。完整的上游 BSD 通知、条件、免责声明和请求引用随此技能一并位于 `LICENSE.graph-of-thoughts-BSD.txt`。在对工作流进行任何源代码或二进制再分发时，请保留该文件。

## 路由

- 高容量、定义明确、相互独立的工作任务 → 单独的私有
  worker-fleet 轮次。
- 仅针对现有 diff 的审查结果 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅复制内容搜索和发布准备 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将多文件实现计划搜索与一个
  选定的可变更获胜者路由回 `suede-graph-flo-xr`。