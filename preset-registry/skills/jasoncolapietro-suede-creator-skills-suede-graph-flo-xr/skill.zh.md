---
name: suede-graph-flo-xr
description: "Suede Thought Graph shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用随附的 `workflows/suede-graph-flo-xr.js` 工作流，为一次涉及多个文件的仓库变更搜索相互竞争的方案。在任何实现通道修改工作树之前，它会基于证据做出选择。

## 接收与预算门控

启动前，必须提供以下三项输入：

- **Repo** — 绝对仓库路径。相对路径和 `~` 将安全失败。
- **Scope** — 请求的多文件变更，包括任何受保护路径或约束条件。
- **Budget** — `light`、`standard` 或 `deep`。

同时，在可用时检测并传递可选上下文：`deploys`（仓库是否具有部署面）、`liveUrl`（只读生产面）以及 `vault`（外部决策/交接上下文路径）。对于不进行部署的仓库，缺少这些值不会阻止执行，但不要默默丢弃已知值。

当用户为工作器指定模型（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`）时，传递该模型——之后每次工作器调用都会使用该模型，而编排仍使用会话模型。若未指定，工作器会静默继承会话模型；如果会话使用的是昂贵模型，而用户没有为工作器选择该模型，则在启动前说明这一点，而不是让默认值替用户做决定。一次运行最多可能消耗 200 次工作器调用，因此未选择却继承的模型是一项没人做出决定的成本决策。

如果缺少 repo 或 scope，则停止。用一行报告缺少的输入，并提供以下选项：提供仓库路径、描述所需变更，或将单文件编辑转交直接实现；然后等待用户选择。

在启动前，说明所选范围和预计最坏调用次数：
`light` 预计并允许 **55** 次，`standard` 预计并允许 **110** 次，`deep` 预计并允许 **200** 次代理调用。不要根据 scope 推断预算，也不要默默提高上限。如果用户尚未选择预算，则询问并等待。

## 运行时前置条件

随附的 JavaScript 工作流是一个适用于 macOS 的 Claude Code 工作流。它要求具备 `sandbox-exec` 和六个已注册的 `suede-graph-flo-xr-*` 代理配置。请安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用本仓库的 `install.sh`，将这些配置复制到 `~/.claude/agents`。

Claude Workflow 不会暴露 Node `process` 全局变量，因此工作流无法推断其包命名空间。调用该 skill 的 skill 必须根据此 skill 的调用方式推导命名空间，并在每次启动时传递它。当调用名称带有插件前缀时，`agentNamespace` 就是该前缀本身——完整插件使用 `suede-skills`，专用编排插件使用 `suede-agent-workflows`。由 `install.sh` 安装或手动复制、且不带前缀的调用名称，使用空字符串。这是运行时上下文，而不是用户选项。缺失或未知的值会在第一次代理调用前失败。

工作流也无法定位其自带的辅助脚本。请传递 `helperDir`：被调用 skill 的 `workflows/helpers` 目录的绝对路径（对于此安装，即 `<skill base directory>/workflows/helpers`）。受限的 Bash 命令会运行这些 `.cjs` 辅助脚本——每次生成时的限制器无法验证跨多行或长度大约超过 400 个字符的规则，因此无法使用内联 `node -e` 负载。缺少路径或路径包含空白字符会在第一次代理调用前失败；缺少辅助文件则会显示为 Scout 设置失败。

携带负载的辅助脚本调用通过固定前缀获准（即辅助脚本路径加上 worktree、临时根目录或基础 SHA），而不是依赖精确字符串；每个辅助脚本都会验证其余的 argv，而差异证明——而非限制器——仍然负责检查实际应用的内容是否与选定的方案包一致。

选定的补丁会以分块的 base64 数据形式到达应用器，并暂存到本次运行的私有临时根目录中，因为 clamp verifier 无法解析携带多 KB 内联负载的命令。每次追加都会携带其偏移量和 FNV-1a 校验和，而 `--apply` 会在解码前校验总长度和负载校验和，因此输入错误的分块会快速失败并给出重试指令，而不是生成损坏的补丁。

仅安装 skill 文件夹、使用通用 skills-CLI 安装，以及安装 Codex 插件，本身都不会注册或执行 Claude Workflow agent 配置。在这些环境中，应将此文件视为编排契约，并将变更交由直接实现；不要声称捆绑的工作流已运行。要在手动复制单个 skill 后于 Claude Code 中启用它，还需将此仓库的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，然后重启 Claude Code。

请求的 Scout 设置命令会将 `/usr/bin/sandbox-exec` 作为其第一个子进程进行探测，早于获取或创建 worktree。如果调用了该命令且探测失败，Scout 会在其设置变更之前报告失败。返回的 Scout 证据仍然只是模型证明，而不是主机执行回执。任何后续报告的沙箱拒绝也会触发 Gate。绝不要在沙箱之外重试 acceptance 命令，以试图将该阻止状态变为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
})
```

