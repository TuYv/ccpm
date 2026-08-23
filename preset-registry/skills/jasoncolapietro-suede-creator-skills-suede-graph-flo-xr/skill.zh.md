---
name: suede-graph-flo-xr
description: "Suede Labs Graph-of-Thoughts shipping search for a multi-file repo change. Use when competing implementation plans need one evidence-gated selection before any build. Halts on hazards, collisions, budget exhaustion, or no safe winner. Reads production; never deploys. NOT FOR: bulk independent work (use a separate private worker-fleet pass); findings-only diff review (use suede-code-review); CI or branch-protection wiring (use suede-ci-gate); copy-only shipping (use suede-ship-copy)."
---
# Suede Graph Flo XR

使用内置的 `workflows/suede-graph-flo-xr.js` 工作流，为一个涉及多文件的仓库变更搜索相互竞争的方案。它会在任何实现通道修改工作树之前，基于证据完成选择。

## 输入与预算门控

启动前，要求提供以下三项输入：

- **仓库** — 仓库的绝对路径。相对路径和 `~` 均会触发失败关闭。
- **范围** — 请求的多文件变更，包括任何受保护的路径或约束。
- **预算** — `light`、`standard` 或 `deep`。

如果以下可选上下文可用，也应检测并传入：`deploys`（仓库是否具有部署面）、`liveUrl`（只读的生产环境界面）和 `vault`（外部决策/交接上下文路径）。对于不进行部署的仓库，缺少这些上下文不会造成阻塞，但不要悄然丢弃已知值。

当用户为工作进程指定模型（`workerModel`：`sonnet`、`opus`、`haiku` 或 `fable`）时，传入该模型——之后每次工作进程调用都会在该模型上运行，而编排仍使用会话模型。如果省略，工作进程会静默继承会话模型；如果会话使用的是昂贵模型，而用户并未选择将其用于工作进程，则应在启动前说明，而不是让默认行为替用户做决定。一次运行最多可消耗 200 次工作进程调用，因此，继承未经选择的模型是一项无人做出的成本决策。

如果缺少仓库或范围，则停止。用一行报告缺少的输入，提出可提供仓库路径、描述所需变更，或将单文件编辑转交直接实现，然后等待用户选择。

启动前，说明所选档位和预计最坏情况下的调用次数：`light` 预计并允许总计 **55** 次代理调用，`standard` 预计并允许总计 **110** 次代理调用，`deep` 预计并允许总计 **200** 次代理调用。不要根据范围推断预算，也不要静默提高上限。如果用户尚未选择预算，请询问并等待。

## 运行时前置条件

内置的 JavaScript 工作流是用于 macOS 的 Claude Code 工作流。它需要 `sandbox-exec` 和六个已注册的 `suede-graph-flo-xr-*` 代理配置。请安装完整的 `suede-skills` 插件、`suede-agent-workflows` 插件，或使用此仓库的 `install.sh`，后者会将这些配置复制到 `~/.claude/agents`。

Claude Workflow 不提供 Node `process` 全局对象，因此该工作流无法推断其包命名空间。调用方技能必须根据此技能的调用方式推导该命名空间，并在每次启动时传入。当被调用的名称带有插件前缀时，`agentNamespace` 就是该前缀的原始值——完整插件对应 `suede-skills`，专用编排插件对应 `suede-agent-workflows`。由 `install.sh` 安装或手动复制、且不带前缀的裸调用名称使用空字符串。这是运行时上下文，而不是用户选项。缺少该值或值未知会导致在首次代理调用前失败。

该工作流也无法定位其自身内置的辅助脚本。请传入 `helperDir`：被调用技能的 `workflows/helpers` 目录的绝对路径（对于此安装，即 `<skill base directory>/workflows/helpers`）。受约束的 Bash 命令会运行这些 `.cjs` 辅助程序——每次生成进程时的约束无法验证多行或长度超过约 400 个字符的规则，因此不能使用内联 `node -e` 载荷。路径缺失或包含空白字符会导致在首次代理调用前失败；缺少辅助文件会表现为 Scout 设置失败。携带载荷的辅助程序调用通过固定前缀（辅助程序路径加工作树、临时根目录或基础 SHA）而非精确字符串获得准入；每个辅助程序都会验证其余的 argv，而差异证明——并非约束机制——仍然负责检查所应用的内容是否与选定的捆绑包相匹配。

选定的补丁会以有界的 base64 分块形式暂存到本次运行的私有临时根目录中，再传递给应用器，因为钳制验证器无法解析携带数 KB 内联有效负载的命令。每次追加都会携带其偏移量和 FNV-1a 校验和，而 `--apply` 会在解码前验证总长度和有效负载校验和，因此，输入错误的分块会快速失败并给出重试指令，而不会生成损坏的补丁。

仅安装技能文件夹、使用通用 skills CLI 安装或安装 Codex 插件，本身都不会注册或执行 Claude Workflow 智能体配置文件。在这些环境中，应将此文件视为编排契约，并将变更交由直接实现；不要声称捆绑的工作流已经运行。通过手动复制单个技能在 Claude Code 中启用后，还需将此仓库的 `agents/suede-graph-flo-xr-*.md` 文件复制到 `~/.claude/agents`，然后重启 Claude Code。

