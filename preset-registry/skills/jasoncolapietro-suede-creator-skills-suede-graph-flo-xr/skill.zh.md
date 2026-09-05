---
name: suede-graph-flo-xr
description: "Suede Thought Graph shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用随附的 `workflows/suede-graph-flo-xr.js` 工作流，为一次多文件仓库变更搜索相互竞争的方案。在任何实现通道修改工作树之前，它会基于证据做出选择。

## Intake and budget gate

启动前，必须提供以下三项输入：

- **Repo** — 绝对仓库路径。相对路径和 `~` 将安全失败。
- **Scope** — 请求的多文件变更，包括任何受保护路径或约束。
- **Budget** — `light`、`standard` 或 `deep`。

同时检测并传递可用的可选上下文：`deploys`（仓库是否具有部署面）、`liveUrl`（只读生产面）以及 `vault`（外部决策/交接上下文路径）。对于不涉及部署的仓库，缺少这些值不会阻止执行，但不要静默丢弃已知值。

当用户为工作器指定模型（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`）时，传递该模型 — 之后每次工作器调用都会使用该模型，而编排仍使用会话模型。省略时，工作器会静默继承会话模型；如果会话使用的是高成本模型，而用户没有为工作器选择它，则在启动前说明这一点，不要让默认值替用户做决定。一次运行最多可能消耗 200 次工作器调用，因此未选择的继承模型会带来无人作出的成本决策。

如果缺少 repo 或 scope，则停止。用一行报告缺少的输入，提供以下选项：提供仓库路径、描述所需变更，或将单文件编辑转交直接实现，然后等待用户选择。

启动前说明所选范围和预计的最坏情况调用次数：
`light` 预计并允许 **55** 次，`standard` 预计并允许 **110** 次，`deep` 预计并允许 **200** 次 agent 调用。不要根据 scope 推断预算，也不要静默提高上限。如果用户尚未选择预算，则询问并等待。

## Runtime prerequisites

随附的 JavaScript 工作流是适用于 macOS 的 Claude Code 工作流。它需要 `sandbox-exec` 和六个已注册的 `suede-graph-flo-xr-*` agent 配置。安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用此仓库的 `install.sh`，该脚本会将这些配置复制到 `~/.claude/agents`。

Claude Workflow 不会公开 Node `process` 全局变量，因此工作流无法推断其包命名空间。调用方 skill 必须根据调用此 skill 的方式推导该命名空间，并在每次启动时传递它。当被调用的名称带有插件前缀时，`agentNamespace` 就是该前缀本身 — 完整插件使用 `suede-skills`，专注于编排的插件使用 `suede-agent-workflows`。由 `install.sh` 安装或手动复制的无前缀调用名称使用空字符串。该值属于运行时上下文，而不是用户选择项。缺少该值或值未知时，会在第一次 agent 调用前失败。

工作流还无法定位其自身随附的辅助脚本。传递 `helperDir`：被调用 skill 的 `workflows/helpers` 目录的绝对路径（对于此安装，为 `<skill base directory>/workflows/helpers`）。受限制的 Bash 命令会运行这些 `.cjs` 辅助程序 — 每次生成时的限制无法验证包含多行或长度超过约 400 个字符的规则，因此不能使用内联 `node -e` 负载。路径缺失或包含空白字符时，会在第一次 agent 调用前失败；辅助文件缺失则会显示 Scout 设置失败。

携带负载的辅助程序调用通过固定前缀放行（辅助程序路径加上 worktree、临时根目录或 base SHA），而不是匹配精确字符串；每个辅助程序都会验证其剩余 argv，而差异证明 — 而非限制机制 — 仍然负责检查实际应用的内容是否与所选 bundle 一致。

选定的补丁会以有界的 base64 分块形式送达应用器，并暂存到运行的私有临时根目录中，因为 clamp verifier 无法解析携带数千字节内联负载的命令。每次追加都会携带其偏移量和 FNV-1a 校验和，`--apply` 在解码前会验证总长度和负载校验和，因此输入错误的分块会快速失败并给出重试指示，而不是生成损坏的补丁。

仅安装 skill 文件夹、使用通用 skills-CLI 安装，或安装 Codex 插件，本身都不会注册或执行 Claude Workflow agent 配置文件。在这些环境中，应将此文件视为编排契约，并将变更转交直接实现；不要声称已运行捆绑的工作流。要在手动复制单个 skill 后于 Claude Code 中启用它，还需将此仓库的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，然后重启 Claude Code。

所请求的 Scout 设置命令会将 `/usr/bin/sandbox-exec` 作为其第一个子进程进行探测，先于获取或创建 worktree。如果调用了该命令且探测失败，Scout 会在其设置变更之前报告失败。返回的 Scout 证据仍然是模型证明，而不是主机执行回执。对于之后报告的任何 sandbox 拒绝，Gate 同样会保持阻断。绝不要在 sandbox 外重试 acceptance 命令，以将该阻断转为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
})
```