工作流按依赖顺序执行以下操作：

1. **Generate** 根据 scout 和 research 证据生成相互独立的实现计划。
2. **Score** 根据覆盖范围、证据、可行性、安全性和效率为每个计划评分。
3. **KeepBestN** 以确定性方式剪枝评分后的候选束。
4. **Refute** 使用有证据支持的反对意见攻击留存的计划。
5. **Improve** 修复其反驳并非致命问题的计划。
6. **Aggregate** 合并相互兼容的留存泳道，但不合并相冲突的文件所有权。
7. **Select** 选择一个确定性的胜者。

只有 **Select** 选出的计划可以修改文件。被拒绝、被剪枝和未选中的思路只能作为证据保留；绝不要基于它们进行推测性构建。

## 边界

当预算耗尽时，工作流会在下一次 agent 调用或整个变更批次之前停止；它不会撤销更早完成的变更。除非独立的只读验证器确认存在一个干净、已注册的 origin/main worktree，且该 worktree 位于一个直接的 `${REPO}.worktrees/ship-*` 子目录中，并具有相同的 Git common directory，候选文件也不是符号链接且其 realpath 仍位于其中，否则它会在任何变更之前停止。大小写折叠或 Unicode 规范化后的路径别名会在图搜索之前安全失败。对于已跟踪的 secret、活动中的目标 worktree、受保护的 WIP 冲突、重复的文件所有者、溢出的安全清单，或不存在可选计划的情况，它也会停止。Scout 会解析以 NUL 分隔的 Git porcelain，因此重命名的两侧都会受到保护；会解析带有路径组件边界的 `lsof -Fn` CWD 字段；并且绝不会仅仅因为已提交的历史通过 cherry-landed，就丢弃新近的脏状态或活动中的声明。任何被选中的 Build 或 Fix 结果如果被阻止、缺少上下文、报告疑虑、失败，或报告没有变更路径，也会在下一次验证阶段之前停止。停止时，用一行指出阻止原因，并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的 WIP、解决冲突、选择更高的预算，或提供缺失的上下文），然后等待。处于停止状态时不要重新启动或进行变更。

### 读取搜索暂停原因

空搜索过去会报告 `no safe graph winner`，无论搜索因何结束，因此基础设施波动和真实的证据冲突会打印出同一行。现在暂停输出会指出具体发生了什么，而 `haltDetail` 则携带背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 本次运行中没有任何思路获得评分。是基础设施问题，而不是证据问题——请重新运行。 |
| `no candidate reached Select` | 搜索因其他原因在上游耗尽；请读取 `graph.dropped`。 |
| `every finalist lost its score before Select` | 存在决选项，但它们因未获得评分而被剪枝。 |
| `every finalist was pruned before Select` | 决选项因非评分原因被剪枝。 |
| `every finalist carries a degraded or missing score` | 决选项到达 `Select` 时没有有效评分。 |
| `every finalist failed deterministic plan eligibility` | 真实拒绝。`haltDetail.eligibilityRejections` 会列出所有原因。 |
| `no safe graph winner` | 以上情况均不适用——请读取图。 |

`haltDetail.infrastructureDegraded` 与原因相互独立：两者可以同时为真。请读取原因以了解是什么停止了 `Select`，并读取该标志以了解为其提供候选池的部分发生了什么降级。

评分调用是只读且幂等的，因此传输层级的失败会被重试：每次调用重试两次，全局上限为 agent ceiling 的 5%，并且一旦剩余预算降至预留下限（ceiling 的 20%），就会完全拒绝重试。格式错误的评分绝不会重试——schema 在工具层强制执行，因此无效评分是需要保留的判断，而不是需要重新拨号的连接。每次尝试以及每次被拒绝的重试都会记录在 `graph.scoreRetries` 中，而 `scoreReliability` 会在每次运行的结果中返回，无论运行是否暂停：即使某次波动导致两个决选项受影响，也会使最终继续交付的运行发生降级。