请求的 Scout 设置命令会将探测 `/usr/bin/sandbox-exec` 作为其第一个子进程，先于获取操作或工作树创建执行。如果调用了该命令但探测失败，Scout 会在执行设置变更前报告失败。返回的 Scout 证据仍然是模型证明，而不是主机执行回执。任何后续报告的沙箱拒绝也会使 Gate 保持阻断状态。切勿在沙箱外重试验收命令，以将该阻断状态变为通过。

## 运行图搜索

调用：

```js
Workflow({
  scriptPath: "skills/suede-graph-flo-xr/workflows/suede-graph-flo-xr.js",
  args: { repo, scope, agentBudget, agentNamespace, helperDir, workerModel, deploys, liveUrl, vault }
})
```

工作流按照依赖顺序执行以下操作：

1. **Generate** 根据 Scout 和研究证据生成相互独立的实施计划。
2. **Score** 从覆盖范围、证据、可行性、安全性和效率方面为每个计划评分。
3. **KeepBestN** 以确定性方式裁剪已评分的候选束。
4. **Refute** 使用有证据支持的反对意见攻击保留下来的计划。
5. **Improve** 修复那些反驳并非致命的计划。
6. **Aggregate** 合并相互兼容的存活路径，但不合并存在冲突的文件所有权。
7. **Select** 以确定性方式选出唯一的胜者。

只有由 **Select** 选中的计划才可以修改文件。被拒绝、被裁剪和未被选中的思路只能作为证据；切勿以推测方式实施它们。

## 边界

当预算耗尽时，工作流会在下一次智能体调用或整个变更批次开始前停止；它不会撤销先前已经完成的变更。除非独立的只读验证器确认存在一个干净、已注册且基于 origin/main 的工作树，该工作树是一个直接的 `${REPO}.worktrees/ship-*` 子目录，具有相同的 Git 公共目录，并且候选文件不是符号链接、其实际路径仍位于该工作树内部，否则工作流会在任何变更发生前停止。在图搜索开始前，如发现路径别名在忽略大小写或 Unicode 规范化后发生重合，则采用失败即关闭策略。遇到以下情况时，工作流也会停止：已跟踪的机密信息、实时目标工作树、受保护的 WIP 冲突、重复的文件所有者、超出容量的安全清单，或不存在可选择的计划。Scout 会解析以 NUL 分隔的 Git porcelain 输出，从而确保重命名前后的路径均受到保护；会使用路径组件边界解析 `lsof -Fn` 的 CWD 字段；并且绝不会仅仅因为已通过 cherry-land 合入提交历史，就丢弃新出现的脏状态或实时占用声明。如果选定的 Build 或 Fix 结果被阻断、缺少上下文、报告了疑虑、执行失败或未报告任何已变更路径，也会在进入下一个验证阶段前停止。停止时，用一行说明阻断因素，并提供 2–4 个适用的解决方案（例如：缩小范围、豁免受保护的 WIP、解决冲突、选择更高的预算或提供缺失的上下文），然后等待。处于停止状态时，不要重新启动或执行变更。

### 解读搜索中止

过去，空搜索无论因何结束，都会报告 `no safe graph winner`，因此基础设施偶发故障与真正的证据冲突会输出相同的信息。现在，中止信息会指明具体发生了哪种情况，而 `haltDetail` 则包含其背后的计数：

| 原因 | 含义 |
|---|---|
| `every candidate lost its score to an agent failure` | 本次运行中没有任何思路获得过评分。问题出在基础设施，而非证据——请重新运行。 |
| `no candidate reached Select` | 搜索因其他原因在上游变空；请查看 `graph.dropped`。 |
| `every finalist lost its score before Select` | 存在最终候选项，但它们因未评分而被剪枝。 |
| `every finalist was pruned before Select` | 最终候选项因与评分无关的原因被剪枝。 |
| `every finalist carries a degraded or missing score` | 最终候选项到达 Select 时没有有效评分。 |
| `every finalist failed deterministic plan eligibility` | 确实被拒绝。`haltDetail.eligibilityRejections` 会列出所有原因。 |
| `no safe graph winner` | 以上情况均不符合——请查看图。 |

`haltDetail.infrastructureDegraded` 与中止原因相互独立：两者可以同时为真。通过原因了解是什么阻止了 Select，并通过该标志了解为其提供候选池的过程中发生了什么降级。

评分调用是只读且幂等的，因此传输层故障会触发重试：每次调用最多重试两次，整个运行范围内的重试次数上限为智能体调用上限的 5%；一旦剩余预算降至预留底线（调用上限的 20%），则完全拒绝重试。格式错误的评分绝不会重试——工具层会强制执行模式，因此无效评分是需要保留的判断结果，而不是需要重新建立的连接。每次尝试和每次被拒绝的重试都会记录在 `graph.scoreRetries` 中，而每次运行的结果中都会包含 `scoreReliability`，无论运行是否中止：即使一次偶发故障只导致两个最终候选项丢失，并且运行随后仍成功交付，该运行也依然会被标记为降级。