工作流按依赖顺序执行以下操作：

1. **Generate** 根据 Scout 和 research 证据生成相互独立的实现计划。
2. **Score** 从覆盖范围、证据、可行性、安全性和效率等方面为每个计划评分。
3. **KeepBestN** 以确定性方式裁剪评分后的候选束。
4. **Refute** 使用有证据支持的异议攻击保留下来的计划。
5. **Improve** 修复反驳并非致命问题的计划。
6. **Aggregate** 合并相互兼容的保留分支，但不合并相冲突的文件所有权。
7. **Select** 选择一个确定性的获胜者。

只有 **Select** 选出的计划可以修改文件。被拒绝、被裁剪和未选中的思路仅作为证据保留；绝不要凭推测实现它们。

## 边界

当预算耗尽时，工作流会在下一次 agent 调用或整个修改批次之前停止；它不会撤销更早完成的修改。除非独立的只读验证器确认存在一个干净、已注册的 origin/main worktree，且该 worktree 位于一个直接的 `${REPO}.worktrees/ship-*` 子目录中，并具有相同的 Git common directory，同时候选文件不是符号链接且其真实路径仍位于该目录内，否则它会在任何修改之前停止。大小写折叠或 Unicode 规范化后的路径别名会在图搜索之前直接失败关闭。对于受跟踪的 secret、活动中的目标 worktree、受保护 WIP 冲突、重复的文件所有者、溢出的安全清单，或不存在可选计划的情况，它同样会停止。Scout 会解析以 NUL 分隔的 Git porcelain，因此重命名两侧都会受到保护；它会解析带有路径组件边界的 `lsof -Fn` CWD 字段；并且绝不会仅仅因为已提交的历史通过 cherry-landed，就丢弃新近的 dirty 或 live 声明。选定的 Build 或 Fix 结果如果被阻断、缺少上下文、失败，或报告没有变更路径，则会在下一验证阶段之前停止；如果结果完成但带有明确说明的疑虑，则继续执行，这些疑虑会传递到 review 阶段和交接中。补丁作者会收到完整的范围检查清单作为契约上下文，因此其他分支锁定的名称会被导入，而不是靠猜测。在停止时，用一行指出阻断因素，并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的 WIP、解决冲突、选择更高的预算，或提供缺失的上下文），然后等待。停止期间不要重新启动或进行修改。

### 读取搜索停止信息

空搜索过去无论以何种方式结束，都会报告 `no safe graph winner`，因此基础设施故障和真实的证据冲突会打印出相同的行。现在，停止输出会指明具体发生的情况，而 `haltDetail` 会携带其背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 本次运行中没有任何思路获得过评分。问题出在基础设施，而不是证据上，重新运行即可。 |
| `no candidate reached Select` | 搜索因其他原因在上游耗尽；读取 `graph.dropped`。 |
| `every finalist lost its score before Select` | 存在最终候选项，但它们因未获得评分而被剪枝。 |
| `every finalist was pruned before Select` | 最终候选项因非评分原因被剪枝。 |
| `every finalist carries a degraded or missing score` | 最终候选项到达 Select 时没有有效评分。 |
| `every finalist failed deterministic plan eligibility` | 真实拒绝。`haltDetail.eligibilityRejections` 会列出每个原因。 |
| `no safe graph winner` | 以上情况均不符合，读取 graph。 |

`haltDetail.infrastructureDegraded` 与原因相互独立：两者可以同时为
true。读取原因，了解是什么停止了 Select；读取该标志，了解为其提供候选池的部分发生了什么降级。

评分调用是只读且幂等的，因此传输层级的失败会被重试：
每次调用重试两次，全运行范围内最多不超过 agent 上限的 5%，并且一旦剩余预算降至预留下限（上限的 20%）就会完全拒绝重试。格式错误的评分绝不会重试，因为 schema 在工具层强制执行，所以无效评分是一项需要保留的判断，而不是需要重新拨号的连接。每次尝试和每次被拒绝的重试都会记录到
`graph.scoreRetries` 中，而 `scoreReliability` 会在每次运行的结果中返回，无论运行是否停止：一次导致两个最终候选项受损的故障，也会使一个继续执行并最终交付的运行发生降级。