Claude 注册的 agent profiles 强制执行工具隔离：本地读取器没有 shell、写入或 web 工具；公共 Web 读取器没有本地文件或 shell 工具；补丁作者没有变更工具；而应用器/验证器只有 Bash 和结构化输出。补丁作者返回 unified diffs，由一个受限的应用器应用这些补丁；另一个单独预留预算且受限的验证器会在每次 Build 或 Fix Apply 之后、任何 reader 或 Gate 调用之前立即比较精确的路径集合和 diff digest。补丁验证会在 Apply 之前拒绝符号链接、gitlinks、二进制补丁、重命名、复制和文件类型转换。Gate 只允许在 macOS `sandbox-exec` 下运行列入允许列表的本地验证命令，不允许网络访问；主机读取范围仅限于 runtime/system roots、工作树、在精确的 Gate clamp 内再次推导出的 `.git` common directory，以及本次运行的私有临时根目录。模型报告的 common directory 绝不会被插入 sandbox 权限配置中。写入范围仅限于已知的生成产物和该私有临时根目录。允许列表包括针对 Node、Python、Go、Rust、Make、Swift Package Manager 的有界项目本地检查，derived data 位于私有临时根目录下的 Xcode simulator 构建，以及离线 Gradle 验证。嵌套模块的 `build` 根目录只能根据该模块 `src` 树下的选定文件推导；如果符号链接或 realpath 可能逃逸出工作树，则会被拒绝。Gate 之后还会运行第二次 diff attestation，并对二进制 Git diff 以及每个报告文件的 mode、size 和 bytes 进行哈希处理，其中包括未跟踪的新增文件。

Gate 会移除类似凭据和解释器注入的环境变量，然后在验收命令启动前重定向主目录、临时目录和缓存路径。如果某项检查依赖于被移除的凭据，请将其报告为未经验证；绝不要仅为了获得通过结果而在沙箱外重新运行该检查。

成功应用的阻塞项补丁不会被视为已完成语义清除。原始阻塞项仍保留在 `fixedBlockersPendingVerification` 中。Gate 尝试会记录其精确的命令集和报告的输出，但无法证明这些命令确实运行过，因为 Workflow API 不会公开受信任的必需工具执行回执。因此，工作流会根据代理报告设置 `claimedPassed`，强制设置 `passed:false`，设置 `gateVerified:false`，并将 verdict 和交接状态保持为 `hold`。只有具备不可变执行回执的受信任外部运行器，才能提升该证据的可信级别。

这些控制措施具有明确的信任边界。代理调用 Bash 时，`bashCommandClamp` 会约束 Bash 命令；Claude Workflow 不提供必需工具调用回执，因此结构化验证器响应仍然只是模型证明，而不是 Bash 已运行的加密证明。同样，`authority`、`allowedRepo`、`allowedFiles` 和 `allowedCommands` 是审计元数据，而不是文件系统权限。本地读取工具与 Web 工具彼此分离，但 Workflow API 不会对其实施路径沙箱。在任何涉及安全的交接中都要报告这些事实，不要将结果描述为已由主机认证。

生产环境检查为只读。此 skill 从不部署、发布、生成发行版、推送、合并、更改凭据、删除或还原受保护的工作，也不声称已完成实时验证。它的 ship verdict 是提供给用户的证据，而不是执行外部操作的授权。

## 交接与完成

读取工作流返回的 `runKey`，以及从其隔离工作树中验证过的唯一 `ship-<UUID>` 叶节点。在运行完成时，使用返回的交接 Markdown。在 Scout 停止后暂停时，根据结构化结果和图追踪信息编写事实性的暂停交接，不要再消耗另一次代理调用；包括在暂停前已完成的任何 Build 或 Fix lane。如果 Scout 在 `runKey` 验证前返回无效路径，则报告暂停情况，但不要编写与运行键关联的交接。否则，将其保存到目标仓库根目录下的
`.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证其存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、（如有）选定的计划、Gate 结果、已更改的文件、已运行的命令以及明确的注意事项。已完成的本地图并不能证明已完成部署。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自苏黎世联邦理工学院（ETH Zurich）的 Graph of Thoughts。完整的上游 BSD 许可证声明、条件、免责声明和要求的引用，随本 skill 一同置于
`LICENSE.graph-of-thoughts-BSD.txt` 中。每次重新分发该工作流的源代码或二进制文件时，都必须保留该文件。

## 路由

- 高容量、定义明确、相互独立的工作任务 → 单独的私有
  worker-fleet 流程。
- 仅审查现有 diff 的发现 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅复制内容搜索和发布准备 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将多文件实现计划搜索与一个
  选定的可变更赢家一并路由回 `suede-graph-flo-xr`。