Claude 注册的智能体配置文件会强制实施工具隔离：本地读取器没有 shell、写入或 Web 工具；公共 Web 读取器没有本地文件或 shell 工具；补丁作者没有修改工具；应用器和验证器则只有 Bash 与结构化输出。补丁作者返回统一差异，由一个受约束的应用器加以应用；在每次 Build 或 Fix Apply 后、任何读取器或 Gate 调用之前，一个单独预留了预算且受约束的验证器会立即比较确切的路径集合与差异摘要。补丁验证会在 Apply 前拒绝符号链接、gitlink、二进制补丁、重命名、复制以及文件类型转换。Gate 仅允许在 macOS `sandbox-exec` 下运行白名单内的本地验证命令，禁止网络访问；主机读取范围仅限于运行时/系统根目录、工作树、在确切的 Gate 约束环境中重新推导出的工作树 `.git` 公共目录，以及本次运行的私有临时根目录。模型报告的公共目录绝不会被插入沙箱权限中。写入范围仅限于已知的生成产物和该私有临时根目录。白名单包含针对 Node、Python、Go、Rust、Make、Swift Package Manager 的有界项目本地检查、将派生数据置于私有临时根目录下的 Xcode 模拟器构建，以及离线 Gradle 验证。嵌套模块的 `build` 根目录只能根据该模块 `src` 树下已选定的文件推导；如果符号链接或真实路径可能逃逸到工作树之外，则会被拒绝。Gate 后还会执行第二次差异认证，对二进制 Git 差异以及每个已报告文件的模式、大小和字节内容进行哈希，其中包括未跟踪的新增文件。

成功应用阻断项补丁，并不意味着该阻断项在语义上已被清除。
原始阻断项仍保留在 `fixedBlockersPendingVerification` 中。Gate
尝试会记录其确切的命令集和报告的输出，但无法证明
这些命令确实运行过，因为 Workflow API 不会公开可信的必需工具
执行回执。因此，工作流会根据代理报告设置 `claimedPassed`，
强制设置 `passed:false`，设置 `gateVerified:false`，并将裁定
和交接状态保持为 `hold`。只有拥有不可变
执行回执的可信外部运行器才能提升该证据的可信等级。

这些控制措施具有明确的信任边界。`bashCommandClamp` 会在
代理调用 Bash 命令时对其施加约束；Claude Workflow 不提供
必需工具调用回执，因此结构化的验证器响应仍然只是模型
证明，而不是 Bash 确实运行过的加密学证据。同样，
`authority`、`allowedRepo`、`allowedFiles` 和 `allowedCommands` 是审计
元数据，而不是文件系统权限。本地读取工具与 Web
工具相互分离，但并未被 Workflow API 置于路径沙箱中。在任何
安全敏感的交接中都应报告这些事实，并且不要将结果描述为由主机认证。

生产环境检查是只读的。此 Skill 绝不会部署、发布、
发行、推送、合并、更改凭据、删除或还原受保护的
工作，也不会声称已完成线上验证。它不会替用户选择预算，也不会
断定缺失的范围可以跳过。它给出的发布裁定是供用户参考的证据，
而不是执行外部操作的授权。

## 交接与完成

读取工作流返回的 `runKey`，即其隔离工作树中经过验证且唯一的 `ship-<UUID>` 叶节点。
对于已完成的运行，使用返回的交接
Markdown。对于 Scout 之后的中止，无需再消耗一次代理调用，而应根据结构化
结果和图追踪记录编写如实的中止交接；包括中止前已完成的所有 Build
或 Fix 通道。如果 Scout 在 `runKey` 验证前返回无效路径，
则报告中止，但不要编写以运行键命名的
交接文件。否则，将其保存到目标仓库根目录下的
`.suede-graph-flo-xr/${runKey}/handoff.md`，然后验证该文件是否存在：

```bash
test -f ".suede-graph-flo-xr/${runKey}/handoff.md"
```

报告该路径、所选计划（如有）、Gate 结果、已更改文件、运行的命令
以及明确的注意事项。本地图执行完成并不能证明部署已经完成。

## 第三方许可证

`workflows/suede-graph-flo-xr.js` 中的操作图和思维状态模型改编自
苏黎世联邦理工学院的 Graph of Thoughts。完整的上游 BSD 声明、条件、
免责声明和要求的引用随此 Skill 一并提供，位于
`LICENSE.graph-of-thoughts-BSD.txt`。每次以源代码或二进制形式
重新分发该工作流时，都必须附带该文件。

## 路由

- 高容量、规范明确且相互独立的工作任务 → 单独的私有
  工作器集群执行轮次。
- 仅审查现有差异中的发现项 → `suede-code-review`。
- CI、必需检查或分支保护配置 → `suede-ci-gate`。
- 仅文案搜索和发布就绪性检查 → `suede-ship-copy`。
- 从 `suede-code-review`、`suede-ci-gate` 或 `suede-ship-copy`：将具有一个
  已选定变更执行胜出方案的多文件实施计划搜索路由回
  `suede-graph-flo-xr`。