Claude 注册的 agent 配置文件强制执行工具隔离：本地读取器没有 shell、写入或 web 工具；公共 web 读取器没有本地文件或 shell 工具；补丁作者没有变更工具；应用者/验证者仅有 Bash 加结构化输出。补丁作者返回 unified diff，由一个受限制的应用者应用这些差异；一个单独预留预算且受限制的验证者，会在每次 Build 或 Fix Apply 后立即比较精确的路径集合和 diff 摘要，且在任何读取器或 Gate 调用之前执行。补丁验证会在 Apply 之前拒绝符号链接、gitlinks、二进制补丁、重命名、复制和文件类型转换。Gate 运行仅允许在 macOS `sandbox-exec` 下执行列入 allowlist 的本地验证
命令，不允许联网；主机读取范围仅限于运行时/系统根目录、工作树、在精确的 Gate 限制范围内再次推导出的 `.git` 公共目录，以及本次运行的私有临时根目录。模型报告的公共目录绝不会被插入 sandbox 权限中。写入范围仅限于已知的生成产物和该私有临时根目录。
allowlist 包含针对 Node、Python、Go、Rust、Make、Swift Package Manager 的有界项目本地检查、使用私有临时根目录下 derived data 的 Xcode simulator 构建，以及离线 Gradle 验证。嵌套模块的 `build` 根目录只能根据该模块 `src` 树下的选定文件推导；如果符号链接或 realpath 可能逃逸出工作树，则会被拒绝。Gate 之后会运行第二次 diff 证明，并对二进制 Git diff 以及每个报告文件的模式、大小和字节进行哈希处理，其中包括未跟踪的新增文件。

Gate 会在验收命令启动前移除类似凭据和解释器注入的环境变量，然后重定向 home、临时和缓存路径。如果某项检查依赖于被移除的凭据，则将其报告为未验证；绝不要仅为获得通过结果而在沙箱外重新运行该检查。

成功应用的阻塞项补丁不会被视为已在语义上解除。原始阻塞项仍保留在 `fixedBlockersPendingVerification` 中。Gate 尝试会记录其确切的命令集和报告的输出，但无法证明这些命令确实运行过，因为 Workflow API 不会公开受信任的必需工具执行回执。因此，工作流会根据代理报告设置 `claimedPassed`，强制设置 `passed:false`，设置 `gateVerified:false`，并将 verdict 和 handoff 状态保持为 `hold`。只有具备不可变执行回执的受信任外部运行器，才能提升该证据的可信级别。

这些控制措施具有明确的信任边界。当代理调用 Bash 时，`bashCommandClamp` 会限制 Bash 命令；Claude Workflow 不提供必需工具调用回执，因此结构化验证器响应仍然是模型声明，而不是 Bash 已运行这一事实的加密证明。同样，`authority`、`allowedRepo`、`allowedFiles` 和 `allowedCommands` 是审计元数据，而不是文件系统权限。本地读取器工具与 Web 工具相互分离，但 Workflow API 不会对路径实施沙箱限制。在任何涉及安全的交接中都要报告这些事实，不要将结果描述为经过主机认证。

生产环境检查为只读操作。此技能绝不会部署、发布、发行、推送、合并、修改凭据、删除或还原受保护的工作，也不会声称已完成实时验证。它不会选择用户的预算，也不会决定可以跳过缺失的范围。它给出的 ship verdict 是供用户参考的证据，而不是执行外部操作的授权。

## 交接与完成

读取工作流返回的 `runKey`，以及从其隔离工作树中得到的经过验证且唯一的 `ship-<UUID>` 叶节点。在运行完成时，使用返回的交接 Markdown。在 Scout 之后停止时，根据结构化结果和图追踪编写一份事实性的停止交接记录，无需再次调用代理；其中应包含停止前已完成的任何 Build 或 Fix lane。如果 Scout 在 `runKey` 验证前返回无效路径，则报告停止情况，但不要编写与运行键关联的交接记录。否则，将其保存到目标仓库根目录下的
`.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证其存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、选定的计划（如有）、Gate 结果、已更改的文件、运行过的命令以及明确的注意事项。本地图已完成并不能证明部署已完成。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自苏黎世联邦理工学院 ETH Zurich 的 Graph of Thoughts。完整的上游 BSD 声明、条件、免责声明和要求的引用随此技能一同存放于
`LICENSE.graph-of-thoughts-BSD.txt`。每次重新分发该工作流的源代码或二进制文件时，都必须保留该文件。

## 路由

- 高容量、定义明确、相互独立的工作任务 → 单独的私有 worker-fleet pass。
- 仅针对现有 diff 的审查 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅复制内容搜索和发布准备 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将多文件实现计划搜索与一个选定的可变更胜者一并路由回 `suede-graph-flo-xr`。